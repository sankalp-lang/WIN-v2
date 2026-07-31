/* Employer · HRMS Sync — connect the org's HRMS so employee records flow into
   verified worker profiles automatically. The connect options (HRMS
   Integration / SFTP Transfer / Upload CSV) are shown directly on the page
   rather than behind a "Connect HRMS" button + tabbed connection-request
   table, since there's only ever one org connecting from this console.
   Picking a method opens the HRMS Selection → Credentials wizard. All flows
   are simulated (no real host/API calls), consistent with the rest of the app. */
(function () {
  const HS = {
    connections: [
      { id: 'c1', vendor: 'Aditya Birla Construction Ltd.', platform: 'Keka', host: 'abconstruction.keka.com', connectedOn: 'Mar 12, 2024', status: 'active' },
    ],
    modal: null, // set when the Connect wizard is open
  };

  function freshModal(vendor) {
    return {
      vendor, step: 'method', method: '', search: '', platform: '',
      host: '', clientId: '', clientSecret: '', apiKey: '', agree: false,
      sftpHost: '', sftpPort: '22', sftpUser: '', sftpPass: '', sftpDir: '',
      csvFile: '',
    };
  }

  const HS_STYLE = `<style>
    .hs-tabs{ display:flex; gap:6px; border-bottom:1px solid var(--line); margin-bottom:18px; }
    .hs-tab{ padding:10px 4px; margin-right:22px; font-size:13.5px; font-weight:600; color:var(--muted); cursor:pointer; border-bottom:2px solid transparent; }
    .hs-tab.is-active{ color:var(--accent-strong); border-color:var(--accent); }
    .hs-table{ width:100%; border-collapse:collapse; }
    .hs-table th{ text-align:left; font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); padding:0 12px 10px; border-bottom:1px solid var(--line); }
    .hs-table td{ padding:14px 12px; border-bottom:1px solid var(--line-2); font-size:13.5px; vertical-align:middle; }
    .hs-table tr:last-child td{ border-bottom:none; }
    .hs-vendor{ display:flex; align-items:center; gap:10px; }
    .hs-ic{ width:34px; height:34px; border-radius:9px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; flex-shrink:0; }
    .hs-choice{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 16px; margin-top:10px;
      border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; font-size:13.5px; transition:.12s; }
    .hs-choice:first-of-type{ margin-top:0; }
    .hs-choice:hover{ border-color:var(--accent); background:var(--accent-weak); }
    .hs-choice__ic{ width:34px; height:34px; border-radius:9px; display:grid; place-items:center; background:var(--accent-weak); color:var(--accent-strong); flex-shrink:0; }
    .hs-platforms{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; max-height:340px; overflow-y:auto; margin-top:12px; }
    @media (max-width:760px){ .hs-platforms{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
    .hs-platform{ display:flex; align-items:center; gap:9px; padding:10px 12px; border:1px solid var(--line); border-radius:var(--r-sm);
      background:var(--surface); cursor:pointer; font-size:13px; transition:.12s; }
    .hs-platform:hover{ border-color:var(--accent); background:var(--accent-weak); }
    .hs-platform__logo{ width:26px; height:26px; border-radius:7px; display:grid; place-items:center; color:#fff; font-size:11px; font-weight:700; flex-shrink:0; }
    .hs-connect-diagram{ display:flex; align-items:center; justify-content:center; gap:14px; margin:6px 0 20px; }
    .hs-connect-dot{ width:30px; height:30px; border-radius:9px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; }
    .hs-check{ display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ink-2); cursor:pointer; }
    .hs-check input{ width:16px; height:16px; accent-color:var(--accent); cursor:pointer; }
  </style>`;

  function modalBody() {
    const m = HS.modal;
    if (m.step === 'platform') {
      const q = (m.search || '').toLowerCase();
      const platforms = (DB.hrmsPlatforms || []).filter(p => p.toLowerCase().includes(q));
      const grid = platforms.map(p => `
        <button class="hs-platform" onclick="EmpHrms.pickPlatform('${p.replace(/'/g, "\\'")}')">
          <span class="hs-platform__logo" style="background:${App.color(p)}">${App.initials(p)}</span>
          ${App.esc(p)}
        </button>`).join('');
      const body = `
        <div class="field"><input class="input" placeholder="Search HRMS…" value="${App.esc(m.search)}" oninput="EmpHrms.setSearch(this.value)"></div>
        <div class="hs-platforms">${grid || `<p class="muted" style="font-size:13px;grid-column:1/-1">No match.</p>`}</div>`;
      return { title: 'Select Your HRMS Platform', icon: 'plug', body, foot: `<button class="btn" onclick="EmpHrms.closeConnect()">Cancel</button>` };
    }
    if (m.step === 'credentials') {
      const body = `
        <div class="hs-connect-diagram"><span class="hs-connect-dot">${App.icon('plug')}</span><span class="muted">- - - - -&gt;</span><span class="hs-connect-dot">${App.icon('shieldcheck')}</span></div>
        <div class="field"><label class="label">HRMS Host</label>
          <input class="input" value="${App.esc(m.host)}" placeholder="e.g. yourcompany.keka.com" oninput="EmpHrms.set('host',this.value)"></div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label">Client ID</label>
            <input class="input mono" value="${App.esc(m.clientId)}" placeholder="Client ID" oninput="EmpHrms.set('clientId',this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label">Client Secret</label>
            <input class="input mono" type="password" value="${App.esc(m.clientSecret)}" placeholder="Client Secret" oninput="EmpHrms.set('clientSecret',this.value)"></div>
        </div>
        <div class="field" style="margin-top:16px"><label class="label">API Key <span class="muted" style="font-weight:400">(optional)</span></label>
          <input class="input mono" value="${App.esc(m.apiKey)}" placeholder="API Key" oninput="EmpHrms.set('apiKey',this.value)"></div>
        <label class="hs-check" style="margin-top:14px"><input type="checkbox" ${m.agree ? 'checked' : ''} onchange="EmpHrms.toggleAgree()"> I agree to the terms &amp; conditions</label>`;
      const foot = `<button class="btn" onclick="EmpHrms.backModal()">${App.icon('arrowleft')} Back</button>
        <button class="btn btn--primary" onclick="EmpHrms.connect()">${App.icon('plug')} Connect</button>`;
      return { title: `Connect ${App.esc(m.platform)}`, icon: 'plug', body, foot };
    }
    if (m.step === 'sftp') {
      const body = `
        <div class="hs-connect-diagram"><span class="hs-connect-dot">${App.icon('database')}</span><span class="muted">- - - - -&gt;</span><span class="hs-connect-dot">${App.icon('shieldcheck')}</span></div>
        <div class="field"><label class="label">SFTP Host</label>
          <input class="input" value="${App.esc(m.sftpHost)}" placeholder="e.g. sftp.yourcompany.com" oninput="EmpHrms.set('sftpHost',this.value)"></div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label">Port</label>
            <input class="input mono" value="${App.esc(m.sftpPort)}" placeholder="22" oninput="EmpHrms.set('sftpPort',this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label">Username</label>
            <input class="input mono" value="${App.esc(m.sftpUser)}" placeholder="Username" oninput="EmpHrms.set('sftpUser',this.value)"></div>
        </div>
        <div class="field" style="margin-top:16px"><label class="label">Password / SSH Key</label>
          <input class="input mono" type="password" value="${App.esc(m.sftpPass)}" placeholder="Password or SSH key" oninput="EmpHrms.set('sftpPass',this.value)"></div>
        <div class="field" style="margin-top:16px"><label class="label">Directory Path <span class="muted" style="font-weight:400">(optional)</span></label>
          <input class="input mono" value="${App.esc(m.sftpDir)}" placeholder="/exports/hrms" oninput="EmpHrms.set('sftpDir',this.value)"></div>
        <label class="hs-check" style="margin-top:14px"><input type="checkbox" ${m.agree ? 'checked' : ''} onchange="EmpHrms.toggleAgree()"> I agree to the terms &amp; conditions</label>`;
      const foot = `<button class="btn" onclick="EmpHrms.closeConnect()">Cancel</button>
        <button class="btn btn--primary" onclick="EmpHrms.connectSftp()">${App.icon('database')} Connect</button>`;
      return { title: 'SFTP Transfer', icon: 'database', body, foot };
    }
    // csv
    const body = `
      <div class="banner banner--info" style="margin-bottom:16px">${App.icon('share')}<div>Download our CSV template, fill in your employee data, and upload it below.</div></div>
      <button class="btn btn--soft btn--block" onclick="EmpHrms.downloadTemplate()">${App.icon('download')} Download CSV Template</button>
      <div class="field" style="margin-top:18px"><label class="label">Upload CSV File</label>
        <input class="input" type="file" accept=".csv" onchange="EmpHrms.setCsvFile(this)"></div>
      ${m.csvFile ? `<div class="banner banner--green">${App.icon('filecheck')}<div>${App.esc(m.csvFile)} selected</div></div>` : ''}
      <label class="hs-check" style="margin-top:14px"><input type="checkbox" ${m.agree ? 'checked' : ''} onchange="EmpHrms.toggleAgree()"> I agree to the terms &amp; conditions</label>`;
    const foot = `<button class="btn" onclick="EmpHrms.closeConnect()">Cancel</button>
      <button class="btn btn--primary" onclick="EmpHrms.uploadCsv()">${App.icon('upload')} Upload</button>`;
    return { title: 'Upload CSV', icon: 'share', body, foot };
  }

  function paintModal() {
    const { title, icon, body, foot } = modalBody();
    App.modal.open(HS_STYLE + body, { title, icon, foot, wide: true });
  }

  window.EmpHrms = {
    hasActiveConnection(vendor) { return HS.connections.some(c => c.status === 'active' && (!vendor || c.vendor === vendor)); },
    // opens the wizard directly at the chosen method's step — the Data Transfer Method
    // choice itself is now shown inline on the page, not as a first modal step.
    startMethod(key) {
      HS.modal = freshModal(HS.currentOrg);
      HS.modal.method = key;
      HS.modal.step = key === 'hrms' ? 'platform' : key; // 'sftp' | 'csv'
      paintModal();
    },
    closeConnect() { HS.modal = null; App.modal.close(); },
    setSearch(v) { HS.modal.search = v; paintModal(); },
    pickPlatform(p) { HS.modal.platform = p; HS.modal.step = 'credentials'; paintModal(); },
    // "Back" from the credentials step returns to the HRMS platform picker (the only
    // remaining multi-step path — SFTP/CSV go straight from the page to their one step).
    backModal() { HS.modal.step = 'platform'; paintModal(); },
    set(k, v) { if (HS.modal) HS.modal[k] = v; },
    toggleAgree() { HS.modal.agree = !HS.modal.agree; paintModal(); },
    connect() {
      const m = HS.modal;
      if (!m.host || !m.clientId || !m.clientSecret) { App.toast('Fill in your HRMS credentials to connect', 'alert'); return; }
      if (!m.agree) { App.toast('Please agree to the terms & conditions', 'alert'); return; }
      EmpHrms._finishConnection(m, m.platform);
    },
    downloadTemplate() { App.toast('Downloading CSV template…', 'download'); },
    setCsvFile(el) {
      const f = el.files && el.files[0];
      HS.modal.csvFile = f ? f.name : '';
      paintModal();
    },
    uploadCsv() {
      const m = HS.modal;
      if (!m.csvFile) { App.toast('Choose a CSV file to upload', 'alert'); return; }
      if (!m.agree) { App.toast('Please agree to the terms & conditions', 'alert'); return; }
      EmpHrms._finishConnection(m, 'CSV Upload');
    },
    connectSftp() {
      const m = HS.modal;
      if (!m.sftpHost || !m.sftpUser || !m.sftpPass) { App.toast('Fill in your SFTP host, username and password to connect', 'alert'); return; }
      if (!m.agree) { App.toast('Please agree to the terms & conditions', 'alert'); return; }
      EmpHrms._finishConnection(m, 'SFTP Transfer');
    },
    _finishConnection(m, platformLabel) {
      const host = m.method === 'sftp' ? m.sftpHost : (m.method === 'csv' ? m.csvFile : m.host);
      HS.connections.push({
        id: 'c' + (HS.connections.length + 1), vendor: m.vendor, platform: platformLabel, host: host || '—',
        connectedOn: new Date().toDateString().slice(4), status: 'active',
      });
      App.modal.close(); HS.modal = null;
      App.toast(`Connected to ${platformLabel}`, 'checkcircle');
      App.reload();
    },
    disconnect(id) {
      const c = HS.connections.find(x => x.id === id); if (!c) return;
      c.status = 'terminated'; c.terminatedOn = new Date().toDateString().slice(4);
      App.toast(`Disconnected from ${c.platform}`, 'x'); App.reload();
    },
    reconnect(id) {
      const c = HS.connections.find(x => x.id === id); if (!c) return;
      c.status = 'active'; c.connectedOn = new Date().toDateString().slice(4);
      App.toast(`Reconnected to ${c.platform}`, 'checkcircle'); App.reload();
    },
  };

  App.registerView('emp-hrms', {
    title: 'HRMS Sync',
    subtitle: 'Connect your HR system to power verified worker profiles',
    render(ctx) {
      const org = (ctx.user && ctx.user.org) || (DB.profiles.employer && DB.profiles.employer.org) || 'Your Organisation';
      HS.currentOrg = org;

      const active = HS.connections.filter(c => c.status === 'active');
      const terminated = HS.connections.filter(c => c.status === 'terminated');
      // scoped to this org specifically — matches the hasActiveConnection(vendor) fix
      // elsewhere, so one org's connection never shows as "connected" for another.
      const connected = active.find(c => c.vendor === org);

      const connectedCard = connected ? `
        <div class="card reveal">
          <div class="card__body">
            <div class="row between wrap gap-12" style="align-items:center">
              <div class="hs-vendor"><span class="hs-ic">${App.icon('checkcircle')}</span>
                <div><b>${App.esc(connected.vendor)}</b><div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(connected.platform)} · connected ${App.esc(connected.connectedOn)}</div></div>
              </div>
              <div class="row gap-10" style="align-items:center">
                ${App.ui.pill('Active', 'green', true)}
                <button class="btn btn--ghost btn--sm" onclick="EmpHrms.disconnect('${connected.id}')">${App.icon('x')} Disconnect</button>
              </div>
            </div>
          </div>
        </div>` : '';

      // the connect options themselves — shown directly, not behind a "Connect HRMS"
      // button + a separate Data Transfer Method modal step.
      const methodCards = connected ? '' : `
        <div class="card reveal">
          <div class="card__head"><h3 class="grow">Connect your HRMS</h3></div>
          <div class="card__body">
            ${(DB.hrmsMethods || []).map(x => `
              <button class="hs-choice" onclick="EmpHrms.startMethod('${x.key}')">
                <span class="hs-choice__ic">${App.icon(x.ic)}</span>
                <div class="grow"><b style="display:block">${App.esc(x.title)}</b><span class="muted" style="font-size:12px">${App.esc(x.desc)}</span></div>
                ${App.icon('arrow')}
              </button>`).join('')}
          </div>
        </div>`;

      const terminatedCard = terminated.length ? `
        <div class="card reveal">
          <div class="card__head"><h3 class="grow">Previously connected</h3></div>
          <div class="card__body" style="padding-top:2px;padding-bottom:6px">
            <div class="list--divided">
              ${terminated.map(c => `
                <div class="row between wrap gap-10" style="padding:12px 0;align-items:center">
                  <div class="hs-vendor"><span class="hs-ic">${App.icon('building')}</span>
                    <div><b>${App.esc(c.vendor)}</b><div class="muted" style="font-size:12px;margin-top:2px">${App.esc(c.platform)} · terminated ${App.esc(c.terminatedOn || '')}</div></div></div>
                  <button class="btn btn--ghost btn--sm" onclick="EmpHrms.reconnect('${c.id}')">${App.icon('plug')} Reconnect</button>
                </div>`).join('')}
            </div>
          </div>
        </div>` : '';

      return `<div class="page fade-in">
        ${HS_STYLE}
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('plug')} HRMS Sync Console</div>
            <h1 class="h-grad" style="margin-top:12px">Sync your HRMS, verify at the source.</h1>
            <p class="lead">Connect your HR system so employee records flow straight into verified WiN worker profiles — no manual entry, no spreadsheets.</p>
          </div>
        </div>

        ${connectedCard}
        ${methodCards}
        ${terminatedCard}
      </div>`;
    },
  });
})();
