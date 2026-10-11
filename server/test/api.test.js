const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createApp } = require("../src/app");
const { fingerprint } = require("../src/deals");
const chain = require("../src/chain");

const fixture = (name) => fs.readFileSync(path.join(__dirname, "..", "fixtures", name), "utf8");

/** Starts the API on a free port with the offline reader and a throwaway store. */
async function startApi() {
  const storePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "settl-")), "store.json");
  const { app } = await createApp({ env: {}, storePath });
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (method) => async (route, body) => {
    const response = await fetch(base + route, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, body: await response.json() };
  };
  return { get: call("GET"), post: call("POST"), put: call("PUT"), close: () => server.close() };
}

/** Takes a deal from text to "everyone has agreed", and returns its id. */
async function agreedDeal(api, { text, organiser, people }) {
  await api.post("/people", { names: people });
  const draft = await api.post("/deals/draft", { text, person: organiser });
  assert.equal(draft.status, 201);
  const id = draft.body.deal.id;
  assert.equal((await api.post(`/deals/${id}/confirm`, { person: organiser })).status, 200);
  for (const person of draft.body.deal.members) {
    assert.equal((await api.post(`/deals/${id}/agree`, { person })).status, 200);
  }
  return id;
}

const FREELANCE = { text: fixture("02-freelance-website.txt"), organiser: "Riya", people: ["Riya", "Aman", "Meera", "Zed"] };
const FLATMATES = {
  text: fixture("01-flatmates-wifi.txt"),
  organiser: "Asha",
  people: ["Asha", "Bilal", "Chitra", "QuickNet Broadband", "Mrs. Kulkarni"],
};

