/* Employer · Dashboard — hiring & workforce command center for Aditya Birla
   Construction Ltd. Editorial hero + four tabs (Overview, Job Management,
   Candidate Discovery, Hiring Pipeline) with a time-range segmented control,
   a "Post Job" flow, an NCS-sync job form, NCS talent cards, and an
   open-positions conversion tracker. v2 editorial standard. */
(function () {
  // ---- inline icons not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 16}" height="${s || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    upRight: svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>', 15),
    downRight: svg('<path d="m7 7 10 10"/><path d="M17 8v9H8"/>', 15),
    userPlus: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),
    sync: svg('<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>'),
  };

  // ---- demo data (from the Employer Dashboard spec) ----
  const COMPANY = { name: 'Aditya Birla Construction Ltd.', sector: 'Construction & Infrastructure', size: '1,001–5,000 employees', sites: '12 Sites' };

  const RANGES = [ ['7d', '7 Days'], ['30d', '30 Days'], ['90d', '90 Days'] ];
  const RANGE_LABEL = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };

  const KPIS = [
    { label: 'Total Employees', val: '1,247', sub: '+34 this month', up: true, icon: 'users', c: '#2f5fd0' },
    { label: 'Verified Workers', val: '1,182', sub: '94.8% verified rate', up: true, icon: 'checkcircle', c: '#0e9f6e' },
    { label: 'Open Positions', val: '18', sub: '6 filled this week', up: false, icon: 'briefcase', c: '#c07d10' },
    { label: 'Total Applicants', val: '126', sub: '+41 this week', up: true, icon: 'userPlus', c: '#0891a7' },
  ];

  const ACTIVITY = [
    { icon: 'userPlus', c: '#0891a7', action: 'New applicant', detail: 'Vikram Tiwari applied for Site Supervisor', when: '5 min ago' },
    { icon: 'shieldcheck', c: '#0e9f6e', action: 'EPFO compliance updated', detail: '1,182 employee records refreshed', when: '20 min ago' },
    { icon: 'sync', c: '#4f46e5', action: 'NCS sync completed', detail: '3 job postings pushed to NCS portal', when: '1 hour ago' },
    { icon: 'chart', c: '#6b4fc7', action: 'Attendance report generated', detail: 'Weekly report for all active sites', when: '2 hours ago' },
    { icon: 'database', c: '#0d9488', action: 'e-Shram sync', detail: 'Bulk worker registration sync completed', when: '4 hours ago' },
  ];

  // shared across Overview / Job Management / Pipeline
  const POSITIONS = [
    { title: 'Site Supervisor', dept: 'Construction', loc: 'Delhi NCR', posted: '5d', applied: 34, short: 8, openings: 3, ncs: true },
    { title: 'Electrician - Grade II', dept: 'Electrical', loc: 'Mumbai', posted: '8d', applied: 21, short: 4, openings: 2, ncs: true },
    { title: 'Safety Officer', dept: 'Compliance', loc: 'Pune', posted: '12d', applied: 15, short: 3, openings: 1, ncs: false },
    { title: 'Mason - Senior', dept: 'Construction', loc: 'Gurugram', posted: '3d', applied: 47, short: 11, openings: 5, ncs: true },
    { title: 'Plumbing Contractor', dept: 'MEP', loc: 'Bangalore', posted: '15d', applied: 9, short: 2, openings: 2, ncs: false },
  ];

  const DEPTS = [
    { name: 'Construction', n: 624, pct: 50 },
    { name: 'Electrical', n: 186, pct: 15 },
    { name: 'MEP / Plumbing', n: 162, pct: 13 },
    { name: 'Safety & Compliance', n: 112, pct: 9 },
    { name: 'Administration', n: 98, pct: 8 },
    { name: 'Others', n: 65, pct: 5 },
  ];

  const CANDIDATES = [
    { id: 'c1', name: 'Vikram Tiwari', loc: 'Delhi', match: 96, exp: 9, status: 'Available', role: 'Mason - Senior', win: 'WIN-2024-7823-0041', verified: true, skills: ['Masonry', 'Scaffolding', 'Blueprint Reading'] },
    { id: 'c2', name: 'Sunita Devi', loc: 'Noida', match: 91, exp: 6, status: 'Open to Work', role: 'Safety Officer', win: 'WIN-2024-5521-1190', verified: true, skills: ['Safety Officer', 'OSHA Compliance', 'First Aid'] },
    { id: 'c3', name: 'Ramesh Yadav', loc: 'Gurugram', match: 88, exp: 11, status: 'Available', role: 'Electrician - Grade II', win: 'WIN-2024-3301-0892', verified: true, skills: ['Electrical Wiring', 'Panel Installation', 'Load Testing'] },
    { id: 'c4', name: 'Anand Mishra', loc: 'Faridabad', match: 85, exp: 7, status: 'Available', role: 'Mason - Senior', win: 'WIN-2024-9910-2231', verified: false, skills: ['Plastering', 'Tile Work', 'Concrete Finishing'] },
    { id: 'c5', name: 'Meena Kumari', loc: 'Gurgaon', match: 82, exp: 5, status: 'Open to Work', role: 'Safety Officer', win: 'WIN-2024-6612-0073', verified: true, skills: ['HR Compliance', 'PF/ESI', 'Labour Law'] },
    { id: 'c6', name: 'Suresh Patel', loc: 'Mumbai', match: 79, exp: 8, status: 'Available', role: 'Plumbing Contractor', win: 'WIN-2024-4412-3398', verified: true, skills: ['Plumbing', 'Pipe Fitting', 'HVAC'] },
  ];

  const DEPARTMENTS = ['Construction', 'Electrical', 'MEP / Plumbing', 'Safety & Compliance', 'Administration'];
  const EMP_TYPES = ['Full-time', 'Part-time', 'Contract', 'Gig / Daily Wage'];

  // ---- local state + controller ----
  const S = { tab: 'overview', range: '30d', showForm: false, role: 'All', invited: [], sync: 'idle', posted: 0 };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const alive = () => App.state.route === 'emp-dashboard';

  window.EmpDash = {
    setTab(t) { S.tab = t; App.reload(); },
    setRange(r) { S.range = r; App.reload(); },
    postJob() { S.tab = 'jobs'; S.showForm = true; S.sync = 'idle'; App.reload(); },
    openForm() { S.showForm = true; S.sync = 'idle'; App.reload(); },
    closeForm() { S.showForm = false; S.sync = 'idle'; App.reload(); },
    submitJob() {
      const el = document.getElementById('edJobTitle');
      const title = (el && el.value.trim()) || '';
      if (!title) { App.toast('Enter a job title to continue', 'alert'); if (el) el.focus(); return; }
      S.sync = 'syncing'; App.reload();
      setTimeout(() => {
        if (!alive()) return;
        S.sync = 'done'; App.reload();
        App.toast('Posted & synced “' + title + '” to NCS', 'checkcircle');
        setTimeout(() => {
          if (!alive()) return;
          S.showForm = false; S.sync = 'idle'; S.posted += 1; App.reload();
        }, 2000);
      }, 1500);
    },
    invite(id) {
      if (S.invited.includes(id)) return;
      S.invited.push(id);
      const c = CANDIDATES.find(x => x.id === id);
      App.toast('Interview invite sent to ' + (c ? c.name : 'candidate'), 'send');
      App.reload();
    },
    setRole(r) { S.role = r; App.reload(); },

    // ---- richer, self-contained affordances ----
    viewActivity() {
      const html = `<div class="list--divided">${ACTIVITY.map(a => `
        <div class="row gap-12" style="align-items:flex-start;padding:12px 0">
          <div class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${a.c}1a;color:${a.c}">${iconOf(a.icon)}</div>
          <div class="grow" style="min-width:0"><b style="font-size:13.5px">${App.esc(a.action)}</b>
            <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(a.detail)}</div></div>
          <span class="faint num" style="font-size:11.5px;white-space:nowrap">${App.esc(a.when)}</span>
        </div>`).join('')}</div>
        <p class="muted" style="font-size:12px;margin-top:12px">Live feed across EPFO, e-Shram and the NCS portal — updated as your workforce records refresh.</p>`;
      App.modal.open(html, { title: 'Recent Activity', icon: 'bell' });
    },
    candidate(id) {
      const c = CANDIDATES.find(x => x.id === id); if (!c) return;
      const sent = S.invited.includes(c.id);
      const html = `
        <div class="row gap-14" style="align-items:center;margin-bottom:16px">
          ${App.ui.avatar(c.name, 'lg')}
          <div class="grow" style="min-width:0">
            <div class="row gap-8" style="align-items:center"><b style="font-size:17px">${App.esc(c.name)}</b>
              ${c.verified ? App.ui.verified('Verified') : App.ui.pill('Unverified', 'gray')}</div>
            <div class="row gap-6 muted mt-4" style="font-size:12.5px">${App.icon('mappin')} ${App.esc(c.loc)} · ${App.icon('briefcase')} ${App.esc(c.exp + ' yrs experience')}</div>
          </div>
          <span class="ed-match" style="${matchStyle(c.match)}"><b class="num">${c.match}%</b>&nbsp;match</span>
        </div>
        <div class="ed-candmeta" style="margin-bottom:14px">
          <div class="row between"><span class="muted">Availability</span><b>${App.esc(c.status)}</b></div>
          <div class="row between" style="margin-top:7px"><span class="muted">Matches open role</span><b>${App.esc(c.role)}</b></div>
          <div class="row between" style="margin-top:7px"><span class="muted">WIN ID</span><span class="mono" style="font-size:12px;color:var(--ink-2)">${App.esc(c.win)}</span></div>
        </div>
        <div class="label" style="margin-bottom:8px">Verified skills</div>
        <div class="row gap-6 wrap">${c.skills.map(s => `<span class="chip">${App.esc(s)}</span>`).join('')}</div>`;
      const foot = sent
        ? `<button class="btn" disabled style="background:var(--green-50);color:var(--green-700);border-color:var(--green-100);opacity:1">${App.icon('check')} Invite Sent</button>`
        : `<button class="btn" onclick="App.modal.close()">Close</button>
           <button class="btn btn--accent" onclick="EmpDash.inviteFrom('${c.id}')">${App.icon('send')} Send Interview Invite</button>`;
      App.modal.open(html, { title: 'NCS Candidate', icon: 'user', foot });
    },
    inviteFrom(id) { App.modal.close(); EmpDash.invite(id); },
    posting(idx) {
      const p = POSITIONS[idx]; if (!p) return;
      const conv = Math.round(p.short / p.applied * 100);
      const html = `
        <div class="row gap-8 wrap" style="align-items:center;margin-bottom:6px">
          <b style="font-size:16px">${App.esc(p.title)}</b>${ncsBadge(p.ncs, true)}
        </div>
        <div class="muted" style="font-size:13px;margin-bottom:16px">${App.esc(p.dept)} · ${App.esc(p.loc)} · Posted ${App.esc(p.posted)} ago</div>
        <div class="statstrip">
          <div class="statstrip__cell"><div class="statstrip__label">Applied</div><div class="statstrip__val num">${p.applied}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Shortlisted</div><div class="statstrip__val num" style="color:var(--green-700)">${p.short}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Openings</div><div class="statstrip__val num" style="color:var(--accent-strong)">${p.openings}</div></div>
        </div>
        <div class="mt-16"><div class="row between" style="margin-bottom:6px"><span style="font-size:13px">Applied → shortlisted conversion</span><span class="num" style="font-size:12.5px;font-weight:600">${conv}%</span></div>${App.ui.bar(conv, conv >= 30 ? 'var(--green-600)' : conv >= 20 ? 'var(--amber-600)' : 'var(--red-600)')}</div>`;
      const foot = `<button class="btn" onclick="App.modal.close()">Close</button>
        <button class="btn btn--primary" onclick="App.modal.close();EmpDash.setTab('pipeline')">View in pipeline ${App.icon('arrow')}</button>`;
      App.modal.open(html, { title: 'Job Posting', icon: 'briefcase', foot });
    },
  };

  // ---- small render helpers ----
  function iconOf(name) { return name === 'userPlus' ? ICO.userPlus : name === 'sync' ? ICO.sync : App.icon(name); }

  function ncsBadge(synced, longLabel) {
    return synced
      ? `<span class="pill pill--green" style="gap:5px">${ICO.sync} NCS Synced</span>`
      : `<span class="pill pill--gray">${longLabel ? 'Local Only' : 'Local'}</span>`;
  }

  function kpiCard(o) {
    const col = o.up ? 'var(--green-700)' : 'var(--amber-700)';
    return `<div class="kpi reveal">
      <div class="kpi__top">
        <div class="kpi__label">${App.esc(o.label)}</div>
        <div class="kpi__icon" style="background:${o.c}1a;color:${o.c}">${iconOf(o.icon)}</div>
      </div>
      <div class="kpi__val num">${App.esc(o.val)}</div>
      <div class="kpi__sub"><span class="row gap-4" style="color:${col};font-weight:600">${o.up ? ICO.upRight : ICO.downRight}${App.esc(o.sub)}</span></div>
    </div>`;
  }

  function matchStyle(m) {
    if (m >= 90) return 'background:var(--green-50);color:var(--green-700)';
    if (m >= 80) return 'background:var(--amber-50);color:var(--amber-700)';
    return 'background:var(--surface-2);color:var(--muted)';
  }

  // ---- tab renderers ----
  function overviewTab() {
    const kpis = `
      <div class="reveal">
        <div class="row between wrap gap-12 mb-12" style="align-items:center">
          <div class="section-title" style="margin:0">Workforce overview</div>
          <span class="faint" style="font-size:12px">Metrics for the last ${App.esc(RANGE_LABEL[S.range])}</span>
        </div>
        <div class="grid grid-4 mb-20">${KPIS.map(kpiCard).join('')}</div>
      </div>`;

    const activity = `
      <div class="card">
        <div class="card__head"><h3 class="grow">Recent Activity</h3><button class="btn btn--ghost btn--sm" onclick="EmpDash.viewActivity()">View all</button></div>
        <div class="card__body" style="padding-top:6px;padding-bottom:6px">
          <div class="list--divided">
            ${ACTIVITY.map(a => `
              <div class="row gap-12" style="align-items:flex-start;padding:12px 0">
                <div class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${a.c}1a;color:${a.c}">${iconOf(a.icon)}</div>
                <div class="grow" style="min-width:0">
                  <b style="font-size:13.5px">${App.esc(a.action)}</b>
                  <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(a.detail)}</div>
                </div>
                <span class="faint num" style="font-size:11.5px;white-space:nowrap">${App.esc(a.when)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    const positions = `
      <div class="card">
        <div class="card__head"><h3 class="grow">Active Positions Overview</h3><button class="btn btn--ghost btn--sm" onclick="EmpDash.setTab('pipeline')">View pipeline ${App.icon('arrow')}</button></div>
        <div class="card__body" style="padding-top:6px;padding-bottom:6px">
          <div class="list--divided">
            ${POSITIONS.slice(0, 3).map((p, i) => `
              <button class="ed-posrow" onclick="EmpDash.posting(${i})">
                <div style="min-width:180px;text-align:left">
                  <b style="font-size:13.5px">${App.esc(p.title)}</b>
                  <div class="muted" style="font-size:12px;margin-top:2px">${App.esc(p.dept)} · ${App.esc(p.loc)}</div>
                </div>
                <div class="row gap-16" style="align-items:center">
                  <span style="text-align:center"><b class="num" style="font-size:15px;color:var(--ink)">${p.applied}</b><div class="faint" style="font-size:10.5px">Applied</div></span>
                  <span style="text-align:center"><b class="num" style="font-size:15px;color:var(--green-700)">${p.short}</b><div class="faint" style="font-size:10.5px">Shortlisted</div></span>
                  ${ncsBadge(p.ncs, false)}
                  ${App.icon('chevron', 'ed-chev')}
                </div>
              </button>`).join('')}
          </div>
        </div>
      </div>`;

    const profile = `
      <div class="card card--pad">
        <div class="row gap-12" style="align-items:center;margin-bottom:16px">
          <div class="kpi__icon" style="width:42px;height:42px;background:var(--accent-weak);color:var(--accent-strong)">${App.icon('building')}</div>
          <div class="grow" style="min-width:0"><b style="font-size:15px">${App.esc(COMPANY.name)}</b><div class="muted" style="font-size:12.5px;margin-top:1px">${App.esc(COMPANY.sector)}</div></div>
        </div>
        <div class="grid grid-2" style="gap:12px">
          <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:13px">
            <div class="muted" style="font-size:11.5px">Company Size</div>
            <b style="font-size:14px;display:block;margin-top:3px">${App.esc(COMPANY.size)}</b>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:13px">
            <div class="muted" style="font-size:11.5px">Active Sites</div>
            <b style="font-size:14px;display:block;margin-top:3px">${App.esc(COMPANY.sites)}</b>
          </div>
        </div>
        <button class="btn btn--soft btn--block mt-16" onclick="App.navigate('emp-settings')">${App.icon('settings')} Manage Profile</button>
      </div>`;

    const breakdown = `
      <div class="card">
        <div class="card__head">${App.icon('pie')}<h3 class="grow">Department Breakdown</h3></div>
        <div class="card__body">
          ${DEPTS.map(d => `
            <div style="margin-bottom:13px">
              <div class="row between" style="margin-bottom:6px">
                <span style="font-size:13px">${App.esc(d.name)}</span>
                <span class="num" style="font-size:12.5px;color:var(--muted)"><b style="color:var(--ink)">${App.num(d.n)}</b> · ${d.pct}%</span>
              </div>
              ${App.ui.bar(d.pct, 'var(--blue-600)')}
            </div>`).join('')}
          <div class="row between" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)">
            <span class="muted" style="font-size:12.5px">Total workforce · <b class="num" style="color:var(--ink)">1,247</b></span>
            <span class="row gap-6" style="color:var(--green-700);font-weight:600;font-size:12.5px">${App.icon('trend')} +12% this quarter</span>
          </div>
        </div>
      </div>`;

    return `
      ${kpis}
      <div class="ed-grid-a mb-20 reveal">${activity}${positions}</div>
      <div class="ed-grid-b reveal">${profile}${breakdown}</div>`;
  }

  function jobFormCard() {
    let body;
    if (S.sync === 'syncing') {
      body = `<div class="ed-syncstate">
        <div class="ed-spin"></div>
        <b style="font-size:16px;margin-top:18px">Syncing to NCS Portal…</b>
        <p class="muted" style="font-size:13px;margin-top:6px">Pushing your posting to the National Career Service directory.</p>
      </div>`;
    } else if (S.sync === 'done') {
      body = `<div class="ed-syncstate">
        <div class="ed-ok">${App.icon('check')}</div>
        <b style="font-size:16px;margin-top:16px;color:var(--green-700)">Posted &amp; Synced to NCS!</b>
        <p class="muted" style="font-size:13px;margin-top:6px">Your posting is now live to 1.5 Cr+ registered NCS job seekers.</p>
      </div>`;
    } else {
      body = `
        <div class="banner banner--green mb-20" style="align-items:center">
          ${ICO.sync}
          <div class="grow">Auto-sync to National Career Service (NCS) Portal enabled — postings reach <b>1.5 Cr+</b> registered job seekers.</div>
          ${App.ui.pill('Active', 'green', true)}
        </div>
        <div class="grid grid-2" style="gap:0 18px">
          <div class="field"><label class="label">Job Title <span style="color:var(--red-600)">*</span></label>
            <input class="input" id="edJobTitle" placeholder="e.g. Site Supervisor"></div>
          <div class="field"><label class="label">Department <span style="color:var(--red-600)">*</span></label>
            <select class="select">${DEPARTMENTS.map(d => `<option>${App.esc(d)}</option>`).join('')}</select></div>
          <div class="field"><label class="label">Location <span style="color:var(--red-600)">*</span></label>
            <input class="input" placeholder="e.g. Delhi NCR / Mumbai"></div>
          <div class="field"><label class="label">Employment Type</label>
            <select class="select">${EMP_TYPES.map(t => `<option>${App.esc(t)}</option>`).join('')}</select></div>
        </div>
        <div class="grid grid-2" style="gap:0 18px">
          <div class="field"><label class="label">Salary Range (₹/month)</label>
            <div class="row gap-10"><input class="input" type="number" inputmode="numeric" placeholder="Min"><span class="muted">–</span><input class="input" type="number" inputmode="numeric" placeholder="Max"></div></div>
          <div class="field"><label class="label">Number of Openings</label>
            <input class="input" type="number" inputmode="numeric" value="1" min="1"></div>
        </div>
        <div class="field"><label class="label">Required Skills</label>
          <input class="input" placeholder="e.g. Masonry, Scaffolding, Blueprint Reading">
          <div class="hint">Comma-separated — used to match NCS candidates automatically.</div></div>
        <div class="field" style="margin-bottom:0"><label class="label">Job Description</label>
          <textarea class="textarea" placeholder="Describe the role, responsibilities, and site details…"></textarea></div>`;
    }

    const foot = S.sync === 'syncing'
      ? `<button class="btn btn--primary" disabled style="opacity:.75"><span class="ed-spin ed-spin--sm"></span> Syncing to NCS Portal…</button>`
      : S.sync === 'done'
        ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent">${App.icon('check')} Posted &amp; Synced to NCS!</button>`
        : `<button class="btn" onclick="EmpDash.closeForm()">Cancel</button>
           <button class="btn btn--primary" onclick="EmpDash.submitJob()">${ICO.sync} Post Job &amp; Sync to NCS</button>`;

    return `
      <div class="card mb-20 reveal">
        <div class="card__head">
          <div class="grow"><h3>Create New Job Posting</h3><div class="muted" style="font-size:12.5px;margin-top:2px">This posting will be automatically synced to the NCS Portal after submission.</div></div>
          <button class="iconbtn" onclick="EmpDash.closeForm()" title="Close">${App.icon('x')}</button>
        </div>
        <div class="card__body">${body}</div>
        <div class="modal__foot" style="border-radius:0 0 var(--r-lg) var(--r-lg)">${foot}</div>
      </div>`;
  }

  function jobsTab() {
    const total = POSITIONS.length + S.posted;
    const form = S.showForm
      ? jobFormCard()
      : `<div class="row between wrap gap-12 mb-16 reveal" style="align-items:center">
           <p class="muted" style="font-size:13px;margin:0">Postings created here auto-sync to the NCS Portal.</p>
           <button class="btn btn--primary" onclick="EmpDash.openForm()">${App.icon('plus')} Create New Job Posting</button>
         </div>`;

    const listedCount = S.posted > 0 ? `${total} active` : '5 active';

    const rows = POSITIONS.map((p, i) => `
      <button class="ed-jobrow" onclick="EmpDash.posting(${i})">
        <div class="grow" style="min-width:220px;text-align:left">
          <div class="row gap-8 wrap" style="align-items:center">
            <b style="font-size:14.5px">${App.esc(p.title)}</b>
            ${ncsBadge(p.ncs, true)}
          </div>
          <div class="muted" style="font-size:12.5px;margin-top:4px">${App.esc(p.dept)} · ${App.esc(p.loc)} · Posted ${App.esc(p.posted)} ago</div>
        </div>
        <div class="row gap-18" style="align-items:center">
          <span class="ed-stat"><b class="num">${p.applied}</b><span>Applied</span></span>
          <span class="ed-stat"><b class="num" style="color:var(--green-700)">${p.short}</b><span>Shortlisted</span></span>
          <span class="ed-stat"><b class="num" style="color:var(--accent-strong)">${p.openings}</b><span>Openings</span></span>
          ${App.icon('chevron', 'ed-chev')}
        </div>
      </button>`).join('');

    return `
      ${form}
      <div class="card reveal">
        <div class="card__head"><h3 class="grow">Active Job Postings</h3>${App.ui.pill(listedCount, 'accent')}</div>
        <div class="card__body" style="padding-top:6px;padding-bottom:6px"><div class="list--divided">${rows}</div></div>
      </div>`;
  }

  function discoveryTab() {
    const roles = ['All'];
    CANDIDATES.forEach(c => { if (!roles.includes(c.role)) roles.push(c.role); });
    const chips = roles.map(r => `<button class="ed-rolechip ${S.role === r ? 'is-active' : ''}" onclick="EmpDash.setRole('${jsq(r)}')">${App.esc(r)}</button>`).join('');

    const list = CANDIDATES.filter(c => S.role === 'All' || c.role === S.role);

    const cards = list.map(c => {
      const sent = S.invited.includes(c.id);
      return `
      <div class="card card--pad card--hover ed-cand" onclick="EmpDash.candidate('${c.id}')">
        <div class="row between gap-10" style="align-items:flex-start">
          <div class="row gap-12" style="align-items:flex-start;min-width:0">
            ${App.ui.avatar(c.name)}
            <div style="min-width:0">
              <div class="row gap-6" style="align-items:center">
                <b style="font-size:15px">${App.esc(c.name)}</b>
                ${c.verified ? `<span style="color:var(--green-600);display:inline-flex" title="Verified worker">${App.icon('shieldcheck')}</span>` : ''}
              </div>
              <div class="row gap-6 muted" style="font-size:12.5px;margin-top:3px">${App.icon('mappin')} ${App.esc(c.loc)}</div>
            </div>
          </div>
          <span class="ed-match" style="${matchStyle(c.match)}"><b class="num">${c.match}%</b>&nbsp;match</span>
        </div>

        <div class="row gap-16 wrap mt-12" style="font-size:12.5px;color:var(--muted)">
          <span class="row gap-6">${App.icon('briefcase')} <span class="num">${c.exp}</span>&nbsp;yrs experience</span>
          <span class="row gap-6" style="color:var(--amber-700)">${App.icon('star')} ${App.esc(c.status)}</span>
        </div>

        <div class="ed-candmeta mt-12">
          <div class="row between"><span class="muted">Matches</span><b>${App.esc(c.role)}</b></div>
          <div class="row between" style="margin-top:6px"><span class="muted">WIN ID</span><span class="mono" style="font-size:12px;color:var(--ink-2)">${App.esc(c.win)}</span></div>
        </div>

        <div class="row gap-6 wrap mt-12">${c.skills.map(s => `<span class="chip">${App.esc(s)}</span>`).join('')}</div>

        ${sent
          ? `<button class="btn btn--block mt-16" style="background:var(--green-50);color:var(--green-700);border-color:var(--green-100)" onclick="event.stopPropagation();App.toast('Interview invite already sent to ${jsq(c.name)}')">${App.icon('check')} Invite Sent</button>`
          : `<button class="btn btn--accent btn--block mt-16" onclick="event.stopPropagation();EmpDash.invite('${c.id}')">${App.icon('send')} Send Interview Invite</button>`}
      </div>`;
    }).join('');

    return `
      <div class="banner banner--info mb-16 reveal" style="align-items:flex-start">${App.icon('sparkles')}
        <div><b>NCS Talent Discovery</b> — candidates below are sourced from the National Career Service (NCS) directory. Their verified skills match your open positions, even if they haven't applied yet.</div>
      </div>
      <div class="ed-roles mb-16 reveal">${chips}</div>
      ${list.length ? `<div class="grid grid-3 ed-candgrid reveal">${cards}</div>` : `<div class="reveal">${App.ui.empty('users', 'No candidates', 'No NCS candidates match this role filter.')}</div>`}`;
  }

  function pipelineTab() {
    const applied = POSITIONS.reduce((a, p) => a + p.applied, 0);
    const short = POSITIONS.reduce((a, p) => a + p.short, 0);
    const openings = POSITIONS.reduce((a, p) => a + p.openings, 0);

    const summaryCard = (icon, c, label, val) => `
      <div class="card card--pad" style="border-left:3px solid ${c}">
        <div class="row between" style="align-items:flex-start">
          <div><div class="muted" style="font-size:12.5px">${label}</div><div class="num" style="font-size:28px;font-weight:700;letter-spacing:-.02em;color:var(--ink);margin-top:4px">${App.num(val)}</div></div>
          <div class="kpi__icon" style="width:38px;height:38px;background:${c}1a;color:${c}">${App.icon(icon)}</div>
        </div>
      </div>`;

    const summary = `<div class="grid grid-3 mb-20 reveal">
      ${summaryCard('users', '#2f5fd0', 'Total Applicants', applied)}
      ${summaryCard('checkcircle', '#0e9f6e', 'Shortlisted', short)}
      ${summaryCard('briefcase', '#c07d10', 'Total Openings', openings)}
    </div>`;

    const rows = POSITIONS.map((p, i) => {
      const conv = Math.round(p.short / p.applied * 100);
      const cvColor = conv >= 30 ? 'var(--green-600)' : conv >= 20 ? 'var(--amber-600)' : 'var(--red-600)';
      return `<tr class="clickable" onclick="EmpDash.posting(${i})">
        <td><b>${App.esc(p.title)}</b><div class="faint" style="font-size:11.5px;margin-top:2px">Posted ${App.esc(p.posted)} ago</div></td>
        <td>${App.esc(p.dept)}<div class="faint" style="font-size:11.5px;margin-top:2px">${App.esc(p.loc)}</div></td>
        <td class="num">${p.openings}</td>
        <td class="num">${p.applied}</td>
        <td class="num" style="color:var(--green-700)">${p.short}</td>
        <td style="min-width:130px">
          <div class="row gap-8" style="align-items:center"><span class="num" style="min-width:34px;color:${cvColor};font-weight:600">${conv}%</span>${App.ui.bar(conv, cvColor)}</div>
        </td>
        <td>${p.ncs
          ? `<span class="row gap-5" style="color:var(--green-700);font-weight:600;font-size:12px">${App.icon('checkcircle')} Synced</span>`
          : `<span class="row gap-5" style="color:var(--muted);font-weight:600;font-size:12px">${App.icon('alert')} Not synced</span>`}</td>
      </tr>`;
    }).join('');

    return `
      ${summary}
      <div class="card reveal">
        <div class="card__head"><h3 class="grow">Open Positions Tracker</h3><button class="btn btn--ghost btn--sm" onclick="EmpDash.setTab('jobs')">${App.icon('plus')} Add Position</button></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>Position</th><th>Dept / Location</th><th>Openings</th><th>Applied</th><th>Shortlisted</th><th>Conversion</th><th>NCS</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  const TABS = [
    ['overview', 'Overview'],
    ['jobs', 'Job Management'],
    ['discovery', 'Candidate Discovery'],
    ['pipeline', 'Hiring Pipeline'],
  ];

  // shown instead of the dashboard until the employer has synced an HRMS — there's no
  // real employee data yet, but a faded preview hints at what this page will look like
  // once connected, instead of leaving the tab blank.
  function syncPromptPage() {
    const previewKpis = [
      { icon: 'shield', label: 'Total Employees' },
      { icon: 'checkcircle', label: 'Verified' },
      { icon: 'clock', label: 'In Progress' },
      { icon: 'alert', label: 'Pending' },
    ].map(k => `
      <div class="kpi">
        <div class="kpi__top"><div class="kpi__label">${App.esc(k.label)}</div>
          <div class="kpi__icon" style="background:var(--surface-2);color:var(--faint)">${App.icon(k.icon)}</div></div>
        <div class="kpi__val" style="color:var(--faint)">—</div>
        <div class="kpi__sub muted">Awaiting HRMS sync</div>
      </div>`).join('');
    const previewRows = ['Employee roster', 'Verification status by source', 'Hiring pipeline'].map(t => `
      <div class="row gap-10" style="padding:13px 8px;border-bottom:1px solid var(--line-2)">
        <span style="width:34px;height:34px;border-radius:50%;background:var(--surface-2)"></span>
        <div class="grow"><div style="height:11px;width:40%;background:var(--surface-2);border-radius:4px"></div>
          <div style="height:9px;width:60%;background:var(--surface-2);border-radius:4px;margin-top:7px"></div></div>
        <span class="muted" style="font-size:12px">${App.esc(t)}</span>
      </div>`).join('');

    return `<div class="page fade-in">
      <div class="hero reveal">
        <div class="hero__wash"></div>
        <div class="hero__in">
          <div class="eyebrow">${App.icon('plug')} Setup required</div>
          <h1 class="h-grad" style="margin-top:12px">Sync your HRMS to see your dashboard.</h1>
          <p class="lead">Connect your HR system first — your workforce stats, hiring pipeline and worker profiles will populate here once employee records start syncing.</p>
          <button class="btn btn--accent" style="margin-top:16px" onclick="App.navigate('emp-hrms')">${App.icon('plug')} Go to HRMS Sync</button>
        </div>
      </div>
      <div class="grid grid-4 reveal" style="margin-bottom:22px;opacity:.6;pointer-events:none">${previewKpis}</div>
      <div class="card reveal" style="opacity:.6;pointer-events:none">
        <div class="card__head"><h3 class="grow">What you'll see here</h3></div>
        <div class="card__body" style="padding-top:0">${previewRows}</div>
      </div>
    </div>`;
  }

  App.registerView('emp-dashboard', {
    title: 'Dashboard',
    subtitle: 'Hiring & workforce command center',
    render(ctx) {
      const org = (ctx && ctx.user && ctx.user.org) || (DB.profiles.employer && DB.profiles.employer.org);
      if (window.EmpHrms && !EmpHrms.hasActiveConnection(org)) return syncPromptPage();
      const body = S.tab === 'overview' ? overviewTab()
        : S.tab === 'jobs' ? jobsTab()
        : S.tab === 'discovery' ? discoveryTab()
        : pipelineTab();

      const style = `<style>
        .ed-rangeseg button.is-active{ background:var(--accent); color:#fff; box-shadow:var(--sh-xs); }
        .ed-grid-a{ display:grid; grid-template-columns:1.35fr 1fr; gap:20px; align-items:start; }
        .ed-grid-b{ display:grid; grid-template-columns:1fr 1.6fr; gap:20px; align-items:start; }
        .ed-jobrow, .ed-posrow{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; width:100%; background:transparent; border:none; cursor:pointer; text-align:left; transition:.13s; border-radius:var(--r-sm); }
        .ed-jobrow{ padding:15px 8px; margin:0 -8px; }
        .ed-posrow{ padding:13px 8px; margin:0 -8px; }
        .ed-jobrow:hover, .ed-posrow:hover{ background:var(--surface-2); }
        .ed-chev{ color:var(--faint); width:16px; height:16px; transition:transform .13s; }
        .ed-jobrow:hover .ed-chev, .ed-posrow:hover .ed-chev{ transform:translateX(2px); color:var(--accent); }
        .ed-stat{ display:flex; flex-direction:column; align-items:center; min-width:56px; }
        .ed-stat b{ font-size:17px; line-height:1; color:var(--ink); }
        .ed-stat span{ font-size:10.5px; color:var(--faint); margin-top:3px; }
        .ed-roles{ display:flex; gap:8px; flex-wrap:wrap; }
        .ed-rolechip{ padding:7px 14px; border-radius:var(--r-full); font-size:12.5px; font-weight:600; border:1px solid var(--line); background:var(--surface); color:var(--muted); cursor:pointer; transition:.13s; white-space:nowrap; }
        .ed-rolechip:hover{ border-color:var(--accent); color:var(--accent-strong); }
        .ed-rolechip.is-active{ background:var(--accent); color:#fff; border-color:transparent; }
        .ed-cand{ display:flex; flex-direction:column; cursor:pointer; }
        .ed-match{ display:inline-flex; align-items:center; padding:4px 10px; border-radius:var(--r-full); font-size:12px; font-weight:600; white-space:nowrap; flex-shrink:0; }
        .ed-candmeta{ background:var(--surface-2); border:1px solid var(--line-2); border-radius:var(--r-sm); padding:11px 13px; font-size:12.5px; }
        .ed-cand .btn--block{ margin-top:auto; }
        .ed-syncstate{ display:flex; flex-direction:column; align-items:center; text-align:center; padding:28px 12px; }
        .ed-spin{ width:42px; height:42px; border:3px solid var(--line); border-top-color:var(--accent); border-radius:50%; animation:ed-spin .8s linear infinite; }
        .ed-spin--sm{ width:15px; height:15px; border-width:2px; border-color:rgba(255,255,255,.4); border-top-color:#fff; display:inline-block; vertical-align:-2px; }
        .ed-ok{ width:46px; height:46px; border-radius:50%; display:grid; place-items:center; background:var(--green-600); color:#fff; }
        .ed-ok .ico{ width:26px; height:26px; }
        @keyframes ed-spin{ to{ transform:rotate(360deg); } }
        @media (max-width:1000px){ .ed-grid-a, .ed-grid-b{ grid-template-columns:1fr; } .ed-candgrid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:680px){ .ed-candgrid{ grid-template-columns:1fr; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('building')} Employer console</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">Your workforce, verified.</h1>
                <p class="lead">${App.esc(COMPANY.name)} — ${App.esc(COMPANY.sector)}. Live hiring, national NCS reach, and one pipeline built on employment data verified at source.</p>
                <div class="row gap-10 mt-16 wrap" style="align-items:center">
                  <span class="pill pill--gray">${App.icon('users')} ${App.esc(COMPANY.size)}</span>
                  <span class="pill pill--gray">${App.icon('mappin')} ${App.esc(COMPANY.sites)}</span>
                  ${App.ui.verified('EPFO-synced workforce')}
                </div>
              </div>
              <div class="row gap-12 wrap" style="align-items:center">
                <div class="seg ed-rangeseg" role="tablist" aria-label="Time range">
                  ${RANGES.map(([k, l]) => `<button class="${S.range === k ? 'is-active' : ''}" onclick="EmpDash.setRange('${k}')">${l}</button>`).join('')}
                </div>
                <button class="btn btn--primary" onclick="EmpDash.postJob()">${App.icon('plus')} Post Job</button>
              </div>
            </div>
          </div>
        </div>

        <div class="tabs">
          ${TABS.map(([k, l]) => `<div class="tab ${S.tab === k ? 'is-active' : ''}" onclick="EmpDash.setTab('${k}')">${l}</div>`).join('')}
        </div>

        ${body}
      </div>`;
    }
  });
})();
