# Feature coverage

| Area | Delivered workflow |
|---|---|
| Authentication | Login for all backend roles, patient registration, cookie refresh, logout, forgot/reset password, confirm/resend email |
| Dashboard | Role-specific cards, appointment activity, notification activity, honest unavailable-data state |
| Patients | Search, pagination, create/edit, status, details, image upload |
| Doctors | Search, pagination, create/edit, specialty/staff lookups, clinic assignment/removal, details |
| Clinics | Search, pagination, create/edit, contact/location/hours, active state |
| Staff | Search, pagination, create/edit, linked account option, roles, clinic, status |
| Specialties | Search, pagination, create/edit/delete, image |
| Appointments | List/filter/search/date, create, details, confirm, check-in, reschedule, cancel with reason, no-show, complete, start visit |
| Schedules | Doctor filter, create/edit/delete, Monday-first days, UTC hours, effective dates, availability |
| Time off | Add from schedules, view by doctor, delete |
| Visits | Patient history, chart details, clinical notes, completion |
| Clinical records | Add/edit/delete vital signs and diagnoses, unit/range validation |
| Medications | Search, pagination, create/edit, image, active status |
| Prescriptions | Doctor/patient history, medication-ID-based multi-item issue, dose/frequency/duration/route/quantity/instructions, status and print |
| Reviews | Patient review on eligible completed appointment, doctor/clinic feedback and aggregate ratings |
| Notifications | Paginated inbox, unread filter, mark one/all read, preferences |
| Users | Search, pagination, account details, active status, role replacement |
| Profile | Name/phone update, password change |

## Role rules

- Admin/Manager: operational directories and user administration, plus clinical tools where the backend allows them.
- Receptionist: patient registration and appointment coordination. No user-role administration or clinical prescriptions.
- Nurse: clinical chart/vitals/diagnoses and permitted appointment lifecycle tools. Cannot issue a doctor prescription without a doctor identity.
- Doctor: own appointment and prescription context, clinical charts, schedules and medication catalog. Creating an appointment uses patient ID where the API forbids the doctor's access to the full patient search directory.
- Patient: own care history/prescriptions/appointments, public-within-session directories, availability, feedback and settings. **No self-book/reschedule/cancel**, because the supplied backend expressly restricts these mutations to staff.

The server can reject actions based on record ownership or workflow state even when the role can see the tool. These errors are displayed, not bypassed.

## Scope limits

This covers the supplied API, not billing, insurance, inventory quantities, laboratory integrations, file attachments to visits, or payment features absent from the backend. Notification preference flags do not establish that every external channel is implemented. Directory lookup dropdowns load the first 100 records; server-side lookup search is a future scale improvement. UI language is English; Egyptian Arabic localization was not requested or implemented.