describe("before the lock", () => {
  let api;
  before(async () => {
    api = await startApi();
  });
  after(() => api.close());

  test("the server and its chain are up, with a neutral judge ready", async () => {
    const health = await api.get("/health");
    assert.equal(health.body.ok, true);
    assert.equal(health.body.funds, "simulated");
    const people = await api.get("/people");
    assert.deepEqual(people.body.people.map((person) => person.name), ["Platform Mediator"]);
  });

  test("a draft says which reader produced it and what is still wrong", async () => {
    await api.post("/people", { names: ["Riya"] });
    const draft = await api.post("/deals/draft", { text: FREELANCE.text, person: "Riya" });

    assert.equal(draft.body.deal.status, "draft");
    assert.equal(draft.body.deal.readBy, "rules");
    assert.equal(draft.body.deal.fallbackReason, "No model key is configured.");
    assert.equal(draft.body.deal.checklist.stages.length, 3);
    // Aman and Meera have not been added yet, so the checklist cannot be confirmed.
    assert.deepEqual(draft.body.problems.map((problem) => problem.code), ["unknown-person", "unknown-person"]);

    const confirm = await api.post(`/deals/${draft.body.deal.id}/confirm`, { person: "Riya" });
    assert.equal(confirm.status, 409);
    assert.equal(confirm.body.rule, "open-problems");
  });

  test("only the organiser can confirm, and nobody can agree before that", async () => {
    await api.post("/people", { names: ["Aman", "Meera"] });
    const draft = await api.post("/deals/draft", { text: FREELANCE.text, person: "Riya" });
    const id = draft.body.deal.id;

    assert.equal((await api.post(`/deals/${id}/agree`, { person: "Aman" })).body.rule, "not-confirmed");
    assert.equal((await api.post(`/deals/${id}/confirm`, { person: "Aman" })).body.rule, "not-organiser");
    assert.equal((await api.post(`/deals/${id}/confirm`, { person: "Riya" })).status, 200);
  });

  test("the lock is refused until every member has agreed", async () => {
    const draft = await api.post("/deals/draft", { text: FREELANCE.text, person: "Riya" });
    const id = draft.body.deal.id;
    await api.post(`/deals/${id}/confirm`, { person: "Riya" });
    await api.post(`/deals/${id}/agree`, { person: "Riya" });

    const early = await api.post(`/deals/${id}/lock`, { person: "Riya" });
    assert.equal(early.status, 409);
    assert.equal(early.body.rule, "not-agreed");
    assert.deepEqual(early.body.waitingFor, ["Aman", "Meera"]);

    await api.post("/people", { names: ["Zed"] });
    assert.equal((await api.post(`/deals/${id}/agree`, { person: "Zed" })).body.rule, "not-a-member");
    assert.equal((await api.post(`/deals/${id}/agree`, { person: "Riya" })).body.rule, "already-agreed");

    await api.post(`/deals/${id}/agree`, { person: "Aman" });
    await api.post(`/deals/${id}/agree`, { person: "Meera" });
    assert.equal((await api.post(`/deals/${id}/lock`, { person: "Aman" })).body.rule, "not-organiser");
    assert.equal((await api.post(`/deals/${id}/lock`, { person: "Riya" })).status, 201);
  });

  test("editing the checklist clears every agreement", async () => {
    const draft = await api.post("/deals/draft", { text: FREELANCE.text, person: "Riya" });
    const id = draft.body.deal.id;
    await api.post(`/deals/${id}/confirm`, { person: "Riya" });
    await api.post(`/deals/${id}/agree`, { person: "Aman" });

    const edited = { ...draft.body.deal.checklist, title: "Website for the shop" };
    const edit = await api.put(`/deals/${id}/checklist`, { person: "Riya", checklist: edited });
    assert.equal(edit.body.deal.status, "draft");
    assert.deepEqual(edit.body.deal.agreed, []);
    assert.equal(edit.body.deal.agreementHash, null);
    assert.equal(edit.body.deal.title, "Website for the shop");
  });

  test("an edit that breaks the rules cannot be confirmed", async () => {
    const draft = await api.post("/deals/draft", { text: FREELANCE.text, person: "Riya" });
    const id = draft.body.deal.id;

    const selfJudged = { ...draft.body.deal.checklist, judge: { name: "Riya" } };
    const edit = await api.put(`/deals/${id}/checklist`, { person: "Riya", checklist: selfJudged });
    assert.ok(edit.body.problems.some((problem) => problem.code === "judge-is-payer"));

    const confirm = await api.post(`/deals/${id}/confirm`, { person: "Riya" });
    assert.equal(confirm.status, 409);
    assert.ok(confirm.body.problems.some((problem) => problem.code === "judge-is-payer"));
  });

  test("a deal with unclear wording cannot be confirmed until it is resolved", async () => {
    const text = "Riya pays ₹20,000 for a logo. Aman is paid ₹20,000 when the work is satisfactory. Meera settles any dispute.";
    const draft = await api.post("/deals/draft", { text, person: "Riya" });
    const id = draft.body.deal.id;
    assert.deepEqual(draft.body.deal.checklist.unclear.map((item) => item.source), ["satisfactory"]);
    assert.equal((await api.post(`/deals/${id}/confirm`, { person: "Riya" })).body.rule, "open-problems");

    // The organiser replaces the vague condition and clears the unclear point.
    const resolved = draft.body.deal.checklist;
    resolved.stages[0].condition = "Riya receives the logo as SVG and PNG files";
    resolved.unclear = [];
    await api.put(`/deals/${id}/checklist`, { person: "Riya", checklist: resolved });
    assert.equal((await api.post(`/deals/${id}/confirm`, { person: "Riya" })).status, 200);
  });
});

