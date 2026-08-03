/* Worker · Grievance Hub — editorial hero, clickable stat filters, a live
   ministry-routing tracker, activity log, a filterable/expandable grievance
   history, and a REAL multi-step "File new grievance" flow
   (category → subject → description → review → submitted w/ new GRV id).
   v2 editorial standard — mirrors the worker-home.js gold standard. */
(function () {
  const base = [
    { id: 'GRV-4521', subject: 'ESIC Renewal Delay',          cat: 'ESIC',     date: '2025-03-18', status: 'Resolved',    res: 'Renewal processed and benefits activated until Dec 2025.' },
    { id: 'GRV-4498', subject: 'EPFO Withdrawal Pending',     cat: 'EPFO',     date: '2025-03-12', status: 'In Progress', res: '' },
    { id: 'GRV-4509', subject: 'ESIC Claim Reimbursement',    cat: 'ESIC',     date: '2025-03-22', status: 'In Progress', res: '' },
    { id: 'GRV-4476', subject: 'Salary Discrepancy — Feb',    cat: 'Employer', date: '2025-02-28', status: 'Resolved',    res: 'Employer corrected salary and paid the difference of Rs. 3,200.' },
    { id: 'GRV-4451', subject: 'E-Shram Card Update Request', cat: 'E-Shram',  date: '2025-02-15', status: 'Resolved',    res: 'Card details updated with new address and phone number.' },
    { id: 'GRV-4430', subject: 'Delayed PF Transfer',         cat: 'EPFO',     date: '2025-01-22', status: 'Resolved',    res: 'PF transferred from previous employer UAN to current account.' },
    { id: 'GRV-4412', subject: 'Work Site Safety Concern',    cat: 'Employer', date: '2025-01-10', status: 'Resolved',    res: 'Safety inspection conducted, employer issued compliance notice.' },
  ];

  const CATS = [
    { k: 'EPFO / Provident Fund',    ic: 'landmark',    tag: 'EPFO' },
    { k: 'ESIC / Health Insurance',  ic: 'shieldcheck', tag: 'ESIC' },
    { k: 'E-Shram / Card Issues',    ic: 'idcard',      tag: 'E-Shram' },
    { k: 'Salary / Wage Dispute',    ic: 'briefcase',   tag: 'Salary' },
    { k: 'Work Site Safety',         ic: 'alert',       tag: 'Safety' },
    { k: 'Employer Misconduct',      ic: 'building',    tag: 'Employer' },
    { k: 'Benefits / Claims',        ic: 'award',       tag: 'Benefits' },
    { k: 'Other',                    ic: 'doc',         tag: 'Other' },
  ];
  const PRIOS = [['Normal', '#2f5fd0'], ['High', '#c07d10'], ['Urgent', '#d64545']];
  const STEPS = ['Category', 'Subject', 'Details', 'Review'];

  const WG = {
    filter: 'all',
    expanded: 'GRV-4521',
    added: [],   // grievances filed this session
    step: 0,
    draft: { catIx: -1, subject: '', description: '', priority: 'Normal' },
    cats: CATS,

    setFilter(f) { WG.filter = f; App.reload(); },
    toggleRow(id) { WG.expanded = WG.expanded === id ? null : id; App.reload(); },
    askDiya(q) { App.assistant.toggle(true); if (q) App.assistant.ask(q); },

    /* ---------- multi-step file-new-grievance modal ---------- */
    openNew() {
      WG.step = 0;
      WG.draft = { catIx: -1, subject: '', description: '', priority: 'Normal' };
      WG.renderModal();
    },
    setCategory(ix) {
      WG.draft.catIx = ix;
      App.otpGate('filing this grievance', () => { WG.step = 1; WG.renderModal(); });
    },
    setPriority(p) { WG._capture(); WG.draft.priority = p; WG.renderModal(); },
    next() { WG._capture(); if (!WG._stepValid()) return; WG.step = Math.min(3, WG.step + 1); WG.renderModal(); },
    back() { WG._capture(); WG.step = Math.max(0, WG.step - 1); WG.renderModal(); },
    _capture() {
      const s = document.getElementById('grvSubject');
      const d = document.getElementById('grvDesc');
      if (s) WG.draft.subject = s.value;
      if (d) WG.draft.description = d.value;
    },
    _stepValid() {
      const d = WG.draft;
      if (WG.step === 0) return d.catIx > -1;
      if (WG.step === 1) return !!d.subject.trim();
      if (WG.step === 2) return !!d.description.trim();
      return true;
    },
    stepInput() {
      WG._capture();
      const b = document.getElementById('grvNext');
      if (b) b.disabled = !WG._stepValid();
    },
    _stepBar() {
      return `<div class="wg-steps">${STEPS.map((s, i) => {
        const st = i < WG.step ? 'done' : (i === WG.step ? 'now' : '');
        return `<div class="wg-step ${st}"><span class="wg-stepno">${i < WG.step ? App.icon('check') : (i + 1)}</span><span class="wg-steplbl">${s}</span></div>`;
      }).join('')}</div>`;
    },
    renderModal() {
      const d = WG.draft;
      let body = '', foot = '';

      if (WG.step === 0) {
        const cats = WG.cats.map((c, i) => `
          <button class="wg-cat ${d.catIx === i ? 'is-sel' : ''}" onclick="WorkerGrievance.setCategory(${i})">
            ${App.icon(c.ic)}<span>${App.esc(c.k)}</span>
          </button>`).join('');
        body = `
          ${WG._stepBar()}
          <div class="banner banner--info" style="margin-bottom:18px">
            ${App.icon('shieldcheck')}
            <div>Your grievance will be linked to your WIN ID <b class="mono">${App.esc(App.currentUser().winId)}</b> and routed to the relevant ministry automatically.</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label">What is your grievance about?</label>
            <div class="wg-catgrid">${cats}</div>
          </div>`;
        foot = `<span class="faint" style="font-size:12px;margin-right:auto">Select a category to continue</span>
          <button class="btn" onclick="App.modal.close()">Cancel</button>`;

      } else if (WG.step === 1) {
        body = `
          ${WG._stepBar()}
          <div class="wg-picked">${App.icon(WG.cats[d.catIx].ic)} ${App.esc(WG.cats[d.catIx].k)}</div>
          <div class="field" style="margin-bottom:0">
            <label class="label">Subject</label>
            <input class="input" id="grvSubject" value="${App.esc(d.subject)}" placeholder="Brief description of your issue"
              oninput="WorkerGrievance.stepInput()"
              onkeydown="if(event.key==='Enter'){event.preventDefault();WorkerGrievance.next();}">
            <div class="hint">A short, clear title — e.g. “PF withdrawal not credited”.</div>
          </div>`;
        foot = `<button class="btn" onclick="WorkerGrievance.back()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--primary" id="grvNext" ${d.subject.trim() ? '' : 'disabled'} onclick="WorkerGrievance.next()">Continue ${App.icon('arrow')}</button>`;

      } else if (WG.step === 2) {
        const prios = PRIOS.map(([p, col]) => {
          const on = d.priority === p;
          return `<button onclick="WorkerGrievance.setPriority('${p}')" style="${on ? `background:${col};border-color:transparent;color:#fff` : ''}">${p}</button>`;
        }).join('');
        body = `
          ${WG._stepBar()}
          <div class="wg-picked">${App.icon(WG.cats[d.catIx].ic)} ${App.esc(WG.cats[d.catIx].k)} · <b>${App.esc(d.subject)}</b></div>
          <div class="field">
            <label class="label">Description</label>
            <textarea class="textarea" id="grvDesc" style="min-height:120px" placeholder="Provide details about your grievance including dates, amounts, reference numbers, etc."
              oninput="WorkerGrievance.stepInput()">${App.esc(d.description)}</textarea>
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label">Priority</label>
            <div class="wg-prio">${prios}</div>
          </div>`;
        foot = `<button class="btn" onclick="WorkerGrievance.back()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--primary" id="grvNext" ${d.description.trim() ? '' : 'disabled'} onclick="WorkerGrievance.next()">Review ${App.icon('arrow')}</button>`;

      } else { // step 3 — review
        const pcol = (PRIOS.find(p => p[0] === d.priority) || [])[1] || '#2f5fd0';
        const line = (lbl, val) => `<div class="wg-rev"><span class="wg-revk">${lbl}</span><span class="wg-revv">${val}</span></div>`;
        body = `
          ${WG._stepBar()}
          <div class="wg-reviewcard">
            ${line('WIN ID', `<span class="mono">${App.esc(App.currentUser().winId)}</span>`)}
            ${line('Category', `${App.esc(WG.cats[d.catIx].k)}`)}
            ${line('Subject', `<b>${App.esc(d.subject)}</b>`)}
            ${line('Description', `<span style="color:var(--ink-2)">${App.esc(d.description)}</span>`)}
            ${line('Priority', `<span class="pill pill--dot" style="background:${pcol}1a;color:${pcol}">${App.esc(d.priority)}</span>`)}
          </div>
          <div class="banner banner--green" style="margin:16px 0 0">${App.icon('shieldcheck')}<div>On submit, this grievance is logged against your WIN ID and auto-routed to the ${App.esc(WG.cats[d.catIx].tag)} desk. Expected first response: <b>3–5 working days</b>.</div></div>`;
        foot = `<button class="btn" onclick="WorkerGrievance.back()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--primary" onclick="WorkerGrievance.submit()">${App.icon('send')} Confirm &amp; Submit</button>`;
      }

      App.modal.open(body, { title: 'File New Grievance', icon: 'message', foot });
    },
    submit() {
      WG._capture();
      const d = WG.draft;
      if (!(d.catIx > -1 && d.subject.trim() && d.description.trim())) {
        App.toast('Complete category, subject and description', 'alert'); return;
      }
      WorkerGrievance._doSubmit();
    },
    _doSubmit() {
      const d = WG.draft;
      const id = 'GRV-' + (4550 + Math.floor(Math.random() * 449));
      const cat = WG.cats[d.catIx].tag;
      const today = new Date().toISOString().slice(0, 10);
      WG.added.unshift({ id, subject: d.subject.trim(), cat, date: today, status: 'In Progress', res: '', fresh: true });

      App.modal.open(`
        <div class="wg-success">
          <div class="wg-bigico">${App.icon('checkcircle')}</div>
          <h3>Grievance Submitted</h3>
          <p class="muted">Your case ID is <b class="mono num" style="color:var(--ink)">${App.esc(id)}</b></p>
          <div class="row center gap-8 mt-12">
            ${App.ui.pill(cat, 'accent')}${App.ui.statusPill('In Progress')}
          </div>
          <p class="muted" style="font-size:12.5px;max-width:36ch;margin:14px auto 0">You'll receive updates via the Grievance Hub and notifications. Redirecting…</p>
        </div>`, {});

      setTimeout(() => {
        App.modal.close();
        WG.filter = 'all';
        WG.expanded = null;
        App.toast('Grievance filed · ' + id);
        App.reload();
      }, 2300);
    },

    /* ---------- activity log ---------- */
    activity() {
      return [
        { t: '3:20 PM', x: 'WIN ID logged: WIN123456789',              c: 'var(--blue-600)' },
        { t: '3:40 PM', x: 'Routed to ESIC Ministry',                  c: 'var(--blue-600)' },
        { t: '5:00 PM', x: 'Case Escalated for Priority Processing',   c: 'var(--amber-600)' },
        { t: '9:15 PM', x: 'Case Resolved: Benefit Info Sent',         c: 'var(--green-600)' },
      ];
    },
    viewAllActivity() {
      const rows = WG.activity().map(a => `
        <div class="wg-act">
          <span class="wg-actdot" style="background:${a.c}"></span>
          <div class="grow"><div style="font-size:13.5px;color:var(--ink)">${App.esc(a.x)}</div></div>
          <span class="faint mono" style="font-size:11.5px;white-space:nowrap">${App.esc(a.t)}</span>
        </div>`).join('');
      App.modal.open(`<div class="row between" style="margin-bottom:8px"><b style="font-size:13px">Case GRV-4521 · ESIC Renewal Delay</b>${App.ui.statusPill('Resolved')}</div>${rows}`, { title: 'Full activity log', icon: 'clock' });
    },
  };
  window.WorkerGrievance = WG;

  App.registerView('worker-grievance', {
    title: 'Grievance Hub',
    subtitle: 'Track resolutions and manage your grievances',
    render(ctx) {
      const u = ctx.user;
      const fresh = !!(u && u._fresh);
      // a freshly signed-up worker has no grievance history yet — only what they
      // file this session counts, not the seeded demo history.
      const rows = fresh ? WG.added : WG.added.concat(base);
      const openN = fresh ? rows.filter(r => r.status === 'In Progress').length : 2 + WG.added.length;
      const resolvedN = fresh ? rows.filter(r => r.status === 'Resolved').length : 14;
      const totalN = fresh ? rows.length : 16 + WG.added.length;

      const counts = {
        all: rows.length,
        'In Progress': rows.filter(r => r.status === 'In Progress').length,
        Resolved: rows.filter(r => r.status === 'Resolved').length,
      };
      const filtered = rows.filter(r => WG.filter === 'all' || r.status === WG.filter);

      /* ---- editorial hero ---- */
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('message')} Grievance redressal</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">Every grievance, tracked to resolution.</h1>
                <p class="lead">File a complaint once — WiN routes it to the right ministry against your verified identity and follows it through to closure.</p>
                <div class="row gap-12 mt-16 wrap">
                  <span class="mono" style="font-size:12.5px;color:var(--muted)">WiN ID · ${App.esc(u.winId)}</span>
                  ${App.ui.verified('Identity verified')}
                  <span class="pill pill--amber pill--dot"><span class="num">${openN}</span> open</span>
                  <span class="pill pill--green pill--dot"><span class="num">${resolvedN}</span> resolved</span>
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="WorkerGrievance.askDiya('How do I track the status of my grievances?')">${App.icon('sparkles')} Ask Diya</button>
                <button class="btn btn--accent" onclick="WorkerGrievance.openNew()">${App.icon('plus')} File New Grievance</button>
              </div>
            </div>
          </div>
        </div>`;

      /* ---- summary stats (Open / Resolved / Total are clickable filters) ---- */
      const statCard = (ic, col, label, val, sub, filterTo) => {
        const active = filterTo && WG.filter === filterTo;
        const inner = `
          <div class="kpi__top"><div class="kpi__label">${label}</div><div class="kpi__icon" style="background:${col}1a;color:${col}">${App.icon(ic)}</div></div>
          <div class="kpi__val num">${val}</div>
          <div class="kpi__sub muted">${filterTo ? App.icon('filter') : App.icon('trend')} ${sub}</div>`;
        if (!filterTo) return `<div class="kpi">${inner}</div>`;
        return `<button class="kpi card--hover" style="text-align:left;width:100%;cursor:pointer${active ? ';border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-ring)' : ''}"
          onclick="WorkerGrievance.setFilter('${filterTo}')" title="Filter to ${App.esc(label)}">${inner}</button>`;
      };
      const stats = `
        <div class="grid grid-4 reveal" style="margin-bottom:22px">
          ${statCard('alert', '#c07d10', 'Open Cases', openN, 'View open', 'In Progress')}
          ${statCard('checkcircle', '#0e9f6e', 'Resolved', resolvedN, 'View resolved', 'Resolved')}
          ${statCard('clock', '#2f5fd0', 'Avg. Resolution', '6h', 'Faster than SLA', null)}
          ${statCard('file', '#667085', 'Total Filed', totalN, 'View all', 'all')}
        </div>`;

      /* ---- live resolution tracker ---- */
      const arrow = `<span style="color:var(--faint);display:inline-flex">${App.icon('chevron')}</span>`;
      const mchip = (badge, col, label) => `<span class="wg-mchip"><span class="wg-mbadge" style="background:${col}">${badge}</span>${label}</span>`;
      const steps = [
        { t: 'Logged (WIN ID)',                         d: 'Construction Project' },
        { t: 'Routed to Ministry',                      d: 'e.g. EPFO / ESIC' },
        { t: 'In Progress',                             d: '' },
        { t: 'Checked for Priority Processing',         d: '' },
        { t: 'Case Escalated for Priority Processing',  d: '' },
        { t: 'Case Resolved: Benefit Info Sent',        d: '' },
      ];
      const openRows = rows.filter(r => r.status === 'In Progress');
      // progress for a given open case, deterministic by position (older cases further along)
      const caseProgress = (row) => {
        if (row.status !== 'In Progress') return { doneSteps: steps.length, pct: 100 };
        const i = openRows.indexOf(row);
        const doneSteps = Math.max(2, steps.length - 1 - i);
        return { doneSteps, pct: Math.round((doneSteps / steps.length) * 100) };
      };
      WG._trackerSteps = steps;
      WG._trackerRows = () => (fresh ? WG.added : WG.added.concat(base));
      const trackerCard = (row, doneSteps, pct, barCol) => `
        <div class="card__head">
          <h3 class="grow">Live Resolution Tracker</h3>
          <span class="pill pill--gray mono">${App.esc(row.id)}</span>
          ${App.ui.statusPill(row.status)}
        </div>
        <div class="card__body">
          <div class="faint" style="font-size:12px;margin-bottom:10px">${App.esc(row.subject)}</div>
          <div class="wg-routebox">
            <div class="row between wrap gap-8" style="margin-bottom:12px">
              <span class="pill pill--accent">${App.icon('fingerprint')} WIN ID</span>
              <span class="faint" style="font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">Ministry routing</span>
            </div>
            <div class="wg-route">
              ${mchip('eS', 'var(--green-600)', 'e-Shram')}${arrow}
              ${mchip('ES', 'var(--green-700)', 'ESIC')}${arrow}
              ${mchip('PF', 'var(--blue-700)', 'EPFO')}
            </div>
            <div class="meter-row mt-16">
              ${App.ui.bar(pct, barCol)}
              <span class="val num" style="color:${barCol}">${pct}%</span>
            </div>
            <div class="muted" style="font-size:11.5px;margin-top:7px">${pct === 100 ? 'Case routed and resolved across all linked ministries.' : 'Case routed and being processed across linked ministries.'}</div>
          </div>
          <div class="timeline">
            ${steps.map((s, i) => `
              <div class="timeline__item">
                <span class="timeline__dot ${i < doneSteps ? 'done' : ''}"></span>
                <b>${App.esc(s.t)}</b>${s.d ? `<div class="when">${App.esc(s.d)}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
      WG._trackerCard = trackerCard;
      WG.viewTracker = (id) => {
        const row = WG._trackerRows().find(r => r.id === id); if (!row) return;
        const { doneSteps, pct } = caseProgress(row);
        App.modal.open(trackerCard(row, doneSteps, pct, row.status === 'In Progress' ? 'var(--blue-700)' : 'var(--green-600)'), { wide: true });
      };
      // one open case: show the full tracker inline. Several: a compact, scannable
      // list instead of one card per case, which got scattered fast past 2-3 cases.
      const tracker = !rows.length ? `
        <div class="card">
          <div class="card__body">${App.ui.empty('message', 'No grievances yet', 'File a grievance and its live resolution status will track here.')}</div>
        </div>`
        : !openRows.length ? `<div class="card">${trackerCard(rows[0], steps.length, 100, 'var(--green-600)')}</div>`
        : openRows.length === 1 ? `<div class="card">${trackerCard(openRows[0], caseProgress(openRows[0]).doneSteps, caseProgress(openRows[0]).pct, 'var(--blue-700)')}</div>`
        : `<div class="card">
            <div class="card__head"><h3 class="grow">Live Resolution Tracker</h3><span class="pill pill--amber mono">${openRows.length} open</span></div>
            <div class="card__body" style="padding-top:4px;padding-bottom:6px">
              <div class="list--divided">
                ${openRows.map(row => {
                  const { pct } = caseProgress(row);
                  return `
                  <button class="wg-trackrow" onclick="WorkerGrievance.viewTracker('${row.id}')">
                    <div class="grow" style="min-width:0;text-align:left">
                      <div class="row gap-8" style="align-items:center"><b style="font-size:13.5px">${App.esc(row.subject)}</b><span class="mono faint" style="font-size:11px">${App.esc(row.id)}</span></div>
                      <div class="meter-row mt-8">${App.ui.bar(pct, 'var(--blue-700)')}<span class="val num" style="color:var(--blue-700);min-width:34px">${pct}%</span></div>
                    </div>
                    ${App.icon('chevron')}
                  </button>`;
                }).join('')}
              </div>
            </div>
          </div>`;

      /* ---- activity log ---- */
      const acts = WG.activity();
      const activity = `
        <div class="card">
          <div class="card__head">
            <h3 class="grow">Activity Log</h3>
            <button class="btn btn--ghost btn--sm" onclick="WorkerGrievance.viewAllActivity()">View all ${App.icon('arrow')}</button>
          </div>
          <div class="card__body" style="padding-top:6px;padding-bottom:6px">
            ${acts.map(a => `
              <div class="wg-act">
                <span class="wg-actdot" style="background:${a.c}"></span>
                <div class="grow"><div style="font-size:13.5px;color:var(--ink)">${App.esc(a.x)}</div></div>
                <span class="faint mono" style="font-size:11.5px;white-space:nowrap">${App.esc(a.t)}</span>
              </div>`).join('')}
          </div>
        </div>`;

      /* ---- grievance table ---- */
      const seg = ['all', 'In Progress', 'Resolved'].map(f =>
        `<button class="${WG.filter === f ? 'is-active' : ''}" onclick="WorkerGrievance.setFilter('${f}')">${f === 'all' ? 'All' : f} · <span class="num">${counts[f]}</span></button>`
      ).join('');

      let tbody;
      if (!filtered.length) {
        tbody = `<tr><td colspan="6" style="padding:0"><div class="empty" style="padding:34px 20px">${App.icon('search', 'empty__ic')}<b>No grievances found</b><span>No grievances match the selected filter.</span></div></td></tr>`;
      } else {
        tbody = filtered.map(r => {
          const expandable = !!r.res;
          const open = WG.expanded === r.id;
          const chev = expandable ? `<span style="color:var(--muted)">${App.icon(open ? 'chevrondown' : 'chevron')}</span>` : '';
          const sub = r.status === 'In Progress'
            ? `<div class="muted" style="font-size:11.5px;margin-top:2px">Under review · ETA 3–5 working days</div>`
            : '';
          const freshTag = r.fresh ? ` <span class="pill pill--accent" style="font-size:10px;padding:1px 7px">New</span>` : '';
          const row = `
            <tr class="${expandable ? 'clickable' : ''}" ${expandable ? `onclick="WorkerGrievance.toggleRow('${r.id}')"` : ''}>
              <td style="width:36px;text-align:center">${chev}</td>
              <td><span class="mono" style="font-weight:600;color:var(--ink)">${App.esc(r.id)}</span></td>
              <td><b>${App.esc(r.subject)}</b>${freshTag}${sub}</td>
              <td>${App.ui.pill(r.cat, 'gray')}</td>
              <td class="mono" style="white-space:nowrap;color:var(--muted)">${App.esc(r.date)}</td>
              <td>${App.ui.statusPill(r.status)}</td>
            </tr>`;
          const panel = (expandable && open)
            ? `<tr class="wg-panelrow"><td colspan="6" style="padding:0 16px 14px"><div class="wg-res">${App.icon('checkcircle')}<div><b>Resolution</b><div style="margin-top:2px">${App.esc(r.res)}</div></div></div></td></tr>`
            : '';
          return row + panel;
        }).join('');
      }

      const table = `
        <div class="reveal">
          <div class="row between wrap gap-12" style="margin-bottom:14px">
            <div class="section-title" style="margin-bottom:0">All Grievances</div>
            <div class="seg">${seg}</div>
          </div>
          <div class="tablewrap tablewrap--scroll">
            <table class="tbl">
              <thead><tr>
                <th></th><th>Case ID</th><th>Subject</th><th>Category</th><th>Date</th><th>Status</th>
              </tr></thead>
              <tbody>${tbody}</tbody>
            </table>
          </div>
        </div>`;

      return `<div class="page fade-in">
        <style>
          .wg-routebox{ background:var(--surface-2); border:1px solid var(--line); border-radius:var(--r); padding:14px 16px; margin-bottom:18px; }
          .wg-route{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
          .wg-mchip{ display:inline-flex; align-items:center; gap:7px; padding:5px 11px 5px 6px; border-radius:var(--r-full); font-size:12px; font-weight:600; color:var(--ink); border:1px solid var(--line); background:var(--surface); }
          .wg-mbadge{ width:22px; height:22px; border-radius:7px; display:grid; place-items:center; font-size:9.5px; font-weight:700; color:#fff; }
          .wg-act{ display:flex; align-items:flex-start; gap:12px; padding:11px 0; border-bottom:1px solid var(--line-2); }
          .wg-act:last-child{ border-bottom:none; }
          .wg-actdot{ width:9px; height:9px; border-radius:50%; margin-top:5px; flex-shrink:0; }
          .wg-res{ display:flex; align-items:flex-start; gap:9px; padding:12px 14px; border-radius:var(--r-sm); background:var(--green-50); border:1px solid var(--green-100); color:var(--green-700); font-size:13px; line-height:1.5; }
          .wg-res .ico{ color:var(--green-600); margin-top:1px; flex-shrink:0; }
          .wg-trackrow{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 16px; border-bottom:1px solid var(--line-2); transition:.13s; }
          .wg-trackrow:last-child{ border-bottom:none; }
          .wg-trackrow:hover{ background:var(--surface-2); }
          .wg-trackrow .ico{ color:var(--faint); flex-shrink:0; }

          /* multi-step file-grievance flow */
          .wg-steps{ display:flex; align-items:center; gap:6px; margin-bottom:20px; }
          .wg-step{ display:flex; align-items:center; gap:8px; flex:1; color:var(--faint); }
          .wg-step:not(:last-child)::after{ content:""; flex:1; height:2px; border-radius:2px; background:var(--line-2); }
          .wg-stepno{ width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font-size:12px; font-weight:700; font-family:var(--font-num); background:var(--surface-2); border:1px solid var(--line-2); color:var(--muted); flex-shrink:0; }
          .wg-stepno .ico{ width:14px; height:14px; }
          .wg-steplbl{ font-size:12px; font-weight:600; white-space:nowrap; }
          .wg-step.now .wg-stepno{ background:var(--accent); border-color:transparent; color:#fff; }
          .wg-step.now{ color:var(--ink); }
          .wg-step.done .wg-stepno{ background:var(--green-600); border-color:transparent; color:#fff; }
          .wg-step.done{ color:var(--green-700); }
          .wg-picked{ display:inline-flex; align-items:center; gap:8px; padding:8px 13px; border-radius:var(--r-full); background:var(--accent-weak); color:var(--accent-strong); font-size:12.5px; font-weight:600; margin-bottom:16px; }
          .wg-picked .ico{ width:15px; height:15px; }
          .wg-catgrid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
          .wg-cat{ display:flex; align-items:center; gap:9px; padding:12px 13px; border:1px solid var(--line); border-radius:var(--r-sm); text-align:left; font-size:12.5px; font-weight:500; color:var(--ink-2); background:var(--surface); transition:.13s; }
          .wg-cat span{ line-height:1.25; }
          .wg-cat:hover{ border-color:var(--accent); background:var(--accent-weak); transform:translateY(-1px); }
          .wg-cat.is-sel{ border-color:var(--accent); background:var(--accent-weak); color:var(--accent-strong); box-shadow:0 0 0 2px var(--accent-ring); }
          .wg-cat .ico{ color:var(--muted); flex-shrink:0; }
          .wg-cat:hover .ico, .wg-cat.is-sel .ico{ color:var(--accent); }
          .wg-prio{ display:flex; gap:8px; }
          .wg-prio button{ flex:1; padding:9px; border:1px solid var(--line); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--muted); background:var(--surface); transition:.13s; }
          .wg-prio button:hover{ border-color:#d9dee8; }
          .wg-reviewcard{ border:1px solid var(--line); border-radius:var(--r); overflow:hidden; }
          .wg-rev{ display:flex; gap:14px; padding:12px 15px; border-bottom:1px solid var(--line-2); font-size:13px; }
          .wg-rev:last-child{ border-bottom:none; }
          .wg-revk{ width:96px; flex-shrink:0; color:var(--muted); font-size:12px; font-weight:600; }
          .wg-revv{ color:var(--ink); word-break:break-word; }
          .wg-success{ text-align:center; padding:16px 8px 8px; }
          .wg-bigico{ width:62px; height:62px; margin:0 auto 16px; border-radius:50%; background:var(--green-50); color:var(--green-600); display:grid; place-items:center; animation:fadeup .4s; }
          .wg-bigico .ico{ width:32px; height:32px; }
          .wg-success h3{ font-size:19px; font-family:var(--font-display); }
          .wg-success p{ margin-top:8px; font-size:13.5px; }
          @media (max-width:820px){ .wg-catgrid{ grid-template-columns:1fr; } .wg-steplbl{ display:none; } }
        </style>

        ${hero}
        ${stats}
        <div class="grid grid-2 reveal" style="margin-bottom:24px;align-items:start">
          ${tracker}
          ${activity}
        </div>
        ${table}
      </div>`;
    }
  });
})();
