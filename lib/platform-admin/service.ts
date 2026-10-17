import {
  adminAccounts,
  adminApplications,
  adminCompanies,
  adminMetrics,
  adminPlacements,
  adminUsers,
  announcements,
  auditEvents,
  deliveryRecords,
  exportRecords,
  failedJobs,
  featureFlags,
  moderatedJobs,
  paymentExceptions,
  payrollPeriods,
  policyRecords,
  replacementRequests,
  serviceHealth,
  supportCases,
  vettingQueue,
} from "../../data/platform-admin-fixtures.ts";
import type { AdminActionResult, AdminRole, AdminSession } from "./contracts.ts";
import { permissionsForRole } from "./policy.ts";

const demoRoleSlugs: Record<string, AdminRole> = {
  owner: "Platform Owner",
  operations: "Operations Admin",
  reviewer: "Talent Reviewer",
  support: "Support Agent",
  finance: "Finance Admin",
  analyst: "Read-only Analyst",
};

function accepted(message: string, ...actionContext: unknown[]): AdminActionResult {
  void actionContext;
  return { requestId: "admin-demo-request", status: "accepted", message };
}

// TODO(api): replace this fixture adapter with cookie-authenticated /api/v1/admin requests.
export const platformAdminService = {
  getSession(roleSlug?: string): AdminSession {
    const role = demoRoleSlugs[roleSlug ?? ""] ?? "Platform Owner";
    return {
      id: "admin-alex-osei",
      name: role === "Platform Owner" ? "Alex Osei" : `Demo ${role}`,
      initials: role === "Platform Owner" ? "AO" : role.split(" ").map((word) => word[0]).join("").slice(0, 2),
      email: "admin@oreno.example",
      role,
      permissions: permissionsForRole(role),
      twoFactorSatisfied: true,
      expiresAt: "2026-10-17T18:00:00Z",
    };
  },
  getMetrics: () => adminMetrics,
  listCompanies: () => adminCompanies,
  getCompany: (slug: string) => adminCompanies.find((company) => company.slug === slug) ?? adminCompanies[0],
  listUsers: () => adminUsers,
  getUser: (slug: string) => adminUsers.find((user) => user.slug === slug) ?? adminUsers[0],
  listAdminAccounts: () => adminAccounts,
  listVettingQueue: () => vettingQueue,
  getVettingCase: (slug: string) => vettingQueue.find((record) => record.slug === slug) ?? vettingQueue[0],
  listJobs: () => moderatedJobs,
  listApplications: () => adminApplications,
  listPlacements: () => adminPlacements,
  listReplacementRequests: () => replacementRequests,
  listSupportCases: () => supportCases,
  getSupportCase: (slug: string) => supportCases.find((record) => record.slug === slug) ?? supportCases[0],
  listPayrollPeriods: () => payrollPeriods,
  listPaymentExceptions: () => paymentExceptions,
  listAnnouncements: () => announcements,
  listDeliveries: () => deliveryRecords,
  listFeatureFlags: () => featureFlags,
  listPolicies: () => policyRecords,
  listExports: () => exportRecords,
  listAuditEvents: () => auditEvents,
  listServiceHealth: () => serviceHealth,
  listFailedJobs: () => failedJobs,
  changeCompanyStatus: (companyId: string, status: string, reason: string) => accepted("Company status change recorded in the local admin demo.", companyId, status, reason),
  changeUserStatus: (userId: string, status: string, reason: string) => accepted("User status change recorded in the local admin demo.", userId, status, reason),
  revokeUserSessions: (userId: string, reason: string) => accepted("Session revocation recorded in the local admin demo.", userId, reason),
  decideVetting: (caseId: string, decision: string, reason: string) => accepted("Vetting decision recorded in the local admin demo.", caseId, decision, reason),
  moderateJob: (jobId: string, decision: string, reason: string) => accepted("Job moderation decision recorded in the local admin demo.", jobId, decision, reason),
  decideReplacement: (requestId: string, decision: string, reason: string) => accepted("Replacement decision recorded in the local admin demo.", requestId, decision, reason),
  updateSupportCase: (caseId: string, action: string, reason: string) => accepted("Support action recorded in the local admin demo.", caseId, action, reason),
  retryDelivery: (deliveryId: string, reason: string) => accepted("Delivery retry queued in the local admin demo.", deliveryId, reason),
  updateFeatureFlag: (key: string, enabled: boolean, reason: string) => accepted("Feature flag change recorded in the local admin demo.", key, enabled, reason),
  updatePolicy: (key: string, value: string, reason: string) => accepted("Policy change recorded in the local admin demo.", key, value, reason),
  retryFailedJob: (jobId: string, reason: string) => accepted("Failed job retry queued in the local admin demo.", jobId, reason),
};
