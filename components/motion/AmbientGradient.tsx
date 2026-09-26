"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export function AmbientGradient() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.05 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !visible) return;
    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !ref.current) return;
      const bounds = ref.current.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      ref.current.style.setProperty("--ambient-x", `${event.clientX - bounds.left}px`);
      ref.current.style.setProperty("--ambient-y", `${event.clientY - bounds.top}px`);
    };
    window.addEventListener("pointermove", followPointer);
    return () => window.removeEventListener("pointermove", followPointer);
  }, [reduce, visible]);
  return (
    <div ref={ref} className="ambient-gradient" data-motion-active={visible} aria-hidden="true">
      <span className="ambient-gradient__purple" />
      <span className="ambient-gradient__orange" />
      <span className="ambient-gradient__yellow" />
      <span className="ambient-gradient__cursor" />
    </div>
  );
}
