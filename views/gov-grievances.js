/* Government · Grievance Management — editorial hero, national KPI stats
   (with inverted good/bad trend colouring), a working grievance queue
   filterable by status & category (row → detail modal with Assign /
   Escalate / Resolve actions that mutate state + toast), a bulk-export
   flow, and the analytics band: grievances by department, 6-month
   resolution trends, category breakdown and priority distribution. */
(function () {
  // ---- inline icons not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 16}" height="${s || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    alertCircle: svg('<circle cx="12" cy="12" r="10"/><path d="M12 7v5M12 16h.01"/>'),
    up: svg('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>', 13),
    down: svg('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>', 13),
  };

  // =============================================================
  // demo data (faithful to the GovGrievances spec)
  // =============================================================
  // KPI stats — note the INVERTED colouring: for a grievance queue a fall
  // is "good" (green) and a rise is "bad" (red), except Resolved where a
  // rise is good. `good` drives the colour, `dir` drives the arrow.
  const STATS = [
    { label: 'Total Active', val: '1,847', sub: 'Open across all states', delta: '12%', dir: 'down', good: true, icon: 'alert', c: '#B77E12' },
    { label: 'Escalated', val: '342', sub: 'Breached / priority', delta: '8%', dir: 'up', good: false, ico: ICO.alertCircle, c: '#D8493A' },
    { label: 'Under Review', val: '786', sub: 'With assigned officers', delta: '5%', dir: 'down', good: true, icon: 'clock', c: '#3B54E8' },
    { label: 'Resolved (MTD)', val: '1,234', sub: 'Closed this month', delta: '18%', dir: 'up', good: true, icon: 'checkcircle', c: '#1F9E6C' },
  ];

  const DEPTS = [
    { name: 'e-Shram Cell', count: 482 },
    { name: 'EPFO', count: 398 },
    { name: 'ESIC Regional', count: 345 },
    { name: 'Income Tax', count: 287 },
    { name: 'Labour Welfare', count: 198 },
    { name: 'BOCW', count: 137 },
  ];
  const DEPT_MAX = Math.max.apply(null, DEPTS.map(d => d.count));

  const TREND = [
    { m: 'Jun', resolved: 1020, neu: 980 },
    { m: 'Jul', resolved: 1140, neu: 1050 },
    { m: 'Aug', resolved: 1080, neu: 1120 },
    { m: 'Sep', resolved: 1200, neu: 1060 },
    { m: 'Oct', resolved: 1280, neu: 1100 },
    { m: 'Nov', resolved: 1234, neu: 950 },
  ];
  const TREND_SCALE = 1400;

  const CATEGORY = [
    { name: 'e-Shram', pct: 34, c: '#0E8C82' },
    { name: 'EPFO / UAN', pct: 28, c: '#3B54E8' },
    { name: 'ESIC', pct: 22, c: '#6b4fc7' },
    { name: 'PAN / Tax', pct: 16, c: '#B77E12' },
  ];

  const PRIORITY = [
    { name: 'High', count: 342, pct: 18.5, c: '#D8493A' },
    { name: 'Medium', count: 786, pct: 42.5, c: '#B77E12' },
    { name: 'Low', count: 719, pct: 39.0, c: '#1F9E6C' },
  ];

  // ---- filter dictionaries ----
  const CAT_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'eshram', label: 'e-Shram' },
    { key: 'epfo', label: 'EPFO / UAN' },
    { key: 'esic', label: 'ESIC' },
    { key: 'pan', label: 'PAN / Tax' },
  ];
  const STATUS_FILTERS = ['all', 'Escalated', 'Under Review', 'Assigned', 'Resolved'];

  const OFFICERS = [
    'A. Sharma — e-Shram Cell, Patna',
    'R. Iyer — ESIC Regional, Mumbai',
    'P. Deshpande — EPFO Zonal, Delhi',
    'K. Menon — Labour Welfare Board',
  ];

  // ---- the working queue (a live subset of the 1,847 active cases) ----
  const QUEUE = [
    { id: 'GRV-88214', worker: 'Meena Devi', winId: 'WIN-2024-5521-7781', catKey: 'eshram', cat: 'e-Shram', dept: 'e-Shram Cell', state: 'Bihar', priority: 'High', status: 'Escalated', date: '2026-07-09', subject: 'e-Shram card blocked after Aadhaar mismatch', detail: 'Worker reports her e-Shram card was deactivated when the linked Aadhaar demographic record failed a re-verification. She is unable to claim the PMSBY accident cover linked to the card.' },
    { id: 'GRV-88191', worker: 'Ramesh Yadav', winId: 'WIN-2023-1188-4420', catKey: 'epfo', cat: 'EPFO / UAN', dept: 'EPFO', state: 'Uttar Pradesh', priority: 'High', status: 'Escalated', date: '2026-07-08', subject: 'PF not deposited by employer for 4 months', detail: 'UAN shows no PF credit since March. Employer TRRN records confirm deductions from salary but no deposit to EPFO — a compliance breach flagged for zonal enforcement.' },
    { id: 'GRV-88176', worker: 'Sunita Kumari', winId: 'WIN-2024-9032-1123', catKey: 'esic', cat: 'ESIC', dept: 'ESIC Regional', state: 'Maharashtra', priority: 'Medium', status: 'Under Review', date: '2026-07-10', subject: 'ESIC claim rejected despite valid treatment', detail: 'Cashless treatment at an empanelled hospital was denied. Contribution history is continuous and eligibility appears valid; case routed to the ESIC regional office for reassessment.' },
    { id: 'GRV-88160', worker: 'Abdul Rahman', winId: 'WIN-2022-4471-8890', catKey: 'pan', cat: 'PAN / Tax', dept: 'Income Tax', state: 'Kerala', priority: 'Low', status: 'Under Review', date: '2026-07-11', subject: 'PAN–UAN linkage failing on portal', detail: 'Name spelling differs across PAN and UAN records, causing the golden-record merge to fail. Awaiting a demographic correction from the Income Tax database.' },
    { id: 'GRV-88142', worker: 'Lakshmi Narayan', winId: 'WIN-2024-2210-5567', catKey: 'eshram', cat: 'e-Shram', dept: 'e-Shram Cell', state: 'Tamil Nadu', priority: 'Medium', status: 'Under Review', date: '2026-07-07', subject: 'Duplicate e-Shram registration flagged', detail: 'Two e-Shram records resolve to the same worker across different mobile numbers. Deduplication has quarantined both pending manual confirmation of the primary record.' },
    { id: 'GRV-88129', worker: 'Pooja Sharma', winId: 'WIN-2023-7788-2231', catKey: 'epfo', cat: 'EPFO / UAN', dept: 'EPFO', state: 'Rajasthan', priority: 'Medium', status: 'Assigned', date: '2026-07-06', subject: 'UAN activation stuck at OTP step', assignedTo: 'P. Deshpande — EPFO Zonal, Delhi', detail: 'UAN activation OTP is not being delivered to the Aadhaar-linked mobile. Assigned to EPFO Zonal for a manual mobile-seeding update.' },
    { id: 'GRV-88110', worker: 'Vijay Singh', winId: 'WIN-2024-3345-9902', catKey: 'esic', cat: 'ESIC', dept: 'ESIC Regional', state: 'Punjab', priority: 'Low', status: 'Resolved', date: '2026-07-03', subject: 'ESIC dispensary mapping incorrect', assignedTo: 'R. Iyer — ESIC Regional, Mumbai', detail: 'Worker was mapped to a dispensary 40 km away. Home dispensary re-assigned to the correct pin-code catchment; worker notified.' },
    { id: 'GRV-88097', worker: 'Fatima Bi', winId: 'WIN-2023-5567-1140', catKey: 'eshram', cat: 'e-Shram', dept: 'Labour Welfare', state: 'Telangana', priority: 'High', status: 'Escalated', date: '2026-07-05', subject: 'Welfare board benefit not credited', detail: 'Approved construction-welfare benefit of ₹8,000 has not been credited three weeks after sanction. Escalated to the Labour Welfare Board for a payment-status trace.' },
    { id: 'GRV-88083', worker: 'Anil Kumar', winId: 'WIN-2024-6621-7788', catKey: 'pan', cat: 'PAN / Tax', dept: 'Income Tax', state: 'Delhi NCR', priority: 'Low', status: 'Resolved', date: '2026-07-02', subject: 'Form-16 mismatch with declared income', assignedTo: 'K. Menon — Labour Welfare Board', detail: 'Declared income did not match employer Form-16. Reconciled against verified TDS records; the golden record now reflects the corrected figure.' },
    { id: 'GRV-88061', worker: 'Kavita Rao', winId: 'WIN-2022-9910-3345', catKey: 'esic', cat: 'ESIC', dept: 'ESIC Regional', state: 'Karnataka', priority: 'Medium', status: 'Under Review', date: '2026-07-04', subject: 'Maternity benefit claim delayed', detail: 'Maternity benefit claim pending beyond the 30-day SLA. Contribution eligibility confirmed; awaiting disbursement confirmation from the regional office.' },
    { id: 'GRV-88044', worker: 'Suresh Patil', winId: 'WIN-2024-1123-6678', catKey: 'eshram', cat: 'e-Shram', dept: 'BOCW', state: 'Maharashtra', priority: 'High', status: 'Escalated', date: '2026-07-06', subject: 'BOCW cess benefit rejected without reason', detail: 'A registered building & construction worker was denied a cess-funded benefit with no stated ground. Escalated to BOCW for a written reason and review.' },
    { id: 'GRV-88025', worker: 'Geeta Kumari', winId: 'WIN-2023-8834-2290', catKey: 'epfo', cat: 'EPFO / UAN', dept: 'EPFO', state: 'West Bengal', priority: 'Low', status: 'Resolved', date: '2026-06-30', subject: 'PF transfer between employers pending', assignedTo: 'P. Deshpande — EPFO Zonal, Delhi', detail: 'Inter-employer PF transfer was stuck at the previous employer\'s attestation. Transfer completed via the auto-transfer facility; balance reflected in the current UAN.' },
  ];

  // ---- bulk-generate an extensive, realistic tail of cases (registry-scale queue) ----
  const GEN_FIRST = ['Ramesh','Suresh','Anita','Kavita','Rajesh','Sunil','Priya','Deepak','Manoj','Geeta',
    'Vikram','Neha','Ashok','Rekha','Sanjay','Meena','Vinod','Poonam','Arun','Shobha',
    'Ravi','Usha','Naresh','Kiran','Mahesh','Lata','Dinesh','Sarita','Rakesh','Radha'];
  const GEN_LAST = ['Kumar','Devi','Singh','Yadav','Sharma','Verma','Gupta','Patel','Reddy','Nair',
    'Das','Mishra','Rao','Chauhan','Prasad','Bano','Khan','Iyer','Pillai','Joshi'];
  const GEN_CATS = [
    { catKey: 'eshram', cat: 'e-Shram', dept: 'e-Shram Cell', subjects: ['e-Shram card renewal pending', 'Mobile number update rejected', 'Duplicate e-Shram registration', 'Accident cover claim delayed'] },
    { catKey: 'epfo', cat: 'EPFO / UAN', dept: 'EPFO', subjects: ['PF withdrawal stuck at KYC stage', 'UAN activation OTP not received', 'Employer PF deposit missing', 'Inter-employer PF transfer pending'] },
    { catKey: 'esic', cat: 'ESIC', dept: 'ESIC Regional', subjects: ['ESIC claim rejected', 'Dispensary mapping incorrect', 'Maternity benefit delayed', 'Cashless treatment denied'] },
    { catKey: 'pan', cat: 'PAN / Tax', dept: 'Income Tax', subjects: ['PAN-UAN linkage failing', 'Form-16 mismatch with declared income', 'TDS credit not reflecting', 'PAN correction request pending'] },
  ];
  const GEN_STATES = ['Maharashtra','Uttar Pradesh','Bihar','West Bengal','Madhya Pradesh','Tamil Nadu',
    'Rajasthan','Karnataka','Telangana','Kerala','Gujarat','Punjab','Haryana','Odisha','Delhi NCR','Assam'];
  const GEN_STATUS = ['Escalated', 'Under Review', 'Assigned', 'Resolved', 'Resolved', 'Under Review'];
  const GEN_PRIORITY = ['High', 'Medium', 'Medium', 'Low'];

  function genQueue(count, startId) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const c = GEN_CATS[i % GEN_CATS.length];
      const status = GEN_STATUS[i % GEN_STATUS.length];
      const priority = status === 'Escalated' ? 'High' : GEN_PRIORITY[i % GEN_PRIORITY.length];
      const state = GEN_STATES[i % GEN_STATES.length];
      const worker = GEN_FIRST[i % GEN_FIRST.length] + ' ' + GEN_LAST[(i * 7 + 3) % GEN_LAST.length];
      const day = 30 - (i % 30);
      const month = 5 + Math.floor(i / 30) % 3; // May, Jun, Jul 2026
      const date = `2026-${String(month).padStart(2, '0')}-${String(Math.max(1, day)).padStart(2, '0')}`;
      out.push({
        id: 'GRV-' + (startId - i),
        worker, winId: 'WIN-2024-' + (1000 + i * 13) + '-' + (2000 + i * 7),
        catKey: c.catKey, cat: c.cat, dept: c.dept, state, priority, status, date,
        subject: c.subjects[i % c.subjects.length],
        detail: c.subjects[i % c.subjects.length] + ' — case ' + (startId - i) + ' registered via the state labour office and routed to ' + c.dept + ' for action.',
        assignedTo: (status === 'Assigned' || status === 'Resolved') ? OFFICERS[i % OFFICERS.length] : undefined,
        resolution: status === 'Resolved' ? 'Resolved by registry officer after source verification.' : undefined,
      });
    }
    return out;
  }
  const QUEUE_FULL = QUEUE.concat(genQueue(108, 87990));

  const TODAY = new Date(2026, 6, 17); // 17 Jul 2026
  const ageOf = d => Math.max(0, Math.round((TODAY - new Date(d)) / 86400000));

  // =============================================================
  // local state + controller
  // =============================================================
  const S = { status: 'all', cat: 'all', state: 'all', rows: QUEUE_FULL.slice(), detailId: null, mode: 'view' };
  const alive = () => App.state.route === 'gov-grievances';
  const rowById = id => S.rows.find(r => r.id === id);

  const statusMeta = s => ({
    Escalated: 'red', 'Under Review': 'amber', Assigned: 'blue', Resolved: 'green', Open: 'gray',
  }[s] || 'gray');
  const prioMeta = p => ({
    High: { c: '#D8493A', pill: 'red' }, Medium: { c: '#B77E12', pill: 'amber' }, Low: { c: '#1F9E6C', pill: 'green' },
  }[p] || { c: 'var(--muted)', pill: 'gray' });

  const G = {
    setStatus(s) { S.status = s; App.reload(); },
    setCat(c) { S.cat = c; App.reload(); },
    setState(v) { S.state = v; App.reload(); },

    // ---- detail modal ----
    openDetail(id) { S.detailId = id; S.mode = 'view'; G.renderModal(); },
    step(mode) { S.mode = mode; G.renderModal(); },

    escalate(id) {
      const r = rowById(id); if (!r) return;
      r.status = 'Escalated'; r.priority = 'High';
      App.modal.close();
      App.toast('Case ' + id + ' escalated · priority raised to High', 'alert');
      App.reload();
    },
    confirmAssign(id) {
      const r = rowById(id); if (!r) return;
      const sel = document.getElementById('ggOfficer');
      const officer = sel ? sel.value : OFFICERS[0];
      r.assignedTo = officer;
      if (r.status !== 'Resolved' && r.status !== 'Escalated') r.status = 'Assigned';
      App.modal.close();
      App.toast('Assigned to ' + officer.split(' — ')[0], 'send');
      App.reload();
    },
    confirmResolve(id) {
      const r = rowById(id); if (!r) return;
      const el = document.getElementById('ggResNote');
      r.resolution = (el && el.value.trim()) || 'Resolved by registry officer.';
      r.status = 'Resolved';
      App.modal.close();
      App.toast('Case ' + id + ' marked resolved', 'checkcircle');
      App.reload();
    },

    renderModal() {
      const r = rowById(S.detailId); if (!r) return;
      const pm = prioMeta(r.priority);
      const info = (label, val, mono) => `
        <div class="gg-kv">
          <div class="gg-kv__l">${label}</div>
          <div class="gg-kv__v ${mono ? 'mono' : ''}">${val}</div>
        </div>`;

      const header = `
        <div class="gg-mhead">
          <div class="row between wrap gap-10" style="align-items:flex-start">
            <div>
              <div class="mono" style="font-size:12px;color:var(--muted)">${App.esc(r.id)}</div>
              <b style="font-size:16.5px;display:block;margin-top:3px;line-height:1.3">${App.esc(r.subject)}</b>
            </div>
            <span class="pill pill--${statusMeta(r.status)}">${App.icon('dot')}${App.esc(r.status)}</span>
          </div>
          <div class="row gap-16 mt-12" style="align-items:center">
            ${App.ui.avatar(r.worker, 'sm')}
            <div class="grow"><b style="font-size:13.5px">${App.esc(r.worker)}</b><div class="mono" style="font-size:11.5px;color:var(--muted)">${App.esc(r.winId)}</div></div>
          </div>
        </div>`;

      const meta = `
        <div class="gg-kvgrid">
          ${info('Category', App.esc(r.cat))}
          ${info('Routed to', App.esc(r.dept))}
          ${info('State', App.esc(r.state))}
          ${info('Priority', `<span class="pill pill--${pm.pill}">${App.esc(r.priority)}</span>`)}
          ${info('Filed', `<span class="num">${App.esc(r.date)}</span>`, false)}
          ${info('Age', `<span class="num">${ageOf(r.date)} days</span>`)}
        </div>
        <div class="gg-detailbox">${App.esc(r.detail)}</div>
        ${r.assignedTo ? `<div class="banner banner--info" style="align-items:center;font-size:12.5px;margin-top:14px">${App.icon('user')}<div>Assigned to <b>${App.esc(r.assignedTo)}</b></div></div>` : ''}
        ${r.resolution ? `<div class="banner banner--green" style="align-items:flex-start;font-size:12.5px;margin-top:12px">${App.icon('checkcircle')}<div><b>Resolution</b><div style="margin-top:2px">${App.esc(r.resolution)}</div></div></div>` : ''}`;

      let body, foot;
      if (S.mode === 'assign') {
        body = header + `
          <div class="field mt-16" style="margin-bottom:0">
            <label class="label">Assign to officer</label>
            <select class="select" id="ggOfficer">
              ${OFFICERS.map(o => `<option ${r.assignedTo === o ? 'selected' : ''}>${App.esc(o)}</option>`).join('')}
            </select>
            <div class="hint">The worker and the receiving office are notified automatically.</div>
          </div>`;
        foot = `
          <button class="btn" onclick="GovGrievances.step('view')">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--primary" onclick="GovGrievances.confirmAssign('${r.id}')">${App.icon('send')} Confirm assignment</button>`;
      } else if (S.mode === 'resolve') {
        body = header + `
          <div class="field mt-16" style="margin-bottom:0">
            <label class="label">Resolution note</label>
            <textarea class="textarea" id="ggResNote" rows="4" placeholder="Describe the action taken and the outcome for the worker…"></textarea>
            <div class="hint">Recorded against the case and shared with the worker via the WiN portal.</div>
          </div>`;
        foot = `
          <button class="btn" onclick="GovGrievances.step('view')">${App.icon('arrowleft')} Back</button>
          <button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" onclick="GovGrievances.confirmResolve('${r.id}')">${App.icon('checkcircle')} Mark resolved</button>`;
      } else {
        body = header + meta;
        const resolved = r.status === 'Resolved';
        foot = `
          <button class="btn" onclick="GovGrievances.step('assign')">${App.icon('user')} Assign</button>
          <button class="btn btn--danger" ${resolved ? 'disabled' : ''} onclick="GovGrievances.escalate('${r.id}')">${App.icon('alert')} Escalate</button>
          <button class="btn btn--accent" ${resolved ? 'disabled' : ''} onclick="GovGrievances.step('resolve')">${App.icon('checkcircle')} Resolve</button>`;
      }
      App.modal.open(body, { title: 'Grievance detail', icon: 'message', wide: true, foot });
    },

    // ---- bulk export ----
    bulkExport() {
      const rows = filtered();
      const sample = rows.slice(0, 8);
      const thead = '<tr><th>Case ID</th><th>Worker</th><th>Category</th><th>State</th><th>Priority</th><th>Status</th></tr>';
      const tbody = sample.map(r => `<tr><td class="mono">${App.esc(r.id)}</td><td>${App.esc(r.worker)}</td><td>${App.esc(r.cat)}</td><td>${App.esc(r.state)}</td><td>${App.esc(r.priority)}</td><td>${App.esc(r.status)}</td></tr>`).join('');
      App.modal.open(`
        <p class="muted" style="margin:0 0 12px;font-size:13px">Preview of the current queue view — <b class="num" style="color:var(--ink)">${rows.length}</b> case${rows.length === 1 ? '' : 's'} matching your filters. Showing the first ${sample.length}:</p>
        <div class="tablewrap tablewrap--scroll" style="max-height:260px;overflow:auto">
          <table class="tbl">${rows.length ? `<thead>${thead}</thead><tbody>${tbody}</tbody>` : ''}</table>
        </div>
        <div class="row gap-10 wrap mt-16">
          <button class="btn btn--primary" onclick="GovGrievances.doExport('CSV')">${App.icon('download')} Download CSV</button>
          <button class="btn" onclick="GovGrievances.doExport('Excel')">${App.icon('chart')} Download Excel</button>
          <button class="btn" onclick="GovGrievances.doExport('PDF')">${App.icon('doc')} Download PDF</button>
        </div>`, { title: 'Preview & Export Grievances', icon: 'download', wide: true });
    },
    doExport(fmt) {
      App.modal.close();
      const rows = filtered();
      const headers = ['Case ID', 'Worker', 'WIN ID', 'Category', 'Routed to', 'State', 'Priority', 'Status', 'Filed', 'Age (days)'];
      const data = rows.map(r => [r.id, r.worker, r.winId, r.cat, r.dept, r.state, r.priority, r.status, r.date, ageOf(r.date)]);
      App.downloadReport('win-grievance-queue', 'WiN Grievance Queue Export', headers, data, fmt);
      App.toast('Queue (' + rows.length + ' cases) exported as ' + fmt, 'download');
    },
  };
  window.GovGrievances = G;

  // filtered rows (status + category + state)
  function filtered() {
    return S.rows.filter(r =>
      (S.status === 'all' || r.status === S.status) &&
      (S.cat === 'all' || r.catKey === S.cat) &&
      (S.state === 'all' || r.state === S.state)
    );
  }

  // =============================================================
  // render helpers
  // =============================================================
  function statCard(o) {
    const col = o.good ? 'var(--green-700)' : 'var(--red-600)';
    const arrow = o.dir === 'up' ? ICO.up : ICO.down;
    const ic = o.ico || App.icon(o.icon);
    return `<div class="kpi">
      <div class="kpi__top">
        <div class="kpi__label">${App.esc(o.label)}</div>
        <div class="kpi__icon" style="background:${o.c}1a;color:${o.c}">${ic}</div>
      </div>
      <div class="kpi__val">${App.esc(o.val)}</div>
      <div class="kpi__sub muted">${App.esc(o.sub)}</div>
      <div class="kpi__sub" style="color:${col};font-weight:600;display:flex;align-items:center;gap:4px">${arrow}<span class="num">${o.dir === 'up' ? '+' : '−'}${App.esc(o.delta)}</span> vs last month</div>
    </div>`;
  }

  function deptCard() {
    const rows = DEPTS.map(d => `
      <div class="gg-deptrow">
        <div class="row between" style="margin-bottom:6px">
          <span style="font-size:13px">${App.esc(d.name)}</span>
          <span class="num" style="font-size:12.5px;font-weight:600;color:var(--ink)">${App.num(d.count)}</span>
        </div>
        <div class="bar"><div class="bar__fill" style="width:${(d.count / DEPT_MAX * 100).toFixed(1)}%;background:var(--accent)"></div></div>
      </div>`).join('');
    return `<div class="card reveal">
      <div class="card__head">${App.icon('landmark')}<h3 class="grow">Grievances by Department</h3></div>
      <div class="card__body">${rows}</div>
    </div>`;
  }

  function trendCard() {
    const cols = TREND.map(t => {
      const rh = (t.resolved / TREND_SCALE * 100).toFixed(1);
      const nh = (t.neu / TREND_SCALE * 100).toFixed(1);
      return `<div class="gg-tcol">
        <div class="gg-tbars">
          <div class="gg-tbar" style="height:${rh}%;background:var(--green-600)" title="Resolved · ${App.num(t.resolved)}"></div>
          <div class="gg-tbar" style="height:${nh}%;background:var(--amber-600)" title="New · ${App.num(t.neu)}"></div>
        </div>
        <div class="gg-tlabel">${App.esc(t.m)}</div>
      </div>`;
    }).join('');
    return `<div class="card reveal">
      <div class="card__head">${App.icon('trend')}<h3 class="grow">Resolution Trends</h3><span class="faint" style="font-size:12px">Last 6 months</span></div>
      <div class="card__body">
        <div class="gg-tchart">${cols}</div>
        <div class="row gap-16 wrap" style="margin-top:14px;padding-top:13px;border-top:1px solid var(--line-2);font-size:12.5px;color:var(--muted)">
          <span class="row gap-6"><span class="gg-dot" style="background:var(--green-600)"></span>Resolved</span>
          <span class="row gap-6"><span class="gg-dot" style="background:var(--amber-600)"></span>New</span>
        </div>
      </div>
    </div>`;
  }

  function categoryCard() {
    const rows = CATEGORY.map(c => `
      <div class="gg-deptrow">
        <div class="row between" style="margin-bottom:6px">
          <span class="row gap-8" style="font-size:13px"><span class="gg-dot" style="background:${c.c}"></span>${App.esc(c.name)}</span>
          <span class="num" style="font-size:12.5px;font-weight:600;color:var(--ink)">${c.pct}%</span>
        </div>
        <div class="bar"><div class="bar__fill" style="width:${c.pct}%;background:${c.c}"></div></div>
      </div>`).join('');
    return `<div class="card reveal">
      <div class="card__head">${App.icon('pie')}<h3 class="grow">Category Breakdown</h3></div>
      <div class="card__body">${rows}</div>
    </div>`;
  }

  function priorityCard() {
    const stack = PRIORITY.map(p => `<span class="gg-seg" style="width:${p.pct}%;background:${p.c}" title="${App.esc(p.name)} · ${p.pct}%"></span>`).join('');
    const rows = PRIORITY.map(p => `
      <div class="row between gg-priorow">
        <span class="row gap-8" style="font-size:13px"><span class="gg-dot" style="background:${p.c}"></span>${App.esc(p.name)} priority</span>
        <span style="font-size:12.5px;color:var(--muted)"><b class="num" style="color:var(--ink)">${App.num(p.count)}</b> · <span class="num">${p.pct.toFixed(1)}%</span></span>
      </div>`).join('');
    return `<div class="card reveal">
      <div class="card__head">${App.icon('filter')}<h3 class="grow">Priority Distribution</h3></div>
      <div class="card__body">
        <div class="gg-stack">${stack}</div>
        <div class="mt-16">${rows}</div>
      </div>
    </div>`;
  }

  // =============================================================
  // view registration
  // =============================================================
  App.registerView('gov-grievances', {
    title: 'Grievance Management',
    subtitle: 'Monitor & resolve worker grievances',
    render() {
      const rows = filtered();

      // status counts for the filter chips
      const counts = { all: S.rows.length };
      STATUS_FILTERS.forEach(s => { if (s !== 'all') counts[s] = S.rows.filter(r => r.status === s).length; });

      const statusChips = STATUS_FILTERS.map(s =>
        `<button class="gg-chip ${S.status === s ? 'is-active' : ''}" onclick="GovGrievances.setStatus('${s}')">${s === 'all' ? 'All' : App.esc(s)} <span class="num">${counts[s]}</span></button>`
      ).join('');

      const catChips = CAT_FILTERS.map(c =>
        `<button class="gg-chip ${S.cat === c.key ? 'is-active' : ''}" onclick="GovGrievances.setCat('${c.key}')">${App.esc(c.label)}</button>`
      ).join('');

      const govStates = (window.DB && DB.govStates) || [];
      const stateNames = Array.from(new Set(S.rows.map(r => r.state)));
      const orderedStates = govStates.filter(n => stateNames.includes(n)).concat(stateNames.filter(n => govStates.indexOf(n) === -1).sort());
      const stateOptions = ['<option value="all">All States</option>'].concat(
        orderedStates.map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${App.esc(n)}</option>`)
      ).join('');

      let tbody;
      if (!rows.length) {
        tbody = `<tr><td colspan="7" style="padding:0"><div class="empty" style="padding:34px 20px">${App.icon('search', 'empty__ic')}<b>No grievances match</b><span>Adjust the status or category filters.</span></div></td></tr>`;
      } else {
        tbody = rows.map(r => {
          const pm = prioMeta(r.priority);
          const assignedSub = r.assignedTo ? `<div class="muted" style="font-size:11px;margin-top:2px">${App.esc(r.assignedTo.split(' — ')[0])}</div>` : '';
          return `<tr class="clickable" onclick="GovGrievances.openDetail('${r.id}')">
            <td><span class="mono" style="font-weight:600;color:var(--ink)">${App.esc(r.id)}</span></td>
            <td><b>${App.esc(r.worker)}</b>${assignedSub}<div class="muted" style="font-size:11px;margin-top:2px;max-width:34ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${App.esc(r.subject)}</div></td>
            <td>${App.ui.pill(r.cat, 'gray')}</td>
            <td><span style="font-size:12.5px">${App.esc(r.dept)}</span><div class="muted" style="font-size:11px;margin-top:2px">${App.esc(r.state)}</div></td>
            <td><span class="row gap-6" style="font-size:12.5px;font-weight:600;color:${pm.c}"><span class="gg-dot" style="background:${pm.c}"></span>${App.esc(r.priority)}</span></td>
            <td class="num" style="color:var(--muted);white-space:nowrap">${ageOf(r.date)}d</td>
            <td><span class="pill pill--${statusMeta(r.status)}">${App.icon('dot')}${App.esc(r.status)}</span></td>
          </tr>`;
        }).join('');
      }

      const queue = `
        <div class="card reveal" style="margin-bottom:24px">
          <div class="card__head">
            <div class="grow"><h3>Grievance Queue</h3><div class="muted" style="font-size:12.5px;margin-top:2px">A live working subset of active cases — click any row to action it</div></div>
            <span class="pill pill--accent">${App.icon('bell')} 24 awaiting action</span>
            <button class="btn btn--soft btn--sm" onclick="GovGrievances.bulkExport()">${App.icon('download')} Bulk export</button>
          </div>
          <div class="card__body" style="padding-bottom:8px">
            <div class="gg-filters">
              <div class="gg-filterline"><span class="gg-flabel">Status</span><div class="gg-chips">${statusChips}</div></div>
              <div class="gg-filterline"><span class="gg-flabel">Category</span><div class="gg-chips">${catChips}</div></div>
              <div class="gg-filterline"><span class="gg-flabel">State</span><select class="select gg-stsel" onchange="GovGrievances.setState(this.value)" aria-label="Filter by state">${stateOptions}</select></div>
            </div>
          </div>
          <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
            <table class="tbl">
              <thead><tr><th>Case ID</th><th>Worker</th><th>Category</th><th>Routed to</th><th>Priority</th><th>Age</th><th>Status</th></tr></thead>
              <tbody>${tbody}</tbody>
            </table>
          </div>
        </div>`;

      const style = `<style>
        .gg-hero-stats{ display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
        .gg-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block; }
        .gg-filters{ display:flex; flex-direction:column; gap:12px; margin-bottom:8px; }
        .gg-filterline{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .gg-stsel{ min-width:180px; font-weight:600; }
        .gg-flabel{ font-family:var(--font-mono); font-size:10.5px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--faint); width:64px; flex-shrink:0; }
        .gg-chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .gg-chip{ padding:6px 13px; border-radius:var(--r-full); font-size:12.5px; font-weight:600; border:1px solid var(--line); background:var(--surface); color:var(--muted); cursor:pointer; transition:.13s; white-space:nowrap; }
        .gg-chip:hover{ border-color:var(--accent); color:var(--accent-strong); }
        .gg-chip.is-active{ background:var(--accent); color:#fff; border-color:transparent; }
        .gg-chip.is-active .num{ color:#fff; }
        .gg-chip .num{ color:var(--faint); }
        .gg-deptrow{ margin-bottom:15px; }
        .gg-deptrow:last-child{ margin-bottom:0; }
        .gg-analytics{ display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; margin-top:2px; }
        .gg-tchart{ display:flex; align-items:flex-end; gap:12px; height:184px; padding-top:6px; }
        .gg-tcol{ flex:1; display:flex; flex-direction:column; align-items:center; gap:9px; height:100%; }
        .gg-tbars{ display:flex; align-items:flex-end; justify-content:center; gap:5px; width:100%; flex:1; }
        .gg-tbar{ width:15px; border-radius:5px 5px 0 0; min-height:4px; transition:height .5s cubic-bezier(.2,.7,.3,1); }
        .gg-tlabel{ font-family:var(--font-mono); font-size:11px; color:var(--muted); }
        .gg-stack{ display:flex; height:16px; border-radius:var(--r-full); overflow:hidden; background:var(--bg-2); }
        .gg-seg{ height:100%; }
        .gg-priorow{ padding:10px 0; border-bottom:1px solid var(--line-2); }
        .gg-priorow:last-child{ border-bottom:none; }
        /* modal internals */
        .gg-mhead{ padding-bottom:14px; border-bottom:1px solid var(--line-2); margin-bottom:16px; }
        .gg-kvgrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; }
        .gg-kv__l{ font-family:var(--font-mono); font-size:10.5px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--faint); margin-bottom:3px; }
        .gg-kv__v{ font-size:13.5px; color:var(--ink); font-weight:500; }
        .gg-detailbox{ margin-top:16px; padding:13px 15px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface-2); font-size:13px; line-height:1.55; color:var(--ink-2); }
        @media (max-width:1080px){ .gg-analytics{ grid-template-columns:1fr; } }
        @media (max-width:560px){ .gg-kvgrid{ grid-template-columns:1fr; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('message')} Registry operations · Grievances</div>
                <h1 class="h-grad" style="margin-top:12px">Every worker complaint, tracked to resolution.</h1>
                <p class="lead">Monitor and manage worker grievances across all states — assign, escalate and resolve from a single queue, with every action routed to the right ministry.</p>
                <div class="gg-hero-stats">
                  <span class="pill pill--red">${App.icon('alert')} <span class="num">342</span> escalated</span>
                  <span class="pill pill--amber">${App.icon('clock')} <span class="num">24</span> awaiting action</span>
                  <span class="pill pill--green">${App.icon('checkcircle')} <span class="num">92%</span> within SLA</span>
                </div>
              </div>
              <div class="row gap-10 wrap">
                <button class="btn" onclick="App.assistant.toggle(true);App.assistant.ask('What are the top grievance trends this month?')">${App.icon('sparkles')} Ask WiN</button>
                <button class="btn btn--primary" onclick="GovGrievances.bulkExport()">${App.icon('download')} Bulk export</button>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI stats -->
        <div class="grid grid-4 reveal" style="margin-bottom:24px">
          ${STATS.map(statCard).join('')}
        </div>

        ${queue}

        <!-- analytics band -->
        <div class="section-title reveal">Analytics</div>
        <div class="gg-analytics">
          ${deptCard()}
          ${trendCard()}
          ${categoryCard()}
          ${priorityCard()}
        </div>
      </div>`;
    }
  });
})();
