const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { readDeal } = require("../src/checker");
const { readByRules, parseAmount } = require("../src/checker/rules");
const { validate, dropUnsourced, membersOf } = require("../src/checker/validate");
const { normalise, parseAnswer } = require("../src/checker/model");

const fixture = (name) => fs.readFileSync(path.join(__dirname, "..", "fixtures", name), "utf8");
const sum = (values) => values.reduce((total, value) => total + value, 0);
const NO_KEYS = {};

describe("offline reader on the sample deals", () => {
  const cases = [
    {
      file: "01-flatmates-wifi.txt",
      payers: { Asha: 4800, Bilal: 4800, Chitra: 4800 },
      judge: "Mrs. Kulkarni",
      stages: 12,
      total: 14400,
      payees: ["QuickNet Broadband"],
    },
    {
      file: "02-freelance-website.txt",
      payers: { Riya: 30000 },
      judge: "Meera",
      stages: 3,
      total: 30000,
      payees: ["Aman"],
    },
    {
      file: "03-house-construction.txt",
      payers: { Sunil: 300000 },
      judge: "Neha Joshi",
      stages: 4,
      total: 300000,
      payees: ["Ramesh", "Imran", "Farida"],
    },
    {
      file: "04-company-bonus.txt",
      payers: { "Brightline Apps": 200000 },
      judge: "Lata Rao",
      stages: 8,
      total: 200000,
      payees: ["Dev", "Kavya", "Omar", "Tara"],
    },
  ];

  for (const expected of cases) {
    test(`${expected.file} reads cleanly`, () => {
      const text = fixture(expected.file);
      const checklist = readByRules(text);

      assert.deepEqual(Object.fromEntries(checklist.payers.map((payer) => [payer.name, payer.share])), expected.payers);
      assert.equal(checklist.judge.name, expected.judge);
      assert.equal(checklist.stages.length, expected.stages);
      assert.equal(checklist.total, expected.total);
      assert.equal(sum(checklist.stages.map((stage) => stage.amount)), expected.total);
      assert.deepEqual([...new Set(checklist.stages.map((stage) => stage.payee))], expected.payees);
      assert.deepEqual(checklist.unclear, []);

      // Every stage quotes the deal exactly, and the checklist is ready once the people are added.
      for (const stage of checklist.stages) assert.ok(text.includes(stage.source), `source not in text: ${stage.source}`);
      assert.deepEqual(validate(checklist, text, membersOf(checklist)), []);
    });
  }

  test("a monthly payment becomes one stage per month", () => {
    const checklist = readByRules(fixture("01-flatmates-wifi.txt"));
    assert.deepEqual(
      checklist.stages.map((stage) => stage.title),
      Array.from({ length: 12 }, (_, month) => `Month ${month + 1}`)
    );
    assert.ok(checklist.stages.every((stage) => stage.amount === 1200));
  });

  test("reads a stake when the deal asks for one, and none otherwise", () => {
    const text = fixture("05-kitchen-stake.txt");
    const checklist = readByRules(text);
    assert.equal(checklist.stake, 5000);
    assert.equal(checklist.total, 50000);
    assert.deepEqual(checklist.unclear, []);
    assert.deepEqual(validate(checklist, text, membersOf(checklist)), []);

    assert.equal(readByRules(fixture("02-freelance-website.txt")).stake, 0);
  });

  test("a shared payment becomes one stage per person", () => {
    const checklist = readByRules(fixture("04-company-bonus.txt"));
    const perPerson = (name) => checklist.stages.filter((stage) => stage.payee === name).map((stage) => stage.amount);
    for (const name of ["Dev", "Kavya", "Omar", "Tara"]) assert.deepEqual(perPerson(name), [25000, 25000]);
  });
});

