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
      return { checklist: { ...checklist, readBy: "model" }, readBy: "model", model: provider.model, fallbackReason: null, dropped };
    } catch (error) {
      fallbackReason = error.message;
    }
  }

  const { checklist, dropped } = dropUnsourced(readByRules(text), text);
  return { checklist: { ...checklist, readBy: "rules" }, readBy: "rules", model: null, fallbackReason, dropped };
}

module.exports = { readDeal };
