const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { ethers } = require("ethers");

const hre = require("hardhat");
const { createApp } = require("../src/app");

const fixture = (name) => fs.readFileSync(path.join(__dirname, "..", "fixtures", name), "utf8");

/** Starts the API on a free port. `api.as(token)` sends requests with a wallet session. */
async function startApi(env = {}) {
  const storePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "settl-wallet-")), "store.json");
  const { app } = await createApp({ env, storePath });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const client = (token) => {
    const call = (method) => async (route, body) => {
      const response = await fetch(base + route, {
        method,
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: response.status, body: await response.json() };
    };
    return { get: call("GET"), post: call("POST"), put: call("PUT") };
  };
  return { base, ...client(), as: client, close: () => server.close() };
}

/** What a real wallet does to sign in: fetch the message, sign it, send the signature. */
async function signIn(api, wallet, name) {
  const { body } = await api.get(`/auth/message?address=${wallet.address}`);
  const signature = await wallet.signMessage(body.message);
  return api.post("/auth/sign-in", { address: wallet.address, signature, name });
}

describe("wallet sign-in", () => {
  let api;
  before(async () => {
    api = await startApi();
  });
  after(() => api.close());

  test("a new wallet signs in with a name and becomes a person with pretend funds", async () => {
    const wallet = ethers.Wallet.createRandom();
    const signedIn = await signIn(api, wallet, "Riya Sharma");

    assert.equal(signedIn.status, 200);
    assert.deepEqual(signedIn.body.person, { name: "Riya Sharma", kind: "wallet", address: wallet.address });
    assert.equal(await hre.ethers.provider.getBalance(wallet.address), hre.ethers.parseEther("10000"));

    const me = await api.as(signedIn.body.token).get("/auth/me");
    assert.equal(me.body.person.name, "Riya Sharma");
    const { people } = (await api.get("/people")).body;
    assert.ok(people.some((person) => person.name === "Riya Sharma" && person.kind === "wallet"));
  });

  test("the same wallet signs in again without a name and is the same person", async () => {
    const wallet = ethers.Wallet.createRandom();
    await signIn(api, wallet, "Aman Verma");
    const again = await signIn(api, wallet);
    assert.equal(again.status, 200);
    assert.equal(again.body.person.name, "Aman Verma");
  });

  test("a signature from a different wallet is refused", async () => {
    const owner = ethers.Wallet.createRandom();
    const thief = ethers.Wallet.createRandom();
    const { body } = await api.get(`/auth/message?address=${owner.address}`);
    const forged = await thief.signMessage(body.message);
    const result = await api.post("/auth/sign-in", { address: owner.address, signature: forged, name: "Owner" });
    assert.equal(result.status, 409);
    assert.equal(result.body.rule, "bad-signature");
  });

  test("a person added by wallet address signs in later as that person, and gets pretend funds then", async () => {
    const wallet = ethers.Wallet.createRandom();
    const added = await api.post("/people", { name: "Invited Ishaan", address: wallet.address });
    assert.equal(added.status, 201);
    assert.deepEqual(added.body.added, [{ name: "Invited Ishaan", kind: "wallet", address: wallet.address }]);
    assert.equal(await hre.ethers.provider.getBalance(wallet.address), 0n);

    // Being added gives nobody the power to act as them.
    const typed = await api.post("/deals/draft", { text: fixture("02-freelance-website.txt"), person: "Invited Ishaan" });
    assert.equal(typed.body.rule, "sign-in-required");

    const signedIn = await signIn(api, wallet);
    assert.equal(signedIn.status, 200);
    assert.equal(signedIn.body.person.name, "Invited Ishaan");
    assert.equal(await hre.ethers.provider.getBalance(wallet.address), hre.ethers.parseEther("10000"));
  });

  test("an address or a name can be added only once, and a built-in account never", async () => {
    const wallet = ethers.Wallet.createRandom();
    const [, , , , , , builtIn] = await hre.ethers.getSigners();
    assert.equal((await api.post("/people", { name: "First Farah", address: wallet.address })).status, 201);
    assert.equal((await api.post("/people", { name: "Second Farah", address: wallet.address })).body.rule, "address-in-use");
    assert.equal(
      (await api.post("/people", { name: "First Farah", address: ethers.Wallet.createRandom().address })).body.rule,
      "person-exists"
    );
    assert.equal((await api.post("/people", { name: "Not Real", address: "0x1234" })).status, 400);
    assert.equal((await api.post("/people", { name: "Built In", address: builtIn.address })).body.rule, "demo-account");
  });

  test("a sign-in message works once", async () => {
    const wallet = ethers.Wallet.createRandom();
    const { body } = await api.get(`/auth/message?address=${wallet.address}`);
    const signature = await wallet.signMessage(body.message);
    assert.equal((await api.post("/auth/sign-in", { address: wallet.address, signature, name: "Once" })).status, 200);
    const replay = await api.post("/auth/sign-in", { address: wallet.address, signature });
    assert.equal(replay.body.rule, "no-message");
  });

  test("a new wallet needs a name, and the name must be free", async () => {
    const wallet = ethers.Wallet.createRandom();
    assert.equal((await signIn(api, wallet)).body.rule, "name-needed");
    assert.equal((await signIn(api, wallet, "Platform Mediator")).body.rule, "name-taken");
    assert.equal((await signIn(api, wallet, "Meera Iyer")).status, 200);
  });

  test("a built-in demo account cannot be used as a personal wallet", async () => {
    const [, , , , , builtIn] = await hre.ethers.getSigners();
    const { body } = await api.get(`/auth/message?address=${builtIn.address}`);
    const signature = await builtIn.signMessage(body.message);
    const result = await api.post("/auth/sign-in", { address: builtIn.address, signature, name: "Sneaky" });
    assert.equal(result.body.rule, "demo-account");
  });

  test("nobody can act as a wallet person just by typing their name", async () => {
    const wallet = ethers.Wallet.createRandom();
    await signIn(api, wallet, "Kavya Nair");
    const attempt = await api.post("/deals/draft", { text: fixture("02-freelance-website.txt"), person: "Kavya Nair" });
    assert.equal(attempt.status, 409);
    assert.equal(attempt.body.rule, "sign-in-required");
  });

  test("a signed-in person cannot act as someone else", async () => {
    const wallet = ethers.Wallet.createRandom();
    const { token } = (await signIn(api, wallet, "Omar Khan")).body;
    await api.post("/people", { names: ["Demo Dev"] });

    const own = await api.as(token).post("/deals/draft", { text: fixture("02-freelance-website.txt") });
    assert.equal(own.status, 201);
    assert.equal(own.body.deal.organiser, "Omar Khan");

    const other = await api.as(token).post(`/deals/${own.body.deal.id}/confirm`, { person: "Demo Dev" });
    assert.equal(other.body.rule, "not-you");
  });

  test("a made-up or signed-out session is rejected", async () => {
    assert.equal((await api.as("not-a-real-token").get("/auth/me")).status, 401);

    const wallet = ethers.Wallet.createRandom();
    const { token } = (await signIn(api, wallet, "Tara Bose")).body;
    await api.as(token).post("/auth/sign-out");
    assert.equal((await api.as(token).get("/auth/me")).status, 401);
  });
});

