// The checklist is the form the deal checker fills in and the organiser edits.
// Nothing reaches the chain until this file reports no problems.
//
// {
//   title:   string,
//   payers:  [{ name, share }],
//   judge:   { name },
//   stages:  [{ title, payee, amount, condition, source }],
//   unclear: [{ issue, question, source }],
//   total:   number,
//   stake:   number   what each payee puts in before the start; 0 for none
// }
//
// Amounts are whole rupees.

const isWholeRupees = (value) => Number.isInteger(value) && value > 0;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** An empty checklist in the right shape, so readers always return the same keys. */
function emptyChecklist() {
  return { title: "", payers: [], judge: { name: "" }, stages: [], unclear: [], total: 0, stake: 0 };
}

/** Every person named in the checklist, in a stable order and without repeats. */
function membersOf(checklist) {
  const names = [
    ...checklist.payers.map((payer) => payer.name),
    ...checklist.stages.map((stage) => stage.payee),
    checklist.judge.name,
  ].filter((name) => typeof name === "string" && name.trim() !== "");
  return names.filter((name, index) => names.findIndex((other) => sameName(other, name)) === index);
}

/**
 * Checks a checklist against the rules. Returns a list of problems; an empty
 * list means the checklist may be confirmed.
 *
 * @param {object} checklist
 * @param {string} text    the deal text the checklist was read from
 * @param {string[]} [people]  names already added to the system; skipped if omitted
 * @returns {{ code: string, message: string }[]}
 */
function validate(checklist, text, people) {
  const problems = [];
  const problem = (code, message) => problems.push({ code, message });

  if (!checklist || typeof checklist !== "object") {
    return [{ code: "shape", message: "The checklist is missing." }];
  }
  const { payers, judge, stages, unclear } = checklist;
  if (!Array.isArray(payers) || !Array.isArray(stages) || !Array.isArray(unclear) || !judge) {
    return [{ code: "shape", message: "The checklist must have payers, a judge, stages and an unclear list." }];
  }

  if (payers.length === 0) problem("no-payers", "Nobody is listed as paying.");
  if (stages.length === 0) problem("no-stages", "There are no stages.");

  payers.forEach((payer, index) => {
    if (!payer.name || !payer.name.trim()) problem("payer-name", `Payer ${index + 1} has no name.`);
    if (!isWholeRupees(payer.share)) {
      problem("payer-share", `${payer.name || `Payer ${index + 1}`} needs a share in whole rupees above zero.`);
    }
    if (payers.findIndex((other) => other.name && payer.name && sameName(other.name, payer.name)) !== index) {
      problem("payer-twice", `${payer.name} is listed as a payer more than once.`);
    }
  });

  stages.forEach((stage, index) => {
    const label = `Stage ${index + 1}`;
    if (!stage.payee || !stage.payee.trim()) problem("stage-payee", `${label} does not say who is paid.`);
    if (!isWholeRupees(stage.amount)) problem("stage-amount", `${label} needs an amount in whole rupees above zero.`);
    if (stage.source && !text.includes(stage.source)) {
      problem("stage-source", `${label} quotes text that is not in the deal.`);
    }
    if (stage.payee && payers.some((payer) => payer.name && sameName(payer.name, stage.payee))) {
      problem("payee-is-payer", `${stage.payee} cannot both pay into the deal and be paid from it.`);
    }
  });

  const judgeName = (judge.name || "").trim();
  if (!judgeName) {
    problem("no-judge", "No judge is named.");
  } else {
    if (payers.some((payer) => payer.name && sameName(payer.name, judgeName))) {
      problem("judge-is-payer", `${judgeName} is a payer, so cannot be the judge.`);
    }
    if (stages.some((stage) => stage.payee && sameName(stage.payee, judgeName))) {
      problem("judge-is-payee", `${judgeName} is paid in this deal, so cannot be the judge.`);
    }
  }

  const shareTotal = sum(payers.map((payer) => (isWholeRupees(payer.share) ? payer.share : 0)));
  const stageTotal = sum(stages.map((stage) => (isWholeRupees(stage.amount) ? stage.amount : 0)));
  if (shareTotal !== stageTotal) {
    problem("totals", `The payers put in ₹${shareTotal} but the stages add up to ₹${stageTotal}.`);
  }
  if (checklist.total !== stageTotal) {
    problem("total", `The stated total is ₹${checklist.total} but the stages add up to ₹${stageTotal}.`);
  }
  if (checklist.stake !== undefined && !(Number.isInteger(checklist.stake) && checklist.stake >= 0)) {
    problem("stake", "The stake must be a whole number of rupees, or zero for no stake.");
  }

  if (Array.isArray(people)) {
    for (const name of membersOf(checklist)) {
      if (!people.some((person) => sameName(person, name))) {
        problem("unknown-person", `${name} has not been added as a person yet.`);
      }
    }
  }

  if (unclear.length > 0) {
    problem("unclear", `${unclear.length} unclear point${unclear.length === 1 ? "" : "s"} must be resolved first.`);
  }

  return problems;
}

