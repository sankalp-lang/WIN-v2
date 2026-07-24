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
  };

  // ---- report library (from the GovReports spec) ----
  const REPORTS = [
    { id: 'emp-monthly',  title: 'Monthly Employment Summary', cat: 'Employment',   ic: 'users',    size: '2.4 MB', last: 'Nov 1, 2024',  freq: 'Monthly',   desc: 'Comprehensive overview of enrollment, verification, and sector distribution.' },
    { id: 'grievance',    title: 'Grievance Analysis Report',  cat: 'Grievances',   ic: 'alert',    size: '1.1 MB', last: 'Nov 15, 2024', freq: 'Bi-weekly', desc: 'Category-wise breakdown of grievances, resolution times, and escalation rates.' },
    { id: 'demographics', title: 'State-wise Demographics',    cat: 'Demographics', ic: 'mappin',   size: '3.8 MB', last: 'Oct 31, 2024', freq: 'Monthly',   desc: 'Detailed demographic data per state including gender, age, and urban/rural split.' },
    { id: 'compliance',   title: 'Employer Compliance Report', cat: 'Compliance',   ic: 'building',  size: '980 KB', last: 'Nov 10, 2024', freq: 'Weekly',    desc: 'Verification compliance rates and outstanding employer obligations.' },
    { id: 'economic',     title: 'Quarterly Economic Impact',  cat: 'Economics',    ic: 'trend',    size: '5.2 MB', last: 'Sep 30, 2024', freq: 'Quarterly', desc: 'Assessment of WiN platform impact on formalization of the informal workforce.' },
    { id: 'sector',       title: 'Sector Growth Analysis',     cat: 'Employment',   ic: 'chart',    size: '2.0 MB', last: 'Nov 5, 2024',  freq: 'Monthly',   desc: 'Sector-wise employment growth trends and forward projections.' },
  ];

  // ---- scheduled queue (mutable so "Run now" changes state) ----
  const SCHED = [
    { id: 's1', title: 'December Monthly Summary', due: 'Dec 1, 2024',  status: 'Scheduled' },
    { id: 's2', title: 'Grievance Bi-weekly #24',  due: 'Nov 30, 2024', status: 'In Progress' },
    { id: 's3', title: 'Weekly Compliance Check',   due: 'Nov 25, 2024', status: 'Scheduled' },
  ];

  // ---- live quick-stats (mutable so generate/download move the numbers) ----
  const STATS = { generated: 24, downloads: 1247, avg: '2.4 min' };

  const CATS = ['All', 'Employment', 'Grievances', 'Demographics', 'Compliance', 'Economics'];
  const PERIODS = ['This month (Nov 2024)', 'Last month (Oct 2024)', 'Q3 FY 2024–25', 'FY 2024–25 (YTD)', 'Custom range…'];

  // ---- view state ----
  const S = { cat: 'All' };
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

  window.GovReports = {
    setCat(c) { S.cat = c; App.reload(); },

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
        if (rep) rep.last = 'Nov 17, 2024';
        App.modal.close();
        App.toast(name + ' generated', 'download');
        App.reload();
      }, 1350);
    },

    // download an existing report → toast + bump download count
    download(id) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      STATS.downloads += 1;
      App.toast(rep.title + ' · ' + rep.size + ' downloaded', 'download');
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
        App.toast(item.title + ' ready', 'checkcircle');
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
      SCHED.unshift({ id: 's' + (SCHED.length + 1) + '-' + Date.now(), title: rep.title, due, status: 'Scheduled' });
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

      // ---- library: category segmented filter ----
      const seg = `
        <div class="row between wrap gap-12" style="align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">Available reports</div>
          <div class="seg gr-seg">
            ${CATS.map(c => `<button class="${S.cat === c ? 'is-active' : ''}" onclick="GovReports.setCat('${c}')">${c}</button>`).join('')}
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
            ? `<button class="btn btn--soft btn--sm" onclick="GovReports.download('${REPORTS[0].id}')">${App.icon('download')} Get</button>`
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
