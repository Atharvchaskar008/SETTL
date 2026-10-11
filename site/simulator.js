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

  function getLockedBalance() {
    var count = 0;
    for (var i = 0; i < stages.length; i++) {
      if (stages[i].status === 'Pending' || stages[i].status === 'Completed' || stages[i].status === 'Disputed') {
        count++;
      }
    }
    return count * STAGE_AMOUNT;
  }

  function getWaitingBalance() {
    return withdrawable.Payer + withdrawable.Payee + withdrawable.Judge + withdrawable.Stranger;
  }

  function clearFeedbacks() {
    for (var i = 0; i < stages.length; i++) {
      stages[i].feedback = '';
    }
    withdrawFeedback = '';
  }

  function setActor(actor) {
    currentActor = actor;
    clearFeedbacks();
    render();
  }

  function handleMarkDone(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      stage.feedback = 'This stage is already settled.';
      render();
      return;
    }
    if (currentActor !== 'Payee') {
      stage.feedback = 'Only the payee can mark a stage done.';
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.feedback = 'This stage has already been marked done.';
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.feedback = 'This stage is disputed; only the judge can settle it.';
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.status = 'Completed';
      stage.feedback = '';
      render();
      return;
    }

    stage.feedback = 'Invalid action for this stage.';
    render();
  }

  function handleApprove(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      stage.feedback = 'This stage is already settled.';
      render();
      return;
    }
    if (currentActor !== 'Payer') {
      stage.feedback = 'Only the payer can approve a stage.';
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.feedback = 'This stage has not been marked done yet.';
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.feedback = 'This stage is disputed; only the judge can settle it.';
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.status = 'Released';
      withdrawable.Payee += STAGE_AMOUNT;
      stage.feedback = '';
      render();
      return;
    }

    stage.feedback = 'Invalid action for this stage.';
    render();
  }

  function handleDispute(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      stage.feedback = 'This stage is already settled.';
      render();
      return;
    }
    if (currentActor !== 'Payer') {
      stage.feedback = 'Only the payer can dispute a stage.';
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.feedback = 'This stage has not been marked done yet.';
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.feedback = 'This stage is already disputed.';
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.status = 'Disputed';
      stage.feedback = '';
      render();
      return;
    }

    stage.feedback = 'Invalid action for this stage.';
    render();
  }

  function handleJudgePay(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      stage.feedback = 'This stage is already settled.';
      render();
      return;
    }
    if (currentActor !== 'Judge') {
      stage.feedback = 'Only the judge can settle a dispute.';
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.feedback = 'This stage has not been marked done yet.';
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.feedback = 'This stage is not disputed.';
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.status = 'Released';
      withdrawable.Payee += STAGE_AMOUNT;
      stage.feedback = '';
      render();
      return;
    }

    stage.feedback = 'Invalid action for this stage.';
    render();
  }

  function handleJudgeRefund(stageId) {
    clearFeedbacks();
    var stage = stages[stageId - 1];

    if (stage.status === 'Released' || stage.status === 'Refunded') {
      stage.feedback = 'This stage is already settled.';
      render();
      return;
    }
    if (currentActor !== 'Judge') {
      stage.feedback = 'Only the judge can settle a dispute.';
      render();
      return;
    }
    if (stage.status === 'Pending') {
      stage.feedback = 'This stage has not been marked done yet.';
      render();
      return;
    }
    if (stage.status === 'Completed') {
      stage.feedback = 'This stage is not disputed.';
      render();
      return;
    }
    if (stage.status === 'Disputed') {
      stage.status = 'Refunded';
      withdrawable.Payer += STAGE_AMOUNT;
      stage.feedback = '';
      render();
      return;
    }

    stage.feedback = 'Invalid action for this stage.';
    render();
  }

  function handleWithdraw() {
    clearFeedbacks();

    if (currentActor === 'Judge') {
      withdrawFeedback = 'The judge settles disputes and can never take the money.';
      render();
      return;
    }

    if (currentActor === 'Stranger') {
      withdrawFeedback = 'Strangers have nothing to withdraw.';
      render();
      return;
    }

    var available = withdrawable[currentActor];
    if (available <= 0) {
      if (currentActor === 'Payer') {
        withdrawFeedback = 'Riya has nothing to withdraw.';
      } else if (currentActor === 'Payee') {
        withdrawFeedback = 'Aman has nothing to withdraw.';
      } else {
        withdrawFeedback = 'Nothing to withdraw.';
      }
      render();
      return;
    }

    paidOut += available;
    withdrawable[currentActor] = 0;
    withdrawFeedback = '';
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
