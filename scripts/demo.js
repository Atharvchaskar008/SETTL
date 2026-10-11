// End-to-end run of Settl through its own API.
//
//   npm run demo
//
// It starts the server on a free port, takes a deal from plain text to final
// payout over HTTP, and prints every step with its outcome. Each step states
// what should happen; the script exits with an error if anything differs.

require("dotenv").config();

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createApp } = require("../server/src/app");

const fixture = (name) => fs.readFileSync(path.join(__dirname, "..", "server", "fixtures", name), "utf8").trim();
const rupees = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

let unexpected = 0;
const note = (text = "") => console.log(text);
const heading = (text) => note(`\n${text}\n${"-".repeat(text.length)}`);
const fail = (message) => {
  unexpected += 1;
  note(`  !! UNEXPECTED: ${message}`);
};
const check = (condition, message) => {
  if (!condition) fail(message);
};

async function startApi(env) {
  const storePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "settl-demo-")), "store.json");
  const { app } = await createApp({ env, storePath });
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
  return { base, get: call("GET"), post: call("POST"), put: call("PUT"), close: () => server.close() };
}

/**
 * Sends one action and prints it. `expected` is "accepted" or "refused"; a
 * different outcome counts as a failure of the demo.
 */
async function step(label, request, expected = "accepted") {
  const { status, body } = await request;
  const outcome = status < 300 ? "accepted" : body.refused ? "refused" : "error";
  const detail = outcome === "refused" ? body.reason : outcome === "error" ? body.error : "";
  note(`  ${outcome === "accepted" ? "ok     " : "refused"}  ${label.padEnd(44)} ${detail}`);
  if (outcome !== expected) fail(`"${label}" was ${outcome}, expected ${expected}.`);
  return body;
}

function showChecklist(deal) {
  const { checklist } = deal;
  const reader = deal.readBy === "model" ? `the model (${deal.model})` : `the offline reader (${deal.fallbackReason})`;
  note(`  Read by    ${reader}`);
  note(`  Payers     ${checklist.payers.map((payer) => `${payer.name} ${rupees(payer.share)}`).join(", ")}`);
  note(`  Judge      ${checklist.judge.name}`);
  note(`  Stages     ${checklist.stages.length}, total ${rupees(checklist.total)}`);
  for (const [index, stage] of checklist.stages.slice(0, 4).entries()) {
    note(`             ${index + 1}. ${stage.payee}  ${rupees(stage.amount)}  when ${stage.condition}`);
  }
  if (checklist.stages.length > 4) note(`             ... and ${checklist.stages.length - 4} more`);
  note(`  Unclear    ${checklist.unclear.length === 0 ? "nothing" : checklist.unclear.map((item) => item.issue).join("; ")}`);
}

function showMoney(deal) {
  const { money } = deal;
  note(
    `  Money      locked ${rupees(money.locked)} | waiting to be withdrawn ${rupees(money.waitingToBeWithdrawn)} | ` +
      `paid out ${rupees(money.paidOut)} | books balance: ${money.reconciles ? "yes" : "NO"}`
  );
  check(money.reconciles, "the vault's books do not balance.");
}

async function showSummary(api, id) {
  const { summary } = (await api.get(`/deals/${id}/summary`)).body;
  note("  Settlement");
  for (const person of summary.people) {
    const parts = [
      person.paidIn && `paid in ${rupees(person.paidIn)}`,
      person.earned && `earned ${rupees(person.earned)}`,
      person.refunded && `got back ${rupees(person.refunded)}`,
      `withdrew ${rupees(person.withdrawn)}`,
    ].filter(Boolean);
    note(`             ${person.name.padEnd(20)} ${parts.join(", ")}`);
  }
  note(
    `             Deposited ${rupees(summary.totals.deposited)} = paid to payees ${rupees(summary.totals.paidToPayees)} + ` +
      `returned to payers ${rupees(summary.totals.returnedToPayers)}. Adds up: ${summary.addsUp ? "yes" : "NO"}`
  );
  check(summary.addsUp, "the settlement does not add up.");
  check(summary.finished, "the deal is not finished.");
  check(summary.totals.stillInVault === 0, "money was left in the vault.");
  return summary;
}

