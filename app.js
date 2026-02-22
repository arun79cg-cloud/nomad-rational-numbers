// ─── STATE ───────────────────────────────────────────
const state = {
  startTime: Date.now(),
  teach: { completed: new Set() },
  practice: {
    seen: new Set(),
    answered: 0,
    correct: 0,
    concepts: {}
  },
  test: {
    index: 0,
    score: 0,
    answered: 0,
    running: false
  }
};

const TOTAL_SEGS = 9;

// ─── SCREEN SWITCHING ────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen')
    .forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ─── TOP NAV TABS ────────────────────────────────────
document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showScreen(btn.dataset.target);
    if (btn.dataset.target === 'screen-reports') updateReports();
  });
});

// ─── SEGMENT SWITCHING ───────────────────────────────
document.querySelectorAll('.segment-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.segment-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.teach-segment')
      .forEach(s => s.classList.remove('active'));
    const seg = document.getElementById(btn.dataset.segment);
    if (seg) seg.classList.add('active');
  });
});

// ─── TEACH PROGRESS ──────────────────────────────────
function updateTeachProgress() {
  const done = state.teach.completed.size;
  const pct = Math.round((done / TOTAL_SEGS) * 100);
  document.getElementById('teachProgressFill').style.width = pct + '%';
  document.getElementById('teachProgressValue').textContent = pct + '%';
}

// ─── MARK AS UNDERSTOOD ──────────────────────────────
document.querySelectorAll('.mark-done').forEach(btn => {
  btn.addEventListener('click', () => {
    const seg = btn.dataset.seg;
    const unlock = btn.dataset.unlock;
    state.teach.completed.add(seg);
    btn.textContent = 'Understood ✔';
    btn.disabled = true;
    updateTeachProgress();
    if (unlock && unlock !== 'done') {
      const nextBtn = document.querySelector(
        `.segment-btn[data-segment="${unlock}"]`
      );
      if (nextBtn) nextBtn.classList.remove('locked');
    }
  });
});

// ─── OPTION CLICK HANDLER ────────────────────────────
function attachOptions(container, fbId, qid, concept) {
  container.addEventListener('click', e => {
    const btn = e.target.closest('.option');
    if (!btn) return;
    const correct = btn.dataset.correct === 'true';
    const fb = document.getElementById(fbId);

    container.querySelectorAll('.option')
      .forEach(o => o.classList.remove('correct', 'wrong'));

    if (correct) {
      btn.classList.add('correct');
      fb.textContent = 'Correct!';
      fb.className = 'feedback ok';
    } else {
      btn.classList.add('wrong');
      fb.textContent = 'Not quite — try again.';
      fb.className = 'feedback bad';
    }

    if (qid && !state.practice.seen.has(qid)) {
      state.practice.seen.add(qid);
      state.practice.answered++;
      if (correct) state.practice.correct++;
      if (concept) {
        if (!state.practice.concepts[concept])
          state.practice.concepts[concept] = { a: 0, c: 0 };
        state.practice.concepts[concept].a++;
        if (correct) state.practice.concepts[concept].c++;
      }
    }

    // unlock mark-done button when correct answer chosen
    if (correct) {
      const seg = container.closest('.teach-segment');
      if (seg) {
        const markBtn = seg.querySelector('.mark-done');
        if (markBtn) markBtn.disabled = false;
      }
    }
  });
}

// attach to all quick check options (learn screen)
document.querySelectorAll('.teach-segment').forEach(seg => {
  const optGroup = seg.querySelector('.options');
  const qid = optGroup ? optGroup.dataset.qid : null;
  const fbId = qid ? 'fb-' + qid : null;
  if (optGroup && fbId) attachOptions(optGroup, fbId, null, null);
});

// attach to all practice options
document.querySelectorAll('.practice-q').forEach(pq => {
  const optGroup = pq.querySelector('.options');
  const qid = pq.dataset.qid;
  const concept = pq.dataset.concept;
  const fbId = 'fb-' + qid;
  if (optGroup) attachOptions(optGroup, fbId, qid, concept);
});
// ─── LEVEL TABS (PRACTICE) ───────────────────────────
document.querySelectorAll('.level-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.level-tab')
      .forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.level-panel')
      .forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('level-' + tab.dataset.level);
    if (panel) panel.classList.add('active');
  });
});

