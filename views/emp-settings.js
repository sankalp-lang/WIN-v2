/* Employer · Settings (v2 editorial) — Priya Nair manages her account and the
   Aditya Birla Construction Ltd. workspace. Opens with an editorial hero band;
   a left sub-tab rail switches sections: Profile, Organization, Notifications,
   Security, Billing. Edits sync to in-memory state; Save/Invite/Remove/Revoke/
   Upgrade all drive visible state changes via App.reload(), App.modal and
   App.toast. Deep-linkable via ?tab=. */
(function () {
  // ---- inline icons not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 18}" height="${s || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    card:     svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'),
    laptop:   svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>'),
    phone:    svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
    sparkles: App.icon('sparkles'),
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',        icon: 'user',      sub: 'Your personal details' },
    { id: 'org',      label: 'Organization',   icon: 'building',  sub: 'Company & team' },
    { id: 'notif',    label: 'Notifications',  icon: 'bell',      sub: 'Email & push alerts' },
    { id: 'security', label: 'Security',       icon: 'shield',    sub: 'Password & sessions' },
    { id: 'billing',  label: 'Billing',        icon: 'card',      sub: 'Plan, usage & invoices' },
  ];

  const SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '201–500 employees', '500+ employees'];

  // ---- in-memory controller state (survives App.reload re-renders) ----
  const S = {
    tab: 'profile', _lastParam: null,
    saved: { profile: false, org: false, notif: false },
    twofa: false, plan: 'Professional',

    profile: { first: 'Priya', last: 'Nair', email: 'hr@abconstruction.in', phone: '+91 98765 43210', loc: 'Mumbai, India', role: 'Head — People Operations' },
    org: { name: 'Aditya Birla Construction Ltd.', industry: 'Construction & Infrastructure', size: '500+ employees', hq: 'Mumbai, Maharashtra' },

    members: [
      { name: 'Priya Nair',  email: 'hr@abconstruction.in',           role: 'Admin',  you: true },
      { name: 'Arjun Mehta', email: 'arjun.mehta@abconstruction.in',  role: 'Member' },
      { name: 'Kavya Reddy', email: 'kavya.reddy@abconstruction.in',  role: 'Member' },
    ],

    email: [
      { label: 'Verification completed',      desc: 'When an employee verification finishes running.',      on: true },
      { label: 'Workflow execution updates',  desc: 'Progress and completion of bulk verification runs.',   on: true },
      { label: 'Integration status changes',  desc: 'When an EPFO / ESIC / HRMS connector goes up or down.', on: true },
      { label: 'API usage alerts',            desc: 'Warnings as you approach your monthly API quota.',      on: false },
      { label: 'Team member invitations',     desc: 'When a teammate accepts or declines a workspace invite.', on: false },
    ],
    push: [
      { label: 'Critical system alerts', desc: 'Outages and incidents affecting live verifications.', on: true },
      { label: 'Workflow failures',      desc: 'A verification run failed and needs your attention.',  on: true },
      { label: 'Security notifications', desc: 'New sign-ins, 2FA changes and password resets.',       on: true },
    ],

    sessions: [
      { device: 'laptop', browser: 'Chrome on MacBook Pro', loc: 'Mumbai, India', when: 'Active now',  current: true,  revoked: false },
      { device: 'phone',  browser: 'Safari on iPhone',      loc: 'Pune, India',   when: '2 hours ago', current: false, revoked: false },
    ],

    usage: [
      { label: 'API Calls',     disp: '45.2K / 100K',   pct: 45, c: '#2f5fd0' },
      { label: 'Verifications', disp: '1,247 / 5,000',  pct: 25, c: '#0e9f6e' },
      { label: 'Workflows',     disp: '12 / 50',        pct: 24, c: '#6b4fc7' },
    ],
    card: { mask: '•••• •••• •••• 4242', exp: '09/28' },
    invoices: [
      { date: 'Jul 1, 2026', amt: '$99.00', status: 'Paid' },
      { date: 'Jun 1, 2026', amt: '$99.00', status: 'Paid' },
      { date: 'May 1, 2026', amt: '$99.00', status: 'Paid' },
    ],
  };

  const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const alive = () => App.state.route === 'emp-settings';

  window.EmpSettings = {
    setTab(t) { S.tab = t; App.reload(); },

    // silent syncers (no reload → text inputs keep focus while typing)
    editProfile(k, v) { S.profile[k] = v; },
    editOrg(k, v) { S.org[k] = v; },

    uploadPhoto() { App.toast('Photo upload is a demo affordance in this prototype', 'upload'); },

    save(section) {
      S.saved[section] = true; App.reload();
      const msg = section === 'org' ? 'Organization details saved'
        : section === 'notif' ? 'Notification preferences saved'
        : 'Profile saved · ' + S.profile.first + ' ' + S.profile.last;
      App.toast(msg);
      setTimeout(() => { S.saved[section] = false; if (alive()) App.reload(); }, 2000);
    },

    // ---- organization / team ----
    removeMember(i) {
      const m = S.members[i];
      if (!m || m.you) return;
      App.modal.open(
        `<p class="muted" style="font-size:13.5px;line-height:1.6">Remove <b style="color:var(--ink)">${App.esc(m.name)}</b> (${App.esc(m.email)}) from the Aditya Birla Construction Ltd. workspace? They'll immediately lose access to verifications and API keys.</p>`,
        { title: 'Remove team member', icon: 'trash',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--danger" onclick="EmpSettings.confirmRemove(${i})">${App.icon('trash')} Remove member</button>` });
    },
    confirmRemove(i) {
      const m = S.members[i]; if (!m || m.you) { App.modal.close(); return; }
      S.members.splice(i, 1); App.modal.close();
      App.toast(m.name + ' removed from workspace', 'x'); App.reload();
    },
    invite() {
      App.modal.open(`
        <div class="field"><label class="label">Work email</label>
          <div class="input--icon">${App.icon('mail')}<input class="input" id="esetInviteEmail" type="email" placeholder="name@abconstruction.in"></div></div>
        <div class="field" style="margin-bottom:0"><label class="label">Role</label>
          <select class="select" id="esetInviteRole"><option value="Member">Member — run & view verifications</option><option value="Admin">Admin — full workspace access</option></select></div>`,
        { title: 'Invite team member', icon: 'users',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="EmpSettings.sendInvite()">${App.icon('send')} Send invitation</button>` });
      setTimeout(() => { const e = document.getElementById('esetInviteEmail'); if (e) e.focus(); }, 60);
    },
    sendInvite() {
      const email = val('esetInviteEmail');
      const role = (document.getElementById('esetInviteRole') || {}).value || 'Member';
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { App.toast('Enter a valid work email', 'alert'); return; }
      if (S.members.some(m => m.email.toLowerCase() === email.toLowerCase())) { App.toast('That email is already on the team', 'alert'); return; }
      S.members.push({ name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email, role, pending: true });
      App.modal.close(); App.toast('Invitation sent to ' + email, 'send'); App.reload();
    },

    // ---- notifications ----
    toggleEmail(i) { if (S.email[i]) { S.email[i].on = !S.email[i].on; App.reload(); } },
    togglePush(i) { if (S.push[i]) { S.push[i].on = !S.push[i].on; App.reload(); } },

    // ---- security ----
    updatePassword() {
      const cur = val('esetCurPw'), np = val('esetNewPw'), cf = val('esetCfPw');
      if (!cur || !np || !cf) { App.toast('Please fill in all three password fields', 'alert'); return; }
      if (np.length < 8) { App.toast('New password must be at least 8 characters', 'alert'); return; }
      if (np !== cf) { App.toast('New passwords do not match', 'alert'); return; }
      ['esetCurPw', 'esetNewPw', 'esetCfPw'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
      App.toast('Password updated successfully', 'lock');
    },
    enable2FA() {
      if (S.twofa) { App.toast('Two-factor authentication is already on'); return; }
      App.modal.open(`
        <p class="muted" style="font-size:13.5px;line-height:1.6;margin-bottom:14px">Two-factor authentication adds a one-time code after your password whenever you sign in on a new device.</p>
        <div class="banner banner--info" style="margin-bottom:4px">${App.icon('phone')}<div>A verification code will be sent to your registered mobile ending <b>••••10</b> at each new sign-in.</div></div>`,
        { title: 'Enable two-factor authentication', icon: 'key',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="EmpSettings.confirm2FA()">${App.icon('shieldcheck')} Turn on 2FA</button>` });
    },
    confirm2FA() { S.twofa = true; App.modal.close(); App.toast('Two-factor authentication enabled', 'shieldcheck'); App.reload(); },
    revoke(i) {
      const s = S.sessions[i]; if (!s || s.revoked || s.current) return;
      s.revoked = true; App.toast('Signed out ' + s.browser, 'lock'); App.reload();
    },

    // ---- billing ----
    upgradePlan() {
      const tiers = [
        { name: 'Starter',      price: '$29', per: '/mo', feat: '20K API calls · 1,000 verifications' },
        { name: 'Professional', price: '$99', per: '/mo', feat: '100K API calls · 5,000 verifications' },
        { name: 'Enterprise',   price: 'Custom', per: '',  feat: 'Unlimited volume · SSO · dedicated SLA' },
      ];
      const cards = tiers.map(t => {
        const current = t.name === S.plan;
        return `<div class="eset-tier ${current ? 'is-current' : ''}">
          <div class="row between" style="align-items:center">
            <b style="font-size:14.5px">${App.esc(t.name)}</b>
            ${current ? App.ui.pill('Current', 'accent') : ''}
          </div>
          <div style="margin:8px 0 10px"><span class="num" style="font-size:22px;font-weight:700;letter-spacing:-.02em">${App.esc(t.price)}</span><span class="muted" style="font-size:12.5px">${App.esc(t.per)}</span></div>
          <div class="muted" style="font-size:12.5px;line-height:1.5;margin-bottom:12px">${App.esc(t.feat)}</div>
          ${current
            ? `<button class="btn btn--soft btn--sm btn--block" disabled>${App.icon('check')} Current plan</button>`
            : `<button class="btn ${t.name === 'Enterprise' ? '' : 'btn--primary'} btn--sm btn--block" onclick="EmpSettings.choosePlan('${jsq(t.name)}')">${t.name === 'Enterprise' ? 'Contact sales' : 'Choose ' + t.name}</button>`}
        </div>`;
      }).join('');
      App.modal.open(`<div class="eset-tiers">${cards}</div>`, { title: 'Change plan', icon: 'sparkles', wide: true });
    },
    choosePlan(name) {
      App.modal.close();
      if (name === 'Enterprise') { App.toast('Our team will reach out about Enterprise', 'mail'); return; }
      S.plan = name; App.toast('Plan changed to ' + name, 'checkcircle'); App.reload();
    },
    updatePayment() {
      App.modal.open(`
        <div class="field"><label class="label">Card number</label>
          <div class="input--icon">${ICO.card}<input class="input mono" id="esetCardNum" inputmode="numeric" placeholder="1234 5678 9012 3456"></div></div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label">Expiry</label><input class="input mono" id="esetCardExp" placeholder="MM/YY"></div>
          <div class="field" style="margin-bottom:0"><label class="label">CVC</label><input class="input mono" id="esetCardCvc" inputmode="numeric" maxlength="4" placeholder="•••"></div>
        </div>
        <div class="hint row gap-6" style="align-items:center;margin-top:12px">${App.icon('lock')} Card details are tokenised and never stored by WiN.</div>`,
        { title: 'Update payment method', icon: 'card',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="EmpSettings.savePayment()">${App.icon('check')} Save card</button>` });
      setTimeout(() => { const e = document.getElementById('esetCardNum'); if (e) e.focus(); }, 60);
    },
    savePayment() {
      const num = val('esetCardNum').replace(/\s/g, '');
      if (num.length < 12) { App.toast('Enter a valid card number', 'alert'); return; }
      S.card = { mask: '•••• •••• •••• ' + num.slice(-4), exp: val('esetCardExp') || S.card.exp };
      App.modal.close(); App.toast('Payment method updated', 'card'); App.reload();
    },
    downloadInvoice(date) { App.toast('Downloading invoice · ' + date, 'download'); },
  };

  function saveBtn(section, label) {
    return S.saved[section]
      ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" disabled>${App.icon('check')} Saved</button>`
      : `<button class="btn btn--primary" onclick="EmpSettings.save('${section}')">${App.icon('check')} ${label || 'Save Changes'}</button>`;
  }

  function roleBadge(role) {
    return role === 'Admin' ? App.ui.pill('Admin', 'accent') : App.ui.pill('Member', 'gray');
  }

  /* ---------------- tab panels ---------------- */
  function profileTab() {
    const p = S.profile;
    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('user')}<h3 class="grow">Profile</h3></div>
        <div class="card__body">
          <div class="eset-photo">
            ${App.ui.avatar(p.first + ' ' + p.last, 'xl')}
            <div>
              <div class="label" style="margin-bottom:4px">Profile picture</div>
              <button class="btn btn--soft btn--sm" onclick="EmpSettings.uploadPhoto()">${App.icon('upload')} Upload New Photo</button>
              <div class="hint" style="margin-top:6px">JPG or PNG, up to 5&nbsp;MB.</div>
            </div>
          </div>

          <div class="grid grid-2" style="margin-top:20px">
            <div class="field" style="margin-bottom:0">
              <label class="label">First Name</label>
              <input class="input" id="esetFirst" value="${App.esc(p.first)}" oninput="EmpSettings.editProfile('first',this.value)">
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Last Name</label>
              <input class="input" id="esetLast" value="${App.esc(p.last)}" oninput="EmpSettings.editProfile('last',this.value)">
            </div>
          </div>

          <div class="field" style="margin-top:16px;margin-bottom:0">
            <label class="label">Job Title</label>
            <div class="input--icon">${App.icon('briefcase')}<input class="input" value="${App.esc(p.role)}" oninput="EmpSettings.editProfile('role',this.value)"></div>
          </div>

          <div class="field" style="margin-top:16px;margin-bottom:0">
            <label class="label">Email Address</label>
            <div class="input--icon">${App.icon('mail')}<input class="input" id="esetEmail" type="email" value="${App.esc(p.email)}" oninput="EmpSettings.editProfile('email',this.value)"></div>
          </div>

          <div class="grid grid-2" style="margin-top:16px">
            <div class="field" style="margin-bottom:0">
              <label class="label">Phone Number</label>
              <div class="input--icon">${App.icon('phone')}<input class="input" value="${App.esc(p.phone)}" oninput="EmpSettings.editProfile('phone',this.value)"></div>
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Location</label>
              <div class="input--icon">${App.icon('mappin')}<input class="input" value="${App.esc(p.loc)}" oninput="EmpSettings.editProfile('loc',this.value)"></div>
            </div>
          </div>

          <div class="row" style="justify-content:flex-end;margin-top:22px">${saveBtn('profile')}</div>
        </div>
      </div>`;
  }

  function orgTab() {
    const sizeOpts = SIZES.map(s => `<option ${s === S.org.size ? 'selected' : ''}>${App.esc(s)}</option>`).join('');

    const memberRows = S.members.map((m, i) => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        ${App.ui.avatar(m.name)}
        <div class="grow" style="min-width:0">
          <div class="row gap-8" style="align-items:center">
            <b style="font-size:13.5px">${App.esc(m.name)}</b>
            ${m.you ? App.ui.pill('You', 'green', true) : m.pending ? App.ui.pill('Invited', 'amber', true) : ''}
          </div>
          <div class="muted mono" style="font-size:12px;margin-top:1px">${App.esc(m.email)}</div>
        </div>
        ${roleBadge(m.role)}
        ${m.you
          ? `<span class="faint" style="font-size:12px;font-weight:600;padding:6px 4px;white-space:nowrap">Owner</span>`
          : `<button class="eset-trash" onclick="EmpSettings.removeMember(${i})" title="Remove ${App.esc(m.name)}">${App.icon('trash')} Remove</button>`}
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('building')}<h3 class="grow">Organization</h3></div>
        <div class="card__body">
          <div class="field">
            <label class="label">Organization Name</label>
            <input class="input" value="${App.esc(S.org.name)}" oninput="EmpSettings.editOrg('name',this.value)">
          </div>
          <div class="grid grid-2">
            <div class="field" style="margin-bottom:0">
              <label class="label">Industry</label>
              <input class="input" value="${App.esc(S.org.industry)}" oninput="EmpSettings.editOrg('industry',this.value)">
            </div>
            <div class="field" style="margin-bottom:0">
              <label class="label">Organization Size</label>
              <select class="select" onchange="EmpSettings.editOrg('size',this.value)">${sizeOpts}</select>
            </div>
          </div>
          <div class="field" style="margin-top:16px;margin-bottom:0">
            <label class="label">Headquarters</label>
            <div class="input--icon">${App.icon('mappin')}<input class="input" value="${App.esc(S.org.hq)}" oninput="EmpSettings.editOrg('hq',this.value)"></div>
          </div>
          <div class="row" style="justify-content:flex-end;margin-top:22px">${saveBtn('org')}</div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('users')}<h3 class="grow">Team Members</h3>${App.ui.pill(S.members.length + ' member' + (S.members.length === 1 ? '' : 's'), 'accent')}</div>
        <div class="card__body">
          <div class="list--divided">${memberRows}</div>
          <button class="eset-invite" onclick="EmpSettings.invite()">${App.icon('plus')} Invite Team Member</button>
        </div>
      </div>`;
  }

  function notifTab() {
    const row = (arr, i, kind) => `
      <div class="eset-toggle-row" onclick="EmpSettings.toggle${kind}(${i})">
        <div class="grow" style="min-width:0">
          <b style="font-size:13.5px">${App.esc(arr[i].label)}</b>
          <div class="muted" style="font-size:12.5px;line-height:1.45;margin-top:2px;max-width:56ch">${App.esc(arr[i].desc)}</div>
        </div>
        <span class="toggle ${arr[i].on ? 'on' : ''}"></span>
      </div>`;

    const emailRows = S.email.map((_, i) => row(S.email, i, 'Email')).join('');
    const pushRows = S.push.map((_, i) => row(S.push, i, 'Push')).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('mail')}<h3 class="grow">Email Notifications</h3></div>
        <div class="card__body" style="padding-top:2px">${emailRows}</div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('bell')}<h3 class="grow">Push Notifications</h3></div>
        <div class="card__body" style="padding-top:2px">${pushRows}</div>
      </div>

      <div class="row" style="justify-content:flex-end">${saveBtn('notif', 'Save Preferences')}</div>`;
  }

  function securityTab() {
    const sessionRows = S.sessions.map((s, i) => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="eset-sesico">${ICO[s.device] || App.icon('globe')}</span>
        <div class="grow" style="min-width:0">
          <div class="row gap-8" style="align-items:center">
            <b style="font-size:13.5px">${App.esc(s.browser)}</b>
            ${s.current ? App.ui.pill('This device', 'green', true) : ''}
          </div>
          <div class="muted" style="font-size:12px;margin-top:1px">${App.esc(s.loc)} · ${App.esc(s.when)}</div>
        </div>
        ${s.current
          ? `<span class="faint" style="font-size:12px;font-weight:600;white-space:nowrap">Current session</span>`
          : s.revoked
            ? `<span class="pill pill--gray pill--dot">Revoked</span>`
            : `<button class="eset-trash" onclick="EmpSettings.revoke(${i})" title="Revoke this session">${App.icon('x')} Revoke</button>`}
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('lock')}<h3 class="grow">Change Password</h3></div>
        <div class="card__body">
          <div class="field"><label class="label">Current password</label><input class="input" id="esetCurPw" type="password" placeholder="••••••••" autocomplete="current-password"></div>
          <div class="grid grid-2">
            <div class="field" style="margin-bottom:0"><label class="label">New password</label><input class="input" id="esetNewPw" type="password" placeholder="At least 8 characters" autocomplete="new-password"></div>
            <div class="field" style="margin-bottom:0"><label class="label">Confirm new password</label><input class="input" id="esetCfPw" type="password" placeholder="Re-enter new password" autocomplete="new-password"></div>
          </div>
          <div class="row" style="justify-content:flex-end;margin-top:20px"><button class="btn btn--primary" onclick="EmpSettings.updatePassword()">${App.icon('lock')} Update Password</button></div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('key')}<h3 class="grow">Two-Factor Authentication</h3>${S.twofa ? App.ui.pill('Enabled', 'green', true) : ''}</div>
        <div class="card__body">
          <div class="row between wrap gap-12">
            <div style="max-width:54ch"><b style="font-size:13.5px">Add an extra layer of security to your account</b><div class="muted" style="font-size:12.5px;margin-top:3px">Require a one-time code from your registered mobile when signing in on a new device.</div></div>
            ${S.twofa
              ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" disabled>${App.icon('shieldcheck')} 2FA Enabled</button>`
              : `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" onclick="EmpSettings.enable2FA()">${App.icon('key')} Enable 2FA</button>`}
          </div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('layers')}<h3 class="grow">Active Sessions</h3></div>
        <div class="card__body">
          <p class="muted" style="font-size:12.5px;margin-bottom:8px">Devices currently signed in to this account. Revoke any you don't recognise.</p>
          <div class="list--divided">${sessionRows}</div>
        </div>
      </div>`;
  }

  function billingTab() {
    const usageTiles = S.usage.map(u => `
      <div class="eset-usage">
        <div class="muted" style="font-size:12px">${App.esc(u.label)}</div>
        <div class="num" style="font-size:20px;font-weight:700;letter-spacing:-.01em;margin:5px 0 9px">${App.esc(u.disp)}</div>
        ${App.ui.bar(u.pct, u.c)}
      </div>`).join('');

    const invoiceRows = S.invoices.map(inv => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="eset-sesico" style="background:var(--green-50);color:var(--green-700)">${App.icon('filecheck')}</span>
        <div class="grow" style="min-width:0">
          <b style="font-size:13.5px">${App.esc(inv.date)}</b>
          <div class="muted" style="font-size:12px;margin-top:1px">Professional plan · monthly</div>
        </div>
        <span class="num" style="font-size:13.5px;font-weight:600">${App.esc(inv.amt)}</span>
        ${App.ui.pill(inv.status, 'green', true)}
        <button class="eset-ghost" onclick="EmpSettings.downloadInvoice('${jsq(inv.date)}')" title="Download invoice">${App.icon('download')} Download</button>
      </div>`).join('');

    return `
      <div class="card card--accent reveal">
        <div class="card__body">
          <div class="row between wrap gap-16" style="align-items:center">
            <div class="row gap-14" style="align-items:center;min-width:0">
              <div class="kpi__icon" style="width:46px;height:46px;background:var(--accent-weak);color:var(--accent-strong)">${App.icon('sparkles')}</div>
              <div style="min-width:0">
                <div class="muted" style="font-size:12px">Current Plan</div>
                <div class="row gap-8" style="align-items:baseline"><b style="font-size:18px">${App.esc(S.plan)}</b><span class="muted num" style="font-size:13px">$99/mo</span></div>
              </div>
            </div>
            <button class="btn btn--primary" onclick="EmpSettings.upgradePlan()">${App.icon('trend')} Upgrade Plan</button>
          </div>
          <div class="eset-usagegrid">${usageTiles}</div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${ICO.card}<h3 class="grow">Payment Method</h3></div>
        <div class="card__body">
          <div class="row between wrap gap-12" style="align-items:center">
            <div class="row gap-14" style="align-items:center">
              <span class="eset-cardface">${ICO.card}</span>
              <div>
                <b class="mono" style="font-size:14px;letter-spacing:.06em">${App.esc(S.card.mask)}</b>
                <div class="muted" style="font-size:12px;margin-top:2px">Expires ${App.esc(S.card.exp)}</div>
              </div>
            </div>
            <button class="btn btn--soft" onclick="EmpSettings.updatePayment()">${App.icon('edit')} Update</button>
          </div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('file')}<h3 class="grow">Billing History</h3></div>
        <div class="card__body"><div class="list--divided">${invoiceRows}</div></div>
      </div>`;
  }

  function panel() {
    if (S.tab === 'org') return orgTab();
    if (S.tab === 'notif') return notifTab();
    if (S.tab === 'security') return securityTab();
    if (S.tab === 'billing') return billingTab();
    return profileTab();
  }

  App.registerView('emp-settings', {
    title: 'Settings',
    subtitle: 'Manage your account and preferences',
    render(ctx) {
      // honour a ?tab=/params.tab deep-link once, then let in-view tab clicks win
      const p = ctx.params && ctx.params.tab;
      if (p && p !== S._lastParam && TABS.some(t => t.id === p)) { S.tab = p; S._lastParam = p; }

      const rail = TABS.map(t => `
        <button class="eset-tab ${S.tab === t.id ? 'is-active' : ''}" onclick="EmpSettings.setTab('${t.id}')">
          ${t.icon === 'card' ? ICO.card : App.icon(t.icon)}
          <span class="grow"><b>${App.esc(t.label)}</b><span class="eset-tab__sub">${App.esc(t.sub)}</span></span>
        </button>`).join('');

      return `<div class="page fade-in">
        <style>
          .eset-hero-meta .avatar{ flex-shrink:0; }
          .eset-grid{ display:grid; grid-template-columns:236px minmax(0,1fr); gap:24px; align-items:start; }
          @media (max-width:880px){ .eset-grid{ grid-template-columns:1fr; } }
          .eset-rail{ position:sticky; top:8px; display:flex; flex-direction:column; gap:4px; }
          @media (max-width:880px){ .eset-rail{ position:static; flex-direction:row; overflow-x:auto; padding-bottom:6px; gap:8px; } }
          .eset-rail::-webkit-scrollbar{ height:5px; }
          .eset-rail::-webkit-scrollbar-thumb{ background:var(--line); border-radius:9px; }
          .eset-tab{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; padding:11px 13px; border-radius:var(--r-sm);
            border:1px solid transparent; color:var(--ink-2); cursor:pointer; transition:.13s; white-space:nowrap; }
          .eset-tab:hover{ background:var(--surface-2); }
          .eset-tab .ico{ color:var(--faint); transition:.13s; flex-shrink:0; }
          .eset-tab b{ font-size:13.5px; font-weight:600; display:block; }
          .eset-tab__sub{ font-size:11.5px; color:var(--faint); display:block; margin-top:1px; }
          .eset-tab.is-active{ background:var(--accent-weak); border-color:var(--accent-ring); color:var(--accent-strong); }
          .eset-tab.is-active .ico{ color:var(--accent); }
          .eset-tab.is-active .eset-tab__sub{ color:var(--accent-strong); opacity:.72; }
          .eset-panel{ display:flex; flex-direction:column; gap:20px; min-width:0; }
          .eset-photo{ display:flex; align-items:center; gap:16px; }
          .eset-trash{ display:inline-flex; align-items:center; gap:6px; padding:6px 11px; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--muted); transition:.12s; white-space:nowrap; }
          .eset-trash:hover{ background:var(--red-50); color:var(--red-700); }
          .eset-trash:hover .ico{ color:var(--red-600); }
          .eset-ghost{ display:inline-flex; align-items:center; gap:6px; padding:6px 11px; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--accent-strong); transition:.12s; white-space:nowrap; }
          .eset-ghost:hover{ background:var(--accent-weak); }
          .eset-invite{ display:flex; align-items:center; justify-content:center; gap:8px; width:100%; margin-top:14px; padding:11px; border-radius:var(--r);
            border:1px dashed var(--line); background:transparent; color:var(--muted); font-size:13px; font-weight:600; cursor:pointer; transition:.13s; }
          .eset-invite:hover{ border-color:var(--accent); color:var(--accent-strong); background:var(--accent-weak); }
          .eset-invite .ico{ width:15px; height:15px; }
          .eset-toggle-row{ display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--line-2); cursor:pointer; }
          .eset-toggle-row:first-child{ padding-top:4px; }
          .eset-toggle-row:last-child{ border-bottom:none; padding-bottom:2px; }
          .eset-sesico{ width:38px; height:38px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; background:var(--accent-weak); color:var(--accent-strong); }
          .eset-sesico .ico{ width:19px; height:19px; }
          .eset-usagegrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:20px; }
          @media (max-width:640px){ .eset-usagegrid{ grid-template-columns:1fr; } }
          .eset-usage{ background:var(--surface-2); border:1px solid var(--line); border-radius:var(--r); padding:14px 15px; }
          .eset-cardface{ width:46px; height:32px; border-radius:7px; display:grid; place-items:center; flex-shrink:0;
            background:linear-gradient(135deg,var(--accent),var(--accent-strong)); color:#fff; }
          .eset-cardface .ico{ width:22px; height:22px; }
          .eset-tiers{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media (max-width:620px){ .eset-tiers{ grid-template-columns:1fr; } }
          .eset-tier{ border:1px solid var(--line); border-radius:var(--r); padding:16px; }
          .eset-tier.is-current{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-ring); background:var(--accent-weak); }
        </style>

        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('settings')} Account &amp; workspace</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div style="min-width:0">
                <h1 class="h-grad">Account &amp; workspace settings</h1>
                <p class="lead">Profile, organisation, notifications, security and billing — everything for ${App.esc(S.org.name)}, in one place.</p>
                <div class="row gap-10 mt-16 wrap eset-hero-meta" style="align-items:center">
                  ${App.ui.avatar(S.profile.first + ' ' + S.profile.last, 'sm')}
                  <span style="font-weight:600;font-size:13.5px">${App.esc(S.profile.first + ' ' + S.profile.last)}</span>
                  ${App.ui.pill(S.profile.role, 'accent')}
                  <span class="pill pill--gray">${App.icon('building')} ${App.esc(S.org.name)}</span>
                  ${S.twofa ? App.ui.pill('2FA on', 'green', true) : ''}
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="App.navigate('emp-dashboard')">${App.icon('home')} Dashboard</button>
                <button class="btn btn--primary" onclick="App.navigate('emp-verifications')">${App.icon('shieldcheck')} Verifications</button>
              </div>
            </div>
          </div>
        </div>

        <div class="eset-grid">
          <nav class="eset-rail">${rail}</nav>
          <div class="eset-panel">${panel()}</div>
        </div>
      </div>`;
    }
  });
})();
