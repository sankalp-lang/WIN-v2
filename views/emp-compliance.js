/* Employer · Compliance — file statutory compliance returns (PF, ESI, Labour
   Welfare Fund, Minimum Wages) and manage worker grievance cases raised
   against this employer. Editorial hero + stats + two tabs, same shell as
   Employee Verifications. */
(function () {
  const RETURNS = [
    { id: 'RET-PF-0326', type: 'EPF Monthly Return', period: 'Mar 2026', due: '15 Apr 2026', amount: 428600, status: 'Pending' },
    { id: 'RET-ESI-0326', type: 'ESI Monthly Return', period: 'Mar 2026', due: '21 Apr 2026', amount: 96400, status: 'Pending' },
    { id: 'RET-LWF-Q1', type: 'Labour Welfare Fund', period: 'Q1 2026', due: '05 Apr 2026', amount: 18200, status: 'Overdue' },
    { id: 'RET-MW-0226', type: 'Minimum Wages Compliance', period: 'Feb 2026', due: '10 Mar 2026', amount: 0, status: 'Filed' },
    { id: 'RET-PF-0226', type: 'EPF Monthly Return', period: 'Feb 2026', due: '15 Mar 2026', amount: 411200, status: 'Filed' },
    { id: 'RET-ESI-0226', type: 'ESI Monthly Return', period: 'Feb 2026', due: '21 Mar 2026', amount: 92800, status: 'Filed' },
  ];

  const CASES = [
    { id: 'GRV-4498', worker: 'Rajan Kumar', winId: 'WIN-2024-8834-1029', subject: 'EPFO Withdrawal Pending', filed: '2025-03-12', status: 'In Progress' },
    { id: 'GRV-4509', worker: 'Suresh Yadav', winId: 'WIN-2024-7712-4453', subject: 'ESIC Claim Reimbursement', filed: '2025-03-22', status: 'In Progress' },
    { id: 'GRV-4476', worker: 'Mahesh Pawar', winId: 'WIN-2024-6620-9981', subject: 'Salary Discrepancy — Feb', filed: '2025-02-28', status: 'Resolved' },
  ];

  const EC = {
    tab: 'returns',
    added: [],
    setTab(t) { EC.tab = t; App.reload(); },
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

    resolveCase(id) {
      const c = CASES.find(x => x.id === id); if (!c) return;
      App.modal.open(`
        <div class="banner banner--info" style="margin-bottom:14px">${App.icon('message')}<div><b>${App.esc(c.subject)}</b><div style="margin-top:3px;opacity:.9">Raised by ${App.esc(c.worker)} · WIN ID <span class="mono">${App.esc(c.winId)}</span></div></div></div>
        <div class="field"><label class="label">Resolution notes</label><textarea class="textarea" id="ecResNote" placeholder="Describe the action taken to resolve this case"></textarea></div>`,
        {
          title: 'Resolve Grievance Case', icon: 'checkcircle',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" style="background:var(--green-600)" onclick="EmpCompliance.confirmResolve('${id}')">${App.icon('checkcircle')} Mark Resolved</button>`,
        });
    },
    confirmResolve(id) {
      const c = CASES.find(x => x.id === id); if (c) c.status = 'Resolved';
      App.modal.close();
      App.toast('Grievance case marked resolved', 'checkcircle');
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
    const openN = CASES.filter(c => c.status !== 'Resolved').length;
    const rowsHtml = CASES.map(c => `
      <tr>
        <td class="mono" style="font-size:12.5px">${App.esc(c.id)}</td>
        <td><b style="font-size:13px">${App.esc(c.worker)}</b><div class="faint mono" style="font-size:11px;margin-top:2px">${App.esc(c.winId)}</div></td>
        <td>${App.esc(c.subject)}</td>
        <td>${App.esc(c.filed)}</td>
        <td>${App.ui.statusPill(c.status)}</td>
        <td style="text-align:right">${c.status === 'Resolved'
          ? `<span class="muted" style="font-size:12.5px">${App.icon('checkcircle')} Resolved</span>`
          : `<button class="btn btn--sm btn--primary" style="background:var(--green-600)" onclick="EmpCompliance.resolveCase('${c.id}')">${App.icon('checkcircle')} Resolve</button>`}</td>
      </tr>`).join('');
    return `
      <div class="grid grid-4 reveal" style="margin-bottom:22px">
        ${App.ui.kpi('message', '#c07d10', 'Open Cases', openN, 'Raised by verified workers')}
        ${App.ui.kpi('checkcircle', '#0e9f6e', 'Resolved', CASES.filter(c => c.status === 'Resolved').length, 'This quarter')}
        ${App.ui.kpi('file', '#667085', 'Total Cases', CASES.length, 'All time')}
        ${App.ui.kpi('clock', '#2f5fd0', 'Avg. Resolution', '4d', 'Faster than SLA')}
      </div>
      <div class="card reveal" style="overflow:hidden">
        <div class="card__head"><div class="grow"><h3>Grievance Cases</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Cases workers have filed against this organisation, routed via WiN</div></div></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>Case ID</th><th>Worker</th><th>Subject</th><th>Filed</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }

  App.registerView('emp-compliance', {
    title: 'Compliance',
    subtitle: 'File statutory returns and manage worker grievance cases',
    render(ctx) {
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('filecheck')} Compliance</div>
            <h1 class="h-grad" style="margin-top:12px">Stay ahead of every filing.</h1>
            <p class="lead">File statutory compliance returns and resolve worker grievance cases — all against your verified WiN organisation record.</p>
          </div>
        </div>`;
      const tabs = `
        <div class="tabs">
          <div class="tab ${EC.tab === 'returns' ? 'is-active' : ''}" onclick="EmpCompliance.setTab('returns')">${App.icon('filecheck')} Compliance Returns</div>
          <div class="tab ${EC.tab === 'grievances' ? 'is-active' : ''}" onclick="EmpCompliance.setTab('grievances')">${App.icon('message')} Grievance Cases</div>
        </div>`;
      return `<div class="page fade-in">
        ${hero}
        ${tabs}
        ${EC.tab === 'returns' ? returnsTab() : grievancesTab()}
      </div>`;
    },
  });
})();
