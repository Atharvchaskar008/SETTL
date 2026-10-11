# Settl — Complete Architecture, Workflow & System Guide

> **Settl** is an ultra-modern staged payment and escrow agreement engine that transforms plain-language business agreements into cryptographically verified, milestone-locked escrow contracts with simulated banking, AI condition extraction, and mathematical invariant enforcement.

---

## 1. Executive Overview

Freelancers, agencies, and businesses frequently experience payment friction, scope creep, and payment defaults. Traditional contracts require lawyers and courts, while cryptocurrency escrows are intimidating and complex.

**Settl bridges this gap** by providing:
- **Plain-Language AI Builder:** Turn raw text agreements into structured, ambiguity-free milestone contracts.
- **Ultra-Modern Bento Dashboard:** An edge-to-edge light blue glassmorphic command center inspired by intelligent IoT and fintech control panels.
- **Smart Staged Escrow:** Funds are deposited upfront into an escrow vault, locking capital until deliverables are verified.
- **Simulated Financial Engine:** Native Indian Rupee (`₹`) accounting with simulated UPI banking, ensuring zero financial risk while demonstrating high-fidelity real-world operations.
- **Security Attack Lab:** Hardhat EVM integration with live simulation of smart contract attack vectors (e.g., Re-entrancy, Unauthorized Refunds, Double Payouts).

---

## 2. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (BROWSER)                          │
│  • Vanilla HTML5 & ES6 JavaScript (app.js)                                  │
│  • Zero-Framework Vanilla CSS Design System (app.css)                       │
│  • Ultra-Modern Bento Grid Layout (100vh Edge-to-Edge, Zero-Scroll)         │
│  • Refractive Glassmorphism, Caustic Ambient Lighting & Micro-Animations    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST JSON
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            APPLICATION SERVER                               │
│  • Node.js & Express.js REST API (server/src/index.js, routes.js)           │
│  • In-Memory Atomic Ledger & Event Store (server/src/store.js)              │
│  • Settl Invariant & Refusal Rule Engine (server/src/settlEngine.js)        │
└──────────────────┬───────────────────────────────────────┬──────────────────┘
                   │                                       │
