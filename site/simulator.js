(function () {
  'use strict';

  var STAGE_AMOUNT = 10000;
  var TOTAL_AMOUNT = 30000;

  var currentActor = 'Payer'; // 'Payer', 'Payee', 'Judge', 'Stranger'

  var actorDisplayNames = {
    Payer: 'Payer (Riya)',
    Payee: 'Payee (Aman)',
    Judge: 'Judge (Meera)',
    Stranger: 'Stranger'
  };

  var stages = [
    { id: 1, name: 'Stage 1', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' },
    { id: 2, name: 'Stage 2', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' },
    { id: 3, name: 'Stage 3', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' }
  ];

  var withdrawable = {
    Payer: 0,
    Payee: 0,
    Judge: 0,
    Stranger: 0
  };

  var paidOut = 0;
  var withdrawFeedback = '';
  var logs = [];

  /**
   * Calculates the locked balance from pending, completed, and disputed stages.
   * @returns {number} Locked amount in rupees.
   */
  function getLockedBalance() {
    var count = 0;
    for (var i = 0; i < stages.length; i++) {
      if (stages[i].status === 'Pending' || stages[i].status === 'Completed' || stages[i].status === 'Disputed') {
        count++;
      }
    }
    return count * STAGE_AMOUNT;
  }

  /**
   * Calculates total funds released or refunded waiting for withdrawal.
   * @returns {number} Withdrawable amount across all actors in rupees.
   */
  function getWaitingBalance() {
    return withdrawable.Payer + withdrawable.Payee + withdrawable.Judge + withdrawable.Stranger;
  }

  /**
   * Records an action entry to the chronological simulator event log.
   * @param {string} actor - Internal actor identifier.
   * @param {string} actionText - Description of the attempted action.
   * @param {boolean} accepted - True if valid and executed, false if refused.
   * @param {string} reason - Acceptance message or refusal explanation.
   */
  function addLog(actor, actionText, accepted, reason) {
    logs.push({
      actor: actorDisplayNames[actor] || actor,
      action: actionText,
      accepted: accepted,
      reason: reason || ''
    });
  }

  function clearFeedbacks() {
    for (var i = 0; i < stages.length; i++) {
      stages[i].feedback = '';
    }
    withdrawFeedback = '';
  }

  /**
   * Sets the active acting role and refreshes simulator UI.
   * @param {string} actor - One of 'Payer', 'Payee', 'Judge', or 'Stranger'.
   */
  function setActor(actor) {
    currentActor = actor;
    clearFeedbacks();
    render();
  }

  function handleMarkDone(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];
    var actionText = 'Mark done on Stage ' + stageId;

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      var reason = 'This stage is already settled.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (currentActor !== 'Payee') {
      var reason = 'Only the payee can mark a stage done.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Completed') {
      var reason = 'This stage has already been marked done.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      var reason = 'This stage is disputed; only the judge can settle it.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.status = 'Completed';
      stage.feedback = '';
      addLog(currentActor, actionText, true, 'Stage ' + stageId + ' marked Completed.');
      render();
      return;
    }

    var fallbackReason = 'Invalid action for this stage.';
    stage.feedback = fallbackReason;
    addLog(currentActor, actionText, false, fallbackReason);
    render();
  }

  function handleApprove(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];
    var actionText = 'Approve Stage ' + stageId;

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      var reason = 'This stage is already settled.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (currentActor !== 'Payer') {
      var reason = 'Only the payer can approve a stage.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Pending') {
      var reason = 'This stage has not been marked done yet.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      var reason = 'This stage is disputed; only the judge can settle it.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.status = 'Released';
      withdrawable.Payee += STAGE_AMOUNT;
      stage.feedback = '';
      addLog(currentActor, actionText, true, 'Stage ' + stageId + ' Released. 10000 rupees added to what Aman can withdraw.');
      render();
      return;
    }

    var fallbackReason = 'Invalid action for this stage.';
    stage.feedback = fallbackReason;
    addLog(currentActor, actionText, false, fallbackReason);
    render();
  }

  function handleDispute(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];
    var actionText = 'Dispute Stage ' + stageId;

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      var reason = 'This stage is already settled.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (currentActor !== 'Payer') {
      var reason = 'Only the payer can dispute a stage.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Pending') {
      var reason = 'This stage has not been marked done yet.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      var reason = 'This stage is already disputed.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.status = 'Disputed';
      stage.feedback = '';
      addLog(currentActor, actionText, true, 'Stage ' + stageId + ' marked Disputed.');
      render();
      return;
    }

    var fallbackReason = 'Invalid action for this stage.';
    stage.feedback = fallbackReason;
    addLog(currentActor, actionText, false, fallbackReason);
    render();
  }

  function handleJudgePay(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];
    var actionText = 'Judge: pay on Stage ' + stageId;

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      var reason = 'This stage is already settled.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (currentActor !== 'Judge') {
      var reason = 'Only the judge can settle a dispute.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Pending') {
      var reason = 'This stage has not been marked done yet.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Completed') {
      var reason = 'This stage is not disputed.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.status = 'Released';
      withdrawable.Payee += STAGE_AMOUNT;
      stage.feedback = '';
      addLog(currentActor, actionText, true, 'Judge released Stage ' + stageId + '. 10000 rupees added to what Aman can withdraw.');
      render();
      return;
    }

    var fallbackReason = 'Invalid action for this stage.';
    stage.feedback = fallbackReason;
    addLog(currentActor, actionText, false, fallbackReason);
    render();
  }

  function handleJudgeRefund(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];
    var actionText = 'Judge: refund on Stage ' + stageId;

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      var reason = 'This stage is already settled.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (currentActor !== 'Judge') {
      var reason = 'Only the judge can settle a dispute.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Pending') {
      var reason = 'This stage has not been marked done yet.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Completed') {
      var reason = 'This stage is not disputed.';
      stage.feedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.status = 'Refunded';
      withdrawable.Payer += STAGE_AMOUNT;
      stage.feedback = '';
      addLog(currentActor, actionText, true, 'Judge refunded Stage ' + stageId + '. 10000 rupees added to what Riya can withdraw.');
      render();
      return;
    }

    var fallbackReason = 'Invalid action for this stage.';
    stage.feedback = fallbackReason;
    addLog(currentActor, actionText, false, fallbackReason);
    render();
  }

  function handleWithdraw() {
    clearFeedbacks();
    var actionText = 'Withdraw';

    if (currentActor === 'Judge') {
      var reason = 'The judge settles disputes and can never take the money.';
      withdrawFeedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }

    if (currentActor === 'Stranger') {
      var reason = 'Strangers have nothing to withdraw.';
      withdrawFeedback = reason;
      addLog(currentActor, actionText, false, reason);
      render();
      return;
    }

    var available = withdrawable[currentActor];
    if (available <= 0) {
      var noFundsReason = '';
      if (currentActor === 'Payer') {
        noFundsReason = 'Riya has nothing to withdraw.';
      } else if (currentActor === 'Payee') {
        noFundsReason = 'Aman has nothing to withdraw.';
      } else {
        noFundsReason = 'Nothing to withdraw.';
      }
      withdrawFeedback = noFundsReason;
      addLog(currentActor, actionText, false, noFundsReason);
      render();
      return;
    }

    paidOut += available;
    withdrawable[currentActor] = 0;
    withdrawFeedback = '';
    addLog(currentActor, actionText, true, 'Withdrew ' + available + ' rupees to paid out.');
    render();
  }

  function handleReset() {
    currentActor = 'Payer';
    stages = [
      { id: 1, name: 'Stage 1', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' },
      { id: 2, name: 'Stage 2', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' },
      { id: 3, name: 'Stage 3', amount: STAGE_AMOUNT, status: 'Pending', feedback: '' }
    ];
    withdrawable = {
      Payer: 0,
      Payee: 0,
      Judge: 0,
      Stranger: 0
    };
    paidOut = 0;
    clearFeedbacks();
    addLog(currentActor, 'Reset simulator', true, 'Reset to initial state.');
    render();
  }

  function render() {
    // Update actor buttons
    var actorButtons = document.querySelectorAll('.actor-btn');
    for (var i = 0; i < actorButtons.length; i++) {
      var btn = actorButtons[i];
      if (btn.getAttribute('data-actor') === currentActor) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    }

    var currentActorLabel = document.getElementById('current-actor-label');
    if (currentActorLabel) {
      currentActorLabel.textContent = actorDisplayNames[currentActor];
    }

    // Update stages
    for (var s = 0; s < stages.length; s++) {
      var stage = stages[s];
      var badge = document.getElementById('stage-' + stage.id + '-status');
      if (badge) {
        badge.textContent = stage.status;
        badge.className = 'stage-badge ' + stage.status.toLowerCase();
      }

      var feedbackElem = document.getElementById('stage-' + stage.id + '-feedback');
      if (feedbackElem) {
        feedbackElem.textContent = stage.feedback;
      }
    }

    // Withdraw feedback
    var wFeedbackElem = document.getElementById('withdraw-feedback');
    if (wFeedbackElem) {
      wFeedbackElem.textContent = withdrawFeedback;
    }

    // Withdraw info
    var wInfoElem = document.getElementById('withdrawable-amount');
    if (wInfoElem) {
      wInfoElem.textContent = withdrawable[currentActor] + ' rupees';
    }

    // Invariant: locked + waiting + currentPaidOut === TOTAL_AMOUNT (30,000 rupees)
    // Every state transition strictly conserves the locked agreement funds.
    var locked = getLockedBalance();
    var waiting = getWaitingBalance();
    var currentPaidOut = paidOut;

    var lockedText = document.getElementById('locked-balance-text');
    if (lockedText) {
      lockedText.textContent = locked + ' rupees';
    }

    var waitingText = document.getElementById('waiting-balance-text');
    if (waitingText) {
      waitingText.textContent = waiting + ' rupees';
    }

    var paidText = document.getElementById('paid-balance-text');
    if (paidText) {
      paidText.textContent = currentPaidOut + ' rupees';
    }

    // Balance bar segments
    var lockedBar = document.getElementById('bar-locked');
    if (lockedBar) {
      lockedBar.style.width = ((locked / TOTAL_AMOUNT) * 100) + '%';
    }

    var waitingBar = document.getElementById('bar-waiting');
    if (waitingBar) {
      waitingBar.style.width = ((waiting / TOTAL_AMOUNT) * 100) + '%';
    }

    var paidBar = document.getElementById('bar-paid');
    if (paidBar) {
      paidBar.style.width = ((currentPaidOut / TOTAL_AMOUNT) * 100) + '%';
    }

    // Log list
    var logList = document.getElementById('log-list');
    if (logList) {
      logList.innerHTML = '';
      for (var l = logs.length - 1; l >= 0; l--) {
        var entry = logs[l];
        var li = document.createElement('li');
        li.className = 'log-entry ' + (entry.accepted ? 'accepted' : 'refused');
        var statusLabel = entry.accepted ? 'Accepted' : 'Refused';
        var text = entry.actor + ' tried ' + entry.action + ' — ' + statusLabel;
        if (entry.reason) {
          text += ': ' + entry.reason;
        }
        li.textContent = text;
        logList.appendChild(li);
      }
    }
  }

  function init() {
    var actorButtons = document.querySelectorAll('.actor-btn');
    for (var i = 0; i < actorButtons.length; i++) {
      actorButtons[i].addEventListener('click', function () {
        var actor = this.getAttribute('data-actor');
        setActor(actor);
      });
    }

    var actionButtons = document.querySelectorAll('[data-action]');
    for (var j = 0; j < actionButtons.length; j++) {
      actionButtons[j].addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        var stageId = parseInt(this.getAttribute('data-stage'), 10);

        if (action === 'mark-done') {
          handleMarkDone(stageId);
        } else if (action === 'approve') {
          handleApprove(stageId);
        } else if (action === 'dispute') {
          handleDispute(stageId);
        } else if (action === 'judge-pay') {
          handleJudgePay(stageId);
        } else if (action === 'judge-refund') {
          handleJudgeRefund(stageId);
        }
      });
    }

    var withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', handleWithdraw);
    }

    var resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
