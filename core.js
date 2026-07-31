/* ============================================================
   WiN · Workforce Identity Network — runtime core
   Router · shell · multi-persona login · modal/toast · assistant
   No build step. Views self-register via App.registerView(id, def).
   ============================================================ */
window.App = (function () {
  const App = {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  App.state = { persona: null, route: null, params: {}, user: null, navOpen: false, chat: [], assistantOpen: false };
  App.views = {};
  App.registerView = (id, def) => { App.views[id] = def; };

  /* ---------------- icons (lucide-style) ---------------- */
  const I = {
    home:'<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    shield:'<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
    shieldcheck:'<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/>',
    idcard:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2.2"/><path d="M5.5 16a3 3 0 0 1 5 0M14 9h5M14 12.5h5M14 16h3"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.8"/><path d="M16 3.1a4 4 0 0 1 0 7.7"/>',
    building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>',
    landmark:'<path d="M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M12 2 3 7v2h18V7z"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    filecheck:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9 15 2 2 4-4"/>',
    chart:'<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><rect x="17" y="13" width="3" height="4" rx="1"/>',
    pie:'<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/>',
    graduation:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>',
    sparkles:'<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 14l.6 1.6L21 16l-1.4.4L19 18l-.6-1.6L17 16l1.4-.4z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    message:'<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z"/>',
    alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    checkcircle:'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowleft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    chevrondown:'<path d="m6 9 6 6 6-6"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    leaf:'<path d="M11 20A7 7 0 0 1 4 13V6a1 1 0 0 1 1-1h1a10 10 0 0 1 10 10v1a4 4 0 0 1-4 4z"/><path d="M5 21c4-3 6-6 9-11"/>',
    send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z"/>',
    mappin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff:'<path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c6 0 10 8 10 8a13 13 0 0 1-2.3 3M6.6 6.6A13 13 0 0 0 2 12s4 8 10 8a9 9 0 0 0 4-.9"/><path d="m2 2 20 20"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    filter:'<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    plug:'<path d="M12 22v-5"/><path d="M9 8V2M15 8V2"/><path d="M18 8v3a6 6 0 0 1-12 0V8z"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    layers:'<path d="M12 2 2 7l10 5 10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z"/>',
    bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    dot:'<circle cx="12" cy="12" r="9"/>',
    fingerprint:'<path d="M12 10a2 2 0 0 0-2 2c0 1.5.5 3.5-1 5"/><path d="M12 6a6 6 0 0 1 6 6c0 2-.5 4-1 5"/><path d="M6 13c0-2 0-4 1.5-5.5"/><path d="M12 2a10 10 0 0 1 8 4"/><path d="M9 21c1-1 2-3 2-6a1 1 0 0 1 2 0c0 1"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="M8.2 13 7 22l5-3 5 3-1.2-9"/>'
  };
  App.icon = (name, cls) => `<svg class="ico ${cls || ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${I[name] || I.dot}</svg>`;

  /* ---------------- helpers ---------------- */
  const PALETTE = ['#4f5bd5','#0e9f6e','#0d9488','#6b4fc7','#c07d10','#2f5fd0','#d64545','#0891a7','#7a5a45','#5563a8'];
  App.esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  App.color = s => PALETTE[Math.abs(String(s).split('').reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) % PALETTE.length];
  App.initials = n => String(n || '?').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  App.num = n => (n == null ? '' : Number(n).toLocaleString('en-IN'));
  App.money = n => '₹' + App.num(n);
  App.currentUser = () => App.state.user;

  // real file download (used by Government console "Export"/"Download" flows so the
  // demo produces an actual file with realistic rows, not just a toast).
  App.downloadFile = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  App.downloadCSV = (filename, headers, rows) => {
    const cell = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = [headers.map(cell).join(',')].concat(rows.map(r => r.map(cell).join(','))).join('\n');
    App.downloadFile(filename, csv, 'text/csv;charset=utf-8;');
  };

  // Excel opens an HTML table saved with an .xls extension without complaint — no
  // xlsx library available in this no-build-step prototype, so this is the realistic
  // "real file" option for the Excel format choice.
  App.downloadXLS = (filename, headers, rows) => {
    const thead = '<tr>' + headers.map(h => `<th>${App.esc(h)}</th>`).join('') + '</tr>';
    const tbody = rows.map(r => '<tr>' + r.map(c => `<td>${App.esc(c)}</td>`).join('') + '</tr>').join('');
    const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">${thead}${tbody}</table></body></html>`;
    App.downloadFile(filename, html, 'application/vnd.ms-excel');
  };

  // hand-rolled, dependency-free single/multi-page PDF (Courier, one row per line) —
  // no PDF library available in this no-build-step prototype.
  App.downloadPDF = (filename, title, headers, rows) => {
    const escPdf = s => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const lines = [title, ''].concat([headers.join('   |   ')]).concat(rows.map(r => r.map(c => String(c == null ? '' : c)).join('   |   ')));
    const perPage = 54;
    const pages = [];
    for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
    if (!pages.length) pages.push([]);

    const pageObjStart = 3;
    const fontObjNum = pageObjStart + pages.length;
    const contentObjStart = fontObjNum + 1;
    const kids = pages.map((_, p) => (pageObjStart + p) + ' 0 R').join(' ');

    const objects = [];
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`);
    pages.forEach((_, p) => {
      const pageNum = pageObjStart + p, contentNum = contentObjStart + p;
      objects.push(`${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /MediaBox [0 0 612 792] /Contents ${contentNum} 0 R >>\nendobj\n`);
    });
    objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`);
    pages.forEach(pageLines => {
      let stream = `BT /F1 8 Tf 40 760 Td 10 TL\n`;
      pageLines.forEach(line => { stream += `(${escPdf(line)}) Tj T*\n`; });
      stream += `ET`;
      objects.push(`${contentObjStart + pages.indexOf(pageLines)} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
    });

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach(o => { offsets.push(pdf.length); pdf += o; });
    const xrefStart = pdf.length;
    const totalObjs = objects.length + 1;
    let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
    for (let i = 1; i < totalObjs; i++) xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    pdf += xref + `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    App.downloadFile(filename, pdf, 'application/pdf');
  };

  // dispatch to the right real-file download by the format label used across the
  // Government console's export/generate modals ("PDF summary", "Excel (.xlsx)", "CSV data extract")
  App.downloadReport = (baseName, title, headers, rows, fmtLabel) => {
    const fmt = String(fmtLabel || '').toUpperCase();
    if (fmt.indexOf('EXCEL') === 0 || fmt.indexOf('XLS') === 0) App.downloadXLS(baseName + '.xls', headers, rows);
    else if (fmt.indexOf('PDF') === 0) App.downloadPDF(baseName + '.pdf', title, headers, rows);
    else App.downloadCSV(baseName + '.csv', headers, rows);
  };

  App.ui = {
    avatar(nameOrObj, size) {
      const name = typeof nameOrObj === 'string' ? nameOrObj : (nameOrObj && nameOrObj.name) || '?';
      return `<span class="avatar ${size || ''}" style="background:${App.color(name)}">${App.initials(name)}</span>`;
    },
    pill(text, kind, dot) { return `<span class="pill pill--${kind || 'gray'} ${dot ? 'pill--dot' : ''}">${App.esc(text)}</span>`; },
    statusPill(s) {
      const m = {
        Verified: 'green', Active: 'green', Completed: 'green', Approved: 'green', Live: 'green', Resolved: 'green', Passed: 'green', Enrolled: 'green', Connected: 'green',
        Pending: 'amber', 'In Progress': 'amber', 'In Review': 'amber', Processing: 'amber', Open: 'amber', Draft: 'amber',
        Failed: 'red', Rejected: 'red', Expired: 'red', Flagged: 'red', Discrepancy: 'red',
        Inactive: 'gray', Closed: 'gray', 'Not Started': 'gray'
      };
      return App.ui.pill(s, m[s] || 'gray', true);
    },
    verified(label) { return `<span class="verified">${App.icon('checkcircle')} ${App.esc(label || 'Verified')}</span>`; },
    empty(icon, title, sub) { return `<div class="empty"><div class="empty__ic">${App.icon(icon || 'file')}</div><b>${App.esc(title)}</b><span>${App.esc(sub || '')}</span></div>`; },
    bar(pct, color) { return `<div class="bar"><div class="bar__fill" style="width:${Math.max(0, Math.min(100, pct))}%${color ? `;background:${color}` : ''}"></div></div>`; },
    meter(label, pct, color) { return `<div style="margin-bottom:12px"><div class="row between" style="margin-bottom:6px"><span style="font-size:13px">${App.esc(label)}</span><span class="mono" style="font-size:12.5px;color:var(--muted)">${pct}%</span></div>${App.ui.bar(pct, color)}</div>`; },
    ring(pct, label, sub) {
      return `<div class="ring" style="--p:${pct};--c:var(--accent)"><div class="ring__in"><div><div class="ring__val">${pct}${sub || ''}</div><div class="ring__lbl">${App.esc(label || '')}</div></div></div></div>`;
    },
    kpi(icon, color, label, val, sub) {
      return `<div class="kpi"><div class="kpi__top"><div class="kpi__label">${App.esc(label)}</div>
        <div class="kpi__icon" style="background:${color}1a;color:${color}">${App.icon(icon)}</div></div>
        <div class="kpi__val">${val}</div>${sub ? `<div class="kpi__sub muted">${sub}</div>` : ''}</div>`;
    }
  };

  /* ---------------- personas + navigation ---------------- */
  const PERSONAS = {
    worker: {
      key: 'worker', label: 'Worker', tag: 'Worker Portal', brand: 'WiN', sub: 'Worker Portal', home: 'worker-home',
      nav: [
        { section: 'Overview', items: [
          { id: 'worker-home', label: 'Home', icon: 'home' },
          { id: 'worker-portfolio', label: 'My Portfolio', icon: 'idcard' },
        ]},
        { section: 'Grow', items: [
          { id: 'worker-skills', label: 'Skill Advisor', icon: 'sparkles' },
          { id: 'worker-jobs', label: 'Jobs', icon: 'briefcase' },
          { id: 'worker-cv', label: 'CV Builder', icon: 'doc' },
          { id: 'worker-courses', label: 'Courses', icon: 'graduation' },
        ]},
        { section: 'Account', items: [
          { id: 'worker-grievance', label: 'Grievances', icon: 'message', tag: '2' },
          { id: 'worker-settings', label: 'Profile & Settings', icon: 'settings' },
          { id: 'worker-help', label: 'Help & Support', icon: 'help' },
        ]},
      ],
    },
    employer: {
      key: 'employer', label: 'Employer', tag: 'Employer Console', brand: 'WiN', sub: 'Employer Console', home: 'emp-dashboard',
      nav: [
        { section: 'Workspace', items: [
          { id: 'emp-dashboard', label: 'Dashboard', icon: 'home' },
          { id: 'emp-verifications', label: 'Employees', icon: 'shieldcheck' },
          { id: 'emp-hrms', label: 'HRMS Sync', icon: 'plug' },
        ]},
        { section: 'Build', items: [
          { id: 'emp-apidocs', label: 'API & Docs', icon: 'code' },
          { id: 'emp-settings', label: 'Settings', icon: 'settings' },
        ]},
      ],
    },
    gov: {
      key: 'gov', label: 'Government', tag: 'Government Registry', brand: 'WiN', sub: 'Registry Console', home: 'gov-dashboard',
      nav: [
        { section: 'Registry', items: [
          { id: 'gov-dashboard', label: 'Dashboard', icon: 'home' },
          { id: 'gov-demographics', label: 'Demographics', icon: 'pie' },
          { id: 'gov-enrollment', label: 'Enrollment', icon: 'users' },
        ]},
        { section: 'Operations', items: [
          { id: 'gov-grievances', label: 'Grievances', icon: 'message', tag: '24' },
          { id: 'gov-reports', label: 'Reports', icon: 'chart' },
          { id: 'gov-settings', label: 'Settings', icon: 'settings' },
        ]},
      ],
    },
  };
  // code icon isn't in the base set — alias
  I.code = '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>';
  App.persona = () => PERSONAS[App.state.persona];
  App.personas = PERSONAS;

  // the language chosen at login carries into the sidebar nav + a few topbar strings —
  // the rest of each page's own content is not translated in this pass.
  const NAV_I18N = {
    hi: {
      sections: { Overview: 'अवलोकन', Grow: 'विकास', Account: 'खाता', Workspace: 'कार्यक्षेत्र', Build: 'निर्माण', Registry: 'रजिस्ट्री', Operations: 'संचालन' },
      items: {
        'worker-home': 'होम', 'worker-portfolio': 'मेरा पोर्टफोलियो', 'worker-skills': 'स्किल सलाहकार', 'worker-jobs': 'नौकरियां',
        'worker-cv': 'सीवी बिल्डर', 'worker-courses': 'कोर्स', 'worker-grievance': 'शिकायतें', 'worker-settings': 'प्रोफ़ाइल और सेटिंग्स', 'worker-help': 'सहायता',
        'emp-dashboard': 'डैशबोर्ड', 'emp-verifications': 'कर्मचारी', 'emp-hrms': 'HRMS सिंक', 'emp-apidocs': 'API और दस्तावेज़', 'emp-settings': 'सेटिंग्स',
        'gov-demographics': 'जनसांख्यिकी', 'gov-enrollment': 'नामांकन', 'gov-grievances': 'शिकायतें', 'gov-reports': 'रिपोर्ट', 'gov-settings': 'सेटिंग्स',
      },
      searchPlaceholder: 'खोजें…', switchPersona: 'व्यक्तित्व बदलें',
    },
    mr: {
      sections: { Overview: 'आढावा', Grow: 'वाढ', Account: 'खाते', Workspace: 'कार्यक्षेत्र', Build: 'तयार करा', Registry: 'नोंदणी', Operations: 'कामकाज' },
      items: {
        'worker-home': 'मुख्यपृष्ठ', 'worker-portfolio': 'माझा पोर्टफोलिओ', 'worker-skills': 'कौशल्य सल्लागार', 'worker-jobs': 'नोकऱ्या',
        'worker-cv': 'सीव्ही बिल्डर', 'worker-courses': 'अभ्यासक्रम', 'worker-grievance': 'तक्रारी', 'worker-settings': 'प्रोफाइल आणि सेटिंग्ज', 'worker-help': 'मदत',
        'emp-dashboard': 'डॅशबोर्ड', 'emp-verifications': 'कर्मचारी', 'emp-hrms': 'HRMS सिंक', 'emp-apidocs': 'API आणि दस्तऐवज', 'emp-settings': 'सेटिंग्ज',
        'gov-demographics': 'लोकसंख्याशास्त्र', 'gov-enrollment': 'नोंदणी', 'gov-grievances': 'तक्रारी', 'gov-reports': 'अहवाल', 'gov-settings': 'सेटिंग्ज',
      },
      searchPlaceholder: 'शोधा…', switchPersona: 'व्यक्तिरेखा बदला',
    },
  };
  App.navT = () => NAV_I18N[App.state.lang] || null;

  /* ---------------- shell ---------------- */
  function navHtml() {
    const p = App.persona(); const route = App.state.route;
    const fresh = !!(App.state.user && App.state.user._fresh);
    const nt = App.navT();
    return p.nav.map(group => `
      <div class="nav__section">${nt ? (nt.sections[group.section] || group.section) : group.section}</div>
      ${group.items.map(it => `
        <div class="nav__item ${it.id === route ? 'is-active' : ''}" onclick="App.navigate('${it.id}')">
          ${App.icon(it.icon)}<span>${nt ? (nt.items[it.id] || it.label) : it.label}</span>${it.tag && !fresh ? `<span class="nav__tag">${it.tag}</span>` : ''}
        </div>`).join('')}
    `).join('');
  }

  function renderShell() {
    const p = App.persona(); const u = App.state.user;
    $('#app').innerHTML = `
      <div class="shell" data-persona="${p.key}" id="shell">
        <div class="nav-scrim" onclick="App.toggleNav()"></div>
        <aside class="sidebar">
          <div class="sidebar__brand">
            <div class="brandmark">${App.icon('shieldcheck')}</div>
            <div class="sidebar__brandtext"><b>${p.brand}</b><span>${p.sub}</span></div>
          </div>
          <div class="sidebar__persona">${App.icon(p.key === 'worker' ? 'user' : p.key === 'employer' ? 'building' : 'landmark')} ${p.tag}</div>
          <nav class="sidebar__nav" id="sidebarNav">${navHtml()}</nav>
          <div class="sidebar__foot">
            <div class="userchip" onclick="App.navigate('${p.key === 'worker' ? 'worker-settings' : p.key === 'employer' ? 'emp-settings' : 'gov-settings'}')">
              ${App.ui.avatar(u.name)}
              <div class="userchip__meta grow"><b>${App.esc(u.name)}</b><span>${App.esc(u.subtitle || '')}</span></div>
              ${App.icon('settings')}
            </div>
            <button class="btn btn--ghost btn--sm btn--block" style="margin-top:6px;justify-content:flex-start" onclick="App.logout()">${App.icon('logout')} ${(App.navT() || {}).switchPersona || 'Switch persona'}</button>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <button class="iconbtn menu-btn" onclick="App.toggleNav()" title="Menu">${App.icon('menu')}</button>
            <div><div class="topbar__title" id="tbTitle"></div><div class="topbar__sub" id="tbSub"></div></div>
            <div class="topbar__spacer"></div>
            <div class="searchbar" onclick="App.toast('Search is a demo affordance in this prototype')">${App.icon('search')}<span>${(App.navT() || {}).searchPlaceholder || 'Search…'}</span><span class="kbd">⌘K</span></div>
            <button class="iconbtn" onclick="App.notifications()" title="Notifications">${App.icon('bell')}<span class="dot"></span></button>
          </header>
          <div class="content" id="content"></div>
        </div>
      </div>
      <button class="assistant-fab" id="assistantFab" data-persona="${p.key}" onclick="App.assistant.toggle(true)" title="Ask WiN">${App.icon('sparkles')}</button>
    `;
  }
  App.renderNav = () => { const el = $('#sidebarNav'); if (el) el.innerHTML = navHtml(); };
  App.toggleNav = () => { const s = $('#shell'); if (s) s.classList.toggle('nav-open'); };

  /* ---------------- router ---------------- */
  App.navigate = (route, params) => {
    if (!App.state.persona) return;
    const view = App.views[route];
    App.state.route = route; App.state.params = params || {};
    try { location.hash = '#/' + App.state.persona + '/' + route; } catch (e) {}
    App.renderNav();
    const s = $('#shell'); if (s) s.classList.remove('nav-open');
    const content = $('#content');
    const title = (view && view.title) || route;
    const tb = $('#tbTitle'); if (tb) tb.textContent = title;
    const tbs = $('#tbSub'); if (tbs) tbs.textContent = (view && view.subtitle) || '';
    if (!content) return;
    if (!view) {
      content.innerHTML = `<div class="page">${App.ui.empty('layers', 'Screen coming up', 'This module isn\'t wired in this build yet.')}</div>`;
      return;
    }
    const ctx = { user: App.state.user, persona: App.state.persona, params: App.state.params };
    try { content.innerHTML = view.render(ctx); }
    catch (e) { content.innerHTML = `<div class="page"><div class="banner banner--red">${App.icon('alert')} <div><b>Render error in “${App.esc(title)}”</b><div style="margin-top:4px;font-size:12px">${App.esc(e.message)}</div></div></div></div>`; console.error(e); }
    content.scrollTop = 0;
    if (view.mounted) try { view.mounted(ctx); } catch (e) { console.error(e); }
  };
  App.reload = () => App.navigate(App.state.route, App.state.params);
  App.goto = App.navigate;

  /* ---------------- session ---------------- */
  App.startApp = (persona, user) => {
    App.state.persona = persona;
    App.state.user = user || (DB.profiles && DB.profiles[persona]) || { name: 'Demo User' };
    App.state.chat = [];
    // carry the landing-page language choice into the app shell (sidebar nav + topbar);
    // individual page content stays in English for now — see navHtml()/T() below.
    App.state.lang = L.lang;
    renderShell();
    App.navigate(App.persona().home);
  };
  App.logout = () => {
    App.state.persona = null; App.state.user = null; App.state.route = null;
    try { location.hash = ''; } catch (e) {}
    renderLogin();
  };

  /* ---------------- modal ---------------- */
  App.modal = {
    _onClose: null,
    open(html, opts) {
      opts = opts || {};
      // any close path (✕, backdrop click, or an explicit Cancel button that just calls
      // App.modal.close()) should still run cleanup — e.g. stopping a live camera stream —
      // so callers can register a one-shot onClose instead of relying on every button
      // remembering to call it.
      App.modal._onClose = opts.onClose || null;
      const root = $('#modal-root');
      root.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)App.modal.close()">
        <div class="modal ${opts.wide ? 'modal--lg' : ''}">
          ${opts.title ? `<div class="modal__head">${opts.icon ? App.icon(opts.icon) : ''}<h3 class="grow">${App.esc(opts.title)}</h3><button class="iconbtn" onclick="App.modal.close()">${App.icon('x')}</button></div>` : ''}
          <div class="modal__body">${html}</div>
          ${opts.foot ? `<div class="modal__foot">${opts.foot}</div>` : ''}
        </div></div>`;
    },
    close() {
      if (App.modal._onClose) { const fn = App.modal._onClose; App.modal._onClose = null; fn(); }
      $('#modal-root').innerHTML = '';
    }
  };

  /* ---------------- toast ---------------- */
  let toastT;
  App.toast = (msg, icon) => {
    const root = $('#toast-root');
    root.innerHTML = `<div class="toast">${App.icon(icon || 'checkcircle')} ${App.esc(msg)}</div>`;
    clearTimeout(toastT); toastT = setTimeout(() => { root.innerHTML = ''; }, 2600);
  };

  App.notifications = () => {
    const items = (DB.notifications || []).map(n => `<div class="minirow"><div class="kpi__icon" style="background:var(--accent-weak);color:var(--accent)">${App.icon(n.icon || 'bell')}</div><div class="grow"><b style="font-size:13.5px">${App.esc(n.title)}</b><div class="muted" style="font-size:12px">${App.esc(n.body)}</div></div><span class="faint" style="font-size:11px">${App.esc(n.when)}</span></div>`).join('');
    App.modal.open(items || App.ui.empty('bell', 'All caught up', 'No new notifications.'), { title: 'Notifications', icon: 'bell' });
  };

  /* ---------------- assistant (WiN copilot) ---------------- */
  App.assistant = {
    toggle(open) {
      App.state.assistantOpen = open;
      const fab = $('#assistantFab');
      if (!open) { const p = $('#assistantPanel'); if (p) p.remove(); if (fab) fab.style.display = ''; return; }
      if (fab) fab.style.display = 'none';
      if (!App.state.chat.length) App.state.chat = [{ role: 'bot', text: App._greeting() }];
      const panel = document.createElement('div');
      panel.id = 'assistantPanel';
      panel.setAttribute('data-persona', App.state.persona || '');
      document.body.appendChild(panel);
      App.assistant.render();
    },
    render() {
      const p = $('#assistantPanel'); if (!p) return;
      p.className = 'assistant';
      p.innerHTML = `
        <div class="assistant__head">${App.icon('sparkles')}<div class="grow"><b style="font-weight:600">${App.state.persona === 'worker' ? 'Diya · WiN Assistant' : 'WiN Assistant'}</b><div style="font-size:11.5px;opacity:.85">Grounded in your verified data</div></div>
          <button class="iconbtn" style="color:#fff" onclick="App.assistant.toggle(false)">${App.icon('x')}</button></div>
        <div class="assistant__body" id="assistantBody">${App.state.chat.map(m => `<div class="msg msg--${m.role === 'user' ? 'user' : 'bot'}">${m.text}</div>`).join('')}</div>
        <div class="assistant__foot">
          <div class="chat-inputwrap"><textarea id="assistantInput" rows="1" placeholder="Ask about your data…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();App.assistant.ask(this.value);this.value='';}"></textarea></div>
          <button class="chat-send" onclick="(function(){var el=document.getElementById('assistantInput');App.assistant.ask(el.value);el.value='';})()">${App.icon('send')}</button>
        </div>`;
      const b = $('#assistantBody'); if (b) b.scrollTop = b.scrollHeight;
    },
    ask(q) {
      q = (q || '').trim(); if (!q) return;
      App.state.chat.push({ role: 'user', text: App.esc(q) });
      App.state.chat.push({ role: 'bot', text: App._answer(q) });
      App.assistant.render();
    }
  };
  App._greeting = () => {
    const p = App.state.persona;
    if (p === 'worker') return `Hi ${App.esc((App.state.user.name || '').split(' ')[0])} — I can explain your WiN portfolio, verification status, or suggest jobs and skills.`;
    if (p === 'employer') return `Hello — ask me about verification turnaround, employee status, or how to call the WiN API.`;
    return `Namaste — ask about enrollment coverage, scheme eligibility, or grievance trends across districts.`;
  };
  App._answer = (q) => {
    const s = q.toLowerCase();
    if (/verif|status/.test(s)) return `Verifications run live against EPFO/UAN, the Income-Tax database, ESIC and DigiLocker. Most complete in under 30 seconds; this prototype shows sample results.`;
    if (/job|hire|work/.test(s)) return `Jobs are matched to your verified skills and employment history — open the <b>Jobs</b> screen to see roles ranked by fit.`;
    if (/skill|course|learn/.test(s)) return `The <b>Skill Advisor</b> reads your verified record and recommends courses that close the gap to higher-paying roles.`;
    if (/scheme|benefit|eligib/.test(s)) return `Eligibility is computed from the verified golden record — income, employment continuity and location — so entitlements follow the worker across state lines.`;
    if (/api|integrat|webhook/.test(s)) return `The WiN API returns verified employment & income from source. See <b>API & Docs</b> for endpoints and a sample response.`;
    return `This is a prototype assistant. In production, WiN answers only from the verified data you're permitted to see, and cites the source record.`;
  };

  /* ============================================================
     LOGIN  (multi-persona; worker = Aadhaar / DigiLocker + OTP)
     ============================================================ */
  const L = { mode: 'worker', method: 'choose', step: 'input', otp: '', phone: '', pin: '', lang: 'en' };
  // landing-page language switcher — translates the pitch/aside and mode tabs (the
  // "landing page" itself); the deeper sign-in/OTP/signup flows stay in English.
  const LANG_LABELS = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };
  const I18N = {
    en: {
      tagline: 'A verified identity for every worker in India.',
      pitch: 'One live, consent-driven golden record — employment, income and identity, verified at source and portable across every state line.',
      eyebrow: 'Workforce Identity Network',
      statWorkers: 'Workers in scope', statVerify: 'Live verification', statSources: 'Source systems',
      tabWorker: 'Worker', tabEmployer: 'Employer', tabGov: 'Government',
      terms: 'By continuing you agree to the WiN Terms &amp; Privacy Policy.',
      verifyTitle: 'Verify your identity', verifySub: 'Sign in the way the Government of India already knows you.',
      aadhaarLabel: 'Aadhaar (UIDAI)', aadhaarSub: 'Aadhaar-linked mobile + OTP',
      digilockerLabel: 'DigiLocker', digilockerSub: 'Mobile + security PIN + OTP',
      dataNotice: 'Your data is encrypted and never stored. Authentication is powered by Government of India services.',
      newHere: 'New here?', createAccount: 'Create an account',
      back: 'Back', mobileLabel: 'Mobile number', pinLabel: '6-digit security PIN', sendOtpBtn: 'Send OTP',
      aadhaarVerifyTitle: 'Aadhaar verification', aadhaarVerifySub: 'Enter your Aadhaar-linked mobile number',
      digilockerSigninTitle: 'DigiLocker sign-in', digilockerSigninSub: 'Enter your registered mobile & PIN',
      otpTitle: 'Enter OTP', otpSentTo: 'Sent to mobile ending', verifyContinue: 'Verify & continue',
      resendPrompt: "Didn't get it?", resendLink: 'Resend OTP',
      verifyingTitle: 'Verifying identity', verifyingSub: 'Authenticating with',
      govSigninTitle: 'Government sign-in', employerSigninTitle: 'Employer sign-in',
      govSigninSub: 'Access is restricted to authorised officials. All actions are logged and audited.',
      employerSigninSub: 'Sign in with your organisation credentials.',
      emailLabel: 'Email address', passwordLabel: 'Password', signInBtn: 'Sign in',
      demoCredsGov: 'Demo credentials are pre-filled. Any input signs you in.',
      demoBuildEmployer: 'This is a demo build - any credentials sign you in.',
      newHereEmployer: 'New here?', createEmployerAccount: 'Create an employer account',
    },
    hi: {
      tagline: 'भारत के हर श्रमिक के लिए एक सत्यापित पहचान।',
      pitch: 'एक लाइव, सहमति-आधारित स्वर्ण रिकॉर्ड — रोजगार, आय और पहचान, स्रोत पर सत्यापित और हर राज्य में पोर्टेबल।',
      eyebrow: 'कार्यबल पहचान नेटवर्क',
      statWorkers: 'कार्यक्षेत्र में श्रमिक', statVerify: 'लाइव सत्यापन', statSources: 'स्रोत प्रणालियाँ',
      tabWorker: 'श्रमिक', tabEmployer: 'नियोक्ता', tabGov: 'सरकार',
      terms: 'जारी रखकर आप WiN की शर्तों और गोपनीयता नीति से सहमत होते हैं।',
      verifyTitle: 'अपनी पहचान सत्यापित करें', verifySub: 'भारत सरकार आपको जिस तरह जानती है, उसी तरह साइन इन करें।',
      aadhaarLabel: 'आधार (UIDAI)', aadhaarSub: 'आधार-लिंक्ड मोबाइल + OTP',
      digilockerLabel: 'डिजिलॉकर', digilockerSub: 'मोबाइल + सुरक्षा पिन + OTP',
      dataNotice: 'आपका डेटा एन्क्रिप्टेड है और कभी संग्रहीत नहीं किया जाता। प्रमाणीकरण भारत सरकार की सेवाओं द्वारा संचालित है।',
      newHere: 'नए हैं?', createAccount: 'खाता बनाएं',
      back: 'वापस', mobileLabel: 'मोबाइल नंबर', pinLabel: '6-अंकीय सुरक्षा पिन', sendOtpBtn: 'OTP भेजें',
      aadhaarVerifyTitle: 'आधार सत्यापन', aadhaarVerifySub: 'अपना आधार-लिंक्ड मोबाइल नंबर दर्ज करें',
      digilockerSigninTitle: 'डिजिलॉकर साइन-इन', digilockerSigninSub: 'अपना पंजीकृत मोबाइल और पिन दर्ज करें',
      otpTitle: 'OTP दर्ज करें', otpSentTo: 'मोबाइल पर भेजा गया, अंत', verifyContinue: 'सत्यापित करें और जारी रखें',
      resendPrompt: 'नहीं मिला?', resendLink: 'OTP पुनः भेजें',
      verifyingTitle: 'पहचान सत्यापित हो रही है', verifyingSub: 'प्रमाणीकरण जारी है',
      govSigninTitle: 'सरकारी साइन-इन', employerSigninTitle: 'नियोक्ता साइन-इन',
      govSigninSub: 'पहुंच केवल अधिकृत अधिकारियों तक सीमित है। सभी कार्रवाइयां लॉग और ऑडिट की जाती हैं।',
      employerSigninSub: 'अपने संगठन की साख से साइन इन करें।',
      emailLabel: 'ईमेल पता', passwordLabel: 'पासवर्ड', signInBtn: 'साइन इन करें',
      demoCredsGov: 'डेमो साख पहले से भरी हुई है। कोई भी इनपुट आपको साइन इन कर देगा।',
      demoBuildEmployer: 'यह एक डेमो बिल्ड है - कोई भी साख आपको साइन इन कर देगी।',
      newHereEmployer: 'नए हैं?', createEmployerAccount: 'नियोक्ता खाता बनाएं',
    },
    mr: {
      tagline: 'भारतातील प्रत्येक कामगारासाठी एक सत्यापित ओळख.',
      pitch: 'एक थेट, संमती-आधारित सुवर्ण नोंद — रोजगार, उत्पन्न आणि ओळख, स्रोतावर सत्यापित आणि प्रत्येक राज्यात पोर्टेबल.',
      eyebrow: 'कार्यबल ओळख नेटवर्क',
      statWorkers: 'व्याप्तीतील कामगार', statVerify: 'थेट पडताळणी', statSources: 'स्रोत प्रणाली',
      tabWorker: 'कामगार', tabEmployer: 'नियोक्ता', tabGov: 'सरकार',
      terms: 'सुरू ठेवून तुम्ही WiN च्या अटी व गोपनीयता धोरणाशी सहमत आहात.',
      verifyTitle: 'तुमची ओळख सत्यापित करा', verifySub: 'भारत सरकारला तुम्ही आधीच ज्या पद्धतीने माहीत आहात त्याच पद्धतीने साइन इन करा.',
      aadhaarLabel: 'आधार (UIDAI)', aadhaarSub: 'आधार-लिंक्ड मोबाइल + OTP',
      digilockerLabel: 'डिजीलॉकर', digilockerSub: 'मोबाइल + सुरक्षा पिन + OTP',
      dataNotice: 'तुमचा डेटा एन्क्रिप्टेड आहे आणि कधीही साठवला जात नाही. प्रमाणीकरण भारत सरकारच्या सेवांद्वारे चालवले जाते.',
      newHere: 'नवीन आहात?', createAccount: 'खाते तयार करा',
      back: 'मागे', mobileLabel: 'मोबाइल नंबर', pinLabel: '6-अंकी सुरक्षा पिन', sendOtpBtn: 'OTP पाठवा',
      aadhaarVerifyTitle: 'आधार पडताळणी', aadhaarVerifySub: 'तुमचा आधार-लिंक्ड मोबाइल नंबर टाका',
      digilockerSigninTitle: 'डिजीलॉकर साइन-इन', digilockerSigninSub: 'तुमचा नोंदणीकृत मोबाइल आणि पिन टाका',
      otpTitle: 'OTP टाका', otpSentTo: 'मोबाइलवर पाठवले, शेवट', verifyContinue: 'सत्यापित करा आणि पुढे जा',
      resendPrompt: 'मिळाला नाही?', resendLink: 'OTP पुन्हा पाठवा',
      verifyingTitle: 'ओळख सत्यापित होत आहे', verifyingSub: 'प्रमाणीकरण सुरू आहे',
      govSigninTitle: 'सरकारी साइन-इन', employerSigninTitle: 'नियोक्ता साइन-इन',
      govSigninSub: 'प्रवेश फक्त अधिकृत अधिकाऱ्यांपुरता मर्यादित आहे. सर्व क्रिया लॉग आणि ऑडिट केल्या जातात.',
      employerSigninSub: 'तुमच्या संस्थेच्या क्रेडेन्शियल्सने साइन इन करा.',
      emailLabel: 'ईमेल पत्ता', passwordLabel: 'पासवर्ड', signInBtn: 'साइन इन करा',
      demoCredsGov: 'डेमो क्रेडेन्शियल्स आधीच भरलेले आहेत. कोणताही इनपुट तुम्हाला साइन इन करेल.',
      demoBuildEmployer: 'हे डेमो बिल्ड आहे - कोणतेही क्रेडेन्शियल्स तुम्हाला साइन इन करतील.',
      newHereEmployer: 'नवीन आहात?', createEmployerAccount: 'नियोक्ता खाते तयार करा',
    },
  };
  App.login = {
    set(k, v) { L[k] = v; renderLogin(); },
    setLang(l) { L.lang = I18N[l] ? l : 'en'; renderLogin(); },
    setMode(m) { L.mode = m; L.method = 'choose'; L.step = 'input'; L.phone = ''; L.pin = ''; L.otp = ''; SU.active = false; WU.active = false; renderLogin(); },
    pickMethod(m) { L.method = m; L.step = 'input'; renderLogin(); },
    back() { if (L.step === 'otp') { L.step = 'input'; } else { L.method = 'choose'; } renderLogin(); },
    sendOtp() { const el = $('#lgPhone'); L.phone = el ? el.value : L.phone; if ((L.phone || '').replace(/\D/g, '').length < 10) { App.toast('Enter a 10-digit mobile number', 'alert'); return; } L.step = 'otp'; renderLogin(); },
    verify() {
      L.step = 'verifying'; renderLogin();
      setTimeout(() => { App.startApp('worker'); }, 1400);
    },
    submit(persona) {
      // employer / gov email+password — demo accepts anything
      App.startApp(persona);
    }
  };

  /* ============================================================
     WORKER SIGN-UP  (Aadhaar-registered mobile → OTP → fresh worker profile)
     step: 'mobile' | 'otp' | 'verifying'
     ============================================================ */
  const WU = { active: false, step: 'mobile', phone: '', otp: '' };
  App.workerSignup = {
    open() { WU.active = true; WU.step = 'mobile'; WU.phone = ''; WU.otp = ''; renderLogin(); },
    cancel() { WU.active = false; renderLogin(); },
    onPhone(el) { WU.phone = el.value.replace(/\D/g, '').slice(0, 10); el.value = WU.phone; },
    autofillMobile() { WU.phone = '9876543210'; renderLogin(); },
    sendOtp() {
      if (WU.phone.length !== 10) { App.toast('Enter a 10-digit Aadhaar-registered mobile number', 'alert'); return; }
      WU.step = 'otp'; renderLogin();
    },
    onOtp(el) {
      const v = el.value.replace(/\D/g, '').slice(0, 6);
      el.value = v; WU.otp = v;
      const b = document.getElementById('wuVerifyBtn'); if (b) b.disabled = v.length !== 6;
    },
    autofillOtp() { WU.otp = '123456'; renderLogin(); },
    verify() {
      if (WU.otp.length !== 6) { App.toast('Enter the 6-digit OTP', 'alert'); return; }
      WU.step = 'verifying'; renderLogin();
      setTimeout(() => {
        // a fresh worker profile with just the verified mobile number — everything
        // else (name, work history, skills) is filled in by the worker afterwards via
        // Profile & Settings, so the rest of the app shouldn't show Rajan's demo data.
        App.startApp('worker', {
          name: '', subtitle: '', winId: 'WIN-NEW-' + WU.phone.slice(-4),
          role: '', location: '', verificationScore: 0, phone: '+91 ' + WU.phone,
          _fresh: true,
        });
      }, 1400);
    },
  };

  /* ============================================================
     EMPLOYER SIGN-UP  (create credentials → KYB → land on HRMS Sync)
     step: 'credentials' | 'business' | 'verifying'
     HRMS connection itself happens on the HRMS Sync page (views/emp-hrms.js),
     not during onboarding — signup only gets the business to the point where
     its own "connection request" is waiting there.
     ============================================================ */
  // pre-filled with demo data so the employer signup flow needs zero typing to click
  // through — this is a prototype, not a real KYB check.
  const SU = {
    active: false, step: 'credentials',
    legalName: 'Aditya Birla Construction Ltd.', email: 'hr@abconstruction.in',
    password: 'Passw0rd!23', confirm: 'Passw0rd!23',
    hasMca: 'yes', cin: 'U45201MH2010PTC123456', hasGst: 'yes', gstUdyam: '07AAACB1234C1Z5',
    address: '', city: '', state: '', pincode: '',
    tier: null,
  };
  // MCA (Yes/No) × GST/Udyam (Yes/No) → KYB trust tier. MCA applies only to companies/LLPs —
  // most legitimate proprietorships will never have one, so "MCA: No" isn't a deficiency,
  // it's a different business structure that needs a Digital Address Verification (DAV)
  // instead, since there's no MCA registry record to corroborate against.
  function kybTier(su) {
    const mca = su.hasMca === 'yes', gst = su.hasGst === 'yes';
    if (mca && gst) return { name: 'Gold Standard', requiresDav: false };
    if (mca && !gst) return { name: 'Financials Reconciliation', requiresDav: false };
    if (!mca && gst) return { name: 'Field-Verified', requiresDav: true };
    return { name: 'Full Verification', requiresDav: true };
  }
  App.signup = {
    open() { SU.active = true; SU.step = 'credentials'; renderLogin(); },
    cancel() { SU.active = false; renderLogin(); },
    set(k, v) { SU[k] = v; },
    setHasMca(v) { SU.hasMca = v; SU.cin = ''; renderLogin(); },
    setHasGst(v) { SU.hasGst = v; SU.gstUdyam = ''; renderLogin(); },
    autofillCredentials() {
      SU.legalName = 'Aditya Birla Construction Ltd.'; SU.email = 'hr@abconstruction.in';
      SU.password = 'Passw0rd!23'; SU.confirm = 'Passw0rd!23';
      renderLogin();
    },
    autofillBusiness() {
      SU.hasMca = 'yes'; SU.cin = 'U45201MH2010PTC123456';
      SU.hasGst = 'yes'; SU.gstUdyam = '07AAACB1234C1Z5';
      renderLogin();
    },
    submitCredentials() {
      if (!SU.legalName || !SU.email) { App.toast('Fill in your organisation name and email', 'alert'); return; }
      if (SU.password !== SU.confirm) { App.toast('Passwords do not match', 'alert'); return; }
      SU.step = 'business'; renderLogin();
    },
    backToCredentials() { SU.step = 'credentials'; renderLogin(); },
    toVerifying() {
      if (!SU.hasMca) { App.toast('Let us know if you\'re registered with the MCA', 'alert'); return; }
      if (SU.hasMca === 'yes' && !SU.cin) { App.toast('Enter your CIN / LLPIN', 'alert'); return; }
      if (!SU.hasGst) { App.toast('Let us know if you have GST/Udyam registration', 'alert'); return; }
      if (SU.hasGst === 'yes' && !SU.gstUdyam) { App.toast('Enter your GSTIN / Udyam number', 'alert'); return; }
      const requiresDav = SU.hasMca === 'no';
      if (requiresDav && (!SU.address || !SU.city || !SU.state || !SU.pincode)) { App.toast('Fill in the address details to verify', 'alert'); return; }
      SU.step = 'verifying'; renderLogin();
      setTimeout(() => { SU.tier = kybTier(SU); App.signup.finish(); }, 1800);
    },
    finish() {
      App.startApp('employer', {
        name: SU.legalName, subtitle: SU.legalName, org: SU.legalName,
        role: 'Admin', sector: '—', email: SU.email,
      });
      App.navigate('emp-hrms');
    },
  };

  const UIDAI = `<svg viewBox="0 0 80 80" width="46" height="46"><circle cx="40" cy="40" r="38" fill="#E8372C"/><circle cx="40" cy="40" r="29" fill="#fff"/><circle cx="40" cy="40" r="21" fill="#E8372C"/><circle cx="40" cy="33" r="6" fill="#fff"/><path d="M28 51Q34 39 40 39Q46 39 52 51" fill="#fff"/><circle cx="30" cy="26" r="3" fill="#2E8B57"/><circle cx="50" cy="26" r="3" fill="#FF8C00"/></svg>`;
  const DIGILOCKER = `<svg viewBox="0 0 80 80" width="46" height="46"><rect x="4" y="4" width="72" height="72" rx="14" fill="#2B3990"/><rect x="20" y="26" width="40" height="30" rx="4" fill="#fff"/><path d="M31 26v-4a9 9 0 0 1 18 0v4" stroke="#fff" stroke-width="4" fill="none"/><circle cx="40" cy="39" r="4.5" fill="#2B3990"/><rect x="38" y="42" width="4" height="8" rx="2" fill="#2B3990"/></svg>`;


  function signupForm() {
    if (SU.step === 'credentials') {
      return `
        <div class="row between" style="align-items:flex-start">
          <h2 class="auth__title">Create an employer account</h2>
          <button class="btn btn--ghost btn--sm" onclick="App.signup.autofillCredentials()">${App.icon('sparkles')} Autofill demo data</button>
        </div>
        <p class="muted" style="margin:6px 0 12px">Let's start with your account details.</p>
        <div class="banner banner--info" style="margin-bottom:18px">${App.icon('plug')}<div>You won't need to enter employee data here — once your account is verified, you'll connect your HRMS and worker records sync in automatically.</div></div>
        <div class="field"><label class="label">Organisation Name</label>
          <input class="input" value="${App.esc(SU.legalName)}" placeholder="e.g. Aditya Birla Construction Ltd." oninput="App.signup.set('legalName',this.value)"></div>
        <div class="field"><label class="label">Work Email</label>
          <div class="input--icon">${App.icon('mail')}<input class="input" value="${App.esc(SU.email)}" placeholder="you@company.com" oninput="App.signup.set('email',this.value)"></div></div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label">Password</label>
            <div class="input--icon">${App.icon('lock')}<input class="input" type="password" value="${App.esc(SU.password)}" placeholder="Choose a password" oninput="App.signup.set('password',this.value)"></div></div>
          <div class="field" style="margin-bottom:0"><label class="label">Confirm Password</label>
            <div class="input--icon">${App.icon('lock')}<input class="input" type="password" value="${App.esc(SU.confirm)}" placeholder="Re-enter password" oninput="App.signup.set('confirm',this.value)"></div></div>
        </div>
        <button class="btn btn--primary btn--block btn--lg" style="margin-top:18px" onclick="App.signup.submitCredentials()">Continue ${App.icon('arrow')}</button>
        <p class="muted" style="text-align:center;font-size:12.5px;margin-top:16px">This is a demo build - any credentials sign you in.</p>
        <p class="muted" style="text-align:center;font-size:13px;margin-top:8px">Already have an account? <b style="color:var(--accent-strong);cursor:pointer" onclick="App.signup.cancel()">Sign in</b></p>`;
    }
    if (SU.step === 'business') {
      const requiresDav = SU.hasMca === 'no';
      return `
        <div class="row between" style="align-items:flex-start">
          <button class="btn btn--ghost btn--sm" onclick="App.signup.backToCredentials()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--ghost btn--sm" onclick="App.signup.autofillBusiness()">${App.icon('sparkles')} Autofill demo data</button>
        </div>
        <h2 class="auth__title" style="font-size:19px;margin-top:14px">Business verification</h2>
        <p class="muted" style="margin:6px 0 18px;font-size:13px">Two quick questions to verify your business (KYB) before activating your account.</p>
        <div class="field"><label class="label">Registered with the MCA (Company/LLP)?</label>
          <select class="select" onchange="App.signup.setHasMca(this.value)">
            <option value="" ${!SU.hasMca ? 'selected' : ''} disabled>Select an option</option>
            <option value="yes" ${SU.hasMca === 'yes' ? 'selected' : ''}>Yes</option>
            <option value="no" ${SU.hasMca === 'no' ? 'selected' : ''}>No</option>
          </select></div>
        ${SU.hasMca === 'yes' ? `
        <div class="field"><label class="label">CIN / LLPIN</label>
          <input class="input mono" value="${App.esc(SU.cin)}" placeholder="e.g. U45201MH2010PTC123456" oninput="App.signup.set('cin',this.value)"></div>` : ''}
        <div class="field"><label class="label">Have GST/Udyam Registration?</label>
          <select class="select" onchange="App.signup.setHasGst(this.value)">
            <option value="" ${!SU.hasGst ? 'selected' : ''} disabled>Select an option</option>
            <option value="yes" ${SU.hasGst === 'yes' ? 'selected' : ''}>Yes</option>
            <option value="no" ${SU.hasGst === 'no' ? 'selected' : ''}>No</option>
          </select></div>
        ${SU.hasGst === 'yes' ? `
        <div class="field"><label class="label">GSTIN / Udyam Number</label>
          <input class="input mono" value="${App.esc(SU.gstUdyam)}" placeholder="e.g. 07AAACB1234C1Z5" oninput="App.signup.set('gstUdyam',this.value)"></div>` : ''}
        ${requiresDav ? `
        <div class="banner banner--info" style="margin:16px 0">${App.icon('mappin')}<div>Since you're not MCA-registered, we'll verify your business address instead.</div></div>
        <div class="field"><label class="label">Registered / Operating Address</label>
          <input class="input" value="${App.esc(SU.address)}" placeholder="Street / site address" oninput="App.signup.set('address',this.value)"></div>
        <div class="grid grid-2">
          <div class="field" style="margin-bottom:0"><label class="label">City</label>
            <input class="input" value="${App.esc(SU.city)}" placeholder="e.g. Gurugram" oninput="App.signup.set('city',this.value)"></div>
          <div class="field" style="margin-bottom:0"><label class="label">State</label>
            <input class="input" value="${App.esc(SU.state)}" placeholder="e.g. Haryana" oninput="App.signup.set('state',this.value)"></div>
        </div>
        <div class="field" style="margin-top:16px"><label class="label">Pincode</label>
          <input class="input mono" value="${App.esc(SU.pincode)}" placeholder="e.g. 122002" oninput="App.signup.set('pincode',this.value)"></div>` : ''}
        <button class="btn btn--primary btn--block btn--lg" style="margin-top:8px" onclick="App.signup.toVerifying()">${App.icon('shieldcheck')} Verify Business</button>`;
    }
    if (SU.step === 'verifying') {
      return `<div style="text-align:center;padding:30px 0">
        <div class="spin" style="width:46px;height:46px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;margin:0 auto 20px;animation:spin 1s linear infinite"></div>
        <h2 class="auth__title" style="font-size:20px">Verifying your business</h2>
        <p class="muted" style="font-size:13px;margin-top:6px">Checking MCA and GSTN/Udyam records…</p></div>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    }
  }

  function workerSignupForm() {
    if (WU.step === 'mobile') {
      return `
        <div class="row between" style="align-items:flex-start;margin-bottom:14px">
          <button class="btn btn--ghost btn--sm" onclick="App.workerSignup.cancel()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--ghost btn--sm" onclick="App.workerSignup.autofillMobile()">${App.icon('sparkles')} Autofill demo data</button>
        </div>
        <div class="row gap-12" style="margin-bottom:18px">${UIDAI}<div><h2 class="auth__title" style="font-size:19px">Create your account</h2><p class="muted" style="font-size:13px">Enter your Aadhaar-linked mobile number</p></div></div>
        <div class="field"><label class="label">Mobile number</label>
          <div class="input-group"><span class="prefix">+91</span><input class="input" id="wuPhone" inputmode="numeric" maxlength="10" placeholder="98••• •••••" value="${App.esc(WU.phone)}" oninput="App.workerSignup.onPhone(this)"></div>
        </div>
        <button class="btn btn--primary btn--block btn--lg" onclick="App.workerSignup.sendOtp()">${App.icon('send')} Send OTP</button>`;
    }
    if (WU.step === 'otp') {
      return `
        <div class="row between" style="align-items:flex-start;margin-bottom:14px">
          <button class="btn btn--ghost btn--sm" onclick="App.workerSignup.open()">${App.icon('arrowleft')} Back</button>
          <button class="btn btn--ghost btn--sm" onclick="App.workerSignup.autofillOtp()">${App.icon('sparkles')} Autofill demo data</button>
        </div>
        <div style="text-align:center;margin-bottom:20px"><div class="kpi__icon" style="width:46px;height:46px;margin:0 auto 12px;background:var(--accent-weak);color:var(--accent)">${App.icon('lock')}</div>
          <h2 class="auth__title" style="font-size:20px">Enter OTP</h2><p class="muted" style="font-size:13px;margin-top:4px">Sent to mobile ending ${App.esc(WU.phone.slice(-4) || '••••')}</p></div>
        <div class="field"><label class="label">6-digit OTP</label>
          <input class="input mono" id="wuOtp" inputmode="numeric" maxlength="6" placeholder="••••••" value="${App.esc(WU.otp)}" oninput="App.workerSignup.onOtp(this)"></div>
        <button class="btn btn--primary btn--block btn--lg" id="wuVerifyBtn" ${WU.otp.length === 6 ? '' : 'disabled'} onclick="App.workerSignup.verify()">${App.icon('check')} Verify &amp; continue</button>`;
    }
    // verifying
    return `<div style="text-align:center;padding:30px 0">
      <div class="spin" style="width:46px;height:46px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;margin:0 auto 20px;animation:spin 1s linear infinite"></div>
      <h2 class="auth__title" style="font-size:20px">Verifying identity</h2>
      <p class="muted" style="font-size:13px;margin-top:6px">Authenticating with UIDAI…</p></div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  }

  function renderLogin() {
    const accent = L.mode === 'worker' ? 'worker' : L.mode === 'employer' ? 'employer' : 'gov';
    const T = I18N[L.lang] || I18N.en;
    const langSwitcher = `<div class="auth__lang">
      ${Object.keys(LANG_LABELS).map(l => `<button class="${L.lang === l ? 'is-active' : ''}" onclick="App.login.setLang('${l}')">${LANG_LABELS[l]}</button>`).join('')}
    </div>`;
    let form = '';
    if (L.mode === 'worker') {
      if (L.method === 'choose') {
        form = `
          <h2 class="auth__title">${T.verifyTitle}</h2>
          <p class="muted" style="margin:6px 0 22px">${T.verifySub}</p>
          <button class="method-card" onclick="App.login.pickMethod('aadhaar')">
            <div class="method-card__logo">${UIDAI}</div>
            <div class="grow"><b>${T.aadhaarLabel}</b><span>${T.aadhaarSub}</span></div>${App.icon('arrow')}
          </button>
          <button class="method-card" onclick="App.login.pickMethod('digilocker')">
            <div class="method-card__logo">${DIGILOCKER}</div>
            <div class="grow"><b>${T.digilockerLabel}</b><span>${T.digilockerSub}</span></div>${App.icon('arrow')}
          </button>
          <div class="banner banner--green" style="margin-top:16px">${App.icon('lock')}<div>${T.dataNotice}</div></div>
          <p class="muted" style="text-align:center;font-size:13px;margin-top:16px">${T.newHere} <b style="color:var(--accent-strong);cursor:pointer" onclick="App.workerSignup.open()">${T.createAccount}</b></p>`;
      } else if (L.step === 'input') {
        const isAad = L.method === 'aadhaar';
        form = `
          <button class="btn btn--ghost btn--sm" style="margin-bottom:14px" onclick="App.login.back()">${App.icon('arrowleft')} ${T.back}</button>
          <div class="row gap-12" style="margin-bottom:18px">${isAad ? UIDAI : DIGILOCKER}<div><h2 class="auth__title" style="font-size:19px">${isAad ? T.aadhaarVerifyTitle : T.digilockerSigninTitle}</h2><p class="muted" style="font-size:13px">${isAad ? T.aadhaarVerifySub : T.digilockerSigninSub}</p></div></div>
          <div class="field"><label class="label">${T.mobileLabel}</label>
            <div class="input-group"><span class="prefix">+91</span><input class="input" id="lgPhone" inputmode="numeric" maxlength="10" placeholder="98••• •••••" value="${App.esc(L.phone)}"></div>
          </div>
          ${isAad ? '' : `<div class="field"><label class="label">${T.pinLabel}</label><input class="input mono" id="lgPin" type="password" inputmode="numeric" maxlength="6" placeholder="••••••"></div>`}
          <button class="btn btn--primary btn--block btn--lg" onclick="App.login.sendOtp()">${App.icon('send')} ${T.sendOtpBtn}</button>`;
      } else if (L.step === 'otp') {
        form = `
          <button class="btn btn--ghost btn--sm" style="margin-bottom:14px" onclick="App.login.back()">${App.icon('arrowleft')} ${T.back}</button>
          <div style="text-align:center;margin-bottom:20px"><div class="kpi__icon" style="width:46px;height:46px;margin:0 auto 12px;background:var(--accent-weak);color:var(--accent)">${App.icon('lock')}</div>
            <h2 class="auth__title" style="font-size:20px">${T.otpTitle}</h2><p class="muted" style="font-size:13px;margin-top:4px">${T.otpSentTo} ${App.esc((L.phone || '000000').replace(/\D/g,'').slice(-4) || '••••')}</p></div>
          <div class="otp" id="otpWrap">${[0,1,2,3,4,5].map(i => `<input maxlength="1" inputmode="numeric" data-i="${i}" oninput="App._otpAdvance(event,${i})">`).join('')}</div>
          <button class="btn btn--primary btn--block btn--lg" style="margin-top:22px" onclick="App.login.verify()">${T.verifyContinue}</button>
          <p class="muted" style="text-align:center;font-size:12.5px;margin-top:14px">${T.resendPrompt} <b style="color:var(--accent-strong)">${T.resendLink}</b></p>`;
      } else if (L.step === 'verifying') {
        form = `<div style="text-align:center;padding:30px 0">
          <div class="spin" style="width:46px;height:46px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;margin:0 auto 20px;animation:spin 1s linear infinite"></div>
          <h2 class="auth__title" style="font-size:20px">${T.verifyingTitle}</h2>
          <p class="muted" style="font-size:13px;margin-top:6px">${T.verifyingSub} ${L.method === 'aadhaar' ? 'UIDAI' : 'DigiLocker'}…</p></div>
          <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
      }
    } else {
      // employer / gov
      const gov = L.mode === 'gov';
      form = `
        <h2 class="auth__title">${gov ? T.govSigninTitle : T.employerSigninTitle}</h2>
        <p class="muted" style="margin:6px 0 22px">${gov ? T.govSigninSub : T.employerSigninSub}</p>
        <div class="field"><label class="label">${T.emailLabel}</label>
          <div class="input--icon">${App.icon('mail')}<input class="input" id="lgEmail" placeholder="${gov ? 'you@ministry.gov.in' : 'you@company.com'}" value="${gov ? 'commissioner@labour.mh.gov.in' : 'hr@acmelogistics.in'}"></div></div>
        <div class="field"><label class="label">${T.passwordLabel}</label>
          <div class="input--icon">${App.icon('lock')}<input class="input" type="password" placeholder="••••••••" value="demo-password"></div></div>
        <button class="btn btn--primary btn--block btn--lg" onclick="App.login.submit('${gov ? 'gov' : 'employer'}')">${T.signInBtn} ${App.icon('arrow')}</button>
        ${gov ? `<div class="banner banner--info" style="margin-top:16px">${App.icon('shield')}<div>${T.demoCredsGov}</div></div>` : `<p class="muted" style="text-align:center;font-size:12.5px;margin-top:16px">${T.demoBuildEmployer}</p>
        <p style="text-align:center;font-size:13px;margin-top:14px">${T.newHereEmployer} <b style="color:var(--accent-strong);cursor:pointer" onclick="App.signup.open()">${T.createEmployerAccount}</b></p>`}`;
    }
    if (L.mode === 'employer' && SU.active) form = signupForm();
    if (L.mode === 'worker' && WU.active) form = workerSignupForm();

    $('#app').innerHTML = `
      <div class="auth" data-persona="${accent}">
        ${langSwitcher}
        <div class="auth__aside">
          <div class="auth__brand"><div class="brandmark">${App.icon('shieldcheck')}</div><b>WiN</b></div>
          <div class="auth__pitch">
            <div class="auth__eyebrow">${App.icon('fingerprint')} ${T.eyebrow}</div>
            <h2>${T.tagline}</h2>
            <p>${T.pitch}</p>
            <div class="auth__srcs">
              ${(DB.sources || []).map(s => `<span>${App.esc(s.label)}</span>`).join('')}
            </div>
          </div>
          <div class="auth__stats">
            <div class="auth__stat"><b>150M+</b><span>${T.statWorkers}</span></div>
            <div class="auth__stat"><b>&lt;30s</b><span>${T.statVerify}</span></div>
            <div class="auth__stat"><b>7</b><span>${T.statSources}</span></div>
          </div>
        </div>
        <div class="auth__main">
          <div class="auth__card">
            <div class="auth__mobilebrand"><div class="brandmark">${App.icon('shieldcheck')}</div><b>WiN</b></div>
            <div class="auth__tabs">
              <div class="auth__tab ${L.mode === 'worker' ? 'is-active' : ''}" onclick="App.login.setMode('worker')">${App.icon('user')} ${T.tabWorker}</div>
              <div class="auth__tab ${L.mode === 'employer' ? 'is-active' : ''}" onclick="App.login.setMode('employer')">${App.icon('building')} ${T.tabEmployer}</div>
              <div class="auth__tab ${L.mode === 'gov' ? 'is-active' : ''}" onclick="App.login.setMode('gov')">${App.icon('landmark')} ${T.tabGov}</div>
            </div>
            ${form}
            <p class="muted" style="text-align:center;font-size:11.5px;margin-top:24px">${T.terms}</p>
          </div>
        </div>
      </div>`;
    setTimeout(() => { const f = $('#lgPhone') || $('#lgEmail') || $('#otpWrap input') || $('#wuPhone') || $('#wuOtp'); if (f) f.focus(); }, 60);
  }
  App._otpAdvance = (e, i) => {
    const wrap = $('#otpWrap'); if (!wrap) return;
    const inputs = $$('#otpWrap input');
    if (e.target.value && i < 5) inputs[i + 1].focus();
  };

  /* ---------------- boot ---------------- */
  App.boot = () => {
    window.addEventListener('hashchange', () => {
      const h = (location.hash || '').replace(/^#\//, '');
      if (!h) return;
      const [persona, route] = h.split('/');
      if (persona && PERSONAS[persona] && route && App.state.persona === persona && route !== App.state.route) {
        App.navigate(route);
      }
    });
    // deep-link support: #/persona/route boots straight into the app
    const h = (location.hash || '').replace(/^#\//, '');
    const [persona, route] = h.split('/');
    if (persona && PERSONAS[persona]) {
      App.startApp(persona);
      if (route && App.views[route]) App.navigate(route);
    } else {
      renderLogin();
    }
  };

  return App;
})();
