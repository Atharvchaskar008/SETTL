/**
 * Settl — Frontend Client Application
 * Implements exact Image 2 wireframe layout, Indian Rupee formatting,
 * inline refusals, "Acting as" switching, and "Try anything" mode.
 */

// Application State
const state = {
  people: [],
  actingPerson: "Riya",
  tryAnything: false,
  currentScreen: "dashboard",
  currentDealId: "deal-1",
  currentDeal: null,
  activeStageId: null,
  dealsList: [],
  wizardStep: 1,
  wizardDeal: null,
  activeRefusals: {} // slotId -> refusal message
};

// Indian Rupee Currency Formatter (e.g. ₹2,00,000, ₹30,000)
function formatRupees(amount) {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

// Clear or Set Inline Refusal
function clearRefusals() {
  document.querySelectorAll(".refusal-slot").forEach(slot => {
    slot.innerHTML = "";
  });
  state.activeRefusals = {};
}

function showRefusal(slotId, reasonText) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  state.activeRefusals[slotId] = reasonText;
  slot.innerHTML = `
    <div class="refusal-alert" role="alert">
      <span class="refusal-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </span>
      <span class="refusal-text">${escapeHtml(reasonText)}</span>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// API Helper
async function api(path, options = {}) {
  const url = path;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, error: data.reason || `Error ${res.status}: ${res.statusText}` };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.message || "Network request failed" };
  }
}

// Sample Proof Vault Documents (Card D)
const sampleDocs = {
  "1": {
    badge: "Figma Spec",
    title: "UI Tokens & Wireframe Specification",
    filename: "design_tokens.fig",
    milestone: "Stage 1 (Initial UI Prototype)",
    submittedBy: "Aman",
    hash: "0x7b819f02c448d1e2a013",
    status: "Verified & Accepted",
    desc: "Complete component design system, color tokens, and responsive layout specifications matching client requirements."
  },
  "2": {
    badge: "GitHub PR",
    title: "Frontend Build & Integration",
    filename: "PR #104 Merged",
    milestone: "Stage 2 (Frontend Dev)",
    submittedBy: "Aman",
    hash: "0x3a48e219cb810fe912a7",
    status: "CI Build Passed (18 commits)",
    desc: "Complete implementation of client dashboard with liquid glass aesthetics, interactive tests passing 100%."
  },
  "3": {
    badge: "UPI Receipt",
    title: "Simulated UPI Payment Reference",
    filename: "simulated_upi.pdf",
    milestone: "Vault Escrow Deposit",
    submittedBy: "Riya",
    hash: "0x98471203a1f9e830bd55",
    status: "Deposited in Vault",
    desc: "Pretend UPI payment reference UPI/AXIS/98471203/SETTL verifying funds ingress into the Hardhat EVM vault."
  }
};

// ==========================================================================
// Initialization & Navigation
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  setupRailNavigation();
  setupPersonaAndMode();
  setupDashboardInteractions();
  setupModals();
  setupWizardHandlers();

  await loadPeople();
  await loadDeals();
  await loadDealDashboard(state.currentDealId || "deal-1");
});

function setupRailNavigation() {
  document.getElementById("rail-sparkle-btn")?.addEventListener("click", () => {
    loadDealDashboard(state.currentDealId);
  });

  document.getElementById("rail-btn-dashboard")?.addEventListener("click", () => {
    highlightRailDot("rail-btn-dashboard");
    closeAllModals();
  });

  document.getElementById("rail-btn-deals")?.addEventListener("click", () => {
    highlightRailDot("rail-btn-deals");
    openDealsModal();
  });

  document.getElementById("deal-title-pill")?.addEventListener("click", () => {
    openDealsModal();
  });

  document.getElementById("rail-btn-ai-builder")?.addEventListener("click", () => {
    highlightRailDot("rail-btn-ai-builder");
    openWizardModal();
  });

  document.getElementById("rail-btn-arbiter")?.addEventListener("click", () => {
    highlightRailDot("rail-btn-arbiter");
    closeAllModals();
    const cardC = document.getElementById("card-hub-overview");
    if (cardC) {
      cardC.scrollIntoView({ behavior: "smooth", block: "center" });
      cardC.style.boxShadow = "0 0 0 3px rgba(26, 63, 117, 0.4)";
      setTimeout(() => { cardC.style.boxShadow = ""; }, 1800);
    }
  });

  document.getElementById("rail-btn-attacks")?.addEventListener("click", () => {
    highlightRailDot("rail-btn-attacks");
    openAttackModal();
  });

  document.getElementById("btn-reset-demo")?.addEventListener("click", async () => {
    await api("/api/reset", { method: "POST" });
    await loadDeals();
    if (state.currentDealId) {
      await loadDealDashboard(state.currentDealId);
    }
    showAiToast("Demo data successfully reset to initial state.");
  });

  document.getElementById("rail-avatar-badge")?.addEventListener("click", () => {
    // Cycle through personas
    if (state.people.length > 0) {
      const idx = state.people.findIndex(p => p.id === state.actingPerson);
      const nextIdx = (idx + 1) % state.people.length;
      state.actingPerson = state.people[nextIdx].id;
      const select = document.getElementById("select-acting-as");
      if (select) select.value = state.actingPerson;
      onPersonaOrModeChanged();
    }
  });
}

function highlightRailDot(dotId) {
  document.querySelectorAll(".rail-capsule-dot").forEach(dot => {
    dot.classList.toggle("active", dot.id === dotId);
  });
}

function setupPersonaAndMode() {
  const selectActing = document.getElementById("select-acting-as");
  selectActing?.addEventListener("change", (e) => {
    state.actingPerson = e.target.value;
    clearRefusals();
    onPersonaOrModeChanged();
  });

  const toggleTryAnything = document.getElementById("toggle-try-anything");
  toggleTryAnything?.addEventListener("change", (e) => {
    state.tryAnything = e.target.checked;
    clearRefusals();
    onPersonaOrModeChanged();
  });
}

function onPersonaOrModeChanged() {
  const avatarBadge = document.getElementById("rail-avatar-badge");
  const avatarInitial = document.getElementById("rail-avatar-initial");
  if (avatarInitial) {
    avatarInitial.textContent = (state.actingPerson || "R")[0].toUpperCase();
  }
  if (avatarBadge) {
    avatarBadge.title = `Acting as ${state.actingPerson} (Click to switch)`;
  }

  if (state.currentDeal) {
    renderDealDashboard(state.currentDeal);
  }
  if (state.wizardDeal) {
    if (state.wizardStep === 3) renderAgreeStep();
    if (state.wizardStep === 4) renderLockStep();
  }
}

async function loadPeople() {
  const res = await api("/people");
  if (res.ok && res.data.people) {
    state.people = res.data.people;
    const select = document.getElementById("select-acting-as");
    if (select) {
      select.innerHTML = "";
      state.people.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.roleDesc.split(" ")[0]})`;
        if (p.id === state.actingPerson) opt.selected = true;
        select.appendChild(opt);
      });
    }
    const initial = document.getElementById("rail-avatar-initial");
    if (initial) initial.textContent = (state.actingPerson || "R")[0].toUpperCase();
  }
}