/** Text to locked vault: draft, confirm, everyone agrees, lock. */
async function setUp(api, { text, organiser, people }) {
  note(`  Text       "${text.length > 150 ? `${text.slice(0, 150)}...` : text}"`);
  await api.post("/people", { names: people });
  const draft = (await api.post("/deals/draft", { text, person: organiser })).body;
  const id = draft.deal.id;
  showChecklist(draft.deal);
  check(draft.problems.length === 0, `the checklist has problems: ${draft.problems.map((problem) => problem.message).join(" ")}`);

  await step(`${organiser} confirms the checklist`, api.post(`/deals/${id}/confirm`, { person: organiser }));
  await step(`${organiser} tries to lock before anyone agrees`, api.post(`/deals/${id}/lock`, { person: organiser }), "refused");
  for (const person of draft.deal.members) {
    await step(`${person} agrees`, api.post(`/deals/${id}/agree`, { person }));
  }
  await step(`${organiser} locks the deal`, api.post(`/deals/${id}/lock`, { person: organiser }));
  return { id, act: (route, body) => api.post(`/deals/${id}${route}`, body) };
}

async function freelanceDeal(api) {
  heading("DEAL: Freelance website (one payer, one payee, one judge)");
  const { id, act } = await setUp(api, {
    text: fixture("02-freelance-website.txt"),
    organiser: "Riya",
    people: ["Riya", "Aman", "Meera"],
  });

  await step("Aman tries to deposit", act("/deposit", { person: "Aman" }), "refused");
  await step("Aman marks stage 1 done before funding", act("/stages/1/complete", { person: "Aman" }), "refused");
  await step("Riya deposits her share", act("/deposit", { person: "Riya" }));

  await step("Riya approves stage 1 before it is done", act("/stages/1/approve", { person: "Riya" }), "refused");
  await step("Aman marks stage 1 done", act("/stages/1/complete", { person: "Aman" }));
  await step("Aman approves his own stage", act("/stages/1/approve", { person: "Aman" }), "refused");
  await step("Riya approves stage 1", act("/stages/1/approve", { person: "Riya" }));
  await step("Riya approves stage 1 again", act("/stages/1/approve", { person: "Riya" }), "refused");
  showMoney((await step("Aman withdraws", act("/withdraw", { person: "Aman" }))).deal);
  await step("Aman withdraws again", act("/withdraw", { person: "Aman" }), "refused");

  for (const stage of [2, 3]) {
    await step(`Aman marks stage ${stage} done`, act(`/stages/${stage}/complete`, { person: "Aman" }));
    await step(`Riya approves stage ${stage}`, act(`/stages/${stage}/approve`, { person: "Riya" }));
  }
  showMoney((await step("Aman withdraws", act("/withdraw", { person: "Aman" }))).deal);

  const summary = await showSummary(api, id);
  check(summary.people.find((person) => person.name === "Aman").withdrawn === 30000, "Aman should have received ₹30,000.");
}

async function flatmatesDeal(api) {
  heading("DEAL: Flatmates sharing wifi (three payers, twelve monthly stages)");
  const { id, act } = await setUp(api, {
    text: fixture("01-flatmates-wifi.txt"),
    organiser: "Asha",
    people: ["Asha", "Bilal", "Chitra", "QuickNet Broadband", "Mrs. Kulkarni"],
  });
  const provider = "QuickNet Broadband";

  await step("Asha deposits her share", act("/deposit", { person: "Asha" }));
  await step("Bilal deposits his share", act("/deposit", { person: "Bilal" }));
  await step(`${provider} marks month 1 done before Chitra pays`, act("/stages/1/complete", { person: provider }), "refused");
  await step("Chitra deposits her share", act("/deposit", { person: "Chitra" }));

  // Approval needs more than half of the three payers.
  await step(`${provider} marks month 1 done`, act("/stages/1/complete", { person: provider }));
  const one = await step("Asha approves month 1 (1 of 3)", act("/stages/1/approve", { person: "Asha" }));
  check(one.deal.stages[0].state === "Completed", "one approval out of three should not release the stage.");
  await step("Asha approves month 1 a second time", act("/stages/1/approve", { person: "Asha" }), "refused");
  const two = await step("Bilal approves month 1 (2 of 3)", act("/stages/1/approve", { person: "Bilal" }));
  check(two.deal.stages[0].state === "Released", "two approvals out of three should release the stage.");

  note("  ...        months 2 to 12: marked done by the provider, approved by Bilal and Chitra");
  for (let month = 2; month <= 12; month++) {
    for (const [person, action] of [[provider, "complete"], ["Bilal", "approve"], ["Chitra", "approve"]]) {
      const { status, body } = await act(`/stages/${month}/${action}`, { person });
      check(status === 200, `month ${month} ${action} by ${person} failed: ${body.reason || body.error}`);
    }
  }
  showMoney((await step(`${provider} withdraws`, act("/withdraw", { person: provider }))).deal);

  const summary = await showSummary(api, id);
  check(summary.people.find((person) => person.name === provider).withdrawn === 14400, `${provider} should have received ₹14,400.`);
}

