// Deal routes. A deal moves through four steps before any money is involved:
//
//   draft      the checker has proposed a checklist; the organiser edits it
//   confirmed  the organiser has confirmed a checklist with no open problems
//   agreed     every person in the deal has agreed to it
//   locked     a vault exists on the chain; from here the contract is in charge
//
// Before the lock, this file enforces the rules. After it, the server only
// forwards each action to the vault as the person who asked, and reports what
// the contract said.
//
// Every accepted action and every refused attempt is written to the deal's
// history, with who, what, when and why.

const express = require("express");
const { readDeal } = require("./checker");
const { validate, membersOf, sameName } = require("./checker/validate");
const { normalise, providerFrom, transcribe } = require("./checker/model");
const { findPerson, signerFor, WALLET } = require("./people");
const chain = require("./chain");

const { ethers } = chain;

// The last part of a route's path names the action, except for these.
const ACTION_NAMES = { checklist: "edit", text: "rewrite", transactions: "report" };

const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
const MAX_DOCUMENT_CHARACTERS = 20000;
const READABLE_BY_MODEL = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

/** A problem with an attached document, said in plain words. */
const documentProblem = (rule, reason) => Object.assign(new Error(reason), { rule });

/**
 * The words of an attached document, and a fingerprint of the file itself.
 *
 * A text file is used as it is. A PDF or a picture has its words copied out by
 * the model, so it needs the model to be available. Either way the result is
 * only text for the reader: it goes through the same checks as typed text.
 */
async function readDocument(document, readerEnv) {
  const name = (typeof document.name === "string" && document.name.trim().slice(0, 80)) || "document";
  let bytes;
  let text;
  if (typeof document.text === "string") {
    bytes = Buffer.from(document.text, "utf8");
    text = document.text;
  } else if (typeof document.data === "string" && READABLE_BY_MODEL.has(document.type)) {
    bytes = Buffer.from(document.data, "base64");
    if (bytes.length > MAX_DOCUMENT_BYTES) throw documentProblem("document-too-large", "The document is larger than 4 MB.");
    const provider = providerFrom(readerEnv);
    if (!provider) {
      throw documentProblem("document-needs-model", "A PDF or a picture needs the AI to read it. Attach a text file, or switch the AI on.");
    }
    try {
      text = await transcribe({ data: document.data, type: document.type }, provider, readerEnv);
    } catch (error) {
      throw documentProblem("document-unread", `The document could not be read: ${error.message} Attach a text file instead.`);
    }
  } else {
    throw documentProblem("document-kind", "Attach a text file, a PDF or a picture.");
  }
  if (bytes.length > MAX_DOCUMENT_BYTES) throw documentProblem("document-too-large", "The document is larger than 4 MB.");
  text = text.replace(/\r\n/g, "\n").trim();
  if (!text) throw documentProblem("document-empty", "The document has no words that can be read.");
  if (text.length > MAX_DOCUMENT_CHARACTERS) throw documentProblem("document-too-long", "The document is too long. Attach only the part that sets out the deal.");
  return { name, fingerprint: ethers.keccak256(bytes), text };
}

