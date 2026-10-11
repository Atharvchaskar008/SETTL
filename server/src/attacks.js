// The attack lab. Each attack deploys a fresh vault, tries to cheat it, and
// reports what actually happened. The verdicts are computed from the vault's
// state after the attempt; nothing here is a canned answer.

const express = require("express");
const chain = require("./chain");

const { ethers } = chain;

const STAGE = 10000; // rupees per stage; every attack vault has three stages
const TOTAL = 3 * STAGE;
const AGREEMENT = ethers.id("attack lab");

/** Five accounts from the far end of the list, so they never collide with real people. */
async function castOf() {
  const [payer, payee, judge, stranger, thief] = (await ethers.getSigners()).slice(-5);
  return { payer, payee, judge, stranger, thief };
}

async function freshVault(cast, { contract = "MilestoneVault", firstPayee = cast.payee.address } = {}) {
  const address = await chain.deployVault({
    contract,
    payers: [{ address: cast.payer.address, share: TOTAL }],
    judge: cast.judge.address,
    stages: [firstPayee, cast.payee.address, cast.payee.address].map((payee) => ({ payee, amount: STAGE })),
    agreementHash: AGREEMENT,
  });
  return chain.vaultAt(address, contract);
}

/** Sends each step in turn and records whether the vault accepted or refused it. */
async function attempt(vault, steps) {
  const log = [];
  for (const [who, signer, tried, method, args = [], overrides = {}] of steps) {
    try {
      await chain.act(vault, signer, method, args, overrides);
      log.push({ who, tried, outcome: "accepted" });
    } catch (error) {
      if (!(error instanceof chain.Refusal)) throw error;
      log.push({ who, tried, outcome: "refused", rule: error.rule, reason: error.reason });
    }
  }
  return log;
}

const moneyIn = async (vault) => (await chain.readVault(vault.target)).money;
const deposit = (cast) => ["Payer", cast.payer, "deposits ₹30,000", "deposit", [], { value: chain.toWei(TOTAL) }];
const refusedCount = (steps) => steps.filter((step) => step.outcome === "refused").length;
const rupees = (amount) => `₹${amount.toLocaleString("en-IN")}`;

