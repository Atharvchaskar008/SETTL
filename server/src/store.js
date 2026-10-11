const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_PATH = path.join(__dirname, "..", "data", "store.json");

/**
 * A small JSON file store for people and deals.
 *
 * On the local chain the file is rewritten from empty on every start. That
 * chain is in memory and starts empty too, so deals from an earlier run would
 * point at vaults that no longer exist. The file is there so the current run
 * can be inspected.
 *
 * On a public test network the vaults outlive the server, so `keepFor` names
 * the chain and what was saved for that same chain is loaded again.
 */
function createStore(filePath = DEFAULT_PATH, { keepFor = null } = {}) {
  const state = { chainId: keepFor, people: [], deals: [], dealsCreated: 0 };

  if (keepFor !== null) {
    try {
      const saved = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (saved.chainId === keepFor) Object.assign(state, saved);
    } catch (error) {
      // No file yet, or one that cannot be read: start empty.
    }
  }

  const save = () => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  };
  save();

  return {
    filePath,
    save,
    people: () => state.people,
    deals: () => state.deals,
    addPerson(person) {
      state.people.push(person);
      save();
      return person;
    },
    addDeal(deal) {
      state.deals.push(deal);
      state.dealsCreated += 1;
      save();
      return deal;
    },
    removeDeal(id) {
      state.deals = state.deals.filter((deal) => deal.id !== id);
      save();
    },
    findDeal: (id) => state.deals.find((deal) => deal.id === id),
    /** Forgets every person and deal. */
    reset() {
      state.people.length = 0;
      state.deals = [];
      state.dealsCreated = 0;
      save();
    },
    // Counted from every deal ever created, so a discarded deal's number is never used again.
    nextDealId: () => `deal-${state.dealsCreated + 1}`,
  };
}

module.exports = { createStore };
