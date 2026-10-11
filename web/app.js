/**
 * Settl — Frontend Client Application
 * Implements strict design principles, Indian Rupee formatting,
 * inline refusals, "Acting as" switching, and "Try anything" mode.
 */

// Application State
const state = {
  people: [],
  actingPerson: "Riya",
  tryAnything: false,
  currentScreen: "deals",
  currentDealId: "deal-1",
  currentDeal: null,
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

// ==========================================================================
// Initialization & Navigation
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupPersonaAndMode();
  await loadPeople();
  await loadDeals();
  setupWizardHandlers();
  setupDashboardHandlers();
  setupAttackLabHandlers();
  setupModalHandlers();
});

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-link");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.getAttribute("data-screen");
      navigateTo(screen);
    });
  });

  document.querySelectorAll(".rail-icon-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.getAttribute("data-screen");
      if (screen) navigateTo(screen);
    });
  });

  document.getElementById("rail-home-btn")?.addEventListener("click", () => {
    navigateTo("deals");
  });

  document.getElementById("brand-logo-btn")?.addEventListener("click", () => {
    navigateTo("deals");
  });

  document.getElementById("btn-deals-new-deal")?.addEventListener("click", () => {
    navigateTo("new-deal");
    resetWizard();
  });

  document.getElementById("btn-reset-demo")?.addEventListener("click", async () => {
    await api("/api/reset", { method: "POST" });
    await loadDeals();
    if (state.currentDealId) {
      await loadDealDashboard(state.currentDealId);
    }
  });
}

function navigateTo(screenId) {
  state.currentScreen = screenId;
  clearRefusals();

  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-screen") === screenId);
  });

  document.querySelectorAll(".rail-icon-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-screen") === screenId);
  });

  document.querySelectorAll(".screen-view").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add("active");
  }

  if (screenId === "deals") {
    loadDeals();
  } else if (screenId === "attack-lab") {
    renderAttackLabCards();
  }
}

function setupPersonaAndMode() {
  const selectActing = document.getElementById("select-acting-as");
  selectActing.addEventListener("change", (e) => {
    state.actingPerson = e.target.value;
    clearRefusals();
    onPersonaOrModeChanged();
  });

  const toggleTryAnything = document.getElementById("toggle-try-anything");
  toggleTryAnything.addEventListener("change", (e) => {
    state.tryAnything = e.target.checked;
    clearRefusals();
    onPersonaOrModeChanged();
  });
}

function onPersonaOrModeChanged() {
  if (state.currentScreen === "deal-dashboard" && state.currentDeal) {
    renderDealDashboard(state.currentDeal);
  } else if (state.currentScreen === "new-deal") {
    if (state.wizardStep === 3) renderAgreeStep();
    if (state.wizardStep === 4) renderLockStep();
  }
}