async function constructionDeal(api) {
  heading("DEAL: House construction (three trades, one dispute settled each way)");
  const { id, act } = await setUp(api, {
    text: fixture("03-house-construction.txt"),
    organiser: "Sunil",
    people: ["Sunil", "Ramesh", "Imran", "Farida", "Neha Joshi"],
  });
  await step("Sunil deposits his share", act("/deposit", { person: "Sunil" }));

  await step("Ramesh marks the foundation done", act("/stages/1/complete", { person: "Ramesh" }));
  await step("Imran marks Ramesh's stage done", act("/stages/2/complete", { person: "Imran" }), "refused");
  await step("Sunil approves the foundation", act("/stages/1/approve", { person: "Sunil" }));

  // The walls are disputed and the judge sides with the mason.
  await step("Ramesh marks the walls done", act("/stages/2/complete", { person: "Ramesh" }));
  await step("Sunil disputes the walls", act("/stages/2/dispute", { person: "Sunil" }));
  await step("Sunil refunds the walls to himself", act("/stages/2/resolve", { person: "Sunil", decision: "refund" }), "refused");
  await step("Ramesh awards the walls to himself", act("/stages/2/resolve", { person: "Ramesh", decision: "pay" }), "refused");
  await step("Neha Joshi, the judge, pays Ramesh", act("/stages/2/resolve", { person: "Neha Joshi", decision: "pay" }));

  // The plumbing is disputed and the judge sides with the owner.
  await step("Imran marks the plumbing done", act("/stages/3/complete", { person: "Imran" }));
  await step("Sunil disputes the plumbing", act("/stages/3/dispute", { person: "Sunil" }));
  await step("Neha Joshi, the judge, refunds Sunil", act("/stages/3/resolve", { person: "Neha Joshi", decision: "refund" }));
  await step("Neha Joshi tries to withdraw", act("/withdraw", { person: "Neha Joshi" }), "refused");

  await step("Farida marks the wiring done", act("/stages/4/complete", { person: "Farida" }));
  const closed = await step("Sunil approves the wiring", act("/stages/4/approve", { person: "Sunil" }));
  check(closed.deal.phase === "Closed", "the deal should close when the last stage is settled.");

  for (const person of ["Ramesh", "Farida", "Sunil"]) await step(`${person} withdraws`, act("/withdraw", { person }));
  await step("Imran withdraws", act("/withdraw", { person: "Imran" }), "refused");
  showMoney((await api.get(`/deals/${id}`)).body.deal);

  const summary = await showSummary(api, id);
  const received = Object.fromEntries(summary.people.map((person) => [person.name, person.withdrawn]));
  check(received.Ramesh === 200000 && received.Farida === 40000 && received.Sunil === 60000, "the construction payouts are wrong.");
  check(
    summary.stages.map((stage) => stage.outcome).join("|") === "paid on approval|paid by the judge|refunded by the judge|paid on approval",
    "the stage outcomes are wrong."
  );
}