┌──────────────────▼──────────────────┐ ┌──────────────────▼──────────────────┐
│             AI ENGINE               │ │         BLOCKCHAIN & VAULT          │
│  • Google Gemini API Integration    │ │  • Solidity ^0.8.24 (SettlVault.sol)│
│  • Milestone & Share Extraction     │ │  • OpenZeppelin ReentrancyGuard     │
│  • Ambiguity Detection & Hardening  │ │  • Hardhat Local Node EVM Simulator │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
```

### Detailed Stack Breakdown:
1. **Frontend Architecture:**
   - **Structure:** Semantic HTML5 (`web/index.html`) with modular modal sheets and responsive bento cards.
   - **Styling:** Pure Vanilla CSS (`web/app.css`) using CSS Grid, Flexbox, custom design tokens, and backdrop filter shaders. Built to fit `100vw × 100vh` without outer page margins or viewport scrolling.
   - **Logic:** Vanilla JavaScript (`web/app.js`) maintaining reactive state (`actingPerson`, `activeStageId`, `currentDeal`, `activeRefusals`), Indian Rupee formatting (`Intl.NumberFormat`), and modal controllers.
2. **Backend Architecture:**
   - **Server:** Node.js Express framework (`server/src/index.js`).
   - **Ledger Store:** Atomic state store (`server/src/store.js`) maintaining deals, participants, withdrawable balances, and immutable history logs.
   - **Rules Engine:** Strict validation middleware refusing illegal transitions with HTTP 409 Conflict and human-readable plain language reasons.
3. **Smart Contract & Vault Engine:**
   - **Language:** Solidity `^0.8.24` (`contracts/SettlVault.sol`).
   - **Security:** Non-reentrant withdrawal guards, cryptographic agreement fingerprint hashes (`keccak256`), and multi-signature judge arbitration.
   - **Network:** Hardhat local development network.
4. **AI Parsing Engine:**
   - **Model:** Google Gemini API (`@google/genai`).
   - **Tasks:** Extracting payer-payee relationships, milestone amounts, and flagging vague terms (e.g., *"when good"*, *"soon"*).

---

## 3. High-Level Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (Riya)
    actor Provider as Provider (Aman)
    actor Arbiter as Arbiter (Meera)
    participant UI as Bento Dashboard (web)
    participant Server as Settl API (Express)
    participant Vault as Hardhat EVM Vault

    Note over Client, Server: 1. AGREEMENT FORMATION & FUNDING
    Client->>UI: Enter agreement text or select sample
    UI->>Server: POST /deals/draft
    Server-->>UI: Proposed milestones & ambiguity warnings
    Client->>UI: Confirm checklist terms
    Client->>UI: Sign [I Agree]
    Provider->>UI: Sign [I Agree]
    Client->>Server: POST /deals/:id/lock
    Server->>Vault: Deploy / Anchor Vault Agreement
    Client->>Server: POST /deals/:id/deposit (Simulated UPI)
    Server-->>UI: Deal becomes Active (₹30,000 locked)

    Note over Client, Server: 2. MILESTONE EXECUTION & APPROVAL
    Provider->>UI: Submit Proof / Mark Done
    UI->>Server: POST /deals/:id/stages/:stg/done
    Server-->>UI: Status = Completed (Awaiting Client Approval)
    Client->>UI: Click [Approve]
    UI->>Server: POST /deals/:id/stages/:stg/approve
    Server->>Server: Release funds to Provider Withdrawable Balance
    Server-->>UI: Milestone Settled; Provider balance credited

    Note over Provider, Vault: 3. WITHDRAWAL
    Provider->>UI: Click [Withdraw]
    UI->>Server: POST /deals/:id/withdraw
    Server->>Vault: Execute withdraw() with ReentrancyGuard
    Server-->>UI: ₹15,000 credited to Bank Account
```

---

## 4. Complete System Workflows

### 4.1. AI Agreement Creation Workflow
1. **Describe:** User pastes informal terms (e.g., *"Riya will pay Aman Rs 30,000 for a website: Rs 10,000 after design, Rs 15,000 after dev, and Rs 5,000 when good. Meera settles disputes."*).
2. **Review & Ambiguity Detection:** The engine splits the text:
   - Identifies Payers, Payee, and Arbiter.
   - Calculates individual milestone amounts and checks that payer contributions match total stages.
   - Flags ambiguous conditions (such as *"when good"*) with an inline warning. Users click `[fix]` to sharpen the condition into an objective criterion.
3. **Agree:** All participants must review and click `[I agree]` under their acting persona.
4. **Lock & Simulated Deposit:** The creator locks the deal into the EVM vault. Payers deposit their respective shares via simulated UPI. When 100% funded, the deal switches to `Active`.

### 4.2. Milestone State Lifecycle

```
┌───────────┐      Payee marks done      ┌───────────┐
│  PENDING  │ ─────────────────────────► │ COMPLETED │
└─────┬─────┘                            └─────┬─────┘
      │                                        │
      │                                ┌───────┴───────┐
      │                  Client approves               Client disputes
      │                        │                               │
      │                        ▼                               ▼
      │                 ┌───────────┐                   ┌───────────┐
      │                 │ RELEASED  │                   │ DISPUTED  │
      │                 └───────────┘                   └─────┬─────┘
      │                                                       │
      │                                               ┌───────┴───────┐
      │                                         Arbiter awards   Arbiter refunds
      │                                               │               │
      │                                               ▼               ▼
      │                                         ┌───────────┐   ┌───────────┐
      │                                         │ RELEASED  │   │ REFUNDED  │
      │                                         └───────────┘   └───────────┘
```

