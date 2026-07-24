# WiN · Workforce Identity Network — prototype

A clickable prototype of **WiN**, a verified "golden record" for every worker in India — unifying
employment, income and identity, verified at source against EPFO/UAN, Income-Tax, ESIC, GSTN, Aadhaar,
DigiLocker and e-Shram.

Rebuilt as a **no-build vanilla-JS single-page app** (no React, no bundler, no backend) so it deploys
to any static host with zero configuration. See [DEPLOY.md](DEPLOY.md).

## Three personas
Sign in from the landing screen as any of:

- **Worker** (green) — Aadhaar/DigiLocker OTP sign-in, verified portfolio, Diya assistant, jobs, skills,
  CV builder, courses, grievances.
- **Employer** (indigo) — workforce dashboard, employee verifications, hiring pipeline + NCS candidate
  discovery, API & docs.
- **Government** (dark/teal registry console) — national labour dashboard, demographics, enrollment,
  grievance management, compliance/risk vigilance, scheme push, reports.

The Worker OTP screen accepts any 10-digit number; Employer/Government sign-in accepts any credentials
(demo). You can also deep-link, e.g. `#/gov/gov-dashboard`.

## Structure
```
index.html        loads the app + registers every view
styles.css        design system (tokens, components, per-persona accent)
core.js           App runtime: router, shell, multi-persona login, modal/toast, assistant
data.js           shared demo data (signed-in profiles, notifications)
views/*.js         one self-registering module per screen (App.registerView)
```
All screen content is mock data for demonstration.
