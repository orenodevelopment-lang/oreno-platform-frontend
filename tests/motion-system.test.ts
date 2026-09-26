import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { motionDistance, motionDurations, motionStagger, reducedMotion } from "../lib/motion/tokens.ts";

test("motion tokens stay inside the approved timing ranges", () => {
  assert.ok(motionDurations.control >= .12 && motionDurations.control <= .22);
  assert.ok(motionDurations.route >= .25 && motionDurations.route <= .45);
  assert.ok(motionStagger.standard >= .03 && motionStagger.standard <= .08);
  assert.ok(motionDurations.ambient >= 15 && motionDurations.ambient <= 30);
  assert.ok(motionDistance.medium >= 8 && motionDistance.medium <= 28);
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
  assert.doesNotMatch(page, /artboard-tail/);
  assert.match(page, /HomepageScrollProgress/);
  assert.doesNotMatch(showcase, /Gif Image here/);
  assert.match(showcase, /ShowcaseMotionScene/);
  assert.match(scenes, /useReducedMotion/);
});