- **Pending:** Payee works on the deliverable. Only the Payee can click `Submit Proof / Mark Done`.
- **Completed:** Deliverable is ready. Client inspects work. Only Client can click `Approve` or `Dispute`.
- **Disputed:** Client raised an objection. The stage enters arbitration lock. Only the designated Arbiter (`Judge`) can rule.
- **Released:** Milestone funds are transferred to the Payee's withdrawable balance.
- **Refunded:** Milestone funds are returned to the Client's withdrawable balance.

### 4.3. Mathematical Reconciliation Invariant
At every millisecond of operation, the ledger strictly enforces:
$$\text{Total Deposited} = \text{Locked In Vault} + \text{Waiting (Withdrawable)} + \text{Paid Out}$$
If this equation ever fails, the UI displays a red reconciliation alert (`Reconciles: no`) and halts all further stage transitions.

---

## 5. Frontend Bento UI / UX Architecture

The Settl interface is styled after ultra-modern intelligent device hubs and high-end fintech platforms:

```
┌───┬───────────────────────────────────────────┬─────────────────────────────┐
│   │ CARD 1: PANORAMIC WORKSPACE HERO          │ CARD 2: AGREEMENTS LIST     │
│   │ • Live Simulated Funds Badge              │ • Vertical list of deals    │
│ R │ • 4 Telemetry Pills (₹ Escrow, Lock, Out) │ • Elevated active white card│
│ A │ • Panoramic Visual + Deal Title & Specs   │ • Full-width pill button:   │
│ I │ • Prompt Input: (+) [ AI input ] [Submit] │   [ + ADD AGREEMENT ]       │
│ L ├───┬───────────────────────┬───────────────┴─────────────┬───────────────┤
│   │ CARD 3: VAULT DISK        │ CARD 4: SMART ARBITER LAMP  │ CARD 5: PAYOUT│
│   │ • Concentric Vault Ring   │ • Radiant Glowing Orb       │ • Radial Ring │
│   │ • 3 Stat Pills (3/5, ₹, %)│ • Dispute Guard Toggle      │ • Avatar Face │
│   │ • Action Pills: Submit /  │ • Decision Slider & Ruling: │ • 5 Playback  │
│   │   Approve / Dispute       │   [Pay Payee] [Refund]      │   Controls    │
└───┴───────────────────────────┴─────────────────────────────┴───────────────┘
```

### The 5 Bento Cards:
1. **Hero Panoramic Card:** Spans across the top-left area. Features floating telemetry pills (`₹30,000 Total`, `₹20,000 Locked`, `₹10,000 Paid`, `100% Valid`), an ambient workspace render, and an AI instruction prompt bar.
2. **Agreements List Card:** Spans the top-right column. Displays active and completed deals with clean chevrons, highlights the current deal in an elevated white floating card with drop shadow, and includes a dark full-width pill button `+ ADD AGREEMENT`.
3. **Milestone Vault Card:** Bottom-left card featuring an interactive concentric vault disc with callout stat badges (`₹15,000 Locked Escrow`, `100% Spec Verified`), 3 summary stat pills, and inline action buttons (`Submit Proof`, `Approve`, `Dispute`).
4. **Smart Arbiter Card:** Bottom-middle card featuring a glowing pendant lamp orb with ambient radial illumination, a dispute toggle, an arbiter percentage slider, and quick decision buttons (`Pay Payee`, `Refund`).
5. **Freelancer Payout & Radial Progress Card:** Bottom-right card featuring a circular user profile portrait framed inside an SVG radial progress arc, a withdrawable rupee counter, and 5 audio-styled playback controls (`Withdraw`, `Prev Milestone`, `Approve/Release`, `Next Milestone`, `Deposit`).

### Left Navigation Rail:
- **Brand Clover:** Clickable Settl clover emblem.
- **5 Nav Icons:** Dashboard (active soft pill), Deals Switcher, AI Builder Wizard, Smart Arbiter Panel, and Attack Lab Simulator.
- **Bottom Stack:** Demo data reset button and interactive Persona avatar switcher.

