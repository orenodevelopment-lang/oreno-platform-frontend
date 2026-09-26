# Oreno frontend API requirements

The screens use local development fixtures through replaceable typed service functions. The future Express API should provide these `/api/v1` capabilities. Responses should follow the approved `{ data, meta }` and `{ error }` envelopes.

## Identity and access

- `POST /auth/register`, `POST /auth/login`, identity-provider callbacks.
- `POST /auth/email-verifications`, `POST /auth/email-verifications/confirm`.
- `POST /auth/password-recovery`, `POST /auth/password-reset`.
- `GET /invitations/:token`, `POST /invitations/:token/accept`.
- `GET /me`, `PATCH /me`, `GET /me/preferences`, `PATCH /me/preferences`.
- `GET /organisations/:organisationId/memberships`, invitation create/resend/cancel, and role update endpoints.

## Public discovery and leads

- `GET /public/talents`, `GET /public/talents/:talentId` with explicit public-field projection.
- `GET /public/jobs`, `GET /public/jobs/:jobId` returning only published roles.
- `POST /public/demo-requests`, `POST /public/contact-requests`.
- `POST /public/newsletter/subscriptions`, confirmation and unsubscribe endpoints.

## Organisations and workforce

- Organisation profile, address, settings and onboarding progress read/update endpoints.
- Departments, subdepartments, managers, teams, team members and effective-dated staff assignments.
- Staff roster and authorised staff detail projections that exclude restricted personal fields where necessary.

## Jobs, matching and hiring

- Job list/detail/create/update endpoints with draft, publish, pause, close, fill and archive transitions.
- Candidate discovery with pagination, skills, availability, location and rate filters.
- Explainable deterministic match results including algorithm version and input-level explanation.
- Application create/list/detail and centrally validated status transitions.
- Shortlist create/update/order/remove endpoints.
- Interview schedule/update/cancel/outcome endpoints; MVP stores an external meeting URL.
- Offer create/update/send and candidate accept/reject endpoints.
- Placement detail and controlled candidate-to-staff conversion.
- Replacement request create/detail endpoints; eligibility must come from backend policy data.

## Work management

- Task board/calendar/detail/create/update endpoints with assignees, attachments, comments and status history.
- Time-entry list/create/submit and approve/reject/correct endpoints.
- Calendar aggregation for tasks, interviews and organisation events.
- Performance-period, metric-definition, evidence and feedback endpoints. Do not return a score until a versioned policy is approved.

## Compensation and payment records

- Pay agreement and effective-date history.
- Payroll period summaries, line items, adjustments and approval state.
- Payment-record list/detail linked to payroll period and external reference.
- CSV export request/status/signed-download endpoints.
- No money-transfer endpoint is required for the MVP.

## Communication

- Conversation list/detail and membership endpoints.
- Message history, send, attachment and read-receipt endpoints plus authenticated WebSocket delivery.
- Notification list/read/unread endpoints.
- Notification preference read/update endpoints.

## Required cross-cutting behaviour

- Pagination, filtering and stable sorting for list endpoints.
- Consistent `ApiError` codes for validation, authentication, permission, conflict, archived and unavailable states.
- Idempotency keys for applications, offer acceptance, placement, payroll approval and export requests.
- Organisation scoping and resource-level authorisation.
- Status-history records for jobs, applications, interviews, offers, placements, tasks, payroll and payments.
- Short-lived signed URLs for private CV, certification, portfolio and export files.

## Frontend integration TODOs

- Replace `productService` fixtures with an HTTP adapter using `NEXT_PUBLIC_API_URL`.
- Add identity-provider session acquisition and authenticated API client middleware.
- Add upload authorisation and direct-to-S3 client flow.
- Subscribe messaging and notifications to the authenticated WebSocket endpoint.
- Map backend field errors to form controls and preserve safe request IDs in error states.

