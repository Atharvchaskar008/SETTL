// Scores the deal checker against sample deals whose right answers are written down.
//
//   npm run score
//
// Each deal in samples/deals/ has a .txt and a matching .expected.json. The
// script reads every deal with the offline reader, and with the model too when
// a key is configured, and counts how many of five checks each reader gets
// right per deal. It is a measurement, not a test: it always finishes, and the
// numbers for the model can differ a little from run to run.

require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { readDeal } = require("../server/src/checker");
const { providerFrom } = require("../server/src/checker/model");

const DEALS = path.join(__dirname, "..", "samples", "deals");
const CHECKS = ["payers", "judge", "stages", "amounts", "unclear"];

const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
const sum = (values) => values.reduce((total, value) => total + value, 0);
const sortedPayers = (checklist) =>
  JSON.stringify(checklist.payers.map((payer) => [String(payer.name).trim().toLowerCase(), payer.share]).sort());

/** Five yes-or-no checks of what a reader produced against the expected checklist. */
function compare(got, expected) {
  return {
    // The same people paying the same shares.
    payers: sortedPayers(got) === sortedPayers(expected),
    // The same judge, or correctly nobody.
    judge: same(got.judge.name, expected.judge.name),
    // The same number of stages.
    stages: got.stages.length === expected.stages.length,
    // The stage amounts add up to the same figure.
    amounts: sum(got.stages.map((stage) => stage.amount)) === sum(expected.stages.map((stage) => stage.amount)),
    // A clean deal is left clean, and a deal with problems is flagged.
    unclear: (got.unclear.length === 0) === (expected.unclear.length === 0),
  };
}

async function score(label, env, names) {
  let right = 0;
  let seconds = 0;
  let fellBack = 0;
  const lines = [];
  for (const name of names) {
    const text = fs.readFileSync(path.join(DEALS, `${name}.txt`), "utf8");
    const expected = JSON.parse(fs.readFileSync(path.join(DEALS, `${name}.expected.json`), "utf8"));
    const started = Date.now();
    const read = await readDeal(text, { env });
    seconds += (Date.now() - started) / 1000;
    if (label !== "Offline reader" && read.readBy !== "model") fellBack += 1;

    const result = compare(read.checklist, expected);
    right += CHECKS.filter((check) => result[check]).length;
    lines.push(`  ${name.padEnd(24)} ${CHECKS.map((check) => `${check} ${result[check] ? "yes" : "NO "}`).join("   ")}`);
  }
  const total = names.length * CHECKS.length;
  console.log(`\n${label}: ${right} of ${total} checks right, ${(seconds / names.length).toFixed(1)}s per deal`);
  if (fellBack) console.log(`  The model failed on ${fellBack} deal(s), and the offline reader answered for those.`);
  console.log(lines.join("\n"));
}

async function main() {
  if (!fs.existsSync(DEALS)) {
    console.log("There is no samples/deals folder to score against.");
    return;
  }
  const names = fs
    .readdirSync(DEALS)
    .filter((file) => file.endsWith(".txt"))
    .map((file) => file.replace(/\.txt$/, ""))
    .filter((name) => fs.existsSync(path.join(DEALS, `${name}.expected.json`)))
    .sort();
  console.log(`Scoring the deal checker on ${names.length} sample deals in samples/deals.`);
  console.log("These samples are written in free everyday language, not in the sentence shapes the offline reader knows.");

  await score("Offline reader", { CHECKER_MODE: "rules" }, names);

  let provider = null;
  try {
    provider = providerFrom(process.env);
  } catch (error) {
    console.log(`\nModel reader: not scored. ${error.message}`);
    return;
  }
  if (!provider) {
    console.log("\nModel reader: not scored, because no model key is configured in .env.");
    return;
  }
  await score(`Model reader (${provider.model})`, process.env, names);
}

main().catch((error) => {
  console.error("The scoring run could not finish:", error.message);
  process.exitCode = 1;
});
