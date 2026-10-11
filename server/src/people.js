const express = require("express");
const hre = require("hardhat");
const { sameName } = require("./checker/validate");

// A neutral judge every deal can use when the group has nobody of their own.
const MEDIATOR = "Platform Mediator";

const findPerson = (store, name) =>
  typeof name === "string" ? store.people().find((person) => sameName(person.name, name)) : undefined;

/**
 * Adds a fictional person and gives them one of the chain's built-in accounts.
 * Account 0 is kept for deploying vaults.
 */
async function addPerson(store, name) {
  const signers = await hre.ethers.getSigners();
  const account = store.people().length + 1;
  if (account >= signers.length) {
    throw Object.assign(new Error(`This demo supports at most ${signers.length - 1} people.`), { status: 409 });
  }
  return store.addPerson({ name: name.trim().replace(/\s+/g, " "), account, address: signers[account].address });
}

/** The chain account that acts for this person. */
async function signerFor(person) {
  return (await hre.ethers.getSigners())[person.account];
}

function peopleRoutes(store) {
  const router = express.Router();

  router.get("/people", (request, response) => {
    response.json({ people: store.people() });
  });

  // Body: { name } for one person, or { names: [...] } for several.
  router.post("/people", async (request, response, next) => {
    try {
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

module.exports = { peopleRoutes, addPerson, findPerson, signerFor, MEDIATOR };
