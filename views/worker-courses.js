/* Worker · Browse Courses — editorial upskilling catalogue (NSDC / Skill India
   / Construction Skills Council etc.) filterable by live search, level and
   category, with wage-impact and a card → details modal → confirm → toast
   enroll flow that builds toward a Verified Skill Badge. v2 editorial standard. */
(function () {
  // ---------- state ----------
  const S = { search: '', level: 'All', category: 'All' };
  const ENROLLED = new Set();

  // ---------- data ----------
  const COURSES = [
    { id: 'c1', title: 'Structure Repair & Restoration', provider: 'NSDC', duration: '2 Days', start: 'Apr 25, 2025', location: 'Delhi', mode: 'In-person', level: 'Intermediate', rating: 4.8, enrolled: 156, wage: '+20%', category: 'Masonry', limited: true },
    { id: 'c2', title: 'Advanced Scaffolding Safety', provider: 'Construction Skills Council', duration: '3 Days', start: 'May 10, 2025', location: 'Gurugram', mode: 'In-person', level: 'Advanced', rating: 4.6, enrolled: 89, wage: '+15%', category: 'Safety' },
    { id: 'c3', title: 'Project Management Basics', provider: 'PMI India', duration: '5 Days', start: 'Jun 1, 2025', location: 'Online', mode: 'Online', level: 'Intermediate', rating: 4.9, enrolled: 342, wage: '+35%', category: 'Management', limited: true },
    { id: 'c4', title: 'Blueprint Reading & Interpretation', provider: 'NSDC', duration: '2 Days', start: 'Apr 30, 2025', location: 'Delhi', mode: 'Hybrid', level: 'Beginner', rating: 4.5, enrolled: 210, wage: '+10%', category: 'Technical' },
    { id: 'c5', title: 'Electrical Basics for Construction', provider: 'Skill India', duration: '4 Days', start: 'May 20, 2025', location: 'Noida', mode: 'In-person', level: 'Beginner', rating: 4.7, enrolled: 128, wage: '+25%', category: 'Electrical' },
    { id: 'c6', title: 'Concrete Technology & Finishing', provider: 'Construction Skills Council', duration: '3 Days', start: 'Jun 15, 2025', location: 'Delhi', mode: 'In-person', level: 'Intermediate', rating: 4.4, enrolled: 94, wage: '+18%', category: 'Masonry' },
    { id: 'c7', title: 'Plumbing & Water Systems', provider: 'Skill India', duration: '5 Days', start: 'Jul 5, 2025', location: 'Gurugram', mode: 'In-person', level: 'Beginner', rating: 4.3, enrolled: 76, wage: '+22%', category: 'Plumbing', limited: true },
    { id: 'c8', title: 'Green Building & Sustainability', provider: 'IGBC', duration: '3 Days', start: 'Jul 20, 2025', location: 'Online', mode: 'Online', level: 'Advanced', rating: 4.8, enrolled: 245, wage: '+30%', category: 'Sustainability' },
    { id: 'c9', title: 'Welding & Metal Fabrication', provider: 'NSDC', duration: '4 Days', start: 'Aug 1, 2025', location: 'Noida', mode: 'In-person', level: 'Intermediate', rating: 4.6, enrolled: 112, wage: '+20%', category: 'Technical' },
  ];

  const CATEGORIES = ['All', 'Masonry', 'Safety', 'Management', 'Technical', 'Electrical', 'Plumbing', 'Sustainability'];
  const LEVELS = [['All', 'All Levels'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']];

  const LEVEL_COLOR = { Beginner: 'green', Intermediate: 'blue', Advanced: 'amber' };
  const MODE_COLOR = { Online: 'green', Hybrid: 'blue', 'In-person': 'gray' };
  const CAT = {
    Masonry: { color: '#7a5a45', icon: 'building' },
    Safety: { color: '#d64545', icon: 'shieldcheck' },
    Management: { color: '#6b4fc7', icon: 'briefcase' },
    Technical: { color: '#2f5fd0', icon: 'layers' },
    Electrical: { color: '#c07d10', icon: 'bolt' },
    Plumbing: { color: '#0891a7', icon: 'plug' },
    Sustainability: { color: '#0e9f6e', icon: 'globe' },
  };

  // ---------- derived catalogue stats (for the hero strip) ----------
  const STAT_PROVIDERS = new Set(COURSES.map(c => c.provider)).size;
  const STAT_TOP_WAGE = COURSES.reduce((m, c) => Math.max(m, parseInt(c.wage, 10)), 0);
  const STAT_AVG_RATING = (COURSES.reduce((s, c) => s + c.rating, 0) / COURSES.length).toFixed(1);

  // ---------- helpers ----------
  const byId = id => COURSES.find(c => c.id === id);
  const wageInt = w => parseInt(w, 10);

  function filtered() {
    const q = S.search.trim().toLowerCase();
    return COURSES.filter(c => {
      if (S.level !== 'All' && c.level !== S.level) return false;
      if (S.category !== 'All' && c.category !== S.category) return false;
      if (q && !(c.title.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q))) return false;
      return true;
    });
  }
  function mediaBg(color) {
    return `linear-gradient(to top, rgba(15,23,41,.66), rgba(15,23,41,.06) 62%), linear-gradient(145deg, ${color} 0%, ${color} 40%, #0b1220 160%)`;
  }

  function courseCard(c) {
    const cat = CAT[c.category];
    const enrolled = ENROLLED.has(c.id);
    return `<div class="card wc-card card--hover" onclick="WorkerCourses.open('${c.id}')">
      <div class="wc-media" style="background:${mediaBg(cat.color)}">
        <span class="wc-media__wm">${App.icon(cat.icon)}</span>
        ${c.limited ? `<span class="wc-badge">${App.icon('bolt')} Limited Seats</span>` : ''}
        <span class="wc-rating">${App.icon('star')} <span class="num">${c.rating.toFixed(1)}</span></span>
        <div class="wc-media__title">${App.esc(c.title)}</div>
      </div>
      <div class="wc-body">
        <div class="row between center gap-8">
          <span class="wc-provider">${App.esc(c.provider)}</span>
          ${App.ui.pill(c.level, LEVEL_COLOR[c.level])}
        </div>
        <div class="row gap-16 wrap mt-12">
          <span class="wc-il">${App.icon('clock')} <span class="num">${App.esc(c.duration)}</span></span>
          <span class="wc-il">${App.icon('calendar')} <span class="num">${App.esc(c.start)}</span></span>
        </div>
        <div class="row between center mt-8">
          <span class="wc-il">${App.icon('mappin')} ${App.esc(c.location)}</span>
          ${App.ui.pill(c.mode, MODE_COLOR[c.mode])}
        </div>
        <div class="wc-foot row between center">
          <span class="wc-il">${App.icon('users')} <span class="num">${App.num(c.enrolled)}</span> enrolled</span>
          <span class="wc-il wc-wage">${App.icon('trend')} <span class="num">${App.esc(c.wage)}</span> wage</span>
        </div>
        ${enrolled
          ? `<button class="btn btn--soft btn--block" disabled style="margin-top:13px;opacity:.95">${App.icon('checkcircle')} Enrolled</button>`
          : `<button class="btn btn--primary btn--block" style="margin-top:13px" onclick="event.stopPropagation();WorkerCourses.open('${c.id}')">Enroll ${App.icon('chevron')}</button>`}
      </div>
    </div>`;
  }

  function gridHtml() {
    const list = filtered();
    if (!list.length) return App.ui.empty('graduation', 'No courses found', 'Try adjusting your search or filters');
    return `<div class="wc-grid">${list.map(courseCard).join('')}</div>`;
  }

  // ---------- controller ----------
  window.WorkerCourses = {
    // live search: patch only the grid + count so the input keeps focus
    search(v) {
      S.search = v;
      const g = document.getElementById('wcGrid'); if (g) g.innerHTML = gridHtml();
      const n = document.getElementById('wcCount'); if (n) n.textContent = filtered().length;
    },
    setLevel(v) { S.level = v; App.reload(); },
    setCategory(v) { S.category = v; App.reload(); },

    // whole-card + Enroll button → details / confirm modal
    open(id) {
      const c = byId(id); if (!c) return;
      const cat = CAT[c.category];
      const enrolled = ENROLLED.has(c.id);
      const cell = (label, val) => `<div class="statstrip__cell"><div class="statstrip__label">${label}</div><div class="statstrip__val num" style="font-size:15px">${App.esc(val)}</div></div>`;
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start">
          <div class="kpi__icon" style="width:44px;height:44px;flex-shrink:0;background:${cat.color}1a;color:${cat.color}">${App.icon(cat.icon)}</div>
          <div class="grow"><b style="font-size:15px">${App.esc(c.title)}</b>
            <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(c.provider)} · ${App.esc(c.category)} · ${App.icon('star')} <span class="num">${c.rating.toFixed(1)}</span> · <span class="num">${App.num(c.enrolled)}</span> enrolled</div></div>
          ${App.ui.pill(c.level, LEVEL_COLOR[c.level])}
        </div>
        <div class="statstrip mt-16">
          ${cell('Duration', c.duration)}${cell('Starts', c.start)}${cell('Mode', c.mode)}${cell('Wage impact', c.wage)}
        </div>
        <div class="banner banner--accent" style="margin-top:16px">${App.icon('shieldcheck')}<div>Completing this course adds a <b>verified skill</b> to your WiN portfolio — shown to employers only with your consent.</div></div>
        <p class="muted" style="font-size:12.5px;margin-top:14px">Joining details for <b>${App.esc(c.location)}</b> will be sent to your Aadhaar-linked mobile.</p>
      `, {
        title: enrolled ? 'Course details' : 'Confirm enrollment', icon: 'graduation',
        foot: enrolled
          ? `<span class="verified" style="margin-right:auto">${App.icon('checkcircle')} You're enrolled</span><button class="btn btn--primary" onclick="App.modal.close()">Done</button>`
          : `<button class="btn" onclick="App.modal.close()">Cancel</button>
             <button class="btn btn--primary" onclick="WorkerCourses.confirmEnroll('${c.id}')">${App.icon('check')} Confirm enrollment</button>`
      });
    },
    confirmEnroll(id) {
      const c = byId(id);
      const btn = document.querySelector('.modal .btn--primary');
      if (btn) { btn.disabled = true; btn.innerHTML = App.icon('clock') + ' Enrolling…'; }
      setTimeout(() => {
        ENROLLED.add(id);
        App.modal.close();
        App.toast('Enrolled in ' + (c ? c.title : 'course') + ' — joining details sent by SMS');
        const done = ENROLLED.size;
        if (done === 3) setTimeout(() => App.toast('Verified Skill Badge unlocked — now live on your portfolio'), 900);
        App.reload();
      }, 650);
    },
    learnMore() {
      const rows = [
        ['idcard', 'Appears on your public portfolio', 'A tamper-proof credential anchored to your golden record.'],
        ['trend', 'Boosts employer trust & callbacks', 'Verified skills rank you higher in employer searches.'],
        ['landmark', 'Recognised by NSDC & Skill India', 'Aligned to the National Skills Qualification Framework.'],
      ];
      App.modal.open(`
        <div style="text-align:center">
          <div class="kpi__icon" style="width:56px;height:56px;margin:0 auto 14px;background:var(--amber-50);color:var(--amber-600)">${App.icon('award')}</div>
          <b style="font-size:16px">Verified Skill Badge</b>
          <p class="muted" style="font-size:13px;margin:6px auto 0;max-width:46ch">Complete any 3 WiN-listed courses to earn a Verified Skill Badge that travels with your worker identity across states.</p>
        </div>
        <div class="list--divided mt-16">
          ${rows.map(r => `<div class="minirow"><div class="kpi__icon" style="background:var(--accent-weak);color:var(--accent)">${App.icon(r[0])}</div><div class="grow"><b style="font-size:13.5px">${r[1]}</b><div class="muted" style="font-size:12px">${r[2]}</div></div></div>`).join('')}
        </div>
      `, { title: 'How the badge works', icon: 'award', foot: `<button class="btn btn--primary" onclick="App.modal.close()">Got it</button>` });
    },
  };

  // ---------- view ----------
  App.registerView('worker-courses', {
    title: 'Browse Courses',
    subtitle: 'NSDC · Skill India · verified skill badges',
    render(ctx) {
      const n = filtered().length;
      const done = ENROLLED.size;
      const pct = Math.min(100, Math.round(done / 3 * 100));
      const badgeDone = done >= 3;

      const catPills = CATEGORIES.map(cat =>
        `<button class="wc-cat ${S.category === cat ? 'is-on' : ''}" onclick="WorkerCourses.setCategory('${cat}')">${App.esc(cat)}</button>`
      ).join('');

      const levelOpts = LEVELS.map(([v, l]) =>
        `<option value="${v}" ${S.level === v ? 'selected' : ''}>${App.esc(l)}</option>`
      ).join('');

      const scell = (label, val, sub) => `<div class="statstrip__cell">
        <div class="statstrip__label">${label}</div>
        <div class="statstrip__val num">${val}</div>
        ${sub ? `<div class="muted" style="font-size:11px;margin-top:2px">${sub}</div>` : ''}
      </div>`;

      return `<div class="page fade-in">
        <style>
          .wc-selwrap{ position:relative; }
          .wc-selwrap .ico{ position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--faint); pointer-events:none; }
          .wc-selwrap .select{ padding-left:36px; min-width:172px; }
          .wc-cat{ padding:7px 14px; border-radius:var(--r-full); border:1px solid var(--line); background:var(--surface); color:var(--ink-2); font-size:12.5px; font-weight:600; cursor:pointer; transition:.12s; white-space:nowrap; }
          .wc-cat:hover{ border-color:var(--accent); color:var(--accent-strong); }
          .wc-cat.is-on{ background:var(--accent); border-color:var(--accent); color:var(--accent-fg); box-shadow:var(--sh-xs); }
          .wc-herometa{ margin-top:20px; max-width:560px; }
          .wc-grid{ display:grid; gap:16px; grid-template-columns:repeat(3,1fr); }
          @media (max-width:1000px){ .wc-grid{ grid-template-columns:repeat(2,1fr); } }
          @media (max-width:640px){ .wc-grid{ grid-template-columns:1fr; } }
          .wc-card{ overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition:transform .13s, box-shadow .13s, border-color .13s; }
          .wc-card:hover{ transform:translateY(-3px); box-shadow:var(--sh); border-color:var(--accent); }
          .wc-media{ position:relative; min-height:118px; display:flex; align-items:flex-end; padding:13px 15px; overflow:hidden; }
          .wc-media__wm{ position:absolute; top:-14px; right:-12px; color:#fff; opacity:.16; pointer-events:none; }
          .wc-media__wm svg{ width:112px; height:112px; }
          .wc-media__title{ position:relative; z-index:1; color:#fff; font-family:var(--font-display); font-weight:600; font-size:15.5px; line-height:1.25; letter-spacing:-.01em; text-shadow:0 1px 6px rgba(0,0,0,.4); }
          .wc-badge{ position:absolute; top:11px; left:11px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:var(--red-600); color:#fff; font-size:10.5px; font-weight:600; letter-spacing:.02em; padding:3px 8px 3px 6px; border-radius:var(--r-full); }
          .wc-badge svg{ width:12px; height:12px; }
          .wc-rating{ position:absolute; top:11px; right:11px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,.94); color:var(--ink); font-size:12px; font-weight:600; padding:3px 8px 3px 6px; border-radius:var(--r-full); box-shadow:var(--sh-xs); }
          .wc-rating svg{ width:13px; height:13px; color:var(--amber-600); fill:var(--amber-600); }
          .wc-body{ padding:14px 16px 16px; display:flex; flex-direction:column; flex:1; }
          .wc-provider{ font-size:12.5px; font-weight:500; color:var(--ink-2); }
          .wc-il{ display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted); }
          .wc-il svg{ width:15px; height:15px; }
          .wc-wage{ color:var(--green-700); font-weight:600; }
          .wc-foot{ margin-top:auto; padding-top:12px; margin-top:14px; border-top:1px solid var(--line-2); }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16">
              <div class="grow" style="min-width:280px">
                <div class="eyebrow">${App.icon('graduation')} Skill India · NSDC-recognised skilling</div>
                <h1 class="h-grad" style="margin-top:12px">Upskill to earn more.</h1>
                <p class="lead">Government-recognised courses matched to your trade and location — <b id="wcCount" class="num">${n}</b> available for your profile. Finish any three to earn a Verified Skill Badge on your worker identity.</p>
              </div>
              <div class="row gap-10" style="align-self:flex-start">
                <button class="btn" title="Back to Skill Advisor" onclick="App.navigate('worker-skills')">${App.icon('arrowleft')} Skill Advisor</button>
                <button class="btn btn--primary" onclick="App.navigate('worker-portfolio')">${App.icon('award')} My Portfolio</button>
              </div>
            </div>
            <div class="statstrip wc-herometa">
              ${scell('Courses', n)}
              ${scell('Providers', STAT_PROVIDERS)}
              ${scell('Top wage impact', '+' + STAT_TOP_WAGE + '%')}
              ${scell('Avg. rating', STAT_AVG_RATING, 'out of 5.0')}
            </div>
          </div>
        </div>

        <!-- search + level + category filters -->
        <div class="card card--pad reveal" style="margin-bottom:16px">
          <div class="row gap-12 wrap">
            <div class="input--icon grow" style="min-width:240px">
              ${App.icon('search')}
              <input class="input" placeholder="Search courses by name or provider..." value="${App.esc(S.search)}" oninput="WorkerCourses.search(this.value)">
            </div>
            <div class="wc-selwrap">
              ${App.icon('filter')}
              <select class="select" onchange="WorkerCourses.setLevel(this.value)">${levelOpts}</select>
            </div>
          </div>
          <div class="row gap-8 wrap mt-16">${catPills}</div>
        </div>

        <!-- recommendation -->
        <div class="banner banner--accent reveal" style="margin-bottom:18px;align-items:flex-start">
          ${App.icon('trend')}
          <div><b>Recommended for you</b> — Based on your masonry expertise and Delhi location, courses in <b>Structure Repair</b> and <b>Project Management</b> have the highest wage impact.</div>
        </div>

        <!-- course grid -->
        <div id="wcGrid" class="reveal">${gridHtml()}</div>

        <!-- verified skill badge CTA -->
        <div class="card card--pad reveal" style="margin-top:20px;border-color:var(--amber-100);background:linear-gradient(120deg,var(--amber-50),var(--surface) 55%)">
          <div class="row between wrap gap-16" style="align-items:center">
            <div class="row gap-12" style="align-items:flex-start">
              <div class="kpi__icon" style="width:46px;height:46px;flex-shrink:0;background:#fff;color:var(--amber-600);border:1px solid var(--amber-100)">${App.icon('award')}</div>
              <div>
                <b style="font-size:15px">${badgeDone ? 'Verified Skill Badge unlocked!' : 'Complete 3 courses to earn a Verified Skill Badge'}</b>
                <p class="muted" style="font-size:13px;margin-top:3px;max-width:52ch">Badges appear on your public portfolio and increase employer trust.</p>
                <div style="max-width:280px;margin-top:12px">
                  ${App.ui.bar(pct, 'var(--amber-600)')}
                  <div class="mono num" style="font-size:12px;color:var(--amber-700);margin-top:6px;font-weight:600">${done}/3 courses enrolled</div>
                </div>
              </div>
            </div>
            <button class="btn" style="background:#fff;color:var(--amber-700);border-color:var(--amber-100)" onclick="WorkerCourses.learnMore()">Learn More ${App.icon('arrow')}</button>
          </div>
        </div>

      </div>`;
    }
  });
})();
