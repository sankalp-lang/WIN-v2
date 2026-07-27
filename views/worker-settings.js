/* Worker · Profile & Settings — Rajan edits his personal info, work information +
   experience entries, skills, and account security. A vertical tab rail switches
   sections (deep-linkable via ?tab=). Edits sync to in-memory state and persist to
   localStorage on Save (workExperience / workerSkills), driving the portfolio.
   Also covers privacy/consent toggles and connected-account (data-access) controls.
   v2 editorial standard: hero band (wash + gradient headline + live stat row) + reveal
   motion + card--hover related links. All flows work (forms, tabs, toggles, modals). */
(function () {
  const WIN = 'WIN-2024-8834-1029';

  const TABS = [
    { id: 'profile',  label: 'Profile',   icon: 'user',      sub: 'Personal information' },
    { id: 'work',     label: 'Work Info',  icon: 'briefcase', sub: 'Roles & experience' },
    { id: 'skills',   label: 'Skills',     icon: 'award',     sub: 'Skills & certifications' },
    { id: 'security', label: 'Security',   icon: 'shield',    sub: 'Password & privacy' },
  ];

  const GOVIDS = [
    { short: 'AA',  name: 'Aadhaar Card',  sub: 'XXXX XXXX 3847',       color: '#e8712c' },
    { short: 'PAN', name: 'PAN Card',      sub: 'ABCPK••••3F',          color: '#0891a7' },
    { short: 'eS',  name: 'E-Shram Card',  sub: 'UAN XXXX-XXXX-1234',   color: '#0e9f6e' },
  ];

  const SUGGESTED = ['Architecture Repair', 'Electrical Basics', 'Welding', 'Plumbing', 'Safety Management', 'AutoCAD Basics'];

  const CONSENT = [
    { key: 'employers',  ic: 'shieldcheck', title: 'Profile visible to verified employers', desc: 'Allow verified employers and banks to view your WiN profile when they request a verification.' },
    { key: 'schemes',    ic: 'landmark',    title: 'Share data with government schemes',     desc: 'Let eligible government welfare schemes read your verified record to auto-enrol you.' },
    { key: 'recruiters', ic: 'briefcase',   title: 'Job offers from recruiters',             desc: 'Allow recruiters to contact you about jobs matched to your verified skills.' },
    { key: 'notify',     ic: 'bell',        title: 'Email & SMS notifications',              desc: 'Receive alerts about verification requests, scheme updates and grievance status.' },
  ];

  // ---- in-memory controller state (survives App.reload re-renders) ----
  const S = {
    tab: 'profile', _lastParam: null, _focusSkill: false, twofa: false,
    saved: { profile: false, work: false, skills: false },
    profile: { name: 'RAJAN', age: '34', email: 'rajan.worker@email.com', phone: '+91 98765 43210', loc: '12, Delhi, India' },
    workInfo: { role: 'Masonry Expert - Construction Supervisor', exp: '14' },
    work: [
      { role: 'Construction Supervisor', org: 'NBCC (India) Ltd. — Govt. Housing Project', period: 'Mar 2023 - Present', loc: 'Delhi',
        address: 'NBCC Housing Site, Sector 62', state: 'Delhi', city: 'Delhi', pincode: '110062',
        sector: 'govt', relation: 'direct', source: 'hrms-govt', verifyStatus: 'verified', gstin: '', tier: 'verified', active: true },
      { role: 'Mason Foreman', org: 'Hiranandani Group', period: 'Jun 2018 - Feb 2023', loc: 'Thane',
        address: 'Hiranandani Estate, Site Office', state: 'Maharashtra', city: 'Thane', pincode: '400607',
        sector: 'nongovt', relation: 'direct', source: 'hrms-nongovt', verifyStatus: 'verified', gstin: '', tier: 'verified', active: false },
      { role: 'Site Loader/Helper (Gig)', org: 'Porter Logistics Platform', period: 'Feb 2018 - May 2018', loc: 'Mumbai',
        address: 'Andheri East Warehouse', state: 'Maharashtra', city: 'Mumbai', pincode: '400069',
        sector: 'nongovt', relation: 'gig', source: 'platform', verifyStatus: 'verified', gstin: '', tier: 'verified', active: false },
      { role: 'Independent Masonry Contractor', org: 'Self-Employed — Rajan Masonry Works', period: 'Jan 2016 - Jan 2018', loc: 'Gurugram',
        address: 'Shop 14, Sohna Road', state: 'Haryana', city: 'Gurugram', pincode: '122018',
        sector: 'nongovt', relation: 'self', source: 'gstin-udyam', verifyStatus: 'verified', gstin: '07ABCDE1234F1Z5', tier: 'verified', active: false },
      { role: 'Senior Mason', org: 'JMD Builders (via Sharma Manpower Agency)', period: 'Jan 2013 - Dec 2015', loc: 'Gurugram',
        address: 'DLF Phase 2, Site Office', state: 'Haryana', city: 'Gurugram', pincode: '122002',
        sector: 'nongovt', relation: 'agency', source: 'agency-hrms', verifyStatus: 'verified', gstin: '', tier: 'verified', active: false },
      { role: 'Mason', org: 'L&T Construction (via local contractor)', period: 'Feb 2011 - Dec 2012', loc: 'Noida',
        address: 'Sector 62, Site Office', state: 'Uttar Pradesh', city: 'Noida', pincode: '201301',
        sector: 'nongovt', relation: 'agency', source: 'dav', verifyStatus: 'verified', gstin: '', tier: 'verified', active: false },
      { role: 'Farm Labourer', org: 'Family farmland', period: '2007 - 2010', loc: 'Lucknow, Uttar Pradesh',
        address: 'Village Rampur, Post Malihabad', state: 'Uttar Pradesh', city: 'Lucknow', pincode: '226102',
        sector: 'nongovt', relation: 'informal', source: 'dav', verifyStatus: 'verified', gstin: '', tier: 'verified', active: false },
    ],
    skills: ['Masonry', 'Scaffolding', 'Plastering', 'Tile Work', 'Concrete Finishing', 'Blueprint Reading'],
    consent: { employers: true, schemes: true, recruiters: false, notify: true },
    access: [
      { name: 'State Bank of India',            short: 'SBI', color: '#2f5fd0', scope: 'Employment history · Identity · Salary records', when: 'Access granted 2 hours ago', revoked: false },
      { name: 'Aditya Birla Construction Ltd.', short: 'AB',  color: '#c07d10', scope: 'Current-employer verification',                  when: 'Access granted Mar 2023', revoked: false },
    ],
  };

  const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };

  // ---- segmentation: sector/relationship -> verification source ----
  const SOURCE_META = {
    'hrms-govt': { label: 'Internal HRMS (Govt/PSU)', ic: 'landmark' },
    'hrms-nongovt': { label: 'HRMS + EPFO/UAN', ic: 'building' },
    'agency-hrms': { label: 'Agency HRMS', ic: 'building' },
    platform: { label: 'Platform Records', ic: 'briefcase' },
    'gstin-udyam': { label: 'GSTIN/Udyam', ic: 'file' },
    dav: { label: 'Digital Address Verification', ic: 'mappin' },
  };
  const RELATIONS = [
    { v: 'direct', label: 'Direct Employee' },
    { v: 'agency', label: 'Staffing Agency' },
    { v: 'gig', label: 'Gig Worker' },
    { v: 'self', label: 'Self-Employed' },
    { v: 'informal', label: 'Farmer / Other' },
  ];
  // resolves the verification source for a given entry's current sector/relation.
  // agency entries keep a pre-seeded 'agency-hrms' source if present; otherwise (including
  // any freshly-added entry) they fall back to DAV — the agency-HRMS instant-fetch path is
  // only demonstrated via seed data, there's no user-facing "does your agency have an HRMS" toggle.
  function resolveSource(w) {
    if (w.relation === 'direct') return w.sector === 'govt' ? 'hrms-govt' : 'hrms-nongovt';
    if (w.relation === 'agency') return w.source === 'agency-hrms' ? 'agency-hrms' : 'dav';
    if (w.relation === 'gig') return 'platform';
    if (w.relation === 'self') return 'gstin-udyam';
    return 'dav';
  }

  const spinner = (label) => `<span class="wset-spin"></span> ${label}`;

  // ---- DAV (Digital Address Verification) modal journey ----
  // step: 'intro' | 'sending' | 'otp' | 'verifying' | 'done'
  const DAV = { step: 'intro', i: null, otp: '', queue: [] };

  function davModal() {
    const w = S.work[DAV.i]; if (!w) return;
    let body, foot;
    if (DAV.step === 'intro' || DAV.step === 'sending') {
      const sending = DAV.step === 'sending';
      body = `
        <div class="banner banner--info" style="margin-bottom:16px">${App.icon('mappin')}<div>We'll verify this work entry against the address you've provided.</div></div>
        <div class="dav-kv">
          <div class="row between gap-12"><span class="muted">Address</span><b>${App.esc(w.address || '—')}</b></div>
          <div class="row between gap-12"><span class="muted">City / State</span><b>${App.esc(w.city || '—')}, ${App.esc(w.state || '—')}</b></div>
          <div class="row between gap-12"><span class="muted">Pincode</span><span class="mono">${App.esc(w.pincode || '—')}</span></div>
        </div>`;
      foot = `<button class="btn" ${sending ? 'disabled' : ''} onclick="App.modal.close()">Cancel</button>
              <button class="btn btn--primary" ${sending ? 'disabled' : ''} onclick="WorkerSettings.davSend()">${sending ? spinner('Sending code…') : `${App.icon('send')} Start Verification`}</button>`;
    } else if (DAV.step === 'otp' || DAV.step === 'verifying') {
      const verifying = DAV.step === 'verifying';
      body = `
        <div class="banner banner--green" style="margin-bottom:16px">${App.icon('checkcircle')}<div>Verification code sent to the registered contact for this address</div></div>
        <div class="field"><label class="label">Enter Code</label>
          <input class="input mono dav-otp num" id="davOtp" inputmode="numeric" maxlength="6" placeholder="6-digit code" value="${App.esc(DAV.otp)}" ${verifying ? 'disabled' : ''} oninput="WorkerSettings.onDavOtp(this)"></div>`;
      foot = `<button class="btn" ${verifying ? 'disabled' : ''} onclick="App.modal.close()">Cancel</button>
              <button class="btn btn--primary" id="davVerifyBtn" ${(DAV.otp.length !== 6 || verifying) ? 'disabled' : ''} onclick="WorkerSettings.davVerify()">${verifying ? spinner('Verifying…') : `${App.icon('lock')} Verify`}</button>`;
    } else {
      body = `<div class="banner banner--green" style="margin-bottom:4px">${App.icon('checkcircle')}<div><b>Address verified</b><div style="font-size:12px;opacity:.85;margin-top:3px">${App.esc(w.role || 'This entry')} at ${App.esc(w.org || '—')} is now verified via Digital Address Verification.</div></div></div>`;
      foot = `<button class="btn btn--primary" onclick="WorkerSettings.davNext()">${App.icon('check')} Done</button>`;
    }
    App.modal.open(body, { title: 'Verify Address', icon: 'mappin', foot });
  }

  window.WorkerSettings = {
    setTab(t) { S.tab = t; App.reload(); },

    // silent syncers (no reload → text inputs keep focus while typing)
    editProfile(k, v) { S.profile[k] = v; },
    editWorkInfo(k, v) { S.workInfo[k] = v; },
    editWork(i, k, v) { if (S.work[i]) S.work[i][k] = v; },
    setGstin(i, v) { if (S.work[i]) S.work[i].gstin = v; },

    uploadPhoto() { App.toast('Photo upload is a demo affordance in this prototype', 'upload'); },

    save(section) {
      try {
        if (section === 'profile') localStorage.setItem('winWorkerProfile', JSON.stringify(Object.assign({}, S.profile, S.workInfo)));
        if (section === 'work') { localStorage.setItem('workExperience', JSON.stringify(S.work)); localStorage.setItem('winWorkInfo', JSON.stringify(S.workInfo)); }
        if (section === 'skills') localStorage.setItem('workerSkills', JSON.stringify(S.skills));
      } catch (e) {}

      if (section === 'work') {
        const toVerify = S.work.map((w, i) => i).filter(i => S.work[i].verifyStatus !== 'verified');
        const davQueue = toVerify.filter(i => resolveSource(S.work[i]) === 'dav');
        const instant = toVerify.filter(i => resolveSource(S.work[i]) !== 'dav');
        instant.forEach(i => WorkerSettings.verifyEntry(i));
        App.toast(toVerify.length ? `Work experience saved — verifying ${toVerify.length} ${toVerify.length === 1 ? 'entry' : 'entries'}…` : 'Work experience saved to your portfolio');
        if (davQueue.length) { DAV.queue = davQueue.slice(1); WorkerSettings.openDAV(davQueue[0]); }
      } else {
        App.toast(section === 'skills' ? 'Skills updated' : 'Profile saved');
      }
      S.saved[section] = true; App.reload();
      setTimeout(() => { S.saved[section] = false; if (App.state.route === 'worker-settings') App.reload(); }, 2000);
    },

    // ---- work experience ----
    addWork() {
      S.work.push({
        role: '', org: '', period: '', loc: '', address: '', state: '', city: '', pincode: '',
        sector: 'nongovt', relation: 'direct', source: '', gstin: '', verifyStatus: 'unverified', tier: 'self', active: false,
      });
      App.reload();
    },
    removeWork(i) { if (S.work.length <= 1) return; const wasActive = S.work[i] && S.work[i].active; S.work.splice(i, 1); if (wasActive && S.work[0]) S.work[0].active = true; App.reload(); },
    setCurrent(i, on) { if (on) S.work.forEach((w, j) => w.active = (j === i)); else if (S.work[i]) S.work[i].active = false; App.reload(); },
    setSector(i, v) { const w = S.work[i]; if (!w) return; w.sector = v; w.source = ''; w.verifyStatus = 'unverified'; App.reload(); },
    setRelation(i, v) { const w = S.work[i]; if (!w) return; w.relation = v; w.source = ''; w.gstin = ''; w.verifyStatus = 'unverified'; App.reload(); },

    // ---- verification (kicks off on Save) ----
    verifyEntry(i) {
      const w = S.work[i]; if (!w) return;
      const source = resolveSource(w);
      if (source === 'dav') { WorkerSettings.openDAV(i); return; }
      if (source === 'gstin-udyam' && !w.gstin) { App.toast('Enter a GSTIN/Udyam number to verify this entry', 'alert'); return; }
      w.source = source; w.verifyStatus = 'pending'; App.reload();
      setTimeout(() => { w.verifyStatus = 'verified'; w.tier = 'verified'; App.reload(); }, 1400);
    },
    openDAV(i) { DAV.step = 'intro'; DAV.i = i; DAV.otp = ''; davModal(); },
    onDavOtp(el) {
      const v = el.value.replace(/\D/g, '').slice(0, 6);
      el.value = v; DAV.otp = v;
      const b = document.getElementById('davVerifyBtn'); if (b) b.disabled = v.length !== 6;
    },
    davSend() { DAV.step = 'sending'; davModal(); setTimeout(() => { DAV.step = 'otp'; davModal(); }, 1500); },
    davVerify() {
      if (DAV.otp.length !== 6) { App.toast('Enter the 6-digit code', 'alert'); return; }
      DAV.step = 'verifying'; davModal();
      setTimeout(() => {
        const w = S.work[DAV.i];
        if (w) { w.source = 'dav'; w.verifyStatus = 'verified'; w.tier = 'verified'; }
        DAV.step = 'done'; davModal(); App.reload();
      }, 2000);
    },
    davNext() {
      App.modal.close();
      if (DAV.queue.length) { const next = DAV.queue.shift(); WorkerSettings.openDAV(next); }
      else { App.toast('Address verified via DAV'); App.reload(); }
    },

    // ---- skills ----
    addSkill() {
      const v = val('wsetSkillInput'); if (!v) { App.toast('Type a skill to add', 'alert'); return; }
      if (S.skills.some(s => s.toLowerCase() === v.toLowerCase())) { App.toast('“' + v + '” is already in your skills', 'alert'); return; }
      S.skills.push(v); S._focusSkill = true; App.reload();
    },
    addSuggested(name) { if (!S.skills.some(s => s.toLowerCase() === name.toLowerCase())) { S.skills.push(name); App.reload(); } },
    removeSkill(name) { S.skills = S.skills.filter(s => s !== name); App.reload(); },

    // ---- security ----
    updatePassword() {
      const cur = val('wsetCurPw'), np = val('wsetNewPw'), cf = val('wsetCfPw');
      if (!cur || !np || !cf) { App.toast('Please fill in all three password fields', 'alert'); return; }
      if (np.length < 8) { App.toast('New password must be at least 8 characters', 'alert'); return; }
      if (np !== cf) { App.toast('New passwords do not match', 'alert'); return; }
      ['wsetCurPw', 'wsetNewPw', 'wsetCfPw'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
      App.toast('Password updated successfully', 'lock');
    },
    enable2FA() {
      if (S.twofa) { App.toast('Two-factor authentication is already on'); return; }
      App.modal.open(`
        <p class="muted" style="font-size:13.5px;line-height:1.6;margin-bottom:14px">Two-factor authentication adds an OTP step after your password — the same Aadhaar-linked mobile you sign in with.</p>
        <div class="banner banner--info" style="margin-bottom:4px">${App.icon('phone')}<div>A verification code will be sent to your registered mobile ending <b>••••9</b> each time you sign in on a new device.</div></div>`, {
        title: 'Enable two-factor authentication', icon: 'key',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="WorkerSettings.confirm2FA()">${App.icon('shieldcheck')} Turn on 2FA</button>`,
      });
    },
    confirm2FA() { S.twofa = true; App.modal.close(); App.toast('Two-factor authentication enabled', 'shieldcheck'); App.reload(); },

    // ---- privacy / consent ----
    toggleConsent(k) {
      S.consent[k] = !S.consent[k];
      const c = CONSENT.find(x => x.key === k);
      App.toast((c ? c.title : 'Setting') + ' · ' + (S.consent[k] ? 'On' : 'Off'), S.consent[k] ? 'checkcircle' : 'x');
      App.reload();
    },
    revoke(i) { const a = S.access[i]; if (!a || a.revoked) return; a.revoked = true; App.toast('Access revoked for ' + a.name, 'lock'); App.reload(); },
  };

  // grip handle (not in the base icon set)
  const grip = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>';

  function tierBadge(tier) {
    if (tier === 'verified') return `<span class="verified" style="font-size:11.5px">${App.icon('shieldcheck')} Verified</span>`;
    if (tier === 'document') return App.ui.pill('Document', 'blue', true);
    return App.ui.pill('Self Declared', 'amber', true);
  }

  // per-entry verification status chip, shown instead of a manual per-entry action button —
  // Save() is what actually kicks off verification (see WorkerSettings.save)
  function verifyChip(w) {
    if (w.verifyStatus === 'verified') {
      const src = SOURCE_META[w.source] || SOURCE_META[resolveSource(w)];
      return `<span class="verified" style="font-size:11.5px">${App.icon('shieldcheck')} Verified via ${App.esc(src.label)}</span>`;
    }
    if (w.verifyStatus === 'pending') return `<span class="pill pill--blue pill--dot">${spinner('Verifying…')}</span>`;
    return App.ui.pill('Not yet verified — click Save', 'gray', true);
  }

  function saveBtn(section, label) {
    return S.saved[section]
      ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" disabled>${App.icon('check')} Saved</button>`
      : `<button class="btn btn--primary" onclick="WorkerSettings.save('${section}')">${App.icon('check')} ${label || 'Save Changes'}</button>`;
  }

  /* ---------------- tab panels ---------------- */
  function profileTab() {
    const p = S.profile;
    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('user')}<h3 class="grow">Personal Information</h3></div>
        <div class="card__body">
          <div class="wset-photo">
            ${App.ui.avatar(p.name || 'Rajan', 'xl')}
            <div>
              <div class="label" style="margin-bottom:4px">Profile picture</div>
              <button class="btn btn--soft btn--sm" onclick="WorkerSettings.uploadPhoto()">${App.icon('upload')} Upload Photo</button>
              <div class="hint" style="margin-top:6px">JPG or PNG, up to 5&nbsp;MB.</div>
            </div>
          </div>

          <div class="grid grid-2" style="margin-top:20px">
            <div class="field" style="margin-bottom:0">
              <label class="label">Full Name</label>
              <input class="input" id="wsetName" value="${App.esc(p.name)}" oninput="WorkerSettings.editProfile('name',this.value)">
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Age</label>
              <input class="input num" id="wsetAge" type="number" min="18" max="99" value="${App.esc(p.age)}" oninput="WorkerSettings.editProfile('age',this.value)">
            </div>
          </div>

          <div class="field" style="margin-top:16px;margin-bottom:0">
            <label class="label">Email Address</label>
            <div class="input--icon">${App.icon('mail')}<input class="input" id="wsetEmail" type="email" value="${App.esc(p.email)}" oninput="WorkerSettings.editProfile('email',this.value)"></div>
          </div>

          <div class="grid grid-2" style="margin-top:16px">
            <div class="field" style="margin-bottom:0">
              <label class="label">Phone Number</label>
              <div class="input--icon">${App.icon('phone')}<input class="input" id="wsetPhone" value="${App.esc(p.phone)}" oninput="WorkerSettings.editProfile('phone',this.value)"></div>
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Location</label>
              <div class="input--icon">${App.icon('mappin')}<input class="input" id="wsetLoc" value="${App.esc(p.loc)}" oninput="WorkerSettings.editProfile('loc',this.value)"></div>
            </div>
          </div>

          <div class="row" style="justify-content:flex-end;margin-top:22px">${saveBtn('profile')}</div>
        </div>
      </div>`;
  }

  function workTab() {
    const govRows = GOVIDS.map(g => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="wset-idbadge" style="background:${g.color}">${App.esc(g.short)}</span>
        <div class="grow"><b style="font-size:13.5px">${App.esc(g.name)}</b><div class="mono muted" style="font-size:12px;margin-top:1px">${App.esc(g.sub)}</div></div>
        ${App.ui.pill('Verified', 'green', true)}
      </div>`).join('');

    const single = S.work.length <= 1;
    const expCards = S.work.map((w, i) => `
      <div class="wset-exp">
        <div class="wset-exp__head">
          <span class="wset-grip" title="Drag to reorder (demo)">${grip}</span>
          <span class="wset-exp__lbl">${w.active ? 'Current Position' : 'Position ' + (i + 1)}</span>
          <span class="grow"></span>
          ${tierBadge(w.tier)}
        </div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Role / Title</label>
            <input class="input" value="${App.esc(w.role)}" placeholder="e.g. Construction Supervisor" oninput="WorkerSettings.editWork(${i},'role',this.value)">
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Company</label>
            <input class="input" value="${App.esc(w.org)}" placeholder="e.g. Omaxe Ltd." oninput="WorkerSettings.editWork(${i},'org',this.value)">
          </div>
        </div>
        <div class="grid grid-2" style="margin-top:12px">
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Period</label>
            <input class="input" value="${App.esc(w.period)}" placeholder="e.g. Mar 2023 - Present" oninput="WorkerSettings.editWork(${i},'period',this.value)">
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Location</label>
            <input class="input" value="${App.esc(w.loc)}" placeholder="e.g. Delhi" oninput="WorkerSettings.editWork(${i},'loc',this.value)">
          </div>
        </div>

        <div class="grid grid-2" style="margin-top:12px">
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Sector</label>
            <select class="select" onchange="WorkerSettings.setSector(${i},this.value)">
              <option value="nongovt" ${w.sector !== 'govt' ? 'selected' : ''}>Non-Government</option>
              <option value="govt" ${w.sector === 'govt' ? 'selected' : ''}>Government</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label wset-flabel">Employment Relationship</label>
            <select class="select" onchange="WorkerSettings.setRelation(${i},this.value)">
              ${RELATIONS.map(r => `<option value="${r.v}" ${w.relation === r.v ? 'selected' : ''}>${App.esc(r.label)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="label" style="margin-top:14px;margin-bottom:2px">Work Address</div>
        <div class="hint" style="margin-bottom:8px">${resolveSource(w) === 'dav' ? 'Required to verify this entry via Digital Address Verification.' : 'Used for your record — verification for this entry uses ' + App.esc((SOURCE_META[resolveSource(w)] || {}).label || '') + '.'}</div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Address</label>
            <input class="input" value="${App.esc(w.address)}" placeholder="Street / site address" oninput="WorkerSettings.editWork(${i},'address',this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">State</label>
            <input class="input" value="${App.esc(w.state)}" placeholder="e.g. Haryana" oninput="WorkerSettings.editWork(${i},'state',this.value)"></div>
        </div>
        <div class="grid grid-2" style="margin-top:12px">
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">City</label>
            <input class="input" value="${App.esc(w.city)}" placeholder="e.g. Gurugram" oninput="WorkerSettings.editWork(${i},'city',this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Pincode</label>
            <input class="input mono" value="${App.esc(w.pincode)}" placeholder="e.g. 122002" oninput="WorkerSettings.editWork(${i},'pincode',this.value)"></div>
        </div>

        ${w.relation === 'self' ? `
        <div class="field" style="margin-top:12px;margin-bottom:0">
          <label class="label wset-flabel">GSTIN / Udyam Number</label>
          <input class="input mono" value="${App.esc(w.gstin)}" placeholder="e.g. 07ABCDE1234F1Z5" oninput="WorkerSettings.setGstin(${i},this.value)">
        </div>` : ''}

        <div class="row between" style="margin-top:13px;padding-top:12px;border-top:1px solid var(--line-2)">
          <label class="wset-check"><input type="checkbox" ${w.active ? 'checked' : ''} onchange="WorkerSettings.setCurrent(${i},this.checked)"> Current position</label>
          <button class="wset-trash" ${single ? 'disabled' : ''} onclick="WorkerSettings.removeWork(${i})" title="${single ? 'At least one entry is required' : 'Remove this entry'}">${App.icon('trash')} Remove</button>
        </div>
        <div class="row" style="margin-top:11px">${verifyChip(w)}</div>
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('briefcase')}<h3 class="grow">Work Information</h3></div>
        <div class="card__body">
          <div class="field" style="margin-bottom:16px">
            <label class="label">Title / Role</label>
            <input class="input" value="${App.esc(S.workInfo.role)}" oninput="WorkerSettings.editWorkInfo('role',this.value)">
          </div>
          <div class="grid grid-2">
            <div class="field" style="margin-bottom:0">
              <label class="label">WIN ID</label>
              <input class="input mono num" value="${App.esc(WIN)}" disabled>
              <div class="hint row gap-6" style="align-items:center;margin-top:6px">${App.icon('lock')} WIN ID cannot be changed</div>
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Years of Experience</label>
              <input class="input num" type="number" min="0" max="60" value="${App.esc(S.workInfo.exp)}" oninput="WorkerSettings.editWorkInfo('exp',this.value)">
            </div>
          </div>

          <div class="label" style="margin-top:22px;margin-bottom:2px">Linked Government IDs</div>
          <div class="hint" style="margin-bottom:8px">Verified at source and linked to your golden record.</div>
          <div class="list--divided">${govRows}</div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('idcard')}<h3 class="grow">Work Experience</h3>
          <button class="btn btn--soft btn--sm" onclick="WorkerSettings.addWork()">${App.icon('plus')} Add Entry</button>
        </div>
        <div class="card__body">
          <div class="banner banner--info" style="margin-bottom:16px">${App.icon('idcard')}<div>Changes here will be reflected on your portfolio. Click <b>Save Changes</b> to apply.</div></div>
          ${expCards}
          <div class="row" style="justify-content:flex-end;margin-top:20px">${saveBtn('work')}</div>
        </div>
      </div>`;
  }

  function skillsTab() {
    const chips = S.skills.length
      ? S.skills.map(s => `<span class="wset-chip">${App.esc(s)}<button title="Remove ${App.esc(s)}" onclick="WorkerSettings.removeSkill('${s.replace(/'/g, "\\'")}')">${App.icon('x')}</button></span>`).join('')
      : `<span class="muted" style="font-size:13px">No skills yet — add one above.</span>`;

    const remaining = SUGGESTED.filter(x => !S.skills.some(s => s.toLowerCase() === x.toLowerCase()));
    const suggested = remaining.length
      ? remaining.map(x => `<button class="wset-add" onclick="WorkerSettings.addSuggested('${x.replace(/'/g, "\\'")}')">${App.icon('plus')} ${App.esc(x)}</button>`).join('')
      : `<span class="muted" style="font-size:13px">All suggested skills added. Nice work.</span>`;

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('award')}<h3 class="grow">Skills &amp; Certifications</h3></div>
        <div class="card__body">
          <p class="muted" style="font-size:13px;margin-bottom:16px">Add or remove skills to keep your profile current. Verified employers see these on your portfolio.</p>

          <label class="label">Add New Skill</label>
          <div class="row gap-8" style="margin-bottom:22px">
            <div class="grow"><input class="input" id="wsetSkillInput" placeholder="e.g. Welding, Electrical Wiring..." onkeydown="if(event.key==='Enter'){event.preventDefault();WorkerSettings.addSkill();}"></div>
            <button class="btn btn--primary" onclick="WorkerSettings.addSkill()">${App.icon('plus')} Add</button>
          </div>

          <div class="row between" style="margin-bottom:10px"><span class="label" style="margin:0">Current Skills</span><span class="pill pill--accent"><span class="num">${S.skills.length}</span>&nbsp;skill${S.skills.length === 1 ? '' : 's'}</span></div>
          <div class="row gap-8 wrap" style="margin-bottom:24px">${chips}</div>

          <div class="label" style="margin-bottom:4px">Suggested Skills for Your Profile</div>
          <div class="hint" style="margin-bottom:10px">Common add-ons for construction supervisors — tap to add.</div>
          <div class="row gap-8 wrap">${suggested}</div>

          <div class="row" style="justify-content:flex-end;margin-top:24px">${saveBtn('skills')}</div>
        </div>
      </div>`;
  }

  function securityTab() {
    const consentRows = CONSENT.map(c => `
      <div class="wset-toggle-row" onclick="WorkerSettings.toggleConsent('${c.key}')">
        <span class="wset-cico">${App.icon(c.ic)}</span>
        <div class="grow"><b style="font-size:13.5px">${App.esc(c.title)}</b><div class="muted" style="font-size:12.5px;line-height:1.45;margin-top:2px;max-width:52ch">${App.esc(c.desc)}</div></div>
        <span class="toggle ${S.consent[c.key] ? 'on' : ''}"></span>
      </div>`).join('');

    const accessRows = S.access.map((a, i) => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="wset-idbadge" style="background:${a.color}">${App.esc(a.short)}</span>
        <div class="grow"><b style="font-size:13.5px">${App.esc(a.name)}</b><div class="muted" style="font-size:12px;margin-top:1px">${App.esc(a.scope)}</div><div class="faint" style="font-size:11px;margin-top:1px">${App.esc(a.when)}</div></div>
        ${a.revoked
          ? `<span class="pill pill--gray pill--dot">Revoked</span>`
          : `<button class="wset-trash" onclick="WorkerSettings.revoke(${i})" title="Revoke access">${App.icon('x')} Revoke</button>`}
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('lock')}<h3 class="grow">Change Password</h3></div>
        <div class="card__body">
          <div class="field"><label class="label">Current password</label><input class="input" id="wsetCurPw" type="password" placeholder="••••••••" autocomplete="current-password"></div>
          <div class="grid grid-2">
            <div class="field" style="margin-bottom:0"><label class="label">New password</label><input class="input" id="wsetNewPw" type="password" placeholder="At least 8 characters" autocomplete="new-password"></div>
            <div class="field" style="margin-bottom:0"><label class="label">Confirm new password</label><input class="input" id="wsetCfPw" type="password" placeholder="Re-enter new password" autocomplete="new-password"></div>
          </div>
          <div class="row" style="justify-content:flex-end;margin-top:20px"><button class="btn btn--primary" onclick="WorkerSettings.updatePassword()">${App.icon('lock')} Update Password</button></div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('key')}<h3 class="grow">Two-Factor Authentication</h3>${S.twofa ? App.ui.pill('Enabled', 'green', true) : ''}</div>
        <div class="card__body">
          <div class="row between wrap gap-12">
            <div style="max-width:54ch"><b style="font-size:13.5px">Add an extra layer of security to your account</b><div class="muted" style="font-size:12.5px;margin-top:3px">Require a one-time code from your Aadhaar-linked mobile when signing in on a new device.</div></div>
            ${S.twofa
              ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" disabled>${App.icon('shieldcheck')} 2FA Enabled</button>`
              : `<button class="btn btn--primary" onclick="WorkerSettings.enable2FA()">${App.icon('key')} Enable 2FA</button>`}
          </div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">Privacy &amp; Consent</h3></div>
        <div class="card__body" style="padding-top:2px">
          ${consentRows}
          <div class="banner banner--green" style="margin-top:14px">${App.icon('lock')}<div>Your data is protected under the <b>DPDP Act, 2023</b>. WiN shares data only with your explicit consent, and you can revoke access anytime.</div></div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('plug')}<h3 class="grow">Connected Accounts &amp; Data Access</h3></div>
        <div class="card__body">
          <p class="muted" style="font-size:12.5px;margin-bottom:8px">Organisations you've granted time-bound access to your verified record.</p>
          <div class="list--divided">${accessRows}</div>
        </div>
      </div>`;
  }

  function panel() {
    if (S.tab === 'work') return workTab();
    if (S.tab === 'skills') return skillsTab();
    if (S.tab === 'security') return securityTab();
    return profileTab();
  }

  App.registerView('worker-settings', {
    title: 'Profile & Settings',
    subtitle: 'Manage your account',
    render(ctx) {
      // honour a ?tab=/params.tab deep-link once, then let in-view tab clicks win
      const p = ctx.params && ctx.params.tab;
      if (p && p !== S._lastParam && TABS.some(t => t.id === p)) { S.tab = p; S._lastParam = p; }

      const u = ctx.user || {};
      const fn = (u.name || S.profile.name || 'there').split(' ')[0];
      const winId = u.winId || WIN;
      const grants = S.access.filter(a => !a.revoked).length;

      const links = [
        { ic: 'idcard',   c: '#0E9E6C', t: 'My Portfolio',    s: 'Verified golden record', go: 'worker-portfolio' },
        { ic: 'doc',      c: '#3B54E8', t: 'My CV',           s: 'Export a clean A4 PDF',  go: 'worker-cv' },
        { ic: 'share',    c: '#0E8C82', t: 'Public Profile',  s: 'Shareable verify link',  go: 'public-portfolio' },
        { ic: 'help',     c: '#B77E12', t: 'Help & Support',  s: 'Guides & grievances',    go: 'worker-help' },
      ];

      const rail = TABS.map(t => `
        <button class="wset-tab ${S.tab === t.id ? 'is-active' : ''}" onclick="WorkerSettings.setTab('${t.id}')">
          ${App.icon(t.icon)}
          <span class="grow"><b>${App.esc(t.label)}</b><span class="wset-tab__sub">${App.esc(t.sub)}</span></span>
        </button>`).join('');

      return `<div class="page fade-in">
        <style>
          .wset-grid{ display:grid; grid-template-columns:236px minmax(0,1fr); gap:24px; align-items:start; margin-bottom:4px; }
          @media (max-width:880px){ .wset-grid{ grid-template-columns:1fr; } }
          .wset-rail{ position:sticky; top:8px; display:flex; flex-direction:column; gap:4px; }
          @media (max-width:880px){ .wset-rail{ position:static; flex-direction:row; overflow-x:auto; padding-bottom:6px; gap:8px; } }
          .wset-rail::-webkit-scrollbar{ height:5px; }
          .wset-rail::-webkit-scrollbar-thumb{ background:var(--line); border-radius:9px; }
          .wset-tab{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; padding:11px 13px; border-radius:var(--r-sm);
            border:1px solid transparent; color:var(--ink-2); cursor:pointer; transition:.13s; white-space:nowrap; }
          .wset-tab:hover{ background:var(--surface-2); }
          .wset-tab .ico{ color:var(--faint); transition:.13s; flex-shrink:0; }
          .wset-tab b{ font-size:13.5px; font-weight:600; display:block; }
          .wset-tab__sub{ font-size:11.5px; color:var(--faint); display:block; margin-top:1px; }
          .wset-tab.is-active{ background:var(--accent-weak); border-color:var(--accent-ring); color:var(--accent-strong); }
          .wset-tab.is-active .ico{ color:var(--accent); }
          .wset-tab.is-active .wset-tab__sub{ color:var(--accent-strong); opacity:.72; }
          .wset-panel{ display:flex; flex-direction:column; gap:20px; min-width:0; }
          .wset-photo{ display:flex; align-items:center; gap:16px; }
          .wset-flabel{ font-size:12px; margin-bottom:5px; }
          .wset-idbadge{ width:38px; height:38px; border-radius:10px; display:grid; place-items:center; color:#fff; font-size:12px; font-weight:700; letter-spacing:.02em; flex-shrink:0; }
          .wset-exp{ border:1px solid var(--line); border-radius:var(--r); padding:15px 16px; background:var(--surface-2); }
          .wset-exp + .wset-exp{ margin-top:13px; }
          .wset-exp .input{ background:var(--surface); }
          .wset-exp__head{ display:flex; align-items:center; gap:9px; margin-bottom:13px; }
          .wset-grip{ color:var(--faint); display:inline-flex; cursor:grab; }
          .wset-exp__lbl{ font-size:12px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--muted); }
          .wset-check{ display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--ink-2); cursor:pointer; }
          .wset-check input{ width:16px; height:16px; accent-color:var(--accent); cursor:pointer; }
          .wset-trash{ display:inline-flex; align-items:center; gap:6px; padding:6px 11px; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--muted); transition:.12s; }
          .wset-trash:hover{ background:var(--red-50); color:var(--red-700); }
          .wset-trash:hover .ico{ color:var(--red-600); }
          .wset-trash[disabled]{ opacity:.4; cursor:not-allowed; }
          .wset-trash[disabled]:hover{ background:transparent; color:var(--muted); }
          .wset-spin{ width:14px; height:14px; border:2px solid rgba(128,128,128,.35); border-top-color:currentColor; border-radius:50%; display:inline-block; vertical-align:-2px; animation:spin 1s linear infinite; }
          .dav-kv{ display:flex; flex-direction:column; gap:10px; font-size:13.5px; }
          .dav-otp{ text-align:center; font-size:16px; letter-spacing:.12em; }
          .wset-chip{ display:inline-flex; align-items:center; gap:6px; padding:7px 7px 7px 13px; border-radius:var(--r-full);
            background:var(--accent-weak); color:var(--accent-strong); font-size:13px; font-weight:600; }
          .wset-chip button{ width:18px; height:18px; border-radius:50%; display:grid; place-items:center; color:var(--accent-strong); opacity:.65; transition:.12s; }
          .wset-chip button:hover{ background:rgba(0,0,0,.09); opacity:1; }
          .wset-chip button .ico{ width:12px; height:12px; }
          .wset-add{ display:inline-flex; align-items:center; gap:6px; padding:7px 13px; border-radius:var(--r-full);
            border:1px dashed var(--line); background:transparent; color:var(--muted); font-size:13px; font-weight:600; cursor:pointer; transition:.12s; }
          .wset-add:hover{ border-color:var(--accent); color:var(--accent-strong); background:var(--accent-weak); }
          .wset-add .ico{ width:14px; height:14px; }
          .wset-toggle-row{ display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--line-2); cursor:pointer; }
          .wset-toggle-row:first-child{ padding-top:4px; }
          .wset-toggle-row:last-child{ border-bottom:none; padding-bottom:2px; }
          .wset-cico{ width:38px; height:38px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; background:var(--accent-weak); color:var(--accent-strong); }
          .wset-cico .ico{ width:19px; height:19px; }
          .wset-stats{ display:flex; flex-wrap:wrap; gap:14px 34px; margin-top:22px; padding-top:18px; border-top:1px solid var(--line-2); }
          .wset-stat{ display:flex; flex-direction:column; gap:3px; }
          .wset-stat__v{ font-size:23px; font-weight:700; line-height:1; color:var(--ink); }
          .wset-stat__l{ font-size:11.5px; color:var(--muted); letter-spacing:.02em; }
          .wset-links{ margin-bottom:4px; }
          .wset-link{ text-align:left; cursor:pointer; }
          .wset-link .kpi__icon{ width:40px; height:40px; margin-bottom:12px; }
          .wset-link b{ font-size:14.5px; display:block; }
          .wset-link .muted{ font-size:12px; margin-top:2px; }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-20">
              <div style="flex:1;min-width:280px">
                <div class="eyebrow">${App.icon('settings')} Account &amp; privacy</div>
                <h1 class="h-grad" style="margin-top:12px">Your account, your rules, ${App.esc(fn)}.</h1>
                <p class="lead">Manage your personal details, work history and skills — and control exactly who can read your verified record.</p>
                <div class="row gap-8 wrap mt-16">
                  <span class="src-chip mono num">${App.icon('idcard')} ${App.esc(winId)}</span>
                  ${App.ui.verified('100% Verified')}
                  <span class="pill pill--gray">${App.icon('lock')} DPDP Act, 2023 protected</span>
                </div>
              </div>
              <div class="row gap-10 wrap" style="align-self:flex-start">
                <button class="btn" onclick="App.navigate('worker-home')">${App.icon('arrowleft')} Home</button>
                <button class="btn btn--accent" onclick="App.navigate('worker-portfolio')">${App.icon('idcard')} My Portfolio</button>
              </div>
            </div>
            <div class="wset-stats">
              <div class="wset-stat"><span class="wset-stat__v num" style="color:var(--accent-strong)">${App.esc(String(S.workInfo.exp))}</span><span class="wset-stat__l">Years experience</span></div>
              <div class="wset-stat"><span class="wset-stat__v num">${S.work.length}</span><span class="wset-stat__l">Work entries</span></div>
              <div class="wset-stat"><span class="wset-stat__v num">${S.skills.length}</span><span class="wset-stat__l">Skills listed</span></div>
              <div class="wset-stat"><span class="wset-stat__v num">${grants}</span><span class="wset-stat__l">Active data grants</span></div>
            </div>
          </div>
        </div>

        <div class="wset-grid reveal">
          <nav class="wset-rail">${rail}</nav>
          <div class="wset-panel">${panel()}</div>
        </div>

        <div class="section-title reveal" style="margin-top:26px">Manage your identity</div>
        <div class="grid grid-4 wset-links">
          ${links.map(l => `
            <button class="card card--pad card--hover reveal wset-link" onclick="App.navigate('${l.go}')">
              <div class="kpi__icon" style="background:${l.c}1a;color:${l.c}">${App.icon(l.ic)}</div>
              <b>${l.t}</b>
              <div class="muted">${l.s}</div>
              <div class="row gap-6 mt-12" style="color:${l.c};font-size:12px;font-weight:600">Open ${App.icon('arrow')}</div>
            </button>`).join('')}
        </div>
      </div>`;
    },
    mounted() {
      if (S._focusSkill) {
        const el = document.getElementById('wsetSkillInput');
        if (el) el.focus();
        S._focusSkill = false;
      }
    },
  });
})();