const ATTACKS = {
  "second-release": {
    title: "Second release",
    explanation: "Try to get paid twice for the same stage.",
    async run() {
      const cast = await castOf();
      const vault = await freshVault(cast);
      const steps = await attempt(vault, [
        deposit(cast),
        ["Payee", cast.payee, "marks stage 1 done", "markComplete", [0]],
        ["Payer", cast.payer, "approves stage 1", "approve", [0]],
        ["Payer", cast.payer, "approves stage 1 a second time", "approve", [0]],
        ["Judge", cast.judge, "releases stage 1 again", "resolve", [0, true]],
        ["Payee", cast.payee, "withdraws", "withdraw"],
        ["Payee", cast.payee, "withdraws a second time", "withdraw"],
      ]);
      const money = await moneyIn(vault);
      const attackFailed = money.paidOut === STAGE && money.locked === TOTAL - STAGE && refusedCount(steps) === 3;
      return {
        steps,
        money,
        attackFailed,
        verdict: attackFailed
          ? "The payee was paid ₹10,000 for one stage, once. Every attempt to release or withdraw it again was refused."
          : "Unexpected result: the stage was paid more than once.",
      };
    },
  },

  "unauthorised-refund": {
    title: "Unauthorised refund",
    explanation: "Someone who is not the judge tries to settle a disputed stage.",
    async run() {
      const cast = await castOf();
      const vault = await freshVault(cast);
      const setup = await attempt(vault, [
        deposit(cast),
        ["Payee", cast.payee, "marks stage 1 done", "markComplete", [0]],
        ["Payer", cast.payer, "disputes stage 1", "dispute", [0]],
      ]);
      const attacks = await attempt(vault, [
        ["Payer", cast.payer, "refunds the stage to themselves", "resolve", [0, false]],
        ["Payee", cast.payee, "awards the stage to themselves", "resolve", [0, true]],
        ["Stranger", cast.stranger, "refunds the stage", "resolve", [0, false]],
      ]);
      const untouched = (await moneyIn(vault)).locked === TOTAL;
      const rightful = await attempt(vault, [["Judge", cast.judge, "refunds the stage to the payer", "resolve", [0, false]]]);
      const money = await moneyIn(vault);
      const attackFailed = untouched && refusedCount(attacks) === 3 && rightful[0].outcome === "accepted";
      return {
        steps: [...setup, ...attacks, ...rightful],
        money,
        attackFailed,
        verdict: attackFailed
          ? "The payer, the payee and a stranger were each refused. Only the judge could settle the dispute."
          : "Unexpected result: someone other than the judge settled the dispute.",
      };
    },
  },

  "out-of-order": {
    title: "Out of order",
    explanation: "Try to skip steps: approve a stage that was never marked done, or act before the deal starts.",
    async run() {
      const cast = await castOf();
      const vault = await freshVault(cast);
      const steps = await attempt(vault, [
        ["Payee", cast.payee, "marks stage 1 done before any deposit", "markComplete", [0]],
        deposit(cast),
        ["Payer", cast.payer, "approves stage 1 before it is done", "approve", [0]],
        ["Payer", cast.payer, "disputes stage 1 before it is done", "dispute", [0]],
        ["Judge", cast.judge, "settles stage 1 with no dispute", "resolve", [0, true]],
        ["Payee", cast.payee, "marks stage 1 done", "markComplete", [0]],
        ["Payee", cast.payee, "marks stage 1 done again", "markComplete", [0]],
        ["Judge", cast.judge, "refunds stage 1 with no dispute", "resolve", [0, false]],
      ]);
      const money = await moneyIn(vault);
      const attackFailed = refusedCount(steps) === 6 && money.locked === TOTAL && money.waitingToBeWithdrawn === 0;
      return {
        steps,
        money,
        attackFailed,
        verdict: attackFailed
          ? "Every skipped or repeated step was refused, and no money moved."
          : "Unexpected result: a step was accepted out of order.",
      };
    },
  },

  "re-entrancy": {
    title: "Re-entrancy",
    explanation: "A payee asks for the money again before the first payment has been recorded.",
    async run() {
      const cast = await castOf();

      // The same attacker contract, owed exactly one stage, against each vault.
      const against = async (contract) => {
        const attacker = await (await ethers.getContractFactory("ReentrantAttacker", cast.thief)).deploy();
        await attacker.waitForDeployment();
        const vault = await freshVault(cast, { contract, firstPayee: attacker.target });
        await attempt(vault, [deposit(cast)]);
        await (await attacker.aim(vault.target)).wait();
        await (await attacker.markComplete(0)).wait();
        await attempt(vault, [["Payer", cast.payer, "approves stage 1", "approve", [0]]]);

        const owed = await vault.owed(attacker.target);
        await (await attacker.attack()).wait();
        const received = await ethers.provider.getBalance(attacker.target);

        return {
          owedToAttacker: chain.toRupees(owed),
          attackerReceived: chain.toRupees(received),
          leftInVault: chain.toRupees(await ethers.provider.getBalance(vault.target)),
          askedAgain: Number(await attacker.attempts()),
          refusedAgain: Number(await attacker.refusals()),
          booksBalance: await vault.reconciles(),
          tookMoreThanOwed: received > owed,
        };
      };

      const realVault = await against("MilestoneVault");
      const weakCopy = await against("WeakVault");
      const attackFailed = !realVault.tookMoreThanOwed && realVault.booksBalance;
      return {
        realVault,
        weakCopy,
        attackFailed,
        verdict: attackFailed
          ? `On the real vault the attacker received ${rupees(realVault.attackerReceived)}, exactly what it was owed. On the weak copy, which lacks the two protections, the same attacker took ${rupees(weakCopy.attackerReceived)}.`
          : "Unexpected result: the attacker took more than it was owed from the real vault.",
      };
    },
  },
};

function attackRoutes() {
  const router = express.Router();

  router.get("/attacks", (request, response) => {
    response.json({
      attacks: Object.entries(ATTACKS).map(([name, attack]) => ({ name, title: attack.title, explanation: attack.explanation })),
    });
  });

  router.post("/attacks/:name", async (request, response, next) => {
    try {
      const attack = ATTACKS[request.params.name];
      if (!attack) {
        return response.status(404).json({ error: `There is no attack called ${request.params.name}.` });
      }
      const result = await attack.run();
      response.json({ attack: request.params.name, title: attack.title, explanation: attack.explanation, ...result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { attackRoutes, ATTACKS };
