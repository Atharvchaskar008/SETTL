# Settl — Frontend Dashboard Guide for Collaborators

This folder (`/web`) contains the complete frontend web application for Settl. The backend server already enforces every business rule and returns plain-language responses or HTTP 409 refusals.

---

## Files in `/web`

| File | Purpose |
|---|---|
| **[`index.html`](file:///d:/projects/settl/Vortexa-3.0/web/index.html)** | Semantic HTML structure for all 5 screens, modals, top navigation, and responsive layouts. |
| **[`app.css`](file:///d:/projects/settl/Vortexa-3.0/web/app.css)** | Vanilla CSS design system: dark fintech theme, glassmorphism, state badge colors, 3-part money bar, inline refusal styling, and `<700px` mobile layout stack. |
| **[`app.js`](file:///d:/projects/settl/Vortexa-3.0/web/app.js)** | Client application logic: API requests, Indian Rupee formatting (`₹2,00,000`), persona switching, "Try anything" toggle, step-by-step wizard, interactive phrase hover linking, and inline refusal placement. |

---

## Core Design Principles

1. **Rupees everywhere:** Show every amount formatted in Indian Rupees with Indian grouping (e.g. `₹2,00,000`, `₹30,000`). Use the `formatRupees(amount)` helper.
2. **Always labelled as pretend:** A **"Simulated funds"** pill stays visible in the top navigation bar.
3. **One clear next step:** Each participant sees what they can do right now, and who the deal is waiting for when it is not them.
4. **Refusals appear where the click happened:** When the backend returns HTTP 409 with `{ reason: "..." }`, display that exact plain-language text directly underneath the clicked button/container in a `.refusal-alert` banner. It stays there until the next action.
5. **State in words, not colour alone:** Every badge must have an explicit text label (e.g., `Pending`, `Done, awaiting approval`, `Disputed`, `Paid`, `Refunded`).
6. **Technical details stay hidden:** Vault contract address, agreement fingerprint hash, and EVM account addresses sit behind the "Technical details >" link.
7. **Mobile responsive (<700px):** Stack everything in one column in this exact order:
   `Header` → `Money Bar` → `Your Money` → `Stages` → `People` → `History`.
   On the Review step, the checklist appears first, and the original text sits in a collapsible panel under it.

---

## The 5 Screens

### Screen 1: Deals (`#screen-deals`)
- Table of all deals with Title, Phase badge, Total amount, Stages settled (e.g. "1 of 3"), and "Waiting for" message.
- Clicking any row navigates directly to that deal's dashboard.

### Screen 2: New deal (`#screen-new-deal`)
A 4-step wizard:
1. **Describe:** Text area with sample buttons (*Flatmates*, *Freelance*, *Construction*, *Company bonus*) and a "Check this deal" button.
2. **Review:** Split layout.
   - *Left:* Read-only original text. Unclear phrases are highlighted in amber. Hovering a checklist stage highlights its source phrase in cyan!
   - *Right:* Editable checklist (Payers, Judge, Stages, Unclear items). Clicking `[fix]` on an unclear item lets the user replace vague lines with objective verification criteria. "Confirm checklist" is disabled until unclear items and problems are zero.
3. **Agree:** One row per participant with their role and Agreed/Waiting status. The active persona sees an `[ I agree ]` button on their row.
4. **Lock:** Organiser locks the deal into the vault. Payers then see `[ Deposit ₹X (simulated UPI) ]`. Once all payers deposit, the deal automatically becomes Active and opens the Deal Dashboard.

### Screen 3: Deal Dashboard (`#screen-deal-dashboard`)
- **Header:** Deal title, Phase badge (`[Funding]`, `[Active]`, `[Closed]`, `[Cancelled]`), participants by role, and "Read by" pill.
- **3-Part Money Bar:**
  - *Locked:* stages not yet settled
  - *Waiting:* credited to payee/payer, waiting to be withdrawn
  - *Paid out:* already withdrawn
  - Reconciles badge (`yes` / `no`).
- **Stages List:** Stage row with state badge, requirement condition in quotes, and role-based action buttons:
  - *Pending:* Payee sees `[ Mark done ]`
  - *Completed:* Payer sees `[ Approve ]`, `[ Dispute ]` (with approval counts like `1 of 2 approved`)
  - *Disputed:* Judge sees `[ Pay the payee ]`, `[ Refund the payers ]`
  - *With "Try anything" ON:* ALL buttons are rendered for ALL personas so invalid clicks trigger live 409 refusals.
- **Your Money:** Shows withdrawable balance for the currently selected persona with a `[ Withdraw ]` button (disabled at ₹0).
- **People:** Participant list with payer shares and deposit status.
- **History:** Full audit timeline (newest first) recording accepted events and refusal reasons.

### Screen 4: Attack lab (`#screen-attack-lab`)
- 4 interactive security attack cards:
  1. *Second release:* Try to get paid twice for the same stage.
  2. *Unauthorised refund:* Non-judge attempts to refund a disputed stage.
  3. *Out of order:* Attempting to approve a stage that was never marked done.
  4. *Re-entrancy:* Payee re-enters `withdraw()` before balance is cleared. Displays a side-by-side comparison: **Real Vault** (ReentrancyGuard blocks attack) vs **Weak Copy** (vault drained).

### Screen 5: Summary (`#screen-summary`)
- Opened for completed (`Closed` / `Cancelled`) deals.
- Participant settlement breakdown (Paid in, Received, Refunded).
- Stages outcome table (Paid by approval, Paid by judge, Refunded by judge).
- Totals equation: *"Deposited equals paid out plus refunded"*.

---

## Backend API Endpoints

Every mutation endpoint expects `{ person: string, ... }` in the JSON request body. When an action is not permitted, the backend responds with **HTTP 409 Conflict** and `{ reason: "plain words explanation" }`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/people` | List of fictional personas (Riya, Kabir, Aman, Priya, Meera, Vikram) |
| `GET` | `/deals` | Overview list of all deals |
| `POST` | `/deals/draft` | Create draft deal from text or sample (`{ text, sampleKey, person }`) |
| `PUT` | `/deals/:id/checklist` | Update checklist fields; clears prior agreements |
| `POST` | `/deals/:id/confirm` | Confirm checklist and move to Agree step |
| `POST` | `/deals/:id/agree` | Record signature for acting person (`{ person }`) |
| `POST` | `/deals/:id/lock` | Lock agreement into escrow vault |
| `POST` | `/deals/:id/deposit` | Deposit simulated funds for a payer (`{ person }`) |
| `GET` | `/deals/:id?person=...` | Full deal data, reconciliation, stages, and personal balance |
| `GET` | `/deals/:id/history` | Chronological event and refusal history |
| `POST` | `/deals/:id/stages/:stageId/done` | Mark stage complete (Payee only) |
| `POST` | `/deals/:id/stages/:stageId/approve` | Approve stage (Payer only) |
| `POST` | `/deals/:id/stages/:stageId/dispute` | Dispute deliverable (Payer only) |
| `POST` | `/deals/:id/stages/:stageId/resolve` | Settle dispute (`pay_payee` or `refund_payers` — Judge only) |
| `POST` | `/deals/:id/withdraw` | Withdraw available funds for acting person (`{ person }`) |
| `GET` | `/attacks` | Get metadata for the 4 attack scenarios |
| `POST` | `/attacks/:name` | Execute attack simulation and get trace results |
| `GET` | `/deals/:id/summary` | Get final closing financial settlement summary |
| `POST` | `/api/reset` | Reset sample deals back to pristine initial demo state |

---

## How to Run & Test

```bash
# 1. Start the server (serves the web folder at http://localhost:3000)
npm start

# 2. Run automated demo verification
npm run demo
```
