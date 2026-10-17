# Oreno application screen inventory

This inventory is derived from the local exports in `design/figma/the app designs/`. The 24 company frames are embedded in `User - The Company.svg`; the talent exports were unpacked from `Softcruit.zip` into `design/figma/screens/` without modifying the originals.

## Company experience

| # | Exported state | Planned route | Shared shell / component | Notes |
|---|---|---|---|---|
| 01 | Company sign up | `/company/signup` | `AuthScreen` | Complete split auth layout |
| 02 | Personal details (1/4) | `/company/onboarding/personal` | `OnboardingScreen` | Account setup step |
| 03 | Company details (2/4) | `/company/onboarding/company` | `OnboardingScreen` | Account setup step |
| 04 | Add manager (3/4) | `/company/onboarding/managers` | `OnboardingScreen` | Account setup step |
| 05 | Add bank account (4/4) | `/company/onboarding/accounts` | `OnboardingScreen` | Account setup step |
| 06 | Company login | `/company/login` | `AuthScreen` | Complete split auth layout |
| 07 | Company dashboard | `/company` | `CompanyShell`, `DashboardView` | KPI cards, charts, events |
| 08 | Talents list | `/company/talents` | `CompanyShell`, `TalentTable` | Search and filters |
| 09 | Talent profile — personal information | `/company/talents/john-doe` | `CompanyShell`, `PersonProfile` | Profile tab 1 |
| 10 | Talent profile — assigned task | `/company/talents/john-doe/tasks` | `CompanyShell`, `TaskBoard` | Profile tab 2 |
| 11 | Talent profile — performance | `/company/talents/john-doe/performance` | `CompanyShell`, `PersonProfile` | Export intentionally has an empty content region |
| 12 | Departments | `/company/departments` | `CompanyShell`, `DepartmentBoard` | Department columns |
| 13 | Roles | `/company/roles` | `CompanyShell`, `RolesList` | Search and filters |
| 14 | Create role | `/company/roles/new` | `CompanyShell`, `RoleForm` | Job + employer details |
| 15 | Managers | `/company/managers` | `CompanyShell`, `ManagerGrid` | Search and manager cards |
| 16 | Add manager | `/company/managers/new` | `CompanyShell`, `ManagerForm` | Invitation form |
| 17 | Manager profile — information | `/company/managers/richard-benson` | `CompanyShell`, `ManagerProfile` | Profile tab 1 |
| 18 | Manager profile — assigned team | `/company/managers/richard-benson/team` | `CompanyShell`, `TeamTable` | Profile tab 2 |
| 19 | Salaries overview | `/company/salaries` | `CompanyShell`, `SalaryOverview` | KPI cards and payroll chart |
| 20 | Payroll | `/company/salaries/payroll` | `CompanyShell`, `PayrollTable` | Salary rows |
| 21 | Messages | `/company/messages` | `CompanyShell`, `MessagesView` | People/groups and conversation |
| 22 | Talent hire | `/company/hiring` | `CompanyShell`, `CandidateTable` | Candidate pipeline |
| 23 | Performance | `/company/performance` | `CompanyShell`, `EmptyExportState` | Export intentionally has an empty content region |
| 24 | Settings | `/company/settings` | `CompanyShell`, `CompanySettings` | Profile, managers, bank accounts |

## Talent experience

| Export | Planned route | Shared shell / component | Notes |
|---|---|---|---|
| `Task.svg` | `/talent/tasks` | `TalentShell`, `TaskBoard` | Four-column task board |
| `Team.svg` | `/talent/team` | `TalentShell`, `ManagerGrid` | Manager directory |
| `Message.svg` | `/talent/messages` | `TalentShell`, `MessagesView` | People/groups and conversation |
| `Settings.svg` | `/talent/settings` | `TalentShell`, `TalentSettings` | Profile form |
| `Apply.svg` | `/talent/apply` | `TalentShell`, `JobsView` | Job list and application timeline |

## Ambiguous or non-implementable exports

| Export | Classification | Decision |
|---|---|---|
| `Login.svg` | Blank 1440×1024 artboard | No route-specific UI can be recovered. The complete company login frame is implemented from the company canvas. |
| `Sign up.svg` | Blank 1440×1024 artboard | No route-specific UI can be recovered. The complete company sign-up frame is implemented from the company canvas. |
| `5d514e4a3a8fdb1711cba4e281cacc5a 1.svg` | Rotated third-party “Joblist” product image | Treated as visual reference/asset only, not an Oreno application screen. |

## Shared implementation map

- Design tokens and responsive rules: `app/platform.css`
- Shared navigation/shells and reusable UI: `components/platform/`
- Typed domain models and mock service boundary: `lib/platform/`
- Stable extracted raster assets: `public/assets/figma/app/`

## Platform administration integration

The administration surface was integrated from the separately supplied
`oreno-platform-dashboard` Figma Make export and the approved parent-folder
integration brief. It is not classified as one of the original company/talent
SVG frames above. The export supplied visual structure; the current product
contracts, Oreno account boundaries, and backend architecture determine
behaviour and terminology.

| Area | Routes | Implementation |
| --- | --- | --- |
| Secure entry | `/platform-admin/login`, `/two-factor`, `/session-expired`, `/access-denied` | Mandatory two-step admin entry and explicit security states |
| Overview | `/platform-admin` | Metrics, attention queues, audit activity, system posture |
| Organisations | `/platform-admin/companies`, `/companies/:slug` | Company directory, details, and reason-gated access status |
| Users and roles | `/platform-admin/users`, `/users/:slug`, `/access/roles` | Separate account domains, security controls, six admin roles |
| Talent and hiring | `/platform-admin/talent-review`, `/talent-review/:slug`, `/jobs`, `/applications`, `/placements`, `/replacements` | Human vetting, moderation, and linked hiring records |
| Operations | `/platform-admin/support`, `/support/:case`, `/payments`, `/communications` | SLA cases, masked/read-only finance, announcements and deliveries |
| Configuration and insight | `/platform-admin/content`, `/analytics`, `/exports` | Version-ready settings, aggregate charts, asynchronous exports |
| Governance and system | `/platform-admin/audit`, `/system`, `/account` | Immutable audit projection, redacted operations, personal security |

Admin implementation files are under `components/platform-admin/`,
`lib/platform-admin/`, `data/platform-admin-fixtures.ts`, and `app/admin.css`.
The catch-all route is `app/platform-admin/[[...screen]]/page.tsx`.

