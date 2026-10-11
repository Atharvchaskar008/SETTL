// The model reader. It asks a language model to read the deal text and fill in
// the checklist. Its answer is only ever a proposal: index.js passes it through
// the same source check and validation as the offline reader, and nothing here
// can reach the chain.

const { emptyChecklist } = require("./validate");

const DEFAULT_CLAUDE_MODEL = "claude-opus-5-5";
const TIMEOUT_MS = 30_000;

const SYSTEM = `You read a deal written in plain language and fill in a checklist for a staged-payment escrow.

The checklist has:
- title: a short name for the deal.
- payers: the people or organisations who put money in, each with a share in whole rupees.
- judge: the one person who settles disputes.
- stages: each payment that happens when something is done. Every stage has a short title, the payee, the amount in whole rupees, the condition that must be true, and source.
- unclear: anything a careful reader could not act on as written. Each item has the issue, a question that would resolve it, and source.
- total: the sum of the stage amounts.
- stake: what each payee must put in before the deal starts and loses by walking away, in whole rupees. Use 0 when the text does not ask for one.

Rules:
1. Use only what the text says. Never invent a name, an amount, a date or a judge. If something is missing, leave that field as "" or 0 and add an unclear item asking for it.
2. source must be copied from the deal text exactly, character for character. It can be a sentence or a phrase. An unclear item about something that is missing altogether may use "" as its source.
3. Amounts are whole rupees with no commas or symbols. "1,20,000" is 120000 and "2 lakh" is 200000.
4. "Each of N people is paid X" is one stage per person. A payment that repeats every month is one stage per month, titled "Month 1", "Month 2" and so on.
5. The judge must not be a payer or a payee, and a payee must not be a payer. If the text breaks this, keep what it says and add an unclear item.
6. Wording that cannot be checked, such as "satisfactory", "good quality", "a reasonable time", "soon" or "about 20,000", gets one unclear item each, quoting the phrase.
7. If the payers' shares and the stage amounts do not add up to the same figure, keep the figures as written and add an unclear item giving both numbers.
8. A deal that is clear and complete has an empty unclear list.`;

const text = { type: "string" };
const rupees = { type: "integer" };
const object = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const CHECKLIST_SCHEMA = object({
  title: text,
  payers: { type: "array", items: object({ name: text, share: rupees }) },
  judge: object({ name: text }),
  stages: { type: "array", items: object({ title: text, payee: text, amount: rupees, condition: text, source: text }) },
  unclear: { type: "array", items: object({ issue: text, question: text, source: text }) },
  total: rupees,
  stake: rupees,
});

const userPrompt = (dealText) => `Deal text:\n\n${dealText}`;

/**
 * Which model to use, decided from the environment alone.
 * @returns {{ name: "claude" | "gemini", model: string } | null} null means "use the offline reader".
 */
function providerFrom(env) {
  if ((env.CHECKER_MODE || "").toLowerCase() === "rules") return null;
  if (env.ANTHROPIC_API_KEY) return { name: "claude", model: env.LLM_MODEL || DEFAULT_CLAUDE_MODEL };
  if (env.GEMINI_API_KEY) {
    if (!env.LLM_MODEL) throw new Error("GEMINI_API_KEY is set but LLM_MODEL is not. Set LLM_MODEL to a Gemini model name.");
    return { name: "gemini", model: env.LLM_MODEL };
  }
  return null;
}

async function callClaude(dealText, model, env) {
  const { Anthropic } = require("@anthropic-ai/sdk");
  // No automatic retries: a slow model should hand over to the offline reader, not stall the request.
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0 });

  let response;
  try {
    response = await client.messages.create(
      {
        model,
        max_tokens: 16000,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt(dealText) }],
        output_config: { effort: "low", format: { type: "json_schema", schema: CHECKLIST_SCHEMA } },
      },
      { timeout: TIMEOUT_MS }
    );
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new Error("The Anthropic API key was rejected.");
    if (error instanceof Anthropic.RateLimitError) throw new Error("The model is rate limited right now.");
    if (error instanceof Anthropic.APIConnectionTimeoutError) throw new Error("The model did not answer in time.");
    if (error instanceof Anthropic.APIConnectionError) throw new Error("The model could not be reached.");
    if (error instanceof Anthropic.APIError) throw new Error(`The model returned an error (${error.status}).`);
    throw error;
  }

  if (response.stop_reason === "refusal") throw new Error("The model declined to read this deal.");
  if (response.stop_reason === "max_tokens") throw new Error("The model's answer was cut off.");
  const block = response.content.find((part) => part.type === "text");
  if (!block) throw new Error("The model returned no text.");
  return block.text;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(dealText, model, env) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const deadline = AbortSignal.timeout(TIMEOUT_MS);
  const post = (thinking) =>
    fetch(`${url}?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: deadline,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\n\nAnswer with one JSON object in this shape and nothing else:\n${JSON.stringify(emptyChecklist())}` }] },
        contents: [{ role: "user", parts: [{ text: userPrompt(dealText) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0, ...thinking },
      }),
    });

  let response;
  try {
    // This is a short extraction, so the model is asked to think only a little:
    // it answers in a few seconds, not fifteen. Models that do not take the
    // setting answer 400, and the request is sent again without it.
    response = await post({ thinkingConfig: { thinkingLevel: "low" } });
    if (response.status === 400) response = await post({});
    // "Busy" and "slow down" pass quickly, so they get one more try.
    if (response.status === 503 || response.status === 429) {
      await pause(1500);
      response = await post({});
    }
  } catch (error) {
    throw new Error(error.name === "TimeoutError" ? "The model did not answer in time." : "The model could not be reached.");
  }
  if (!response.ok) throw new Error(`The model returned an error (${response.status}).`);

  const body = await response.json();
  const parts = body.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) throw new Error("The model returned no text.");
  return parts.map((part) => part.text || "").join("");
}