async function loadPeople() {
  const res = await api("/people");
  if (res.ok && res.data.people) {
    state.people = res.data.people;
    const select = document.getElementById("select-acting-as");
    select.innerHTML = "";
    state.people.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.roleDesc.split(" ")[0]})`;
      if (p.id === state.actingPerson) opt.selected = true;
      select.appendChild(opt);
    });
  }
}

// ==========================================================================
// SCREEN 1: DEALS
// ==========================================================================

async function loadDeals() {
  const res = await api("/deals");
  if (!res.ok) return;

  state.dealsList = res.data.deals;
  const tbody = document.getElementById("deals-table-body");
  const emptyState = document.getElementById("deals-empty-state");

  if (!state.dealsList.length) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  tbody.innerHTML = state.dealsList.map(deal => {
    const phaseClass = getPhaseBadgeClass(deal.phase);
    return `
      <tr class="deal-row-interactive" data-deal-id="${deal.id}">
        <td class="deal-title-cell">${escapeHtml(deal.title)}</td>
        <td><span class="badge ${phaseClass}">${escapeHtml(deal.phase)}</span></td>
        <td class="amount-rupee">${formatRupees(deal.totalAmount)}</td>
        <td>${escapeHtml(deal.stagesSettled)}</td>
        <td class="text-muted">${escapeHtml(deal.waitingFor)}</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm btn-open-deal" data-deal-id="${deal.id}">
            Open
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach click listeners to rows
  tbody.querySelectorAll(".deal-row-interactive").forEach(row => {
    row.addEventListener("click", (e) => {
      const dealId = row.getAttribute("data-deal-id");
      openDealDashboard(dealId);
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
    case "Completed": return "Done, awaiting approval";
    case "Disputed": return "Disputed";
    case "Released": return "Paid";
    case "Refunded": return "Refunded";
    default: return stgState;
  }
}

// ==========================================================================
// SCREEN 2: NEW DEAL WIZARD
// ==========================================================================

function setupWizardHandlers() {
  // Step indicator clicks (only for already visited steps)
  document.querySelectorAll(".step-item").forEach(item => {
    item.addEventListener("click", () => {
      const targetStep = parseInt(item.getAttribute("data-step"), 10);
      if (state.wizardDeal || targetStep === 1) {
        setWizardStep(targetStep);
      }
    });
  });

  // Sample Buttons
  document.querySelectorAll(".sample-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sampleKey = btn.getAttribute("data-sample");
      loadSample(sampleKey);
    });
  });

  // Step 1: Check Deal Button
  document.getElementById("btn-check-deal")?.addEventListener("click", async () => {
    clearRefusals();
    const text = document.getElementById("describe-textarea").value.trim();
    if (!text) {
      showRefusal("describe-refusal", "Please enter deal text or click one of the samples above.");
      return;
    }

    const res = await api("/deals/draft", {
      method: "POST",
      body: JSON.stringify({ text, person: state.actingPerson })
    });

    if (!res.ok) {
      showRefusal("describe-refusal", res.error);
      return;
    }

    state.wizardDeal = res.data.deal;
    setWizardStep(2);
    renderReviewStep();
  });

  // Step 2: Confirm Checklist Button
  document.getElementById("btn-confirm-checklist")?.addEventListener("click", async () => {
    clearRefusals();
    if (!state.wizardDeal) return;

    const res = await api(`/deals/${state.wizardDeal.id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ person: state.actingPerson })
    });

    if (!res.ok) {
      showRefusal("confirm-refusal", res.error);
      return;
    }

    state.wizardDeal = res.data.deal;
    setWizardStep(3);
    renderAgreeStep();
  });

  // Step 3: Back to review button
  document.getElementById("btn-back-to-review")?.addEventListener("click", () => {
    setWizardStep(2);
    renderReviewStep();
  });

  // Step 4: Lock Deal Button
  document.getElementById("btn-lock-deal")?.addEventListener("click", async () => {
    clearRefusals();
    if (!state.wizardDeal) return;

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

  // Step 4: Go to Dashboard button
  document.getElementById("btn-goto-dashboard")?.addEventListener("click", () => {
    if (state.wizardDeal) {
      openDealDashboard(state.wizardDeal.id);
    }
  });

  // Collapsible toggle for mobile
  document.getElementById("btn-toggle-original-text")?.addEventListener("click", () => {
    const col = document.getElementById("review-text-card");
    col.classList.toggle("collapsed");
    const btn = document.getElementById("btn-toggle-original-text");
    btn.textContent = col.classList.contains("collapsed") ? "Expand text" : "Collapse";
  });
}

function resetWizard() {
  state.wizardStep = 1;
  state.wizardDeal = null;
  document.getElementById("describe-textarea").value = "";
  setWizardStep(1);
}

function setWizardStep(step) {
  state.wizardStep = step;
  clearRefusals();

  document.querySelectorAll(".step-item").forEach(item => {
    const s = parseInt(item.getAttribute("data-step"), 10);
    item.classList.remove("active", "completed");
    if (s === step) item.classList.add("active");
    else if (s < step) item.classList.add("completed");
  });

  document.querySelectorAll(".wizard-panel").forEach(p => p.classList.remove("active"));
  const panels = ["wizard-step-describe", "wizard-step-review", "wizard-step-agree", "wizard-step-lock"];
  const targetPanel = document.getElementById(panels[step - 1]);
  if (targetPanel) targetPanel.classList.add("active");
}

function loadSample(key) {
  const sampleTexts = {
    freelance: "Riya will pay Aman Rs 30,000 for a website: Rs 10,000 after design, Rs 15,000 after development and Rs 5,000 when the work is good. Meera settles disputes.",
    flatmates: "Kabir and Riya will pay Aman Rs 50,000 for flat maintenance and handover: Rs 20,000 after paint and deep clean, Rs 20,000 after key handover, and Rs 10,000 if everything stays clean. Meera settles disputes.",
    construction: "Riya will pay Priya Rs 2,00,000 for interior architectural renovation: Rs 80,000 after electrical and false ceiling, Rs 80,000 after modular workstation setup, and Rs 40,000 when the place looks aesthetic. Vikram settles disputes.",
    bonus: "Riya and Kabir will pay Aman Rs 60,000 and Priya Rs 40,000 for mobile app rollout: Aman gets Rs 30,000 after backend API deployment and Rs 30,000 after performance tuning. Priya gets Rs 20,000 after UI components and Rs 20,000 when users are happy. Meera settles disputes."
  };

  const textarea = document.getElementById("describe-textarea");
  if (textarea && sampleTexts[key]) {
    textarea.value = sampleTexts[key];
    clearRefusals();
  }
}

// Render Review Step (Screen 2: Step 2)
function renderReviewStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  // 1. Original Text with interactive highlights
  const originalTextContainer = document.getElementById("original-text-display");
  let highlightedText = escapeHtml(deal.text);

  // Highlight unclear phrases in amber
  if (deal.unclear && deal.unclear.length > 0) {
    deal.unclear.forEach(u => {
      const regex = new RegExp(`(${escapeRegex(u.phrase)})`, "gi");
      highlightedText = highlightedText.replace(regex, `<span class="hl-unclear" data-unclear-id="${u.id}">$1</span>`);
    });
  }

  // Link stages phrases with span classes
  deal.stages.forEach(s => {
    if (s.textPhrase) {
      const regex = new RegExp(`(${escapeRegex(s.textPhrase)})`, "gi");
      highlightedText = highlightedText.replace(regex, `<span class="hl-phrase" data-stage-id="${s.id}">$1</span>`);
    }
  });

  originalTextContainer.innerHTML = highlightedText;

  // 2. Read by Badge
  document.getElementById("review-read-by-value").textContent = deal.readBy || "model";
  document.getElementById("review-read-by-reason").textContent = deal.readByNote || "";

  // 3. Payers List
  const payersContainer = document.getElementById("review-payers-list");
  payersContainer.innerHTML = deal.payers.map((p, idx) => `
    <div class="checklist-item-row">
      <span><strong>${escapeHtml(p.person)}</strong> — ${formatRupees(p.share)}</span>
      <button type="button" class="btn-text-sm btn-edit-payer" data-idx="${idx}">[edit]</button>
    </div>
  `).join("");

  payersContainer.querySelectorAll(".btn-edit-payer").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      openEditPayerModal(idx);
    });
  });

  document.getElementById("btn-add-payer").onclick = () => openAddPayerModal();

  // 4. Judge
  const judgeContainer = document.getElementById("review-judge-display");
  judgeContainer.innerHTML = `
    <div class="checklist-item-row">
      <span><strong>${escapeHtml(deal.judge)}</strong> <span class="text-muted">(Neutral Arbitrator)</span></span>
      <button type="button" class="btn-text-sm" id="btn-edit-judge-action">[edit]</button>
    </div>
  `;
  document.getElementById("btn-edit-judge-action").onclick = () => openEditJudgeModal();
  document.getElementById("btn-edit-judge").onclick = () => openEditJudgeModal();

  // 5. Stages List
  const stagesContainer = document.getElementById("review-stages-list");
  stagesContainer.innerHTML = deal.stages.map((s, idx) => `
    <div class="checklist-item-row checklist-stage-row" data-stage-id="${s.id}">
      <div>
        <strong>${s.num || idx + 1}. ${escapeHtml(s.title)}</strong>
        <span class="text-muted">→ ${escapeHtml(s.payee)}</span>:
        <strong>${formatRupees(s.amount)}</strong>
      </div>
      <button type="button" class="btn-text-sm btn-edit-stage" data-idx="${idx}">[edit]</button>
    </div>
  `).join("");

  // Hover highlighting on stages
  stagesContainer.querySelectorAll(".checklist-stage-row").forEach(row => {
    const stageId = row.getAttribute("data-stage-id");
    row.addEventListener("mouseenter", () => {
      const matchingSpan = originalTextContainer.querySelector(`.hl-phrase[data-stage-id="${stageId}"]`);
      if (matchingSpan) matchingSpan.classList.add("highlight-active");
    });
    row.addEventListener("mouseleave", () => {
      const matchingSpan = originalTextContainer.querySelector(`.hl-phrase[data-stage-id="${stageId}"]`);
      if (matchingSpan) matchingSpan.classList.remove("highlight-active");
    });
  });

  stagesContainer.querySelectorAll(".btn-edit-stage").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      openEditStageModal(idx);
    });
  });

  document.getElementById("btn-add-stage").onclick = () => openAddStageModal();

  // 6. Unclear items
  const unclearSection = document.getElementById("review-unclear-section");
  const unclearList = document.getElementById("review-unclear-list");
  const unclearCount = document.getElementById("unclear-count");
  unclearCount.textContent = deal.unclear.length;

  if (deal.unclear.length > 0) {
    unclearSection.classList.remove("hidden");
    unclearList.innerHTML = deal.unclear.map((u, idx) => `
      <div class="unclear-card">
        <div class="unclear-phrase-text">! "${escapeHtml(u.phrase)}"</div>
        <div class="unclear-question-row">
          <span>${escapeHtml(u.question)}</span>
          <button type="button" class="btn-text-sm text-amber btn-fix-unclear" data-idx="${idx}">[fix]</button>
        </div>
      </div>
    `).join("");

    unclearList.querySelectorAll(".btn-fix-unclear").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        openFixUnclearModal(idx);
      });
    });
  } else {
    unclearSection.classList.add("hidden");
  }

  // 7. Problems List
  const problemsSection = document.getElementById("review-problems-section");
  const problemsList = document.getElementById("review-problems-list");
  if (deal.problems && deal.problems.length > 0) {
    problemsSection.classList.remove("hidden");
    problemsList.innerHTML = deal.problems.map(p => `<div>• ${escapeHtml(p)}</div>`).join("");
  } else {
    problemsSection.classList.add("hidden");
  }

  // 8. Totals and Reconciliation
  const payerTotal = deal.payers.reduce((acc, p) => acc + (p.share || 0), 0);
  const stageTotal = deal.stages.reduce((acc, s) => acc + (s.amount || 0), 0);
  document.getElementById("review-total-amount").textContent = formatRupees(stageTotal);

  const sharesBadge = document.getElementById("review-shares-badge");
  const sharesMatch = payerTotal === stageTotal && payerTotal > 0;
  sharesBadge.className = sharesMatch ? "badge badge-success" : "badge badge-danger";
  sharesBadge.textContent = sharesMatch ? "yes" : "no";

  // 9. Confirm Button Validation
  const confirmBtn = document.getElementById("btn-confirm-checklist");
  const reasonText = document.getElementById("confirm-disabled-reason");
  const hasUnclear = deal.unclear.length > 0;
  const hasProblems = deal.problems && deal.problems.length > 0;

  if (!hasUnclear && !hasProblems && sharesMatch) {
    confirmBtn.disabled = false;
    reasonText.textContent = "All terms validated. Ready to begin signature round.";
    reasonText.style.color = "#34d399";
  } else {
    confirmBtn.disabled = true;
    let reasons = [];
    if (hasUnclear) reasons.push(`${deal.unclear.length} unclear phrase(s) must be fixed`);
    if (!sharesMatch) reasons.push("payer shares must equal stage amounts");
    if (hasProblems) reasons.push(deal.problems[0]);
    reasonText.textContent = `Disabled: ${reasons.join("; ")}.`;
    reasonText.style.color = "#fb7185";
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Render Agree Step (Screen 2: Step 3)
function renderAgreeStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  const tbody = document.getElementById("agree-participants-tbody");
  const participants = [];

  deal.payers.forEach(p => {
    participants.push({ name: p.person, role: "Payer", share: p.share });
  });
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

    let actionHtml = "";
    if (isAgreed) {
      actionHtml = `<span class="badge badge-success">Agreed</span>`;
    } else if (canClick) {
      actionHtml = `<button type="button" class="btn btn-primary btn-sm btn-participant-agree" data-person="${p.name}">I agree</button>`;
    } else {
      actionHtml = `<span class="text-muted text-sm">Waiting for ${escapeHtml(p.name)}</span>`;
    }

    return `
      <tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.role)}</td>
        <td>${isAgreed ? '<span class="badge badge-success">Agreed</span>' : '<span class="badge badge-pending">Waiting</span>'}</td>
        <td>${actionHtml}</td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-participant-agree").forEach(btn => {
    btn.addEventListener("click", async () => {
      clearRefusals();
      const personToAgree = btn.getAttribute("data-person");
      // Use currently selected acting person to test permission enforcement!
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
        document.getElementById("agree-ready-indicator").classList.remove("hidden");
        setTimeout(() => {
          setWizardStep(4);
          renderLockStep();
        }, 600);
      }
    });
  });

  const allAgreed = participants.every(p => deal.agreed?.[p.name]);
  if (allAgreed) {
    document.getElementById("agree-ready-indicator").classList.remove("hidden");
  }
}

