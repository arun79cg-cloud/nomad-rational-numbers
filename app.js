// Basic app state
const state = {
  teachCompleted: new Set(),
  practice: {
    answered: 0,
    correct: 0,
    conceptStats: {} // concept -> {answered, correct}
  },
  test: {
    started: false,
    index: 0,
    score: 0,
    answered: 0
  },
  startTime: Date.now()
};

// UTIL

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// TOP NAV
document.querySelectorAll(".nav-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-tab")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    showScreen(btn.dataset.target);
  });
});

// LEARN: segment switching
document.querySelectorAll(".segment-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const seg = btn.dataset.segment;
    document
      .querySelectorAll(".segment-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document
      .querySelectorAll(".teach-segment")
      .forEach((s) => s.classList.remove("active"));
    const segEl = document.getElementById(seg);
    if (segEl) segEl.classList.add("active");
  });
});

// LEARN: completion + progress
function updateTeachProgress() {
  const total = document.querySelectorAll(".teach-segment").length;
  const done = state.teachCompleted.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById("teachProgressFill").style.width = `${pct}%`;
  document.getElementById("teachProgressValue").textContent = `${pct}%`;
}

document.querySelectorAll("[data-complete-seg]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const seg = btn.dataset.completeSeg;
    state.teachCompleted.add(seg);
    updateTeachProgress();
    btn.textContent = "Marked as understood";
    btn.disabled = true;
    btn.classList.add("btn-disabled");
  });
});

// QUESTION HANDLER (common to quick checks + practice)
function handleOptionGroupClick(groupEl, feedbackId, questionKey, concept) {
  groupEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".option");
    if (!btn) return;

    const multi = groupEl.dataset.multi === "true";
    const isCorrect = btn.dataset.correct === "true";
    const feedbackEl = document.getElementById(feedbackId);

    if (!multi) {
      groupEl
        .querySelectorAll(".option")
        .forEach((o) => o.classList.remove("correct-selected", "wrong-selected"));
    }

    if (isCorrect) {
      btn.classList.add("correct-selected");
      btn.classList.remove("wrong-selected");
      feedbackEl.textContent = "Correct!";
      feedbackEl.classList.add("ok");
      feedbackEl.classList.remove("bad");
    } else {
      btn.classList.add("wrong-selected");
      btn.classList.remove("correct-selected");
      feedbackEl.textContent = "Not quite. Try again.";
      feedbackEl.classList.add("bad");
      feedbackEl.classList.remove("ok");
    }

    // Update practice stats only for practice questions (qid starts with p)
    if (questionKey && questionKey.startsWith("p")) {
      if (!state.practice.seen) state.practice.seen = new Set();
      if (!state.practice.seen.has(questionKey)) {
        state.practice.answered += 1;
        if (isCorrect) state.practice.correct += 1;
        state.practice.seen.add(questionKey);

        if (!state.practice.conceptStats[concept]) {
          state.practice.conceptStats[concept] = { answered: 0, correct: 0 };
        }
        state.practice.conceptStats[concept].answered += 1;
        if (isCorrect) state.practice.conceptStats[concept].correct += 1;
      }
    }
  });
}

// Attach handlers to all quick checks (qcX)
document.querySelectorAll(".options[data-question-id]").forEach((group) => {
  const qid = group.dataset.questionId;
  const fbId = `feedback-${qid}`;
  handleOptionGroupClick(group, fbId, null, null);
});

// Attach handlers to practice questions (pX with concept)
document
  .querySelectorAll(".practice-question")
  .forEach((pq) => {
    const qid = pq.dataset.qid;
    const concept = pq.dataset.concept;
    const group = pq.querySelector(".options");
    const fbId = `feedback-${qid}`;
    handleOptionGroupClick(group, fbId, qid, concept);
  });

// PRACTICE: level tab switching
document.querySelectorAll(".level-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".level-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const level = tab.dataset.level;
    document
      .querySelectorAll(".level-panel")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById(`level-${level}`).classList.add("active");
  });
});

