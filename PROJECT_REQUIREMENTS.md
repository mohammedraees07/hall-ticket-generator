# College Hall Ticket System — Target Requirements

## Purpose

This is an institutional examination workflow, not a public student-registration form. The college has an authoritative student register before an examination cycle opens. Every action must be attributable, durable in PostgreSQL, and protected on the server as well as in the user interface.

## Roles and ownership

| Role | Owns | Must not own |
| --- | --- | --- |
| Academic Records (currently `ADMIN`) | student and enrollment records, departments, courses, subjects, institutional settings | Accounts clearance decisions |
| Examination Staff (`STAFF`) | examinations, application windows, schedules, eligibility review, hall-ticket issue, seating | student identity changes and financial decisions |
| Accounts (`ACCOUNTS`) | fee clearance per examination application, including reason and decision time | student academic details, hall-ticket issue |
| Principal (`PRINCIPAL`) | exceptions only: waiver/condonation/rejection and signature configuration | ordinary application approval and Accounts work |
| Student (`STUDENT`) | their own application, photo/receipt upload, subject confirmation, own hall ticket | searching, reading, or editing any other student |
| Invigilator/public verifier | a minimal hall-ticket verification result | the student register or application data |

## Required business flow

1. Academic Records imports or creates an enrolled student. A student profile has a programme, semester, section and academic year.
2. Examination Staff creates an examination and then opens one application window for its target cohort. A window is never an orphan announcement: it references its examination.
3. Only a signed-in student who belongs to that cohort sees the open window. The server determines the student identity from Supabase Auth; it never accepts an arbitrary student ID or USN as proof of identity.
4. The student confirms registered subjects, reports arrears, and optionally supplies a current photo or payment evidence. Submitting twice updates the same application.
5. Accounts records the financial decision for that application. That decision is the source of truth for examination fee eligibility; `students.fee_status` is only a legacy/cache field until it is removed.
6. The Principal acts only when an exception is escalated. Ordinary cleared applications do not need Principal approval.
7. Examination Staff issues a hall ticket only for an application that is complete, fee-cleared, attendance-eligible, and either needs no exception or has an approved one.
8. A hall ticket is an immutable snapshot. A later profile/photo change does not silently rewrite an already issued document.

## Data and security requirements

- PostgreSQL/Supabase is the sole persistent store in production. JSON files and process memory are never production workflow storage.
- Every public-schema table has RLS enabled, explicit grants, and tested policies. The service-role key is server-only.
- Role decisions come from `app_metadata.role` or an administrator-controlled profile table. Never use `user_metadata` or email substrings as authorization.
- API routes enforce identity and role checks independently of React `RoleGuard`.
- Student uploads use a private bucket, server-generated object names, allow-listed media types, a size limit, and signed URLs when displayed. Old media is deleted only after the database update succeeds.
- Every state change records actor, timestamp, and optional reason. Application and clearance changes must be transaction-safe.
- All configuration comes from environment variables or database settings. No seeded user identities, default exam IDs, localhost production links, or arbitrary fallback records are permitted.

## Database additions in the first hardening migration

- `user_profiles` links `auth.users` to an optional student and carries the application role.
- `exam_application_windows` replaces JSON broadcast notices.
- `exam_applications` replaces JSON application state; it is unique per student and examination.
- `exam_application_decisions` provides an append-only Accounts/Principal audit trail.
- `exam_application_events` records submission and workflow transitions.
- Missing settings columns are added so signature settings persist consistently.

## Implementation status

- [x] **Migrations**: Added `supabase/migrations/20261101000000_workflow_security.sql` and `supabase/migrations/20261101000100_persistent_seating.sql`.
- [x] **Supabase persistence**:
  - `exam_applications` & `exam_application_decisions`
  - `exam_application_windows`
  - `seating_plans`
  - Academic master data (`departments`, `courses`, `subjects` CRUD)
  - Settings persistence with all registrar and principal digital signature options (`typed`, `scribble`, `upload`)
- [x] **Server-side Authorization & Security**:
  - `getAuthContext` validates Supabase JWT, `user_profiles`, and `app_metadata.role`.
  - IDOR protection (`assertResourceAccess`) prevents any student from accessing or submitting for another student's record.
  - Role-based route guards (`assertRole`) on every API mutation (`ACCOUNTS` for fee clearance, `PRINCIPAL` for waivers, `ADMIN`/`STAFF` for hall tickets and seating).
- [x] **Authenticated Student Portal**:
  - Added `/api/me` route to derive student identity securely from the server session instead of client-provided USN parameters.
  - Student photo and receipt uploads use `/api/upload` with strict purpose validation (`photo` | `receipt`), private storage bucket, and signed URLs.
- [x] **Integration Tests**:
  - Automated test suite `tests/workflow.test.ts` (`npm test`) covering cross-student denial, Accounts-only clearance, Principal-only exception, duplicate application deduplication, and hall ticket issuance with authentic QR codes.
- [x] **404 Fallback**: Clean neutral page without multi-portal clutter or security speculation.
- [x] **Build & Verification**: `npm test` (all 6 assertions passing) and `npm run build` (36 static/dynamic routes) passing.

## Acceptance criteria

- A student cannot read, submit, upload for, or issue a document for another student, even by calling APIs directly.
- An Accounts decision survives restart/deploy and is visible in a fresh browser session.
- Every published application window maps to one real examination and target cohort.
- No UI save reports success when the database write failed.
- A production build and the relevant authorization/database tests pass before deployment.

