import type {
  AdminAccountRecord,
  AdminCompany,
  AdminHiringRecord,
  AdminPlacementRecord,
  AdminReplacementRecord,
  AdminUserRecord,
  AnnouncementRecord,
  AuditEventRecord,
  DeliveryRecord,
  ExportRecord,
  FailedJobRecord,
  FeatureFlagRecord,
  ModeratedJobRecord,
  PaymentExceptionRecord,
  PayrollPeriodRecord,
  PlatformMetric,
  PolicyRecord,
  ServiceHealthRecord,
  SupportCaseRecord,
  VettingQueueRecord,
} from "../lib/platform-admin/contracts.ts";

export const adminMetrics: PlatformMetric[] = [
  { id: "companies", label: "Companies", value: "1,284", detail: "47 onboarding · 12 suspended", change: "8.2%", direction: "up", tone: "teal" },
  { id: "talent", label: "Talent accounts", value: "34,192", detail: "9,841 fully vetted", change: "14.1%", direction: "up", tone: "teal" },
  { id: "jobs", label: "Active jobs", value: "6,703", detail: "128 under moderation", change: "3.7%", direction: "up", tone: "green" },
  { id: "placements", label: "Placements (30d)", value: "892", detail: "61 replacement eligible", change: "5.4%", direction: "down", tone: "pink" },
  { id: "support", label: "Open support cases", value: "143", detail: "18 breaching SLA", change: "22%", direction: "down", tone: "pink" },
  { id: "failures", label: "Queue failures", value: "7", detail: "Require immediate attention", tone: "pink" },
];

export const adminCompanies: AdminCompany[] = [
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02601", slug: "novapay", name: "NovaPay Inc", owner: "Adaeze Williams", staff: 34, jobs: 12, placements: 8, status: "Active", onboarding: "Complete", joinedAt: "2026-01-12" },
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02602", slug: "techbridge", name: "TechBridge Ltd", owner: "Marcus Reid", staff: 18, jobs: 5, placements: 2, status: "Suspended", onboarding: "Complete", joinedAt: "2026-03-03" },
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02603", slug: "greenpath", name: "GreenPath Solutions", owner: "Nadia Osei", staff: 7, jobs: 3, placements: 1, status: "Pending", onboarding: "In review", joinedAt: "2026-09-19" },
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02604", slug: "dropship", name: "Dropship Co", owner: "James Okafor", staff: 52, jobs: 20, placements: 15, status: "Active", onboarding: "Complete", joinedAt: "2025-06-05" },
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02605", slug: "stellar-recruit", name: "Stellar Recruit", owner: "Sophie Laurent", staff: 9, jobs: 7, placements: 4, status: "Active", onboarding: "Complete", joinedAt: "2026-08-01" },
  { id: "6d37dd34-0011-4ae1-a5ec-083cc9a02606", slug: "cloudnine", name: "CloudNine HR", owner: "Tariq Hassan", staff: 3, jobs: 1, placements: 0, status: "Pending", onboarding: "Documents pending", joinedAt: "2026-09-24" },
];

export const adminUsers: AdminUserRecord[] = [
  { id: "7a65aa34-0011-4ae1-a5ec-083cc9a02601", slug: "adaeze-williams", name: "Adaeze Williams", email: "adaeze@novapay.example", type: "Company", organisation: "NovaPay Inc", role: "Owner", status: "Active", lastSeenAt: "2 minutes ago", twoFactorEnabled: true },
  { id: "7a65aa34-0011-4ae1-a5ec-083cc9a02602", slug: "ibrahim-diallo", name: "Ibrahim Diallo", email: "ibrahim@example.test", type: "Talent", organisation: null, role: "Talent", status: "Active", lastSeenAt: "1 hour ago", twoFactorEnabled: false },
  { id: "7a65aa34-0011-4ae1-a5ec-083cc9a02603", slug: "marcus-reid", name: "Marcus Reid", email: "marcus@techbridge.example", type: "Company", organisation: "TechBridge Ltd", role: "Owner", status: "Suspended", lastSeenAt: "3 days ago", twoFactorEnabled: true },
  { id: "7a65aa34-0011-4ae1-a5ec-083cc9a02604", slug: "sophie-laurent", name: "Sophie Laurent", email: "sophie@stellar.example", type: "Company", organisation: "Stellar Recruit", role: "Hiring manager", status: "Active", lastSeenAt: "30 minutes ago", twoFactorEnabled: true },
  { id: "7a65aa34-0011-4ae1-a5ec-083cc9a02605", slug: "yuki-tanaka", name: "Yuki Tanaka", email: "yuki@example.test", type: "Talent", organisation: null, role: "Talent", status: "Locked", lastSeenAt: "2 days ago", twoFactorEnabled: true },
];

