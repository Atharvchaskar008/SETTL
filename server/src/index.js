require("dotenv").config();

// With CHAIN_RPC_URL set, Settl runs on that public test network instead of the
// chain inside this process. "--testnet" (npm run testnet) does the same with
// Sepolia's public address. This has to be decided before the chain is loaded.
if (process.argv.includes("--testnet") && !process.env.CHAIN_RPC_URL) {
  process.env.CHAIN_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
}
if (process.env.CHAIN_RPC_URL && !process.env.HARDHAT_NETWORK) process.env.HARDHAT_NETWORK = "testnet";

const express = require("express");
const { createApp } = require("./app");
const { rpcRoutes } = require("./rpc");
const chain = require("./chain");

const port = Number(process.env.PORT) || 3000;
const rpcPort = Number(process.env.RPC_PORT) || 8545;

createApp()
  .then(async ({ app }) => {
    const network = await chain.testNetwork();
    app.listen(port, () => {
      console.log(`Settl is running at http://localhost:${port}`);
      if (chain.isLocal) {
        console.log("All funds are simulated. The chain lives in memory and resets on restart.");
      } else {
        console.log(`Connected to ${network.name} (chain ID ${network.chainId}). Test money only; every transaction comes from a wallet.`);
      }
    });
    if (!chain.isLocal) return;

    // Wallets usually expect a local chain at port 8545, so the same chain is
    // offered there too. Port 3000's /rpc works whether or not this one starts.
    const chainDoor = express();
    chainDoor.use(express.json({ limit: "200kb" }));
    chainDoor.use((request, response, next) => {
      request.url = "/rpc";
      next();
    });
    chainDoor.use(rpcRoutes());
    chainDoor
      .listen(rpcPort, () => console.log(`Wallets can also reach the chain at http://localhost:${rpcPort} (chain ID 31337).`))
      .on("error", () => console.log(`Port ${rpcPort} is busy, so wallets should use http://localhost:${port}/rpc.`));
  })
  .catch((error) => {
    console.error("Settl could not start:", error.message);
    process.exit(1);
  });