describe("a freelance deal from text to final payout", () => {
  let api;
  let id;
  const act = (route, body) => api.post(`/deals/${id}${route}`, body);

  before(async () => {
    api = await startApi();
    id = await agreedDeal(api, FREELANCE);
  });
  after(() => api.close());

  test("no money can move before the lock", async () => {
    const early = await act("/deposit", { person: "Riya" });
    assert.equal(early.status, 409);
    assert.equal(early.body.rule, "not-locked");
  });

  test("the vault is created from the confirmed checklist and carries its fingerprint", async () => {
    const lock = await act("/lock", { person: "Riya" });
    assert.equal(lock.status, 201);
    const deal = lock.body.deal;
    assert.equal(deal.phase, "Funding");

    const vault = await chain.readVault(deal.vaultAddress);
    assert.equal(vault.agreementHash, deal.agreementHash);
    assert.equal(vault.agreementHash, fingerprint(deal.text, deal.checklist));
    assert.deepEqual(vault.stages.map((stage) => stage.amount), [10000, 15000, 5000]);
  });

  test("only the payer can fund it, and work cannot start before that", async () => {
    assert.equal((await act("/deposit", { person: "Aman" })).body.rule, "NotPayer");
    assert.equal((await act("/stages/1/complete", { person: "Aman" })).body.rule, "WrongPhase");

    const deposit = await act("/deposit", { person: "Riya" });
    assert.equal(deposit.body.deal.phase, "Active");
    assert.equal(deposit.body.deal.money.locked, 30000);
  });

  test("a stage is paid only after it is done and approved by the payer", async () => {
    assert.equal((await act("/stages/1/approve", { person: "Riya" })).body.rule, "WrongState");
    assert.equal((await act("/stages/1/complete", { person: "Riya" })).body.rule, "NotPayee");
    assert.equal((await act("/stages/1/complete", { person: "Aman" })).status, 200);
    assert.equal((await act("/stages/1/approve", { person: "Aman" })).body.rule, "NotPayer");

    const approved = await act("/stages/1/approve", { person: "Riya" });
    assert.equal(approved.body.deal.stages[0].state, "Released");
    assert.equal(approved.body.deal.money.waitingToBeWithdrawn, 10000);
    assert.equal(approved.body.deal.people.find((person) => person.name === "Aman").canWithdraw, 10000);

    assert.equal((await act("/stages/1/approve", { person: "Riya" })).body.reason, "This stage has already been paid.");
    assert.equal((await act("/withdraw", { person: "Aman" })).body.deal.money.paidOut, 10000);
    assert.equal((await act("/withdraw", { person: "Aman" })).body.rule, "NothingOwed");
  });

  test("a dispute goes to the judge, and only the judge can settle it", async () => {
    await act("/stages/2/complete", { person: "Aman" });
    const disputed = await act("/stages/2/dispute", { person: "Riya" });
    assert.equal(disputed.body.deal.stages[1].state, "Disputed");
    assert.equal(disputed.body.deal.stages[1].waitingFor, "Meera");

    assert.equal((await act("/stages/2/resolve", { person: "Riya", decision: "refund" })).body.rule, "NotJudge");
    assert.equal((await act("/stages/2/resolve", { person: "Aman", decision: "pay" })).body.rule, "NotJudge");
    assert.equal((await act("/stages/2/resolve", { person: "Meera", decision: "maybe" })).status, 400);

    const refunded = await act("/stages/2/resolve", { person: "Meera", decision: "refund" });
    assert.equal(refunded.body.deal.stages[1].state, "Refunded");
    assert.equal(refunded.body.deal.people.find((person) => person.name === "Riya").canWithdraw, 15000);
    assert.equal(refunded.body.deal.people.find((person) => person.name === "Meera").canWithdraw, 0);
  });

  test("the deal closes when the last stage is settled, and the money adds up", async () => {
    await act("/stages/3/complete", { person: "Aman" });
    await act("/stages/3/dispute", { person: "Riya" });
    const closed = await act("/stages/3/resolve", { person: "Meera", decision: "pay" });
    assert.equal(closed.body.deal.phase, "Closed");

    await act("/withdraw", { person: "Riya" });
    const last = await act("/withdraw", { person: "Aman" });
    assert.deepEqual(last.body.deal.money, {
      inVault: 0,
      locked: 0,
      waitingToBeWithdrawn: 0,
      paidOut: 30000,
      deposited: 30000,
      reconciles: true,
    });

    const { summary } = (await api.get(`/deals/${id}/summary`)).body;
    assert.equal(summary.finished, true);
    assert.equal(summary.addsUp, true);
    assert.deepEqual(summary.stages.map((stage) => stage.outcome), ["paid on approval", "refunded by the judge", "paid by the judge"]);
    assert.deepEqual(
      Object.fromEntries(summary.people.map((person) => [person.name, [person.paidIn, person.earned, person.refunded, person.withdrawn]])),
      { Riya: [30000, 0, 15000, 15000], Aman: [0, 15000, 0, 15000] }
    );
    assert.equal(summary.totals.deposited, summary.totals.paidToPayees + summary.totals.returnedToPayers);
  });

  test("the history holds every accepted action and every refused attempt", async () => {
    const { history } = (await api.get(`/deals/${id}/history`)).body;
    const refused = history.filter((entry) => entry.result === "refused");
    const accepted = history.filter((entry) => entry.result === "accepted");

    assert.ok(accepted.some((entry) => entry.action === "lock" && entry.person === "Riya"));
    assert.ok(accepted.some((entry) => entry.action === "approve" && entry.stage === 1 && entry.tx));
    // Before the lock: a refusal decided by the server.
    assert.ok(refused.some((entry) => entry.action === "deposit" && entry.rule === "not-locked"));
    // After the lock: refusals decided by the contract, for the wrong person and the wrong moment.
    assert.ok(refused.some((entry) => entry.person === "Aman" && entry.action === "deposit" && entry.rule === "NotPayer"));
    assert.ok(refused.some((entry) => entry.person === "Riya" && entry.action === "resolve" && entry.stage === 2 && entry.rule === "NotJudge"));
    assert.ok(refused.every((entry) => entry.reason && entry.time));
  });

  test("the deal list shows it as closed with every stage settled", async () => {
    const { deals } = (await api.get("/deals")).body;
    const row = deals.find((deal) => deal.id === id);
    assert.equal(row.phase, "Closed");
    assert.equal(row.stagesSettled, 3);
    assert.equal(row.total, 30000);
  });
});

