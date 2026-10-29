# Dashboard route and action matrix

This matrix records the production contract used by the talent and company dashboards. Dynamic routes use database IDs; example fixture slugs are not part of the live navigation.

| Surface | Route | Persistent actions | API contract | Access boundary |
| --- | --- | --- | --- | --- |
| Talent | `/talent/profile/*` | Update profile, availability, visibility and account preferences | `/api/v1/talents/me/*` | Authenticated talent |
| Talent | `/talent/jobs/*` | Search jobs, upload CV and apply | `/api/v1/public/jobs/*` | Public read; talent write |
| Talent | `/talent/applications/*` | View screening and withdraw | `/api/v1/talents/me/applications/*` | Application owner |
| Talent | `/talent/interviews/*` | View interview and meeting details | `/api/v1/talents/me/interviews/*` | Application owner |
| Talent | `/talent/offers/*` | Accept or decline offers | `/api/v1/talents/me/offers/*` | Offer recipient |
| Talent | `/talent/tasks/*` | Change status and add comments | `/api/v1/talents/me/tasks/*` | Assigned talent |
| Talent | `/talent/messages` | Direct/group chat, attachments, read/typing, edit/delete, archive/leave | `/api/v1/conversations/*` and Socket.IO | Conversation member and eligible relationship |
| Company | `/company/organisation` | Update organisation profile | `/api/v1/organisations/:organisationId` | Authorised organisation member |
| Company | `/company/access/*` | Invite members, resend/revoke invitations | `/api/v1/organisations/:organisationId/{members,invitations,roles}` | Owner/HR permissions |
| Company | `/company/jobs/*` | Edit and transition job lifecycle | `/api/v1/organisations/:organisationId/jobs/*` | Hiring permissions |
| Company | `/company/discover` | Discover released/eligible talent | `/api/v1/talents` | Authorised company member |
| Company | `/company/applications/*` | Review and change application status | `/api/v1/organisations/:organisationId/applications/*` | Hiring permissions and screening release |
| Company | `/company/interviews/*` | Schedule and record outcomes | `/api/v1/organisations/:organisationId/interviews/*` | Hiring permissions |
| Company | `/company/offers/*` | Create and inspect offers | `/api/v1/organisations/:organisationId/offers/*` | Hiring permissions |
| Company | `/company/departments` | Create departments and inspect assigned teams | `/api/v1/organisations/:organisationId/departments` | Workforce permissions |
| Company | `/company/teams` | Create teams and associate departments | `/api/v1/organisations/:organisationId/teams` | Workforce permissions |
| Company | `/company/tasks/*` | Review tasks, transition status and add comments | `/api/v1/organisations/:organisationId/tasks/*` | Work-management permissions |
| Company | `/company/time` | Approve or reject submitted time | `/api/v1/organisations/:organisationId/time-entries/*` | Time approval permission |
| Company | `/company/performance` | Create review periods | `/api/v1/organisations/:organisationId/performance/periods` | Performance permissions |
| Company | `/company/compensation/*` | View compensation, payroll and external payment records | `/api/v1/organisations/:organisationId/{compensation,payroll,payments}` | Compensation permissions |
| Company | `/company/messages` | Same messaging workspace as talent | `/api/v1/conversations/*` and Socket.IO | Conversation member and eligible relationship |
| Both | `/*/notifications` | Mark one/all read | `/api/v1/notifications/*` | Notification owner |
| Both | `/*/preferences` | Save notification preferences | `/api/v1/notifications/preferences` | Authenticated user |

Visible controls without an approved persistent contract are disabled and labelled. Audio and video call controls are omitted because no calling provider has been selected.