// ─── TEST QUESTIONS ──────────────────────────────────
const testQs = [
  {
    q: 'Which of these is NOT a rational number?',
    opts: ['3/4', '−5', '√2'],
    ans: 2,
    concept: 'definition'
  },
  {
    q: 'Rational numbers are closed under which operations?',
    opts: ['Addition and multiplication', 'Addition only', 'Division only'],
    ans: 0,
    concept: 'closure'
  },
  {
    q: 'Which is true for rational numbers?',
    opts: ['a + b = b + a', 'a − b = b − a', 'a ÷ b = b ÷ a'],
    ans: 0,
    concept: 'comm-assoc'
  },
  {
    q: 'What is the additive identity for rational numbers?',
    opts: ['0', '1', '−1'],
    ans: 0,
    concept: 'identity'
  },
  {
    q: 'What is the reciprocal of 4/7?',
    opts: ['7/4', '−7/4', '4/7'],
    ans: 0,
    concept: 'inverse'
  },
  {
    q: 'Simplify using distributive property: 2 × (3/4 + 1/4)',
    opts: ['1', '2', '3'],
    ans: 1,
    concept: 'distributive'
  },
  {
    q: '3/5 lies between which two integers?',
    opts: ['0 and 1', '1 and 2', '−1 and 0'],
    ans: 0,
    concept: 'numberline'
  },
  {
    q: 'Which number lies between −1 and 0?',
    opts: ['−3/2', '−1/2', '1/2'],
    ans: 1,
    concept: 'between'
  },
  {
    q: 'Add 2/3 and its additive inverse.',
    opts: ['0', '4/3', '−4/3'],
    ans: 0,
    concept: 'inverse'
  },
  {
    q: 'Between any two rational numbers there are…',
    opts: [
      'Infinitely many rational numbers',
      'No rational numbers',
      'Exactly one rational number'
    ],
    ans: 0,
    concept: 'between'
  }
];

function renderTestQ() {
  const idx = state.test.index;
  const q = testQs[idx];
  document.getElementById('testPill').textContent =
    'Question ' + (idx + 1) + ' of ' + testQs.length;
  document.getElementById('testQ').textContent = q.q;
  document.getElementById('testFeedback').textContent = '';
  document.getElementById('testFeedback').className = 'feedback';
  document.getElementById('nextTestBtn').disabled = true;

  const optEl = document.getElementById('testOptions');
  optEl.innerHTML = '';

  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      optEl.querySelectorAll('.option')
        .forEach(o => o.classList.remove('correct', 'wrong'));
      const correct = i === q.ans;
      btn.classList.add(correct ? 'correct' : 'wrong');

      const fb = document.getElementById('testFeedback');
      if (correct) {
        fb.textContent = 'Correct!';
        fb.className = 'feedback ok';
        state.test.score++;
      } else {
        fb.textContent = 'Not correct — review this in Learn.';
        fb.className = 'feedback bad';
      }

      state.test.answered++;

      // also feed into practice concept stats
      if (!state.practice.concepts[q.concept])
        state.practice.concepts[q.concept] = { a: 0, c: 0 };
      state.practice.concepts[q.concept].a++;
      if (correct) state.practice.concepts[q.concept].c++;
      state.practice.answered++;
      if (correct) state.practice.correct++;

      document.getElementById('nextTestBtn').disabled = false;
    });
    optEl.appendChild(btn);
  });
}

document.getElementById('startTestBtn').addEventListener('click', () => {
  state.test.index = 0;
  state.test.score = 0;
  state.test.answered = 0;
  state.test.running = true;
  document.getElementById('testStatus').textContent = '';
  document.getElementById('testCard').style.display = 'block';
  renderTestQ();
});

document.getElementById('nextTestBtn').addEventListener('click', () => {
  if (state.test.index < testQs.length - 1) {
    state.test.index++;
    renderTestQ();
  } else {
    document.getElementById('testCard').style.display = 'none';
    const pct = Math.round((state.test.score / testQs.length) * 100);
    document.getElementById('testStatus').textContent =
      'Test done: ' + state.test.score + '/' + testQs.length +
      ' correct (' + pct + '%). Go to Reports to see full breakdown.';
    updateReports();
  }
});
// ─── REPORTS ─────────────────────────────────────────
const conceptNames = {
  'definition':  'Definition & identification',
  'closure':     'Closure property',
  'comm-assoc':  'Commutativity & associativity',
  'identity':    'Role of 0 & 1',
  'inverse':     'Inverse & reciprocal',
  'distributive':'Distributive property',
  'numberline':  'Number line',
  'between':     'Between two rationals'
};

