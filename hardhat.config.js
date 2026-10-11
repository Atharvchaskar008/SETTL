require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      // One built-in account per fictional person; all funds are pretend.
      accounts: { count: 50 },
    },
    // A public test network, chosen by CHAIN_RPC_URL. The server holds no key
    // there: every transaction is signed and sent by a person's own wallet.
    testnet: {
      url: process.env.CHAIN_RPC_URL || "http://127.0.0.1:8545",
      accounts: [],
    },
  },
};
