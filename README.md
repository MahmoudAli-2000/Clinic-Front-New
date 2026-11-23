# Clinic Management System

This project is a clinic management platform with an ASP.NET Core API backend and an Angular frontend.

## Frontend
- Angular 17 application
- Responsive CarePoint workspace with role-specific navigation and overview screens
- Workspaces for Admin, Manager, Receptionist, Nurse, Doctor, and Patient
- Clinic data views for appointments, patients, doctors, clinics, schedules, specialties, and staff
- Patient-specific profile, visit history, and prescription views
- Route access checks based on backend roles
- Cookie-based session authentication with backend API

## Backend
- ASP.NET Core Web API on .NET 8
- Identity + role-based authorization
- Clinic entities for patients, doctors, staff, schedules, appointments, visits, prescriptions, and notifications
- SQL Server with Entity Framework Core migrations and seeding

## Local setup
1. Start the backend API from `Clinic Back/TourSite.APIs`:
   `dotnet run --project "TourSite.APIs/TourSite.APIs.csproj" --launch-profile http`
2. Start the frontend from `Clinic Front/Clinic Front`:
   `npm install`
   `npm start -- --host 0.0.0.0 --port 4200`
3. Open `http://localhost:4200`

## Default database connection
`Server=(localdb)\mssqllocaldb;Database=ClinicDb.Development;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True;`

## Seeded admin account
- Email: `admin@clinic.local`
- Password: `Admin@123`

## Roles supported by the backend
- Admin
- Manager
- Receptionist
- Nurse
- Doctor
- Patient

The Angular shell redirects unauthenticated users to `/admin/login` and uses the backend cookie-based auth as the source of truth for protected routes. The shared workspace layout adapts its navigation and dashboard actions to the signed-in user's backend role; the API remains authoritative for data access.
