import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  adminApiRoutes,
  canAccessAdminRoute,
  hasAdminPermission,
  platformAdminRoutes,
  validateAdminActionReason,
} from "../lib/platform-admin/policy.ts";

test("platform admin route manifest covers authentication and operational domains", () => {
  assert.ok(platformAdminRoutes.includes("/platform-admin/login"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/two-factor"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/companies"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/talent-review"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/screening"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/payments"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/audit"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/system"));
});

test("role policy grants least privilege and guards full routes", () => {
  assert.equal(canAccessAdminRoute("Talent Reviewer", "talent-review/ibrahim-diallo"), true);
  assert.equal(canAccessAdminRoute("Talent Reviewer", "payments"), false);
  assert.equal(canAccessAdminRoute("Talent Reviewer", "screening/application-1"), true);
  assert.equal(hasAdminPermission("Talent Reviewer", "screening:release"), false);
  assert.equal(hasAdminPermission("Operations Admin", "screening:release"), true);
  assert.equal(canAccessAdminRoute("Read-only Analyst", "screening"), false);
  assert.equal(canAccessAdminRoute("Support Agent", "support/4815"), true);
  assert.equal(canAccessAdminRoute("Support Agent", "content"), false);
  assert.equal(hasAdminPermission("Read-only Analyst", "system:view"), true);
  assert.equal(hasAdminPermission("Read-only Analyst", "system:retry"), false);
  assert.equal(hasAdminPermission("Platform Owner", "admins:manage"), true);
});

test("high-risk administration actions require a meaningful reason", () => {
  assert.equal(validateAdminActionReason("too short"), "Enter a clear reason of at least 10 characters.");
  assert.equal(validateAdminActionReason("Repeated policy violations were confirmed."), null);
  assert.equal(validateAdminActionReason("x".repeat(1001)), "Keep the reason under 1,000 characters.");
});

test("admin transport contract remains under the isolated API namespace", () => {
  assert.equal(adminApiRoutes.companies, "/api/v1/admin/organisations");
  assert.equal(adminApiRoutes.company("company-1"), "/api/v1/admin/organisations/company-1");
  assert.equal(adminApiRoutes.payments, "/api/v1/admin/compensation/payments");
  assert.equal(adminApiRoutes.screening, "/api/v1/admin/screening/applications");
  assert.equal(adminApiRoutes.screeningApplication("application-1"), "/api/v1/admin/screening/applications/application-1");
  assert.equal(adminApiRoutes.system, "/api/v1/admin/operations");
  assert.equal(adminApiRoutes.retryJob("job-1"), "/api/v1/admin/operations/jobs/job-1/retry");
});

test("admin contract exposes dashboard resources required by the frontend", () => {
  assert.equal(adminApiRoutes.jobs, "/api/v1/admin/jobs");
  assert.equal(adminApiRoutes.announcements, "/api/v1/admin/announcements");
  assert.equal(adminApiRoutes.deliveries, "/api/v1/admin/deliveries");
  assert.equal(adminApiRoutes.revokeUserSessions("user-1"), "/api/v1/admin/users/user-1/sessions/revoke");
});

test("health readiness consumes the direct 200 or degraded 503 contract", () => {
  const source = readFileSync(new URL("../lib/platform-admin/service.ts", import.meta.url), "utf8");
  assert.match(source, /\/health\/ready[\s\S]*direct:\s*true/);
  assert.match(source, /allowErrorStatuses:\s*\[503\]/);
});

test("screening UI uses live private CV and explicit release endpoints", () => {
  const service = readFileSync(new URL("../lib/platform-admin/service.ts", import.meta.url), "utf8");
  const workbench = readFileSync(new URL("../components/platform-admin/ScreeningScreens.tsx", import.meta.url), "utf8");
  assert.match(service, /screening\/applications\/\$\{applicationId\}\/cv\/download/);
  assert.match(service, /screening\/applications\/\$\{applicationId\}\/release/);
  assert.match(workbench, /Approve for company submission/);
  assert.match(workbench, /Forward candidate to company/);
  assert.match(workbench, /Employer privacy gate/);
});
