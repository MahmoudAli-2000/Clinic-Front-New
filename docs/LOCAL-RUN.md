# Local run guide

## 1. Folder structure

Unzip the delivery archive. Keep `ClinicBack-New` and `Clinic-Front-New` side by side. Git patches are optional and can apply the changes to the original repository commits; the source folders already contain them.

## 2. Database

Install SQL Server, or use the supplied Docker Compose development stack. The original development connection uses Windows SQL Server LocalDB. On another platform configure `ConnectionStrings__Default` with a reachable SQL Server connection string. Do not use a real clinic database for the first run.

Startup applies EF migrations and inserts the existing demo seed. Check API logs: a process listening on a port does not prove database initialization succeeded.

## 3. Start the API

```sh
cd ClinicBack-New
dotnet restore ClinicBack.sln
dotnet run --project TourSite.APIs --launch-profile http
```

Open `http://localhost:5295/swagger`. Verify a directory request after login, not only the Swagger page. The original development admin email is `admin@clinic.local`; use the development password in the local appsettings file. Other seeded account emails include `manager@clinic.local`, `frontdesk@clinic.local`, `nurse@clinic.local`, `ahmed.doctor@clinic.local`, and `patient.one@clinic.local`. The seeder and Seed configuration define their development passwords. These are demo accounts, never production credentials.

## 4. Start Angular

```sh
cd Clinic-Front-New
npm ci
npm start
```

Open `http://localhost:4200`. Sign in once; the backend roles select the workspace. Registration creates a patient account and starts its cookie session.

## Troubleshooting

- **Cannot reach API / 502**: ensure API HTTP profile listens on 5295. Restart Angular after changing `proxy.conf.json`.
- **SQL login/network error**: verify SQL Server service, connection string, credentials and network reachability. The API may start despite a migration error, so read startup logs.
- **403**: this account does not have the backend role/record needed for the action. A doctor account needs linked staff and doctor records. A patient needs its linked patient record.
- **No schedule/availability**: assign a doctor to a clinic, create a matching weekday schedule, and check time off. Day convention is Monday=1 through Sunday=7. Schedule wall-clock times and availability dates are UTC. Returned slots and appointment timestamps display in the browser's local timezone.
- **Email not delivered**: configure SMTP and `FrontendUrl`. Saving email preferences does not configure a provider.
- **Deep-link refresh gives 404**: configure the web host's SPA fallback to index.html, as shown in nginx.conf.
- **Cookies fail after separate-domain deploy**: the supported default is same-origin reverse proxy. Do not switch to cross-site cookies without an explicit security/CORS review.
- **Docker on Apple Silicon**: SQL Server Linux images need a supported architecture. Use an external SQL Server if the local image cannot run.

## Production

Use HTTPS, a non-development environment, secret management and a properly configured same-origin reverse proxy. Replace demo seeding and keys, configure backups and auditing, review dependency licenses and vulnerabilities, and run tests against a staging SQL Server before real use.
