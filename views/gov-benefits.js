/* Government · Benefits & Schemes — a view-only rollup of labour-department
   scheme allotment vs. coverage by workforce segment. This dashboard never
   runs its own eligibility logic; Mahasarthi is the execution engine for
   eligibility checks and enrollment. */
(function () {
  const BENEFIT_SCHEMES = [
    { name: 'BOCW Cess Welfare Fund', segment: 'Construction Workers', allotted: 4820, covered: 3140, c: '#0d9488' },
    { name: 'Ayushman Bharat — PMJAY', segment: 'All Registered Workers', allotted: 12400, covered: 7890, c: '#d64545' },
    { name: 'e-Shram Accident Insurance', segment: 'Unorganised Sector', allotted: 2600, covered: 2210, c: '#2f5fd0' },
    { name: 'Skill Upgradation Subsidy', segment: 'All Registered Workers', allotted: 1850, covered: 940, c: '#6b4fc7' },
    { name: 'Maternity Benefit (ESIC)', segment: 'Formal Sector Women Workers', allotted: 980, covered: 812, c: '#c07d10' },
  ];

  App.registerView('gov-benefits', {
    title: 'Benefits & Schemes',
    subtitle: 'Labour-department benefit overview by workforce segment',
    render() {
      const totalAllotted = BENEFIT_SCHEMES.reduce((s, b) => s + b.allotted, 0);
      const totalCovered = BENEFIT_SCHEMES.reduce((s, b) => s + b.covered, 0);

      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('shieldcheck')} Benefits &amp; Schemes</div>
            <h1 class="h-grad" style="margin-top:12px">Money allotted vs. money covered, by scheme.</h1>
            <p class="lead">Labour-department benefit overview by workforce segment. This dashboard is a view layer — eligibility checks and enrollment execution happen on Mahasarthi.</p>
          </div>
        </div>`;

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
        <div class="gd-sector">
          <div class="row between wrap gap-8" style="margin-bottom:6px">
            <span class="row gap-8" style="font-size:13px"><span class="gd-dot" style="background:${b.c}"></span><b>${App.esc(b.name)}</b></span>
            <span class="muted" style="font-size:12px">${App.esc(b.segment)}</span>
          </div>
          <div class="gd-barcell">
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

      return `<div class="page fade-in">
        <style>
          .gd-sector{ margin-bottom:14px; }
          .gd-sector:last-child{ margin-bottom:0; }
          .gd-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block; }
          .gd-barcell{ display:flex; align-items:center; gap:9px; }
          .gd-barcell .bar{ flex:1; }
        </style>
        ${hero}
        ${summary}
        ${banner}
        ${schemeCard}
      </div>`;
    },
  });
})();
