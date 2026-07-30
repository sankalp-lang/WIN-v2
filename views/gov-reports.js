/* Government · Reports — a section-structured library organised against the
   Maharashtra LMIS Indicator Framework (World Bank Labor Market Observatory
   model): each of the six indicator-checklist sections shows its headline
   metrics as KPI tiles, plus (where the indicator genuinely warrants a full
   table) one downloadable report — preview, custom date range, and a working
   CSV/Excel/PDF export. Day-to-day operational monitoring (grievances,
   employer compliance, full demographics) lives on its own dedicated pages
   elsewhere in the console, so it isn't duplicated here. */
(function () {
  // ---- section definitions (tint + icon + description) ----
  const SECTIONS = [
    { key: 'workforce', title: '1. Workforce Composition', desc: 'LFPR, WPR, unemployment and sectoral concentration of the enrolled workforce.', c: 'var(--accent)', ic: 'users' },
    { key: 'formal',    title: '2. Formal–Informal Segmentation', desc: 'Formal vs. informal employment, organised vs. unorganised units, and social security coverage.', c: '#6b4fc7', ic: 'shieldcheck' },
    { key: 'skilling',  title: '3. Education-to-Employment / Skilling Mapping', desc: 'Graduate outcomes, ITI/NSDC placement rates and skill-mismatch tracking.', c: '#2f5fd0', ic: 'graduation' },
    { key: 'income',    title: '4. Income & Wage', desc: 'Verified, consent-based income and wage distribution — not a survey estimate.', c: '#0e9f6e', ic: 'trend' },
    { key: 'migration', title: '5. Migration & Interstate Mobility', desc: 'Interstate worker stock, migrant sector concentration, and benefit-portability eligibility.', c: '#0891a7', ic: 'mappin' },
    { key: 'demand',    title: '6. Demand-Side Signals', desc: 'Employer-side vacancy postings captured via HRMS-integrated employers.', c: '#c07d10', ic: 'briefcase' },
  ];
  const CAT_C = SECTIONS.reduce((m, s) => { m[s.key] = s.c; return m; }, {});

  // ---- one full downloadable report per section, wherever the indicator genuinely
  // warrants a table rather than a headline number (see METRICS below for the rest) ----
  const REPORTS = [
    { id: 'sector', title: 'Sectoral Workforce Concentration & Growth', section: 'workforce', ic: 'chart', size: '2.0 MB', last: 'Nov 5, 2024', freq: 'Monthly',
      desc: 'Headcount and year-over-year growth of the workforce by sector and state — agriculture, gig/platform, construction, manufacturing, services.' },
    { id: 'informal-subsector', title: 'Informal Sector Segmentation & Social Security Coverage', section: 'formal', ic: 'file', size: '1.6 MB', last: 'Nov 6, 2024', freq: 'Monthly',
      desc: 'Within the informal segment: headcount by sub-sector (construction, farm labour, gig, domestic, other) and PF/ESIC coverage rate, by state.' },
    { id: 'grad-outcome', title: 'Graduate Outcome Mapping', section: 'skilling', ic: 'graduation', size: '1.4 MB', last: 'Oct 28, 2024', freq: 'Quarterly',
      desc: 'Stream of graduation cross-tabulated against sector and state of first employment.' },
    { id: 'wage-distribution', title: 'Wage Distribution by Sector, Gender & Skill', section: 'income', ic: 'trend', size: '2.2 MB', last: 'Nov 9, 2024', freq: 'Monthly',
      desc: 'Median and mean wages disaggregated by sector, gender and skill level, plus a state-wise cut.' },
    { id: 'migration', title: 'In-Migrant Worker Stock & Sector Concentration', section: 'migration', ic: 'mappin', size: '3.1 MB', last: 'Nov 12, 2024', freq: 'Quarterly',
      desc: 'Interstate worker inflow by source state and destination state, dominant sector and peak season.' },
    { id: 'vacancy-index', title: 'Vacancy Index by Sector & District', section: 'demand', ic: 'briefcase', size: '1.3 MB', last: 'Nov 4, 2024', freq: 'Monthly',
      desc: 'Registered and online job vacancies by sector and district, from HRMS-integrated employers.' },
  ];

  // ---- shared seed lists for generating realistic report/metric data ----
  const ALL_STATES = [
    'Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal', 'Madhya Pradesh', 'Tamil Nadu',
    'Rajasthan', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Odisha', 'Telangana', 'Kerala',
    'Jharkhand', 'Assam', 'Punjab', 'Chhattisgarh', 'Haryana', 'Delhi NCR', 'Uttarakhand',
  ];
  const SECTOR_LIST = ['Construction', 'Manufacturing', 'Gig & Platform', 'Agriculture', 'Domestic & Services'];
  const DISTRICT_SEED = ['Central', 'North', 'South', 'East', 'West', 'Rural Belt'];

  // deterministic pseudo-random (no Math.random) so the seed data is stable across renders
  function seeded(i, salt) { return ((i * 9301 + salt * 49297 + 233280) % 100000) / 100000; }
  function avgCol(rows, idx) { return rows.reduce((a, r) => a + r[idx], 0) / rows.length; }
  function fmt1(n) { return Math.round(n * 10) / 10; }

  // ---- report-table generators (1. Workforce / 2. Formal-Informal / 3. Skilling /
  // 4. Income / 5. Migration / 6. Demand) ----
  function genSector() {
    const rows = [];
    SECTOR_LIST.forEach((sec, sci) => ALL_STATES.forEach((st, si) => {
      const current = Math.round((900000 + si * 180000 + sci * 240000) * (0.8 + seeded(si, sci) * 0.5));
      const prev = Math.round(current / (1 + (0.04 + seeded(sci, si) * 0.35)));
      const growth = fmt1((current - prev) / prev * 100);
      rows.push([sec, st, current, prev, growth]);
    }));
    return { headers: ['Sector', 'State', 'Current Workers', 'Previous Year', 'YoY Growth %'], rows };
  }

  function genInformalSubsector() {
    const SUB = ['Construction', 'Farm Labour', 'Gig & Platform Work', 'Domestic Work', 'Other Informal'];
    const rows = [];
    SUB.forEach((sub, subi) => ALL_STATES.forEach((st, si) => {
      const headcount = Math.round((40000 + si * 8200 + subi * 6100) * (0.7 + seeded(subi, si) * 0.6));
      const pf = Math.round(8 + seeded(si, subi) * 30);
      const esic = Math.round(6 + seeded(subi, si) * 28);
      rows.push([sub, st, headcount, pf, esic]);
    }));
    return { headers: ['Informal Sub-sector', 'State', 'Headcount', 'PF Coverage %', 'ESIC Coverage %'], rows };
  }

  function genGradOutcome() {
    const STREAMS = ['Economics', 'Engineering', 'Commerce', 'Arts', 'Science', 'Agriculture', 'Law', 'Management'];
    const rows = [];
    STREAMS.forEach((stream, sti) => SECTOR_LIST.forEach((sec, sci) => {
      const placed = Math.round((800 + sti * 220 + sci * 140) * (0.6 + seeded(sti, sci) * 0.7));
      const pct = fmt1(6 + seeded(sci, sti) * 34);
      rows.push([stream, sec, placed, pct]);
    }));
    STREAMS.slice(0, 5).forEach((stream, sti) => ALL_STATES.slice(0, 15).forEach((st, si) => {
      const placed = Math.round((300 + sti * 90 + si * 40) * (0.6 + seeded(sti, si) * 0.7));
      rows.push([stream, st, placed, fmt1(5 + seeded(si, sti) * 20)]);
    }));
    return { headers: ['Graduation Stream', 'First-Employment Sector/State', 'Placed (count)', 'Share of Stream %'], rows };
  }

  function genWageDistribution() {
    const GENDERS = ['Male', 'Female'];
    const SKILLS = ['Unskilled', 'Semi-skilled', 'Skilled'];
    const rows = [];
    SECTOR_LIST.forEach((sec, sci) => GENDERS.forEach((g, gi) => SKILLS.forEach((sk, ski) => {
      const base = 9000 + sci * 2600 + ski * 5200 - gi * 1400;
      const median = Math.round(base * (0.9 + seeded(sci + ski, gi) * 0.25));
      const mean = Math.round(median * (1.04 + seeded(gi, ski) * 0.1));
      rows.push([sec, g, sk, median, mean]);
    })));
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const median = Math.round((12000 + si * 900 + sci * 2400) * (0.85 + seeded(si, sci) * 0.3));
      rows.push([sec, st, 'All', median, Math.round(median * 1.05)]);
    }));
    return { headers: ['Sector', 'Gender / State', 'Skill Level', 'Median Wage (₹/mo)', 'Mean Wage (₹/mo)'], rows };
  }

  function genMigration() {
    const origins = ['Bihar', 'Uttar Pradesh', 'Odisha', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Uttarakhand'];
    const dests = ['Maharashtra', 'Delhi NCR', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Andhra Pradesh'];
    const seasons = ['Year-round', 'Oct - Mar', 'Nov - Apr', 'Jun - Sep', 'Dec - Feb'];
    const rows = [];
    origins.forEach((o, oi) => dests.forEach((d, di) => {
      if (o === d) return;
      const workers = Math.round((60000 + oi * 9000 + di * 4000) * (0.6 + seeded(oi, di) * 0.8));
      rows.push([o, d, workers, SECTOR_LIST[(oi + di) % SECTOR_LIST.length], seasons[(oi * 3 + di) % seasons.length]]);
    }));
    rows.sort((a, b) => b[2] - a[2]);
    return { headers: ['Origin State', 'Destination State', 'Workers (est.)', 'Dominant Sector', 'Peak Season'], rows: rows.slice(0, 100) };
  }

  function genVacancyIndex() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => SECTOR_LIST.slice(0, 3).forEach((sec, sci) => {
      const vacancies = Math.round((80 + si * 22 + di * 14 + sci * 30) * (0.6 + seeded(si + di, sci) * 0.8));
      const change = fmt1(seeded(di, sci) * 24 - 8);
      rows.push([st, st + ' ' + d, sec, vacancies, change]);
    })));
    return { headers: ['State', 'District', 'Sector', 'Open Vacancies', 'YoY Change %'], rows };
  }

  // ---- headline-metric generators — these back a KPI tile only, not a downloadable
  // report, for indicators the framework describes as a single figure ----
  function genLfprWprRows() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const lfpr = fmt1(52 + seeded(si, di) * 22);
      const wpr = fmt1(lfpr * (0.82 + seeded(di, si) * 0.14));
      const unemp = fmt1((lfpr - wpr) / lfpr * 100);
      const maleLfpr = fmt1(lfpr * (1.15 + seeded(si + di, 3) * 0.1));
      const femaleLfpr = fmt1(Math.max(18, lfpr * 2 - maleLfpr));
      rows.push([st, lfpr, wpr, unemp, maleLfpr, femaleLfpr]);
    }));
    return rows; // [state, LFPR%, WPR%, unemp%, maleLFPR%, femaleLFPR%]
  }
  function genFormalInformalRows() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const formal = fmt1(22 + seeded(si, di) * 45);
      const organised = Math.min(99.9, fmt1(formal * (0.85 + seeded(di, si) * 0.2)));
      rows.push([st, formal, organised]);
    }));
    return rows; // [state, formal%, organised%]
  }
  function genItiMetricRows() {
    const COURSES = ['Electrician', 'Fitter', 'Welder', 'Plumber', 'CNC Machinist', 'Mechanic (Diesel)', 'COPA', 'Draughtsman (Civil)'];
    const rows = [];
    COURSES.forEach((course, ci) => ALL_STATES.forEach((st, si) => {
      rows.push([fmt1(38 + seeded(ci, si) * 48), fmt1(6 + seeded(si, ci) * 26)]);
    }));
    return rows; // [placementRate%, mismatchRate%]
  }
  function genVerifiedIncomeRows() {
    const rows = [];
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const avgIncome = Math.round((11000 + si * 850 + sci * 2100) * (0.85 + seeded(si, sci) * 0.3));
      const reverifyPct = fmt1(72 + seeded(sci, si) * 25);
      rows.push([avgIncome, reverifyPct]);
    }));
    return rows; // [avgIncome, reverifyPct]
  }
  function genMigrantGapRows() {
    const rows = [];
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const unregisteredPct = fmt1(14 + seeded(sci, si) * 38);
      const portabilityPct = fmt1((100 - unregisteredPct) * (0.55 + seeded(si, sci) * 0.3));
      rows.push([unregisteredPct, portabilityPct]);
    }));
    return rows; // [unregisteredPct, portabilityPct]
  }

  // ---- realistic, extensive (100+ row) CSV/Excel/PDF payloads keyed by report id ----
  const REPORT_DATA = {
    sector: genSector(),
    'informal-subsector': genInformalSubsector(),
    'grad-outcome': genGradOutcome(),
    'wage-distribution': genWageDistribution(),
    migration: genMigration(),
    'vacancy-index': genVacancyIndex(),
  };

  // ---- headline metrics, grouped by section — every indicator not backed by a full
  // report above still gets a KPI tile here, per the LMIS Indicator Checklist ----
  const LFPR_ROWS = genLfprWprRows();
  const FORMAL_ROWS = genFormalInformalRows();
  const ITI_ROWS = genItiMetricRows();
  const INCOME_ROWS = genVerifiedIncomeRows();
  const MIGRANT_GAP_ROWS = genMigrantGapRows();
  const MIGRATION_TOTAL = REPORT_DATA.migration.rows.reduce((a, r) => a + r[2], 0);
  const TOP_MIGRANT_SECTOR = (() => {
    const counts = {};
    REPORT_DATA.migration.rows.forEach(r => { counts[r[3]] = (counts[r[3]] || 0) + r[2]; });
    let best = null, bestN = -1;
    Object.keys(counts).forEach(k => { if (counts[k] > bestN) { best = k; bestN = counts[k]; } });
    return { sector: best, pct: fmt1(bestN / MIGRATION_TOTAL * 100) };
  })();

  const METRICS = {
    workforce: [
      { icon: 'users',  label: 'LFPR (Labour Force Participation Rate)', val: fmt1(avgCol(LFPR_ROWS, 1)) + '%', sub: 'State average, all districts' },
      { icon: 'shieldcheck', label: 'WPR (Worker Population Ratio)', val: fmt1(avgCol(LFPR_ROWS, 2)) + '%', sub: 'Active, verified employment share' },
      { icon: 'trend',  label: 'Unemployment Rate', val: fmt1(avgCol(LFPR_ROWS, 3)) + '%', sub: 'Usual + Current Weekly Status proxy' },
      { icon: 'users',  label: 'Gender-wise LFPR', val: fmt1(avgCol(LFPR_ROWS, 4)) + '% / ' + fmt1(avgCol(LFPR_ROWS, 5)) + '%', sub: 'Male / Female' },
    ],
    formal: [
      { icon: 'shieldcheck', label: 'Formal vs. Informal Employment Share', val: fmt1(avgCol(FORMAL_ROWS, 1)) + '% / ' + fmt1(100 - avgCol(FORMAL_ROWS, 1)) + '%', sub: 'Formal / Informal' },
      { icon: 'building', label: 'Organised vs. Unorganised Sector', val: fmt1(avgCol(FORMAL_ROWS, 2)) + '% / ' + fmt1(100 - avgCol(FORMAL_ROWS, 2)) + '%', sub: 'Organised / Unorganised establishments' },
      { icon: 'file', label: 'Social Security Coverage Rate', val: fmt1((avgCol(REPORT_DATA['informal-subsector'].rows.map(r => [r[3]]), 0) + avgCol(REPORT_DATA['informal-subsector'].rows.map(r => [r[4]]), 0)) / 2) + '%', sub: 'PF/ESIC/welfare scheme enrolment' },
    ],
    skilling: [
      { icon: 'award', label: 'ITI/NSDC Training-to-Placement Rate', val: fmt1(avgCol(ITI_ROWS, 0)) + '%', sub: 'Placed within 6 months of course completion' },
      { icon: 'graduation', label: 'Skill-Mismatch Rate', val: fmt1(avgCol(ITI_ROWS, 1)) + '%', sub: 'Over/under-qualification vs. job role held' },
    ],
    income: [
      { icon: 'file', label: 'Verified Income Record', val: '₹' + Math.round(avgCol(INCOME_ROWS, 0)).toLocaleString('en-IN') + '/mo', sub: 'Avg. consent-based income (not a survey estimate)' },
      { icon: 'shieldcheck', label: '14-Day Re-verification Compliance', val: fmt1(avgCol(INCOME_ROWS, 1)) + '%', sub: 'Share re-confirmed each cycle' },
    ],
    migration: [
      { icon: 'users', label: 'In-Migrant Worker Stock & Inflow', val: (MIGRATION_TOTAL / 100000).toFixed(1) + ' L', sub: 'Enrolled interstate workers (est.)' },
      { icon: 'briefcase', label: 'Migrant Sector Concentration', val: TOP_MIGRANT_SECTOR.pct + '%', sub: TOP_MIGRANT_SECTOR.sector + ' (largest migrant sector)' },
      { icon: 'shieldcheck', label: 'Benefit Portability Uptake', val: fmt1(avgCol(MIGRANT_GAP_ROWS, 1)) + '%', sub: 'Eligible via verified days-worked' },
      { icon: 'alert', label: 'Migrant Registration Gap', val: fmt1(avgCol(MIGRANT_GAP_ROWS, 0)) + '%', sub: 'Enrolled but BOCW/e-Shram unregistered' },
    ],
    demand: [
      { icon: 'briefcase', label: 'Employer Hiring Intent', val: '58%', sub: 'Employers planning to hire next quarter — DES Maharashtra employer survey, Q4 2024' },
    ],
  };

  // ---- scheduled queue (mutable so "Run now" changes state) ----
  const SCHED = [
    { id: 's1', repId: 'sector',            title: 'Sectoral Concentration — December run', due: 'Dec 1, 2024',  status: 'Scheduled' },
    { id: 's2', repId: 'wage-distribution',  title: 'Wage Distribution — Fortnightly #24',   due: 'Nov 30, 2024', status: 'In Progress' },
    { id: 's3', repId: 'vacancy-index',      title: 'Vacancy Index — Weekly Check',           due: 'Nov 25, 2024', status: 'Scheduled' },
  ];

  // ---- live quick-stats (mutable so generate/download move the numbers; shown via the
  // "i" info action next to the library heading rather than a permanent top strip) ----
  const STATS = { generated: 24, downloads: 1247, avg: '2.4 min' };

  const SECTION_FILTERS = [{ key: 'All', title: 'All' }].concat(SECTIONS.map(s => ({ key: s.key, title: s.title.replace(/^\d+\.\s*/, '') })));
  const PERIODS = ['This month (Nov 2024)', 'Last month (Oct 2024)', 'Q3 FY 2024–25', 'FY 2024–25 (YTD)', 'Custom date range…'];

  // ---- view state ----
  const S = { cat: 'All', state: 'All' };
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  // ---- generate-report modal body (reused by header CTA + per-card generate); reveals a
  // From/To date-range picker when "Custom date range…" is chosen ----
  function genFormHtml(preType) {
    const typeOpts = REPORTS.map(r => `<option value="${r.id}" ${preType === r.id ? 'selected' : ''}>${App.esc(r.title)}</option>`).join('')
      + `<option value="custom" ${preType === 'custom' ? 'selected' : ''}>Custom / ad-hoc data extract</option>`;
    const periodOpts = PERIODS.map((p, i) => `<option ${i === 0 ? 'selected' : ''}>${App.esc(p)}</option>`).join('');
    const chips = ['Summary tables', 'State breakdown', 'Raw data'];
    return `
      <div id="grGenForm">
        <p class="muted" style="font-size:13px;margin-bottom:18px">Compile a report from the live WiN registry. This is a demo export — nothing leaves the prototype.</p>
        <div class="field"><label class="label">Report type</label>
          <select class="select" id="grType">${typeOpts}</select></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Reporting period</label>
            <select class="select" id="grPeriod" onchange="document.getElementById('grCustomRange').style.display = this.value.indexOf('Custom') === 0 ? 'grid' : 'none'">${periodOpts}</select></div>
          <div class="field"><label class="label">Format</label>
            <select class="select" id="grFmt"><option>PDF summary</option><option>Excel (.xlsx)</option><option>CSV data extract</option></select></div>
        </div>
        <div class="grid grid-2" id="grCustomRange" style="gap:0 16px;display:none">
          <div class="field"><label class="label">From</label><input class="input" type="date" id="grDateFrom"></div>
          <div class="field"><label class="label">To</label><input class="input" type="date" id="grDateTo"></div>
        </div>
        <div class="field" style="margin-bottom:0"><label class="label">Include sections</label>
          <div class="row gap-8 wrap" style="margin-top:4px">
            ${chips.map(c => `<span class="chip">${App.icon('check')} ${App.esc(c)}</span>`).join('')}
          </div></div>
      </div>`;
  }

  // narrow a report's rows to the header page's selected state, when that report has a
  // State column and a state is selected — otherwise every row is kept unchanged.
  function stateFilteredRows(headers, rows) {
    const idx = headers.indexOf('State');
    if (idx === -1 || S.state === 'All') return rows;
    return rows.filter(r => r[idx] === S.state);
  }

  // actually trigger a real file download for a report (falls back to a registry-overview
  // extract for the ad-hoc "custom" type, which has no fixed dataset). fmt is one of the
  // format labels used across the console ("PDF summary" / "Excel (.xlsx)" / "CSV data extract").
  function downloadReportCSV(rep, fmt) {
    const data = REPORT_DATA[rep.id];
    if (data) {
      App.downloadReport('win-' + rep.id + '-report', rep.title || rep.id, data.headers, stateFilteredRows(data.headers, data.rows), fmt || 'CSV');
    } else {
      App.downloadReport('win-custom-extract', 'Custom extract',
        ['Report', 'Section', 'Frequency', 'Last generated'],
        REPORTS.map(r => [r.title, r.section, r.freq, r.last]), fmt || 'CSV');
    }
  }

  window.GovReports = {
    setCat(c) { S.cat = c; App.reload(); },
    setState(v) { S.state = v; App.reload(); },

    // the "i" info action next to "Available reports" — usage stats, on demand
    showStats() {
      App.modal.open(`
        <div class="statstrip">
          <div class="statstrip__cell"><div class="statstrip__label">Reports generated (MTD)</div><div class="statstrip__val num">${App.num(STATS.generated)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Total downloads</div><div class="statstrip__val num">${App.num(STATS.downloads)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Avg. generation time</div><div class="statstrip__val num">${App.esc(STATS.avg)}</div></div>
        </div>`, { title: 'Reports usage this month', icon: 'chart',
        foot: `<button class="btn btn--primary" onclick="App.modal.close()">Close</button>` });
    },

    // open the generate flow (optionally pre-selecting a report type)
    generate(preType) {
      App.modal.open(genFormHtml(preType || ''), {
        title: 'Generate report', icon: 'chart',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" id="grGenBtn" onclick="GovReports.runGenerate()">${App.icon('bolt')} Generate report</button>`,
      });
    },

    // simulate the compile, then toast + bump stats
    runGenerate() {
      const type = val('grType');
      let period = val('grPeriod'), fmt = (val('grFmt') || 'PDF').split(' ')[0];
      if (period.indexOf('Custom') === 0) {
        const from = val('grDateFrom'), to = val('grDateTo');
        if (!from || !to) { App.toast('Pick a start and end date for the custom range', 'alert'); return; }
        period = from + ' to ' + to;
      }
      const rep = REPORTS.find(r => r.id === type);
      const name = rep ? rep.title : 'Custom extract';
      const btn = document.getElementById('grGenBtn');
      if (btn) { btn.disabled = true; btn.style.opacity = '.55'; btn.style.pointerEvents = 'none'; }
      const form = document.getElementById('grGenForm');
      if (form) {
        form.innerHTML = `
          <div class="gr-gen">
            <div class="gr-gen__ic">${App.icon('chart')}</div>
            <b style="font-size:15px">${App.esc(name)}</b>
            <div class="muted" style="font-size:12.5px;margin:4px 0 16px">${App.esc(period)} · ${App.esc(fmt)}</div>
            <div class="bar" style="height:9px"><div class="bar__fill" id="grBar" style="width:6%"></div></div>
            <div class="mono faint" id="grStep" style="font-size:11.5px;margin-top:10px">Querying the WiN registry…</div>
          </div>`;
        requestAnimationFrame(() => { const f = document.getElementById('grBar'); if (f) f.style.width = '100%'; });
        setTimeout(() => { const s = document.getElementById('grStep'); if (s) s.textContent = 'Aggregating & rendering ' + fmt + '…'; }, 550);
      }
      setTimeout(() => {
        STATS.generated += 1;
        STATS.downloads += 1;
        if (rep) { rep.last = 'Nov 17, 2024'; downloadReportCSV(rep); } else { downloadReportCSV({ id: 'custom' }); }
        App.modal.close();
        App.toast(name + ' generated & downloaded', 'download');
        App.reload();
      }, 1350);
    },

    // show a data preview + format picker before the actual download fires
    download(id) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      const data = REPORT_DATA[rep.id];
      const headers = data ? data.headers : ['Report', 'Section', 'Frequency', 'Last generated'];
      const allRows = stateFilteredRows(headers, data ? data.rows : REPORTS.map(r => [r.title, r.section, r.freq, r.last]));
      const sample = allRows.slice(0, 50);
      const thead = '<tr>' + headers.map(h => `<th>${App.esc(h)}</th>`).join('') + '</tr>';
      const tbody = sample.map(r => '<tr>' + r.map(c => `<td>${App.esc(c)}</td>`).join('') + '</tr>').join('');
      const stateNote = (headers.indexOf('State') !== -1 && S.state !== 'All') ? ` filtered to <b>${App.esc(S.state)}</b>` : '';
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:12px">Preview of <b>${App.esc(rep.title)}</b>${stateNote} — <span class="num">${App.num(allRows.length)}</span> total rows. Showing the first ${sample.length}:</p>
        <div class="tablewrap tablewrap--scroll" style="max-height:280px;overflow:auto">
          <table class="tbl"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
        </div>
        <div class="row gap-10 wrap mt-16">
          <button class="btn btn--primary" onclick="GovReports.confirmDownload('${rep.id}','CSV')">${App.icon('download')} Download CSV</button>
          <button class="btn" onclick="GovReports.confirmDownload('${rep.id}','Excel')">${App.icon('chart')} Download Excel</button>
          <button class="btn" onclick="GovReports.confirmDownload('${rep.id}','PDF')">${App.icon('doc')} Download PDF</button>
        </div>
      `, {
        title: 'Preview & Download', icon: 'download', wide: true,
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>`
      });
    },

    // fires the real file download once a format button is clicked
    confirmDownload(id, fmt) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      STATS.downloads += 1;
      downloadReportCSV(rep, fmt || 'CSV');
      App.modal.close();
      App.toast(rep.title + ' downloaded as ' + fmt, 'download');
      App.reload();
    },

    // preview a report's contents (detail modal) with a working download
    preview(id) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      const c = CAT_C[rep.section] || 'var(--accent)';
      const sectionMeta = SECTIONS.find(s => s.key === rep.section);
      const includes = ['Executive summary', 'Registry aggregates', 'State-level breakdown', 'Trend & YoY deltas'];
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start;margin-bottom:16px">
          <div class="gr-tile" style="background:${c}1a;color:${c};width:44px;height:44px">${App.icon(rep.ic)}</div>
          <div class="grow">
            <div class="row gap-8 wrap" style="align-items:center"><span class="tag" style="background:${c}1a;color:${c}">${App.esc(sectionMeta ? sectionMeta.title.replace(/^\d+\.\s*/, '') : 'Report')}</span>${App.ui.pill(rep.freq, 'gray')}</div>
            <p class="muted" style="font-size:13px;margin-top:9px;line-height:1.55">${App.esc(rep.desc)}</p>
          </div>
        </div>
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Last generated</div><div class="statstrip__val num" style="font-size:16px">${App.esc(rep.last)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">File size</div><div class="statstrip__val num" style="font-size:16px">${App.esc(rep.size)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Cadence</div><div class="statstrip__val" style="font-size:16px">${App.esc(rep.freq)}</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">What's inside</div>
        <div class="list--divided">
          ${includes.map(x => `<div class="row gap-10" style="align-items:center;padding:9px 0;font-size:13.5px">${App.icon('filecheck')}<span>${App.esc(x)}</span></div>`).join('')}
        </div>
      `, {
        title: rep.title, icon: rep.ic,
        foot: `<button class="btn" onclick="App.modal.close();GovReports.generate('${rep.id}')">${App.icon('bolt')} Regenerate</button>
               <button class="btn btn--primary" onclick="App.modal.close();GovReports.download('${rep.id}')">${App.icon('download')} Download ${App.esc(rep.size)}</button>`,
      });
    },

    // run a queued/scheduled report now
    runScheduled(id) {
      const item = SCHED.find(x => x.id === id);
      if (!item || item.status === 'Completed') return;
      item.status = 'In Progress';
      App.reload();
      App.toast('Running “' + item.title + '”…', 'clock');
      setTimeout(() => {
        item.status = 'Completed';
        STATS.generated += 1;
        const rep = REPORTS.find(r => r.id === item.repId);
        if (rep) downloadReportCSV(rep);
        App.toast(item.title + ' ready & downloaded', 'checkcircle');
        App.reload();
      }, 1400);
    },

    // schedule a new recurring report
    scheduleNew() {
      const typeOpts = REPORTS.map(r => `<option value="${r.id}">${App.esc(r.title)}</option>`).join('');
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:18px">Add a report to the automated queue. It'll compile on the chosen cadence and land here for download.</p>
        <div class="field"><label class="label">Report type</label>
          <select class="select" id="grSchType">${typeOpts}</select></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Cadence</label>
            <select class="select" id="grSchFreq"><option>Weekly</option><option>Bi-weekly</option><option selected>Monthly</option><option>Quarterly</option></select></div>
          <div class="field"><label class="label">First run</label>
            <select class="select" id="grSchDue"><option>Dec 1, 2024</option><option>Dec 15, 2024</option><option>Jan 1, 2025</option></select></div>
        </div>
      `, {
        title: 'Schedule report', icon: 'calendar',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="GovReports.addScheduled()">${App.icon('plus')} Add to queue</button>`,
      });
    },
    addScheduled() {
      const rep = REPORTS.find(r => r.id === val('grSchType')) || REPORTS[0];
      const due = val('grSchDue') || 'Dec 1, 2024';
      SCHED.unshift({ id: 's' + (SCHED.length + 1) + '-' + Date.now(), repId: rep.id, title: rep.title, due, status: 'Scheduled' });
      App.modal.close();
      App.toast(rep.title + ' scheduled for ' + due, 'calendar');
      App.reload();
    },
  };

  App.registerView('gov-reports', {
    title: 'Reports',
    subtitle: 'Generate and download analytical reports',
    render() {
      // ---- editorial hero ----
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('chart')} Registry reports</div>
                <h1 class="h-grad" style="margin-top:12px">Turn the registry into decisions.</h1>
                <p class="lead">Every indicator in the Maharashtra LMIS framework, organised by section — headline metrics at a glance, and a full downloadable report wherever the indicator warrants one.</p>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="GovReports.scheduleNew()">${App.icon('calendar')} Schedule</button>
                <button class="btn btn--accent" onclick="GovReports.generate()">${App.icon('chart')} Custom report</button>
              </div>
            </div>
          </div>
        </div>`;

      // ---- library heading: state filter + section filter + "i" usage-stats action ----
      const govStates = (window.DB && DB.govStates) || [];
      const stateOptions = ['<option value="All">All States</option>'].concat(
        govStates.map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${App.esc(n)}</option>`)
      ).join('');
      const seg = `
        <div class="row between wrap gap-12" style="align-items:center;margin-bottom:14px">
          <div class="row gap-8" style="align-items:center">
            <div class="section-title" style="margin-bottom:0">Available reports</div>
            <button class="iconbtn gr-info" onclick="GovReports.showStats()" title="Reports usage this month" aria-label="Reports usage this month">${App.icon('help')}</button>
          </div>
          <div class="row gap-10 wrap" style="align-items:center">
            <div class="gr-selwrap">${App.icon('filter')}
              <select class="select gr-sel" onchange="GovReports.setState(this.value)" aria-label="Filter report data by state">${stateOptions}</select>
            </div>
            <div class="seg gr-seg">
              ${SECTION_FILTERS.map(f => `<button class="${S.cat === f.key ? 'is-active' : ''}" onclick="GovReports.setCat('${f.key}')">${App.esc(f.title)}</button>`).join('')}
            </div>
          </div>
        </div>`;

      // ---- report card (name + brief description only — no provenance clutter) ----
      function reportCard(r) {
        const c = CAT_C[r.section] || 'var(--accent)';
        return `
          <div class="card card--hover gr-card reveal" onclick="GovReports.preview('${r.id}')" role="button" tabindex="0"
               onkeydown="if(event.key==='Enter'){GovReports.preview('${r.id}')}">
            <div class="card__body">
              <div class="row between" style="align-items:flex-start;margin-bottom:14px">
                <div class="gr-tile" style="background:${c}1a;color:${c}">${App.icon(r.ic)}</div>
                ${App.ui.pill(r.freq, 'gray')}
              </div>
              <b style="font-size:15.5px;display:block;line-height:1.25">${App.esc(r.title)}</b>
              <p class="muted" style="font-size:12.8px;margin-top:6px;line-height:1.5">${App.esc(r.desc)}</p>
              <div class="row gap-16 wrap gr-meta">
                <span class="row gap-6">${App.icon('clock')}<span>Last · <b class="num" style="color:var(--ink-2)">${App.esc(r.last)}</b></span></span>
                <span class="row gap-6">${App.icon('file')}<span class="num">${App.esc(r.size)}</span></span>
              </div>
            </div>
            <div class="gr-foot">
              <button class="btn btn--soft btn--sm gr-dl" onclick="event.stopPropagation();GovReports.download('${r.id}')">${App.icon('download')} Download</button>
              <span class="gr-open">Open ${App.icon('arrow')}</span>
            </div>
          </div>`;
      }

      // ---- each section: KPI metric tiles first, then its one full report (if any) ----
      const visibleSections = SECTIONS.filter(s => S.cat === 'All' || S.cat === s.key);
      const cards = visibleSections.map(s => {
        const reps = REPORTS.filter(r => r.section === s.key);
        const metrics = METRICS[s.key] || [];
        return `
          <div class="gr-section reveal">
            <div class="gr-section__head">
              <div class="gr-tile" style="background:${s.c}1a;color:${s.c}">${App.icon(s.ic)}</div>
              <div class="grow"><h3 style="margin:0">${App.esc(s.title)}</h3><p class="muted" style="font-size:12.5px;margin:2px 0 0">${App.esc(s.desc)}</p></div>
            </div>
            ${metrics.length ? `<div class="grid grid-4 gr-metrics">${metrics.map(m => App.ui.kpi(m.icon, s.c, m.label, m.val, m.sub)).join('')}</div>` : ''}
            ${reps.length ? `<div class="grid grid-3 gr-lib">${reps.map(reportCard).join('')}</div>` : ''}
          </div>`;
      }).join('');

      // ---- scheduled queue ----
      const schedRows = SCHED.map(s => {
        const done = s.status === 'Completed';
        const busy = s.status === 'In Progress';
        return `
        <div class="minirow">
          <div class="gr-tile gr-tile--sm ${done ? 'gr-tile--done' : ''}">${App.icon(done ? 'checkcircle' : busy ? 'clock' : 'calendar')}</div>
          <div class="grow">
            <b style="font-size:13.8px">${App.esc(s.title)}</b>
            <div class="muted" style="font-size:12px;margin-top:2px">Due ${App.esc(s.due)}</div>
          </div>
          ${App.ui.statusPill(s.status)}
          ${done
            ? `<button class="btn btn--soft btn--sm" onclick="GovReports.download('${s.repId}')">${App.icon('download')} Get</button>`
            : `<button class="btn btn--sm" ${busy ? 'disabled style="opacity:.55"' : ''} onclick="GovReports.runScheduled('${s.id}')">${App.icon('bolt')} Run now</button>`}
        </div>`;
      }).join('');
      const schedCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('clock')}<h3 class="grow">Scheduled reports</h3>
            <button class="btn btn--ghost btn--sm" onclick="GovReports.scheduleNew()">${App.icon('plus')} New</button></div>
          <div class="card__body" style="padding-top:2px;padding-bottom:6px"><div class="list--divided">${schedRows}</div></div>
        </div>`;

      // ---- helper / assurance card ----
      const aboutCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">About these reports</h3></div>
          <div class="card__body">
            <p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:12px">Every metric and report here is built on the Worker Identity Number (WIN ID) — a consent-based employment and income identity, continuously re-verified every 14 days from HRMS integrations, gig/aggregator declarations, and direct worker self-declaration. Exports are aggregated and de-identified in line with the DPDP Act, 2023.</p>
            <p class="muted" style="font-size:12.5px;line-height:1.6;margin-bottom:10px">Figures are triangulated against the state's existing survey and administrative sources:</p>
            <div class="row gap-8 wrap">
              ${['PLFS (NSO)', 'DES Maharashtra', 'EPFO', 'ESIC', 'e-Shram', 'BOCW Board', 'MahaSwayam', 'NCS', 'Census', 'Labour Bureau'].map(s => `<span class="src-chip">${App.icon('database')} ${App.esc(s)}</span>`).join('')}
            </div>
            <div class="banner banner--accent" style="margin-top:16px;align-items:center">${App.icon('lock')}<div>Aggregated exports only — no individual worker record leaves the registry.</div></div>
            <div class="banner banner--info" style="margin-top:10px;align-items:flex-start">${App.icon('help')}<div><b>Not duplicated here</b> — grievance redress and full state-wise demographics are covered in depth on their own dedicated pages (Grievances, Demographics); employer-level compliance sits under the Dashboard's Risk Vigilance &amp; Compliance Gaps tabs.</div></div>
            <div class="banner banner--info" style="margin-top:10px;align-items:flex-start">${App.icon('help')}<div><b>Sourced externally</b> — Employer Hiring Intent reflects forward-looking recruitment plans, so it comes from the DES Maharashtra employer survey rather than WIN ID, which verifies realised, consent-based employment.</div></div>
          </div>
        </div>`;

      // ---- scoped styles ----
      const style = `<style>
        .gr-selwrap{ position:relative; display:inline-flex; align-items:center; }
        .gr-selwrap .ico{ position:absolute; left:11px; color:var(--muted); pointer-events:none; }
        .gr-sel{ padding-left:34px; min-width:160px; font-weight:600; }
        .gr-seg button{ white-space:nowrap; }
        .gr-info{ color:var(--muted); }
        .gr-info:hover{ color:var(--accent-strong); }
        .gr-tile{ width:40px; height:40px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
        .gr-tile--sm{ width:34px; height:34px; background:var(--accent-weak); color:var(--accent-strong); }
        .gr-tile--done{ background:var(--green-50); color:var(--green-700); }
        .gr-card{ display:flex; flex-direction:column; cursor:pointer; padding:0; }
        .gr-card .card__body{ flex:1; }
        .gr-meta{ margin-top:16px; padding-top:13px; border-top:1px solid var(--line-2); font-size:12px; color:var(--muted); }
        .gr-meta .ico{ width:14px; height:14px; color:var(--faint); }
        .gr-meta .row{ align-items:center; }
        .gr-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 18px; border-top:1px solid var(--line-2); background:var(--surface-2); }
        .gr-open{ display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; color:var(--accent-strong); opacity:0; transform:translateX(-4px); transition:.16s; }
        .gr-open .ico{ width:14px; height:14px; }
        .gr-card:hover .gr-open{ opacity:1; transform:translateX(0); }
        .gr-gen{ text-align:center; padding:14px 6px 6px; }
        .gr-gen__ic{ width:52px; height:52px; margin:0 auto 12px; border-radius:var(--r); display:grid; place-items:center; background:var(--accent-weak); color:var(--accent-strong); }
        .gr-gen__ic .ico{ width:24px; height:24px; }
        .gr-btm{ display:grid; grid-template-columns:1.15fr .85fr; gap:20px; align-items:start; }
        .gr-section{ margin-bottom:26px; }
        .gr-section__head{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .gr-metrics{ margin-bottom:16px; }
        @media (max-width:960px){ .gr-lib, .gr-metrics{ grid-template-columns:repeat(2,1fr); } .gr-btm{ grid-template-columns:1fr; } }
        @media (max-width:600px){ .gr-lib, .gr-metrics{ grid-template-columns:1fr; } .gr-seg{ overflow-x:auto; max-width:100%; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}
        ${hero}
        ${seg}
        ${cards}
        <div class="gr-btm">
          ${schedCard}
          ${aboutCard}
        </div>
      </div>`;
    }
  });
})();
