/* Worker · Benefits & Schemes — state labour-department schemes and subsidies
   for this worker's segment, view-only. Eligibility checking and enrollment
   execution happen on Mahasarthi, with the worker's consent to share their
   verified WiN profile — this page never runs its own eligibility logic. */
(function () {
  const BENEFITS = [
    { id: 'bocw', ic: 'shieldcheck', c: '#0e9f6e', title: 'BOCW Cess Welfare Benefits', desc: 'Building & Other Construction Workers welfare fund — accident, maternity and pension support.' },
    { id: 'ayushman', ic: 'filecheck', c: '#d64545', title: 'Ayushman Bharat — PMJAY', desc: 'Cashless health cover up to ₹5 lakh/year for you and your family at empanelled hospitals.' },
    { id: 'skill-subsidy', ic: 'graduation', c: '#2f5fd0', title: 'Skill Upgradation Subsidy', desc: 'Reimbursement for approved certification courses under the state skilling mission.' },
    { id: 'eshram-insurance', ic: 'idcard', c: '#0d9488', title: 'e-Shram Accident Insurance', desc: 'Personal accident cover for registered unorganised-sector workers, up to ₹2 lakh.' },
  ];

  window.WorkerBenefits = {
    openBenefit(id) {
      const b = BENEFITS.find(x => x.id === id); if (!b) return;
      App.modal.open(`
        <div class="banner banner--info" style="margin-bottom:14px">${App.icon('idcard')}<div><b>${App.esc(b.title)}</b><div style="margin-top:3px;opacity:.9">${App.esc(b.desc)}</div></div></div>
        <p class="muted" style="font-size:13px">Checking eligibility and completing enrollment happens on <b>Mahasarthi</b>, the state scheme portal. We'll share your verified WiN profile (identity, work history, income) with your consent so you don't have to re-enter it.</p>
        <label class="row gap-8" style="margin-top:14px;align-items:flex-start;cursor:pointer">
          <input type="checkbox" id="benefitConsent" style="margin-top:3px">
          <span style="font-size:13px">I consent to sharing my verified WiN profile with Mahasarthi to check eligibility for this scheme.</span>
        </label>`, {
        title: 'Continue to Mahasarthi', icon: 'shieldcheck',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="WorkerBenefits.confirmBenefit('${id}')">${App.icon('external')} Continue to Mahasarthi</button>`,
      });
    },
    confirmBenefit(id) {
      const box = document.getElementById('benefitConsent');
      if (!box || !box.checked) { App.toast('Please provide consent to continue.', 'alert'); return; }
      App.modal.close();
      App.toast('Redirecting to Mahasarthi…', 'external');
    },
  };

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

      const rows = BENEFITS.map(b => `
        <div class="row between wrap gap-10" style="padding:14px 0">
          <div class="row gap-10" style="align-items:flex-start">
            <span class="kpi__icon" style="width:34px;height:34px;flex-shrink:0;background:${b.c}1a;color:${b.c}">${App.icon(b.ic)}</span>
            <div><b style="font-size:14px">${App.esc(b.title)}</b><div class="muted" style="font-size:12.5px;margin-top:3px;max-width:52ch">${App.esc(b.desc)}</div></div>
          </div>
          <button class="btn btn--sm btn--primary" onclick="WorkerBenefits.openBenefit('${b.id}')">${App.icon('external')} View &amp; Apply</button>
        </div>`).join('');

      const list = `
        <div class="card reveal">
          <div class="card__head"><div class="grow"><h3>Schemes matched to you</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Based on your worker segment and verified WiN profile</div></div></div>
          <div class="card__body" style="padding-top:0">
            <div class="list--divided">${rows}</div>
          </div>
        </div>`;

      const banner = `<div class="banner banner--info reveal mb-20">${App.icon('idcard')}<div>WiN does not check scheme eligibility itself — it only matches schemes to your segment and, with your consent, shares your verified profile with <b>Mahasarthi</b> to complete the check and enrollment.</div></div>`;

      return `<div class="page fade-in">
        ${hero}
        ${banner}
        ${list}
      </div>`;
    },
  });
})();
