/* Government · Employment Demographics — workforce composition &
   geographic distribution across the WiN registry: gender & age charts,
   sector growth, key insights, a filterable per-state table, and the
   urban/rural split. v2 editorial: hero band + reveal motion.
   Interactions (all live): the header state <select> filters the state
   table; "Generate Report" opens a demo export flow (→ toast); "Ask WiN"
   opens the assistant; sector rows open a year-on-year detail modal;
   state rows open a state-demographics modal that can filter the table;
   footer cards navigate to sibling registry screens. Figures are the
   GovDemographics demo dataset. */
(function () {
  // ---- palette / glyphs not in the base tokens ----
  const ROSE = '#e0447a';            // female
  const upTri = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display:block"><path d="M12 5 20 19H4z"/></svg>`;

  // ---- registry demo data (from the GovDemographics spec) ----
  const TOTAL = 384126000; // 38.4 Cr enrolled

  const GENDER = {
    male:   { pct: 67.3, n: 258533000 },
    female: { pct: 32.7, n: 125593000 },
  };

  const AGE = [
    { band: '18–25', n: 107555000, pct: 28 },
    { band: '26–35', n: 134444000, pct: 35 },
    { band: '36–45', n: 84508000,  pct: 22 },
    { band: '46–55', n: 42254000,  pct: 11 },
    { band: '56+',   n: 15365000,  pct: 4  },
  ];

  const SECTORS = [
    { name: 'Construction',        n: 88412000,  prev: 74421000,  g: 18.8 },
    { name: 'Manufacturing',       n: 53818000,  prev: 47312000,  g: 13.7 },
    { name: 'Gig & Platform',      n: 38412600,  prev: 27489000,  g: 39.7 },
    { name: 'Agriculture',         n: 124824000, prev: 118512000, g: 5.3  },
    { name: 'Domestic & Services', n: 34612000,  prev: 31356000,  g: 10.4 },
  ];

  const INSIGHTS = [
    { c: 'var(--green-600)', html: `<b>Gig &amp; platform</b> workers grew <b>+39.7% YoY</b> — the fastest among all sectors.` },
    { c: 'var(--blue-600)',  html: `<b>Female participation</b> at <b>32.7%</b>, up from 28.4% last year.` },
    { c: 'var(--accent)',    html: `<b>Telangana</b> has the highest growth rate at <b>+22.4%</b>, driven by the IT-led gig economy.` },
    { c: 'var(--amber-600)', html: `<b>38.4 Cr</b> workers enrolled of an estimated 48 Cr informal workforce — <b>80% coverage</b>.` },
    { c: '#64748b',          html: `<b>Agriculture</b> remains the largest employment sector at <b>32.5%</b>.` },
  ];

  const STATES = [
    { name: 'Uttar Pradesh',  total: 51234000, male: 34839000, female: 16395000, urban: 34, avg: 33, sector: 'Agriculture',    g: 8.2  },
    { name: 'Maharashtra',    total: 42856000, male: 27856000, female: 15000000, urban: 62, avg: 31, sector: 'Construction',   g: 12.4 },
    { name: 'Bihar',          total: 34218000, male: 23952000, female: 10266000, urban: 24, avg: 32, sector: 'Agriculture',    g: 6.8  },
    { name: 'West Bengal',    total: 29845000, male: 19499000, female: 10346000, urban: 42, avg: 34, sector: 'Domestic Work',  g: 5.4  },
    { name: 'Tamil Nadu',     total: 23478000, male: 14134000, female: 9344000,  urban: 58, avg: 32, sector: 'Manufacturing',  g: 9.8  },
    { name: 'Rajasthan',      total: 21890000, male: 15104000, female: 6786000,  urban: 38, avg: 33, sector: 'Construction',   g: 7.5  },
    { name: 'Karnataka',      total: 20456000, male: 13396000, female: 7060000,  urban: 64, avg: 29, sector: 'Gig & Platform', g: 15.1 },
    { name: 'Madhya Pradesh', total: 25612000, male: 17416000, female: 8196000,  urban: 32, avg: 34, sector: 'Agriculture',    g: 6.1  },
    { name: 'Telangana',      total: 14823000, male: 9264000,  female: 5559000,  urban: 68, avg: 29, sector: 'Gig & Platform', g: 22.4 },
    { name: 'Kerala',         total: 11245000, male: 5847000,  female: 5398000,  urban: 52, avg: 36, sector: 'Domestic Work',  g: 4.2  },
  ];

  const URBAN = { n: 165286000, pct: 43.0 };
  const RURAL = { n: 218840000, pct: 57.0 };

  // ---- sibling registry screens (footer cross-nav) ----
  const EXPLORE = [
    { ic: 'users', c: '#0d9488', t: 'Enrollment & verification', s: 'State-wise registrations, sources & gaps', go: 'gov-enrollment' },
    { ic: 'chart', c: '#2f5fd0', t: 'National dashboard',        s: 'Risk vigilance, compliance & schemes',    go: 'gov-dashboard' },
    { ic: 'file',  c: '#B77E12', t: 'Reports & exports',         s: 'Generate and download registry reports',   go: 'gov-reports' },
  ];

  // ---- state + controller ----
  const S = { state: 'All' };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  window.GovDemo = {
    setState(v) { S.state = v; App.reload(); },
    ask(q) { App.assistant.toggle(true); App.assistant.ask(q || 'Give me the headline takeaways from the current employment demographics.'); },

    generate() {
      const scope = S.state === 'All' ? 'All States (Top 10)' : S.state;
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:18px">Compile a workforce demographics report from the live WiN registry. This is a demo export.</p>
        <div class="field"><label class="label">Geographic scope</label>
          <div class="input" style="display:flex;align-items:center;background:var(--surface-2)">${App.esc(scope)}</div></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Format</label>
            <select class="select" id="gdFmt"><option>PDF summary</option><option>Excel (.xlsx)</option><option>CSV data extract</option></select></div>
          <div class="field"><label class="label">Reporting period</label>
            <select class="select"><option>FY 2025–26 (YTD)</option><option>Q4 2025–26</option><option>Last 12 months</option></select></div>
        </div>
        <div class="field" style="margin-bottom:0"><label class="label">Include sections</label>
          <div class="row gap-8 wrap" style="margin-top:4px">
            ${['Gender & age', 'Sector growth', 'State breakdown', 'Urban/rural'].map(s => `<span class="chip">${App.icon('check')} ${App.esc(s)}</span>`).join('')}
          </div></div>
      `, {
        title: 'Generate Demographics Report', icon: 'chart',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--accent" onclick="GovDemo.download()">${App.icon('download')} Generate &amp; download</button>`
      });
    },
    download() {
      const fmt = (document.getElementById('gdFmt') || {}).value || 'report';
      App.modal.close();
      App.toast('Demographics ' + fmt.split(' ')[0] + ' report generated', 'download');
    },

    openSector(name) {
      const s = SECTORS.find(x => x.name === name); if (!s) return;
      const share = Math.round(s.n / TOTAL * 1000) / 10;
      const added = s.n - s.prev;
      const prevPct = Math.round(s.prev / s.n * 100);
      App.modal.open(`
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Current workers</div><div class="statstrip__val num">${App.num(s.n)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">YoY growth</div><div class="statstrip__val num" style="color:var(--green-700)">+${s.g}%</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Share of workforce</div><div class="statstrip__val num">${share}%</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">Year-on-year change</div>
        <div class="row between" style="margin-bottom:6px;align-items:baseline"><span class="muted" style="font-size:12.5px">Previous year</span><b class="num" style="font-size:13.5px">${App.num(s.prev)}</b></div>
        ${App.ui.bar(prevPct, '#94a3b8')}
        <div class="row between" style="margin:14px 0 6px;align-items:baseline"><span class="muted" style="font-size:12.5px">Current year</span><b class="num" style="font-size:13.5px">${App.num(s.n)}</b></div>
        ${App.ui.bar(100, 'var(--accent)')}
        <div class="banner banner--green" style="margin-top:18px;align-items:center">${App.icon('trend')}<div><b class="num">+${App.num(added)}</b> workers added this year · <b>+${s.g}% YoY</b>.</div></div>
      `, {
        title: s.name + ' — Sector detail', icon: 'briefcase',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               <button class="btn btn--accent" onclick="App.modal.close();GovDemo.ask('How is the ${jsq(s.name)} sector evolving across states, and where is the growth concentrated?')">${App.icon('sparkles')} Ask WiN</button>`
      });
    },

    openState(name) {
      const s = STATES.find(x => x.name === name); if (!s) return;
      const mPct = Math.round(s.male / s.total * 1000) / 10;
      const fPct = Math.round(s.female / s.total * 1000) / 10;
      const rural = 100 - s.urban;
      App.modal.open(`
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Total enrolled</div><div class="statstrip__val num">${App.num(s.total)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Average age</div><div class="statstrip__val num">${s.avg} yrs</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">Gender split</div>
        <div class="gd-split mb-8"><span style="width:${mPct}%;background:var(--blue-600)"></span><span style="width:${fPct}%;background:${ROSE}"></span></div>
        <div class="row between mb-20" style="font-size:12.5px">
          <span style="color:var(--blue-600);font-weight:600">Male · <span class="num">${App.num(s.male)}</span> (${mPct}%)</span>
          <span style="color:${ROSE};font-weight:600">Female · <span class="num">${App.num(s.female)}</span> (${fPct}%)</span>
        </div>
        <div class="section-title" style="font-size:13.5px">Urban vs rural</div>
        <div class="gd-split mb-8"><span style="width:${s.urban}%;background:var(--blue-600)"></span><span style="width:${rural}%;background:var(--amber-600)"></span></div>
        <div class="row between mb-20" style="font-size:12.5px">
          <span style="color:var(--blue-600);font-weight:600">Urban ${s.urban}%</span>
          <span style="color:var(--amber-700);font-weight:600">Rural ${rural}%</span>
        </div>
        <div class="row between" style="padding-top:14px;border-top:1px solid var(--line-2)">
          <span class="muted" style="font-size:12.5px">Top sector · <b style="color:var(--ink)">${App.esc(s.sector)}</b></span>
          <span class="gd-up">${upTri} +${s.g}% YoY</span>
        </div>
      `, {
        title: s.name + ' — Demographics', icon: 'mappin',
        foot: `<button class="btn" onclick="App.modal.close();GovDemo.ask('What is driving worker enrollment and growth in ${jsq(s.name)}?')">${App.icon('sparkles')} Ask WiN</button>
               <button class="btn btn--accent" onclick="App.modal.close();GovDemo.setState('${jsq(s.name)}')">Filter table to ${App.esc(s.name)}</button>`
      });
    },
  };

  App.registerView('gov-demographics', {
    title: 'Employment Demographics',
    subtitle: 'Workforce composition & geographic distribution',
    render() {
      // ---- state filter options ----
      const options = ['All'].concat(STATES.map(s => s.name))
        .map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${n === 'All' ? 'All States' : App.esc(n)}</option>`).join('');

      // ---- editorial hero ----
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('chart')} Registry · Demographics</div>
                <h1 class="h-grad" style="margin-top:12px">The shape of India's workforce.</h1>
                <p class="lead">Composition and geographic spread of every enrolled worker — gender, age, sector momentum and the urban–rural divide, read live from the WiN golden record.</p>
              </div>
              <div class="row gap-10 wrap" style="align-items:center;justify-content:flex-end">
                <div class="gd-selwrap">${App.icon('filter')}
                  <select class="select gd-sel" onchange="GovDemo.setState(this.value)" aria-label="Filter by state">${options}</select>
                </div>
                <button class="btn" onclick="GovDemo.ask()">${App.icon('sparkles')} Ask WiN</button>
                <button class="btn btn--accent" onclick="GovDemo.generate()">${App.icon('chart')} Generate Report</button>
              </div>
            </div>
          </div>
        </div>`;

      // ---- overview statstrip ----
      const strip = `
        <div class="statstrip reveal mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Total enrolled workers</div><div class="statstrip__val num">38.4 Cr</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Female participation</div><div class="statstrip__val num">32.7%</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Average age</div><div class="statstrip__val num">32.4 yrs</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Informal coverage</div><div class="statstrip__val num">80%</div></div>
        </div>`;

      // ---- gender distribution ----
      const genderCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('users')}<h3 class="grow">Gender Distribution</h3></div>
          <div class="card__body">
            <div class="row center gap-24" style="margin:4px 0 20px">
              <div style="text-align:center">
                <div class="ring" style="--p:${GENDER.male.pct};--c:var(--blue-600);width:112px;height:112px">
                  <div class="ring__in" style="width:82px;height:82px"><div><div class="ring__val num" style="font-size:20px;color:var(--blue-600)">${GENDER.male.pct}%</div><div class="ring__lbl">Male</div></div></div>
                </div>
              </div>
              <div style="text-align:center">
                <div class="ring" style="--p:${GENDER.female.pct};--c:${ROSE};width:112px;height:112px">
                  <div class="ring__in" style="width:82px;height:82px"><div><div class="ring__val num" style="font-size:20px;color:${ROSE}">${GENDER.female.pct}%</div><div class="ring__lbl">Female</div></div></div>
                </div>
              </div>
            </div>
            <div class="gd-split mb-12"><span style="width:${GENDER.male.pct}%;background:var(--blue-600)"></span><span style="width:${GENDER.female.pct}%;background:${ROSE}"></span></div>
            <div class="row between">
              <div><div class="row gap-6" style="align-items:center;color:var(--blue-600);font-weight:600;font-size:12.5px"><i class="gd-swatch" style="background:var(--blue-600)"></i>Male workers</div><b class="num" style="font-size:15px">${App.num(GENDER.male.n)}</b></div>
              <div style="text-align:right"><div class="row gap-6" style="align-items:center;justify-content:flex-end;color:${ROSE};font-weight:600;font-size:12.5px"><i class="gd-swatch" style="background:${ROSE}"></i>Female workers</div><b class="num" style="font-size:15px">${App.num(GENDER.female.n)}</b></div>
            </div>
          </div>
        </div>`;

      // ---- age distribution (vertical bar chart) ----
      const maxAge = Math.max(...AGE.map(a => a.pct));
      const ageBars = AGE.map(a => `
        <div class="gd-vbar">
          <div class="gd-vbar__track"><div class="gd-vbar__fill" style="height:${Math.round(a.pct / maxAge * 100)}%" title="${App.num(a.n)} workers"><span class="gd-vbar__val">${a.pct}%</span></div></div>
          <div class="gd-vbar__lbl">${a.band}</div>
          <div class="gd-vbar__cnt">${App.num(a.n)}</div>
        </div>`).join('');
      const ageCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('chart')}<h3 class="grow">Age Distribution</h3></div>
          <div class="card__body">
            <div class="gd-vbars">${ageBars}</div>
            <div class="row between" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2)">
              <span class="muted" style="font-size:12.5px">Average age · <b class="num" style="color:var(--ink)">32.4 years</b></span>
              <span class="muted" style="font-size:12.5px">Total · <b class="num" style="color:var(--ink)">38.4 Cr</b> enrolled</span>
            </div>
          </div>
        </div>`;

      // ---- sector growth (rows are clickable → year-on-year detail) ----
      const maxSec = Math.max(...SECTORS.map(s => s.n));
      const sectorRows = SECTORS.map(s => `
        <div class="gd-sector-row" onclick="GovDemo.openSector('${jsq(s.name)}')" title="View ${App.esc(s.name)} year-on-year detail">
          <div class="row between" style="margin-bottom:7px;align-items:baseline">
            <span style="font-size:13.5px;font-weight:600">${App.esc(s.name)}</span>
            <span class="row gap-12" style="align-items:center">
              <span class="num muted" style="font-size:12.5px">${App.num(s.n)}</span>
              <span class="gd-up" style="min-width:66px;justify-content:flex-end">${upTri} +${s.g}%</span>
            </span>
          </div>
          ${App.ui.bar(Math.round(s.n / maxSec * 100), 'var(--accent)')}
        </div>`).join('');
      const sectorCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('briefcase')}<h3 class="grow">Sector Growth</h3><span class="faint" style="font-size:11.5px">Workers · YoY</span></div>
          <div class="card__body">
            ${sectorRows}
            <div class="banner banner--green" style="margin-top:6px;align-items:center">${App.icon('trend')}<div><b>Gig economy</b> is the fastest-growing sector this year.</div></div>
          </div>
        </div>`;

      // ---- key insights ----
      const insightRows = INSIGHTS.map((it, i) => `
        <div class="row gap-12" style="align-items:flex-start;padding:12px 0">
          <span class="gd-num num" style="background:${it.c}1f;color:${it.c}">${i + 1}</span>
          <div style="font-size:13.5px;line-height:1.55;color:var(--ink-2)">${it.html}</div>
        </div>`).join('');
      const insightsCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('sparkles')}<h3 class="grow">Key Insights</h3></div>
          <div class="card__body" style="padding-top:4px;padding-bottom:8px"><div class="list--divided">${insightRows}</div></div>
        </div>`;

      // ---- state-wise table ----
      const rows = STATES.filter(s => S.state === 'All' || s.name === S.state);
      const tableRows = rows.map(s => {
        const mPct = Math.round(s.male / s.total * 1000) / 10;
        const fPct = Math.round(s.female / s.total * 1000) / 10;
        const rural = 100 - s.urban;
        return `<tr class="clickable" onclick="GovDemo.openState('${jsq(s.name)}')">
          <td><b>${App.esc(s.name)}</b></td>
          <td class="num">${App.num(s.total)}</td>
          <td><span class="num" style="color:var(--blue-600)">${App.num(s.male)}</span><div class="faint num" style="font-size:10.5px;margin-top:2px">${mPct}%</div></td>
          <td><span class="num" style="color:${ROSE}">${App.num(s.female)}</span><div class="faint num" style="font-size:10.5px;margin-top:2px">${fPct}%</div></td>
          <td>
            <div class="gd-ur"><span style="width:${s.urban}%;background:var(--blue-600)"></span><span style="width:${rural}%;background:var(--amber-600)"></span></div>
            <div class="gd-ur-lbl"><span style="color:var(--blue-600)">${s.urban}%</span><span style="color:var(--amber-700)">${rural}%</span></div>
          </td>
          <td class="num">${s.avg}</td>
          <td>${App.esc(s.sector)}</td>
          <td><span class="gd-up">${upTri} +${s.g}%</span></td>
        </tr>`;
      }).join('');
      const filtered = S.state !== 'All';
      const tableCard = `
        <div class="card reveal mb-20">
          <div class="card__head">
            <h3>State-wise Demographics</h3>
            <span class="faint" style="font-size:12px">${filtered ? '1 state' : 'Top 10 states by enrollment'}</span>
            <div class="grow"></div>
            <span class="gd-legend"><i style="background:var(--blue-600)"></i>Urban</span>
            <span class="gd-legend"><i style="background:var(--amber-600)"></i>Rural</span>
            ${filtered ? `<button class="btn btn--ghost btn--sm" onclick="GovDemo.setState('All')">${App.icon('x')} Clear filter</button>` : ''}
          </div>
          <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
            <table class="tbl">
              <thead><tr><th>State</th><th>Total Enrolled</th><th>Male</th><th>Female</th><th>Urban / Rural</th><th>Avg Age</th><th>Top Sector</th><th>Growth</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>`;

      // ---- urban vs rural split ----
      const urbanCard = `
        <div class="card reveal mb-20">
          <div class="card__head">${App.icon('landmark')}<h3 class="grow">Urban vs Rural Split</h3></div>
          <div class="card__body">
            <div class="gd-split" style="height:16px;margin-bottom:16px"><span style="width:${URBAN.pct}%;background:var(--blue-600)"></span><span style="width:${RURAL.pct}%;background:var(--amber-600)"></span></div>
            <div class="grid grid-2" style="gap:14px">
              <div class="gd-urbox" style="border-left:3px solid var(--blue-600)">
                <div class="muted" style="font-size:12px">Urban Workers</div>
                <div class="row between" style="align-items:baseline;margin-top:4px"><b class="num" style="font-size:20px">${App.num(URBAN.n)}</b><span class="num" style="color:var(--blue-600);font-weight:700;font-size:15px">${URBAN.pct}%</span></div>
              </div>
              <div class="gd-urbox" style="border-left:3px solid var(--amber-600)">
                <div class="muted" style="font-size:12px">Rural Workers</div>
                <div class="row between" style="align-items:baseline;margin-top:4px"><b class="num" style="font-size:20px">${App.num(RURAL.n)}</b><span class="num" style="color:var(--amber-700);font-weight:700;font-size:15px">${RURAL.pct}%</span></div>
              </div>
            </div>
            <div class="banner banner--accent" style="margin-top:16px;align-items:center">${App.icon('trend')}<div><b>Rural enrollment</b> is growing faster at <b>+14% YoY</b>.</div></div>
          </div>
        </div>`;

      // ---- explore the registry (clickable cross-nav) ----
      const exploreCards = EXPLORE.map(e => `
        <button class="card card--pad card--hover reveal gd-explore" onclick="App.navigate('${e.go}')">
          <div class="kpi__icon" style="width:40px;height:40px;background:${e.c}1a;color:${e.c};margin-bottom:12px">${App.icon(e.ic)}</div>
          <b style="font-size:14.5px;display:block">${App.esc(e.t)}</b>
          <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(e.s)}</div>
          <div class="row gap-6 mt-12" style="color:${e.c};font-size:12px;font-weight:600">Open ${App.icon('arrow')}</div>
        </button>`).join('');
      const exploreSection = `
        <div class="section-title" style="margin-top:6px">Explore the registry</div>
        <div class="grid grid-3">${exploreCards}</div>`;

      // ---- scoped styles ----
      const style = `<style>
        .gd-selwrap{ position:relative; display:inline-flex; align-items:center; }
        .gd-selwrap .ico{ position:absolute; left:11px; color:var(--muted); pointer-events:none; }
        .gd-sel{ padding-left:34px; min-width:172px; font-weight:600; }
        .gd-split{ display:flex; height:12px; border-radius:var(--r-full); overflow:hidden; background:var(--surface-2); }
        .gd-split > span{ display:block; height:100%; }
        .gd-swatch{ width:10px; height:10px; border-radius:3px; display:inline-block; }
        .gd-vbars{ display:flex; align-items:flex-end; gap:16px; height:180px; padding:22px 6px 0; }
        .gd-vbar{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; min-width:0; }
        .gd-vbar__track{ flex:1; width:100%; display:flex; align-items:flex-end; justify-content:center; }
        .gd-vbar__fill{ position:relative; width:100%; max-width:52px; background:linear-gradient(180deg,var(--accent),var(--accent-strong)); border-radius:7px 7px 0 0; min-height:5px; transition:height .35s cubic-bezier(.2,.7,.2,1); }
        .gd-vbar__val{ position:absolute; top:-19px; left:0; right:0; text-align:center; font-family:var(--font-num); font-variant-numeric:tabular-nums; font-size:12px; font-weight:600; color:var(--ink); }
        .gd-vbar__lbl{ font-size:12px; color:var(--ink-2); margin-top:9px; font-weight:600; }
        .gd-vbar__cnt{ font-size:10px; color:var(--faint); margin-top:2px; font-family:var(--font-num); font-variant-numeric:tabular-nums; }
        .gd-up{ display:inline-flex; align-items:center; gap:3px; color:var(--green-700); font-weight:600; font-size:12.5px; white-space:nowrap; }
        .gd-num{ width:26px; height:26px; border-radius:50%; display:grid; place-items:center; font-size:12.5px; font-weight:700; flex-shrink:0; }
        .gd-sector-row{ margin:0 -10px 4px; padding:9px 10px 11px; border-radius:var(--r-sm); cursor:pointer; transition:background .15s; }
        .gd-sector-row:last-of-type{ margin-bottom:14px; }
        .gd-sector-row:hover{ background:var(--surface-2); }
        .gd-ur{ display:flex; height:7px; width:96px; border-radius:var(--r-full); overflow:hidden; }
        .gd-ur > span{ display:block; height:100%; }
        .gd-ur-lbl{ display:flex; justify-content:space-between; width:96px; font-size:10px; font-family:var(--font-num); font-variant-numeric:tabular-nums; font-weight:600; margin-top:4px; }
        .gd-legend{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); }
        .gd-legend i{ width:11px; height:11px; border-radius:3px; display:inline-block; }
        .gd-urbox{ background:var(--surface-2); border:1px solid var(--line-2); border-radius:var(--r-sm); padding:12px 14px; }
        .gd-explore{ text-align:left; cursor:pointer; }
        .gd-grid-a{ display:grid; grid-template-columns:1fr 1.4fr; gap:20px; align-items:start; }
        .gd-grid-b{ display:grid; grid-template-columns:1.1fr 1fr; gap:20px; align-items:start; }
        @media (max-width:940px){ .gd-grid-a, .gd-grid-b{ grid-template-columns:1fr; } }
        @media (max-width:520px){ .gd-vbars{ gap:8px; } .gd-sel{ min-width:150px; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}
        ${hero}
        ${strip}
        <div class="gd-grid-a mb-20">${genderCard}${ageCard}</div>
        <div class="gd-grid-b mb-20">${sectorCard}${insightsCard}</div>
        ${tableCard}
        ${urbanCard}
        ${exploreSection}
      </div>`;
    }
  });
})();
