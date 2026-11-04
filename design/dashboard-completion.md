# Dashboard and authentication completion — 4 November 2026

This record covers the company/talent dashboard completion and chat work, followed by restoration of the authentication design. It distinguishes implemented behavior from checks that still need a running integration environment.

## Authentication design

Company and talent login/signup share `AuthFrame`, using Figma file `eXcW1SL1x7ixOZRZH5o9uj`, frames `541:1041` and `541:794`. The pale form panel, stacked teal provider actions, dark submit button, divider and right-hand artwork use the original design. Exported artwork lives in `public/assets/figma/auth/`. Mobile uses a single column with inputs at least 16px. The complete animated wordmark, form entrance, decorative movement and reduced-motion support remain.

Email signup collects credentials first, then the required names and company details where applicable. Terms acceptance remains mandatory. Credentials remain in component memory, never browser storage. The optional remember-email control stores only an email address. Existing password, MFA and OAuth handlers remain connected. Company OAuth **registration** is not implemented by the current backend contract: those signup controls are explicitly disabled with an explanation; existing company accounts can use provider login. Talent provider signup requires consent.

Session state lives above animated route transitions. Initial checks use a content skeleton within the dashboard shell; navigation reuses the authenticated session. Expiry clears cached private resources and redirects to login. Route entrances remain animated, but old route trees are not retained during exit: Next.js was rendering duplicate interactive controls in the exiting tree.

## Route/action matrix

API paths below are relative to `/api/v1`. `{org}` is resolved from the authenticated company context and is sent as `X-Organisation-Id`. `{id}` values come from API records, not demo names. Server permissions remain authoritative; the UI displays rejected operations without claiming success.

| Surface and routes | Connected actions and contract | Access and verification |
| --- | --- | --- |
| Talent `/talent/profile`, profile subsections | `/talents/me/profile`, experience, education, certifications, portfolio, skills and availability; create/update/delete where supported, optimistic revisions | Own profile; profile persistence browser test |
| Talent profile files | `/files/uploads`, complete/status/download, then profile association for CV/photo | Own file, type/size validation, scanned-ready association; provider smoke test still required |
| Talent jobs, saved jobs | `/public/jobs`, `/talents/me/saved-jobs` GET, PUT/DELETE by job ID | Authenticated talent, published/non-removed jobs; persistence and forbidden-write browser tests; backend ownership tests |
| Talent applications and screening | `/talents/me/applications` and existing screening/application actions | Own application; existing screening/live browser suites require seeded environment |
| Talent interviews and offers | `/talents/me/interviews`, `/talents/me/offers`, offer response | Own records; server validates transitions |
| Talent team, tasks and calendar | Workforce assignments; own tasks, comments and status actions | Assignment/task relationship enforced by API |
| Talent time entries | `/talents/me/time-entries`, draft editing, submission and deletion where allowed | Own assignment and server state; create/submit/read-only browser test |
| Talent performance | Own performance reviews, self-assessment, acknowledgement and dispute | Published/available review and workflow state enforced by API |
| Talent compensation | Own agreements, payroll and payments | Read-only talent view of authorised records |
| Account/security | `/auth/sessions`, revocation, password, two-factor setup/confirm/disable/recovery codes | Current authenticated account; MFA browser retry test |
| Company organisation | `/organisations/{org}`, optimistic profile update, scanned organisation logo | Organisation permissions; backend logo ownership/readiness tests |
| Company access, managers, members | Invitations, roles, member status, department/manager/team assignment | Organisation membership and permission checks; scoped resources |
| Company departments and teams | Organisation departments/teams CRUD | Organisation grants; create, reload and forbidden-write browser tests |
| Company jobs | Draft create/edit, publish/pause/archive transitions, requirements/screening workflow | Job permissions and optimistic revision checks |
| Company discovery and shortlists | Real filtered talent discovery, shortlist create/add/remove/notes | Authorised discovery and shortlist access; no invented match scores |
| Company applications/interviews/offers | Released applications, scheduling, interview updates, draft offer/send/withdraw | Backend release boundary and state transitions remain in force |
| Company placements/replacements | Placement lists/actions and replacement requests | Hiring/workforce permissions and replacement rules |
| Company tasks/time | Task creation/editing/assignments, comments, status, time approval/rejection | Company/task/assignment scope; no local-only save messages |
| Company compensation/payroll/payments | Agreements, payroll lifecycle and payment records through canonical compensation routes | Finance grants and server lifecycle rules |
| Company performance | Periods, metrics, reviews, feedback/results and review transitions | Company performance permissions and review state |
| Company files | `/files?organisationId={org}`, upload/scan, file details and signed download | Only workspace documents/logo in organisation list; CV/message/task/export files retain narrower access checks |
| Both notifications/preferences | Notifications, read/read-all, supported event/channel preferences | Own account; security notification opt-out rejected; backend preference tests |
| Both messages | Conversation/participant selection, direct/group create, archive/leave, send/edit/delete, read and delivery receipts, typing, attachments | Relationship/participant checks on server; two-browser simulated transport regression and database WebSocket integration test |

