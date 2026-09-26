"use client";

import { m, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type PointerEvent } from "react";

export function AnimatedGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.05 });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 76]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.045]);

  function followPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--grid-pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--grid-pointer-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <div className="hero__canvas-wrap" aria-hidden="true">
      <m.div ref={ref} className="hero__canvas motion-grid" data-motion-active={visible} onPointerMove={followPointer} style={{ y: reduce ? 0 : y, scale: reduce ? 1 : scale }}>
        <span className="motion-grid__glow" />
        <span className="motion-grid__scan" />
        <span className="motion-grid__connection motion-grid__connection--one" />
        <span className="motion-grid__connection motion-grid__connection--two" />
        <span className="motion-grid__pulse motion-grid__pulse--one" />
        <span className="motion-grid__pulse motion-grid__pulse--two" />
        <span className="motion-grid__pulse motion-grid__pulse--three" />
      </m.div>
    </div>
  );
}
