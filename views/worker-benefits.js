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
    { id: 'eshram', name: 'e-Shram', sub: 'UAN XXXX-XXXX-1234', st: 'Active', c: '#0e9f6e', ic: 'idcard',
      since: 'Jan 2022', desc: 'National database of unorganised workers, unlocking accident insurance and access to welfare schemes.',
      cover: '₹2,00,000 accident cover (PMSBY)' },
    { id: 'esic', name: 'ESIC', sub: 'IP No: 1234567890', st: 'Active', c: '#0e9f6e', ic: 'shieldcheck',
      since: 'Jun 2018', desc: 'Employees\' State Insurance — medical, sickness and maternity benefits for you and your dependants.',
      cover: 'Cashless treatment at ESIC hospitals & dispensaries' },
    { id: 'epfo', name: 'EPFO', sub: 'UAN 1001-2345-6789', st: 'Active', c: '#2f5fd0', ic: 'landmark',
      since: 'Jun 2018', desc: 'Employees\' Provident Fund — retirement savings with employer + employee contributions.',
      cover: 'Current balance: ₹1,84,220 (demo)' },
    { id: 'pmsym', name: 'PM-SYM', sub: 'Enrolment: PSM-84921', st: 'Enrolled', c: '#0d9488', ic: 'award',
      since: 'Mar 2023', desc: 'Pradhan Mantri Shram Yogi Maandhan — voluntary pension scheme for unorganised workers.',
      cover: '₹3,000/month pension after age 60' },
  ];

  const WB = { tab: 'eligible' };

  window.WorkerBenefits = {
    setTab(t) { WB.tab = t; App.reload(); },

    openBenefit(id) {
      const b = ELIGIBLE.find(x => x.id === id); if (!b) return;
      App.modal.open(`
        <div class="banner banner--info" style="margin-bottom:14px">${App.icon('idcard')}<div><b>${App.esc(b.title)}</b><div style="margin-top:3px;opacity:.9">${App.esc(b.desc)}</div></div></div>
        <p class="muted" style="font-size:13px">Checking eligibility and completing enrollment happens on <b>Mahasarthi</b>, the state scheme portal. We'll share your verified WiN profile (identity, work history, income) with your consent so you don't have to re-enter it.</p>
        <label class="row gap-8" style="margin-top:14px;align-items:flex-start;cursor:pointer">
          <input type="checkbox" id="benefitConsent" style="margin-top:3px">
          <span style="font-size:13px">I consent to sharing my verified WiN profile with Mahasarthi to check eligibility for this scheme.</span>
        </label>`, {
        title: 'Continue to Mahasarthi', icon: 'shieldcheck',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" id="mahasarthiGoBtn" onclick="WorkerBenefits.confirmBenefit('${id}')">${App.icon('external')} Continue to Mahasarthi</button>`,
      });
    },
    confirmBenefit(id) {
      const box = document.getElementById('benefitConsent');
      if (!box || !box.checked) { App.toast('Please provide consent to continue.', 'alert'); return; }
      const b = ELIGIBLE.find(x => x.id === id);
      const btn = document.getElementById('mahasarthiGoBtn');
      if (btn) { btn.disabled = true; btn.innerHTML = 'Redirecting…'; }
      // simulated redirect: brief loading state, then a confirmation screen that
      // stands in for landing on Mahasarthi (no real cross-domain nav in a demo).
      setTimeout(() => {
        const ref = 'MHS-' + Math.floor(100000 + Math.random() * 900000);
        App.modal.open(`
          <div style="text-align:center;padding:8px 0 4px">
            <div class="kpi__icon" style="width:52px;height:52px;margin:0 auto 14px;background:var(--green-50);color:var(--green-600)">${App.icon('checkcircle')}</div>
            <h3 style="margin-bottom:6px">You're on Mahasarthi</h3>
            <p class="muted" style="font-size:13px;max-width:38ch;margin:0 auto">Your verified WiN profile was shared and an eligibility check for <b>${App.esc(b ? b.title : 'this scheme')}</b> has been started.</p>
            <div class="mono" style="font-size:12px;color:var(--muted);margin-top:12px">Reference: <b>${ref}</b></div>
          </div>`, {
          title: 'Redirected to Mahasarthi', icon: 'external',
          foot: `<button class="btn btn--primary" style="width:100%" onclick="App.modal.close()">Done</button>`,
        });
      }, 1100);
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
    const cards = ENROLLED.map(sc => `
      <button class="card card--pad card--hover" style="text-align:left;width:100%;cursor:pointer" onclick="WorkerBenefits.openEnrolled('${sc.id}')">
        <div class="row between">
          <div class="row gap-12">
            <div class="kpi__icon" style="width:40px;height:40px;background:${sc.c}1a;color:${sc.c}">${App.icon(sc.ic)}</div>
            <div><b style="font-size:14.5px">${App.esc(sc.name)}</b><div class="mono muted" style="font-size:12px;margin-top:2px">${App.esc(sc.sub)}</div></div>
          </div>
          <div class="row gap-8" style="align-items:center">${App.ui.pill(sc.st, 'green', true)}${App.icon('chevron')}</div>
        </div>
      </button>`).join('');
    return `<div class="grid grid-2 reveal">${cards}</div>`;
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
