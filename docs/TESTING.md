# Verification

## Results

- Angular optimized production build: passed.
- Browser workflow/responsive tests: 26 passed.
- ASP.NET API-host tests with isolated EF InMemory data: 8 passed.
- Visual inspection: actual desktop and phone screenshots reviewed after fixing transition rendering and 320px overflow.
- Tested phone/tablet/desktop widths: 320, 360, 390, 430, 768 and 1440 pixels.

## Repeat browser tests

```sh
npm ci
npm run build
npx playwright install chromium
npm run test:e2e
```

If using a system Chrome, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. Browser tests serve the production bundle and intercept API calls with backend-contract-shaped fixtures. They prove UI behavior and request shapes, not database persistence.

Covered: six role dashboards and layout redirects; patient denial from user administration; hidden staff mutation controls; multipart patient creation; Monday-first schedules; availability; clinical chart and prescription controls; notification/settings pages; recovery form; page overflow and screenshots across the six widths.

## Repeat API tests

```sh
cd ../ClinicBack-New
dotnet test Clinic.IntegrationTests/Clinic.IntegrationTests.csproj
```

These use the real middleware/controllers/auth/services with an isolated in-memory provider. They do not test SQL Server-specific behavior. The original Angular unit-test stubs are retained but are not claimed as validated; the new browser suite is the verified frontend test command.

## Not yet verified

SQL Server migrations and indexes, concurrent bookings under real SQL transaction isolation, Docker Compose startup, configured SMTP delivery, external notification providers, production deployment, and end-to-end interaction between the browser and a real SQL-backed API. A SQL-backed staging smoke test remains required before describing this as production-ready.

Build warning: Bootstrap's unused `.form-floating` selector is skipped by CSS optimization. This does not affect the clinic form components. npm's browser-baseline dataset warning is advisory. Angular 17 is retained to meet the existing project architecture; plan a separately tested framework upgrade for long-term support.

Dependency audit details: [DEPENDENCY-AUDIT.md](DEPENDENCY-AUDIT.md). Current production dependency audit after removing unused packages: 18 findings (2 critical, 11 high, 5 moderate). Do not deploy for real patient data before reviewing these.

Bilingual checkpoint: 33 browser tests pass, including locale switching, RTL width checks, public authentication translation, profile image and fallback. Backend now has 11 passing API host checks. See BILINGUAL-SETUP.md.

Final notification/motion checkpoint: 36 browser tests pass. Backend has 13 passing API-host tests. See NOTIFICATIONS-AND-MOTION.md for the follow-up migration and behavior.
