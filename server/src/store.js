const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_PATH = path.join(__dirname, "..", "data", "store.json");

/**
 * A small JSON file store for people and deals.
 *
 * The file is rewritten from empty on every start. The chain is in memory and
 * starts empty too, so deals from an earlier run would point at vaults that no
 * longer exist. The file is there so the current run can be inspected.
 */
function createStore(filePath = DEFAULT_PATH) {
  const state = { people: [], deals: [] };

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
      save();
      return deal;
    },
    findDeal: (id) => state.deals.find((deal) => deal.id === id),
    /** Forgets every person and deal. */
    reset() {
      state.people.length = 0;
      state.deals.length = 0;
      save();
    },
    nextDealId: () => `deal-${state.deals.length + 1}`,
  };
}

module.exports = { createStore };
