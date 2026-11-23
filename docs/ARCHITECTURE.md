# Architecture and editing guide

## Existing structure preserved

- `src/app/adminCompoents`: existing feature folder (original spelling retained to avoid disruptive renames).
- `src/app/core/services`: HTTP/auth services and application state.
- `src/app/core/guards`: session and role route checks.
- `src/app/core/interceptors`: credentialed API requests and one shared refresh attempt for concurrent 401s.
- `src/app/layouts`: shared workspace shell plus explicit patient, doctor and staff layout components.
- `src/app/shared/entity-form`: reusable schema-driven form with separate component files.
- `src/app/app.routes.ts`: lazy route definitions and per-route allowed roles.

## Feature components

`clinic-page` handles searchable directories and appointment/schedule workflows. Its schema is `core/auth/resource-config.ts`, defining the real backend endpoint, editable fields, lookup sources, columns and write roles. Use this file to add a field to a directory without copying screens. Lookups currently load up to 100 records per related directory; larger deployments should replace these with server-search dropdowns.

`clinical-chart` handles real visit details, clinical notes, vital signs, diagnoses and multi-item medication prescriptions. `account-center` handles settings, notification preferences/inbox, prescription history/status, reviews and time off. `account-recovery` handles forgot/reset password and email confirmation.

## HTTP contracts

`WorkspaceApiService` is the shared transport for new workflows. It keeps query values separate from bodies and uses FormData only for the backend's multipart directory DTOs. Existing `ClinicApiService` remains for dashboard data and compatibility. Its known DTO mismatches were corrected.

Session authentication uses HttpOnly access/refresh cookies. No auth tokens are saved in browser localStorage. Route guards are usability controls; never trust them instead of server authorization.

## Styling

`src/styles.css` holds the CarePoint design system: cards, tables, buttons, alerts, dialogs, state pills, loading skeletons, reduced-motion support and mobile defaults. Feature CSS handles layout. Workspace CSS controls desktop sidebar and phone drawer. No inline Angular templates or styles were introduced.

Tables scroll inside their cards on phones instead of causing page-wide overflow. Forms collapse to one column. Dialogs are scrollable on small screens. Animations respect reduced-motion settings.

## Asset and legacy policy

Unused tourism images/video were removed from published assets (roughly 53 MB down to 112 KB). Legacy unreferenced tourism service source remains untouched so earlier project context is not silently lost. It is not routed into the clinic app. Global tourism CSS and the unused global Swiper stylesheet and unused AOS/Rellax/Swiper/legacy Angular Universal packages were removed from active output.
