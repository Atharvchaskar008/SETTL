// The deal checker: deal text in, proposed checklist out.
//
// It tries the language model first. If there is no key, the model is slow,
// errors, declines, or answers with something unusable, the offline reader
// takes over. Either way the result says which reader produced it and why,
// and it has passed the same source check.

const { readByRules } = require("./rules");
const { readByModel, providerFrom } = require("./model");
const { dropUnsourced } = require("./validate");

/**
 * @param {string} text  the deal as the organiser typed it
 * @param {object} [options]
 * @param {object} [options.env]          environment to read keys and CHECKER_MODE from
 * @param {Function} [options.modelReader]  replaces the model call; used by tests
 * @returns {Promise<{
 *   checklist: object,
 *   readBy: "model" | "rules",
 *   model: string | null,
 *   fallbackReason: string | null,
 *   dropped: { kind: string, label: string, source: string }[]
 * }>}
 */
// Every amount in Settl is in rupees. A deal written in another currency would
// otherwise have its numbers read as rupees, by either reader, without a word.
const OTHER_CURRENCY = /[$€£¥]|\b(?:USD|EUR|GBP|dollars?|euros?|pounds?)\b/i;

/** Adds an unclear point when the text names a currency other than rupees, so a person must settle it. */
function flagOtherCurrency(checklist, text) {
  const found = text.match(OTHER_CURRENCY);
  if (!found) return checklist;
  return {
    ...checklist,
    unclear: [
      ...checklist.unclear,
      {
        issue: "Another currency is mentioned",
        question: `The deal mentions "${found[0]}". Settl works in rupees. Accept this to treat every amount as rupees, or edit the words.`,
        source: found[0],
      },
    ],
  };
}

async function readDeal(text, { env = process.env, modelReader = readByModel } = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("The deal text is empty.");
  }

  let provider = null;
  let fallbackReason = null;
  try {
    provider = providerFrom(env);
    if (!provider) {
      fallbackReason =
        (env.CHECKER_MODE || "").toLowerCase() === "rules"
          ? "The offline reader was chosen with CHECKER_MODE=rules."
          : "No model key is configured.";
    }
  } catch (error) {
    fallbackReason = error.message;
  }

  if (provider) {
    try {
      const proposed = await modelReader(text, provider, env);
      const { checklist, dropped } = dropUnsourced(proposed, text);
      if (checklist.stages.length === 0) {
        throw new Error("The model proposed no stage that quotes the deal text.");
      }
      return {
        checklist: { ...flagOtherCurrency(checklist, text), readBy: "model" },
        readBy: "model",
        model: provider.model,
        fallbackReason: null,
        dropped,
      };
    } catch (error) {
      fallbackReason = error.message;
    }
  }

  const { checklist, dropped } = dropUnsourced(readByRules(text), text);
  return { checklist: { ...flagOtherCurrency(checklist, text), readBy: "rules" }, readBy: "rules", model: null, fallbackReason, dropped };
}

module.exports = { readDeal };