function dealRoutes({ store, env, requireWallet = false }) {
  const router = express.Router();
  const now = () => new Date().toISOString();
  const peopleNames = () => store.people().map((person) => person.name);
  const problemsIn = (deal) => validate(deal.checklist, deal.text, peopleNames());
  const wrap = (handler) => (request, response, next) => handler(request, response).catch(next);
  const nameAt = (address) => {
    const person = store.people().find((candidate) => candidate.address === address);
    return person ? person.name : address;
  };

  /** What a client sees of a deal before it is locked. */
  const view = (deal) => {
    const members = membersOf(deal.checklist);
    return {
      id: deal.id,
      title: deal.checklist.title,
      organiser: deal.organiser,
      status: deal.status,
      readBy: deal.readBy,
      model: deal.model,
      fallbackReason: deal.fallbackReason,
      dropped: deal.dropped,
      text: deal.text,
      document: deal.document || null,
      checklist: deal.checklist,
      members,
      agreed: deal.agreed,
      waitingFor: members.filter((name) => !deal.agreed.some((agreed) => sameName(agreed, name))),
      agreementHash: deal.agreementHash,
      // What each member signs to agree, and the signatures collected so far.
      agreementMessage: deal.agreementHash ? agreementMessage(deal) : null,
      signatures: deal.signatures,
      addresses: deal.addresses || null,
      vaultAddress: deal.vault,
    };
  };

  /** One member as the checklist describes them: what they pay, what they earn, and their account if they have one. */
  const memberOf = (deal, name) => {
    const { payers, stages, judge } = deal.checklist;
    const person = findPerson(store, name);
    const payer = payers.find((candidate) => candidate.name && sameName(candidate.name, name));
    const earns = stages.filter((stage) => stage.payee && sameName(stage.payee, name)).reduce((sum, stage) => sum + stage.amount, 0);
    return {
      name,
      known: Boolean(person),
      kind: person ? person.kind : null,
      address: person ? person.address : null,
      roles: [payer && "payer", earns > 0 && "payee", judge.name && sameName(judge.name, name) && "judge"].filter(Boolean),
      ...(payer ? { share: payer.share } : {}),
      ...(earns > 0 ? { earns } : {}),
      agreed: deal.agreed.some((agreed) => sameName(agreed, name)),
    };
  };

  /** The agreed terms in the form a vault is created from: addresses and whole rupees. */
  const termsOf = (deal) => {
    const signedFor = Object.entries(deal.addresses || {});
    const addressOf = (name) => (signedFor.find(([member]) => sameName(member, name)) || [null, findPerson(store, name).address])[1];
    return {
      payers: deal.checklist.payers.map((payer) => ({ address: addressOf(payer.name), share: payer.share })),
      judge: addressOf(deal.checklist.judge.name),
      stages: deal.checklist.stages.map((stage) => ({ payee: addressOf(stage.payee), amount: stage.amount })),
      agreementHash: deal.agreementHash,
      stake: deal.checklist.stake || 0,
    };
  };

  /** The same view, plus what the vault says once the deal is locked. */
  const fullView = async (deal) => {
    const base = view(deal);
    if (deal.status !== "locked") {
      return { ...base, problems: problemsIn(deal), people: base.members.map((name) => memberOf(deal, name)) };
    }

    const vault = await chain.readVault(deal.vault);
    const judge = nameAt(vault.judge);
    const stages = vault.stages.map((stage, index) => {
      const payee = nameAt(stage.payee);
      const waitingFor = { Pending: payee, Completed: "the payers", Disputed: judge }[stage.state] || null;
      return {
        number: stage.number,
        title: deal.checklist.stages[index].title,
        condition: deal.checklist.stages[index].condition,
        payee,
        amount: stage.amount,
        state: stage.state,
        approvals: stage.approvals,
        approvalsNeeded: vault.approvalsNeeded,
        waitingFor,
      };
    });

    const people = await Promise.all(
      base.members.map(async (name) => {
        const person = findPerson(store, name);
        const payer = vault.payers.find((candidate) => candidate.address === person.address);
        const payee = vault.payees.find((candidate) => candidate.address === person.address);
        const roles = [payer && "payer", payee && "payee", vault.judge === person.address && "judge"].filter(Boolean);
        return {
          ...memberOf(deal, name),
          roles,
          ...(payer ? { share: payer.share, deposited: payer.deposited } : {}),
          ...(payee && vault.stake > 0 ? { staked: payee.staked, left: payee.left } : {}),
          canWithdraw: await chain.owedTo(deal.vault, person.address),
        };
      })
    );

    return { ...base, phase: vault.phase, stake: vault.stake, stages, people, money: vault.money };
  };

  const record = (deal, entry) => {
    // A transaction is recorded once, even if the chain was read between its being mined and this call.
    const existing = entry.tx && deal.history.find((earlier) => earlier.tx === entry.tx);
    if (existing) Object.assign(existing, entry);
    else deal.history.push({ time: now(), result: "accepted", ...entry });
    store.save();
  };

  /**
   * Adds to the history every action the vault has recorded that the history
   * does not hold yet. Who did what is taken from the vault's own events, so a
   * step taken straight on the contract, or delivered by a wallet through a
   * contract of its own, is recorded as faithfully as one sent through this server.
   */
  const syncHistory = async (deal) => {
    const known = new Set(deal.history.map((entry) => entry.tx).filter(Boolean));
    const actions = await chain.readActions(deal.vault, deal.vaultBlock || 0);
    for (const action of actions) {
      if (known.has(action.tx)) continue;
      const person = store.people().find((candidate) => candidate.address === action.by);
      const byWallet = !person || person.kind === WALLET;
      record(deal, {
        person: person ? person.name : action.by,
        action: action.action,
        ...(action.stage ? { stage: action.stage } : {}),
        tx: action.tx,
        via: byWallet ? "wallet" : "chain",
        detail: byWallet ? "Signed and sent from their own wallet." : "Read from the vault's record on the chain.",
      });
    }
  };

  /**
   * Answers 409 with a plain reason, and writes the attempt to the deal's
   * history. Who tried, what they tried and on which stage are read from the
   * request, so no refusal can be forgotten.
   */
  const refuse = (request, response, { rule, reason, extra = {} }) => {
    const deal = request.params.id ? store.findDeal(request.params.id) : null;
    if (deal) {
      const last = request.path.split("/").filter(Boolean).pop();
      const named = request.body && typeof request.body.person === "string" && request.body.person.trim();
      const entry = {
        time: now(),
        result: "refused",
        person: named || (request.signedIn && request.signedIn.name) || "unknown",
        action: ACTION_NAMES[last] || last,
        rule,
        reason,
      };
      if (request.params.n !== undefined) entry.stage = Number(request.params.n);
      deal.history.push(entry);
      store.save();
    }
    response.status(409).json({ refused: true, rule, reason, ...extra });
  };

  /**
   * Who is acting, or a response explaining why nobody is.
   *
   * A wallet session decides it outright: the signed-in person acts, and can
   * act as nobody else. Without a session the request may name a demo person.
   * It may not name a wallet person, because nothing would prove it is them.
   */
  const actorOf = (request, response) => {
    const name = request.body && request.body.person;
    const named = typeof name === "string" && name.trim() !== "";

    if (request.signedIn) {
      if (named && !sameName(name, request.signedIn.name)) {
        refuse(request, response, {
          rule: "not-you",
          reason: `You are signed in as ${request.signedIn.name}, so you cannot act as ${name.trim()}.`,
        });
        return null;
      }
      return request.signedIn;
    }

    if (requireWallet) {
      response.status(401).json({ error: "Sign in with your wallet first." });
      return null;
    }
    if (!named) {
      response.status(400).json({ error: 'Say who is acting: add "person" to the request body, or sign in with a wallet.' });
      return null;
    }
    const person = findPerson(store, name);
    if (!person) {
      refuse(request, response, { rule: "unknown-person", reason: `${name.trim()} has not been added as a person.` });
      return null;
    }
    if (person.kind === WALLET) {
      refuse(request, response, {
        rule: "sign-in-required",
        reason: `${person.name} signs with their own wallet. Sign in with that wallet to act as ${person.name}.`,
      });
      return null;
    }
    return person;
  };

  const dealOf = (request, response) => {
    const deal = store.findDeal(request.params.id);
    if (!deal) response.status(404).json({ error: `There is no deal ${request.params.id}.` });
    return deal;
  };

  const organiserOnly = (request, response, deal, actor, action) => {
    if (sameName(actor.name, deal.organiser)) return true;
    refuse(request, response, {
      rule: "not-organiser",
      reason: `Only ${deal.organiser}, who created this deal, can ${action}.`,
    });
    return false;
  };

  // Text in, proposed checklist out. Nothing here touches the chain.
  router.post(
    "/deals/draft",
    wrap(async (request, response) => {
      const body = request.body || {};
      const typed = typeof body.text === "string" ? body.text.trim() : "";
      if (!typed && !body.document) {
        return response.status(400).json({ error: 'Send the deal as text in "text", or attach a document.' });
      }
      const organiser = actorOf(request, response);
      if (!organiser) return;

      // "offline": true asks for the offline reader for this one draft, whatever keys are
      // configured. It gives the same result every time, and shows the product working without a model.
      const offline = body.offline === true;
      const readerEnv = offline ? { ...env, CHECKER_MODE: "rules" } : env;

      // An attached document adds its words to the typed ones. From here on they are one text.
      let document = null;
      if (body.document) {
        try {
          document = await readDocument(body.document, readerEnv);
        } catch (error) {
          if (!error.rule) throw error;
          return response.status(409).json({ refused: true, rule: error.rule, reason: error.message });
        }
      }
      const text = document ? [typed, document.text].filter(Boolean).join("\n\n") : typed;
      const read = await readDeal(text, { env: readerEnv });
      const deal = store.addDeal({
        id: store.nextDealId(),
        organiser: organiser.name,
        createdAt: now(),
        status: "draft",
        text,
        document: document ? { name: document.name, fingerprint: document.fingerprint } : null,
        checklist: read.checklist,
        readBy: read.readBy,
        model: read.model,
        fallbackReason: read.fallbackReason,
        dropped: read.dropped,
        agreed: [],
        signatures: [],
        agreementHash: null,
        vault: null,
        history: [],
      });
      record(deal, {
        person: organiser.name,
        action: "draft",
        detail: `Checklist proposed by ${read.readBy === "model" ? "the model" : "the offline reader"}.`,
      });

      response.status(201).json({ deal: view(deal), problems: problemsIn(deal) });
    })
  );

  // The organiser edits the checklist. Any edit sends the deal back to draft
  // and clears every agreement, because people agreed to the earlier version.
  router.put(
    "/deals/:id/checklist",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor || !organiserOnly(request, response, deal, actor, "edit the checklist")) return;
      if (deal.status === "locked") {
        return refuse(request, response, {
          rule: "already-locked",
          reason: "The deal is locked, so its checklist can no longer change.",
        });
      }

      let checklist;
      try {
        checklist = normalise(request.body.checklist);
      } catch (error) {
        return response.status(400).json({ error: 'Send the edited checklist in "checklist".' });
      }

      const hadAgreements = deal.agreed.length > 0;
      deal.checklist = { ...checklist, readBy: deal.readBy };
      deal.status = "draft";
      deal.agreed = [];
      deal.signatures = [];
      deal.agreementHash = null;
      record(deal, {
        person: actor.name,
        action: "edit",
        detail: hadAgreements ? "Checklist edited; earlier agreements were cleared." : "Checklist edited.",
      });

      response.json({ deal: view(deal), problems: problemsIn(deal) });
    })
  );

  // The organiser changes the words of the deal and has them read again. As with
  // any edit, the deal goes back to draft and earlier agreements are cleared.
  router.put(
    "/deals/:id/text",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor || !organiserOnly(request, response, deal, actor, "rewrite the deal")) return;
      if (deal.status === "locked") {
        return refuse(request, response, { rule: "already-locked", reason: "The deal is locked, so its words can no longer change." });
      }
      const text = request.body && request.body.text;
      if (typeof text !== "string" || !text.trim()) {
        return response.status(400).json({ error: 'Send the deal as text in "text".' });
      }

      const read = await readDeal(text, { env: request.body.offline === true ? { ...env, CHECKER_MODE: "rules" } : env });
      Object.assign(deal, {
        text,
        checklist: read.checklist,
        readBy: read.readBy,
        model: read.model,
        fallbackReason: read.fallbackReason,
        dropped: read.dropped,
        status: "draft",
        agreed: [],
        signatures: [],
        agreementHash: null,
      });
      record(deal, {
        person: actor.name,
        action: "rewrite",
        detail: `Deal rewritten and read again by ${read.readBy === "model" ? "the model" : "the offline reader"}.`,
      });

      response.json({ deal: await fullView(deal), problems: problemsIn(deal) });
    })
  );

  // A deal that never reached the chain can be thrown away by its organiser.
  router.delete(
    "/deals/:id",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor || !organiserOnly(request, response, deal, actor, "discard the deal")) return;
      if (deal.status === "locked") {
        return refuse(request, response, {
          rule: "already-locked",
          reason: "The deal is locked. Its vault is on the chain and cannot be discarded.",
        });
      }
      store.removeDeal(deal.id);
      response.json({ discarded: deal.id });
    })
  );

  // The organiser confirms. This is the person-in-the-loop step: nothing the
  // checker proposed can go further until a person has confirmed it, and
  // confirming is refused while any problem or unclear point is open.
  router.post(
    "/deals/:id/confirm",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor || !organiserOnly(request, response, deal, actor, "confirm the checklist")) return;
      if (deal.status !== "draft") {
        return refuse(request, response, { rule: "not-a-draft", reason: "This checklist has already been confirmed." });
      }

      const problems = problemsIn(deal);
      if (problems.length > 0) {
        return refuse(request, response, {
          rule: "open-problems",
          reason: `The checklist cannot be confirmed yet: ${problems.length} problem${problems.length === 1 ? "" : "s"} to fix.`,
          extra: { problems },
        });
      }

      deal.status = "confirmed";
      deal.agreed = [];
      deal.signatures = [];
      // Each member's account is fixed here and becomes part of what everyone signs,
      // so the vault can only ever be created for exactly these accounts.
      deal.addresses = Object.fromEntries(membersOf(deal.checklist).map((name) => [name, findPerson(store, name).address]));
      deal.agreementHash = fingerprint(deal.text, deal.checklist, deal.addresses, deal.document);
      record(deal, { person: actor.name, action: "confirm", detail: "Checklist confirmed. Waiting for everyone to agree." });

      response.json({ deal: view(deal) });
    })
  );

  // Each person in the deal agrees to the confirmed checklist. When the last
  // one agrees, the deal can be locked.
  router.post(
    "/deals/:id/agree",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor) return;
      if (deal.status === "draft") {
        return refuse(request, response, {
          rule: "not-confirmed",
          reason: "The organiser has not confirmed the checklist yet, so there is nothing to agree to.",
        });
      }
      if (deal.status === "locked") {
        return refuse(request, response, { rule: "already-locked", reason: "The deal is already locked." });
      }
      if (!membersOf(deal.checklist).some((name) => sameName(name, actor.name))) {
        return refuse(request, response, {
          rule: "not-a-member",
          reason: `${actor.name} is not part of this deal, so cannot agree to it.`,
        });
      }
      if (deal.agreed.some((name) => sameName(name, actor.name))) {
        return refuse(request, response, { rule: "already-agreed", reason: `${actor.name} has already agreed.` });
      }

      // Agreeing is a signature over the deal's fingerprint. A wallet person
      // signs it themselves and the server checks it. For a demo person the
      // server signs with the account it holds for them. Either way the
      // signature is kept, and anyone can check it against the address.
      const message = agreementMessage(deal);
      let signature;
      if (actor.kind === WALLET) {
        signature = request.body && request.body.signature;
        if (!signedBy(message, signature, actor.address)) {
          return refuse(request, response, {
            rule: "bad-signature",
            reason: `${actor.name} must sign the agreement with their wallet. The signature is missing or does not match.`,
            extra: { message },
          });
        }
      } else {
        signature = await (await signerFor(actor)).signMessage(message);
      }
      deal.signatures.push({ name: actor.name, address: actor.address, signature });

      deal.agreed.push(actor.name);
      const everyone = view(deal).waitingFor.length === 0;
      if (everyone) deal.status = "agreed";
      record(deal, { person: actor.name, action: "agree", detail: everyone ? "Agreed. Everyone has now agreed." : "Agreed." });

      response.json({ deal: view(deal) });
    })
  );

  // The lock deploys the vault. It reads only the confirmed checklist that
  // everyone agreed to; the checker's original proposal is never used here.
  router.post(
    "/deals/:id/lock",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor || !organiserOnly(request, response, deal, actor, "lock the deal")) return;
      if (deal.status === "locked") {
        return refuse(request, response, { rule: "already-locked", reason: "The deal is already locked." });
      }
      if (deal.status !== "agreed") {
        const waitingFor = view(deal).waitingFor;
        return refuse(request, response, {
          rule: "not-agreed",
          reason:
            deal.status === "draft"
              ? "The checklist has not been confirmed yet."
              : `Not everyone has agreed yet. Waiting for ${waitingFor.join(", ")}.`,
          extra: { waitingFor },
        });
      }

      if (actor.kind === WALLET) {
        // The server holds no key for this person, so their own wallet creates the
        // vault. The transaction is built from the agreed terms and nothing else;
        // the deal is locked only once that exact transaction is reported back.
        return response.json({
          accepted: false,
          needsWallet: true,
          action: "lock",
          transaction: await chain.deploymentFor(termsOf(deal)),
          next: `Send this transaction from your wallet, then report its hash to POST /deals/${deal.id}/transactions.`,
        });
      }

      const created = await chain.deployVault(termsOf(deal));
      deal.vault = created.address;
      deal.vaultBlock = created.block;
      deal.status = "locked";
      record(deal, { person: actor.name, action: "lock", detail: `Vault created at ${deal.vault}. Waiting for deposits.` });

      response.status(201).json({ deal: await fullView(deal) });
    })
  );

  // From here on the contract is in charge. Each route below builds one call,
  // sends it to the vault as the person who asked, and reports the outcome.
  // There is no role check in this file: if the wrong person asks, the
  // contract refuses and the refusal is passed back in plain words.
  const onChain = (action, build) =>
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor) return;
      if (deal.status !== "locked") {
        return refuse(request, response, {
          rule: "not-locked",
          reason: "The deal is not locked yet, so there is no vault to act on.",
        });
      }

      const call = await build(request, deal, actor);
      if (call.error) return response.status(400).json({ error: call.error });

      const vault = await chain.vaultAt(deal.vault);
      try {
        if (actor.kind === WALLET) {
          // The server holds no key for this person. It checks that the contract
          // would accept the action, then hands back the transaction for their
          // own wallet to sign and send. Nothing has happened on the chain yet.
          await chain.simulate(vault, actor.address, call.method, call.args, call.overrides);
          return response.json({
            accepted: false,
            needsWallet: true,
            action,
            stage: call.stage,
            transaction: await chain.prepare(vault, call.method, call.args, call.overrides),
            next: `Send this transaction from your wallet, then report its hash to POST /deals/${deal.id}/transactions.`,
          });
        }
        const { tx } = await chain.act(vault, await signerFor(actor), call.method, call.args, call.overrides);
        record(deal, { person: actor.name, action, stage: call.stage, tx, detail: call.detail });
        response.json({ accepted: true, action, stage: call.stage, tx, deal: await fullView(deal) });
      } catch (error) {
        if (!(error instanceof chain.Refusal)) throw error;
        refuse(request, response, { rule: error.rule, reason: error.reason });
      }
    });

  // A wallet person reports the transaction their wallet sent, so that it
  // appears in the deal's history. The chain already has it either way; the
  // server only checks that it is theirs, for this vault, and that it succeeded.
  router.post(
    "/deals/:id/transactions",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      const actor = deal && actorOf(request, response);
      if (!actor) return;
      const hash = request.body && request.body.hash;
      if (typeof hash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
        return response.status(400).json({ error: 'Send the transaction hash in "hash".' });
      }
      const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

      // An agreed deal has no vault yet, so the only transaction it can have is
      // the one that creates it. It is accepted only if the organiser sent it and
      // it is, byte for byte, the creation of the vault everyone agreed to.
      if (deal.status === "agreed") {
        if (!organiserOnly(request, response, deal, actor, "lock the deal")) return;
        const created = await chain.lookUp(hash);
        if (!created) {
          return refuse(request, response, { rule: "unknown-transaction", reason: "That transaction is not on the chain." });
        }
        const expected = await chain.deploymentFor(termsOf(deal));
        if (!same(created.from, actor.address) || created.to || !created.created || !same(created.data, expected.data)) {
          return refuse(request, response, {
            rule: "not-this-deal",
            reason: "That transaction does not create the vault everyone agreed to.",
          });
        }
        if (!created.succeeded) {
          return refuse(request, response, { rule: "failed-on-chain", reason: "The vault could not be created, so nothing changed." });
        }
        if (store.deals().some((other) => other.vault && same(other.vault, created.created))) {
          return refuse(request, response, { rule: "vault-in-use", reason: "That vault already belongs to another deal." });
        }
        deal.vault = created.created;
        deal.vaultBlock = created.block;
        deal.status = "locked";
        record(deal, {
          person: actor.name,
          action: "lock",
          tx: hash,
          via: "wallet",
          detail: `Vault created at ${deal.vault} from their own wallet. Waiting for deposits.`,
        });
        return response.status(201).json({ accepted: true, action: "lock", tx: hash, deal: await fullView(deal) });
      }

      if (deal.status !== "locked") {
        return refuse(request, response, { rule: "not-locked", reason: "The deal is not locked yet, so it has no transactions." });
      }
      // The vault's own record says what this transaction did and who did it. That holds
      // however the wallet delivered it: sent directly, or routed through a contract of its own.
      const recorded = () => deal.history.find((entry) => entry.tx && same(entry.tx, hash));
      const alreadyRecorded = Boolean(recorded());
      if (!recorded()) await syncHistory(deal);
      if (!recorded()) {
        const sent = await chain.lookUp(hash);
        if (!sent) {
          return refuse(request, response, { rule: "unknown-transaction", reason: "That transaction is not on the chain." });
        }
        if (!sent.succeeded) {
          return refuse(request, response, { rule: "failed-on-chain", reason: "The contract refused that transaction, so nothing changed." });
        }
        // It may have reached the chain a moment before the node this server reads from had its events.
        await syncHistory(deal);
      }
      const entry = recorded();
      if (!entry) {
        return refuse(request, response, { rule: "not-this-vault", reason: "That transaction did nothing in this deal's vault." });
      }
      if (!sameName(entry.person, actor.name)) {
        return refuse(request, response, {
          rule: "not-your-transaction",
          reason: `That transaction was ${entry.person}'s, not yours.`,
        });
      }
      response.json({
        accepted: true,
        ...(alreadyRecorded ? { alreadyRecorded: true } : {}),
        action: entry.action,
        stage: entry.stage,
        tx: hash,
        deal: await fullView(deal),
      });
    })
  );

  // What a client needs to call a vault directly: the chain, the RPC path and the contract's interface.
  router.get(
    "/contract",
    wrap(async (request, response) => {
      response.json(await chain.contractInfo());
    })
  );

  router.post(
    "/deals/:id/deposit",
    onChain("deposit", async (request, deal, actor) => {
      // A payer deposits exactly their share. Anyone else sends nothing and is refused by the contract.
      const payer = deal.checklist.payers.find((candidate) => sameName(candidate.name, actor.name));
      const share = payer ? payer.share : 0;
      return { method: "deposit", overrides: { value: chain.toWei(share) }, detail: `Deposited ₹${share}.` };
    })
  );

  router.post(
    "/deals/:id/cancel",
    onChain("cancel", async () => ({
      method: "cancel",
      detail: "Cancelled the deal before it started. Deposits were credited back.",
    }))
  );

  router.post(
    "/deals/:id/withdraw",
    onChain("withdraw", async (request, deal, actor) => {
      const amount = await chain.owedTo(deal.vault, actor.address);
      return { method: "withdraw", detail: `Withdrew ₹${amount}.` };
    })
  );

  router.post(
    "/deals/:id/stake",
    onChain("stake", async (request, deal, actor) => {
      // A payee puts in the deal's stake. Anyone else sends nothing and is refused by the contract.
      const isPayee = deal.checklist.stages.some((stage) => sameName(stage.payee, actor.name));
      const amount = isPayee ? deal.checklist.stake || 0 : 0;
      return { method: "stake", overrides: { value: chain.toWei(amount) }, detail: `Put in a stake of ₹${amount}.` };
    })
  );

  router.post(
    "/deals/:id/leave",
    onChain("leave", async () => ({
      method: "leave",
      detail: "Left the deal. Their unsettled stages were refunded and their stake went to the payers.",
    }))
  );

  // Stage numbers in the API count from 1, as people do. The contract counts from 0.
  const stageCall = (action, method, describe, extraArgs = () => []) =>
    onChain(action, async (request) => {
      const number = Number(request.params.n);
      if (!Number.isInteger(number) || number < 1) return { error: "The stage number must be a whole number from 1." };
      const extra = extraArgs(request);
      if (extra.error) return extra;
      return { method, args: [number - 1, ...extra], stage: number, detail: describe(number, request) };
    });

  router.post("/deals/:id/stages/:n/complete", stageCall("complete", "markComplete", (n) => `Marked stage ${n} done.`));
  router.post("/deals/:id/stages/:n/approve", stageCall("approve", "approve", (n) => `Approved stage ${n}.`));
  router.post("/deals/:id/stages/:n/dispute", stageCall("dispute", "dispute", (n) => `Disputed stage ${n}.`));
  router.post(
    "/deals/:id/stages/:n/resolve",
    stageCall(
      "resolve",
      "resolve",
      (n, request) => `Settled the dispute on stage ${n}: ${request.body.decision === "pay" ? "pay the payee" : "refund the payers"}.`,
      (request) => {
        const decision = request.body && request.body.decision;
        if (decision !== "pay" && decision !== "refund") return { error: 'Send "decision" as "pay" or "refund".' };
        return [decision === "pay"];
      }
    )
  );

  router.get(
    "/deals",
    wrap(async (request, response) => {
      const deals = await Promise.all(
        store.deals().map(async (deal) => {
          const total = deal.checklist.total;
          const row = {
            id: deal.id,
            title: deal.checklist.title,
            organiser: deal.organiser,
            status: deal.status,
            total,
            members: membersOf(deal.checklist),
            vaultAddress: deal.vault,
          };
          if (deal.status !== "locked") return { ...row, stageCount: deal.checklist.stages.length, stagesSettled: 0 };
          const vault = await chain.readProgress(deal.vault);
          return {
            ...row,
            phase: vault.phase,
            stageCount: vault.stages.length,
            stagesSettled: vault.stages.filter((stage) => stage.state === "Released" || stage.state === "Refunded").length,
          };
        })
      );
      response.json({ deals });
    })
  );

  router.get(
    "/deals/:id",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      if (deal) response.json({ deal: await fullView(deal) });
    })
  );

  // Oldest first. Accepted actions and refused attempts are in the same list.
  router.get(
    "/deals/:id/history",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      if (!deal) return;
      // Anything done on the vault without telling the server still belongs in the record.
      if (deal.status === "locked") await syncHistory(deal);
      response.json({ history: deal.history });
    })
  );

  // Who paid in, who was paid, who was refunded, and whether it all adds up.
  // The figures come from the vault's own events, not from the history above.
  router.get(
    "/deals/:id/summary",
    wrap(async (request, response) => {
      const deal = dealOf(request, response);
      if (!deal) return;
      if (deal.status !== "locked") {
        return response.status(409).json({
          refused: true,
          rule: "not-locked",
          reason: "The deal is not locked yet, so there is nothing to settle.",
        });
      }

      const [settlement, vault] = await Promise.all([
        chain.readSettlement(deal.vault, deal.vaultBlock || 0),
        chain.readVault(deal.vault),
      ]);
      response.json({
        summary: {
          id: deal.id,
          title: deal.checklist.title,
          phase: vault.phase,
          finished: vault.phase === "Closed" || vault.phase === "Cancelled",
          people: settlement.accounts.map(({ address, ...figures }) => ({ name: nameAt(address), ...figures })),
          stages: settlement.stages.map((stage, index) => ({
            number: stage.number,
            title: deal.checklist.stages[index].title,
            payee: nameAt(stage.payee),
            amount: stage.amount,
            outcome: stage.outcome,
          })),
          totals: settlement.totals,
          addsUp: settlement.addsUp && vault.money.reconciles,
          note: "This is a record of a simulated deal. It is not a legal document.",
        },
      });
    })
  );

  return router;
}

