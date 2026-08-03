/* Worker · My Portfolio — Rajan's verified golden record: editorial hero + trust
   ring, identity record, work-history timeline, skills, education, grievances,
   enrolled schemes, inbound verification requests, verification status and
   recent activity. v2 editorial standard (hero + reveal + working flows). */
(function () {
  const WIN = 'WIN-2024-8834-1029';
  const SHARE_URL = 'https://win.gov.in/portfolio/' + WIN;

  // colour map for per-item tints (semantic tokens where possible)
  const C = { green: '#0e9f6e', amber: '#c07d10', blue: '#2f5fd0', teal: '#0d9488', violet: '#6b4fc7', slate: '#475569' };

  // inbound verification requests (read by both the sidebar list and the modal)
  const REQUESTS = {
    sbi: {
      name: 'State Bank of India', short: 'SBI', color: '#2f5fd0', when: '2 hours ago',
      ask: 'is asking to verify your profile for a loan request',
      purpose: 'Loan application verification — SBI requires your employment and identity details to process your home loan application (Ref: HL-2025-44821).',
      items: ['Identity (Aadhaar / PAN)', 'Employment History', 'Current Employer Verification', 'Salary Records (last 6 months)'],
    },
    dlf: {
      name: 'DLF Ltd.', short: 'DLF', color: '#334155', when: '5 hours ago',
      ask: 'is asking to verify your profile for employee verification',
      purpose: 'Employee background verification — DLF is conducting a background check as part of their onboarding process for a new construction project in Gurugram.',
      items: ['Identity Verification', 'Work History & Experience', 'Skills & Certifications', 'Previous Employer References'],
    },
  };

  // in-memory controller state (survives App.reload re-renders)
  let skillsOpen = false, workOpen = false;
  const status = {}; // request id -> 'approved' | 'declined'

  // deterministic faux-QR (offline: no external image) ------------------------
  function qrSvg(px) {
    const N = 25, m = [];
    let s = 1987; const bit = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >> 17) & 1; };
    for (let y = 0; y < N; y++) { m[y] = []; for (let x = 0; x < N; x++) m[y][x] = bit(); }
    const finder = (ox, oy) => {
      for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) {
        const yy = oy + y, xx = ox + x; if (yy < 0 || yy >= N || xx < 0 || xx >= N) continue;
        if (x === -1 || x === 7 || y === -1 || y === 7) { m[yy][xx] = 0; continue; }
        const edge = (x === 0 || x === 6 || y === 0 || y === 6);
        const core = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        m[yy][xx] = (edge || core) ? 1 : 0;
      }
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    const cell = 8; let r = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
    const sz = N * cell;
    return `<svg viewBox="0 0 ${sz} ${sz}" width="${px}" height="${px}" fill="var(--ink)"><rect width="${sz}" height="${sz}" fill="#fff"/><g>${r}</g></svg>`;
  }

  // work-history badge by verification tier
  function wbadge(b) {
    if (b.c === 'green') return `<span class="verified" style="font-size:11.5px">${App.icon('shieldcheck')} ${App.esc(b.t)}</span>`;
    if (b.c === 'blue') return App.ui.pill(b.t, 'blue', true);
    return App.ui.pill(b.t, 'amber', true);
  }

  const RELATION_LABEL = { direct: 'Direct, Full-Time Employee', agency: 'Contract Worker', gig: 'Gig Worker', self: 'Self-Employed Worker', informal: 'Farmer / Other Worker' };

  // state labour-department benefits & schemes — view-only surface; eligibility check
  // and enrollment happens on Mahasarthi (WiN does not run its own eligibility logic).
  const BENEFITS = [
    { id: 'bocw', ic: 'shieldcheck', c: '#0e9f6e', title: 'BOCW Cess Welfare Benefits', desc: 'Building & Other Construction Workers welfare fund — accident, maternity and pension support.' },
    { id: 'ayushman', ic: 'filecheck', c: '#d64545', title: 'Ayushman Bharat — PMJAY', desc: 'Cashless health cover up to ₹5 lakh/year for you and your family at empanelled hospitals.' },
    { id: 'skill-subsidy', ic: 'graduation', c: '#2f5fd0', title: 'Skill Upgradation Subsidy', desc: 'Reimbursement for approved certification courses under the state skilling mission.' },
  ];

  function openBenefit(id) {
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
             <button class="btn btn--primary" onclick="WorkerPortfolio.confirmBenefit('${id}')">${App.icon('external')} Continue to Mahasarthi</button>`,
    });
  }

  // per-employment-type tint (govt is a fixed navy shade regardless of relation, so the
  // sector distinction reads as consistent across all five relation types)
  const REL_META = {
    direct:   { label: 'Full-Time',     ic: 'briefcase', govtIc: 'landmark', c: '#2f5fd0' },
    agency:   { label: 'Contract',      ic: 'users',     govtIc: 'users',    c: '#6b4fc7' },
    gig:      { label: 'Gig',           ic: 'bolt',      govtIc: 'bolt',     c: '#c07d10' },
    self:     { label: 'Self-Employed', ic: 'user',      govtIc: 'user',     c: '#0d9488' },
    informal: { label: 'Informal',      ic: 'leaf',      govtIc: 'leaf',     c: '#475569' },
  };
  // a plain icon badge (no text) — the icon differs by relation type: briefcase/landmark for
  // Full-Time (private vs. government employer), users for Contract Worker (an agency places
  // them — sector-agnostic by design, see worker-settings.js), a single "user" for
  // Self-Employed (their own boss, vs. Contract's "users"), bolt for Gig, leaf for Informal.
  function relTag(w) {
    const m = REL_META[w.relation] || REL_META.direct;
    const isGovt = w.sector === 'govt';
    const ic = isGovt ? m.govtIc : m.ic;
    const label = (isGovt ? 'Government' : 'Non-Government') + ' · ' + m.label;
    return `<span class="wp-relic" style="background:${m.c}1a;color:${m.c}" title="${App.esc(label)}" aria-label="${App.esc(label)}">${App.icon(ic)}</span>`;
  }

  // plain-text segment label appended to the period · location line
  function segLabel(w) {
    return `${w.sector === 'govt' ? 'Government' : 'Non-Government'} · ${RELATION_LABEL[w.relation] || ''}`;
  }

  window.WorkerPortfolio = {
    toggleSkills() { skillsOpen = !skillsOpen; App.reload(); },
    toggleWork() { workOpen = !workOpen; App.reload(); },
    edit(tab) { App.navigate('worker-settings', { tab }); },
    grievance() { App.navigate('worker-grievance'); },

    // ---- benefits & schemes (view-only; consent-gated redirect to Mahasarthi) ----
    openBenefit,
    confirmBenefit(id) {
      const box = document.getElementById('benefitConsent');
      if (!box || !box.checked) { App.toast && App.toast('Please provide consent to continue.'); return; }
      App.modal.close();
      App.toast ? App.toast('Redirecting to Mahasarthi…') : null;
    },

    // ---- share sheet (works fully; no clipping inside the hero) ----
    openShare() {
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin:-4px 0 14px;max-width:46ch">Share Rajan's verified profile. Recipients can confirm the record against the Ministry database — no login required.</p>
        <div class="wp-sharelink"><span class="mono">${App.esc(SHARE_URL)}</span><button class="btn btn--ghost btn--sm" onclick="WorkerPortfolio.share('copy')">${App.icon('copy')} Copy</button></div>
        <div class="wp-sharegrid">
          <button class="wp-sharebtn" onclick="WorkerPortfolio.share('email')">${App.icon('mail')}<span>Email</span></button>
          <button class="wp-sharebtn" onclick="WorkerPortfolio.share('whatsapp')">${App.icon('message')}<span>WhatsApp</span></button>
          <button class="wp-sharebtn" onclick="WorkerPortfolio.share('linkedin')">${App.icon('external')}<span>LinkedIn</span></button>
          <button class="wp-sharebtn" onclick="WorkerPortfolio.share('copy')">${App.icon('copy')}<span>Copy link</span></button>
        </div>`, {
        title: 'Share profile', icon: 'share',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               <button class="btn btn--primary" onclick="App.modal.close();App.navigate('public-portfolio')">${App.icon('globe')} Open public profile</button>`,
      });
    },
    share(ch) {
      if (ch === 'copy') {
        try { navigator.clipboard && navigator.clipboard.writeText(SHARE_URL); } catch (e) {}
        App.toast('Profile link copied!', 'copy');
        return; // keep the sheet open so they can pick another channel
      }
      App.modal.close();
      App.toast('Shared via ' + ({ email: 'Email', whatsapp: 'WhatsApp', linkedin: 'LinkedIn' }[ch] || ch), 'share');
    },

    downloadProfile() {
      App.toast('Generating verified profile PDF…', 'file');
      setTimeout(() => App.toast('Profile PDF ready — download started', 'download'), 1200);
    },
    downloadQR() { App.toast('QR code downloaded', 'download'); },

    openQR() {
      App.modal.open(`
        <div style="text-align:center">
          <div class="wp-qrbox">${qrSvg(158)}</div>
          <b style="font-size:16px;display:block;margin-top:16px">Scan to Verify Work History</b>
          <div class="mono" style="font-size:12.5px;color:var(--muted);margin-top:6px">WIN ID · ${App.esc(WIN)}</div>
          <p class="muted" style="font-size:13px;margin-top:10px;max-width:40ch;margin-inline:auto">Share this QR code to let employers verify your profile against the Ministry database in seconds.</p>
        </div>`, {
        title: 'Verify Work History', icon: 'shieldcheck',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               <button class="btn btn--primary" onclick="WorkerPortfolio.downloadQR()">${App.icon('download')} Download QR</button>`,
      });
    },

    openRequest(id) {
      const r = REQUESTS[id]; if (!r) return;
      const items = r.items.map(i => `<div class="row gap-10" style="padding:7px 0"><span style="color:var(--green-600);display:inline-flex">${App.icon('check')}</span><span style="font-size:13px;color:var(--ink-2)">${App.esc(i)}</span></div>`).join('');
      App.modal.open(`
        <div class="row gap-12" style="margin-bottom:16px">
          <span class="wp-badge" style="background:${r.color}">${App.esc(r.short)}</span>
          <div class="grow"><b style="font-size:15px">${App.esc(r.name)}</b><div class="faint" style="font-size:12px">Requested ${App.esc(r.when)}</div></div>
          ${App.ui.pill('Pending', 'amber', true)}
        </div>
        <div class="banner banner--info" style="margin-bottom:16px">${App.icon('idcard')}<div><b>Purpose</b><div style="margin-top:3px;opacity:.9">${App.esc(r.purpose)}</div></div></div>
        <div class="label" style="margin-bottom:4px">Information requested</div>
        <div class="list--divided" style="margin-bottom:16px">${items}</div>
        <div class="banner banner--amber">${App.icon('lock')}<div>Approving grants ${App.esc(r.name)} time-bound access to the fields above. You can revoke access anytime from <b>Profile &amp; Settings</b>. No data is shared until you approve.</div></div>`, {
        title: 'Verification Request', icon: 'shieldcheck',
        foot: `<button class="btn btn--danger" onclick="WorkerPortfolio.resolve('${id}','declined')">${App.icon('x')} Decline</button>
               <button class="btn btn--primary" style="background:var(--green-600)" onclick="WorkerPortfolio.resolve('${id}','approved')">${App.icon('check')} Approve</button>`,
      });
    },

    resolve(id, decision) {
      status[id] = decision;
      const ok = decision === 'approved';
      App.modal.open(`
        <div style="text-align:center;padding:14px 6px">
          <div class="wp-confirm" style="background:${ok ? 'var(--green-50)' : 'var(--red-50)'};color:${ok ? 'var(--green-600)' : 'var(--red-600)'}">${App.icon(ok ? 'checkcircle' : 'x')}</div>
          <b style="font-size:17px;display:block;margin-top:14px">${ok ? 'Request Approved' : 'Request Declined'}</b>
          <p class="muted" style="font-size:13px;margin-top:6px;max-width:34ch;margin-inline:auto">${ok ? 'Access granted. Revoke anytime from Profile Settings.' : 'The requester has been notified. No data was shared.'}</p>
        </div>`, {});
      setTimeout(() => { App.modal.close(); App.reload(); App.toast(ok ? 'Verification approved' : 'Request declined', ok ? 'checkcircle' : 'x'); }, 1200);
    },
  };

  // shown to a freshly signed-up worker instead of Rajan's demo portfolio — there's
  // no work history, skills or schemes to show yet.
  function freshPortfolio() {
    return `<div class="page fade-in">
      <div class="hero reveal">
        <div class="hero__wash"></div>
        <div class="hero__in">
          <div class="eyebrow">${App.icon('idcard')} My Work History</div>
          <h1 class="h-grad" style="margin-top:12px">Your work history is empty.</h1>
          <p class="lead">Add your work history and skills in Profile &amp; Settings — once verified, they'll show up here as your golden record.</p>
          <button class="btn btn--accent" style="margin-top:16px" onclick="App.navigate('worker-settings')">${App.icon('edit')} Add Work History</button>
        </div>
      </div>
    </div>`;
  }

  App.registerView('worker-portfolio', {
    title: 'My Work History',
    subtitle: 'Your verified professional identity',
    render(ctx) {
      const u = ctx.user;
      if (u && u._fresh) return freshPortfolio();

      const work = [
        { role: 'Construction Supervisor', org: 'NBCC (India) Ltd. — Govt. Housing Project', period: 'Mar 2023 – Present', loc: 'Delhi',
          sector: 'govt', relation: 'direct', source: 'hrms-govt', active: true, badge: { t: 'Verified · Internal HRMS', c: 'green' } },
        { role: 'Mason Foreman', org: 'Hiranandani Group', period: 'Jun 2018 – Feb 2023', loc: 'Thane',
          sector: 'nongovt', relation: 'direct', source: 'hrms-nongovt', badge: { t: 'Verified · HRMS/EPFO', c: 'green' } },
        { role: 'Site Loader/Helper (Gig)', org: 'Porter Logistics Platform', period: 'Feb 2018 – May 2018', loc: 'Mumbai',
          sector: 'nongovt', relation: 'gig', source: 'platform', badge: { t: 'Verified · Platform Records', c: 'green' } },
        { role: 'Independent Masonry Contractor', org: 'Self-Employed — Rajan Masonry Works', period: 'Jan 2016 – Jan 2018', loc: 'Gurugram',
          sector: 'nongovt', relation: 'self', source: 'pan-gst', pan: 'ABCPK4321F', badge: { t: 'Verified · GST Details', c: 'green' } },
        { role: 'Senior Mason', org: 'JMD Builders (via Sharma Manpower Agency)', period: 'Jan 2013 – Dec 2015', loc: 'Gurugram',
          sector: 'nongovt', relation: 'agency', source: 'agency-hrms', badge: { t: 'Verified · Agency HRMS', c: 'green' } },
        { role: 'Mason', org: 'L&T Construction (via local contractor)', period: 'Feb 2011 – Dec 2012', loc: 'Noida',
          sector: 'nongovt', relation: 'agency', source: 'dav', badge: { t: 'Verified · Digital Address Verification', c: 'green' } },
        { role: 'Farm Labourer', org: 'Family farmland', period: '2007 – 2010', loc: 'Lucknow, Uttar Pradesh',
          sector: 'nongovt', relation: 'informal', source: 'dav', badge: { t: 'Verified · Digital Address Verification', c: 'green' } },
      ];
      const visWork = workOpen ? work : work.slice(0, 3);

      const skills = ['Masonry', 'Scaffolding', 'Plastering', 'Tile Work', 'Concrete Finishing', 'Blueprint Reading'];
      const visSkills = skillsOpen ? skills : skills.slice(0, 4);

      const schemes = [
        { name: 'e-Shram', sub: 'UAN XXXX-XXXX-1234', st: 'Active', c: 'green', ic: 'idcard' },
        { name: 'ESIC', sub: 'IP No: 1234567890', st: 'Active', c: 'green', ic: 'shieldcheck' },
        { name: 'EPFO', sub: 'UAN 1001-2345-6789', st: 'Active', c: 'blue', ic: 'landmark' },
        { name: 'PM-SYM', sub: 'Enrolment: PSM-84921', st: 'Enrolled', c: 'teal', ic: 'award' },
      ];

      const gstats = [
        { label: 'Open Cases', val: '2', c: 'amber', ic: 'clock' },
        { label: 'Resolved', val: '14', c: 'green', ic: 'checkcircle' },
        { label: 'Avg. Resolution', val: '6h', c: 'blue', ic: 'bolt' },
        { label: 'Total Filed', val: '16', c: 'slate', ic: 'message' },
      ];

      const activity = [
        { t: 'Profile viewed by SBI', w: '2 hours ago', ic: 'eye', c: 'blue' },
        { t: 'ESIC renewal approved', w: '1 day ago', ic: 'shieldcheck', c: 'green' },
        { t: 'New course recommended', w: '2 days ago', ic: 'graduation', c: 'violet' },
        { t: 'PF contribution received', w: '3 days ago', ic: 'landmark', c: 'teal' },
      ];

      const pending = Object.keys(REQUESTS).filter(k => !status[k]).length;

      // ---- Verification request rows ----
      const reqRows = Object.keys(REQUESTS).map(id => {
        const r = REQUESTS[id], st = status[id];
        if (st) {
          const ok = st === 'approved';
          return `<div class="wp-reqrow is-done">
            <span class="wp-dot" style="background:${ok ? 'var(--green-50)' : 'var(--red-50)'};color:${ok ? 'var(--green-600)' : 'var(--red-600)'}">${App.icon(ok ? 'check' : 'x')}</span>
            <div class="grow"><b>${App.esc(r.name)}</b><div class="${ok ? 'wp-ok' : 'wp-no'}">${ok ? 'Verification approved' : 'Request declined'}</div></div>
          </div>`;
        }
        return `<button class="wp-reqrow" onclick="WorkerPortfolio.openRequest('${id}')">
          <span class="wp-badge sm" style="background:${r.color}">${App.esc(r.short)}</span>
          <div class="grow"><b>${App.esc(r.name)}</b><div class="wp-ask"><span class="muted">${App.esc(r.ask)}</span></div><div class="faint" style="font-size:11px;margin-top:2px">${App.esc(r.when)}</div></div>
          ${App.icon('chevron')}
        </button>`;
      }).join('');

      // ---- Verification status rows ----
      const statusRows = [
        { l: 'Identity', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Employer', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Govt Database', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Skills', r: App.ui.pill('6 certified', 'blue') },
      ].map(x => `<div class="minirow"><span style="color:var(--green-600);display:inline-flex">${App.icon('checkcircle')}</span><span class="grow" style="font-size:13.5px;color:var(--ink)">${x.l}</span>${x.r}</div>`).join('');

      return `<div class="page fade-in">
        <style>
          .wp-grid{ display:grid; grid-template-columns:minmax(0,1.62fr) minmax(0,1fr); gap:20px; align-items:start; }
          .wp-col{ display:flex; flex-direction:column; gap:20px; }
          @media (max-width:1040px){ .wp-grid{ grid-template-columns:1fr; } }
          .wp-idavatar{ width:76px; height:76px; border-radius:50%; display:grid; place-items:center; flex-shrink:0;
            background:linear-gradient(140deg,var(--accent),var(--accent-strong)); color:#fff; box-shadow:0 0 0 4px var(--accent-ring); }
          .wp-idavatar .ico{ width:38px; height:38px; }
          .wp-qrtile{ display:flex; flex-direction:column; align-items:center; gap:7px; padding:12px 14px; border:1px solid var(--line);
            border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.13s; text-align:center; }
          .wp-qrtile:hover{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); }
          .wp-qrtile span{ font-size:11px; font-weight:600; color:var(--accent-strong); display:inline-flex; align-items:center; gap:5px; }
          .wp-qrbox{ display:inline-grid; place-items:center; padding:14px; border-radius:var(--r); border:1px solid var(--line); background:#fff; }
          .wp-badge{ width:40px; height:40px; border-radius:11px; display:grid; place-items:center; flex-shrink:0; color:#fff; font-size:12.5px; font-weight:700; letter-spacing:.02em; }
          .wp-badge.sm{ width:34px; height:34px; border-radius:9px; font-size:11px; }
          .wp-reqrow{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; padding:11px 0; border-bottom:1px solid var(--line-2); transition:.12s; }
          .wp-reqrow:last-child{ border-bottom:none; }
          .wp-reqrow:not(.is-done){ cursor:pointer; }
          .wp-reqrow:not(.is-done):hover{ background:var(--surface-2); border-radius:var(--r-sm); padding-inline:8px; margin-inline:-8px; }
          .wp-reqrow b{ font-size:13.5px; }
          .wp-reqrow .wp-ask{ font-size:12px; line-height:1.35; margin-top:1px; }
          .wp-reqrow > .ico{ color:var(--faint); flex-shrink:0; }
          .wp-dot{ width:34px; height:34px; border-radius:9px; display:grid; place-items:center; flex-shrink:0; }
          .wp-ok{ font-size:12px; font-weight:600; color:var(--green-700); }
          .wp-no{ font-size:12px; font-weight:600; color:var(--red-700); }
          .wp-confirm{ width:60px; height:60px; border-radius:50%; display:inline-grid; place-items:center; }
          .wp-confirm .ico{ width:30px; height:30px; }
          .wp-skill{ display:inline-flex; align-items:center; gap:7px; padding:6px 12px; border-radius:var(--r-full);
            background:var(--blue-50); border:1px solid var(--blue-100); color:var(--blue-700); font-size:12.5px; font-weight:600; }
          .wp-skill .ico{ color:var(--blue-600); width:15px; height:15px; }
          .wp-strip{ display:flex; align-items:center; gap:9px; padding:11px 16px; font-weight:600; font-size:12.5px; letter-spacing:.02em; }
          .wp-relic{ display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; flex-shrink:0; }
          .wp-relic .ico{ width:14px; height:14px; }
          .wp-gstat{ text-align:left; }
          .wp-gstat .wp-gval{ font-size:24px; font-weight:600; letter-spacing:-.02em; color:var(--ink); }
          .wp-sharelink{ display:flex; align-items:center; gap:8px; padding:9px 10px 9px 13px; border:1px solid var(--line);
            border-radius:var(--r); background:var(--surface-2); margin-bottom:14px; }
          .wp-sharelink .mono{ flex:1; font-size:12.5px; color:var(--ink-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .wp-sharegrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
          .wp-sharebtn{ display:flex; align-items:center; gap:10px; padding:12px 13px; border:1px solid var(--line); border-radius:var(--r);
            background:var(--surface); font-size:13.5px; font-weight:600; color:var(--ink); text-align:left; transition:.13s; }
          .wp-sharebtn:hover{ border-color:var(--accent); background:var(--accent-weak); color:var(--accent-strong); }
          .wp-sharebtn .ico{ color:var(--muted); }
          .wp-sharebtn:hover .ico{ color:var(--accent); }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-20">
              <div style="min-width:290px;flex:1">
                <div class="eyebrow">${App.icon('fingerprint')} Verified worker identity</div>
                <h1 class="h-grad" style="margin-top:12px">Your verified golden record.</h1>
                <p class="lead">One 100% digital identity that unlocks the government schemes and social security you're entitled to — and turns your work history into a financial asset.</p>
                <div class="row gap-8 wrap mt-16">
                  <span class="src-chip mono">${App.icon('idcard')} ${App.esc(WIN)}</span>
                  ${App.ui.verified('100% Verified')}
                  <span class="pill pill--gray">${App.esc(u.role)} · ${App.esc(u.location)}</span>
                  <span class="pill pill--gray"><span class="num">14</span>&nbsp;yrs experience</span>
                </div>
              </div>
              <div class="row gap-10 wrap" style="align-items:flex-start">
                <button class="btn" onclick="WorkerPortfolio.downloadProfile()">${App.icon('download')} Download Profile</button>
                <button class="btn btn--soft" onclick="WorkerPortfolio.openShare()">${App.icon('share')} Share</button>
                <button class="btn btn--primary" onclick="App.navigate('public-portfolio')">${App.icon('globe')} Public profile</button>
              </div>
            </div>
          </div>
        </div>

        <div class="wp-grid">
          <!-- ============ MAIN COLUMN ============ -->
          <div class="wp-col">

            <!-- identity + trust -->
            <div class="card reveal" style="overflow:hidden">
              <div class="wp-strip" style="background:var(--green-50);color:var(--green-700);justify-content:space-between">
                <span class="row gap-8">${App.icon('shieldcheck')} Verified · Employer / Ministry Database</span>
                <span class="pill pill--green mono" style="font-weight:600">WIN ID: ${App.esc(WIN)}</span>
              </div>
              <div class="card__body">
                <div class="row between wrap gap-20">
                  <div class="row gap-16" style="min-width:240px">
                    <div class="wp-idavatar">${App.icon('user')}</div>
                    <div>
                      <div class="row gap-8"><h2 style="font-size:21px">${App.esc(u.name)}</h2><span class="muted num" style="font-size:14px">· 34</span>
                        <button class="iconbtn" style="width:28px;height:28px" title="Edit identity" onclick="WorkerPortfolio.edit('profile')">${App.icon('edit')}</button></div>
                      <div style="color:var(--blue-600);font-size:13.5px;font-weight:600;margin-top:3px">Masonry Expert · Construction Supervisor</div>
                      <div class="row gap-6 muted mt-8" style="font-size:12.5px">${App.icon('mappin')} ${App.esc(u.location || 'Delhi NCR')}, India</div>
                    </div>
                  </div>
                  <div class="row gap-16 wrap" style="align-items:center">
                    ${App.ui.ring(100, 'Trust Score', '%')}
                    <button class="wp-qrtile" onclick="WorkerPortfolio.openQR()">
                      ${qrSvg(74)}
                      <span>${App.icon('shieldcheck')} Scan to Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- work profile timeline -->
            <div class="card reveal">
              <div class="wp-strip" style="background:var(--blue-50);color:var(--blue-700);justify-content:space-between">
                <span class="row gap-8">${App.icon('briefcase')} Work Profile · <span class="num">14</span>&nbsp;Years</span>
                <button class="iconbtn" style="width:28px;height:28px;color:var(--blue-700)" title="Edit work history" onclick="WorkerPortfolio.edit('work')">${App.icon('edit')}</button>
              </div>
              <div class="card__body">
                <div class="timeline">
                  ${visWork.map(w => `
                    <div class="timeline__item">
                      <div class="timeline__dot ${w.active ? 'done' : ''}" ${w.active ? '' : `style="border-color:${(REL_META[w.relation] || REL_META.direct).c}"`}></div>
                      <div class="row between wrap gap-8">
                        <div><b>${App.esc(w.role)} · ${App.esc(w.org)}</b><div class="when">${App.esc(w.period)} · ${App.esc(w.loc)} · ${App.esc(segLabel(w))}</div></div>
                        ${w.active ? App.ui.pill('Currently Active', 'green', true) : ''}
                      </div>
                      <div class="row gap-8 wrap mt-8" style="align-items:center">${relTag(w)}${wbadge(w.badge)}</div>
                    </div>`).join('')}
                </div>
                ${work.length > 3 ? `<button class="btn btn--ghost btn--sm" style="margin-top:14px" onclick="WorkerPortfolio.toggleWork()">${workOpen ? 'Show Less' : 'View Complete History'} ${App.icon(workOpen ? 'chevron' : 'chevrondown')}</button>` : ''}
              </div>
            </div>

            <!-- benefits & schemes -->
            <div class="card reveal">
              <div class="wp-strip" style="background:var(--green-50);color:var(--green-700)">${App.icon('shieldcheck')} Benefits &amp; Schemes · ${App.esc(u.location || 'Delhi NCR')}</div>
              <div class="card__body">
                <p class="muted" style="font-size:13px;margin-bottom:14px">Labour-department schemes and subsidies you may be eligible for, based on your worker segment. Eligibility is checked and enrollment is completed on Mahasarthi.</p>
                <div class="list--divided">
                  ${BENEFITS.map(b => `
                    <div class="row between wrap gap-10" style="padding:10px 0">
                      <div class="row gap-10" style="align-items:flex-start">
                        <span style="color:${b.c};flex-shrink:0;margin-top:1px">${App.icon(b.ic)}</span>
                        <div><b style="font-size:13.5px">${App.esc(b.title)}</b><div class="faint" style="font-size:12px;margin-top:2px">${App.esc(b.desc)}</div></div>
                      </div>
                      <button class="btn btn--sm" onclick="WorkerPortfolio.openBenefit('${b.id}')">View</button>
                    </div>`).join('')}
                </div>
              </div>
            </div>

            <!-- skills -->
            <div class="card reveal">
              <div class="card__head">
                <h3 class="grow">Skills &amp; Certifications (<span class="num">${skills.length}</span>)</h3>
                <button class="iconbtn" style="width:28px;height:28px" title="Edit skills" onclick="WorkerPortfolio.edit('skills')">${App.icon('edit')}</button>
                <button class="btn btn--ghost btn--sm" onclick="WorkerPortfolio.toggleSkills()">${skillsOpen ? 'Show less' : 'View all'}</button>
              </div>
              <div class="card__body">
                <div class="row gap-8 wrap">${visSkills.map(s => `<span class="wp-skill">${App.icon('check')} ${App.esc(s)}</span>`).join('')}</div>
              </div>
            </div>

            <!-- education -->
            <div class="card reveal">
              <div class="card__head">${App.icon('graduation')}<h3 class="grow">Education</h3>${App.ui.pill('Verified', 'green', true)}</div>
              <div class="card__body">
                <div class="row between wrap gap-16">
                  <div>
                    <b style="font-size:14.5px">Class 12th (Senior Secondary)</b>
                    <div class="muted" style="font-size:13px;margin-top:3px">UP Board (Uttar Pradesh Madhyamik Shiksha Parishad)</div>
                    <div class="muted" style="font-size:13px">Govt. Inter College, Lucknow</div>
                    <div class="row gap-8 wrap mt-12"><span class="tag">Year: <span class="num">2008</span></span><span class="tag">Score: <span class="num">68.4%</span></span></div>
                  </div>
                  <div class="banner banner--green" style="align-items:center;max-width:220px">${App.icon('filecheck')}<div><b>Digitally Verified</b><div style="font-size:11.5px;opacity:.85">UP Board Digital Records</div></div></div>
                </div>
              </div>
            </div>

            <!-- grievances -->
            <div class="reveal">
              <div class="section-title">Grievances</div>
              <div class="grid grid-4">
                ${gstats.map(g => `
                  <button class="card card--pad card--hover wp-gstat" onclick="WorkerPortfolio.grievance()">
                    <div class="kpi__icon" style="width:38px;height:38px;background:${C[g.c]}1a;color:${C[g.c]};margin-bottom:10px">${App.icon(g.ic)}</div>
                    <div class="wp-gval num">${App.esc(g.val)}</div>
                    <div class="muted" style="font-size:12.5px;margin-top:2px">${g.label}</div>
                  </button>`).join('')}
              </div>
            </div>

            <!-- schemes -->
            <div class="reveal">
              <div class="section-title">Schemes Enrolled In</div>
              <div class="grid grid-2">
                ${schemes.map(sc => `
                  <div class="card card--pad">
                    <div class="row between">
                      <div class="row gap-12">
                        <div class="kpi__icon" style="width:40px;height:40px;background:${C[sc.c]}1a;color:${C[sc.c]}">${App.icon(sc.ic)}</div>
                        <div><b style="font-size:14.5px">${App.esc(sc.name)}</b><div class="mono muted" style="font-size:12px;margin-top:2px">${App.esc(sc.sub)}</div></div>
                      </div>
                      ${App.ui.pill(sc.st, sc.c, true)}
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- ============ SIDEBAR COLUMN ============ -->
          <div class="wp-col">

            <!-- verification requests -->
            <div class="card reveal">
              <div class="card__head">${App.icon('bell')}<h3 class="grow">Verification Requests</h3>${pending ? App.ui.pill(pending + ' pending', 'amber') : App.ui.pill('All clear', 'green', true)}</div>
              <div class="card__body" style="padding-top:4px;padding-bottom:8px">
                ${reqRows || App.ui.empty('bell', 'No verification requests', 'Requests to verify your profile appear here.')}
              </div>
            </div>

            <!-- verification status -->
            <div class="card reveal">
              <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">Verification Status</h3></div>
              <div class="card__body">
                <div class="row between" style="margin-bottom:7px"><span style="font-size:13px;font-weight:600">Overall Score</span><span class="num" style="font-weight:600;color:var(--green-700)">100%</span></div>
                ${App.ui.bar(100, 'var(--green-600)')}
                <div class="list--divided mt-16">${statusRows}</div>
              </div>
            </div>

            <!-- recent activity -->
            <div class="card reveal">
              <div class="card__head">${App.icon('clock')}<h3 class="grow">Recent Activity</h3></div>
              <div class="card__body" style="padding-top:4px;padding-bottom:8px">
                ${activity.map(a => `
                  <div class="minirow">
                    <div class="kpi__icon" style="width:34px;height:34px;background:${C[a.c]}1a;color:${C[a.c]}">${App.icon(a.ic)}</div>
                    <div class="grow"><div style="font-size:13px;color:var(--ink);font-weight:500">${App.esc(a.t)}</div></div>
                    <span class="faint" style="font-size:11.5px;white-space:nowrap">${App.esc(a.w)}</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;
    },
  });
})();
