/* Government · Settings — the WiN Registry Console preferences for the signed-in
   officer (R. Deshmukh, Ministry of Labour & Employment). A left sub-tab rail
   switches sections: Department, Access & Roles, Data Policy, Integrations,
   Notifications. Every control drives visible state via a window controller +
   App.reload() / App.modal / App.toast — no dead buttons. Deep-linkable via ?tab=. */
(function () {
  // ---- inline glyphs not in the base App.icon set ----
  const svg = (p, s) => `<svg class="ico" width="${s || 18}" height="${s || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    sync: svg('<path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-7.5 4M3 4v4h4"/><path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 7.5-4M21 20v-4h-4"/>'),
  };

  const TABS = [
    { id: 'department', label: 'Department',    icon: 'landmark', sub: 'Ministry & jurisdiction' },
    { id: 'access',     label: 'Access & Roles', icon: 'users',   sub: 'Officers & permissions' },
    { id: 'policy',     label: 'Data Policy',    icon: 'shield',   sub: 'DPDP, retention & audit' },
    { id: 'integrations', label: 'Integrations', icon: 'plug',     sub: 'Source-system connectors' },
    { id: 'notif',      label: 'Notifications',  icon: 'bell',     sub: 'Alert preferences' },
  ];

  const ROLES = {
    Admin:     'Full registry control — manage officers, policy & integrations',
    Director:  'Approve reports, resolve grievances, view all districts',
    Secretary: 'Read-only oversight & sign-off on published reports',
    Auditor:   'Read-only access to the audit trail and compliance logs',
  };
  const JURISDICTIONS = ['All India (Central)', 'State Level (Maharashtra)', 'District Level'];
  const RETENTION = ['1 year', '3 years', '5 years', '7 years'];

  // ---- in-memory controller state (survives App.reload re-renders) ----
  const S = {
    tab: 'department', _lastParam: null,
    saved: { department: false, policy: false, notif: false },
    twofa: true,

    dept: {
      ministry: 'Ministry of Labour & Employment',
      division: 'Labour Welfare Division',
      registry: 'Workforce Identity Network',
      officer:  'R. Deshmukh',
      office:   'Shram Shakti Bhawan, New Delhi',
      email:    'commissioner@labour.mh.gov.in',
      jurisdiction: 'State Level (Maharashtra)',
    },

    officers: [
      { name: 'R. Deshmukh',   email: 'commissioner@labour.mh.gov.in', role: 'Admin',     you: true },
      { name: 'Admin Officer', email: 'admin@labour.gov.in',            role: 'Admin' },
      { name: 'A. Krishnan',   email: 'director@labour.gov.in',         role: 'Director' },
      { name: 'M. Iyer',       email: 'secretary@labour.gov.in',        role: 'Secretary' },
    ],

    notif: [
      { label: 'Grievance escalations',      desc: 'When a worker grievance is escalated to your office for review.',        on: true },
      { label: 'Enrollment milestones',      desc: 'Every time a district or state crosses an enrollment target.',           on: true },
      { label: 'Compliance violations',      desc: 'Employer or platform breaches flagged against labour compliances.',      on: true },
      { label: 'System alerts',              desc: 'Source-connector outages, sync failures and registry incidents.',        on: true },
      { label: 'Monthly report generation',  desc: 'A digest email when the monthly employment summary is compiled.',        on: false },
    ],

    policy: {
      retention: '5 years',
      toggles: [
        { key: 'consent',   label: 'Consent required before data sharing',      desc: 'No verified record leaves the registry without an active, logged worker consent.', on: true },
        { key: 'purpose',   label: 'Purpose-limitation enforcement',            desc: 'Data may only be used for the declared scheme or verification purpose.',           on: true },
        { key: 'anon',      label: 'Anonymise data in analytics exports',       desc: 'Strip direct identifiers from demographic and aggregate report exports.',          on: true },
        { key: 'crossdept', label: 'Allow cross-department data sharing',       desc: 'Permit other empanelled departments to query the golden record (with consent).',   on: false },
        { key: 'expire',    label: 'Auto-expire access grants after 90 days',   desc: 'Officer and partner access tokens lapse automatically unless renewed.',            on: true },
      ],
    },

    audit: [
      { ic: 'lock',      text: 'Login from Chrome, New Delhi',                    when: 'Active now',   live: true },
      { ic: 'download',  text: 'Report downloaded: Nov Employment Summary',      when: '2 hours ago' },
      { ic: 'message',   text: 'Grievance #GRV-2024-1847 reviewed',              when: '4 hours ago' },
      { ic: 'shieldcheck', text: 'Consent policy updated by Admin Officer',      when: 'Yesterday, 18:20' },
      { ic: 'plug',      text: 'e-Shram connector re-authorised',                when: '2 days ago' },
    ],

    connectors: [
      { key: 'epfo',       label: 'EPFO / UAN',       purpose: 'Provident fund & employment history', color: '#2f5fd0', ic: 'landmark',    on: true,  synced: '4 min ago',  status: 'Connected' },
      { key: 'itd',        label: 'Income Tax Dept',  purpose: 'Verified income & Form-26AS',          color: '#6b4fc7', ic: 'file',        on: true,  synced: '11 min ago', status: 'Connected' },
      { key: 'esic',       label: 'ESIC',             purpose: 'Insurance & medical benefit status',   color: '#1F9E6C', ic: 'shieldcheck', on: true,  synced: '9 min ago',  status: 'Connected' },
      { key: 'gstn',       label: 'GSTN',             purpose: 'Employer / business verification',     color: '#c07d10', ic: 'building',    on: true,  synced: '22 min ago', status: 'Connected' },
      { key: 'aadhaar',    label: 'Aadhaar / UIDAI',  purpose: 'Identity resolution & de-duplication', color: '#d64545', ic: 'fingerprint', on: true,  synced: '2 min ago',  status: 'Connected' },
      { key: 'digilocker', label: 'DigiLocker',       purpose: 'Consent-driven document fetch',        color: '#2B3990', ic: 'lock',        on: true,  synced: '6 min ago',  status: 'Connected' },
      { key: 'eshram',     label: 'e-Shram',          purpose: 'Unorganised-worker registry link',     color: '#0d9488', ic: 'idcard',      on: false, synced: '—',          status: 'Configuring' },
    ],

    api: { endpoint: 'https://api.win.gov.in/v1/registry', key: 'win_live_••••••••••3f2a' },
  };

  const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const alive = () => App.state.route === 'gov-settings';

  window.GovSettings = {
    setTab(t) { S.tab = t; App.reload(); },

    // silent syncer (no reload → text inputs keep focus while typing)
    editDept(k, v) { S.dept[k] = v; },

    save(section) {
      S.saved[section] = true; App.reload();
      const msg = section === 'policy' ? 'Data-policy settings saved'
        : section === 'notif' ? 'Notification preferences saved'
        : 'Department details saved';
      App.toast(msg);
      setTimeout(() => { S.saved[section] = false; if (alive()) App.reload(); }, 2000);
    },

    /* ---- notifications ---- */
    toggleNotif(i) { if (S.notif[i]) { S.notif[i].on = !S.notif[i].on; App.reload(); } },

    /* ---- data policy ---- */
    togglePolicy(i) { if (S.policy.toggles[i]) { S.policy.toggles[i].on = !S.policy.toggles[i].on; App.reload(); } },
    setRetention(v) { S.policy.retention = v; },
    viewAudit() {
      const rows = S.audit.map(a => `
        <div class="minirow" style="border-bottom:1px solid var(--line-2)">
          <span class="gset-audico">${App.icon(a.ic)}</span>
          <div class="grow" style="min-width:0"><b style="font-size:13px">${App.esc(a.text)}</b></div>
          <span class="faint num" style="font-size:11.5px;white-space:nowrap">${App.esc(a.when)}</span>
        </div>`).join('');
      App.modal.open(
        `<p class="muted" style="font-size:12.5px;line-height:1.6;margin-bottom:12px">Every officer action is written to an append-only, tamper-evident log retained per government security policy.</p>
         <div class="list--divided">${rows}</div>`,
        { title: 'Audit trail', icon: 'file', wide: true });
    },

    /* ---- access & roles ---- */
    invite() {
      const opts = Object.keys(ROLES).map(r => `<option value="${r}">${r} — ${App.esc(ROLES[r])}</option>`).join('');
      App.modal.open(`
        <div class="field"><label class="label">Official email (.gov.in)</label>
          <div class="input--icon">${App.icon('mail')}<input class="input" id="gsInviteEmail" type="email" placeholder="name@labour.gov.in"></div></div>
        <div class="field" style="margin-bottom:0"><label class="label">Role</label>
          <select class="select" id="gsInviteRole">${opts}</select></div>
        <div class="banner banner--info" style="margin-top:14px">${App.icon('shield')}<div>The officer receives an invite and must clear 2FA on first sign-in. All actions are audited.</div></div>`,
        { title: 'Invite an officer', icon: 'users',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="GovSettings.sendInvite()">${App.icon('send')} Send invitation</button>` });
      setTimeout(() => { const e = document.getElementById('gsInviteEmail'); if (e) e.focus(); }, 60);
    },
    sendInvite() {
      const email = val('gsInviteEmail');
      const role = (document.getElementById('gsInviteRole') || {}).value || 'Director';
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { App.toast('Enter a valid official email', 'alert'); return; }
      if (!/\.gov\.in$/i.test(email)) { App.toast('Only .gov.in email addresses can be authorised', 'alert'); return; }
      if (S.officers.some(o => o.email.toLowerCase() === email.toLowerCase())) { App.toast('That officer is already authorised', 'alert'); return; }
      S.officers.push({ name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email, role, pending: true });
      App.modal.close(); App.toast('Invitation sent to ' + email, 'send'); App.reload();
    },
    changeRole(i) {
      const o = S.officers[i]; if (!o || o.you) return;
      const opts = Object.keys(ROLES).map(r => `<option value="${r}" ${r === o.role ? 'selected' : ''}>${r} — ${App.esc(ROLES[r])}</option>`).join('');
      App.modal.open(`
        <div class="row gap-12" style="align-items:center;margin-bottom:16px">${App.ui.avatar(o.name)}<div style="min-width:0"><b style="font-size:14px">${App.esc(o.name)}</b><div class="muted mono" style="font-size:12px">${App.esc(o.email)}</div></div></div>
        <div class="field" style="margin-bottom:0"><label class="label">Role</label><select class="select" id="gsRoleSel">${opts}</select></div>`,
        { title: 'Change officer role', icon: 'key',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--primary" onclick="GovSettings.saveRole(${i})">${App.icon('check')} Update role</button>` });
    },
    saveRole(i) {
      const o = S.officers[i]; if (!o) { App.modal.close(); return; }
      const r = (document.getElementById('gsRoleSel') || {}).value || o.role;
      o.role = r; App.modal.close(); App.toast(o.name + ' is now ' + r, 'checkcircle'); App.reload();
    },
    removeOfficer(i) {
      const o = S.officers[i]; if (!o || o.you) return;
      App.modal.open(
        `<p class="muted" style="font-size:13.5px;line-height:1.6">Revoke registry access for <b style="color:var(--ink)">${App.esc(o.name)}</b> (${App.esc(o.email)})? They lose access immediately; the change is written to the audit log.</p>`,
        { title: 'Revoke officer access', icon: 'trash',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--danger" onclick="GovSettings.confirmRemove(${i})">${App.icon('trash')} Revoke access</button>` });
    },
    confirmRemove(i) {
      const o = S.officers[i]; if (!o || o.you) { App.modal.close(); return; }
      S.officers.splice(i, 1); App.modal.close(); App.toast(o.name + ' access revoked', 'x'); App.reload();
    },
    manage2FA() {
      App.modal.open(
        `<div class="banner banner--green" style="margin-bottom:14px">${App.icon('shieldcheck')}<div>Two-factor authentication is <b>mandatory</b> for all government accounts and cannot be disabled.</div></div>
         <p class="muted" style="font-size:13px;line-height:1.6">Re-register your authenticator device or hardware key. A one-time code will be required on the next sign-in.</p>`,
        { title: 'Two-factor authentication', icon: 'key',
          foot: `<button class="btn" onclick="App.modal.close()">Close</button>
                 <button class="btn btn--primary" onclick="App.modal.close();App.toast('New 2FA device registered','shieldcheck')">${App.icon('phone')} Re-register device</button>` });
    },

    /* ---- integrations ---- */
    toggleConnector(i, e) {
      if (e) e.stopPropagation();
      const c = S.connectors[i]; if (!c) return;
      c.on = !c.on;
      c.status = c.on ? 'Connected' : 'Disconnected';
      if (c.on && c.synced === '—') c.synced = 'just now';
      App.toast(c.label + (c.on ? ' connected' : ' disconnected'), c.on ? 'plug' : 'x');
      App.reload();
    },
    manageConnector(i) {
      const c = S.connectors[i]; if (!c) return;
      App.modal.open(`
        <div class="row gap-12" style="align-items:center;margin-bottom:14px">
          <span class="gset-srcglyph" style="background:${c.color}1a;color:${c.color}">${App.icon(c.ic)}</span>
          <div class="grow" style="min-width:0"><b style="font-size:15px">${App.esc(c.label)}</b><div class="muted" style="font-size:12.5px">${App.esc(c.purpose)}</div></div>
          ${c.on ? App.ui.pill('Connected', 'green', true) : App.ui.pill(c.status, 'gray', true)}
        </div>
        <div class="statstrip" style="border-radius:var(--r);overflow:hidden">
          <div class="statstrip__cell"><div class="statstrip__label">Last synced</div><div class="statstrip__val" style="font-size:15px">${App.esc(c.synced)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Protocol</div><div class="statstrip__val" style="font-size:15px">REST · OAuth2</div></div>
          <div class="statstrip__cell" style="border-right:none"><div class="statstrip__label">Consent</div><div class="statstrip__val" style="font-size:15px">Required</div></div>
        </div>`,
        { title: 'Manage connection', icon: 'plug', wide: true,
          foot: `${c.on ? `<button class="btn" onclick="App.modal.close();App.toast('Syncing ${jsq(c.label)}…','sync');setTimeout(function(){App.toast('${jsq(c.label)} synced','checkcircle')},1100)">${ICO.sync} Sync now</button>` : ''}
                 <button class="btn ${c.on ? 'btn--danger' : 'btn--primary'}" onclick="App.modal.close();GovSettings.toggleConnector(${i})">${c.on ? App.icon('x') + ' Disconnect' : App.icon('plug') + ' Connect'}</button>` });
    },
    copyEndpoint() { App.toast('Endpoint copied to clipboard', 'copy'); },
    regenerateKey() {
      App.modal.open(
        `<div class="banner banner--amber" style="margin-bottom:12px">${App.icon('alert')}<div>Regenerating the key immediately invalidates the current one. Any integration using it will stop until updated.</div></div>
         <p class="muted" style="font-size:13px;line-height:1.6">This action is logged to the audit trail against your account.</p>`,
        { title: 'Regenerate API key', icon: 'key',
          foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
                 <button class="btn btn--danger" onclick="GovSettings.confirmRegen()">${App.icon('key')} Regenerate key</button>` });
    },
    confirmRegen() {
      const rnd = Math.random().toString(16).slice(2, 6);
      S.api.key = 'win_live_••••••••••' + rnd;
      App.modal.close(); App.toast('API key regenerated', 'key'); App.reload();
    },
  };

  function saveBtn(section, label) {
    return S.saved[section]
      ? `<button class="btn" style="background:var(--green-600);color:#fff;border-color:transparent" disabled>${App.icon('check')} Saved</button>`
      : `<button class="btn btn--accent" onclick="GovSettings.save('${section}')">${App.icon('check')} ${label || 'Save Changes'}</button>`;
  }
  function roleBadge(role) {
    return role === 'Admin' ? App.ui.pill(role, 'accent') : App.ui.pill(role, 'gray');
  }

  /* ---------------- tab panels ---------------- */
  function departmentTab() {
    const d = S.dept;
    const jOpts = JURISDICTIONS.map(j => `<option ${j === d.jurisdiction ? 'selected' : ''}>${App.esc(j)}</option>`).join('');
    return `
      <div class="card reveal">
        <div class="card__body">
          <div class="row gap-14" style="align-items:center">
            <span class="gset-emblem">${App.icon('landmark')}</span>
            <div class="grow" style="min-width:0">
              <b style="font-size:17px;display:block">${App.esc(d.ministry)}</b>
              <div class="muted" style="font-size:12.5px;margin-top:2px">Government of India · Registry Data Fiduciary</div>
            </div>
            ${App.ui.pill(d.jurisdiction, 'accent')}
          </div>
          <div class="statstrip gset-strip">
            <div class="statstrip__cell"><div class="statstrip__label">Records governed</div><div class="statstrip__val num">51,84,300</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Authorised officers</div><div class="statstrip__val num">${S.officers.length}</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Live sources</div><div class="statstrip__val num">${S.connectors.filter(c => c.on).length} / ${S.connectors.length}</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Consent compliance</div><div class="statstrip__val num">100%</div></div>
          </div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('landmark')}<h3 class="grow">Department Information</h3></div>
        <div class="card__body">
          <div class="grid grid-2">
            <div class="field" style="margin-bottom:0"><label class="label">Ministry / Department</label>
              <input class="input" value="${App.esc(d.ministry)}" oninput="GovSettings.editDept('ministry',this.value)"></div>
            <div class="field" style="margin-bottom:0"><label class="label">Division</label>
              <input class="input" value="${App.esc(d.division)}" oninput="GovSettings.editDept('division',this.value)"></div>
          </div>
          <div class="grid grid-2" style="margin-top:16px">
            <div class="field" style="margin-bottom:0"><label class="label">Registry</label>
              <input class="input" value="${App.esc(d.registry)}" oninput="GovSettings.editDept('registry',this.value)"></div>
            <div class="field" style="margin-bottom:0"><label class="label">Jurisdiction</label>
              <select class="select" onchange="GovSettings.editDept('jurisdiction',this.value)">${jOpts}</select></div>
          </div>
          <div class="field" style="margin-top:16px;margin-bottom:0"><label class="label">Nodal Officer</label>
            <div class="input--icon">${App.icon('user')}<input class="input" value="${App.esc(d.officer)}" oninput="GovSettings.editDept('officer',this.value)"></div></div>
          <div class="field" style="margin-top:16px;margin-bottom:0"><label class="label">Official Email</label>
            <div class="input--icon">${App.icon('mail')}<input class="input" type="email" value="${App.esc(d.email)}" oninput="GovSettings.editDept('email',this.value)"></div></div>
          <div class="field" style="margin-top:16px;margin-bottom:0"><label class="label">Office Location</label>
            <div class="input--icon">${App.icon('mappin')}<input class="input" value="${App.esc(d.office)}" oninput="GovSettings.editDept('office',this.value)"></div></div>
          <div class="row" style="justify-content:flex-end;margin-top:22px">${saveBtn('department')}</div>
        </div>
      </div>`;
  }

  function accessTab() {
    const rows = S.officers.map((o, i) => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        ${App.ui.avatar(o.name)}
        <div class="grow" style="min-width:0">
          <div class="row gap-8" style="align-items:center">
            <b style="font-size:13.5px">${App.esc(o.name)}</b>
            ${o.you ? App.ui.pill('You', 'green', true) : o.pending ? App.ui.pill('Invited', 'amber', true) : ''}
          </div>
          <div class="muted mono" style="font-size:12px;margin-top:1px">${App.esc(o.email)}</div>
        </div>
        ${roleBadge(o.role)}
        ${o.you
          ? `<span class="faint" style="font-size:12px;font-weight:600;padding:6px 4px;white-space:nowrap">Owner</span>`
          : `<button class="gset-ghost" onclick="GovSettings.changeRole(${i})" title="Change role">${App.icon('key')} Role</button>
             <button class="gset-trash" onclick="GovSettings.removeOfficer(${i})" title="Revoke access">${App.icon('trash')} Revoke</button>`}
      </div>`).join('');

    const roleLegend = Object.keys(ROLES).map(r => `
      <div class="gset-rolecard">
        <div class="row gap-8" style="align-items:center;margin-bottom:5px">${roleBadge(r)}</div>
        <div class="muted" style="font-size:12px;line-height:1.5">${App.esc(ROLES[r])}</div>
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('users')}<h3 class="grow">Authorised Officers</h3>${App.ui.pill(S.officers.length + ' officer' + (S.officers.length === 1 ? '' : 's'), 'accent')}</div>
        <div class="card__body">
          <div class="list--divided">${rows}</div>
          <button class="gset-invite" onclick="GovSettings.invite()">${App.icon('plus')} Invite an officer</button>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('key')}<h3 class="grow">Role Permissions</h3></div>
        <div class="card__body"><div class="gset-rolegrid">${roleLegend}</div></div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('shield')}<h3 class="grow">Two-Factor Authentication</h3>${App.ui.pill('2FA Enabled', 'green', true)}</div>
        <div class="card__body">
          <div class="row between wrap gap-12" style="align-items:center">
            <div style="max-width:56ch"><b style="font-size:13.5px">Mandatory for all government accounts</b><div class="muted" style="font-size:12.5px;margin-top:3px">A one-time code from your registered device is required on every new sign-in. This cannot be turned off.</div></div>
            <button class="btn btn--soft" onclick="GovSettings.manage2FA()">${App.icon('key')} Manage device</button>
          </div>
        </div>
      </div>`;
  }

  function policyTab() {
    const toggleRows = S.policy.toggles.map((t, i) => `
      <div class="gset-toggle-row" onclick="GovSettings.togglePolicy(${i})">
        <div class="grow" style="min-width:0">
          <b style="font-size:13.5px">${App.esc(t.label)}</b>
          <div class="muted" style="font-size:12.5px;line-height:1.45;margin-top:2px;max-width:60ch">${App.esc(t.desc)}</div>
        </div>
        <span class="toggle ${t.on ? 'on' : ''}"></span>
      </div>`).join('');

    const retOpts = RETENTION.map(r => `<option ${r === S.policy.retention ? 'selected' : ''}>${App.esc(r)}</option>`).join('');

    const auditRows = S.audit.slice(0, 3).map(a => `
      <div class="minirow" style="border-bottom:1px solid var(--line-2)">
        <span class="gset-audico ${a.live ? 'is-live' : ''}">${App.icon(a.ic)}</span>
        <div class="grow" style="min-width:0"><b style="font-size:13px">${App.esc(a.text)}</b></div>
        ${a.live ? App.ui.pill(a.when, 'green', true) : `<span class="faint num" style="font-size:11.5px;white-space:nowrap">${App.esc(a.when)}</span>`}
      </div>`).join('');

    return `
      <div class="banner banner--accent reveal" style="margin-bottom:0">${App.icon('shieldcheck')}
        <div class="grow"><b>Digital Personal Data Protection Act, 2023</b><div style="font-size:12px;opacity:.85;margin-top:2px">The registry operates as a Data Fiduciary. All processing is consent-driven, purpose-limited and audited.</div></div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('lock')}<h3 class="grow">Governance Controls</h3></div>
        <div class="card__body" style="padding-top:2px">${toggleRows}</div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('database')}<h3 class="grow">Data Retention</h3></div>
        <div class="card__body">
          <div class="row between wrap gap-16" style="align-items:flex-end">
            <div class="field" style="margin-bottom:0;max-width:260px;flex:1">
              <label class="label">Retain verified records for</label>
              <select class="select" onchange="GovSettings.setRetention(this.value)">${retOpts}</select>
              <div class="hint" style="margin-top:6px">After this window, records are archived and access tokens purged.</div>
            </div>
            ${saveBtn('policy', 'Save Policy')}
          </div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('file')}<h3 class="grow">Audit Log</h3></div>
        <div class="card__body">
          <p class="muted" style="font-size:12.5px;margin-bottom:8px">All actions are logged and audited per government security policy.</p>
          <div class="list--divided">${auditRows}</div>
          <button class="gset-invite" style="margin-top:12px" onclick="GovSettings.viewAudit()">${App.icon('eye')} View full audit trail</button>
        </div>
      </div>`;
  }

  function integrationsTab() {
    const cards = S.connectors.map((c, i) => `
      <button class="card card--pad card--hover reveal gset-conn" onclick="GovSettings.manageConnector(${i})">
        <div class="row between" style="align-items:flex-start">
          <span class="gset-srcglyph" style="background:${c.color}1a;color:${c.color}">${App.icon(c.ic)}</span>
          ${c.on ? App.ui.pill('Connected', 'green', true) : App.ui.pill(c.status, 'gray', true)}
        </div>
        <b style="font-size:14.5px;display:block;margin-top:13px">${App.esc(c.label)}</b>
        <div class="muted" style="font-size:12px;line-height:1.45;margin-top:2px;min-height:34px">${App.esc(c.purpose)}</div>
        <div class="row between" style="align-items:center;margin-top:10px;border-top:1px solid var(--line-2);padding-top:11px">
          <span class="faint" style="font-size:11.5px">Synced <span class="num">${App.esc(c.synced)}</span></span>
          <span class="toggle ${c.on ? 'on' : ''}" onclick="GovSettings.toggleConnector(${i}, event)"></span>
        </div>
      </button>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('database')}<h3 class="grow">Source Systems</h3>${App.ui.pill(S.connectors.filter(c => c.on).length + ' live', 'green', true)}</div>
        <div class="card__body">
          <p class="muted" style="font-size:12.5px;margin-bottom:14px">Live verification runs against these government source systems. Toggle a connector, or open it to sync and manage.</p>
          <div class="gset-conngrid">${cards}</div>
        </div>
      </div>

      <div class="card reveal">
        <div class="card__head">${App.icon('code')}<h3 class="grow">Registry API</h3></div>
        <div class="card__body">
          <div class="field"><label class="label">Base endpoint</label>
            <div class="row gap-8"><input class="input mono" value="${App.esc(S.api.endpoint)}" readonly style="flex:1">
              <button class="btn btn--soft" onclick="GovSettings.copyEndpoint()">${App.icon('copy')} Copy</button></div></div>
          <div class="field" style="margin-bottom:0"><label class="label">Secret key</label>
            <div class="row gap-8"><input class="input mono" value="${App.esc(S.api.key)}" readonly style="flex:1">
              <button class="btn btn--danger" onclick="GovSettings.regenerateKey()">${App.icon('key')} Regenerate</button></div>
            <div class="hint" style="margin-top:6px">Used by empanelled partners to query the golden record. Rotations are audited.</div></div>
        </div>
      </div>`;
  }

  function notifTab() {
    const rows = S.notif.map((n, i) => `
      <div class="gset-toggle-row" onclick="GovSettings.toggleNotif(${i})">
        <div class="grow" style="min-width:0">
          <b style="font-size:13.5px">${App.esc(n.label)}</b>
          <div class="muted" style="font-size:12.5px;line-height:1.45;margin-top:2px;max-width:60ch">${App.esc(n.desc)}</div>
        </div>
        <span class="toggle ${n.on ? 'on' : ''}"></span>
      </div>`).join('');

    return `
      <div class="card reveal">
        <div class="card__head">${App.icon('bell')}<h3 class="grow">Alert Notifications</h3></div>
        <div class="card__body" style="padding-top:2px">${rows}</div>
      </div>
      <div class="row reveal" style="justify-content:flex-end">${saveBtn('notif', 'Save Preferences')}</div>`;
  }

  function panel() {
    if (S.tab === 'access') return accessTab();
    if (S.tab === 'policy') return policyTab();
    if (S.tab === 'integrations') return integrationsTab();
    if (S.tab === 'notif') return notifTab();
    return departmentTab();
  }

  App.registerView('gov-settings', {
    title: 'Settings',
    subtitle: 'Manage your account and department preferences',
    render(ctx) {
      // honour a ?tab= / params.tab deep-link once, then let in-view clicks win
      const p = ctx.params && ctx.params.tab;
      if (p && p !== S._lastParam && TABS.some(t => t.id === p)) { S.tab = p; S._lastParam = p; }

      // keep the department card in sync with the signed-in officer
      const u = ctx.user || {};
      if (u.name && !S._userSynced) { S.dept.officer = u.name; if (u.email) S.dept.email = u.email; S.officers[0].name = u.name; if (u.email) S.officers[0].email = u.email; S._userSynced = true; }

      const rail = TABS.map(t => `
        <button class="gset-tab ${S.tab === t.id ? 'is-active' : ''}" onclick="GovSettings.setTab('${t.id}')">
          ${App.icon(t.icon)}
          <span class="grow"><b>${App.esc(t.label)}</b><span class="gset-tab__sub">${App.esc(t.sub)}</span></span>
        </button>`).join('');

      const activeTab = TABS.find(t => t.id === S.tab) || TABS[0];

      return `<div class="page fade-in">
        <style>
          .gset-grid{ display:grid; grid-template-columns:248px minmax(0,1fr); gap:24px; align-items:start; }
          @media (max-width:900px){ .gset-grid{ grid-template-columns:1fr; } }
          .gset-rail{ position:sticky; top:8px; display:flex; flex-direction:column; gap:4px; }
          @media (max-width:900px){ .gset-rail{ position:static; flex-direction:row; overflow-x:auto; padding-bottom:6px; gap:8px; } }
          .gset-rail::-webkit-scrollbar{ height:5px; }
          .gset-rail::-webkit-scrollbar-thumb{ background:var(--line); border-radius:9px; }
          .gset-tab{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; padding:11px 13px; border-radius:var(--r-sm);
            border:1px solid transparent; color:var(--ink-2); cursor:pointer; transition:.13s; white-space:nowrap; }
          .gset-tab:hover{ background:var(--surface-2); }
          .gset-tab .ico{ color:var(--faint); transition:.13s; flex-shrink:0; }
          .gset-tab b{ font-size:13.5px; font-weight:600; display:block; }
          .gset-tab__sub{ font-size:11.5px; color:var(--faint); display:block; margin-top:1px; }
          .gset-tab.is-active{ background:var(--accent-weak); border-color:var(--accent-ring); color:var(--accent-strong); }
          .gset-tab.is-active .ico{ color:var(--accent); }
          .gset-tab.is-active .gset-tab__sub{ color:var(--accent-strong); opacity:.72; }
          .gset-panel{ display:flex; flex-direction:column; gap:20px; min-width:0; }
          .gset-emblem{ width:52px; height:52px; border-radius:14px; display:grid; place-items:center; flex-shrink:0;
            background:linear-gradient(135deg,var(--accent),var(--accent-strong)); color:#fff; }
          .gset-emblem .ico{ width:26px; height:26px; }
          .gset-strip{ margin-top:18px; border:1px solid var(--line-2); border-radius:var(--r); overflow:hidden; }
          @media (max-width:640px){ .gset-strip{ flex-wrap:wrap; } .gset-strip .statstrip__cell{ flex:1 1 44%; } }
          .gset-ghost{ display:inline-flex; align-items:center; gap:6px; padding:6px 11px; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--accent-strong); transition:.12s; white-space:nowrap; }
          .gset-ghost:hover{ background:var(--accent-weak); }
          .gset-ghost .ico{ width:15px; height:15px; }
          .gset-trash{ display:inline-flex; align-items:center; gap:6px; padding:6px 11px; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--muted); transition:.12s; white-space:nowrap; }
          .gset-trash:hover{ background:var(--red-50); color:var(--red-700); }
          .gset-trash:hover .ico{ color:var(--red-600); }
          .gset-trash .ico{ width:15px; height:15px; }
          .gset-invite{ display:flex; align-items:center; justify-content:center; gap:8px; width:100%; margin-top:14px; padding:11px; border-radius:var(--r);
            border:1px dashed var(--line); background:transparent; color:var(--muted); font-size:13px; font-weight:600; cursor:pointer; transition:.13s; }
          .gset-invite:hover{ border-color:var(--accent); color:var(--accent-strong); background:var(--accent-weak); }
          .gset-invite .ico{ width:15px; height:15px; }
          .gset-toggle-row{ display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--line-2); cursor:pointer; }
          .gset-toggle-row:first-child{ padding-top:4px; }
          .gset-toggle-row:last-child{ border-bottom:none; padding-bottom:2px; }
          .gset-rolegrid{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
          @media (max-width:560px){ .gset-rolegrid{ grid-template-columns:1fr; } }
          .gset-rolecard{ border:1px solid var(--line-2); border-radius:var(--r); padding:13px 14px; background:var(--surface-2); }
          .gset-conngrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          @media (max-width:820px){ .gset-conngrid{ grid-template-columns:repeat(2,1fr); } }
          @media (max-width:520px){ .gset-conngrid{ grid-template-columns:1fr; } }
          .gset-conn{ text-align:left; cursor:pointer; }
          .gset-srcglyph{ width:40px; height:40px; border-radius:11px; display:grid; place-items:center; flex-shrink:0; }
          .gset-srcglyph .ico{ width:20px; height:20px; }
          .gset-audico{ width:34px; height:34px; border-radius:9px; display:grid; place-items:center; flex-shrink:0; background:var(--surface-2); color:var(--muted); }
          .gset-audico .ico{ width:17px; height:17px; }
          .gset-audico.is-live{ background:var(--green-50); color:var(--green-700); }
          .gset-badge{ display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border-radius:var(--r-full); background:var(--accent-weak); color:var(--accent-strong); font-size:12.5px; font-weight:600; }
          .gset-badge .ico{ width:15px; height:15px; }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16">
              <div>
                <div class="eyebrow">${App.icon('settings')} Registry console · Settings</div>
                <h1 class="h-grad" style="margin-top:12px">Governance &amp; department controls.</h1>
                <p class="lead">Manage your ministry, authorised officers, data-policy safeguards and source integrations for the Workforce Identity Network.</p>
              </div>
              <div class="row gap-10" style="align-items:center">
                <span class="gset-badge">${App.icon('shield')} Govt. Access</span>
              </div>
            </div>
            <div class="row gap-8 wrap mt-16">
              <span class="src-chip">${App.icon('landmark')} ${App.esc(S.dept.ministry)}</span>
              <span class="src-chip">${App.icon('shieldcheck')} DPDP-compliant</span>
              <span class="src-chip">${App.icon('lock')} All actions audited</span>
            </div>
          </div>
        </div>

        <div class="gset-grid">
          <nav class="gset-rail">${rail}</nav>
          <div class="gset-panel">
            <div class="section-title">${App.esc(activeTab.label)}</div>
            ${panel()}
          </div>
        </div>
      </div>`;
    }
  });
})();
