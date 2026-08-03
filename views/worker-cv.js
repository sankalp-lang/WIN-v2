/* Worker · CV Builder — a professional CV auto-filled from the verified WiN
   golden record: editorial hero, editable personal info, summary, collapsible
   work history, skills and education, with a live sticky preview and PDF export.
   v2 editorial standard (hero + reveal + working flows). */
(function () {
  const esc = App.esc;

  // ---- verification provenance shown on each work entry ----
  const VMETA = {
    'hrms-govt':    { label: 'Internal HRMS-verified',    kind: 'green', ic: 'landmark' },
    'hrms-nongovt': { label: 'HRMS/EPFO-verified',    kind: 'green', ic: 'building' },
    'agency-hrms':  { label: 'Agency HRMS-verified',  kind: 'green', ic: 'building' },
    platform:       { label: 'Platform-verified',     kind: 'green', ic: 'briefcase' },
    'pan-gst':      { label: 'GST-verified', kind: 'green', ic: 'file' },
    dav:            { label: 'Address-verified',      kind: 'green', ic: 'mappin' },
    self:           { label: 'Self-declared',          kind: 'gray',  ic: 'user' },
  };
  const RELATION_LABEL = { direct: 'Direct, Full-Time Employee', agency: 'Contract Worker', gig: 'Gig Worker', self: 'Self-Employed Worker', informal: 'Farmer / Other Worker' };

  // "Mar 2023 - Present" / "2007 - 2010" -> "2 yr 4 mo"
  function duration(period) {
    const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const parse = (s) => {
      s = (s || '').trim();
      if (/present/i.test(s)) return new Date();
      const m = s.match(/([A-Za-z]{3,})\s+(\d{4})/);
      if (m) return new Date(Number(m[2]), MON[m[1].slice(0, 3).toLowerCase()] || 0, 1);
      const y = s.match(/(\d{4})/);
      return y ? new Date(Number(y[1]), 0, 1) : null;
    };
    const parts = (period || '').split(/[–-]/);
    const from = parse(parts[0] || ''), to = parse(parts[1] || parts[0] || '');
    if (!from || !to) return '';
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    months = Math.max(months, 1);
    const yr = Math.floor(months / 12), mo = months % 12;
    return [yr ? `${yr} yr` : '', mo ? `${mo} mo` : ''].filter(Boolean).join(' ') || '< 1 mo';
  }
  function segLabel(en) {
    return `${en.sector === 'govt' ? 'Government' : 'Non-Government'}, ${RELATION_LABEL[en.relation] || ''}`;
  }

  // ---- editable working copy (hydrated from the verified record on first render) ----
  const state = {
    _initFor: null,
    personal: {
      name: '', age: 34,
      title: 'Masonry Expert - Construction Supervisor',
      location: 'Delhi NCR, India', years: 14,
      email: 'rajan.mason@email.com', phone: '+91 98765 43210', winId: '',
    },
    summary: '',
    entries: [
      { role: 'Construction Supervisor', company: 'NBCC (India) Ltd. — Govt. Housing Project', period: 'Mar 2023 - Present', location: 'Delhi', status: 'active',
        sector: 'govt', relation: 'direct', verification: 'hrms-govt', open: true,
        description: 'Lead site supervision for a 22-storey residential tower — coordinate 40+ masons, enforce quality and safety standards, and track daily progress against the project schedule.' },
      { role: 'Mason Foreman', company: 'Hiranandani Group', period: 'Jun 2018 - Feb 2023', location: 'Thane', status: 'completed',
        sector: 'nongovt', relation: 'direct', verification: 'hrms-nongovt', open: false,
        description: 'Managed masonry crews across three commercial sites in Thane; trained junior masons and cut rework by keeping finishes within tolerance.' },
      { role: 'Site Loader/Helper (Gig)', company: 'Porter Logistics Platform', period: 'Feb 2018 - May 2018', location: 'Mumbai', status: 'completed',
        sector: 'nongovt', relation: 'gig', verification: 'platform', open: false,
        description: 'Short-term platform-based loading and moving assignments during an off-season gap between construction contracts.' },
      { role: 'Independent Masonry Contractor', company: 'Self-Employed — Rajan Masonry Works', period: 'Jan 2016 - Jan 2018', location: 'Gurugram', status: 'completed',
        sector: 'nongovt', relation: 'self', verification: 'pan-gst', pan: 'ABCPK4321F', open: false,
        description: 'Ran a small masonry and labour-supply contracting business, taking on subcontracted work for residential builders.' },
      { role: 'Senior Mason', company: 'JMD Builders (via Sharma Manpower Agency)', period: 'Jan 2013 - Dec 2015', location: 'Gurugram', status: 'completed',
        sector: 'nongovt', relation: 'agency', verification: 'agency-hrms', open: false,
        description: 'Executed brickwork, block-work and plastering for mid-rise housing; recognised for clean joints and consistent load-bearing walls.' },
      { role: 'Mason', company: 'L&T Construction (via local contractor)', period: 'Feb 2011 - Dec 2012', location: 'Noida', status: 'completed',
        sector: 'nongovt', relation: 'agency', verification: 'dav', open: false,
        description: 'Entry-level mason on highway and warehouse projects — laid foundations, mixed and finished concrete, and read basic site drawings.' },
      { role: 'Farm Labourer', company: 'Family farmland', period: '2007 - 2010', location: 'Lucknow, Uttar Pradesh', status: 'completed',
        sector: 'nongovt', relation: 'informal', verification: 'dav', open: false,
        description: 'Worked on family farmland — sowing, harvesting and general agricultural labour before migrating to urban construction work.' },
    ],
    skills: ['Masonry', 'Scaffolding', 'Plastering', 'Tile Work', 'Concrete Finishing', 'Blueprint Reading'],
    education: { level: 'Class 12th (Senior Secondary)', board: 'UP Board', year: '2008', school: 'Govt. Inter College, Lucknow', percentage: '68.4' },
    saved: false,
    previewOpen: true,
  };
  // pristine copy of the demo persona's seed data, taken before any render can mutate
  // state — needed so switching back to the demo persona (after a fresh-worker session
  // blanked things out) restores the original Rajan data rather than staying empty.
  const DEMO_SNAPSHOT = JSON.parse(JSON.stringify({
    personal: state.personal, entries: state.entries, skills: state.skills, education: state.education,
  }));

  // ---- pure helpers (shared by render + controller) ----
  function buildSummary() {
    const p = state.personal, sk = state.skills;
    const first3 = sk.slice(0, 3).join(', ');
    const more = Math.max(0, sk.length - 3);
    return `Experienced ${(p.title || '').toLowerCase()} with ${p.years} years of hands-on experience in the construction industry. `
      + `Proficient in ${first3} and ${more} more specialized skills. `
      + `Known for delivering quality work on time and leading teams effectively across residential and commercial projects.`;
  }
  function expPreviewHtml() {
    const shown = state.entries.slice(0, 3).map(en => `
      <div class="cvb-pv-exp">
        <span class="cvb-pv-dot" style="background:${en.status === 'active' ? 'var(--green-600)' : '#94a3b8'}"></span>
        <div style="min-width:0"><b style="font-size:12.5px">${esc(en.role || 'Role')}</b><div class="cvb-pv-sub">${esc(en.company || 'Company')} | ${esc(en.period || '')}</div></div>
      </div>`).join('');
    const more = state.entries.length > 3 ? `<div class="cvb-pv-more">+<span class="num">${state.entries.length - 3}</span> more</div>` : '';
    return shown + more;
  }
  function skillsPreviewHtml() {
    const shown = state.skills.slice(0, 6).map(s => `<span class="cvb-pv-chip">${esc(s)}</span>`).join('');
    const more = state.skills.length > 6 ? `<span class="cvb-pv-chip cvb-pv-chip--more num">+${state.skills.length - 6}</span>` : '';
    return shown + more;
  }
  function eduPreviewInner() {
    const ed = state.education;
    return `<b style="font-size:12.5px">${esc(ed.level)}</b><div class="cvb-pv-sub">${esc(ed.board)} | <span class="num">${esc(ed.year)}</span> | <span class="num">${esc(ed.percentage)}%</span></div>`;
  }

  // ---- resume PDF: a real, laid-out single/multi-page PDF built the same way
  // App.downloadPDF hand-rolls its report PDFs (raw objects/xref, no library),
  // but with positioned text runs (bold headers, wrapped body copy) instead of
  // a monospace table, so it reads like an actual resume.
  function wrapText(text, maxChars) {
    const words = String(text || '').split(/\s+/), lines = []; let line = '';
    words.forEach(w => {
      if ((line + ' ' + w).trim().length > maxChars) { if (line) lines.push(line); line = w; }
      else line = (line ? line + ' ' : '') + w;
    });
    if (line) lines.push(line);
    return lines;
  }
  function buildResumePdf() {
    const p = state.personal;
    const M = 50, W = 612, H = 792, maxY = H - M;
    const pages = []; let page = []; let y = H - M;
    const need = (h) => { if (y - h < M) { pages.push(page); page = []; y = maxY; } };
    const put = (text, size, font, dy, color) => { need(size + 4); page.push({ t: text, x: M, y, s: size, f: font, c: color }); y -= dy; };
    const rule = (dy) => { page.push({ rule: true, x: M, y, x2: W - M }); y -= dy; };

    put(p.name || 'Rajan Kumar', 20, 'F2', 22);
    put(p.title || '', 12, 'F1', 16);
    put([p.location, p.email, p.phone, p.winId ? 'WIN ID ' + p.winId : ''].filter(Boolean).join('   |   '), 9, 'F1', 18);
    rule(14);

    put('PROFESSIONAL SUMMARY', 11, 'F2', 15, '#2f5fd0');
    wrapText(buildSummary(), 100).forEach(l => put(l, 9.5, 'F1', 13));
    y -= 6;

    put('WORK EXPERIENCE', 11, 'F2', 15, '#2f5fd0');
    state.entries.forEach(en => {
      need(40);
      put(`${en.role || 'Role'} — ${en.company || 'Company'}`, 10.5, 'F2', 13);
      put(`${en.period || ''}   |   ${en.location || ''}   |   ${segLabel(en)}`, 8.5, 'F1', 13, '#667085');
      const desc = en.description || 'Description entered by the worker while building this CV.';
      wrapText(desc, 105).forEach(l => put(l, 9.5, 'F1', 12.5));
      y -= 5;
    });
    y -= 4;

    put('SKILLS', 11, 'F2', 15, '#2f5fd0');
    wrapText(state.skills.join('   •   '), 100).forEach(l => put(l, 9.5, 'F1', 13));
    y -= 6;

    put('EDUCATION', 11, 'F2', 15, '#2f5fd0');
    const ed = state.education;
    put(`${ed.level}`, 10, 'F2', 13);
    put(`${ed.board}   |   ${ed.year}   |   ${ed.percentage}%   |   ${ed.school || ''}`, 9, 'F1', 13, '#667085');

    pages.push(page);

    // ---- raw PDF assembly (same object/xref approach as App.downloadPDF) ----
    const escPdf = s => String(s)
      .replace(/[—–]/g, '-').replace(/[•·]/g, '-')
      .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const hex = c => (c || '#111827').replace('#', '').match(/.{2}/g).map(h => (parseInt(h, 16) / 255).toFixed(3)).join(' ');
    const pageObjStart = 3, font1Num = pageObjStart + pages.length, font2Num = font1Num + 1, contentStart = font2Num + 1;
    const kids = pages.map((_, i) => (pageObjStart + i) + ' 0 R').join(' ');
    const objects = [];
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`);
    pages.forEach((_, i) => {
      objects.push(`${pageObjStart + i} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${font1Num} 0 R /F2 ${font2Num} 0 R >> >> /MediaBox [0 0 ${W} ${H}] /Contents ${contentStart + i} 0 R >>\nendobj\n`);
    });
    objects.push(`${font1Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    objects.push(`${font2Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
    pages.forEach(pageItems => {
      let stream = '';
      pageItems.forEach(it => {
        if (it.rule) { stream += `${hex('#e2e8f0')} RG 0.75 w ${it.x} ${it.y} m ${it.x2} ${it.y} l S\n`; return; }
        stream += `${hex(it.c)} rg BT /${it.f} ${it.s} Tf ${it.x} ${it.y} Td (${escPdf(it.t)}) Tj ET\n`;
      });
      objects.push(`${contentStart + pages.indexOf(pageItems)} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
    });
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach(o => { offsets.push(pdf.length); pdf += o; });
    const xrefStart = pdf.length, total = objects.length + 1;
    let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    pdf += xref + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return pdf;
  }

  // ---- controller: text edits patch the preview live (no reload → keeps focus);
  //      structural changes (add/remove/toggle/save) go through App.reload() ----
  window.WorkerCV = {
    setPersonal(k, v) {
      state.personal[k] = v;
      if (k === 'name')     { const el = document.getElementById('cvp-name');  if (el) el.textContent = v.trim() || 'Your Name'; }
      if (k === 'title')    { const el = document.getElementById('cvp-title'); if (el) el.textContent = v.trim() || '—'; }
      if (k === 'location') { const el = document.getElementById('cvp-loc');   if (el) el.textContent = v.trim(); }
    },
    setSummary(v) { state.summary = v; const el = document.getElementById('cvp-summary'); if (el) el.textContent = v; },
    regenSummary() { state.summary = buildSummary(); App.reload(); App.toast('Summary regenerated from your verified record'); },
    setEntry(i, k, v) {
      state.entries[i][k] = v;
      if ((k === 'role' || k === 'company' || k === 'period') && i < 3) {
        const el = document.getElementById('cvp-exp'); if (el) el.innerHTML = expPreviewHtml();
      }
    },
    toggleEntry(i) { state.entries[i].open = !state.entries[i].open; App.reload(); },
    addEntry() {
      state.entries.push({ role: '', company: '', period: '', location: '', description: '', status: 'completed', verification: 'self', sector: 'nongovt', relation: 'direct', open: true });
      App.reload(); App.toast('New work entry added');
    },
    removeEntry(i) { if (state.entries.length <= 1) return; state.entries.splice(i, 1); App.reload(); App.toast('Work entry removed'); },
    skillInput(v) { const b = document.getElementById('cvb-add-skill-btn'); if (b) b.disabled = !v.trim(); },
    skillKey(e) { if (e.key === 'Enter') { e.preventDefault(); WorkerCV.addSkill(); } },
    addSkill() {
      const el = document.getElementById('cvb-skill-input'); const v = el ? el.value.trim() : '';
      if (!v) return;
      if (state.skills.some(s => s.toLowerCase() === v.toLowerCase())) { App.toast('“' + v + '” is already in your skills'); return; }
      state.skills.push(v); App.reload(); App.toast('Skill added');
    },
    removeSkill(i) { state.skills.splice(i, 1); App.reload(); },
    setEdu(k, v) { state.education[k] = v; const el = document.getElementById('cvp-edu'); if (el) el.innerHTML = eduPreviewInner(); },
    togglePreview() { state.previewOpen = !state.previewOpen; App.reload(); },
    save() {
      state.saved = true; App.reload(); App.toast('CV saved to your WiN profile');
      setTimeout(() => { state.saved = false; if (App.state.route === 'worker-cv') App.reload(); }, 2000);
    },
    exportCv() {
      App.downloadFile((state.personal.name || 'Resume').replace(/\s+/g, '_') + '_Resume.pdf', buildResumePdf(), 'application/pdf');
      App.toast('CV downloaded as PDF', 'download');
    },
    exportProfile() {
      App.downloadFile((state.personal.name || 'Profile').replace(/\s+/g, '_') + '_Profile.pdf', buildResumePdf(), 'application/pdf');
      App.toast('Profile downloaded as PDF', 'download');
    },
  };

  App.registerView('worker-cv', {
    title: 'CV Builder',
    subtitle: 'Build and export your professional CV',
    render(ctx) {
      const u = ctx.user;
      // keyed on winId (or 'demo') rather than a one-shot boolean, so switching between
      // a fresh worker and the demo persona within the same browser session — without a
      // full page reload — re-initializes instead of leaking one identity's state into the other.
      const initKey = (u && u.winId) || 'demo';
      if (state._initFor !== initKey) {
        state._initFor = initKey;
        if (u && u._fresh) {
          // a freshly signed-up worker starts with a blank CV — nothing here should
          // be auto-filled with the Rajan demo persona's details.
          state.personal = { name: '', age: '', title: '', location: '', years: '', email: '', phone: u.phone || '', winId: u.winId || '' };
          state.entries = [];
          state.skills = [];
          state.education = { level: '', board: '', year: '', school: '', percentage: '' };
          state.summary = '';
        } else {
          state.personal = JSON.parse(JSON.stringify(DEMO_SNAPSHOT.personal));
          state.entries = JSON.parse(JSON.stringify(DEMO_SNAPSHOT.entries));
          state.skills = JSON.parse(JSON.stringify(DEMO_SNAPSHOT.skills));
          state.education = JSON.parse(JSON.stringify(DEMO_SNAPSHOT.education));
          state.personal.name = u.name || 'Rajan Kumar';
          state.personal.winId = u.winId || 'WIN-2024-8834-1029';
          state.summary = buildSummary();
        }
      }
      const p = state.personal;

      // reusable personal-info text field (num → Inter tabular; mono → code)
      const tf = (label, key, opts) => {
        opts = opts || {};
        const cls = 'input' + (opts.mono ? ' mono' : '') + (opts.num ? ' num' : '');
        return `<div class="field" style="margin-bottom:0">
          <label class="label">${label}</label>
          <input class="${cls}" ${opts.type ? `type="${opts.type}"` : ''} value="${esc(p[key])}" oninput="WorkerCV.setPersonal('${key}',this.value)">
        </div>`;
      };

      const entriesHtml = state.entries.map((en, i) => {
        const vm = VMETA[en.verification] || VMETA.self;
        return `<div class="cvb-entry">
          <div class="cvb-entry__head" onclick="WorkerCV.toggleEntry(${i})">
            <span class="cvb-dot" style="background:${en.status === 'active' ? 'var(--green-600)' : '#94a3b8'}"></span>
            <div class="grow" style="min-width:0">
              <div class="row gap-8 wrap">
                <b style="font-size:14px">${esc(en.role || 'New role')}</b>
                ${en.status === 'active' ? App.ui.pill('CURRENT', 'green', true) : ''}
              </div>
              <div class="muted" style="font-size:12px;margin-top:2px">${esc(en.company || 'Company')} | ${esc(en.period || 'Period')}</div>
              <div class="faint" style="font-size:11.5px;margin-top:1px">${esc(en.location || '—')} · ${esc(duration(en.period))} · ${esc(segLabel(en))}</div>
            </div>
            <span class="cvb-vpill">${App.ui.pill(vm.label, vm.kind, true)}</span>
            ${state.entries.length > 1 ? `<button class="iconbtn" style="width:30px;height:30px" title="Remove entry" onclick="event.stopPropagation();WorkerCV.removeEntry(${i})">${App.icon('trash')}</button>` : ''}
            <span class="cvb-chev" style="transform:rotate(${en.open ? 90 : 0}deg);color:var(--muted)">${App.icon('chevron')}</span>
          </div>
          ${en.open ? `<div class="cvb-entry__body">
            <div class="grid grid-2">
              <div class="field" style="margin:12px 0 0"><label class="label">Role / Title</label><input class="input" value="${esc(en.role)}" oninput="WorkerCV.setEntry(${i},'role',this.value)"></div>
              <div class="field" style="margin:12px 0 0"><label class="label">Company</label><input class="input" value="${esc(en.company)}" oninput="WorkerCV.setEntry(${i},'company',this.value)"></div>
              <div class="field" style="margin:12px 0 0"><label class="label">Period</label><input class="input" value="${esc(en.period)}" oninput="WorkerCV.setEntry(${i},'period',this.value)"></div>
              <div class="field" style="margin:12px 0 0"><label class="label">Location</label><input class="input" value="${esc(en.location)}" oninput="WorkerCV.setEntry(${i},'location',this.value)"></div>
            </div>
            <div class="field" style="margin:12px 0 0"><label class="label">Description</label><textarea class="textarea" rows="3" oninput="WorkerCV.setEntry(${i},'description',this.value)">${esc(en.description)}</textarea></div>
          </div>` : ''}
        </div>`;
      }).join('');

      const skillsHtml = state.skills.map((s, i) =>
        `<span class="cvb-skill">${esc(s)}<button title="Remove skill" onclick="WorkerCV.removeSkill(${i})">${App.icon('x')}</button></span>`).join('');

      return `<div class="page page--wide fade-in">
        <style>
          .cvb-grid{ display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:20px; align-items:start; }
          .cvb-side{ position:sticky; top:20px; }
          @media(max-width:1000px){ .cvb-grid{ grid-template-columns:1fr; } .cvb-side{ position:static; } }
          .cvb-entry{ border:1px solid var(--line); border-radius:var(--r); background:var(--surface); overflow:hidden; }
          .cvb-entry + .cvb-entry{ margin-top:10px; }
          .cvb-entry__head{ display:flex; align-items:center; gap:12px; padding:12px 14px; cursor:pointer; transition:.12s; }
          .cvb-entry__head:hover{ background:var(--surface-2); }
          .cvb-entry__body{ padding:2px 14px 16px; }
          .cvb-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; }
          .cvb-chev{ display:inline-flex; transition:.15s; }
          .cvb-vpill .ico{ display:none; }
          .cvb-skill{ display:inline-flex; align-items:center; gap:5px; padding:6px 7px 6px 12px; border-radius:var(--r-full); background:var(--accent-weak); color:var(--accent-strong); font-size:12.5px; font-weight:600; }
          .cvb-skill button{ display:grid; place-items:center; width:18px; height:18px; border-radius:50%; color:var(--accent-strong); opacity:.65; transition:.12s; }
          .cvb-skill button:hover{ opacity:1; background:rgba(0,0,0,.07); }
          .cvb-skill button .ico{ width:13px; height:13px; }
          .cvb-pv{ border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; box-shadow:var(--sh-sm); background:var(--surface); }
          .cvb-pv__head{ display:flex; align-items:center; gap:8px; padding:12px 15px; background:var(--accent); color:#fff; font-weight:600; font-size:14px; }
          .cvb-pv__head .ico{ color:#fff; }
          .cvb-pv__head .iconbtn{ color:#fff; width:28px; height:28px; }
          .cvb-pv__head .iconbtn:hover{ background:rgba(255,255,255,.18); color:#fff; }
          .cvb-pv__body{ padding:20px 18px 22px; }
          .cvb-pv-sec{ font-size:10.5px; font-weight:700; letter-spacing:.08em; color:var(--muted); text-transform:uppercase; margin:18px 0 9px; }
          .cvb-pv-exp{ display:flex; gap:9px; align-items:flex-start; margin-bottom:9px; }
          .cvb-pv-dot{ width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
          .cvb-pv-sub{ font-size:11.5px; color:var(--muted); margin-top:1px; }
          .cvb-pv-more{ font-size:11.5px; color:var(--accent-strong); font-weight:600; margin-left:17px; }
          .cvb-pv-chip{ display:inline-block; padding:4px 9px; border-radius:var(--r-full); background:var(--accent-weak); color:var(--accent-strong); font-size:11px; font-weight:600; margin:0 5px 5px 0; }
          .cvb-pv-chip--more{ background:var(--surface-2); color:var(--muted); }
          .cvb-clamp3{ display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; font-size:12.5px; color:var(--ink-2); line-height:1.5; }
          .cvb-hero-actions{ align-items:flex-start; }
        </style>

        <!-- editorial hero -->
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-20">
              <div style="min-width:290px;flex:1">
                <div class="eyebrow">${App.icon('doc')} Professional CV</div>
                <h1 class="h-grad" style="margin-top:12px">Your CV, built from verified facts.</h1>
                <p class="lead">Every line auto-filled from your WiN golden record — employment, skills and education verified at source. Edit anything, then export a clean A4 PDF for job applications.</p>
                <div class="row gap-8 wrap mt-16">
                  <span class="src-chip mono">${App.icon('idcard')} ${esc(p.winId)}</span>
                  ${App.ui.verified('100% Verified')}
                  <span class="pill pill--gray">${esc(u.role || 'Construction Worker')} · ${esc(u.location || 'Delhi NCR')}</span>
                  <span class="pill pill--gray"><span class="num">${esc(String(p.years))}</span>&nbsp;yrs experience</span>
                </div>
              </div>
              <div class="row gap-10 wrap cvb-hero-actions">
                <button class="btn" onclick="WorkerCV.exportProfile()">${App.icon('download')} Download Profile</button>
                <button class="btn btn--accent" onclick="WorkerCV.exportCv()">${App.icon('file')} Export CV</button>
              </div>
            </div>
          </div>
        </div>

        <!-- provenance banner -->
        <div class="banner banner--green reveal" style="margin-bottom:20px;align-items:center">
          ${App.icon('shieldcheck')}
          <div class="grow"><b>Auto-filled from your verified record</b> — employment, skills and education are pulled from your WiN golden record. Edit anything before you export.</div>
        </div>

        <div class="cvb-grid">
          <!-- ============ LEFT: editor ============ -->
          <div>
            <!-- Personal information -->
            <div class="card reveal mb-16">
              <div class="card__head">${App.icon('user')}<h3 class="grow">Personal Information</h3></div>
              <div class="card__body">
                <div class="grid grid-2">
                  ${tf('Full Name', 'name')}
                  ${tf('Age', 'age', { type: 'number', num: true })}
                  ${tf('Title / Role', 'title')}
                  <div class="field" style="margin-bottom:0">
                    <label class="label">Location</label>
                    <div class="input--icon">${App.icon('mappin')}<input class="input" value="${esc(p.location)}" oninput="WorkerCV.setPersonal('location',this.value)"></div>
                  </div>
                  ${tf('Years of Experience', 'years', { type: 'number', num: true })}
                  ${tf('Email', 'email', { type: 'email' })}
                  ${tf('Phone', 'phone', { num: true })}
                  <div class="field" style="margin-bottom:0">
                    <label class="label">WiN ID</label>
                    <input class="input mono" value="${esc(p.winId)}" disabled>
                    <span class="hint">WiN ID is read-only and cannot be changed</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Professional summary -->
            <div class="card reveal mb-16">
              <div class="card__head">${App.icon('edit')}<h3 class="grow">Professional Summary</h3>
                <button class="btn btn--ghost btn--sm" onclick="WorkerCV.regenSummary()">${App.icon('sparkles')} Regenerate</button>
              </div>
              <div class="card__body">
                <textarea class="textarea" rows="4" oninput="WorkerCV.setSummary(this.value)">${esc(state.summary)}</textarea>
              </div>
            </div>

            <!-- Work experience -->
            <div class="card reveal mb-16">
              <div class="card__head">${App.icon('briefcase')}<h3 class="grow">Work Experience</h3>
                <button class="btn btn--soft btn--sm" onclick="WorkerCV.addEntry()">${App.icon('plus')} Add Entry</button>
              </div>
              <div class="card__body">${entriesHtml}</div>
            </div>

            <!-- Skills -->
            <div class="card reveal mb-16">
              <div class="card__head">${App.icon('award')}<h3 class="grow">Skills</h3></div>
              <div class="card__body">
                <div class="row wrap gap-8">${skillsHtml}</div>
                <div class="row gap-8 mt-16">
                  <input class="input grow" id="cvb-skill-input" placeholder="Add a new skill…" oninput="WorkerCV.skillInput(this.value)" onkeydown="WorkerCV.skillKey(event)">
                  <button class="btn btn--accent" id="cvb-add-skill-btn" onclick="WorkerCV.addSkill()" disabled>${App.icon('plus')} Add</button>
                </div>
              </div>
            </div>

            <!-- Education -->
            <div class="card reveal mb-16">
              <div class="card__head">${App.icon('graduation')}<h3 class="grow">Education</h3></div>
              <div class="card__body">
                <div class="grid grid-2">
                  <div class="field" style="margin-bottom:0"><label class="label">Level / Qualification</label><input class="input" value="${esc(state.education.level)}" oninput="WorkerCV.setEdu('level',this.value)"></div>
                  <div class="field" style="margin-bottom:0"><label class="label">Board / Institution</label><input class="input" value="${esc(state.education.board)}" oninput="WorkerCV.setEdu('board',this.value)"></div>
                  <div class="field" style="margin-bottom:0"><label class="label">Year</label><input class="input num" value="${esc(state.education.year)}" oninput="WorkerCV.setEdu('year',this.value)"></div>
                  <div class="field" style="margin-bottom:0"><label class="label">Percentage / Grade</label><input class="input num" value="${esc(state.education.percentage)}" oninput="WorkerCV.setEdu('percentage',this.value)"></div>
                  <div class="field" style="margin-bottom:0;grid-column:1/-1"><label class="label">School / College</label><input class="input" value="${esc(state.education.school)}" oninput="WorkerCV.setEdu('school',this.value)"></div>
                </div>
              </div>
            </div>

            <!-- Save -->
            <button class="btn ${state.saved ? 'btn--soft' : 'btn--accent'} btn--lg btn--block reveal" onclick="WorkerCV.save()">
              ${state.saved ? App.icon('checkcircle') + ' Saved Successfully' : App.icon('check') + ' Save All Changes'}
            </button>
          </div>

          <!-- ============ RIGHT: live preview ============ -->
          <div class="cvb-side">
            <div class="cvb-pv reveal">
              <div class="cvb-pv__head">${App.icon('eye')}<span class="grow">CV Preview</span>
                <button class="iconbtn" title="Collapse preview" onclick="WorkerCV.togglePreview()"><span class="cvb-chev" style="transform:rotate(${state.previewOpen ? 90 : 0}deg)">${App.icon('chevron')}</span></button>
              </div>
              ${state.previewOpen ? `<div class="cvb-pv__body">
                <div style="text-align:center">
                  ${App.ui.avatar(p.name || 'Your Name', 'xl')}
                  <div style="margin-top:12px;font-family:var(--font-display);font-weight:600;font-size:18px" id="cvp-name">${esc(p.name || 'Your Name')}</div>
                  <div style="color:var(--accent-strong);font-weight:600;font-size:13px;margin-top:3px" id="cvp-title">${esc(p.title || '—')}</div>
                  <div class="row center gap-4 muted" style="font-size:12px;margin-top:6px">${App.icon('mappin')}<span id="cvp-loc">${esc(p.location)}</span></div>
                  <div class="mono" style="font-size:11px;color:var(--muted);margin-top:5px">${esc(p.winId)}</div>
                  ${App.ui.verified('100% Verified')}
                </div>

                <div class="cvb-pv-sec">Summary</div>
                <div class="cvb-clamp3" id="cvp-summary">${esc(state.summary)}</div>

                <div class="cvb-pv-sec">Experience</div>
                <div id="cvp-exp">${expPreviewHtml()}</div>

                <div class="cvb-pv-sec">Skills</div>
                <div id="cvp-skills">${skillsPreviewHtml()}</div>

                <div class="cvb-pv-sec">Education</div>
                <div class="row gap-8" style="align-items:flex-start">${App.icon('graduation')}<div id="cvp-edu">${eduPreviewInner()}</div></div>

                <div class="row gap-8 mt-24">
                  <button class="btn btn--accent grow" onclick="WorkerCV.exportCv()">${App.icon('file')} Export CV</button>
                  <button class="btn grow" onclick="WorkerCV.exportProfile()">${App.icon('download')} Profile</button>
                </div>
              </div>` : ''}
            </div>
            <p class="muted" style="text-align:center;font-size:11.5px;margin-top:10px">Exports as an A4 PDF, ready for job applications.</p>
          </div>
        </div>
      </div>`;
    }
  });
})();
