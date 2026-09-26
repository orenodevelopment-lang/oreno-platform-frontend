"use client";

import { m } from "motion/react";
import { motionDurations, motionEasings } from "@/lib/motion/tokens";

export function ProgressConnector() {
  return (
    <svg className="showcase-connector" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
      <m.path d="M50 0 C15 190 85 310 50 500 C15 690 85 810 50 1000" pathLength={1} initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.34 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: motionDurations.route + 1, ease: motionEasings.standard }} />
    </svg>
  );
}
