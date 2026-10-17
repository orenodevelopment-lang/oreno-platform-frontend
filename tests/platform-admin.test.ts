import assert from "node:assert/strict";
import test from "node:test";
import { platformAdminService } from "../lib/platform-admin/service.ts";
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
  assert.ok(platformAdminRoutes.includes("/platform-admin/payments"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/audit"));
  assert.ok(platformAdminRoutes.includes("/platform-admin/system"));
});

test("role policy grants least privilege and guards full routes", () => {
  assert.equal(canAccessAdminRoute("Talent Reviewer", "talent-review/ibrahim-diallo"), true);
  assert.equal(canAccessAdminRoute("Talent Reviewer", "payments"), false);
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
  assert.equal(adminApiRoutes.companies, "/api/v1/admin/companies");
  assert.equal(adminApiRoutes.company("company-1"), "/api/v1/admin/companies/company-1");
  assert.equal(adminApiRoutes.retryJob("job-1"), "/api/v1/admin/system/jobs/job-1/retry");
});

test("fixture service exposes separate user, placement, and system records", () => {
  const talent = platformAdminService.getUser("ibrahim-diallo");
  const placement = platformAdminService.listPlacements()[0];
  assert.equal(talent.type, "Talent");
  assert.notEqual(talent.id, placement.id);
  assert.ok(platformAdminService.listServiceHealth().some((service) => service.name === "PostgreSQL" || service.type === "PostgreSQL"));
});
