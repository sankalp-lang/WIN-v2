/* Mahasarathi consent — the hand-off screen shown before WiN shares a
   worker's verified profile with the real Mahasarathi state scheme portal.
   After consent, this opens the actual Mahasarathi portal
   (mahasarathi.maharashtra.gov.in) in a new tab — a genuine external
   redirect, not a mocked page. */
(function () {
  const SCHEMES = {
    bocw: { title: 'BOCW Cess Welfare Benefits', dept: 'Building & Other Construction Workers Welfare Board' },
    ayushman: { title: 'Ayushman Bharat — PMJAY', dept: 'National Health Authority' },
    'skill-subsidy': { title: 'Skill Upgradation Subsidy', dept: 'State Skill Development Mission' },
    'eshram-insurance': { title: 'e-Shram Accident Insurance (PMSBY)', dept: 'Ministry of Labour & Employment' },
  };
  const MAHASARTHI_URL = 'https://mahasarathi.maharashtra.gov.in/home/landing';

  const MS = { step: 'consent' };

  window.MahasarthiPortal = {
    setStep(s) { MS.step = s; App.reload(); },
    giveConsent() {
      const box = document.getElementById('mahasarthiConsent');
      if (!box || !box.checked) { App.toast('Please provide consent to continue.', 'alert'); return; }
      try { window.open(MAHASARTHI_URL, '_blank', 'noopener,noreferrer'); } catch (e) {}
      MS.step = 'redirected';
      App.reload();
    },
    back() { App.navigate('worker-benefits'); },
  };

  App.registerView('mahasarthi-portal', {
    title: 'Continue to Mahasarathi',
    subtitle: 'Share your verified WiN profile to check eligibility and apply',
    render(ctx) {
      const schemeId = (ctx.params && ctx.params.scheme) || 'bocw';
      const scheme = SCHEMES[schemeId] || SCHEMES.bocw;
      if (schemeId !== MS._lastScheme) { MS._lastScheme = schemeId; MS.step = 'consent'; }

      const header = `
        <div class="hero__wash"></div>
        <div class="row gap-12" style="align-items:center;margin-bottom:18px">
          <div class="kpi__icon" style="width:44px;height:44px;background:var(--accent-weak);color:var(--accent-strong)">${App.icon('landmark')}</div>
          <div><b style="font-size:16px">${App.esc(scheme.title)}</b><div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(scheme.dept)} · via Mahasarathi</div></div>
        </div>`;

      const body = MS.step === 'consent' ? `
        <p class="muted" style="font-size:13.5px;line-height:1.6">Checking eligibility and completing enrollment for this scheme happens on <b>Mahasarathi</b>, the state scheme portal — WiN does not check eligibility itself. With your consent, we'll open Mahasarathi so you can apply; your verified identity and work history stay with WiN unless you choose to share them there.</p>
        <label class="row gap-8" style="margin:18px 0;align-items:flex-start;cursor:pointer">
          <input type="checkbox" id="mahasarthiConsent" style="margin-top:3px">
          <span style="font-size:13.5px">I consent to being redirected to Mahasarathi to check eligibility and apply for this scheme.</span>
        </label>
        <div class="row gap-10">
          <button class="btn" onclick="MahasarthiPortal.back()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--primary grow" onclick="MahasarthiPortal.giveConsent()">${App.icon('external')} Continue to Mahasarathi</button>
        </div>`
        : `
        <div class="banner banner--green" style="margin-bottom:18px">${App.icon('checkcircle')}<div><b>Mahasarathi opened in a new tab</b><div style="margin-top:3px;opacity:.9">Continue your application for ${App.esc(scheme.title)} there.</div></div></div>
        <p class="muted" style="font-size:13px">Didn't see the new tab? <a href="${MAHASARTHI_URL}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-strong);font-weight:600">Open Mahasarathi again</a>.</p>
        <button class="btn" style="margin-top:14px" onclick="MahasarthiPortal.back()">${App.icon('arrowleft')} Back to WiN</button>`;

      return `<div class="page fade-in">
        <div class="card card--pad reveal" style="max-width:560px;margin:0 auto;position:relative;overflow:hidden">
          ${header}
          ${body}
        </div>
      </div>`;
    },
  });
})();
