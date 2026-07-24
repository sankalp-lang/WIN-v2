/* Worker · Link to DigiLocker — editorial hero + a live Aadhaar-linked OTP flow.
   Left column previews the verified WiN employment payload; right column runs the
   multi-step link: enter mobile → Send OTP (1.5s) → enter OTP → Verify & Link (2s)
   → success state with the documents now available in DigiLocker + toast, then
   "Back to employee record" returns to emp-employee. Themes to the persona accent. */
(function () {
  const P = {
    name: 'Aman Sharma',
    win: 'WIN-2024-7845-2910',
    location: 'Bengaluru, Karnataka',
  };

  const TILES = [
    { label: 'Total Experience', val: '13', unit: 'yrs' },
    { label: 'Companies', val: '3', unit: '' },
    { label: 'Current CTC', val: '₹42L', unit: '' },
    { label: 'Growth', val: '+425%', unit: '', color: 'var(--green-700)' },
  ];

  const HISTORY = [
    { co: 'Amazon', when: '2012 – 2017' },
    { co: 'Razorpay', when: '2017 – 2021' },
    { co: 'Tartan', when: '2022 – Present', current: true },
  ];

  const STEPS = [
    'OTP verification authenticates your Aadhaar identity',
    'Your WiN profile is securely uploaded to DigiLocker',
    'Access and share your verified employment data anytime',
  ];

  // documents available in DigiLocker once the WiN profile is linked
  const DOCS = [
    { name: 'WiN Employment Profile', issuer: 'Ministry of Labour & Employment', meta: P.win, ic: 'idcard', tag: 'Issued', color: 'green' },
    { name: 'Aadhaar Card', issuer: 'UIDAI', meta: 'XXXX XXXX 2910', ic: 'fingerprint', tag: 'Verified', color: 'green' },
    { name: 'PAN Card', issuer: 'Income Tax Department', meta: 'ABCPS••••K', ic: 'idcard', tag: 'Linked', color: 'blue' },
    { name: 'UAN / EPFO Passbook', issuer: 'EPFO', meta: 'UAN 1012••••3456', ic: 'filecheck', tag: 'Linked', color: 'blue' },
    { name: 'Form 16 · FY 2024–25', issuer: 'Income Tax Department', meta: 'Verified income record', ic: 'file', tag: 'Linked', color: 'blue' },
  ];

  // step: 'input' | 'sending' | 'otp' | 'verifying' | 'done'
  const S = { step: 'input', mobile: '', otp: '', params: {} };

  const spinner = (label) => `<span class="dl-spin"></span> ${label}`;
  const esc1 = (s) => String(s).replace(/'/g, "\\'");

  window.EmpDigilocker = {
    onMobile(el) {
      const v = el.value.replace(/\D/g, '').slice(0, 10);
      el.value = v; S.mobile = v;
      const b = document.getElementById('dlSend'); if (b) b.disabled = v.length !== 10;
    },
    onOtp(el) {
      const v = el.value.replace(/\D/g, '').slice(0, 6);
      el.value = v; S.otp = v;
      const b = document.getElementById('dlVerify'); if (b) b.disabled = v.length !== 6;
    },
    sendOtp() {
      if (S.mobile.length !== 10) { App.toast('Enter a 10-digit mobile number', 'alert'); return; }
      S.step = 'sending'; App.reload();
      setTimeout(() => { S.step = 'otp'; App.reload(); }, 1500);
    },
    verify() {
      if (S.otp.length !== 6) { App.toast('Enter the 6-digit OTP', 'alert'); return; }
      S.step = 'verifying'; App.reload();
      setTimeout(() => {
        S.step = 'done';
        App.toast('DigiLocker linked — WiN profile uploaded securely');
        App.reload();
      }, 2000);
    },
    resend() { S.step = 'input'; S.otp = ''; App.toast('Re-enter your mobile to resend the OTP', 'clock'); App.reload(); },
    openDoc(name) { App.toast('Opening ' + name + ' in DigiLocker…', 'file'); },
    finish() { App.navigate('emp-employee', S.params); },
    back() { App.navigate('emp-employee', S.params); },
  };

  App.registerView('emp-digilocker', {
    title: 'Link to DigiLocker',
    subtitle: 'Store your verified WiN profile in DigiLocker',
    render(ctx) {
      S.params = ctx.params || {};
      const uploaded = S.step === 'done';

      /* ---- left: the payload written to DigiLocker ---- */
      const tiles = TILES.map(t => `
        <div class="statstrip__cell">
          <div class="statstrip__label">${t.label}</div>
          <div class="statstrip__val num"${t.color ? ` style="color:${t.color}"` : ''}>${App.esc(t.val)}${t.unit ? `<span style="font-size:14px;font-weight:600"> ${App.esc(t.unit)}</span>` : ''}</div>
        </div>`).join('');

      const history = HISTORY.map(h => `
        <div class="minirow">
          ${App.ui.avatar(h.co, 'sm')}
          <div class="grow"><b style="font-size:13.5px">${App.esc(h.co)}</b></div>
          ${h.current
            ? `<span class="pill pill--green pill--dot">${App.esc(h.when)}</span>`
            : `<span class="mono" style="font-size:12.5px;color:var(--muted)">${App.esc(h.when)}</span>`}
        </div>`).join('');

      const payload = `
        <div class="card reveal">
          <div class="card__head">${App.icon(uploaded ? 'filecheck' : 'upload')}<h3 class="grow">${uploaded ? 'Uploaded to DigiLocker' : 'Data to be Uploaded'}</h3>${App.ui.verified(uploaded ? 'Uploaded' : '100% Verified')}</div>
          <div class="card__body">
            <div class="dl-sub">Personal Information</div>
            <div class="dl-kv">
              <div class="row between gap-12"><span class="muted">Name</span><b>${App.esc(P.name)}</b></div>
              <div class="row between gap-12"><span class="muted">WiN ID</span><span class="mono" style="font-size:12.5px">${App.esc(P.win)}</span></div>
              <div class="row between gap-12"><span class="muted">Location</span><b>${App.esc(P.location)}</b></div>
            </div>

            <div class="dl-sub" style="margin-top:20px">Employment Summary</div>
            <div class="statstrip">${tiles}</div>

            <div class="dl-sub" style="margin-top:20px">Employment History</div>
            <div class="list--divided">${history}</div>

            <div class="banner banner--info" style="margin-top:18px">${App.icon('lock')}<div>All data is encrypted and stored securely in your DigiLocker account.</div></div>
          </div>
        </div>`;

      /* ---- right: state-driven ---- */
      let right;

      if (uploaded) {
        const docs = DOCS.map(d => `
          <button class="dl-doc" onclick="EmpDigilocker.openDoc('${esc1(d.name)}')">
            <span class="dl-doc__ic">${App.icon(d.ic)}</span>
            <span class="grow">
              <b style="font-size:13.5px;display:block">${App.esc(d.name)}</b>
              <span class="muted" style="font-size:12px">${App.esc(d.issuer)} · <span class="mono">${App.esc(d.meta)}</span></span>
            </span>
            ${App.ui.pill(d.tag, d.color, true)}
            <span class="dl-doc__go">${App.icon('external')}</span>
          </button>`).join('');

        right = `
          <div class="card reveal">
            <div class="card__body">
              <div class="banner banner--green" style="margin-bottom:16px">${App.icon('checkcircle')}<div><b>DigiLocker linked successfully</b><div style="font-size:12px;opacity:.85;margin-top:3px">Your verified WiN employment profile is now stored in DigiLocker for ${App.esc(P.name)}.</div></div></div>
              <div class="dl-sub">Documents now available in DigiLocker</div>
              <div class="dl-doclist">${docs}</div>
              <button class="btn btn--primary btn--block btn--lg" style="margin-top:18px" onclick="EmpDigilocker.finish()">${App.icon('arrowleft')} Back to employee record</button>
              <p class="dl-foot">${App.icon('lock')} Documents are shared only with your consent under the DPDP Act, 2023.</p>
            </div>
          </div>`;
      } else {
        let form;
        if (S.step === 'input' || S.step === 'sending') {
          const sending = S.step === 'sending';
          form = `
            <div class="field">
              <label class="label">Mobile Number</label>
              <div class="input-group">
                <span class="prefix">+91</span>
                <input class="input mono" id="dlMobile" inputmode="numeric" maxlength="10" placeholder="Enter 10-digit mobile number" value="${App.esc(S.mobile)}" ${sending ? 'disabled' : ''} oninput="EmpDigilocker.onMobile(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();EmpDigilocker.sendOtp();}">
              </div>
            </div>
            <button class="btn btn--accent btn--block btn--lg" id="dlSend" ${(S.mobile.length !== 10 || sending) ? 'disabled' : ''} onclick="EmpDigilocker.sendOtp()">
              ${sending ? spinner('Sending OTP…') : `${App.icon('send')} Send OTP`}
            </button>`;
        } else {
          const verifying = S.step === 'verifying';
          form = `
            <div class="banner banner--green" style="margin-bottom:16px">${App.icon('checkcircle')}<div>OTP sent to <b>+91 ${App.esc(S.mobile)}</b></div></div>
            <div class="field">
              <label class="label">Enter OTP</label>
              <input class="input mono dl-otp num" id="dlOtp" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit OTP" value="${App.esc(S.otp)}" ${verifying ? 'disabled' : ''} oninput="EmpDigilocker.onOtp(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();EmpDigilocker.verify();}">
            </div>
            <button class="btn btn--accent btn--block btn--lg" id="dlVerify" ${(S.otp.length !== 6 || verifying) ? 'disabled' : ''} onclick="EmpDigilocker.verify()">
              ${verifying ? spinner('Verifying…') : `${App.icon('lock')} Verify &amp; Link DigiLocker`}
            </button>
            <div class="center" style="margin-top:14px">
              <button class="btn btn--ghost btn--sm" ${verifying ? 'disabled' : ''} onclick="EmpDigilocker.resend()">Resend OTP</button>
            </div>`;
        }

        const verifyCard = `
          <div class="card reveal">
            <div class="card__body">
              <div class="row gap-12" style="margin-bottom:18px">
                <div class="dl-formic">${App.icon('shieldcheck')}</div>
                <div class="grow"><b style="font-size:15px">Verify with Aadhaar OTP</b><div class="muted" style="font-size:12.5px;margin-top:2px">Enter your Aadhaar-linked mobile number to receive OTP</div></div>
              </div>
              ${form}
              <p class="dl-foot">${App.icon('lock')} Your Aadhaar number is never stored. Only verification status is saved.</p>
            </div>
          </div>`;

        const nextCard = `
          <div class="card reveal" style="margin-top:16px">
            <div class="card__head">${App.icon('sparkles')}<h3>What happens next?</h3></div>
            <div class="card__body">
              <div class="dl-steps">
                ${STEPS.map((s, i) => `<div class="dl-step"><span class="dl-step__n num">${i + 1}</span><span>${App.esc(s)}</span></div>`).join('')}
              </div>
            </div>
          </div>`;

        right = verifyCard + nextCard;
      }

      return `<div class="page fade-in">
        <style>
          .dl-grid{ display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr); gap:20px; align-items:start; }
          .dl-badge{ display:flex; align-items:center; gap:12px; padding:12px 15px; border-radius:16px; color:#fff; background:linear-gradient(135deg,#2B3990,#20296b 78%); box-shadow:var(--sh-sm); }
          .dl-badge__ic{ width:38px; height:38px; border-radius:11px; background:rgba(255,255,255,.16); display:grid; place-items:center; flex-shrink:0; }
          .dl-badge__ic .ico{ width:20px; height:20px; }
          .dl-badge b{ display:block; font-size:14px; line-height:1.15; }
          .dl-badge span{ font-size:11px; opacity:.82; letter-spacing:.02em; }
          .dl-sub{ font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin-bottom:11px; }
          .dl-kv{ display:flex; flex-direction:column; gap:11px; font-size:13.5px; }
          .dl-kv b{ font-weight:600; }
          .dl-formic{ width:40px; height:40px; border-radius:11px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; flex-shrink:0; }
          .dl-otp{ text-align:center; font-size:16px; letter-spacing:.12em; }
          .dl-foot{ display:flex; align-items:center; justify-content:center; gap:7px; font-size:11.5px; color:var(--faint); margin-top:16px; text-align:center; }
          .dl-foot .ico{ width:14px; height:14px; flex-shrink:0; }
          .dl-steps{ display:flex; flex-direction:column; gap:15px; }
          .dl-step{ display:flex; gap:12px; align-items:flex-start; font-size:13.5px; color:var(--ink-2); line-height:1.45; }
          .dl-step__n{ width:24px; height:24px; border-radius:50%; flex-shrink:0; display:grid; place-items:center; background:var(--amber-50); color:var(--amber-700); font-weight:700; font-size:12px; margin-top:1px; }
          .dl-doclist{ display:flex; flex-direction:column; gap:10px; }
          .dl-doc{ display:flex; align-items:center; gap:13px; width:100%; text-align:left; padding:12px 13px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; transition:box-shadow .15s ease, transform .15s ease, border-color .15s ease; }
          .dl-doc:hover{ box-shadow:var(--sh); transform:translateY(-1px); border-color:var(--accent); }
          .dl-doc__ic{ width:36px; height:36px; border-radius:10px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; flex-shrink:0; }
          .dl-doc__ic .ico{ width:18px; height:18px; }
          .dl-doc__go{ color:var(--faint); display:grid; place-items:center; flex-shrink:0; }
          .dl-doc__go .ico{ width:15px; height:15px; }
          .dl-spin{ width:16px; height:16px; border:2px solid rgba(255,255,255,.45); border-top-color:#fff; border-radius:50%; display:inline-block; animation:dl-spin .8s linear infinite; vertical-align:-3px; }
          @keyframes dl-spin{ to{ transform:rotate(360deg); } }
          @media (max-width:900px){ .dl-grid{ grid-template-columns:1fr; } }
        </style>

        <div class="row" style="margin-bottom:14px">
          <button class="btn btn--ghost btn--sm" onclick="EmpDigilocker.back()">${App.icon('arrowleft')} Back to employee</button>
        </div>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('shieldcheck')} DigiLocker linkage · Government of India</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">Link your WiN profile to DigiLocker.</h1>
                <p class="lead">Store your verified employment record in DigiLocker and access it anywhere — authenticated with your Aadhaar-linked mobile.</p>
                <div class="row gap-12 mt-12 wrap">
                  ${App.ui.avatar(P.name, 'sm')}
                  <b style="font-size:13.5px">${App.esc(P.name)}</b>
                  <span class="mono" style="font-size:12.5px;color:var(--muted)">WiN · ${App.esc(P.win)}</span>
                  ${App.ui.verified('100% Verified')}
                </div>
              </div>
              <div class="dl-badge">
                <div class="dl-badge__ic">${App.icon('file')}</div>
                <div><b>DigiLocker</b><span>Verified document wallet</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="dl-grid">
          <div>${payload}</div>
          <div>${right}</div>
        </div>
      </div>`;
    },

    mounted() {
      const id = S.step === 'otp' ? 'dlOtp' : S.step === 'input' ? 'dlMobile' : null;
      if (id) { const el = document.getElementById(id); if (el) el.focus(); }
    },
  });
})();