const wholeNumber = (value) => {
  const number = typeof value === "string" ? Number(value.replace(/[,₹\s]/g, "")) : value;
  return Number.isInteger(number) ? number : 0;
};
const string = (value) => (typeof value === "string" ? value : "");
const list = (value) => (Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : []);

/** Forces whatever the model returned into the checklist shape, without adding anything. */
function normalise(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The model's answer was not a checklist.");
  return {
    title: string(raw.title),
    payers: list(raw.payers).map((payer) => ({ name: string(payer.name).trim(), share: wholeNumber(payer.share) })),
    judge: { name: string(raw.judge && raw.judge.name).trim() },
    stages: list(raw.stages).map((stage) => ({
      title: string(stage.title),
      payee: string(stage.payee).trim(),
      amount: wholeNumber(stage.amount),
      condition: string(stage.condition),
      source: string(stage.source),
    })),
    unclear: list(raw.unclear).map((item) => ({
      issue: string(item.issue),
      question: string(item.question),
      source: string(item.source),
    })),
    total: wholeNumber(raw.total),
    stake: wholeNumber(raw.stake),
  };
}

/** Reads the first JSON object out of a model answer, with or without a code fence around it. */
function parseAnswer(answer) {
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The model's answer was not JSON.");
  try {
    return JSON.parse(answer.slice(start, end + 1));
  } catch (error) {
    throw new Error("The model's answer was not valid JSON.");
  }
}

/**
 * Reads deal text with the configured model.
 * @returns {Promise<object>} a checklist in the format described in validate.js
 * @throws when the model is unavailable or its answer is unusable; the caller falls back
 */
async function readByModel(dealText, provider, env) {
  const call = provider.name === "claude" ? callClaude : callGemini;
  const answer = await call(dealText, provider.model, env);
  return normalise(parseAnswer(answer));
}

const TRANSCRIBE =
  "Copy out the text of this document exactly as it is written, in reading order. Do not summarise, correct, translate or add anything. Answer with the text only.";

/**
 * Reads the words out of a PDF or a picture of a document. The answer is plain
 * text and is treated exactly like text a person typed: the same reader and
 * the same checks run on it afterwards, and a person still has to confirm.
 *
 * @param {{ data: string, type: string }} file  base64 content and its media type
 * @throws when the model is unavailable
 */
async function transcribe(file, provider, env) {
  if (provider.name === "claude") {
    const { Anthropic } = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0 });
    const source = { type: "base64", media_type: file.type, data: file.data };
    const response = await client.messages.create(
      {
        model: provider.model,
        max_tokens: 8000,
        messages: [
          { role: "user", content: [{ type: file.type === "application/pdf" ? "document" : "image", source }, { type: "text", text: TRANSCRIBE }] },
        ],
      },
      { timeout: TIMEOUT_MS }
    );
    return response.content.map((block) => (block.type === "text" ? block.text : "")).join("");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`;
  let response;
  try {
    response = await fetch(`${url}?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ inlineData: { mimeType: file.type, data: file.data } }, { text: TRANSCRIBE }] }],
        generationConfig: { temperature: 0 },
      }),
    });
  } catch (error) {
    throw new Error(error.name === "TimeoutError" ? "The model did not answer in time." : "The model could not be reached.");
  }
  if (!response.ok) throw new Error(`The model returned an error (${response.status}).`);
  const parts = (await response.json()).candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) throw new Error("The model returned no text.");
  return parts.map((part) => part.text || "").join("");
}

module.exports = { readByModel, transcribe, providerFrom, normalise, parseAnswer, CHECKLIST_SCHEMA };
