/* Government · Dashboard — national labour-data command center for the
   Ministry of Labour & Employment. Editorial hero + four tabs (Overview,
   Risk Vigilance, Compliance Gaps, Push Schemes & Alerts) with an
   Export-report modal, a state-wise
   enrollment table, a sector distribution + 12-month enrollment sparkline,
   real-time employer risk flags, sector compliance trends with a live
   filter, and a scheme/alert push composer with quick templates and a send
   simulation. v2 editorial standard. */
(function () {
  // ---- inline icons not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 16}" height="${s || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
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

  // ---- Key Indicators (RAG) — the metrics a ministry official should look at
  // first, beyond the headline enrolment/sector numbers: formal-informal mix,
  // wage compliance, skilling coverage, migration, and time-to-resolution.
  // Each carries current value, last month's value, and the national benchmark
  // it's judged against, rolled up into a red/amber/green status.
  const KEY_INDICATORS = [
    { id: 'formal-share', label: 'Formal Employment Share', icon: 'briefcase', unit: '%', cur: 31.4, prev: 30.1, bench: 35, higherIsBetter: true,
      note: 'Share of enrolled workers in formal, HRMS-verified employment', hotspot: { name: 'Tamil Nadu', val: '41.2%' },
      source: 'HRMS sync + EPFO/ESIC cross-match', basedOn: 'employers' },
    { id: 'verif-turnaround', label: 'Avg. Verification Turnaround', icon: 'clock', unit: 'd', cur: 2.4, prev: 2.9, bench: 3, higherIsBetter: false,
      note: 'Average days from application to source-verified WIN ID', hotspot: { name: 'Bihar', val: '4.1 days' },
      source: 'WIN application-to-verification timestamps', basedOn: 'enrolled' },
    { id: 'min-wage', label: 'Minimum Wage Compliance', icon: 'shieldcheck', unit: '%', cur: 87.6, prev: 85.2, bench: 90, higherIsBetter: true,
      note: 'Employers found compliant with state minimum-wage notifications', hotspot: { name: 'Rajasthan', val: '76.4%' },
      source: 'Labour department wage-inspection records', basedOn: 'employers' },
    { id: 'skilling', label: 'Skilling Coverage', icon: 'graduation', unit: '%', cur: 22.8, prev: 21.5, bench: 30, higherIsBetter: true,
      note: 'Enrolled workers with at least one certified skill on WIN', hotspot: { name: 'Karnataka', val: '29.6%' },
      source: 'WIN skill-certification records', basedOn: 'enrolled' },
    { id: 'migrant-share', label: 'Interstate Migrant Share', icon: 'mappin', unit: '%', cur: 18.2, prev: 17.9, bench: 15, higherIsBetter: false,
      note: 'Enrolled workers employed outside their home state', hotspot: { name: 'Delhi NCR', val: '34.8%' },
      source: 'e-Shram home-state vs. work-state mapping', basedOn: 'enrolled' },
    { id: 'employer-filing', label: 'Employer Compliance Filing Rate', icon: 'filecheck', unit: '%', cur: 71.5, prev: 68.4, bench: 80, higherIsBetter: true,
      note: 'EPF/ESI/LWF returns filed on time this cycle', hotspot: { name: 'Bihar', val: '54.2%' },
      source: 'EPFO/ESIC/LWF return-filing logs', basedOn: 'employers' },
    { id: 'eshram-growth', label: 'e-Shram Enrollment Growth', icon: 'trend', unit: 'L/72h', cur: 4.2, prev: 2.1, bench: 3.0, higherIsBetter: true,
      note: 'New worker registrations in the last 72 hours', hotspot: { name: 'Bihar — Patna & Gaya', val: '+4.2L' },
      source: 'e-Shram registration feed', basedOn: 'enrolled' },
    { id: 'esic-backlog', label: 'ESIC Claims Pending 45+ Days', icon: 'clock', unit: '', cur: 18400, prev: 21200, bench: 10000, higherIsBetter: false,
      note: 'Claims older than 45 days awaiting resolution', hotspot: { name: 'Maharashtra — Pune region', val: '18,400 claims' },
      source: 'ESIC claims register', basedOn: 'grievances' },
    { id: 'epfo-noncompliance', label: 'EPFO Non-Compliant Employers', icon: 'alert', unit: '', cur: 2340, prev: 2510, bench: 1500, higherIsBetter: false,
      note: 'Employers with 3+ months of missed PF deposits', hotspot: { name: 'National', val: '2,340 employers' },
      source: 'EPFO deposit-default records', basedOn: 'employers' },
  ];
  function ragStatus(ind) {
    const gap = ind.higherIsBetter ? ind.cur - ind.bench : ind.bench - ind.cur;
    if (gap >= 0) return { kind: 'green', label: 'On track' };
    if (gap >= -5) return { kind: 'amber', label: 'Watch' };
    return { kind: 'red', label: 'Off track' };
  }
  const DRIVERS_UP = ['Faster digitisation of records', 'Recent employer onboarding drive', 'Stronger local enforcement', 'Higher self-service adoption'];
  const DRIVERS_DOWN = ['Delayed employer filings', 'Backlog from a recent enrollment surge', 'Limited local inspection capacity', 'Lower digital literacy in the region'];
  const seed = (s) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1000, 7);
  // deterministic per-region spread around an indicator's value, plus the extra
  // context (sample size, likely driver, data source) that explains how the
  // number was arrived at — used by both the preview modal and the download.
  const f1 = n => Math.round(n * 10) / 10;
  function indicatorRegionRows(ind, regions) {
    return regions.map(r => {
      const spread = ((seed(r.name + ind.id) % 21) - 10) / 100;         // ±10% around national
      const val = Math.max(0, ind.cur * (1 + spread));
      const prevSpread = ((seed(r.name + ind.id + 'p') % 17) - 8) / 100;
      const prev = Math.max(0, ind.prev * (1 + prevSpread));
      const onTrack = (val >= ind.bench) === !!ind.higherIsBetter;
      const driverPool = onTrack ? DRIVERS_UP : DRIVERS_DOWN;
      const driver = driverPool[seed(r.name + ind.id + 'd') % driverPool.length];
      const sample = r.sample != null ? App.num(r.sample) : '—';
      const chg = val - prev;
      // signed so the direction is unambiguous in a spreadsheet, and framed as
      // "better/worse" rather than just up/down since some indicators invert
      const chgStr = (chg >= 0 ? '+' : '') + f1(chg) + ind.unit;
      const gapRaw = ind.higherIsBetter ? val - ind.bench : ind.bench - val;
      const gapStr = (gapRaw >= 0 ? '+' : '') + f1(gapRaw) + ind.unit;
      const improving = ind.higherIsBetter ? chg >= 0 : chg <= 0;
      return [
        r.name,
        f1(val) + ind.unit,
        f1(prev) + ind.unit,
        chgStr,
        improving ? 'Improving' : 'Worsening',
        ind.bench + ind.unit,
        gapStr,
        onTrack ? 'On track' : 'Off track',
        sample,
        driver,
      ];
    });
  }
  const INDICATOR_HEADERS = (regionLabel) => [regionLabel, 'Current', 'Last Month', 'Change',
    'Trend', 'Benchmark', 'Gap vs Benchmark', 'Status', 'Sample Size', 'Primary Driver'];
  // resolves which regions to report on — all states nationally, or the
  // districts of just the one state currently selected in the header filter.
  function indicatorRegions(ind) {
    if (S.state === 'All') {
      return { scope: 'State-wise (National)', regions: STATES.map(s => ({ name: s.name, sample: s.enrolled ? Number(String(s.enrolled).replace(/,/g, '')) : null })) };
    }
    const dist = districtRows(S.state);
    if (!dist) return { scope: S.state, regions: [{ name: S.state, sample: null }] };
    return { scope: 'District-wise · ' + S.state, regions: dist.map(d => ({ name: d.name, sample: Number(String(d.enrolled).replace(/,/g, '')) })) };
  }

  // ---- Benefits & Schemes (view layer only — eligibility checks and enrollment
  // execution happen on Mahasarathi; this is money allotted vs. money covered
  // by workforce segment) — now its own page, see views/gov-benefits.js ----

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

  // =============================================================
  // local state + controller
  // =============================================================
  const S = { tab: 'overview', sector: 'All', state: 'All' };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  // ---- state -> district drill-down (once a state is selected in the header select) ----
  function districtRows(stateName) {
    const s = STATES.find(x => x.name === stateName);
    const shares = (window.DB && DB.districtShares && DB.districtShares[stateName]) || [];
    if (!s || !shares.length) return null;
    const num = str => Number(String(str).replace(/,/g, '')) || 0;
    const enrolledTotal = num(s.enrolled);
    return shares.map(d => ({
      name: d.n,
      enrolled: Math.round(enrolledTotal * d.p / 100).toLocaleString('en-IN'),
      employers: Math.round(s.employers * d.p / 100),
      grievances: Math.round(s.grievances * d.p / 100),
      verif: s.verif,
    }));
  }

  window.GovDash = {
    setTab(t) { S.tab = t; App.reload(); },
    setSector(s) { S.sector = s; App.reload(); },
    setState(v) { S.state = v; App.reload(); },
    viewAll() { App.toast('Full activity log is a demo affordance in this prototype'); },
    viewRiskList(t) { App.toast('Opening flagged-employer list · ' + t); },
    openIndicator(id) {
      const ind = KEY_INDICATORS.find(i => i.id === id); if (!ind) return;
      const rag = ragStatus(ind);
      const ragColor = { green: 'var(--green-600)', amber: 'var(--amber-600)', red: 'var(--red-600)' }[rag.kind];
      const { scope, regions } = indicatorRegions(ind);
      const rows = indicatorRegionRows(ind, regions);
      const regionLabel = S.state === 'All' ? 'State' : 'District';
      const hdrs = INDICATOR_HEADERS(regionLabel);
      const preview = rows.slice(0, 6).map(r => `
        <tr><td>${App.esc(r[0])}</td><td class="num">${App.esc(r[1])}</td><td class="num">${App.esc(r[2])}</td>
        <td class="num">${App.esc(r[3])}</td><td class="muted" style="font-size:12px">${App.esc(r[4])}</td>
        <td class="num">${App.esc(r[5])}</td><td class="num">${App.esc(r[6])}</td>
        <td>${App.ui.statusPill(r[7])}</td><td class="num">${App.esc(r[8])}</td>
        <td class="muted" style="font-size:12px">${App.esc(r[9])}</td></tr>`).join('');
      App.modal.open(`
        <div class="row between" style="align-items:flex-start;margin-bottom:6px">
          <div><b style="font-size:15px">${App.esc(ind.label)}</b><div class="muted" style="font-size:12.5px;margin-top:3px;max-width:44ch">${App.esc(ind.note)}</div></div>
          ${App.ui.pill(rag.label, rag.kind, true)}
        </div>
        <div class="row gap-16 wrap mt-16 mb-16">
          <div><div class="faint" style="font-size:11px">Current</div><b class="num" style="font-size:18px">${App.esc(ind.cur)}${App.esc(ind.unit)}</b></div>
          <div><div class="faint" style="font-size:11px">Last Month</div><b class="num" style="font-size:18px">${App.esc(ind.prev)}${App.esc(ind.unit)}</b></div>
          <div><div class="faint" style="font-size:11px">National Benchmark</div><b class="num" style="font-size:18px">${App.esc(ind.bench)}${App.esc(ind.unit)}</b></div>
          ${ind.hotspot ? `<div><div class="faint" style="font-size:11px">Hotspot</div><b style="font-size:14px;color:${ragColor}">${App.esc(ind.hotspot.name)}</b></div>` : ''}
        </div>
        <div class="faint" style="font-size:11px;margin-bottom:10px">Data source: <b>${App.esc(ind.source)}</b></div>
        <div class="row between" style="align-items:baseline;margin-bottom:6px">
          <div class="label" style="margin:0">${App.esc(scope)}</div>
          ${S.state !== 'All' ? `<span class="pill pill--accent">${App.icon('filter')} Filtered to ${App.esc(S.state)}</span>` : ''}
        </div>
        <div class="tablewrap tablewrap--scroll" style="margin-bottom:6px">
          <table class="tbl"><thead><tr>${hdrs.map(h => `<th>${App.esc(h)}</th>`).join('')}</tr></thead><tbody>${preview}</tbody></table>
        </div>
        <div class="faint" style="font-size:11.5px">Showing 6 of ${rows.length} ${regionLabel.toLowerCase()}s — download the full report below.</div>`, {
        title: 'Key Indicator', icon: ind.icon, wide: true,
        foot: `<button class="btn" onclick="GovDash.downloadIndicator('${id}','PDF')">${App.icon('doc')} PDF</button>
               <button class="btn" onclick="GovDash.downloadIndicator('${id}','Excel')">${App.icon('chart')} Excel</button>
               <button class="btn btn--primary" onclick="GovDash.downloadIndicator('${id}','CSV')">${App.icon('download')} CSV</button>`,
      });
    },
    downloadIndicator(id, fmt) {
      const ind = KEY_INDICATORS.find(i => i.id === id); if (!ind) return;
      const { scope, regions } = indicatorRegions(ind);
      const rows = indicatorRegionRows(ind, regions);
      const regionLabel = S.state === 'All' ? 'State' : 'District';
      const baseName = 'win-indicator-' + id + (S.state !== 'All' ? '-' + S.state.toLowerCase().replace(/\s+/g, '-') : '');
      App.downloadReport(baseName, ind.label + ' — ' + scope + ' (Source: ' + ind.source + ')',
        INDICATOR_HEADERS(regionLabel), rows, fmt);
      App.toast(ind.label + ' report downloaded as ' + fmt, 'download');
    },
    exportReport() {
      App.modal.open(`
        <p class="muted" style="margin:0 0 16px;font-size:13px">Generate a consolidated national labour-data report across enrollment, verification, grievances and compliance. Choose a format:</p>
        <div class="row gap-10 wrap">
          <button class="btn btn--primary" onclick="GovDash.doExport('PDF')">${App.icon('doc')} PDF Report</button>
          <button class="btn" onclick="GovDash.doExport('Excel')">${App.icon('chart')} Excel Workbook</button>
          <button class="btn" onclick="GovDash.doExport('CSV')">${App.icon('download')} Raw CSV</button>
        </div>`, { title: 'Export National Report', icon: 'chart' });
    },
    doExport(fmt) {
      App.modal.close();
      if (fmt === 'CSV') {
        const dist = S.state !== 'All' ? districtRows(S.state) : null;
        if (dist) {
          App.downloadCSV('win-' + S.state.toLowerCase().replace(/\s+/g, '-') + '-district-enrollment.csv',
            ['District', 'Enrolled', 'Employers', 'Grievances', 'Verification %'],
            dist.map(d => [d.name, d.enrolled, d.employers, d.grievances, d.verif]));
        } else {
          App.downloadCSV('win-national-state-enrollment.csv',
            ['State', 'Enrolled', 'Employers', 'Grievances', 'Verification %'],
            STATES.map(s => [s.name, s.enrolled, s.employers, s.grievances, s.verif]));
        }
        App.toast('National report exported as CSV', 'download');
      } else {
        App.toast('National report exported as ' + fmt, 'download');
      }
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
    const sel = STATES.find(x => x.name === S.state);
    const stateStats = sel ? [
      { label: 'Workers Enrolled', val: sel.enrolled, sub: sel.name, delta: 'State total', up: true, icon: 'users', c: '#0d9488' },
      { label: 'Employers Registered', val: App.num(sel.employers), sub: sel.name, delta: 'State total', up: true, icon: 'building', c: '#2f5fd0' },
      { label: 'Active Grievances', val: App.num(sel.grievances), sub: sel.name, delta: sel.grievances > 50000 ? 'Above national avg' : 'Within national avg', up: sel.grievances <= 50000, icon: 'alert', c: '#c07d10' },
      { label: 'Verification Rate', val: sel.verif + '%', sub: sel.name, delta: sel.verif >= 74.2 ? 'Above national avg' : 'Below national avg', up: sel.verif >= 74.2, icon: 'shield', c: '#0e9f6e' },
    ] : STATS;
    const stats = `
      <div class="reveal">
        <div class="row between wrap gap-12 mb-12" style="align-items:center">
          <div class="section-title" style="margin:0">${sel ? sel.name + ' snapshot' : 'National snapshot'}</div>
          <span class="faint" style="font-size:12px">Live · FY 2024-25</span>
        </div>
        <div class="grid grid-4 mb-20">${stateStats.map(statCard).join('')}</div>
      </div>`;

    const fmtNum = (n) => Number.isInteger(n) && Math.abs(n) >= 1000 ? App.num(n) : (Math.round(n * 10) / 10).toString();
    const keyIndicators = `
      <div class="card reveal mb-20">
        <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">Key Indicators</h3><span class="faint" style="font-size:12px">Current vs. last month vs. national benchmark, with the highest-impact state/district</span></div>
        <div class="card__body">
          <div class="grid grid-3">
            ${KEY_INDICATORS.map(ind => {
              const rag = ragStatus(ind);
              const ragColor = { green: 'var(--green-600)', amber: 'var(--amber-600)', red: 'var(--red-600)' }[rag.kind];
              const delta = fmtNum(Math.abs(ind.cur - ind.prev));
              const deltaUp = ind.cur >= ind.prev;
              return `
              <button class="card card--pad card--hover" style="border-top:3px solid ${ragColor};text-align:left;width:100%;cursor:pointer" onclick="GovDash.openIndicator('${ind.id}')">
                <div class="row between" style="align-items:flex-start;margin-bottom:8px">
                  <span class="row gap-8" style="font-size:12.5px;font-weight:600;color:var(--muted)">${App.icon(ind.icon)}${App.esc(ind.label)}</span>
                  ${App.ui.pill(rag.label, rag.kind, true)}
                </div>
                <div class="row gap-8" style="align-items:baseline;margin-bottom:4px">
                  <span class="num" style="font-size:22px;font-weight:700">${fmtNum(ind.cur)}${ind.unit}</span>
                  <span class="num" style="font-size:12px;color:${deltaUp ? 'var(--green-700)' : 'var(--red-600)'}">${deltaUp ? '▲' : '▼'} ${delta}${ind.unit} vs last month</span>
                </div>
                <div class="faint" style="font-size:11.5px;margin-bottom:6px">Benchmark: <b class="num">${fmtNum(ind.bench)}${ind.unit}</b> · Last month: <span class="num">${fmtNum(ind.prev)}${ind.unit}</span></div>
                <div class="muted" style="font-size:12px;margin-bottom:8px">${App.esc(ind.note)}</div>
                ${ind.hotspot ? `<div class="row gap-6" style="font-size:11.5px;color:var(--muted);padding-top:8px;border-top:1px solid var(--line-2)"><span style="color:${ragColor}">${App.icon('mappin')}</span>Hotspot: <b>${App.esc(ind.hotspot.name)}</b> · <span class="num">${App.esc(ind.hotspot.val)}</span></div>` : ''}
                <div class="row gap-6" style="font-size:11px;font-weight:600;color:var(--accent-strong);margin-top:8px">${App.icon('external')} View report &amp; download</div>
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    const dist = S.state !== 'All' ? districtRows(S.state) : null;
    const stateRows = (dist || STATES).map(s => {
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
        <div class="card__head"><h3 class="grow">${dist ? App.esc(S.state) + ' — District-wise Enrollment' : 'State-wise Enrollment'}</h3>
          ${dist ? `<button class="btn btn--ghost btn--sm" onclick="GovDash.setState('All')">${App.icon('x')} Clear</button>` : `<button class="btn btn--ghost btn--sm" onclick="App.navigate('gov-demographics')">View full map ${App.icon('arrow')}</button>`}</div>
        <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
          <table class="tbl">
            <thead><tr><th>${dist ? 'District' : 'State'}</th><th>Enrolled</th><th>Employers</th><th>Grievances</th><th>Verification</th></tr></thead>
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
      ${keyIndicators}
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
  // view registration
  // =============================================================
  const TABS = [
    ['overview', 'Overview'],
    ['risk', 'Risk Vigilance'],
    ['compliance', 'Compliance Gaps'],
  ];

  App.registerView('gov-dashboard', {
    title: 'Government Dashboard',
    subtitle: 'National labour-data command center',
    render() {
      const body = S.tab === 'overview' ? overviewTab()
        : S.tab === 'risk' ? riskTab()
        : complianceTab();

      const govStates = (window.DB && DB.govStates) || [];
      const stateOptions = ['All'].concat(govStates.filter(n => STATES.some(s => s.name === n)))
        .map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${n === 'All' ? 'All States' : App.esc(n)}</option>`).join('');

      const style = `<style>
        .gd-selwrap{ position:relative; display:inline-flex; align-items:center; }
        .gd-selwrap .ico{ position:absolute; left:11px; color:var(--muted); pointer-events:none; }
        .gd-sel{ padding-left:34px; min-width:172px; font-weight:600; }
        .gd-grid-main{ display:grid; grid-template-columns:1.5fr 1fr; gap:20px; align-items:start; }
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
        @media (max-width:1080px){
          .gd-grid-main{ grid-template-columns:1fr; }
          .gd-risk-grid, .gd-trends-grid{ grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:720px){
          .gd-risk-grid, .gd-trends-grid{ grid-template-columns:1fr; }
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
                <div class="gd-selwrap">${App.icon('filter')}
                  <select class="select gd-sel" onchange="GovDash.setState(this.value)" aria-label="Filter by state">${stateOptions}</select>
                </div>
                <button class="btn btn--primary" onclick="GovDash.exportReport()">${ICO.fileChart} Export Report</button>
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
