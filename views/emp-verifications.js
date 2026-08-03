/* Employer · Employee Verifications — HR verification console (v2 editorial).
   Opens on an editorial hero, then org-wide stats, a live search + type/status
   filter bar, a per-source (Aadhaar / PAN / EPFO) verification roster with trust
   scores and row-level actions, a report-export flow, and a guided
   "New verification" modal. Every control does something real. */
(function () {
  /* ---- verification roster (per-source state: 'ok' | 'pending' | 'fail') ---- */
  const base = [
    { id: 'EMP001245', name: 'Arjun Gupta',      type: 'professional', aadhaar: 'ok',      pan: 'ok',      prev: 'L&T Construction',      epfo: 'ok',      status: 'Completed',   score: 96 },
    { id: 'EMP001246', name: 'Sam Bissell',      type: 'professional', aadhaar: 'ok',      pan: 'ok',      prev: 'Shapoorji Pallonji',    epfo: 'ok',      status: 'In Progress', score: 82 },
    { id: 'GIG001',    name: 'Deepak Lal',       type: 'gig',          aadhaar: 'ok',      pan: 'ok',      prev: 'Tata Projects',         epfo: 'ok',      status: 'Completed',   score: 94 },
    { id: 'EMP001247', name: 'Aditya Srivastava',type: 'professional', aadhaar: 'ok',      pan: 'ok',      prev: 'Godrej Properties',     epfo: 'ok',      status: 'Completed',   score: 98 },
    { id: 'EMP001248', name: 'Priya Sharma',     type: 'professional', aadhaar: 'ok',      pan: 'ok',      prev: 'DLF Limited',           epfo: 'pending', status: 'In Progress', score: 75 },
    { id: 'GIG002',    name: 'Raj Mehta',        type: 'gig',          aadhaar: 'ok',      pan: 'ok',      prev: 'NCC Limited',           epfo: 'pending', status: 'In Progress', score: 88 },
    { id: 'EMP001249', name: 'Pradeesh Kumar',   type: 'professional', aadhaar: 'pending', pan: 'pending', prev: 'Afcons Infrastructure', epfo: 'pending', status: 'Pending',     score: 0  },
  ];

  const DEPARTMENTS = ['Construction', 'Electrical', 'MEP / Plumbing', 'Safety & Compliance', 'Administration'];

  // manual document fallback — when a worker can't be verified through HRMS,
  // they upload salary slips / appointment letters instead; those show up here
  // for the employer to approve or reject.
  const MANUAL_DOCS = [
    { id: 'MDV-2201', worker: 'Suresh Yadav', winId: 'WIN-2024-7712-4453', docType: 'Salary Slip (Feb 2026)', uploadedOn: '2026-03-02', status: 'Pending Review',
      company: 'Aditya Birla Construction Ltd.', role: 'Site Mason', joiningDate: '14 Jun 2024', city: 'Gurugram',
      month: 'February 2026', basic: 18500, hra: 7400, allowance: 3200, pf: 2220, esi: 350, netPay: 26530 },
    { id: 'MDV-2202', worker: 'Vikram Singh', winId: 'WIN-2024-5581-2290', docType: 'Appointment Letter', uploadedOn: '2026-02-27', status: 'Pending Review',
      company: 'Aditya Birla Construction Ltd.', role: 'Scaffolding Supervisor', joiningDate: '02 Mar 2026', city: 'Noida' },
    { id: 'MDV-2198', worker: 'Ramesh Chauhan', winId: 'WIN-2024-3340-1187', docType: 'Salary Slip (Jan 2026)', uploadedOn: '2026-02-10', status: 'Approved',
      company: 'Aditya Birla Construction Ltd.', role: 'Electrician', joiningDate: '09 Aug 2023', city: 'Delhi',
      month: 'January 2026', basic: 21000, hra: 8400, allowance: 2800, pf: 2520, esi: 400, netPay: 29280 },
  ];

  // a mocked-up salary-slip visual, styled to look like an actual payslip document
  // rather than a plain "document preview" placeholder.
  function salarySlipHtml(d) {
    const gross = d.basic + d.hra + d.allowance;
    const deductions = d.pf + d.esi;
    const row = (label, val, bold) => `<div class="row between" style="padding:6px 0;${bold ? 'border-top:1px solid var(--line);margin-top:4px;font-weight:700' : ''}"><span style="font-size:12.5px${bold ? ';font-weight:700' : ''}">${App.esc(label)}</span><span class="num" style="font-size:12.5px${bold ? ';font-weight:700' : ''}">₹${App.num(val)}</span></div>`;
    return `
      <div class="card" style="border:1px solid var(--line);overflow:hidden">
        <div style="background:var(--ink);color:#fff;padding:16px 20px">
          <div class="row between" style="align-items:flex-start">
            <div><b style="font-size:15px">${App.esc(d.company)}</b><div style="font-size:11px;opacity:.75;margin-top:2px">Payslip · ${App.esc(d.month)}</div></div>
            ${App.icon('building')}
          </div>
        </div>
        <div class="card__body" style="padding:18px 20px">
          <div class="grid grid-2" style="margin-bottom:16px">
            <div><div class="faint" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.04em">Employee Name</div><b style="font-size:13px">${App.esc(d.worker)}</b></div>
            <div><div class="faint" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.04em">Designation</div><b style="font-size:13px">${App.esc(d.role)}</b></div>
            <div style="margin-top:8px"><div class="faint" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.04em">Location</div><b style="font-size:13px">${App.esc(d.city)}</b></div>
            <div style="margin-top:8px"><div class="faint" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.04em">Date of Joining</div><b style="font-size:13px">${App.esc(d.joiningDate)}</b></div>
          </div>
          <div class="grid grid-2" style="gap:24px">
            <div>
              <div class="label" style="margin-bottom:2px">Earnings</div>
              ${row('Basic Pay', d.basic)}${row('HRA', d.hra)}${row('Other Allowances', d.allowance)}${row('Gross Pay', gross, true)}
            </div>
            <div>
              <div class="label" style="margin-bottom:2px">Deductions</div>
              ${row('Provident Fund (PF)', d.pf)}${row('ESI', d.esi)}${row('Total Deductions', deductions, true)}
            </div>
          </div>
          <div class="row between" style="margin-top:16px;padding-top:14px;border-top:2px solid var(--ink);align-items:center">
            <b style="font-size:14px">Net Pay</b>
            <b class="num" style="font-size:16px;color:var(--green-700)">₹${App.num(d.netPay)}</b>
          </div>
          <div class="faint" style="font-size:10.5px;margin-top:12px">This is a document uploaded by the worker for manual review — a mocked preview for this prototype.</div>
        </div>
      </div>`;
  }

  function appointmentLetterHtml(d) {
    return `
      <div class="card" style="border:1px solid var(--line);overflow:hidden">
        <div class="card__body" style="padding:24px 28px">
          <div class="row between" style="margin-bottom:20px;align-items:flex-start">
            <b style="font-size:15px">${App.esc(d.company)}</b>${App.icon('building')}
          </div>
          <div class="faint" style="font-size:11px;margin-bottom:14px">Ref: APT/${App.esc((d.joiningDate || '').replace(/\s/g, ''))}/${App.esc(d.city || '')}</div>
          <p style="font-size:13px;line-height:1.7">Dear <b>${App.esc(d.worker)}</b>,</p>
          <p style="font-size:13px;line-height:1.7;margin-top:8px">We are pleased to confirm your appointment as <b>${App.esc(d.role)}</b> at our ${App.esc(d.city)} site, effective from <b>${App.esc(d.joiningDate)}</b>. This letter, along with your verified WiN profile, confirms your employment details for the purpose of background verification.</p>
          <p style="font-size:13px;line-height:1.7;margin-top:14px">We look forward to your contribution to the team.</p>
          <div class="faint" style="font-size:10.5px;margin-top:20px">This is a document uploaded by the worker for manual review — a mocked preview for this prototype.</div>
        </div>
      </div>`;
  }

  const DOTS = '<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>';

  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  const EV = {
    query: '',
    type: 'all',      // all | professional | gig
    status: 'all',    // all | Completed | In Progress | Pending
    added: [],        // employees submitted this session
    _focusSearch: false,
    tab: 'overview', // overview | manual

    // keep App.state.params.tab in sync so the sidebar's nested Overview/Manual
    // Verification children (see PERSONAS.employer nav in core.js) highlight correctly.
    setTab(t) { EV.tab = t; App.state.params = Object.assign({}, App.state.params, { tab: t }); App.reload(); },
    reviewDoc(id) {
      const d = MANUAL_DOCS.find(x => x.id === id); if (!d) return;
      const firstName = (d.worker || '').split(' ')[0];
      const context = `
        <div class="banner banner--info" style="margin-bottom:16px">${App.icon('idcard')}<div>
          <b>${App.esc(firstName)} is trying to get their work experience at ${App.esc(d.company)} verified.</b>
          <div style="margin-top:3px;opacity:.9">Since this couldn't be fetched from HRMS, ${App.esc(firstName)} shared the details below directly — review and approve or reject them.</div>
        </div></div>
        <div class="grid grid-3" style="margin-bottom:16px">
          <div><div class="faint" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em">Role</div><b style="font-size:13.5px">${App.esc(d.role || '—')}</b></div>
          <div><div class="faint" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em">Joining Date</div><b style="font-size:13.5px">${App.esc(d.joiningDate || '—')}</b></div>
          <div><div class="faint" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em">City</div><b style="font-size:13.5px">${App.esc(d.city || '—')}</b></div>
        </div>`;

      const doc = d.docType.startsWith('Salary Slip') ? salarySlipHtml(d) : appointmentLetterHtml(d);

      App.modal.open(`
        ${context}
        <div class="faint" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Document uploaded · ${App.esc(d.uploadedOn)}</div>
        ${doc}`, {
        title: 'Manual Document Review', icon: 'shieldcheck', wide: true,
        foot: `<button class="btn btn--danger" onclick="EmpVerifications.decideDoc('${id}','Rejected')">${App.icon('x')} Reject</button>
               <button class="btn btn--primary" style="background:var(--green-600)" onclick="EmpVerifications.decideDoc('${id}','Approved')">${App.icon('check')} Approve</button>`,
      });
    },
    decideDoc(id, decision) {
      const d = MANUAL_DOCS.find(x => x.id === id); if (d) d.status = decision;
      App.modal.close();
      App.toast(decision === 'Approved' ? 'Document approved' : 'Document rejected', decision === 'Approved' ? 'checkcircle' : 'x');
      App.reload();
    },

    all() { return EV.added.concat(base); },
    find(id) { return EV.all().find(r => r.id === id) || null; },
    filtered() {
      const q = EV.query.trim().toLowerCase();
      return EV.all().filter(r => {
        if (EV.type !== 'all' && r.type !== EV.type) return false;
        if (EV.status !== 'all' && r.status !== EV.status) return false;
        if (q && !(r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))) return false;
        return true;
      });
    },

    /* ---- filters ---- */
    search(v) { EV.query = v; EV._focusSearch = true; App.reload(); },
    clear() { EV.query = ''; App.reload(); },
    setType(t) { EV.type = t; App.reload(); },
    setStatus(s) { EV.status = s; App.reload(); },
    filtersInfo() { App.toast('Advanced filters are a demo affordance in this prototype', 'filter'); },
    page(n, ok) { if (ok) App.toast('Page ' + n + ' — this prototype shows a single page', 'file'); },

    /* ---- row navigation + actions ---- */
    open(id) { const r = EV.find(id); if (r) App.navigate('emp-employee', { id: r.id, type: r.type }); },
    rowMenu(id) {
      const r = EV.find(id); if (!r) return;
      const body = `<div class="ev-menu">
        <button onclick="App.modal.close();EmpVerifications.open('${r.id}')">${App.icon('eye')} View verification details</button>
        <button onclick="App.modal.close();EmpVerifications.rerun('${r.id}')">${App.icon('shieldcheck')} Re-run verification</button>
        <button onclick="App.modal.close();EmpVerifications.exportOne('${r.id}')">${App.icon('download')} Download report</button>
        <button class="ev-menu__danger" onclick="App.modal.close();App.toast('${App.esc(r.name)} removed from active list')">${App.icon('trash')} Remove from list</button>
      </div>`;
      App.modal.open(body, { title: r.name + ' · ' + r.id, icon: 'user' });
    },
    rerun(id) {
      const r = EV.find(id); if (!r) return;
      App.toast('Re-running live verification for ' + r.name + '…', 'clock');
      setTimeout(() => App.toast(r.name + ' — sources re-queried against EPFO, PAN & Aadhaar', 'shieldcheck'), 1300);
    },
    exportOne(id) { const r = EV.find(id); if (r) App.toast('Generating verification report for ' + r.name, 'download'); },

    /* ---- export report ---- */
    exportReport() {
      const n = EV.filtered().length;
      const fmt = (f) => `<button class="ev-fmt" onclick="App.modal.close();App.toast('Generating ${f} report for ${plural(n, 'employee')}…','download')">
        <div class="ev-fmt__ic">${App.icon('file')}</div><b>${f}</b><span>.${f.toLowerCase()}</span></button>`;
      App.modal.open(`
        <p class="muted" style="margin-bottom:16px;font-size:13.5px">Generating a verification report for <b style="color:var(--ink)">${plural(n, 'employee')}</b> matching the current view. Choose a format:</p>
        <div class="ev-fmts">${fmt('CSV')}${fmt('Excel')}${fmt('PDF')}</div>`,
        { title: 'Export verification report', icon: 'download' });
    },

    /* ---- new verification modal ---- */
    openNew() {
      const opts = DEPARTMENTS.map(d => `<option value="${App.esc(d)}">${App.esc(d)}</option>`).join('');
      const body = `
        <div class="banner banner--info" style="margin-bottom:18px">${App.icon('shieldcheck')}
          <div>The new employee will be verified live against Aadhaar, PAN and EPFO, then appear in the pending queue.</div></div>
        <div class="grid grid-2 gap-16">
          <div class="field"><label class="label">Full Name <span class="ev-req">*</span></label>
            <input class="input" id="nvName" placeholder="Enter full name"></div>
          <div class="field"><label class="label">Employee ID <span class="ev-req">*</span></label>
            <input class="input" id="nvId" placeholder="Enter employee ID"></div>
          <div class="field"><label class="label">Department <span class="ev-req">*</span></label>
            <select class="select" id="nvDept"><option value="">Select department</option>${opts}</select></div>
          <div class="field"><label class="label">Designation <span class="ev-req">*</span></label>
            <input class="input" id="nvDesg" placeholder="Enter designation"></div>
          <div class="field"><label class="label">Previous Employment</label>
            <input class="input" id="nvPrev" placeholder="Enter previous employer name"></div>
          <div class="field"><label class="label">Contact Number <span class="ev-req">*</span></label>
            <input class="input" id="nvContact" inputmode="tel" placeholder="Enter contact number"></div>
        </div>`;
      const foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>
        <button class="btn btn--primary" onclick="EmpVerifications.submitNew()">${App.icon('send')} Save &amp; Submit</button>`;
      App.modal.open(body, { title: 'New Employee Verification', icon: 'shieldcheck', wide: true, foot });
    },
    submitNew() {
      const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
      const name = val('nvName'), empId = val('nvId'), dept = val('nvDept'), desg = val('nvDesg');
      const prev = val('nvPrev'), contact = val('nvContact');
      if (!name || !empId || !dept || !desg || !contact) { App.toast('Please fill in all required fields.', 'alert'); return; }
      EV.added.unshift({
        id: empId, name, type: 'professional', aadhaar: 'pending', pan: 'pending',
        prev: prev || '—', epfo: 'pending', status: 'Pending', score: 0,
        dept, desg, contact, fresh: true,
      });
      App.modal.close();
      EV.query = ''; EV.type = 'all'; EV.status = 'all';   // ensure the new row is visible in the pending queue
      App.toast('Employee "' + name + '" submitted for verification.');
      App.reload();
    },

    /* ---- hero assistant hook ---- */
    ask(q) { App.assistant.toggle(true); if (q) App.assistant.ask(q); },
  };
  window.EmpVerifications = EV;

  /* ---- render helpers ---- */
  function srcCheck(state) {
    const m = { ok: ['checkcircle', 'Verified'], pending: ['clock', 'In progress'], fail: ['alert', 'Failed'] };
    const [ic, label] = m[state] || m.pending;
    return `<span class="ev-check ev-check--${state}" title="${label}">${App.icon(ic)}</span>`;
  }
  function scoreBadge(score) {
    if (!score) return `<span class="ev-score ev-score--none" title="Not started">–</span>`;
    const k = score >= 90 ? 'green' : score >= 70 ? 'amber' : 'red';
    return `<span class="ev-score ev-score--${k}"><span class="num">${score}</span><em>%</em></span>`;
  }
  function statusPill(s) {
    const k = s === 'Completed' ? 'green' : s === 'In Progress' ? 'amber' : 'gray';
    return `<span class="pill pill--${k} pill--dot">${App.esc(s)}</span>`;
  }

  // shown instead of the roster until the employer has synced an HRMS — there are no
  // real employee records yet, but a faded table preview hints at the roster's shape.
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
    const previewRows = [1, 2, 3].map(() => `
      <tr>
        <td><div class="row gap-10"><span class="kpi__icon" style="width:30px;height:30px;background:var(--surface-2);color:var(--faint)">${App.icon('user')}</span>
          <div><b style="font-size:13px;color:var(--muted)">Employee Name</b>
          <div class="muted" style="font-size:11.5px;margin-top:2px">Employee ID</div></div></div></td>
        <td style="text-align:center">—</td><td style="text-align:center">—</td>
        <td class="muted" style="font-size:12.5px">Previous Employer</td>
        <td style="text-align:center">—</td>
        <td>${App.ui.pill('Not synced', 'gray')}</td>
        <td style="text-align:center">—</td><td></td>
      </tr>`).join('');

    return `<div class="page fade-in">
      <div class="hero reveal">
        <div class="hero__wash"></div>
        <div class="hero__in">
          <div class="eyebrow">${App.icon('plug')} Setup required</div>
          <h1 class="h-grad" style="margin-top:12px">Sync your HRMS to see your employees.</h1>
          <p class="lead">Connect your HR system first — employee records and verification status will populate here automatically once synced.</p>
          <button class="btn btn--accent" style="margin-top:16px" onclick="App.navigate('emp-hrms')">${App.icon('plug')} Go to HRMS Sync</button>
        </div>
      </div>
      <div class="grid grid-4 reveal" style="margin-bottom:22px;opacity:.6;pointer-events:none">${previewKpis}</div>
      <div class="card reveal" style="overflow:hidden;opacity:.6;pointer-events:none">
        <div class="card__head"><div class="grow"><h3>Verification roster</h3><div class="muted" style="font-size:12.5px;margin-top:2px">This is what your roster will look like once synced</div></div></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl ev-tbl">
            <thead><tr>
              <th>Employee</th><th style="text-align:center">Aadhaar</th><th style="text-align:center">PAN</th>
              <th>Prev. Employment</th><th style="text-align:center">EPFO</th><th>Status</th>
              <th style="text-align:center">Score</th><th></th>
            </tr></thead>
            <tbody>${previewRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  App.registerView('emp-verifications', {
    title: 'Employee Verifications',
    subtitle: 'Manage and track employee verification status',
    render(ctx) {
      const org = (ctx && ctx.user && ctx.user.org) || (DB.profiles.employer && DB.profiles.employer.org);
      if (window.EmpHrms && !EmpHrms.hasActiveConnection(org)) return syncPromptPage();
      const paramTab = ctx.params && ctx.params.tab;
      if (paramTab && paramTab !== EV._lastParam && (paramTab === 'overview' || paramTab === 'manual')) { EV.tab = paramTab; EV._lastParam = paramTab; }
      const rows = EV.filtered();
      const total = EV.all().length;
      const filtering = !!(EV.query.trim() || EV.type !== 'all' || EV.status !== 'all');

      /* ---- editorial hero ---- */
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('shieldcheck')} Verification console</div>
                <h1 class="h-grad" style="margin-top:12px">Every worker, verified at source.</h1>
                <p class="lead">Track verification status across Aadhaar, PAN and EPFO — with a live trust score for every employee on your rolls, matched straight from the golden record.</p>
                <div class="row gap-10 mt-16 wrap" style="align-items:center">
                  <span class="pill pill--accent">${App.icon('building')} Aditya Birla Construction Ltd.</span>
                  <span class="mono" style="font-size:12px;color:var(--muted)">12 sites · HR console</span>
                  ${App.ui.verified('EPFO-linked')}
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="EmpVerifications.ask('Which employees are stuck in verification and why?')">${App.icon('sparkles')} Ask WiN</button>
                <button class="btn" onclick="EmpVerifications.exportReport()">${App.icon('download')} Export Report</button>
                <button class="btn btn--accent" onclick="EmpVerifications.openNew()">${App.icon('plus')} New Verification</button>
              </div>
            </div>
          </div>
        </div>`;

      /* ---- header stats (org-wide) ---- */
      const stats = `
        <div class="grid grid-4 reveal" style="margin-bottom:22px">
          ${App.ui.kpi('shield', '#2f5fd0', 'Total Employees', App.num(1247), 'Across all sites')}
          ${App.ui.kpi('checkcircle', '#0e9f6e', 'Verified', App.num(1182), '94.8% verified rate')}
          ${App.ui.kpi('clock', '#c07d10', 'In Progress', App.num(42), 'Awaiting source match')}
          ${App.ui.kpi('alert', '#667085', 'Pending', App.num(23), 'Not yet started')}
        </div>`;

      /* ---- search + filter chips ---- */
      const typeChip = (k, l) => `<button class="ev-fchip ${EV.type === k ? 'is-active' : ''}" onclick="EmpVerifications.setType('${k}')">${l}</button>`;
      const statChip = (k, l) => `<button class="ev-fchip ${EV.status === k ? 'is-active' : ''}" onclick="EmpVerifications.setStatus('${k.replace(/'/g, "\\'")}')">${l}</button>`;
      const filterBody = `
        <div class="card__body" style="padding-bottom:6px">
          <div class="ev-searchbar">
            <div class="ev-search input--icon">
              ${App.icon('search')}
              <input class="input" id="evSearch" placeholder="Search by name or employee ID..." value="${App.esc(EV.query)}" oninput="EmpVerifications.search(this.value)">
              ${EV.query ? `<button class="ev-clear" onclick="EmpVerifications.clear()" title="Clear">${App.icon('x')}</button>` : ''}
            </div>
            <button class="btn" onclick="EmpVerifications.filtersInfo()">${App.icon('filter')} Filters</button>
          </div>
          <div class="ev-filterrow">
            <span class="ev-flabel">Employee Type</span>
            <div class="ev-chips">${typeChip('all', 'All')}${typeChip('professional', 'Professionals')}${typeChip('gig', 'Gig Workers')}</div>
          </div>
          <div class="ev-filterrow" style="margin-bottom:0">
            <span class="ev-flabel">Status</span>
            <div class="ev-chips">${statChip('all', 'All')}${statChip('Completed', 'Completed')}${statChip('In Progress', 'In Progress')}${statChip('Pending', 'Pending')}</div>
          </div>
        </div>`;

      /* ---- table body ---- */
      let body;
      if (!rows.length) {
        body = `<tr><td colspan="8" style="padding:0"><div class="empty" style="padding:38px 20px">${App.icon('search', 'empty__ic')}<b>No employees found</b><span>No records match your search and filters.</span></div></td></tr>`;
      } else {
        body = rows.map(r => `
          <tr class="clickable" onclick="EmpVerifications.open('${r.id}')">
            <td>
              <div class="row gap-12">
                ${App.ui.avatar(r.name, 'sm')}
                <div>
                  <div class="row gap-8" style="align-items:center"><b>${App.esc(r.name)}</b>${r.fresh ? '<span class="pill pill--accent" style="font-size:10px;padding:1px 7px">New</span>' : ''}${r.type === 'gig' ? '<span class="pill pill--teal" style="font-size:10px;padding:1px 7px">Gig</span>' : ''}</div>
                  <div class="mono" style="font-size:11.5px;color:var(--muted)">${App.esc(r.id)}</div>
                </div>
              </div>
            </td>
            <td style="text-align:center">${srcCheck(r.aadhaar)}</td>
            <td style="text-align:center">${srcCheck(r.pan)}</td>
            <td>${App.esc(r.prev)}</td>
            <td style="text-align:center">${srcCheck(r.epfo)}</td>
            <td>${statusPill(r.status)}</td>
            <td style="text-align:center">${scoreBadge(r.score)}</td>
            <td style="text-align:right"><button class="iconbtn ev-actions" title="Actions" onclick="event.stopPropagation();EmpVerifications.rowMenu('${r.id}')">${DOTS}</button></td>
          </tr>`).join('');
      }

      /* ---- footer / pagination (inside the roster card) ---- */
      const footer = `
        <div class="ev-foot">
          <span class="muted" style="font-size:13px">Showing <b class="num" style="color:var(--ink)">${rows.length}</b> of <span class="num">${total}</span> employees</span>
          <div class="ev-pager">
            <button class="ev-page" disabled>${App.icon('arrowleft')} Previous</button>
            <button class="ev-page is-active"><span class="num">1</span></button>
            <button class="ev-page" onclick="EmpVerifications.page(2,true)"><span class="num">2</span></button>
            <button class="ev-page" onclick="EmpVerifications.page(3,true)"><span class="num">3</span></button>
            <button class="ev-page" onclick="EmpVerifications.page('next',true)">Next ${App.icon('arrow')}</button>
          </div>
        </div>`;

      /* ---- roster card (head + filters + table + footer) ---- */
      const roster = `
        <div class="card reveal" style="overflow:hidden">
          <div class="card__head">
            <div class="grow"><h3>Verification roster</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Live per-source status — click any row for the full verification trail</div></div>
            <span class="pill ${filtering ? 'pill--accent' : 'pill--gray'}">${App.icon('users')} <span class="num">${rows.length}</span>${filtering ? ' matched' : ' on roster'}</span>
          </div>
          ${filterBody}
          <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
            <table class="tbl ev-tbl">
              <thead><tr>
                <th>Employee</th><th style="text-align:center">Aadhaar</th><th style="text-align:center">PAN</th>
                <th>Prev. Employment</th><th style="text-align:center">EPFO</th><th>Status</th>
                <th style="text-align:center">Score</th><th style="text-align:right">Actions</th>
              </tr></thead>
              <tbody>${body}</tbody>
            </table>
          </div>
          ${footer}
        </div>`;

      /* ---- manual document review (HRMS fallback) ---- */
      const pendingDocs = MANUAL_DOCS.filter(d => d.status === 'Pending Review').length;
      const manualRows = MANUAL_DOCS.map(d => `
        <tr>
          <td><b style="font-size:13px">${App.esc(d.worker)}</b><div class="faint mono" style="font-size:11px;margin-top:2px">${App.esc(d.winId)}</div></td>
          <td>${App.esc(d.docType)}</td>
          <td>${App.esc(d.uploadedOn)}</td>
          <td>${App.ui.statusPill(d.status === 'Pending Review' ? 'Pending' : d.status)}</td>
          <td style="text-align:right">${d.status === 'Pending Review'
            ? `<button class="btn btn--sm btn--primary" onclick="EmpVerifications.reviewDoc('${d.id}')">${App.icon('shieldcheck')} Review</button>`
            : `<span class="muted" style="font-size:12.5px">${App.icon(d.status === 'Approved' ? 'checkcircle' : 'x')} ${App.esc(d.status)}</span>`}</td>
        </tr>`).join('');
      const manualReview = `
        <div class="banner banner--info reveal" style="margin-bottom:18px">${App.icon('idcard')}<div>When a worker can't be verified through your HRMS, they can upload a salary slip or appointment letter instead. Review and approve or reject those submissions here.</div></div>
        <div class="card reveal" style="overflow:hidden">
          <div class="card__head">
            <div class="grow"><h3>Manual Document Verification</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Documents uploaded when HRMS verification isn't available</div></div>
            <span class="pill ${pendingDocs ? 'pill--amber' : 'pill--gray'}">${App.icon('clock')} <span class="num">${pendingDocs}</span> pending</span>
          </div>
          <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
            <table class="tbl">
              <thead><tr><th>Worker</th><th>Document</th><th>Uploaded</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
              <tbody>${manualRows}</tbody>
            </table>
          </div>
        </div>`;

      const tabs = `
        <div class="tabs">
          <div class="tab ${EV.tab === 'overview' ? 'is-active' : ''}" onclick="EmpVerifications.setTab('overview')">${App.icon('shieldcheck')} Verification Roster</div>
          <div class="tab ${EV.tab === 'manual' ? 'is-active' : ''}" onclick="EmpVerifications.setTab('manual')">${App.icon('idcard')} Manual Document Review${pendingDocs ? ` <span class="nav__tag">${pendingDocs}</span>` : ''}</div>
        </div>`;

      return `<div class="page fade-in">
        <style>
          .ev-searchbar{ display:flex; gap:12px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
          .ev-search{ flex:1; min-width:220px; }
          .ev-search .input{ padding-right:40px; }
          .ev-clear{ position:absolute; right:8px; top:50%; transform:translateY(-50%); width:26px; height:26px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--faint); transition:.13s; }
          .ev-clear:hover{ background:var(--surface-2); color:var(--ink); }
          .ev-filterrow{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:12px; }
          .ev-flabel{ font-family:var(--font-mono); font-size:11px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--faint); min-width:104px; }
          .ev-chips{ display:flex; gap:8px; flex-wrap:wrap; }
          .ev-fchip{ padding:6px 13px; border-radius:var(--r-full); border:1px solid var(--line); background:var(--surface); font-size:12.5px; font-weight:600; color:var(--muted); transition:.13s; }
          .ev-fchip:hover{ border-color:var(--accent); color:var(--accent-strong); }
          .ev-fchip.is-active{ background:var(--accent-weak); border-color:var(--accent); color:var(--accent-strong); }
          .ev-tbl td{ vertical-align:middle; }
          .ev-check{ display:inline-flex; }
          .ev-check--ok{ color:var(--green-600); }
          .ev-check--pending{ color:var(--amber-600); }
          .ev-check--fail{ color:var(--red-600); }
          .ev-score{ width:42px; height:42px; border-radius:50%; display:inline-flex; align-items:baseline; justify-content:center; padding-top:12px; font-family:var(--font-num); font-variant-numeric:tabular-nums; font-weight:700; font-size:13px; border:2px solid var(--line); color:var(--muted); background:var(--surface-2); }
          .ev-score .num{ font-weight:700; }
          .ev-score em{ font-style:normal; font-size:9px; font-weight:600; margin-left:1px; opacity:.8; }
          .ev-score--green{ color:var(--green-700); border-color:var(--green-100); background:var(--green-50); }
          .ev-score--amber{ color:var(--amber-700); border-color:var(--amber-100); background:var(--amber-50); }
          .ev-score--red{ color:var(--red-700); border-color:var(--red-100); background:var(--red-50); }
          .ev-score--none{ color:var(--faint); align-items:center; padding-top:0; font-size:16px; }
          .ev-actions{ width:32px; height:32px; }
          .ev-foot{ display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:15px 18px; border-top:1px solid var(--line); }
          .ev-pager{ display:flex; gap:6px; flex-wrap:wrap; }
          .ev-page{ display:inline-flex; align-items:center; gap:5px; min-width:36px; justify-content:center; padding:7px 12px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); font-size:13px; font-weight:600; color:var(--ink-2); transition:.13s; }
          .ev-page:hover:not(:disabled):not(.is-active){ background:var(--surface-2); border-color:#d9dee8; }
          .ev-page.is-active{ background:var(--accent); border-color:transparent; color:var(--accent-fg); }
          .ev-page.is-active .num{ color:var(--accent-fg); }
          .ev-page:disabled{ color:var(--faint); cursor:not-allowed; opacity:.7; }
          .ev-page .ico{ width:15px; height:15px; }
          .ev-req{ color:var(--red-600); }
          .ev-menu{ display:flex; flex-direction:column; gap:2px; }
          .ev-menu button{ display:flex; align-items:center; gap:11px; padding:11px 12px; border-radius:var(--r-sm); font-size:13.5px; font-weight:500; color:var(--ink-2); text-align:left; transition:.13s; }
          .ev-menu button:hover{ background:var(--surface-2); color:var(--ink); }
          .ev-menu button .ico{ color:var(--muted); }
          .ev-menu__danger{ color:var(--red-600)!important; }
          .ev-menu__danger .ico{ color:var(--red-600)!important; }
          .ev-fmts{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
          .ev-fmt{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:18px 10px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); transition:.13s; }
          .ev-fmt:hover{ border-color:var(--accent); background:var(--accent-weak); }
          .ev-fmt__ic{ width:40px; height:40px; border-radius:var(--r-sm); display:grid; place-items:center; background:var(--accent-weak); color:var(--accent); }
          .ev-fmt b{ font-size:13.5px; }
          .ev-fmt span{ font-size:11.5px; color:var(--muted); font-family:var(--font-mono); }
          @media (max-width:640px){ .ev-flabel{ min-width:0; } }
        </style>

        ${hero}
        ${stats}
        ${tabs}
        ${EV.tab === 'overview' ? roster : manualReview}
      </div>`;
    },
    mounted() {
      if (EV._focusSearch) {
        const el = document.getElementById('evSearch');
        if (el) { el.focus(); const v = el.value; el.value = ''; el.value = v; }   // keep focus + caret at end across reloads
        EV._focusSearch = false;
      }
    },
  });
})();