export const adminAccounts: AdminAccountRecord[] = [
  { id: "admin-1", name: "Alex Osei", email: "alex@oreno.example", role: "Platform Owner", twoFactorEnabled: true, lastSignedInAt: "Just now" },
  { id: "admin-2", name: "Maya Chen", email: "maya@oreno.example", role: "Operations Admin", twoFactorEnabled: true, lastSignedInAt: "1 hour ago" },
  { id: "admin-3", name: "Kwame Asante", email: "kwame@oreno.example", role: "Talent Reviewer", twoFactorEnabled: true, lastSignedInAt: "3 hours ago" },
  { id: "admin-4", name: "Sara Patel", email: "sara@oreno.example", role: "Support Agent", twoFactorEnabled: false, lastSignedInAt: "20 minutes ago" },
  { id: "admin-5", name: "Léa Morin", email: "lea@oreno.example", role: "Finance Admin", twoFactorEnabled: true, lastSignedInAt: "2 hours ago" },
];

export const vettingQueue: VettingQueueRecord[] = [
  { id: "vet-2841", slug: "ibrahim-diallo", talentName: "Ibrahim Diallo", skills: ["Full-stack", "React", "Node.js"], submittedAt: "2 days ago", ageHours: 48, assignee: "Kwame Asante", priority: "High", status: "In review" },
  { id: "vet-2842", slug: "yuki-tanaka", talentName: "Yuki Tanaka", skills: ["UX design", "Figma", "Research"], submittedAt: "1 day ago", ageHours: 26, assignee: null, priority: "Medium", status: "In review" },
  { id: "vet-2843", slug: "fatou-balde", talentName: "Fatou Balde", skills: ["Data science", "Python", "ML"], submittedAt: "3 hours ago", ageHours: 3, assignee: null, priority: "Low", status: "In review" },
  { id: "vet-2801", slug: "carlos-mendez", talentName: "Carlos Mendez", skills: ["DevOps", "AWS", "Kubernetes"], submittedAt: "5 days ago", ageHours: 120, assignee: "Kwame Asante", priority: "High", status: "Second review" },
];

export const moderatedJobs: ModeratedJobRecord[] = [
  { id: "job-1041", slug: "backend-engineer", title: "Backend Engineer", company: "NovaPay Inc", hiringManager: "Adaeze Williams", postedAt: "2 days ago", applications: 24, reportCount: 0, status: "Published" },
  { id: "job-1044", slug: "senior-dev", title: "Senior Developer (Remote)", company: "Dropship Co", hiringManager: "James Okafor", postedAt: "1 day ago", applications: 8, reportCount: 3, status: "Flagged" },
  { id: "job-1039", slug: "ux-researcher", title: "UX Researcher", company: "Stellar Recruit", hiringManager: "Sophie Laurent", postedAt: "5 days ago", applications: 41, reportCount: 0, status: "Published" },
  { id: "job-1031", slug: "marketing-lead", title: "Marketing Lead", company: "GreenPath Solutions", hiringManager: "Nadia Osei", postedAt: "1 week ago", applications: 12, reportCount: 0, status: "Paused" },
  { id: "job-1028", slug: "data-analyst", title: "Data Analyst", company: "NovaPay Inc", hiringManager: "Emeka Eze", postedAt: "2 weeks ago", applications: 67, reportCount: 1, status: "Moderation" },
];

export const adminApplications: AdminHiringRecord[] = [
  { id: "app-7821", talent: "Ibrahim Diallo", job: "Backend Engineer", company: "NovaPay Inc", appliedAt: "3 days ago", status: "Interview", stage: "Technical round" },
  { id: "app-7819", talent: "Yuki Tanaka", job: "UX Researcher", company: "Stellar Recruit", appliedAt: "5 days ago", status: "Offer", stage: "Offer sent" },
  { id: "app-7802", talent: "Fatou Balde", job: "Data Analyst", company: "NovaPay Inc", appliedAt: "1 week ago", status: "Placed", stage: "Placement confirmed" },
  { id: "app-7799", talent: "Carlos Mendez", job: "DevOps Lead", company: "Dropship Co", appliedAt: "2 weeks ago", status: "Rejected", stage: "Screening" },
];

export const adminPlacements: AdminPlacementRecord[] = [
  { id: "placement-291", talent: "Fatou Balde", job: "Data Analyst", company: "NovaPay Inc", startDate: "2026-10-01", replacementEligible: false, staffLead: "Emeka Eze" },
  { id: "placement-283", talent: "Kwame Bempong", job: "Frontend Developer", company: "Dropship Co", startDate: "2026-09-15", replacementEligible: true, staffLead: "James Okafor" },
];

