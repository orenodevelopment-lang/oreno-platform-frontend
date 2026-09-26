# Oreno missing screens register

This register compares the current frontend with the approved product overview and the missing-screen execution brief. “Implemented from Figma” means a supplied export established the screen. “Inferred MVP” means the smallest screen needed to complete a product journey using existing Oreno patterns. Platform-owner administration remains outside this frontend phase.

## Public and authentication

| Screen or state | Classification | Journey | Reused pattern | Data contract |
|---|---|---|---|---|
| Marketing homepage | Implemented from Figma | Understand Oreno | Public navbar, content sections, footer | Public content |
| Public talent catalogue | Missing and required for MVP | Browse curated talent | Search toolbar, cards, status chips | `PublicTalentSummary`, catalogue query |
| Public talent profile | Missing and required for MVP | Evaluate a published talent profile | Profile hero, detail cards | `PublicTalentProfile` |
| Public jobs list | Missing and required for MVP | Discover open roles | Search/filter toolbar, job cards | `PublicJobSummary`, discovery query |
| Public job detail | Missing and required for MVP | Understand a role before applying | Job detail, facts, requirements | `PublicJobDetail` |
| Request a demo | Missing and required for MVP | Company lead capture | Public form and success state | `DemoRequestInput` |
| Contact form | Missing and required for MVP | General enquiry | Public form and success state | `ContactRequestInput` |
| Newsletter confirmation | Missing and required for MVP | Confirm subscription | Public confirmation state | `NewsletterSubscription` |
| Newsletter unsubscribe | Missing and required for MVP | Stop newsletter delivery | Destructive confirmation and success | `NewsletterPreferenceInput` |
| Company sign up and login | Implemented from Figma | Enter company workspace | Split authentication shell | Identity provider adapter |
| Talent sign up and login | Implemented but incomplete | Enter talent workspace | Shared authentication shell | Identity provider adapter |
| Email verification | Missing and required for MVP | Verify identity | Focused authentication state | `VerificationRequest` |
| Forgotten password | Missing and required for MVP | Recover access | Focused authentication form | `PasswordRecoveryRequest` |
| Reset password | Missing and required for MVP | Set replacement credential | Validated authentication form | `PasswordResetInput` |
| Invitation acceptance | Missing and required for MVP | Join an organisation | Invitation summary and acceptance form | `InvitationAcceptanceInput` |
| Not found | Missing and required for MVP | Recover from invalid URL | Branded system state | None |
| Unauthorised | Missing and required for MVP | Explain denied access | Branded permission state | `ApiError` |
| Generic error | Missing and required for MVP | Retry failed page | Branded retry state | `ApiError` |

## Company workspace

| Screen or state | Classification | Journey | Reused pattern | Data contract |
|---|---|---|---|---|
| Four-step onboarding | Implemented from Figma | Create company workspace | Onboarding sidebar and forms | Organisation onboarding |
| Onboarding completion | Missing and required for MVP | Finish setup and enter dashboard | Success state | `OnboardingCompletion` |
| Dashboard | Implemented from Figma | Review workspace activity | KPI cards and charts | Dashboard summary |
| Organisation profile | Missing and required for MVP | Maintain business details | Settings form | `OrganisationProfile` |
| User profile and settings | Implemented from Figma | Maintain account | Settings layout | User profile |
| Member invitations | Implemented but incomplete | Add workspace members | Member table and modal form | `Invitation`, `InvitationCreateInput` |
| Roles and access management | Missing and required for MVP | Control permissions | Settings table and permission matrix | `MembershipRole`, `Permission` |
| Jobs list and lifecycle states | Implemented but incomplete | Manage vacancies | Role list, status chips, confirmation dialog | `Job`, `JobStatus` |
| Create job | Implemented from Figma | Draft vacancy | Wide form | `JobUpsertInput` |
| Edit and job detail | Missing and required for MVP | Review or change vacancy | Job form and detail shell | `Job`, `JobUpsertInput` |
| Publish, pause, close and archive | Missing and required for MVP | Control discoverability | Action menu and confirmation dialog | `JobStatusTransitionInput` |
| Candidate discovery | Missing and required for MVP | Find relevant talent | Catalogue grid and explainable match | `CandidateDiscoveryQuery`, `MatchExplanation` |
| Applications pipeline | Implemented but incomplete | Move applications through hiring | Pipeline columns | `Application`, `ApplicationStatus` |
| Application detail | Missing and required for MVP | Review one candidate | Profile detail with status history | `ApplicationDetail` |
| Shortlists | Missing and required for MVP | Save candidate groups | List/detail split view | `Shortlist`, `ShortlistCandidate` |
| Interview scheduling | Missing and required for MVP | Record interview logistics | Validated scheduling form | `InterviewUpsertInput` |
| Interview outcome | Missing and required for MVP | Record completed interview | Outcome form and notes | `InterviewOutcomeInput` |
| Offer creation and decision | Missing and required for MVP | Present employment terms | Terms form and decision state | `Offer`, `OfferUpsertInput` |
| Placement state | Missing and required for MVP | Convert accepted candidate to staff | Completion checklist | `Placement` |
| Replacement request | Missing and required for MVP | Request a policy-reviewed replacement | Eligibility summary and request form | `ReplacementRequestInput` |
| Staff roster and profile | Implemented from Figma | Manage employed talent | Table and profile | Staff summaries and detail |
| Departments and subdepartments | Implemented from Figma | Organise staff | Department board | Department tree |
| Teams and manager assignments | Implemented but incomplete | Assign responsibility | Team table and assignment form | `Team`, `TeamAssignmentInput` |
| Task board and calendar | Implemented from Figma | Plan work | Shared task board | Task list and calendar query |
| Task detail and comments | Missing and required for MVP | Review and discuss work | Detail panel and message composer | `TaskDetail`, `TaskCommentInput` |
| Time-entry review | Missing and required for MVP | Approve submitted work hours | Review table and decision controls | `TimeEntry`, `TimeEntryDecisionInput` |
| Performance overview | Implemented but incomplete | Define review foundations | Evidence-first period cards | `PerformancePeriod`, `MetricDefinition` |
| Compensation overview and payroll | Implemented from Figma | Review period totals | KPI cards and payroll table | Payroll summary and line items |
| Salary detail | Missing and required for MVP | Inspect one staff pay record | Detail cards and adjustment history | `PayAgreement`, `PayrollLineItem` |
| Payment records | Missing and required for MVP | Record external payments | Records table only | `PaymentRecord` |
| Conversations | Implemented from Figma | Message staff and groups | Shared messages view | Conversation and message contracts |
| Notifications | Missing and required for MVP | Review product events | Notification list | `Notification` |
| User preferences | Missing and required for MVP | Control notification channels | Settings controls | `NotificationPreference` |

