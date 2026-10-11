// The offline reader. It turns deal text into a proposed checklist using fixed
// sentence patterns, with no model and no network. It is the fallback path, so
// it is deliberately cautious: anything it cannot read becomes an "unclear"
// item for a person to resolve, and it never invents a name or an amount.
//
// Sentence shapes it understands:
//   "<names> pay ₹X"                         who pays, and how much
//   "<name> pays <name> ₹X ..."              who pays whom
//   "<name> is paid ₹X when <condition>"     one stage
//   "... ₹X after <condition>, ₹Y at ..."    several stages in one sentence
//   "Each of <names> is paid ₹X when ..."    one stage per person
//   "... ₹X every month for N months ..."    one stage per month
//   "... a stake of ₹X ..."                  what each payee stakes before the start
//   "<name> settles any dispute"             the judge

const { emptyChecklist } = require("./validate");

const TITLE = "(?:Mr|Mrs|Ms|Dr|Shri|Smt)\\.?\\s+";
const WORD = "[A-Z][A-Za-z0-9'&-]*";
const NAME = `(?:${TITLE})?${WORD}(?:\\s+${WORD}){0,3}`;
const NAMES = `${NAME}(?:\\s*,\\s*${NAME})*(?:\\s*,?\\s+and\\s+${NAME})?`;

const UNIT = { k: 1e3, thousand: 1e3, lakh: 1e5, lakhs: 1e5, crore: 1e7, crores: 1e7 };
const NUMBER = "\\d+(?:,\\d+)*(?:\\.\\d+)?";
const AMOUNT =
  `(?:(?:₹|Rs\\.?|INR)\\s*${NUMBER}(?:\\s*(?:k|thousand|lakhs?|crores?)\\b)?` +
  `|${NUMBER}(?:\\s*(?:thousand|lakhs?|crores?))?\\s+rupees\\b)`;

const TRIGGER = "(?:as soon as|when|once|after|upon|on|at|if)";
const PAID_VERB = "(?:(?:is|are|will be|shall be|is to be)\\s+paid|gets|receives|will get|will receive)";

// Capitalised words that start a sentence without being anyone's name.
const NOT_A_NAME = new Set([
  "Each", "Every", "The", "This", "That", "These", "Those", "All", "Any", "Payment", "Payments",
  "Dispute", "Disputes", "When", "Once", "After", "If", "On", "At", "In", "For", "Then", "Both",
]);

// Wording that sounds like a condition but cannot be checked. Each match
// becomes an unclear item that quotes the exact phrase.
const VAGUE = [
  {
    pattern: /\b(?:satisfactor(?:y|ily)|satisfied|satisfaction|acceptable|adequate|appropriate|proper(?:ly)?)\b/gi,
    question: "Who decides this, and what exactly must be true for it to count?",
  },
  {
    pattern: /\b(?:good|high|decent|best)\s+(?:quality|standard|condition|enough|work)\b|\bwork\s+is\s+good\b/gi,
    question: "What can be checked to show the quality is met?",
  },
  {
    pattern: /\b(?:within\s+)?(?:a\s+)?reasonabl[ey]\b(?:\s+(?:time|period|amount|cost|price|effort))?/gi,
    question: "What exact time or amount is meant?",
  },
  {
    pattern: /\b(?:about|around|roughly|approximately|approx\.?|nearly|almost)\s+(?:₹|Rs\.?\s*|INR\s*)?\d[\d,]*(?:\s*(?:k|thousand|lakhs?|crores?|rupees))?/gi,
    question: "What is the exact figure?",
  },
  {
    pattern: /\b(?:as soon as possible|soon|shortly|promptly|timely|in due course|eventually|later on)\b/gi,
    question: "What is the exact date or deadline?",
  },
  {
    pattern: /\b(?:as needed|as required|if possible|when ready|when convenient|etc\.?|and so on)\b/gi,
    question: "What exactly is included?",
  },
];

/** Every vague phrase in the text, each quoted exactly as written. */
function vaguePhrasesIn(text) {
  const found = [];
  for (const { pattern, question } of VAGUE) {
    for (const match of text.matchAll(pattern)) {
      const phrase = match[0].trim();
      if (!found.some((item) => item.source === phrase)) {
        found.push({ issue: `Vague wording: "${phrase}"`, question, source: phrase });
      }
    }
  }
  return found;
}