function formatTime(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? m + ' min ' + s + ' sec' : s + ' sec';
}

function updateReports() {
  const elapsed = Date.now() - state.startTime;
  document.getElementById('kpiTime').textContent = formatTime(elapsed);

  const totalQ = state.practice.answered;
  const totalC = state.practice.correct;
  const acc = totalQ ? Math.round((totalC / totalQ) * 100) : 0;
  document.getElementById('kpiQ').textContent = totalQ;
  document.getElementById('kpiAcc').textContent = acc + '%';

  const tbody = document.getElementById('conceptBody');
  tbody.innerHTML = '';

  Object.keys(conceptNames).forEach(key => {
    const stat = state.practice.concepts[key] || { a: 0, c: 0 };
    const pct = stat.a ? Math.round((stat.c / stat.a) * 100) : null;
    let statusClass = 'cs cs-none';
    let statusText = 'Not attempted';
    if (pct !== null) {
      if (pct >= 80) { statusClass = 'cs cs-strong'; statusText = 'Strong'; }
      else if (pct >= 50) { statusClass = 'cs cs-practice'; statusText = 'Needs practice'; }
      else { statusClass = 'cs cs-help'; statusText = 'Needs help'; }
    }
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + conceptNames[key] + '</td>' +
      '<td>' + (pct !== null ? pct + '%' : '—') + '</td>' +
      '<td><span class="' + statusClass + '">' + statusText + '</span></td>';
    tbody.appendChild(tr);
  });

  const gl = document.getElementById('guidanceList');
  gl.innerHTML = '';
  if (!totalQ) {
    gl.innerHTML = '<li>Child has not attempted any questions yet. Start with Learn tab.</li>';
  } else if (acc >= 80) {
    gl.innerHTML =
      '<li>Child is doing well. Move them to Hard and Advanced practice levels.</li>' +
      '<li>Ask them to explain one property in their own words.</li>';
  } else if (acc >= 50) {
    gl.innerHTML =
      '<li>Ask child to re-read the Teach steps for concepts marked amber.</li>' +
      '<li>Sit with them for one practice session on Medium level.</li>';
  } else {
    gl.innerHTML =
      '<li>Go through the Teach steps together slowly.</li>' +
      '<li>Focus on Easy level only until accuracy improves above 70%.</li>';
  }
}

// ─── MODALS ──────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function showInfo(title, body) {
  document.getElementById('infoTitle').textContent = title;
  document.getElementById('infoBody').textContent = body;
  openModal('infoModal');
}

document.getElementById('openParentViewBtn')
  .addEventListener('click', () => openModal('parentModal'));

document.getElementById('closeParentBtn')
  .addEventListener('click', () => closeModal('parentModal'));

document.getElementById('openReportBtn').addEventListener('click', () => {
  closeModal('parentModal');
  document.querySelectorAll('.nav-tab')
    .forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-tab[data-target="screen-reports"]')
    .classList.add('active');
  showScreen('screen-reports');
  updateReports();
});

document.getElementById('closeInfoBtn')
  .addEventListener('click', () => closeModal('infoModal'));

document.getElementById('paymentCtaBtn').addEventListener('click', () => {
  showInfo(
    'Payment coming soon',
    'In the full Nomad Tutor App this will unlock all practice levels, voice-over teaching and detailed reports.'
  );
});

document.getElementById('downloadAppBtn').addEventListener('click', () => {
  showInfo(
    'Download SimplifyLiving',
    'In the full release this will open the Google Play page for the SimplifyLiving app.'
  );
});

document.getElementById('notifyBtn').addEventListener('click', () => {
  showInfo(
    'Notify me',
    'In the full app you can leave your WhatsApp or email here to get updates when more chapters go live.'
  );
});

// close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
});

// ─── INIT ────────────────────────────────────────────
showScreen('screen-learn');
updateTeachProgress();