describe("offline reader on unclear deals", () => {
  const issues = (text) => readByRules(text).unclear.map((item) => item.issue);

  test("quotes each vague phrase exactly", () => {
    const text =
      "Riya pays ₹20,000 for a logo. Aman is paid ₹20,000 when the work is satisfactory and delivered within a reasonable time. Meera settles any dispute.";
    const unclear = readByRules(text).unclear;
    assert.deepEqual(unclear.map((item) => item.source), ["satisfactory", "within a reasonable time"]);
    for (const item of unclear) assert.ok(text.includes(item.source));
  });

  test("asks for names when a group is not named, and invents none", () => {
    const text =
      "Brightline Apps pays ₹1,00,000 as a bonus. Each of the four developers is paid ₹25,000 when the test report is signed. Lata Rao settles any dispute.";
    const checklist = readByRules(text);
    assert.equal(checklist.stages.length, 4);
    assert.ok(checklist.stages.every((stage) => stage.payee === ""));
    assert.deepEqual(issues(text), ["The four developers are not named"]);
  });

  test("reports amounts that do not add up, without changing them", () => {
    const text = "Sunil pays ₹1,00,000 for the work. Ramesh is paid ₹60,000 when the walls are built. Neha Joshi settles any dispute.";
    const checklist = readByRules(text);
    assert.equal(checklist.payers[0].share, 100000);
    assert.equal(checklist.total, 60000);
    assert.ok(issues(text).includes("The amounts do not add up"));
  });

  test("reports a missing judge", () => {
    const text = "Riya pays ₹5,000 for a logo. Aman is paid ₹5,000 when the logo files are delivered.";
    assert.deepEqual(issues(text), ["The judge is not named"]);
  });

  test("reports a line about money it cannot read instead of guessing", () => {
    const text = "The balance of ₹5,000 will be sorted out between us later on. Meera settles any dispute.";
    assert.ok(issues(text).includes("This line mentions money but could not be read"));
    assert.equal(readByRules(text).stages.length, 0);
  });

  test("reads Indian amount formats", () => {
    assert.equal(parseAmount("₹1,20,000"), 120000);
    assert.equal(parseAmount("Rs. 30k"), 30000);
    assert.equal(parseAmount("2 lakh rupees"), 200000);
    assert.ok(Number.isNaN(parseAmount("₹4,800.50")));
  });
});

describe("checklist rules", () => {
  const text = fixture("02-freelance-website.txt");
  const clean = () => readByRules(text);
  const codes = (checklist, people) => validate(checklist, text, people).map((problem) => problem.code);

  test("a clean checklist with known people has no problems", () => {
    assert.deepEqual(codes(clean(), ["Riya", "Aman", "Meera"]), []);
  });

  test("refuses people who have not been added", () => {
    assert.deepEqual(codes(clean(), ["Riya", "Meera"]), ["unknown-person"]);
  });

  test("refuses a judge who is a payer or a payee", () => {
    const asPayer = clean();
    asPayer.judge.name = "Riya";
    assert.ok(codes(asPayer).includes("judge-is-payer"));

    const asPayee = clean();
    asPayee.judge.name = "aman";
    assert.ok(codes(asPayee).includes("judge-is-payee"));
  });

  test("refuses a payee who is also a payer", () => {
    const checklist = clean();
    checklist.stages[0].payee = "Riya";
    assert.ok(codes(checklist).includes("payee-is-payer"));
  });

  test("refuses amounts that do not add up", () => {
    const checklist = clean();
    checklist.stages[0].amount = 9000;
    assert.deepEqual(codes(checklist), ["totals", "total"]);
  });

  test("refuses a quote that is not in the deal text", () => {
    const checklist = clean();
    checklist.stages[0].source = "Aman is paid on request.";
    assert.ok(codes(checklist).includes("stage-source"));
  });

  test("refuses while any unclear point is open", () => {
    const checklist = clean();
    checklist.unclear.push({ issue: "Launch date", question: "When is launch?", source: "" });
    assert.deepEqual(codes(checklist), ["unclear"]);
  });

  test("refuses a stake that is negative or not whole rupees", () => {
    for (const stake of [-1, 2500.5, "5000"]) {
      const checklist = clean();
      checklist.stake = stake;
      assert.deepEqual(codes(checklist), ["stake"]);
    }
  });

  test("refuses missing payees, zero amounts and fractions of a rupee", () => {
    const checklist = clean();
    checklist.stages[0].payee = "";
    checklist.stages[1].amount = 0;
    checklist.payers[0].share = 30000.5;
    const found = codes(checklist);
    for (const code of ["stage-payee", "stage-amount", "payer-share"]) assert.ok(found.includes(code), code);
  });
});