/** "₹1,20,000", "Rs. 30k", "2 lakh rupees" -> whole rupees, or NaN if it is not a whole amount. */
function parseAmount(raw) {
  const digits = raw.match(/\d+(?:,\d+)*(?:\.\d+)?/);
  if (!digits) return NaN;
  const unit = raw.match(/\d\s*(k|thousand|lakhs?|crores?)\b/i);
  const value = Number(digits[0].replace(/,/g, "")) * (unit ? UNIT[unit[1].toLowerCase()] : 1);
  return Number.isInteger(value) ? value : NaN;
}

/** Splits text into sentences that are exact substrings of it. */
function sentencesOf(text) {
  const sentences = [];
  const boundary = /[.!?;]+(?=\s|$)|\r?\n+/g;
  let start = 0;
  let match;
  while ((match = boundary.exec(text))) {
    const before = text.slice(start, match.index);
    // "Mrs." and "Rs." end with a full stop but not a sentence.
    if (match[0].startsWith(".") && /(?:^|\s)(?:Mr|Mrs|Ms|Dr|Rs|Shri|Smt|No|St)$/.test(before)) continue;
    const end = match.index + match[0].length;
    const sentence = text.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = end;
  }
  const rest = text.slice(start).trim();
  if (rest) sentences.push(rest);
  return sentences;
}

function splitNames(list) {
  return list
    .split(/\s*,\s*and\s+|\s*,\s*|\s+and\s+/)
    .map((name) => name.trim())
    .filter((name) => name && !NOT_A_NAME.has(name.split(/\s+/)[0]));
}

