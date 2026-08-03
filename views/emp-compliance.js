/* Employer · Compliance — file statutory compliance returns (PF, ESI, Labour
   Welfare Fund, Minimum Wages) and see organisation-wide grievance patterns
   (by category, by site) raised against this employer. Deliberately
   read-only/aggregate — not a case-by-case ticketing queue; resolution
   happens through WiN's standard grievance-routing process, not here.
   Editorial hero + stats + two tabs, same shell as Employee Verifications. */
(function () {
  const RETURNS = [
    { id: 'RET-PF-0326', type: 'EPF Monthly Return', period: 'Mar 2026', due: '15 Apr 2026', amount: 428600, status: 'Pending' },
    { id: 'RET-ESI-0326', type: 'ESI Monthly Return', period: 'Mar 2026', due: '21 Apr 2026', amount: 96400, status: 'Pending' },
    { id: 'RET-LWF-Q1', type: 'Labour Welfare Fund', period: 'Q1 2026', due: '05 Apr 2026', amount: 18200, status: 'Overdue' },
    { id: 'RET-MW-0226', type: 'Minimum Wages Compliance', period: 'Feb 2026', due: '10 Mar 2026', amount: 0, status: 'Filed' },
    { id: 'RET-PF-0226', type: 'EPF Monthly Return', period: 'Feb 2026', due: '15 Mar 2026', amount: 411200, status: 'Filed' },
    { id: 'RET-ESI-0226', type: 'ESI Monthly Return', period: 'Feb 2026', due: '21 Mar 2026', amount: 92800, status: 'Filed' },
  ];

  // company-level view, not a case-by-case ticketing queue — resolution happens
  // through the normal grievance/HR process; this is read-only visibility into
  // patterns across the organisation (category, site, trend).
  const CASE_CATEGORIES = [
    { name: 'EPFO / Provident Fund', count: 42, c: '#2f5fd0' },
    { name: 'ESIC / Health Insurance', count: 27, c: '#0e9f6e' },
    { name: 'Salary / Wage Disputes', count: 23, c: '#c07d10' },
    { name: 'Work Site Safety', count: 15, c: '#d64545' },
    { name: 'Employer Conduct', count: 9, c: '#6b4fc7' },
  ];
  const CASE_SITES = [
    { name: 'Gurugram Site', count: 38 },
    { name: 'Delhi Site', count: 31 },
    { name: 'Noida Site', count: 26 },
    { name: 'Faridabad Site', count: 21 },
  ];
  // categories the employer can actually act on (wage/pay and their own conduct);
  // everything else (EPFO, ESIC, safety) is routed to and resolved by the
  // relevant ministry/regulator via the government Grievances console, not here.
  const EMPLOYER_ACTIONABLE = ['Salary / Wage Disputes', 'Employer Conduct'];
  const RECENT_CASES = [
    { id: 'GRV-4509', subject: 'ESIC Claim Reimbursement', category: 'ESIC / Health Insurance', site: 'Gurugram Site', filed: '2026-03-22', status: 'In Progress' },
    { id: 'GRV-4498', subject: 'EPFO Withdrawal Pending', category: 'EPFO / Provident Fund', site: 'Delhi Site', filed: '2026-03-12', status: 'In Progress' },
    { id: 'GRV-4482', subject: 'Supervisor Misconduct Complaint', category: 'Employer Conduct', site: 'Gurugram Site', filed: '2026-03-08', status: 'In Progress' },
    { id: 'GRV-4476', subject: 'Salary Discrepancy — Feb', category: 'Salary / Wage Disputes', site: 'Noida Site', filed: '2026-02-28', status: 'Resolved' },
    { id: 'GRV-4451', subject: 'Work Site Safety Concern', category: 'Work Site Safety', site: 'Gurugram Site', filed: '2026-02-15', status: 'Resolved' },
  ];

  const EC = {
    tab: 'returns',
    added: [],
    // keep the sidebar's nested Compliance Returns / Grievances Overview children
    // (see PERSONAS.employer nav in core.js) in sync with the in-page tab bar.
    setTab(t) { EC.tab = t; App.state.params = Object.assign({}, App.state.params, { tab: t }); App.reload(); },
    allReturns() { return EC.added.concat(RETURNS); },

    openFile(id) {
      const r = EC.allReturns().find(x => x.id === id); if (!r) return;
      App.modal.open(`
        <div class="banner banner--info" style="margin-bottom:14px">${App.icon('file')}<div><b>${App.esc(r.type)}</b><div style="margin-top:3px;opacity:.9">Period: ${App.esc(r.period)} · Due: ${App.esc(r.due)}</div></div></div>
        <div class="field"><label class="label">Amount payable (₹)</label><input class="input" id="ecAmt" inputmode="numeric" value="${r.amount || ''}" placeholder="Enter amount"></div>
        <div class="field" style="margin-top:12px"><label class="label">Challan / Acknowledgement Reference</label><input class="input" id="ecRef" placeholder="e.g. CHN2026034821"></div>
        <label class="row gap-8" style="margin-top:14px;align-items:flex-start;cursor:pointer">
          <input type="checkbox" id="ecAck" style="margin-top:3px">
          <span style="font-size:13px">I confirm the details above are accurate and this return is being filed for ${App.esc(r.period)}.</span>
        </label>`, {
        title: 'File Compliance Return', icon: 'filecheck',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="EmpCompliance.confirmFile('${id}')">${App.icon('filecheck')} Submit Return</button>`,
      });
    },
    confirmFile(id) {
      const ack = document.getElementById('ecAck');
      if (!ack || !ack.checked) { App.toast('Please confirm the acknowledgement to continue', 'alert'); return; }
      const r = EC.allReturns().find(x => x.id === id); if (r) r.status = 'Filed';
      App.modal.close();
      App.toast('Compliance return filed', 'checkcircle');
      App.reload();
    },

    // scoped to categories that are genuinely the employer's to act on (wage
    // disputes, their own conduct) — a response, not a resolution; the case
    // stays routed through WiN until the worker/ministry closes it. Everything
    // else (EPFO, ESIC, safety) has no action here by design.
    respondCase(id) {
      const c = RECENT_CASES.find(x => x.id === id); if (!c) return;
      App.modal.open(`
        <div class="banner banner--info" style="margin-bottom:14px">${App.icon('message')}<div><b>${App.esc(c.subject)}</b><div style="margin-top:3px;opacity:.9">${App.esc(c.category)} · ${App.esc(c.site)}</div></div></div>
        <p class="muted" style="font-size:13px;margin-bottom:12px">Your response is shared with the worker and logged against this case — it does not close the case; that happens through WiN's standard grievance process.</p>
        <div class="field"><label class="label">Your response</label><textarea class="textarea" id="ecRespNote" placeholder="Describe the action you're taking or have taken"></textarea></div>`,
        {
          title: 'Respond to Grievance', icon: 'message',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="EmpCompliance.confirmRespond('${id}')">${App.icon('send')} Send Response</button>`,
        });
    },
    confirmRespond(id) {
      const note = document.getElementById('ecRespNote');
      const text = (note && note.value.trim()) || '';
      if (!text) { App.toast('Add a response before sending', 'alert'); return; }
      const c = RECENT_CASES.find(x => x.id === id); if (c) c.employerResponse = text;
      App.modal.close();
      App.toast('Response sent to worker', 'checkcircle');
      App.reload();
    },
  };
  window.EmpCompliance = EC;

  function returnsTab() {
    const rows = EC.allReturns();
    const pending = rows.filter(r => r.status === 'Pending').length;
    const overdue = rows.filter(r => r.status === 'Overdue').length;
    const rowsHtml = rows.map(r => `
      <tr>
        <td><b style="font-size:13px">${App.esc(r.type)}</b><div class="faint mono" style="font-size:11px;margin-top:2px">${App.esc(r.id)}</div></td>
        <td>${App.esc(r.period)}</td>
        <td>${App.esc(r.due)}</td>
        <td>${r.amount ? '₹' + App.num(r.amount) : '—'}</td>
        <td>${App.ui.statusPill(r.status)}</td>
        <td style="text-align:right">${r.status === 'Filed'
          ? `<span class="muted" style="font-size:12.5px">${App.icon('checkcircle')} Filed</span>`
          : `<button class="btn btn--sm btn--primary" onclick="EmpCompliance.openFile('${r.id}')">${App.icon('filecheck')} File Return</button>`}</td>
      </tr>`).join('');
    return `
      <div class="grid grid-4 reveal" style="margin-bottom:22px">
        ${App.ui.kpi('file', '#2f5fd0', 'Total Returns', rows.length, 'This financial year')}
        ${App.ui.kpi('clock', '#c07d10', 'Pending', pending, 'Due within the cycle')}
        ${App.ui.kpi('alert', '#c53030', 'Overdue', overdue, 'File immediately')}
        ${App.ui.kpi('checkcircle', '#0e9f6e', 'Filed', rows.filter(r => r.status === 'Filed').length, 'Up to date')}
      </div>
      <div class="card reveal" style="overflow:hidden">
        <div class="card__head"><div class="grow"><h3>Compliance Returns</h3><div class="muted" style="font-size:12.5px;margin-top:2px">EPF, ESI, Labour Welfare Fund and minimum-wages filings</div></div></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>Return</th><th>Period</th><th>Due Date</th><th>Amount</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }

  function grievancesTab() {
    const totalN = CASE_CATEGORIES.reduce((s, c) => s + c.count, 0);
    const openN = RECENT_CASES.filter(c => c.status !== 'Resolved').length;
    const maxCat = Math.max.apply(null, CASE_CATEGORIES.map(c => c.count));
    const maxSite = Math.max.apply(null, CASE_SITES.map(s => s.count));

    const stats = `
      <div class="grid grid-4 reveal" style="margin-bottom:22px">
        ${App.ui.kpi('message', '#c07d10', 'Total Cases (FY)', totalN, 'Across all sites')}
        ${App.ui.kpi('checkcircle', '#0e9f6e', 'Resolution Rate', '87%', 'Company-wide, this quarter')}
        ${App.ui.kpi('clock', '#2f5fd0', 'Avg. Resolution Time', '4.2d', 'Within SLA')}
        ${App.ui.kpi('alert', '#667085', 'Currently Open', openN, 'Being handled via WiN routing')}
      </div>`;

    const banner = `<div class="banner banner--info reveal mb-20">${App.icon('idcard')}<div>This is an organisation-wide view of grievance patterns — not a case-management queue. Individual cases are routed and resolved through WiN's standard grievance process, not actioned here.</div></div>`;

    const catRows = CASE_CATEGORIES.map(c => `
      <div class="gd-sector" style="margin-bottom:14px">
        <div class="row between wrap gap-8" style="margin-bottom:6px">
          <span class="row gap-8" style="font-size:13px"><span class="gd-dot" style="background:${c.c};width:9px;height:9px;border-radius:50%;display:inline-block"></span><b>${App.esc(c.name)}</b></span>
          <span class="muted num" style="font-size:12px">${c.count} cases</span>
        </div>
        ${App.ui.bar(Math.round(c.count / maxCat * 100), c.c)}
      </div>`).join('');

    const siteRows = CASE_SITES.map(s => `
      <div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line-2)">
        <span style="font-size:13px">${App.esc(s.name)}</span>
        <div class="row gap-10" style="align-items:center;min-width:140px">
          <div style="flex:1">${App.ui.bar(Math.round(s.count / maxSite * 100), '#2f5fd0')}</div>
          <span class="num" style="font-size:12.5px;font-weight:600;min-width:22px;text-align:right">${s.count}</span>
        </div>
      </div>`).join('');

    const catCard = `
      <div class="card reveal">
        <div class="card__head"><div class="grow"><h3>Cases by Category</h3><div class="muted" style="font-size:12.5px;margin-top:2px">What workers are raising grievances about, company-wide</div></div></div>
        <div class="card__body">${catRows}</div>
      </div>`;

    const siteCard = `
      <div class="card reveal">
        <div class="card__head"><h3 class="grow">Cases by Site</h3></div>
        <div class="card__body" style="padding-top:4px">${siteRows}</div>
      </div>`;

    const recentRows = RECENT_CASES.map(c => {
      const actionable = EMPLOYER_ACTIONABLE.includes(c.category) && c.status !== 'Resolved';
      const action = c.employerResponse
        ? `<span class="muted" style="font-size:12px">${App.icon('checkcircle')} Responded</span>`
        : actionable
          ? `<button class="btn btn--sm" onclick="EmpCompliance.respondCase('${c.id}')">${App.icon('send')} Respond</button>`
          : `<span class="faint" style="font-size:12px">Routed via WiN</span>`;
      return `
      <tr>
        <td class="mono" style="font-size:12px">${App.esc(c.id)}</td>
        <td>${App.esc(c.subject)}</td>
        <td class="muted" style="font-size:12.5px">${App.esc(c.category)}</td>
        <td>${App.esc(c.site)}</td>
        <td>${App.esc(c.filed)}</td>
        <td>${App.ui.statusPill(c.status)}</td>
        <td style="text-align:right">${action}</td>
      </tr>`;
    }).join('');

    const recentCard = `
      <div class="card reveal" style="overflow:hidden">
        <div class="card__head"><div class="grow"><h3>Recent Cases</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Worker identity kept confidential — respond only where the issue is yours to act on (wage disputes, employer conduct); everything else is handled by the relevant ministry via WiN</div></div></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>Case ID</th><th>Subject</th><th>Category</th><th>Site</th><th>Filed</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
            <tbody>${recentRows}</tbody>
          </table>
        </div>
      </div>`;

    return `
      ${stats}
      ${banner}
      <div class="grid grid-2 reveal" style="margin-bottom:20px;align-items:start">${catCard}${siteCard}</div>
      ${recentCard}`;
  }

  App.registerView('emp-compliance', {
    title: 'Compliance',
    subtitle: 'File statutory returns and see organisation-wide grievance patterns',
    render(ctx) {
      const paramTab = ctx.params && ctx.params.tab;
      if (paramTab && paramTab !== EC._lastParam && (paramTab === 'returns' || paramTab === 'grievances')) { EC.tab = paramTab; EC._lastParam = paramTab; }
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('filecheck')} Compliance</div>
            <h1 class="h-grad" style="margin-top:12px">Stay ahead of every filing.</h1>
            <p class="lead">File statutory compliance returns and see grievance patterns across your organisation — all against your verified WiN organisation record.</p>
          </div>
        </div>`;
      const tabs = `
        <div class="tabs">
          <div class="tab ${EC.tab === 'returns' ? 'is-active' : ''}" onclick="EmpCompliance.setTab('returns')">${App.icon('filecheck')} Compliance Returns</div>
          <div class="tab ${EC.tab === 'grievances' ? 'is-active' : ''}" onclick="EmpCompliance.setTab('grievances')">${App.icon('message')} Grievances Overview</div>
        </div>`;
      return `<div class="page fade-in">
        ${hero}
        ${tabs}
        ${EC.tab === 'returns' ? returnsTab() : grievancesTab()}
      </div>`;
    },
  });
})();
