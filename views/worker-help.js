/* Worker · Help & Support (v2 editorial) — opens with an editorial hero band,
   a support-snapshot statstrip, a searchable FAQ accordion (first item open,
   one at a time, live text filter with match highlighting + empty state), a
   Contact Us card (email / helpline / AI assistant), a live Support-tickets
   card fed by a working "Raise a ticket" modal (category → details → success →
   toast), and a Resources card that opens demo policy documents in a modal.
   Fully offline & self-contained. */
(function () {
  // ---- FAQ content (from the Help & Support spec) ----
  const FAQ = [
    {
      id: 'f0',
      q: 'How do I update my WIN ID details?',
      a: 'Navigate to Profile Settings by clicking your name on the portfolio page. From there you can update your personal information, work details, and security settings.',
    },
    {
      id: 'f1',
      q: 'How do I file a grievance?',
      a: 'Go to the Grievance Hub from the sidebar menu. You can use the AI assistant to describe your issue, or click "File New Grievance" for formal submissions. All grievances are tracked via your WIN ID.',
    },
    {
      id: 'f2',
      q: 'How do I share my profile with employers?',
      a: 'On your portfolio page, click the "Share Profile" button. You can share via Email, WhatsApp, LinkedIn, or copy a direct link. Employers can verify your profile using the shared link.',
    },
    {
      id: 'f3',
      q: 'What is the verification process?',
      a: 'Verification is done through employer databases and government ministry records linked to your WIN ID. Identity, employer, government database, and skills are all verified independently.',
    },
    {
      id: 'f4',
      q: 'How do I check my ESIC/EPFO/E-Shram status?',
      a: 'Use the AI assistant in the Grievance Hub. Simply type your query like "ESIC status" or "EPFO balance" and the assistant will fetch your linked records.',
    },
    {
      id: 'f5',
      q: 'Can I download my portfolio?',
      a: 'Yes. On the portfolio page, click "Download Profile" to generate a PDF version of your complete portfolio including work history, skills, and verification status.',
    },
  ];

  // ---- contact channels ----
  const CHANNELS = [
    { ic: 'mail', c: '#2f5fd0', label: 'Email Support', val: 'support@win-platform.in', href: 'mailto:support@win-platform.in' },
    { ic: 'phone', c: '#0e9f6e', label: 'Helpline', val: '1800-123-456 (Toll Free)', href: 'tel:+911800123456', num: true },
    { ic: 'message', c: '#c07d10', label: 'AI Assistant', val: 'Available in Grievance Hub', act: 'WorkerHelp.askDiya()' },
  ];

  // ---- resource documents (open as demo modals — offline safe) ----
  const RESOURCES = [
    {
      id: 'guide', label: 'User Guide',
      body: 'The WiN User Guide walks you through verifying your identity via Aadhaar or DigiLocker, building your verified portfolio, sharing it with employers, discovering jobs matched to your skills, and filing grievances that route automatically to the right ministry.',
      points: ['Set up and verify your WiN ID', 'Build & share your verified portfolio', 'Find jobs matched to your record', 'File and track grievances'],
    },
    {
      id: 'privacy', label: 'Privacy Policy',
      body: 'Your data is protected under the Digital Personal Data Protection (DPDP) Act, 2023. WiN reads verified records from EPFO, the Income-Tax database, ESIC, GSTN and DigiLocker only with your explicit consent, shares them only with parties you approve, and never sells your personal data.',
      points: ['Consent-first data sharing', 'Purpose-limited, revocable access', 'Source-verified, never self-declared', 'Full audit trail of who accessed what'],
    },
    {
      id: 'terms', label: 'Terms of Service',
      body: 'By using WiN you agree to keep your account credentials secure, to use the platform for lawful employment and welfare purposes, and to the Government of India service terms that govern identity authentication. WiN provides verification as a facilitation layer and does not itself grant or deny benefits.',
      points: ['Lawful, personal use only', 'You control your consent grants', 'Authentication via Govt. of India services', 'WiN is a verification facilitator'],
    },
  ];

  // ---- raise-a-ticket taxonomy ----
  const TICKET_CATS = [
    { k: 'Account & WiN ID', ic: 'idcard' },
    { k: 'Verification', ic: 'shieldcheck' },
    { k: 'Portfolio & Sharing', ic: 'user' },
    { k: 'Jobs & Skills', ic: 'briefcase' },
    { k: 'Benefits (EPFO / ESIC / E-Shram)', ic: 'landmark' },
    { k: 'Technical issue', ic: 'bolt' },
    { k: 'Other', ic: 'doc' },
  ];
  const REACH = [
    { k: 'Email', ic: 'mail' },
    { k: 'Phone', ic: 'phone' },
    { k: 'In-app', ic: 'message' },
  ];
  const PRIOS = [['Normal', '#2f5fd0'], ['High', '#c07d10'], ['Urgent', '#d64545']];

  // ---- tickets (one seeded, session-raised ones prepend) ----
  const tickets = [
    { id: 'TKT-2048', subject: 'Portfolio PDF not downloading', cat: 'Portfolio & Sharing', date: '2026-07-14', status: 'In Progress', reach: 'Email', priority: 'Normal' },
  ];

  // ---- local state ----
  let q = '';           // raw search query
  let open = 'f0';      // id of the expanded FAQ (null = all collapsed)
  let draft = null;     // raise-ticket working draft

  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  // escape-safe highlight: split on the raw match, escape each segment separately
  function hl(text, needle) {
    if (!needle) return App.esc(text);
    const rx = new RegExp('(' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return text.split(rx).map((part, i) => (i % 2 ? '<mark class="wh-hl">' + App.esc(part) + '</mark>' : App.esc(part))).join('');
  }

  function matches() {
    const needle = q.trim().toLowerCase();
    if (!needle) return FAQ.slice();
    return FAQ.filter(f => f.q.toLowerCase().includes(needle) || f.a.toLowerCase().includes(needle));
  }

  const openTickets = () => tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  // the accordion (re-rendered in place on search / toggle so focus + scroll are preserved)
  function faqListHtml() {
    const needle = q.trim();
    const rows = matches();
    if (!rows.length) {
      return `<div class="empty" style="padding:38px 20px">
        ${App.icon('help', 'empty__ic')}
        <b>No matching topics found</b>
        <span>Try a different search or contact us below.</span>
      </div>`;
    }
    return rows.map(f => {
      const isOpen = open === f.id;
      return `
        <div class="wh-faq ${isOpen ? 'is-open' : ''}">
          <button class="wh-faq__q" aria-expanded="${isOpen}" onclick="WorkerHelp.toggle('${f.id}')">
            <span class="grow">${hl(f.q, needle)}</span>
            <span class="wh-chev">${App.icon('chevrondown')}</span>
          </button>
          ${isOpen ? `<div class="wh-faq__a">${hl(f.a, needle)}</div>` : ''}
        </div>`;
    }).join('');
  }

  function faqCountHtml() {
    const n = matches().length;
    return q.trim()
      ? `<span class="muted" style="font-size:12.5px"><span class="num">${n}</span> of <span class="num">${FAQ.length}</span></span>`
      : `<span class="muted" style="font-size:12.5px"><span class="num">${FAQ.length}</span> topics</span>`;
  }

  function ticketsListHtml() {
    if (!tickets.length) {
      return `<div class="empty" style="padding:30px 18px">
        ${App.icon('file', 'empty__ic')}
        <b>No tickets yet</b>
        <span>Raise a ticket and track it here — every request is linked to your WiN ID.</span>
      </div>`;
    }
    return tickets.map(t => `
      <button class="wh-tkt" onclick="WorkerHelp.viewTicket('${jsq(t.id)}')">
        <span class="wh-tkt__main">
          <span class="row gap-8" style="align-items:center">
            <span class="mono num" style="font-weight:600;color:var(--ink);font-size:12.5px">${App.esc(t.id)}</span>
            ${t.fresh ? '<span class="pill pill--accent" style="font-size:9.5px;padding:1px 7px">New</span>' : ''}
          </span>
          <span class="wh-tkt__sub">${App.esc(t.subject)}</span>
          <span class="faint" style="font-size:11px">${App.esc(t.cat)} · <span class="num">${App.esc(t.date)}</span></span>
        </span>
        ${App.ui.statusPill(t.status)}
      </button>`).join('');
  }

  // ---- controller ----
  window.WorkerHelp = {
    search(v) {
      q = v;
      const list = document.getElementById('whFaqList');
      const cnt = document.getElementById('whFaqCount');
      if (list) list.innerHTML = faqListHtml();
      if (cnt) cnt.innerHTML = faqCountHtml();
    },
    clearSearch() {
      q = '';
      const inp = document.getElementById('whSearch');
      if (inp) inp.value = '';
      WorkerHelp.search('');
      if (inp) inp.focus();
    },
    toggle(id) {
      open = open === id ? null : id;
      const list = document.getElementById('whFaqList');
      if (list) list.innerHTML = faqListHtml();
    },
    askDiya() {
      App.assistant.toggle(true);
      App.assistant.ask('I need help using my WiN account');
    },
    openResource(id) {
      const r = RESOURCES.find(x => x.id === id);
      if (!r) return;
      const pts = r.points.map(p => `<li>${App.esc(p)}</li>`).join('');
      App.modal.open(`
        <p class="muted" style="font-size:13.5px;line-height:1.65;margin:0 0 14px">${App.esc(r.body)}</p>
        <ul class="wh-doclist">${pts}</ul>
        <div class="banner banner--info" style="margin-top:18px">${App.icon('file')}
          <div>This is a demo document inside the WiN prototype. In production it opens the published ${App.esc(r.label)}.</div>
        </div>`, {
        title: r.label, icon: 'doc',
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               <button class="btn btn--primary" onclick="App.modal.close();App.toast('${jsq(r.label)} — demo document')">${App.icon('download')} Download</button>`,
      });
    },

    /* ---- raise-a-ticket flow (category → details → success → toast) ---- */
    openTicket() {
      draft = { catIx: -1, subject: '', description: '', reach: 'Email', priority: 'Normal' };
      WorkerHelp._renderTicketModal();
    },
    setCat(ix) { WorkerHelp._capture(); draft.catIx = ix; WorkerHelp._renderTicketModal(); },
    setReach(r) { WorkerHelp._capture(); draft.reach = r; WorkerHelp._renderTicketModal(); },
    setPrio(p) { WorkerHelp._capture(); draft.priority = p; WorkerHelp._renderTicketModal(); },
    set(k, v) { draft[k] = v; WorkerHelp._syncSubmit(); },
    _capture() {
      const s = document.getElementById('tktSubject');
      const d = document.getElementById('tktDesc');
      if (s) draft.subject = s.value;
      if (d) draft.description = d.value;
    },
    _valid() { return draft && draft.catIx > -1 && draft.subject.trim() && draft.description.trim(); },
    _syncSubmit() {
      const b = document.getElementById('tktSubmit');
      if (b) b.disabled = !WorkerHelp._valid();
    },
    _renderTicketModal() {
      const d = draft;
      const winId = (App.currentUser() || {}).winId || '';
      const cats = TICKET_CATS.map((c, i) => `
        <button class="wh-cat ${d.catIx === i ? 'is-sel' : ''}" onclick="WorkerHelp.setCat(${i})">
          ${App.icon(c.ic)}<span>${App.esc(c.k)}</span>
        </button>`).join('');
      const reach = REACH.map(r => `
        <button class="wh-reach ${d.reach === r.k ? 'is-sel' : ''}" onclick="WorkerHelp.setReach('${jsq(r.k)}')">
          ${App.icon(r.ic)}<span>${App.esc(r.k)}</span>
        </button>`).join('');
      const prios = PRIOS.map(([p, col]) => {
        const on = d.priority === p;
        return `<button onclick="WorkerHelp.setPrio('${p}')" style="${on ? `background:${col};border-color:transparent;color:#fff` : ''}">${p}</button>`;
      }).join('');

      const body = `
        <div class="banner banner--info" style="margin-bottom:18px">${App.icon('shieldcheck')}
          <div>Your ticket is linked to your WiN ID <b class="mono">${App.esc(winId)}</b> and answered within the support SLA. You can track it on this page.</div>
        </div>
        <div class="field">
          <label class="label">What do you need help with?</label>
          <div class="wh-catgrid">${cats}</div>
        </div>
        <div class="field">
          <label class="label">Subject</label>
          <input class="input" id="tktSubject" value="${App.esc(d.subject)}" placeholder="A short summary of your issue" oninput="WorkerHelp.set('subject',this.value)">
        </div>
        <div class="field">
          <label class="label">Describe your issue</label>
          <textarea class="textarea" id="tktDesc" placeholder="Include what you were doing, any error message, and reference numbers if relevant." oninput="WorkerHelp.set('description',this.value)">${App.esc(d.description)}</textarea>
        </div>
        <div class="grid grid-2" style="gap:16px">
          <div class="field" style="margin-bottom:0">
            <label class="label">Reply via</label>
            <div class="wh-reachrow">${reach}</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="label">Priority</label>
            <div class="wh-prio">${prios}</div>
          </div>
        </div>`;

      const foot = `
        <button class="btn" onclick="App.modal.close()">Cancel</button>
        <button class="btn btn--primary" id="tktSubmit" ${WorkerHelp._valid() ? '' : 'disabled'} onclick="WorkerHelp.submitTicket()">${App.icon('send')} Submit ticket</button>`;

      App.modal.open(body, { title: 'Raise a support ticket', icon: 'message', foot });
      WorkerHelp._syncSubmit();
    },
    submitTicket() {
      WorkerHelp._capture();
      if (!WorkerHelp._valid()) { App.toast('Pick a topic and add a subject & description', 'alert'); return; }
      const id = 'TKT-' + (2100 + Math.floor(Math.random() * 7800));
      const today = new Date().toISOString().slice(0, 10);
      tickets.unshift({
        id,
        subject: draft.subject.trim(),
        cat: TICKET_CATS[draft.catIx].k,
        date: today,
        status: 'Open',
        reach: draft.reach,
        priority: draft.priority,
        fresh: true,
      });

      App.modal.open(`
        <div class="wh-success">
          <div class="wh-bigico">${App.icon('checkcircle')}</div>
          <h3>Ticket raised</h3>
          <p class="muted">Your ticket ID is <b class="mono num" style="color:var(--ink)">${App.esc(id)}</b></p>
          <p class="muted" style="font-size:12.5px;max-width:36ch;margin:10px auto 0">Our team will reply via <b>${App.esc(draft.reach)}</b>. You can track progress in Support tickets. Redirecting…</p>
        </div>`, {});

      setTimeout(() => {
        App.modal.close();
        App.toast('Ticket raised · ' + id);
        App.reload();
      }, 2100);
    },
    viewTicket(id) {
      const t = tickets.find(x => x.id === id);
      if (!t) return;
      const winId = (App.currentUser() || {}).winId || '';
      const steps = t.status === 'Resolved'
        ? [['Ticket received', 'done'], ['Assigned to support', 'done'], ['Resolved', 'done']]
        : t.status === 'In Progress'
          ? [['Ticket received', 'done'], ['Assigned to support', 'done'], ['In progress', '']]
          : [['Ticket received', 'done'], ['Queued for triage', ''], ['Assigned to support', '']];
      const tl = steps.map(([label, cls]) =>
        `<div class="timeline__item"><span class="timeline__dot ${cls}"></span><b>${App.esc(label)}</b></div>`).join('');
      App.modal.open(`
        <div class="row between wrap gap-8" style="margin-bottom:12px">
          <span class="mono num" style="font-weight:600;color:var(--ink)">${App.esc(t.id)}</span>
          ${App.ui.statusPill(t.status)}
        </div>
        <b style="font-size:15px;display:block">${App.esc(t.subject)}</b>
        <div class="row gap-8 wrap mt-12" style="margin-bottom:16px">
          ${App.ui.pill(t.cat, 'gray')}
          ${App.ui.pill('Priority · ' + t.priority, 'accent')}
          ${App.ui.pill('Reply via ' + t.reach, 'blue')}
        </div>
        <div class="timeline">${tl}</div>
        <div class="banner banner--info" style="margin-top:16px">${App.icon('fingerprint')}
          <div>Tracked against WiN ID <b class="mono">${App.esc(winId)}</b> · opened <span class="num">${App.esc(t.date)}</span>.</div>
        </div>`, { title: 'Ticket details', icon: 'file' });
    },
  };

  App.registerView('worker-help', {
    title: 'Help & Support',
    subtitle: 'Find answers or reach out for assistance',
    render(ctx) {
      const u = ctx.user;
      const fn = (u.name || 'there').split(' ')[0];

      const style = `<style>
        .wh-cols{ display:grid; grid-template-columns:1.65fr 1fr; gap:20px; align-items:start; }
        .wh-search .input{ font-size:14px; }
        .wh-faq{ border-bottom:1px solid var(--line-2); }
        .wh-faq:last-child{ border-bottom:none; }
        .wh-faq__q{ width:100%; display:flex; align-items:center; gap:14px; text-align:left;
                    padding:16px 2px; font-size:14px; font-weight:600; color:var(--ink); background:none; border:none;
                    cursor:pointer; line-height:1.45; transition:color .13s; }
        .wh-faq__q:hover{ color:var(--accent-strong); }
        .wh-faq.is-open .wh-faq__q{ color:var(--accent-strong); }
        .wh-chev{ flex-shrink:0; display:inline-flex; color:var(--faint); transition:transform .2s ease, color .13s; }
        .wh-faq__q:hover .wh-chev, .wh-faq.is-open .wh-chev{ color:var(--accent); }
        .wh-faq.is-open .wh-chev{ transform:rotate(180deg); }
        .wh-faq__a{ padding:0 34px 18px 2px; font-size:13px; line-height:1.7; color:var(--ink-2);
                    animation:wh-reveal .2s ease; }
        @keyframes wh-reveal{ from{ opacity:0; transform:translateY(-4px) } to{ opacity:1; transform:none } }
        .wh-hl{ background:var(--accent-weak); color:var(--accent-strong); border-radius:4px; padding:0 2px; font-weight:600; }
        .wh-chan{ display:flex; align-items:center; gap:13px; width:100%; text-align:left; padding:13px 12px;
                  border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface);
                  cursor:pointer; transition:.13s; color:inherit; text-decoration:none; }
        .wh-chan + .wh-chan{ margin-top:10px; }
        .wh-chan:hover{ border-color:var(--accent); background:var(--surface-2); }
        .wh-chan__ic{ width:40px; height:40px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
        .wh-chan__lbl{ font-size:13.5px; font-weight:600; color:var(--ink); }
        .wh-chan__val{ font-size:12.5px; color:var(--muted); margin-top:2px; word-break:break-word; }
        .wh-res{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 12px;
                 border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface);
                 font-size:13.5px; font-weight:600; color:var(--ink); cursor:pointer; transition:.13s; }
        .wh-res + .wh-res{ margin-top:10px; }
        .wh-res:hover{ border-color:var(--accent); background:var(--surface-2); }
        .wh-res .wh-res__lead{ color:var(--muted); flex-shrink:0; }
        .wh-res .wh-res__ext{ color:var(--faint); flex-shrink:0; }
        .wh-doclist{ margin:0; padding-left:18px; }
        .wh-doclist li{ font-size:13px; color:var(--ink-2); line-height:1.6; margin-bottom:6px; }
        /* tickets */
        .wh-tkt{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 12px;
                 border:1px solid var(--line); border-radius:var(--r-sm); background:var(--surface); cursor:pointer;
                 transition:.13s; color:inherit; }
        .wh-tkt + .wh-tkt{ margin-top:10px; }
        .wh-tkt:hover{ border-color:var(--accent); background:var(--surface-2); }
        .wh-tkt__main{ display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
        .wh-tkt__sub{ font-size:13px; font-weight:600; color:var(--ink); line-height:1.35; }
        /* raise-ticket modal */
        .wh-catgrid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .wh-cat{ display:flex; align-items:center; gap:9px; padding:11px 12px; border:1px solid var(--line); border-radius:var(--r-sm); text-align:left; font-size:12.5px; font-weight:500; color:var(--ink-2); background:var(--surface); transition:.13s; }
        .wh-cat span{ line-height:1.25; }
        .wh-cat:hover{ border-color:var(--accent); background:var(--accent-weak); }
        .wh-cat.is-sel{ border-color:var(--accent); background:var(--accent-weak); color:var(--accent-strong); box-shadow:0 0 0 2px var(--accent-ring); }
        .wh-cat .ico{ color:var(--muted); flex-shrink:0; }
        .wh-cat.is-sel .ico{ color:var(--accent); }
        .wh-reachrow{ display:flex; gap:8px; }
        .wh-reach{ flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:9px; border:1px solid var(--line); border-radius:var(--r-sm); font-size:12.5px; font-weight:600; color:var(--muted); background:var(--surface); transition:.13s; }
        .wh-reach .ico{ width:15px; height:15px; }
        .wh-reach:hover{ border-color:var(--accent); }
        .wh-reach.is-sel{ border-color:var(--accent); background:var(--accent-weak); color:var(--accent-strong); }
        .wh-prio{ display:flex; gap:8px; }
        .wh-prio button{ flex:1; padding:9px; border:1px solid var(--line); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--muted); background:var(--surface); transition:.13s; }
        .wh-prio button:hover{ border-color:#d9dee8; }
        .wh-success{ text-align:center; padding:14px 8px 8px; }
        .wh-bigico{ width:60px; height:60px; margin:0 auto 16px; border-radius:50%; background:var(--green-50); color:var(--green-600); display:grid; place-items:center; }
        .wh-bigico .ico{ width:30px; height:30px; }
        .wh-success h3{ font-size:19px; font-family:var(--font-display); }
        .wh-success p{ margin-top:8px; font-size:13.5px; }
        @media (max-width:900px){ .wh-cols{ grid-template-columns:1fr; } }
        @media (max-width:820px){ .wh-catgrid{ grid-template-columns:1fr; } }
      </style>`;

      // ---- editorial hero ----
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('help')} Help &amp; support</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">How can we help, ${App.esc(fn)}?</h1>
                <p class="lead">Find answers to common questions, or reach a real person — every request stays tracked against your WiN ID.</p>
                <div class="row gap-12 mt-12 wrap">
                  <span class="mono" style="font-size:12.5px;color:var(--muted)">WiN ID · ${App.esc(u.winId)}</span>
                  ${App.ui.pill('Mon–Sat · 9 AM – 8 PM IST', 'gray', true)}
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="WorkerHelp.askDiya()">${App.icon('sparkles')} Ask Diya</button>
                <button class="btn btn--accent" onclick="WorkerHelp.openTicket()">${App.icon('plus')} Raise a ticket</button>
              </div>
            </div>
          </div>
        </div>`;

      // ---- support snapshot statstrip ----
      const snapshot = `
        <div class="statstrip reveal" style="margin-bottom:22px">
          <div class="statstrip__cell">
            <div class="statstrip__label">Help topics</div>
            <div class="statstrip__val num">${FAQ.length}</div>
          </div>
          <div class="statstrip__cell">
            <div class="statstrip__label">Avg. first response</div>
            <div class="statstrip__val">&lt; <span class="num">2</span> hr</div>
          </div>
          <div class="statstrip__cell">
            <div class="statstrip__label">Open tickets</div>
            <div class="statstrip__val num">${openTickets()}</div>
          </div>
          <div class="statstrip__cell">
            <div class="statstrip__label">Contact channels</div>
            <div class="statstrip__val num">${CHANNELS.length}</div>
          </div>
        </div>`;

      // ---- search card ----
      const search = `
        <div class="card card--pad wh-search reveal" style="margin-bottom:20px">
          <div class="input--icon">${App.icon('search')}
            <input class="input" id="whSearch" placeholder="Search for help topics..." value="${App.esc(q)}" oninput="WorkerHelp.search(this.value)">
          </div>
        </div>`;

      // ---- FAQ card ----
      const faq = `
        <div class="card reveal">
          <div class="card__head">
            <h3 class="grow">Frequently Asked Questions</h3>
            <span id="whFaqCount">${faqCountHtml()}</span>
          </div>
          <div class="card__body" style="padding-top:4px;padding-bottom:6px">
            <div id="whFaqList">${faqListHtml()}</div>
          </div>
        </div>`;

      // ---- contact card ----
      const channels = CHANNELS.map(c => {
        const inner = `
          <span class="wh-chan__ic" style="background:${c.c}1a;color:${c.c}">${App.icon(c.ic)}</span>
          <span class="grow"><span class="wh-chan__lbl" style="display:block">${App.esc(c.label)}</span><span class="wh-chan__val ${c.num ? 'num' : ''}">${App.esc(c.val)}</span></span>
          ${App.icon(c.href ? 'external' : 'arrow', 'faint')}`;
        return c.href
          ? `<a class="wh-chan" href="${c.href}">${inner}</a>`
          : `<button class="wh-chan" onclick="${c.act}">${inner}</button>`;
      }).join('');

      const contact = `
        <div class="card reveal">
          <div class="card__head"><h3 class="grow">Contact Us</h3></div>
          <div class="card__body">
            ${channels}
            <div class="banner banner--green" style="margin-top:16px">${App.icon('clock')}
              <div>Support hours: Mon–Sat, 9 AM – 8 PM IST. Grievances filed via your WiN ID are tracked 24/7.</div>
            </div>
          </div>
        </div>`;

      // ---- support tickets card ----
      const ticketsCard = `
        <div class="card reveal mt-16">
          <div class="card__head">
            <h3 class="grow">Support tickets</h3>
            <button class="btn btn--soft btn--sm" onclick="WorkerHelp.openTicket()">${App.icon('plus')} New</button>
          </div>
          <div class="card__body" id="whTickets">${ticketsListHtml()}</div>
        </div>`;

      // ---- resources card ----
      const resources = `
        <div class="card reveal mt-16">
          <div class="card__head"><h3 class="grow">Resources</h3></div>
          <div class="card__body">
            ${RESOURCES.map(r => `
              <button class="wh-res" onclick="WorkerHelp.openResource('${r.id}')">
                <span class="wh-res__lead">${App.icon('file')}</span>
                <span class="grow">${App.esc(r.label)}</span>
                <span class="wh-res__ext">${App.icon('external')}</span>
              </button>`).join('')}
          </div>
        </div>`;

      return `<div class="page fade-in">
        ${style}
        ${hero}
        ${snapshot}
        <div class="wh-cols">
          <div>
            ${search}
            ${faq}
          </div>
          <div>
            ${contact}
            ${ticketsCard}
            ${resources}
          </div>
        </div>
      </div>`;
    }
  });
})();
