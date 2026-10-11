const express = require("express");
const hre = require("hardhat");
const { sameName } = require("./checker/validate");

// A neutral judge every deal can use when the group has nobody of their own.
const MEDIATOR = "Platform Mediator";

// There are two kinds of people.
//
//   demo    A fictional person. The server holds one of the chain's built-in
//           accounts for them and acts when a request names them. Nothing
//           proves who is asking; this is for demonstrations.
//   wallet  A real person who signed in with their own wallet (see auth.js).
//           The server holds no key for them and cannot act as them.
const DEMO = "demo";
const WALLET = "wallet";

const findPerson = (store, name) =>
  typeof name === "string" ? store.people().find((person) => sameName(person.name, name)) : undefined;

const findByAddress = (store, address) =>
  store.people().find((person) => person.address.toLowerCase() === String(address).toLowerCase());

const cleanName = (name) => name.trim().replace(/\s+/g, " ");

/** True for the chain's built-in accounts, whose keys the server holds. */
async function isBuiltInAccount(address) {
  const signers = await hre.ethers.getSigners();
  return signers.some((signer) => signer.address.toLowerCase() === String(address).toLowerCase());
}

/**
 * Adds a demo person and gives them one of the chain's built-in accounts.
 * Account 0 is kept for deploying vaults.
 */
async function addPerson(store, name) {
  const signers = await hre.ethers.getSigners();
  const account = store.people().filter((person) => person.kind === DEMO).length + 1;
  if (account >= signers.length) {
    throw Object.assign(new Error(`This demo supports at most ${signers.length - 1} demo people.`), { status: 409 });
  }
  return store.addPerson({ name: cleanName(name), kind: DEMO, account, address: signers[account].address });
}

/** Adds a person who signs with their own wallet. The address is all the server knows of their key. */
function addWalletPerson(store, name, address) {
  return store.addPerson({ name: cleanName(name), kind: WALLET, address: hre.ethers.getAddress(address) });
}

/** The chain account the server holds for a demo person. */
async function signerFor(person) {
  if (person.kind !== DEMO) throw new Error(`${person.name} signs with their own wallet; the server holds no key for them.`);
  return (await hre.ethers.getSigners())[person.account];
}

function peopleRoutes(store, { requireWallet = false } = {}) {
  const router = express.Router();

  router.get("/people", (request, response) => {
    response.json({ people: store.people() });
  });

  // Adds people. Body: { name } for one demo person, or { names: [...] } for several.
  //
  // { name, address } instead adds someone by their wallet address, so a deal can
  // name them before they have opened Settl. It gives nobody any power: to act,
  // that person still has to sign in with the wallet that owns the address.
  router.post("/people", async (request, response, next) => {
    try {
      const refuse = (rule, reason) => response.status(409).json({ refused: true, rule, reason });
      if (request.body && request.body.address !== undefined) {
        const { name, address } = request.body;
        if (requireWallet && !request.signedIn) {
          return response.status(401).json({ error: "Sign in with your wallet first." });
        }
        if (typeof name !== "string" || !name.trim() || cleanName(name).length > 40) {
          return response.status(400).json({ error: "Give the person's name as text of 40 characters or fewer." });
        }
        if (!hre.ethers.isAddress(address)) {
          return response.status(400).json({ error: "That is not a wallet address." });
        }
        if (findPerson(store, name)) return refuse("person-exists", `${cleanName(name)} has already been added.`);
        const owner = findByAddress(store, address);
        if (owner) return refuse("address-in-use", `That wallet already belongs to ${owner.name}.`);
        if (await isBuiltInAccount(address)) {
          return refuse("demo-account", "That address is one of the chain's built-in demo accounts, not a person's wallet.");
        }
        return response.status(201).json({ added: [addWalletPerson(store, name, address)], alreadyThere: [] });
      }

      if (requireWallet) {
        return response.status(409).json({
          refused: true,
          rule: "wallet-only",
          reason: "This server accepts wallet sign-in only, so demo people cannot be added.",
        });
      }
      const body = request.body || {};
      const names = Array.isArray(body.names) ? body.names : [body.name];
      if (names.length === 0 || names.some((name) => typeof name !== "string" || !name.trim())) {
        return response.status(400).json({ error: "Give each person's name as text." });
      }

      const added = [];
      const alreadyThere = [];
      for (const name of names) {
        const existing = findPerson(store, name);
        if (existing) alreadyThere.push(existing.name);
        else added.push(await addPerson(store, name));
      }
      if (added.length === 0) {
        return response.status(409).json({
          refused: true,
          rule: "person-exists",
          reason: `${alreadyThere.join(", ")} ${alreadyThere.length === 1 ? "has" : "have"} already been added.`,
        });
      }
      response.status(201).json({ added, alreadyThere });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  peopleRoutes,
  addPerson,
  addWalletPerson,
  findPerson,
  findByAddress,
  isBuiltInAccount,
  signerFor,
  cleanName,
  MEDIATOR,
  DEMO,
  WALLET,
};
