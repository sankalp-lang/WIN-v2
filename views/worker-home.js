/* Worker · Home — editorial hero, Diya command bar, Govt trust band,
   quick actions, targeted scheme alert. Gold-standard for the v2 look. */
(function () {
  let schemeDismissed = false;
  window.WorkerHome = {
    dismissScheme() { schemeDismissed = true; App.reload(); },
    ask(q) { if (q) App.diya.fromHome(q); },
    askInput() { const el = document.getElementById('whAsk'); const v = el ? el.value.trim() : ''; if (el) el.value = ''; if (v) App.diya.fromHome(v); },
  };

  // shown to a freshly signed-up worker instead of Rajan's demo home — there's no
  // work history or verified identity yet, so nudge them to fill in their profile.
  function freshHome() {
    return `<div class="page fade-in">
      <div class="hero reveal">
        <div class="hero__wash"></div>
        <div class="hero__in">
          <div class="eyebrow">${App.icon('fingerprint')} Welcome to WiN</div>
          <h1 class="h-grad" style="margin-top:12px">Let's build your verified profile.</h1>
          <p class="lead">Your mobile number is verified. Add your work history and skills next, so employers, banks and government schemes can see your verified record.</p>
          <button class="btn btn--accent" style="margin-top:16px" onclick="App.navigate('worker-settings')">${App.icon('edit')} Complete My Profile</button>
        </div>
      </div>
    </div>`;
  }

  App.registerView('worker-home', {
    title: 'Home',
    subtitle: 'Your verified worker identity',
    render(ctx) {
      const u = ctx.user;
      if (App.diya && App.diya.active && App.diya.mode === 'full') return App.diya.surface(ctx);
      if (u && u._fresh) return freshHome();
      const fn = (u.name || 'there').split(' ')[0];

      const chips = [
        { label: 'Find jobs near me', q: 'find jobs near me' },
        { label: 'Check my PF', q: 'what is my EPFO balance?' },
        { label: 'Make my CV', q: 'help me build my CV' },
        { label: 'Check ESIC', q: 'what is my ESIC status?' },
        { label: 'Govt schemes', q: 'which government schemes am I eligible for?' },
      ];
      const actions = [
        { ic: 'idcard', c: '#0E9E6C', t: 'My Portfolio', s: 'Verified work history', tag: '100% Verified', tagIc: 'shieldcheck', go: 'worker-portfolio' },
        { ic: 'graduation', c: '#3B54E8', t: 'Skills', s: 'Courses & guidance', tag: '3 new courses', tagIc: 'trend', go: 'worker-skills' },
        { ic: 'briefcase', c: '#0E8C82', t: 'Find Jobs', s: 'Hyperlocal & gig', tag: '6 matching', tagIc: 'search', go: 'worker-jobs' },
        { ic: 'message', c: '#B77E12', t: 'Grievances', s: 'File & track', tag: '2 active', tagIc: 'clock', go: 'worker-grievance' },
      ];

      const scheme = schemeDismissed ? '' : `
        <div class="card reveal" style="border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-ring);overflow:hidden">
          <div class="row between" style="padding:11px 16px;background:var(--accent-weak)">
            <span class="eyebrow" style="color:var(--accent-strong)">${App.icon('bell')} Govt. scheme alert</span>
            <button class="iconbtn" style="width:26px;height:26px" onclick="WorkerHome.dismissScheme()">${App.icon('x')}</button>
          </div>
          <div class="card__body">
            <div class="row between wrap gap-16">
              <div style="flex:1;min-width:250px">
                <b style="font-size:16px">New scheme for you — PM-SHRI Upskilling Programme</b>
                <p class="muted" style="margin-top:7px;font-size:13.5px;max-width:62ch">As a verified construction worker (${App.esc(u.winId)}), you're eligible for free skill certification under the PM Schools for Rising India scheme — a ₹3,000 training stipend plus an NSQF certificate.</p>
                <div class="row gap-8 mt-12">${App.ui.pill('Ministry of Labour & Employment', 'accent')}</div>
              </div>
              <button class="btn btn--accent" onclick="WorkerHome.ask('Am I eligible for the PM-SHRI upskilling scheme?')">Check eligibility ${App.icon('arrow')}</button>
            </div>
          </div>
        </div>`;

      return `<div class="page fade-in">

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('fingerprint')} Verified worker identity</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">Namaste, ${App.esc(fn)}.</h1>
                <div class="row gap-12 mt-12 wrap">
                  ${App.ui.avatar(u.name, 'sm')}
                  <span class="mono" style="font-size:12.5px;color:var(--muted)">WiN ID · ${App.esc(u.winId)}</span>
                  ${App.ui.verified('100% Verified')}
                  <span class="pill pill--gray">${App.esc(u.role)} · ${App.esc(u.location)}</span>
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="App.navigate('worker-portfolio')">${App.icon('idcard')} Portfolio</button>
                <button class="btn btn--primary" onclick="App.navigate('worker-cv')">${App.icon('doc')} My CV</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Diya command bar -->
        <div class="card card--pad reveal" style="margin-bottom:20px">
          <div class="row gap-12" style="margin-bottom:14px">
            <div class="kpi__icon" style="width:40px;height:40px;background:linear-gradient(140deg,#f5a623,#e8712c);color:#fff">${App.icon('sparkles')}</div>
            <div class="grow"><div class="row gap-8"><b style="font-size:15.5px">Diya</b>${App.ui.pill('Online', 'green', true)}</div><div class="muted" style="font-size:12.5px">Your WiN assistant — how can I help you today?</div></div>
          </div>
          <div class="chat-inputwrap" style="border-radius:var(--r)">
            <textarea id="whAsk" rows="1" placeholder="Type or speak your question…  e.g. what's my PF balance?" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();WorkerHome.askInput();}"></textarea>
            <button class="chat-send" onclick="WorkerHome.askInput()">${App.icon('send')}</button>
          </div>
          <div class="row gap-8 wrap mt-12">
            ${chips.map(c => `<button class="chip" onclick="WorkerHome.ask('${c.q.replace(/'/g, "\\'")}')">${App.esc(c.label)}</button>`).join('')}
          </div>
        </div>

        <!-- govt trust band -->
        <div class="banner banner--amber reveal" style="margin-bottom:22px;align-items:center">
          ${App.icon('shieldcheck')}
          <div class="grow"><b>Ministry of Labour &amp; Employment</b> · Government of India<div style="font-size:12px;opacity:.85;margin-top:2px">Your data is protected under the DPDP Act, 2023 and shared only with your consent.</div></div>
          ${App.icon('landmark')}
        </div>

        <!-- quick actions -->
        <div class="section-title">Quick actions</div>
        <div class="grid grid-4" style="margin-bottom:22px">
          ${actions.map(a => `
            <button class="card card--pad card--hover reveal" style="text-align:left;cursor:pointer" onclick="App.navigate('${a.go}')">
              <div class="kpi__icon" style="width:42px;height:42px;background:${a.c}1a;color:${a.c};margin-bottom:14px">${App.icon(a.ic)}</div>
              <b style="font-size:15.5px;display:block">${a.t}</b>
              <div class="muted" style="font-size:12.5px;margin-top:2px">${a.s}</div>
              <div class="row gap-6 mt-12" style="color:${a.c};font-size:12px;font-weight:600">${App.icon(a.tagIc)} ${a.tag}</div>
            </button>`).join('')}
        </div>

        ${scheme}
      </div>`;
    },
    mounted(ctx) {
      if (App.diya && App.diya.active && App.diya.mode === 'full') { App.diya.renderThread(); const i = document.getElementById('diyaInput'); if (i) i.focus(); }
    }
  });
})();
