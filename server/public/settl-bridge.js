/**
 * Settl bridge: connects the dashboard in web/ to the Settl server.
 *
 * The dashboard's screens were written against one data format and the server
 * speaks another. This script sits between them. It is added to the dashboard
 * page by the server, so nothing in web/ has to change for it to work.
 *
 * It does three things:
 *   1. Translates. Every request the dashboard makes is answered here, from the
 *      real server, in the format the screens expect.
 *   2. Fills gaps. It shows the points a deal's organiser must resolve and lets
 *      them resolve each one, and it adds the stake and "leave" actions.
 *   3. Starts with one sample deal, so the first screen shows real data.
 *
 * The dashboard works with demo people: "Acting as" names who is acting and the
 * server acts for them. People who sign in with their own wallet use /wallet.
 */
(function () {
  "use strict";

  const realFetch = window.fetch.bind(window);

  // The names used by the sample deals. They are added as demo people on first load.
  const SAMPLE_PEOPLE = ["Riya", "Aman", "Meera", "Kabir", "Priya", "Vikram"];
  const MEDIATOR = "Platform Mediator";
  const SAMPLE_DEAL =
    "Riya will pay Aman Rs 30,000 for a website: Rs 10,000 after the design is delivered, " +
    "Rs 15,000 after the pages are built and Rs 5,000 after the site goes live. Meera settles disputes.";

  // The server's last answer for each deal, kept so an edit can send back the parts the screens do not show.
  const serverDeals = new Map();

  const rupees = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  const sameName = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

  /** Who the dashboard is acting as right now. */
  function acting() {
    try {
      if (typeof state !== "undefined" && state.actingPerson) return state.actingPerson;
    } catch (ignored) {
      // The dashboard's state is not there yet; fall back to the selector.
    }
    const select = document.getElementById("select-acting-as");
    return select ? select.value : "";
  }

  async function call(method, path, body) {
    const response = await realFetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  }

  const ok = (data) => ({ ok: true, status: 200, data });
  const fail = (reply) => {
    let error = reply.data.reason || reply.data.error || `Error ${reply.status}`;
    // A refused confirmation carries the list of what is still wrong.
    if (Array.isArray(reply.data.problems) && reply.data.problems.length) {
      error += ` ${reply.data.problems.map((problem) => problem.message).join(" ")}`;
    }
    return { ok: false, status: reply.status || 409, error };
  };

  // ---- people --------------------------------------------------------------

  async function addMissingPeople(names) {
    const listed = await call("GET", "/people");
    if (!listed.ok) return;
    const missing = names.filter((name) => name && !listed.data.people.some((person) => sameName(person.name, name)));
    if (missing.length) await call("POST", "/people", { names: missing });
  }

  async function people() {
    await addMissingPeople(SAMPLE_PEOPLE);
    const listed = await call("GET", "/people");
    if (!listed.ok) return fail(listed);
    return ok({
      people: listed.data.people
        // Wallet people act from their own wallet at /wallet; they cannot be chosen here.
        .filter((person) => person.kind !== "wallet")
        .map((person) => ({
          id: person.name,
          name: person.name,
          roleDesc: person.name === MEDIATOR ? "Neutral judge" : "Demo person",
          address: person.address,
        })),
    });
  }

  // ---- one deal, in the shape the screens expect ---------------------------

  function historyLine(entry) {
    const stage = entry.stage ? ` stage ${entry.stage}` : "";
    return {
      time: new Date(entry.time).toLocaleTimeString(),
      person: entry.person,
      action: entry.result === "refused" ? `tried to ${entry.action}${stage}` : entry.detail || `${entry.action}${stage}`,
      outcome: entry.result,
      reason: entry.reason || "",
    };
  }

  function waitingFor(deal) {
    if (deal.phase === "Review") return `${deal.organiser} to resolve the open points and confirm`;
    if (deal.phase === "Agree") {
      const pending = deal.members.filter((name) => !deal.agreed[name]);
      return pending.length ? `${pending.join(", ")} to agree` : `${deal.organiser} to lock the deal`;
    }
    if (deal.phase === "Funding") {
      const steps = [
        ...deal.payers.filter((payer) => !deal.deposited[payer.person]).map((payer) => `${payer.person} to deposit`),
        ...Object.keys(deal.staked).filter((name) => !deal.staked[name]).map((name) => `${name} to put in the stake`),
      ];
      return steps.join("; ") || "Nothing: the deal is about to start";
    }
    if (deal.phase === "Cancelled" || deal.phase === "Closed") {
      const owed = Object.keys(deal.withdrawable).filter((name) => deal.withdrawable[name] > 0);
      if (owed.length) return `${owed.join(", ")} to withdraw`;
      return deal.phase === "Closed" ? "Nobody: every stage is settled and paid out" : "Nobody: the deal was cancelled";
    }
    for (const stage of deal.stages) {
      if (stage.state === "Pending") return `${stage.payee} to mark stage ${stage.num} done`;
      if (stage.state === "Completed") return `The payers to approve stage ${stage.num}`;
      if (stage.state === "Disputed") return `${deal.judge}, the judge, to settle stage ${stage.num}`;
    }
    return "Nobody";
  }

  function toDashboardDeal(server, history, everyone) {
    serverDeals.set(server.id, server);
    const locked = server.status === "locked";
    const checklist = server.checklist;
    const livePeople = locked ? server.people : [];
    const pick = (test, value) => Object.fromEntries(livePeople.filter(test).map((person) => [person.name, value(person)]));

    return {
      id: server.id,
      title: server.title || server.id,
      text: server.text,
      originalText: server.text,
      organiser: server.organiser,
      members: server.members,
      phase: locked ? server.phase : server.status === "draft" ? "Review" : "Agree",
      readBy: server.readBy === "model" ? "model" : "offline rules",
      readByNote: server.readBy === "model" ? `(${server.model})` : server.fallbackReason || "",
      payers: checklist.payers.map((payer) => ({ person: payer.name, share: payer.share })),
      judge: checklist.judge.name,
      stages: checklist.stages.map((stage, index) => {
        const live = locked ? server.stages[index] : null;
        return {
          id: String(index + 1),
          num: index + 1,
          title: stage.title || `Stage ${index + 1}`,
          payee: stage.payee,
          amount: stage.amount,
          condition: stage.condition || "",
          textPhrase: stage.source || "",
          state: live ? live.state : "Pending",
          // The screens only count approvals, so the count is all they are given.
          approvals: new Array(live ? live.approvals : 0).fill(true),
          approvalsNeeded: live ? live.approvalsNeeded : null,
        };
      }),
      unclear: checklist.unclear.map((item, index) => ({
        id: `unclear-${index + 1}`,
        phrase: item.source || item.issue,
        issue: item.issue,
        source: item.source || "",
        question: item.question,
      })),
      // Unclear points have their own list on the screen, so their summary line is left out here.
      problems: (server.problems || []).filter((problem) => problem.code !== "unclear").map((problem) => problem.message),
      agreed: Object.fromEntries((server.agreed || []).map((name) => [name, true])),
      deposited: pick((person) => person.deposited, (person) => person.share),
      withdrawable: pick(() => true, (person) => person.canWithdraw),
      stake: locked ? server.stake : checklist.stake || 0,
      staked: pick((person) => person.staked !== undefined, (person) => person.staked),
      left: pick((person) => person.left !== undefined, (person) => person.left),
      totalPaidOut: locked ? server.money.paidOut : 0,
      history: (history || []).map(historyLine).reverse(),
      participants: server.members.map((name) => {
        const person = (everyone || []).find((candidate) => sameName(candidate.name, name));
        return { name, address: person ? person.address : "no account yet" };
      }),
      // Real values only. Before the vault exists the screen is told so, not shown a made-up address.
      vaultAddress: server.vaultAddress || "Not created yet",
      agreementFingerprint: server.agreementHash || "Not confirmed yet",
    };
  }

  /** The deal as the server has it now, with its history, ready for the screens. */
  async function loadDeal(id) {
    const [found, history, listed] = await Promise.all([
      call("GET", `/deals/${id}`),
      call("GET", `/deals/${id}/history`),
      call("GET", "/people"),
    ]);
    if (!found.ok) return fail(found);
    const server = found.data.deal;
    const deal = toDashboardDeal(server, history.ok ? history.data.history : [], listed.ok ? listed.data.people : []);
    const data = { deal, waitingFor: waitingFor(deal) };
    if (server.status === "locked") {
      data.reconciliation = {
        totalDeposited: server.money.deposited,
        locked: server.money.locked,
        waiting: server.money.waitingToBeWithdrawn,
        paidOut: server.money.paidOut,
        reconciles: server.money.reconciles,
      };
      data.allDeposited = server.phase !== "Funding";
    } else {
      // No vault yet, so no money anywhere: nothing to be out of balance.
      data.reconciliation = { totalDeposited: 0, locked: 0, waiting: 0, paidOut: 0, reconciles: true };
    }
    data.allAgreed = server.status === "agreed" || server.status === "locked";
    return ok(data);
  }

  /** Sends one action, then answers with the deal as it now stands. */
  async function act(id, route, body) {
    const sent = await call("POST", `/deals/${id}${route}`, body);
    if (!sent.ok) return fail(sent);
    return loadDeal(id);
  }

  // ---- drafting and editing ------------------------------------------------

  async function draft(text, person, offline) {
    const drafted = await call("POST", "/deals/draft", { text, person, offline: offline === true });
    if (!drafted.ok) return fail(drafted);
    // In this demo mode, anyone the deal names is added as a demo person.
    await addMissingPeople(drafted.data.deal.members);
    return loadDeal(drafted.data.deal.id);
  }

  async function saveChecklist(id, body) {
    const before = serverDeals.get(id);
    const stages = (body.stages || []).map((stage) => ({
      title: stage.title || "",
      payee: stage.payee || "",
      amount: Number(stage.amount) || 0,
      condition: stage.condition || "",
      source: stage.textPhrase || "",
    }));
    const checklist = {
      title: before ? before.checklist.title : "",
      payers: (body.payers || []).map((payer) => ({ name: payer.person, share: Number(payer.share) || 0 })),
      judge: { name: body.judge || "" },
      stages,
      unclear: (body.unclear || []).map((item) => ({ issue: item.issue || item.phrase, question: item.question, source: item.source || "" })),
      total: stages.reduce((sum, stage) => sum + stage.amount, 0),
      stake: before ? before.checklist.stake || 0 : 0,
    };
    const saved = await call("PUT", `/deals/${id}/checklist`, { person: body.person || acting(), checklist });
    if (!saved.ok) return fail(saved);
    await addMissingPeople(saved.data.deal.members);
    return loadDeal(id);
  }

  // ---- deal list, and the sample deal it starts with -------------------------

  let seeding = null;

  /** One clean deal, locked and funded, so the first screen has something real on it. */
  async function seedSampleDeal() {
    const drafted = await call("POST", "/deals/draft", { text: SAMPLE_DEAL, person: "Riya", offline: true });
    if (!drafted.ok) return;
    const id = drafted.data.deal.id;
    if (!(await call("POST", `/deals/${id}/confirm`, { person: "Riya" })).ok) return;
    for (const person of drafted.data.deal.members) await call("POST", `/deals/${id}/agree`, { person });
    await call("POST", `/deals/${id}/lock`, { person: "Riya" });
    await call("POST", `/deals/${id}/deposit`, { person: "Riya" });
  }

  async function listDeals() {
    let listed = await call("GET", "/deals");
    if (!listed.ok) return fail(listed);
    if (listed.data.deals.length === 0) {
      await addMissingPeople(SAMPLE_PEOPLE);
      seeding = seeding || seedSampleDeal();
      await seeding;
      seeding = null;
      listed = await call("GET", "/deals");
      if (!listed.ok) return fail(listed);
    }
    const deals = [];
    for (const row of listed.data.deals) {
      const loaded = await loadDeal(row.id);
      if (!loaded.ok) continue;
      const deal = loaded.data.deal;
      const settled = deal.stages.filter((stage) => stage.state === "Released" || stage.state === "Refunded").length;
      deals.push({
        id: deal.id,
        title: deal.title,
        phase: deal.phase,
        totalAmount: row.total,
        stagesSettled: `${settled} of ${deal.stages.length}`,
        waitingFor: loaded.data.waitingFor,
      });
    }
    return ok({ deals });
  }

  // ---- attack lab ----------------------------------------------------------

  async function listAttacks() {
    const listed = await call("GET", "/attacks");
    if (!listed.ok) return fail(listed);
    return ok({
      attacks: listed.data.attacks.map((attack) => ({
        id: attack.name,
        name: attack.name,
        title: attack.title,
        explanation: attack.explanation,
      })),
    });
  }

  async function runAttack(name) {
    const run = await call("POST", `/attacks/${name}`);
    if (!run.ok) return fail(run);
    const attack = run.data;
    const outcome = attack.attackFailed ? "attack failed" : "UNEXPECTED: the attack was not stopped";

    if (attack.realVault) {
      const side = (vault, result) => ({
        owedToAttacker: vault.owedToAttacker,
        attackerReceived: vault.attackerReceived,
        stillLocked: vault.leftInVault,
        result,
      });
      const real = attack.realVault;
      const weak = attack.weakCopy;
      return ok({
        result: {
          hasWeakCopy: true,
          steps: [
            { action: `The attacker is owed ${rupees(real.owedToAttacker)} for one stage, out of three in the vault`, status: "ok" },
            { action: "It withdraws, and from inside that payment asks for the money again", status: "ok" },
            { action: `Real vault: it asked again ${real.askedAgain} time(s) and was refused ${real.refusedAgain} time(s)`, status: "blocked" },
            { action: `Weak copy: it asked again ${weak.askedAgain} time(s) and was refused ${weak.refusedAgain} time(s)`, status: "reverted" },
          ],
          realVault: {
            ...side(real, `${outcome}. The attacker received ${rupees(real.attackerReceived)}, exactly what it was owed; ${rupees(real.leftInVault)} stayed locked. The same attack on the weak copy took ${rupees(weak.attackerReceived)} and emptied it.`),
            reason: "A second withdrawal was attempted before the first one had finished.",
          },
          weakCopy: side(weak, weak.tookMoreThanOwed ? "vault drained" : "not drained"),
        },
      });
    }

    const refusals = attack.steps.filter((step) => step.outcome === "refused");
    return ok({
      result: {
        hasWeakCopy: false,
        targetStage: "Stage 1 of a fresh three-stage vault",
        steps: attack.steps.map((step) => ({
          action: `${step.who} ${step.tried}: ${step.outcome === "refused" ? `refused. ${step.reason}` : "accepted"}`,
          status: step.outcome === "refused" ? "blocked" : "ok",
        })),
        realVault: {
          stillLocked: attack.money.inVault,
          reason: refusals.length ? refusals[0].reason : "",
          result: `${outcome}. ${attack.verdict}`,
        },
      },
    });
  }

  // ---- final summary -------------------------------------------------------

  async function summary(id) {
    const [found, loaded] = await Promise.all([call("GET", `/deals/${id}/summary`), loadDeal(id)]);
    if (!found.ok) return fail(found);
    const figures = found.data.summary;
    const roles = loaded.ok ? serverDeals.get(id).people : [];
    const roleOf = (name) => {
      const person = roles.find((candidate) => candidate.name === name);
      return person ? person.roles.join(", ") : "";
    };
    const totals = figures.totals;
    let equation = `Deposited ${rupees(totals.deposited)} = paid to payees ${rupees(totals.paidToPayees)} + returned to payers ${rupees(totals.returnedToPayers)}.`;
    if (totals.staked > 0) {
      equation += ` Stakes ${rupees(totals.staked)} = returned ${rupees(totals.stakesReturned)} + forfeited to payers ${rupees(totals.stakesForfeited)}.`;
    }
    equation += figures.addsUp ? " Everything adds up." : " WARNING: the figures do not add up.";

    return ok({
      title: figures.title,
      people: figures.people.map((person) => ({
        person: person.name,
        role: roleOf(person.name),
        paidIn: person.paidIn + person.staked,
        received: person.earned + person.fromStakes,
        refunded: person.refunded + person.stakeBack,
      })),
      stages: figures.stages.map((stage) => ({
        num: stage.number,
        title: stage.title,
        payee: stage.payee,
        amount: stage.amount,
        state: /refunded/.test(stage.outcome) ? "Refunded" : stage.outcome === "not settled" ? "Pending" : "Released",
        howItEnded: stage.outcome,
      })),
      totals: { deposited: totals.deposited, paidOut: totals.paidToPayees, refunded: totals.returnedToPayers, equation },
    });
  }

  // ---- routing -------------------------------------------------------------

  const STAGE_ROUTES = { done: "complete", approve: "approve", dispute: "dispute", resolve: "resolve" };

  /** Answers one dashboard request, or returns null for anything that is not the dashboard's. */
  async function request(path, options) {
    const method = ((options && options.method) || "GET").toUpperCase();
    let body = {};
    try {
      body = options && options.body ? JSON.parse(options.body) : {};
    } catch (ignored) {
      body = {};
    }
    const route = path.split("?")[0];
    const person = body.person || acting();
    let match;

    if (route === "/people" && method === "GET") return people();
    if (route === "/deals" && method === "GET") return listDeals();
    if (route === "/parse" || route === "/deals/draft") {
      const drafted = await draft(body.text, person);
      // Anyone the deal named is now a demo person, so the "Acting as" list is refreshed.
      if (drafted.ok && typeof loadPeople === "function") loadPeople();
      return drafted;
    }
    if (route === "/attacks" && method === "GET") return listAttacks();
    if ((match = route.match(/^\/attacks\/([\w-]+)$/))) return runAttack(match[1]);
    if (route === "/api/reset") {
      const reset = await call("POST", "/reset");
      serverDeals.clear();
      // The old deals are gone. Point the dashboard at the sample deal that the fresh start creates.
      if (reset.ok && typeof state !== "undefined") {
        state.currentDealId = "deal-1";
        state.activeStageId = null;
        state.wizardDeal = null;
      }
      return reset.ok ? ok(reset.data) : fail(reset);
    }
    if ((match = route.match(/^\/deals\/([\w-]+)$/)) && method === "GET") return loadDeal(match[1]);
    if ((match = route.match(/^\/deals\/([\w-]+)\/summary$/))) return summary(match[1]);
    if ((match = route.match(/^\/deals\/([\w-]+)\/checklist$/))) return saveChecklist(match[1], body);
    if ((match = route.match(/^\/deals\/([\w-]+)\/stages\/([\w-]+)\/(\w+)$/))) {
      const [, id, stage, action] = match;
      const send = { person };
      if (action === "resolve") send.decision = body.resolution === "pay_payee" ? "pay" : "refund";
      // A stage is known to the screens as "2" or "stg-2"; the server wants the number.
      return act(id, `/stages/${stage.replace(/\D/g, "") || "0"}/${STAGE_ROUTES[action] || action}`, send);
    }
    if ((match = route.match(/^\/deals\/([\w-]+)\/(confirm|agree|lock|deposit|withdraw|stake|leave|cancel)$/))) {
      const answered = await act(match[1], `/${match[2]}`, { person });
      if (match[2] === "confirm") note(answered.ok ? "" : answered.error);
      return answered;
    }
    return null;
  }

  // The dashboard calls fetch(); those calls are answered here. Everything else goes to the network as usual.
  window.fetch = async function (input, init) {
    const url = new URL(typeof input === "string" ? input : input.url, window.location.href);
    if (url.origin !== window.location.origin) return realFetch(input, init);
    const answered = await request(url.pathname + url.search, init || {});
    if (answered === null) return realFetch(input, init);
    return new Response(JSON.stringify(answered.ok ? answered.data : { reason: answered.error }), {
      status: answered.ok ? 200 : answered.status || 409,
      headers: { "Content-Type": "application/json" },
    });
  };

  // ==========================================================================
  // What the screens leave out: open points, the stake, and leaving a deal.
  // These parts read the dashboard's own state and call its own redraw
  // functions, so they stay in step with whatever the screens are showing.
  // ==========================================================================

  const page = {
    wizardDeal: () => (typeof state !== "undefined" ? state.wizardDeal : null),
    currentDeal: () => (typeof state !== "undefined" ? state.currentDeal : null),
    tryAnything: () => typeof state !== "undefined" && Boolean(state.tryAnything),
  };

  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(label, className, onClick) {
    const node = make("button", label, className);
    node.type = "button";
    node.addEventListener("click", async () => {
      node.disabled = true;
      try {
        await onClick();
      } finally {
        node.disabled = false;
      }
    });
    return node;
  }

  let noteText = "";
  /** A message for the review step: why a confirmation or an edit was refused. */
  function note(text) {
    noteText = text || "";
    drawOpenPoints();
  }

  /** Puts a new version of the deal into the wizard and redraws its current step. */
  function showInWizard(deal) {
    state.wizardDeal = deal;
    if (typeof loadPeople === "function") loadPeople();
    if (deal.phase === "Review" && typeof renderReviewStep === "function") renderReviewStep();
  }

  /**
   * The review step: every point the organiser must resolve, with a way to
   * resolve each, and what the server says is still wrong. Nothing is resolved
   * automatically; a person answers each point.
   */
  function drawOpenPoints() {
    const section = document.getElementById("review-unclear-section");
    const list = document.getElementById("review-unclear-list");
    const deal = page.wizardDeal();
    if (!section || !list || !deal || deal.phase !== "Review") return;

    list.textContent = "";
    const open = deal.unclear.length + deal.problems.length;
    section.classList.toggle("hidden", open === 0 && !noteText);

    const reader = make("div", `Read by ${deal.readBy === "model" ? `the AI model ${deal.readByNote}` : `the offline reader. ${deal.readByNote}`}`, "text-muted text-sm");
    list.append(reader);

    deal.unclear.forEach((item, index) => {
      const card = make("div", undefined, "unclear-card");
      card.style.cssText = "border:1px solid rgba(217,119,6,.45);border-radius:10px;padding:10px;margin-top:8px;";
      card.append(make("div", item.source ? `Unclear: "${item.source}"` : `Unclear: ${item.issue}`, "text-sm"), make("div", item.question, "text-muted text-sm"));

      const linked = deal.stages.filter((stage) => item.source && ((stage.condition || "").includes(item.source) || (stage.textPhrase || "").includes(item.source)));
      const input = make("input", undefined, "custom-input");
      input.type = "text";
      input.style.marginTop = "6px";
      input.setAttribute("aria-label", "Your answer");
      input.placeholder = linked.length === 1 ? `A condition for stage ${linked[0].num} that can be checked` : "Your answer, in words that can be checked";
      const resolve = button("Resolve", "btn btn-primary btn-sm", async () => {
        const answer = input.value.trim();
        if (!answer) return note("Type an answer before resolving a point. Nothing is resolved for you.");
        // An answer about one stage's wording becomes that stage's condition.
        if (linked.length === 1) linked[0].condition = answer;
        deal.unclear.splice(index, 1);
        const saved = await request(`/deals/${deal.id}/checklist`, {
          method: "PUT",
          body: JSON.stringify({ payers: deal.payers, judge: deal.judge, stages: deal.stages, unclear: deal.unclear }),
        });
        if (saved.ok) {
          noteText = "";
          showInWizard(saved.data.deal);
        } else {
          const current = await loadDeal(deal.id);
          if (current.ok) showInWizard(current.data.deal);
          note(saved.error);
        }
      });
      resolve.style.marginTop = "6px";
      card.append(input, resolve);
      list.append(card);
    });

    for (const problem of deal.problems) {
      const line = make("div", `To fix: ${problem}`, "text-sm");
      line.style.cssText = "color:#be123c;margin-top:8px;";
      list.append(line);
    }
    if (noteText) {
      const line = make("div", noteText, "text-sm");
      line.style.cssText = "color:#be123c;margin-top:8px;font-weight:600;";
      list.append(line);
    }

    // Anything else (a missing judge, shares that do not add up) is fixed in the wording itself.
    const rewrite = make("details");
    rewrite.style.marginTop = "10px";
    rewrite.append(make("summary", "Rewrite the deal text and check it again", "text-sm"));
    const text = make("textarea", undefined, "custom-input");
    text.value = deal.originalText || "";
    text.rows = 4;
    text.style.cssText = "width:100%;margin-top:6px;";
    text.setAttribute("aria-label", "Deal text");
    const again = button("Check again", "btn btn-secondary btn-sm", async () => {
      if (!text.value.trim()) return note("The deal text is empty.");
      const checked = await draft(text.value.trim(), acting());
      if (checked.ok) {
        noteText = "";
        showInWizard(checked.data.deal);
      } else {
        note(checked.error);
      }
    });
    again.style.marginTop = "6px";
    rewrite.append(text, again);
    list.append(rewrite);
    if (open > 0) rewrite.open = deal.unclear.length === 0;
  }

  /** The lock step: a stake row for each payee when the deal asks for one. */
  function drawStakeRows() {
    const list = document.getElementById("lock-deposits-list");
    const banner = document.getElementById("all-deposited-banner");
    const deal = page.wizardDeal();
    if (!list || !deal || (deal.phase !== "Funding" && deal.phase !== "Active")) return;

    for (const name of Object.keys(deal.staked || {})) {
      if (!(deal.stake > 0)) break;
      const row = make("div", undefined, "flex-between py-1 border-b");
      row.append(make("span", `${name} (Stake: ${rupees(deal.stake)}, lost by walking away)`));
      const side = make("div");
      if (deal.staked[name]) {
        side.append(make("span", `Stake in ${rupees(deal.stake)}`, "badge badge-success"));
      } else if (sameName(name, acting()) || page.tryAnything()) {
        side.append(
          button(`Put in stake ${rupees(deal.stake)}`, "btn btn-primary btn-sm", async () => {
            const staked = await request(`/deals/${deal.id}/stake`, { method: "POST", body: JSON.stringify({ person: acting() }) });
            if (staked.ok) {
              state.wizardDeal = staked.data.deal;
              renderLockStep();
            } else if (typeof showRefusal === "function") {
              showRefusal("deposit-refusal", staked.error);
            }
          })
        );
      } else {
        side.append(make("span", "Waiting", "text-muted text-sm"));
      }
      row.append(side);
      list.append(row);
    }
    // The deal has started only when it has left Funding: every deposit and every stake is in.
    if (banner) banner.classList.toggle("hidden", deal.phase === "Funding");
  }

  /** The deal screen: the stake's status, and the stake and leave actions. */
  function drawDealExtras() {
    const anchor = document.getElementById("action-matrix-container");
    const deal = page.currentDeal();
    if (!anchor || !anchor.parentElement || !deal) return;

    let bar = document.getElementById("settl-bridge-bar");
    if (!bar) {
      bar = make("div");
      bar.id = "settl-bridge-bar";
      bar.style.cssText = "margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;";
      anchor.parentElement.append(bar);
    }
    bar.textContent = "";

    const me = acting();
    const amPayee = deal.stages.some((stage) => sameName(stage.payee, me));
    const refuse = (text) => typeof showRefusal === "function" && showRefusal("matrix-refusal-slot", text);
    const send = async (route) => {
      const answered = await request(`/deals/${deal.id}/${route}`, { method: "POST", body: JSON.stringify({ person: acting() }) });
      if (typeof loadDealDashboard === "function") await loadDealDashboard(deal.id);
      if (!answered.ok) refuse(answered.error);
    };

    if (deal.phase === "Review" || deal.phase === "Agree") {
      bar.append(make("span", `This deal is not locked yet. Waiting for ${waitingFor(deal)}.`, "text-sm text-muted"));
      bar.append(
        button("Continue in the builder", "btn btn-secondary btn-sm", async () => {
          state.wizardDeal = deal;
          const backdrop = document.getElementById("wizard-modal-backdrop");
          if (backdrop) backdrop.classList.remove("hidden");
          const pending = deal.members.filter((name) => !deal.agreed[name]);
          const step = deal.phase === "Review" ? 2 : pending.length ? 3 : 4;
          setWizardStep(step);
          [null, null, renderReviewStep, renderAgreeStep, renderLockStep][step]();
        })
      );
      return;
    }

    if (deal.stake > 0) {
      const status = Object.keys(deal.staked)
        .map((name) => `${name}: ${deal.left[name] ? "left, stake lost" : deal.staked[name] ? "stake in" : "stake pending"}`)
        .join(" · ");
      bar.append(make("span", `Stake ${rupees(deal.stake)} per payee. ${status}`, "text-sm text-muted"));
      if (deal.phase === "Funding" && ((amPayee && !deal.staked[me]) || page.tryAnything())) {
        bar.append(button(`Put in stake ${rupees(deal.stake)}`, "btn btn-primary btn-sm", () => send("stake")));
      }
      if (deal.phase === "Active" && (amPayee || page.tryAnything())) {
        bar.append(button("Leave the deal (lose the stake)", "btn btn-secondary btn-sm", () => send("leave")));
      }
    }
  }

  /** Runs `extra` after each call of one of the dashboard's own redraw functions. */
  function after(name, extra) {
    const original = window[name];
    if (typeof original !== "function") return;
    window[name] = function (...args) {
      const result = original.apply(this, args);
      try {
        extra();
      } catch (error) {
        console.error("Settl bridge:", error);
      }
      return result;
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    after("renderReviewStep", drawOpenPoints);
    after("renderLockStep", drawStakeRows);
    after("renderDealDashboard", drawDealExtras);
  });

  window.SettlBridge = { request };
})();
