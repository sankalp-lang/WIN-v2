/* Worker · Jobs — roles matched to the verified WiN profile (routed via NCS).
   v2 editorial: hero band, reveal motion, live search + location filters,
   match-scored job cards (click → detail modal, Apply → toast), market trends
   & quick stats, plus a Job Resources tab (WIN-powered CV builder + interview coach). */
(function () {
  // ---- extra inline icons (not in the base App.icon set) ----
  const svg = p => `<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICO = {
    target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'),
    rupee: svg('<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>'),
    mic: svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4"/><path d="M8 21h8"/>'),
    video: svg('<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>'),
  };

  // ---- demo data (from the Jobs screen spec) ----
  const LOCS = ['All', 'Delhi NCR', 'Gurugram', 'Noida', 'Faridabad', 'Mumbai'];
  const JOBS = [
    { id: 'j1', title: 'Senior Mason - Residential Project', company: 'L&T Construction', loc: 'Delhi NCR', pay: '₹45,000–55,000/mo', type: 'Full-time', posted: '2 days ago', applicants: 34, match: 92, skills: ['Masonry', 'Plastering', 'Blueprint Reading'], urgent: true, verified: true, blurb: 'Lead a residential build crew, set out brickwork to drawing, and mentor junior masons on a 14-tower project in Dwarka.' },
    { id: 'j2', title: 'Construction Supervisor', company: 'Shapoorji Pallonji', loc: 'Gurugram', pay: '₹60,000–80,000/mo', type: 'Full-time', posted: '5 days ago', applicants: 56, match: 85, skills: ['Supervision', 'Safety', 'Project Management'], urgent: false, verified: true, blurb: 'Own daily site progress, labour scheduling and safety compliance for a commercial tower in Cyber City.' },
    { id: 'j3', title: 'Renovation Specialist', company: 'Godrej Properties', loc: 'Noida', pay: '₹40,000–50,000/mo', type: 'Contract', posted: '1 day ago', applicants: 18, match: 88, skills: ['Renovation', 'Tiling', 'Waterproofing'], urgent: true, verified: true, blurb: 'Retrofit and finish premium apartments — tiling, waterproofing and surface repair to a fixed handover date.' },
    { id: 'j4', title: 'Masonry Instructor', company: 'NSDC Training Center', loc: 'Delhi', pay: '₹35,000–45,000/mo', type: 'Full-time', posted: '1 week ago', applicants: 12, match: 78, skills: ['Masonry', 'Teaching', 'Certification'], urgent: false, verified: false, blurb: 'Train NSQF Level-4 masonry batches, assess practicals and certify candidates under the Skill India programme.' },
    { id: 'j5', title: 'Site Foreman - Metro Project', company: 'DMRC Contractors', loc: 'Delhi NCR', pay: '₹50,000–65,000/mo', type: 'Full-time', posted: '3 days ago', applicants: 42, match: 80, skills: ['Supervision', 'Concrete', 'Safety'], urgent: false, verified: true, blurb: 'Supervise concrete pours and structural works on an elevated metro corridor, coordinating with the safety cell.' },
    { id: 'j6', title: 'Plumbing & Masonry - Commercial', company: 'Tata Projects', loc: 'Faridabad', pay: '₹38,000–48,000/mo', type: 'Contract', posted: '4 days ago', applicants: 27, match: 75, skills: ['Plumbing', 'Masonry', 'Pipefitting'], urgent: false, verified: true, blurb: 'Combined MEP-and-masonry fit-out role for a commercial warehouse — pipefitting, chasing and finishing.' },
  ];
  const TRENDS = [
    { role: 'Construction Supervisor', growth: '+22%', openings: '2,450', avg: '₹65k/mo' },
    { role: 'Senior Mason', growth: '+18%', openings: '1,820', avg: '₹48k/mo' },
    { role: 'Renovation Expert', growth: '+15%', openings: '1,340', avg: '₹42k/mo' },
    { role: 'Plumbing Specialist', growth: '+12%', openings: '980', avg: '₹38k/mo' },
  ];
  const CV = [
    { t: 'Personal Summary', s: 'AI-generated summary based on your WIN profile' },
    { t: 'Work Experience', s: 'Auto-populated from verified employment records' },
    { t: 'Skills & Certifications', s: 'Pulled from your verified credentials' },
    { t: 'Education', s: 'Verified academic records from DigiLocker' },
  ];
  const INTV = [
    { t: 'Tell Me About Yourself', dur: '5 min', diff: 'Easy', s: 'Practice your introduction using your work history' },
    { t: 'Safety Protocols', dur: '8 min', diff: 'Medium', s: 'Common safety questions for construction roles' },
    { t: 'Project Experience', dur: '10 min', diff: 'Medium', s: 'Discuss your biggest projects and challenges' },
    { t: 'Salary Negotiation', dur: '7 min', diff: 'Hard', s: 'Practice negotiating compensation confidently' },
  ];

  // ---- local state ----
  let tab = 'find';         // 'find' | 'resources'
  let q = '';               // search query
  let loc = 'All';          // active location filter
  const applied = [];       // ids the worker has applied to this session

  const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const diffColor = d => (d === 'Easy' ? 'green' : d === 'Medium' ? 'blue' : 'red');

  function filtered() {
    const needle = q.trim().toLowerCase();
    return JOBS.filter(j =>
      (loc === 'All' || j.loc === loc) &&
      (!needle || j.title.toLowerCase().includes(needle) || j.company.toLowerCase().includes(needle))
    );
  }

  function jobCard(j) {
    const done = applied.includes(j.id);
    return `
      <div class="card card--pad card--hover wj-job" onclick="WorkerJobs.open('${j.id}')">
        <div class="row between gap-12" style="align-items:flex-start">
          <div class="grow">
            <div class="row gap-8 wrap" style="align-items:center">
              <b style="font-size:15.5px">${App.esc(j.title)}</b>
              ${j.urgent ? App.ui.pill('Urgent', 'red', true) : ''}
            </div>
            <div class="row gap-8 wrap" style="align-items:center;margin-top:6px;color:var(--muted);font-size:13px">
              ${App.icon('building')}<span>${App.esc(j.company)}</span>
              ${j.verified ? App.ui.verified('Verified') : ''}
            </div>
          </div>
          <span class="wj-match">${ICO.target} <span class="num">${j.match}%</span> match</span>
        </div>

        <div class="wj-meta row gap-16 wrap mt-12">
          <span class="row gap-6">${App.icon('mappin')} ${App.esc(j.loc)}</span>
          <span class="row gap-6">${ICO.rupee} <span class="num">${App.esc(j.pay)}</span></span>
          <span class="row gap-6">${App.icon('clock')} ${App.esc(j.posted)}</span>
          ${App.ui.pill(j.type, j.type === 'Full-time' ? 'blue' : 'amber')}
        </div>

        <div class="row gap-6 wrap mt-12">
          ${j.skills.map(s => `<span class="chip">${App.esc(s)}</span>`).join('')}
        </div>

        <div class="row between wrap gap-12 wj-foot">
          <span class="row gap-6 muted" style="font-size:12.5px">${App.icon('users')} <span class="num">${j.applicants}</span> applicants</span>
          ${done
            ? `<button class="btn btn--soft btn--sm" onclick="event.stopPropagation();WorkerJobs.appliedToast()">${App.icon('check')} Applied</button>`
            : `<button class="btn btn--primary btn--sm" onclick="event.stopPropagation();WorkerJobs.apply('${j.id}')">Apply ${App.icon('chevron')}</button>`}
        </div>
      </div>`;
  }

  // header + list for the results column (re-rendered on live search)
  function resultsHtml() {
    const rows = filtered();
    const count = `<span class="muted" style="font-size:12.5px">Showing <span class="num">${rows.length}</span> of <span class="num">${JOBS.length}</span></span>`;
    const head = `<div class="row between" style="align-items:center;margin-bottom:12px"><div class="section-title" style="margin:0">Matching roles</div>${count}</div>`;
    if (!rows.length) {
      return head + `<div class="card">${App.ui.empty('briefcase', 'No jobs found', 'Try adjusting your search or location filter')}</div>`;
    }
    return head + `<div class="wj-list">${rows.map(jobCard).join('')}</div>`;
  }

  function statCell(val, label, green) {
    return `<div class="wj-stat">
      <div class="wj-stat__val num"${green ? ' style="color:var(--green-700)"' : ''}>${val}</div>
      <div class="muted" style="font-size:12px;margin-top:2px">${label}</div>
    </div>`;
  }

  // ---- controller ----
  window.WorkerJobs = {
    setTab(t) { tab = t; App.reload(); },
    setLoc(l) { loc = l; App.reload(); },
    filter(v) { q = v; const el = document.getElementById('wjResults'); if (el) el.innerHTML = resultsHtml(); },

    open(id) {
      const j = JOBS.find(x => x.id === id);
      if (!j) return;
      const done = applied.includes(j.id);
      App.modal.open(`
        <div class="wj-modal">
          <div class="row between gap-16 wrap" style="align-items:flex-start">
            <div class="grow" style="min-width:220px">
              <div class="row gap-8 wrap" style="align-items:center">
                <b style="font-size:17px">${App.esc(j.title)}</b>
                ${j.urgent ? App.ui.pill('Urgent', 'red', true) : ''}
              </div>
              <div class="row gap-8 wrap" style="align-items:center;margin-top:7px;color:var(--muted);font-size:13.5px">
                ${App.icon('building')}<span>${App.esc(j.company)}</span>
                ${j.verified ? App.ui.verified('Verified employer') : App.ui.pill('Unverified', 'gray')}
              </div>
            </div>
            <div style="flex-shrink:0">${App.ui.ring(j.match, 'Match', '%')}</div>
          </div>

          <p class="muted" style="font-size:13.5px;line-height:1.6;margin:16px 0 0">${App.esc(j.blurb)}</p>

          <div class="statstrip mt-16">
            <div class="statstrip__cell"><div class="statstrip__label">Location</div><div class="statstrip__val" style="font-size:15px">${App.esc(j.loc)}</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Salary</div><div class="statstrip__val num" style="font-size:15px">${App.esc(j.pay)}</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Type</div><div class="statstrip__val" style="font-size:15px">${App.esc(j.type)}</div></div>
            <div class="statstrip__cell"><div class="statstrip__label">Applicants</div><div class="statstrip__val num" style="font-size:15px">${j.applicants}</div></div>
          </div>

          <div class="section-title" style="margin-top:18px">Skills matched from your WiN profile</div>
          <div class="row gap-6 wrap">${j.skills.map(s => `<span class="chip">${App.icon('check')} ${App.esc(s)}</span>`).join('')}</div>

          <div class="banner banner--green mt-16" style="align-items:center">${App.icon('shieldcheck')}
            <div style="font-size:12.5px">Posted <b>${App.esc(j.posted)}</b> and routed via the National Career Service (NCS). Your verified credentials are shared only on Apply, with your consent.</div>
          </div>
        </div>
      `, {
        title: 'Job details', icon: 'briefcase', wide: true,
        foot: `<button class="btn" onclick="App.modal.close()">Close</button>
               ${done
                 ? `<button class="btn btn--soft" onclick="WorkerJobs.appliedToast()">${App.icon('check')} Applied</button>`
                 : `<button class="btn btn--primary" onclick="WorkerJobs.apply('${j.id}',true)">Apply via NCS ${App.icon('arrow')}</button>`}`
      });
    },

    apply(id, fromModal) {
      if (applied.includes(id)) { if (fromModal) App.modal.close(); return; }
      applied.push(id);
      const j = JOBS.find(x => x.id === id);
      if (fromModal) App.modal.close();
      App.toast('Application sent to ' + (j ? j.company : 'employer') + ' via NCS', 'checkcircle');
      App.reload();
    },
    appliedToast() { App.toast('Application already submitted — track it on the NCS portal'); },

    practice(i) {
      const t = INTV[i] || INTV[0];
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start;margin-bottom:14px">
          <div class="kpi__icon" style="width:40px;height:40px;background:var(--amber-600);color:#fff;flex-shrink:0">${ICO.mic}</div>
          <div><b style="font-size:15px">${App.esc(t.t)}</b>
            <div class="muted" style="font-size:12.5px;margin-top:2px">${App.esc(t.dur)} · ${App.esc(t.diff)} · Construction &amp; masonry</div></div>
        </div>
        <p class="muted" style="font-size:13px;line-height:1.6;margin:0">${App.esc(t.s)}. Diya asks one question at a time and gives instant feedback on clarity and confidence — grounded in your verified WiN work history.</p>
      `, {
        title: 'Mock interview', icon: 'sparkles',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="WorkerJobs.begin('${jsq(t.t)}')">${ICO.video} Begin session</button>`
      });
    },
    begin(name) { App.modal.close(); App.toast('Starting mock interview: ' + name, 'sparkles'); },
    schedule() { App.toast('Interview-prep slot requested — Diya will confirm a time'); },
    ask() { App.assistant.toggle(true); App.assistant.ask('Which jobs best match my verified WiN skills?'); },
  };

  App.registerView('worker-jobs', {
    title: 'Jobs',
    subtitle: 'Find opportunities and prepare for interviews via NCS',
    render(ctx) {
      const style = `<style>
        .wj-cols{ display:grid; grid-template-columns:1.85fr 1fr; gap:20px; align-items:start }
        .wj-list{ display:flex; flex-direction:column; gap:14px }
        .wj-job{ cursor:pointer }
        .wj-match{ display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:var(--r-full);
                   background:var(--green-50); color:var(--green-700); font-size:12.5px; font-weight:700; white-space:nowrap; flex-shrink:0 }
        .wj-meta{ color:var(--muted); font-size:12.5px }
        .wj-meta .ico{ color:var(--faint) }
        .wj-foot{ align-items:center; margin-top:16px; padding-top:14px; border-top:1px solid var(--line-2) }
        .wj-loc{ padding:6px 13px; border-radius:var(--r-full); background:var(--surface-2); border:1px solid var(--line);
                 font-size:12.5px; font-weight:600; color:var(--muted); cursor:pointer; transition:.13s }
        .wj-loc:hover{ border-color:var(--accent); color:var(--ink) }
        .wj-loc.is-active{ background:var(--accent); border-color:var(--accent); color:#fff }
        .wj-stat{ background:var(--surface-2); border:1px solid var(--line); border-radius:var(--r); padding:14px }
        .wj-stat__val{ font-size:24px; font-weight:700; line-height:1; color:var(--ink) }
        .wj-amber{ background:var(--amber-600); color:#fff; border-color:transparent }
        .wj-amber:hover{ filter:brightness(.96); background:var(--amber-600) }
        .wj-intv{ padding:13px 0 }
        .wj-intv.clickable{ cursor:pointer; border-radius:var(--r-sm); margin:0 -10px; padding:13px 10px; transition:background .13s }
        .wj-intv.clickable:hover{ background:var(--surface-2) }
        .wj-modal .statstrip__label{ font-family:var(--font-mono); font-size:10px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--muted) }
        @media (max-width:900px){ .wj-cols{ grid-template-columns:1fr } }
      </style>`;

      const seg = `
        <div class="reveal" style="margin-bottom:20px">
          <div class="seg" role="tablist">
            <button class="${tab === 'find' ? 'is-active' : ''}" onclick="WorkerJobs.setTab('find')">${App.icon('search')} Find Jobs</button>
            <button class="${tab === 'resources' ? 'is-active' : ''}" onclick="WorkerJobs.setTab('resources')">${App.icon('graduation')} Job Resources</button>
          </div>
        </div>`;

      const body = tab === 'find' ? findTab() : resourcesTab();

      return `<div class="page fade-in">
        ${style}

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="eyebrow">${App.icon('briefcase')} Jobs · routed via NCS</div>
            <div class="row between wrap gap-16" style="margin-top:12px">
              <div>
                <h1 class="h-grad">Roles matched to your verified skills.</h1>
                <p class="lead">Openings ranked against your WiN profile — apply in one tap, then prep with Diya.</p>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="App.navigate('worker-cv')">${App.icon('doc')} My CV</button>
                <button class="btn btn--primary" onclick="WorkerJobs.ask()">${App.icon('sparkles')} Ask Diya</button>
              </div>
            </div>
          </div>
        </div>

        ${seg}
        ${body}
      </div>`;

      // ---------- FIND JOBS ----------
      function findTab() {
        const matchBanner = `
          <div class="card reveal" style="border-color:var(--green-100);background:var(--green-50);margin-bottom:18px">
            <div class="card__body">
              <div class="row between wrap gap-16" style="align-items:center">
                <div class="row gap-12" style="align-items:flex-start">
                  <div class="kpi__icon" style="width:42px;height:42px;background:var(--green-600);color:#fff;flex-shrink:0">${ICO.target}</div>
                  <div>
                    <b style="font-size:15px;color:var(--green-700)">Profile Match Score</b>
                    <p style="margin-top:5px;font-size:13px;line-height:1.55;color:var(--green-700);opacity:.92;max-width:64ch">
                      Your WiN profile matches <b class="num">92%</b> of Senior Mason roles. Complete your Structure Repair certification to increase your match to <b class="num">96%</b>.</p>
                  </div>
                </div>
                <div style="text-align:center;flex-shrink:0;min-width:96px">
                  <div class="row gap-6" style="justify-content:center;color:var(--green-700)">
                    ${ICO.target}<span class="num" style="font-size:30px;font-weight:700;line-height:1">92%</span>
                  </div>
                  <div style="font-size:11px;color:var(--green-700);opacity:.8;margin-top:3px">profile match</div>
                </div>
              </div>
            </div>
          </div>`;

        const searchCard = `
          <div class="card card--pad reveal" style="margin-bottom:20px">
            <div class="input--icon">${App.icon('search')}
              <input class="input" id="wjSearch" placeholder="Search jobs by title, company..." value="${App.esc(q)}" oninput="WorkerJobs.filter(this.value)">
            </div>
            <div class="row gap-8 wrap" style="align-items:center;margin-top:13px">
              <span class="row gap-6 muted" style="font-size:12px;font-weight:600">${App.icon('mappin')} Location</span>
              ${LOCS.map(l => `<button class="wj-loc ${l === loc ? 'is-active' : ''}" onclick="WorkerJobs.setLoc('${jsq(l)}')">${App.esc(l)}</button>`).join('')}
            </div>
          </div>`;

        const trends = `
          <div class="card">
            <div class="card__head">${App.icon('trend')}<h3 class="grow">Job Market Trends</h3></div>
            <div class="card__body" style="padding-top:6px;padding-bottom:6px">
              <div class="list--divided">
                ${TRENDS.map(t => `
                  <div style="padding:12px 0">
                    <div class="row between gap-8" style="align-items:center">
                      <b style="font-size:13.5px">${App.esc(t.role)}</b>
                      ${App.ui.pill(t.growth, 'green')}
                    </div>
                    <div class="muted" style="font-size:12px;margin-top:3px"><span class="num">${App.esc(t.openings)}</span> openings · <span class="num">${App.esc(t.avg)}</span> avg</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>`;

        const quickStats = `
          <div class="card mt-16">
            <div class="card__head">${App.icon('chart')}<h3 class="grow">Quick Stats</h3></div>
            <div class="card__body">
              <div class="grid grid-2" style="gap:12px">
                ${statCell(String(JOBS.length), 'Matching Jobs')}
                ${statCell(String(2 + applied.length), 'Applied')}
                ${statCell('1', 'Interview')}
                ${statCell('85%', 'Avg Match', true)}
              </div>
            </div>
          </div>`;

        return `
          ${matchBanner}
          ${searchCard}
          <div class="wj-cols reveal">
            <div id="wjResults">${resultsHtml()}</div>
            <div>${trends}${quickStats}</div>
          </div>`;
      }

      // ---------- JOB RESOURCES ----------
      function resourcesTab() {
        const cv = `
          <div class="card reveal">
            <div class="card__head">
              <div class="kpi__icon" style="background:#2f5fd01a;color:#2f5fd0">${App.icon('doc')}</div>
              <div class="grow"><h3>CV Builder</h3><div class="muted" style="font-size:12.5px;margin-top:1px">Auto-generated from your WiN profile</div></div>
            </div>
            <div class="card__body">
              <div class="banner banner--info" style="margin-bottom:16px">${App.icon('sparkles')}
                <div>Your CV is automatically built from your verified WiN credentials, work history, and certifications. All information is pulled directly from your digital identity.</div>
              </div>
              <div class="list--divided">
                ${CV.map(c => `
                  <div class="row between gap-12" style="align-items:center;padding:12px 0">
                    <div><b style="font-size:13.5px">${App.esc(c.t)}</b><div class="muted" style="font-size:12px;margin-top:2px">${App.esc(c.s)}</div></div>
                    ${App.ui.pill('Ready', 'green', true)}
                  </div>`).join('')}
              </div>
              <div class="row gap-10 wrap mt-16">
                <button class="btn btn--primary" onclick="App.navigate('worker-cv')">${App.icon('doc')} Build Your CV</button>
                <button class="btn" onclick="App.navigate('worker-cv')">${App.icon('external')} Preview</button>
              </div>
            </div>
          </div>`;

        const coach = `
          <div class="card reveal">
            <div class="card__head">
              <div class="kpi__icon" style="background:var(--amber-50);color:var(--amber-600)">${ICO.mic}</div>
              <div class="grow"><h3>Interview Coach</h3><div class="muted" style="font-size:12.5px;margin-top:1px">Practice with AI-powered mock interviews</div></div>
            </div>
            <div class="card__body">
              <div class="banner banner--amber" style="margin-bottom:16px">${ICO.mic}
                <div>Practice common interview questions tailored to construction and masonry roles. Get instant feedback on your responses and confidence level.</div>
              </div>
              <div class="list--divided">
                ${INTV.map((t, i) => `
                  <div class="wj-intv clickable" onclick="WorkerJobs.practice(${i})">
                    <div class="row between gap-12 wrap" style="align-items:center">
                      <div class="grow" style="min-width:180px">
                        <div class="row gap-8 wrap" style="align-items:center">
                          <b style="font-size:13.5px">${App.esc(t.t)}</b>
                          ${App.ui.pill(t.diff, diffColor(t.diff))}
                          <span class="row gap-4 muted" style="font-size:11.5px">${App.icon('clock')} <span class="num">${App.esc(t.dur)}</span></span>
                        </div>
                        <div class="muted" style="font-size:12px;margin-top:3px">${App.esc(t.s)}</div>
                      </div>
                      ${App.icon('chevron', 'faint')}
                    </div>
                  </div>`).join('')}
              </div>
              <div class="row gap-10 wrap mt-16">
                <button class="btn wj-amber" onclick="WorkerJobs.practice(0)">${ICO.video} Start Practice</button>
                <button class="btn" onclick="WorkerJobs.schedule()">${App.icon('calendar')} Schedule</button>
              </div>
            </div>
          </div>`;

        return `<div class="grid grid-2" style="gap:20px;align-items:start">${cv}${coach}</div>`;
      }
    }
  });
})();
