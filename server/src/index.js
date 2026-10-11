require("dotenv").config();

const express = require("express");
const { createApp } = require("./app");
const { rpcRoutes } = require("./rpc");

const port = Number(process.env.PORT) || 3000;
const rpcPort = Number(process.env.RPC_PORT) || 8545;

createApp()
  .then(({ app }) => {
    app.listen(port, () => {
      console.log(`Settl is running at http://localhost:${port}`);
      console.log(`Wallet console: http://localhost:${port}/wallet`);
      console.log("All funds are simulated. The chain lives in memory and resets on restart.");
    });

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
