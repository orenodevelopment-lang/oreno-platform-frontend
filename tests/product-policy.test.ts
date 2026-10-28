import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hiringMenuLinks, navigationLinks } from "../data/site-content.ts";
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
      ["Request a demo", "/request-demo"],
    ],
  );
});

test("start hiring menu includes company and talent account journeys", () => {
  assert.deepEqual(
    hiringMenuLinks.map(({ label, href }) => [label, href]),
    [
      ["Start hiring", "/company/signup"],
      ["Company sign in", "/company/login"],
      ["Join as talent", "/auth/talent-signup"],
      ["Talent login", "/auth/talent-login"],
    ],
  );

  const hiringMenu = readFileSync(new URL("../components/HiringMenu.tsx", import.meta.url), "utf8");
  const homepageNav = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
  const publicShell = readFileSync(new URL("../components/product/PublicShell.tsx", import.meta.url), "utf8");
  assert.match(hiringMenu, /hiringMenuLinks\.map/);
  assert.match(hiringMenu, /onPointerEnter/);
  assert.match(hiringMenu, /IDLE_ROTATION_MS/);
  assert.match(hiringMenu, /AnimatePresence/);
  assert.match(hiringMenu, /Oreno pathways/);
  assert.match(homepageNav, /<HiringMenu variant="marketing"/);
  assert.match(publicShell, /<HiringMenu variant="public"/);
  assert.doesNotMatch(publicShell.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "", /Join as talent|Talent login/);
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

test("browser transport fails closed in production and keeps operation retry keys stable", () => {
  const source = readFileSync(new URL("../lib/api/client.ts", import.meta.url), "utf8");
  assert.match(source, /API_CONFIGURATION_ERROR/);
  assert.match(source, /NEXT_PUBLIC_ORENO_API_URL is missing/);
  assert.match(source, /idempotencyKey \?\? requestId\(\)/);
  assert.match(source, /for \(let attempt = 0; attempt <= retries/);
  assert.match(source, /X-Organisation-Id/);
});

test("talent applications upload a real CV and show managed screening progress", () => {
  const service = readFileSync(new URL("../lib/platform/product-service.ts", import.meta.url), "utf8");
  const screens = readFileSync(new URL("../components/product/TalentProductScreens.tsx", import.meta.url), "utf8");
  assert.match(service, /category:\s*"CV"/);
  assert.match(service, /attachments:\s*\[\{ fileId: cv\.id, kind: "CV"/);
  assert.match(service, /\/screening\/information/);
  assert.match(screens, /Application received — awaiting Oreno screening/);
  assert.match(screens, /Oreno screening timeline/);
});
