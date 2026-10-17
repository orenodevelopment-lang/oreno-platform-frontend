"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

const roles = ["Developers", "Designers", "AI specialists"] as const;

export function HeroRoleRotator() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const interval = window.setInterval(() => setActive((current) => (current + 1) % roles.length), marketingMotion.roleHoldMs);
    return () => window.clearInterval(interval);
  }, [reduce]);

  return (
    <span className="hero__role-slot" aria-hidden="true">
      <AnimatePresence initial={false} mode="wait">
        <m.em
          className="hero__role-word"
          key={roles[active]}
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -14, filter: "blur(5px)" }}
          transition={{ duration: marketingMotion.reveal, ease: motionEasings.emphasized }}
        >
          {roles[active]}
        </m.em>
      </AnimatePresence>
    </span>
  );
}
