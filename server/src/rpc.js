// The door wallets use to reach the chain. The chain runs inside this process,
// so a wallet such as MetaMask is pointed at POST /rpc and this file passes its
// requests through.
//
// Only what a wallet needs is let through. A wallet reads the chain and sends
// transactions it has already signed. It never needs the node to sign for it,
// and it must not be able to rewrite the chain, so those methods are refused.

const express = require("express");
const hre = require("hardhat");

// The node holds the keys of the built-in demo accounts. These methods would
// let any caller use those keys, so they are never passed through.
const NODE_SIGNING = new Set([
  "eth_sendTransaction",
  "eth_sign",
  "eth_signTransaction",
  "eth_signTypedData",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
]);

const isAllowed = (method) => /^(eth|net|web3)_/.test(method) && !NODE_SIGNING.has(method);

async function answer(call) {
  const id = call && call.id !== undefined ? call.id : null;
  const reply = (fields) => ({ jsonrpc: "2.0", id, ...fields });

  if (!call || typeof call.method !== "string") {
    return reply({ error: { code: -32600, message: "This is not a valid JSON-RPC request." } });
  }
  // The node's own accounts are not the caller's accounts.
  if (call.method === "eth_accounts") return reply({ result: [] });
  if (!isAllowed(call.method)) {
    return reply({ error: { code: -32601, message: `The method ${call.method} is not available through Settl.` } });
  }

  try {
    return reply({ result: await hre.network.provider.request({ method: call.method, params: call.params || [] }) });
  } catch (error) {
    // The revert data is passed on so the wallet or the page can show why a call failed.
    return reply({
      error: { code: Number.isInteger(error.code) ? error.code : -32000, message: error.message, data: error.data },
    });
  }
}

function rpcRoutes() {
  const router = express.Router();

  router.post("/rpc", async (request, response) => {
    const body = request.body;
    if (!Array.isArray(body)) return response.json(await answer(body));

    // A batch is answered in order, one call at a time, so a nonce read never races a send.
    const replies = [];
    for (const call of body) replies.push(await answer(call));
    response.json(replies);
  });

  return router;
}

module.exports = { rpcRoutes, isAllowed };