export const replacementRequests: AdminReplacementRecord[] = [
  { id: "replacement-83", company: "Dropship Co", talent: "Kwame Bempong", role: "Frontend Developer", requestedAt: "6 hours ago", eligibility: "Eligible", status: "Under review" },
  { id: "replacement-84", company: "NovaPay Inc", talent: "Emeka Eze", role: "Data Analyst", requestedAt: "1 day ago", eligibility: "Review required", status: "Requested" },
];

export const supportCases: SupportCaseRecord[] = [
  { id: "case-4815", slug: "4815", type: "Dispute", subject: "Placement quality complaint", company: "NovaPay Inc", talent: "Ibrahim Diallo", assignee: "Sara Patel", priority: "High", status: "Open", slaAgeHours: 52, createdAt: "3 days ago" },
  { id: "case-4819", slug: "4819", type: "Account unlock", subject: "Cannot sign in after MFA reset", company: null, talent: "Yuki Tanaka", assignee: "Sara Patel", priority: "High", status: "Escalated", slaAgeHours: 38, createdAt: "2 days ago" },
  { id: "case-4821", slug: "4821", type: "Job appeal", subject: "Job listing removed unfairly", company: "Dropship Co", talent: null, assignee: null, priority: "Medium", status: "Open", slaAgeHours: 29, createdAt: "1 day ago" },
  { id: "case-4803", slug: "4803", type: "Profile", subject: "Skills verification appeal", company: null, talent: "Carlos Mendez", assignee: "Kwame Asante", priority: "Low", status: "Resolved", slaAgeHours: null, createdAt: "5 days ago" },
];

export const payrollPeriods: PayrollPeriodRecord[] = [
  { id: "payroll-2026-10", period: "October 2026", companies: 48, records: 312, processed: 304, exceptions: 8, status: "Active" },
  { id: "payroll-2026-09", period: "September 2026", companies: 47, records: 298, processed: 298, exceptions: 0, status: "Closed" },
  { id: "payroll-2026-08", period: "August 2026", companies: 45, records: 279, processed: 277, exceptions: 2, status: "Closed" },
];

export const paymentExceptions: PaymentExceptionRecord[] = [
  { id: "payment-49", reference: "PAY-2026-10-0049", company: "TechBridge Ltd", talent: "Emeka Eze", maskedAmount: "GBP •••• 2,8••", reason: "Bank validation failed", status: "Failed" },
  { id: "payment-51", reference: "PAY-2026-10-0051", company: "GreenPath Solutions", talent: "Carlos Mendez", maskedAmount: "GBP •••• 1,9••", reason: "Missing sort code", status: "Failed" },
  { id: "payment-58", reference: "PAY-2026-10-0058", company: "Stellar Recruit", talent: "Fatou Balde", maskedAmount: "GBP •••• 3,1••", reason: "Duplicate record detected", status: "Pending confirmation" },
];

export const announcements: AnnouncementRecord[] = [
  { id: "announcement-41", title: "Platform maintenance window · 15 November 2026", audience: "All users", status: "Scheduled", scheduledAt: "2026-11-14T23:00:00Z", sentAt: null },
  { id: "announcement-40", title: "New vetting tier now available", audience: "Talent", status: "Sent", scheduledAt: null, sentAt: "2026-10-01T09:00:00Z" },
  { id: "announcement-39", title: "Updated terms of service", audience: "All users", status: "Sent", scheduledAt: null, sentAt: "2026-09-15T09:00:00Z" },
  { id: "announcement-38", title: "Company onboarding improvements", audience: "Company administrators", status: "Draft", scheduledAt: null, sentAt: null },
];

export const deliveryRecords: DeliveryRecord[] = [
  { id: "delivery-88201", template: "welcome_email", maskedRecipient: "e••••@novapay.example", status: "Delivered", attemptedAt: "3 minutes ago", attempts: 1 },
  { id: "delivery-88198", template: "talent_approved", maskedRecipient: "i••••@example.test", status: "Delivered", attemptedAt: "12 minutes ago", attempts: 1 },
  { id: "delivery-88195", template: "case_escalated", maskedRecipient: "y••••@example.test", status: "Failed", attemptedAt: "24 minutes ago", attempts: 3 },
];

export const featureFlags: FeatureFlagRecord[] = [
  { key: "talent_premium_vetting", environment: "production", enabled: true, updatedBy: "Alex Osei", updatedAt: "1 hour ago", description: "Enable the premium vetting tier for talent profiles" },
  { key: "company_bulk_hire", environment: "production", enabled: false, updatedBy: "Maya Chen", updatedAt: "3 days ago", description: "Allow companies to post bulk hiring campaigns" },
  { key: "cv_parsing_assist", environment: "staging", enabled: true, updatedBy: "Alex Osei", updatedAt: "1 week ago", description: "Assist reviewers by extracting structured CV fields" },
  { key: "replacement_auto_match", environment: "production", enabled: false, updatedBy: "Alex Osei", updatedAt: "2 weeks ago", description: "Suggest replacement candidates after eligibility review" },
];

