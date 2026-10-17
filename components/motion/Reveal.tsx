"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

export function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" }) {
  const reduce = useReducedMotion();
  const offset = reduce ? 0 : marketingMotion.distance;
  const hidden = direction === "left"
    ? { opacity: 0, x: -offset, scale: reduce ? 1 : .975, filter: reduce ? "none" : "blur(7px)" }
    : direction === "right"
      ? { opacity: 0, x: offset, scale: reduce ? 1 : .975, filter: reduce ? "none" : "blur(7px)" }
      : { opacity: 0, y: offset, scale: reduce ? 1 : .982, filter: reduce ? "none" : "blur(7px)" };
  return (
    <m.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduce ? 0.08 : marketingMotion.reveal, delay: reduce ? 0 : delay, ease: motionEasings.standard }}
    >
      {children}
    </m.div>
  );
}