describe("chain access for wallets (/rpc)", () => {
  let api;
  let provider;
  before(async () => {
    api = await startApi();
    provider = new ethers.JsonRpcProvider(`${api.base}/rpc`, undefined, { cacheTimeout: -1 });
  });
  after(() => {
    provider.destroy();
    api.close();
  });

  const rpc = async (method, params = []) => (await api.post("/rpc", { jsonrpc: "2.0", id: 1, method, params })).body;

  test("a wallet can read the chain through the server", async () => {
    assert.equal((await provider.getNetwork()).chainId, 31337n);
    assert.equal(typeof (await provider.getBlockNumber()), "number");
  });

  test("a wallet can send a transaction it signed itself", async () => {
    const sender = ethers.Wallet.createRandom().connect(provider);
    const receiver = ethers.Wallet.createRandom();
    await signIn(api, sender, "Sender With Funds");

    const sent = await sender.sendTransaction({ to: receiver.address, value: ethers.parseEther("1") });
    const receipt = await sent.wait();
    assert.equal(receipt.status, 1);
    assert.equal(await provider.getBalance(receiver.address), ethers.parseEther("1"));
  });

  test("the node will not sign with the demo accounts' keys for a caller", async () => {
    const [, demo] = await hre.ethers.getSigners();
    const receiver = ethers.Wallet.createRandom();

    const stolen = await rpc("eth_sendTransaction", [{ from: demo.address, to: receiver.address, value: "0xde0b6b3a7640000" }]);
    assert.equal(stolen.error.code, -32601);
    assert.equal(await provider.getBalance(receiver.address), 0n);

    assert.equal((await rpc("eth_sign", [demo.address, "0x1234"])).error.code, -32601);
    assert.deepEqual((await rpc("eth_accounts")).result, []);
  });

  test("a caller cannot rewrite the chain", async () => {
    const wallet = ethers.Wallet.createRandom();
    for (const method of ["hardhat_setBalance", "hardhat_impersonateAccount", "evm_increaseTime", "hardhat_reset", "debug_traceTransaction"]) {
      const reply = await rpc(method, [wallet.address, "0xffffffffffffffffff"]);
      assert.equal(reply.error.code, -32601, method);
    }
    assert.equal(await provider.getBalance(wallet.address), 0n);
  });

  test("a batch is answered in order, and a bad request is refused politely", async () => {
    const batch = await api.post("/rpc", [
      { jsonrpc: "2.0", id: 7, method: "eth_chainId" },
      { jsonrpc: "2.0", id: 8, method: "hardhat_reset" },
      { jsonrpc: "2.0", id: 9, method: "net_version" },
    ]);
    assert.deepEqual(batch.body.map((reply) => reply.id), [7, 8, 9]);
    assert.equal(batch.body[0].result, "0x7a69");
    assert.equal(batch.body[1].error.code, -32601);
    assert.equal(batch.body[2].result, "31337");

    assert.equal((await api.post("/rpc", { id: 1 })).body.error.code, -32600);
  });
});

