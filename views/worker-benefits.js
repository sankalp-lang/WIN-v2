/* Worker · Benefits & Schemes — state labour-department schemes and subsidies
   for this worker's segment. Two tabs: schemes matched/eligible (view-only;
   eligibility checking and enrollment execution happen on Mahasarthi, with
   the worker's consent to share their verified WiN profile) and schemes
   already enrolled in (moved here from My Work History), each with a
   details view. */
(function () {
  const ELIGIBLE = [
    { id: 'bocw', ic: 'shieldcheck', c: '#0e9f6e', title: 'BOCW Cess Welfare Benefits', desc: 'Building & Other Construction Workers welfare fund — accident, maternity and pension support.' },
    { id: 'ayushman', ic: 'filecheck', c: '#d64545', title: 'Ayushman Bharat — PMJAY', desc: 'Cashless health cover up to ₹5 lakh/year for you and your family at empanelled hospitals.' },
    { id: 'skill-subsidy', ic: 'graduation', c: '#2f5fd0', title: 'Skill Upgradation Subsidy', desc: 'Reimbursement for approved certification courses under the state skilling mission.' },
    { id: 'eshram-insurance', ic: 'idcard', c: '#0d9488', title: 'e-Shram Accident Insurance', desc: 'Personal accident cover for registered unorganised-sector workers, up to ₹2 lakh.' },
  ];

  const ENROLLED = [
    { id: 'epf', name: "Employees' Provident Fund Scheme (EPFO)", sub: 'UAN 1001-2345-6789', st: 'Active', c: '#2f5fd0', ic: 'landmark',
      since: 'Jun 2018', desc: 'Retirement savings with matching employer + employee contributions, managed by the Employees\' Provident Fund Organisation.',
      cover: 'Current balance: ₹1,84,220 (demo)' },
    { id: 'esi', name: "Employees' State Insurance Scheme (ESIC)", sub: 'IP No: 1234567890', st: 'Active', c: '#0e9f6e', ic: 'shieldcheck',
      since: 'Jun 2018', desc: 'Medical, sickness and maternity benefits for you and your dependants through ESIC hospitals and dispensaries.',
      cover: 'Cashless treatment at ESIC hospitals & dispensaries' },
    { id: 'pmsym', name: 'Pradhan Mantri Shram Yogi Maandhan (PM-SYM)', sub: 'Enrolment: PSM-84921', st: 'Enrolled', c: '#0d9488', ic: 'award',
      since: 'Mar 2023', desc: 'Voluntary pension scheme for unorganised-sector workers, with matching government contribution.',
      cover: '₹3,000/month pension after age 60' },
    { id: 'pmsby', name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)', sub: 'Policy: PMSBY-2291087', st: 'Active', c: '#c07d10', ic: 'idcard',
      since: 'Jan 2022', desc: 'Low-cost personal accident insurance, linked to your e-Shram registration.',
      cover: '₹2,00,000 accident cover' },
  ];

  const WB = { tab: 'eligible' };

  window.WorkerBenefits = {
    setTab(t) { WB.tab = t; App.reload(); },

    openBenefit(id) {
      App.navigate('mahasarthi-portal', { scheme: id });
    },

    openEnrolled(id) {
      const e = ENROLLED.find(x => x.id === id); if (!e) return;
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start;margin-bottom:14px">
          <div class="kpi__icon" style="width:44px;height:44px;flex-shrink:0;background:${e.c}1a;color:${e.c}">${App.icon(e.ic)}</div>
          <div><b style="font-size:15px">${App.esc(e.name)}</b><div class="mono muted" style="font-size:12px;margin-top:2px">${App.esc(e.sub)}</div></div>
          ${App.ui.pill(e.st, 'green', true)}
        </div>
        <p class="muted" style="font-size:13px">${App.esc(e.desc)}</p>
        <div class="list--divided" style="margin-top:10px">
          <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Enrolled since</span><b style="font-size:13px">${App.esc(e.since)}</b></div>
          <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Coverage / Benefit</span><b style="font-size:13px;text-align:right">${App.esc(e.cover)}</b></div>
        </div>`, {
        title: 'Scheme Details', icon: e.ic,
        foot: `<button class="btn" style="width:100%" onclick="App.modal.close()">Close</button>`,
      });
    },
  };

  function eligibleTab() {
    const rows = ELIGIBLE.map(b => `
      <div class="row between wrap gap-10" style="padding:14px 0">
        <div class="row gap-10" style="align-items:flex-start">
          <span class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${b.c}1a;color:${b.c}">${App.icon(b.ic)}</span>
          <div><b style="font-size:14px">${App.esc(b.title)}</b><div class="muted" style="font-size:12.5px;margin-top:3px;max-width:52ch">${App.esc(b.desc)}</div></div>
        </div>
        <button class="btn btn--sm btn--primary" onclick="WorkerBenefits.openBenefit('${b.id}')">${App.icon('external')} View &amp; Apply</button>
      </div>`).join('');
    return `
      <div class="card reveal">
        <div class="card__head"><div class="grow"><h3>Schemes matched to you</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Based on your worker segment and verified WiN profile</div></div></div>
        <div class="card__body" style="padding-top:0">
          <div class="list--divided">${rows}</div>
        </div>
      </div>
      <div class="banner banner--info reveal mt-16">${App.icon('idcard')}<div>WiN does not check scheme eligibility itself — it only matches schemes to your segment and, with your consent, shares your verified profile with <b>Mahasarthi</b> to complete the check and enrollment.</div></div>`;
  }

  function enrolledTab() {
    const rows = ENROLLED.map(sc => `
      <div class="row between wrap gap-10" style="padding:14px 0">
        <div class="row gap-10" style="align-items:flex-start">
          <span class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${sc.c}1a;color:${sc.c}">${App.icon(sc.ic)}</span>
          <div><b style="font-size:14px">${App.esc(sc.name)}</b><div class="mono muted" style="font-size:11.5px;margin-top:3px">${App.esc(sc.sub)}</div><div class="muted" style="font-size:12.5px;margin-top:3px;max-width:52ch">${App.esc(sc.desc)}</div></div>
        </div>
        <div class="row gap-8" style="align-items:center;flex-shrink:0">${App.ui.pill(sc.st, 'green', true)}<button class="btn btn--sm" onclick="WorkerBenefits.openEnrolled('${sc.id}')">${App.icon('external')} View</button></div>
      </div>`).join('');
    return `
      <div class="card reveal">
        <div class="card__head"><div class="grow"><h3>Schemes you're enrolled in</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Active enrollments linked to your verified WiN profile</div></div></div>
        <div class="card__body" style="padding-top:0">
          <div class="list--divided">${rows}</div>
        </div>
      </div>`;
  }

  App.registerView('worker-benefits', {
    title: 'Benefits & Schemes',
    subtitle: 'Labour-department schemes and subsidies for your worker segment',
    render(ctx) {
      const u = ctx.user;
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('shieldcheck')} Benefits &amp; Schemes</div>
            <h1 class="h-grad" style="margin-top:12px">Every scheme you're entitled to, in one place.</h1>
            <p class="lead">State labour-department schemes and subsidies matched to your worker segment. Eligibility is checked and enrollment is completed on Mahasarthi, with your consent.</p>
            <div class="row gap-8 wrap mt-16">
              <span class="pill pill--gray">${App.icon('mappin')} ${App.esc((u && u.location) || 'Delhi NCR')}</span>
              ${App.ui.verified('Identity verified')}
            </div>
          </div>
        </div>`;

      const tabs = `
        <div class="tabs">
          <div class="tab ${WB.tab === 'eligible' ? 'is-active' : ''}" onclick="WorkerBenefits.setTab('eligible')">${App.icon('shieldcheck')} Schemes Eligible For</div>
          <div class="tab ${WB.tab === 'enrolled' ? 'is-active' : ''}" onclick="WorkerBenefits.setTab('enrolled')">${App.icon('checkcircle')} Schemes Enrolled In</div>
        </div>`;

      return `<div class="page fade-in">
        ${hero}
        ${tabs}
        ${WB.tab === 'eligible' ? eligibleTab() : enrolledTab()}
      </div>`;
    },
  });
})();
