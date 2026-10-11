// The Settl dashboard. One page: describe a deal in the bar, see it in the
// workspace, and act on it as yourself.
//
// The page decides nothing. It shows what the server reports and offers the
// steps the signed-in person could take; the server and the contract decide
// whether a step is allowed. A person who signs in with a wallet signs and
// sends every transaction themselves. This page never sees a key.

(() => {
  "use strict";

  const EXAMPLES = {
    Flatmates:
      "Asha, Bilal and Chitra each pay ₹4,800 for a year of wifi in Flat 12. QuickNet Broadband is paid ₹7,200 when the wifi is installed. QuickNet Broadband is paid ₹7,200 after six months of working wifi. Mrs. Kulkarni settles any dispute.",
    Freelance:
      "Riya pays ₹30,000 for a new website for her shop. Aman is paid ₹10,000 when the design files for five pages are delivered. Aman is paid ₹15,000 when all five pages work on a phone and a laptop. Aman is paid ₹5,000 when the site is live on the shop's own domain. Meera settles any dispute.",
    Renovation:
      "Sunita pays ₹50,000 to have her kitchen retiled. Gopal puts down a stake of ₹5,000, which he loses if he walks away. Gopal is paid ₹20,000 when the old tiles are removed. Gopal is paid ₹30,000 when the new tiles are laid and grouted. Hema settles any dispute.",
    Bonus:
      "Brightline Apps pays ₹2,00,000 as a project bonus for its app team. Each of Dev, Kavya, Omar and Tara is paid ₹25,000 when the test lead signs the test report. Each of Dev, Kavya, Omar and Tara is paid ₹25,000 on 15 March 2027, the launch date. Lata Rao settles any dispute.",
  };

  const STEPS = ["Check", "Sign", "Fund", "Pay"];
  const STAGE_WORDS = { Pending: "Open", Completed: "In review", Disputed: "Disputed", Released: "Paid", Refunded: "Refunded" };
  const STAGE_TONES = { Completed: "wait", Disputed: "bad", Released: "good", Refunded: "" };
  const HISTORY_SHOWN = 6;

  const state = {
    chain: null, // what GET /contract says about the network
    demo: false, // true when the server offers demo people (local chain only)
    me: null, // the person acting
    wallet: false, // true when `me` signed in with a wallet
    token: null,
    balance: null,
    people: [],
    deals: [],
    openId: null,
    deal: null,
    history: [],
    summary: null,
    lab: null, // the attack lab, or null when it is closed
    offline: false, // read deals with the offline reader
    editing: null, // the deal text while it is being rewritten
    allHistory: false,
    file: null, // a document attached to the next deal: { name, text } or { name, type, data }
    tab: null, // the part of the workspace on show; null picks the one that fits the deal's status
    menu: false,
    busy: false,
    drawn: "",
  };

  // ---- small helpers -------------------------------------------------------

  const $ = (id) => document.getElementById(id);
  const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  const rupees = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  const short = (address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

  /** A rupee amount in the chain's own test coin, as a wallet will show it. */
  function coin(amount) {
    const wei = (BigInt(Math.round(Number(amount) * 1000)) * BigInt(state.chain.rupeeWei)) / 1000n;
    return `${ethers.formatEther(wei).replace(/\.0$/, "")} ${state.chain.coin}`;
  }

  /** Builds an element. Text is always added as text, never as markup. */
  function h(tag, attributes, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes || {})) {
      if (value === false || value === null || value === undefined || value === "") continue;
      if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat()) {
      if (child !== null && child !== undefined && child !== false) node.append(child);
    }
    return node;
  }

  const tag = (text, tone) => h("span", { class: `tag ${tone || ""}` }, text);
  const label = (text, ...extra) => h("h2", { class: "label" }, text, ...extra);

  const memory = {
    read() {
      try {
        return JSON.parse(localStorage.getItem("settl") || "{}");
      } catch (error) {
        return {};
      }
    },
    write(change) {
      try {
        localStorage.setItem("settl", JSON.stringify({ ...memory.read(), ...change }));
      } catch (error) {
        // Storage can be unavailable; the page works without it.
      }
    },
  };

  function say(text, tone) {
    $("note").textContent = text || "";
    $("note").className = `note ${tone || ""}`;
  }

  // ---- talking to the server ----------------------------------------------

  async function api(method, route, body) {
    const headers = { "content-type": "application/json" };
    if (state.token) headers.authorization = `Bearer ${state.token}`;
    let payload;
    if (method !== "GET") {
      payload = { ...(body || {}) };
      // A demo person is named in the request. A wallet person is known by their session.
      if (state.me && !state.wallet) payload.person = state.me.name;
    }
    const response = await fetch(route, { method, headers, body: payload && JSON.stringify(payload) });
    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = { error: "The server sent an unreadable reply." };
    }
    if (response.status === 401 && state.token) {
      signedOut();
      data = { error: "Session ended. Connect again." };
    }
    return { status: response.status, body: data };
  }

  /** The reply's body, or an error carrying the server's own reason. */
  function must(reply) {
    if (reply.status >= 400) throw new Error(reply.body.reason || reply.body.error || "That did not work.");
    return reply.body;
  }

  /** Runs one piece of work for a click: one at a time, errors shown in plain words, the screen refreshed after. */
  async function run(work) {
    if (state.busy) return;
    state.busy = true;
    document.body.classList.add("busy");
    say("");
    try {
      await work();
    } catch (error) {
      const cancelled = error && (error.code === 4001 || error.code === "ACTION_REJECTED");
      say(cancelled ? "Cancelled in the wallet." : (error && (error.shortMessage || error.message)) || String(error), "bad");
    } finally {
      state.busy = false;
      document.body.classList.remove("busy");
      await refresh(true).catch(() => {});
    }
  }

  // ---- who is acting -------------------------------------------------------

  function become(person, token) {
    state.me = person;
    state.token = token || null;
    state.wallet = Boolean(token);
    state.balance = null;
    if (token) memory.write({ sessions: { ...(memory.read().sessions || {}), [person.address]: token }, demo: null });
    else memory.write({ demo: person.name });
  }

  /** Stops acting as anyone, and forgets the saved way back in. */
  function signedOut() {
    const saved = memory.read();
    if (state.wallet && state.me && saved.sessions) delete saved.sessions[state.me.address];
    memory.write({ sessions: saved.sessions || {}, demo: null });
    state.me = null;
    state.token = null;
    state.wallet = false;
    state.balance = null;
  }

  /** Asks for a name in a small prompt. Resolves to null if it is dismissed. */
  function askName() {
    return new Promise((resolve) => {
      const sheet = $("sheet");
      const input = $("sheet-name");
      const finish = (value) => {
        sheet.hidden = true;
        $("sheet-form").onsubmit = null;
        sheet.onclick = null;
        document.removeEventListener("keydown", onKey);
        resolve(value);
      };
      const onKey = (event) => {
        if (event.key === "Escape") finish(null);
      };
      input.value = "";
      sheet.hidden = false;
      input.focus();
      $("sheet-form").onsubmit = (event) => {
        event.preventDefault();
        if (input.value.trim()) finish(input.value.trim());
      };
      sheet.onclick = (event) => {
        if (event.target === sheet) finish(null);
      };
      document.addEventListener("keydown", onKey);
    });
  }

  // ---- wallet --------------------------------------------------------------

  const walletProvider = () => new ethers.BrowserProvider(window.ethereum, undefined, { pollingInterval: 1000 });

  /** Puts the wallet on the network the server uses, adding it to the wallet if it is not there. */
  async function useChain() {
    const chainId = `0x${state.chain.chainId.toString(16)}`;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
    } catch (error) {
      if (error && error.code === 4001) throw error;
      const rpc = state.chain.local ? location.origin + state.chain.rpcPath : state.chain.publicRpc;
      if (!rpc) throw error;
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId,
            chainName: state.chain.local ? "Settl Local" : state.chain.network,
            nativeCurrency: { name: `Test ${state.chain.coin}`, symbol: state.chain.coin, decimals: 18 },
            rpcUrls: [rpc],
            ...(state.chain.explorer ? { blockExplorerUrls: [state.chain.explorer] } : {}),
          },
        ],
      });
    }
  }

  async function connect() {
    if (!window.ethereum) throw new Error("No wallet found. Install MetaMask, then reload.");
    const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
    await useChain();
    await signInWith(address);
  }

  /** Signs in as a wallet address: with its saved session if that still works, otherwise by signature. */
  async function signInWith(rawAddress, { quietly = false } = {}) {
    const address = ethers.getAddress(rawAddress);
    state.me = null;
    state.token = null;
    state.wallet = false;

    const sessions = memory.read().sessions || {};
    if (sessions[address]) {
      const reply = await fetch("/auth/me", { headers: { authorization: `Bearer ${sessions[address]}` } });
      if (reply.status === 200) {
        const { person } = await reply.json();
        if (same(person.address, address)) return become(person, sessions[address]);
      }
      delete sessions[address];
      memory.write({ sessions });
    }
    if (quietly) return;

    // A new address needs a name; asking first means the wallet is opened only once.
    const { people } = must(await api("GET", "/people"));
    let name;
    if (!people.some((person) => same(person.address, address))) {
      name = await askName();
      if (!name) return;
    }
    const { message } = must(await api("GET", `/auth/message?address=${address}`));
    say("Check your wallet…");
    const signature = await (await walletProvider().getSigner(address)).signMessage(message);
    const signedIn = must(await api("POST", "/auth/sign-in", { address, signature, name }));
    say("");
    become(signedIn.person, signedIn.token);
  }

  async function signOut() {
    if (state.token) await api("POST", "/auth/sign-out");
    signedOut();
  }

  /** Sends a transaction the server prepared, from the signed-in person's own wallet. Returns its hash. */
  async function sendFromWallet(transaction) {
    await useChain();
    const signer = await walletProvider().getSigner(state.me.address);
    const request = { to: transaction.to, data: transaction.data, value: transaction.value };
    if (!state.chain.local) {
      // A wallet's default tip is far more than a quiet test network needs, and creating a
      // vault takes a lot of gas there. A small tip keeps the scarce test coin for the deal itself.
      const tip = ethers.parseUnits("0.1", "gwei");
      const block = await signer.provider.getBlock("latest");
      request.maxPriorityFeePerGas = tip;
      request.maxFeePerGas = ((block && block.baseFeePerGas) || 0n) * 2n + tip;
    }
    const sent = await signer.sendTransaction(request);
    say("Waiting for the chain…");
    await sent.wait();
    return sent.hash;
  }

  // ---- demo people (local chain only) --------------------------------------

  async function actAsDemo(name) {
    const { people } = must(await api("GET", "/people"));
    let person = people.find((candidate) => same(candidate.name, name));
    if (person && person.kind !== "demo") throw new Error(`${person.name} signs in with their own wallet.`);
    if (!person) [person] = must(await api("POST", "/people", { name })).added;
    if (state.token) await api("POST", "/auth/sign-out");
    become(person, null);
  }

  /** Makes sure someone is acting, asking the visitor to connect or pick a name if nobody is. */
  async function identify() {
    if (state.me) return;
    if (window.ethereum) return connect();
    if (!state.demo) throw new Error("No wallet found. Install MetaMask, then reload.");
    const name = await askName();
    if (name) await actAsDemo(name);
  }

  // ---- actions on a deal ---------------------------------------------------

  /** Asks the server for a step. If it hands back a transaction, the wallet sends it and the hash is reported. */
  async function act(path, body) {
    const id = state.openId;
    const asked = must(await api("POST", `/deals/${id}${path}`, body));
    if (!asked.needsWallet) return asked;
    say("Check your wallet…");
    const hash = await sendFromWallet(asked.transaction);
    say("Recording…");
    const done = must(await api("POST", `/deals/${id}/transactions`, { hash }));
    say("");
    return done;
  }

  async function createDeal() {
    const input = $("ask-text");
    const text = input.value.trim();
    if (!text && !state.file) return;
    await identify();
    if (!state.me) return;
    say("Reading…");
    const { deal } = must(await api("POST", "/deals/draft", { text, document: state.file || undefined, offline: state.offline || undefined }));
    state.file = null;
    input.value = "";
    grow();
    drawExamples();
    state.openId = deal.id;
    state.lab = null;
    state.editing = null;
    state.tab = null;
    history.replaceState(null, "", `#${deal.id}`);
    say(!state.offline && deal.readBy !== "model" && deal.fallbackReason ? "AI unavailable. Read offline." : "");
  }

  async function sign() {
    const body = {};
    if (state.wallet) {
      say("Check your wallet…");
      body.signature = await (await walletProvider().getSigner(state.me.address)).signMessage(state.deal.agreementMessage);
    }
    must(await api("POST", `/deals/${state.openId}/agree`, body));
    say("");
  }

  async function addPerson(name, address) {
    if (address) return must(await api("POST", "/people", { name, address }));
    if (!state.demo) throw new Error("Paste their wallet address.");
    return must(await api("POST", "/people", { name }));
  }

  async function settleUnclear(index) {
    const checklist = { ...state.deal.checklist, unclear: state.deal.checklist.unclear.filter((item, at) => at !== index) };
    must(await api("PUT", `/deals/${state.openId}/checklist`, { checklist }));
  }

  async function rewrite() {
    const text = (state.editing || "").trim();
    if (!text) return;
    say("Reading…");
    must(await api("PUT", `/deals/${state.openId}/text`, { text, offline: state.offline || undefined }));
    state.editing = null;
    say("");
  }

  async function discard() {
    must(await api("DELETE", `/deals/${state.openId}`));
    state.openId = null;
    state.deal = null;
  }

  // ---- reading the server's state ------------------------------------------

  const isMine = (deal) => !state.me || same(deal.organiser, state.me.name) || deal.members.some((name) => same(name, state.me.name));

  async function refresh(force) {
    const [people, deals] = await Promise.all([api("GET", "/people"), api("GET", "/deals")]);
    state.people = people.body.people || [];
    state.deals = deals.body.deals || [];
    state.demo = state.people.some((person) => person.kind === "demo");
    // The server forgets everyone when it restarts.
    if (state.me && !state.people.some((person) => same(person.name, state.me.name))) signedOut();

    const mine = state.deals.filter(isMine);
    if (!mine.some((deal) => deal.id === state.openId)) state.openId = mine.length ? mine[mine.length - 1].id : null;

    if (state.openId) {
      const [deal, history] = await Promise.all([api("GET", `/deals/${state.openId}`), api("GET", `/deals/${state.openId}/history`)]);
      state.deal = deal.body.deal || null;
      state.history = history.body.history || [];
      const finished = state.deal && (state.deal.phase === "Closed" || state.deal.phase === "Cancelled");
      const key = `${state.openId}:${state.history.length}`;
      if (!finished) state.summary = null;
      else if (!state.summary || state.summary.key !== key) {
        const summary = await api("GET", `/deals/${state.openId}/summary`);
        state.summary = summary.status === 200 ? { key, ...summary.body.summary } : null;
      }
    } else {
      state.deal = null;
      state.history = [];
      state.summary = null;
    }

    if (state.wallet && window.ethereum) {
      try {
        state.balance = ethers.formatEther(await walletProvider().getBalance(state.me.address));
      } catch (error) {
        state.balance = null;
      }
    }
    draw(force);
  }

  // ---- drawing -------------------------------------------------------------

  function statusOf(deal) {
    if (deal.status === "draft") return { word: "Draft", tone: "", step: 0 };
    if (deal.status === "confirmed") return { word: "Signing", tone: "wait", step: 1 };
    if (deal.status === "agreed") return { word: "Signed", tone: "wait", step: 2 };
    if (deal.phase === "Funding") return { word: "Funding", tone: "wait", step: 2 };
    if (deal.phase === "Active") return { word: "Active", tone: "good", step: 3 };
    if (deal.phase === "Cancelled") return { word: "Cancelled", tone: "bad", step: -1 };
    return { word: "Settled", tone: "done", step: 4 };
  }

  function draw(force) {
    const typing = document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.closest("#deal, #who");
    const picture = JSON.stringify([state.me, state.balance, state.people, state.deals, state.deal, state.history, state.summary, state.lab, state.editing !== null, state.allHistory, state.menu, state.offline, state.tab]);
    if (!force && (typing || picture === state.drawn)) return;
    state.drawn = picture;
    drawTop();
    drawDeals();
    $("deal").replaceChildren(...(state.lab ? labView() : state.deal ? dealView(state.deal) : []));
  }

  function drawTop() {
    $("net").textContent = state.chain.network;
    $("net").title = `Test money only. ₹1,000 = ${coin(1000)}`;
    $("ask-ai").textContent = state.offline ? "AI off" : "AI";
    $("ask-ai").className = `quiet toggle ${state.offline ? "off" : ""}`;
    $("ask-ai").title = state.offline ? "Deals are read by the offline reader" : "Deals are read by the AI model";
    $("foot").replaceChildren(
      h("span", {}, `Test money only · ₹1,000 = ${coin(1000)}`),
      h("span", { class: "space" }),
      h("a", { href: "/old" }, "Old dashboard")
    );

    const items = [];
    if (state.wallet) items.push(h("div", { class: "line mono muted" }, short(state.me.address)));
    if (state.demo) {
      for (const person of state.people.filter((candidate) => candidate.kind === "demo")) {
        const on = state.me && !state.wallet && same(person.name, state.me.name);
        const pick = () => {
          state.menu = false;
          run(() => actAsDemo(person.name));
        };
        items.push(h("button", { type: "button", class: on ? "on" : "", onclick: pick }, person.name));
      }
    }
    if (window.ethereum && !state.wallet) items.push(h("button", { type: "button", onclick: () => run(connect) }, "Connect wallet"));
    if (state.wallet) items.push(h("button", { type: "button", onclick: () => run(signOut) }, "Sign out"));
    if (state.demo) {
      const input = h("input", { placeholder: "New demo person", maxlength: "40", "aria-label": "New demo person" });
      const join = (event) => {
        event.preventDefault();
        if (input.value.trim()) run(() => actAsDemo(input.value.trim()));
      };
      items.push(h("form", { onsubmit: join }, input, h("button", { type: "submit" }, "Add")));
    }

    const open = () => {
      // With nothing to choose from, the button connects straight away.
      if (!state.me && !state.demo) return run(connect);
      state.menu = !state.menu;
      draw(true);
    };
    const balance = state.wallet && state.balance !== null ? `${Number(state.balance).toLocaleString("en-IN", { maximumFractionDigits: 4 })} ${state.chain.coin}` : "";
    const button = h(
      "button",
      { type: "button", class: state.me ? "who-name" : "primary", onclick: open, "aria-expanded": String(state.menu) },
      state.me ? state.me.name : "Connect",
      balance && h("span", { class: "muted mono" }, balance)
    );
    $("who").replaceChildren(...(state.menu ? [button, h("div", { class: "menu" }, items)] : [button]));
  }

  /** Keeps a chosen file ready to go with the next deal. Text is read here; a PDF or a picture is read by the server's model. */
  async function attach(file) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) throw new Error("The document is larger than 4 MB.");
    if (file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name)) {
      state.file = { name: file.name, text: await file.text() };
    } else {
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("The file could not be opened."));
        reader.readAsDataURL(file);
      });
      state.file = { name: file.name, type: file.type, data: String(url).slice(String(url).indexOf(",") + 1) };
    }
    drawExamples();
    $("ask-text").focus();
  }

  function drawExamples() {
    if (state.file) {
      const remove = () => {
        state.file = null;
        drawExamples();
      };
      $("examples").replaceChildren(h("span", { class: "tag" }, state.file.name), h("button", { type: "button", class: "quiet", onclick: remove }, "Remove"));
      return;
    }
    const empty = $("ask-text").value.trim() === "";
    $("examples").replaceChildren(
      ...(empty
        ? Object.keys(EXAMPLES).map((name) =>
            h("button", { type: "button", class: "quiet", onclick: () => useExample(name) }, name)
          )
        : [])
    );
  }

  function useExample(name) {
    $("ask-text").value = EXAMPLES[name];
    grow();
    drawExamples();
    $("ask-text").focus();
  }

  function grow() {
    const input = $("ask-text");
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }

  function drawDeals() {
    const mine = state.deals.filter(isMine).reverse();
    const rows = mine.map((deal) => {
      const status = statusOf(deal);
      const open = () => {
        state.openId = deal.id;
        state.lab = null;
        state.editing = null;
        state.allHistory = false;
        state.tab = null;
        history.replaceState(null, "", `#${deal.id}`);
        refresh(true);
      };
      return h(
        "button",
        { type: "button", class: `row ${!state.lab && deal.id === state.openId ? "on" : ""}`, onclick: open },
        h("span", { class: `dot ${status.tone}` }),
        h("span", { class: "name" }, deal.title || "Untitled deal"),
        h("span", {}, rupees(deal.total)),
        h("span", { class: "sub" }, status.word, deal.status === "locked" ? ` · ${deal.stagesSettled}/${deal.stageCount}` : "")
      );
    });
    $("deals").replaceChildren(label("Workspaces"), ...(rows.length ? rows : [h("p", { class: "empty" }, "None yet")]));
  }

  // One deal, top to bottom: what it is, where it stands, what you can do, who is in it, the stages, the words, the record.
  function dealView(deal) {
    const me = state.me ? deal.people.find((person) => same(person.name, state.me.name)) : null;
    const organiser = Boolean(state.me) && same(deal.organiser, state.me.name);
    const locked = deal.status === "locked";
    const status = statusOf(deal);
    const go = (work) => () => run(work);
    const explorer = state.chain.explorer;

    const head = h(
      "header",
      { class: "deal-head" },
      h(
        "div",
        {},
        h("h1", {}, deal.title || "Untitled deal"),
        h("p", { class: "sum" }, rupees(deal.checklist.total), deal.checklist.stake ? ` · ${rupees(deal.checklist.stake)} stake` : "")
      ),
      h(
        "div",
        { class: "tags" },
        deal.vaultAddress &&
          (explorer
            ? h("a", { class: "tag mono", href: `${explorer}/address/${deal.vaultAddress}`, target: "_blank", rel: "noreferrer" }, short(deal.vaultAddress))
            : h("span", { class: "tag mono", title: deal.vaultAddress }, short(deal.vaultAddress))),
        tag(status.word, status.tone),
        h("button", { type: "button", class: "quiet", onclick: copyLink }, "Copy link")
      )
    );

    const steps = h(
      "ol",
      { class: "steps" },
      STEPS.map((name, index) => h("li", { class: index < status.step ? "done" : index === status.step ? "now" : "" }, name))
    );

    // What this person can do next, most important first, and who the deal is waiting for otherwise.
    const buttons = [];
    const waiting = [];
    const others = (names) => names.filter((name) => !state.me || !same(name, state.me.name));
    const main = (text, work, amount) =>
      buttons.push(h("button", { type: "button", class: "primary", onclick: go(work) }, text), amount && state.wallet ? h("span", { class: "coin" }, coin(amount)) : null);

    if (deal.status === "draft") {
      if (organiser) {
        buttons.push(
          h("button", { type: "button", class: "primary", disabled: deal.problems.length > 0, onclick: go(() => api("POST", `/deals/${deal.id}/confirm`).then(must)) }, "Confirm")
        );
      } else waiting.push(deal.organiser);
    } else if (deal.status === "confirmed") {
      if (me && !me.agreed) main("Sign", sign);
      waiting.push(...others(deal.waitingFor));
    } else if (deal.status === "agreed") {
      if (organiser) main("Create vault", () => act("/lock"));
      else waiting.push(deal.organiser);
    } else {
      if (me && me.canWithdraw > 0) main(`Withdraw ${rupees(me.canWithdraw)}`, () => act("/withdraw"), me.canWithdraw);
      if (deal.phase === "Funding") {
        if (me && me.roles.includes("payer") && !me.deposited) main(`Deposit ${rupees(me.share)}`, () => act("/deposit"), me.share);
        if (me && me.roles.includes("payee") && deal.stake > 0 && !me.staked) main(`Stake ${rupees(deal.stake)}`, () => act("/stake"), deal.stake);
        waiting.push(
          ...others(
            deal.people
              .filter((person) => (person.roles.includes("payer") && !person.deposited) || (person.roles.includes("payee") && deal.stake > 0 && !person.staked))
              .map((person) => person.name)
          )
        );
      }
      if (deal.phase === "Active") {
        const open = deal.stages.filter((stage) => stage.waitingFor);
        waiting.push(...others([...new Set(open.map((stage) => stage.waitingFor))]));
      }
    }

    const quiet = [];
    if (locked && deal.phase === "Funding" && me && me.roles.includes("payer")) quiet.push(sure("Cancel", () => act("/cancel")));
    if (locked && deal.phase === "Active" && me && me.roles.includes("payee") && deal.stake > 0 && !me.left) {
      const unsettled = deal.stages.some((stage) => same(stage.payee, me.name) && stage.waitingFor);
      if (unsettled) quiet.push(sure("Leave", () => act("/leave")));
    }
    if (!locked && organiser) quiet.push(sure("Discard", discard));

    const actions = h(
      "div",
      { class: "act" },
      buttons,
      buttons.length === 0 && waiting.length > 0 && h("span", { class: "waiting" }, `Waiting for ${waiting.join(", ")}`),
      h("span", { class: "space" }),
      quiet
    );

    // Someone who still has to sign is shown what they are signing.
    const tab = state.tab || (deal.status === "confirmed" && me && !me.agreed ? "agreement" : "workspace");
    const refused = state.history.filter((entry) => entry.result === "refused").length;
    const tabs = h(
      "nav",
      { class: "tabs" },
      [
        ["workspace", "Workspace"],
        ["agreement", "Agreement"],
        ["activity", refused ? `Activity · ${refused} refused` : "Activity"],
      ].map(([name, text]) => {
        const show = () => {
          state.tab = name;
          draw(true);
        };
        return h("button", { type: "button", class: name === tab ? "on" : "", onclick: show }, text);
      })
    );

    const parts = {
      workspace: () => [...(locked ? [money(deal)] : []), ...peopleRows(deal, organiser, locked), ...stageRows(deal, me, locked, go), ...settlement()],
      agreement: () => [...agreement(deal), ...words(deal, organiser, locked, go)],
      activity: () => activity(),
    };
    return [head, steps, actions, ...(deal.status === "draft" ? checks(deal, organiser) : []), tabs, ...parts[tab]()];
  }

  /**
   * The whole deal in plain sentences, and what happens if someone breaks it.
   * Both are built from the checklist by this code, not written by the model, so
   * they say exactly what the vault will hold and what the contract enforces.
   */
  function agreement(deal) {
    const { payers, stages, judge, stake } = deal.checklist;
    const needed = Math.floor(payers.length / 2) + 1;
    const terms = [
      ...payers.map((payer) => `${payer.name} pays ${rupees(payer.share)} into the vault.`),
      ...stages.map((stage) => `${stage.payee} is paid ${rupees(stage.amount)} when ${stage.condition || stage.title}.`),
      payers.length > 1 ? `A stage is paid when ${needed} of the ${payers.length} payers approve it.` : payers.length === 1 && `A stage is paid when ${payers[0].name} approves it.`,
      stake > 0 && `Each payee puts in a stake of ${rupees(stake)} before the deal starts, and gets it back when the deal closes.`,
      judge.name && `${judge.name} settles any dispute.`,
    ].filter(Boolean);

    const rules = [
      ["A payer does not pay in", "The deal does not start. Any payer can cancel, and every deposit is returned."],
      ["A payer disputes a stage", `${judge.name || "The judge"} decides: pay the payee, or refund the payers. Nobody else can settle it.`],
      stake > 0
        ? ["A payee walks away", `Their unfinished stages are refunded to the payers, and their ${rupees(stake)} stake goes to the payers too.`]
        : ["A payee walks away", "This deal has no stake, so they lose nothing. Their stage stays unpaid and its money stays locked."],
      ["Someone acts out of turn, or asks for money twice", "The contract refuses. The attempt is kept under Activity."],
      ["Someone changes the terms after signing", "Any edit clears every signature. Once the vault exists, the terms cannot change."],
      ["The judge tries to take the money", "Not possible. The judge can only pay the payee or refund the payers."],
    ];

    const signed = deal.people.filter((person) => person.agreed).map((person) => person.name);
    const refused = state.history.filter((entry) => entry.result === "refused");
    return [
      label("The deal"),
      h("ol", { class: "terms" }, terms.map((term) => h("li", {}, term))),
      label("If someone breaks it"),
      ...rules.map(([when, then]) => h("div", { class: "r rule" }, h("span", { class: "main" }, when), h("span", {}, then))),
      label("Refused so far"),
      ...(refused.length
        ? refused.map((entry) => h("div", { class: "r rule" }, h("span", { class: "main" }, `${entry.person} · ${entry.action}${entry.stage ? ` ${entry.stage}` : ""}`), h("span", { class: "minus" }, entry.reason)))
        : [h("p", { class: "empty" }, "Nothing")]),
      ...(deal.document
        ? [label("Document"), h("p", { class: "empty" }, deal.document.name, h("span", { class: "sub mono", title: deal.document.fingerprint }, `Fingerprint ${short(deal.document.fingerprint)}`))]
        : []),
      label("Signed"),
      h(
        "p",
        { class: "empty" },
        signed.length ? signed.join(", ") : "Nobody yet",
        deal.agreementHash && h("span", { class: "sub mono", title: deal.agreementHash }, `Fingerprint ${short(deal.agreementHash)}`)
      ),
    ];
  }

  function copyLink() {
    const link = `${location.origin}/#${state.openId}`;
    const done = () => say(`Link copied: ${link}`);
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, () => say(link));
    else say(link);
  }

  /** A button that asks once more before it acts, for steps that cannot be taken back. */
  function sure(text, work) {
    const button = h("button", { type: "button", class: "quiet" }, text);
    button.addEventListener("click", () => {
      if (button.dataset.armed) return run(work);
      button.dataset.armed = "yes";
      button.textContent = "Sure?";
      button.classList.add("danger");
      setTimeout(() => {
        delete button.dataset.armed;
        button.textContent = text;
        button.classList.remove("danger");
      }, 3000);
    });
    return button;
  }

  /** What stops a draft from being confirmed, other than missing people, who are handled in their own rows. */
  function checks(deal, organiser) {
    const unclear = deal.checklist.unclear.map((item, index) =>
      h(
        "div",
        { class: "check" },
        h("div", {}, h("b", {}, item.issue), item.question),
        organiser && h("button", { type: "button", onclick: () => run(() => settleUnclear(index)) }, "OK")
      )
    );
    const problems = deal.problems
      .filter((problem) => problem.code !== "unknown-person" && problem.code !== "unclear")
      .map((problem) => h("div", { class: "check bad" }, problem.message));
    return [...unclear, ...problems];
  }

  function money(deal) {
    const stat = (value, name) => h("div", {}, h("b", {}, rupees(value)), h("span", {}, name));
    return h(
      "div",
      { class: "stats" },
      stat(deal.money.locked, "Locked"),
      stat(deal.money.waitingToBeWithdrawn, "To withdraw"),
      stat(deal.money.paidOut, "Paid out"),
      tag(deal.money.reconciles ? "Balanced" : "Not balanced", deal.money.reconciles ? "good" : "bad")
    );
  }

  function peopleRows(deal, organiser, locked) {
    const rows = deal.people.map((person) => {
      const role = [
        person.roles.includes("payer") && `pays ${rupees(person.share)}`,
        person.roles.includes("payee") && `earns ${rupees(person.earns)}`,
        person.roles.includes("judge") && "judge",
      ].filter(Boolean);

      let side = null;
      if (!person.known) {
        if (organiser && !locked) {
          const input = h("input", { placeholder: "0x… wallet", "aria-label": `Wallet address of ${person.name}`, spellcheck: "false" });
          const add = (event) => {
            event.preventDefault();
            run(() => addPerson(person.name, input.value.trim()));
          };
          side = h("form", { class: "side", onsubmit: add }, input, h("button", { type: "submit" }, "Add"));
        } else side = tag("No account", "wait");
      } else if (deal.status === "confirmed" || deal.status === "agreed") {
        side = person.agreed ? tag("Signed", "good") : tag("To sign", "wait");
      } else if (locked && (deal.phase === "Funding" || deal.phase === "Active")) {
        // What each person has in the escrow while the deal is running, or still owes it before the start.
        const owed = (amount, word) => (deal.phase === "Funding" ? tag(`To ${word} ${rupees(amount)}`, "wait") : null);
        if (person.roles.includes("payer")) side = person.deposited ? tag(`${rupees(person.share)} in escrow`, "good") : owed(person.share, "pay");
        else if (person.roles.includes("payee") && deal.stake > 0 && !person.left) {
          side = person.staked ? tag(`${rupees(deal.stake)} stake in escrow`, "good") : owed(deal.stake, "stake");
        }
      }
      const more = [];
      if (locked && person.left) more.push(tag("Left", "bad"));
      if (locked && person.canWithdraw > 0) more.push(tag(`${rupees(person.canWithdraw)} to withdraw`, "wait"));

      const you = state.me && same(person.name, state.me.name);
      return h(
        "div",
        { class: "r person" },
        h(
          "div",
          { class: "main" },
          person.name,
          you && h("span", { class: "you" }, "you"),
          person.known && h("span", { class: "sub mono" }, person.kind === "wallet" ? short(person.address) : "demo")
        ),
        h("div", { class: "muted" }, role.join(" · ")),
        h("div", { class: "side" }, side, more)
      );
    });
    return [label(locked ? "Escrow" : "People"), ...rows];
  }

  function stageRows(deal, me, locked, go) {
    const stages = locked ? deal.stages : deal.checklist.stages;
    const rows = stages.map((stage, index) => {
      const number = index + 1;
      const side = [];
      if (locked) {
        const approvals = stage.state === "Completed" && stage.approvalsNeeded > 1 ? ` ${stage.approvals}/${stage.approvalsNeeded}` : "";
        if (stage.state !== "Pending" || deal.phase !== "Active") side.push(tag(STAGE_WORDS[stage.state] + approvals, STAGE_TONES[stage.state]));
        if (deal.phase === "Active" && me) {
          const step = (text, path, body, tone) =>
            side.push(h("button", { type: "button", class: tone || "", onclick: go(() => act(`/stages/${number}/${path}`, body)) }, text));
          if (stage.state === "Pending" && same(stage.payee, me.name)) step("Done", "complete", undefined, "primary");
          if (stage.state === "Completed" && me.roles.includes("payer")) {
            step("Approve", "approve", undefined, "primary");
            step("Dispute", "dispute");
          }
          if (stage.state === "Disputed" && me.roles.includes("judge")) {
            step("Pay", "resolve", { decision: "pay" }, "primary");
            step("Refund", "resolve", { decision: "refund" });
          }
        }
      }
      return h(
        "div",
        { class: "r stage" },
        h("span", { class: "n" }, String(number)),
        h(
          "div",
          { class: "main" },
          stage.title || `Stage ${number}`,
          // Before the lock, each stage shows the words of the deal it was read from.
          h("span", { class: "sub" }, !locked && stage.source ? `${stage.payee} · “${stage.source}”` : [stage.payee, stage.condition].filter(Boolean).join(" · "))
        ),
        h("span", {}, rupees(stage.amount)),
        h("div", { class: "side" }, side)
      );
    });
    return [label("Stages"), ...rows];
  }

  function words(deal, organiser, locked, go) {
    const reader = tag(deal.readBy === "model" ? "Read by AI" : "Read offline");
    reader.title = deal.readBy === "model" ? deal.model || "" : deal.fallbackReason || "Offline reader";
    if (state.editing !== null) {
      const input = h("textarea", { "aria-label": "Deal text", oninput: (event) => (state.editing = event.target.value) });
      input.value = state.editing;
      const stop = () => {
        state.editing = null;
        draw(true);
      };
      return [
        label("Words"),
        h(
          "div",
          { class: "words-edit" },
          input,
          h("div", {}, h("button", { type: "button", class: "primary", onclick: go(rewrite) }, "Read again"), h("button", { type: "button", class: "quiet", onclick: stop }, "Cancel"))
        ),
      ];
    }
    const edit = () => {
      state.editing = deal.text;
      draw(true);
    };
    return [
      label("Words", reader, !locked && organiser && h("button", { type: "button", class: "quiet", onclick: edit }, "Edit")),
      h("p", { class: "words" }, deal.text),
    ];
  }

  /** Who ended up with what, once the deal is over. The figures come from the vault's own events. */
  function settlement() {
    if (!state.summary) return [];
    const signed = (amount) => h("span", { class: amount > 0 ? "plus" : amount < 0 ? "minus" : "muted" }, `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${rupees(Math.abs(amount))}`);
    const rows = state.summary.people.map((person) => {
      const paid = person.paidIn + person.staked;
      const received = person.earned + person.refunded + person.stakeBack + person.fromStakes;
      return h("div", { class: "r sum-row" }, h("span", { class: "main" }, person.name), h("span", {}, rupees(paid)), h("span", {}, rupees(received)), signed(received - paid));
    });
    return [
      label("Settlement", tag(state.summary.addsUp ? "Adds up" : "Does not add up", state.summary.addsUp ? "good" : "bad")),
      h("div", { class: "r sum-row muted" }, h("span", {}, ""), h("span", {}, "Paid in"), h("span", {}, "Received"), h("span", {}, "Net")),
      ...rows,
    ];
  }

  function activity() {
    if (state.history.length === 0) return [];
    const entries = state.history.slice().reverse();
    const shown = state.allHistory ? entries : entries.slice(0, HISTORY_SHOWN);
    const explorer = state.chain.explorer;
    const rows = shown.map((entry) => {
      const refused = entry.result === "refused";
      const link =
        entry.tx &&
        (explorer
          ? h("a", { class: "mono", href: `${explorer}/tx/${entry.tx}`, target: "_blank", rel: "noreferrer" }, short(entry.tx))
          : h("span", { class: "mono", title: entry.tx }, short(entry.tx)));
      return h(
        "div",
        { class: `log ${refused ? "refused" : ""}` },
        h("span", { class: "when" }, new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
        h("span", {}, entry.person),
        h("span", { class: "what" }, `${entry.action}${entry.stage ? ` ${entry.stage}` : ""}`),
        h("span", { class: "why" }, refused ? `Refused. ${entry.reason}` : link || "")
      );
    });
    const more = () => {
      state.allHistory = !state.allHistory;
      draw(true);
    };
    return [
      label("Activity", entries.length > HISTORY_SHOWN && h("button", { type: "button", class: "quiet", onclick: more }, state.allHistory ? "Less" : `All ${entries.length}`)),
      ...rows,
    ];
  }

  // ---- attack lab ----------------------------------------------------------

  async function openLab() {
    if (state.lab) {
      state.lab = null;
      return;
    }
    state.lab = { attacks: must(await api("GET", "/attacks")).attacks, results: {} };
  }

  async function runAttack(name) {
    say("Attacking…");
    state.lab.results[name] = must(await api("POST", `/attacks/${name}`));
    say("");
    draw(true);
  }

  function labView() {
    const all = () =>
      run(async () => {
        for (const attack of state.lab.attacks) await runAttack(attack.name);
      });
    const rows = state.lab.attacks.map((attack) => {
      const result = state.lab.results[attack.name];
      const detail = [];
      if (result) {
        detail.push(h("p", { class: "verdict" }, result.verdict));
        if (result.steps) {
          detail.push(
            h(
              "div",
              { class: "steps-list" },
              result.steps.map((step) =>
                h(
                  "div",
                  { class: `log ${step.outcome === "refused" ? "refused" : ""}` },
                  h("span", {}, step.who),
                  h("span", { class: "what" }, step.tried),
                  h("span", {}, step.outcome),
                  h("span", { class: "why" }, step.reason || "")
                )
              )
            )
          );
        }
        if (result.realVault) {
          const line = (name, vault) =>
            h(
              "div",
              { class: `log ${vault.tookMoreThanOwed ? "refused" : ""}` },
              h("span", {}, name),
              h("span", { class: "what" }, `owed ${rupees(vault.owedToAttacker)}`),
              h("span", {}, `took ${rupees(vault.attackerReceived)}`),
              h("span", { class: "why" }, `${vault.refusedAgain} of ${vault.askedAgain} repeat withdrawals refused`)
            );
          detail.push(h("div", { class: "steps-list" }, line("Real vault", result.realVault), line("Weak copy", result.weakCopy)));
        }
      }
      return h(
        "div",
        { class: "attack" },
        h(
          "div",
          { class: "attack-top" },
          h("div", { class: "main" }, h("b", {}, attack.title), h("span", { class: "sub muted" }, ` ${attack.explanation}`)),
          result ? tag(result.attackFailed ? "Blocked" : "Got through", result.attackFailed ? "good" : "bad") : h("button", { type: "button", onclick: () => run(() => runAttack(attack.name)) }, "Run")
        ),
        detail
      );
    });
    return [
      h("header", { class: "deal-head" }, h("h1", {}, "Attacks"), h("div", { class: "tags" }, h("button", { type: "button", class: "primary", onclick: all }, "Run all"))),
      ...rows,
    ];
  }

  // ---- start ---------------------------------------------------------------

  async function start() {
    state.chain = must(await api("GET", "/contract"));
    state.offline = Boolean(memory.read().offline);
    // A link to a workspace opens that workspace.
    state.openId = location.hash.slice(1) || null;
    const { people } = must(await api("GET", "/people"));
    state.demo = people.some((person) => person.kind === "demo");

    // Pick up where this browser left off, without opening the wallet.
    const saved = memory.read();
    try {
      const accounts = window.ethereum ? await window.ethereum.request({ method: "eth_accounts" }) : [];
      if (accounts.length && saved.sessions && saved.sessions[ethers.getAddress(accounts[0])]) await signInWith(accounts[0], { quietly: true });
    } catch (error) {
      // The wallet is locked or not ready; the visitor can connect by hand.
    }
    if (!state.me && state.demo && saved.demo) {
      const person = people.find((candidate) => candidate.kind === "demo" && same(candidate.name, saved.demo));
      if (person) become(person, null);
    }

    $("ask").addEventListener("submit", (event) => {
      event.preventDefault();
      run(createDeal);
    });
    $("ask-text").addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        run(createDeal);
      }
    });
    $("ask-text").addEventListener("input", () => {
      grow();
      drawExamples();
    });
    $("ask-ai").addEventListener("click", () => {
      state.offline = !state.offline;
      memory.write({ offline: state.offline });
      draw(true);
    });
    $("lab-open").addEventListener("click", () => run(openLab));
    $("ask-attach").addEventListener("click", () => $("ask-file").click());
    $("ask-file").addEventListener("change", (event) => {
      const [file] = event.target.files;
      event.target.value = "";
      run(() => attach(file));
    });
    document.addEventListener("click", (event) => {
      // The path is used because the clicked button may already have been redrawn.
      if (state.menu && !event.composedPath().includes($("who"))) {
        state.menu = false;
        draw(true);
      }
    });
    if (window.ethereum && window.ethereum.on) {
      // Switching account in the wallet switches person here.
      window.ethereum.on("accountsChanged", (accounts) => {
        if (!state.wallet) return;
        run(() => (accounts.length ? signInWith(accounts[0]) : signOut()));
      });
    }

    drawExamples();
    await refresh(true);
    setInterval(() => {
      if (!state.busy) refresh().catch(() => {});
    }, state.chain.local ? 3000 : 12000);
  }

  start().catch((error) => say(`Settl could not start: ${error.message}`, "bad"));
})();
