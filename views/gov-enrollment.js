/* Government · Worker Enrollment — registrations & verification status across
   the WiN registry: editorial hero + export flow, an at-a-glance stat strip,
   cumulative & current-month verification donuts (conic), a monthly enrollment
   trend (CSS bars, 6M/12M toggle), a State/Scheme breakdown table with drill-in
   modals, and a source-system verification breakdown. Every control does
   something real. All figures are from the GovEnrollment demo spec. */
(function () {
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const lakh = n => (n / 100000).toFixed(1) + 'L';          // 4218000 -> "42.2L"
  const cr   = n => (n / 10000000).toFixed(2) + ' Cr';      // 51234000 -> "5.12 Cr"

  // ---- cumulative + current-month (from spec) ----
  const CUM   = { totalLabel: '38.4 Cr', verLabel: '28.5 Cr', verPct: 74.2, penLabel: '9.9 Cr',  penPct: 25.8 };
  const MONTH = { total: 4218000,       verified: 3216000,   verPct: 76.3,  pending: 1002000,     penPct: 23.7 };

  // ---- 12-month enrollment trend (last 6 = spec: Jun–Nov) ----
  const TREND = [
    { m: 'Dec', n: 2860000 }, { m: 'Jan', n: 2940000 }, { m: 'Feb', n: 2790000 },
    { m: 'Mar', n: 3310000 }, { m: 'Apr', n: 3050000 }, { m: 'May', n: 3120000 },
    { m: 'Jun', n: 3240000 }, { m: 'Jul', n: 3560000 }, { m: 'Aug', n: 3180000 },
    { m: 'Sep', n: 3890000 }, { m: 'Oct', n: 4020000 }, { m: 'Nov', n: 4218000 },
  ];

  // ---- top states this month (spec) + others to reconcile to 42.18L ----
  const STATES = [
    { name: 'Uttar Pradesh', n: 842000, pct: 20, cum: 51234000, rate: 71.4, src: 'EPFO / UAN' },
    { name: 'Maharashtra',   n: 716000, pct: 17, cum: 42856000, rate: 78.2, src: 'EPFO / UAN' },
    { name: 'Bihar',         n: 548000, pct: 13, cum: 34218000, rate: 66.8, src: 'Aadhaar / DigiLocker' },
    { name: 'West Bengal',   n: 464000, pct: 11, cum: 29845000, rate: 69.5, src: 'ESIC' },
    { name: 'Tamil Nadu',    n: 380000, pct: 9,  cum: 23478000, rate: 80.1, src: 'EPFO / UAN' },
  ];
  const OTHERS = { n: MONTH.total - STATES.reduce((a, s) => a + s.n, 0), pct: 30 };

  // ---- scheme breakdown this month (sums to 42.18L) ----
  const SCHEMES = [
    { name: 'e-Shram (Unorganised Workers)', n: 1856000, pct: 44, cum: 168400000, ministry: 'Labour & Employment' },
    { name: 'Ayushman Bharat (PMJAY)',       n: 928000,  pct: 22, cum: 92600000,  ministry: 'Health & Family Welfare' },
    { name: 'PM-SYM (Pension)',              n: 548000,  pct: 13, cum: 41200000,  ministry: 'Labour & Employment' },
    { name: 'PMSBY (Accident Insurance)',    n: 464000,  pct: 11, cum: 38900000,  ministry: 'Finance' },
    { name: 'PMJJBY (Life Insurance)',       n: 253000,  pct: 6,  cum: 22700000,  ministry: 'Finance' },
    { name: 'ABRY (Employment)',             n: 169000,  pct: 4,  cum: 14100000,  ministry: 'Labour & Employment' },
  ];

  // ---- verification source systems (share of 28.5 Cr verified) ----
  const SOURCES = [
    { key: 'epfo',  label: 'EPFO / UAN',           icon: 'shieldcheck', pct: 38, note: 'Provident-fund & employment ledger' },
    { key: 'itd',   label: 'Income Tax Dept',      icon: 'landmark',    pct: 22, note: 'Form-16 / ITR income match' },
    { key: 'esic',  label: 'ESIC',                 icon: 'shield',      pct: 16, note: 'Insured-persons register' },
    { key: 'aadh',  label: 'Aadhaar / DigiLocker', icon: 'idcard',      pct: 14, note: 'Identity & document issuance' },
    { key: 'state', label: 'State Labour DB',      icon: 'database',    pct: 7,  note: 'BOCW / welfare-board rolls' },
    { key: 'gstn',  label: 'GSTN',                 icon: 'file',        pct: 3,  note: 'Self-employed / proprietor trace' },
  ];

  // ---- local state ----
  const S = { trend: '6m', table: 'state' };

  window.GovEnroll = {
    setTrend(r) { S.trend = r; App.reload(); },
    setTable(v) { S.table = v; App.reload(); },
    ask(q) { App.assistant.toggle(true); if (q) App.assistant.ask(q); },

    /* ---- export flow ---- */
    exportOpen() {
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:18px">Compile an enrollment & verification report from the live WiN registry. This is a demo export.</p>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Format</label>
            <select class="select" id="geFmt"><option>PDF summary</option><option>Excel (.xlsx)</option><option>CSV data extract</option></select></div>
          <div class="field"><label class="label">Reporting period</label>
            <select class="select"><option>November 2025 (MTD)</option><option>Last 6 months</option><option>FY 2025–26 (YTD)</option></select></div>
        </div>
        <div class="field" style="margin-bottom:0"><label class="label">Include sections</label>
          <div class="row gap-8 wrap" style="margin-top:4px">
            ${['Verification split', 'Monthly trend', 'State breakdown', 'Scheme breakdown', 'Source systems'].map(x => `<span class="chip">${App.icon('check')} ${App.esc(x)}</span>`).join('')}
          </div></div>
      `, {
        title: 'Export Enrollment Data', icon: 'download',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="GovEnroll.exportRun()">${App.icon('download')} Generate &amp; download</button>`
      });
    },
    exportRun() {
      const fmt = (document.getElementById('geFmt') || {}).value || 'PDF summary';
      App.modal.close();
      App.toast('Enrollment ' + fmt.split(' ')[0] + ' report generated', 'download');
    },

    /* ---- pending-batch verification (real stepped flow) ---- */
    verifyOpen() {
      App.modal.open(`
        <div class="banner banner--amber" style="margin-bottom:16px;align-items:center">${App.icon('clock')}
          <div><b>${App.num(MONTH.pending)}</b> records enrolled this month are awaiting source verification (${MONTH.penPct}%).</div></div>
        <p class="muted" style="font-size:13px;margin-bottom:4px">Queue these records for a live re-check against EPFO/UAN, the Income-Tax database, ESIC and DigiLocker. Runs asynchronously; workers are notified on consent.</p>
      `, {
        title: 'Verify pending batch', icon: 'shieldcheck',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--accent" id="geVerifyBtn" onclick="GovEnroll.verifyRun()">${App.icon('bolt')} Queue verification</button>`
      });
    },
    verifyRun() {
      const body = document.querySelector('.modal__body');
      const foot = document.querySelector('.modal__foot');
      if (foot) foot.innerHTML = '';
      if (body) body.innerHTML = `<div style="text-align:center;padding:26px 0">
        <div style="width:42px;height:42px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;margin:0 auto 18px;animation:geSpin .9s linear infinite"></div>
        <b style="font-size:15px">Queuing ${App.num(MONTH.pending)} records…</b>
        <div class="muted" style="font-size:12.5px;margin-top:6px">Dispatching to source connectors</div>
        <style>@keyframes geSpin{to{transform:rotate(360deg)}}</style></div>`;
      setTimeout(() => { App.modal.close(); App.toast(App.num(MONTH.pending) + ' records queued for verification', 'shieldcheck'); }, 1500);
    },

    /* ---- drill-in modals ---- */
    openState(name) {
      const s = STATES.find(x => x.name === name); if (!s) return;
      const hasDemo = !!(window.GovDemo && typeof window.GovDemo.setState === 'function');
      App.modal.open(`
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">New this month</div><div class="statstrip__val num">${App.num(s.n)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Cumulative</div><div class="statstrip__val num">${cr(s.cum)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Verified</div><div class="statstrip__val num">${s.rate}%</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">Share of this month's enrollment</div>
        ${App.ui.bar(s.pct * 5, 'var(--accent)')}
        <div class="row between" style="font-size:12.5px;margin-top:6px"><span class="muted">${s.pct}% of ${App.num(MONTH.total)}</span><span class="mono" style="color:var(--accent-strong)">${App.num(s.n)}</span></div>
        <div class="section-title" style="font-size:13.5px;margin-top:18px">Verification status</div>
        ${App.ui.bar(s.rate, 'var(--accent)')}
        <div class="row between" style="font-size:12.5px;margin-top:6px"><span style="color:var(--green-700);font-weight:600">Verified ${s.rate}%</span><span style="color:var(--amber-700);font-weight:600">Pending ${(100 - s.rate).toFixed(1)}%</span></div>
        <div class="row between" style="padding-top:14px;margin-top:16px;border-top:1px solid var(--line-2)">
          <span class="muted" style="font-size:12.5px">Primary source · <b style="color:var(--ink)">${App.esc(s.src)}</b></span>
          ${App.ui.pill('This month · Nov 2025', 'accent')}
        </div>
      `, {
        title: s.name + ' — Enrollment', icon: 'mappin',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>` +
              (hasDemo ? `<button class="btn btn--primary" onclick="App.modal.close();App.navigate('gov-demographics');GovDemo.setState('${jsq(s.name)}')">${App.icon('pie')} View in Demographics</button>` : '')
      });
    },
    openScheme(name) {
      const s = SCHEMES.find(x => x.name === name); if (!s) return;
      App.modal.open(`
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">New this month</div><div class="statstrip__val num">${App.num(s.n)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Total beneficiaries</div><div class="statstrip__val num">${cr(s.cum)}</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">Share of this month's enrollment</div>
        ${App.ui.bar(s.pct * 2, 'var(--accent)')}
        <div class="row between" style="font-size:12.5px;margin-top:6px"><span class="muted">${s.pct}% of new enrollments</span><span class="mono" style="color:var(--accent-strong)">${App.num(s.n)}</span></div>
        <div class="banner banner--accent" style="margin-top:18px;align-items:center">${App.icon('landmark')}<div>Administered by the <b>Ministry of ${App.esc(s.ministry)}</b>. Eligibility is computed from the verified golden record.</div></div>
      `, {
        title: App.esc(s.name), icon: 'award',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               <button class="btn btn--accent" onclick="App.modal.close();App.toast('Eligibility push queued to matching workers')">${App.icon('send')} Push to eligible workers</button>`
      });
    },
    openSource(key) {
      const s = SOURCES.find(x => x.key === key); if (!s) return;
      const cnt = (s.pct / 100 * 28.5);
      App.modal.open(`
        <div class="row gap-12" style="align-items:center;margin-bottom:16px">
          <div class="kpi__icon" style="width:44px;height:44px;background:var(--accent-weak);color:var(--accent-strong)">${App.icon(s.icon)}</div>
          <div><b style="font-size:15.5px">${App.esc(s.label)}</b><div class="muted" style="font-size:12.5px">${App.esc(s.note)}</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">Share of verified records</div>
        ${App.ui.bar(s.pct, 'var(--accent)')}
        <div class="row between" style="font-size:12.5px;margin-top:6px"><span class="muted">${s.pct}% of 28.5 Cr verified</span><span class="mono" style="color:var(--accent-strong)">${cnt.toFixed(1)} Cr</span></div>
        <div class="row gap-8 wrap" style="margin-top:16px">
          <span class="src-chip">${App.icon('bolt')} Live API</span>
          <span class="src-chip">${App.icon('lock')} Consent-gated</span>
          <span class="src-chip">${App.icon('clock')} &lt;30s median</span>
        </div>
      `, { title: s.label + ' — Source', icon: s.icon,
           foot: `<button class="btn btn--primary" onclick="App.modal.close()">Done</button>` });
    },
  };

  App.registerView('gov-enrollment', {
    title: 'Worker Enrollment',
    subtitle: 'Registrations & verification status',
    render() {
      /* ---------- hero ---------- */
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('users')} Registry · Enrollment</div>
                <h1 class="h-grad" style="margin-top:12px">Worker enrollment across India.</h1>
                <p class="lead">Track worker registrations and verification status across every state and source system — updated live from the WiN golden record.</p>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="GovEnroll.ask('Where are the biggest enrollment and verification gaps this month?')">${App.icon('sparkles')} Ask WiN</button>
                <button class="btn btn--primary" onclick="GovEnroll.exportOpen()">${App.icon('download')} Export Data</button>
              </div>
            </div>
          </div>
        </div>`;

      /* ---------- stat strip ---------- */
      const strip = `
        <div class="statstrip reveal mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Total enrolled</div><div class="statstrip__val num">38.4 Cr</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">New this month</div><div class="statstrip__val num">${lakh(MONTH.total)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Verification rate</div><div class="statstrip__val num">${CUM.verPct}%</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">States &amp; UTs</div><div class="statstrip__val num">34</div></div>
        </div>`;

      /* ---------- donut helper ---------- */
      const donut = (p) => `
        <div class="ge-donut" style="--p:${p}">
          <div class="ge-donut__hole"></div>
        </div>`;

      const cumCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('pie')}<h3 class="grow">Cumulative Enrollment</h3><span class="faint" style="font-size:11.5px">All-time</span></div>
          <div class="card__body">
            <div class="ge-donutwrap">
              <div class="ge-donut" style="--p:${CUM.verPct}">
                <div class="ge-donut__hole"><div class="ge-donut__val num">${CUM.totalLabel}</div><div class="ge-donut__cap">Total</div></div>
              </div>
              <div class="grow">
                <div class="ge-leg"><span class="ge-sw" style="background:var(--accent)"></span><span class="grow">Verified</span><b class="num">${CUM.verLabel}</b><span class="ge-leg__pct">${CUM.verPct}%</span></div>
                <div class="ge-leg"><span class="ge-sw" style="background:var(--amber-600)"></span><span class="grow">Pending</span><b class="num">${CUM.penLabel}</b><span class="ge-leg__pct" style="color:var(--amber-700)">${CUM.penPct}%</span></div>
              </div>
            </div>
          </div>
        </div>`;

      const monthCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('calendar')}<h3 class="grow">Current Month</h3><span class="faint" style="font-size:11.5px">Nov 2025</span></div>
          <div class="card__body">
            <div class="ge-donutwrap">
              <div class="ge-donut" style="--p:${MONTH.verPct}">
                <div class="ge-donut__hole"><div class="ge-donut__val num" style="font-size:17px">${App.num(MONTH.total)}</div><div class="ge-donut__cap">Total</div></div>
              </div>
              <div class="grow">
                <div class="ge-leg"><span class="ge-sw" style="background:var(--accent)"></span><span class="grow">Verified</span><b class="num">${App.num(MONTH.verified)}</b><span class="ge-leg__pct">${MONTH.verPct}%</span></div>
                <div class="ge-leg"><span class="ge-sw" style="background:var(--amber-600)"></span><span class="grow">Pending</span><b class="num">${App.num(MONTH.pending)}</b><span class="ge-leg__pct" style="color:var(--amber-700)">${MONTH.penPct}%</span></div>
                <button class="btn btn--soft btn--sm btn--block" style="margin-top:12px" onclick="GovEnroll.verifyOpen()">${App.icon('shieldcheck')} Verify pending batch</button>
              </div>
            </div>
          </div>
        </div>`;

      /* ---------- monthly trend ---------- */
      const rows = S.trend === '12m' ? TREND : TREND.slice(-6);
      const maxN = Math.max(...rows.map(r => r.n));
      const bars = rows.map(r => {
        const h = Math.round(r.n / maxN * 100);
        const isMax = r.n === maxN;
        return `<div class="ge-vbar" title="${App.esc(r.m)} · ${App.num(r.n)} enrolled">
          <div class="ge-vbar__track"><div class="ge-vbar__fill${isMax ? ' is-max' : ''}" style="height:${h}%"><span class="ge-vbar__val num">${lakh(r.n)}</span></div></div>
          <div class="ge-vbar__lbl">${App.esc(r.m)}</div>
        </div>`;
      }).join('');
      const trendCard = `
        <div class="card reveal mb-20">
          <div class="card__head">
            ${App.icon('trend')}<h3>Monthly Enrollment Trend</h3>
            <div class="grow"></div>
            <div class="seg" role="tablist" aria-label="Trend range">
              <button class="${S.trend === '6m' ? 'is-active' : ''}" onclick="GovEnroll.setTrend('6m')">6 months</button>
              <button class="${S.trend === '12m' ? 'is-active' : ''}" onclick="GovEnroll.setTrend('12m')">12 months</button>
            </div>
          </div>
          <div class="card__body">
            <div class="ge-vbars ${S.trend === '12m' ? 'ge-vbars--dense' : ''}">${bars}</div>
            <div class="row between" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-2)">
              <span class="muted" style="font-size:12.5px">Peak · <b style="color:var(--ink)">Nov ${lakh(MONTH.total)}</b></span>
              <span class="muted" style="font-size:12.5px">MoM growth · <b style="color:var(--green-700)">+4.9%</b></span>
            </div>
          </div>
        </div>`;

      /* ---------- breakdown table (state / scheme) ---------- */
      let tableHead, tableRows, tableCap;
      if (S.table === 'state') {
        tableCap = 'Top 5 states · this month';
        tableHead = `<tr><th>State</th><th>New enrolled</th><th style="min-width:140px">Share</th><th>Cumulative</th><th>Verified</th></tr>`;
        tableRows = STATES.map(s => `
          <tr class="clickable" onclick="GovEnroll.openState('${jsq(s.name)}')">
            <td><b>${App.esc(s.name)}</b></td>
            <td class="mono">${App.num(s.n)}</td>
            <td>
              <div class="ge-trow">${App.ui.bar(s.pct * 5, 'var(--accent)')}<span class="ge-trow__pct num">${s.pct}%</span></div>
            </td>
            <td class="mono">${cr(s.cum)}</td>
            <td><span class="mono" style="color:var(--green-700)">${s.rate}%</span></td>
          </tr>`).join('') + `
          <tr class="ge-otherrow">
            <td><span class="muted">Other states &amp; UTs</span></td>
            <td class="mono muted">${App.num(OTHERS.n)}</td>
            <td><div class="ge-trow">${App.ui.bar(OTHERS.pct * 5, 'var(--faint)')}<span class="ge-trow__pct num muted">${OTHERS.pct}%</span></div></td>
            <td class="mono muted">—</td>
            <td class="muted">—</td>
          </tr>`;
      } else {
        tableCap = '6 schemes · this month';
        tableHead = `<tr><th>Scheme</th><th>New enrolled</th><th style="min-width:140px">Share</th><th>Beneficiaries</th><th>Ministry</th></tr>`;
        tableRows = SCHEMES.map(s => `
          <tr class="clickable" onclick="GovEnroll.openScheme('${jsq(s.name)}')">
            <td><b>${App.esc(s.name)}</b></td>
            <td class="mono">${App.num(s.n)}</td>
            <td><div class="ge-trow">${App.ui.bar(s.pct * 2, 'var(--accent)')}<span class="ge-trow__pct num">${s.pct}%</span></div></td>
            <td class="mono">${cr(s.cum)}</td>
            <td class="muted" style="font-size:12.5px">${App.esc(s.ministry)}</td>
          </tr>`).join('');
      }
      const tableCard = `
        <div class="card reveal">
          <div class="card__head">
            ${App.icon(S.table === 'state' ? 'mappin' : 'award')}<h3>Enrollment Breakdown</h3>
            <span class="faint" style="font-size:12px">${tableCap}</span>
            <div class="grow"></div>
            <div class="seg" aria-label="Breakdown mode">
              <button class="${S.table === 'state' ? 'is-active' : ''}" onclick="GovEnroll.setTable('state')">By State</button>
              <button class="${S.table === 'scheme' ? 'is-active' : ''}" onclick="GovEnroll.setTable('scheme')">By Scheme</button>
            </div>
          </div>
          <div class="tablewrap tablewrap--scroll" style="border:none;border-radius:0;box-shadow:none">
            <table class="tbl"><thead>${tableHead}</thead><tbody>${tableRows}</tbody></table>
          </div>
        </div>`;

      /* ---------- source breakdown ---------- */
      const srcRows = SOURCES.map(s => `
        <button class="ge-src" onclick="GovEnroll.openSource('${s.key}')">
          <div class="kpi__icon" style="width:32px;height:32px;background:var(--accent-weak);color:var(--accent-strong);flex-shrink:0">${App.icon(s.icon)}</div>
          <div class="grow" style="min-width:0">
            <div class="row between" style="margin-bottom:6px"><span style="font-size:13px;font-weight:600">${App.esc(s.label)}</span><span class="mono" style="font-size:12px;color:var(--muted)">${s.pct}%</span></div>
            ${App.ui.bar(s.pct, 'var(--accent)')}
          </div>
        </button>`).join('');
      const sourceCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('layers')}<h3 class="grow">Verified by Source</h3></div>
          <div class="card__body">
            <p class="muted" style="font-size:12.5px;margin:-2px 0 14px">Share of the 28.5 Cr verified records by originating system.</p>
            <div class="ge-srclist">${srcRows}</div>
            <div class="banner banner--accent" style="margin-top:14px;align-items:center">${App.icon('shieldcheck')}<div><b>EPFO/UAN</b> anchors 38% of all verifications — the single largest source.</div></div>
          </div>
        </div>`;

      /* ---------- scoped styles ---------- */
      const style = `<style>
        .ge-donutwrap{ display:flex; align-items:center; gap:24px; }
        .ge-donut{ position:relative; width:132px; height:132px; border-radius:50%; flex-shrink:0;
          background:conic-gradient(var(--accent) 0 calc(var(--p)*1%), var(--amber-500,var(--amber-600)) calc(var(--p)*1%) 100%); }
        .ge-donut__hole{ position:absolute; inset:19px; border-radius:50%; background:var(--surface); box-shadow:inset 0 0 0 1px var(--line-2);
          display:grid; place-items:center; text-align:center; }
        .ge-donut__val{ font-size:21px; font-weight:700; letter-spacing:-.02em; color:var(--ink); line-height:1.1; }
        .ge-donut__cap{ font-family:var(--font-mono); font-size:9.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-top:2px; }
        .ge-leg{ display:flex; align-items:center; gap:9px; padding:9px 0; font-size:13px; border-bottom:1px solid var(--line-2); }
        .ge-leg:last-of-type{ border-bottom:none; }
        .ge-leg .ge-sw{ width:11px; height:11px; border-radius:3px; flex-shrink:0; }
        .ge-leg b{ font-size:13.5px; }
        .ge-leg__pct{ font-family:var(--font-num); font-size:12px; font-weight:600; color:var(--green-700); min-width:42px; text-align:right; }

        .ge-vbars{ display:flex; align-items:flex-end; gap:18px; height:196px; padding:26px 4px 0; }
        .ge-vbars--dense{ gap:9px; }
        .ge-vbar{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; min-width:0; }
        .ge-vbar__track{ flex:1; width:100%; display:flex; align-items:flex-end; justify-content:center; }
        .ge-vbar__fill{ position:relative; width:100%; max-width:46px; min-height:6px; border-radius:8px 8px 0 0;
          background:linear-gradient(180deg, var(--accent), var(--accent-strong)); transition:height .4s cubic-bezier(.2,.7,.2,1), filter .14s, transform .14s; }
        .ge-vbar__fill.is-max{ background:linear-gradient(180deg,#2fbfb2,#0e8c82); box-shadow:0 0 0 2px var(--accent-ring); }
        .ge-vbar:hover .ge-vbar__fill{ filter:brightness(1.12) saturate(1.1); transform:translateY(-2px); }
        .ge-vbar__val{ position:absolute; top:-20px; left:0; right:0; text-align:center; font-size:11.5px; font-weight:600; color:var(--ink); white-space:nowrap; }
        .ge-vbar__lbl{ font-size:12px; color:var(--ink-2); margin-top:9px; font-weight:600; }
        .ge-vbars--dense .ge-vbar__val{ font-size:10px; top:-17px; }
        .ge-vbars--dense .ge-vbar__lbl{ font-size:11px; }

        .ge-trow{ display:flex; align-items:center; gap:10px; }
        .ge-trow .bar{ flex:1; min-width:60px; }
        .ge-trow__pct{ font-size:12px; font-weight:600; min-width:30px; text-align:right; }
        .ge-otherrow td{ background:var(--surface-2); }

        .ge-srclist{ display:flex; flex-direction:column; gap:12px; }
        .ge-src{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:9px 11px; border-radius:var(--r-sm);
          border:1px solid var(--line-2); background:var(--surface); transition:.14s; cursor:pointer; }
        .ge-src:hover{ border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-ring); }

        .ge-grid-donuts{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .ge-grid-main{ display:grid; grid-template-columns:1.55fr 1fr; gap:20px; align-items:start; }
        @media (max-width:940px){ .ge-grid-donuts, .ge-grid-main{ grid-template-columns:1fr; } }
        @media (max-width:520px){ .ge-vbars{ gap:8px; } .ge-donutwrap{ gap:16px; } .ge-donut{ width:112px; height:112px; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}
        ${hero}
        ${strip}
        <div class="ge-grid-donuts">${cumCard}${monthCard}</div>
        ${trendCard}
        <div class="ge-grid-main">${tableCard}${sourceCard}</div>
      </div>`;
    }
  });
})();
