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

test("homepage hiring menu is restricted to company account journeys", () => {
  assert.deepEqual(
    hiringMenuLinks.map(({ label, href }) => [label, href]),
    [
      ["Start hiring", "/company/signup"],
      ["Company sign in", "/company/login"],
    ],
  );

  const hiringMenu = readFileSync(new URL("../components/HiringMenu.tsx", import.meta.url), "utf8");
  const homepageNav = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
  const publicShell = readFileSync(new URL("../components/product/PublicShell.tsx", import.meta.url), "utf8");
  assert.match(hiringMenu, /hiringMenuLinks\.map/);
  assert.match(hiringMenu, /onPointerEnter/);
  assert.match(hiringMenu, /AnimatePresence/);
  assert.match(hiringMenu, /Company workspace/);
  assert.doesNotMatch(hiringMenu, /Join as talent|Talent login/);
  assert.match(homepageNav, /<HiringMenu variant="marketing"/);
  assert.match(publicShell, /<HiringMenu variant="public"/);
  assert.doesNotMatch(publicShell.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "", /Join as talent|Talent login/);
});

test("dashboard session guards keep their shells visible while validating", () => {
  const talentGate = readFileSync(new URL("../components/TalentSessionGate.tsx", import.meta.url), "utf8");
  const companyGate = readFileSync(new URL("../components/CompanySessionGate.tsx", import.meta.url), "utf8");
  for (const source of [talentGate, companyGate]) {
    assert.match(source, /\{children\}/);
    assert.match(source, /workspace-session__progress/);
    assert.doesNotMatch(source, /Checking your (?:Oreno )?account|auth-session-loading/);
  }
});

test("OAuth unknown accounts have a controlled explicit signup path", () => {
  const auth = readFileSync(new URL("../components/product/PublicProduct.tsx", import.meta.url), "utf8");
  assert.match(auth, /account_not_found/);
  assert.match(auth, /No Oreno account was found/);
  assert.match(auth, /mode: "talent_signup"/);
  assert.match(auth, /termsAccepted/);
  assert.match(auth, /Create a talent account with/);
});

test("chat exposes persistent controls and omits unsupported calling controls", () => {
  const chat = readFileSync(new URL("../components/platform/MessagingWorkspace.tsx", import.meta.url), "utf8");
  const messaging = readFileSync(new URL("../lib/api/messaging.ts", import.meta.url), "utf8");
  assert.match(chat, /Start conversation/);
  assert.match(chat, /typing:start/);
  assert.match(chat, /message:read/);
  assert.match(chat, /Retry/);
  assert.match(chat, /archiveConversation/);
  assert.match(chat, /leaveConversation/);
  assert.doesNotMatch(chat, /Video|Phone|Audio/);
  assert.match(messaging, /MESSAGE_ATTACHMENT/);
  assert.match(messaging, /25 MB or smaller/);
  assert.match(messaging, /nextCursor/);
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