const EDGE_PUNCTUATION = /^[\s"'“”‘’.,;:!?()]+|[\s"'“”‘’.,;:!?()]+$/g;
const escapeForPattern = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Finds where a reader's quote sits in the deal text and returns the text's
 * own wording for it, or null if the quote is not there.
 *
 * A model sometimes copies a phrase with a stray word or comma at either end
 * ("and Rs 20,000 after key handover" for "Rs 20,000 after key handover").
 * Such a quote is still grounded in the text, so it is matched on its longest
 * run of words that does appear, and what is returned is always an exact
 * piece of the text. A quote with too little in common with the text is not
 * matched at all.
 */
function findQuote(text, source) {
  if (typeof source !== "string" || source.trim() === "") return null;
  if (text.includes(source)) return source;

  const trimmed = source.replace(EDGE_PUNCTUATION, "");
  if (trimmed && text.includes(trimmed)) return trimmed;

  // First with every word and only the spacing allowed to differ, then with up to three words dropped from the ends.
  const words = trimmed.split(/\s+/).filter(Boolean);
  for (let dropped = 0; dropped <= 3; dropped++) {
    for (let fromStart = 0; fromStart <= dropped; fromStart++) {
      const kept = words.slice(fromStart, words.length - (dropped - fromStart));
      if (kept.length < 3 || kept.length < words.length * 0.6) continue;
      const match = text.match(new RegExp(kept.map(escapeForPattern).join("\\s+")));
      if (match) return match[0];
    }
  }
  return null;
}

/**
 * Enforces "every item a reader proposes must point at the words it came from".
 *
 * A stage must quote the deal. Its quote is replaced by the matching piece of
 * the text itself, and a stage whose quote cannot be found is dropped and
 * reported, never silently kept. An unclear point is a warning, so it is
 * always kept; a quote of its that cannot be found is simply cleared.
 *
 * @returns {{ checklist: object, dropped: { kind: string, label: string, source: string }[] }}
 */
function dropUnsourced(checklist, text) {
  const dropped = [];

  const stages = [];
  for (const stage of checklist.stages) {
    const quote = findQuote(text, stage.source);
    if (quote) stages.push({ ...stage, source: quote });
    else dropped.push({ kind: "stage", label: stage.title || "Untitled stage", source: stage.source || "" });
  }
  const unclear = checklist.unclear.map((item) => ({ ...item, source: findQuote(text, item.source) || "" }));

  const kept = { ...checklist, stages, unclear };
  if (dropped.some((item) => item.kind === "stage")) {
    kept.total = stages.reduce((total, stage) => total + (isWholeRupees(stage.amount) ? stage.amount : 0), 0);
    kept.unclear = [
      ...unclear,
      {
        issue: "Some proposed stages were removed",
        question: "The reader proposed stages that do not quote the deal text. Check the stages against the text.",
        source: "",
      },
    ];
  }
  return { checklist: kept, dropped };
}

module.exports = { validate, dropUnsourced, findQuote, emptyChecklist, membersOf, sameName };