// ==========================================================================
// DEALS LOADING & MODAL
// ==========================================================================

async function loadDeals() {
  const res = await api("/deals");
  if (!res.ok) return;

  state.dealsList = res.data.deals;
  const tbody = document.getElementById("deals-table-body");
  if (!tbody) return;

  tbody.innerHTML = state.dealsList.map(deal => {
    const isCurrent = deal.id === state.currentDealId;
    return `
      <tr class="deal-row-interactive" data-deal-id="${deal.id}" style="${isCurrent ? 'background: rgba(26,63,117,0.06); font-weight: 700;' : ''}">
        <td>${escapeHtml(deal.title)} ${isCurrent ? '<span class="badge badge-completed">Active</span>' : ''}</td>
        <td><span class="badge ${getPhaseBadgeClass(deal.phase)}">${escapeHtml(deal.phase)}</span></td>
        <td class="amount-rupee">${formatRupees(deal.totalAmount)}</td>
        <td>${escapeHtml(deal.stagesSettled)}</td>
        <td class="text-muted text-sm">${escapeHtml(deal.waitingFor)}</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm btn-select-deal" data-deal-id="${deal.id}">
            Select
          </button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-select-deal").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const dealId = btn.getAttribute("data-deal-id");
      closeAllModals();
      await loadDealDashboard(dealId);
    });
  });

  tbody.querySelectorAll(".deal-row-interactive").forEach(row => {
    row.addEventListener("click", async () => {
      const dealId = row.getAttribute("data-deal-id");
      closeAllModals();
      await loadDealDashboard(dealId);
    });
  });
}

function getPhaseBadgeClass(phase) {
  switch (phase) {
    case "Active": return "badge-released";
    case "Funding": return "badge-completed";
    case "Closed": return "badge-neutral";
    case "Cancelled": return "badge-danger";
    case "Review": return "badge-disputed";
    case "Agree": return "badge-pending";
    default: return "badge-neutral";
  }
}

function getStateBadgeClass(stgState) {
  switch (stgState) {
    case "Pending": return "badge-pending";
    case "Completed": return "badge-completed";
    case "Disputed": return "badge-disputed";
    case "Released": return "badge-released";
    case "Refunded": return "badge-refunded";
    default: return "badge-neutral";
  }
}

function getStateLabel(stgState) {
  switch (stgState) {
    case "Pending": return "Pending";
    case "Completed": return "Submitted";
    case "Disputed": return "Disputed";
    case "Released": return "Released";
    case "Refunded": return "Refunded";
    default: return stgState;
  }
}

// ==========================================================================
// DEAL DASHBOARD RENDER (CARDS A, B, C, D)
// ==========================================================================

async function loadDealDashboard(dealId) {
  state.currentDealId = dealId;
  const res = await api(`/deals/${dealId}?person=${encodeURIComponent(state.actingPerson)}`);
  if (!res.ok) return;

  state.currentDeal = res.data.deal;
  renderDealDashboard(state.currentDeal, res.data);
}

function renderDealDashboard(deal, metaData = null) {
  if (!deal) return;

  // Header Titles
  const dashTitle = document.getElementById("dash-deal-title");
  const capsuleTitle = document.getElementById("capsule-deal-title");
  if (dashTitle) dashTitle.textContent = deal.title;
  if (capsuleTitle) capsuleTitle.textContent = deal.title;

  const phaseBadge = document.getElementById("dash-phase-badge");
  if (phaseBadge) {
    phaseBadge.className = `badge ${getPhaseBadgeClass(deal.phase)}`;
    phaseBadge.textContent = deal.phase;
  }

  // Participants Chips
  const payerNames = deal.payers.map(p => p.person).join(", ");
  const payeeNames = [...new Set(deal.stages.map(s => s.payee))].join(", ");
  const participantsBox = document.getElementById("dash-participants-meta");
  if (participantsBox) {
    participantsBox.innerHTML = `
      <span class="participant-chip chip-client">Client: <strong>${escapeHtml(payerNames)}</strong></span>
      <span class="participant-chip chip-provider">Provider: <strong>${escapeHtml(payeeNames)}</strong></span>
      <span class="participant-chip chip-arbiter">Arbiter: <strong>${escapeHtml(deal.judge)}</strong></span>
    `;
  }

  // Active Milestone in Card A
  if (!state.activeStageId || !deal.stages.some(s => s.id === state.activeStageId)) {
    const focusStage = deal.stages.find(s => s.state === "Completed" || s.state === "Disputed" || s.state === "Pending") || deal.stages[0];
    state.activeStageId = focusStage ? focusStage.id : "stg-1";
  }

  const activeStage = deal.stages.find(s => s.id === state.activeStageId) || deal.stages[0];
  renderActiveStageCard(activeStage, deal);

  // Card B: Stacked Cards (Pending Approvals & Disputes)
  renderActionStackCards(deal);

  // Card C: Overview & Arbiter Hub (Metrics + 3x3 Grid + Money Bar)
  renderVaultAndMatrix(deal, metaData);

  // Card D: Proof Vault Hash
  const hashEl = document.getElementById("proof-vault-hash");
  if (hashEl) {
    hashEl.textContent = `Hash: ${(deal.agreementFingerprint || "0x8f4b2ae").slice(0, 10)}...`;
  }
}

// Render Card A: Center Active Milestone Showcase
function renderActiveStageCard(stage, deal) {
  if (!stage) return;

  const titleEl = document.getElementById("active-milestone-title");
  const amountEl = document.getElementById("active-milestone-amount");
  const conditionEl = document.getElementById("active-milestone-condition");
  const waitingText = document.getElementById("active-milestone-waiting-text");
  const buttonsArea = document.getElementById("active-stage-buttons-area");

  if (titleEl) titleEl.textContent = `Stage ${stage.num}: ${stage.title}`;
  if (amountEl) amountEl.textContent = formatRupees(stage.amount);
  if (conditionEl) conditionEl.textContent = `"${stage.condition}"`;

  // Status Stepper Highlighting
  const stepper = document.querySelector(".milestone-status-progression");
  if (stepper) {
    const pills = stepper.querySelectorAll(".status-step-pill");
    pills.forEach(p => p.className = "status-step-pill");

    if (stage.state === "Pending") {
      pills[0]?.classList.add("current");
    } else if (stage.state === "Completed") {
      pills[0]?.classList.add("passed");
      pills[1]?.classList.add("current");
    } else if (stage.state === "Disputed") {
      pills[0]?.classList.add("passed");
      pills[1]?.classList.add("passed");
      pills[2]?.classList.add("current");
    } else if (stage.state === "Released" || stage.state === "Refunded") {
      pills[0]?.classList.add("passed");
      pills[1]?.classList.add("passed");
      pills[2]?.classList.add("passed");
      pills[3]?.classList.add("passed");
    }
  }

  // Permission Checks
  const isPayer = deal.payers.some(p => p.person === state.actingPerson);
  const isPayee = stage.payee === state.actingPerson;
  const isJudge = deal.judge === state.actingPerson;
  const tryAll = state.tryAnything;

  let btns = "";
  if (tryAll) {
    btns = `
      <button type="button" class="action-clean-pill btn-stage-action" data-action="done" data-stage="${stage.id}">Submit Proof</button>
      <button type="button" class="action-clean-pill primary btn-stage-action" data-action="approve" data-stage="${stage.id}">Approve</button>
      <button type="button" class="action-clean-pill danger btn-stage-action" data-action="dispute" data-stage="${stage.id}">Dispute</button>
    `;
  } else {
    if (stage.state === "Pending") {
      if (isPayee) {
        btns = `<button type="button" class="action-clean-pill primary btn-stage-action" data-action="done" data-stage="${stage.id}">Submit Proof</button>`;
      }
    } else if (stage.state === "Completed") {
      if (isPayer) {
        btns = `
          <button type="button" class="action-clean-pill primary btn-stage-action" data-action="approve" data-stage="${stage.id}">Approve</button>
          <button type="button" class="action-clean-pill danger btn-stage-action" data-action="dispute" data-stage="${stage.id}">Dispute</button>
        `;
      }
    } else if (stage.state === "Disputed") {
      if (isJudge) {
        btns = `
          <button type="button" class="action-clean-pill primary btn-stage-action" data-action="pay_payee" data-stage="${stage.id}">Pay Payee</button>
          <button type="button" class="action-clean-pill btn-stage-action" data-action="refund_payers" data-stage="${stage.id}">Refund Client</button>
        `;
      }
    }
  }

  if (buttonsArea) buttonsArea.innerHTML = btns;

  let waiting = "";
  if (stage.state === "Pending") waiting = `Waiting for ${stage.payee} to complete`;
  else if (stage.state === "Completed") waiting = `Waiting for Client approval`;
  else if (stage.state === "Disputed") waiting = `Arbiter ${deal.judge} reviewing dispute`;
  else if (stage.state === "Released") waiting = `Settled & Released to ${stage.payee}`;
  else if (stage.state === "Refunded") waiting = `Settled & Refunded to Client`;

  if (waitingText) waitingText.textContent = waiting;

  // Bind Buttons
  buttonsArea?.querySelectorAll(".btn-stage-action").forEach(btn => {
    btn.addEventListener("click", () => handleStageAction(btn, deal));
  });
}

// Render Card B: Stacked Cards (Pending Approvals & Disputes)
function renderActionStackCards(deal) {
  const stackList = document.getElementById("action-centre-stack-list");
  const countBadge = document.getElementById("action-centre-count");
  if (!stackList) return;

  const items = [];
  deal.stages.forEach(s => {
    if (s.state === "Completed") {
      items.push({
        stageId: s.id,
        badgeClass: "tab-amber",
        num: s.num,
        tag: "Needs Approval",
        amount: formatRupees(s.amount),
        title: `Stage ${s.num}: ${s.title}`,
        desc: `Completed by ${s.payee}. Client approval requested.`
      });
    } else if (s.state === "Disputed") {
      items.push({
        stageId: s.id,
        badgeClass: "tab-purple",
        num: s.num,
        tag: "Disputed Milestone",
        amount: "Arbiter Review",
        title: `Stage ${s.num}: ${s.title}`,
        desc: `Under review by Arbiter ${deal.judge}.`
      });
    } else if (s.state === "Pending") {
      items.push({
        stageId: s.id,
        badgeClass: "tab-blue",
        num: s.num,
        tag: "In Progress",
        amount: formatRupees(s.amount),
        title: `Stage ${s.num}: ${s.title}`,
        desc: `Assigned to ${s.payee}. In progress.`
      });
    }
  });

  if (countBadge) countBadge.textContent = `${items.length} items`;

  stackList.innerHTML = items.slice(0, 4).map((item, idx) => {
    const isFocused = item.stageId === state.activeStageId;
    return `
      <div class="agreement-item-row ${isFocused ? 'active-elevated' : ''}" data-stage-id="${item.stageId}">
        <div class="item-left flex-align-center gap-3">
          <div class="item-icon-box ${isFocused ? 'active-box' : ''}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div>
            <div class="item-name">${escapeHtml(item.title)}</div>
            <div class="item-meta">${escapeHtml(item.amount)} • ${escapeHtml(item.tag)}</div>
          </div>
        </div>
        <span class="item-chevron">›</span>
      </div>
    `;
  }).join("");

  stackList.querySelectorAll(".agreement-item-row").forEach(card => {
    card.addEventListener("click", () => {
      const stageId = card.getAttribute("data-stage-id");
      state.activeStageId = stageId;
      const stg = deal.stages.find(s => s.id === stageId);
      if (stg) renderActiveStageCard(stg, deal);
      renderActionStackCards(deal);
    });
  });
}

// Render Card C: Overview Metrics & 3x3 Command Hub
function renderVaultAndMatrix(deal, metaData) {
  const recon = metaData?.reconciliation || calculateClientRecon(deal);

  const dashTotal = document.getElementById("dash-money-total");
  if (dashTotal) dashTotal.textContent = formatRupees(recon.totalDeposited);

  const mLocked = document.getElementById("metric-val-locked");
  if (mLocked) mLocked.textContent = formatRupees(recon.locked);

  const mPaid = document.getElementById("metric-val-paidout");
  if (mPaid) mPaid.textContent = formatRupees(recon.paidOut);

  const yourMoney = document.getElementById("your-money-amount");
  if (yourMoney) {
    yourMoney.textContent = formatRupees(deal.withdrawable?.[state.actingPerson] || 0);
  }

  // Reconciliation Badge
  const reconBadge = document.getElementById("dash-reconcile-badge");
  if (reconBadge) {
    reconBadge.className = recon.reconciles ? "badge badge-success" : "badge badge-danger";
    reconBadge.textContent = recon.reconciles ? "yes" : "no";
  }

  // Money Progress Bar Widths
  const total = Math.max(recon.totalDeposited, 1);
  const lockedPct = Math.min(100, Math.round((recon.locked / total) * 100));
  const waitingPct = Math.min(100 - lockedPct, Math.round((recon.waiting / total) * 100));
  const paidPct = Math.max(0, 100 - lockedPct - waitingPct);

  const barLocked = document.getElementById("bar-seg-locked");
  const barWaiting = document.getElementById("bar-seg-waiting");
  const barPaid = document.getElementById("bar-seg-paidout");

  if (barLocked) {
    barLocked.style.width = `${lockedPct}%`;
    barLocked.textContent = `Locked: ${formatRupees(recon.locked)}`;
  }
  if (barWaiting) {
    barWaiting.style.width = `${waitingPct}%`;
    barWaiting.textContent = `Waiting: ${formatRupees(recon.waiting)}`;
  }
  if (barPaid) {
    barPaid.style.width = `${paidPct}%`;
    barPaid.textContent = `Paid: ${formatRupees(recon.paidOut)}`;
  }

  // Bind 3x3 Matrix to active stage
  const activeStgId = state.activeStageId || (deal.stages[0]?.id || "stg-1");
  const matrixContainer = document.getElementById("action-matrix-container");
  if (matrixContainer) {
    matrixContainer.querySelectorAll(".btn-stage-action").forEach(btn => {
      btn.setAttribute("data-stage", activeStgId);
    });
  }
}

function calculateClientRecon(deal) {
  let locked = 0, waiting = 0;
  deal.stages.forEach(s => {
    if (["Pending", "Completed", "Disputed"].includes(s.state)) locked += s.amount;
  });
  Object.values(deal.withdrawable || {}).forEach(w => waiting += w);
  const paidOut = deal.totalPaidOut || 0;
  const totalDeposited = Object.values(deal.deposited || {}).reduce((a, b) => a + b, 0);
  return {
    locked, waiting, paidOut, totalDeposited,
    reconciles: (locked + waiting + paidOut) === totalDeposited
  };
}

// Stage Action Execution (Approve, Dispute, Done, Pay Payee, Refund)
async function handleStageAction(btn, deal) {
  const stageId = btn.getAttribute("data-stage");
  const action = btn.getAttribute("data-action");
  clearRefusals();

  let endpoint = "";
  let payload = { person: state.actingPerson };

  if (action === "done") {
    endpoint = `/deals/${deal.id}/stages/${stageId}/done`;
  } else if (action === "approve") {
    endpoint = `/deals/${deal.id}/stages/${stageId}/approve`;
  } else if (action === "dispute") {
    endpoint = `/deals/${deal.id}/stages/${stageId}/dispute`;
    payload.disputeReason = "Deliverable verification requirement unfulfilled";
  } else if (action === "pay_payee" || action === "refund_payers") {
    endpoint = `/deals/${deal.id}/stages/${stageId}/resolve`;
    payload.resolution = action;
  }

  const res = await api(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    showRefusal("refusal-stage-active", res.error);
    showRefusal("matrix-refusal-slot", res.error);
    await loadDealDashboard(deal.id);
    showRefusal("refusal-stage-active", res.error);
    showRefusal("matrix-refusal-slot", res.error);
    return;
  }

  await loadDealDashboard(deal.id);
}

// ==========================================================================
// CARD INTERACTIONS & PROMPT
// ==========================================================================

function setupDashboardInteractions() {
  // 3x3 Matrix Action Buttons
  document.querySelectorAll("#action-matrix-container .btn-stage-action").forEach(btn => {
    btn.addEventListener("click", () => {
      if (state.currentDeal) handleStageAction(btn, state.currentDeal);
    });
  });

  document.getElementById("btn-matrix-withdraw")?.addEventListener("click", async () => {
    clearRefusals();
    if (!state.currentDeal) return;
    const res = await api(`/deals/${state.currentDeal.id}/withdraw`, {
      method: "POST",
      body: JSON.stringify({ person: state.actingPerson })
    });
    if (!res.ok) {
      showRefusal("matrix-refusal-slot", res.error);
      return;
    }
    showAiToast(`Simulated withdrawal of credited funds executed for ${state.actingPerson}.`);
    await loadDealDashboard(state.currentDeal.id);
  });

  document.getElementById("btn-matrix-deposit")?.addEventListener("click", async () => {
    clearRefusals();
    if (!state.currentDeal) return;
    const res = await api(`/deals/${state.currentDeal.id}/deposit`, {
      method: "POST",
      body: JSON.stringify({ person: state.actingPerson })
    });
    if (!res.ok) {
      showRefusal("matrix-refusal-slot", res.error);
    } else {
      showAiToast(`Simulated UPI deposit of payer share confirmed for ${state.actingPerson}.`);
      await loadDealDashboard(state.currentDeal.id);
    }
  });

  document.getElementById("btn-matrix-ruling")?.addEventListener("click", () => {
    showAiToast(`Arbiter ${state.currentDeal?.judge || 'Meera'} records formal rulings directly via 'Pay Payee' or 'Refund Client'.`);
  });

  // Card D: Proof Vault Fanned Doc Cards Preview
  document.querySelectorAll(".fanned-card").forEach(card => {
    card.addEventListener("click", () => {
      const docId = card.getAttribute("data-doc");
      openProofDocPreview(docId);
    });
  });

  document.getElementById("btn-upload-proof")?.addEventListener("click", () => {
    openUploadProofModal();
  });

  // Bento Card Controls & Navigation
  document.getElementById("btn-add-agreement-pill")?.addEventListener("click", () => {
    openWizardModal();
  });

  document.getElementById("btn-view-all-deals")?.addEventListener("click", () => {
    openDealsModal();
  });

  document.getElementById("btn-inspect-vault-proof")?.addEventListener("click", () => {
    openProofDocPreview("1");
  });

  // Cycle Milestones (Prev / Next in Speaker Payout Card)
  document.getElementById("btn-ctrl-prev")?.addEventListener("click", () => {
    if (!state.currentDeal || !state.currentDeal.stages.length) return;
    const stages = state.currentDeal.stages;
    const currIdx = stages.findIndex(s => s.id === state.activeStageId);
    const newIdx = (currIdx - 1 + stages.length) % stages.length;
    state.activeStageId = stages[newIdx].id;
    renderDealDashboard(state.currentDeal);
  });

  document.getElementById("btn-ctrl-next")?.addEventListener("click", () => {
    if (!state.currentDeal || !state.currentDeal.stages.length) return;
    const stages = state.currentDeal.stages;
    const currIdx = stages.findIndex(s => s.id === state.activeStageId);
    const newIdx = (currIdx + 1) % stages.length;
    state.activeStageId = stages[newIdx].id;
    renderDealDashboard(state.currentDeal);
  });

  // Agreement items in Right Card
  document.querySelectorAll(".agreement-item-row").forEach(row => {
    row.addEventListener("click", () => {
      const dealId = row.getAttribute("data-deal-id");
      if (dealId && dealId !== state.currentDealId) {
        loadDealDashboard(dealId);
      } else {
        openDealsModal();
      }
    });
  });

  // Hero (+) and Prompt Input
  document.getElementById("btn-hero-attach")?.addEventListener("click", () => {
    openUploadProofModal();
  });

  // Hero Natural Language Input, Templates & Copy Link
  const heroAiInput = document.getElementById("hero-ai-input");
  const heroAiSubmit = document.getElementById("btn-hero-ai-submit");

  heroAiSubmit?.addEventListener("click", () => handleHeroAiInput());
  heroAiInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHeroAiInput();
    }
  });

  // Live filter agreements in top-right panel as user types
  heroAiInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterAgreementsListByQuery(query);
  });

  // Quick Suggestion Template Chips
  document.querySelectorAll(".nl-template-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const templateKey = chip.getAttribute("data-template");
      if (heroAiInput && SAMPLES[templateKey]) {
        heroAiInput.value = SAMPLES[templateKey];
        heroAiInput.focus();
      }
    });
  });

  // Copy Link Button
  document.getElementById("btn-copy-agreement-link")?.addEventListener("click", () => {
    const url = `${window.location.origin}${window.location.pathname}?deal=${state.currentDealId || 'deal-1'}`;
    navigator.clipboard?.writeText(url).then(() => {
      showAiToast("Agreement link copied to clipboard!");
    }).catch(() => {
      showAiToast(`Agreement ID: ${state.currentDealId}`);
    });
  });
}

function filterAgreementsListByQuery(query) {
  const cards = document.querySelectorAll(".workspace-agreement-card");
  if (!cards.length) return;
  cards.forEach(card => {
    if (!query) {
      card.style.display = "";
      return;
    }
    const title = card.querySelector(".agreement-card-name")?.textContent.toLowerCase() || "";
    const party = card.querySelector(".card-party-caption")?.textContent.toLowerCase() || "";
    const matches = title.includes(query) || party.includes(query);
    card.style.display = matches ? "" : "none";
  });
}

async function handleHeroAiInput() {
  const input = document.getElementById("hero-ai-input");
  if (!input) return;
  const rawText = input.value.trim();
  if (!rawText) return;

  const lower = rawText.toLowerCase();

  // If text looks like a deal description or user pressed "Create Deal"
  const isDealDescription = rawText.length > 25 || 
    lower.includes("pay") || lower.includes("pays") || 
    lower.includes("rs") || lower.includes("₹") || 
    lower.includes("milestone") || lower.includes("stage");

  if (isDealDescription) {
    showAiToast("AI engine analyzing agreement text & proposing milestones...");
    const res = await api("/deals/draft", {
      method: "POST",
      body: JSON.stringify({ text: rawText, person: state.actingPerson })
    });

    if (res.ok && res.data.deal) {
      input.value = "";
      state.wizardDeal = res.data.deal;
      openWizardModal();
      setWizardStep(2);
      renderReviewStep();
      showAiToast(`AI proposal ready: ${res.data.deal.stages.length} milestones suggested. Human review & confirmation required.`);
      return;
    } else {
      // Fallback: populate textarea in describe step
      openWizardModal();
      const textarea = document.getElementById("describe-textarea");
      if (textarea) textarea.value = rawText;
      return;
    }
  }

  const deal = state.currentDeal;
  input.value = "";
  if (!deal) return;

  const activeStg = deal.stages.find(s => s.id === state.activeStageId) || deal.stages[0];

  if (lower.includes("approve")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="approve"]`);
    if (btn) btn.click();
    showAiToast(`Requested milestone approval as ${state.actingPerson}.`);
  } else if (lower.includes("done") || lower.includes("proof") || lower.includes("submit")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="done"]`);
    if (btn) btn.click();
    showAiToast(`Submitted deliverable proof as ${state.actingPerson}.`);
  } else if (lower.includes("dispute")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="dispute"]`);
    if (btn) btn.click();
    showAiToast(`Dispute initiated for milestone Stage ${activeStg?.num || 1}.`);
  } else if (lower.includes("refund")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="refund_payers"]`);
    if (btn) btn.click();
    showAiToast(`Arbiter refund ruling requested.`);
  } else if (lower.includes("release") || lower.includes("pay")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="pay_payee"]`);
    if (btn) btn.click();
    showAiToast(`Arbiter payment release requested.`);
  } else {
    showAiToast(`Search / Command recognized for current agreement.`);
  }
}

