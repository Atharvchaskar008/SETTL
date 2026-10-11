const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const hre = require("hardhat");
const chain = require("./chain");
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
  // Refuses to start on anything but a test network.
  const network = await chain.testNetwork();
  const local = chain.isLocal;
  // A public test network keeps its vaults when the server stops, so the deals are kept too.
  const store = local
    ? createStore(storePath)
    : createStore(storePath || path.join(__dirname, "..", "data", "testnet.json"), { keepFor: network.chainId });
  // With REQUIRE_WALLET=true nobody can act without signing in with a wallet,
  // so there are no demo people at all, the built-in mediator included.
  // Demo people need accounts the server holds, and only the local chain has those. On any
  // other network everyone signs in with their own wallet, whatever REQUIRE_WALLET says.
  const requireWallet = !local || String(env.REQUIRE_WALLET || "").toLowerCase() === "true";
  if (!requireWallet) await addPerson(store, MEDIATOR);

  app.use(express.json({ limit: "200kb" }));

  const auth = createAuth({ store });
  app.use(auth.identify);

  // The dashboard is served from app/. The earlier dashboard in web/ stays available
  // at /old, served with one extra script: the bridge that connects its screens to
  // this server. The files in web/ themselves are left untouched.
  app.use(express.static(path.join(__dirname, "../../app")));
  app.get(["/old", "/old/", "/old/index.html"], (request, response, next) => {
    fs.readFile(path.join(__dirname, "../../web/index.html"), "utf8", (error, html) => {
      if (error) return next();
      response.type("html").send(html.replace("</body>", '  <script src="/settl-bridge.js"></script>\n</body>'));
    });
  });
  app.get("/settl-bridge.js", (request, response) => {
    response.sendFile(path.join(__dirname, "../public/settl-bridge.js"));
  });
  app.use(express.static(path.join(__dirname, "../../web")));
  app.use("/old", express.static(path.join(__dirname, "../../web")));
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

  // Starts again from nothing: a fresh chain, no deals, and only the built-in
  // mediator. For demonstrations. Wallet sessions end, because their people are gone.
  app.post("/reset", async (request, response, next) => {
    try {
      if (!local) {
        return response.status(409).json({ refused: true, rule: "local-only", reason: "Only the local test chain can be reset." });
      }
      if (requireWallet) {
        return response.status(409).json({
          refused: true,
          rule: "wallet-only",
          reason: "Reset is switched off when wallet sign-in is required.",
        });
      }
      await hre.network.provider.send("hardhat_reset");
      store.reset();
      await addPerson(store, MEDIATOR);
      response.json({ reset: true });
    } catch (error) {
      next(error);
    }
  });

  app.use(auth.router);
  // Wallets reach the local chain through this server. A public network they reach themselves.
  if (local) app.use(rpcRoutes());
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
