/* Government · Reports — editorial hero, live quick-stats strip, a
   category-filtered library of analytical reports (download + preview),
   a scheduled-reports queue you can run, and a working "Generate report"
   flow (type + period + format → simulated compile → toast). All figures
   are from the WiN registry demo. Gold-standard v2 look. */
(function () {
  // ---- category tints (not in base tokens) ----
  const CAT_C = {
    Employment:  'var(--accent)',
    Grievances:  '#c07d10',
    Demographics:'#2f5fd0',
    Compliance:  '#6b4fc7',
    Economics:   '#0e9f6e',
    Migration:   '#0891a7',
  };

  // ---- report library (from the GovReports spec) ----
  const REPORTS = [
    { id: 'emp-monthly',  title: 'Monthly Employment Summary', cat: 'Employment',   ic: 'users',    size: '2.4 MB', last: 'Nov 1, 2024',  freq: 'Monthly',   desc: 'Comprehensive overview of enrollment, verification, and sector distribution.' },
    { id: 'grievance',    title: 'Grievance Analysis Report',  cat: 'Grievances',   ic: 'alert',    size: '1.1 MB', last: 'Nov 15, 2024', freq: 'Bi-weekly', desc: 'Category-wise breakdown of grievances, resolution times, and escalation rates.' },
    { id: 'demographics', title: 'State-wise Demographics',    cat: 'Demographics', ic: 'mappin',   size: '3.8 MB', last: 'Oct 31, 2024', freq: 'Monthly',   desc: 'Detailed demographic data per state including gender, age, and urban/rural split.' },
    { id: 'compliance',   title: 'Employer Compliance Report', cat: 'Compliance',   ic: 'building',  size: '980 KB', last: 'Nov 10, 2024', freq: 'Weekly',    desc: 'Verification compliance rates and outstanding employer obligations.' },
    { id: 'economic',     title: 'Quarterly Economic Impact',  cat: 'Economics',    ic: 'trend',    size: '5.2 MB', last: 'Sep 30, 2024', freq: 'Quarterly', desc: 'Assessment of WiN platform impact on formalization of the informal workforce.' },
    { id: 'sector',       title: 'Sector Growth Analysis',     cat: 'Employment',   ic: 'chart',    size: '2.0 MB', last: 'Nov 5, 2024',  freq: 'Monthly',   desc: 'Sector-wise employment growth trends and forward projections.' },
    { id: 'migration',    title: 'Interstate Worker Migration Report', cat: 'Migration', ic: 'mappin', size: '3.1 MB', last: 'Nov 12, 2024', freq: 'Quarterly', desc: 'Origin-destination migration corridors, seasonal labour flow, and top sending/receiving states for informal workers.' },
  ];

  // ---- shared seed lists for generating extensive (100+ row), realistic report data ----
  const ALL_STATES = [
    'Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal', 'Madhya Pradesh', 'Tamil Nadu',
    'Rajasthan', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Odisha', 'Telangana', 'Kerala',
    'Jharkhand', 'Assam', 'Punjab', 'Chhattisgarh', 'Haryana', 'Delhi NCR', 'Uttarakhand',
  ];
  const SECTOR_LIST = ['Construction', 'Manufacturing', 'Gig & Platform', 'Agriculture', 'Domestic & Services'];
  const DISTRICT_SEED = ['Central', 'North', 'South', 'East', 'West', 'Rural Belt'];

  // deterministic pseudo-random (no Math.random) so the seed data is stable across renders
  function seeded(i, salt) { return ((i * 9301 + salt * 49297 + 233280) % 100000) / 100000; }

  function genEmpMonthly() {
    const months = ['May 2024', 'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024'];
    const rows = [];
    ALL_STATES.forEach((st, si) => months.forEach((m, mi) => {
      const base = 200000 + si * 41000 + mi * 9000;
      const enrolled = Math.round(base * (0.9 + seeded(si, mi) * 0.3));
      const rate = Math.round((60 + seeded(mi, si) * 30) * 10) / 10;
      const verified = Math.round(enrolled * rate / 100);
      rows.push([st, m, enrolled, verified, rate, SECTOR_LIST[(si + mi) % SECTOR_LIST.length]]);
    }));
    return { headers: ['State', 'Month', 'Enrolled', 'Verified', 'Verification Rate %', 'Top Sector'], rows };
  }

  function genGrievance() {
    const cats = ['Wage Disputes', 'ESIC Coverage', 'PF Withdrawal Delay', 'Contract Violations', 'Workplace Safety'];
    const rows = [];
    for (let d = 1; d <= 100; d++) {
      const cat = cats[d % cats.length];
      const filed = 800 + Math.round(seeded(d, 3) * 1400);
      const resolved = Math.round(filed * (0.75 + seeded(d, 7) * 0.15));
      const escalated = Math.round(filed * (0.03 + seeded(d, 11) * 0.06));
      const avgRes = Math.round((4 + seeded(d, 13) * 10) * 10) / 10;
      const date = '2024-' + String(1 + Math.floor((d - 1) / 30) % 9 + 1).padStart(2, '0') + '-' + String(((d - 1) % 28) + 1).padStart(2, '0');
      rows.push([date, cat, filed, resolved, escalated, avgRes]);
    }
    return { headers: ['Date', 'Category', 'Filed', 'Resolved', 'Escalated', 'Avg. Resolution (days)'], rows };
  }

  function genDemographics() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const total = Math.round((900000 + si * 210000) * (0.7 + seeded(si, di) * 0.6));
      const malePct = Math.round((58 + seeded(di, si) * 16) * 10) / 10;
      const femalePct = Math.round((100 - malePct) * 10) / 10;
      const urban = Math.round(24 + seeded(si + di, 5) * 50);
      const avgAge = 28 + (si + di) % 10;
      rows.push([st, st + ' ' + d, total, malePct, femalePct, urban, avgAge]);
    }));
    return { headers: ['State', 'District', 'Total Enrolled', 'Male %', 'Female %', 'Urban %', 'Avg Age'], rows };
  }

  function genCompliance() {
    const SUFFIX = ['Pvt Ltd', 'Constructions', 'Enterprises', 'Industries', 'Group', '& Sons', 'Infra', 'Textiles'];
    const NAMEROOT = ['Bharat', 'Shakti', 'Ganga', 'Om', 'Sunrise', 'National', 'United', 'Metro', 'Prime', 'Star',
      'Global', 'Everest', 'Silver', 'Golden', 'Royal', 'Bluepeak', 'Greenfield', 'Ironclad', 'Vishnu', 'Laxmi'];
    const rows = [];
    for (let i = 0; i < 100; i++) {
      const name = NAMEROOT[i % NAMEROOT.length] + ' ' + SUFFIX[(i * 3 + 1) % SUFFIX.length];
      const sector = SECTOR_LIST[i % SECTOR_LIST.length];
      const state = ALL_STATES[i % ALL_STATES.length];
      const pf = Math.round(30 + seeded(i, 2) * 65);
      const esic = Math.round(25 + seeded(i, 4) * 68);
      const wage = Math.round(45 + seeded(i, 6) * 50);
      const change = Math.round((seeded(i, 8) * 8 - 3) * 10) / 10;
      rows.push([name, sector, state, pf, esic, wage, change]);
    }
    return { headers: ['Employer', 'Sector', 'State', 'PF Compliance %', 'ESIC Coverage %', 'Min. Wage Adherence %', 'YoY Change %'], rows };
  }

  function genEconomic() {
    const quarters = ['Q1 FY 22-23', 'Q2 FY 22-23', 'Q3 FY 22-23', 'Q4 FY 22-23', 'Q1 FY 23-24', 'Q2 FY 23-24', 'Q3 FY 23-24', 'Q4 FY 23-24'];
    const rows = [];
    quarters.forEach((q, qi) => ALL_STATES.slice(0, 13).forEach((st, si) => {
      const formalized = Math.round((0.08 + seeded(qi, si) * 0.3) * 100) / 100;
      const uplift = Math.round(180 + seeded(si, qi) * 620);
      const newEmp = Math.round(1800 + seeded(qi + si, 9) * 6200);
      rows.push([q, st, formalized, uplift, newEmp]);
    }));
    return { headers: ['Quarter', 'State', 'Formalized Workers (Cr)', 'Est. Wage Uplift (₹ Cr)', 'New Employer Registrations'], rows };
  }

  function genSector() {
    const rows = [];
    SECTOR_LIST.forEach((sec, sci) => ALL_STATES.forEach((st, si) => {
      const current = Math.round((900000 + si * 180000 + sci * 240000) * (0.8 + seeded(si, sci) * 0.5));
      const prev = Math.round(current / (1 + (0.04 + seeded(sci, si) * 0.35)));
      const growth = Math.round((current - prev) / prev * 1000) / 10;
      rows.push([sec, st, current, prev, growth]);
    }));
    return { headers: ['Sector', 'State', 'Current Workers', 'Previous Year', 'YoY Growth %'], rows };
  }

  function genMigration() {
    const origins = ['Bihar', 'Uttar Pradesh', 'Odisha', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Uttarakhand'];
    const dests = ['Maharashtra', 'Delhi NCR', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Andhra Pradesh'];
    const seasons = ['Year-round', 'Oct - Mar', 'Nov - Apr', 'Jun - Sep', 'Dec - Feb'];
    const rows = [];
    let i = 0;
    origins.forEach((o, oi) => dests.forEach((d, di) => {
      if (o === d) return;
      i++;
      const workers = Math.round((60000 + oi * 9000 + di * 4000) * (0.6 + seeded(oi, di) * 0.8));
      rows.push([o, d, workers, SECTOR_LIST[(oi + di) % SECTOR_LIST.length], seasons[(oi * 3 + di) % seasons.length]]);
    }));
    rows.sort((a, b) => b[2] - a[2]);
    return { headers: ['Origin State', 'Destination State', 'Workers (est.)', 'Dominant Sector', 'Peak Season'], rows: rows.slice(0, 100) };
  }

  // ---- realistic, extensive (100+ row) CSV/Excel/PDF payloads keyed by report id ----
  const REPORT_DATA = {
    'emp-monthly': genEmpMonthly(),
    grievance: genGrievance(),
    demographics: genDemographics(),
    compliance: genCompliance(),
    economic: genEconomic(),
    sector: genSector(),
    migration: genMigration(),
  };

  // ---- scheduled queue (mutable so "Run now" changes state) ----
  const SCHED = [
    { id: 's1', repId: 'emp-monthly', title: 'December Monthly Summary', due: 'Dec 1, 2024',  status: 'Scheduled' },
    { id: 's2', repId: 'grievance',   title: 'Grievance Bi-weekly #24',  due: 'Nov 30, 2024', status: 'In Progress' },
    { id: 's3', repId: 'compliance',  title: 'Weekly Compliance Check',   due: 'Nov 25, 2024', status: 'Scheduled' },
  ];

  // ---- live quick-stats (mutable so generate/download move the numbers) ----
  const STATS = { generated: 24, downloads: 1247, avg: '2.4 min' };

  const CATS = ['All', 'Employment', 'Grievances', 'Demographics', 'Compliance', 'Economics', 'Migration'];
  const PERIODS = ['This month (Nov 2024)', 'Last month (Oct 2024)', 'Q3 FY 2024–25', 'FY 2024–25 (YTD)', 'Custom range…'];

  // ---- view state ----
  const S = { cat: 'All', state: 'All' };
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  // ---- generate-report modal body (reused by header CTA + per-card generate) ----
  function genFormHtml(preType) {
    const typeOpts = REPORTS.map(r => `<option value="${r.id}" ${preType === r.id ? 'selected' : ''}>${App.esc(r.title)}</option>`).join('')
      + `<option value="custom" ${preType === 'custom' ? 'selected' : ''}>Custom / ad-hoc data extract</option>`;
    const periodOpts = PERIODS.map((p, i) => `<option ${i === 0 ? 'selected' : ''}>${App.esc(p)}</option>`).join('');
    const chips = ['Summary tables', 'Charts', 'State breakdown', 'Raw data'];
    return `
      <div id="grGenForm">
        <p class="muted" style="font-size:13px;margin-bottom:18px">Compile a report from the live WiN registry. This is a demo export — nothing leaves the prototype.</p>
        <div class="field"><label class="label">Report type</label>
          <select class="select" id="grType">${typeOpts}</select></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Reporting period</label>
            <select class="select" id="grPeriod">${periodOpts}</select></div>
          <div class="field"><label class="label">Format</label>
            <select class="select" id="grFmt"><option>PDF summary</option><option>Excel (.xlsx)</option><option>CSV data extract</option></select></div>
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
        ['Report', 'Category', 'Frequency', 'Last generated'],
        REPORTS.map(r => [r.title, r.cat, r.freq, r.last]), fmt || 'CSV');
    }
  }

  window.GovReports = {
    setCat(c) { S.cat = c; App.reload(); },
    setState(v) { S.state = v; App.reload(); },

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
      const type = val('grType'), period = val('grPeriod'), fmt = (val('grFmt') || 'PDF').split(' ')[0];
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
      const headers = data ? data.headers : ['Report', 'Category', 'Frequency', 'Last generated'];
      const allRows = stateFilteredRows(headers, data ? data.rows : REPORTS.map(r => [r.title, r.cat, r.freq, r.last]));
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
      const c = CAT_C[rep.cat] || 'var(--accent)';
      const includes = ['Executive summary', 'Registry aggregates', 'State-level breakdown', 'Trend charts & YoY deltas', 'Source-verification audit trail'];
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start;margin-bottom:16px">
          <div class="gr-tile" style="background:${c}1a;color:${c};width:44px;height:44px">${App.icon(rep.ic)}</div>
          <div class="grow">
            <div class="row gap-8 wrap" style="align-items:center"><span class="tag" style="background:${c}1a;color:${c}">${App.esc(rep.cat)}</span>${App.ui.pill(rep.freq, 'gray')}</div>
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
                <p class="lead">Generate, schedule and download analytical reports across enrollment, grievances, compliance and economic impact — straight from live WiN data.</p>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="GovReports.scheduleNew()">${App.icon('calendar')} Schedule</button>
                <button class="btn btn--accent" onclick="GovReports.generate()">${App.icon('chart')} Custom report</button>
              </div>
            </div>
          </div>
        </div>`;

      // ---- live quick-stats strip ----
      const strip = `
        <div class="statstrip reveal mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Reports generated (MTD)</div><div class="statstrip__val num">${App.num(STATS.generated)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Total downloads</div><div class="statstrip__val num">${App.num(STATS.downloads)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Avg. generation time</div><div class="statstrip__val num">${App.esc(STATS.avg)}</div></div>
        </div>`;

      // ---- library: category segmented filter + state filter (narrows the data behind
      // Download for any report with a State column — see stateFilteredRows()) ----
      const govStates = (window.DB && DB.govStates) || [];
      const stateOptions = ['<option value="All">All States</option>'].concat(
        govStates.map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${App.esc(n)}</option>`)
      ).join('');
      const seg = `
        <div class="row between wrap gap-12" style="align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">Available reports</div>
          <div class="row gap-10 wrap" style="align-items:center">
            <div class="gr-selwrap">${App.icon('filter')}
              <select class="select gr-sel" onchange="GovReports.setState(this.value)" aria-label="Filter report data by state">${stateOptions}</select>
            </div>
            <div class="seg gr-seg">
              ${CATS.map(c => `<button class="${S.cat === c ? 'is-active' : ''}" onclick="GovReports.setCat('${c}')">${c}</button>`).join('')}
            </div>
          </div>
        </div>`;

      const shown = REPORTS.filter(r => S.cat === 'All' || r.cat === S.cat);
      const cards = shown.length ? `
        <div class="grid grid-3 gr-lib mb-20">
          ${shown.map(r => {
            const c = CAT_C[r.cat] || 'var(--accent)';
            return `
            <div class="card card--hover gr-card reveal" onclick="GovReports.preview('${r.id}')" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter'){GovReports.preview('${r.id}')}">
              <div class="card__body">
                <div class="row between" style="align-items:flex-start;margin-bottom:14px">
                  <div class="gr-tile" style="background:${c}1a;color:${c}">${App.icon(r.ic)}</div>
                  <span class="tag" style="background:${c}1a;color:${c}">${App.esc(r.cat)}</span>
                </div>
                <b style="font-size:15.5px;display:block;line-height:1.25">${App.esc(r.title)}</b>
                <p class="muted" style="font-size:12.8px;margin-top:6px;line-height:1.5">${App.esc(r.desc)}</p>
                <div class="row gap-16 wrap gr-meta">
                  <span class="row gap-6">${App.icon('clock')}<span>Last · <b class="num" style="color:var(--ink-2)">${App.esc(r.last)}</b></span></span>
                  <span class="row gap-6">${App.icon('calendar')}<span>${App.esc(r.freq)}</span></span>
                  <span class="row gap-6">${App.icon('file')}<span class="num">${App.esc(r.size)}</span></span>
                </div>
              </div>
              <div class="gr-foot">
                <button class="btn btn--soft btn--sm gr-dl" onclick="event.stopPropagation();GovReports.download('${r.id}')">${App.icon('download')} Download</button>
                <span class="gr-open">Open ${App.icon('arrow')}</span>
              </div>
            </div>`;
          }).join('')}
        </div>` : `<div class="card reveal mb-20">${App.ui.empty('file', 'No reports in this category', 'Try another filter or generate a custom report.')}</div>`;

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
            <p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:14px">Every report is compiled from source-verified WiN records (EPFO, Income Tax, ESIC, GSTN, Aadhaar). Exports are aggregated and de-identified in line with the DPDP Act, 2023.</p>
            <div class="row gap-8 wrap">
              ${['EPFO', 'Income Tax', 'ESIC', 'GSTN', 'e-Shram'].map(s => `<span class="src-chip">${App.icon('database')} ${App.esc(s)}</span>`).join('')}
            </div>
            <div class="banner banner--accent" style="margin-top:16px;align-items:center">${App.icon('lock')}<div>Aggregated exports only — no individual worker record leaves the registry.</div></div>
          </div>
        </div>`;

      // ---- scoped styles ----
      const style = `<style>
        .gr-selwrap{ position:relative; display:inline-flex; align-items:center; }
        .gr-selwrap .ico{ position:absolute; left:11px; color:var(--muted); pointer-events:none; }
        .gr-sel{ padding-left:34px; min-width:160px; font-weight:600; }
        .gr-seg button{ white-space:nowrap; }
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
        @media (max-width:960px){ .gr-lib{ grid-template-columns:repeat(2,1fr); } .gr-btm{ grid-template-columns:1fr; } }
        @media (max-width:600px){ .gr-lib{ grid-template-columns:1fr; } .gr-seg{ overflow-x:auto; max-width:100%; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}
        ${hero}
        ${strip}
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