function showAiToast(message) {
  const slot = document.getElementById("hero-ai-toast-slot");
  if (!slot) return;
  slot.innerHTML = `
    <div class="hero-ai-toast">
      <span><strong>Settl Workspace:</strong> ${escapeHtml(message)}</span>
      <button type="button" class="btn-text-sm" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
  setTimeout(() => {
    slot.innerHTML = "";
  }, 5000);
}

// ==========================================================================
// MODALS LOGIC
// ==========================================================================

function setupModals() {
  document.getElementById("btn-close-deals-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-done-deals-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-modal-new-deal")?.addEventListener("click", () => {
    closeAllModals();
    openWizardModal();
  });

  document.getElementById("btn-close-wizard-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-close-attack-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-done-attack-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-close-proof-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-proof-modal-done")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-close-tech-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-modal-done")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-close-edit-modal")?.addEventListener("click", closeAllModals);
  document.getElementById("btn-cancel-edit")?.addEventListener("click", closeAllModals);

  document.getElementById("btn-open-technical-details")?.addEventListener("click", () => {
    if (!state.currentDeal) return;
    openTechnicalModal(state.currentDeal);
  });
}

function closeAllModals() {
  document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.add("hidden"));
}

function openDealsModal() {
  closeAllModals();
  loadDeals();
  document.getElementById("deals-modal-backdrop")?.classList.remove("hidden");
}

function openWizardModal() {
  closeAllModals();
  resetWizard();
  document.getElementById("wizard-modal-backdrop")?.classList.remove("hidden");
}

function openAttackModal() {
  closeAllModals();
  renderAttackLabCards();
  document.getElementById("attack-modal-backdrop")?.classList.remove("hidden");
}

function openProofDocPreview(docId) {
  const doc = sampleDocs[docId] || sampleDocs["1"];
  const backdrop = document.getElementById("proof-modal-backdrop");
  const titleEl = document.getElementById("proof-modal-title");
  const bodyEl = document.getElementById("proof-modal-body");

  if (!backdrop || !bodyEl) return;
  titleEl.textContent = `Proof Spec: ${doc.filename}`;
  bodyEl.innerHTML = `
    <div class="proof-preview-wrap">
      <div class="flex-between">
        <span class="badge badge-completed">${escapeHtml(doc.badge)}</span>
        <span class="badge badge-success">${escapeHtml(doc.status)}</span>
      </div>
      <h3 class="mt-2">${escapeHtml(doc.title)}</h3>
      <p class="text-muted text-sm mt-1">${escapeHtml(doc.desc)}</p>
      <div class="mt-3 text-sm">
        <div class="flex-between pb-1 border-b"><span>Associated Milestone:</span> <strong>${escapeHtml(doc.milestone)}</strong></div>
        <div class="flex-between pb-1 border-b mt-1"><span>Submitted By:</span> <strong>${escapeHtml(doc.submittedBy)}</strong></div>
        <div class="flex-between pb-1 mt-1"><span>Vault Digest:</span> <code>${escapeHtml(doc.hash)}</code></div>
      </div>
    </div>
  `;
  backdrop.classList.remove("hidden");
}

function openUploadProofModal() {
  const backdrop = document.getElementById("proof-modal-backdrop");
  const titleEl = document.getElementById("proof-modal-title");
  const bodyEl = document.getElementById("proof-modal-body");
  const footerEl = document.getElementById("proof-modal-footer");

  if (!backdrop || !bodyEl || !state.currentDeal) return;

  titleEl.textContent = "Upload Delivery Proof to Vault";
  const stageOptions = state.currentDeal.stages.map(s => `
    <option value="${s.id}">Stage ${s.num}: ${escapeHtml(s.title)} (${formatRupees(s.amount)})</option>
  `).join("");

  bodyEl.innerHTML = `
    <div class="form-group mb-3">
      <label class="input-label" for="upload-stage-select">Target Milestone</label>
      <select id="upload-stage-select" class="custom-input">${stageOptions}</select>
    </div>
    <div class="form-group mb-3">
      <label class="input-label" for="upload-doc-title">Deliverable Title or Evidence Link</label>
      <input type="text" id="upload-doc-title" class="custom-input" placeholder="e.g. GitHub PR #105 or Figma URL" value="Deployment verification spec" />
    </div>
    <div class="sample-pills mb-2">
      <span class="text-sm text-muted">Simulated evidence file:</span>
      <span class="badge badge-completed">delivery_proof_artifact.pdf (Simulated)</span>
    </div>
  `;

  footerEl.innerHTML = `
    <button type="button" class="btn btn-secondary" onclick="document.getElementById('proof-modal-backdrop').classList.add('hidden')">Cancel</button>
    <button type="button" class="btn btn-primary" id="btn-seal-proof">Seal in Vault</button>
  `;

  document.getElementById("btn-seal-proof")?.addEventListener("click", () => {
    backdrop.classList.add("hidden");
    const countEl = document.getElementById("proof-docs-count");
    if (countEl) countEl.textContent = "4";
    showAiToast(`New delivery proof uploaded by ${state.actingPerson} and cryptographically sealed into Escrow Vault.`);
  });

  backdrop.classList.remove("hidden");
}

function openTechnicalModal(deal) {
  document.getElementById("tech-vault-address").textContent = deal.vaultAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  document.getElementById("tech-agreement-hash").textContent = deal.agreementFingerprint || "0x8f4b2ae4c9018f2bb734a6d10c5512b9";

  const listEl = document.getElementById("tech-accounts-list");
  if (listEl) {
    listEl.innerHTML = (deal.participants || state.people).map(p => `
      <div class="tech-account-row flex-between text-sm py-1">
        <span>${escapeHtml(p.name || p.id)}:</span>
        <code>${escapeHtml(p.address || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}</code>
      </div>
    `).join("");
  }
  document.getElementById("technical-modal-backdrop")?.classList.remove("hidden");
}

// ==========================================================================
// WIZARD IMPLEMENTATION (4 STEPS)
// ==========================================================================

function setupWizardHandlers() {
  document.querySelectorAll(".sample-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sampleKey = btn.getAttribute("data-sample");
      loadSampleDeal(sampleKey);
    });
  });

  document.getElementById("btn-check-deal")?.addEventListener("click", async () => {
    const text = document.getElementById("describe-textarea").value.trim();
    if (!text) return;
    clearRefusals();

    const res = await api("/parse", {
      method: "POST",
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      showRefusal("describe-refusal", res.error);
      return;
    }

    state.wizardDeal = res.data.deal;
    setWizardStep(2);
    renderReviewStep();
  });

  document.getElementById("btn-confirm-checklist")?.addEventListener("click", async () => {
    clearRefusals();
    const res = await api(`/deals/${state.wizardDeal.id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ checklist: state.wizardDeal })
    });

    if (!res.ok) {
      showRefusal("confirm-refusal", res.error);
      return;
    }

    state.wizardDeal = res.data.deal;
    setWizardStep(3);
    renderAgreeStep();
  });

  document.getElementById("btn-back-to-review")?.addEventListener("click", () => {
    setWizardStep(2);
    renderReviewStep();
  });

  document.getElementById("btn-lock-deal")?.addEventListener("click", async () => {
    clearRefusals();
    const res = await api(`/deals/${state.wizardDeal.id}/lock`, {
      method: "POST",
      body: JSON.stringify({ person: state.actingPerson })
    });

    if (!res.ok) {
      showRefusal("lock-refusal", res.error);
      return;
    }

    state.wizardDeal = res.data.deal;
    renderLockStep();
  });

  document.getElementById("btn-goto-dashboard")?.addEventListener("click", () => {
    closeAllModals();
    if (state.wizardDeal) {
      loadDealDashboard(state.wizardDeal.id);
    }
  });
}