// Render Lock Step (Screen 2: Step 4)
function renderLockStep() {
  const deal = state.wizardDeal;
  if (!deal) return;

  const isLocked = deal.phase === "Funding" || deal.phase === "Active";
  const lockCardTitle = document.getElementById("lock-card-title");
  const lockCardDesc = document.getElementById("lock-card-desc");
  const lockBtn = document.getElementById("btn-lock-deal");
  const depositsSection = document.getElementById("lock-deposits-section");
  const depositsList = document.getElementById("lock-deposits-list");
  const allDepositedBanner = document.getElementById("all-deposited-banner");

  if (!isLocked) {
    lockCardTitle.textContent = "Agreement Ready to Lock";
    lockCardDesc.textContent = "All participants have agreed. Locking deploys the escrow vault.";
    lockBtn.disabled = false;
    depositsSection.classList.add("hidden");
    allDepositedBanner.classList.add("hidden");
  } else {
    lockCardTitle.textContent = "Deal Locked in Vault Escrow";
    lockCardDesc.textContent = `Vault: ${deal.vaultAddress} | Fingerprint: ${deal.agreementFingerprint.slice(0, 14)}...`;
    lockBtn.disabled = true;
    depositsSection.classList.remove("hidden");

    // Render Payer Deposit rows
    depositsList.innerHTML = deal.payers.map(p => {
      const hasDeposited = deal.deposited?.[p.person];
      const isActing = p.person === state.actingPerson;
      const canClick = isActing || state.tryAnything;

      let btnHtml = "";
      if (hasDeposited) {
        btnHtml = `<span class="badge badge-success">Deposited ${formatRupees(hasDeposited)}</span>`;
      } else if (canClick) {
        btnHtml = `<button type="button" class="btn btn-primary btn-sm btn-payer-deposit" data-person="${p.person}">Deposit ${formatRupees(p.share)} (simulated UPI)</button>`;
      } else {
        btnHtml = `<span class="text-muted text-sm">Waiting for ${escapeHtml(p.person)}</span>`;
      }

      return `
        <div class="deposit-item-card">
          <div>
            <strong>${escapeHtml(p.person)}</strong>
            <span class="text-muted text-sm"> (Share: ${formatRupees(p.share)})</span>
          </div>
          <div>${btnHtml}</div>
        </div>
      `;
    }).join("");

    depositsList.querySelectorAll(".btn-payer-deposit").forEach(btn => {
      btn.addEventListener("click", async () => {
        clearRefusals();
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

        if (res.data.allDeposited) {
          allDepositedBanner.classList.remove("hidden");
        }
      });
    });

    const allDeposited = deal.payers.every(p => deal.deposited?.[p.person]);
    if (allDeposited) {
      allDepositedBanner.classList.remove("hidden");
    }
  }
}

// ==========================================================================
// SCREEN 3: DEAL DASHBOARD
// ==========================================================================

async function openDealDashboard(dealId) {
  state.currentDealId = dealId;
  navigateTo("deal-dashboard");
  await loadDealDashboard(dealId);
}

async function loadDealDashboard(dealId) {
  const res = await api(`/deals/${dealId}?person=${encodeURIComponent(state.actingPerson)}`);
  if (!res.ok) return;

  state.currentDeal = res.data.deal;
  renderDealDashboard(state.currentDeal, res.data);
}

