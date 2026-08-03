/* Worker · Skill Advisor — editorial hero, certified skills, in-demand field
   skills, and enrolled + browsable upskilling courses with salary-impact
   guidance and a working Diya assistant hook. v2 editorial standard. */
(function () {
  const S = { tab: 'skills', sub: 'enrolled', q: '', cat: 'All' };

  window.WorkerSkills = {
    setTab(t) { S.tab = t; App.reload(); },
    setSub(s) { S.sub = s; App.reload(); },
    setCat(c) {
      S.cat = c;
      const el = document.getElementById('wsBrowseBody');
      if (el) el.innerHTML = browseBodyHtml(); else App.reload();
    },
    onSearch(v) {
      S.q = v;
      const el = document.getElementById('wsBrowseGrid');
      if (el) el.innerHTML = browseGridHtml(); else App.reload();
    },
    resetFilters() {
      S.q = ''; S.cat = 'All';
      const inp = document.getElementById('wsSearch'); if (inp) inp.value = '';
      const el = document.getElementById('wsBrowseBody');
      if (el) el.innerHTML = browseBodyHtml(); else App.reload();
    },
    open(url, label) {
      App.toast('Opening ' + label + '…', 'external');
      try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) {}
    },
    askDiya(q) { App.assistant.toggle(true); if (q) App.assistant.ask(q); },
    askField(i) { const f = fieldSkills[i]; if (f) WorkerSkills.askDiya('How do I start learning ' + f.name + ' to boost my daily rate?'); },
  };

  /* ---- inline icons not in the base set ---- */
  const icPlay = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 4.5 20 12 6 19.5z"/></svg>';
  const icBulb = '<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1v.2h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>';

  /* ---- data ---- */
  const NCS = 'https://www.ncs.gov.in';
  const SKILLINDIA = 'https://www.skillindia.gov.in';

  const TIER = { gold: '#b7791f', silver: '#64748b', bronze: '#c2620f' };
  const CERT_ACCENT = '#0e9f6e';   // one shared accent for all certified-skill cards
  const FIELD_ACCENT = '#2f5fd0';  // one shared accent for all top-skills-in-field cards
  const certified = [
    { name: 'Masonry', level: 'Expert', tier: 'gold', years: 14, body: 'NSDC', date: 'Jan 2024' },
    { name: 'Scaffolding', level: 'Advanced', tier: 'silver', years: 10, body: 'Construction Skills Council', date: 'Mar 2023' },
    { name: 'Plastering', level: 'Advanced', tier: 'silver', years: 12, body: 'Skill India', date: 'Jun 2023' },
    { name: 'Tile Work', level: 'Intermediate', tier: 'bronze', years: 8, body: 'NSDC', date: 'Sep 2022' },
    { name: 'Concrete Finishing', level: 'Advanced', tier: 'silver', years: 11, body: 'Construction Skills Council', date: 'Dec 2023' },
    { name: 'Blueprint Reading', level: 'Intermediate', tier: 'bronze', years: 5, body: 'PMI India', date: 'Aug 2024' },
  ];

  const demandKind = { 'Very High': 'red', High: 'amber', Rising: 'blue' };
  const fieldSkills = [
    { name: 'Waterproofing', demand: 'Very High', boost: 300, openings: 2840, desc: 'Chemical & membrane waterproofing for basements, terraces, and wet areas.' },
    { name: 'Structural Repair', demand: 'High', boost: 250, openings: 1960, desc: 'Crack injection, carbon fibre reinforcement, and concrete restoration techniques.' },
    { name: 'Green Building Practices', demand: 'High', boost: 200, openings: 1540, desc: 'Sustainable construction methods, energy-efficient materials, and IGBC certification prep.' },
    { name: 'BIM (Basic)', demand: 'Rising', boost: 400, openings: 890, desc: 'Building Information Modelling basics for on-site coordination and clash detection.' },
    { name: 'Plumbing & Sanitary', demand: 'High', boost: 200, openings: 3200, desc: 'Pipe fitting, drainage systems, water supply networks for residential & commercial projects.' },
    { name: 'Electrical Wiring', demand: 'Very High', boost: 350, openings: 4100, desc: 'Domestic and industrial wiring, panel boards, earthing and safety compliance.' },
  ];

  const enrolled = [
    { title: 'Structure Repair & Restoration', provider: 'NSDC', duration: '2 Days', progress: 65, start: 'Apr 25', next: 'Module 4: Crack Assessment', g: 'linear-gradient(135deg,#0d9488,#334155)' },
    { title: 'Advanced Scaffolding Safety', provider: 'Construction Skills Council', duration: '3 Days', progress: 30, start: 'May 10', next: 'Module 2: Load Calculations', g: 'linear-gradient(135deg,#2f5fd0,#0891a7)' },
  ];

  const salary = [
    { k: 80, role: 'Construction Supervisor', loc: 'Delhi' },
    { k: 50, role: 'Renovation Expert', loc: 'Gurugram' },
    { k: 40, role: 'Carpentry Supervisor', loc: 'Noida' },
    { k: 40, role: 'Plumbing Specialist', loc: 'Thane' },
  ];

  const CAT_GRAD = {
    Management: 'linear-gradient(135deg,#6b4fc7,#4f46e5)',
    Technical: 'linear-gradient(135deg,#2f5fd0,#0891a7)',
    Electrical: 'linear-gradient(135deg,#e8712c,#c07d10)',
    Sustainability: 'linear-gradient(135deg,#0e9f6e,#0d9488)',
    Masonry: 'linear-gradient(135deg,#0d9488,#475569)',
  };
  const MODE_KIND = { Online: 'green', Hybrid: 'blue', 'In-person': 'gray' };
  const categories = ['All', 'Masonry', 'Technical', 'Management', 'Electrical', 'Sustainability'];
  const browse = [
    { title: 'Project Management Basics', provider: 'PMI India', duration: '5 Days', start: 'Jun 1', location: 'Online', mode: 'Online', level: 'Intermediate', limited: true, rating: 4.9, enrolled: 342, wage: 35, cat: 'Management' },
    { title: 'Blueprint Reading & Interpretation', provider: 'NSDC', duration: '2 Days', start: 'Apr 30', location: 'Delhi', mode: 'Hybrid', level: 'Beginner', limited: false, rating: 4.5, enrolled: 210, wage: 10, cat: 'Technical' },
    { title: 'Electrical Basics for Construction', provider: 'Skill India', duration: '4 Days', start: 'May 20', location: 'Noida', mode: 'In-person', level: 'Beginner', limited: false, rating: 4.7, enrolled: 128, wage: 25, cat: 'Electrical' },
    { title: 'Green Building & Sustainability', provider: 'IGBC', duration: '3 Days', start: 'Jul 20', location: 'Online', mode: 'Online', level: 'Advanced', limited: false, rating: 4.8, enrolled: 245, wage: 30, cat: 'Sustainability' },
    { title: 'Concrete Technology & Finishing', provider: 'Construction Skills Council', duration: '3 Days', start: 'Jun 15', location: 'Delhi', mode: 'In-person', level: 'Intermediate', limited: false, rating: 4.4, enrolled: 94, wage: 18, cat: 'Masonry' },
    { title: 'Waterproofing Techniques', provider: 'NSDC', duration: '2 Days', start: 'May 5', location: 'Gurugram', mode: 'In-person', level: 'Intermediate', limited: true, rating: 4.9, enrolled: 180, wage: 30, cat: 'Masonry' },
  ];

  /* ---- SKILLS TAB ---- */
  function skillsTab(fresh) {
    const certList = fresh ? [] : certified;
    const certCards = certList.map(s => `
      <div class="card card--pad" style="border-top:3px solid ${CERT_ACCENT}">
        <div class="row between" style="align-items:flex-start">
          <div>
            <b style="font-size:15px">${App.esc(s.name)}</b>
            <div class="muted" style="font-size:12.5px;margin-top:2px"><span class="num">${s.years}</span> years experience</div>
          </div>
          <span class="ws-lvl" style="background:${TIER[s.tier]}1a;color:${TIER[s.tier]}">${App.esc(s.level)}</span>
        </div>
        <div class="row between mt-16" style="padding-top:12px;border-top:1px solid var(--line-2)">
          <span class="row gap-6" style="font-size:12px;color:var(--muted)">${App.icon('award')}${App.esc(s.body)}</span>
          <span style="font-size:11.5px;color:var(--faint);white-space:nowrap">Certified ${App.esc(s.date)}</span>
        </div>
      </div>`).join('');

    const fieldCards = fieldSkills.map((f, i) => `
      <div class="card card--pad ws-flow" style="border-top:3px solid ${FIELD_ACCENT}">
        <div class="row between" style="align-items:flex-start;margin-bottom:9px">
          <b style="font-size:15px;max-width:16ch">${App.esc(f.name)}</b>
          ${App.ui.pill(f.demand, demandKind[f.demand], true)}
        </div>
        <p class="muted ws-desc">${App.esc(f.desc)}</p>
        <div class="row between wrap gap-8 mt-12 mb-16">
          <span class="row gap-6" style="color:var(--green-700);font-weight:600;font-size:13px">${App.icon('bolt')}+<span class="num">₹${f.boost}</span>/day</span>
          <span class="row gap-6" style="font-size:12.5px;font-weight:700;color:#fff;background:${FIELD_ACCENT};padding:4px 9px;border-radius:var(--r-full)">${App.icon('briefcase')}<span class="num">${App.num(f.openings)}</span> openings</span>
        </div>
        <div class="row gap-8 ws-cta">
          <button class="btn ws-btn-blue grow" onclick="WorkerSkills.open('${SKILLINDIA}','Skill India')">Learn More on Skill India ${App.icon('external')}</button>
          <button class="btn btn--soft btn--icon" title="Ask Diya about ${App.esc(f.name)}" onclick="WorkerSkills.askField(${i})">${App.icon('sparkles')}</button>
        </div>
      </div>`).join('');

    return `
      <div class="reveal">
        <div class="row between wrap gap-8 mb-12">
          <div class="row gap-8"><span style="color:var(--green-600);display:inline-flex">${App.icon('checkcircle')}</span><span class="section-title" style="margin:0">Your Certified Skills</span></div>
          ${App.ui.pill(certList.length + ' Verified', 'green')}
        </div>
        ${certList.length ? `<div class="grid grid-3">${certCards}</div>`
          : App.ui.empty('award', 'No certified skills yet', 'Add your work history and skills in Profile & Settings to get certified skill matches.')}
      </div>

      <div class="reveal" style="margin-top:30px">
        <div class="row between wrap gap-8" style="margin-bottom:6px">
          <div class="row gap-8"><span style="color:var(--blue-600);display:inline-flex">${App.icon('trend')}</span><span class="section-title" style="margin:0">Top Skills in Your Field</span></div>
          ${App.ui.pill('Construction & Masonry', 'blue')}
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:16px">High-demand skills that can boost your daily rate and open new job opportunities.</p>
        <div class="grid grid-3">${fieldCards}</div>
      </div>`;
  }

  /* ---- COURSES · ENROLLED ---- */
  function enrolledSub() {
    const cards = enrolled.map(c => `
      <div class="card card--pad" style="margin-bottom:14px">
        <div class="row gap-16 wrap">
          <div class="ws-hthumb" style="background:${c.g}">${App.icon('graduation')}</div>
          <div class="grow" style="min-width:240px">
            <div class="row between wrap gap-8">
              <div>
                <b style="font-size:15px">${App.esc(c.title)}</b>
                <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(c.provider)} · ${App.esc(c.duration)} · Starts ${App.esc(c.start)}</div>
              </div>
              ${App.ui.pill('Active', 'green', true)}
            </div>
            <div class="mt-16">
              <div class="row between" style="margin-bottom:6px">
                <span style="font-size:12.5px;font-weight:600">Progress</span>
                <span class="num" style="font-size:12.5px;color:var(--accent-strong)">${c.progress}%</span>
              </div>
              ${App.ui.bar(c.progress)}
            </div>
            <div class="row between wrap gap-12 mt-16">
              <span class="muted" style="font-size:12.5px">Next: <b style="color:var(--ink)">${App.esc(c.next)}</b></span>
              <button class="btn btn--primary" onclick="WorkerSkills.open('${NCS}','NCS')">${icPlay} Continue</button>
            </div>
          </div>
        </div>
      </div>`).join('');

    const bars = salary.map(r => `
      <div style="margin-bottom:15px">
        <div class="row between" style="margin-bottom:7px">
          <span style="font-size:13px"><b class="num" style="font-size:14.5px;color:var(--ink)">₹${r.k}k</b> <span class="muted">· ${App.esc(r.role)} — ${App.esc(r.loc)}</span></span>
        </div>
        ${App.ui.bar(Math.round(r.k / 80 * 100), 'var(--blue-600)')}
      </div>`).join('');

    return `
      <div class="reveal">${cards}</div>
      <div class="card reveal">
        <div class="card__head">${App.icon('chart')}<div class="grow"><h3>Salary Impact</h3><div class="muted" style="font-size:12.5px;margin-top:2px">Potential wage increase based on your enrolled courses</div></div></div>
        <div class="card__body">${bars}</div>
      </div>`;
  }

  /* ---- COURSES · BROWSE ---- */
  function filteredBrowse() {
    const q = S.q.trim().toLowerCase();
    return browse.filter(c =>
      (S.cat === 'All' || c.cat === S.cat) &&
      (!q || c.title.toLowerCase().includes(q))
    );
  }

  function courseCard(c) {
    return `
      <div class="card ws-course card--hover" onclick="WorkerSkills.open('${NCS}','NCS')">
        <div class="ws-thumb" style="background:${CAT_GRAD[c.cat] || 'linear-gradient(135deg,#0e9f6e,#0d9488)'}">
          ${c.limited ? '<span class="ws-lim">Limited Seats</span>' : ''}
          <span class="ws-rate">${App.icon('star')}<span class="num">${c.rating.toFixed(1)}</span></span>
          <span class="ws-thumb__t">${App.esc(c.title)}</span>
        </div>
        <div class="card--pad">
          <div class="row between wrap gap-8">
            <span class="muted" style="font-size:12.5px">${App.esc(c.provider)} · ${App.esc(c.level)}</span>
            <span style="color:var(--green-700);font-weight:700;font-size:13px" class="num">+${c.wage}% wage</span>
          </div>
          <div class="row wrap gap-16 mt-12" style="font-size:12px;color:var(--muted)">
            <span class="row gap-6">${App.icon('clock')}${App.esc(c.duration)}</span>
            <span class="row gap-6">${App.icon('calendar')}${App.esc(c.start)}</span>
            <span class="row gap-6">${App.icon('users')}<span class="num">${App.num(c.enrolled)}</span> enrolled</span>
          </div>
          <div class="row between wrap gap-8 mt-12 mb-16">
            <span class="row gap-6 muted" style="font-size:12.5px">${App.icon('mappin')}${App.esc(c.location)}</span>
            ${App.ui.pill(c.mode, MODE_KIND[c.mode] || 'gray')}
          </div>
          <button class="btn btn--primary btn--block" onclick="event.stopPropagation();WorkerSkills.open('${NCS}','NCS')">Enroll Now ${App.icon('chevron')}</button>
        </div>
      </div>`;
  }

  function browseGridHtml() {
    const list = filteredBrowse();
    if (!list.length) {
      return `<div class="mb-20">${App.ui.empty('graduation', 'No courses found', 'Try adjusting your search or filters')}
        <div class="center" style="margin-top:-6px"><button class="btn btn--soft btn--sm" onclick="WorkerSkills.resetFilters()">Clear filters</button></div></div>`;
    }
    return `<div class="grid grid-2 mb-20">${list.map(courseCard).join('')}</div>`;
  }

  function browseBodyHtml() {
    const cats = categories.map(c =>
      `<button class="ws-cat ${S.cat === c ? 'is-active' : ''}" onclick="WorkerSkills.setCat('${c}')">${App.esc(c)}</button>`
    ).join('');

    return `
      <div class="ws-cats mb-16">${cats}</div>
      <div class="banner banner--green mb-16">${icBulb}<div>Based on your masonry expertise and Delhi location, these courses have the highest wage impact for you.</div></div>
      <div id="wsBrowseGrid">${browseGridHtml()}</div>
      <button class="btn btn--block" onclick="WorkerSkills.open('${NCS}','NCS')">View All Courses on NCS ${App.icon('arrow')}</button>`;
  }

  function browseSub() {
    return `
      <div class="reveal">
        <div class="row wrap gap-12 mb-16">
          <div class="input--icon grow" style="min-width:220px">${App.icon('search')}
            <input class="input" id="wsSearch" placeholder="Search courses..." value="${App.esc(S.q)}" oninput="WorkerSkills.onSearch(this.value)">
          </div>
        </div>
        <div id="wsBrowseBody">${browseBodyHtml()}</div>
      </div>`;
  }

  function coursesTab() {
    return `
      <div class="seg ws-seg mb-20 reveal">
        <button class="${S.sub === 'enrolled' ? 'is-active' : ''}" onclick="WorkerSkills.setSub('enrolled')">Enrolled (<span class="num">2</span>)</button>
        <button class="${S.sub === 'browse' ? 'is-active' : ''}" onclick="WorkerSkills.setSub('browse')">Browse Courses</button>
      </div>
      ${S.sub === 'enrolled' ? enrolledSub() : browseSub()}`;
  }

  App.registerView('worker-skills', {
    title: 'Skills & Courses',
    subtitle: 'Certified skills & career guidance',
    render(ctx) {
      const fn = ((ctx && ctx.user && ctx.user.name) || 'there').split(' ')[0];
      const fresh = !!(ctx && ctx.user && ctx.user._fresh);
      return `<div class="page fade-in">
        <style>
          .ws-lvl{ display:inline-flex; align-items:center; padding:3px 10px; border-radius:var(--r-full); font-size:11px; font-weight:700; white-space:nowrap; }
          .ws-flow{ display:flex; flex-direction:column; }
          .ws-desc{ font-size:12.5px; line-height:1.5; min-height:38px; margin:0; }
          .ws-cta{ margin-top:auto; }
          .ws-btn-blue{ background:var(--blue-600); color:#fff; border-color:transparent; }
          .ws-btn-blue:hover{ background:var(--blue-700); border-color:transparent; }
          .ws-seg button.is-active{ background:var(--accent); color:#fff; box-shadow:var(--sh-xs); }
          .ws-hthumb{ flex:0 0 128px; min-height:112px; border-radius:var(--r); display:grid; place-items:center; color:rgba(255,255,255,.92); }
          .ws-hthumb .ico{ width:32px; height:32px; }
          .ws-stats{ display:flex; gap:22px; flex-wrap:wrap; }
          .ws-stat{ display:flex; flex-direction:column; gap:2px; }
          .ws-stat__v{ font-size:22px; font-weight:700; line-height:1; letter-spacing:-.01em; }
          .ws-stat__l{ font-size:11.5px; color:var(--muted); }
          .ws-cats{ display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
          .ws-cats::-webkit-scrollbar{ height:5px; }
          .ws-cats::-webkit-scrollbar-thumb{ background:var(--line); border-radius:9px; }
          .ws-cat{ flex:0 0 auto; padding:7px 15px; border-radius:var(--r-full); font-size:12.5px; font-weight:600; border:1px solid var(--line); background:var(--surface); color:var(--muted); cursor:pointer; transition:.13s; white-space:nowrap; }
          .ws-cat:hover{ border-color:var(--accent); color:var(--accent-strong); }
          .ws-cat.is-active{ background:var(--accent); color:#fff; border-color:transparent; }
          .ws-course{ overflow:hidden; display:flex; flex-direction:column; cursor:pointer; }
          .ws-thumb{ position:relative; min-height:132px; display:flex; align-items:flex-end; padding:13px; overflow:hidden; }
          .ws-thumb::before{ content:""; position:absolute; inset:0; background:linear-gradient(to top,rgba(6,12,20,.62),rgba(6,12,20,0) 62%); }
          .ws-thumb__t{ position:relative; z-index:1; color:#fff; font-weight:700; font-size:15px; line-height:1.28; text-shadow:0 1px 4px rgba(0,0,0,.35); }
          .ws-lim{ position:absolute; top:11px; left:11px; z-index:2; background:var(--red-600); color:#fff; font-size:10px; font-weight:700; letter-spacing:.02em; padding:3px 9px; border-radius:var(--r-full); }
          .ws-rate{ position:absolute; top:11px; right:11px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,.94); color:#0f1729; font-size:11.5px; font-weight:700; padding:3px 8px; border-radius:var(--r-full); }
          .ws-rate .ico{ width:13px; height:13px; color:#f5a623; fill:#f5a623; }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('sparkles')} Skill advisor</div>
            <div class="row between wrap gap-20" style="margin-top:12px;align-items:flex-end">
              <div style="flex:1;min-width:280px">
                <h1 class="h-grad">Khud ka vikas — skill up, ${App.esc(fn)}.</h1>
                <p class="lead">Every new certification puts you closer to a higher daily rate. Your certified skills, the fastest-rising trades in construction, and courses matched to higher-paying roles.</p>
                <div class="ws-stats mt-16">
                  <div class="ws-stat"><span class="ws-stat__v num" style="color:var(--accent-strong)">${fresh ? 0 : 6}</span><span class="ws-stat__l">Certified skills</span></div>
                  <div class="ws-stat"><span class="ws-stat__v num" style="color:var(--green-700)">${fresh ? '—' : '+₹400'}</span><span class="ws-stat__l">Top daily boost</span></div>
                  <div class="ws-stat"><span class="ws-stat__v num">${fresh ? 0 : 2}</span><span class="ws-stat__l">Courses in progress</span></div>
                </div>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="App.navigate('worker-jobs')">${App.icon('briefcase')} Find jobs</button>
                <button class="btn btn--accent" onclick="WorkerSkills.askDiya('Which skills should I learn next to earn more?')">${App.icon('sparkles')} Ask Diya</button>
              </div>
            </div>
          </div>
        </div>

        <div class="tabs">
          <div class="tab ${S.tab === 'skills' ? 'is-active' : ''}" onclick="WorkerSkills.setTab('skills')">Skills</div>
          <div class="tab ${S.tab === 'courses' ? 'is-active' : ''}" onclick="WorkerSkills.setTab('courses')">Courses</div>
        </div>

        ${S.tab === 'skills' ? skillsTab(fresh) : coursesTab()}
      </div>`;
    }
  });
})();