function resetWizard() {
  state.wizardStep = 1;
  state.wizardDeal = null;
  const textarea = document.getElementById("describe-textarea");
  if (textarea) textarea.value = "";
  setWizardStep(1);
}

function setWizardStep(step) {
  state.wizardStep = step;
  clearRefusals();

  for (let i = 1; i <= 4; i++) {
    const item = document.getElementById(`step-nav-${i}`);
    if (item) item.classList.toggle("active", i <= step);
  }

  const panels = ["wizard-step-describe", "wizard-step-review", "wizard-step-agree", "wizard-step-lock"];
  panels.forEach((p, idx) => {
    const panel = document.getElementById(p);
    if (panel) panel.classList.toggle("active", idx === step - 1);
  });
}

const SAMPLES = {
  flatmates: "Riya and Aman will split rent of Rs 20,000 to landlord Meera: Rs 10,000 from Riya and Rs 10,000 from Aman when lease is signed.",
  freelance: "Riya will pay Aman Rs 30,000 for a website: Rs 10,000 after design, Rs 15,000 after development and Rs 5,000 when the work is good. Meera settles disputes.",
  construction: "Riya pays Aman Rs 50,000 for renovation: Rs 20,000 after foundation, Rs 20,000 after walls, Rs 10,000 on final cleanup. Meera arbitrates.",
  bonus: "Aman gets Rs 15,000 performance bonus: Rs 7,500 after Q1 deliverables, Rs 7,500 after client approval. Meera reviews."
};