function renderDealDashboard(deal, metaData = null) {
  if (!deal) return;

  // 1. Header
  document.getElementById("dash-deal-title").textContent = deal.title;
  const phaseBadge = document.getElementById("dash-phase-badge");
  phaseBadge.className = `badge ${getPhaseBadgeClass(deal.phase)}`;
  phaseBadge.textContent = deal.phase;

  // Header Participants
  const payerNames = deal.payers.map(p => p.person).join(", ");
  const payeeNames = [...new Set(deal.stages.map(s => s.payee))].join(", ");
  document.getElementById("dash-participants-meta").innerHTML = `
    <span><strong>Payer:</strong> ${escapeHtml(payerNames)}</span>
    <span><strong>Payee:</strong> ${escapeHtml(payeeNames)}</span>
    <span><strong>Judge:</strong> ${escapeHtml(deal.judge)}</span>
  `;

  const readByType = document.getElementById("dash-read-by-type");
  if (readByType) readByType.textContent = deal.readBy || "model";

  // Summary Button visibility
  const btnViewSummary = document.getElementById("btn-view-summary");
  if (btnViewSummary) {
    if (deal.phase === "Closed" || deal.phase === "Cancelled") {
      btnViewSummary.classList.remove("hidden");
      btnViewSummary.onclick = () => openSummaryScreen(deal.id);
    } else {
      btnViewSummary.classList.add("hidden");
    }
  }

  // 2. Next Step Banner (Principle 3: One clear next step)
  const nextStepText = document.getElementById("dash-next-step-text");
  if (nextStepText) {
    const computedWaiting = metaData?.waitingFor || computeClientWaitingFor(deal);
    nextStepText.textContent = computedWaiting;
  }

  // 3. Money Bar
  const recon = metaData?.reconciliation || calculateClientRecon(deal);
  const moneyTotal = document.getElementById("dash-money-total");
  if (moneyTotal) moneyTotal.textContent = formatRupees(recon.totalDeposited);

  const reconBadge = document.getElementById("dash-reconcile-badge");
  const bugWarning = document.getElementById("reconcile-bug-warning");
  if (reconBadge) {
    if (recon.reconciles) {
      reconBadge.className = "badge badge-success";
      reconBadge.textContent = "yes";
      if (bugWarning) bugWarning.classList.add("hidden");
    } else {
      reconBadge.className = "badge badge-danger";
      reconBadge.textContent = "no";
      if (bugWarning) bugWarning.classList.remove("hidden");
    }
  }

  // Segment widths
  const total = Math.max(recon.totalDeposited, 1);
  const lockedPct = Math.min(100, Math.round((recon.locked / total) * 100));
  const waitingPct = Math.min(100 - lockedPct, Math.round((recon.waiting / total) * 100));
  const paidPct = Math.max(0, 100 - lockedPct - waitingPct);

  const barLocked = document.getElementById("bar-seg-locked");
  const barWaiting = document.getElementById("bar-seg-waiting");
  const barPaid = document.getElementById("bar-seg-paidout");

  if (barLocked) barLocked.style.width = `${lockedPct}%`;
  if (barWaiting) barWaiting.style.width = `${waitingPct}%`;
  if (barPaid) barPaid.style.width = `${paidPct}%`;

  const mLocked = document.getElementById("metric-val-locked");
  if (mLocked) mLocked.textContent = formatRupees(recon.locked);
  const mWaiting = document.getElementById("metric-val-waiting");
  if (mWaiting) mWaiting.textContent = formatRupees(recon.waiting);
  const mPaid = document.getElementById("metric-val-paidout");
  if (mPaid) mPaid.textContent = formatRupees(recon.paidOut);

  const yourMoney = document.getElementById("your-money-amount");
  if (yourMoney) {
    yourMoney.textContent = formatRupees(deal.withdrawable?.[state.actingPerson] || 0);
  }

  // 4. Stages List
  const stagesSettledPill = document.getElementById("dash-stages-settled-pill");
  if (stagesSettledPill) {
    const settledCount = deal.stages.filter(s => s.state === "Released" || s.state === "Refunded").length;
    stagesSettledPill.textContent = `${settledCount} of ${deal.stages.length} settled`;
  }

  const stagesContainer = document.getElementById("dash-stages-container");
  stagesContainer.innerHTML = deal.stages.map(stage => {
    return renderStageCard(stage, deal);
  }).join("");

  attachStageButtonHandlers(deal);

  // 5. Left Nav Rail Profile Avatar & Technical Hash
  const avatarEl = document.getElementById("rail-avatar-badge");
  if (avatarEl) avatarEl.textContent = (state.actingPerson || "R")[0].toUpperCase();

  const hashEl = document.getElementById("proof-vault-hash");
  if (hashEl) hashEl.textContent = `Hash: ${(deal.agreementFingerprint || "0x8f4b").slice(0, 10)}...`;

  // 6. Card B: Action Centre Stack
  const actionStackList = document.getElementById("action-centre-stack-list");
  const actionCountBadge = document.getElementById("action-centre-count");
  if (actionStackList) {
    const stackItems = [];
    if (deal.phase === "Funding") {
      deal.payers.filter(p => !deal.deposited?.[p.person]).forEach(p => {
        stackItems.push({
          type: "urgent",
          title: `Deposit Simulated UPI (${p.person})`,
          desc: `Payer share ${formatRupees(p.share)} pending deposit to activate agreement.`
        });
      });
    }
    deal.stages.forEach(s => {
      if (s.state === "Completed") {
        stackItems.push({
          type: "urgent",
          title: `Review Stage ${s.num}: ${s.title}`,
          desc: `Payee ${s.payee} completed milestone. Payer approval requested.`
        });
      } else if (s.state === "Disputed") {
        stackItems.push({
          type: "urgent",
          title: `Dispute on Stage ${s.num}: ${s.title}`,
          desc: `Arbiter ${deal.judge} reviewing submitted delivery evidence.`
        });
      } else if (s.state === "Pending") {
        stackItems.push({
          type: "waiting",
          title: `Stage ${s.num}: ${s.title}`,
          desc: `Assigned to ${s.payee} — awaiting milestone completion.`
        });
      }
    });

    if (actionCountBadge) {
      actionCountBadge.textContent = `${stackItems.length} pending`;
    }
    actionStackList.innerHTML = stackItems.map(item => `
      <div class="action-stack-card">
        <span class="stack-status-dot dot-${item.type}"></span>
        <div class="stack-card-content">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.desc)}</p>
        </div>
      </div>
    `).join("");
  }

  // 7. Card C: 3x3 Action Command Hub
  const matrixContainer = document.getElementById("action-matrix-container");
  if (matrixContainer) {
    const activeStage = deal.stages.find(s => s.state === "Completed" || s.state === "Disputed" || s.state === "Pending") || deal.stages[0];
    const stgId = activeStage ? activeStage.id : "stg-1";

    matrixContainer.innerHTML = `
      <button type="button" class="matrix-action-btn btn-stage-action" data-action="done" data-stage="${stgId}" title="Payee submits deliverable proof">Submit Proof</button>
      <button type="button" class="matrix-action-btn btn-stage-action" data-action="done" data-stage="${stgId}" title="Mark current milestone completed">Mark Done</button>
      <button type="button" class="matrix-action-btn" id="btn-matrix-withdraw" title="Withdraw credited balance">Withdraw ₹</button>

      <button type="button" class="matrix-action-btn btn-primary-action btn-stage-action" data-action="approve" data-stage="${stgId}" title="Client approves milestone release">Approve</button>
      <button type="button" class="matrix-action-btn btn-danger-action btn-stage-action" data-action="dispute" data-stage="${stgId}" title="Client disputes deliverable">Dispute</button>
      <button type="button" class="matrix-action-btn" id="btn-matrix-deposit" title="Payer deposits simulated UPI share">Deposit UPI</button>

      <button type="button" class="matrix-action-btn btn-stage-action" data-action="pay_payee" data-stage="${stgId}" title="Arbiter awards funds to payee">Pay Payee</button>
      <button type="button" class="matrix-action-btn btn-stage-action" data-action="refund_payers" data-stage="${stgId}" title="Arbiter refunds escrow to client">Refund Client</button>
      <button type="button" class="matrix-action-btn" id="btn-matrix-ruling" title="Arbiter records decision">Record Ruling</button>
    `;

    document.getElementById("btn-matrix-withdraw")?.addEventListener("click", () => {
      document.getElementById("btn-withdraw-funds")?.click();
    });

    document.getElementById("btn-matrix-deposit")?.addEventListener("click", async () => {
      clearRefusals();
      const res = await api(`/deals/${deal.id}/deposit`, {
        method: "POST",
        body: JSON.stringify({ person: state.actingPerson })
      });
      if (!res.ok) {
        showRefusal("matrix-refusal-slot", res.error);
      } else {
        await loadDealDashboard(deal.id);
      }
    });

    document.getElementById("btn-matrix-ruling")?.addEventListener("click", () => {
      alert(`Arbiter ${deal.judge} records formal rulings directly via 'Pay Payee' or 'Refund Client'.`);
    });
  }

  // 8. People Card (if present)
  const peopleContainer = document.getElementById("dash-people-list");
  if (peopleContainer) {
    const participantsSet = new Set();
    const peopleItems = [];
    deal.payers.forEach(p => {
      participantsSet.add(p.person);
      const deposited = deal.deposited?.[p.person];
      peopleItems.push({
        name: p.person,
        role: "Payer",
        extra: `Share: ${formatRupees(p.share)} • ${deposited ? 'deposited' : 'pending deposit'}`
      });
    });
    deal.stages.forEach(s => {
      if (!participantsSet.has(s.payee)) {
        participantsSet.add(s.payee);
        peopleItems.push({ name: s.payee, role: "Payee", extra: `Stage assignee` });
      }
    });
    if (!participantsSet.has(deal.judge)) {
      peopleItems.push({ name: deal.judge, role: "Judge", extra: "Dispute arbitrator" });
    }
    peopleContainer.innerHTML = peopleItems.map(p => `
      <div class="person-card-item">
        <div class="person-name-role">
          <span class="person-name">${escapeHtml(p.name)}</span>
          <span class="person-role">${escapeHtml(p.role)}</span>
        </div>
        <span class="person-deposit-status text-muted">${escapeHtml(p.extra)}</span>
      </div>
    `).join("");
  }

  // 9. History (Newest first)
  const historyContainer = document.getElementById("dash-history-timeline");
  if (deal.history && deal.history.length > 0) {
    historyContainer.innerHTML = deal.history.map(entry => {
      const isRefused = entry.outcome === "refused";
      return `
        <div class="history-entry-row ${isRefused ? 'refused-entry' : ''}">
          <span class="history-time">${escapeHtml(entry.time)}</span>
          <span class="history-person">${escapeHtml(entry.person)}</span>
          <span class="history-action">${escapeHtml(entry.action)}</span>
          <span class="${isRefused ? 'history-status-refused' : 'history-status-accepted'}">
            ${isRefused ? `refused: ${escapeHtml(entry.reason)}` : 'accepted'}
          </span>
        </div>
      `;
    }).join("");
  } else {
    historyContainer.innerHTML = `<div class="text-muted text-sm p-2">No history entries recorded yet.</div>`;
  }
}

