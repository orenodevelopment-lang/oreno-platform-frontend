"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function PointerFollower() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const smoothX = useSpring(x, { stiffness: 150, damping: 24, mass: 0.34 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 24, mass: 0.34 });
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce || !finePointer.matches) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX - 18);
      y.set(event.clientY - 18);
      setVisible(true);
      setInteractive(Boolean((event.target as Element | null)?.closest("a, button, input, textarea, select, [role='button']")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <m.span
      className={`pointer-follower ${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""}`}
      style={{ x: smoothX, y: smoothY }}
      aria-hidden="true"
    />
  );
}