/** JSON with keys in a fixed order, so the same content always gives the same fingerprint. */
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * The fingerprint stored in the vault. It ties the vault to exactly this text,
 * this checklist and these accounts: change any of them and it no longer matches.
 */
function fingerprint(text, checklist, addresses = {}, document = null) {
  // An attached file's own fingerprint is included, so the vault is tied to that exact file too.
  return ethers.id(stableStringify({ text, checklist, addresses, ...(document ? { document: document.fingerprint } : {}) }));
}

/** The exact words a member signs to agree. The fingerprint binds them to this text and checklist. */
function agreementMessage(deal) {
  return [
    "Settl agreement",
    `Deal: ${deal.id}`,
    `Title: ${deal.checklist.title}`,
    ...Object.entries(deal.addresses || {}).map(([name, address]) => `${name}: ${address}`),
    `Fingerprint: ${deal.agreementHash}`,
    "I have read the checklist and I agree to it. Signing this moves no money.",
  ].join("\n");
}

/** True when `signature` is `address` signing exactly `message`. */
function signedBy(message, signature, address) {
  try {
    return typeof signature === "string" && ethers.verifyMessage(message, signature) === address;
  } catch (error) {
    return false;
  }
}

module.exports = { dealRoutes, fingerprint, agreementMessage, signedBy };
