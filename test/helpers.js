const { ethers } = require("hardhat");

// Pretend money: one rupee is 10^12 wei on the local chain.
const RUPEE = 10n ** 12n;
const rupees = (amount) => BigInt(amount) * RUPEE;

const AGREEMENT_HASH = ethers.id("demo agreement");

/**
 * Deploys a vault. `payers` is a list of [signer, share] pairs and `stages`
 * a list of [payee signer or contract, amount] pairs.
 */
async function deployVault({ payers, judge, stages, contract = "MilestoneVault", hash = AGREEMENT_HASH }) {
  const Vault = await ethers.getContractFactory(contract);
  const addressOf = (party) => party.target ?? party.address;
  return Vault.deploy(
    payers.map(([payer]) => addressOf(payer)),
    payers.map(([, share]) => share),
    addressOf(judge),
    stages.map(([payee]) => addressOf(payee)),
    stages.map(([, amount]) => amount),
    hash
  );
}

module.exports = { RUPEE, rupees, AGREEMENT_HASH, deployVault };
