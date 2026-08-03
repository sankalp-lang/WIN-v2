/* Government · Benefits & Schemes — a view-only rollup of labour-department
   scheme allotment vs. coverage by workforce segment (Mahasarthi is the
   execution engine for eligibility checks and enrollment), plus the
   Government Information Push System for broadcasting new schemes and
   policy alerts to workers/employers. */
(function () {
  const svg = (p, s) => `<svg class="ico" width="${s || 16}" height="${s || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO_RADIO = svg('<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.5M16.2 16.2a6 6 0 0 0 0-8.5"/><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2"/>');

  const BENEFIT_SCHEMES = [
    { name: 'BOCW Cess Welfare Fund', segment: 'Construction Workers', allotted: 4820, covered: 3140, c: '#0d9488' },
    { name: 'Ayushman Bharat — PMJAY', segment: 'All Registered Workers', allotted: 12400, covered: 7890, c: '#d64545' },
    { name: 'e-Shram Accident Insurance', segment: 'Unorganised Sector', allotted: 2600, covered: 2210, c: '#2f5fd0' },
    { name: 'Skill Upgradation Subsidy', segment: 'All Registered Workers', allotted: 1850, covered: 940, c: '#6b4fc7' },
    { name: 'Maternity Benefit (ESIC)', segment: 'Formal Sector Women Workers', allotted: 980, covered: 812, c: '#c07d10' },
  ];

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

  const S = { tab: 'overview', audience: 'all', pushTitle: '', pushBody: '', sent: false, recent: RECENT.slice() };
  const alive = () => App.state.route === 'gov-benefits';

  window.GovBenefits = {
    setTab(t) { S.tab = t; App.state.params = Object.assign({}, App.state.params, { tab: t }); App.reload(); },
    setAudience(a) { S.audience = a; App.reload(); },
    setField(k, v) { S[k] = v; },
    useTemplate(i) {
      const t = TEMPLATES[i]; if (!t) return;
      S.pushTitle = t.title; S.pushBody = t.body; S.sent = false;
      App.reload();
      App.toast('Template loaded · ' + t.name);
    },
    submitPush() {
      const te = document.getElementById('gbPushTitle');
      const be = document.getElementById('gbPushBody');
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

  function overviewTab() {
    const totalAllotted = BENEFIT_SCHEMES.reduce((s, b) => s + b.allotted, 0);
    const totalCovered = BENEFIT_SCHEMES.reduce((s, b) => s + b.covered, 0);

    const summary = `
      <div class="grid grid-3 mb-20 reveal">
        ${App.ui.kpi('file', '#2f5fd0', 'Total Allotted (₹ Cr)', App.num(totalAllotted), 'Across all schemes, FY 2024-25')}
        ${App.ui.kpi('checkcircle', '#0e9f6e', 'Total Covered (₹ Cr)', App.num(totalCovered), `${Math.round(totalCovered / totalAllotted * 100)}% of allotted disbursed`)}
        ${App.ui.kpi('users', '#c07d10', 'Schemes Tracked', BENEFIT_SCHEMES.length, 'Labour dept. schemes')}
      </div>`;

    const banner = `<div class="banner banner--info reveal mb-20">${App.icon('idcard')}<div>This is a view-only rollup of scheme allotment vs. coverage by workforce segment. Eligibility checks and enrollment execution happen on <b>Mahasarthi</b> — this dashboard does not run its own eligibility logic.</div></div>`;

    const rows = BENEFIT_SCHEMES.map(b => {
      const pct = Math.round(b.covered / b.allotted * 100);
      return `
      <div class="gb-sector">
        <div class="row between wrap gap-8" style="margin-bottom:6px">
          <span class="row gap-8" style="font-size:13px"><span class="gb-dot" style="background:${b.c}"></span><b>${App.esc(b.name)}</b></span>
          <span class="muted" style="font-size:12px">${App.esc(b.segment)}</span>
        </div>
        <div class="gb-barcell">
          ${App.ui.bar(pct, b.c)}
          <span class="num" style="min-width:38px;font-weight:600;color:${b.c}">${pct}%</span>
        </div>
        <div class="faint" style="font-size:11.5px;margin-top:4px">₹<span class="num">${App.num(b.covered)}</span> Cr covered of ₹<span class="num">${App.num(b.allotted)}</span> Cr allotted</div>
      </div>`;
    }).join('');

    const schemeCard = `
      <div class="card reveal">
        <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">Money Allotted vs. Money Covered — by Scheme</h3></div>
        <div class="card__body">${rows}</div>
      </div>`;

    return `${summary}${banner}${schemeCard}`;
  }

  function pushTab() {
    const banner = `
      <div class="banner banner--accent reveal mb-20" style="align-items:flex-start">
        ${ICO_RADIO}
        <div><b>Government Information Push System</b><div style="margin-top:3px;opacity:.9">Broadcast new schemes, policy alerts, and benefit notifications directly to employers and/or workers on the WiN platform.</div></div>
      </div>`;

    const audience = AUDIENCES.map(a => `
      <button class="gb-aud ${S.audience === a.key ? 'is-active' : ''}" onclick="GovBenefits.setAudience('${a.key}')">
        <span class="gb-radio"></span>
        <span class="grow" style="text-align:left"><b style="font-size:13.5px;display:block">${App.esc(a.title)}</b><span class="muted" style="font-size:12px">${App.esc(a.sub)}</span></span>
      </button>`).join('');

    const submitBtn = S.sent
      ? `<button class="btn btn--block" style="background:var(--green-600);color:#fff;border-color:transparent">${App.icon('checkcircle')} Sent Successfully!</button>`
      : `<button class="btn btn--primary btn--block" onclick="GovBenefits.submitPush()">${App.icon('send')} Push Notification</button>`;

    const compose = `
      <div class="card">
        <div class="card__head">${App.icon('bell')}<h3 class="grow">Compose Push Notification</h3></div>
        <div class="card__body">
          <div class="field">
            <label class="label">Target Audience <span style="color:var(--red-600)">*</span></label>
            <div class="gb-aud-row">${audience}</div>
          </div>
          <div class="field">
            <label class="label">Title <span style="color:var(--red-600)">*</span></label>
            <input class="input" id="gbPushTitle" placeholder="e.g. New PM-SHRI Upskilling Scheme Launched" value="${App.esc(S.pushTitle)}" oninput="GovBenefits.setField('pushTitle', this.value)">
          </div>
          <div class="field">
            <label class="label">Message Body <span style="color:var(--red-600)">*</span></label>
            <textarea class="textarea" id="gbPushBody" rows="4" placeholder="Describe the scheme, eligibility criteria, benefits, and next steps..." oninput="GovBenefits.setField('pushBody', this.value)">${App.esc(S.pushBody)}</textarea>
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
            <button class="gb-tmpl" onclick="GovBenefits.useTemplate(${i})">
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
      <div class="gb-push-grid reveal">
        ${compose}
        <div class="col gap-20">${templates}${recent}</div>
      </div>`;
  }

  App.registerView('gov-benefits', {
    title: 'Benefits & Schemes',
    subtitle: 'Labour-department benefit overview by workforce segment',
    render(ctx) {
      const paramTab = ctx && ctx.params && ctx.params.tab;
      if (paramTab && paramTab !== S._lastParam && (paramTab === 'overview' || paramTab === 'push')) { S.tab = paramTab; S._lastParam = paramTab; }

      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('shieldcheck')} Benefits &amp; Schemes</div>
            <h1 class="h-grad" style="margin-top:12px">Money allotted vs. money covered, by scheme.</h1>
            <p class="lead">Labour-department benefit overview by workforce segment. This dashboard is a view layer — eligibility checks and enrollment execution happen on Mahasarthi.</p>
          </div>
        </div>`;

      const tabs = `
        <div class="tabs">
          <div class="tab ${S.tab === 'overview' ? 'is-active' : ''}" onclick="GovBenefits.setTab('overview')">${App.icon('shieldcheck')} Overview</div>
          <div class="tab ${S.tab === 'push' ? 'is-active' : ''}" onclick="GovBenefits.setTab('push')">${App.icon('bell')} Push Schemes &amp; Alerts</div>
        </div>`;

      return `<div class="page fade-in">
        <style>
          .gb-sector{ margin-bottom:14px; }
          .gb-sector:last-child{ margin-bottom:0; }
          .gb-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block; }
          .gb-barcell{ display:flex; align-items:center; gap:9px; }
          .gb-barcell .bar{ flex:1; }
          .gb-push-grid{ display:grid; grid-template-columns:1.4fr 1fr; gap:20px; align-items:start; }
          .gb-aud-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
          .gb-aud{ display:flex; gap:10px; align-items:center; padding:12px 13px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.13s; }
          .gb-aud:hover{ border-color:var(--accent); }
          .gb-aud.is-active{ border-color:var(--accent); background:var(--accent-weak); box-shadow:0 0 0 2px var(--accent-ring); }
          .gb-radio{ width:17px; height:17px; border-radius:50%; border:2px solid var(--line); flex-shrink:0; position:relative; transition:.13s; }
          .gb-aud.is-active .gb-radio{ border-color:var(--accent); }
          .gb-aud.is-active .gb-radio::after{ content:""; position:absolute; inset:2.5px; border-radius:50%; background:var(--accent); }
          .gb-tmpl{ display:flex; gap:11px; align-items:center; padding:11px 12px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.13s; }
          .gb-tmpl:hover{ border-color:var(--accent); background:var(--surface-2); }
          .gb-tmpl > .ico{ color:var(--muted); flex-shrink:0; }
          @media (max-width:900px){ .gb-push-grid{ grid-template-columns:1fr; } }
          @media (max-width:640px){ .gb-aud-row{ grid-template-columns:1fr; } }
        </style>
        ${hero}
        ${tabs}
        ${S.tab === 'overview' ? overviewTab() : pushTab()}
      </div>`;
    },
  });
})();
