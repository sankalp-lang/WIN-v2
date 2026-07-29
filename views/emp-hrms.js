/* Employer · HRMS Sync — connect the org's HRMS so employee records flow into
   verified worker profiles automatically. Modelled on Tartan's own HyperSync
   product: Data Transfer Method → HRMS Selection → Credentials, with an
   Active/Terminated connections list on the main page. All flows are
   simulated (no real host/API calls), consistent with the rest of the app. */
(function () {
  const HS = {
    tab: 'active', // active | terminated
    connections: [
      { id: 'c1', platform: 'Keka', host: 'abconstruction.keka.com', connectedOn: 'Mar 12, 2024', status: 'active' },
    ],
    modal: null, // set when the Connect wizard is open
  };

  function freshModal() {
    return { step: 'method', method: '', search: '', platform: '', host: '', clientId: '', clientSecret: '', apiKey: '', agree: false };
  }

  const HS_STYLE = `<style>
    .hs-tabs{ display:flex; gap:6px; border-bottom:1px solid var(--line); margin-bottom:18px; }
    .hs-tab{ padding:10px 4px; margin-right:22px; font-size:13.5px; font-weight:600; color:var(--muted); cursor:pointer; border-bottom:2px solid transparent; }
    .hs-tab.is-active{ color:var(--accent-strong); border-color:var(--accent); }
    .hs-row{ display:flex; align-items:center; gap:14px; padding:14px 16px; border:1px solid var(--line); border-radius:var(--r); background:var(--surface); }
    .hs-row + .hs-row{ margin-top:10px; }
    .hs-ic{ width:38px; height:38px; border-radius:10px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; flex-shrink:0; }
    .hs-choice{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 16px; margin-top:10px;
      border:1px solid var(--line); border-radius:var(--r); background:var(--surface); cursor:pointer; font-size:13.5px; transition:.12s; }
    .hs-choice:first-of-type{ margin-top:0; }
    .hs-choice:hover{ border-color:var(--accent); background:var(--accent-weak); }
    .hs-choice__ic{ width:34px; height:34px; border-radius:9px; display:grid; place-items:center; background:var(--accent-weak); color:var(--accent-strong); flex-shrink:0; }
    .hs-platforms{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; max-height:340px; overflow-y:auto; margin-top:12px; }
    @media (max-width:760px){ .hs-platforms{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
    .hs-platform{ display:flex; align-items:center; gap:8px; padding:10px 12px; border:1px solid var(--line); border-radius:var(--r-sm);
      background:var(--surface); cursor:pointer; font-size:13px; transition:.12s; }
    .hs-platform:hover{ border-color:var(--accent); background:var(--accent-weak); }
    .hs-connect-diagram{ display:flex; align-items:center; justify-content:center; gap:14px; margin:6px 0 20px; }
    .hs-connect-dot{ width:30px; height:30px; border-radius:9px; background:var(--accent-weak); color:var(--accent-strong); display:grid; place-items:center; }
    .hs-check{ display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ink-2); cursor:pointer; }
    .hs-check input{ width:16px; height:16px; accent-color:var(--accent); cursor:pointer; }
  </style>`;

  function modalBody() {
    const m = HS.modal;
    if (m.step === 'method') {
      const rows = (DB.hrmsMethods || []).map(x => `
        <button class="hs-choice" onclick="EmpHrms.pickMethod('${x.key}')">
          <span class="hs-choice__ic">${App.icon(x.ic)}</span>
          <div><b style="display:block">${App.esc(x.title)}</b><span class="muted" style="font-size:12px">${App.esc(x.desc)}</span></div>
        </button>`).join('');
      return { title: 'Connect HRMS', icon: 'plug', body: rows, foot: `<button class="btn" onclick="EmpHrms.closeConnect()">Cancel</button>` };
    }
    if (m.step === 'platform') {
      const q = (m.search || '').toLowerCase();
      const platforms = (DB.hrmsPlatforms || []).filter(p => p.toLowerCase().includes(q));
      const grid = platforms.map(p => `<button class="hs-platform" onclick="EmpHrms.pickPlatform('${p.replace(/'/g, "\\'")}')">${App.icon('plug')} ${App.esc(p)}</button>`).join('');
      const body = `
        <div class="field"><input class="input" placeholder="Search HRMS…" value="${App.esc(m.search)}" oninput="EmpHrms.setSearch(this.value)"></div>
        <div class="hs-platforms">${grid || `<p class="muted" style="font-size:13px;grid-column:1/-1">No match.</p>`}</div>`;
      return { title: 'Select Your HRMS Platform', icon: 'plug', body, foot: `<button class="btn" onclick="EmpHrms.backModal()">${App.icon('arrowleft')} Back</button>` };
    }
    // credentials
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

  function paintModal() {
    const { title, icon, body, foot } = modalBody();
    App.modal.open(HS_STYLE + body, { title, icon, foot, wide: true });
  }

  window.EmpHrms = {
    setTab(t) { HS.tab = t; App.reload(); },
    openConnect() { HS.modal = freshModal(); paintModal(); },
    closeConnect() { HS.modal = null; App.modal.close(); },
    pickMethod(key) {
      HS.modal.method = key;
      if (key === 'hrms') { HS.modal.step = 'platform'; paintModal(); return; }
      App.toast('SFTP/CSV setup — a demo affordance in this prototype', 'clock');
      HS.modal = null; App.modal.close();
    },
    setSearch(v) { HS.modal.search = v; paintModal(); },
    pickPlatform(p) { HS.modal.platform = p; HS.modal.step = 'credentials'; paintModal(); },
    backModal() {
      HS.modal.step = HS.modal.step === 'credentials' ? 'platform' : 'method';
      paintModal();
    },
    set(k, v) { if (HS.modal) HS.modal[k] = v; },
    toggleAgree() { HS.modal.agree = !HS.modal.agree; paintModal(); },
    connect() {
      const m = HS.modal;
      if (!m.host || !m.clientId || !m.clientSecret) { App.toast('Fill in your HRMS credentials to connect', 'alert'); return; }
      if (!m.agree) { App.toast('Please agree to the terms & conditions', 'alert'); return; }
      HS.connections.push({
        id: 'c' + (HS.connections.length + 1), platform: m.platform, host: m.host,
        connectedOn: new Date().toDateString().slice(4), status: 'active',
      });
      App.modal.close(); HS.modal = null;
      App.toast(`Connected to ${m.platform}`, 'checkcircle');
      HS.tab = 'active'; App.reload();
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
    render() {
      const active = HS.connections.filter(c => c.status === 'active');
      const terminated = HS.connections.filter(c => c.status === 'terminated');
      const rows = (HS.tab === 'active' ? active : terminated).map(c => `
        <div class="hs-row">
          <span class="hs-ic">${App.icon('plug')}</span>
          <div class="grow">
            <b style="font-size:13.5px">${App.esc(c.platform)}</b>
            <div class="muted" style="font-size:12px;margin-top:1px">${App.esc(c.host)}</div>
          </div>
          <div class="muted" style="font-size:12px">${c.status === 'active' ? `Connected ${App.esc(c.connectedOn)}` : `Terminated ${App.esc(c.terminatedOn || '')}`}</div>
          ${App.ui.pill(c.status === 'active' ? 'Active' : 'Terminated', c.status === 'active' ? 'green' : 'gray', true)}
          ${c.status === 'active'
            ? `<button class="btn btn--ghost btn--sm" onclick="EmpHrms.disconnect('${c.id}')">${App.icon('x')} Disconnect</button>`
            : `<button class="btn btn--ghost btn--sm" onclick="EmpHrms.reconnect('${c.id}')">${App.icon('plug')} Reconnect</button>`}
        </div>`).join('');

      const list = rows || App.ui.empty('plug', HS.tab === 'active' ? 'No active connections' : 'No terminated connections',
        HS.tab === 'active' ? 'Connect your HRMS to start syncing employee records.' : 'Connections you disconnect will show up here.');

      return `<div class="page fade-in">
        ${HS_STYLE}
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('plug')} HRMS Sync Console</div>
                <h1 class="h-grad" style="margin-top:12px">Sync your HRMS, verify at the source.</h1>
                <p class="lead">Connect your HR system so employee records flow straight into verified WiN worker profiles — no manual entry, no spreadsheets.</p>
              </div>
              <button class="btn btn--accent" onclick="EmpHrms.openConnect()">${App.icon('plus')} Connect HRMS</button>
            </div>
          </div>
        </div>

        <div class="card reveal">
          <div class="card__body">
            <div class="hs-tabs">
              <div class="hs-tab ${HS.tab === 'active' ? 'is-active' : ''}" onclick="EmpHrms.setTab('active')">Active Connections <span class="mono">${active.length}</span></div>
              <div class="hs-tab ${HS.tab === 'terminated' ? 'is-active' : ''}" onclick="EmpHrms.setTab('terminated')">Terminated Connections <span class="mono">${terminated.length}</span></div>
            </div>
            ${list}
          </div>
        </div>
      </div>`;
    },
  });
})();
