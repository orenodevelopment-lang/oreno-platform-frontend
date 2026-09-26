"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionDurations } from "@/lib/motion/tokens";

export function CountUp({ value, prefix = "", suffix = "", group = false }: { value: number; prefix?: string; suffix?: string; group?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!visible) return;
    if (reduce) return;
    const controls = animate(0, value, {
      duration: motionDurations.route + 0.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reduce, value, visible]);

  const renderedValue = reduce ? value : display;
  const formatted = group ? new Intl.NumberFormat("en-US").format(renderedValue) : String(renderedValue);
  return <span ref={ref} aria-label={`${prefix}${value}${suffix}`}>{prefix}{formatted}{suffix}</span>;
}