describe("agreeing with a wallet signature", () => {
  let api;
  let riya;
  let aman;
  let meera;
  let id;
  let message;

  before(async () => {
    api = await startApi();
    // Three real wallets, named as in the freelance sample deal.
    [riya, aman, meera] = await Promise.all(
      ["Riya", "Aman", "Meera"].map(async (name) => {
        const wallet = ethers.Wallet.createRandom();
        const { token } = (await signIn(api, wallet, name)).body;
        return { wallet, token, as: api.as(token) };
      })
    );
    const draft = await riya.as.post("/deals/draft", { text: fixture("02-freelance-website.txt") });
    id = draft.body.deal.id;
    assert.deepEqual(draft.body.problems, []);
    const confirmed = await riya.as.post(`/deals/${id}/confirm`);
    message = confirmed.body.deal.agreementMessage;
  });
  after(() => api.close());

  test("the message to sign names the deal and carries its fingerprint", async () => {
    const { deal } = (await api.get(`/deals/${id}`)).body;
    assert.ok(message.includes(`Deal: ${id}`));
    assert.ok(message.includes(`Fingerprint: ${deal.agreementHash}`));
    assert.deepEqual(deal.signatures, []);
  });

  test("agreeing without a signature is refused, and the reply says what to sign", async () => {
    const result = await aman.as.post(`/deals/${id}/agree`);
    assert.equal(result.status, 409);
    assert.equal(result.body.rule, "bad-signature");
    assert.equal(result.body.message, message);
  });

  test("a signature by someone else, or over other words, is refused", async () => {
    const byMeera = await meera.wallet.signMessage(message);
    assert.equal((await aman.as.post(`/deals/${id}/agree`, { signature: byMeera })).body.rule, "bad-signature");

    const otherWords = await aman.wallet.signMessage(message.replace(id, "deal-999"));
    assert.equal((await aman.as.post(`/deals/${id}/agree`, { signature: otherWords })).body.rule, "bad-signature");
    assert.equal((await aman.as.post(`/deals/${id}/agree`, { signature: "0x1234" })).body.rule, "bad-signature");
  });

  test("each member agrees by signing, and every signature can be checked by anyone", async () => {
    for (const member of [riya, aman, meera]) {
      const signature = await member.wallet.signMessage(message);
      assert.equal((await member.as.post(`/deals/${id}/agree`, { signature })).status, 200);
    }

    const { deal } = (await api.get(`/deals/${id}`)).body;
    assert.equal(deal.status, "agreed");
    assert.deepEqual(deal.signatures.map((entry) => entry.name), ["Riya", "Aman", "Meera"]);
    for (const entry of deal.signatures) {
      assert.equal(ethers.verifyMessage(deal.agreementMessage, entry.signature), entry.address);
    }
    assert.deepEqual(deal.signatures.map((entry) => entry.address), [riya, aman, meera].map((member) => member.wallet.address));
  });

  test("editing the checklist throws the signatures away", async () => {
    const { deal } = (await api.get(`/deals/${id}`)).body;
    const edited = await riya.as.put(`/deals/${id}/checklist`, { checklist: { ...deal.checklist, title: "Website, revised" } });
    assert.deepEqual(edited.body.deal.signatures, []);
    assert.equal(edited.body.deal.agreementMessage, null);

    // The old signature does not fit the new fingerprint.
    const reconfirmed = await riya.as.post(`/deals/${id}/confirm`);
    assert.notEqual(reconfirmed.body.deal.agreementMessage, message);
    const stale = await aman.wallet.signMessage(message);
    assert.equal((await aman.as.post(`/deals/${id}/agree`, { signature: stale })).body.rule, "bad-signature");
  });

  test("a demo person's agreement is signed by the account the server holds for them", async () => {
    await api.post("/people", { names: ["Sunita", "Gopal", "Hema"] });
    const draft = await api.post("/deals/draft", { text: fixture("05-kitchen-stake.txt"), person: "Sunita" });
    const dealId = draft.body.deal.id;
    await api.post(`/deals/${dealId}/confirm`, { person: "Sunita" });
    const agreed = await api.post(`/deals/${dealId}/agree`, { person: "Gopal" });

    const [entry] = agreed.body.deal.signatures;
    assert.equal(entry.name, "Gopal");
    assert.equal(ethers.verifyMessage(agreed.body.deal.agreementMessage, entry.signature), entry.address);
  });
});