async function bonusDeal(api) {
  heading("DEAL: Company bonus (one payer, four employees, one stage per person)");
  const team = ["Dev", "Kavya", "Omar", "Tara"];
  const { id, act } = await setUp(api, {
    text: fixture("04-company-bonus.txt"),
    organiser: "Brightline Apps",
    people: ["Brightline Apps", ...team, "Lata Rao"],
  });
  await step("Brightline Apps deposits the bonus pool", act("/deposit", { person: "Brightline Apps" }));

  // Stages 1 to 4 are the test report, 5 to 8 the launch, in team order.
  await step("Dev marks Kavya's stage done", act("/stages/2/complete", { person: "Dev" }), "refused");
  for (const [index, person] of team.entries()) {
    for (const stage of [index + 1, index + 5]) {
      await act(`/stages/${stage}/complete`, { person });
      const { status, body } = await act(`/stages/${stage}/approve`, { person: "Brightline Apps" });
      check(status === 200, `stage ${stage} for ${person} failed: ${body.reason || body.error}`);
    }
  }
  note("  ...        each of the four marked both of their stages done; the company approved all eight");
  for (const person of team) await step(`${person} withdraws`, act("/withdraw", { person }));
  showMoney((await api.get(`/deals/${id}`)).body.deal);

  const summary = await showSummary(api, id);
  check(
    team.every((name) => summary.people.find((person) => person.name === name).withdrawn === 50000),
    "each team member should have received ₹50,000."
  );
}

async function attackLab(api) {
  heading("ATTACK LAB: four attempts to cheat a fresh vault");
  const { attacks } = (await api.get("/attacks")).body;
  for (const { name, title, explanation } of attacks) {
    const { body } = await api.post(`/attacks/${name}`);
    note(`\n  ${title}: ${explanation}`);
    for (const attempt of body.steps || []) {
      note(`    ${attempt.outcome === "accepted" ? "ok     " : "refused"}  ${`${attempt.who} ${attempt.tried}`.padEnd(48)} ${attempt.reason || ""}`);
    }
    if (body.realVault) {
      for (const [label, result] of [["Real vault", body.realVault], ["Weak copy ", body.weakCopy]]) {
        note(
          `    ${label}  owed ${rupees(result.owedToAttacker)} | attacker received ${rupees(result.attackerReceived)} | ` +
            `left in vault ${rupees(result.leftInVault)} | books balance: ${result.booksBalance ? "yes" : "no"}`
        );
      }
      check(body.weakCopy.tookMoreThanOwed, "the weak copy should have been drained; the comparison proves nothing otherwise.");
    }
    note(`    Verdict: ${body.verdict}`);
    check(body.attackFailed === true, `the ${name} attack was not stopped.`);
  }
}

/** With a key configured, reads one deal with the model and shows what came back. */
async function modelReader() {
  heading("MODEL READER");
  if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
    note("  No model key is configured, so the model reader was not exercised in this run.");
    note("  Put a key in .env and run the demo again to see it read a deal.");
    return;
  }
  const api = await startApi(process.env);
  try {
    await api.post("/people", { names: ["Riya", "Aman", "Meera"] });
    const { deal, problems } = (await api.post("/deals/draft", { text: fixture("02-freelance-website.txt"), person: "Riya" })).body;
    showChecklist(deal);
    note(`  Problems   ${problems.length === 0 ? "none" : problems.map((problem) => problem.message).join(" ")}`);
    check(deal.readBy === "model", `a key is configured but the model was not used: ${deal.fallbackReason}`);
    check(deal.checklist.total === 30000, `the model read a total of ${rupees(deal.checklist.total)}, expected ₹30,000.`);
  } finally {
    api.close();
  }
}

async function main() {
  // The deals below run on the offline reader so that every run is identical.
  const api = await startApi({ ...process.env, CHECKER_MODE: "rules" });
  note("SETTL END-TO-END DEMO");
  note("All funds are simulated. The chain runs in memory inside this process.");
  note("The four deals use the offline reader, so this run is the same every time.");

  try {
    await freelanceDeal(api);
    await flatmatesDeal(api);
    await constructionDeal(api);
    await bonusDeal(api);
    await attackLab(api);
  } finally {
    api.close();
  }
  await modelReader();

  heading("RESULT");
  note(unexpected === 0 ? "  Everything happened as stated." : `  ${unexpected} step(s) did not happen as stated.`);
  process.exitCode = unexpected === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error("The demo could not run:", error);
  process.exitCode = 1;
});
