# MilestoneVault — Contributor & Collaborator Guide

Welcome to the **MilestoneVault** project! This guide contains everything you need to understand the architecture, contribute features, fix bugs, and follow our strict design and rule-enforcement principles.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Quick Start & Local Setup](#quick-start--local-setup)
4. [Design Principles (Non-Negotiable)](#design-principles-non-negotiable)
5. [Frontend Guide (`web/`)](#frontend-guide-web)
6. [Backend API & Rules Guide (`server/`)](#backend-api--rules-guide-server)
7. [Smart Contracts (`contracts/` & `test/`)](#smart-contracts-contracts--test)
8. [API Route Reference](#api-route-reference)
9. [Pre-Commit / QA Checklist](#pre-commit--qa-checklist)
10. [Git & PR Workflow](#git--pr-workflow)

---

## 1. Project Overview

**MilestoneVault** turns plain-language deal agreements into cryptographically locked escrow contracts. A deal checker reads plain words and creates a checklist. Once participants fix unclear lines and agree, payers deposit pretend money (simulated UPI). Each milestone stage is released only after approval, and an appointed neutral judge resolves disputes.

### Key Roles
- **Payers:** Put money into escrow (can be one or multiple, with predefined shares).
- **Payees:** Receive payout for approved deliverables (one per stage).
- **The Judge:** Resolves disputes, rules on releases or refunds, and can **never** claim the escrow money for themselves.

---

## 2. Directory Structure

```text
Vortexa-3.0/
├── web/                     # 🎨 Frontend Web Application (Vanilla CSS, JS, HTML)
│   ├── index.html           # Main markup for all 5 screens and modals
│   ├── app.css              # Design tokens, layout, badges, mobile rules
│   ├── app.js               # Client logic, API client, inline refusals
│   └── README.md            # Frontend-specific documentation
│
├── server/                  # ⚙️ Backend API & Rule Engine
│   └── src/
│       ├── index.js         # Express server, route handlers, error 409 middleware
│       ├── store.js         # In-memory store, sample deals, reconciliation math
│       └── attacks.js       # Attack simulation logic (Attack Lab)
│
├── contracts/               # ⛓️ Smart Contracts
│   └── MilestoneVault.sol   # Solidity escrow contract (OpenZeppelin ReentrancyGuard)
│
├── test/                    # 🧪 Hardhat Solidity Tests
│   ├── helpers.js           # Test fixtures & currency helpers
│   └── setup.test.js        # Hardhat setup and rule enforcement tests
│
├── scripts/                 # 🚀 Automation & Demo Scripts
│   └── demo.js              # End-to-end API verification script
│
├── run.bat                  # 🪟 Windows 1-click launcher (starts server + opens browser)
├── package.json             # NPM dependencies & scripts
├── readme.md                # High-level product summary
└── CONTRIBUTING.md          # 📖 This collaborator guide
```

---

## 3. Quick Start & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Setup Steps
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Compile Solidity contracts
npx hardhat compile

# 3. Start local development server
npm start
# -> Server running at http://localhost:3000
```

> [!TIP]
> **Windows Users:** You can double-click [`run.bat`](file:///d:/projects/settl/Vortexa-3.0/run.bat) to start the server and open `http://localhost:3000` in your default browser automatically.

### Running Verification Tests
```bash
# Run backend demo verification script
npm run demo

# Run Hardhat Solidity contract test suite
npm test
```

---

## 4. Design Principles (Non-Negotiable)

When writing or modifying frontend components, you **must adhere to these 6 golden principles**:

1. **Rupees everywhere:**
   - Display every monetary amount formatted as Indian Rupees with Indian grouping (e.g. `₹2,00,000`, `₹30,000`, `₹15,000`).
   - Use the client helper `formatRupees(amount)`.
2. **Always labelled as pretend:**
   - The **"Simulated funds"** badge must remain permanently visible in the top navigation bar.
3. **One clear next step:**
   - The user must always see what action they can take right now, or who the deal is currently waiting for.
4. **Refusals appear where the click happened:**
   - When an action is rejected (HTTP 409), display the plain-language reason directly underneath the clicked button/card in a `.refusal-alert` container.
   - Refusals **stay visible** until the user performs their next action.
5. **State in words, not colour alone:**
   - Every badge must have an explicit text label (e.g., `Pending`, `Done, awaiting approval`, `Disputed`, `Paid`, `Refunded`). Never rely solely on icons or background colors.
6. **Technical details stay hidden:**
   - Raw EVM contract addresses, transaction hashes, and agreement fingerprint hashes stay behind the **"Technical details >"** modal link.

---

## 5. Frontend Guide (`web/`)

### No Build Step (Zero Overhead)
The frontend uses **standard HTML5, Vanilla CSS, and modern JavaScript**. There is no Webpack, Vite, or Babel build step required. Changes saved to [`web/index.html`](file:///d:/projects/settl/Vortexa-3.0/web/index.html), [`web/app.css`](file:///d:/projects/settl/Vortexa-3.0/web/app.css), or [`web/app.js`](file:///d:/projects/settl/Vortexa-3.0/web/app.js) are reflected immediately upon refreshing `http://localhost:3000`.

### Screen Architecture

| Screen ID | Name | Description | Key Functions |
|---|---|---|---|
| `#screen-deals` | **Screen 1: Deals** | Overview table of all deals in the system. | `loadDeals()` |
| `#screen-new-deal` | **Screen 2: New deal** | 4-step wizard: Describe → Review → Agree → Lock. | `setWizardStep()`, `renderReviewStep()`, `renderAgreeStep()`, `renderLockStep()` |
| `#screen-deal-dashboard` | **Screen 3: Deal dashboard** | Live execution: 3-part money bar, stages list, withdraw, people, history. | `renderDealDashboard()`, `renderStageCard()`, `attachStageButtonHandlers()` |
| `#screen-attack-lab` | **Screen 4: Attack lab** | Interactive security demo of 4 attacks. | `renderAttackLabCards()`, `renderAttackOutcome()` |
| `#screen-summary` | **Screen 5: Summary** | Final financial closing table. | `openSummaryScreen()` |

### Persona Switcher ("Acting as") & "Try anything" Mode
- **"Acting as" Selector (`#select-acting-as`):**
  - Stored in `state.actingPerson`.
  - When changed, the UI re-evaluates whose buttons are visible and whose withdrawable money balance is shown.
- **"Try anything" Switch (`#toggle-try-anything`):**
  - Stored in `state.tryAnything`.
  - **OFF (default):** Only legitimate actions available to the acting persona are rendered.
  - **ON:** Every button is displayed to everyone. This allows any user (e.g. Meera the Judge or Aman the Payee) to click unauthorized buttons and watch the backend return an immediate HTTP 409 refusal.

### Mobile Layout Stack (`@media (max-width: 700px)`)
On screens narrower than 700 pixels:
- Elements in the Deal Dashboard **must stack in this exact vertical order**:
  1. Header
  2. Money Bar
  3. Your Money
  4. Stages
  5. People
  6. History
- On the Review step, the checklist appears first, and the original text collapses underneath it.
- Horizontal scrolling is strictly disallowed.

---

## 6. Backend API & Rules Guide (`server/`)

### Rule Enforcement Philosophy
> **The frontend never decides whether an action is allowed.**
> It sends the request to the backend with `{ person: state.actingPerson }`. The backend validates all preconditions and either applies the change or returns **HTTP 409 Conflict** with `{ reason: "plain words explanation" }`.

### Adding or Modifying Backend Routes
- Keep route handlers in [`server/src/index.js`](file:///d:/projects/settl/Vortexa-3.0/server/src/index.js).
- Record every action (both `accepted` and `refused`) in deal history using `recordHistory(deal, person, action, outcome, reason)`.
- If modifying financial allocations, ensure that:
  $$\text{locked} + \text{waiting} + \text{paidOut} = \text{totalDeposited}$$
  The helper `calculateReconciliation(deal)` enforces this invariant.

---

## 7. Smart Contracts (`contracts/` & `test/`)

- Contract source: [`contracts/MilestoneVault.sol`](file:///d:/projects/settl/Vortexa-3.0/contracts/MilestoneVault.sol)
- Solc compiler version: `^0.8.24` (EVM target: Cancun)
- Uses OpenZeppelin `@openzeppelin/contracts/utils/ReentrancyGuard.sol`.
- Tests are written in Mocha/Chai with `@nomicfoundation/hardhat-ethers`.

### Running Contract Tests
```bash
npx hardhat test
```
All custom errors (`NoPayers`, `NoStages`, `LengthMismatch`, `DuplicatePayer`, `JudgeMustBeNeutral`, `PayeeCannotBePayer`, `TotalsDiffer`) are covered in [`test/setup.test.js`](file:///d:/projects/settl/Vortexa-3.0/test/setup.test.js).

---

## 8. API Route Reference

| Method | Route | Body / Query | Description | Error (HTTP 409) |
|---|---|---|---|---|
| `GET` | `/people` | - | Returns list of fictional people | - |
| `GET` | `/deals` | - | Returns overview array of all deals | - |
| `POST` | `/deals/draft` | `{ text, sampleKey, person }` | Creates a new draft deal | Missing text |
| `PUT` | `/deals/:id/checklist` | `{ payers, judge, stages, unclear, person }` | Updates proposed checklist; resets previous agreements | Not in Review phase |
| `POST` | `/deals/:id/confirm` | `{ person }` | Confirms checklist, transitions to Agree phase | Unclear lines exist, amounts don't add up |
| `POST` | `/deals/:id/agree` | `{ person }` | Participant signs checklist | Not participant, already agreed |
| `POST` | `/deals/:id/lock` | `{ person }` | Locks deal and deploys vault | Missing agreements |
| `POST` | `/deals/:id/deposit` | `{ person }` | Payer deposits simulated UPI share | Not a payer, already deposited |
| `GET` | `/deals/:id` | `?person=...` | Retrieves complete deal state & user balance | Deal not found |
| `GET` | `/deals/:id/history` | - | Retrieves full chronological history log | Deal not found |
| `POST` | `/deals/:id/stages/:stageId/done` | `{ person }` | Payee marks stage completed | Not payee, stage not pending |
| `POST` | `/deals/:id/stages/:stageId/approve` | `{ person }` | Payer approves completed stage | Not payer, stage not completed |
| `POST` | `/deals/:id/stages/:stageId/dispute` | `{ person, disputeReason }` | Payer disputes stage deliverable | Not payer, stage not completed |
| `POST` | `/deals/:id/stages/:stageId/resolve` | `{ person, resolution }` | Judge rules `pay_payee` or `refund_payers` | Not designated judge, stage not disputed |
| `POST` | `/deals/:id/withdraw` | `{ person }` | Withdraws available balance to claimant | Zero balance |
| `GET` | `/attacks` | - | Retrieves list of attack lab scenarios | - |
| `POST` | `/attacks/:name` | - | Runs attack simulation and returns traces | Attack not found |
| `GET` | `/deals/:id/summary` | - | Retrieves closing settlement figures | Deal not found |
| `POST` | `/api/reset` | - | Resets all sample deals to initial pristine state | - |

---

## 9. Pre-Commit / QA Checklist

Before submitting a Pull Request or pushing changes:

- [ ] **Contract tests pass:** Run `npm test` and verify all tests pass.
- [ ] **Demo script runs:** Run `npm run demo` and verify end-to-end API success.
- [ ] **Rupees check:** Are all amounts shown with `₹` and Indian grouping (e.g. `₹2,00,000`)?
- [ ] **Refusal check:** Did you test clicking unauthorized actions with *Try anything* ON? Does the refusal message appear directly beneath the button?
- [ ] **Persona switching:** Does switching between Riya, Aman, and Meera update withdrawable money and action buttons accordingly?
- [ ] **Responsive check:** Resize the browser window to `<700px`. Does the layout stack correctly without horizontal scrollbars?
- [ ] **Console clean:** Open browser DevTools (F12) to ensure there are no uncaught JavaScript errors or broken asset links.

---

## 10. Git & PR Workflow

1. **Create a descriptive branch:**
   ```bash
   git checkout -b feature/dashboard-timeline-enhancement
   # or
   git checkout -b fix/stage-dispute-reason
   ```
2. **Commit with concise messages:**
   ```bash
   git commit -m "feat(web): add inline highlight animation for linked stages"
   ```
3. **Push and create a PR:**
   - Link any relevant issue.
   - Attach screenshots for visual UI changes.
   - Verify that CI passes before requesting a review.

Thank you for contributing to **MilestoneVault**! If you have any questions or ideas, feel free to open an issue or reach out to the project maintainers.