describe("a deal run entirely from three people's own wallets", () => {
  const RUPEE = 10n ** 15n;
  let api;
  let provider;
  let riya;
  let aman;
  let meera;
  let id;

  /**
   * What the wallet page does for every action: ask the server, and if it hands
   * back a transaction, sign and send it from the person's own wallet, then
   * report the hash.
   */
  async function act(member, route, body) {
    const asked = await member.as.post(`/deals/${id}${route}`, body);
    if (!asked.body.needsWallet) return asked;
    const sent = await member.wallet.sendTransaction(asked.body.transaction);
    await sent.wait();
    return member.as.post(`/deals/${id}/transactions`, { hash: sent.hash });
  }

  before(async () => {
    api = await startApi();
    provider = new ethers.JsonRpcProvider(`${api.base}/rpc`, undefined, { cacheTimeout: -1 });
    [riya, aman, meera] = await Promise.all(
      ["Riya", "Aman", "Meera"].map(async (name) => {
        const wallet = ethers.Wallet.createRandom().connect(provider);
        const { token } = (await signIn(api, wallet, name)).body;
        return { wallet, token, as: api.as(token) };
      })
    );
    const draft = await riya.as.post("/deals/draft", { text: fixture("02-freelance-website.txt") });
    id = draft.body.deal.id;
    const { deal } = (await riya.as.post(`/deals/${id}/confirm`)).body;
    for (const member of [riya, aman, meera]) {
      await member.as.post(`/deals/${id}/agree`, { signature: await member.wallet.signMessage(deal.agreementMessage) });
    }
  });
  after(() => {
    provider.destroy();
    api.close();
  });

  test("locking hands the organiser the transaction that creates the vault, and changes nothing itself", async () => {
    const asked = await riya.as.post(`/deals/${id}/lock`);
    assert.equal(asked.status, 200);
    assert.equal(asked.body.needsWallet, true);
    assert.equal(asked.body.transaction.to, undefined);
    assert.equal(asked.body.transaction.chainId, 31337);
    assert.equal((await api.get(`/deals/${id}`)).body.deal.status, "agreed");
  });

  test("a creation sent by someone else, or a transaction that creates nothing, does not lock the deal", async () => {
    const { transaction } = (await riya.as.post(`/deals/${id}/lock`)).body;
    const byAman = await aman.wallet.sendTransaction(transaction);
    await byAman.wait();
    assert.equal((await aman.as.post(`/deals/${id}/transactions`, { hash: byAman.hash })).body.rule, "not-organiser");
    assert.equal((await riya.as.post(`/deals/${id}/transactions`, { hash: byAman.hash })).body.rule, "not-this-deal");

    const transfer = await riya.wallet.sendTransaction({ to: aman.wallet.address, value: 1n });
    await transfer.wait();
    assert.equal((await riya.as.post(`/deals/${id}/transactions`, { hash: transfer.hash })).body.rule, "not-this-deal");
    assert.equal((await api.get(`/deals/${id}`)).body.deal.status, "agreed");
  });

  test("the organiser's own wallet creates the vault, and it holds exactly the agreed terms", async () => {
    const locked = await act(riya, "/lock");
    assert.equal(locked.status, 201);
    const { deal } = locked.body;
    assert.equal(deal.status, "locked");

    const vault = new ethers.Contract(deal.vaultAddress, (await api.get("/contract")).body.abi, provider);
    assert.equal(await vault.agreementHash(), deal.agreementHash);
    assert.deepEqual([...(await vault.getPayers())], [riya.wallet.address]);
    assert.deepEqual([...(await vault.getPayees())], [aman.wallet.address]);
    assert.equal(await vault.judge(), meera.wallet.address);

    const { history } = (await api.get(`/deals/${id}/history`)).body;
    const lock = history.find((entry) => entry.action === "lock" && entry.result === "accepted");
    assert.equal(lock.via, "wallet");
    assert.equal(lock.person, "Riya");
  });

  test("the same creation cannot lock the deal twice", async () => {
    const { history } = (await api.get(`/deals/${id}/history`)).body;
    const { tx } = history.find((entry) => entry.action === "lock" && entry.result === "accepted");
    assert.equal((await riya.as.post(`/deals/${id}/lock`)).body.rule, "already-locked");
    assert.equal((await riya.as.post(`/deals/${id}/transactions`, { hash: tx })).body.rule, "not-your-transaction");
  });

  test("the server hands back a transaction to sign and changes nothing itself", async () => {
    const asked = await riya.as.post(`/deals/${id}/deposit`);
    assert.equal(asked.status, 200);
    assert.equal(asked.body.needsWallet, true);
    assert.equal(asked.body.accepted, false);

    const { deal } = (await api.get(`/deals/${id}`)).body;
    assert.equal(asked.body.transaction.to, deal.vaultAddress);
    assert.equal(BigInt(asked.body.transaction.value), 30000n * RUPEE);
    assert.equal(asked.body.transaction.chainId, 31337);
    // Asking is not paying: the vault is still empty and waiting.
    assert.equal(deal.phase, "Funding");
    assert.equal(deal.money.inVault, 0);
  });

  test("the payer's own wallet makes the deposit", async () => {
    const before = await provider.getBalance(riya.wallet.address);
    const deposited = await act(riya, "/deposit");

    assert.equal(deposited.body.accepted, true);
    assert.equal(deposited.body.deal.phase, "Active");
    assert.equal(deposited.body.deal.money.locked, 30000);
    // The money really left her wallet: the deposit plus a little gas.
    const spent = before - (await provider.getBalance(riya.wallet.address));
    assert.ok(spent >= 30000n * RUPEE && spent < 30001n * RUPEE, `spent ${spent}`);
  });

  test("a refusal is known before any wallet is opened, and is written to the history", async () => {
    const wrongPerson = await aman.as.post(`/deals/${id}/stages/1/approve`);
    assert.equal(wrongPerson.status, 409);
    assert.equal(wrongPerson.body.rule, "NotPayer");

    const tooEarly = await riya.as.post(`/deals/${id}/stages/1/approve`);
    assert.equal(tooEarly.body.reason, "This stage has not been marked done yet.");

    const { history } = (await api.get(`/deals/${id}/history`)).body;
    assert.ok(history.some((entry) => entry.result === "refused" && entry.person === "Aman" && entry.rule === "NotPayer"));
  });

  test("each person carries out their own step from their own wallet", async () => {
    assert.equal((await act(aman, "/stages/1/complete")).body.deal.stages[0].state, "Completed");
    const approved = await act(riya, "/stages/1/approve");
    assert.equal(approved.body.deal.stages[0].state, "Released");

    const before = await provider.getBalance(aman.wallet.address);
    const withdrawn = await act(aman, "/withdraw");
    assert.equal(withdrawn.body.deal.money.paidOut, 10000);
    const gained = (await provider.getBalance(aman.wallet.address)) - before;
    assert.ok(gained > 9999n * RUPEE && gained <= 10000n * RUPEE, `gained ${gained}`);
  });

  test("a dispute is settled from the judge's wallet, and nobody else's", async () => {
    await act(aman, "/stages/2/complete");
    await act(riya, "/stages/2/dispute");
    assert.equal((await riya.as.post(`/deals/${id}/stages/2/resolve`, { decision: "refund" })).body.rule, "NotJudge");

    const settled = await act(meera, "/stages/2/resolve", { decision: "refund" });
    assert.equal(settled.body.deal.stages[1].state, "Refunded");
    assert.equal(settled.body.deal.people.find((person) => person.name === "Riya").canWithdraw, 15000);
  });

  test("a transaction can only be reported by the person who sent it", async () => {
    const { history } = (await api.get(`/deals/${id}/history`)).body;
    const amansHash = history.find((entry) => entry.person === "Aman" && entry.tx).tx;

    // Riya cannot claim Aman's transaction as hers. Reporting it again as Aman changes nothing.
    assert.equal((await riya.as.post(`/deals/${id}/transactions`, { hash: amansHash })).body.rule, "not-your-transaction");
    assert.equal((await aman.as.post(`/deals/${id}/transactions`, { hash: amansHash })).body.alreadyRecorded, true);
    assert.equal((await aman.as.post(`/deals/${id}/transactions`, { hash: `0x${"ab".repeat(32)}` })).body.rule, "unknown-transaction");
    assert.equal((await aman.as.post(`/deals/${id}/transactions`, { hash: "nonsense" })).status, 400);
  });

  test("a wallet can also call the vault directly; the chain, not the server, is the record", async () => {
    const { abi } = (await api.get("/contract")).body;
    const { deal } = (await api.get(`/deals/${id}`)).body;
    const vault = new ethers.Contract(deal.vaultAddress, abi, aman.wallet);

    // Aman marks stage 3 done without asking the server anything.
    await (await vault.markComplete(2)).wait();
    assert.equal((await api.get(`/deals/${id}`)).body.deal.stages[2].state, "Completed");

    // The contract's rules hold there too: Aman cannot approve his own stage.
    await assert.rejects(vault.approve(2));
  });

  test("the deal closes and the settlement adds up, with wallet actions in the history", async () => {
    await act(riya, "/stages/3/approve");
    await act(riya, "/withdraw");
    const last = await act(aman, "/withdraw");
    assert.equal(last.body.deal.phase, "Closed");
    assert.equal(last.body.deal.money.inVault, 0);

    const { summary } = (await api.get(`/deals/${id}/summary`)).body;
    assert.equal(summary.addsUp, true);
    assert.deepEqual(
      Object.fromEntries(summary.people.map((person) => [person.name, person.withdrawn])),
      { Riya: 15000, Aman: 15000 }
    );

    const { history } = (await api.get(`/deals/${id}/history`)).body;
    const byWallet = history.filter((entry) => entry.via === "wallet");
    assert.ok(byWallet.length >= 8);
    assert.ok(byWallet.every((entry) => entry.result === "accepted" && /^0x[0-9a-f]{64}$/.test(entry.tx)));
    assert.ok(byWallet.some((entry) => entry.action === "complete" && entry.stage === 1 && entry.person === "Aman"));
  });
});