// Render individual Stage Card (Card A Timeline)
function renderStageCard(stage, deal) {
  const isPayer = deal.payers.some(p => p.person === state.actingPerson);
  const isPayee = stage.payee === state.actingPerson;
  const isJudge = deal.judge === state.actingPerson;
  const tryAll = state.tryAnything;

  // Multi-payer approval count display
  let approvalInfo = "";
  if (deal.payers.length > 1 && stage.state === "Completed") {
    const approved = stage.approvals?.length || 0;
    approvalInfo = `<span class="approval-count-text">${approved} of ${deal.payers.length} approved</span>`;
  }

  let buttonsHtml = "";
  if (tryAll) {
    buttonsHtml = `
      <button type="button" class="btn btn-secondary btn-sm btn-stage-action" data-action="done" data-stage="${stage.id}">Mark done</button>
      <button type="button" class="btn btn-primary btn-sm btn-stage-action" data-action="approve" data-stage="${stage.id}">Approve</button>
      <button type="button" class="btn btn-danger btn-sm btn-stage-action" data-action="dispute" data-stage="${stage.id}">Dispute</button>
      <button type="button" class="btn btn-primary btn-sm btn-stage-action" data-action="pay_payee" data-stage="${stage.id}">Pay the payee</button>
      <button type="button" class="btn btn-secondary btn-sm btn-stage-action" data-action="refund_payers" data-stage="${stage.id}">Refund the payers</button>
    `;
  } else {
    if (stage.state === "Pending") {
      if (isPayee) {
        buttonsHtml = `<button type="button" class="btn btn-primary btn-sm btn-stage-action" data-action="done" data-stage="${stage.id}">Mark done</button>`;
      }
    } else if (stage.state === "Completed") {
      if (isPayer) {
        buttonsHtml = `
          <button type="button" class="btn btn-primary btn-sm btn-stage-action" data-action="approve" data-stage="${stage.id}">Approve</button>
          <button type="button" class="btn btn-danger btn-sm btn-stage-action" data-action="dispute" data-stage="${stage.id}">Dispute</button>
        `;
      }
    } else if (stage.state === "Disputed") {
      if (isJudge) {
        buttonsHtml = `
          <button type="button" class="btn btn-primary btn-sm btn-stage-action" data-action="pay_payee" data-stage="${stage.id}">Pay the payee</button>
          <button type="button" class="btn btn-secondary btn-sm btn-stage-action" data-action="refund_payers" data-stage="${stage.id}">Refund the payers</button>
        `;
      }
    }
  }

  let waitingInfo = "";
  if (!buttonsHtml || !buttonsHtml.trim()) {
    if (stage.state === "Pending") {
      waitingInfo = `Waiting for ${escapeHtml(stage.payee)} to mark it done`;
    } else if (stage.state === "Completed") {
      waitingInfo = `Waiting for payers to approve`;
    } else if (stage.state === "Disputed") {
      waitingInfo = `Waiting for judge ${escapeHtml(deal.judge)} to settle`;
    }
  }

  return `
    <div class="hero-stage-item" id="stage-card-${stage.id}">
      <div class="hero-stage-top">
        <div class="hero-stage-left">
          <span class="hero-stage-number">${stage.num}</span>
          <div>
            <h4 class="hero-stage-title">${escapeHtml(stage.title)}</h4>
            <span class="text-sm text-muted">Payee: <strong>${escapeHtml(stage.payee)}</strong></span>
          </div>
        </div>
        <div class="flex-end gap-2">
          <span class="hero-stage-amount">${formatRupees(stage.amount)}</span>
          <span class="badge ${getStateBadgeClass(stage.state)}">${getStateLabel(stage.state)}</span>
        </div>
      </div>

      <div class="hero-stage-condition">
        "${escapeHtml(stage.condition)}"
      </div>

      <div class="stage-footer-row flex-between mt-2 pt-2">
        <div class="stage-waiting-info text-sm text-muted">
          ${escapeHtml(waitingInfo)}
        </div>
        <div class="stage-actions-group">
          ${approvalInfo}
          ${buttonsHtml}
        </div>
      </div>

      <div class="refusal-slot mt-2" id="refusal-stage-${stage.id}"></div>
    </div>
  `;
}

// Stage Action Listeners
function attachStageButtonHandlers(deal) {
  document.querySelectorAll(".btn-stage-action").forEach(btn => {
    btn.addEventListener("click", async () => {
      const stageId = btn.getAttribute("data-stage");
      const action = btn.getAttribute("data-action");
      clearRefusals();

      const refusalSlotId = `refusal-stage-${stageId}`;
      let endpoint = "";
      let payload = { person: state.actingPerson };

      if (action === "done") {
        endpoint = `/deals/${deal.id}/stages/${stageId}/done`;
      } else if (action === "approve") {
        endpoint = `/deals/${deal.id}/stages/${stageId}/approve`;
      } else if (action === "dispute") {
        endpoint = `/deals/${deal.id}/stages/${stageId}/dispute`;
        payload.disputeReason = "Deliverable failed requirements verification";
      } else if (action === "pay_payee" || action === "refund_payers") {
        endpoint = `/deals/${deal.id}/stages/${stageId}/resolve`;
        payload.resolution = action;
      }

      const res = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        showRefusal(refusalSlotId, res.error);
        // Refresh dashboard anyway to show history log of the attempt!
        await loadDealDashboard(deal.id);
        // Reshow refusal in place!
        showRefusal(refusalSlotId, res.error);
        return;
      }

      await loadDealDashboard(deal.id);
    });
  });
}

// Sample Proof Vault Documents
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
    milestone: "Stage 2 (Development)",
    submittedBy: "Aman",
    hash: "0x3a48e219cb810fe912a7",
    status: "CI Build Passed (18 commits)",
    desc: "Complete implementation of client dashboard with liquid glass aesthetics, interactive tests passing 100%."
  },
  "3": {
    badge: "Simulated Receipt",
    title: "Simulated UPI Payment Reference",
    filename: "simulated_upi.pdf",
    milestone: "Vault Escrow Ingress",
    submittedBy: "Riya",
    hash: "0x98471203a1f9e830bd55",
    status: "Deposited in Vault",
    desc: "Pretend UPI payment reference UPI/AXIS/98471203/SETTL verifying funds ingress into the Hardhat EVM vault."
  }
};