describe("a deal shared by three payers", () => {
  let api;
  before(async () => {
    api = await startApi();
  });
  after(() => api.close());

  test("starts only when all three have paid, and releases on two approvals", async () => {
    const id = await agreedDeal(api, FLATMATES);
    const act = (route, body) => api.post(`/deals/${id}${route}`, body);
    await act("/lock", { person: "Asha" });

    await act("/deposit", { person: "Asha" });
    assert.equal((await act("/deposit", { person: "Bilal" })).body.deal.phase, "Funding");
    assert.equal((await act("/deposit", { person: "Asha" })).body.rule, "AlreadyDeposited");
    assert.equal((await act("/deposit", { person: "Chitra" })).body.deal.phase, "Active");

    await act("/stages/1/complete", { person: "QuickNet Broadband" });
    const first = await act("/stages/1/approve", { person: "Asha" });
    assert.equal(first.body.deal.stages[0].state, "Completed");
    assert.equal(first.body.deal.stages[0].approvals, 1);
    assert.equal(first.body.deal.stages[0].approvalsNeeded, 2);
    assert.equal((await act("/stages/1/approve", { person: "Asha" })).body.rule, "AlreadyApproved");

    const second = await act("/stages/1/approve", { person: "Chitra" });
    assert.equal(second.body.deal.stages[0].state, "Released");
    assert.equal((await act("/withdraw", { person: "QuickNet Broadband" })).body.deal.money.paidOut, 1200);
  });

  test("returns deposits when a payer cancels before the deal starts", async () => {
    const id = await agreedDeal(api, FLATMATES);
    const act = (route, body) => api.post(`/deals/${id}${route}`, body);
    await act("/lock", { person: "Asha" });
    await act("/deposit", { person: "Asha" });
    await act("/deposit", { person: "Bilal" });

    const cancelled = await act("/cancel", { person: "Chitra" });
    assert.equal(cancelled.body.deal.phase, "Cancelled");
    assert.equal(cancelled.body.deal.money.waitingToBeWithdrawn, 9600);
    assert.equal((await act("/stages/1/complete", { person: "QuickNet Broadband" })).body.rule, "WrongPhase");

    await act("/withdraw", { person: "Asha" });
    const last = await act("/withdraw", { person: "Bilal" });
    assert.equal(last.body.deal.money.inVault, 0);
    const { summary } = (await api.get(`/deals/${id}/summary`)).body;
    assert.equal(summary.finished, true);
    assert.equal(summary.addsUp, true);
    assert.equal(summary.totals.returnedToPayers, 9600);
  });
});