// TEST QUESTIONS
const testQuestions = [
  {
    text: "Which of these is NOT a rational number?",
    options: [
      { text: "3/4", correct: false },
      { text: "−5", correct: false },
      { text: "√2", correct: true }
    ],
    concept: "definition"
  },
  {
    text: "Rational numbers are closed under which operation(s)?",
    options: [
      { text: "Addition and multiplication", correct: true },
      { text: "Addition only", correct: false },
      { text: "Division only", correct: false }
    ],
    concept: "closure"
  },
  {
    text: "For rational numbers, which is true?",
    options: [
      { text: "a + b = b + a", correct: true },
      { text: "a − b = b − a", correct: false },
      { text: "a ÷ b = b ÷ a", correct: false }
    ],
    concept: "comm-assoc"
  },
  {
    text: "What is the additive identity for rational numbers?",
    options: [
      { text: "0", correct: true },
      { text: "1", correct: false },
      { text: "−1", correct: false }
    ],
    concept: "identity"
  },
  {
    text: "What is the reciprocal of 4/7?",
    options: [
      { text: "7/4", correct: true },
      { text: "−7/4", correct: false },
      { text: "4/7", correct: false }
    ],
    concept: "inverse"
  },
  {
    text: "Simplify using distributive property: 2(3/4 + 1/4).",
    options: [
      { text: "2", correct: false },
      { text: "1", correct: false },
      { text: "2", correct: false },
      { text: "2", correct: false }
    ],
    concept: "distributive"
  },
  {
    text: "3/5 lies between which integers?",
    options: [
      { text: "0 and 1", correct: true },
      { text: "1 and 2", correct: false },
      { text: "−1 and 0", correct: false }
    ],
    concept: "numberline"
  },
  {
    text: "Which is between −1 and 0?",
    options: [
      { text: "−3/2", correct: false },
      { text: "−1/2", correct: true },
      { text: "1/2", correct: false }
    ],
    concept: "between"
  },
  {
    text: "Add 2/3 and its additive inverse.",
    options: [
      { text: "0", correct: true },
      { text: "4/3", correct: false },
      { text: "−4/3", correct: false }
    ],
    concept: "inverse"
  },
  {
    text: "Pick the correct statement.",
    options: [
      { text: "Rational numbers are finite on the number line.", correct: false },
      { text: "Between any two rational numbers there is another one.", correct: true },
      { text: "Only integers are rational numbers.", correct: false }
    ],
    concept: "between"
  }
];

const testCard = document.getElementById("testCard");
const testQuestionText = document.getElementById("testQuestionText");
const testOptionsEl = document.getElementById("testOptions");
const testFeedback = document.getElementById("testFeedback");
const testProgressPill = document.getElementById("testProgressPill");
const testStatus = document.getElementById("testStatus");
const nextTestQuestionBtn = document.getElementById("nextTestQuestionBtn");

function renderTestQuestion() {
  const idx = state.test.index;
  const q = testQuestions[idx];
  testQuestionText.textContent = q.text;
  testOptionsEl.innerHTML = "";
  testFeedback.textContent = "";
  nextTestQuestionBtn.disabled = true;

  testProgressPill.textContent = `Question ${idx + 1} of ${testQuestions.length}`;

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      // lock others
      testOptionsEl
        .querySelectorAll(".option")
        .forEach((o) => o.classList.remove("correct-selected", "wrong-selected"));
      if (opt.correct) {
        btn.classList.add("correct-selected");
        testFeedback.textContent = "Correct!";
        testFeedback.classList.add("ok");
        testFeedback.classList.remove("bad");
        state.test.score += 1;
      } else {
        btn.classList.add("wrong-selected");
        testFeedback.textContent = "Not correct, we will revise this in Learn.";
        testFeedback.classList.add("bad");
        testFeedback.classList.remove("ok");
      }
      state.test.answered += 1;

      // track concept stats also as practice
      const concept = q.concept;
      if (!state.practice.conceptStats[concept]) {
        state.practice.conceptStats[concept] = { answered: 0, correct: 0 };
      }
      state.practice.conceptStats[concept].answered += 1;
      if (opt.correct) state.practice.conceptStats[concept].correct += 1;
      state.practice.answered += 1;
      if (opt.correct) state.practice.correct += 1;

      nextTestQuestionBtn.disabled = false;
    });
    testOptionsEl.appendChild(btn);
  });
}

document.getElementById("startTestBtn").addEventListener("click", () => {
  state.test.started = true;
  state.test.index = 0;
  state.test.score = 0;
  state.test.answered = 0;
  testCard.style.display = "block";
  testStatus.textContent = "";
  renderTestQuestion();
});

nextTestQuestionBtn.addEventListener("click", () => {
  if (state.test.index < testQuestions.length - 1) {
    state.test.index += 1;
    renderTestQuestion();
  } else {
    // finished
    testCard.style.display = "none";
    const pct = Math.round(
      (state.test.score / testQuestions.length) * 100
    );
    testStatus.textContent = `Test finished: ${state.test.score}/${testQuestions.length} correct (${pct}%).`;
    updateReports();
  }
});