## Talent workspace

| Screen or state | Classification | Journey | Reused pattern | Data contract |
|---|---|---|---|---|
| Talent onboarding and completion | Missing and required for MVP | Create a usable talent profile | Onboarding stepper and forms | `TalentProfileUpsertInput` |
| Profile overview and editing | Implemented but incomplete | Maintain professional profile | Profile sidebar and forms | `TalentProfile` |
| Experience, education and certification | Missing and required for MVP | Establish qualifications | Repeatable record editor | Profile sub-record contracts |
| Portfolio and availability | Missing and required for MVP | Publish work and capacity | Card editor and availability form | `PortfolioItem`, `TalentAvailability` |
| Skills and vetting status | Missing and required for MVP | Explain discoverability and review state | Skill chips and evidence timeline | `TalentSkill`, `VettingStatus` |
| Talent dashboard | Missing and required for MVP | Review applications, interviews and work | KPI and upcoming-event cards | `TalentDashboardSummary` |
| Job discovery and detail | Implemented but incomplete | Find and understand roles | Existing job list/detail composition | Public job contracts |
| Quick application | Implemented but incomplete | Apply with completed profile | Confirmation and eligibility states | `ApplicationCreateInput` |
| Standard application | Missing and required for MVP | Add answers and attachments | Multi-section form | `ApplicationCreateInput` |
| Application tracking and withdrawal | Implemented but incomplete | Follow or withdraw application | Timeline and destructive confirmation | `ApplicationDetail`, withdrawal input |
| Interview detail | Missing and required for MVP | Prepare for scheduled interview | Event detail card | `Interview` |
| Offer review and decision | Missing and required for MVP | Accept or reject terms | Offer terms and confirmation dialog | `OfferDecisionInput` |
| Team and manager after placement | Implemented but incomplete | Understand reporting relationships | Team directory and manager profile | `Team`, staff assignment |
| Task detail, calendar and time entry | Implemented but incomplete | Complete and report work | Task detail and time form | Task and time-entry contracts |
| Performance information | Deferred by approved product decision | View evidence-backed feedback | Policy-unavailable state | Requires approved performance policy |
| Compensation summary and records | Missing and required for MVP | Review pay and external payment records | Summary cards and records table | Pay agreement and payment record |
| Conversations and settings | Implemented from Figma | Communicate and manage account | Shared messages and settings | Conversation/user contracts |
| Notifications | Missing and required for MVP | Follow application and work events | Notification list | `Notification` |

## Platform owner administration

Vetting queues, account support, replacement adjudication, suspensions and internal operations notes are classified as **Platform-admin screen handled separately**. They belong to the later platform-admin design and integration prompts and are not implemented here.

## Shared inferred patterns

- `ProductPage`: consistent heading, supporting copy, tabs and action area inside the existing company or talent shell.
- `DataStateBoundary`: URL-selectable loading, empty, no-result, API-error, permission-denied, archived and success states.
- `StatusChip`: text plus icon so status does not depend on colour.
- `ConfirmDialog`: keyboard-operable confirmation for withdrawals, close/archive actions and offer decisions.
- `Timeline`: application, invitation, vetting, interview and payment history.
- `DetailGrid`: reusable operational detail cards that retain the density of the exported dashboards.
- `RecordEditor`: repeatable experience, education, certification and portfolio rows.

