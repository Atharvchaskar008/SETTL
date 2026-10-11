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
const { normalise } = require("./checker/model");
const { findPerson, signerFor, WALLET } = require("./people");
const chain = require("./chain");

const { ethers } = chain;

// The last part of a route's path names the action, except for these.
const ACTION_NAMES = { checklist: "edit", transactions: "report" };

// Contract functions and the action names the history uses for them.
const WALLET_ACTIONS = { markComplete: "complete" };
const STAGE_METHODS = new Set(["markComplete", "approve", "dispute", "resolve"]);

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
      checklist: deal.checklist,
      members,
      agreed: deal.agreed,
      waitingFor: members.filter((name) => !deal.agreed.some((agreed) => sameName(agreed, name))),
      agreementHash: deal.agreementHash,
      // What each member signs to agree, and the signatures collected so far.
      agreementMessage: deal.agreementHash ? agreementMessage(deal) : null,
      signatures: deal.signatures,
      vaultAddress: deal.vault,
    };
  };

  /** The same view, plus what the vault says once the deal is locked. */
  const fullView = async (deal) => {
    const base = view(deal);
    if (deal.status !== "locked") return { ...base, problems: problemsIn(deal) };

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
          name,
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
    deal.history.push({ time: now(), result: "accepted", ...entry });
    store.save();
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
      const text = request.body && request.body.text;
      if (typeof text !== "string" || !text.trim()) {
        return response.status(400).json({ error: 'Send the deal as text in "text".' });
      }
      const organiser = actorOf(request, response);
      if (!organiser) return;

      const read = await readDeal(text, { env });
      const deal = store.addDeal({
        id: store.nextDealId(),
        organiser: organiser.name,
        createdAt: now(),
        status: "draft",
        text,
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
      deal.agreementHash = fingerprint(deal.text, deal.checklist);
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

      const addressOf = (name) => findPerson(store, name).address;
      deal.vault = await chain.deployVault({
        payers: deal.checklist.payers.map((payer) => ({ address: addressOf(payer.name), share: payer.share })),
        judge: addressOf(deal.checklist.judge.name),
        stages: deal.checklist.stages.map((stage) => ({ payee: addressOf(stage.payee), amount: stage.amount })),
        agreementHash: deal.agreementHash,
        stake: deal.checklist.stake || 0,
      });
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
      if (deal.status !== "locked") {
        return refuse(request, response, { rule: "not-locked", reason: "The deal is not locked yet, so it has no transactions." });
      }
      const vault = await chain.vaultAt(deal.vault);
      const sent = await chain.lookUp(hash, vault);
      if (!sent) {
        return refuse(request, response, { rule: "unknown-transaction", reason: "That transaction is not on the chain." });
      }
      const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
      if (!same(sent.to, deal.vault) || !same(sent.from, actor.address)) {
        return refuse(request, response, {
          rule: "not-your-transaction",
          reason: "That transaction was not sent by you to this deal's vault.",
        });
      }
      if (deal.history.some((entry) => entry.tx === hash)) {
        return response.json({ accepted: true, alreadyRecorded: true, deal: await fullView(deal) });
      }
      if (!sent.succeeded) {
        return refuse(request, response, { rule: "failed-on-chain", reason: "The contract refused that transaction, so nothing changed." });
      }

      const action = WALLET_ACTIONS[sent.method] || sent.method;
      const entry = { person: actor.name, action, tx: hash, via: "wallet", detail: "Signed and sent from their own wallet." };
      if (STAGE_METHODS.has(sent.method)) entry.stage = Number(sent.args[0]) + 1;
      record(deal, entry);
      response.json({ accepted: true, action, stage: entry.stage, tx: hash, deal: await fullView(deal) });
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
          const row = { id: deal.id, title: deal.checklist.title, organiser: deal.organiser, status: deal.status, total };
          if (deal.status !== "locked") return { ...row, stageCount: deal.checklist.stages.length, stagesSettled: 0 };
          const vault = await chain.readVault(deal.vault);
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
  router.get("/deals/:id/history", (request, response) => {
    const deal = dealOf(request, response);
    if (deal) response.json({ history: deal.history });
  });

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

      const [settlement, vault] = await Promise.all([chain.readSettlement(deal.vault), chain.readVault(deal.vault)]);
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

/** The fingerprint stored in the vault: it ties the vault to exactly this text and checklist. */
function fingerprint(text, checklist) {
  return ethers.id(stableStringify({ text, checklist }));
}

/** The exact words a member signs to agree. The fingerprint binds them to this text and checklist. */
function agreementMessage(deal) {
  return [
    "Settl agreement",
    `Deal: ${deal.id}`,
    `Title: ${deal.checklist.title}`,
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
