export type AdminRole =
  | "Platform Owner"
  | "Operations Admin"
  | "Talent Reviewer"
  | "Support Agent"
  | "Finance Admin"
  | "Read-only Analyst";

export type AdminPermission =
  | "overview:view"
  | "companies:view"
  | "companies:manage"
  | "users:view"
  | "users:manage"
  | "admins:manage"
  | "vetting:view"
  | "vetting:decide"
  | "jobs:view"
  | "jobs:moderate"
  | "hiring:view"
  | "replacements:manage"
  | "support:view"
  | "support:manage"
  | "payments:view"
  | "payments:review"
  | "announcements:view"
  | "announcements:manage"
  | "configuration:view"
  | "configuration:manage"
  | "analytics:view"
  | "exports:create"
  | "audit:view"
  | "audit:export"
  | "system:view"
  | "system:retry"
  | "account:manage";

export interface AdminSession {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  twoFactorSatisfied: boolean;
  expiresAt: string;
}

export interface PlatformMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  change?: string;
  direction?: "up" | "down";
  tone: "teal" | "green" | "pink" | "amber";
}

export interface AdminCompany {
  id: string;
  slug: string;
  name: string;
  owner: string;
  staff: number;
  jobs: number;
  placements: number;
  status: "Active" | "Suspended" | "Pending" | "Inactive";
  onboarding: string;
  joinedAt: string;
}

export interface AdminUserRecord {
  id: string;
  slug: string;
  name: string;
  email: string;
  type: "Company" | "Talent" | "Platform admin";
  organisation: string | null;
  role: string;
  status: "Active" | "Suspended" | "Locked";
  lastSeenAt: string;
  twoFactorEnabled: boolean;
}

export interface AdminAccountRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  twoFactorEnabled: boolean;
  lastSignedInAt: string;
}

export interface VettingQueueRecord {
  id: string;
  slug: string;
  talentName: string;
  skills: string[];
  submittedAt: string;
  ageHours: number;
  assignee: string | null;
  priority: "High" | "Medium" | "Low";
  status: "In review" | "Second review" | "More information required";
}

export interface ModeratedJobRecord {
  id: string;
  slug: string;
  title: string;
  company: string;
  hiringManager: string;
  postedAt: string;
  applications: number;
  reportCount: number;
  status: "Published" | "Flagged" | "Moderation" | "Paused" | "Closed" | "Removed";
}

export interface AdminHiringRecord {
  id: string;
  talent: string;
  job: string;
  company: string;
  appliedAt: string;
  stage: string;
  status: "Pending" | "Interview" | "Offer" | "Placed" | "Rejected";
}

export interface AdminPlacementRecord {
  id: string;
  talent: string;
  job: string;
  company: string;
  startDate: string;
  replacementEligible: boolean;
  staffLead: string;
}

export interface AdminReplacementRecord {
  id: string;
  company: string;
  talent: string;
  role: string;
  requestedAt: string;
  eligibility: "Eligible" | "Review required" | "Not eligible";
  status: "Requested" | "Under review" | "Resolved";
}

export interface SupportCaseRecord {
  id: string;
  slug: string;
  type: string;
  subject: string;
  company: string | null;
  talent: string | null;
  assignee: string | null;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Escalated" | "Resolved";
  slaAgeHours: number | null;
  createdAt: string;
}

export interface PayrollPeriodRecord {
  id: string;
  period: string;
  companies: number;
  records: number;
  processed: number;
  exceptions: number;
  status: "Active" | "Closed";
}

export interface PaymentExceptionRecord {
  id: string;
  reference: string;
  company: string;
  talent: string;
  maskedAmount: string;
  reason: string;
  status: "Failed" | "Pending confirmation" | "Reconciled";
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  audience: string;
  status: "Draft" | "Scheduled" | "Sent";
  scheduledAt: string | null;
  sentAt: string | null;
}

export interface DeliveryRecord {
  id: string;
  template: string;
  maskedRecipient: string;
  status: "Delivered" | "Failed" | "Pending";
  attemptedAt: string;
  attempts: number;
}

export interface FeatureFlagRecord {
  key: string;
  environment: "production" | "staging";
  enabled: boolean;
  updatedBy: string;
  updatedAt: string;
  description: string;
}

export interface PolicyRecord {
  key: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface ExportRecord {
  id: string;
  type: string;
  requestedBy: string;
  createdAt: string;
  expiresAt: string | null;
  status: "Pending" | "Ready" | "Failed" | "Expired";
}

export interface AuditEventRecord {
  id: string;
  actor: string;
  role: AdminRole;
  action: string;
  target: string;
  risk: "High" | "Medium" | "Low";
  createdAt: string;
  before: string | null;
  after: string | null;
  reason: string | null;
}

export interface ServiceHealthRecord {
  id: string;
  name: string;
  type: string;
  status: "Healthy" | "Degraded" | "Unavailable";
  uptime: string;
  latency: string | null;
  throughput: string;
}

export interface FailedJobRecord {
  id: string;
  queue: string;
  payloadSummary: string;
  failedAt: string;
  attempts: number;
  error: string;
}

export interface AdminActionResult {
  requestId: string;
  status: "accepted";
  message: string;
}
