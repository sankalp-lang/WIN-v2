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

  // a representative pick-list for the Company field's dropdown — includes every employer
  // already used in the seeded work history so those entries pre-select correctly, plus
  // other well-known names; anything else falls through to "Others" (free text).
  const KNOWN_COMPANIES = [
    'NBCC (India) Ltd. — Govt. Housing Project', 'Hiranandani Group', 'Porter Logistics Platform',
    'Self-Employed — Rajan Masonry Works', 'JMD Builders (via Sharma Manpower Agency)',
    'L&T Construction (via local contractor)', 'Family farmland',
    'DLF Ltd.', 'Godrej Properties', 'Tata Projects', 'Shapoorji Pallonji', 'Adani Realty',
    'Omaxe Ltd.', 'Sobha Ltd.', 'Prestige Group', 'Lodha Group', 'Brigade Group',
  ];

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
        address: 'NBCC Housing Site, Sector 62', state: 'Delhi', pincode: '110062',
        sector: 'govt', relation: 'direct', source: 'hrms-govt', verifyStatus: 'verified', pan: '', tier: 'verified', active: true },
      { role: 'Mason Foreman', org: 'Hiranandani Group', period: 'Jun 2018 - Feb 2023', loc: 'Thane',
        address: 'Hiranandani Estate, Site Office', state: 'Maharashtra', pincode: '400607',
        sector: 'nongovt', relation: 'direct', source: 'hrms-nongovt', verifyStatus: 'verified', pan: '', tier: 'verified', active: false },
      { role: 'Site Loader/Helper (Gig)', org: 'Porter Logistics Platform', period: 'Feb 2018 - May 2018', loc: 'Mumbai',
        address: 'Andheri East Warehouse', state: 'Maharashtra', pincode: '400069',
        sector: 'nongovt', relation: 'gig', source: 'platform', verifyStatus: 'verified', pan: '', tier: 'verified', active: false },
      { role: 'Independent Masonry Contractor', org: 'Self-Employed — Rajan Masonry Works', period: 'Jan 2016 - Jan 2018', loc: 'Gurugram',
        address: 'Shop 14, Sohna Road', state: 'Haryana', pincode: '122018',
        sector: 'nongovt', relation: 'self', source: 'pan-gst', verifyStatus: 'verified', pan: 'ABCPK4321F', hasPan: 'yes', tier: 'verified', active: false },
      { role: 'Senior Mason', org: 'JMD Builders (via Sharma Manpower Agency)', period: 'Jan 2013 - Dec 2015', loc: 'Gurugram',
        address: 'DLF Phase 2, Site Office', state: 'Haryana', pincode: '122002',
        sector: 'nongovt', relation: 'agency', source: 'agency-hrms', verifyStatus: 'verified', pan: '', tier: 'verified', active: false },
      { role: 'Mason', org: 'L&T Construction (via local contractor)', period: 'Feb 2011 - Dec 2012', loc: 'Noida',
        address: 'Sector 62, Site Office', state: 'Uttar Pradesh', pincode: '201301',
        sector: 'nongovt', relation: 'agency', source: 'dav', verifyStatus: 'verified', pan: '', tier: 'verified', active: false },
      { role: 'Farm Labourer', org: 'Family farmland', period: '2007 - 2010', loc: 'Lucknow, Uttar Pradesh',
        address: 'Village Rampur, Post Malihabad', state: 'Uttar Pradesh', pincode: '226102',
        sector: 'nongovt', relation: 'informal', source: 'dav', verifyStatus: 'verified', pan: '', tier: 'verified', active: false },
    ],
    skills: ['Masonry', 'Scaffolding', 'Plastering', 'Tile Work', 'Concrete Finishing', 'Blueprint Reading'],
    consent: { employers: true, schemes: true, recruiters: false, notify: true },
    access: [
      { name: 'State Bank of India',            short: 'SBI', color: '#2f5fd0', scope: 'Employment history · Identity · Salary records', when: 'Access granted 2 hours ago', revoked: false },
      { name: 'Aditya Birla Construction Ltd.', short: 'AB',  color: '#c07d10', scope: 'Current-employer verification',                  when: 'Access granted Mar 2023', revoked: false },
    ],
  };

  // pristine copy of the demo persona's seeded work history — taken before any render can
  // mutate S.work — so switching back to the demo persona after a fresh-worker session
  // blanked it out restores Rajan's entries instead of leaving Work Info empty.
  const DEMO_WORK_SNAPSHOT = JSON.parse(JSON.stringify(S.work));
  const DEMO_WORK_INFO_SNAPSHOT = JSON.parse(JSON.stringify(S.workInfo));

  const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };

  // ---- segmentation: sector/relationship -> verification source ----
  const SOURCE_META = {
    'hrms-govt': { label: 'Internal HRMS', ic: 'landmark' },
    'hrms-nongovt': { label: 'HRMS/EPFO', ic: 'building' },
    'agency-hrms': { label: 'Agency HRMS', ic: 'building' },
    platform: { label: 'Platform Records', ic: 'briefcase' },
    'pan-gst': { label: 'GST Details', ic: 'file' },
    dav: { label: 'Digital Address Verification', ic: 'mappin' },
    // fallback identifiers when the employer/agency isn't in our HRMS lookup (Company =
    // "Others") — a direct/contract worker can still verify via one of their own
    // government-linked accounts instead of falling straight back to DAV.
    uan: { label: 'UAN / EPFO', ic: 'idcard' },
    ppf: { label: 'PPF Account', ic: 'file' },
    nps: { label: 'NPS Account', ic: 'shieldcheck' },
  };
  const ALT_ID_META = {
    uan: { label: 'UAN Number', placeholder: 'e.g. 100123456789' },
    ppf: { label: 'PPF Account Number', placeholder: 'e.g. PPF1234567890' },
    nps: { label: 'PRAN (NPS) Number', placeholder: 'e.g. 110012345678' },
  };
  const RELATIONS = [
    { v: 'direct', label: 'Direct, Full-Time Employee' },
    { v: 'agency', label: 'Contract Worker' },
    { v: 'gig', label: 'Gig Worker' },
    { v: 'self', label: 'Self-Employed Worker' },
    { v: 'informal', label: 'Farmer / Other Worker' },
  ];
  // Contract Worker (agency) is sector-agnostic by design: whether the placement is at a
  // government office or a private company, the employer of record is the agency itself, so
  // verification always attempts the agency's own HRMS first — never the end client's HRMS.


  const spinner = (label) => `<span class="wset-spin"></span> ${label}`;

  // ---- DAV (Digital Address Verification) modal journey ----
  // Modelled step-for-step on Tartan's real DAV product (verify.tartanhq.com): consent →
  // choose verification state → address type → what-you-need checklist → GPS proximity match
  // → a sequence of photo captures (name board, office interior, office ID, government ID
  // front/back) → done. This prototype simulates every capture (no real camera/location
  // access), but keeps the same screen-by-screen structure and framing.
  const ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Passport', "Voter ID", 'Driving Licence'];
  // only ID types that actually carry information on the reverse side need a back capture —
  // a PAN card is single-sided, and a passport's data lives entirely on the front bio page.
  const ID_BACK_REQUIRED = { 'Aadhaar Card': true, 'PAN Card': false, 'Passport': false, 'Voter ID': true, 'Driving Licence': true };
  // the photo-capture sequence run once GPS location has matched — two variants:
  // DAV_FLOW_SELF for self-employed workers verifying a business/office address: name
  // board → office interior (reception → lobby → workstation) → office ID card (a single
  // skippable step — plenty of self-employed contractors won't have one) → government ID
  // (front + back; the ID-type picker lives on the Front screen so it isn't a separate
  // numbered step). DAV_FLOW_FARMER for farmers/other informal workers, who have no
  // office at all: work-area photo → boundary marker/landmark → government ID front/back
  // — exactly 4 steps.
  const DAV_FLOW_SELF = [
    { kind: 'photo', title: 'Office Name Board Visibility', sub: "Take a photo of your Office Name Board" },
    { kind: 'photo', title: 'Office Interior', context: 'Reception', sub: 'Take a photo of your office interior to verify' },
    { kind: 'photo', title: 'Office Interior', context: 'Lobby', sub: 'Take a photo of your office interior to verify', skippable: true },
    { kind: 'photo', title: 'Office Interior', context: 'Workstation', sub: 'Take a photo of your office interior to verify', skippable: true },
    { kind: 'photo', title: 'Office ID Verification', sub: 'Take a photo of your office ID card, if you have one', skippable: true },
    { kind: 'idphoto', side: 'Front' },
    { kind: 'idphoto', side: 'Back' },
  ];
  const DAV_FLOW_FARMER = [
    { kind: 'photo', title: 'Work Area Photo', sub: 'Take a photo of your farmland or work area', ic: 'leaf' },
    { kind: 'photo', title: 'Boundary Marker / Landmark', sub: 'Take a photo of a boundary marker or nearby landmark', ic: 'leaf' },
    { kind: 'idphoto', side: 'Front' },
    { kind: 'idphoto', side: 'Back' },
  ];
  // step: 'consent' | 'verifyState' | 'addressType' | 'checklist' | 'location' | 'locating'
  //     | 'flow' | 'done'   —  flow-substep phase: 'ready' | 'shooting' | 'captured'
  // flowKind: 'self' (office/business address) | 'farmer' (farmland — no office at all)
  const DAV = { step: 'consent', i: null, queue: [], flowKind: 'self', addressType: '', idType: '', idx: 0, phase: 'ready', stream: null, camError: false, schedDate: '', schedSlot: '', customDate: '', customTime: '' };

  // "14:30" -> "2:30 PM", for the custom time input
  function fmtTime12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }
  // format any ISO date (preset or custom) as "Mon, 22 Jul" without relying on the 3-day preset list
  function fmtDavDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
  }

  // next N calendar days for the reschedule date-picker (no Date.now() dependency issues
  // here since this only runs on user interaction, not at module-load time)
  function davNextDays(n) {
    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const out = [];
    const today = new Date();
    for (let i = 1; i <= n; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      out.push({ iso: d.toISOString().slice(0, 10), dow: DOW[d.getDay()], num: d.getDate(), mon: MON[d.getMonth()] });
    }
    return out;
  }

  // ---- real camera access for the photo-capture steps (falls back to the illustrated
  // placeholder if the browser/device has no camera or permission is denied) ----
  function stopDavCamera() {
    if (DAV.stream) { DAV.stream.getTracks().forEach(t => t.stop()); DAV.stream = null; }
  }
  function startDavCamera() {
    if (!(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      DAV.camError = true; davModal(); return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(stream => {
      DAV.stream = stream; DAV.camError = false;
      const video = document.getElementById('davVideo');
      if (video) { video.srcObject = stream; video.play && video.play().catch(() => {}); } else { stopDavCamera(); }
    }).catch(() => { DAV.camError = true; davModal(); });
  }

  function davBuilding() { return App.icon(DAV.flowKind === 'farmer' ? 'leaf' : 'building', 'dav-illus'); }
  function davFlow() { return DAV.flowKind === 'farmer' ? DAV_FLOW_FARMER : DAV_FLOW_SELF; }

  function davModal() {
    const w = S.work[DAV.i]; if (!w) return;
    const isFarmer = DAV.flowKind === 'farmer';
    let title, icon, body, foot;

    if (DAV.step === 'consent') {
      title = 'Verify Address'; icon = 'shieldcheck';
      body = `
        <div class="dav-center" style="margin:6px 0 16px">${App.icon('shieldcheck', 'dav-shield')}</div>
        <h3 style="text-align:center;margin:0 0 8px">Share your data</h3>
        <p class="muted" style="text-align:center;font-size:13.5px;line-height:1.6;max-width:38ch;margin:0 auto">
          I consent to sharing my address details with WiN for the purpose of verifying this work
          entry. My data is protected and shared securely, only for this verification.</p>`;
      foot = `<button class="btn" onclick="WorkerSettings.davDecline()">I Decline</button>
              <button class="btn btn--primary" onclick="WorkerSettings.davAgree()">${App.icon('check')} I Agree</button>`;

    } else if (DAV.step === 'verifyState') {
      title = 'Verify Address'; icon = 'mappin';
      body = `
        <div class="dav-center" style="margin:4px 0 16px">${davBuilding()}</div>
        <h3 style="text-align:center;margin:0 0 4px">Verify your Address</h3>
        <p class="muted" style="text-align:center;font-size:13px;margin:0 0 16px">Select current state of your verification:</p>
        <button class="dav-choice is-active" onclick="WorkerSettings.davStart()"><span class="dav-choice__ic" style="background:var(--green-50);color:var(--green-600)">${App.icon('check')}</span><b>Start Verification</b></button>
        <button class="dav-choice" onclick="WorkerSettings.davOpenReschedule()"><span class="dav-choice__ic" style="background:var(--blue-50);color:var(--blue-600)">${App.icon('clock')}</span><b>Reschedule Verification</b></button>`;
      foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>`;

    } else if (DAV.step === 'reschedule') {
      title = 'Reschedule Verification'; icon = 'clock';
      const days = davNextDays(3);
      const slots = ['9:00 – 10:00 AM', '11:00 AM – 12:00 PM', '2:00 – 3:00 PM', '4:00 – 5:00 PM'];
      body = `
        <div class="dav-center" style="margin:4px 0 16px">${App.icon('clock', 'dav-pin')}</div>
        <h3 style="text-align:center;margin:0 0 4px">Pick a new date &amp; time</h3>
        <p class="muted" style="text-align:center;font-size:13px;margin:0 0 16px">We'll hold your verification slot — you can resume from where you left off.</p>
        <div class="field"><label class="label">Date</label>
          <div class="dav-daypick">
            ${days.map(d => `<button class="dav-day ${DAV.schedDate === d.iso ? 'is-active' : ''}" onclick="WorkerSettings.davSetSchedDate('${d.iso}')">
              <span class="dav-day__dow">${d.dow}</span><span class="dav-day__num">${d.num}</span><span class="dav-day__mon">${d.mon}</span>
            </button>`).join('')}
          </div>
        </div>
        <div class="field"><label class="label">Time slot</label>
          <div class="dav-slotgrid">
            ${slots.map(s => `<button class="dav-slot ${DAV.schedSlot === s ? 'is-active' : ''}" onclick="WorkerSettings.davSetSchedSlot('${s}')">${s}</button>`).join('')}
          </div>
        </div>
        <div class="dav-divider"><span>or pick a custom date &amp; time</span></div>
        <div class="grid grid-2" style="margin-bottom:0">
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Custom date</label>
            <input class="input" type="date" value="${DAV.customDate ? App.esc(DAV.customDate) : ''}" onchange="WorkerSettings.davSetCustomDate(this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Custom time</label>
            <input class="input" type="time" value="${DAV.customTime ? App.esc(DAV.customTime) : ''}" onchange="WorkerSettings.davSetCustomTime(this.value)"></div>
        </div>`;
      foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>
              <button class="btn btn--primary" ${!DAV.schedDate || !DAV.schedSlot ? 'disabled' : ''} onclick="WorkerSettings.davConfirmReschedule()">${App.icon('calendar')} Confirm slot</button>`;

    } else if (DAV.step === 'rescheduled') {
      title = 'Verification Scheduled'; icon = 'checkcircle';
      body = `<div class="banner banner--green" style="margin-bottom:4px">${App.icon('checkcircle')}<div><b>Verification scheduled</b><div style="font-size:12px;opacity:.85;margin-top:3px">We've held <b>${App.esc(w.scheduledFor)}</b> for this entry. Come back to Work Info anytime before then to start, or start right away below.</div></div></div>`;
      foot = `<button class="btn" onclick="App.modal.close()">Done, I'll come back later</button>
              <button class="btn btn--primary" onclick="WorkerSettings.davStart()">${App.icon('arrow')} Start now instead</button>`;

    } else if (DAV.step === 'addressType') {
      title = 'Verify Address'; icon = 'mappin';
      body = `
        <div class="dav-center" style="margin:4px 0 16px">${davBuilding()}</div>
        <h3 style="text-align:center;margin:0 0 4px">Select Address Type</h3>
        <p class="muted" style="text-align:center;font-size:13px;margin:0 0 16px">Choose the type of address to verify:</p>
        ${isFarmer
          ? `<button class="dav-choice" onclick="WorkerSettings.davSetAddressType('workarea')"><span class="dav-choice__ic">${App.icon('leaf')}</span><b>Work Area Address</b></button>`
          : `<button class="dav-choice" onclick="WorkerSettings.davSetAddressType('office')"><span class="dav-choice__ic">${App.icon('building')}</span><b>Office Address</b></button>`}
        <div class="banner banner--amber" style="margin-top:14px">${App.icon('alert')}<div>Kindly be physically available at the selected address.</div></div>`;
      foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>`;

    } else if (DAV.step === 'checklist') {
      title = 'Verify Address'; icon = 'shieldcheck';
      body = `
        <h3 style="margin:0 0 14px">What you need for verification</h3>
        <div class="dav-check"><span class="dav-check__ic">${App.icon('idcard')}</span><div><b>Valid ID</b><div class="muted" style="font-size:12.5px">Aadhaar, PAN, Passport, or Voter ID</div></div></div>
        <div class="dav-check"><span class="dav-check__ic">${App.icon('upload')}</span><div><b>Camera &amp; Light</b><div class="muted" style="font-size:12.5px">Good lighting and a stable connection for photo capture</div></div></div>
        ${isFarmer
          ? `<div class="dav-check"><span class="dav-check__ic">${App.icon('leaf')}</span><div><b>Work Area Access</b><div class="muted" style="font-size:12.5px">Be at the work area to capture its photo</div></div></div>`
          : `<div class="dav-check"><span class="dav-check__ic">${App.icon('idcard')}</span><div><b>Office ID Card (optional)</b><div class="muted" style="font-size:12.5px">Keep your company ID card ready, if available</div></div></div>`}
        <div class="banner banner--info" style="margin-top:14px">${App.icon('mappin')}<div>Upload clear photos of original documents. Blurry or edited photos will delay verification.</div></div>`;
      foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>
              <button class="btn btn--primary" onclick="WorkerSettings.davReady()">${App.icon('arrow')} Ready to Proceed</button>`;

    } else if (DAV.step === 'location' || DAV.step === 'locating') {
      const locating = DAV.step === 'locating';
      title = 'Verifying Location'; icon = 'mappin';
      body = `
        <div class="dav-center" style="margin:4px 0 16px">${App.icon('mappin', 'dav-pin')}</div>
        <h3 style="text-align:center;margin:0 0 4px">${locating ? 'Verifying Location' : 'Location Access'}</h3>
        <p class="muted" style="text-align:center;font-size:13px;margin:0 0 16px">${locating ? 'Please be within range of the target address' : "We need to verify your current location matches the address you're verifying"}</p>
        <div class="dav-kv">
          <div class="dav-kv__label">Target Address</div>
          <div class="dav-kv__val">${App.esc(w.address || '—')}, ${App.esc(w.loc || '—')}, ${App.esc(w.state || '—')}, ${App.esc(w.pincode || '—')}</div>
        </div>`;
      foot = `<button class="btn" ${locating ? 'disabled' : ''} onclick="App.modal.close()">Cancel</button>
              <button class="btn btn--primary" ${locating ? 'disabled' : ''} onclick="WorkerSettings.davEnableLocation()">${locating ? spinner('Matching your location…') : `${App.icon('mappin')} Enable Location`}</button>`;

    } else if (DAV.step === 'flow') {
      const FLOW = davFlow();
      const cs = FLOW[DAV.idx];
      const stepNum = DAV.idx + 1;
      const stepTotal = (DAV.idType && ID_BACK_REQUIRED[DAV.idType] === false) ? FLOW.length - 1 : FLOW.length;
      // include the context (Reception/Lobby/Workstation) in the header itself — otherwise
      // three consecutive "Office Interior" steps look identical and read like a glitch.
      title = cs.kind === 'idphoto' ? 'Government ID' : (cs.context ? `${cs.title} — ${cs.context}` : cs.title);
      icon = cs.kind === 'idphoto' ? 'idcard' : (cs.ic || 'building');

      {
        // photo (office name board / interior / office ID / farmer work area) or idphoto (govt ID front/back)
        const label = cs.kind === 'idphoto' ? `${DAV.idType || 'ID'} (${cs.side})` : (cs.context ? `${cs.title} (${cs.context})` : cs.title);
        const heading = cs.kind === 'idphoto' ? `Capture ${DAV.idType || 'ID'}` : cs.title;
        const backNotNeeded = cs.kind === 'idphoto' && cs.side === 'Front' && DAV.idType && ID_BACK_REQUIRED[DAV.idType] === false;
        const subline = cs.kind === 'idphoto'
          ? `Take a clear photo of the ${cs.side.toLowerCase()} of your ${DAV.idType || 'ID'}${backNotNeeded ? ' (front only — no back side needed)' : ''}`
          : cs.sub;
        // the ID-type picker lives on the Front capture screen so choosing it isn't its
        // own separate numbered step — it just gates the Capture action until answered.
        const needsIdType = cs.kind === 'idphoto' && cs.side === 'Front';
        const idTypePicker = needsIdType ? `
            <div class="field" style="margin-top:2px"><label class="label">ID Type</label>
              <select class="select" onchange="WorkerSettings.davSetIdType(this.value)">
                <option value="" ${!DAV.idType ? 'selected' : ''} disabled>Select ID type</option>
                ${ID_TYPES.map(t => `<option value="${t}" ${DAV.idType === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select></div>` : '';

        if (DAV.phase === 'ready') {
          body = `
            <div class="dav-progress">Step ${stepNum} of ${stepTotal}</div>
            <div class="dav-center" style="margin:4px 0 12px">${cs.kind === 'idphoto' ? App.icon('idcard', 'dav-illus') : davBuilding()}</div>
            <h3 style="text-align:center;margin:0 0 2px">${App.esc(heading)}</h3>
            ${cs.context ? `<p style="text-align:center;font-size:13px;font-weight:600;color:var(--accent-strong);margin:0 0 2px">(${App.esc(cs.context)})</p>` : ''}
            <p class="muted" style="text-align:center;font-size:13px;margin:0 0 16px">${App.esc(subline)}</p>
            ${idTypePicker}
            <div class="dav-check"><span class="dav-check__ic">${App.icon('upload')}</span><div><b>Photo Guidelines</b>
              <div class="muted" style="font-size:12.5px">Ensure good lighting &middot; keep the camera steady &middot; make sure ${cs.kind === 'idphoto' ? 'the ID is fully visible' : 'text/signage is readable'}</div></div></div>`;
          foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>
                  ${cs.skippable ? `<button class="btn btn--ghost" onclick="WorkerSettings.davSkipFlow()">Skip</button>` : ''}
                  <button class="btn btn--primary" ${needsIdType && !DAV.idType ? 'disabled' : ''} onclick="WorkerSettings.davOpenCamera()">${App.icon('upload')} Capture Photo</button>`;
        } else if (DAV.phase === 'camera' || DAV.phase === 'capturing') {
          const capturing = DAV.phase === 'capturing';
          const showVideo = !DAV.camError && !capturing;
          body = `
            <div class="dav-progress">Step ${stepNum} of ${stepTotal}</div>
            <div class="dav-cam dav-cam--live">
              <span class="dav-cam__rec">${App.icon('dot')} REC</span>
              ${showVideo
                ? `<video id="davVideo" class="dav-cam__video" autoplay playsinline muted></video>`
                : (capturing ? `<span class="dav-spin-lg"></span>` : (cs.kind === 'idphoto' ? `<span class="dav-cam__guide"></span>` : App.icon('upload', 'dav-cam__ic')))}
              ${cs.kind === 'idphoto' && showVideo ? `<span class="dav-cam__guide dav-cam__guide--overlay"></span>` : ''}
              ${showVideo ? `<button class="dav-shutter" onclick="WorkerSettings.davShootPhoto()" aria-label="Capture photo">${App.icon('camera')}</button>` : ''}
            </div>
            ${DAV.camError ? `<div class="banner banner--amber" style="margin-top:12px">${App.icon('alert')}<div>Camera unavailable — using a simulated capture for this demo.</div></div>` : ''}
            ${cs.kind === 'idphoto' ? `<div class="row between" style="margin-top:12px"><span style="font-size:13px">Vertical ${App.esc(DAV.idType || 'ID')}</span><span class="toggle"></span></div>` : ''}
            <p class="muted" style="text-align:center;font-size:12.5px;margin-top:10px">${capturing ? 'Capturing…' : `Line up ${cs.kind === 'idphoto' ? 'the document' : 'the shot'} and tap the shutter`}</p>`;
          foot = `<button class="btn" ${capturing ? 'disabled' : ''} onclick="WorkerSettings.davCancelCamera()">Cancel</button>
                  <button class="btn btn--primary" ${capturing ? 'disabled' : ''} onclick="WorkerSettings.davShootPhoto()">${capturing ? spinner('Capturing…') : `${App.icon('camera')} Capture ${App.esc(label)}`}</button>`;
        } else {
          body = `
            <div class="dav-progress">Step ${stepNum} of ${stepTotal}</div>
            <div class="dav-cam dav-cam--captured">${App.icon('checkcircle')}</div>
            <p style="text-align:center;font-size:13px;margin-top:12px"><b>${App.esc(label)} captured</b></p>
            <div class="dav-center"><button class="btn btn--ghost btn--sm" onclick="WorkerSettings.davRetake()">${App.icon('upload')} Retake</button></div>`;
          foot = `<button class="btn" onclick="App.modal.close()">Cancel</button>
                  <button class="btn btn--primary" onclick="WorkerSettings.davAdvanceFlow()">${App.icon('arrow')} Continue</button>`;
        }
      }

    } else {
      title = 'Verify Address'; icon = 'shieldcheck';
      const entryLabel = App.esc(w.role || 'This entry') + (w.org ? ' at ' + App.esc(w.org) : '');
      body = `<div class="banner banner--green" style="margin-bottom:4px">${App.icon('checkcircle')}<div><b>Address verified</b><div style="font-size:12px;opacity:.85;margin-top:3px">${entryLabel} is now verified via Digital Address Verification.</div></div></div>`;
      foot = `<button class="btn btn--primary" onclick="WorkerSettings.davNext()">${App.icon('check')} Done</button>`;
    }
    // onClose covers every dismiss path (✕, backdrop click, Cancel) so the camera stream
    // never keeps running after the modal disappears, even if a step's Cancel button just
    // calls App.modal.close() directly instead of a dedicated davCancelCamera().
    App.modal.open(body, { title, icon, foot, wide: DAV.step === 'flow' || DAV.step === 'checklist', onClose: stopDavCamera });
  }

  window.WorkerSettings = {
    setTab(t) { S.tab = t; App.reload(); },

    // silent syncers (no reload → text inputs keep focus while typing)
    editProfile(k, v) { S.profile[k] = v; },
    editWorkInfo(k, v) { S.workInfo[k] = v; },
    editWork(i, k, v) { if (S.work[i]) S.work[i][k] = v; },

    uploadPhoto() { App.toast('Photo upload is a demo affordance in this prototype', 'upload'); },

    save(section) {
      try {
        if (section === 'profile') localStorage.setItem('winWorkerProfile', JSON.stringify(Object.assign({}, S.profile, S.workInfo)));
        if (section === 'work') { localStorage.setItem('workExperience', JSON.stringify(S.work)); localStorage.setItem('winWorkInfo', JSON.stringify(S.workInfo)); }
        if (section === 'skills') localStorage.setItem('workerSkills', JSON.stringify(S.skills));
      } catch (e) {}

      if (section === 'work') {
        App.toast('Work experience saved to your portfolio');
      } else {
        App.toast(section === 'skills' ? 'Skills updated' : 'Profile saved');
      }
      S.saved[section] = true; App.reload();
      setTimeout(() => { S.saved[section] = false; if (App.state.route === 'worker-settings') App.reload(); }, 2000);
    },

    // ---- work experience ----
    addWork() {
      S.work.unshift({
        role: '', org: '', period: '', loc: '', address: '', state: '', pincode: '',
        sector: 'nongovt', relation: 'direct', source: '', pan: '', hasPan: '',
        altPath: '', altId: '',
        verifyStatus: 'unverified', tier: 'self', active: false,
      });
      entryModal(0);
    },
    editEntry(i) { entryModal(i); },
    closeEntryModal() { ENTRY_MODAL_I = null; App.modal.close(); App.reload(); },
    removeWork(i) {
      if (S.work.length <= 1) return;
      const wasActive = S.work[i] && S.work[i].active; S.work.splice(i, 1); if (wasActive && S.work[0]) S.work[0].active = true;
      if (ENTRY_MODAL_I === i) WorkerSettings.closeEntryModal(); else App.reload();
    },
    setCurrent(i, on) { if (on) S.work.forEach((w, j) => w.active = (j === i)); else if (S.work[i]) S.work[i].active = false; App.reload(); repaintEntryModal(i); },
    setSector(i, v) { const w = S.work[i]; if (!w) return; w.sector = v; w.source = ''; w.verifyStatus = 'unverified'; App.reload(); repaintEntryModal(i); },
    setRelation(i, v) {
      const w = S.work[i]; if (!w) return;
      w.relation = v; w.source = ''; w.pan = ''; w.hasPan = ''; w.altPath = ''; w.altId = ''; w.verifyStatus = 'unverified';
      App.reload(); repaintEntryModal(i);
    },
    setHasPan(i, v) {
      const w = S.work[i]; if (!w) return;
      w.hasPan = v; w.pan = ''; w.source = ''; w.verifyStatus = 'unverified';
      App.reload(); repaintEntryModal(i);
    },
    setOrgChoice(i, v) {
      const w = S.work[i]; if (!w) return;
      if (v === 'others') { w._orgCustom = true; w.org = ''; } else { w._orgCustom = false; w.org = v; w.altPath = ''; w.altId = ''; w.source = ''; w.verifyStatus = 'unverified'; }
      App.reload(); repaintEntryModal(i);
    },
    // fallback path when Company = "Others": UAN/PPF/NPS number, or DAV (direct/agency get
    // the choice; gig has only DAV, no picker — see entryFormBody()).
    setAltPath(i, v) {
      const w = S.work[i]; if (!w) return;
      w.altPath = v; w.altId = ''; w.source = ''; w.verifyStatus = 'unverified';
      App.reload(); repaintEntryModal(i);
    },

    // ---- verification: explicit "Verify Details" click per entry — happy-path only, per the
    // segmentation flowchart. When Company = "Others" (not in our HRMS lookup), direct/
    // agency entries offer a UAN/PPF/NPS fallback identifier or DAV; gig entries go
    // straight to DAV since there's no equivalent fallback identifier for platform work. ----
    verifyEntry(i) {
      const w = S.work[i]; if (!w) return;

      if (w.relation === 'informal') {
        if (!w.address || !w.state || !w.pincode) { App.toast('Fill in the address details to verify', 'alert'); return; }
        WorkerSettings.openDAV(i); return;
      }

      if (w.relation === 'self') {
        if (!w.org) { App.toast('Enter your business name to continue', 'alert'); return; }
        if (!w.hasPan) { App.toast('Let us know whether you have a PAN', 'alert'); return; }
        if (w.hasPan === 'yes') {
          if (!w.pan) { App.toast('Enter your PAN number to look up GST/Udyam details', 'alert'); return; }
          w.verifyStatus = 'pending'; App.reload(); repaintEntryModal(i);
          setTimeout(() => { w.source = 'pan-gst'; w.verifyStatus = 'verified'; w.tier = 'verified'; App.reload(); repaintEntryModal(i); App.toast('Details verified and saved'); }, 1400);
          return;
        }
        // no PAN — fall back to Digital Address Verification of the business address
        if (!w.address || !w.state || !w.pincode) { App.toast('Fill in the address details to verify', 'alert'); return; }
        WorkerSettings.openDAV(i); return;
      }

      if (w.relation === 'gig') {
        if (w._orgCustom) {
          // platform isn't in our lookup — no fallback identifier for gig work, so
          // straight to Digital Address Verification.
          if (!w.address || !w.state || !w.pincode) { App.toast('Fill in the address details to verify', 'alert'); return; }
          WorkerSettings.openDAV(i); return;
        }
        if (!w.org) { App.toast('Enter the platform/company name to verify', 'alert'); return; }
        w.verifyStatus = 'pending'; App.reload(); repaintEntryModal(i);
        setTimeout(() => { w.source = 'platform'; w.verifyStatus = 'verified'; w.tier = 'verified'; App.reload(); repaintEntryModal(i); App.toast('Details verified and saved'); }, 1400);
        return;
      }

      // direct (full-time), Company = "Others": fall back to a UAN/PPF/NPS identifier or
      // DAV. Contract Worker (agency) just types the agency name — see entryFormBody().
      if (w.relation === 'direct' && w._orgCustom) {
        if (!w.altPath) { App.toast('Choose how you\'d like to verify this entry', 'alert'); return; }
        if (w.altPath === 'dav') {
          if (!w.address || !w.state || !w.pincode) { App.toast('Fill in the address details to verify', 'alert'); return; }
          WorkerSettings.openDAV(i); return;
        }
        if (!w.altId) { App.toast('Enter your ' + (ALT_ID_META[w.altPath] || {}).label, 'alert'); return; }
        w.verifyStatus = 'pending'; App.reload(); repaintEntryModal(i);
        setTimeout(() => { w.source = w.altPath; w.verifyStatus = 'verified'; w.tier = 'verified'; App.reload(); repaintEntryModal(i); App.toast('Details verified and saved'); }, 1400);
        return;
      }

      // direct + agency: fetch by Company name (Contract Worker always via the agency's own
      // HRMS, for either sector — the agency is the employer of record, not the end client)
      if (!w.org) { App.toast('Enter the company name to verify', 'alert'); return; }
      w.verifyStatus = 'pending'; App.reload(); repaintEntryModal(i);
      setTimeout(() => {
        w.source = w.relation === 'agency' ? 'agency-hrms' : (w.sector === 'govt' ? 'hrms-govt' : 'hrms-nongovt');
        w.verifyStatus = 'verified'; w.tier = 'verified'; App.reload(); repaintEntryModal(i);
        App.toast('Details verified and saved');
      }, 1400);
    },
    openDAV(i) {
      const w = S.work[i];
      ENTRY_MODAL_I = null; DAV.step = 'consent'; DAV.i = i; DAV.flowKind = (w && w.relation === 'informal') ? 'farmer' : 'self';
      DAV.addressType = ''; DAV.idType = ''; DAV.idx = 0; DAV.phase = 'ready';
      davModal();
    },
    // resume a previously scheduled verification — consent and the Start/Reschedule
    // choice were already made, so jump straight to picking the address type.
    resumeScheduledDAV(i) {
      const w = S.work[i]; if (!w) return;
      ENTRY_MODAL_I = null; DAV.i = i; DAV.flowKind = (w.relation === 'informal') ? 'farmer' : 'self';
      DAV.addressType = ''; DAV.idType = ''; DAV.idx = 0; DAV.phase = 'ready';
      DAV.step = 'addressType'; davModal();
    },
    davToast(msg) { App.toast(msg, 'clock'); },
    davDecline() { stopDavCamera(); App.modal.close(); App.toast('Address verification declined', 'x'); },
    davAgree() { DAV.step = 'verifyState'; davModal(); },
    davOpenReschedule() { DAV.schedDate = ''; DAV.schedSlot = ''; DAV.customDate = ''; DAV.customTime = ''; DAV.step = 'reschedule'; davModal(); },
    davSetSchedDate(iso) { DAV.schedDate = iso; davModal(); },
    davSetSchedSlot(slot) { DAV.schedSlot = slot; davModal(); },
    davSetCustomDate(iso) {
      if (!iso) return;
      DAV.customDate = iso; DAV.schedDate = iso;
      // a custom date deselects whichever preset day-chip was active, if any
      davModal();
    },
    davSetCustomTime(hhmm) {
      if (!hhmm) return;
      DAV.customTime = hhmm; DAV.schedSlot = fmtTime12(hhmm);
      davModal();
    },
    davConfirmReschedule() {
      const w = S.work[DAV.i]; if (!w || !DAV.schedDate || !DAV.schedSlot) return;
      w.scheduledFor = fmtDavDate(DAV.schedDate) + ' · ' + DAV.schedSlot;
      w.verifyStatus = 'scheduled';
      DAV.step = 'rescheduled'; davModal(); App.reload();
    },
    davStart() { DAV.step = 'addressType'; davModal(); },
    davSetAddressType(t) { DAV.addressType = t; DAV.step = 'checklist'; davModal(); },
    davReady() { DAV.step = 'location'; davModal(); },
    davEnableLocation() {
      DAV.step = 'locating'; davModal();
      setTimeout(() => { DAV.step = 'flow'; DAV.idx = 0; DAV.phase = 'ready'; davModal(); }, 1600);
    },
    davSetIdType(t) { DAV.idType = t; davModal(); },
    davOpenCamera() { DAV.phase = 'camera'; DAV.camError = false; davModal(); startDavCamera(); },
    davCancelCamera() { stopDavCamera(); App.modal.close(); },
    davShootPhoto() {
      stopDavCamera();
      DAV.phase = 'capturing'; davModal();
      setTimeout(() => { DAV.phase = 'captured'; davModal(); }, 900);
    },
    davRetake() { DAV.phase = 'camera'; DAV.camError = false; davModal(); startDavCamera(); },
    davSkipFlow() { stopDavCamera(); WorkerSettings.davAdvanceFlow(); },
    davAdvanceFlow() {
      stopDavCamera();
      const FLOW = davFlow();
      const cs = FLOW[DAV.idx];
      DAV.idx++;
      // the Back capture right after Front is skipped entirely when the chosen ID type has
      // no meaningful reverse side (e.g. a PAN card, or a passport's bio page).
      if (cs && cs.kind === 'idphoto' && cs.side === 'Front' && ID_BACK_REQUIRED[DAV.idType] === false) DAV.idx++;
      DAV.phase = 'ready';
      if (DAV.idx >= FLOW.length) {
        const w = S.work[DAV.i];
        if (w) { w.source = 'dav'; w.verifyStatus = 'verified'; w.tier = 'verified'; }
        DAV.step = 'done'; davModal(); App.reload();
      } else {
        davModal();
      }
    },
    davNext() {
      App.modal.close();
      if (DAV.queue.length) { const next = DAV.queue.shift(); WorkerSettings.openDAV(next); }
      else { App.toast('Details verified and saved'); App.reload(); }
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

  // per-entry verification status chip
  function verifyChip(w) {
    if (w.verifyStatus === 'verified') {
      const src = SOURCE_META[w.source] || { label: 'Self Declared' };
      return `<span class="verified" style="font-size:11.5px">${App.icon('shieldcheck')} Verified via ${App.esc(src.label)}</span>`;
    }
    if (w.verifyStatus === 'pending') return `<span class="pill pill--blue pill--dot">${spinner('Verifying…')}</span>`;
    if (w.verifyStatus === 'scheduled') return `<span class="pill pill--amber pill--dot">${App.icon('clock')} Scheduled for ${App.esc(w.scheduledFor)}</span>`;
    return App.ui.pill('Not yet verified', 'gray', true);
  }

  // true when this entry's current path resolves to Digital Address Verification —
  // either inherently (informal, self with no PAN, gig with an unrecognised platform,
  // direct with an unrecognised employer and DAV chosen) or because it already has been (source).
  function needsDavPath(w) {
    return w.relation === 'informal' || (w.relation === 'self' && w.hasPan === 'no')
      || (w.relation === 'gig' && w._orgCustom)
      || (w.relation === 'direct' && w._orgCustom && w.altPath === 'dav')
      || w.source === 'dav';
  }

  // Address/State/Pincode — City is already collected as a general field above, so DAV
  // only needs these three. Shown when the entry's path requires (or has fallen back to) DAV.
  function addressBlock(w, i) {
    const needsDav = needsDavPath(w);
    if (!needsDav) return '';
    return `
      <div class="label" style="margin-top:14px;margin-bottom:2px">Work Address</div>
      <div class="hint" style="margin-bottom:8px">Required to verify this entry via Digital Address Verification.</div>
      <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Address</label>
        <input class="input" value="${App.esc(w.address)}" placeholder="Street / site address" oninput="WorkerSettings.editWork(${i},'address',this.value)"></div>
      <div class="grid grid-2" style="margin-top:12px">
        <div class="field" style="margin-bottom:0"><label class="label wset-flabel">State</label>
          <input class="input" value="${App.esc(w.state)}" placeholder="e.g. Haryana" oninput="WorkerSettings.editWork(${i},'state',this.value)"></div>
        <div class="field" style="margin-bottom:0"><label class="label wset-flabel">Pincode</label>
          <input class="input mono" value="${App.esc(w.pincode)}" placeholder="e.g. 122002" oninput="WorkerSettings.editWork(${i},'pincode',this.value)"></div>
      </div>`;
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

  // full editable form for one work entry — used inside the Add/Edit Entry modal.
  // Sector + Employment Relationship come first since they determine which other
  // fields are relevant (e.g. Company is optional for a farmer/other informal worker).
  function entryFormBody(w, i) {
    const single = S.work.length <= 1;
    const isInformal = w.relation === 'informal';
    const isSelf = w.relation === 'self';
    // farmers and self-employed workers have no formal employer to pick from a list —
    // free text only, no company dropdown.
    const companyLabel = isInformal ? 'Company / Landowner (optional)' : isSelf ? 'Business Name' : 'Company';
    const companyPlaceholder = isInformal ? 'e.g. Family farmland (optional)' : isSelf ? 'e.g. Rajan Masonry Works' : 'e.g. Omaxe Ltd.';
    return `
      <div class="grid grid-2">
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

      <div class="grid grid-2" style="margin-top:12px">
        <div class="field" style="margin-bottom:0">
          <label class="label wset-flabel">Role / Title</label>
          <input class="input" value="${App.esc(w.role)}" placeholder="e.g. Construction Supervisor" oninput="WorkerSettings.editWork(${i},'role',this.value)">
        </div>
        <div class="field" style="margin-bottom:0">
          <label class="label wset-flabel">Period</label>
          <input class="input" value="${App.esc(w.period)}" placeholder="e.g. Mar 2023 - Present" oninput="WorkerSettings.editWork(${i},'period',this.value)">
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:12px">
        <div class="field" style="margin-bottom:0">
          <label class="label wset-flabel">${companyLabel}</label>
          ${isInformal || isSelf ? `
          <input class="input" value="${App.esc(w.org)}" placeholder="${companyPlaceholder}" oninput="WorkerSettings.editWork(${i},'org',this.value)">` : `
          <select class="select" onchange="WorkerSettings.setOrgChoice(${i},this.value)">
            <option value="" ${!w.org ? 'selected' : ''} disabled>Select company</option>
            ${KNOWN_COMPANIES.map(c => `<option value="${App.esc(c)}" ${w.org === c && !w._orgCustom ? 'selected' : ''}>${App.esc(c)}</option>`).join('')}
            <option value="others" ${w._orgCustom || (w.org && !KNOWN_COMPANIES.includes(w.org)) ? 'selected' : ''}>Others (type company name)</option>
          </select>
          ${w._orgCustom || (w.org && !KNOWN_COMPANIES.includes(w.org)) ? `
          <input class="input mt-8" value="${App.esc(w.org)}" placeholder="Type your company name" oninput="WorkerSettings.editWork(${i},'org',this.value)">` : ''}`}
        </div>
        <div class="field" style="margin-bottom:0">
          <label class="label wset-flabel">City</label>
          <input class="input" value="${App.esc(w.loc)}" placeholder="e.g. Delhi" oninput="WorkerSettings.editWork(${i},'loc',this.value)">
        </div>
      </div>

      ${w.relation === 'self' ? `
      <div class="field" style="margin-top:14px;margin-bottom:0">
        <label class="label wset-flabel">Do you have a PAN?</label>
        <div class="row gap-8">
          <button class="btn btn--sm ${w.hasPan === 'yes' ? 'btn--primary' : ''}" onclick="WorkerSettings.setHasPan(${i},'yes')">Yes</button>
          <button class="btn btn--sm ${w.hasPan === 'no' ? 'btn--primary' : ''}" onclick="WorkerSettings.setHasPan(${i},'no')">No</button>
        </div>
      </div>
      ${w.hasPan === 'yes' ? `
      <div class="field" style="margin-top:12px;margin-bottom:0">
        <label class="label wset-flabel">PAN Number</label>
        <input class="input mono" value="${App.esc(w.pan)}" placeholder="e.g. ABCPK1234F" oninput="WorkerSettings.editWork(${i},'pan',this.value)">
        <div class="hint" style="margin-top:5px">We'll look up any GST/Udyam registration linked to this PAN.</div>
      </div>` : ''}
      ${w.hasPan === 'no' ? `<div class="hint" style="margin-top:8px">No PAN — we'll verify this entry via Digital Address Verification instead.</div>` : ''}` : ''}

      ${w.relation === 'direct' && w._orgCustom ? `
      <div class="field" style="margin-top:14px;margin-bottom:0">
        <label class="label wset-flabel">Company isn't in our records — how would you like to verify this entry?</label>
        <div class="row gap-8 wrap">
          <button class="btn btn--sm ${w.altPath === 'uan' ? 'btn--primary' : ''}" onclick="WorkerSettings.setAltPath(${i},'uan')">UAN</button>
          <button class="btn btn--sm ${w.altPath === 'ppf' ? 'btn--primary' : ''}" onclick="WorkerSettings.setAltPath(${i},'ppf')">PPF</button>
          <button class="btn btn--sm ${w.altPath === 'nps' ? 'btn--primary' : ''}" onclick="WorkerSettings.setAltPath(${i},'nps')">NPS</button>
          <button class="btn btn--sm ${w.altPath === 'dav' ? 'btn--primary' : ''}" onclick="WorkerSettings.setAltPath(${i},'dav')">${App.icon('mappin')} Verify via Address</button>
        </div>
      </div>
      ${w.altPath && w.altPath !== 'dav' ? `
      <div class="field" style="margin-top:12px;margin-bottom:0">
        <label class="label wset-flabel">${App.esc(ALT_ID_META[w.altPath].label)}</label>
        <input class="input mono" value="${App.esc(w.altId)}" placeholder="${App.esc(ALT_ID_META[w.altPath].placeholder)}" oninput="WorkerSettings.editWork(${i},'altId',this.value)">
      </div>` : ''}
      ${w.altPath === 'dav' ? `<div class="hint" style="margin-top:8px">We'll verify this entry via Digital Address Verification instead.</div>` : ''}` : ''}

      ${w.relation === 'gig' && w._orgCustom ? `
      <div class="hint" style="margin-top:14px">Platform isn't in our records — we'll verify this entry via Digital Address Verification instead.</div>` : ''}

      ${addressBlock(w, i)}

      <div class="row between" style="margin-top:13px;padding-top:12px;border-top:1px solid var(--line-2)">
        <label class="wset-check"><input type="checkbox" ${w.active ? 'checked' : ''} onchange="WorkerSettings.setCurrent(${i},this.checked)"> Current position</label>
        <button class="wset-trash" ${single ? 'disabled' : ''} onclick="WorkerSettings.removeWork(${i})" title="${single ? 'At least one entry is required' : 'Remove this entry'}">${App.icon('trash')} Remove</button>
      </div>
      <div class="row between" style="margin-top:11px">
        ${verifyChip(w)}
        ${w.verifyStatus !== 'verified' ? `<button class="btn btn--primary btn--sm" ${w.verifyStatus === 'pending' ? 'disabled' : ''} onclick="${w.verifyStatus === 'scheduled' ? `WorkerSettings.resumeScheduledDAV(${i})` : `WorkerSettings.verifyEntry(${i})`}">${w.verifyStatus === 'pending' ? spinner('Verifying…') : w.verifyStatus === 'scheduled' ? `${App.icon('arrow')} Start Now` : (needsDavPath(w) ? `${App.icon('mappin')} Verify via Address` : `${App.icon('shieldcheck')} Verify Details`)}</button>` : ''}
      </div>`;
  }

  // the Add/Edit Entry modal — repainted in place after any state change while it's open
  let ENTRY_MODAL_I = null;
  function entryModal(i) {
    const w = S.work[i]; if (!w) return;
    ENTRY_MODAL_I = i;
    App.modal.open(entryFormBody(w, i), {
      title: w.role ? w.role : 'Add Work Entry', icon: 'briefcase', wide: true,
    });
  }
  function repaintEntryModal(i) { if (ENTRY_MODAL_I === i) entryModal(i); }

  function workTab() {
    const govRows = GOVIDS.map(g => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="wset-idbadge" style="background:${g.color}">${App.esc(g.short)}</span>
        <div class="grow"><b style="font-size:13.5px">${App.esc(g.name)}</b><div class="mono muted" style="font-size:12px;margin-top:1px">${App.esc(g.sub)}</div></div>
        ${App.ui.pill('Verified', 'green', true)}
      </div>`).join('');

    const single = S.work.length <= 1;
    const expCards = S.work.map((w, i) => `
      <div class="wset-exp-row">
        <span class="wset-grip" title="Drag to reorder (demo)">${grip}</span>
        <div class="grow" style="min-width:0">
          <div class="row gap-8 wrap">
            <b style="font-size:13.5px">${App.esc(w.role || 'Untitled role')}</b>
            ${w.active ? App.ui.pill('Current', 'green', true) : ''}
          </div>
          <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(w.org || 'Company')} · ${App.esc(w.period || 'Period')} · ${App.esc(w.loc || 'City')}</div>
          <div style="margin-top:6px">${verifyChip(w)}</div>
        </div>
        <button class="iconbtn" title="Edit entry" onclick="WorkerSettings.editEntry(${i})">${App.icon('edit')}</button>
        <button class="wset-trash" ${single ? 'disabled' : ''} onclick="WorkerSettings.removeWork(${i})" title="${single ? 'At least one entry is required' : 'Remove this entry'}">${App.icon('trash')}</button>
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
          ${S.work.length ? expCards : App.ui.empty('briefcase', 'No work experience yet', 'Click Add Entry to add your first role — it will be reflected on your portfolio once verified.')}
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
      // keyed on winId (or 'demo') rather than a one-shot boolean, so switching between a
      // fresh worker and the demo persona within the same session re-initializes instead of
      // leaking one identity's work history into the other (same pattern as worker-cv.js).
      const initKey = (u && u.winId) || 'demo';
      if (S._initFor !== initKey) {
        S._initFor = initKey;
        if (u._fresh) {
          // a freshly signed-up worker has no work history yet — nothing here should be
          // auto-filled with the Rajan demo persona's entries.
          S.work = [];
          S.workInfo = { role: '', exp: '' };
        } else {
          S.work = JSON.parse(JSON.stringify(DEMO_WORK_SNAPSHOT));
          S.workInfo = JSON.parse(JSON.stringify(DEMO_WORK_INFO_SNAPSHOT));
        }
      }

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
          .wset-exp-row{ display:flex; align-items:flex-start; gap:11px; border:1px solid var(--line); border-radius:var(--r); padding:13px 14px; background:var(--surface-2); }
          .wset-exp-row + .wset-exp-row{ margin-top:10px; }
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
          .dav-center{ display:flex; justify-content:center; align-items:center; }
          .dav-daypick{ display:flex; gap:8px; }
          .dav-day{ flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; padding:10px 6px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:.12s; }
          .dav-day:hover{ border-color:var(--accent); }
          .dav-day.is-active{ border-color:var(--accent); background:var(--accent-weak); box-shadow:0 0 0 2px var(--accent-ring); }
          .dav-day__dow{ font-size:10.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; }
          .dav-day__num{ font-size:17px; font-weight:700; color:var(--ink); }
          .dav-day__mon{ font-size:10.5px; color:var(--muted); }
          .dav-slotgrid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
          .dav-slot{ padding:9px 10px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); font-size:12.5px; font-weight:600; cursor:pointer; transition:.12s; }
          .dav-slot:hover{ border-color:var(--accent); }
          .dav-slot.is-active{ border-color:var(--accent); background:var(--accent-weak); color:var(--accent-strong); }
          .dav-divider{ display:flex; align-items:center; gap:10px; margin:14px 0; color:var(--faint); font-size:11.5px; text-transform:uppercase; letter-spacing:.04em; }
          .dav-divider::before, .dav-divider::after{ content:""; flex:1; height:1px; background:var(--line-2); }
          .dav-kv{ display:flex; flex-direction:column; gap:10px; font-size:13.5px; }
          .dav-shield{ width:56px; height:56px; color:var(--accent); }
          .dav-pin{ width:44px; height:44px; color:var(--accent); }
          .dav-check{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line-2); }
          .dav-check:last-child{ border-bottom:none; }
          .dav-check__ic{ width:34px; height:34px; border-radius:9px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; flex-shrink:0; }
          .dav-illus{ width:64px; height:64px; color:var(--accent); }
          .dav-choice{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:13px 15px; margin-top:10px;
            border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; font-size:13.5px; transition:.12s; }
          .dav-choice:first-of-type{ margin-top:0; }
          .dav-choice:hover{ border-color:var(--accent); background:var(--accent-weak); }
          .dav-choice.is-active{ border-color:var(--green-100); background:var(--green-50); }
          .dav-choice[disabled]{ opacity:.45; cursor:not-allowed; }
          .dav-choice[disabled]:hover{ border-color:var(--line); background:var(--surface); }
          .dav-choice__ic{ width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:var(--accent-weak); color:var(--accent-strong); flex-shrink:0; }
          .dav-progress{ font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); text-align:center; margin-bottom:14px; }
          .dav-kv__label{ font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
          .dav-kv__val{ font-size:13.5px; font-weight:600; line-height:1.5; }
          .dav-cam{ width:100%; aspect-ratio:1/1; max-height:200px; border-radius:var(--r); display:grid; place-items:center; margin:0 auto; position:relative; }
          .dav-cam--live{ background:linear-gradient(160deg,#2a3444,#12151d); color:#fff; }
          .dav-cam__ic{ width:44px; height:44px; opacity:.55; }
          .dav-cam__rec{ position:absolute; top:10px; left:10px; display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; letter-spacing:.04em; color:#ff6b6b; }
          .dav-cam__rec .ico{ width:8px; height:8px; color:#ff3b3b; animation:dav-blink 1.2s ease-in-out infinite; }
          @keyframes dav-blink{ 50%{ opacity:.25; } }
          .dav-cam__guide{ width:62%; height:62%; border:2px solid #ffd54a; border-radius:6px; }
          .dav-cam__guide--overlay{ position:absolute; pointer-events:none; }
          .dav-cam__video{ width:100%; height:100%; object-fit:cover; border-radius:var(--r); background:#000; }
          .dav-shutter{ position:absolute; bottom:12px; left:50%; transform:translateX(-50%); width:52px; height:52px; border-radius:50%;
            background:#fff; color:#12151d; display:grid; place-items:center; border:3px solid rgba(255,255,255,.6); cursor:pointer; transition:.12s; }
          .dav-shutter:hover{ transform:translateX(-50%) scale(1.06); }
          .dav-shutter .ico{ width:22px; height:22px; }
          .dav-cam--captured{ background:var(--green-50); color:var(--green-600); }
          .dav-cam--captured .ico{ width:52px; height:52px; }
          .dav-spin-lg{ width:36px; height:36px; border:3px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; display:inline-block; animation:spin 1s linear infinite; }
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
