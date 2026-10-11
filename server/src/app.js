const express = require("express");
const hre = require("hardhat");
const { createStore } = require("./store");
const { peopleRoutes, addPerson, MEDIATOR } = require("./people");
const { dealRoutes } = require("./deals");
const { attackRoutes } = require("./attacks");
const { createAuth } = require("./auth");
const { rpcRoutes } = require("./rpc");

/**
 * Builds the Settl API. The pretend blockchain runs inside this process, so
 * every start is a clean slate: no deals, no vaults, full balances.
 *
 * @param {object} [options]
 * @param {object} [options.env]        environment: model keys, CHECKER_MODE, REQUIRE_WALLET
 * @param {string} [options.storePath]  where the JSON store is written
 * @returns {Promise<{ app: import("express").Express, store: object }>}
 */
async function createApp({ env = process.env, storePath } = {}) {
  const app = express();
  const store = createStore(storePath);
  // With REQUIRE_WALLET=true nobody can act without signing in with a wallet,
  // so there are no demo people at all, the built-in mediator included.
  const requireWallet = String(env.REQUIRE_WALLET || "").toLowerCase() === "true";
  if (!requireWallet) await addPerson(store, MEDIATOR);

  app.use(express.json({ limit: "200kb" }));

  const auth = createAuth({ store });
  app.use(auth.identify);

  const path = require("path");
  app.use(express.static(path.join(__dirname, "../../web")));
  app.use("/site", express.static(path.join(__dirname, "../../site")));
  // The wallet console, and the browser build of ethers it uses, served locally so it works offline.
  app.use("/wallet", express.static(path.join(__dirname, "../../wallet")));
  app.get("/vendor/ethers.js", (request, response) => {
    response.sendFile(path.join(__dirname, "../../node_modules/ethers/dist/ethers.umd.min.js"));
  });

  app.get("/health", async (request, response, next) => {
    try {
      const [block, accounts] = await Promise.all([hre.ethers.provider.getBlockNumber(), hre.ethers.getSigners()]);
      response.json({
        ok: true,
        product: "Settl",
        chain: { network: hre.network.name, block, accounts: accounts.length },
        funds: "simulated",
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(auth.router);
  app.use(rpcRoutes());
  app.use(peopleRoutes(store, { requireWallet }));
  app.use(dealRoutes({ store, env, requireWallet }));
  app.use(attackRoutes());

  app.use((request, response) => {
    response.status(404).json({ error: `No route for ${request.method} ${request.path}.` });
  });

  // Anything that reaches here is a bug or a malformed request, not a refusal.
  // eslint-disable-next-line no-unused-vars
  app.use((error, request, response, next) => {
    const status = error.type === "entity.parse.failed" ? 400 : error.status || 500;
    response.status(status).json({ error: status === 400 ? "The request body is not valid JSON." : error.message });
  });

  return { app, store, env };
}

module.exports = { createApp };
