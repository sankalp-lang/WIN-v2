/* Employer · API & Docs — developer reference: a categorised REST endpoint
   sidebar (live-filterable), and a detail pane per endpoint showing the auth
   requirement + a copyable API key, multi-language request samples (cURL /
   JavaScript / Python / Go), a syntax-highlighted JSON response, and a
   simulated "Execute Request" try-it-out flow. */
(function () {
  const BASE = 'https://api.win.com/v1';
  const VERSION = 'v1.0.0';
  const KEY = 'win_live_sk_7Kd9f2Xb41Qy8ZtR6mL0nA3';
  const KEY_MASKED = KEY.slice(0, 12) + '••••••••••••••••' + KEY.slice(-4);

  const CATS = [
    { key: 'Authentication', icon: 'key' },
    { key: 'Employees', icon: 'users' },
    { key: 'Verifications', icon: 'shieldcheck' },
    { key: 'Integrations', icon: 'plug' },
    { key: 'Webhooks', icon: 'bell' },
  ];
  const EPS = [
    { id: 'auth-token', cat: 'Authentication', method: 'POST',   path: '/auth/token',        desc: 'Exchange your client credentials for a short-lived bearer token.' },
    { id: 'emp-list',   cat: 'Employees',      method: 'GET',    path: '/employees',         desc: 'List all employees in your organisation, with pagination and status filters.' },
    { id: 'emp-get',    cat: 'Employees',      method: 'GET',    path: '/employees/:id',     desc: 'Get the full verified record for a single employee.' },
    { id: 'emp-create', cat: 'Employees',      method: 'POST',   path: '/employees',         desc: 'Create a new employee and enqueue them for live verification.' },
    { id: 'emp-update', cat: 'Employees',      method: 'PATCH',  path: '/employees/:id',     desc: 'Update an existing employee record.' },
    { id: 'emp-delete', cat: 'Employees',      method: 'DELETE', path: '/employees/:id',     desc: 'Remove an employee from your organisation.' },
    { id: 'ver-create', cat: 'Verifications',  method: 'POST',   path: '/verifications',     desc: 'Start a live verification against Aadhaar, PAN and EPFO.' },
    { id: 'ver-get',    cat: 'Verifications',  method: 'GET',    path: '/verifications/:id', desc: 'Get the status and trust score for a verification.' },
    { id: 'int-list',   cat: 'Integrations',   method: 'GET',    path: '/integrations',      desc: 'List the HRMS integrations connected to your account.' },
    { id: 'wh-create',  cat: 'Webhooks',       method: 'POST',   path: '/webhooks',          desc: 'Register a webhook to receive verification event callbacks.' },
  ];
  const SHORT_DESC = {
    'auth-token': 'Get authentication token', 'emp-list': 'List all employees',
    'emp-get': 'Get employee details', 'emp-create': 'Create new employee',
    'emp-update': 'Update employee', 'emp-delete': 'Delete employee',
    'ver-create': 'Start verification', 'ver-get': 'Get verification status',
    'int-list': 'List integrations', 'wh-create': 'Create webhook',
  };

  const LANGS = [
    { key: 'curl', label: 'cURL' },
    { key: 'js', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
    { key: 'go', label: 'Go' },
  ];

  const TERMINAL = '<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';

  /* ---------------- controller / state ---------------- */
  const AD = {
    selected: 'emp-get',   // land pre-selected on the canonical GET /employees/:id
    lang: 'curl',
    query: '',
    keyRevealed: false,
    _focusSearch: false,

    find(id) { return EPS.find(e => e.id === id) || null; },
    filtered() {
      const q = AD.query.trim().toLowerCase();
      if (!q) return EPS.slice();
      return EPS.filter(e =>
        e.path.toLowerCase().includes(q) ||
        e.method.toLowerCase().includes(q) ||
        SHORT_DESC[e.id].toLowerCase().includes(q) ||
        e.cat.toLowerCase().includes(q));
    },

    select(id) { AD.selected = id; App.reload(); },
    setLang(l) { AD.lang = l; App.reload(); },
    search(v) { AD.query = v; AD._focusSearch = true; App.reload(); },
    clearSearch() { AD.query = ''; App.reload(); },
    toggleKey() { AD.keyRevealed = !AD.keyRevealed; App.reload(); },

    copy(btn, id, msg) {
      const el = document.getElementById(id);
      const text = el ? el.textContent : '';
      try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
      App.toast(msg || 'Copied to clipboard', 'copy');
      flash(btn);
    },
    copyKey(btn) {
      try { navigator.clipboard && navigator.clipboard.writeText(KEY); } catch (e) {}
      App.toast('API key copied to clipboard', 'copy');
      flash(btn);
    },
    execute() {
      const ep = AD.find(AD.selected); if (!ep) return;
      App.toast('Sending ' + ep.method + ' ' + ep.path + ' …', 'send');
      setTimeout(() => {
        const body = `
          <div class="ad-exec-status">${App.icon('checkcircle')} <b><span class="num">200</span> OK</b><span class="ad-exec-ms mono"><span class="num">214</span> ms · ${App.esc(BASE + ep.path.replace(':id', sampleId(ep)))}</span></div>
          <div class="ad-code-wrap" style="margin-top:14px">
            <div class="ad-codehead"><span class="ad-lights"><span style="background:#ff5f56"></span><span style="background:#ffbd2e"></span><span style="background:#27c93f"></span></span><span class="ad-codehead__label">response · application/json</span></div>
            <pre class="ad-code">${hlJson(responseFor(ep))}</pre>
          </div>
          <p class="muted" style="margin-top:12px;font-size:12.5px">${App.icon('bolt')} Simulated response — in production this call executes live against source systems (EPFO / Income-Tax / ESIC / Aadhaar).</p>`;
        App.modal.open(body, { title: 'Execute · ' + ep.method + ' ' + ep.path, icon: 'bolt', wide: true });
      }, 850);
    },
    ref() { App.toast('Full API reference is a demo affordance in this prototype', 'external'); },
    ask(q) { App.assistant.toggle(true); if (q) App.assistant.ask(q); },
  };
  window.EmpApiDocs = AD;

  function flash(btn) {
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = App.icon('check') + ' Copied';
    btn.classList.add('is-copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('is-copied'); }, 2000);
  }

  /* ---------------- sample builders ---------------- */
  function sampleId(ep) {
    return ep.path.indexOf('/verifications') === 0 ? 'ver_1234567890'
      : ep.path.indexOf('/webhooks') === 0 ? 'wh_1234567890'
      : 'emp_1234567890';
  }
  function fullUrl(ep) { return BASE + ep.path.replace(':id', sampleId(ep)); }

  function bodyObj(ep) {
    switch (ep.id) {
      case 'auth-token': return '{\n  "client_id": "abc_live_123",\n  "client_secret": "YOUR_CLIENT_SECRET",\n  "grant_type": "client_credentials"\n}';
      case 'emp-create': return '{\n  "name": "Aman Sharma",\n  "email": "aman@example.com",\n  "department": "Construction"\n}';
      case 'emp-update': return '{\n  "status": "active"\n}';
      case 'ver-create': return '{\n  "employee_id": "emp_1234567890",\n  "sources": ["aadhaar", "pan", "epfo"]\n}';
      case 'wh-create':  return '{\n  "url": "https://your-app.com/hooks/win",\n  "events": ["verification.completed"]\n}';
      default: return null;
    }
  }
  function singleLine(b) { return b.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim(); }

  function codeFor(ep, lang) {
    const url = fullUrl(ep);
    const b = bodyObj(ep);
    if (lang === 'curl') {
      let s = 'curl -X ' + ep.method + ' ' + url + ' \\\n';
      s += '  -H "Authorization: Bearer YOUR_API_KEY" \\\n';
      s += '  -H "Content-Type: application/json"';
      if (b) s += ' \\\n  -d \'' + singleLine(b) + '\'';
      return s;
    }
    if (lang === 'js') {
      let s = 'const res = await fetch("' + url + '", {\n';
      s += '  method: "' + ep.method + '",\n';
      s += '  headers: {\n';
      s += '    "Authorization": "Bearer YOUR_API_KEY",\n';
      s += '    "Content-Type": "application/json"\n';
      s += '  }' + (b ? ',' : '') + '\n';
      if (b) s += '  body: JSON.stringify(' + singleLine(b) + ')\n';
      s += '});\n\n';
      s += 'const data = await res.json();\nconsole.log(data);';
      return s;
    }
    if (lang === 'python') {
      let s = 'import requests\n\n';
      s += 'res = requests.' + ep.method.toLowerCase() + '(\n';
      s += '    "' + url + '",\n';
      s += '    headers={\n';
      s += '        "Authorization": "Bearer YOUR_API_KEY",\n';
      s += '        "Content-Type": "application/json"\n';
      s += '    }' + (b ? ',' : '') + '\n';
      if (b) s += '    json=' + singleLine(b) + '\n';
      s += ')\n\n';
      s += 'print(res.json())';
      return s;
    }
    // go
    let s = '';
    if (b) {
      s += 'payload := []byte(`' + singleLine(b) + '`)\n';
      s += 'req, _ := http.NewRequest("' + ep.method + '", "' + url + '", bytes.NewBuffer(payload))\n';
    } else {
      s += 'req, _ := http.NewRequest("' + ep.method + '", "' + url + '", nil)\n';
    }
    s += 'req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n';
    s += 'req.Header.Set("Content-Type", "application/json")\n\n';
    s += 'res, _ := http.DefaultClient.Do(req)\ndefer res.Body.Close()';
    return s;
  }

  function responseFor(ep) {
    const R = {
      'auth-token': '{\n  "success": true,\n  "data": {\n    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",\n    "token_type": "Bearer",\n    "expires_in": 3600\n  },\n  "message": "Token issued successfully"\n}',
      'emp-list': '{\n  "success": true,\n  "data": [\n    { "id": "emp_1234567890", "name": "Aman Sharma", "status": "active", "verified": true },\n    { "id": "emp_1234567891", "name": "Priya Sharma", "status": "active", "verified": false }\n  ],\n  "meta": { "total": 1247, "page": 1, "per_page": 25 },\n  "message": "Employees retrieved successfully"\n}',
      'emp-get': '{\n  "success": true,\n  "data": {\n    "id": "emp_1234567890",\n    "name": "Aman Sharma",\n    "email": "aman@example.com",\n    "status": "active",\n    "verified": true,\n    "created_at": "2024-01-15T10:30:00Z"\n  },\n  "message": "Employee retrieved successfully"\n}',
      'emp-create': '{\n  "success": true,\n  "data": {\n    "id": "emp_1234567892",\n    "name": "Aman Sharma",\n    "status": "pending",\n    "verified": false,\n    "created_at": "2024-01-15T10:30:00Z"\n  },\n  "message": "Employee created successfully"\n}',
      'emp-update': '{\n  "success": true,\n  "data": {\n    "id": "emp_1234567890",\n    "status": "active",\n    "updated_at": "2024-01-16T09:12:00Z"\n  },\n  "message": "Employee updated successfully"\n}',
      'emp-delete': '{\n  "success": true,\n  "message": "Employee deleted successfully"\n}',
      'ver-create': '{\n  "success": true,\n  "data": {\n    "id": "ver_1234567890",\n    "employee_id": "emp_1234567890",\n    "status": "processing",\n    "sources": ["aadhaar", "pan", "epfo"]\n  },\n  "message": "Verification started"\n}',
      'ver-get': '{\n  "success": true,\n  "data": {\n    "id": "ver_1234567890",\n    "status": "completed",\n    "trust_score": 96,\n    "sources": {\n      "aadhaar": "verified",\n      "pan": "verified",\n      "epfo": "verified"\n    }\n  },\n  "message": "Verification status retrieved"\n}',
      'int-list': '{\n  "success": true,\n  "data": [\n    { "id": "int_keka", "name": "Keka HR", "status": "connected" },\n    { "id": "int_darwinbox", "name": "Darwinbox", "status": "connected" }\n  ],\n  "message": "Integrations retrieved"\n}',
      'wh-create': '{\n  "success": true,\n  "data": {\n    "id": "wh_1234567890",\n    "url": "https://your-app.com/hooks/win",\n    "events": ["verification.completed"],\n    "active": true\n  },\n  "message": "Webhook created"\n}',
    };
    return R[ep.id] || R['emp-get'];
  }

  /* lightweight JSON syntax highlighter (our payloads contain no HTML specials) */
  function hlJson(s) {
    return s.replace(/("(?:[^"\\]|\\.)*"(\s*:)?)|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,
      function (m, str, colon, kw) {
        if (str) return '<span class="ad-j-' + (colon ? 'key' : 'str') + '">' + m + '</span>';
        if (kw) return '<span class="ad-j-' + (kw === 'null' ? 'null' : 'bool') + '">' + m + '</span>';
        return '<span class="ad-j-num">' + m + '</span>';
      });
  }

  /* ---------------- render pieces ---------------- */
  const MCLASS = { GET: 'get', POST: 'post', PATCH: 'patch', DELETE: 'delete', PUT: 'put' };
  function methodPill(m, big) { return `<span class="ad-m ad-m--${MCLASS[m] || 'get'} ${big ? 'ad-m--lg' : ''}">${m}</span>`; }

  function sidebar() {
    const rows = AD.filtered();
    let list = '';
    if (!rows.length) {
      list = `<div class="ad-noresult">${App.icon('search')}<span>No endpoints match “${App.esc(AD.query)}”.</span></div>`;
    } else {
      list = CATS.map(cat => {
        const items = rows.filter(e => e.cat === cat.key);
        if (!items.length) return '';
        return `
          <div class="ad-cat">${App.icon(cat.icon)} ${cat.key}</div>
          ${items.map(e => `
            <button class="ad-ep ${e.id === AD.selected ? 'is-active' : ''}" onclick="EmpApiDocs.select('${e.id}')" title="${App.esc(SHORT_DESC[e.id])}">
              ${methodPill(e.method)}
              <span class="ad-ep__path">${App.esc(e.path)}</span>
              ${App.icon('chevron', 'ad-chev')}
            </button>`).join('')}`;
      }).join('');
    }
    return `
      <div class="card ad-side">
        <div class="ad-side__head">
          <div class="row between" style="margin-bottom:12px">
            <b style="font-size:13px">Endpoints</b>
            <span class="pill pill--gray"><span class="num">${EPS.length}</span></span>
          </div>
          <div class="ad-search input--icon">
            ${App.icon('search')}
            <input class="input" id="adSearch" placeholder="Search endpoints..." value="${App.esc(AD.query)}" oninput="EmpApiDocs.search(this.value)">
            ${AD.query ? `<button class="ad-clear" title="Clear" onclick="EmpApiDocs.clearSearch()">${App.icon('x')}</button>` : ''}
          </div>
        </div>
        <div class="ad-side__body">${list}</div>
      </div>`;
  }

  function darkBlock(label, id, innerHtml, copyMsg, extraClass) {
    return `
      <div class="ad-code-wrap">
        <div class="ad-codehead">
          <span class="ad-lights"><span style="background:#ff5f56"></span><span style="background:#ffbd2e"></span><span style="background:#27c93f"></span></span>
          <span class="ad-codehead__label">${App.esc(label)}</span>
          <button class="ad-copy" onclick="EmpApiDocs.copy(this,'${id}','${copyMsg}')">${App.icon('copy')} Copy</button>
        </div>
        <pre class="ad-code ${extraClass || ''}" id="${id}">${innerHtml}</pre>
      </div>`;
  }

  function detail(ep) {
    /* header */
    const head = `
      <div class="card card--pad ad-dhead">
        <div class="row gap-12 wrap" style="align-items:center">
          ${methodPill(ep.method, true)}
          <code class="ad-path-lg">${App.esc(ep.path)}</code>
        </div>
        <p class="muted" style="margin-top:11px;font-size:13.5px;max-width:70ch">${App.esc(ep.desc)}</p>
      </div>`;

    /* authentication + api key */
    const keyShown = AD.keyRevealed ? KEY : KEY_MASKED;
    const auth = `
      <div class="card">
        <div class="card__head">${App.icon('lock')}<h3 class="grow">Authentication</h3>${App.ui.pill('Required', 'amber', true)}</div>
        <div class="card__body">
          <p class="muted" style="font-size:13.5px;margin-bottom:14px">This endpoint requires authentication. Include your API key in the <code class="ad-inline">Authorization</code> header:</p>
          ${darkBlock('shell', 'adAuthCode', '<span class="ad-j-key">Authorization:</span> <span class="ad-j-str">Bearer YOUR_API_KEY</span>', 'Header copied', 'ad-code--sm')}
          <div class="ad-keyhead">${App.icon('key')} <b style="font-size:12.5px">Your live API key</b></div>
          <div class="ad-keyrow">
            <code class="ad-keyval">${App.esc(keyShown)}</code>
            <button class="ad-keybtn" title="${AD.keyRevealed ? 'Hide' : 'Reveal'}" onclick="EmpApiDocs.toggleKey()">${App.icon(AD.keyRevealed ? 'eyeoff' : 'eye')}</button>
            <button class="ad-keybtn" title="Copy API key" onclick="EmpApiDocs.copyKey(this)">${App.icon('copy')}</button>
          </div>
          <p class="hint" style="margin-top:9px">Keep this secret. Do not expose it in client-side code or commit it to version control.</p>
        </div>
      </div>`;

    /* request + language toggle */
    const langBtns = LANGS.map(l => `<button class="ad-lang ${AD.lang === l.key ? 'is-active' : ''}" onclick="EmpApiDocs.setLang('${l.key}')">${l.label}</button>`).join('');
    const langLabel = (LANGS.find(l => l.key === AD.lang) || LANGS[0]).label;
    const request = `
      <div class="card">
        <div class="card__head">${App.icon('code')}<h3 class="grow">Request</h3><div class="ad-langs">${langBtns}</div></div>
        <div class="card__body">
          ${darkBlock(langLabel.toLowerCase() + ' · request', 'adReqCode', App.esc(codeFor(ep, AD.lang)), 'Request code copied')}
        </div>
      </div>`;

    /* response */
    const response = `
      <div class="card">
        <div class="card__head">${App.icon('database')}<h3 class="grow">Response</h3>${App.ui.pill('200 OK', 'green', true)}</div>
        <div class="card__body">
          ${darkBlock('response · application/json', 'adRespCode', hlJson(responseFor(ep)), 'Response copied')}
        </div>
      </div>`;

    /* try it out */
    const tryit = `
      <div class="card card--accent">
        <div class="card__head">${TERMINAL}<h3 class="grow">Try It Out</h3></div>
        <div class="card__body">
          <p class="muted" style="font-size:13.5px;margin-bottom:14px">Test this endpoint directly from the documentation. This runs a simulated ${methodPill(ep.method)} call and returns a sample response.</p>
          <button class="btn btn--primary btn--block btn--lg" onclick="EmpApiDocs.execute()">${TERMINAL} Execute Request</button>
        </div>
      </div>`;

    return `<div class="ad-main">${head}${auth}${request}${response}${tryit}</div>`;
  }

  App.registerView('emp-apidocs', {
    title: 'API Documentation',
    subtitle: 'REST reference for the WiN verification & employment API',
    render() {
      const ep = AD.find(AD.selected) || EPS[0];

      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('code')} Developer reference</div>
                <h1 class="h-grad" style="margin-top:12px">Verified data, one call away.</h1>
                <p class="lead">Live, verified employment &amp; income data — direct from source. Query the golden record programmatically across Aadhaar, PAN and EPFO. REST · JSON · Bearer auth.</p>
                <div class="row gap-10 mt-16 wrap" style="align-items:center">
                  <span class="pill pill--accent">${App.icon('bolt')} <span class="num">${VERSION}</span></span>
                  <div class="ad-base">
                    <span class="faint" style="font-size:11px;font-weight:600;letter-spacing:.04em">BASE URL</span>
                    <code class="mono" id="adBase" style="font-size:12.5px;color:var(--ink)">${App.esc(BASE)}</code>
                    <button class="ad-basecopy" title="Copy base URL" onclick="EmpApiDocs.copy(this,'adBase','Base URL copied')">${App.icon('copy')}</button>
                  </div>
                  <span class="mono" style="font-size:12px;color:var(--muted)"><span class="num">${EPS.length}</span> endpoints · <span class="num">${CATS.length}</span> categories</span>
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="EmpApiDocs.ask('How do I authenticate with the WiN API and start a verification?')">${App.icon('sparkles')} Ask WiN</button>
                <button class="btn btn--primary" onclick="EmpApiDocs.ref()">${App.icon('external')} API Reference</button>
              </div>
            </div>
          </div>
        </div>`;

      return `<div class="page page--wide fade-in">
        <style>
          .ad-layout{ display:grid; grid-template-columns:296px minmax(0,1fr); gap:20px; align-items:start; }
          .ad-side{ position:sticky; top:16px; overflow:hidden; }
          .ad-side__head{ padding:16px 16px 14px; border-bottom:1px solid var(--line-2); }
          .ad-side__body{ padding:8px 10px 14px; max-height:calc(100vh - 220px); overflow:auto; }
          .ad-search{ position:relative; }
          .ad-search .input{ padding-right:38px; }
          .ad-clear{ position:absolute; right:7px; top:50%; transform:translateY(-50%); width:24px; height:24px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--faint); transition:.13s; }
          .ad-clear:hover{ background:var(--surface-2); color:var(--ink); }
          .ad-cat{ display:flex; align-items:center; gap:7px; padding:14px 8px 6px; font-size:10.5px; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:var(--faint); }
          .ad-cat .ico{ width:14px; height:14px; }
          .ad-ep{ display:flex; align-items:center; gap:9px; width:100%; text-align:left; padding:8px 9px; border-radius:var(--r-sm); transition:.13s; margin-bottom:1px; }
          .ad-ep:hover{ background:var(--surface-2); }
          .ad-ep.is-active{ background:var(--accent-weak); }
          .ad-ep.is-active .ad-ep__path{ color:var(--accent-strong); font-weight:600; }
          .ad-ep__path{ font-family:var(--font-mono); font-size:12px; color:var(--ink-2); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .ad-chev{ width:15px; height:15px; color:var(--faint); opacity:0; transition:.13s; flex-shrink:0; }
          .ad-ep:hover .ad-chev, .ad-ep.is-active .ad-chev{ opacity:1; }
          .ad-noresult{ display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; padding:28px 16px; color:var(--muted); font-size:12.5px; }
          .ad-noresult .ico{ color:var(--faint); }

          .ad-m{ font-family:var(--font-mono); font-weight:700; font-size:10px; letter-spacing:.03em; padding:3px 0; border-radius:var(--r-xs); line-height:1; display:inline-block; text-align:center; min-width:50px; flex-shrink:0; }
          .ad-m--lg{ font-size:12.5px; padding:5px 12px; min-width:64px; }
          .ad-m--get{ color:var(--blue-700); background:var(--blue-50); }
          .ad-m--post{ color:var(--green-700); background:var(--green-50); }
          .ad-m--patch{ color:var(--amber-700); background:var(--amber-50); }
          .ad-m--delete{ color:var(--red-700); background:var(--red-50); }

          .ad-main{ display:flex; flex-direction:column; gap:18px; }
          .ad-dhead .ad-path-lg{ font-family:var(--font-mono); font-size:17px; font-weight:600; color:var(--ink); letter-spacing:-.01em; word-break:break-all; }
          .ad-inline{ font-family:var(--font-mono); font-size:12px; background:var(--surface-2); border:1px solid var(--line); padding:1px 6px; border-radius:var(--r-xs); color:var(--accent-strong); }

          .ad-langs{ display:inline-flex; gap:3px; background:var(--surface-2); border:1px solid var(--line); border-radius:var(--r-sm); padding:3px; }
          .ad-lang{ padding:5px 10px; border-radius:var(--r-xs); font-size:11.5px; font-weight:600; letter-spacing:.02em; color:var(--muted); transition:.13s; }
          .ad-lang:hover{ color:var(--ink); }
          .ad-lang.is-active{ background:var(--surface); color:var(--accent-strong); box-shadow:var(--sh-xs); }

          .ad-code-wrap{ border-radius:var(--r); overflow:hidden; border:1px solid #1e293b; background:#0f172a; }
          .ad-codehead{ display:flex; align-items:center; gap:9px; padding:9px 12px; background:#111c30; border-bottom:1px solid #1e293b; }
          .ad-lights{ display:flex; gap:6px; }
          .ad-lights span{ width:10px; height:10px; border-radius:50%; display:inline-block; }
          .ad-codehead__label{ font-family:var(--font-mono); font-size:11.5px; color:#94a3b8; }
          .ad-copy{ margin-left:auto; display:inline-flex; align-items:center; gap:6px; padding:4px 9px; border-radius:var(--r-xs); font-size:11.5px; font-weight:600; color:#cbd5e1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); transition:.13s; }
          .ad-copy:hover{ background:rgba(255,255,255,.13); color:#fff; }
          .ad-copy.is-copied{ color:#6ee7b7; border-color:rgba(110,231,183,.35); }
          .ad-copy .ico{ width:14px; height:14px; }
          .ad-code{ margin:0; padding:15px 16px; overflow-x:auto; font-family:var(--font-mono); font-size:12.5px; line-height:1.65; color:#e2e8f0; white-space:pre; -webkit-overflow-scrolling:touch; }
          .ad-code--sm{ padding:12px 16px; }
          .ad-j-key{ color:#7dd3fc; }
          .ad-j-str{ color:#a7f3d0; }
          .ad-j-bool{ color:#f0abfc; }
          .ad-j-null{ color:#fca5a5; }
          .ad-j-num{ color:#fcd34d; }

          .ad-keyhead{ display:flex; align-items:center; gap:7px; margin:18px 0 8px; color:var(--ink-2); }
          .ad-keyhead .ico{ width:15px; height:15px; color:var(--accent); }
          .ad-keyrow{ display:flex; align-items:center; gap:9px; padding:9px 10px 9px 13px; border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface-2); }
          .ad-keyval{ font-family:var(--font-mono); font-size:12.5px; color:var(--ink); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:.02em; }
          .ad-keybtn{ width:32px; height:32px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--muted); border:1px solid var(--line); background:var(--surface); transition:.13s; flex-shrink:0; }
          .ad-keybtn:hover{ color:var(--accent-strong); border-color:var(--accent); background:var(--accent-weak); }
          .ad-keybtn .ico{ width:16px; height:16px; }

          .ad-base{ display:inline-flex; align-items:center; gap:9px; padding:6px 7px 6px 12px; border-radius:var(--r-full); background:var(--surface); border:1px solid var(--line); box-shadow:var(--sh-xs); }
          .ad-basecopy{ width:28px; height:28px; border-radius:var(--r-xs); display:grid; place-items:center; color:var(--muted); transition:.13s; }
          .ad-basecopy:hover{ color:var(--accent-strong); background:var(--accent-weak); }
          .ad-basecopy.is-copied{ color:var(--green-700); }
          .ad-basecopy .ico{ width:15px; height:15px; }

          .ad-exec-status{ display:flex; align-items:center; gap:9px; color:var(--green-700); font-size:15px; }
          .ad-exec-status .ico{ color:var(--green-600); }
          .ad-exec-ms{ color:var(--muted); font-size:12px; font-weight:400; margin-left:2px; }

          @media (max-width:900px){
            .ad-layout{ grid-template-columns:1fr; }
            .ad-side{ position:static; }
            .ad-side__body{ max-height:none; }
          }
        </style>

        ${hero}
        <div class="ad-layout reveal">
          ${sidebar()}
          ${detail(ep)}
        </div>
      </div>`;
    },
    mounted() {
      if (AD._focusSearch) {
        const el = document.getElementById('adSearch');
        if (el) { el.focus(); const v = el.value; el.value = ''; el.value = v; }
        AD._focusSearch = false;
      }
    },
  });
})();
