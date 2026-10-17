# Oreno frontend-to-backend requirements

This document is the backend handoff for the public website, talent workspace,
and company workspace currently implemented in the frontend. The screens still
use local fixtures through `lib/platform/product-service.ts`; the production
Express API must replace that adapter without requiring page rewrites.

The API prefix is `/api/v1`. Successful responses use `{ "data": ..., "meta":
... }`; failures use `{ "error": { "code", "message", "requestId",
"fieldErrors"? } }`.

## 1. Most important domain boundary

A talent account, a professional profile, and a company employment record are
three related but separately owned resources:

- **Talent account:** global sign-in identity owned by the user. It contains
  email, phone, verification state, password/2FA controls, sessions, and personal
  preferences.
- **Talent profile:** global professional identity owned by the talent. It
  contains headline, bio, experience, education, certifications, portfolio,
  skills, rate, availability, profile visibility, and vetting state.
- **Company team member:** an organisation-scoped employment projection created
  from an accepted offer and placement. It contains employee code, job title,
  department, manager, team, start/end dates, work status, tasks, performance,
  time, and compensation records.

No company endpoint may edit a talent's account or global professional profile.
A company can only update the organisation-owned placement and workforce records
for that talent. A talent can work for multiple organisations without creating
duplicate users or duplicate talent profiles.

The existing backend schema is directionally aligned: `User` owns one optional
`TalentProfile`, while `Placement` and `StaffAssignment` link that profile to an
`Organisation`. Do not introduce a separate `TalentAccount` database table; the
account screen should be an API projection over `User`, `TalentProfile`,
`UserSession`, `TwoFactorCredential`, `UserPreference`, and
`NotificationPreference`.

## 2. Required schema and contract changes before feature modules

These deltas are needed in addition to the current Prisma schema.

### 2.1 Registration intent

The current strict `POST /auth/register` input does not identify which product
journey created the user. Add a non-privileged registration intent, for example:

```ts
accountType: "TALENT" | "COMPANY_OWNER"
```

- `TALENT` registration creates the `User`, credential, verification token,
  default preferences, and a draft `TalentProfile` in one transaction.
- `COMPANY_OWNER` registration creates the `User` and starts organisation
  onboarding. It must not grant platform-admin permissions.
- Repeating a completed registration must return a safe conflict; retrying a
  timed-out request with the same idempotency key must not create duplicates.

An equally valid implementation is separate orchestration endpoints that call
the same authentication service. The frontend only needs an unambiguous typed
contract.

### 2.2 Profile visibility

Replace the two-state `TalentProfile.isPubliclyDiscoverable` behaviour with a
three-state enum:

```ts
type ProfileVisibility = "PUBLIC" | "ORENO_COMPANIES_ONLY" | "PRIVATE";
```

- `PUBLIC`: may appear in the public catalogue when all other publication and
  vetting rules pass.
- `ORENO_COMPANIES_ONLY`: excluded from public endpoints but available through
  authorised company discovery.
- `PRIVATE`: excluded from discovery. Organisations with an existing
  application, offer, placement, or staff assignment may retain relationship-
  scoped access to the minimum required profile fields.

The default must be `PRIVATE`. Migrate existing `true` values to `PUBLIC` and
existing `false` values to `PRIVATE` before removing or deprecating the Boolean.

### 2.3 Availability and work preferences

The frontend treats availability and preferred engagement as different fields.
The API and schema must not overload one enum for both meanings. Represent:

- availability status: available now, available from a date, or unavailable;
- `availableFrom` as a date/time when applicable;
- one or more preferred employment types: full time, part time, or contract;
- preferred work arrangement: remote, hybrid, or on-site;
- hours per week;
- expected rate as decimal amount, ISO currency, and rate unit.

The UI currently displays friendly strings, but the API must return structured
values. Formatting belongs in the frontend adapter.

### 2.4 Company employee code

Add an organisation-owned employee code to `StaffAssignment`, for example
`employeeCode`. It is generated or validated by the backend and is unique within
an organisation:

```text
UNIQUE (organisationId, employeeCode)
```

The company team-member page displays this value. It is not the user's global ID
or talent-profile ID.

### 2.5 Portfolio category