---

## 6. Security Architecture & Attack Simulator

Settl includes a built-in **Attack Lab** (`#attack-modal-backdrop`) demonstrating why smart contract and backend invariants are necessary:

| Attack Scenario | Threat Description | Settl Defense Mechanism |
|---|---|---|
| **Second Release** | Malicious payee attempts to trigger payment release twice for the same milestone. | State transition verification: Stage must be in `Completed` state; already `Released` stages are immediately refused with HTTP 409. |
| **Unauthorized Refund** | Payer attempts to bypass the Arbiter and refund themselves directly. | Role-Based Access Control (RBAC): Only the registered `judge` persona can execute refund transactions. |
| **Out-of-Order Approval** | Client attempts to approve a milestone before the provider submitted proof. | Sequence check: Stage must transition through `Pending` $\to$ `Completed` before approval is accepted. |
| **Re-entrancy Exploit** | Attacker calls fallback function inside `withdraw()` to drain vault before balance is set to zero. | Solidity `ReentrancyGuard` (`nonReentrant` modifier) ensures state balance is set to zero **before** transferring funds (Checks-Effects-Interactions pattern). |

---

## 7. API Reference

All requests and responses use JSON. Unpermitted actions respond with `HTTP 409 Conflict` and `{ "reason": "plain text explanation" }`.

### Core Endpoints:

| Method | Endpoint | Description | Expected Body |
|---|---|---|---|
| `GET` | `/people` | Retrieve fictional personas | — |
| `GET` | `/deals` | Retrieve all agreements | — |
| `GET` | `/deals/:id?person=:name` | Retrieve agreement details & personal balance | — |
| `POST` | `/deals/draft` | Generate draft agreement from text or sample | `{ "text": "...", "sampleKey": "freelance" }` |
| `PUT` | `/deals/:id/checklist` | Update agreement checklist parameters | `{ "stages": [...], "payers": [...] }` |
| `POST` | `/deals/:id/confirm` | Confirm terms and advance to signature phase | `{ "person": "Riya" }` |
| `POST` | `/deals/:id/agree` | Record signature for acting persona | `{ "person": "Riya" }` |
| `POST` | `/deals/:id/lock` | Deploy / anchor deal into vault | `{ "person": "Riya" }` |
| `POST` | `/deals/:id/deposit` | Deposit simulated UPI share | `{ "person": "Riya" }` |
| `POST` | `/deals/:id/stages/:stgId/done` | Mark milestone deliverable complete | `{ "person": "Aman" }` |
| `POST` | `/deals/:id/stages/:stgId/approve` | Approve milestone and release escrow funds | `{ "person": "Riya" }` |
| `POST` | `/deals/:id/stages/:stgId/dispute` | Raise dispute on milestone deliverable | `{ "person": "Riya", "disputeReason": "..." }` |
| `POST` | `/deals/:id/stages/:stgId/resolve` | Arbiter ruling (`pay_payee` or `refund_payers`) | `{ "person": "Meera", "resolution": "pay_payee" }` |
| `POST` | `/deals/:id/withdraw` | Withdraw credited funds to bank account | `{ "person": "Aman" }` |
| `GET` | `/attacks` | Retrieve list of security attack scenarios | — |
| `POST` | `/attacks/:name` | Run live attack simulation | — |
| `POST` | `/api/reset` | Reset demo database to initial state | — |

---

## 8. Summary of Operating Guidelines
1. **Currency Representation:** All amounts are displayed in Indian Rupees (`₹`) with commas (e.g., `₹2,00,000`, `₹30,000`).
2. **Simulation Transparency:** The "Live / Simulated funds" badge is permanently visible.
3. **Inline Error Visibility:** Errors are never hidden in browser consoles; they render directly next to the user's action via `.refusal-alert`.
4. **Full-Screen Responsive Fit:** Layout spans `100vw × 100vh` without outer page scrollbars or empty margins.
