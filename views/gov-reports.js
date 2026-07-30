/* Government · Reports — editorial hero, live quick-stats strip, a
   section-structured library of analytical reports (download + preview),
   a scheduled-reports queue you can run, and a working "Generate report"
   flow (type + period + format → simulated compile → toast). Reports are
   organised against the Maharashtra LMIS Indicator Framework (World
   Bank Labor Market Observatory model): each report states what WIN ID
   data verifies it and which external survey/administrative source it
   triangulates against, mirroring the framework's indicator checklist. */
(function () {
  // ---- section tints (not in base tokens) ----
  const SECTIONS = [
    { key: 'ops',       title: 'Operational Registry Reports', desc: 'Day-to-day registry health — enrollment, demographics, grievances, employer compliance and economic impact.', c: '#64748b', ic: 'database' },
    { key: 'workforce', title: '1. Workforce Composition',                    desc: 'LFPR, WPR, unemployment and sectoral concentration of the enrolled workforce.', c: 'var(--accent)', ic: 'users' },
    { key: 'formal',    title: '2. Formal–Informal Segmentation',             desc: 'Formal vs. informal employment, organised vs. unorganised units, and social security coverage.', c: '#6b4fc7', ic: 'shieldcheck' },
    { key: 'skilling',  title: '3. Education-to-Employment / Skilling Mapping', desc: 'Graduate outcomes, ITI/NSDC placement rates and skill-mismatch tracking.', c: '#2f5fd0', ic: 'graduation' },
    { key: 'income',    title: '4. Income & Wage',                           desc: 'Verified, consent-based income and wage distribution — not a survey estimate.', c: '#0e9f6e', ic: 'trend' },
    { key: 'migration', title: '5. Migration & Interstate Mobility',          desc: 'Interstate worker stock, migrant sector concentration, and benefit-portability eligibility.', c: '#0891a7', ic: 'mappin' },
    { key: 'demand',    title: '6. Demand-Side Signals',                     desc: 'Employer-side vacancy postings captured via HRMS-integrated employers.', c: '#c07d10', ic: 'briefcase' },
  ];
  const CAT_C = SECTIONS.reduce((m, s) => { m[s.key] = s.c; return m; }, {});

  // ---- report library, organised against the LMIS Indicator Framework ----
  const REPORTS = [
    // ---- Operational registry reports (existing registry health, outside the indicator framework) ----
    { id: 'emp-monthly',  title: 'Monthly Employment Summary', section: 'ops', ic: 'users',    size: '2.4 MB', last: 'Nov 1, 2024',  freq: 'Monthly',   desc: 'Comprehensive overview of enrollment, verification, and sector distribution.' },
    { id: 'demographics', title: 'State-wise Demographics',    section: 'ops', ic: 'mappin',   size: '3.8 MB', last: 'Oct 31, 2024', freq: 'Monthly',   desc: 'Detailed demographic data per state including gender, age, and urban/rural split.' },
    { id: 'grievance',    title: 'Grievance Analysis Report',  section: 'ops', ic: 'alert',    size: '1.1 MB', last: 'Nov 15, 2024', freq: 'Bi-weekly', desc: 'Category-wise breakdown of grievances, resolution times, and escalation rates.' },
    { id: 'compliance',   title: 'Employer Compliance Report', section: 'ops', ic: 'building', size: '980 KB', last: 'Nov 10, 2024', freq: 'Weekly',    desc: 'Verification compliance rates and outstanding employer obligations.' },
    { id: 'economic',     title: 'Quarterly Economic Impact',  section: 'ops', ic: 'trend',    size: '5.2 MB', last: 'Sep 30, 2024', freq: 'Quarterly', desc: 'Assessment of WiN platform impact on formalization of the informal workforce.' },

    // ---- 1. Workforce Composition ----
    { id: 'sector', title: 'Sectoral Workforce Concentration & Growth', section: 'workforce', ic: 'chart', size: '2.0 MB', last: 'Nov 5, 2024', freq: 'Monthly',
      desc: 'Headcount and share of the workforce by sector — agriculture, gig/platform, construction, manufacturing, services.',
      verifiedVia: 'Sector field on the WIN ID profile (HRMS/aggregator-linked or self-declared), aggregated across all enrolled workers.',
      triangulate: ['PLFS (NSO)', 'DES Maharashtra', 'NSDC sector reports'] },
    { id: 'lfpr-wpr', title: 'LFPR, WPR & Unemployment Rate by District', section: 'workforce', ic: 'users', size: '2.6 MB', last: 'Nov 8, 2024', freq: 'Monthly',
      desc: 'Labour Force Participation Rate, Worker Population Ratio and unemployment rate, split by district and gender.',
      verifiedVia: "Active/inactive status of enrolled workers from live WIN ID employment records (HRMS feeds, gig declarations, self-declaration re-verified every 14 days).",
      triangulate: ['PLFS (NSO)', 'Maharashtra Economic Survey', 'DES Maharashtra'] },

    // ---- 2. Formal–Informal Segmentation ----
    { id: 'formal-informal', title: 'Formal vs. Informal Employment Share', section: 'formal', ic: 'shieldcheck', size: '1.8 MB', last: 'Nov 3, 2024', freq: 'Monthly',
      desc: 'Share of workers with a written contract and social security coverage vs. without, and organised vs. unorganised establishments.',
      verifiedVia: 'Employment-type field captured at WIN ID enrolment (HRMS-linked formal job vs. gig/aggregator vs. self-declared informal), verified each 14-day cycle.',
      triangulate: ['EPFO / ESIC enrolment data', 'PLFS', 'Annual Survey of Industries'] },
    { id: 'informal-subsector', title: 'Informal Sector Segmentation & Social Security Coverage', section: 'formal', ic: 'file', size: '1.6 MB', last: 'Nov 6, 2024', freq: 'Monthly',
      desc: 'Within the informal segment: headcount by sub-sector (construction, farm labour, gig, domestic, other) and PF/ESIC coverage rate.',
      verifiedVia: 'Sector/employment-type fields on informal WIN ID profiles (no HRMS link), plus PF/ESIC contribution status pulled via the HRMS-to-WIN ID integration.',
      triangulate: ['BOCW Board registrations', 'e-Shram', 'PLFS', 'EPFO', 'ESIC'] },

    // ---- 3. Education-to-Employment / Skilling Mapping ----
    { id: 'grad-outcome', title: 'Graduate Outcome Mapping', section: 'skilling', ic: 'graduation', size: '1.4 MB', last: 'Oct 28, 2024', freq: 'Quarterly',
      desc: 'Stream of graduation cross-tabulated against sector of first employment.',
      verifiedVia: 'Education field at WIN ID enrolment matched against the first verified employer/sector recorded post-enrolment.',
      triangulate: ['University / board records', 'NCS', 'MahaSwayam placement data'] },
    { id: 'iti-placement', title: 'ITI/NSDC Training-to-Placement & Skill Mismatch', section: 'skilling', ic: 'award', size: '1.5 MB', last: 'Nov 2, 2024', freq: 'Quarterly',
      desc: 'Share of vocationally trained candidates placed within 6 months, and the extent of over/under-qualification vs. job role held.',
      verifiedVia: 'Training-completion flag matched against the first verified employment record within 6 months; declared qualification compared to verified job role.',
      triangulate: ['MSSDS', 'NSDC', 'MahaSwayam', 'periodic employer surveys'] },

    // ---- 4. Income & Wage ----
    { id: 'wage-distribution', title: 'Wage Distribution by Sector, Gender & Skill', section: 'income', ic: 'trend', size: '2.2 MB', last: 'Nov 9, 2024', freq: 'Monthly',
      desc: 'Median/mean wages disaggregated by sector, gender and skill level.',
      verifiedVia: 'Aggregated, verified income data across enrolled WIN ID holders, disaggregated by sector, gender and skill level.',
      triangulate: ['PLFS', 'Labour Bureau wage rate reports'] },
    { id: 'verified-income', title: 'Verified Income Record Summary', section: 'income', ic: 'file', size: '1.9 MB', last: 'Nov 11, 2024', freq: 'Monthly',
      desc: "The actual, consent-based income figure per worker — distinct from a self-declared survey estimate — with 14-day re-verification compliance.",
      verifiedVia: "WIN ID's core function: an individual-level income figure declared and re-confirmed every 14 days from HRMS payroll, gig payout data, or direct declaration.",
      triangulate: ['EPFO contribution records (cross-check for HRMS-linked cases)'] },

    // ---- 5. Migration & Interstate Mobility ----
    { id: 'migration', title: 'In-Migrant Worker Stock & Sector Concentration', section: 'migration', ic: 'mappin', size: '3.1 MB', last: 'Nov 12, 2024', freq: 'Quarterly',
      desc: 'Interstate worker inflow by source state and destination district, and migrant share of the workforce by sector.',
      verifiedVia: 'Home-state and current work-location fields on the WIN ID profile, updated at each re-verification cycle.',
      triangulate: ['Census', 'Migrant Tracking System (MTS)', 'e-Shram registrations'] },
    { id: 'migrant-gap', title: 'Migrant Registration Gap & Benefit Portability', section: 'migration', ic: 'shieldcheck', size: '1.7 MB', last: 'Nov 7, 2024', freq: 'Quarterly',
      desc: 'Share of migrant workers unregistered under BOCW/e-Shram (a proxy for informality), and benefit-portability eligibility uptake.',
      verifiedVia: "Enrolled-but-unregistered WIN ID holders give a direct count of the registration gap; verified days-worked establishes portable-benefit eligibility.",
      triangulate: ['BOCW vs. Census/PLFS migrant estimates', 'ONORC dashboard', 'PDS records', 'MahaDBT'] },

    // ---- 6. Demand-Side Signals ----
    { id: 'vacancy-index', title: 'Vacancy Index by Sector & District', section: 'demand', ic: 'briefcase', size: '1.3 MB', last: 'Nov 4, 2024', freq: 'Monthly',
      desc: 'Registered and online job vacancies by sector and district, from HRMS-integrated employers.',
      verifiedVia: 'Employer-side postings captured where the employer is itself HRMS-integrated with the WIN system.',
      triangulate: ['NCS', 'Employment Exchanges', 'MahaSwayam', 'private job portals'] },
  ];

  // ---- shared seed lists for generating extensive (100+ row), realistic report data ----
  const ALL_STATES = [
    'Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal', 'Madhya Pradesh', 'Tamil Nadu',
    'Rajasthan', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Odisha', 'Telangana', 'Kerala',
    'Jharkhand', 'Assam', 'Punjab', 'Chhattisgarh', 'Haryana', 'Delhi NCR', 'Uttarakhand',
  ];
  const SECTOR_LIST = ['Construction', 'Manufacturing', 'Gig & Platform', 'Agriculture', 'Domestic & Services'];
  const DISTRICT_SEED = ['Central', 'North', 'South', 'East', 'West', 'Rural Belt'];

  // deterministic pseudo-random (no Math.random) so the seed data is stable across renders
  function seeded(i, salt) { return ((i * 9301 + salt * 49297 + 233280) % 100000) / 100000; }

  function genEmpMonthly() {
    const months = ['May 2024', 'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024'];
    const rows = [];
    ALL_STATES.forEach((st, si) => months.forEach((m, mi) => {
      const base = 200000 + si * 41000 + mi * 9000;
      const enrolled = Math.round(base * (0.9 + seeded(si, mi) * 0.3));
      const rate = Math.round((60 + seeded(mi, si) * 30) * 10) / 10;
      const verified = Math.round(enrolled * rate / 100);
      rows.push([st, m, enrolled, verified, rate, SECTOR_LIST[(si + mi) % SECTOR_LIST.length]]);
    }));
    return { headers: ['State', 'Month', 'Enrolled', 'Verified', 'Verification Rate %', 'Top Sector'], rows };
  }

  function genGrievance() {
    const cats = ['Wage Disputes', 'ESIC Coverage', 'PF Withdrawal Delay', 'Contract Violations', 'Workplace Safety'];
    const rows = [];
    for (let d = 1; d <= 100; d++) {
      const cat = cats[d % cats.length];
      const filed = 800 + Math.round(seeded(d, 3) * 1400);
      const resolved = Math.round(filed * (0.75 + seeded(d, 7) * 0.15));
      const escalated = Math.round(filed * (0.03 + seeded(d, 11) * 0.06));
      const avgRes = Math.round((4 + seeded(d, 13) * 10) * 10) / 10;
      const date = '2024-' + String(1 + Math.floor((d - 1) / 30) % 9 + 1).padStart(2, '0') + '-' + String(((d - 1) % 28) + 1).padStart(2, '0');
      rows.push([date, cat, filed, resolved, escalated, avgRes]);
    }
    return { headers: ['Date', 'Category', 'Filed', 'Resolved', 'Escalated', 'Avg. Resolution (days)'], rows };
  }

  function genDemographics() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const total = Math.round((900000 + si * 210000) * (0.7 + seeded(si, di) * 0.6));
      const malePct = Math.round((58 + seeded(di, si) * 16) * 10) / 10;
      const femalePct = Math.round((100 - malePct) * 10) / 10;
      const urban = Math.round(24 + seeded(si + di, 5) * 50);
      const avgAge = 28 + (si + di) % 10;
      rows.push([st, st + ' ' + d, total, malePct, femalePct, urban, avgAge]);
    }));
    return { headers: ['State', 'District', 'Total Enrolled', 'Male %', 'Female %', 'Urban %', 'Avg Age'], rows };
  }

  function genCompliance() {
    const SUFFIX = ['Pvt Ltd', 'Constructions', 'Enterprises', 'Industries', 'Group', '& Sons', 'Infra', 'Textiles'];
    const NAMEROOT = ['Bharat', 'Shakti', 'Ganga', 'Om', 'Sunrise', 'National', 'United', 'Metro', 'Prime', 'Star',
      'Global', 'Everest', 'Silver', 'Golden', 'Royal', 'Bluepeak', 'Greenfield', 'Ironclad', 'Vishnu', 'Laxmi'];
    const rows = [];
    for (let i = 0; i < 100; i++) {
      const name = NAMEROOT[i % NAMEROOT.length] + ' ' + SUFFIX[(i * 3 + 1) % SUFFIX.length];
      const sector = SECTOR_LIST[i % SECTOR_LIST.length];
      const state = ALL_STATES[i % ALL_STATES.length];
      const pf = Math.round(30 + seeded(i, 2) * 65);
      const esic = Math.round(25 + seeded(i, 4) * 68);
      const wage = Math.round(45 + seeded(i, 6) * 50);
      const change = Math.round((seeded(i, 8) * 8 - 3) * 10) / 10;
      rows.push([name, sector, state, pf, esic, wage, change]);
    }
    return { headers: ['Employer', 'Sector', 'State', 'PF Compliance %', 'ESIC Coverage %', 'Min. Wage Adherence %', 'YoY Change %'], rows };
  }

  function genEconomic() {
    const quarters = ['Q1 FY 22-23', 'Q2 FY 22-23', 'Q3 FY 22-23', 'Q4 FY 22-23', 'Q1 FY 23-24', 'Q2 FY 23-24', 'Q3 FY 23-24', 'Q4 FY 23-24'];
    const rows = [];
    quarters.forEach((q, qi) => ALL_STATES.slice(0, 13).forEach((st, si) => {
      const formalized = Math.round((0.08 + seeded(qi, si) * 0.3) * 100) / 100;
      const uplift = Math.round(180 + seeded(si, qi) * 620);
      const newEmp = Math.round(1800 + seeded(qi + si, 9) * 6200);
      rows.push([q, st, formalized, uplift, newEmp]);
    }));
    return { headers: ['Quarter', 'State', 'Formalized Workers (Cr)', 'Est. Wage Uplift (₹ Cr)', 'New Employer Registrations'], rows };
  }

  function genSector() {
    const rows = [];
    SECTOR_LIST.forEach((sec, sci) => ALL_STATES.forEach((st, si) => {
      const current = Math.round((900000 + si * 180000 + sci * 240000) * (0.8 + seeded(si, sci) * 0.5));
      const prev = Math.round(current / (1 + (0.04 + seeded(sci, si) * 0.35)));
      const growth = Math.round((current - prev) / prev * 1000) / 10;
      rows.push([sec, st, current, prev, growth]);
    }));
    return { headers: ['Sector', 'State', 'Current Workers', 'Previous Year', 'YoY Growth %'], rows };
  }

  function genMigration() {
    const origins = ['Bihar', 'Uttar Pradesh', 'Odisha', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Uttarakhand'];
    const dests = ['Maharashtra', 'Delhi NCR', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Andhra Pradesh'];
    const seasons = ['Year-round', 'Oct - Mar', 'Nov - Apr', 'Jun - Sep', 'Dec - Feb'];
    const rows = [];
    let i = 0;
    origins.forEach((o, oi) => dests.forEach((d, di) => {
      if (o === d) return;
      i++;
      const workers = Math.round((60000 + oi * 9000 + di * 4000) * (0.6 + seeded(oi, di) * 0.8));
      rows.push([o, d, workers, SECTOR_LIST[(oi + di) % SECTOR_LIST.length], seasons[(oi * 3 + di) % seasons.length]]);
    }));
    rows.sort((a, b) => b[2] - a[2]);
    return { headers: ['Origin State', 'Destination State', 'Workers (est.)', 'Dominant Sector', 'Peak Season'], rows: rows.slice(0, 100) };
  }

  // ---- LMIS indicator-framework generators (Maharashtra LMIS Indicator Checklist) ----
  function genLfprWpr() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const lfpr = Math.round((52 + seeded(si, di) * 22) * 10) / 10;
      const wpr = Math.round((lfpr * (0.82 + seeded(di, si) * 0.14)) * 10) / 10;
      const unemp = Math.round(((lfpr - wpr) / lfpr * 100) * 10) / 10;
      const maleLfpr = Math.round((lfpr * (1.15 + seeded(si + di, 3) * 0.1)) * 10) / 10;
      const femaleLfpr = Math.round(Math.max(18, lfpr * 2 - maleLfpr) * 10) / 10;
      rows.push([st, st + ' ' + d, lfpr, wpr, unemp, maleLfpr, femaleLfpr]);
    }));
    return { headers: ['State', 'District', 'LFPR %', 'WPR %', 'Unemployment Rate %', 'Male LFPR %', 'Female LFPR %'], rows };
  }

  function genFormalInformal() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => {
      const formal = Math.round((22 + seeded(si, di) * 45) * 10) / 10;
      const organised = Math.round((formal * (0.85 + seeded(di, si) * 0.2)) * 10) / 10;
      rows.push([st, st + ' ' + d, formal, Math.round((100 - formal) * 10) / 10, Math.min(99.9, organised), Math.round((100 - Math.min(99.9, organised)) * 10) / 10]);
    }));
    return { headers: ['State', 'District', 'Formal Employment %', 'Informal Employment %', 'Organised Sector %', 'Unorganised Sector %'], rows };
  }

  function genInformalSubsector() {
    const SUB = ['Construction', 'Farm Labour', 'Gig & Platform Work', 'Domestic Work', 'Other Informal'];
    const rows = [];
    SUB.forEach((sub, subi) => ALL_STATES.forEach((st, si) => {
      const headcount = Math.round((40000 + si * 8200 + subi * 6100) * (0.7 + seeded(subi, si) * 0.6));
      const pf = Math.round(8 + seeded(si, subi) * 30);
      const esic = Math.round(6 + seeded(subi, si) * 28);
      rows.push([sub, st, headcount, pf, esic]);
    }));
    return { headers: ['Informal Sub-sector', 'State', 'Headcount', 'PF Coverage %', 'ESIC Coverage %'], rows };
  }

  function genGradOutcome() {
    const STREAMS = ['Economics', 'Engineering', 'Commerce', 'Arts', 'Science', 'Agriculture', 'Law', 'Management'];
    const rows = [];
    STREAMS.forEach((stream, sti) => SECTOR_LIST.forEach((sec, sci) => {
      const placed = Math.round((800 + sti * 220 + sci * 140) * (0.6 + seeded(sti, sci) * 0.7));
      const pct = Math.round((6 + seeded(sci, sti) * 34) * 10) / 10;
      rows.push([stream, sec, placed, pct]);
    }));
    // pad to 100+ rows with an additional state cut for the top 3 streams
    STREAMS.slice(0, 5).forEach((stream, sti) => ALL_STATES.slice(0, 15).forEach((st, si) => {
      const placed = Math.round((300 + sti * 90 + si * 40) * (0.6 + seeded(sti, si) * 0.7));
      rows.push([stream, st, placed, Math.round((5 + seeded(si, sti) * 20) * 10) / 10]);
    }));
    return { headers: ['Graduation Stream', 'First-Employment Sector/State', 'Placed (count)', 'Share of Stream %'], rows };
  }

  function genItiPlacement() {
    const COURSES = ['Electrician', 'Fitter', 'Welder', 'Plumber', 'CNC Machinist', 'Mechanic (Diesel)', 'COPA', 'Draughtsman (Civil)'];
    const rows = [];
    COURSES.forEach((course, ci) => ALL_STATES.forEach((st, si) => {
      const placementRate = Math.round((38 + seeded(ci, si) * 48) * 10) / 10;
      const mismatch = Math.round((6 + seeded(si, ci) * 26) * 10) / 10;
      const trained = Math.round((600 + ci * 140 + si * 60) * (0.7 + seeded(ci, si) * 0.5));
      rows.push([course, st, trained, placementRate, mismatch]);
    }));
    return { headers: ['ITI/NSDC Course', 'State', 'Candidates Trained', 'Placement Rate % (within 6mo)', 'Skill-Mismatch Rate %'], rows };
  }

  function genWageDistribution() {
    const GENDERS = ['Male', 'Female'];
    const SKILLS = ['Unskilled', 'Semi-skilled', 'Skilled'];
    const rows = [];
    SECTOR_LIST.forEach((sec, sci) => GENDERS.forEach((g, gi) => SKILLS.forEach((sk, ski) => {
      const base = 9000 + sci * 2600 + ski * 5200 - gi * 1400;
      const median = Math.round(base * (0.9 + seeded(sci + ski, gi) * 0.25));
      const mean = Math.round(median * (1.04 + seeded(gi, ski) * 0.1));
      rows.push([sec, g, sk, median, mean]);
    })));
    // extend with a state cut of the overall skilled-worker median for 100+ rows
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const median = Math.round((12000 + si * 900 + sci * 2400) * (0.85 + seeded(si, sci) * 0.3));
      rows.push([sec, st, 'All', median, Math.round(median * 1.05)]);
    }));
    return { headers: ['Sector', 'Gender / State', 'Skill Level', 'Median Wage (₹/mo)', 'Mean Wage (₹/mo)'], rows };
  }

  function genVerifiedIncome() {
    const rows = [];
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const avgIncome = Math.round((11000 + si * 850 + sci * 2100) * (0.85 + seeded(si, sci) * 0.3));
      const reverifyPct = Math.round((72 + seeded(sci, si) * 25) * 10) / 10;
      const holders = Math.round((18000 + si * 4200 + sci * 3100) * (0.7 + seeded(si + sci, 4) * 0.5));
      rows.push([st, sec, holders, avgIncome, reverifyPct]);
    }));
    return { headers: ['State', 'Sector', 'Verified WIN ID Holders', 'Avg. Verified Income (₹/mo)', '14-Day Re-verification Compliance %'], rows };
  }

  function genMigrantGap() {
    const rows = [];
    ALL_STATES.forEach((st, si) => SECTOR_LIST.forEach((sec, sci) => {
      const enrolled = Math.round((20000 + si * 3800 + sci * 2600) * (0.7 + seeded(si, sci) * 0.5));
      const unregisteredPct = Math.round((14 + seeded(sci, si) * 38) * 10) / 10;
      const portabilityPct = Math.round((100 - unregisteredPct) * (0.55 + seeded(si, sci) * 0.3) * 10) / 10;
      rows.push([st, sec, enrolled, unregisteredPct, portabilityPct]);
    }));
    return { headers: ['Source State', 'Sector', 'Enrolled Migrant WIN ID Holders', 'BOCW/e-Shram Unregistered %', 'Benefit-Portability Eligible %'], rows };
  }

  function genVacancyIndex() {
    const rows = [];
    ALL_STATES.forEach((st, si) => DISTRICT_SEED.forEach((d, di) => SECTOR_LIST.slice(0, 3).forEach((sec, sci) => {
      const vacancies = Math.round((80 + si * 22 + di * 14 + sci * 30) * (0.6 + seeded(si + di, sci) * 0.8));
      const change = Math.round((seeded(di, sci) * 24 - 8) * 10) / 10;
      rows.push([st, st + ' ' + d, sec, vacancies, change]);
    })));
    return { headers: ['State', 'District', 'Sector', 'Open Vacancies', 'YoY Change %'], rows };
  }

  // ---- realistic, extensive (100+ row) CSV/Excel/PDF payloads keyed by report id ----
  const REPORT_DATA = {
    'emp-monthly': genEmpMonthly(),
    grievance: genGrievance(),
    demographics: genDemographics(),
    compliance: genCompliance(),
    economic: genEconomic(),
    sector: genSector(),
    migration: genMigration(),
    'lfpr-wpr': genLfprWpr(),
    'formal-informal': genFormalInformal(),
    'informal-subsector': genInformalSubsector(),
    'grad-outcome': genGradOutcome(),
    'iti-placement': genItiPlacement(),
    'wage-distribution': genWageDistribution(),
    'verified-income': genVerifiedIncome(),
    'migrant-gap': genMigrantGap(),
    'vacancy-index': genVacancyIndex(),
  };

  // ---- scheduled queue (mutable so "Run now" changes state) ----
  const SCHED = [
    { id: 's1', repId: 'emp-monthly', title: 'December Monthly Summary', due: 'Dec 1, 2024',  status: 'Scheduled' },
    { id: 's2', repId: 'grievance',   title: 'Grievance Bi-weekly #24',  due: 'Nov 30, 2024', status: 'In Progress' },
    { id: 's3', repId: 'compliance',  title: 'Weekly Compliance Check',   due: 'Nov 25, 2024', status: 'Scheduled' },
  ];

  // ---- live quick-stats (mutable so generate/download move the numbers) ----
  const STATS = { generated: 24, downloads: 1247, avg: '2.4 min' };

  const SECTION_FILTERS = [{ key: 'All', title: 'All' }].concat(SECTIONS.map(s => ({ key: s.key, title: s.title.replace(/^\d+\.\s*/, '') })));
  const PERIODS = ['This month (Nov 2024)', 'Last month (Oct 2024)', 'Q3 FY 2024–25', 'FY 2024–25 (YTD)', 'Custom range…'];

  // ---- view state ----
  const S = { cat: 'All', state: 'All' };
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  // ---- generate-report modal body (reused by header CTA + per-card generate) ----
  function genFormHtml(preType) {
    const typeOpts = REPORTS.map(r => `<option value="${r.id}" ${preType === r.id ? 'selected' : ''}>${App.esc(r.title)}</option>`).join('')
      + `<option value="custom" ${preType === 'custom' ? 'selected' : ''}>Custom / ad-hoc data extract</option>`;
    const periodOpts = PERIODS.map((p, i) => `<option ${i === 0 ? 'selected' : ''}>${App.esc(p)}</option>`).join('');
    const chips = ['Summary tables', 'Charts', 'State breakdown', 'Raw data'];
    return `
      <div id="grGenForm">
        <p class="muted" style="font-size:13px;margin-bottom:18px">Compile a report from the live WiN registry. This is a demo export — nothing leaves the prototype.</p>
        <div class="field"><label class="label">Report type</label>
          <select class="select" id="grType">${typeOpts}</select></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Reporting period</label>
            <select class="select" id="grPeriod">${periodOpts}</select></div>
          <div class="field"><label class="label">Format</label>
            <select class="select" id="grFmt"><option>PDF summary</option><option>Excel (.xlsx)</option><option>CSV data extract</option></select></div>
        </div>
        <div class="field" style="margin-bottom:0"><label class="label">Include sections</label>
          <div class="row gap-8 wrap" style="margin-top:4px">
            ${chips.map(c => `<span class="chip">${App.icon('check')} ${App.esc(c)}</span>`).join('')}
          </div></div>
      </div>`;
  }

  // narrow a report's rows to the header page's selected state, when that report has a
  // State column and a state is selected — otherwise every row is kept unchanged.
  function stateFilteredRows(headers, rows) {
    const idx = headers.indexOf('State');
    if (idx === -1 || S.state === 'All') return rows;
    return rows.filter(r => r[idx] === S.state);
  }

  // actually trigger a real file download for a report (falls back to a registry-overview
  // extract for the ad-hoc "custom" type, which has no fixed dataset). fmt is one of the
  // format labels used across the console ("PDF summary" / "Excel (.xlsx)" / "CSV data extract").
  function downloadReportCSV(rep, fmt) {
    const data = REPORT_DATA[rep.id];
    if (data) {
      App.downloadReport('win-' + rep.id + '-report', rep.title || rep.id, data.headers, stateFilteredRows(data.headers, data.rows), fmt || 'CSV');
    } else {
      App.downloadReport('win-custom-extract', 'Custom extract',
        ['Report', 'Category', 'Frequency', 'Last generated'],
        REPORTS.map(r => [r.title, r.section, r.freq, r.last]), fmt || 'CSV');
    }
  }

  window.GovReports = {
    setCat(c) { S.cat = c; App.reload(); },
    setState(v) { S.state = v; App.reload(); },

    // open the generate flow (optionally pre-selecting a report type)
    generate(preType) {
      App.modal.open(genFormHtml(preType || ''), {
        title: 'Generate report', icon: 'chart',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" id="grGenBtn" onclick="GovReports.runGenerate()">${App.icon('bolt')} Generate report</button>`,
      });
    },

    // simulate the compile, then toast + bump stats
    runGenerate() {
      const type = val('grType'), period = val('grPeriod'), fmt = (val('grFmt') || 'PDF').split(' ')[0];
      const rep = REPORTS.find(r => r.id === type);
      const name = rep ? rep.title : 'Custom extract';
      const btn = document.getElementById('grGenBtn');
      if (btn) { btn.disabled = true; btn.style.opacity = '.55'; btn.style.pointerEvents = 'none'; }
      const form = document.getElementById('grGenForm');
      if (form) {
        form.innerHTML = `
          <div class="gr-gen">
            <div class="gr-gen__ic">${App.icon('chart')}</div>
            <b style="font-size:15px">${App.esc(name)}</b>
            <div class="muted" style="font-size:12.5px;margin:4px 0 16px">${App.esc(period)} · ${App.esc(fmt)}</div>
            <div class="bar" style="height:9px"><div class="bar__fill" id="grBar" style="width:6%"></div></div>
            <div class="mono faint" id="grStep" style="font-size:11.5px;margin-top:10px">Querying the WiN registry…</div>
          </div>`;
        requestAnimationFrame(() => { const f = document.getElementById('grBar'); if (f) f.style.width = '100%'; });
        setTimeout(() => { const s = document.getElementById('grStep'); if (s) s.textContent = 'Aggregating & rendering ' + fmt + '…'; }, 550);
      }
      setTimeout(() => {
        STATS.generated += 1;
        STATS.downloads += 1;
        if (rep) { rep.last = 'Nov 17, 2024'; downloadReportCSV(rep); } else { downloadReportCSV({ id: 'custom' }); }
        App.modal.close();
        App.toast(name + ' generated & downloaded', 'download');
        App.reload();
      }, 1350);
    },

    // show a data preview + format picker before the actual download fires
    download(id) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      const data = REPORT_DATA[rep.id];
      const headers = data ? data.headers : ['Report', 'Category', 'Frequency', 'Last generated'];
      const allRows = stateFilteredRows(headers, data ? data.rows : REPORTS.map(r => [r.title, r.section, r.freq, r.last]));
      const sample = allRows.slice(0, 50);
      const thead = '<tr>' + headers.map(h => `<th>${App.esc(h)}</th>`).join('') + '</tr>';
      const tbody = sample.map(r => '<tr>' + r.map(c => `<td>${App.esc(c)}</td>`).join('') + '</tr>').join('');
      const stateNote = (headers.indexOf('State') !== -1 && S.state !== 'All') ? ` filtered to <b>${App.esc(S.state)}</b>` : '';
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:12px">Preview of <b>${App.esc(rep.title)}</b>${stateNote} — <span class="num">${App.num(allRows.length)}</span> total rows. Showing the first ${sample.length}:</p>
        <div class="tablewrap tablewrap--scroll" style="max-height:280px;overflow:auto">
          <table class="tbl"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
        </div>
        <div class="row gap-10 wrap mt-16">
          <button class="btn btn--primary" onclick="GovReports.confirmDownload('${rep.id}','CSV')">${App.icon('download')} Download CSV</button>
          <button class="btn" onclick="GovReports.confirmDownload('${rep.id}','Excel')">${App.icon('chart')} Download Excel</button>
          <button class="btn" onclick="GovReports.confirmDownload('${rep.id}','PDF')">${App.icon('doc')} Download PDF</button>
        </div>
      `, {
        title: 'Preview & Download', icon: 'download', wide: true,
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>`
      });
    },

    // fires the real file download once a format button is clicked
    confirmDownload(id, fmt) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      STATS.downloads += 1;
      downloadReportCSV(rep, fmt || 'CSV');
      App.modal.close();
      App.toast(rep.title + ' downloaded as ' + fmt, 'download');
      App.reload();
    },

    // preview a report's contents (detail modal) with a working download
    preview(id) {
      const rep = REPORTS.find(r => r.id === id);
      if (!rep) return;
      const c = CAT_C[rep.section] || 'var(--accent)';
      const sectionMeta = SECTIONS.find(s => s.key === rep.section);
      const includes = ['Executive summary', 'Registry aggregates', 'State-level breakdown', 'Trend charts & YoY deltas', 'Source-verification audit trail'];
      App.modal.open(`
        <div class="row gap-12" style="align-items:flex-start;margin-bottom:16px">
          <div class="gr-tile" style="background:${c}1a;color:${c};width:44px;height:44px">${App.icon(rep.ic)}</div>
          <div class="grow">
            <div class="row gap-8 wrap" style="align-items:center"><span class="tag" style="background:${c}1a;color:${c}">${App.esc(sectionMeta ? sectionMeta.title.replace(/^\d+\.\s*/, '') : 'Report')}</span>${App.ui.pill(rep.freq, 'gray')}</div>
            <p class="muted" style="font-size:13px;margin-top:9px;line-height:1.55">${App.esc(rep.desc)}</p>
          </div>
        </div>
        <div class="statstrip mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Last generated</div><div class="statstrip__val num" style="font-size:16px">${App.esc(rep.last)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">File size</div><div class="statstrip__val num" style="font-size:16px">${App.esc(rep.size)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Cadence</div><div class="statstrip__val" style="font-size:16px">${App.esc(rep.freq)}</div></div>
        </div>
        <div class="section-title" style="font-size:13.5px">What's inside</div>
        <div class="list--divided">
          ${includes.map(x => `<div class="row gap-10" style="align-items:center;padding:9px 0;font-size:13.5px">${App.icon('filecheck')}<span>${App.esc(x)}</span></div>`).join('')}
        </div>
      `, {
        title: rep.title, icon: rep.ic,
        foot: `<button class="btn" onclick="App.modal.close();GovReports.generate('${rep.id}')">${App.icon('bolt')} Regenerate</button>
               <button class="btn btn--primary" onclick="App.modal.close();GovReports.download('${rep.id}')">${App.icon('download')} Download ${App.esc(rep.size)}</button>`,
      });
    },

    // run a queued/scheduled report now
    runScheduled(id) {
      const item = SCHED.find(x => x.id === id);
      if (!item || item.status === 'Completed') return;
      item.status = 'In Progress';
      App.reload();
      App.toast('Running “' + item.title + '”…', 'clock');
      setTimeout(() => {
        item.status = 'Completed';
        STATS.generated += 1;
        const rep = REPORTS.find(r => r.id === item.repId);
        if (rep) downloadReportCSV(rep);
        App.toast(item.title + ' ready & downloaded', 'checkcircle');
        App.reload();
      }, 1400);
    },

    // schedule a new recurring report
    scheduleNew() {
      const typeOpts = REPORTS.map(r => `<option value="${r.id}">${App.esc(r.title)}</option>`).join('');
      App.modal.open(`
        <p class="muted" style="font-size:13px;margin-bottom:18px">Add a report to the automated queue. It'll compile on the chosen cadence and land here for download.</p>
        <div class="field"><label class="label">Report type</label>
          <select class="select" id="grSchType">${typeOpts}</select></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label class="label">Cadence</label>
            <select class="select" id="grSchFreq"><option>Weekly</option><option>Bi-weekly</option><option selected>Monthly</option><option>Quarterly</option></select></div>
          <div class="field"><label class="label">First run</label>
            <select class="select" id="grSchDue"><option>Dec 1, 2024</option><option>Dec 15, 2024</option><option>Jan 1, 2025</option></select></div>
        </div>
      `, {
        title: 'Schedule report', icon: 'calendar',
        foot: `<button class="btn" onclick="App.modal.close()">Cancel</button>
               <button class="btn btn--primary" onclick="GovReports.addScheduled()">${App.icon('plus')} Add to queue</button>`,
      });
    },
    addScheduled() {
      const rep = REPORTS.find(r => r.id === val('grSchType')) || REPORTS[0];
      const due = val('grSchDue') || 'Dec 1, 2024';
      SCHED.unshift({ id: 's' + (SCHED.length + 1) + '-' + Date.now(), repId: rep.id, title: rep.title, due, status: 'Scheduled' });
      App.modal.close();
      App.toast(rep.title + ' scheduled for ' + due, 'calendar');
      App.reload();
    },
  };

  App.registerView('gov-reports', {
    title: 'Reports',
    subtitle: 'Generate and download analytical reports',
    render() {
      // ---- editorial hero ----
      const hero = `
        <div class="hero reveal">
          <div class="hero__wash"></div>
          <div class="hero__in">
            <div class="row between wrap gap-16" style="align-items:flex-start">
              <div>
                <div class="eyebrow">${App.icon('chart')} Registry reports</div>
                <h1 class="h-grad" style="margin-top:12px">Turn the registry into decisions.</h1>
                <p class="lead">Generate, schedule and download analytical reports across enrollment, grievances, compliance and economic impact — straight from live WiN data.</p>
              </div>
              <div class="row gap-10">
                <button class="btn" onclick="GovReports.scheduleNew()">${App.icon('calendar')} Schedule</button>
                <button class="btn btn--accent" onclick="GovReports.generate()">${App.icon('chart')} Custom report</button>
              </div>
            </div>
          </div>
        </div>`;

      // ---- live quick-stats strip ----
      const strip = `
        <div class="statstrip reveal mb-20">
          <div class="statstrip__cell"><div class="statstrip__label">Reports generated (MTD)</div><div class="statstrip__val num">${App.num(STATS.generated)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Total downloads</div><div class="statstrip__val num">${App.num(STATS.downloads)}</div></div>
          <div class="statstrip__cell"><div class="statstrip__label">Avg. generation time</div><div class="statstrip__val num">${App.esc(STATS.avg)}</div></div>
        </div>`;

      // ---- library: category segmented filter + state filter (narrows the data behind
      // Download for any report with a State column — see stateFilteredRows()) ----
      const govStates = (window.DB && DB.govStates) || [];
      const stateOptions = ['<option value="All">All States</option>'].concat(
        govStates.map(n => `<option value="${App.esc(n)}" ${S.state === n ? 'selected' : ''}>${App.esc(n)}</option>`)
      ).join('');
      const seg = `
        <div class="row between wrap gap-12" style="align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">Available reports</div>
          <div class="row gap-10 wrap" style="align-items:center">
            <div class="gr-selwrap">${App.icon('filter')}
              <select class="select gr-sel" onchange="GovReports.setState(this.value)" aria-label="Filter report data by state">${stateOptions}</select>
            </div>
            <div class="seg gr-seg">
              ${SECTION_FILTERS.map(f => `<button class="${S.cat === f.key ? 'is-active' : ''}" onclick="GovReports.setCat('${f.key}')">${App.esc(f.title)}</button>`).join('')}
            </div>
          </div>
        </div>`;

      // ---- report library, grouped by LMIS section (each with its own header + description) ----
      function reportCard(r) {
        const c = CAT_C[r.section] || 'var(--accent)';
        const provenance = r.verifiedVia ? `
          <div class="gr-prov">
            <div class="gr-prov__row"><b>${App.icon('shieldcheck')} Verified via WIN ID</b><span>${App.esc(r.verifiedVia)}</span></div>
            <div class="gr-prov__row"><b>${App.icon('layers')} Triangulated with</b><span class="row gap-6 wrap">${r.triangulate.map(t => `<span class="src-chip">${App.esc(t)}</span>`).join('')}</span></div>
          </div>` : '';
        return `
          <div class="card card--hover gr-card reveal" onclick="GovReports.preview('${r.id}')" role="button" tabindex="0"
               onkeydown="if(event.key==='Enter'){GovReports.preview('${r.id}')}">
            <div class="card__body">
              <div class="row between" style="align-items:flex-start;margin-bottom:14px">
                <div class="gr-tile" style="background:${c}1a;color:${c}">${App.icon(r.ic)}</div>
                ${App.ui.pill(r.freq, 'gray')}
              </div>
              <b style="font-size:15.5px;display:block;line-height:1.25">${App.esc(r.title)}</b>
              <p class="muted" style="font-size:12.8px;margin-top:6px;line-height:1.5">${App.esc(r.desc)}</p>
              ${provenance}
              <div class="row gap-16 wrap gr-meta">
                <span class="row gap-6">${App.icon('clock')}<span>Last · <b class="num" style="color:var(--ink-2)">${App.esc(r.last)}</b></span></span>
                <span class="row gap-6">${App.icon('file')}<span class="num">${App.esc(r.size)}</span></span>
              </div>
            </div>
            <div class="gr-foot">
              <button class="btn btn--soft btn--sm gr-dl" onclick="event.stopPropagation();GovReports.download('${r.id}')">${App.icon('download')} Download</button>
              <span class="gr-open">Open ${App.icon('arrow')}</span>
            </div>
          </div>`;
      }

      const visibleSections = SECTIONS.filter(s => S.cat === 'All' || S.cat === s.key);
      const cards = visibleSections.map(s => {
        const reps = REPORTS.filter(r => r.section === s.key);
        if (!reps.length) return '';
        return `
          <div class="gr-section reveal">
            <div class="gr-section__head">
              <div class="gr-tile" style="background:${s.c}1a;color:${s.c}">${App.icon(s.ic)}</div>
              <div class="grow"><h3 style="margin:0">${App.esc(s.title)}</h3><p class="muted" style="font-size:12.5px;margin:2px 0 0">${App.esc(s.desc)}</p></div>
              <span class="faint" style="font-size:12px">${reps.length} report${reps.length === 1 ? '' : 's'}</span>
            </div>
            <div class="grid grid-3 gr-lib">${reps.map(reportCard).join('')}</div>
          </div>`;
      }).join('') || `<div class="card reveal mb-20">${App.ui.empty('file', 'No reports in this section', 'Try another filter or generate a custom report.')}</div>`;

      // ---- scheduled queue ----
      const schedRows = SCHED.map(s => {
        const done = s.status === 'Completed';
        const busy = s.status === 'In Progress';
        return `
        <div class="minirow">
          <div class="gr-tile gr-tile--sm ${done ? 'gr-tile--done' : ''}">${App.icon(done ? 'checkcircle' : busy ? 'clock' : 'calendar')}</div>
          <div class="grow">
            <b style="font-size:13.8px">${App.esc(s.title)}</b>
            <div class="muted" style="font-size:12px;margin-top:2px">Due ${App.esc(s.due)}</div>
          </div>
          ${App.ui.statusPill(s.status)}
          ${done
            ? `<button class="btn btn--soft btn--sm" onclick="GovReports.download('${s.repId}')">${App.icon('download')} Get</button>`
            : `<button class="btn btn--sm" ${busy ? 'disabled style="opacity:.55"' : ''} onclick="GovReports.runScheduled('${s.id}')">${App.icon('bolt')} Run now</button>`}
        </div>`;
      }).join('');
      const schedCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('clock')}<h3 class="grow">Scheduled reports</h3>
            <button class="btn btn--ghost btn--sm" onclick="GovReports.scheduleNew()">${App.icon('plus')} New</button></div>
          <div class="card__body" style="padding-top:2px;padding-bottom:6px"><div class="list--divided">${schedRows}</div></div>
        </div>`;

      // ---- helper / assurance card ----
      const aboutCard = `
        <div class="card reveal">
          <div class="card__head">${App.icon('shieldcheck')}<h3 class="grow">About these reports</h3></div>
          <div class="card__body">
            <p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:14px">Every report is compiled from source-verified WiN records (EPFO, Income Tax, ESIC, GSTN, Aadhaar). Exports are aggregated and de-identified in line with the DPDP Act, 2023.</p>
            <div class="row gap-8 wrap">
              ${['EPFO', 'Income Tax', 'ESIC', 'GSTN', 'e-Shram'].map(s => `<span class="src-chip">${App.icon('database')} ${App.esc(s)}</span>`).join('')}
            </div>
            <div class="banner banner--accent" style="margin-top:16px;align-items:center">${App.icon('lock')}<div>Aggregated exports only — no individual worker record leaves the registry.</div></div>
            <div class="banner banner--info" style="margin-top:10px;align-items:flex-start">${App.icon('help')}<div><b>Note on scope</b> — Employer hiring intent (forward-looking recruitment plans) is intentionally not reported here: WIN ID verifies realised, consent-based employment, not forward-looking intent. That indicator is better sourced from periodic employer surveys.</div></div>
          </div>
        </div>`;

      // ---- scoped styles ----
      const style = `<style>
        .gr-selwrap{ position:relative; display:inline-flex; align-items:center; }
        .gr-selwrap .ico{ position:absolute; left:11px; color:var(--muted); pointer-events:none; }
        .gr-sel{ padding-left:34px; min-width:160px; font-weight:600; }
        .gr-seg button{ white-space:nowrap; }
        .gr-tile{ width:40px; height:40px; border-radius:var(--r-sm); display:grid; place-items:center; flex-shrink:0; }
        .gr-tile--sm{ width:34px; height:34px; background:var(--accent-weak); color:var(--accent-strong); }
        .gr-tile--done{ background:var(--green-50); color:var(--green-700); }
        .gr-card{ display:flex; flex-direction:column; cursor:pointer; padding:0; }
        .gr-card .card__body{ flex:1; }
        .gr-meta{ margin-top:16px; padding-top:13px; border-top:1px solid var(--line-2); font-size:12px; color:var(--muted); }
        .gr-meta .ico{ width:14px; height:14px; color:var(--faint); }
        .gr-meta .row{ align-items:center; }
        .gr-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 18px; border-top:1px solid var(--line-2); background:var(--surface-2); }
        .gr-open{ display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; color:var(--accent-strong); opacity:0; transform:translateX(-4px); transition:.16s; }
        .gr-open .ico{ width:14px; height:14px; }
        .gr-card:hover .gr-open{ opacity:1; transform:translateX(0); }
        .gr-gen{ text-align:center; padding:14px 6px 6px; }
        .gr-gen__ic{ width:52px; height:52px; margin:0 auto 12px; border-radius:var(--r); display:grid; place-items:center; background:var(--accent-weak); color:var(--accent-strong); }
        .gr-gen__ic .ico{ width:24px; height:24px; }
        .gr-btm{ display:grid; grid-template-columns:1.15fr .85fr; gap:20px; align-items:start; }
        .gr-section{ margin-bottom:22px; }
        .gr-section__head{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .gr-prov{ margin-top:12px; padding-top:11px; border-top:1px solid var(--line-2); display:flex; flex-direction:column; gap:8px; }
        .gr-prov__row{ font-size:11.5px; line-height:1.5; }
        .gr-prov__row b{ display:flex; align-items:center; gap:5px; font-size:10.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); margin-bottom:3px; }
        .gr-prov__row b .ico{ width:12px; height:12px; }
        .gr-prov__row span{ color:var(--ink-2); }
        @media (max-width:960px){ .gr-lib{ grid-template-columns:repeat(2,1fr); } .gr-btm{ grid-template-columns:1fr; } }
        @media (max-width:600px){ .gr-lib{ grid-template-columns:1fr; } .gr-seg{ overflow-x:auto; max-width:100%; } }
      </style>`;

      return `<div class="page page--wide fade-in">
        ${style}
        ${hero}
        ${strip}
        ${seg}
        ${cards}
        <div class="gr-btm">
          ${schedCard}
          ${aboutCard}
        </div>
      </div>`;
    }
  });
})();