The implemented profile and public catalogue display a category for each
portfolio item. Add a validated optional category/key to `PortfolioItem`, or
provide the same information through a related taxonomy.

### 2.6 Notification keys used by the new account screen

Use the existing event-keyed `NotificationPreference` model for at least:

- `job.match.available` / job alerts;
- `application.status.changed` / application updates;
- security-critical account events, which cannot be disabled.

`marketingEmails` remains a consent-backed user preference. Record the consent
time and policy/version where required; a Boolean alone is not sufficient for a
compliance history.

## 3. Authentication and talent-account API

Preserve the authentication endpoints already implemented by the backend:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` and `POST /auth/logout-all`
- `POST /auth/email/verify` and `POST /auth/email/resend`
- `POST /auth/password/forgot`, `/password/reset`, and `/password/change`
- `GET /auth/sessions` and `DELETE /auth/sessions/:sessionId`
- `POST /auth/2fa/setup`, `/2fa/confirm`, `/2fa/disable`, and
  `/2fa/recovery-codes`
- OAuth start/callback routes for approved providers

The account pages require an authenticated aggregate response. This can extend
`GET /auth/me` or use `GET /talent/me/account`, but it must expose:

```ts
interface TalentAccountView {
  id: string;                 // User ID
  profileId: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  createdAt: string;          // UTC ISO-8601
  lastSignedInAt: string | null;
  security: {
    twoFactorEnabled: boolean;
    activeSessions: number;
  };
  preferences: {
    jobAlerts: boolean;
    applicationUpdates: boolean;
    profileVisibility: ProfileVisibility;
    marketingEmails: boolean;
  };
}
```

Additional requirements:

- `PATCH /auth/me` updates only account identity fields such as phone, locale,
  and time zone. Email is read-only in the current screen.
- A future email-change action must be a separate verified, single-use-token
  flow and must notify both old and new addresses.
- Password change requires the current password and revokes or rotates other
  sessions according to policy.
- Session list responses include device label, approximate activity, creation,
  expiry, and whether the row is the current session. Never return token hashes.
- 2FA setup returns a short-lived setup challenge; the secret is not enabled
  until the confirmation code succeeds. Recovery codes are shown once.
- Suspended or deactivated users cannot use protected talent routes.

## 4. Talent profile and onboarding API

Required operations:

- `GET /talents/me/profile`
- `PATCH /talents/me/profile`
- onboarding draft read/update and explicit completion endpoints;
- CRUD endpoints for experience, education, certifications, portfolio items,
  and talent skills;
- availability and work-preference update endpoint;
- profile-photo, CV, certification, and portfolio upload flows using the shared
  file service;
- a talent-visible vetting summary endpoint that never exposes internal review
  notes;
- `PATCH /talents/me/visibility` or an equivalent preference command.

Profile rules:

- First and last name come from `User`; professional fields come from
  `TalentProfile`. A combined response may project both but must preserve this
  ownership internally.
- Profile completion is calculated by the backend from versioned rules. The
  client must not submit an arbitrary completion percentage.
- Vetting state and public label are backend-controlled. Talents cannot mark
  themselves vetted.
- Skill IDs must come from the approved taxonomy. Proficiency uses one canonical
  enum; the frontend's current `Working` label should map to the agreed backend
  level rather than create a second enum.
- Monetary rates are decimal-safe values with currency and rate unit, never
  preformatted strings.
- Use item-level create/update/delete commands for repeatable records so one tab
  cannot accidentally overwrite edits made in another tab.
- Support optimistic concurrency with `updatedAt`, a revision, or `If-Match` on
  profile and repeatable-record writes.
- Hard-deleting a user must not cascade away legally or commercially required
  application, placement, time, payroll, payment, or audit history. Account
  closure must use deactivation/anonymisation and the approved retention policy.

## 5. Public discovery API

- `GET /public/talents` and `GET /public/talents/:talentId` return an explicit
  public projection only for eligible `PUBLIC` profiles.
- `GET /public/jobs` and `GET /public/jobs/:jobId` return published, open roles.
- Public talent responses never contain email, phone, session/security state,
  private file identifiers, internal vetting notes, applications, employer
  records, or compensation history.
- Public and company talent discovery support pagination, stable sorting, and
  filters for skills, seniority, location/time zone, availability, work
  arrangement, employment type, and structured rate ranges.
- The public response may include a signed or public profile-image URL, not the
  raw storage key.

## 6. Company team-member API

Use the staff assignment as the resource identity. Do not key a company team
member solely by `talentProfileId`; the same talent may have multiple historical
or concurrent organisation relationships.

Required operations:

- `GET /organisations/:organisationId/team-members`
- `GET /organisations/:organisationId/team-members/:staffAssignmentId`
- authorised updates to employment title, status, dates, and employee code;
- effective-dated manager, department, and team assignment commands;
- task, performance, time, compensation, and payment subresources scoped through
  the staff assignment;
- an offboarding command that closes active assignments without deleting
  history.

The detail projection should resemble:

```ts
interface CompanyTeamMemberView {
  id: string;                 // StaffAssignment ID
  placementId: string;
  talentProfileId: string;
  organisationId: string;
  employeeCode: string;
  displayName: string;
  avatarUrl: string | null;
  professionalHeadline: string | null;
  employmentTitle: string;
  department: { id: string; name: string } | null;
  manager: { staffAssignmentId: string; name: string } | null;
  teams: Array<{ id: string; name: string }>;
  startDate: string;
  endDate: string | null;
  engagement: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ENDED";
}
```

Company access rules:

- Company users can read only team members for an organisation in which they
  have an active authorised membership.
- Managers are limited to staff/teams granted by relationship policy unless a
  broader role grants access.
- Company owners or HR may modify organisation-owned assignment data, but never
  `User`, authentication, talent preferences, or talent-authored profile data.
- Account email, phone, password/2FA state, sessions, home address, and personal
  notification preferences are excluded from team-member responses.
- Historical offer and placement terms must remain stable even if the talent
  later edits their headline, rate, availability, or profile visibility.
- Every query and mutation is scoped by `organisationId`; cross-tenant IDs must
  return a safe not-found or denied response without leaking existence.

## 7. Hiring, placement, and workforce capabilities

The rest of the implemented screens require the following existing backend plan
to be completed.

### Company and access

- Organisation profile, addresses, settings, and onboarding progress.
- Membership list/detail, manager invitation create/resend/cancel/accept, role
  assignment, and role/permission discovery.
- Departments, subdepartments, department managers, teams, members, and leads
  with effective dates and archived states.

### Jobs and hiring

- Job list/detail/create/update plus draft, publish, pause, close, fill, and
  archive commands with immutable status history.
- Candidate discovery separate from public discovery and governed by profile
  visibility.
- Applications with answers, attachments, duplicate prevention, withdrawal,
  authorised status transitions, and history.
- Deterministic match explanations with version, inputs, and human-readable
  reasons; no automatic hiring verdict.
- Shortlist create/update/order/remove operations.
- Interview schedule/update/cancel/outcome operations; the MVP stores an
  external meeting URL and does not create a calendar-provider meeting.
- Offer draft/update/send and talent accept/reject operations.
- Accepted offer to placement and initial staff assignment as one controlled,
  idempotent transaction where applicable.
- Replacement request, eligibility projection, operations decision, and
  candidate proposal workflows driven by policy configuration.

### Work management

- Task board, calendar, detail, create/update, assignees, comments, attachments,
  and immutable status history. Board and calendar use the same task records.
- Time entry create/update/submit and manager approve/reject/correct operations.
- Calendar aggregation for tasks, interviews, and organisation events.
- Performance periods, metric definitions, evidence, reviews, feedback, and
  correction history. Do not return a percentage until its versioned formula and
  evidence exist.

### Compensation and payment records

- Effective-dated pay agreements.
- Payroll periods, traceable line items, adjustments, calculation, review, and
  approval state based only on approved time.
- Approved periods are locked against silent recalculation.
- Payment-record list/detail linked to staff assignment, payroll period, amount,
  ISO currency, external method description, reference, status, and history.
- CSV export request/status/signed-download operations.
- No endpoint may initiate or claim to perform a money transfer in the MVP.

### Communication

- Conversation list/detail and membership policies.
- Persisted message history, send, attachments, read receipts, unread counts, and
  authenticated WebSocket delivery. Persist first, emit second.
- Notification list, read/unread/dismiss operations and event-key preference
  updates.

### Public forms

- Demo request and contact request submission.
- Newsletter subscribe, confirm, and unsubscribe with consent history.
- Public forms need validation, abuse controls, safe duplicate behaviour, and no
  account enumeration.

## 8. Screen-to-capability map

| Frontend area | Required backend modules |
| --- | --- |
| `/auth/*` | auth, users, sessions, email, security events |
| `/talent/onboarding/*` | users, talent profiles, skills, files |
| `/talent/profile/*` | talent profiles, skills, vetting, files |
| `/talent/account/*` | users, auth, sessions, 2FA, preferences, notifications |
| `/talent/jobs/*` | job discovery, matching, applications |
| `/talent/applications`, interviews, offers | applications, interviews, offers |
| `/talent/team/current` | placement and staff-assignment projection |
| talent tasks, time, performance, compensation | workforce modules scoped to the authenticated talent |
| `/company/team-members/*` | placements, staff assignments, departments, teams, relationship policy |
| company jobs, applications, shortlists, interviews, offers | hiring modules scoped to the active organisation |
| company tasks, time, performance, compensation | workforce and reporting modules scoped to the active organisation |
| public catalogue and jobs | privacy-safe public discovery projections |
| contact, demo, newsletter | public leads, email, consent, abuse protection |

## 9. API contract conventions

- Backend JSON uses stable enum keys such as `ACTIVE`; the frontend adapter maps
  them to display labels such as `Active`.
- Dates and timestamps are UTC ISO-8601. Date-only employment values use
  `YYYY-MM-DD` without accidental timezone conversion.
- Money and rates use decimal strings plus ISO currency and a unit. Never return
  strings such as `"$25/hr"` as the source value.
- List endpoints provide pagination metadata, stable sorting, filters, and a
  deterministic empty result.
- Validation failures include per-field errors that the frontend can associate
  with named controls.
- Use stable error codes for unauthenticated, forbidden, not found, validation,
  conflict, stale revision, suspended, archived, expired token, invalid state
  transition, rate limited, and unavailable dependency cases.
- Mutations harmful to repeat require `Idempotency-Key`, including application
  submission, offer acceptance, placement creation, payroll approval, exports,
  and other transactional conversions.
- Frontend URLs may use readable slugs, but API writes and relationship lookups
  use stable UUIDs.

## 10. Files and media

All profile photos, CVs, certificates, portfolios, task attachments, payroll
reports, and exports use the approved pending-upload flow:

1. Request upload authorisation with category, MIME type, and size.
2. API creates a pending `FileObject` and returns a short-lived presigned URL.
3. Browser uploads directly to private S3.
4. Browser confirms completion.
5. Worker scans/validates and marks the file ready or rejected.
6. The relevant domain record is linked only after authorisation and validation.

Private files require a permission check and short-lived signed download URL.
The API must never expose an S3 credential, private bucket URL, or durable signed
URL.

## 11. Events and background work

Business changes that require email, notifications, matching, or reporting use
the transactional outbox. At minimum emit durable events for:

- user registered, email verified, password changed, 2FA changed, and session
  revoked;
- talent profile updated, visibility changed, onboarding completed, and vetting
  status changed;
- application and interview status changes;
- offer sent/responded, placement created, and staff assignment changed/ended;
- task assigned/status changed, time submitted/decided, and performance review
  published;
- payroll approved and external payment record changed.

Event payloads contain identifiers and required metadata only, not passwords,
tokens, CV contents, bank details, private messages, or complete profiles.

## 12. Required authorisation tests

Before frontend integration, automated tests must prove:

1. A talent can read and update only their own account and profile.
2. A company cannot update a talent's account, global profile, visibility, rate,
   skills, experience, or credentials.
3. A company with no application/placement relationship cannot fetch a private
   talent profile by guessing its UUID.
4. `ORENO_COMPANIES_ONLY` profiles are absent from public catalogue responses.
5. A company member cannot read another organisation's team member, task, time,
   performance, compensation, or payment record.
6. A manager cannot access staff outside their authorised relationship scope.
7. Employee codes are unique per organisation but may be reused by different
   organisations.
8. Creating a placement does not create another `User` or `TalentProfile`.
9. Offboarding preserves historical placement, task, time, payroll, payment, and
   audit records.
10. Revoked sessions and suspended accounts immediately lose protected access.
11. Verification, reset, invitation, and email-change tokens are hashed,
    expiring, and single use.
12. Public projections never leak private account or employment data.

## 13. Backend delivery order for frontend integration

1. Extend registration intent and complete Users, Organisations, Memberships,
   and Invitations.
2. Apply the visibility, availability/work-preference, employee-code, and
   portfolio-category migrations.
3. Implement the talent-account aggregate, profile CRUD, onboarding, and file
   flows.
4. Implement public/company discovery, jobs, applications, interviews, offers,
   placements, and the company team-member projection.
5. Implement departments, teams, tasks, calendar, time, and performance.
6. Implement messaging, notifications, compensation, payment records, and
   exports.
7. Generate and commit OpenAPI, generate frontend TypeScript types, and replace
   `productService` fixtures one module at a time.

For every module, the backend handoff is complete only when routes, policies,
validation, services, repositories, migrations, OpenAPI operations, seed data,
and unit/integration/HTTP tenant-isolation tests are included.

## 14. Frontend integration work after the API is ready

- Replace only `productService`; keep page/component structure intact.
- Use cookie-authenticated requests with CSRF/origin handling required by the
  backend. Do not place session tokens in browser storage.
- Add asynchronous loading, empty, error, denied, conflict, and success handling
  around the current synchronous fixture calls.
- Implement optimistic UI only where rollback is safe.
- Generate types from the committed OpenAPI contract instead of maintaining
  duplicate hand-written transport types.
- Add the direct-to-S3 upload client and authenticated WebSocket client.
- Map field errors to form controls and show safe request IDs for support.

## 15. Platform administration contract

The integrated `/platform-admin` surface is a separate security domain from
company administration and talent self-service. Its frontend adapter lives in
`lib/platform-admin/service.ts`; replace that adapter with authenticated calls
under `/api/v1/admin` without moving admin authority into page components.

### Authentication and administrator identity

- Maintain a distinct administrator assignment linked to a normal `User`; do
  not infer platform access from a company membership or talent account.
- Require password authentication followed by TOTP or a single-use recovery
  code before issuing an administrator session. Password-only sessions cannot
  call `/api/v1/admin`.
- Use secure, httpOnly, same-site cookies, CSRF/origin protection, short idle and
  absolute timeouts, session listing/revocation, recovery-code rotation, login
  throttling, and security-event notifications. Never store access tokens in
  browser storage.
- Return a session projection containing administrator ID, display identity,
  assigned role, effective permission keys, 2FA state, and expiry. The server
  remains authoritative; frontend navigation hiding is not authorisation.
- Re-evaluate permissions on every request and invalidate existing permission
  caches or sessions when an administrator role changes.

The six initial roles are `PLATFORM_OWNER`, `OPERATIONS_ADMIN`,
`TALENT_REVIEWER`, `SUPPORT_AGENT`, `FINANCE_ADMIN`, and
`READ_ONLY_ANALYST`. Permissions must map to the keys in
`lib/platform-admin/contracts.ts`, with Platform Owner as the only role able to
assign other platform administrators and export the complete audit log.

### Required read operations

All list endpoints require cursor or page pagination, stable sorting, approved
filters, and a total where practical. Detail endpoints use UUIDs; readable
slugs are a frontend concern.

| Area | Required operations |
| --- | --- |
| Overview | `GET /api/v1/admin/metrics`, attention queues, recent audit summaries, system summary |
| Companies | `GET /admin/companies`, `GET /admin/companies/:id`, memberships, onboarding state, jobs, placements, safe activity |
| Users | `GET /admin/users`, `GET /admin/users/:id`, account domain, status, 2FA state, safe session metadata |
| Admin access | administrator list, roles/permission catalogue, assignments, invitations, 2FA-enrolment state |
| Vetting | queue/detail, submitted evidence metadata, reviewer assignment, decision history, SLA age |
| Job moderation | listings, reports, company context, moderation status and history |
| Hiring | global applications, offers, placements, replacement requests, and their immutable relationships |
| Support | case list/detail, structured timeline, assignee, priority, SLA, related resource references |
| Payments | payroll-period summaries and masked reconciliation exceptions only; no transfer operation |
| Communications | announcements, audience estimates, scheduling state, and masked delivery attempts |
| Configuration | feature flags with environment/version, versioned policy values, help-content revisions |
| Analytics | aggregated funnels, counts, durations and trends that exclude private or unnecessary attributes |
| Exports | request list, progress, expiry, and short-lived signed-download metadata |
| Audit | immutable event search/detail with actor, action, target, safe before/after, risk, reason and request ID |
| System | approved service-health projection, queue depth and failed-job safe summaries without secrets or raw payloads |

### Required mutation operations

Implement command-style endpoints rather than generic unrestricted record
patches. At minimum the admin frontend requires:

- suspend/restore a company and suspend/restore/unlock a user;
- revoke all sessions for a user;
- invite an administrator, assign a role, disable access, require 2FA reset, and
  revoke administrator sessions;
- assign a vetting case and approve, reject, or request more information;
- approve, pause, restore, or remove a moderated job;
- decide a replacement request without altering the original placement;
- assign, escalate, and resolve a support case;
- review/reconcile a payment exception without initiating payment;
- create, schedule, cancel, and archive an announcement; retry a failed delivery;
- change a feature flag or policy value using `expectedVersion` optimistic
  concurrency; publish or roll back help content;
- request/cancel an export; and retry an approved failed background job.

Every high-risk command accepts `{ reason, expectedVersion? }`, rejects reasons
outside 10–1,000 characters, requires `Idempotency-Key` where replay could
duplicate work, and commits its domain change plus audit/outbox event in one
transaction. Return `202 Accepted` with a job/request ID for background work;
otherwise return the updated safe projection and its new version.

### Audit, privacy, and support-view rules

- Audit entries are append-only and record administrator, effective role,
  permission, action, target type/ID, timestamp, request/correlation ID, source
  context, risk, reason, and redacted before/after summaries.
- Never log passwords, TOTP secrets, recovery codes, reset tokens, cookie
  values, CV contents, bank details, message bodies, or raw job payloads.
- Support impersonation is a prominent, time-limited, read-only context switch.
  It cannot mutate on the user's behalf, view private conversation bodies,
  reveal secrets, or bypass tenant policy. Start/stop events are audited.
- User search must apply field-level redaction. Delivery recipients and payment
  values remain masked unless a narrowly scoped permission and business purpose
  explicitly allow more.
- A platform administrator may review the link between a talent and a company,
  but a placement never transfers ownership of the talent's identity, profile,
  vetting evidence, applications, or account preferences.

### Admin-specific failure and state handling

Use the shared error envelope and add stable codes for `MFA_REQUIRED`,
`ADMIN_SESSION_EXPIRED`, `ADMIN_ROLE_CHANGED`, `ACTION_REASON_REQUIRED`,
`IMPERSONATION_FORBIDDEN`, `EXPORT_EXPIRED`, `CONFIG_VERSION_STALE`, and
`DEPENDENCY_DEGRADED`. Permission failures return 403 without revealing whether
an inaccessible resource exists. Admin lists must deterministically support
loading, empty, filtered-empty, dependency-error, and permission-denied states.

### Mandatory backend tests

1. Password authentication without successful 2FA cannot reach any admin route.
2. Every role is tested against every admin permission and representative HTTP
   route; read-only roles cannot mutate by crafting requests.
3. Platform Owner assignment cannot be created by a non-owner, and removing the
   final active owner is rejected.
4. High-risk commands reject missing/short reasons, stale versions, replayed
   idempotency keys with different payloads, and unauthorised targets.
5. Company suspension, user suspension, session revocation, vetting decisions,
   moderation, configuration, retries, and exports create immutable audit rows.
6. Support context cannot fetch private messages, credentials, payment details,
   or fields outside its declared projection.
7. Payment endpoints contain no command that transfers funds, and non-finance
   roles receive masked/no financial detail as policy defines.
8. Admin exports are scoped, audited, encrypted at rest, short-lived, and fail
   after expiry or role revocation.
9. A placement references an existing talent identity and company workforce
   record without duplicating or transferring the talent account.
10. Failed-job and health endpoints redact raw payloads, connection strings,
    tokens, stack traces, and infrastructure credentials.