describe("a deal with a payee stake", () => {
  const KITCHEN = { text: fixture("05-kitchen-stake.txt"), organiser: "Sunita", people: ["Sunita", "Gopal", "Hema"] };
  let api;
  before(async () => {
    api = await startApi();
  });
  after(() => api.close());

  test("starts only after the payee stakes, and returns the stake at the close", async () => {
    const id = await agreedDeal(api, KITCHEN);
    const act = (route, body) => api.post(`/deals/${id}${route}`, body);
    const locked = await act("/lock", { person: "Sunita" });
    assert.equal(locked.body.deal.stake, 5000);

    assert.equal((await act("/deposit", { person: "Sunita" })).body.deal.phase, "Funding");
    assert.equal((await act("/stages/1/complete", { person: "Gopal" })).body.rule, "WrongPhase");
    assert.equal((await act("/stake", { person: "Sunita" })).body.rule, "NotPayee");

    const staked = await act("/stake", { person: "Gopal" });
    assert.equal(staked.body.deal.phase, "Active");
    assert.equal(staked.body.deal.money.locked, 55000);
    assert.equal(staked.body.deal.people.find((person) => person.name === "Gopal").staked, true);
    assert.equal((await act("/stake", { person: "Gopal" })).body.rule, "WrongPhase");

    for (const stage of [1, 2]) {
      await act(`/stages/${stage}/complete`, { person: "Gopal" });
      await act(`/stages/${stage}/approve`, { person: "Sunita" });
    }
    assert.equal((await act("/leave", { person: "Gopal" })).body.rule, "WrongPhase");
    const paid = await act("/withdraw", { person: "Gopal" });
    assert.equal(paid.body.deal.money.paidOut, 55000);

    const { summary } = (await api.get(`/deals/${id}/summary`)).body;
    const gopal = summary.people.find((person) => person.name === "Gopal");
    assert.deepEqual([gopal.earned, gopal.staked, gopal.stakeBack, gopal.stakeLost, gopal.withdrawn], [50000, 5000, 5000, 0, 55000]);
    assert.equal(summary.addsUp, true);
  });

  test("gives the stake to the payer when the payee walks away", async () => {
    const id = await agreedDeal(api, KITCHEN);
    const act = (route, body) => api.post(`/deals/${id}${route}`, body);
    await act("/lock", { person: "Sunita" });
    await act("/deposit", { person: "Sunita" });
    await act("/stake", { person: "Gopal" });
    await act("/stages/1/complete", { person: "Gopal" });
    await act("/stages/1/approve", { person: "Sunita" });

    assert.equal((await act("/leave", { person: "Sunita" })).body.rule, "NotPayee");
    const left = await act("/leave", { person: "Gopal" });
    assert.equal(left.status, 200);
    assert.equal(left.body.deal.phase, "Closed");
    assert.equal(left.body.deal.stages[1].state, "Refunded");
    assert.equal(left.body.deal.people.find((person) => person.name === "Gopal").left, true);
    assert.equal(left.body.deal.people.find((person) => person.name === "Sunita").canWithdraw, 35000);
    assert.equal(left.body.deal.people.find((person) => person.name === "Gopal").canWithdraw, 20000);
    assert.equal((await act("/leave", { person: "Gopal" })).body.rule, "WrongPhase");

    await act("/withdraw", { person: "Sunita" });
    await act("/withdraw", { person: "Gopal" });
    const { summary } = (await api.get(`/deals/${id}/summary`)).body;
    const figures = Object.fromEntries(summary.people.map((person) => [person.name, person]));
    assert.equal(figures.Gopal.stakeLost, 5000);
    assert.equal(figures.Gopal.withdrawn, 20000);
    assert.equal(figures.Sunita.fromStakes, 5000);
    assert.equal(figures.Sunita.withdrawn, 35000);
    assert.equal(summary.totals.stakesForfeited, 5000);
    assert.equal(summary.totals.stillInVault, 0);
    assert.equal(summary.addsUp, true);
  });

  test("a deal without a stake has no stake or leave step", async () => {
    const id = await agreedDeal(api, { ...FREELANCE, people: ["Riya", "Aman", "Meera"] });
    const act = (route, body) => api.post(`/deals/${id}${route}`, body);
    await act("/lock", { person: "Riya" });
    assert.equal((await act("/stake", { person: "Aman" })).body.rule, "StakeNotRequired");
    await act("/deposit", { person: "Riya" });
    assert.equal((await act("/leave", { person: "Aman" })).body.rule, "StakeNotRequired");
  });
});

describe("attack lab", () => {
  let api;
  before(async () => {
    api = await startApi();
  });
  after(() => api.close());

  test("lists the four attacks the brief names", async () => {
    const { attacks } = (await api.get("/attacks")).body;
    assert.deepEqual(attacks.map((attack) => attack.name), ["second-release", "unauthorised-refund", "out-of-order", "re-entrancy"]);
  });

  for (const name of ["second-release", "unauthorised-refund", "out-of-order"]) {
    test(`${name} fails against the real vault`, async () => {
      const { body } = await api.post(`/attacks/${name}`);
      assert.equal(body.attackFailed, true, body.verdict);
      assert.ok(body.steps.some((step) => step.outcome === "refused" && step.reason));
      assert.equal(body.money.reconciles, true);
    });
  }

  test("re-entrancy fails against the real vault and drains the weak copy", async () => {
    const { body } = await api.post("/attacks/re-entrancy");
    assert.equal(body.attackFailed, true, body.verdict);
    assert.equal(body.realVault.attackerReceived, body.realVault.owedToAttacker);
    assert.equal(body.realVault.refusedAgain, 1);
    assert.equal(body.realVault.booksBalance, true);
    assert.equal(body.weakCopy.tookMoreThanOwed, true);
    assert.equal(body.weakCopy.leftInVault, 0);
  });

  test("an unknown attack name is a 404", async () => {
    assert.equal((await api.post("/attacks/nope")).status, 404);
  });
});