describe("wallet people and demo people in one deal", () => {
  let api;
  let provider;
  before(async () => {
    api = await startApi();
    provider = new ethers.JsonRpcProvider(`${api.base}/rpc`, undefined, { cacheTimeout: -1 });
  });
  after(() => {
    provider.destroy();
    api.close();
  });

  test("a wallet payer and server-held demo accounts complete a staked deal together", async () => {
    // Sunita is a real wallet. Gopal and Hema are demo people.
    const wallet = ethers.Wallet.createRandom().connect(provider);
    const sunita = api.as((await signIn(api, wallet, "Sunita")).body.token);
    await api.post("/people", { names: ["Gopal", "Hema"] });

    const draft = await sunita.post("/deals/draft", { text: fixture("05-kitchen-stake.txt") });
    const id = draft.body.deal.id;
    const { deal } = (await sunita.post(`/deals/${id}/confirm`)).body;
    await sunita.post(`/deals/${id}/agree`, { signature: await wallet.signMessage(deal.agreementMessage) });
    await api.post(`/deals/${id}/agree`, { person: "Gopal" });
    await api.post(`/deals/${id}/agree`, { person: "Hema" });
    const creation = await wallet.sendTransaction((await sunita.post(`/deals/${id}/lock`)).body.transaction);
    await creation.wait();
    assert.equal((await sunita.post(`/deals/${id}/transactions`, { hash: creation.hash })).status, 201);

    const asked = await sunita.post(`/deals/${id}/deposit`);
    const sent = await wallet.sendTransaction(asked.body.transaction);
    await sent.wait();
    await sunita.post(`/deals/${id}/transactions`, { hash: sent.hash });

    const staked = await api.post(`/deals/${id}/stake`, { person: "Gopal" });
    assert.equal(staked.body.accepted, true);
    assert.equal(staked.body.deal.phase, "Active");
    assert.equal(staked.body.deal.money.locked, 55000);
  });
});

describe("wallet-only mode (REQUIRE_WALLET=true)", () => {
  let api;
  before(async () => {
    api = await startApi({ REQUIRE_WALLET: "true" });
  });
  after(() => api.close());

  test("there are no demo people, and none can be added", async () => {
    assert.deepEqual((await api.get("/people")).body.people, []);
    const added = await api.post("/people", { names: ["Riya"] });
    assert.equal(added.status, 409);
    assert.equal(added.body.rule, "wallet-only");
  });

  test("every action needs a wallet session", async () => {
    const anonymous = await api.post("/deals/draft", { text: fixture("02-freelance-website.txt"), person: "Riya" });
    assert.equal(anonymous.status, 401);

    const wallet = ethers.Wallet.createRandom();
    const { token } = (await signIn(api, wallet, "Riya")).body;
    const draft = await api.as(token).post("/deals/draft", { text: fixture("02-freelance-website.txt") });
    assert.equal(draft.status, 201);
    assert.equal(draft.body.deal.organiser, "Riya");
  });
});
