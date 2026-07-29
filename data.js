/* ============================================================
   WiN — shared demo data
   Per-screen content lives in each view module (like the original app).
   This file holds only cross-cutting data: signed-in profiles,
   notifications, and a few shared constants.
   ============================================================ */
window.DB = {
  // signed-in identity per persona (shown in the sidebar / topbar)
  profiles: {
    worker: {
      name: 'Rajan Kumar', subtitle: 'Masonry Expert', winId: 'WIN-2024-8834-1029',
      role: 'Construction Worker', location: 'Delhi NCR', verificationScore: 100, phone: '+91 98••• ••••9',
    },
    employer: {
      name: 'Priya Nair', subtitle: 'Aditya Birla Construction Ltd.', role: 'Head — People Operations',
      org: 'Aditya Birla Construction Ltd.', sector: 'Construction & Infrastructure', email: 'hr@abconstruction.in',
    },
    gov: {
      name: 'R. Deshmukh', subtitle: 'Commissioner of Labour', role: 'Ministry of Labour & Employment',
      dept: 'Ministry of Labour & Employment', email: 'commissioner@labour.mh.gov.in',
    },
  },

  // topbar notification bell
  notifications: [
    { icon: 'shieldcheck', title: 'ESIC renewal approved', body: 'Your ESIC renewal (req #10389) has been approved.', when: '2m' },
    { icon: 'idcard', title: 'Profile verification request', body: 'SBI is asking to verify your WiN profile.', when: '1h' },
    { icon: 'graduation', title: 'New course available', body: 'Structural Repair certification starts Apr 25.', when: '3h' },
  ],

  // the seven source systems WiN verifies against (used across views)
  sources: [
    { key: 'epfo', label: 'EPFO / UAN', color: '#2f5fd0' },
    { key: 'itd', label: 'Income Tax Dept', color: '#6b4fc7' },
    { key: 'esic', label: 'ESIC', color: '#0e9f6e' },
    { key: 'gstn', label: 'GSTN', color: '#c07d10' },
    { key: 'aadhaar', label: 'Aadhaar / UIDAI', color: '#d64545' },
    { key: 'digilocker', label: 'DigiLocker', color: '#2B3990' },
    { key: 'eshram', label: 'e-Shram', color: '#0d9488' },
  ],

  // shared HRMS-sync setup data — used by both the employer sign-up flow (core.js)
  // and the persistent HRMS Sync workspace page (views/emp-hrms.js), modelled on
  // Tartan's own HyperSync product (Data Transfer Method → HRMS Selection → Credentials)
  hrmsMethods: [
    { key: 'hrms', ic: 'plug', title: 'HRMS Integration', desc: 'Connect your HRMS for seamless, automated data transfer. Supports major platforms like SAP, Workday, BambooHR and more.' },
    { key: 'sftp', ic: 'database', title: 'SFTP Transfer', desc: 'Upload files securely via SFTP for automated ingestion. Scheduled pickups and encrypted file transfer included.' },
    { key: 'csv', ic: 'share', title: 'Upload CSV', desc: 'Quickly upload your data using CSV files. Download our template, fill in your data, and upload — simple and fast.' },
  ],
  // trimmed to a representative ~15 for the demo — "Other" in the search covers the rest
  hrmsPlatforms: [
    'GreytHR', 'Uknowva', 'Keka', 'SAP SuccessFactors', 'Zoho People', 'Beehive', 'DarwinBox',
    'ZingHR', 'FreshTeam', 'BambooHR', 'Paychex', 'PeopleStrong', 'SumHR', 'Odoo', 'HROne',
  ],
};