// Dashboard Buttons Handlers
function setupDashboardHandlers() {
  document.getElementById("btn-withdraw-funds")?.addEventListener("click", async () => {
    clearRefusals();
    if (!state.currentDeal) return;

    const res = await api(`/deals/${state.currentDeal.id}/withdraw`, {
      method: "POST",
      body: JSON.stringify({ person: state.actingPerson })
    });

    if (!res.ok) {
      showRefusal("withdraw-refusal", res.error);
      return;
    }

    await loadDealDashboard(state.currentDeal.id);
  });

  // Proof Vault Fanned Doc Cards Preview
  document.querySelectorAll(".fanned-doc-card").forEach(card => {
    card.addEventListener("click", () => {
      const docId = card.getAttribute("data-doc");
      openProofDocPreview(docId);
    });
  });

  document.getElementById("btn-upload-proof")?.addEventListener("click", () => {
    openUploadProofModal();
  });

  document.getElementById("btn-close-proof-modal")?.addEventListener("click", () => {
    document.getElementById("proof-modal-backdrop")?.classList.add("hidden");
  });

  document.getElementById("btn-proof-modal-done")?.addEventListener("click", () => {
    document.getElementById("proof-modal-backdrop")?.classList.add("hidden");
  });

  // Hero Card A AI Assistant input bar
  document.getElementById("btn-hero-attach")?.addEventListener("click", () => {
    openUploadProofModal();
  });

  const heroAiInput = document.getElementById("hero-ai-input");
  const heroAiSubmit = document.getElementById("btn-hero-ai-submit");

  heroAiSubmit?.addEventListener("click", () => handleHeroAiInput());
  heroAiInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHeroAiInput();
    }
  });
}

function openProofDocPreview(docId) {
  const doc = sampleDocs[docId] || sampleDocs["1"];
  const backdrop = document.getElementById("proof-modal-backdrop");
  const titleEl = document.getElementById("proof-modal-title");
  const bodyEl = document.getElementById("proof-modal-body");
  const footerEl = document.getElementById("proof-modal-footer");

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
      <div class="proof-preview-meta">
        <div class="proof-meta-row">
          <span>Associated Milestone:</span>
          <strong>${escapeHtml(doc.milestone)}</strong>
        </div>
        <div class="proof-meta-row">
          <span>Submitted By:</span>
          <strong>${escapeHtml(doc.submittedBy)}</strong>
        </div>
        <div class="proof-meta-row">
          <span>Vault Hash:</span>
          <code>${escapeHtml(doc.hash)}</code>
        </div>
        <div class="proof-meta-row">
          <span>Storage:</span>
          <span>Simulated IPFS / Hardhat Proof Log</span>
        </div>
      </div>
    </div>
  `;

  footerEl.innerHTML = `
    <button type="button" class="btn btn-secondary" id="btn-proof-modal-done">Close</button>
  `;
  document.getElementById("btn-proof-modal-done").onclick = () => backdrop.classList.add("hidden");

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
      <label class="input-label" for="upload-stage-select">Select Milestone</label>
      <div class="custom-select-wrap">
        <select id="upload-stage-select" class="custom-input">
          ${stageOptions}
        </select>
      </div>
    </div>
    <div class="form-group mb-3">
      <label class="input-label" for="upload-doc-title">Deliverable Title or Link</label>
      <input type="text" id="upload-doc-title" class="custom-input" placeholder="e.g. GitHub PR #105 or Figma URL" value="Deployment verification link" />
    </div>
    <div class="proof-dropzone" id="proof-dropzone-box">
      <div class="proof-dropzone-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <div><strong>Drag & drop proof artifact</strong> or click to browse</div>
      <span class="text-sm text-muted">Supports images, PDF specs, smart contracts, git commits</span>
    </div>
  `;

  footerEl.innerHTML = `
    <button type="button" class="btn btn-secondary" id="btn-cancel-upload-proof">Cancel</button>
    <button type="button" class="btn btn-primary" id="btn-commit-upload-proof">Seal in Vault</button>
  `;

  document.getElementById("btn-cancel-upload-proof").onclick = () => backdrop.classList.add("hidden");
  document.getElementById("btn-commit-upload-proof").onclick = () => {
    const titleVal = document.getElementById("upload-doc-title").value.trim() || "New Proof Artifact";
    backdrop.classList.add("hidden");

    // Update count in Proof Vault
    const countEl = document.getElementById("proof-docs-count");
    if (countEl) {
      countEl.textContent = "4 items";
    }

    showAiToast(`New delivery proof "${escapeHtml(titleVal)}" uploaded by ${state.actingPerson} and sealed in Escrow Vault.`);
  };

  backdrop.classList.remove("hidden");
}

function handleHeroAiInput() {
  const input = document.getElementById("hero-ai-input");
  if (!input) return;
  const val = input.value.trim().toLowerCase();
  if (!val) return;

  const deal = state.currentDeal;
  input.value = "";

  if (!deal) return;

  // Check for action keywords
  const activeStage = deal.stages.find(s => s.state === "Completed" || s.state === "Pending" || s.state === "Disputed") || deal.stages[0];

  if (val.includes("approve")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="approve"][data-stage="${activeStage.id}"]`);
    if (btn) btn.click();
    showAiToast(`Action triggered: Requested approval for Stage ${activeStage.num} (${activeStage.title}) as ${state.actingPerson}.`);
  } else if (val.includes("done") || val.includes("complete") || val.includes("finish")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="done"][data-stage="${activeStage.id}"]`);
    if (btn) btn.click();
    showAiToast(`Action triggered: Marked Stage ${activeStage.num} done as ${state.actingPerson}.`);
  } else if (val.includes("dispute")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="dispute"][data-stage="${activeStage.id}"]`);
    if (btn) btn.click();
    showAiToast(`Action triggered: Disputed Stage ${activeStage.num} as ${state.actingPerson}.`);
  } else if (val.includes("refund")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="refund_payers"][data-stage="${activeStage.id}"]`);
    if (btn) btn.click();
    showAiToast(`Arbiter Action: Requested refund to payers for Stage ${activeStage.num}.`);
  } else if (val.includes("pay") || val.includes("release")) {
    const btn = document.querySelector(`.btn-stage-action[data-action="pay_payee"][data-stage="${activeStage.id}"]`);
    if (btn) btn.click();
    showAiToast(`Arbiter Action: Requested payment release to payee for Stage ${activeStage.num}.`);
  } else if (val.includes("withdraw")) {
    document.getElementById("btn-matrix-withdraw")?.click();
    showAiToast(`Withdrawal requested for ${state.actingPerson}.`);
  } else if (val.includes("deposit")) {
    document.getElementById("btn-matrix-deposit")?.click();
    showAiToast(`Simulated deposit initiated for ${state.actingPerson}.`);
  } else if (val.includes("judge") || val.includes("arbiter")) {
    showAiToast(`Arbiter for this deal is ${deal.judge}. Disputes are settled through the Arbiter Panel.`);
  } else if (val.includes("status") || val.includes("next")) {
    const waiting = computeClientWaitingFor(deal);
    showAiToast(`Deal Phase: ${deal.phase}. Next step: ${waiting}.`);
  } else {
    showAiToast(`AI Agreement Assistant: Registered instruction "${escapeHtml(val)}" for Stage ${activeStage.num}. Verification conditions: "${escapeHtml(activeStage.condition)}".`);
  }
}

