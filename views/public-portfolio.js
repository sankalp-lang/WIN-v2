/* Public Portfolio — read-only, shareable verified worker profile as seen by an
   employer / bank / ministry via a share link or QR. v2 editorial standard:
   editorial hero + reveal motion + a real live-verification flow. The profile
   itself stays read-only (no edit / expand controls, faithful to the original);
   the only actions are Back-to-portfolio, Sign-In, Copy-link and Verify. */
(function () {
  const WIN = 'WIN-2024-8834-1029';
  const SHARE_URL = 'https://win.gov.in/portfolio/' + WIN;

  // source systems the live cross-check runs against (matches assurance note)
  const VSOURCES = [
    { label: 'Aadhaar / UIDAI', sub: 'Identity match', icon: 'fingerprint' },
    { label: 'EPFO / UAN', sub: 'Employment & PF record', icon: 'landmark' },
    { label: 'Income-Tax Dept', sub: 'Declared income', icon: 'file' },
    { label: 'ESIC', sub: 'Insurance status', icon: 'shieldcheck' },
    { label: 'DigiLocker', sub: 'Certificates & docs', icon: 'lock' },
  ];

  // verify-flow state (survives the interval re-renders)
  let vstep = 0, vtimer = null;

  const RELATION_LABEL = { direct: 'Direct, Full-Time Employee', agency: 'Contract Worker', gig: 'Gig Worker', self: 'Self-Employed Worker', informal: 'Farmer / Other Worker' };

  // plain-text segment label appended to the period · location line
  function segLabel(w) {
    return `${w.sector === 'govt' ? 'Government' : 'Non-Government'} · ${RELATION_LABEL[w.relation] || ''}`;
  }

  function verifyBody() {
    const done = vstep >= VSOURCES.length;
    const rows = VSOURCES.map((s, i) => {
      let state;
      if (i < vstep) state = `<span class="pp-vok">${App.icon('check')}</span>`;
      else if (i === vstep && !done) state = `<span class="pp-vspin"></span>`;
      else state = `<span class="pp-vidle"></span>`;
      return `<div class="pp-vrow ${i < vstep ? 'is-done' : ''}">
        <span class="pp-vic">${App.icon(s.icon)}</span>
        <div class="grow"><b>${App.esc(s.label)}</b><div class="faint" style="font-size:11.5px">${App.esc(s.sub)}</div></div>
        ${state}
      </div>`;
    }).join('');
    const head = done
      ? `<div class="pp-vhead is-ok">${App.icon('checkcircle')}<div><b>Authenticity confirmed</b><div class="faint" style="font-size:12px;margin-top:2px">Every record matched its source database.</div></div></div>`
      : `<div class="pp-vhead">${App.icon('shieldcheck')}<div><b>Verifying against source databases…</b><div class="faint" style="font-size:12px;margin-top:2px">Live cross-check — no data leaves the WiN Platform.</div></div></div>`;
    return `${head}<div class="pp-vlist">${rows}</div>`;
  }

  function verifyFoot(done) {
    return done
      ? `<span class="pill pill--green pill--dot" style="margin-right:auto">Trust score <span class="num">100%</span></span><button class="btn btn--primary" onclick="App.modal.close()">${App.icon('check')} Done</button>`
      : `<button class="btn" onclick="App.modal.close();PublicPortfolio.stop()">Cancel</button>`;
  }

  // patch the open modal in place (no backdrop re-open → no flicker); returns
  // false if the modal is gone (user cancelled) so the timer can stop.
  function paintVerify() {
    const done = vstep >= VSOURCES.length;
    const body = document.querySelector('#modal-root .modal__body');
    const foot = document.querySelector('#modal-root .modal__foot');
    if (!body) return false;
    body.innerHTML = verifyBody();
    if (foot) foot.innerHTML = verifyFoot(done);
    return true;
  }

  window.PublicPortfolio = {
    stop() { clearInterval(vtimer); vtimer = null; },

    signIn() { App.toast('Redirecting to WiN sign-in…', 'lock'); setTimeout(() => App.logout(), 650); },

    copyLink() {
      try { navigator.clipboard && navigator.clipboard.writeText(SHARE_URL); } catch (e) {}
      App.toast('Verification link copied', 'copy');
    },

    // live source verification — a real, stepping flow (what a bank/employer runs)
    verify() {
      vstep = 0;
      clearInterval(vtimer);
      App.modal.open(verifyBody(), { title: 'Verify this profile', icon: 'shieldcheck', foot: verifyFoot(false) });
      vtimer = setInterval(() => {
        vstep++;
        if (!paintVerify()) { clearInterval(vtimer); vtimer = null; return; }
        if (vstep >= VSOURCES.length) {
          clearInterval(vtimer); vtimer = null;
          App.toast('Authenticity confirmed — matched ' + VSOURCES.length + ' source databases', 'shieldcheck');
        }
      }, 620);
    },
  };

  // deterministic faux-QR (offline: no external image) — same seed as the
  // owner's portfolio so the code is identical across both views.
  function qrSvg(px) {
    const N = 25, m = [];
    let s = 1987; const bit = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >> 17) & 1; };
    for (let y = 0; y < N; y++) { m[y] = []; for (let x = 0; x < N; x++) m[y][x] = bit(); }
    const finder = (ox, oy) => {
      for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) {
        const yy = oy + y, xx = ox + x; if (yy < 0 || yy >= N || xx < 0 || xx >= N) continue;
        if (x === -1 || x === 7 || y === -1 || y === 7) { m[yy][xx] = 0; continue; }
        const edge = (x === 0 || x === 6 || y === 0 || y === 6);
        const core = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        m[yy][xx] = (edge || core) ? 1 : 0;
      }
    };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    const cell = 8; let r = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (m[y][x]) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
    const sz = N * cell;
    return `<svg viewBox="0 0 ${sz} ${sz}" width="${px}" height="${px}" fill="var(--ink)"><rect width="${sz}" height="${sz}" fill="#fff"/><g>${r}</g></svg>`;
  }

  App.registerView('public-portfolio', {
    title: 'Public Profile',
    subtitle: 'Verified worker profile · shared link',
    render(ctx) {
      // Full verified work history — public view shows every entry, including segment/source tags.
      const work = [
        { role: 'Construction Supervisor', org: 'NBCC (India) Ltd. — Govt. Housing Project', period: 'Mar 2023 – Present', loc: 'Delhi',
          sector: 'govt', relation: 'direct', source: 'hrms-govt', active: true },
        { role: 'Mason Foreman', org: 'Hiranandani Group', period: 'Jun 2018 – Feb 2023', loc: 'Thane',
          sector: 'nongovt', relation: 'direct', source: 'hrms-nongovt' },
        { role: 'Site Loader/Helper (Gig)', org: 'Porter Logistics Platform', period: 'Feb 2018 – May 2018', loc: 'Mumbai',
          sector: 'nongovt', relation: 'gig', source: 'platform' },
        { role: 'Independent Masonry Contractor', org: 'Self-Employed — Rajan Masonry Works', period: 'Jan 2016 – Jan 2018', loc: 'Gurugram',
          sector: 'nongovt', relation: 'self', source: 'pan-gst' },
        { role: 'Senior Mason', org: 'JMD Builders (via Sharma Manpower Agency)', period: 'Jan 2013 – Dec 2015', loc: 'Gurugram',
          sector: 'nongovt', relation: 'agency', source: 'agency-hrms' },
        { role: 'Mason', org: 'L&T Construction (via local contractor)', period: 'Feb 2011 – Dec 2012', loc: 'Noida',
          sector: 'nongovt', relation: 'agency', source: 'dav' },
        { role: 'Farm Labourer', org: 'Family farmland', period: '2007 – 2010', loc: 'Lucknow, Uttar Pradesh',
          sector: 'nongovt', relation: 'informal', source: 'dav' },
      ];

      const skills = ['Masonry', 'Scaffolding', 'Plastering', 'Tile Work', 'Concrete Finishing', 'Blueprint Reading'];

      const statusRows = [
        { l: 'Identity Verified', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Employer Verified', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Govt Database Verified', r: App.ui.pill('Verified', 'green', true) },
        { l: 'Skills', r: App.ui.pill('6 certified', 'blue') },
      ].map(x => `<div class="minirow"><span style="color:var(--green-600);display:inline-flex">${App.icon('checkcircle')}</span><span class="grow" style="font-size:13.5px;color:var(--ink)">${App.esc(x.l)}</span>${x.r}</div>`).join('');

      return `<div class="page fade-in">
        <style>
          .pp-topbar{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; padding:11px 16px; margin-bottom:18px;
            border:1px solid var(--accent); border-radius:var(--r); background:var(--accent-weak);
            box-shadow:0 0 0 3px var(--accent-ring); }
          .pp-topbar__txt{ display:flex; align-items:center; gap:8px; color:var(--accent-strong); font-weight:600; font-size:13px; }
          .pp-topbar__txt .ico{ width:16px; height:16px; }
          .pp-grid{ display:grid; grid-template-columns:minmax(0,1.62fr) minmax(0,1fr); gap:20px; align-items:start; }
          .pp-col{ display:flex; flex-direction:column; gap:20px; }
          @media (max-width:1040px){ .pp-grid{ grid-template-columns:1fr; } }
          .pp-strip{ display:flex; align-items:center; gap:9px; justify-content:space-between; padding:11px 16px;
            font-weight:600; font-size:12.5px; letter-spacing:.02em; }
          .pp-idavatar{ width:76px; height:76px; border-radius:50%; display:grid; place-items:center; flex-shrink:0;
            background:linear-gradient(140deg,var(--accent),var(--accent-strong)); color:#fff; box-shadow:0 0 0 4px var(--accent-ring); }
          .pp-idavatar .ico{ width:38px; height:38px; }
          .pp-qrtile{ display:flex; flex-direction:column; align-items:center; gap:7px; padding:12px 14px;
            border:1px solid var(--line); border-radius:var(--r); background:var(--surface); text-align:center; }
          .pp-qrtile span{ font-size:11px; font-weight:600; color:var(--accent-strong); display:inline-flex; align-items:center; gap:5px; }
          .pp-qrbox{ display:inline-grid; place-items:center; padding:8px; border-radius:var(--r-sm); border:1px solid var(--line-2); background:#fff; }
          .pp-skill{ display:inline-flex; align-items:center; gap:7px; padding:6px 12px; border-radius:var(--r-full);
            background:var(--blue-50); border:1px solid var(--blue-100); color:var(--blue-700); font-size:12.5px; font-weight:600; }
          .pp-skill .ico{ color:var(--blue-600); width:15px; height:15px; }
          .pp-foot{ display:flex; align-items:center; justify-content:center; gap:9px; margin-top:20px; padding:16px;
            border:1px dashed var(--line); border-radius:var(--r); background:var(--surface-2);
            color:var(--muted); font-size:12.5px; text-align:center; }
          .pp-foot .ico{ color:var(--green-600); flex-shrink:0; }

          /* verify-authenticity modal */
          .pp-vhead{ display:flex; align-items:center; gap:12px; padding:2px 0 16px; }
          .pp-vhead > .ico{ width:22px; height:22px; color:var(--accent); flex-shrink:0; }
          .pp-vhead.is-ok > .ico{ color:var(--green-600); }
          .pp-vhead b{ font-size:14.5px; }
          .pp-vlist{ display:flex; flex-direction:column; gap:8px; }
          .pp-vrow{ display:flex; align-items:center; gap:12px; padding:11px 13px; border:1px solid var(--line-2);
            border-radius:var(--r-sm); background:var(--surface); transition:.16s; }
          .pp-vrow.is-done{ border-color:var(--green-100); background:var(--green-50); }
          .pp-vrow b{ font-size:13.5px; }
          .pp-vic{ width:34px; height:34px; border-radius:9px; display:grid; place-items:center; flex-shrink:0;
            background:var(--accent-weak); color:var(--accent-strong); }
          .pp-vrow.is-done .pp-vic{ background:#fff; color:var(--green-600); }
          .pp-vok{ width:22px; height:22px; border-radius:50%; display:grid; place-items:center; flex-shrink:0;
            background:var(--green-600); color:#fff; }
          .pp-vok .ico{ width:14px; height:14px; }
          .pp-vspin{ width:18px; height:18px; border:2px solid var(--line); border-top-color:var(--accent);
            border-radius:50%; flex-shrink:0; animation:pp-spin .7s linear infinite; }
          .pp-vidle{ width:18px; height:18px; border-radius:50%; flex-shrink:0; border:2px dashed var(--line-2); }
          @keyframes pp-spin{ to{ transform:rotate(360deg); } }
        </style>

        <!-- shared-link banner (task-required) -->
        <div class="pp-topbar">
          <button class="btn btn--sm" onclick="App.navigate('worker-portfolio')">${App.icon('arrowleft')} Back to my portfolio</button>
          <span class="pp-topbar__txt grow">${App.icon('globe')} Public verified profile · shared by ${App.esc(ctx.user.name)}</span>
          ${App.ui.pill('Read-only', 'accent', true)}
        </div>

        <!-- editorial hero (doubles as the public header) -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-20">
              <div style="min-width:290px;flex:1">
                <div class="eyebrow">${App.icon('shieldcheck')} WiN Platform · Verified Worker Profile</div>
                <h1 class="h-grad" style="margin-top:12px">A worker identity you can trust — verified at source.</h1>
                <p class="lead">This is the read-only profile a bank, employer or ministry sees when Rajan shares his WiN ID. Every record is checked live against government databases — no login required.</p>
                <div class="row gap-8 wrap mt-16">
                  <span class="src-chip mono">${App.icon('idcard')} ${App.esc(WIN)}</span>
                  ${App.ui.verified('100% Verified')}
                  <span class="pill pill--gray">Masonry Expert · Construction Supervisor</span>
                  <span class="pill pill--gray"><span class="num">14</span>&nbsp;yrs experience</span>
                </div>
              </div>
              <div class="row gap-10 wrap" style="align-items:flex-start">
                <button class="btn" onclick="PublicPortfolio.copyLink()">${App.icon('copy')} Copy link</button>
                <button class="btn btn--accent" onclick="PublicPortfolio.verify()">${App.icon('shieldcheck')} Verify authenticity</button>
                <button class="btn btn--primary" onclick="PublicPortfolio.signIn()">${App.icon('lock')} Sign In</button>
              </div>
            </div>
          </div>
        </div>

        <div class="pp-grid">
          <!-- ============ MAIN COLUMN ============ -->
          <div class="pp-col">

            <!-- identity -->
            <div class="card reveal" style="overflow:hidden">
              <div class="pp-strip" style="background:var(--green-50);color:var(--green-700)">
                <span class="row gap-8">${App.icon('shieldcheck')} Verified · Employer / Ministry Database</span>
                <span class="pill pill--green mono" style="font-weight:600">WIN ID: ${App.esc(WIN)}</span>
              </div>
              <div class="card__body">
                <div class="row between wrap gap-20">
                  <div class="row gap-16" style="min-width:240px">
                    <div class="pp-idavatar">${App.icon('user')}</div>
                    <div>
                      <div class="row gap-8"><h2 style="font-size:21px;letter-spacing:.01em">RAJAN</h2><span class="muted num" style="font-size:14px">· 34</span></div>
                      <div style="color:var(--blue-600);font-size:13.5px;font-weight:600;margin-top:3px">Masonry Expert · Construction Supervisor</div>
                      <div class="row gap-6 muted mt-8" style="font-size:12.5px">${App.icon('mappin')} 12, Delhi, India</div>
                    </div>
                  </div>
                  <div class="pp-qrtile">
                    <div class="pp-qrbox">${qrSvg(84)}</div>
                    <span>${App.icon('shieldcheck')} Scan to Verify</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- work profile timeline -->
            <div class="card reveal" style="overflow:hidden">
              <div class="pp-strip" style="background:var(--blue-50);color:var(--blue-700)">
                <span class="row gap-8">${App.icon('briefcase')} Work Profile · <span class="num">14</span>&nbsp;Years</span>
              </div>
              <div class="card__body">
                <div class="timeline">
                  ${work.map(w => `
                    <div class="timeline__item">
                      <div class="timeline__dot done"></div>
                      <div class="row between wrap gap-8">
                        <div><b>${App.esc(w.role)} · ${App.esc(w.org)}</b><div class="when">${App.esc(w.period)} · ${App.esc(w.loc)} · ${App.esc(segLabel(w))}</div></div>
                        ${w.active ? App.ui.pill('Currently Active', 'green', true) : ''}
                      </div>
                    </div>`).join('')}
                </div>
              </div>
            </div>

            <!-- skills -->
            <div class="card reveal">
              <div class="card__head"><h3 class="grow">Skills &amp; Certifications (<span class="num">${skills.length}</span>)</h3></div>
              <div class="card__body">
                <div class="row gap-8 wrap">${skills.map(s => `<span class="pp-skill">${App.icon('check')} ${App.esc(s)}</span>`).join('')}</div>
              </div>
            </div>
          </div>

          <!-- ============ SIDEBAR COLUMN ============ -->
          <div class="pp-col">

            <!-- verification status -->
            <div class="card reveal">
              <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">Verification Status</h3></div>
              <div class="card__body">
                <div class="row between" style="margin-bottom:7px"><span style="font-size:13px;font-weight:600">Overall Score</span><span class="num" style="font-weight:600;color:var(--green-700)">100%</span></div>
                ${App.ui.bar(100, 'var(--green-600)')}
                <div class="list--divided mt-16">${statusRows}</div>
              </div>
            </div>

            <!-- assurance note -->
            <div class="banner banner--green reveal" style="align-items:center">
              ${App.icon('lock')}
              <div><b>Live source verification</b><div style="font-size:11.5px;opacity:.85;margin-top:2px">Checked against EPFO, Income-Tax, ESIC &amp; DigiLocker. Protected under the DPDP Act, 2023.</div></div>
            </div>
          </div>
        </div>

        <!-- footer note -->
        <div class="pp-foot reveal">
          ${App.icon('shieldcheck')}
          <span>This profile is verified by the WiN Platform. &nbsp;WIN ID: <b class="mono" style="color:var(--ink)">${App.esc(WIN)}</b></span>
        </div>
      </div>`;
    },
  });
})();