export const policyRecords: PolicyRecord[] = [
  { key: "replacement_eligibility_days", value: "90", label: "Replacement eligibility period (days)", editable: true },
  { key: "vetting_sla_hours", value: "72", label: "Vetting SLA target (hours)", editable: true },
  { key: "max_failed_logins", value: "5", label: "Maximum failed sign-in attempts", editable: true },
  { key: "admin_session_timeout_minutes", value: "480", label: "Admin session timeout (minutes)", editable: false },
];

export const exportRecords: ExportRecord[] = [
  { id: "export-401", type: "Hiring funnel CSV", requestedBy: "Léa Morin", createdAt: "20 minutes ago", expiresAt: "2026-10-24T09:00:00Z", status: "Ready" },
  { id: "export-400", type: "Vetting turnaround CSV", requestedBy: "Alex Osei", createdAt: "1 hour ago", expiresAt: null, status: "Pending" },
  { id: "export-397", type: "Support SLA report", requestedBy: "Maya Chen", createdAt: "2 days ago", expiresAt: null, status: "Failed" },
  { id: "export-380", type: "Company activity CSV", requestedBy: "Alex Osei", createdAt: "12 days ago", expiresAt: "2026-10-10T09:00:00Z", status: "Expired" },
];

export const auditEvents: AuditEventRecord[] = [
  { id: "audit-8801", actor: "Maya Chen", role: "Operations Admin", action: "company.suspend", target: "TechBridge Ltd", risk: "High", createdAt: "3 minutes ago", before: "status: ACTIVE", after: "status: SUSPENDED", reason: "Repeated policy violations" },
  { id: "audit-8800", actor: "Kwame Asante", role: "Talent Reviewer", action: "talent.approve", target: "Ibrahim Diallo", risk: "Low", createdAt: "11 minutes ago", before: "status: IN_REVIEW", after: "status: VETTED", reason: "All review requirements met" },
  { id: "audit-8799", actor: "Sara Patel", role: "Support Agent", action: "case.escalate", target: "Case #4821", risk: "Medium", createdAt: "24 minutes ago", before: "assignee: unassigned", after: "assignee: Maya Chen", reason: "SLA breach approaching" },
  { id: "audit-8798", actor: "Alex Osei", role: "Platform Owner", action: "feature_flag.update", target: "talent_premium_vetting", risk: "High", createdAt: "1 hour ago", before: "enabled: false", after: "enabled: true (production)", reason: "Approved for release" },
  { id: "audit-8797", actor: "Léa Morin", role: "Finance Admin", action: "payroll.reconcile", target: "October 2026", risk: "Medium", createdAt: "2 hours ago", before: "status: PENDING", after: "status: RECONCILED", reason: null },
];

export const serviceHealth: ServiceHealthRecord[] = [
  { id: "api", name: "Express API", type: "API", status: "Healthy", uptime: "99.98%", latency: "48 ms", throughput: "2.4k requests/min" },
  { id: "auth", name: "Authentication", type: "API module", status: "Healthy", uptime: "99.99%", latency: "21 ms", throughput: "840 requests/min" },
  { id: "database", name: "Primary database", type: "PostgreSQL", status: "Healthy", uptime: "100%", latency: "4 ms", throughput: "12.1k queries/min" },
  { id: "key-value", name: "Key Value", type: "Redis-compatible", status: "Degraded", uptime: "97.1%", latency: "89 ms", throughput: "8.3k operations/min" },
  { id: "worker", name: "Background worker", type: "BullMQ", status: "Healthy", uptime: "99.8%", latency: null, throughput: "310 jobs/min" },
  { id: "realtime", name: "Real-time gateway", type: "WebSocket", status: "Healthy", uptime: "99.9%", latency: "12 ms", throughput: "430 events/min" },
];

export const failedJobs: FailedJobRecord[] = [
  { id: "job-84921", queue: "email", payloadSummary: "welcome_email → user U007", failedAt: "14 minutes ago", attempts: 3, error: "Provider connection timeout" },
  { id: "job-84895", queue: "matching", payloadSummary: "Talent profile T2843 recalculation", failedAt: "42 minutes ago", attempts: 2, error: "Dependency temporarily unavailable" },
  { id: "job-84801", queue: "files", payloadSummary: "CV upload validation", failedAt: "2 hours ago", attempts: 3, error: "File size exceeds policy limit" },
];