function loadSampleDeal(key) {
  const textarea = document.getElementById("describe-textarea");
  if (textarea && SAMPLES[key]) {
    textarea.value = SAMPLES[key];
  }
}

function renderReviewStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  const originalEl = document.getElementById("original-text-display");
  if (originalEl) originalEl.textContent = deal.originalText || "";

  const payersEl = document.getElementById("review-payers-list");
  if (payersEl) {
    payersEl.innerHTML = deal.payers.map(p => `
      <div class="flex-between py-1 border-b text-sm">
        <span>${escapeHtml(p.person)}</span>
        <strong>${formatRupees(p.share)}</strong>
      </div>
    `).join("");
  }

  const judgeEl = document.getElementById("review-judge-display");
  if (judgeEl) judgeEl.innerHTML = `<strong>${escapeHtml(deal.judge)}</strong>`;

  const stagesEl = document.getElementById("review-stages-list");
  if (stagesEl) {
    stagesEl.innerHTML = deal.stages.map(s => `
      <div class="flex-between py-1 border-b text-sm">
        <span>Stage ${s.num}: ${escapeHtml(s.title)} (${escapeHtml(s.payee)})</span>
        <strong>${formatRupees(s.amount)}</strong>
      </div>
    `).join("");
  }

  const stageTotal = deal.stages.reduce((acc, s) => acc + (s.amount || 0), 0);
  const payerTotal = deal.payers.reduce((acc, p) => acc + (p.share || 0), 0);

  const totalEl = document.getElementById("review-total-amount");
  if (totalEl) totalEl.textContent = formatRupees(stageTotal);

  const sharesBadge = document.getElementById("review-shares-badge");
  const sharesMatch = payerTotal === stageTotal && payerTotal > 0;
  if (sharesBadge) {
    sharesBadge.className = sharesMatch ? "badge badge-success" : "badge badge-danger";
    sharesBadge.textContent = sharesMatch ? "yes" : "no";
  }

  const confirmBtn = document.getElementById("btn-confirm-checklist");
  const reasonText = document.getElementById("confirm-disabled-reason");
  const hasUnclear = deal.unclear && deal.unclear.length > 0;

  if (confirmBtn) {
    confirmBtn.disabled = hasUnclear || !sharesMatch;
  }
  if (reasonText) {
    reasonText.textContent = hasUnclear ? "Fix unclear items before continuing." : (!sharesMatch ? "Payer shares must match stage total." : "Terms verified.");
    reasonText.style.color = (hasUnclear || !sharesMatch) ? "#e11d48" : "#059669";
  }
}

function renderAgreeStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  const tbody = document.getElementById("agree-participants-tbody");
  if (!tbody) return;

  const participants = [];
  deal.payers.forEach(p => participants.push({ name: p.person, role: "Payer" }));
  deal.stages.forEach(s => {
    if (!participants.some(pt => pt.name === s.payee)) {
      participants.push({ name: s.payee, role: "Payee" });
    }
  });
  if (!participants.some(pt => pt.name === deal.judge)) {
    participants.push({ name: deal.judge, role: "Judge" });
  }

  tbody.innerHTML = participants.map(p => {
    const isAgreed = deal.agreed?.[p.name];
    const isActing = p.name === state.actingPerson;
    const canClick = isActing || state.tryAnything;

    let action = isAgreed ? `<span class="badge badge-success">Agreed</span>`
      : (canClick ? `<button type="button" class="btn btn-primary btn-sm btn-agree-user" data-person="${p.name}">Sign</button>`
      : `<span class="text-muted text-sm">Waiting</span>`);

    return `
      <tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.role)}</td>
        <td>${isAgreed ? 'Agreed' : 'Pending'}</td>
        <td>${action}</td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-agree-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const res = await api(`/deals/${deal.id}/agree`, {
        method: "POST",
        body: JSON.stringify({ person: state.actingPerson })
      });
      if (!res.ok) {
        showRefusal("agree-refusal", res.error);
        return;
      }
      state.wizardDeal = res.data.deal;
      renderAgreeStep();
      if (res.data.allAgreed) {
        setTimeout(() => {
          setWizardStep(4);
          renderLockStep();
        }, 500);
      }
    });
  });
}

function renderLockStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  const isLocked = deal.phase === "Funding" || deal.phase === "Active";
  const lockBtn = document.getElementById("btn-lock-deal");
  const depositsSec = document.getElementById("lock-deposits-section");
  const depositsList = document.getElementById("lock-deposits-list");
  const allBanner = document.getElementById("all-deposited-banner");

  if (lockBtn) lockBtn.disabled = isLocked;
  if (depositsSec) depositsSec.classList.toggle("hidden", !isLocked);

  if (isLocked && depositsList) {
    depositsList.innerHTML = deal.payers.map(p => {
      const hasDeposited = deal.deposited?.[p.person];
      const isActing = p.person === state.actingPerson;
      const canClick = isActing || state.tryAnything;

      let btn = hasDeposited ? `<span class="badge badge-success">Deposited ${formatRupees(hasDeposited)}</span>`
        : (canClick ? `<button type="button" class="btn btn-primary btn-sm btn-deposit-payer" data-person="${p.person}">Deposit ${formatRupees(p.share)}</button>`
        : `<span class="text-muted text-sm">Waiting</span>`);

      return `
        <div class="flex-between py-1 border-b">
          <span>${escapeHtml(p.person)} (Share: ${formatRupees(p.share)})</span>
          <div>${btn}</div>
        </div>
      `;
    }).join("");

    depositsList.querySelectorAll(".btn-deposit-payer").forEach(btn => {
      btn.addEventListener("click", async () => {
        const res = await api(`/deals/${deal.id}/deposit`, {
          method: "POST",
          body: JSON.stringify({ person: state.actingPerson })
        });
        if (!res.ok) {
          showRefusal("deposit-refusal", res.error);
          return;
        }
        state.wizardDeal = res.data.deal;
        renderLockStep();
      });
    });

    const allDeposited = deal.payers.every(p => deal.deposited?.[p.person]);
    if (allBanner) allBanner.classList.toggle("hidden", !allDeposited);
  }
}

// ==========================================================================
// ATTACK LAB RENDER
// ==========================================================================

async function renderAttackLabCards() {
  const container = document.getElementById("attack-cards-container");
  if (!container) return;
  const res = await api("/attacks");
  if (!res.ok) return;

  container.innerHTML = res.data.attacks.map(att => `
    <div class="attack-card">
      <div class="flex-between mb-2">
        <h4>${escapeHtml(att.title)}</h4>
        <button type="button" class="btn btn-primary btn-sm btn-run-attack" data-attack="${att.name}">Run Attack</button>
      </div>
      <p class="text-muted text-sm">${escapeHtml(att.explanation)}</p>
      <div class="attack-result-box hidden mt-2" id="attack-outcome-${att.name}"></div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-run-attack").forEach(btn => {
    btn.addEventListener("click", async () => {
      const name = btn.getAttribute("data-attack");
      btn.disabled = true;
      btn.textContent = "Testing...";
      const res = await api(`/attacks/${name}`, { method: "POST" });
      btn.disabled = false;
      btn.textContent = "Run Attack";
      if (res.ok) {
        const box = document.getElementById(`attack-outcome-${name}`);
        if (box) {
          box.classList.remove("hidden");
          box.innerHTML = `
            <div class="badge badge-success mb-1">Contract Defended: ${escapeHtml(res.data.result.realVault.result)}</div>
            <div class="text-sm">Reason: "${escapeHtml(res.data.result.realVault.reason)}"</div>
          `;
        }
      }
    });
  });
}
