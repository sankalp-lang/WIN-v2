/* Mahasarthi — mocked external state scheme portal that WiN redirects a
   worker to (with consent) to complete eligibility checking and enrollment.
   Deliberately styled apart from WiN's own branding to read as a hand-off to
   a different system, not another WiN screen. */
(function () {
  const SCHEMES = {
    bocw: { title: 'BOCW Cess Welfare Benefits', dept: 'Building & Other Construction Workers Welfare Board' },
    ayushman: { title: 'Ayushman Bharat — PMJAY', dept: 'National Health Authority' },
    'skill-subsidy': { title: 'Skill Upgradation Subsidy', dept: 'State Skill Development Mission' },
    'eshram-insurance': { title: 'e-Shram Accident Insurance (PMSBY)', dept: 'Ministry of Labour & Employment' },
  };

  const MS = { step: 'checking' };

  window.MahasarthiPortal = {
    submit() { MS.step = 'submitted'; App.reload(); },
    back() { App.navigate('worker-benefits'); },
  };

  App.registerView('mahasarthi-portal', {
    title: 'Mahasarthi',
    subtitle: 'Maharashtra State Scheme Portal',
    render(ctx) {
      const schemeId = (ctx.params && ctx.params.scheme) || 'bocw';
      const scheme = SCHEMES[schemeId] || SCHEMES.bocw;
      const u = ctx.user || {};
      if (schemeId !== MS._lastScheme) { MS._lastScheme = schemeId; MS.step = 'checking'; MS._timerSet = false; }
      if (MS.step === 'checking' && !MS._timerSet) {
        MS._timerSet = true;
        setTimeout(() => { MS.step = 'eligible'; MS._timerSet = false; if (App.state.route === 'mahasarthi-portal') App.reload(); }, 1300);
      }

      const header = `
        <div style="background:linear-gradient(120deg,#b45309,#7c2d12);color:#fff;padding:22px 28px;border-radius:var(--r-lg) var(--r-lg) 0 0">
          <div class="row between wrap gap-12" style="align-items:center">
            <div class="row gap-12" style="align-items:center">
              <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.16);display:grid;place-items:center">${App.icon('landmark')}</div>
              <div><b style="font-size:17px">Mahasarthi</b><div style="font-size:11.5px;opacity:.85;margin-top:1px">Government of Maharashtra · State Scheme Portal</div></div>
            </div>
            <span class="pill" style="background:rgba(255,255,255,.16);color:#fff;border-color:transparent">${App.icon('external')} Redirected from WiN</span>
          </div>
        </div>`;

      const body = MS.step === 'checking' ? `
        <div style="text-align:center;padding:50px 20px">
          <div class="spin" style="margin:0 auto 16px;width:34px;height:34px;border-width:3px"></div>
          <b style="font-size:15px">Checking eligibility for ${App.esc(scheme.title)}…</b>
          <div class="muted" style="font-size:13px;margin-top:6px">Verifying your shared WiN profile against ${App.esc(scheme.dept)} records</div>
        </div>`
        : MS.step === 'eligible' ? `
        <div style="padding:24px 28px">
          <div class="banner banner--green" style="margin-bottom:18px">${App.icon('checkcircle')}<div><b>You're eligible for ${App.esc(scheme.title)}</b><div style="margin-top:3px;opacity:.9">Verified against your shared WiN profile — no re-entry needed.</div></div></div>
          <div class="label" style="margin-bottom:8px">Applicant Details (shared from WiN)</div>
          <div class="list--divided" style="margin-bottom:20px">
            <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Name</span><b style="font-size:13px">${App.esc(u.name || 'Rajan Kumar')}</b></div>
            <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">WIN ID</span><b class="mono" style="font-size:13px">${App.esc(u.winId || 'WIN-2024-8834-1029')}</b></div>
            <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Location</span><b style="font-size:13px">${App.esc(u.location || 'Delhi NCR')}</b></div>
            <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Scheme</span><b style="font-size:13px;text-align:right">${App.esc(scheme.title)}</b></div>
            <div class="row between" style="padding:9px 0"><span class="faint" style="font-size:12px">Administered by</span><b style="font-size:13px;text-align:right">${App.esc(scheme.dept)}</b></div>
          </div>
          <button class="btn btn--primary" style="width:100%;background:#b45309;border-color:transparent" onclick="MahasarthiPortal.submit()">${App.icon('send')} Submit Application</button>
        </div>`
        : `
        <div style="text-align:center;padding:44px 24px">
          <div class="kpi__icon" style="width:52px;height:52px;margin:0 auto 14px;background:var(--green-50);color:var(--green-600)">${App.icon('checkcircle')}</div>
          <h3 style="margin-bottom:6px">Application Submitted</h3>
          <p class="muted" style="font-size:13px;max-width:38ch;margin:0 auto">Your application for <b>${App.esc(scheme.title)}</b> has been submitted to the ${App.esc(scheme.dept)}. You'll be notified on WiN once it's processed.</p>
          <div class="mono" style="font-size:12px;color:var(--muted);margin-top:12px">Reference: <b>MHS-${App.esc(String(schemeId).toUpperCase().slice(0, 4))}-${Math.floor(100000 + Math.random() * 900000)}</b></div>
          <button class="btn" style="margin-top:22px" onclick="MahasarthiPortal.back()">${App.icon('arrowleft')} Back to WiN</button>
        </div>`;

      return `<div class="page fade-in">
        <div class="card reveal" style="overflow:hidden;max-width:640px;margin:0 auto">
          ${header}
          ${body}
        </div>
      </div>`;
    },
  });
})();
