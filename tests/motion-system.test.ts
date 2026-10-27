import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { marketingMotion, motionDistance, motionDurations, motionStagger, reducedMotion } from "../lib/motion/tokens.ts";

test("motion tokens stay inside the approved timing ranges", () => {
  assert.ok(motionDurations.control >= .12 && motionDurations.control <= .22);
  assert.ok(motionDurations.route >= .25 && motionDurations.route <= .45);
  assert.ok(motionStagger.standard >= .03 && motionStagger.standard <= .08);
  assert.ok(motionDurations.ambient >= 15 && motionDurations.ambient <= 30);
  assert.ok(motionDistance.medium >= 8 && motionDistance.medium <= 28);
  assert.ok(marketingMotion.reveal >= .6 && marketingMotion.reveal <= 1);
  assert.ok(marketingMotion.roleTypeMs >= 70 && marketingMotion.roleTypeMs <= 130);
  assert.ok(marketingMotion.roleDeleteMs >= 30 && marketingMotion.roleDeleteMs <= 80);
  assert.ok(marketingMotion.roleHoldMs >= 1200 && marketingMotion.roleHoldMs <= 2500);
});
test("reduced motion removes travel and stagger", () => {
  assert.equal(reducedMotion.distance, 0);
  assert.equal(reducedMotion.stagger, 0);
  assert.ok(reducedMotion.duration <= .1);
});
test("the global layer includes user motion preference safeguards", () => {
  const css = readFileSync(new URL("../app/motion.css", import.meta.url), "utf8");
  const provider = readFileSync(new URL("../components/motion/MotionProvider.tsx", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation-play-state:\s*paused/);
  assert.match(css, /workspace-ambient/);
  assert.match(provider, /reducedMotion="user"/);
  assert.doesNotMatch(provider, /PointerFollower/);
});
test("the root layout tolerates extension attributes and exposes the Figma mark", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /\/assets\/figma\/oreno-mark\.svg/);
  assert.match(layout, /data-scroll-behavior="smooth"/);
});

test("the homepage ships its narrative motion without the exported artboard tail", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const showcase = readFileSync(new URL("../components/ShowcaseSection.tsx", import.meta.url), "utf8");
  const scenes = readFileSync(new URL("../components/motion/ShowcaseMotionScene.tsx", import.meta.url), "utf8");
  const grid = readFileSync(new URL("../components/motion/AnimatedGrid.tsx", import.meta.url), "utf8");
  const roles = readFileSync(new URL("../components/motion/HeroRoleRotator.tsx", import.meta.url), "utf8");
  const simplified = readFileSync(new URL("../components/HiringSimplified.tsx", import.meta.url), "utf8");
  const provider = readFileSync(new URL("../components/motion/MotionProvider.tsx", import.meta.url), "utf8");
  const globalStyles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const motionStyles = readFileSync(new URL("../app/motion.css", import.meta.url), "utf8");
  assert.doesNotMatch(page, /artboard-tail/);
  assert.doesNotMatch(page, /HomepageScrollProgress/);
  assert.match(provider, /HomepageScrollProgress/);
  assert.ok(provider.indexOf("HomepageScrollProgress") < provider.indexOf("PageTransition"));
  assert.doesNotMatch(page, /HiringProcess/);
  assert.doesNotMatch(showcase, /Gif Image here/);
  assert.match(showcase, /ShowcaseMotionScene/);
  assert.match(scenes, /useReducedMotion/);
  assert.doesNotMatch(grid, /motion-grid__scan/);
  assert.match(roles, /TYPE_DELAY/);
  assert.doesNotMatch(roles, /AnimatePresence/);
  assert.doesNotMatch(simplified, /CountUp/);
  assert.doesNotMatch(page, /<Navbar compact/);
  assert.match(globalStyles, /\.navbar--fixed[\s\S]*?position:\s*fixed/);
  assert.match(globalStyles, /\.navbar--fixed[\s\S]*?background:\s*var\(--ink\)/);
  assert.match(motionStyles, /\.navbar--fixed\s*\{\s*top:\s*0/);
  assert.match(globalStyles, /\.navbar__brand:hover \.oreno-logo/);
});