function showAiToast(message) {
  const slot = document.getElementById("hero-ai-toast-slot");
  if (!slot) return;
  slot.innerHTML = `
    <div class="hero-ai-toast">
      <span><strong>AI Assistant:</strong> ${message}</span>
      <button type="button" class="btn-text-sm" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
}

function computeClientWaitingFor(deal) {
  if (deal.phase === "Funding") {
    const pending = deal.payers.filter(p => !deal.deposited?.[p.person]).map(p => p.person);
    return pending.length > 0 ? `${pending.join(", ")} to deposit` : "All deposits in";
  }
  for (const s of deal.stages) {
    if (s.state === "Pending") return `${s.payee} to mark stage ${s.num} done`;
    if (s.state === "Completed") return `Payer(s) to approve stage ${s.num}`;
    if (s.state === "Disputed") return `Judge ${deal.judge} to settle dispute`;
  }
  return "All stages settled";
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

// ==========================================================================
// SCREEN 4: ATTACK LAB
// ==========================================================================

async function setupAttackLabHandlers() {
  // Attack lab initialized via renderAttackLabCards()
}

async function renderAttackLabCards() {
  const container = document.getElementById("attack-cards-container");
  const res = await api("/attacks");
  if (!res.ok) return;

  const attacks = res.data.attacks;
  container.innerHTML = attacks.map(att => `
    <div class="card glass-card attack-card" id="attack-card-${att.id}">
      <div class="attack-card-header flex-between">
        <div>
          <h3>${escapeHtml(att.title.toUpperCase())}</h3>
          <p class="attack-explanation">${escapeHtml(att.explanation)}.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-run-attack" data-attack="${att.name}">
          Run attack
        </button>
      </div>

      <div class="attack-result-box hidden" id="attack-outcome-${att.name}">
        <!-- Result dynamically populated upon execution -->
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-run-attack").forEach(btn => {
    btn.addEventListener("click", async () => {
      const attackName = btn.getAttribute("data-attack");
      btn.disabled = true;
      btn.textContent = "Attacking...";

      const res = await api(`/attacks/${attackName}`, { method: "POST" });
      btn.disabled = false;
      btn.textContent = "Run attack";

      if (res.ok) {
        renderAttackOutcome(attackName, res.data.result);
      }
    });
  });
}

function renderAttackOutcome(name, result) {
  const box = document.getElementById(`attack-outcome-${name}`);
  if (!box) return;

  box.classList.remove("hidden");

  // Step trace
  const stepsHtml = result.steps.map(s => {
    let dotClass = "step-trace-dot";
    if (s.status === "reverted") dotClass += " dot-reverted";
    if (s.status === "blocked") dotClass += " dot-blocked";
    return `
      <div class="step-trace-item">
        <span class="${dotClass}"></span>
        <span>${escapeHtml(s.action)}</span>
      </div>
    `;
  }).join("");

  if (result.hasWeakCopy && result.weakCopy) {
    // Re-entrancy side-by-side comparison (Spec mockup requirement)
    box.innerHTML = `
      <div class="attack-steps-list">${stepsHtml}</div>
      <div class="reentrancy-comparison-grid">
        <div class="vault-comparison-column column-real">
          <div class="comp-header comp-header-real">REAL VAULT</div>
          <div class="comp-stat-row">
            <span>Owed to attacker:</span>
            <strong>${formatRupees(result.realVault.owedToAttacker)}</strong>
          </div>
          <div class="comp-stat-row">
            <span>Attacker received:</span>
            <strong>${formatRupees(result.realVault.attackerReceived)}</strong>
          </div>
          <div class="comp-stat-row">
            <span>Still locked:</span>
            <strong>${formatRupees(result.realVault.stillLocked)}</strong>
          </div>
          <div class="comp-result-pill pill-failed">
            Result: ${escapeHtml(result.realVault.result)}
          </div>
        </div>

        <div class="vault-comparison-column column-weak">
          <div class="comp-header comp-header-weak">WEAK COPY (unsafe, for comparison)</div>
          <div class="comp-stat-row">
            <span>Owed to attacker:</span>
            <strong>${formatRupees(result.weakCopy.owedToAttacker)}</strong>
          </div>
          <div class="comp-stat-row">
            <span>Attacker received:</span>
            <strong>${formatRupees(result.weakCopy.attackerReceived)}</strong>
          </div>
          <div class="comp-stat-row">
            <span>Still locked:</span>
            <strong>${formatRupees(result.weakCopy.stillLocked)}</strong>
          </div>
          <div class="comp-result-pill pill-drained">
            Result: ${escapeHtml(result.weakCopy.result)}
          </div>
        </div>
      </div>
    `;
  } else {
    // The other 3 show real vault outcome and reason it refused
    box.innerHTML = `
      <div class="attack-steps-list">${stepsHtml}</div>
      <div class="vault-comparison-column column-real mt-2">
        <div class="comp-header comp-header-real">REAL VAULT OUTCOME</div>
        <div class="comp-stat-row">
          <span>Target:</span>
          <strong>${escapeHtml(result.targetStage)}</strong>
        </div>
        <div class="comp-stat-row">
          <span>Funds Protected:</span>
          <strong>${formatRupees(result.realVault.stillLocked)}</strong>
        </div>
        <div class="comp-stat-row">
          <span>Contract Reason:</span>
          <span class="text-rose text-sm">"${escapeHtml(result.realVault.reason)}"</span>
        </div>
        <div class="comp-result-pill pill-failed">
          Result: ${escapeHtml(result.realVault.result)}
        </div>
      </div>
    `;
  }
}

// ==========================================================================
// SCREEN 5: FINAL SUMMARY
// ==========================================================================

