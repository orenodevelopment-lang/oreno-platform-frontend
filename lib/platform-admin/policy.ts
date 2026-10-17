import type { AdminPermission, AdminRole } from "./contracts.ts";

const allPermissions: AdminPermission[] = [
  "overview:view", "companies:view", "companies:manage", "users:view", "users:manage", "admins:manage",
  "vetting:view", "vetting:decide", "jobs:view", "jobs:moderate", "hiring:view", "replacements:manage",
  "support:view", "support:manage", "payments:view", "payments:review", "announcements:view",
  "announcements:manage", "configuration:view", "configuration:manage", "analytics:view", "exports:create",
  "audit:view", "audit:export", "system:view", "system:retry", "account:manage",
];

export const adminRolePermissions: Record<AdminRole, AdminPermission[]> = {
  "Platform Owner": allPermissions,
  "Operations Admin": allPermissions.filter((permission) => !["admins:manage", "audit:export"].includes(permission)),
  "Talent Reviewer": ["overview:view", "vetting:view", "vetting:decide", "jobs:view", "hiring:view", "account:manage"],
  "Support Agent": ["overview:view", "companies:view", "users:view", "hiring:view", "support:view", "support:manage", "account:manage"],
  "Finance Admin": ["overview:view", "companies:view", "payments:view", "payments:review", "analytics:view", "exports:create", "audit:view", "account:manage"],
  "Read-only Analyst": ["overview:view", "companies:view", "users:view", "vetting:view", "jobs:view", "hiring:view", "support:view", "payments:view", "announcements:view", "configuration:view", "analytics:view", "audit:view", "system:view", "account:manage"],
};

export const platformAdminRoutes = [
  "/platform-admin/login",
  "/platform-admin/two-factor",
  "/platform-admin/session-expired",
  "/platform-admin/access-denied",
  "/platform-admin",
  "/platform-admin/companies",
  "/platform-admin/companies/novapay",
  "/platform-admin/users",
  "/platform-admin/users/ibrahim-diallo",
  "/platform-admin/access/roles",
  "/platform-admin/talent-review",
  "/platform-admin/talent-review/ibrahim-diallo",
  "/platform-admin/jobs",
  "/platform-admin/applications",
  "/platform-admin/placements",
  "/platform-admin/replacements",
  "/platform-admin/support",
  "/platform-admin/support/4815",
  "/platform-admin/payments",
  "/platform-admin/communications",
  "/platform-admin/content",
  "/platform-admin/analytics",
  "/platform-admin/exports",
  "/platform-admin/audit",
  "/platform-admin/system",
  "/platform-admin/account",
] as const;

const routePermissions: Array<{ prefix: string; permission: AdminPermission }> = [
  { prefix: "companies", permission: "companies:view" },
  { prefix: "users", permission: "users:view" },
  { prefix: "access/roles", permission: "admins:manage" },
  { prefix: "talent-review", permission: "vetting:view" },
  { prefix: "jobs", permission: "jobs:view" },
  { prefix: "applications", permission: "hiring:view" },
  { prefix: "placements", permission: "hiring:view" },
  { prefix: "replacements", permission: "hiring:view" },
  { prefix: "support", permission: "support:view" },
  { prefix: "payments", permission: "payments:view" },
  { prefix: "communications", permission: "announcements:view" },
  { prefix: "content", permission: "configuration:view" },
  { prefix: "analytics", permission: "analytics:view" },
  { prefix: "exports", permission: "analytics:view" },
  { prefix: "audit", permission: "audit:view" },
  { prefix: "system", permission: "system:view" },
  { prefix: "account", permission: "account:manage" },
];

export function permissionsForRole(role: AdminRole) {
  return adminRolePermissions[role];
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return adminRolePermissions[role].includes(permission);
}

export function requiredPermissionForRoute(route: string): AdminPermission {
  return routePermissions.find((item) => route === item.prefix || route.startsWith(`${item.prefix}/`))?.permission ?? "overview:view";
}

export function canAccessAdminRoute(role: AdminRole, route: string) {
  return hasAdminPermission(role, requiredPermissionForRoute(route));
}

export function validateAdminActionReason(reason: string) {
  const value = reason.trim();
  if (value.length < 10) return "Enter a clear reason of at least 10 characters.";
  if (value.length > 1000) return "Keep the reason under 1,000 characters.";
  return null;
}

export const adminApiRoutes = {
  metrics: "/api/v1/admin/dashboard",
  companies: "/api/v1/admin/organisations",
  company: (id: string) => `/api/v1/admin/organisations/${id}`,
  users: "/api/v1/admin/users",
  user: (id: string) => `/api/v1/admin/users/${id}`,
  revokeUserSessions: (id: string) => `/api/v1/admin/users/${id}/sessions/revoke`,
  adminRoles: "/api/v1/admin/roles",
  vetting: "/api/v1/admin/vetting",
  vettingCase: (id: string) => `/api/v1/admin/vetting/${id}`,
  jobs: "/api/v1/admin/jobs",
  jobModeration: (id: string) => `/api/v1/admin/jobs/${id}/moderation`,
  applications: "/api/v1/admin/applications",
  placements: "/api/v1/admin/placements",
  replacements: "/api/v1/admin/replacements",
  support: "/api/v1/admin/support",
  supportCase: (id: string) => `/api/v1/admin/support/${id}`,
  payments: "/api/v1/admin/compensation/payments",
  announcements: "/api/v1/admin/announcements",
  deliveries: "/api/v1/admin/deliveries",
  configuration: "/api/v1/admin/configuration",
  analytics: "/api/v1/admin/analytics",
  exports: "/api/v1/admin/exports",
  audit: "/api/v1/admin/audit",
  system: "/api/v1/admin/operations",
  retryJob: (id: string) => `/api/v1/admin/operations/jobs/${id}/retry`,
} as const;
