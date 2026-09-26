"use client";

import { m, useReducedMotion, useScroll, useSpring } from "motion/react";

export function HomepageScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 190, damping: 32, mass: 0.35 });

  return (
    <m.div
      className="homepage-scroll-progress"
      style={{ scaleX: reduce ? scrollYProgress : smoothProgress }}
      aria-hidden="true"
    />
  );
}
