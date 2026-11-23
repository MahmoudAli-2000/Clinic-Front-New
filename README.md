# CarePoint Clinic frontend

Angular 17.3 clinic workspace, continued on the original standalone application structure. Every component keeps its TypeScript, HTML and CSS in separate files.

## Quick start

Prerequisites: Node.js 20 LTS recommended, npm, and the sibling .NET 8 clinic API with SQL Server.

```sh
npm ci
npm start
```

Start the backend separately:

```sh
cd ../ClinicBack-New
dotnet run --project TourSite.APIs --launch-profile http
```

Open `http://localhost:4200`. The development proxy forwards `/api` and `/images` to `http://localhost:5295`. No frontend mock data is used by the application. Test fixtures exist only in `tests/`.

For a Docker local stack, use the sibling backend's `compose.yaml`. Copy its `.env.example` to `.env`, replace placeholders, then `docker compose up --build` from `ClinicBack-New`.

## Build and test

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Production browser assets are in `dist/tour-site-client/browser`. Deploy behind a same-origin `/api` reverse proxy and enable SPA fallback. `nginx.conf` and `Dockerfile` provide a starting point. Backend configuration, SQL Server and SMTP are separate prerequisites, not bundled services inside Angular.

## Workspaces

One login supports Admin, Manager, Receptionist, Nurse, Doctor and Patient. Signed-in roles get `/admin`, `/staff`, `/doctor` or `/patient` layouts, filtered navigation and role-specific overview cards. The API remains authoritative for authorization.

Features include directories with create/edit/search/pagination, appointment lifecycle, doctor-clinic assignments, schedules/time off/availability, clinical charts/vitals/diagnoses, medication catalog, prescriptions, reviews, notifications/preferences, user roles/status, account settings and account recovery.

## Documentation

- [Run locally and troubleshoot](docs/LOCAL-RUN.md)
- [Architecture and editing guide](docs/ARCHITECTURE.md)
- [Feature coverage and permissions](docs/FEATURES.md)
- [Verification and limitations](docs/TESTING.md)
- [Delivery summary](docs/DELIVERY.md)

This is a source-code handoff, not certification for live medical use. Review backend security/dependency caveats before using real patient data.

Personal appearance added: light/dark/device mode, accent, density, corners, font and text size, persisted per authenticated account.
