// Wallet sign-in. A person proves who they are by signing a one-time message
// with their wallet. The server checks the signature against the address and
// hands back a session token. No password and no key ever reaches the server.

const crypto = require("node:crypto");
const express = require("express");
const hre = require("hardhat");
const { addWalletPerson, findPerson, findByAddress, isBuiltInAccount, cleanName, WALLET } = require("./people");

const { ethers } = hre;

const MESSAGE_LIFETIME_MS = 5 * 60 * 1000;
// Pretend money so a new wallet can pay deposits and gas on the local chain: 10,000 test ETH, shown as Rs 1 crore.
const STARTING_BALANCE = ethers.parseEther("10000");

function createAuth({ store }) {
  const router = express.Router();
  const pending = new Map(); // address -> { message, expires }
  const sessions = new Map(); // token -> person name

  const refuse = (response, rule, reason) => response.status(409).json({ refused: true, rule, reason });

  const addressFrom = (value) => {
    try {
      return ethers.getAddress(String(value));
    } catch (error) {
      return null;
    }
  };

  // Step 1: the message this address must sign. It is single-use and expires.
  router.get("/auth/message", (request, response) => {
    const address = addressFrom(request.query.address);
    if (!address) return response.status(400).json({ error: "Give a wallet address in ?address=." });

    const message = [
      "Sign in to Settl",
      `Address: ${address}`,
      `Nonce: ${crypto.randomBytes(16).toString("hex")}`,
      "Signing this proves you control the address. It moves no money.",
    ].join("\n");
    pending.set(address, { message, expires: Date.now() + MESSAGE_LIFETIME_MS });
    response.json({ address, message });
  });

  // Step 2: the signature. A first sign-in also gives the person their name.
  router.post("/auth/sign-in", async (request, response, next) => {
    try {
      const body = request.body || {};
      const address = addressFrom(body.address);
      if (!address || typeof body.signature !== "string") {
        return response.status(400).json({ error: 'Send "address" and "signature".' });
      }

      const issued = pending.get(address);
      pending.delete(address);
      if (!issued || issued.expires < Date.now()) {
        return refuse(response, "no-message", "Ask for a new sign-in message first; the last one was used or has expired.");
      }

      let signer;
      try {
        signer = ethers.verifyMessage(issued.message, body.signature);
      } catch (error) {
        signer = null;
      }
      if (signer !== address) {
        return refuse(response, "bad-signature", "The signature does not match this address.");
      }

      let person = findByAddress(store, address);
      if (person && person.kind !== WALLET) {
        return refuse(response, "demo-account", `This address is the demo account of ${person.name}. Sign in with your own wallet account.`);
      }
      if (!person) {
        if (await isBuiltInAccount(address)) {
          return refuse(response, "demo-account", "This address is one of the chain's built-in demo accounts. Sign in with your own wallet account.");
        }
        if (typeof body.name !== "string" || !body.name.trim()) {
          return refuse(response, "name-needed", "This wallet is new here. Send a name to go with it.");
        }
        if (cleanName(body.name).length > 40) {
          return response.status(400).json({ error: "The name must be 40 characters or fewer." });
        }
        if (findPerson(store, body.name)) {
          return refuse(response, "name-taken", `${cleanName(body.name)} is already in use. Choose another name.`);
        }
        person = addWalletPerson(store, body.name, address);
        await hre.network.provider.send("hardhat_setBalance", [address, ethers.toBeHex(STARTING_BALANCE)]);
      }

      const token = crypto.randomBytes(24).toString("hex");
      sessions.set(token, person.name);
      response.json({ token, person });
    } catch (error) {
      next(error);
    }
  });

  router.post("/auth/sign-out", (request, response) => {
    const token = tokenOf(request);
    if (token) sessions.delete(token);
    response.json({ signedOut: true });
  });

  router.get("/auth/me", (request, response) => {
    if (!request.signedIn) return response.status(401).json({ error: "Not signed in." });
    response.json({ person: request.signedIn });
  });

  const tokenOf = (request) => {
    const header = request.get("authorization") || "";
    return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  };

  /** Sets request.signedIn when the request carries a live session token. */
  const identify = (request, response, next) => {
    const token = tokenOf(request);
    if (!token) return next();
    const person = findPerson(store, sessions.get(token));
    if (!person) return response.status(401).json({ error: "This session has ended. Sign in again." });
    request.signedIn = person;
    next();
  };

  return { router, identify };
}

module.exports = { createAuth };