Resource forms preserve server errors, disable pending submissions, send revisions for concurrent updates, and reload persisted results. Collections expose pagination; related selectors and offer actions follow all API pages. Empty results remain empty rather than returning fabricated sample records. Data-loading failures show retry/error states. The shared sidebar uses readable labels, smaller icons and a focus-managed mobile drawer.

## Chat behavior

The UI distinguishes sent and received messages, retains failed sends for retry with the same idempotency key, deduplicates REST/Socket.IO overlap, preserves scroll when loading older messages, refreshes missed messages on reconnect, and updates previews/unread state. Edits, tombstones and read events broadcast through the backend. A temporary realtime transport failure does not turn an already-persisted send into a false REST failure. Attachments use existing scanning and authorised downloads; inline previews are limited to safe raster formats. Mobile separates list/conversation views and keeps the composer accessible. Unsupported audio/video call buttons are absent.

## Validation and release notes

- Backend: 165 unit tests passed; TypeScript, ESLint, Prisma schema validation, OpenAPI drift check and production compilation passed.
- Production dependency audit: frontend has no reported advisories. Backend remains blocked by one high-severity Zod advisory and four moderate transitive advisories through Sentry/glob/minimatch. [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) lists Zod 4.6.6 as patched; the backend currently uses Zod 3 and `zod-to-json-schema`. A separately validated compatibility migration is required; `npm audit fix --force` was not applied.
- Frontend: TypeScript, ESLint, OpenAPI type drift checking and the production build passed; 25 unit tests and all 24 browser tests passed. Authentication browser coverage includes all four pages at 390/1440px, both staged signup payloads, and an MFA retry without credential loss. Dashboard browser coverage includes persistence/error handling, session navigation/expiry, five viewport widths and two-session chat behavior. These tests intercept API/Socket.IO traffic; they do not prove live provider or production-domain integration.
- Browser-tested sidebar widths: 360, 390, 768, 1024 and 1440px. Desktop and mobile auth screenshots were compared to Figma.
- Database-backed HTTP/integration suites were not run: the local Docker engine was unavailable. Tests were not pointed at the production database.
- Live Google/LinkedIn redirects on physical Android/iOS devices, real cross-domain cookies/CSRF, upload scanning/signed downloads and all end-to-end role workflows still require the configured staging/production environment and test accounts. Existing live browser suites are opt-in via `E2E_LIVE=true`.
- Apply the included `20261029120000_saved_jobs` migration through the normal deployment migration step before using saved jobs. No production migration was executed from this task.
- Frontend OpenAPI snapshot/types are regenerated from the backend specification. Secrets, deployment environment files, browser artifacts and temporary editing scripts are excluded from commits.
- Local production-mode browser testing requires `NEXT_PUBLIC_ORENO_API_URL` and `NEXT_PUBLIC_ORENO_SOCKET_URL` at **build time**. The local tests use `http://127.0.0.1:4000` and intercept all API/Socket.IO traffic. A bare local production build without these settings correctly refuses requests; `.env.vercel` is not automatically loaded by Next.js. Vercel must supply the actual production values in its environment settings.
