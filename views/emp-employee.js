/* Employer · Employee Verification detail — one worker's India-Stack "golden
   record" for a verifier. v2 editorial: hero band (eyebrow + gradient name +
   trust-score ring), per-field credential reveal, an animated live
   source-verification checklist (EPFO/UAN · Income-Tax · ESIC · DigiLocker)
   with a Re-verify flow that steps each source in real time before toasting,
   EPFO-verified employment & income, and verification progress.
   Reached from the Employees list; defaults to Arjun Gupta · EMP001245.
   Handles both a professional (Arjun Gupta) and a gig worker (Deepak Lal). */
(function () {
  const esc = App.esc;
  const ic = App.icon;
  const pill = App.ui.pill;
  const money = n => '₹' + App.num(n);

  /* ---------------- records ---------------- */
  function pro() {
    return {
      kind: 'pro', id: 'EMP001245', name: 'Arjun Gupta', panName: 'Arjun Gupta',
      subtitle: 'Senior Software Engineer · Wayne Enterprises',
      location: 'Mumbai, Maharashtra', exp: '9 Years experience',
      winId: 'WIN-2024-4471-1245', score: 96,
      jobs: [
        { role: 'Senior Software Engineer', co: 'Wayne Enterprises', dur: 'Jan 2022 – Present', loc: 'Mumbai, India', ctc: '₹28L → ₹42L', active: true },
        { role: 'Software Engineer',        co: 'Stark Industries',  dur: 'Jun 2019 – Dec 2021', loc: 'Bangalore, India', ctc: '₹14L → ₹26L' },
        { role: 'Junior Developer',         co: 'Oscorp Technologies', dur: 'Jul 2017 – May 2019', loc: 'Pune, India', ctc: '₹6L → ₹12L' },
      ],
      status: [
        ['PAN–Aadhaar Link', 'Verified'], ['UPI Status', 'Active'],
        ['EPFO Match', 'Verified'], ['Employment', '3 Jobs Verified'],
      ],
      sources: [
        { ic: 'landmark', c: '#2f5fd0', label: 'EPFO / UAN', sub: 'UAN 100•••••5678 · 3 employment records matched at source', status: 'Verified', kind: 'green', when: 'just now',
          matched: [['UAN', '1001 •••• 5678'], ['Employers matched', '3'], ['Latest establishment', 'Wayne Enterprises'], ['Last contribution', 'May 2026']] },
        { ic: 'file', c: '#6b4fc7', label: 'Income Tax Dept', sub: 'PAN TARTAN6732J active · ITR filed for AY 2025–26 · 26AS matched', status: 'Verified', kind: 'green', when: '2 min ago',
          matched: [['PAN', 'TARTAN6732J'], ['PAN status', 'Active'], ['ITR (AY 2025–26)', 'Filed'], ['Form 26AS', 'Income matched']] },
        { ic: 'shieldcheck', c: '#0e9f6e', label: 'ESIC', sub: 'Insured Person active · contributions current', status: 'Active', kind: 'green', when: '11 min ago',
          matched: [['IP Number', '31•••••••42'], ['Status', 'Insured Person — Active'], ['Contribution', 'Current']] },
        { ic: 'idcard', c: '#2b3990', label: 'DigiLocker', sub: 'Aadhaar e-KYC & PAN fetched from issuer with consent', status: 'Linked', kind: 'blue', when: '1 hr ago',
          matched: [['Aadhaar e-KYC', 'Fetched with consent'], ['PAN', 'Fetched from issuer'], ['Consent artifact', 'DPDP-logged']] },
      ],
    };
  }

  function gig() {
    return {
      kind: 'gig', id: 'GIG001', name: 'Deepak Lal',
      subtitle: 'Gig Worker · Amazon, Uber & Zomato',
      location: 'Bengaluru, Karnataka', exp: '6 Years experience',
      winId: 'GIG001', score: 94,
      gids: [
        { label: 'MNREGA Job Card',            id: 'MH-2018-001234', c: '#0e9f6e', ic: 'idcard' },
        { label: 'Samadhan Grievance ID',      id: 'SMDN-2020-5678', c: '#2f5fd0', ic: 'message' },
        { label: 'e-NAM Trader ID',            id: 'ENAM-2019-9012', c: '#c07d10', ic: 'briefcase' },
        { label: 'Apprentice Registration ID', id: 'APR-2017-3456',  c: '#6b4fc7', ic: 'award' },
      ],
      income: {
        amazon: [
          { m: 'Oct 2021', h: 200, inc: 40000, perk: 5000, net: 50000 },
          { m: 'Nov 2021', h: 200, inc: 40000, perk: 5000, net: 50000 },
          { m: 'Dec 2021', h: 200, inc: 40000, perk: 5000, net: 50000 },
        ],
        uber: [
          { m: 'Oct 2021', h: 180, inc: 30000, perk: 3000, net: 37000 },
          { m: 'Nov 2021', h: 180, inc: 30000, perk: 3000, net: 37000 },
          { m: 'Dec 2021', h: 180, inc: 30000, perk: 3000, net: 37000 },
        ],
      },
      platforms: [
        { name: 'Amazon', id: 'AMZN-DL-2018-001', joined: '24 Jan 2018', active: true },
        { name: 'Uber',   id: 'UBER-BLR-2019-456', joined: '15 Mar 2019', active: true },
        { name: 'Swiggy', id: 'SWGY-2017-789',     joined: '10 Sep 2017', active: false },
        { name: 'Zomato', id: 'ZMT-BLR-2020-234',  joined: '05 Feb 2020', active: true },
      ],
      status: [
        ['PAN–Aadhaar Link', 'Verified'], ['UAN Status', 'Active'],
        ['EPFO Match', 'Verified'], ['Platforms', '3 Active'],
      ],
      sources: [
        { ic: 'landmark', c: '#2f5fd0', label: 'EPFO / UAN', sub: 'UAN 1001 •••• 6789 linked · gig-platform contributions tracked', status: 'Verified', kind: 'green', when: 'just now',
          matched: [['UAN', '1001 •••• 6789'], ['Platforms tracked', '3'], ['Last contribution', 'Apr 2026']] },
        { ic: 'file', c: '#6b4fc7', label: 'Income Tax Dept', sub: 'PAN FHGO44512D active · 26AS income cross-checked', status: 'Verified', kind: 'green', when: '4 min ago',
          matched: [['PAN', 'FHGO44512D'], ['PAN status', 'Active'], ['Form 26AS', 'Income cross-checked']] },
        { ic: 'shieldcheck', c: '#0e9f6e', label: 'ESIC', sub: 'e-Shram + ESIC gig-worker cover active', status: 'Active', kind: 'green', when: '20 min ago',
          matched: [['e-Shram UAN', 'Linked'], ['Gig-worker cover', 'Active']] },
        { ic: 'idcard', c: '#2b3990', label: 'DigiLocker', sub: 'Driving Licence & Aadhaar fetched from issuer with consent', status: 'Linked', kind: 'blue', when: '1 hr ago',
          matched: [['Driving Licence', 'Fetched with consent'], ['Aadhaar', 'Fetched from issuer']] },
      ],
    };
  }

  /* the three-step India-Stack verification funnel (shared) */
  const STEPS = [
    { t: 'Identity Verification', s: 'PAN & Aadhaar verified' },
    { t: 'Employment Check',      s: 'EPFO records matched at source' },
    { t: 'Banking Verification',  s: 'UPI IDs & bank account validated' },
  ];

  /* names of the other roster rows so the header matches whatever was clicked */
  const ROSTER = {
    EMP001245: 'Arjun Gupta', EMP001246: 'Sam Bissell', EMP001247: 'Aditya Srivastava',
    EMP001248: 'Priya Sharma', EMP001249: 'Pradeesh Kumar',
    GIG001: 'Deepak Lal', GIG002: 'Raj Mehta',
  };

  function recFor(ctx) {
    const p = (ctx && ctx.params) || {};
    const isGig = p.type === 'gig' || /^GIG/i.test(p.id || '');
    const r = isGig ? gig() : pro();
    if (p.id) {
      r.id = p.id;
      const nm = ROSTER[p.id];
      if (nm) { r.name = nm; r.panName = nm; }
      if (isGig) r.winId = p.id;
    }
    return r;
  }

  /* ---------------- controller ---------------- */
  const EE = {
    _id: null, _name: '', _srcs: [], _painted: false, _reverifying: false,
    reverifiedFor: null,
    revealed: new Set(), allRevealed: false, incomeTab: 'amazon',

    sync(rec) {
      if (EE._id !== rec.id) {
        EE._id = rec.id;
        EE.revealed = new Set(); EE.allRevealed = false; EE.incomeTab = 'amazon';
        EE._painted = false; EE.reverifiedFor = null; EE._reverifying = false;
      }
      EE._name = rec.name; EE._srcs = rec.sources;
    },
    painted() { EE._painted = true; },
    rv() { return EE._painted ? '' : ' reveal'; },
    whenFor(s) { return EE.reverifiedFor === EE._id ? 'just now' : s.when; },

    /* ---- per-field credential reveal ---- */
    shown(key) { return EE.allRevealed || EE.revealed.has(key); },
    reveal(key) { if (EE.revealed.has(key)) EE.revealed.delete(key); else EE.revealed.add(key); App.reload(); },
    toggleAll() { EE.allRevealed = !EE.allRevealed; if (!EE.allRevealed) EE.revealed = new Set(); App.reload(); },
    setIncomeTab(t) { EE.incomeTab = t; App.reload(); },

    copy(text) { try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) {} App.toast('Copied ' + text, 'copy'); },

    /* ---- source match detail ---- */
    srcDetail(i) {
      const s = EE._srcs[i]; if (!s) return;
      const rows = (s.matched || []).map(([l, v]) =>
        `<div class="ee-fld"><div class="ee-fld__lbl">${esc(l)}</div><div class="ee-fld__val mono"><span class="grow">${esc(v)}</span></div></div>`).join('');
      const body = `<div class="banner banner--info" style="margin-bottom:16px">${ic(s.ic)}<div>Live match returned by <b>${esc(s.label)}</b>. ${esc(s.sub)}</div></div>
        <div class="ee-flds">${rows}</div>
        <div class="row gap-8 mt-16" style="align-items:center">${pill(s.status, s.kind, true)}<span class="muted" style="font-size:12px">Last checked ${esc(EE.whenFor(s))} · logged under the DPDP Act, 2023</span></div>`;
      App.modal.open(body, { title: s.label + ' · match details', icon: 'shieldcheck' });
    },

    /* ---- re-verify: modal → animated checklist → toast ---- */
    reverify() {
      const rows = EE._srcs.map((s, i) =>
        `<label class="ee-cbrow"><input type="checkbox" checked data-src="${i}"><span class="ee-cbic" style="color:${s.c}">${ic(s.ic)}</span><span class="grow">${esc(s.label)}</span>${pill(s.status, s.kind)}</label>`).join('');
      const body = `<div class="banner banner--accent" style="margin-bottom:16px">${ic('shieldcheck')}<div>Re-run live verification for <b>${esc(EE._name)}</b> against the selected India-Stack sources. Fresh results replace the current record.</div></div><div class="ee-cblist">${rows}</div>`;
      const foot = `<button class="btn" onclick="App.modal.close()">Cancel</button><button class="btn btn--accent" data-reverify-btn onclick="EmpEmployee.runReverify()">${ic('shieldcheck')} Run re-verification</button>`;
      App.modal.open(body, { title: 'Re-verify employee', icon: 'shieldcheck', foot });
    },
    runReverify() {
      let list = [];
      try { list = Array.prototype.slice.call(document.querySelectorAll('.ee-cbrow input:checked')).map(x => +x.dataset.src).filter(n => !isNaN(n)); } catch (e) {}
      App.modal.close();
      if (!list.length) list = EE._srcs.map((_, i) => i);
      EE._reverifying = true;
      Array.prototype.forEach.call(document.querySelectorAll('[data-reverify-btn]'), b => { b.disabled = true; });
      const cardEl = document.getElementById('ee-srccard');
      if (cardEl && cardEl.scrollIntoView) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      let k = 0;
      const tick = () => {
        if (k >= list.length) {
          EE._reverifying = false; EE.reverifiedFor = EE._id;
          const chip = document.getElementById('ee-lastverified');
          if (chip) chip.innerHTML = `${ic('checkcircle')} Re-verified just now`;
          Array.prototype.forEach.call(document.querySelectorAll('[data-reverify-btn]'), b => { b.disabled = false; });
          App.toast(list.length + ' source' + (list.length > 1 ? 's' : '') + ' re-verified for ' + EE._name + ' · just now', 'shieldcheck');
          return;
        }
        const i = list[k];
        EE._setChecking(i);
        setTimeout(() => { EE._setDone(i); k++; tick(); }, 560);
      };
      setTimeout(tick, 260);
    },
    _setChecking(i) {
      const row = document.getElementById('ee-src-' + i); if (row) { row.classList.remove('is-done'); row.classList.add('is-checking'); }
      const badge = document.getElementById('ee-srcbadge-' + i); if (badge) badge.innerHTML = `<span class="pill pill--amber pill--dot">Re-verifying…</span>`;
      const when = document.getElementById('ee-srcwhen-' + i); if (when) { when.classList.add('is-checking'); when.innerHTML = `<span class="ee-spin"></span><span>contacting source…</span>`; }
    },
    _setDone(i) {
      const s = EE._srcs[i] || {};
      const row = document.getElementById('ee-src-' + i); if (row) { row.classList.remove('is-checking'); row.classList.add('is-done'); }
      const badge = document.getElementById('ee-srcbadge-' + i); if (badge) badge.innerHTML = pill(s.status || 'Verified', s.kind || 'green', true);
      const when = document.getElementById('ee-srcwhen-' + i); if (when) { when.classList.remove('is-checking'); when.innerHTML = `${ic('checkcircle')}<span>just now</span>`; }
    },

    /* ---- download report ---- */
    download() {
      const fmt = f => `<button class="ee-fmt" onclick="EmpEmployee.dl('${f}')"><div class="ee-fmt__ic">${ic('file')}</div><b>${f}</b><span>.${f.toLowerCase()}</span></button>`;
      App.modal.open(`<p class="muted" style="margin-bottom:16px;font-size:13.5px">Export the full verification report for <b style="color:var(--ink)">${esc(EE._name)}</b>. Choose a format:</p><div class="ee-fmts">${fmt('PDF')}${fmt('Excel')}${fmt('CSV')}</div>`, { title: 'Download verification report', icon: 'download' });
    },
    dl(f) { App.modal.close(); App.toast(f + ' report for ' + EE._name + ' is being generated…', 'download'); },
  };
  window.EmpEmployee = EE;

  /* ---------------- render helpers ---------------- */
  function card(title, icon, body, right, id) {
    return `<div class="card${EE.rv()}"${id ? ` id="${id}"` : ''} style="margin-bottom:20px">
      <div class="card__head">${ic(icon)}<h3 class="grow">${esc(title)}</h3>${right || ''}</div>
      <div class="card__body">${body}</div>
    </div>`;
  }

  // fld(key, label, full, masked, opt) — masked null/undefined => no reveal toggle
  function fld(key, label, full, masked, opt) {
    opt = opt || {};
    const revealable = key != null && masked != null;
    const val = revealable ? (EE.shown(key) ? full : masked) : full;
    const eye = revealable
      ? `<button class="ee-eye" title="${EE.shown(key) ? 'Hide' : 'Reveal'}" onclick="EmpEmployee.reveal('${key}')">${ic(EE.shown(key) ? 'eyeoff' : 'eye')}</button>`
      : '';
    const chk = opt.check ? `<span class="ee-chk" title="Verified">${ic('checkcircle')}</span>` : '';
    return `<div class="ee-fld${opt.wide ? ' ee-fld--wide' : ''}">
      <div class="ee-fld__lbl">${esc(label)}</div>
      <div class="ee-fld__val${opt.mono ? ' mono' : ''}"><span class="grow">${esc(val)}</span>${chk}${eye}</div>
    </div>`;
  }
  const flds = arr => `<div class="ee-flds">${arr.join('')}</div>`;

  function cell(label, val, color) {
    return `<div class="statstrip__cell"><div class="statstrip__label">${esc(label)}</div><div class="statstrip__val num"${color ? ` style="color:${color}"` : ''}>${esc(val)}</div></div>`;
  }

  function srcRow(s, i) {
    const when = EE.whenFor(s);
    return `<div class="ee-src" id="ee-src-${i}" onclick="EmpEmployee.srcDetail(${i})" title="View match details">
      <div class="ee-src__ic" style="background:${s.c}1a;color:${s.c}">${ic(s.ic)}</div>
      <div class="grow">
        <div class="row gap-8 wrap" style="align-items:center"><b style="font-size:13.5px">${esc(s.label)}</b><span id="ee-srcbadge-${i}">${pill(s.status, s.kind, true)}</span></div>
        <div class="ee-src__sub">${esc(s.sub)}</div>
      </div>
      <div class="ee-src__when" id="ee-srcwhen-${i}">${ic('checkcircle')}<span>${esc(when)}</span></div>
      <span class="ee-src__go">${ic('chevron')}</span>
    </div>`;
  }

  function statRow(label, val) {
    return `<div class="ee-stat">
      <span class="row gap-8" style="align-items:center;font-size:13.5px"><span class="ee-chk">${ic('checkcircle')}</span>${esc(label)}</span>
      <b style="font-size:12.5px;color:var(--green-700)">${esc(val)}</b>
    </div>`;
  }

  function progressHtml() {
    const steps = STEPS.map(st => `<div class="ee-step"><div class="ee-step__ic">${ic('check')}</div><div><b style="font-size:13.5px">${esc(st.t)}</b><div class="muted" style="font-size:12px;margin-top:1px">${esc(st.s)}</div></div></div>`).join('');
    return `<div class="row between" style="margin-bottom:4px"><b style="font-size:13px">Overall progress</b><span class="mono" style="font-size:12.5px;color:var(--muted)">Step 3 / 3</span></div>
      <div class="ee-segbar"><i></i><i></i><i></i></div>${steps}`;
  }

  const privacyBanner = `<div class="banner banner--amber${EE.rv()}" style="align-items:flex-start;margin-bottom:20px">${ic('lock')}<div><b>Data privacy</b><div style="margin-top:2px;opacity:.9">Sensitive fields are masked by default. Use the eye icon to reveal a credential temporarily — every reveal is logged under the DPDP Act, 2023.</div></div></div>`;

  function statusCard(rec) {
    return card('Verification Status', 'checkcircle', `<div class="ee-stats">${rec.status.map(s => statRow(s[0], s[1])).join('')}</div>`);
  }
  function sourceCard(rec) {
    const right = `<span class="pill pill--green pill--dot">Live</span>`;
    const body = `<div class="ee-srchint">${ic('bolt')} Cross-verified live at source — select a row for match details, or re-run below.</div>
      <div class="ee-srclist">${rec.sources.map(srcRow).join('')}</div>
      <button class="btn btn--accent btn--block mt-16" data-reverify-btn onclick="EmpEmployee.reverify()">${ic('shieldcheck')} Re-verify all sources</button>`;
    return card('Live Source Verification', 'shieldcheck', body, right, 'ee-srccard');
  }

  /* ---------------- professional (Arjun Gupta) ---------------- */
  function mainPro(rec) {
    const idCard = card('PAN & Identity', 'idcard', flds([
      fld('pan', 'PAN Number', 'TARTAN6732J', 'TART******J', { mono: true, check: true }),
      fld(null, 'Name on PAN', rec.panName),
      fld(null, "Father's Name", 'Rajesh Gupta'),
      fld(null, 'Date of Birth', '15 Aug 1995'),
    ]));

    const contactCard = card('Contact Information', 'phone', flds([
      fld('phone', 'Primary Phone', '+91 9812345678', '+91 98••• ••78', { mono: true }),
      fld('email', 'Email ID', 'arjun.gupta@mail.com', 'arj•••••@mail.com'),
      fld('caddr', 'Current Address', 'TK Mansion, MB-780001', 'TK Mansion, MB-••••••'),
      fld('paddr', 'Permanent Address', 'C-22, Sector 4, HR-201301', 'C-22, Sector 4, HR-••••••'),
    ]));

    const upiCard = card('UPI & Banking', 'key', flds([
      fld('upi1', 'UPI ID 1', 'arjung@oksbi', 'arj•••@oksbi', { mono: true, check: true }),
      fld('upi2', 'UPI ID 2', 'agupta@okaxis', 'agu•••@okaxis', { mono: true }),
      fld(null, 'Linked Banks', 'SBI, Axis Bank'),
      fld(null, 'Transaction Type', 'Peer-to-Peer & Merchant'),
    ]));

    const strip = `<div class="statstrip" style="margin-bottom:18px">
      ${cell('Total Employers', '3')}${cell('Total Experience', '9 Yrs')}${cell('Current CTC', '₹42L')}${cell('Income Growth', '+600%', 'var(--green-700)')}
    </div>`;
    const timeline = `<div class="timeline">${rec.jobs.map(j => `<div class="timeline__item">
      <div class="timeline__dot done"></div>
      <div class="row between wrap gap-8"><b>${esc(j.role)}</b><span class="when">${esc(j.dur)}</span></div>
      <div class="muted" style="font-size:13px;margin-top:2px">${esc(j.co)} · ${esc(j.loc)}</div>
      <div class="row gap-8 wrap mt-8">${pill('EPFO Verified', 'green', true)}<span class="chip mono" style="font-size:11.5px">${esc(j.ctc)}</span>${j.active ? pill('Current role', 'accent') : ''}</div>
    </div>`).join('')}</div>`;
    const employment = card('Employment & Income', 'briefcase', strip + timeline);

    return idCard + contactCard + upiCard + employment + sourceCard(rec);
  }
  function asidePro(rec) {
    return statusCard(rec) + card('Verification Progress', 'layers', progressHtml()) + privacyBanner;
  }

  /* ---------------- gig worker (Deepak Lal) ---------------- */
  function miniStat(icn, color, label, val) {
    return `<div class="ee-mini"><span class="ee-mini__ic" style="background:${color}1a;color:${color}">${ic(icn)}</span><div><div class="ee-mini__val num">${esc(val)}</div><div class="ee-mini__lbl">${esc(label)}</div></div></div>`;
  }
  function mainGig(rec) {
    const personal = card('Personal Information', 'user', flds([
      fld(null, 'Age', '25 years'),
      fld(null, 'Date of Birth', '02 Sep 1986'),
      fld(null, 'Education', 'Bachelors'),
      fld(null, 'House Ownership', 'Owned'),
      fld(null, 'Home Address', '743/90 Apartment Street Lal, Bengaluru, Karnataka', null, { wide: true }),
    ]));

    const creds = card('Identity Credentials', 'fingerprint', flds([
      fld('uan', 'UAN Number', '1001 2345 6789', 'XXXX XXXX 6789', { mono: true, check: true }),
      fld('aadhaar', 'Aadhaar Card', '9846 4548 4545 4789', 'XXXX XXXX 4789', { mono: true, check: true }),
      fld('pan', 'PAN Card', 'FHGO44512D', 'XXXX12D', { mono: true, check: true }),
      fld('mobile', 'Mobile', '+91 98765 43218', '+91 XXXXX 43218', { mono: true }),
      fld(null, 'Driving License', 'P564652318', null, { mono: true }),
    ]));

    const bank = card('Bank Details', 'database', flds([
      fld(null, 'Bank Name', 'HDFC Ltd.'),
      fld(null, 'IFSC Code', 'HDFC1321654', null, { mono: true }),
      fld('acct', 'Account Number', '4568975665162134', 'XXXX XXXX 2134', { mono: true, check: true }),
      fld(null, 'Branch Name', 'Mumbai'),
    ]));

    const gids = card('Government Program IDs', 'landmark', `<div class="ee-gids">${rec.gids.map(g => `<div class="ee-gid">
      <div class="ee-gid__ic" style="background:${g.c}1a;color:${g.c}">${ic(g.ic)}</div>
      <div class="grow"><div class="ee-gid__lbl">${esc(g.label)}</div><div class="ee-gid__id">${esc(g.id)}</div></div>
      <span class="ee-chk">${ic('checkcircle')}</span></div>`).join('')}</div>`);

    const rows = rec.income[EE.incomeTab] || [];
    const table = `<div class="tablewrap tablewrap--scroll"><table class="tbl"><thead><tr>
        <th>Month</th><th style="text-align:right">Hours</th><th style="text-align:right">Income</th><th style="text-align:right">Perks</th><th style="text-align:right">Net</th>
      </tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.m)}</td><td class="num" style="text-align:right">${r.h}</td><td class="num" style="text-align:right">${money(r.inc)}</td><td class="num" style="text-align:right">${money(r.perk)}</td><td class="num" style="text-align:right"><b>${money(r.net)}</b></td></tr>`).join('')}</tbody></table></div>`;
    const seg = `<div class="seg"><button class="${EE.incomeTab === 'amazon' ? 'is-active' : ''}" onclick="EmpEmployee.setIncomeTab('amazon')">Amazon</button><button class="${EE.incomeTab === 'uber' ? 'is-active' : ''}" onclick="EmpEmployee.setIncomeTab('uber')">Uber</button></div>`;
    const incomeCard = card('Income Breakdown', 'chart', table, seg);

    return personal + creds + bank + gids + incomeCard + sourceCard(rec);
  }
  function asideGig(rec) {
    const summary = card('Work Summary', 'briefcase', `<div class="ee-minis">
      ${miniStat('users', '#0d9488', 'Active Platforms', '3')}
      ${miniStat('calendar', '#2f5fd0', 'Avg. Work Days', '29')}
      ${miniStat('star', '#c07d10', 'Rating', '5.0')}
      ${miniStat('trend', '#0e9f6e', 'Experience', '6 Yrs')}
    </div><div class="muted" style="font-size:12px;margin-top:12px">Active on Amazon, Uber &amp; Zomato · avg. 29 working days / month.</div>`);

    const platforms = card('Platform Credentials', 'plug', rec.platforms.map(p => `<div class="minirow">
      ${App.ui.avatar(p.name, 'sm')}
      <div class="grow"><b style="font-size:13.5px">${esc(p.name)}</b><div class="mono" style="font-size:11.5px;color:var(--muted)">${esc(p.id)}</div></div>
      <div style="text-align:right">${p.active ? pill('Active', 'green', true) : pill('Inactive', 'gray', true)}<div class="muted" style="font-size:11px;margin-top:4px">Joined ${esc(p.joined)}</div></div>
    </div>`).join(''));

    return statusCard(rec) + summary + platforms + card('Verification Progress', 'layers', progressHtml()) + privacyBanner;
  }

  /* ---------------- hero (editorial band) ---------------- */
  function hero(rec) {
    const reverified = EE.reverifiedFor === rec.id;
    const lastVerified = `<span class="ee-lv" id="ee-lastverified">${ic('checkcircle')} ${reverified ? 'Re-verified just now' : 'Verified via India Stack'}</span>`;

    const incomeBlock = rec.kind === 'gig' ? `<div class="ee-metric">
      <div class="ee-metric__lbl">Net Avg. Monthly Income</div>
      <div class="ee-metric__val num">₹80,000</div>
      <div class="muted" style="font-size:11.5px;margin-top:6px">across 3 active platforms</div>
    </div>` : '';

    const scoreBlock = `<div class="ee-scoreblk">
      ${App.ui.ring(rec.score, 'Trust score', '%')}
      <div class="ee-scoreblk__cap">${pill('Highly Trusted', 'green', true)}</div>
    </div>`;

    const actions = `<div class="ee-heroactions">
      <button class="btn btn--sm" onclick="EmpEmployee.toggleAll()">${ic(EE.allRevealed ? 'eyeoff' : 'eye')} ${EE.allRevealed ? 'Hide all credentials' : 'Show all credentials'}</button>
      <button class="btn btn--sm" onclick="EmpEmployee.download()">${ic('download')} Download Report</button>
      <button class="btn btn--accent btn--sm" data-reverify-btn onclick="EmpEmployee.reverify()">${ic('shieldcheck')} Re-verify</button>
    </div>`;

    return `<div class="hero ee-hero${EE.rv()}">
      <div class="hero__wash"></div>
      <div class="hero__in">
        <div class="row between wrap gap-24">
          <div style="min-width:280px;flex:1">
            <div class="eyebrow">${ic('fingerprint')} India-Stack verified identity</div>
            <div class="row gap-16" style="align-items:center;margin-top:14px">
              ${App.ui.avatar(rec.name, 'xl')}
              <div style="min-width:0">
                <div class="row gap-10 wrap" style="align-items:center">
                  <h1 class="h-grad">${esc(rec.name)}</h1>
                  ${pill(rec.kind === 'gig' ? 'Gig Worker' : 'Professional', rec.kind === 'gig' ? 'teal' : 'accent')}
                </div>
                <div class="muted" style="font-size:13.5px;margin-top:3px">${esc(rec.subtitle)}</div>
              </div>
            </div>
            <div class="row gap-14 wrap mt-16" style="font-size:12.5px;color:var(--muted)">
              <span class="row gap-6">${ic('mappin')} ${esc(rec.location)}</span>
              <span class="row gap-6">${ic('briefcase')} ${esc(rec.exp)}</span>
            </div>
            <div class="row gap-10 wrap mt-16" style="align-items:center">
              <span class="ee-idbadge mono">${ic('idcard')} WiN ID · ${esc(rec.winId)}
                <button class="ee-copy" title="Copy WiN ID" onclick="EmpEmployee.copy('${esc(rec.winId)}')">${ic('copy')}</button></span>
              ${rec.kind !== 'gig' ? `<span class="mono" style="font-size:12px;color:var(--muted)">Employee ID · ${esc(rec.id)}</span>` : ''}
              ${lastVerified}
            </div>
          </div>
          <div class="ee-heroright">${incomeBlock}${scoreBlock}</div>
        </div>
        ${actions}
      </div>
    </div>`;
  }

  /* ---------------- view ---------------- */
  App.registerView('emp-employee', {
    title: 'Employee Verification',
    subtitle: 'India-Stack verified worker profile',
    render(ctx) {
      const rec = recFor(ctx);
      EE.sync(rec);

      const backbar = `<div class="row between wrap gap-12" style="margin-bottom:16px">
        <button class="btn btn--ghost btn--sm" onclick="App.navigate('emp-verifications')">${ic('arrowleft')} Back to Employees</button>
        <div class="row gap-6" style="font-size:12px;color:var(--faint);align-items:center"><span>Employees</span>${ic('chevron')}<span style="color:var(--muted)">${esc(rec.name)}</span></div>
      </div>`;

      const banner = `<div class="banner banner--accent ee-topbanner${EE.rv()}" style="margin-bottom:20px;align-items:center">
        ${ic('shieldcheck')}
        <div class="grow"><b>Profile verified through India Stack</b><div style="font-size:12px;opacity:.9;margin-top:2px">EPFO/UAN · Income-Tax · ESIC · DigiLocker · Aadhaar — cross-verified live at source.</div></div>
      </div>`;

      const grid = `<div class="ee-grid">
        <div>${rec.kind === 'gig' ? mainGig(rec) : mainPro(rec)}</div>
        <aside>${rec.kind === 'gig' ? asideGig(rec) : asidePro(rec)}</aside>
      </div>`;

      return `<div class="page fade-in">
        <style>
          .ee-hero{ margin-bottom:20px; }
          .ee-heroright{ display:flex; gap:26px; flex-wrap:wrap; align-items:flex-start; }
          .ee-scoreblk{ display:flex; flex-direction:column; align-items:center; gap:12px; }
          .ee-scoreblk .ring{ width:112px; height:112px; }
          .ee-scoreblk__cap{ text-align:center; }
          .ee-metric{ text-align:right; min-width:150px; }
          .ee-metric__lbl{ font-size:11px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:5px; }
          .ee-metric__val{ font-size:32px; font-weight:700; line-height:1; color:var(--ink); }
          .ee-lv{ display:inline-flex; align-items:center; gap:5px; color:var(--green-700); font-size:12.5px; font-weight:600; }
          .ee-lv .ico{ color:var(--green-600); width:15px; height:15px; }
          .ee-heroactions{ display:flex; gap:8px; flex-wrap:wrap; margin-top:22px; padding-top:18px; border-top:1px solid var(--line-2); }
          .ee-idbadge{ display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; padding:4px 6px 4px 11px; border:1px solid var(--line); border-radius:var(--r-full); background:var(--surface); color:var(--ink-2); }
          .ee-idbadge .ico{ color:var(--accent); width:15px; height:15px; }
          .ee-copy{ width:24px; height:24px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--faint); transition:.13s; }
          .ee-copy:hover{ background:var(--surface-2); color:var(--accent-strong); }
          .ee-copy .ico{ width:13px; height:13px; color:inherit; }

          .ee-grid{ display:grid; grid-template-columns:minmax(0,1fr) 322px; gap:20px; align-items:start; }
          .ee-grid aside > .card:last-child{ margin-bottom:0; }

          .ee-flds{ display:grid; grid-template-columns:1fr 1fr; gap:0 30px; }
          .ee-fld{ padding:12px 0; border-bottom:1px solid var(--line-2); min-width:0; }
          .ee-fld--wide{ grid-column:1 / -1; }
          .ee-fld__lbl{ font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--faint); margin-bottom:6px; }
          .ee-fld__val{ display:flex; align-items:center; gap:8px; font-size:14px; font-weight:500; color:var(--ink); }
          .ee-fld__val.mono{ font-family:var(--font-mono); font-size:13px; }
          .ee-fld__val .grow{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .ee-eye{ flex-shrink:0; width:30px; height:30px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--faint); transition:.13s; }
          .ee-eye:hover{ background:var(--surface-2); color:var(--accent-strong); }
          .ee-chk{ display:inline-flex; color:var(--green-600); flex-shrink:0; }
          .ee-chk .ico{ width:16px; height:16px; }

          .ee-srchint{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); margin-bottom:6px; }
          .ee-srchint .ico{ width:14px; height:14px; color:var(--accent); }
          .ee-srclist{ margin-top:4px; }
          .ee-src{ display:flex; align-items:center; gap:14px; padding:13px 10px; margin:0 -10px; border-bottom:1px solid var(--line-2); border-radius:var(--r-sm); cursor:pointer; transition:background .13s; }
          .ee-src:last-child{ border-bottom:none; }
          .ee-src:hover{ background:var(--surface-2); }
          .ee-src.is-checking{ background:var(--accent-weak); }
          .ee-src.is-done{ animation:eeflash .9s ease; }
          .ee-src__ic{ width:42px; height:42px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
          .ee-src__sub{ font-size:12.5px; color:var(--muted); margin-top:3px; }
          .ee-src__when{ display:inline-flex; align-items:center; gap:5px; color:var(--green-700); font-size:11.5px; font-weight:600; white-space:nowrap; }
          .ee-src__when .ico{ width:14px; height:14px; color:var(--green-600); }
          .ee-src__when.is-checking{ color:var(--accent-strong); }
          .ee-src__go{ display:inline-flex; color:var(--faint); flex-shrink:0; }
          .ee-src__go .ico{ width:16px; height:16px; }
          .ee-spin{ width:14px; height:14px; border-radius:50%; border:2px solid var(--accent-ring); border-top-color:var(--accent); display:inline-block; animation:eespin .7s linear infinite; }
          @keyframes eespin{ to{ transform:rotate(360deg); } }
          @keyframes eeflash{ 0%{ background:var(--green-50); } 100%{ background:transparent; } }

          .ee-stats, .ee-stat{ min-width:0; }
          .ee-stat{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:11px 0; border-bottom:1px solid var(--line-2); }
          .ee-stat:last-child{ border-bottom:none; }

          .ee-segbar{ display:flex; gap:6px; margin:8px 0 16px; }
          .ee-segbar i{ flex:1; height:7px; border-radius:var(--r-full); background:var(--accent); }
          .ee-step{ display:flex; gap:12px; align-items:flex-start; padding:11px 0; border-bottom:1px solid var(--line-2); }
          .ee-step:last-child{ border-bottom:none; padding-bottom:0; }
          .ee-step__ic{ width:30px; height:30px; border-radius:50%; background:var(--green-50); color:var(--green-600); display:grid; place-items:center; flex-shrink:0; }
          .ee-step__ic .ico{ width:16px; height:16px; }

          .ee-gids{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .ee-gid{ display:flex; align-items:center; gap:12px; padding:13px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); min-width:0; }
          .ee-gid__ic{ width:38px; height:38px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
          .ee-gid__lbl{ font-size:11.5px; color:var(--muted); }
          .ee-gid__id{ font-family:var(--font-mono); font-size:13px; font-weight:600; color:var(--ink); margin-top:2px; }

          .ee-minis{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .ee-mini{ display:flex; align-items:center; gap:11px; padding:12px; border:1px solid var(--line); border-radius:var(--r-sm); }
          .ee-mini__ic{ width:32px; height:32px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
          .ee-mini__val{ font-size:18px; font-weight:700; line-height:1; }
          .ee-mini__lbl{ font-size:11px; color:var(--muted); margin-top:3px; }

          .ee-cblist{ display:flex; flex-direction:column; gap:4px; }
          .ee-cbrow{ display:flex; align-items:center; gap:11px; padding:11px 12px; border:1px solid var(--line); border-radius:var(--r-sm); font-size:13.5px; font-weight:500; cursor:pointer; transition:.13s; }
          .ee-cbrow:hover{ background:var(--surface-2); }
          .ee-cbrow input{ width:16px; height:16px; accent-color:var(--accent); }
          .ee-cbic{ display:inline-flex; }
          .ee-fmts{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
          .ee-fmt{ display:flex; flex-direction:column; align-items:center; gap:6px; padding:18px 10px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); transition:.13s; }
          .ee-fmt:hover{ border-color:var(--accent); background:var(--accent-weak); }
          .ee-fmt__ic{ width:40px; height:40px; border-radius:var(--r-sm); display:grid; place-items:center; background:var(--accent-weak); color:var(--accent); }
          .ee-fmt b{ font-size:13.5px; }
          .ee-fmt span{ font-size:11.5px; color:var(--muted); font-family:var(--font-mono); }

          @media (max-width:960px){
            .ee-grid{ grid-template-columns:1fr; }
            .ee-grid aside > .card:last-child{ margin-bottom:20px; }
            .ee-metric{ text-align:left; }
            .ee-heroright{ gap:20px; }
          }
          @media (max-width:560px){
            .ee-flds, .ee-gids, .ee-minis{ grid-template-columns:1fr; }
            .ee-fmts{ grid-template-columns:1fr; }
          }
        </style>

        ${backbar}
        ${hero(rec)}
        ${banner}
        ${grid}
      </div>`;
    },
    mounted() { EE.painted(); },
  });
})();
