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

/**
 * Enforces "every item a reader proposes must point at the words it came from".
 * A stage must quote text that is in the deal, exactly. An unclear item may
 * have no quote (it can be about something missing), but a quote it does give
 * must be exact. Anything else is dropped and reported, never silently kept.
 *
 * @returns {{ checklist: object, dropped: { kind: string, label: string, source: string }[] }}
 */
function dropUnsourced(checklist, text) {
  const dropped = [];
  const quoted = (source) => typeof source === "string" && source.trim() !== "" && text.includes(source);

  const stages = checklist.stages.filter((stage) => {
    if (quoted(stage.source)) return true;
    dropped.push({ kind: "stage", label: stage.title || "Untitled stage", source: stage.source || "" });
    return false;
  });
  const unclear = checklist.unclear.filter((item) => {
    if (!item.source || quoted(item.source)) return true;
    dropped.push({ kind: "unclear", label: item.issue || "Unclear point", source: item.source });
    return false;
  });

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

module.exports = { validate, dropUnsourced, emptyChecklist, membersOf, sameName };