describe("model path and fallback", () => {
  const text = fixture("02-freelance-website.txt");
  const withKey = { ANTHROPIC_API_KEY: "test-key" };

  test("uses the offline reader when no key is configured", async () => {
    const result = await readDeal(text, { env: NO_KEYS });
    assert.equal(result.readBy, "rules");
    assert.equal(result.checklist.readBy, "rules");
    assert.equal(result.fallbackReason, "No model key is configured.");
    assert.equal(result.checklist.stages.length, 3);
  });

  test("uses the offline reader when CHECKER_MODE=rules, even with a key", async () => {
    let called = false;
    const result = await readDeal(text, {
      env: { ...withKey, CHECKER_MODE: "rules" },
      modelReader: async () => {
        called = true;
      },
    });
    assert.equal(called, false);
    assert.equal(result.readBy, "rules");
    assert.match(result.fallbackReason, /CHECKER_MODE=rules/);
  });

  test("uses the model's proposal when it is usable", async () => {
    const proposal = readByRules(text);
    proposal.title = "Website for the shop";
    const result = await readDeal(text, { env: withKey, modelReader: async () => proposal });
    assert.equal(result.readBy, "model");
    assert.equal(result.model, "claude-opus-5-5");
    assert.equal(result.fallbackReason, null);
    assert.equal(result.checklist.title, "Website for the shop");
  });

  test("falls back and says why when the model fails", async () => {
    const result = await readDeal(text, {
      env: withKey,
      modelReader: async () => {
        throw new Error("The model did not answer in time.");
      },
    });
    assert.equal(result.readBy, "rules");
    assert.equal(result.fallbackReason, "The model did not answer in time.");
    assert.equal(result.checklist.stages.length, 3);
  });

  test("falls back when the model's answer is not a checklist", async () => {
    const result = await readDeal(text, { env: withKey, modelReader: async () => normalise(parseAnswer("Sure! Here you go.")) });
    assert.equal(result.readBy, "rules");
    assert.equal(result.fallbackReason, "The model's answer was not JSON.");
  });

  test("drops a stage the model invented, and reports it", async () => {
    const proposal = readByRules(text);
    proposal.stages.push({ title: "Bonus", payee: "Aman", amount: 4000, condition: "on request", source: "Aman also gets a bonus." });
    const result = await readDeal(text, { env: withKey, modelReader: async () => proposal });

    assert.equal(result.readBy, "model");
    assert.equal(result.checklist.stages.length, 3);
    assert.deepEqual(result.dropped.map((item) => item.label), ["Bonus"]);
    assert.ok(result.checklist.unclear.some((item) => item.issue === "Some proposed stages were removed"));
  });

  test("falls back when every stage the model proposed was invented", async () => {
    const proposal = readByRules(text);
    for (const stage of proposal.stages) stage.source = "not in the deal";
    const result = await readDeal(text, { env: withKey, modelReader: async () => proposal });
    assert.equal(result.readBy, "rules");
    assert.match(result.fallbackReason, /no stage that quotes the deal text/);
  });

  test("refuses empty text", async () => {
    await assert.rejects(readDeal("   ", { env: NO_KEYS }), /empty/);
  });

  test("dropUnsourced keeps an unclear item that is about something missing", () => {
    const checklist = readByRules(text);
    checklist.unclear.push({ issue: "No deadline", question: "By when?", source: "" });
    assert.equal(dropUnsourced(checklist, text).checklist.unclear.length, 1);
  });
});