/** A short stage title taken from its condition. */
function titleFrom(condition, fallback) {
  const words = condition.replace(/^(?:the|a|an)\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 5);
  // Do not end a title on a joining word such as "are" or "on the".
  while (words.length > 1 && /^(?:a|an|the|is|are|on|of|and|to|in|at|for|with|by)$/i.test(words[words.length - 1])) {
    words.pop();
  }
  if (words.length === 0) return fallback;
  const short = words.join(" ").replace(/[,;:.]+$/, "");
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/**
 * Finds every amount in `sentence` after position `from`, with the text that
 * follows it up to the next amount. An amount followed by a trigger word
 * ("when", "after", ...) is a stage; one that is not is a plain total.
 */
function amountsIn(sentence, from) {
  const found = [];
  const pattern = new RegExp(AMOUNT, "gi");
  pattern.lastIndex = from;
  let match;
  while ((match = pattern.exec(sentence))) {
    found.push({ value: parseAmount(match[0]), start: match.index, end: match.index + match[0].length });
  }
  return found.map((amount, index) => {
    const next = found[index + 1];
    const tail = sentence.slice(amount.end, next ? next.start : sentence.length);
    const months = monthsIn(tail);
    const trigger = tail.match(new RegExp(`\\b${TRIGGER}\\b\\s+([\\s\\S]+)`, "i"));
    let condition = trigger ? trigger[1].replace(/[\s,;:.]+$/, "").replace(/\s+and$/i, "").trim() : null;
    // A repeating payment is a stage even when no condition is written.
    if (condition === null && months > 0) condition = "";
    return { ...amount, tail, condition, months };
  });
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** "12" or "twelve" -> 12; anything else -> NaN. */
function countFrom(word) {
  if (/^\d+$/.test(word)) return Number(word);
  const index = NUMBER_WORDS.indexOf(word.toLowerCase());
  return index === -1 ? NaN : index;
}

/** "every month for 12 months" or "a month for one year" -> number of months, else 0. */
function monthsIn(tail) {
  const match = tail.match(/^\s*,?\s*(?:every|each|per|a)\s+month\s+for\s+(\d+|[a-z]+)\s+(months?|years?)\b/i);
  if (!match) return 0;
  const count = countFrom(match[1] === "a" ? "one" : match[1]);
  if (Number.isNaN(count)) return 0;
  return /^year/i.test(match[2]) ? count * 12 : count;
}

/**
 * Reads deal text into a proposed checklist.
 * @param {string} text
 * @returns {object} checklist in the format described in validate.js
 */
function readByRules(text) {
  const checklist = emptyChecklist();
  const unclear = (issue, question, source) => checklist.unclear.push({ issue, question, source });
  const sentences = sentencesOf(text);

  const addPayer = (name, share) => {
    const existing = checklist.payers.find((payer) => payer.name === name);
    if (existing) existing.share += share;
    else checklist.payers.push({ name, share });
  };
  const addStage = (payee, amount, condition, source, title) => {
    checklist.stages.push({
      title: title || titleFrom(condition, `Stage ${checklist.stages.length + 1}`),
      payee,
      amount,
      condition,
      source,
    });
  };
  // One stage, or one per month for a repeating payment.
  const addStages = (payee, amount, source) => {
    if (amount.months > 0) {
      for (let month = 1; month <= amount.months; month++) {
        addStage(payee, amount.value, amount.condition, source, `Month ${month}`);
      }
    } else {
      addStage(payee, amount.value, amount.condition, source);
    }
  };
  // Sentences where a group was mentioned without names; reported once, not per stage.
  const unnamedGroups = new Set();

  const judgePatterns = [
    new RegExp(`^(${NAME})\\s+(?:will\\s+|shall\\s+)?(?:settles?|decides?|resolves?)\\s+(?:any\\s+|all\\s+|every\\s+|the\\s+)*disputes?`),
    new RegExp(`[Dd]isputes?\\s+(?:will\\s+)?(?:go(?:es)?|are\\s+referred|be\\s+referred|are\\s+sent|be\\s+settled|are\\s+settled|be\\s+decided|are\\s+decided)\\s+(?:to|by)\\s+(${NAME})`),
    new RegExp(`(?:[Jj]udge|[Aa]rbiter|[Aa]rbitrator|[Mm]ediator)\\s+(?:is|will\\s+be)\\s+(${NAME})`),
  ];
  const paysPattern = new RegExp(
    `^(${NAMES})\\s+((?:will\\s+|shall\\s+|must\\s+|each\\s+|agrees?\\s+to\\s+)*)pays?\\s+(?:(${NAME})\\s+)?(?=${AMOUNT})`
  );
  const paidPattern = new RegExp(`^(${NAME})\\s+${PAID_VERB}\\s+(?=${AMOUNT})`);
  const eachOfPattern = new RegExp(`^Each\\s+of\\s+(${NAMES})\\s+${PAID_VERB}\\s+(?=${AMOUNT})`);
  const eachOfGroupPattern = new RegExp(
    `^Each\\s+of\\s+the\\s+(\\d+|[a-z]+)\\s+([a-z][a-z ]*?)\\s+${PAID_VERB}\\s+(?=${AMOUNT})`,
    "i"
  );

  const stakePattern = new RegExp(`\\bstakes?\\s+(?:of\\s+)?(${AMOUNT})`, "i");

  for (const sentence of sentences) {
    // "... puts down a stake of ₹5,000" sets what each payee stakes before the start.
    const staked = sentence.match(stakePattern);
    if (staked) {
      const amount = parseAmount(staked[1]);
      if (Number.isNaN(amount)) unclear("The stake is not in whole rupees", "What is the exact stake in rupees?", sentence);
      else checklist.stake = amount;
      continue;
    }

    const judge = judgePatterns.map((pattern) => sentence.match(pattern)).find(Boolean);
    if (judge && !NOT_A_NAME.has(judge[1].split(/\s+/)[0])) {
      checklist.judge.name = judge[1].trim();
      continue;
    }
    if (/\bdisputes?\b/i.test(sentence) && !new RegExp(AMOUNT, "i").test(sentence)) {
      unclear("The judge is not named", "Who settles a dispute? Give one person's name.", sentence);
      continue;
    }

    // "Each of Dev, Kavya and Omar is paid ₹X when ..." is one stage per person.
    const eachOf = sentence.match(eachOfPattern);
    if (eachOf) {
      const payees = splitNames(eachOf[1]);
      for (const amount of amountsIn(sentence, eachOf[0].length)) {
        if (Number.isNaN(amount.value) || amount.condition === null) {
          unclear("This shared payment could not be read", "How much is each person paid, and when?", sentence);
          continue;
        }
        for (const payee of payees) addStages(payee, amount, sentence);
      }
      continue;
    }

    // "Each of the four developers is paid ..." gives a count but no names.
    // The stages are created with no payee, and the names are asked for.
    const group = sentence.match(eachOfGroupPattern);
    if (group && !Number.isNaN(countFrom(group[1]))) {
      const count = countFrom(group[1]);
      for (const amount of amountsIn(sentence, group[0].length)) {
        if (Number.isNaN(amount.value) || amount.condition === null) continue;
        for (let person = 0; person < count; person++) addStages("", amount, sentence);
      }
      if (!unnamedGroups.has(sentence)) {
        unnamedGroups.add(sentence);
        unclear(`The ${group[1]} ${group[2]} are not named`, `Who are the ${group[1]} ${group[2]}? Give each name.`, sentence);
      }
      continue;
    }

    const pays = sentence.match(paysPattern);
    if (pays) {
      const payers = splitNames(pays[1]);
      const each = /\beach\b/i.test(pays[2]) || /^\s*each\b/i.test(sentence.slice(pays[0].length).replace(new RegExp(`^${AMOUNT}`, "i"), ""));
      const payee = pays[3] ? pays[3].trim() : "";
      const amounts = amountsIn(sentence, pays[0].length);
      const totals = amounts.filter((amount) => amount.condition === null);
      const stages = amounts.filter((amount) => amount.condition !== null);

      if (amounts.some((amount) => Number.isNaN(amount.value))) {
        unclear("An amount is not in whole rupees", "What is the exact amount in rupees?", sentence);
        continue;
      }
      for (const stage of stages) addStages(payee, stage, sentence);

      // What the payers put in: the stated total if there is one, otherwise the stages just listed.
      const paidIn =
        totals.length > 0
          ? totals[0].value
          : stages.reduce((total, stage) => total + stage.value * (stage.months || 1), 0);
      if (each || payers.length === 1) {
        for (const payer of payers) addPayer(payer, paidIn);
      } else if (paidIn % payers.length === 0) {
        for (const payer of payers) addPayer(payer, paidIn / payers.length);
      } else {
        for (const payer of payers) addPayer(payer, 0);
        unclear("The split between payers is not stated", `How is ₹${paidIn} divided between ${payers.join(", ")}?`, sentence);
      }
      continue;
    }

    const paid = sentence.match(paidPattern);
    if (paid && !NOT_A_NAME.has(paid[1].split(/\s+/)[0])) {
      const payee = paid[1].trim();
      for (const amount of amountsIn(sentence, paid[0].length)) {
        if (Number.isNaN(amount.value)) {
          unclear("An amount is not in whole rupees", "What is the exact amount in rupees?", sentence);
        } else if (amount.condition === null) {
          addStage(payee, amount.value, "", sentence);
          unclear("A payment has no condition", `When exactly is ${payee} paid ₹${amount.value}?`, sentence);
        } else {
          addStages(payee, amount, sentence);
        }
      }
      continue;
    }

    if (new RegExp(AMOUNT, "i").test(sentence)) {
      unclear("This line mentions money but could not be read", "Who pays, who is paid, how much, and when?", sentence);
    }
  }

  if (checklist.payers.length === 0) unclear("Nobody is named as paying", "Who puts the money in, and how much each?", "");
  if (checklist.stages.length === 0) unclear("No stages were found", "What are the stages, who is paid for each, and how much?", "");
  if (!checklist.judge.name && !checklist.unclear.some((item) => item.issue === "The judge is not named")) {
    unclear("The judge is not named", "Who settles a dispute? Give one person's name.", "");
  }
  for (const stage of checklist.stages) {
    if (!stage.payee && !unnamedGroups.has(stage.source)) {
      unclear("A stage does not say who is paid", `Who is paid ₹${stage.amount}?`, stage.source);
    }
  }

  checklist.total = checklist.stages.reduce((total, stage) => total + stage.amount, 0);
  const paidIn = checklist.payers.reduce((total, payer) => total + payer.share, 0);
  if (checklist.payers.length > 0 && checklist.stages.length > 0 && paidIn !== checklist.total) {
    unclear(
      "The amounts do not add up",
      `The payers put in ₹${paidIn} but the stages add up to ₹${checklist.total}. Which is right?`,
      ""
    );
  }

  checklist.unclear.push(...vaguePhrasesIn(text));

  checklist.title = (sentences[0] || "").replace(/[.!?;]+$/, "").slice(0, 70);
  return checklist;
}

module.exports = { readByRules, vaguePhrasesIn, parseAmount, sentencesOf };
