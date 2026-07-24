/* Government · Dashboard — national labour-data command center for the
   Ministry of Labour & Employment. Editorial hero + four tabs (Overview,
   Risk Vigilance, Compliance Gaps, Push Schemes & Alerts) with an
   Export-report modal, a header "Push Scheme" shortcut, a state-wise
   enrollment table, a sector distribution + 12-month enrollment sparkline,
   real-time employer risk flags, sector compliance trends with a live
   filter, and a scheme/alert push composer with quick templates and a send
   simulation. v2 editorial standard. */
(function () {
  // ---- inline icons not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 16}" height="${s || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    radio: svg('<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.5M16.2 16.2a6 6 0 0 0 0-8.5"/><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2"/>'),
    fileChart: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 17v-3M12 17v-5M15 17v-2"/>'),
    trendUp: svg('<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>', 15),
    trendDown: svg('<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>', 15),
  };

  // =============================================================
  // demo data (from the GovDashboard spec)
  // =============================================================
  const STATS = [
    { label: 'Workers Enrolled', val: '38.4 Cr', sub: '38,41,26,000 total', delta: '+6.8% this month', up: true, icon: 'users', c: '#0d9488' },
    { label: 'Employers Registered', val: '12,84,560', sub: 'Across 36 states & UTs', delta: '+2,340 this month', up: true, icon: 'building', c: '#2f5fd0' },
    { label: 'Active Grievances', val: '4,82,391', sub: '1,24,560 escalated', delta: '-8.4% from last month', up: false, icon: 'alert', c: '#c07d10' },
    { label: 'Verification Rate', val: '74.2%', sub: '28,50,57,492 verified', delta: '+2.8% this quarter', up: true, icon: 'shield', c: '#0e9f6e' },
  ];

  const ALERTS = [
    { kind: 'info', icon: 'trend', title: 'e-Shram enrollment surge in Bihar', body: '+4.2L workers registered in last 72 hours from Patna & Gaya', when: '1 hour ago' },
    { kind: 'warn', icon: 'clock', title: 'ESIC claim backlog: Maharashtra', body: '18,400 pending claims older than 45 days in Pune region', when: '3 hours ago' },
    { kind: 'alert', icon: 'alert', title: 'EPFO compliance alert', body: '2,340 employers have not deposited PF for 3+ months', when: '6 hours ago' },
    { kind: 'info', icon: 'checkcircle', title: 'Quarterly report generated', body: 'Q3 FY2024-25 national employment statistics ready', when: '1 day ago' },
  ];

  const STATES = [
    { name: 'Uttar Pradesh', enrolled: '5,12,34,000', employers: 184200, grievances: 72340, verif: 68 },
    { name: 'Maharashtra', enrolled: '4,28,56,000', employers: 212400, grievances: 58200, verif: 78 },
    { name: 'Bihar', enrolled: '3,42,18,000', employers: 89400, grievances: 61200, verif: 62 },
    { name: 'West Bengal', enrolled: '2,98,45,000', employers: 102300, grievances: 48900, verif: 70 },
    { name: 'Madhya Pradesh', enrolled: '2,56,12,000', employers: 78600, grievances: 42100, verif: 66 },
    { name: 'Tamil Nadu', enrolled: '2,34,78,000', employers: 156800, grievances: 31400, verif: 82 },
    { name: 'Rajasthan', enrolled: '2,18,90,000', employers: 92100, grievances: 38600, verif: 64 },
    { name: 'Karnataka', enrolled: '2,04,56,000', employers: 148900, grievances: 28700, verif: 80 },
  ];

  const SECTORS = [
    { name: 'Agriculture & Allied', val: '12,48,24,000', pct: 32.5, c: '#0e9f6e' },
    { name: 'Construction', val: '8,84,12,000', pct: 23.0, c: '#c07d10' },
    { name: 'Manufacturing', val: '5,38,18,000', pct: 14.0, c: '#2f5fd0' },
    { name: 'Gig & Platform', val: '3,84,12,600', pct: 10.0, c: '#0d9488' },
    { name: 'Domestic & Services', val: '3,46,12,000', pct: 9.0, c: '#e11d48' },
    { name: 'Others', val: '4,40,47,400', pct: 11.5, c: '#64748b' },
  ];

  const TREND = { vals: [45, 52, 48, 62, 58, 72, 68, 78, 74, 85, 82, 92], months: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] };

  // ---- Risk Vigilance ----
  const RISK_SUMMARY = [
    { c: '#d64545', val: '3,358', label: 'Total Employers Flagged', sub: 'Across all compliance categories' },
    { c: '#c07d10', val: '1,240', label: 'Late PF Submissions', sub: 'Most critical category' },
    { c: '#0d9488', val: '84.6%', label: 'Overall Compliance Rate', sub: '+1.2% from last month' },
  ];

  const RISK_FLAGS = [
    { title: 'EPFO / PF Deposits', sev: 'critical', desc: 'Late or missing PF deposits for 3+ consecutive months', count: 1240, delta: 84, up: true, updated: '2 hours ago' },
    { title: 'ESIC Coverage Gaps', sev: 'high', desc: 'Workers employed >10/day without ESIC registration', count: 876, delta: 12, up: false, updated: '4 hours ago' },
    { title: 'Minimum Wage Violations', sev: 'high', desc: 'Reported wages below state minimum wage thresholds', count: 512, delta: 29, up: true, updated: '6 hours ago' },
    { title: 'Contract Labour Non-compliance', sev: 'medium', desc: 'Unlicensed contract labour deployment > 20 workers', count: 348, delta: 5, up: false, updated: '1 day ago' },
    { title: 'Gratuity Fund Defaults', sev: 'medium', desc: 'Employers with workers >5 yrs without gratuity provision', count: 219, delta: 17, up: true, updated: '1 day ago' },
    { title: 'Maternity Benefit Non-compliance', sev: 'low', desc: 'Establishments with 10+ women workers lacking MB provisions', count: 163, delta: 3, up: false, updated: '2 days ago' },
  ];
  const SEV = {
    critical: { c: '#d64545', pill: 'red', label: 'Critical' },
    high: { c: '#e8712c', pill: 'amber', label: 'High' },
    medium: { c: '#2f5fd0', pill: 'blue', label: 'Medium' },
    low: { c: '#64748b', pill: 'gray', label: 'Low' },
  };
  const RISK_MAX = Math.max.apply(null, RISK_FLAGS.map(f => f.count));

  // ---- Compliance Gaps ----
  const FLOWS = [
    { name: 'Construction', in: '+42,000', out: '-28,000', net: '+14,000', trend: 'Growing' },
    { name: 'Manufacturing', in: '+31,000', out: '-19,000', net: '+12,000', trend: 'Growing' },
    { name: 'Agriculture', in: '+18,000', out: '-34,000', net: '-16,000', trend: 'Declining' },
    { name: 'Gig & Platform', in: '+86,000', out: '-52,000', net: '+34,000', trend: 'Growing' },
    { name: 'Services', in: '+28,000', out: '-22,000', net: '+6,000', trend: 'Growing' },
  ];

  const COMPLIANCE = [
    { name: 'Construction', pf: 68, esic: 71, wage: 82, change: '+3.2%', up: true },
    { name: 'Manufacturing', pf: 84, esic: 88, wage: 91, change: '+1.8%', up: true },
    { name: 'Gig & Platform', pf: 42, esic: 38, wage: 65, change: '-2.1%', up: false },
    { name: 'Agriculture', pf: 31, esic: 29, wage: 54, change: '-0.9%', up: false },
    { name: 'Services', pf: 76, esic: 79, wage: 88, change: '+2.4%', up: true },
    { name: 'Domestic Workers', pf: 24, esic: 18, wage: 49, change: '-1.5%', up: false },
  ];
  // Domestic Workers only shows under "All" — no dedicated filter chip.
  const SECTOR_CHIPS = ['All', 'Construction', 'Manufacturing', 'Gig & Platform', 'Agriculture', 'Services'];

  // ---- Push tab ----
  const AUDIENCES = [
    { key: 'all', title: 'All Users', sub: 'Workers + Employers', reach: '51.2L' },
    { key: 'workers', title: 'Workers Only', sub: '38.4 Cr registered', reach: '38.4L' },
    { key: 'employers', title: 'Employers Only', sub: '12.8L registered', reach: '8.4L' },
  ];
  const TEMPLATES = [
    { name: 'PM-SHRI Scheme', icon: 'graduation', title: 'New PM-SHRI Upskilling Scheme Launched', body: 'New PM Schools for Rising India (PM-SHRI) scheme has been launched. Skilled workers in construction & allied trades are eligible for upskilling benefits. Apply via e-Shram portal.' },
    { name: 'ESIC Health Alert', icon: 'shieldcheck', title: 'ESIC Cashless Treatment Expanded', body: 'ESIC has expanded cashless treatment facilities to 1,500+ new hospitals. All registered workers are now covered for critical illnesses without prior approval.' },
    { name: 'e-Shram Card Benefit', icon: 'idcard', title: '₹2 Lakh Accident Cover for e-Shram Cardholders', body: 'Workers with e-Shram cards are now eligible for ₹2 lakh accident insurance under PMSBY at zero premium. Ensure your card is updated.' },
  ];
  const RECENT = [
    { title: 'ESIC Health Benefit Expansion', audience: 'Workers', when: '2 days ago', reach: '38.4L reached' },
    { title: 'PF Withdrawal Process Update', audience: 'All', when: '5 days ago', reach: '51.2L reached' },
    { title: 'Compliance Deadline Reminder', audience: 'Employers', when: '1 week ago', reach: '8.4L reached' },
  ];

  // =============================================================
  // local state + controller
  // =============================================================
  const S = { tab: 'overview', sector: 'All', audience: 'all', pushTitle: '', pushBody: '', sent: false, recent: RECENT.slice() };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const alive = () => App.state.route === 'gov-dashboard';

  window.GovDash = {
    setTab(t) { S.tab = t; App.reload(); },
    pushScheme() { S.tab = 'push'; App.reload(); },
    setSector(s) { S.sector = s; App.reload(); },
    setAudience(a) { S.audience = a; App.reload(); },
    setField(k, v) { S[k] = v; },   // silent bind — no reload, so inputs keep focus
    viewAll() { App.toast('Full activity log is a demo affordance in this prototype'); },
    viewRiskList(t) { App.toast('Opening flagged-employer list · ' + t); },
    exportReport() {
      App.modal.open(`
        <p class="muted" style="margin:0 0 16px;font-size:13px">Generate a consolidated national labour-data report across enrollment, verification, grievances and compliance. Choose a format:</p>
        <div class="row gap-10 wrap">
          <button class="btn btn--primary" onclick="GovDash.doExport('PDF')">${App.icon('doc')} PDF Report</button>
          <button class="btn" onclick="GovDash.doExport('Excel')">${App.icon('chart')} Excel Workbook</button>
          <button class="btn" onclick="GovDash.doExport('CSV')">${App.icon('download')} Raw CSV</button>
        </div>`, { title: 'Export National Report', icon: 'chart' });
    },
    doExport(fmt) { App.modal.close(); App.toast('National report exported as ' + fmt, 'download'); },
    useTemplate(i) {
      const t = TEMPLATES[i]; if (!t) return;
      S.pushTitle = t.title; S.pushBody = t.body; S.sent = false;
      App.reload();
      App.toast('Template loaded · ' + t.name);
    },
    submitPush() {
      const te = document.getElementById('gdPushTitle');
      const be = document.getElementById('gdPushBody');
      const title = (te && te.value.trim()) || '';
      const body = (be && be.value.trim()) || '';
      S.pushTitle = title; S.pushBody = body;
      if (!title) { App.toast('Add a notification title to continue', 'alert'); if (te) te.focus(); return; }
      if (!body) { App.toast('Add a message body to continue', 'alert'); if (be) be.focus(); return; }
      const aud = AUDIENCES.find(a => a.key === S.audience) || AUDIENCES[0];
      S.recent.unshift({ title: title, audience: aud.title.replace(' Only', '').replace('All Users', 'All'), when: 'Just now', reach: aud.reach + ' targeted' });
      S.sent = true; App.reload();
      App.toast('Sent successfully', 'send');
      setTimeout(() => {
        if (!alive()) return;
        S.sent = false; S.pushTitle = ''; S.pushBody = ''; App.reload();
      }, 2500);
    },
  };

  // =============================================================
  // small render helpers
  // =============================================================
  function statCard(o) {
    return `<div class="kpi">
      <div class="kpi__top">
        <div class="kpi__label">${App.esc(o.label)}</div>
        <div class="kpi__icon" style="background:${o.c}1a;color:${o.c}">${App.icon(o.icon)}</div>
      </div>
      <div class="kpi__val num">${App.esc(o.val)}</div>
      <div class="kpi__sub muted">${App.esc(o.sub)}</div>
      <div class="kpi__sub" style="color:var(--green-700);font-weight:600">${o.up ? ICO.trendUp : ICO.trendDown}${App.esc(o.delta)}</div>
    </div>`;
  }

  function verifColor(v) { return v >= 80 ? 'var(--green-600)' : v >= 70 ? 'var(--amber-600)' : 'var(--red-600)'; }
  function complianceColor(v) { return v >= 75 ? 'var(--green-600)' : v >= 50 ? 'var(--amber-600)' : 'var(--red-600)'; }

  function sparkline(vals) {
    const w = 360, h = 104, pad = 8;
    const min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    const span = (max - min) || 1;
    const n = vals.length;
    const px = i => pad + i * (w - 2 * pad) / (n - 1);
    const py = v => pad + (1 - (v - min) / span) * (h - 2 * pad);
    const pts = vals.map((v, i) => [px(i), py(v)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = `M${pad} ${h - pad} ` + pts.map(p => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ` L${w - pad} ${h - pad} Z`;
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:104px;display:block;color:var(--accent)">
      <defs><linearGradient id="gdSparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity=".26"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${area}" fill="url(#gdSparkFill)" stroke="none"/>
      <path d="${line}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.6" fill="currentColor"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="6.5" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/>
    </svg>`;
  }

  // =============================================================
  // OVERVIEW
  // =============================================================
  function overviewTab() {
    const stats = `
      <div class="reveal">
        <div class="row between wrap gap-12 mb-12" style="align-items:center">
          <div class="section-title" style="margin:0">National snapshot</div>
          <span class="faint" style="font-size:12px">Live · FY 2024-25</span>
        </div>
        <div class="grid grid-4 mb-20">${STATS.map(statCard).join('')}</div>
      </div>`;

    const alertTint = { info: '#0d9488', warn: '#c07d10', alert: '#d64545' };
    const alerts = `
      <div class="card reveal mb-20">
        <div class="card__head">${App.icon('bell')}<h3 class="grow">System Alerts</h3><button class="btn btn--ghost btn--sm" onclick="GovDash.viewAll()">View all</button></div>
        <div class="card__body">
          <div class="grid grid-2">
            ${ALERTS.map(a => {
              const c = alertTint[a.kind];
              return `<div class="gd-alert">
                <div class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${c}1a;color:${c}">${App.icon(a.icon)}</div>
                <div class="grow" style="min-width:0">
                  <b style="font-size:13.5px">${App.esc(a.title)}</b>
                  <div class="muted" style="font-size:12.5px;margin-top:3px">${App.esc(a.body)}</div>
                  <div class="faint num" style="font-size:11.5px;margin-top:6px">${App.esc(a.when)}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    const stateRows = STATES.map(s => {
      const gv = s.grievances > 50000;
      return `<tr>
        <td><b>${App.esc(s.name)}</b></td>
        <td class="num">${App.esc(s.enrolled)}</td>
        <td class="num">${App.num(s.employers)}</td>
        <td class="num" style="${gv ? 'color:var(--red-600);font-weight:600' : ''}">${App.num(s.grievances)}</td>
        <td style="min-width:150px">
          <div class="gd-barcell">
            <span class="num" style="min-width:34px;color:${verifColor(s.verif)};font-weight:600">${s.verif}%</span>
            ${App.ui.bar(s.verif, verifColor(s.verif))}
          </div>
        </td>
      </tr>`;
    }).join('');

    const stateTable = `
      <div class="card">
        <div class="card__head"><h3 class="grow">State-wise Enrollment</h3><button class="btn btn--ghost btn--sm" onclick="App.navigate('gov-demographics')">View full map ${App.icon('arrow')}</button></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>State</th><th>Enrolled</th><th>Employers</th><th>Grievances</th><th>Verification</th></tr></thead>
            <tbody>${stateRows}</tbody>
          </table>
        </div>
      </div>`;

    const maxPct = Math.max.apply(null, SECTORS.map(s => s.pct));
    const sectorDist = `
      <div class="card">
        <div class="card__head">${App.icon('pie')}<h3 class="grow">Sector Distribution</h3></div>
        <div class="card__body">
          ${SECTORS.map(s => `
            <div class="gd-sector">
              <div class="row between" style="margin-bottom:6px">
                <span class="row gap-8" style="font-size:13px"><span class="gd-dot" style="background:${s.c}"></span>${App.esc(s.name)}</span>
                <span class="num" style="font-size:12px;color:var(--muted)"><b style="color:var(--ink)">${s.pct.toFixed(1)}%</b> · ${App.esc(s.val)}</span>
              </div>
              <div class="bar"><div class="bar__fill" style="width:${(s.pct / maxPct * 100).toFixed(1)}%;background:${s.c}"></div></div>
            </div>`).join('')}
        </div>
      </div>`;

    const trend = `
      <div class="card">
        <div class="card__head">${App.icon('trend')}<h3 class="grow">Enrollment Trend</h3><span class="faint" style="font-size:12px">Last 12 months</span></div>
        <div class="card__body">
          ${sparkline(TREND.vals)}
          <div class="gd-spark-x">${TREND.months.map(m => `<span>${m}</span>`).join('')}</div>
          <div class="row between" style="margin-top:14px;padding-top:13px;border-top:1px solid var(--line-2)">
            <span class="muted" style="font-size:12.5px">FY 2024-25</span>
            <span class="row gap-6 num" style="color:var(--green-700);font-weight:600;font-size:12.5px">${ICO.trendUp} +38% YoY</span>
          </div>
        </div>
      </div>`;

    return `
      ${stats}
      ${alerts}
      <div class="gd-grid-main reveal">
        ${stateTable}
        <div class="col gap-20">${sectorDist}${trend}</div>
      </div>`;
  }

  // =============================================================
  // RISK VIGILANCE
  // =============================================================
  function riskTab() {
    const summary = `<div class="grid grid-3 mb-20 reveal">
      ${RISK_SUMMARY.map(r => `
        <div class="card card--pad" style="border-left:3px solid ${r.c}">
          <div class="num" style="font-size:28px;font-weight:700;letter-spacing:-.02em;color:${r.c};line-height:1">${App.esc(r.val)}</div>
          <b style="font-size:14px;display:block;margin-top:8px">${App.esc(r.label)}</b>
          <div class="muted" style="font-size:12px;margin-top:2px">${App.esc(r.sub)}</div>
        </div>`).join('')}
    </div>`;

    const cards = RISK_FLAGS.map(f => {
      const sv = SEV[f.sev];
      const trendC = f.up ? 'var(--red-600)' : 'var(--green-700)';
      return `<div class="gd-riskcard card--hover" style="border-top:3px solid ${sv.c}" role="button" tabindex="0" onclick="GovDash.viewRiskList('${jsq(f.title)}')">
        <div class="row between gap-10" style="align-items:flex-start">
          <b style="font-size:14px">${App.esc(f.title)}</b>
          ${App.ui.pill(sv.label, sv.pill, true)}
        </div>
        <div class="muted" style="font-size:12.5px;margin-top:6px;min-height:34px">${App.esc(f.desc)}</div>
        <div class="row between" style="align-items:flex-end;margin-top:12px">
          <div><span class="num" style="font-size:26px;font-weight:700;letter-spacing:-.02em;color:var(--ink)">${App.num(f.count)}</span><span class="muted" style="font-size:12px;margin-left:6px">Employers</span></div>
          <span class="row gap-4 num" style="color:${trendC};font-weight:600;font-size:12px">${f.up ? ICO.trendUp : ICO.trendDown}${f.up ? '+' : '-'}${f.delta} this week</span>
        </div>
        <div class="bar mt-12"><div class="bar__fill" style="width:${(f.count / RISK_MAX * 100).toFixed(0)}%;background:${sv.c}"></div></div>
        <div class="row between" style="align-items:center;margin-top:12px">
          <span class="faint" style="font-size:11.5px">Last updated ${App.esc(f.updated)}</span>
          <span class="gd-viewlink">View list ${App.icon('arrow')}</span>
        </div>
      </div>`;
    }).join('');

    return `
      ${summary}
      <div class="card reveal">
        <div class="card__head">
          <div class="grow"><h3>Employer Risk Flags</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Real-time compliance monitoring across registered employers</div></div>
          <button class="btn btn--soft btn--sm" onclick="GovDash.doExport('CSV')">${App.icon('download')} Export</button>
        </div>
        <div class="card__body">
          <div class="gd-risk-grid">${cards}</div>
        </div>
      </div>`;
  }

  // =============================================================
  // COMPLIANCE GAPS
  // =============================================================
  function complianceTab() {
    const flowRows = FLOWS.map(f => {
      const growing = f.trend === 'Growing';
      const netC = f.net.charAt(0) === '-' ? 'var(--red-600)' : 'var(--green-700)';
      return `<tr>
        <td><b>${App.esc(f.name)}</b></td>
        <td class="num" style="color:var(--green-700)">${App.esc(f.in)}</td>
        <td class="num" style="color:var(--red-600)">${App.esc(f.out)}</td>
        <td class="num" style="color:${netC};font-weight:600">${App.esc(f.net)}</td>
        <td><span class="row gap-5" style="color:${growing ? 'var(--green-700)' : 'var(--red-600)'};font-weight:600;font-size:12px">${growing ? ICO.trendUp : ICO.trendDown}${App.esc(f.trend)}</span></td>
      </tr>`;
    }).join('');

    const flowTable = `
      <div class="card reveal mb-20">
        <div class="card__head"><div class="grow"><h3>Employment Flow by Sector</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Dynamic movement of workers across sectors (this month)</div></div></div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>Sector</th><th>Inflow</th><th>Outflow</th><th>Net Change</th><th>Trend</th></tr></thead>
            <tbody>${flowRows}</tbody>
          </table>
        </div>
      </div>`;

    const chips = SECTOR_CHIPS.map(s => `<button class="gd-chip ${S.sector === s ? 'is-active' : ''}" onclick="GovDash.setSector('${jsq(s)}')">${App.esc(s)}</button>`).join('');

    const shown = COMPLIANCE.filter(c => S.sector === 'All' || c.name === S.sector);
    const metric = (label, v) => `
      <div style="margin-bottom:11px">
        <div class="row between" style="margin-bottom:5px"><span style="font-size:12.5px">${label}</span><span class="num" style="font-size:12px;color:${complianceColor(v)};font-weight:600">${v}%</span></div>
        ${App.ui.bar(v, complianceColor(v))}
      </div>`;

    const trendCards = shown.map(c => `
      <div class="card card--pad">
        <div class="row between gap-10" style="align-items:center;margin-bottom:14px">
          <b style="font-size:14.5px">${App.esc(c.name)}</b>
          <span class="row gap-4 num" style="color:${c.up ? 'var(--green-700)' : 'var(--red-600)'};font-weight:600;font-size:12px">${c.up ? ICO.trendUp : ICO.trendDown}${App.esc(c.change)}</span>
        </div>
        ${metric('PF Compliance', c.pf)}
        ${metric('ESIC Coverage', c.esic)}
        ${metric('Min. Wage Adherence', c.wage)}
      </div>`).join('');

    const trends = `
      <div class="card reveal">
        <div class="card__head">
          <div class="grow"><h3>Compliance Trends by Sector</h3><div class="muted" style="font-size:12.5px;margin-top:2px">PF, ESIC, and Minimum Wage compliance rates (%)</div></div>
        </div>
        <div class="card__body">
          <div class="gd-chips mb-16">${chips}</div>
          ${shown.length ? `<div class="gd-trends-grid">${trendCards}</div>` : App.ui.empty('chart', 'No sector', 'No compliance data for this filter.')}
          <div class="row gap-16 wrap" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2);font-size:12px;color:var(--muted)">
            <span class="row gap-6"><span class="gd-dot" style="background:var(--green-600)"></span>≥75% Good</span>
            <span class="row gap-6"><span class="gd-dot" style="background:var(--amber-600)"></span>50–74% Warning</span>
            <span class="row gap-6"><span class="gd-dot" style="background:var(--red-600)"></span>&lt;50% Critical</span>
          </div>
        </div>
      </div>`;

    return `${flowTable}${trends}`;
  }

  // =============================================================
  // PUSH SCHEMES & ALERTS
  // =============================================================
  function pushTab() {
    const banner = `
      <div class="banner banner--accent reveal mb-20" style="align-items:flex-start">
        ${ICO.radio}
        <div><b>Government Information Push System</b><div style="margin-top:3px;opacity:.9">Broadcast new schemes, policy alerts, and benefit notifications directly to employers and/or workers on the WiN platform.</div></div>
      </div>`;

    const audience = AUDIENCES.map(a => `
      <button class="gd-aud ${S.audience === a.key ? 'is-active' : ''}" onclick="GovDash.setAudience('${a.key}')">
        <span class="gd-radio"></span>
        <span class="grow" style="text-align:left"><b style="font-size:13.5px;display:block">${App.esc(a.title)}</b><span class="muted" style="font-size:12px">${App.esc(a.sub)}</span></span>
      </button>`).join('');

    const submitBtn = S.sent
      ? `<button class="btn btn--block" style="background:var(--green-600);color:#fff;border-color:transparent">${App.icon('checkcircle')} Sent Successfully!</button>`
      : `<button class="btn btn--primary btn--block" onclick="GovDash.submitPush()">${App.icon('send')} Push Notification</button>`;

    const compose = `
      <div class="card">
        <div class="card__head">${App.icon('bell')}<h3 class="grow">Compose Push Notification</h3></div>
        <div class="card__body">
          <div class="field">
            <label class="label">Target Audience <span style="color:var(--red-600)">*</span></label>
            <div class="gd-aud-row">${audience}</div>
          </div>
          <div class="field">
            <label class="label">Title <span style="color:var(--red-600)">*</span></label>
            <input class="input" id="gdPushTitle" placeholder="e.g. New PM-SHRI Upskilling Scheme Launched" value="${App.esc(S.pushTitle)}" oninput="GovDash.setField('pushTitle', this.value)">
          </div>
          <div class="field">
            <label class="label">Message Body <span style="color:var(--red-600)">*</span></label>
            <textarea class="textarea" id="gdPushBody" rows="4" placeholder="Describe the scheme, eligibility criteria, benefits, and next steps..." oninput="GovDash.setField('pushBody', this.value)">${App.esc(S.pushBody)}</textarea>
          </div>
          <div class="banner banner--info" style="align-items:center;font-size:12.5px">${App.icon('bell')}<div>Will appear as an in-app notification + floating alert for workers.</div></div>
          <div class="mt-16">${submitBtn}</div>
        </div>
      </div>`;

    const templates = `
      <div class="card">
        <div class="card__head">${App.icon('sparkles')}<h3 class="grow">Quick Templates</h3></div>
        <div class="card__body" style="display:flex;flex-direction:column;gap:10px">
          ${TEMPLATES.map((t, i) => `
            <button class="gd-tmpl" onclick="GovDash.useTemplate(${i})">
              <div class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:var(--accent-weak);color:var(--accent-strong)">${App.icon(t.icon)}</div>
              <span class="grow" style="text-align:left;min-width:0"><b style="font-size:13px;display:block">${App.esc(t.name)}</b><span class="muted" style="font-size:11.5px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${App.esc(t.body)}</span></span>
              ${App.icon('plus')}
            </button>`).join('')}
        </div>
      </div>`;

    const recent = `
      <div class="card">
        <div class="card__head">${App.icon('clock')}<h3 class="grow">Recent Pushes</h3></div>
        <div class="card__body" style="padding-top:6px;padding-bottom:6px">
          <div class="list--divided">
            ${S.recent.map(r => `
              <div class="row gap-12" style="align-items:flex-start;padding:12px 0">
                <div class="kpi__icon" style="width:32px;height:32px;flex-shrink:0;background:var(--accent-weak);color:var(--accent-strong)">${App.icon('send')}</div>
                <div class="grow" style="min-width:0">
                  <b style="font-size:13px">${App.esc(r.title)}</b>
                  <div class="muted num" style="font-size:11.5px;margin-top:3px">${App.esc(r.audience)} · ${App.esc(r.when)} · ${App.esc(r.reach)}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    return `
      ${banner}
      <div class="gd-push-grid reveal">
        ${compose}
        <div class="col gap-20">${templates}${recent}</div>
      </div>`;
  }

  // =============================================================
  // view registration
  // =============================================================
  const TABS = [
    ['overview', 'Overview'],
    ['risk', 'Risk Vigilance'],
    ['compliance', 'Compliance Gaps'],
    ['push', 'Push Schemes & Alerts'],
  ];

  App.registerView('gov-dashboard', {
    title: 'Government Dashboard',
    subtitle: 'National labour-data command center',
    render() {
      const body = S.tab === 'overview' ? overviewTab()
        : S.tab === 'risk' ? riskTab()
        : S.tab === 'compliance' ? complianceTab()
        : pushTab();

      const style = `<style>
        .gd-grid-main{ display:grid; grid-template-columns:1.5fr 1fr; gap:20px; align-items:start; }
        .gd-alert{ display:flex; gap:12px; align-items:flex-start; padding:13px 14px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface-2); }
        .gd-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block; }
        .gd-barcell{ display:flex; align-items:center; gap:9px; }
        .gd-barcell .bar{ flex:1; }
        .gd-sector{ margin-bottom:14px; }
        .gd-sector:last-child{ margin-bottom:0; }
        .gd-spark-x{ display:flex; justify-content:space-between; margin-top:6px; font-family:var(--font-num); font-size:10.5px; color:var(--faint); }
        .gd-risk-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .gd-riskcard{ border:1px solid var(--line); border-radius:var(--r-lg); background:var(--surface); padding:15px 16px; display:flex; flex-direction:column; cursor:pointer; transition:border-color .13s, box-shadow .13s, transform .13s; }
        .gd-riskcard:hover{ border-color:var(--accent); }
        .gd-riskcard:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
        .gd-viewlink{ display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:600; color:var(--accent-strong); transition:.13s; }
        .gd-riskcard:hover .gd-viewlink .ico{ transform:translateX(2px); }
        .gd-viewlink .ico{ width:14px; height:14px; transition:transform .13s; }
        .gd-chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .gd-chip{ padding:7px 14px; border-radius:var(--r-full); font-size:12.5px; font-weight:600; border:1px solid var(--line); background:var(--surface); color:var(--muted); cursor:pointer; transition:.13s; white-space:nowrap; }
        .gd-chip:hover{ border-color:var(--accent); color:var(--accent-strong); }
        .gd-chip.is-active{ background:var(--accent); color:#fff; border-color:transparent; }
        .gd-trends-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .gd-push-grid{ display:grid; grid-template-columns:1.4fr 1fr; gap:20px; align-items:start; }
        .gd-aud-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .gd-aud{ display:flex; gap:10px; align-items:center; padding:12px 13px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.13s; }
        .gd-aud:hover{ border-color:var(--accent); }
        .gd-aud.is-active{ border-color:var(--accent); background:var(--accent-weak); box-shadow:0 0 0 2px var(--accent-ring); }
        .gd-radio{ width:17px; height:17px; border-radius:50%; border:2px solid var(--line); flex-shrink:0; position:relative; transition:.13s; }
        .gd-aud.is-active .gd-radio{ border-color:var(--accent); }
        .gd-aud.is-active .gd-radio::after{ content:""; position:absolute; inset:2.5px; border-radius:50%; background:var(--accent); }
        .gd-tmpl{ display:flex; gap:11px; align-items:center; padding:11px 12px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.13s; }
        .gd-tmpl:hover{ border-color:var(--accent); background:var(--surface-2); }
        .gd-tmpl > .ico{ color:var(--muted); flex-shrink:0; }
        @media (max-width:1080px){
          .gd-grid-main, .gd-push-grid{ grid-template-columns:1fr; }
          .gd-risk-grid, .gd-trends-grid{ grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:720px){
          .gd-risk-grid, .gd-trends-grid, .gd-aud-row{ grid-template-columns:1fr; }
        }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('landmark')} Ministry of Labour &amp; Employment</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">India's workforce, in one command center.</h1>
                <p class="lead">A single live view of enrollment, verification, grievances and employer compliance — 38.4 crore workers across 36 states, monitored at source.</p>
                <div class="row gap-10 mt-16 wrap" style="align-items:center">
                  <span class="pill pill--gray">${App.icon('globe')} 36 States &amp; UTs</span>
                  <span class="pill pill--gray">${App.icon('users')} <span class="num">38.4&nbsp;Cr</span> enrolled</span>
                  ${App.ui.verified('EPFO · ESIC · IT Dept · GSTN synced')}
                </div>
              </div>
              <div class="row gap-12 wrap" style="align-items:center">
                <button class="btn" onclick="GovDash.exportReport()">${ICO.fileChart} Export Report</button>
                <button class="btn btn--primary" onclick="GovDash.pushScheme()">${ICO.radio} Push Scheme</button>
              </div>
            </div>
          </div>
        </div>

        <div class="tabs">
          ${TABS.map(([k, l]) => `<div class="tab ${S.tab === k ? 'is-active' : ''}" onclick="GovDash.setTab('${k}')">${l}</div>`).join('')}
        </div>

        ${body}
      </div>`;
    }
  });
})();
