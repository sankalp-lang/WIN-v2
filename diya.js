/* ============================================================
   Diya — the Worker's WiN assistant.
   Conversational + agentic (scripted, offline). Renders an inline
   conversation surface on the worker Home, answers a trained set of
   worker questions with realistic dummy data, offers AskUserQuestion-
   style quick replies, and drives the journey with agentic actions
   (navigate screens, simulate downloads, run an in-chat grievance flow).
   ============================================================ */
(function () {
  const A = { active: false, thread: [], pending: null };
  const q = s => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  const W = () => (App.state.user || {});
  const fn = () => (W().name || 'there').split(' ')[0];

  /* ---------- rich answer helpers ---------- */
  function dcard(title, icon, rows, opts) {
    opts = opts || {};
    return `<div class="diya-card"><div class="diya-card__h">${App.icon(icon)}<span class="grow">${App.esc(title)}</span>${opts.pill ? App.ui.pill(opts.pill.t, opts.pill.k, true) : ''}</div><div class="diya-card__b">${rows.map(r => {
      if (r.big) return `<div class="dkv dkv--big"><span class="muted">${App.esc(r.k)}</span><b class="num">${App.esc(r.v)}</b></div>`;
      if (r.meter != null) return `<div style="padding:9px 0">${App.ui.meter(r.k, r.meter)}</div>`;
      if (r.ok) return `<div class="dkv"><span class="row gap-8">${App.icon('checkcircle', 'ok')} ${App.esc(r.k)}</span><span class="verified">${App.esc(r.v || 'Verified')}</span></div>`;
      return `<div class="dkv"><span class="muted">${App.esc(r.k)}</span><b>${App.esc(r.v)}</b></div>`;
    }).join('')}</div></div>`;
  }
  const p = t => `<p style="margin:0 0 4px">${t}</p>`;

  /* ============================================================
     KNOWLEDGE BASE — each returns { html, chips?, actions? }
     ============================================================ */
  const KB = {
    hello() {
      return {
        html: p(`Namaste ${App.esc(fn())} ji 🙏 — I'm <b>Diya</b>. I answer only from your <b>verified</b> WiN record. I can check your PF & ESIC, show verified income, find schemes & jobs, build your CV, or file a grievance for you.`),
        chips: [
          { label: 'Check my PF', q: 'what is my pf balance' },
          { label: 'ESIC status', q: 'my esic status' },
          { label: 'Govt schemes', q: 'which schemes am i eligible for' },
          { label: 'Find jobs', q: 'find jobs near me' },
          { label: 'File a grievance', q: 'file a grievance' },
        ],
      };
    },
    pf() {
      return {
        html: p(`Here's your live <b>EPFO</b> account, verified against your UAN.`) + dcard('EPFO · Provident Fund', 'shieldcheck', [
          { k: 'Total balance', v: '₹2,48,600', big: true },
          { k: 'UAN', v: '1002 3456 7890' },
          { k: 'Employee share', v: '₹1,29,400' },
          { k: 'Employer share', v: '₹1,19,200' },
          { k: 'Interest (FY 24-25)', v: '₹18,240 @ 8.25%' },
          { k: 'Last contribution', v: '₹4,200 · Mar 2025' },
          { k: 'Current employer', v: 'Aditya Birla Construction Ltd.' },
          { k: 'Passbook updated', v: '12 Apr 2025' },
        ], { pill: { t: 'Active', k: 'green' } }),
        actions: [
          { label: 'Download passbook', icon: 'download', kind: 'toast', arg: 'EPFO passbook (PDF) downloaded' },
          { label: 'Open my portfolio', icon: 'idcard', kind: 'nav', arg: 'worker-portfolio', navLabel: 'My Portfolio' },
        ],
        chips: [{ label: 'My ESIC status', q: 'esic status' }, { label: 'Verified income', q: 'my salary' }, { label: 'Loan I qualify for', q: 'loan eligibility' }],
      };
    },
    esic() {
      return {
        html: p(`Your <b>ESIC</b> health cover is active — you and 3 family members are covered.`) + dcard('ESIC · Health Insurance', 'shield', [
          { k: 'IP number', v: '31 00 123456 789' },
          { k: 'Status', v: 'Active · valid till 31 Dec 2025' },
          { k: 'Dispensary', v: 'ESIC Rajokri, Delhi' },
          { k: 'Family covered', v: '4 members' },
          { k: 'Last claim', v: '₹8,400 · reimbursed 18 Mar 2025' },
        ], { pill: { t: 'Active', k: 'green' } }),
        actions: [
          { label: 'Renew ESIC', icon: 'checkcircle', kind: 'toast', arg: 'ESIC renewal request submitted (req #10390)' },
          { label: 'Find ESIC hospital', icon: 'mappin', kind: 'toast', arg: '4 empanelled hospitals found near Delhi NCR' },
        ],
        chips: [{ label: 'Check my PF', q: 'pf balance' }, { label: 'Govt schemes', q: 'schemes' }, { label: 'File a claim issue', q: 'file a grievance' }],
      };
    },
    income() {
      return {
        html: p(`Your income is <b>verified at source</b> (EPFO + bank), so lenders and schemes can trust it.`) + dcard('Verified income', 'trend', [
          { k: 'Net monthly', v: '₹31,200', big: true },
          { k: 'Gross monthly', v: '₹32,000' },
          { k: 'Annual', v: '₹3,84,000' },
          { k: 'Employer', v: 'Aditya Birla Construction Ltd.' },
          { k: 'Tenure', v: '2 yrs 10 mo · since Jun 2022' },
          { k: 'Last credited', v: '₹31,200 · 02 Apr 2025' },
        ]),
        actions: [
          { label: 'Download income certificate', icon: 'download', kind: 'toast', arg: 'Verified income certificate (PDF) downloaded' },
          { label: 'Loan I qualify for', icon: 'bolt', kind: 'ask', arg: 'loan eligibility' },
        ],
        chips: [{ label: 'My PF balance', q: 'pf' }, { label: 'Find jobs paying more', q: 'find jobs' }],
      };
    },
    loan() {
      return {
        html: p(`Because your income and employment are verified, you pre-qualify without paperwork.`) + dcard('Credit readiness', 'bolt', [
          { k: 'Pre-qualified up to', v: '₹1,80,000', big: true },
          { k: 'WiN verification score', v: '100 / 100' },
          { k: 'Verified income', v: '₹32,000 / month' },
          { k: 'Lenders ready', v: '3 (SBI, Bajaj, KreditBee)' },
          { k: 'Indicative rate', v: '14–18% p.a.' },
        ], { pill: { t: 'Eligible', k: 'green' } }),
        actions: [
          { label: 'See lender offers', icon: 'external', kind: 'toast', arg: '3 pre-approved offers loaded' },
          { label: 'Share verified profile', icon: 'share', kind: 'nav', arg: 'public-portfolio', navLabel: 'Public profile' },
        ],
        chips: [{ label: 'My income', q: 'income' }, { label: 'Govt schemes', q: 'schemes' }],
      };
    },
    schemes() {
      return {
        html: p(`Based on your verified profile (construction worker, ${App.esc(W().winId)}), you're eligible for <b>4 schemes</b>. Which one should I open?`),
        chips: [
          { label: 'PM-SHRI Upskilling', q: 'pm-shri scheme' },
          { label: 'PMSBY insurance', q: 'pmsby scheme' },
          { label: 'Ayushman Bharat', q: 'ayushman bharat scheme' },
          { label: 'e-Shram card', q: 'e-shram card' },
        ],
      };
    },
    scheme(id) {
      const S = {
        pmshri: { t: 'PM-SHRI Upskilling Programme', b: 'Free skill certification for construction & allied trades.', rows: [{ k: 'Benefit', v: '₹3,000 stipend + NSQF certificate' }, { k: 'Eligibility', v: 'Verified worker, e-Shram registered ✓' }, { k: 'Apply via', v: 'e-Shram portal' }] },
        pmsby: { t: 'PMSBY — Accident Insurance', b: 'Accidental death & disability cover at near-zero premium.', rows: [{ k: 'Cover', v: '₹2,00,000' }, { k: 'Premium', v: '₹20 / year' }, { k: 'Eligibility', v: 'Bank-linked, age 18–70 ✓' }] },
        ayushman: { t: 'Ayushman Bharat (PM-JAY)', b: 'Cashless secondary & tertiary hospital care.', rows: [{ k: 'Cover', v: '₹5,00,000 / family / year' }, { k: 'Family', v: '4 members' }, { k: 'Eligibility', v: 'Auto-qualified via e-Shram ✓' }] },
        eshram: { t: 'e-Shram card', b: 'Your national unorganised-worker ID — the key to most schemes.', rows: [{ k: 'Status', v: 'Registered ✓' }, { k: 'UAN', v: 'e-Shram 12 3456 7890' }, { k: 'Linked benefits', v: 'PMSBY, PM-JAY, PM-SHRI' }] },
      };
      const s = S[id] || S.pmshri;
      return {
        html: p(s.b) + dcard(s.t, 'award', s.rows, { pill: { t: 'Eligible', k: 'green' } }),
        actions: [
          { label: 'Apply now', icon: 'checkcircle', kind: 'toast', arg: 'Application started for ' + s.t },
          { label: 'Check another scheme', icon: 'layers', kind: 'ask', arg: 'schemes' },
        ],
        chips: [{ label: 'Am I eligible for more?', q: 'schemes' }, { label: 'Find jobs', q: 'jobs' }],
      };
    },
    jobs() {
      const jobrow = (t, e, pay, m) => `<div class="djob"><div class="grow"><b>${App.esc(t)}</b><div class="muted" style="font-size:12px">${App.esc(e)}</div></div><div style="text-align:right"><div class="num" style="font-weight:600">${App.esc(pay)}</div><div class="num" style="font-size:11.5px;color:var(--green-700)">${m}% match</div></div></div>`;
      return {
        html: p(`You have <b>6 verified matches</b> near Delhi NCR, ranked by fit to your skills.`) + `<div class="diya-card"><div class="diya-card__b" style="padding:6px 14px">${jobrow('Mason — Senior', 'Aditya Birla Construction · Gurugram', '₹22,000/mo', 96)}${jobrow('Site Supervisor', 'L&T Construction · Delhi NCR', '₹28,000/mo', 88)}${jobrow('Shuttering Carpenter', 'Shapoorji Pallonji · Noida', '₹20,000/mo', 84)}</div></div>`,
        actions: [
          { label: 'See all 6 jobs', icon: 'briefcase', kind: 'nav', arg: 'worker-jobs', navLabel: 'Jobs', primary: true },
          { label: 'Apply to top match', icon: 'checkcircle', kind: 'toast', arg: 'Applied to Mason — Senior at Aditya Birla Construction' },
        ],
        chips: [{ label: 'Jobs paying more', q: 'higher paying jobs' }, { label: 'Improve my skills', q: 'courses' }],
      };
    },
    cv() {
      return {
        html: p(`Your CV is <b>auto-built from your verified record</b> — no typing needed. It already includes 2 verified employers, income band, and 6 skills.`),
        actions: [
          { label: 'Open CV Builder', icon: 'doc', kind: 'nav', arg: 'worker-cv', navLabel: 'CV Builder', primary: true },
          { label: 'Download CV (PDF)', icon: 'download', kind: 'toast', arg: 'Verified CV (PDF) downloaded' },
        ],
        chips: [{ label: 'Find jobs', q: 'jobs' }, { label: 'Add a skill', q: 'courses' }],
      };
    },
    courses() {
      const row = (t, s) => `<div class="dkv"><span>${App.esc(t)}</span><span class="muted" style="font-size:12px">${App.esc(s)}</span></div>`;
      return {
        html: p(`3 courses would move you toward higher-paying roles:`) + `<div class="diya-card"><div class="diya-card__b">${row('Structural Repair (NSQF-4)', '6 weeks · free')}${row('Advanced Masonry & Finishing', '4 weeks · ₹3k stipend')}${row('Site Safety & OSHA basics', '2 weeks · certificate')}</div></div>`,
        actions: [
          { label: 'Browse all courses', icon: 'graduation', kind: 'nav', arg: 'worker-courses', navLabel: 'Courses', primary: true },
          { label: 'Enroll in top pick', icon: 'checkcircle', kind: 'toast', arg: 'Enrolled in Structural Repair (NSQF-4)' },
        ],
        chips: [{ label: 'Find jobs', q: 'jobs' }, { label: 'Govt schemes', q: 'schemes' }],
      };
    },
    verify() {
      return {
        html: p(`Your WiN identity is <b>100% verified</b> — every source checks out.`) + dcard('Verification · golden record', 'fingerprint', [
          { k: 'EPFO / UAN', v: 'Verified · 12 Apr 2025', ok: true },
          { k: 'Income-Tax Dept', v: 'Verified', ok: true },
          { k: 'ESIC', v: 'Verified', ok: true },
          { k: 'DigiLocker (3 docs)', v: 'Verified', ok: true },
        ], { pill: { t: '100%', k: 'green' } }),
        actions: [
          { label: 'Open portfolio', icon: 'idcard', kind: 'nav', arg: 'worker-portfolio', navLabel: 'My Portfolio' },
          { label: 'Share verified profile', icon: 'share', kind: 'nav', arg: 'public-portfolio', navLabel: 'Public profile' },
        ],
        chips: [{ label: 'My PF', q: 'pf' }, { label: 'My ESIC', q: 'esic' }],
      };
    },
    portfolio() {
      return {
        html: p(`Here's your verified snapshot.`) + dcard(W().name || 'Worker', 'idcard', [
          { k: 'WiN ID', v: W().winId || 'WIN-2024-8834-1029' },
          { k: 'Role', v: 'Masonry Expert · Delhi NCR' },
          { k: 'Verified employers', v: '2' },
          { k: 'Verified income', v: '₹32,000 / month' },
          { k: 'Skills on record', v: '6' },
        ], { pill: { t: 'Verified', k: 'green' } }),
        actions: [
          { label: 'Open full portfolio', icon: 'idcard', kind: 'nav', arg: 'worker-portfolio', navLabel: 'My Portfolio', primary: true },
          { label: 'Share profile', icon: 'share', kind: 'nav', arg: 'public-portfolio', navLabel: 'Public profile' },
        ],
        chips: [{ label: 'Find jobs', q: 'jobs' }, { label: 'My CV', q: 'cv' }],
      };
    },
    grievanceStart() {
      A.pending = { flow: 'grv', step: 'cat' };
      return {
        html: p(`I can file a grievance and route it to the right ministry automatically, linked to ${App.esc(W().winId)}. <b>What is it about?</b>`),
        chips: [
          { pick: 'EPFO / Provident Fund', label: 'EPFO / PF' },
          { pick: 'ESIC / Health Insurance', label: 'ESIC' },
          { pick: 'E-Shram / Card Issue', label: 'E-Shram' },
          { pick: 'Salary / Wage Dispute', label: 'Salary / Wage' },
          { pick: 'Work Site Safety', label: 'Work safety' },
          { pick: 'Other', label: 'Other' },
        ],
      };
    },
    fallback() {
      return {
        html: p(`I can help with your <b>PF, ESIC, income, schemes, jobs, CV</b>, and <b>grievances</b> — all from your verified record. Try one of these:`),
        chips: [
          { label: 'Check my PF', q: 'pf balance' },
          { label: 'ESIC status', q: 'esic' },
          { label: 'Govt schemes', q: 'schemes' },
          { label: 'Find jobs', q: 'jobs' },
          { label: 'File a grievance', q: 'file a grievance' },
        ],
      };
    },
  };

  /* ---------- intent routing ---------- */
  function route(text) {
    const s = ' ' + text.toLowerCase().trim() + ' ';
    const has = (...w) => w.some(x => s.includes(x));
    if (has('pm-shri', 'pmshri', 'shri')) return KB.scheme('pmshri');
    if (has('pmsby', 'accident insur')) return KB.scheme('pmsby');
    if (has('ayushman', 'pm-jay', 'pmjay', 'health scheme')) return KB.scheme('ayushman');
    if (has('e-shram', 'eshram', 'e shram')) return KB.scheme('eshram');
    if (has('loan', 'credit', 'borrow', 'emi')) return KB.loan();
    if (has('pf ', 'provident', 'epfo', 'pension', 'passbook', 'uan')) return KB.pf();
    if (has('esic', 'health', 'insur', 'medical', 'hospital')) return KB.esic();
    if (has('salary', 'income', 'wage', 'earn', 'pay ', 'ctc')) return KB.income();
    if (has('scheme', 'benefit', 'eligib', 'yojana', 'subsidy', 'stipend')) return KB.schemes();
    if (has('job', 'vacanc', 'hiring', 'work near', 'gig', 'higher paying', 'paying more')) return KB.jobs();
    if (has('cv', 'resume', 'curriculum')) return KB.cv();
    if (has('course', 'skill', 'learn', 'upskill', 'train', 'certificat')) return KB.courses();
    if (has('grievance', 'complaint', 'dispute', 'file a', 'raise a', 'not paid', 'problem with')) return KB.grievanceStart();
    if (has('verif', 'golden record', 'my identity', 'is my profile')) return KB.verify();
    if (has('portfolio', 'profile', 'my record', 'work history', 'experience')) return KB.portfolio();
    if (has('hi ', 'hello', 'namaste', 'hey ', ' help', 'what can you', 'who are you')) return KB.hello();
    return KB.fallback();
  }

  /* ---------- grievance flow ---------- */
  const MINISTRY = {
    'EPFO / Provident Fund': 'EPFO, Ministry of Labour & Employment',
    'ESIC / Health Insurance': 'ESIC Corporation',
    'E-Shram / Card Issue': 'Ministry of Labour & Employment (e-Shram)',
    'Salary / Wage Dispute': 'Office of the Labour Commissioner',
    'Work Site Safety': 'Directorate of Industrial Safety & Health',
    'Other': 'Ministry of Labour & Employment',
  };
  function pendingPick(val) {
    const pd = A.pending; if (!pd) return;
    if (pd.step === 'cat') {
      pd.cat = val; pd.step = 'desc'; pd.await = 'text';
      A.push({ role: 'diya', html: p(`Got it — <b>${App.esc(val)}</b>. Briefly describe the issue (include dates, amounts, or reference numbers if you can).`) });
      A.renderThread();
    } else if (pd.step === 'confirm') {
      if (val === 'confirm') {
        const id = 'GRV-46' + Math.floor(10 + Math.random() * 89);
        const min = MINISTRY[pd.cat] || MINISTRY.Other;
        A.pending = null;
        A.push({
          role: 'diya',
          html: p(`Done ✓ Your grievance is filed and routed automatically.`) + dcard('Grievance filed', 'checkcircle', [
            { k: 'Reference', v: id }, { k: 'Category', v: pd.cat }, { k: 'Status', v: 'Submitted' },
            { k: 'Routed to', v: min }, { k: 'Expected response', v: '3–5 working days' },
          ], { pill: { t: 'Submitted', k: 'amber' } }),
          actions: [{ label: 'Track this grievance', icon: 'message', kind: 'nav', arg: 'worker-grievance', navLabel: 'Grievances', primary: true }],
          chips: [{ label: 'Anything else?', q: 'help' }],
        });
        App.toast('Grievance ' + id + ' filed');
        A.renderThread();
      } else {
        A.pending = null;
        A.push({ role: 'diya', html: p(`No problem — I've cancelled that. Anything else?`), chips: [{ label: 'Check my PF', q: 'pf' }, { label: 'Find jobs', q: 'jobs' }] });
        A.renderThread();
      }
    }
  }
  function pendingText(text) {
    const pd = A.pending; if (!pd) return;
    if (pd.step === 'desc') {
      pd.desc = text; pd.step = 'confirm'; pd.await = null;
      A.push({
        role: 'diya',
        html: p(`Ready to file — please confirm:`) + dcard('Review', 'file', [
          { k: 'Category', v: pd.cat }, { k: 'Your issue', v: text }, { k: 'Filed as', v: W().winId || 'WIN-2024-8834-1029' },
        ]),
        chips: [{ pick: 'confirm', label: 'Confirm & submit' }, { pick: 'cancel', label: 'Cancel' }],
      });
      A.renderThread();
    }
  }

  /* ============================================================ engine ============================================================ */
  A.push = m => A.thread.push(m);

  A.onHome = () => App.state.route === 'worker-home';
  function goHomeThen(cb) {
    if (!A.onHome()) App.navigate('worker-home'); else App.reload();
    setTimeout(cb, 45);
  }

  A.open = function (seed) {
    if (App.state.persona !== 'worker') { App.assistant.toggle(true); return; }
    A.active = true;
    if (!A.thread.length) A.push(Object.assign({ role: 'diya' }, KB.hello()));
    goHomeThen(() => { A.renderThread(); if (seed) A.ask(seed); });
  };

  A.ask = function (text) {
    text = (text || '').trim(); if (!text) return;
    const wasActive = A.active; A.active = true;
    A.push({ role: 'user', text });
    if (A.pending && A.pending.await === 'text') {
      if (!wasActive || !A.onHome()) goHomeThen(() => { A.renderThread(); pendingText(text); });
      else { A.renderThread(); pendingText(text); }
      return;
    }
    A.push({ role: 'diya', typing: true });
    const respond = () => {
      A.renderThread();
      setTimeout(() => {
        A.thread = A.thread.filter(m => !m.typing);
        A.push(Object.assign({ role: 'diya' }, route(text)));
        A.renderThread();
      }, 720);
    };
    if (!wasActive || !A.onHome()) goHomeThen(respond); else respond();
  };

  A.pick = function (val, label) {
    A.push({ role: 'user', text: label || val });
    A.renderThread();
    setTimeout(() => pendingPick(val), 260);
  };

  A.act = function (kind, arg, label) {
    if (kind === 'toast') { App.toast(arg); }
    else if (kind === 'ask') { A.ask(arg); }
    else if (kind === 'nav') {
      A.push({ role: 'diya', html: `<div class="diya-note">${App.icon('arrow')} Opening ${App.esc(label)}…</div>` });
      A.renderThread();
      setTimeout(() => App.navigate(arg), 620);
    }
  };

  A.sendInput = function () {
    const el = document.getElementById('diyaInput'); if (!el) return;
    const v = el.value; el.value = ''; A.ask(v);
  };
  A.reset = function () { A.active = false; A.thread = []; A.pending = null; App.reload(); };
  A.newChat = function () { A.thread = []; A.pending = null; A.push(Object.assign({ role: 'diya' }, KB.hello())); A.renderThread(); };

  /* ---------- rendering ---------- */
  A.surface = function () {
    return `<div class="page"><div class="diya fade-in">
      <div class="diya__head">
        <div class="diya__av">${App.icon('sparkles')}</div>
        <div class="grow"><div class="row gap-8"><b style="font-size:17px">Diya</b>${App.ui.pill('WiN Assistant', 'accent')}</div><div class="muted" style="font-size:12px">Answers from your verified record · <span class="mono">${App.esc(W().winId || '')}</span></div></div>
        <button class="btn btn--sm" onclick="App.diya.newChat()">${App.icon('plus')} New chat</button>
        <button class="btn btn--sm btn--ghost" onclick="App.diya.reset()">${App.icon('home')} Home</button>
      </div>
      <div class="diya__thread" id="diyaThread"></div>
      <div class="diya__foot">
        <div class="chat-inputwrap">
          <textarea id="diyaInput" rows="1" placeholder="Ask Diya…  e.g. what's my PF balance?" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();App.diya.sendInput();}"></textarea>
          <button class="chat-send" onclick="App.diya.sendInput()">${App.icon('send')}</button>
        </div>
        <div class="diya__hint muted">Diya is a demo assistant — answers use your sample verified data.</div>
      </div>
    </div></div>`;
  };

  A.renderThread = function () {
    const t = document.getElementById('diyaThread'); if (!t) return;
    t.innerHTML = A.thread.map(m => {
      if (m.role === 'user') return `<div class="dmsg dmsg--user"><div class="dmsg__body"><div class="dmsg__bub">${App.esc(m.text)}</div></div></div>`;
      if (m.typing) return `<div class="dmsg"><div class="dmsg__av">${App.icon('sparkles')}</div><div class="dmsg__body"><div class="dmsg__bub"><div class="typing"><span></span><span></span><span></span></div></div></div></div>`;
      const actions = (m.actions && m.actions.length) ? `<div class="diya-actions">${m.actions.map(a => `<button class="btn btn--sm ${a.primary ? 'btn--accent' : ''}" onclick="App.diya.act('${q(a.kind)}','${q(a.arg)}','${q(a.navLabel || a.label)}')">${a.icon ? App.icon(a.icon) : ''} ${App.esc(a.label)}</button>`).join('')}</div>` : '';
      const chips = (m.chips && m.chips.length) ? `<div class="diya-chips">${m.chips.map(c => c.pick !== undefined
        ? `<button class="diya-opt" onclick="App.diya.pick('${q(c.pick)}','${q(c.label)}')">${App.esc(c.label)}</button>`
        : `<button class="chip" onclick="App.diya.ask('${q(c.q)}')">${App.esc(c.label)}</button>`).join('')}</div>` : '';
      return `<div class="dmsg"><div class="dmsg__av">${App.icon('sparkles')}</div><div class="dmsg__body"><div class="dmsg__bub">${m.html}</div>${actions}${chips}</div></div>`;
    }).join('');
    t.scrollTop = t.scrollHeight;
    const c = document.getElementById('content'); if (c) c.scrollTop = c.scrollHeight;
  };

  App.diya = A;
})();