// PARENT MODAL
const parentModal = document.getElementById("parentModal");
document.getElementById("openParentViewBtn").addEventListener("click", () => {
  openModal("parentModal");
});
document
  .getElementById("closeParentModalBtn")
  .addEventListener("click", () => closeModal("parentModal"));
document
  .getElementById("openSampleReportBtn")
  .addEventListener("click", () => {
    closeModal("parentModal");
    // switch to Reports tab
    document
      .querySelectorAll(".nav-tab")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('.nav-tab[data-target="screen-reports"]')
      .classList.add("active");
    showScreen("screen-reports");
    updateReports();
  });

// INFO MODAL (payment, download, notify)
const infoModal = document.getElementById("infoModal");
const infoTitle = document.getElementById("infoModalTitle");
const infoBody = document.getElementById("infoModalBody");

function openInfoModal(title, body) {
  infoTitle.textContent = title;
  infoBody.textContent = body;
  openModal("infoModal");
}

document
  .getElementById("closeInfoModalBtn")
  .addEventListener("click", () => closeModal("infoModal"));

document.getElementById("paymentCtaBtn").addEventListener("click", () => {
  openInfoModal(
    "Payment coming soon",
    "In the full Nomad Tutor App, this button will unlock extra practice, voice‑over teaching and detailed reports."
  );
});

document.getElementById("downloadAppBtn").addEventListener("click", () => {
  openInfoModal(
    "Download SimplifyLiving",
    "In the full release this button will open the Google Play page for the SimplifyLiving app."
  );
});

document.getElementById("notifyBtn").addEventListener("click", () => {
  openInfoModal(
    "Notify me",
    "Later, parents can leave their email or WhatsApp number here to get updates when more chapters go live."
  );
});

// REPORTS

function formatTimeMinutes(ms) {
  const mins = Math.round(ms / 60000);
  return mins <= 0 ? "<1 min" : `${mins} min`;
}

function updateReports() {
  const now = Date.now();
  const elapsed = now - state.startTime;
  document.getElementById("kpiTime").innerHTML = formatTimeMinutes(elapsed);

  const totalQ = state.practice.answered;
  const correctQ = state.practice.correct;
  const acc = totalQ ? Math.round((correctQ / totalQ) * 100) : 0;
  document.getElementById("kpiQuestions").textContent = totalQ;
  document.getElementById("kpiAccuracy").textContent = `${acc}%`;

  const tbody = document.getElementById("conceptTableBody");
  tbody.innerHTML = "";

  const conceptNames = {
    definition: "Definition & identification",
    closure: "Closure property",
    "comm-assoc": "Commutativity & associativity",
    identity: "Role of 0 & 1",
    inverse: "Inverse & reciprocal",
    distributive: "Distributive property",
    numberline: "Number line",
    between: "Between two rationals"
  };

  Object.keys(conceptNames).forEach((key) => {
    const stats = state.practice.conceptStats[key] || {
      answered: 0,
      correct: 0
    };
    const ans = stats.answered;
    const cor = stats.correct;
    const pct = ans ? Math.round((cor / ans) * 100) : 0;

    let statusText = "Needs more data";
    let statusClass = "status-practice";
    if (!ans) {
      statusText = "Not attempted yet";
      statusClass = "status-practice";
    } else if (pct >= 80) {
      statusText = "Strong";
      statusClass = "status-strong";
    } else if (pct >= 50) {
      statusText = "Needs practice";
      statusClass = "status-practice";
    } else {
      statusText = "Needs help";
      statusClass = "status-help";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${conceptNames[key]}</td>
      <td>${ans ? pct + "%" : "—"}</td>
      <td><span class="concept-status ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });

  // Guidance text
  const guidanceList = document.getElementById("parentGuidanceList");
  guidanceList.innerHTML = "";

  if (acc >= 80 && totalQ >= 5) {
    guidanceList.innerHTML =
      "<li>Your child seems comfortable with this chapter in this short sample.</li>" +
      "<li>In the full app, move them to Hard / Advanced levels and time‑based tests.</li>";
  } else if (acc >= 50 && totalQ >= 3) {
    guidanceList.innerHTML =
      "<li>Ask your child to repeat 1–2 Teach steps they find confusing.</li>" +
      "<li>Let them do a few more questions from the Easy and Medium ladders.</li>";
  } else {
    guidanceList.innerHTML =
      "<li>Sit with your child and go slowly through the first few Teach steps.</li>" +
      "<li>Encourage them to answer just a couple of Easy questions without time pressure.</li>";
  }
}

// INITIAL
showScreen("screen-learn");
updateTeachProgress();