async function openSummaryScreen(dealId) {
  navigateTo("summary");
  const res = await api(`/deals/${dealId}/summary`);
  if (!res.ok) return;

  const sum = res.data;
  document.getElementById("summary-deal-title").textContent = sum.title;

  // People Table
  const peopleTbody = document.getElementById("summary-people-tbody");
  peopleTbody.innerHTML = sum.people.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.person)}</strong></td>
      <td>${escapeHtml(p.role)}</td>
      <td class="amount-rupee">${formatRupees(p.paidIn)}</td>
      <td class="amount-rupee text-emerald">${formatRupees(p.received)}</td>
      <td class="amount-rupee text-amber">${formatRupees(p.refunded)}</td>
    </tr>
  `).join("");

  // Stages Table
  const stagesTbody = document.getElementById("summary-stages-tbody");
  stagesTbody.innerHTML = sum.stages.map(s => `
    <tr>
      <td>${s.num}</td>
      <td><strong>${escapeHtml(s.title)}</strong></td>
      <td>${escapeHtml(s.payee)}</td>
      <td class="amount-rupee">${formatRupees(s.amount)}</td>
      <td><span class="badge ${getStateBadgeClass(s.state)}">${escapeHtml(s.howItEnded)}</span></td>
    </tr>
  `).join("");

  // Totals Row
  document.getElementById("sum-deposited").textContent = formatRupees(sum.totals.deposited);
  document.getElementById("sum-paidout").textContent = formatRupees(sum.totals.paidOut);
  document.getElementById("sum-refunded").textContent = formatRupees(sum.totals.refunded);
  document.getElementById("summary-equation-text").textContent = sum.totals.equation;

  document.getElementById("btn-summary-back-dashboard").onclick = () => {
    openDealDashboard(dealId);
  };
}

// ==========================================================================
// Modals & Technical Details Drawer
// ==========================================================================

function setupModalHandlers() {
  // Technical Details Modal
  document.getElementById("btn-open-technical-details")?.addEventListener("click", () => {
    if (!state.currentDeal) return;
    openTechnicalModal(state.currentDeal);
  });

  document.getElementById("btn-close-tech-modal")?.addEventListener("click", () => {
    document.getElementById("technical-modal-backdrop").classList.add("hidden");
  });
  document.getElementById("btn-modal-done")?.addEventListener("click", () => {
    document.getElementById("technical-modal-backdrop").classList.add("hidden");
  });

  // Edit Modal Close
  document.getElementById("btn-close-edit-modal")?.addEventListener("click", closeEditModal);
  document.getElementById("btn-cancel-edit")?.addEventListener("click", closeEditModal);

  // Copy button
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        navigator.clipboard?.writeText(codeEl.textContent.trim());
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = originalText; }, 1500);
      }
    });
  });
}

function openTechnicalModal(deal) {
  document.getElementById("tech-vault-address").textContent = deal.vaultAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  document.getElementById("tech-agreement-hash").textContent = deal.agreementFingerprint || "0x8f4b2ae4c9018f2bb734a6d10c5512b9";

  const accountsContainer = document.getElementById("tech-accounts-list");
  accountsContainer.innerHTML = state.people.map(p => `
    <div class="account-item-row">
      <span><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.roleDesc.split(" ")[0])})</span>
      <code>${escapeHtml(p.address)}</code>
    </div>
  `).join("");

  document.getElementById("technical-modal-backdrop").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("edit-modal-backdrop").classList.add("hidden");
}

// Edit Payer Modal
function openEditPayerModal(index) {
  const deal = state.wizardDeal;
  const payer = deal.payers[index];
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = "Edit Payer";

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="input-label">Payer Name</label>
      <input type="text" id="edit-payer-name" class="custom-input" value="${escapeHtml(payer.person)}" />
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Share Amount (₹)</label>
      <input type="number" id="edit-payer-share" class="custom-input" value="${payer.share}" />
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    const name = document.getElementById("edit-payer-name").value.trim();
    const share = Number(document.getElementById("edit-payer-share").value);
    if (!name || share <= 0) return alert("Please enter valid name and amount");

    deal.payers[index] = { person: name, share };
    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

function openAddPayerModal() {
  const deal = state.wizardDeal;
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = "Add New Payer";

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="input-label">Select Person</label>
      <select id="add-payer-select" class="custom-input">
        ${state.people.map(p => `<option value="${p.name}">${p.name} (${p.roleDesc})</option>`).join("")}
      </select>
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Share Amount (₹)</label>
      <input type="number" id="add-payer-share" class="custom-input" value="10000" />
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    const name = document.getElementById("add-payer-select").value;
    const share = Number(document.getElementById("add-payer-share").value);
    deal.payers.push({ person: name, share });
    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

function openEditJudgeModal() {
  const deal = state.wizardDeal;
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = "Select Appointed Judge";

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="input-label">Neutral Judge</label>
      <select id="edit-judge-select" class="custom-input">
        ${state.people.map(p => `<option value="${p.name}" ${p.name === deal.judge ? 'selected' : ''}>${p.name} (${p.roleDesc})</option>`).join("")}
      </select>
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    deal.judge = document.getElementById("edit-judge-select").value;
    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

function openEditStageModal(index) {
  const deal = state.wizardDeal;
  const stage = deal.stages[index];
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = `Edit Stage ${stage.num || index + 1}`;

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="input-label">Stage Title</label>
      <input type="text" id="edit-stage-title" class="custom-input" value="${escapeHtml(stage.title)}" />
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Payee</label>
      <select id="edit-stage-payee" class="custom-input">
        ${state.people.map(p => `<option value="${p.name}" ${p.name === stage.payee ? 'selected' : ''}>${p.name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Amount (₹)</label>
      <input type="number" id="edit-stage-amount" class="custom-input" value="${stage.amount}" />
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Condition / Requirement</label>
      <input type="text" id="edit-stage-condition" class="custom-input" value="${escapeHtml(stage.condition)}" />
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    stage.title = document.getElementById("edit-stage-title").value.trim();
    stage.payee = document.getElementById("edit-stage-payee").value;
    stage.amount = Number(document.getElementById("edit-stage-amount").value);
    stage.condition = document.getElementById("edit-stage-condition").value.trim();

    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

function openAddStageModal() {
  const deal = state.wizardDeal;
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = "Add New Stage";

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="input-label">Stage Title</label>
      <input type="text" id="add-stage-title" class="custom-input" value="Milestone deliverable" />
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Payee</label>
      <select id="add-stage-payee" class="custom-input">
        ${state.people.map(p => `<option value="${p.name}">${p.name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Amount (₹)</label>
      <input type="number" id="add-stage-amount" class="custom-input" value="10000" />
    </div>
    <div class="form-group mt-2">
      <label class="input-label">Condition</label>
      <input type="text" id="add-stage-condition" class="custom-input" value="Verification criteria met" />
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    const title = document.getElementById("add-stage-title").value.trim();
    const payee = document.getElementById("add-stage-payee").value;
    const amount = Number(document.getElementById("add-stage-amount").value);
    const condition = document.getElementById("add-stage-condition").value.trim();

    deal.stages.push({
      id: `stg-${deal.stages.length + 1}`,
      num: deal.stages.length + 1,
      title, payee, amount, condition, state: "Pending", approvals: []
    });

    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

function openFixUnclearModal(index) {
  const deal = state.wizardDeal;
  const item = deal.unclear[index];
  const modalBody = document.getElementById("edit-modal-body");
  document.getElementById("edit-modal-title").textContent = "Fix Unclear Line";

  const suggestions = item.suggestions || [
    "Domain connected, SSL live, and zero console errors",
    "Client written sign-off within 48 hours"
  ];

  modalBody.innerHTML = `
    <div class="unclear-phrase-text text-amber mb-2">! "${escapeHtml(item.phrase)}"</div>
    <p class="text-sm text-muted mb-3">${escapeHtml(item.question)}</p>
    <div class="form-group">
      <label class="input-label">Choose an objective condition or enter your own:</label>
      <div class="flex-column gap-2">
        ${suggestions.map((s, i) => `
          <label class="radio-option">
            <input type="radio" name="unclear-fix-choice" value="${escapeHtml(s)}" ${i === 0 ? 'checked' : ''} />
            <span>${escapeHtml(s)}</span>
          </label>
        `).join("")}
        <label class="radio-option">
          <input type="radio" name="unclear-fix-choice" value="custom" id="radio-unclear-custom" />
          <span>Custom objective condition:</span>
        </label>
        <input type="text" id="custom-unclear-text" class="custom-input mt-1" placeholder="Specify measurable criterion..." />
      </div>
    </div>
  `;

  document.getElementById("btn-save-edit").onclick = async () => {
    const selected = document.querySelector('input[name="unclear-fix-choice"]:checked')?.value;
    let replacement = selected;
    if (selected === "custom") {
      replacement = document.getElementById("custom-unclear-text").value.trim();
    }
    if (!replacement) return alert("Please specify an objective condition");

    // Update matching stage condition if applicable
    deal.stages.forEach(s => {
      if (s.condition.includes(item.phrase) || s.textPhrase.includes(item.phrase)) {
        s.condition = replacement;
      }
    });

    // Remove this unclear item
    deal.unclear.splice(index, 1);

    await syncChecklistChanges();
    closeEditModal();
  };

  document.getElementById("edit-modal-backdrop").classList.remove("hidden");
}

async function syncChecklistChanges() {
  const deal = state.wizardDeal;
  const res = await api(`/deals/${deal.id}/checklist`, {
    method: "PUT",
    body: JSON.stringify({
      payers: deal.payers,
      judge: deal.judge,
      stages: deal.stages,
      unclear: deal.unclear,
      person: state.actingPerson
    })
  });

  if (res.ok) {
    state.wizardDeal = res.data.deal;
    renderReviewStep();
  }
}
