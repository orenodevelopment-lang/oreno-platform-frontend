import assert from "node:assert/strict";
import test from "node:test";
import { navigationLinks } from "../data/site-content.ts";
import {
  canTransitionApplication,
  canTransitionJob,
  companyProductRoutes,
  publicProductRoutes,
  talentProductRoutes,
  validateLead,
  validatePassword,
} from "../lib/platform/product-policy.ts";

test("route manifest covers all three user surfaces", () => {
  assert.ok(publicProductRoutes.includes("/talent-catalogue"));
  assert.ok(publicProductRoutes.includes("/auth/reset-password"));
  assert.ok(companyProductRoutes.includes("/company/applications"));
  assert.ok(companyProductRoutes.includes("/company/team-members/john-doe"));
  assert.ok(companyProductRoutes.includes("/company/compensation/payments"));
  assert.ok(talentProductRoutes.includes("/talent/profile/experience"));
  assert.ok(talentProductRoutes.includes("/talent/account/security"));
  assert.ok(talentProductRoutes.includes("/talent/offers/offer-chibuokem"));
});

test("primary marketing navigation enters real product journeys", () => {
  assert.deepEqual(
    navigationLinks.map(({ label, href }) => [label, href]),
    [
      ["Find jobs", "/jobs"],
      ["Join as talent", "/auth/talent-signup"],
      ["Talent login", "/auth/talent-login"],
      ["Start hiring", "/company/signup"],
      ["Request a demo", "/request-demo"],
    ],
  );
});

test("application state transitions reject skipped or terminal changes", () => {
  assert.equal(canTransitionApplication("Submitted", "Under review"), true);
  assert.equal(canTransitionApplication("Submitted", "Accepted"), false);
  assert.equal(canTransitionApplication("Interviewing", "Offer pending"), true);
  assert.equal(canTransitionApplication("Accepted", "Withdrawn"), false);
});

test("job lifecycle supports publish and pause but protects archives", () => {
  assert.equal(canTransitionJob("Draft", "Published"), true);
  assert.equal(canTransitionJob("Published", "Paused"), true);
  assert.equal(canTransitionJob("Closed", "Published"), false);
  assert.equal(canTransitionJob("Archived", "Published"), false);
});

test("lead forms require a name and valid email", () => {
  assert.deepEqual(validateLead({ name: "", email: "wrong" }), { name: "Name is required.", email: "Enter a valid email address." });
  assert.deepEqual(validateLead({ name: "Ada", email: "ada@example.com" }), {});
});

test("password policy requires length, letters and numbers", () => {
  assert.equal(validatePassword("short"), false);
  assert.equal(validatePassword("longpassword"), false);
  assert.equal(validatePassword("oreno2026"), true);
});
