"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function PointerFollower() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const smoothX = useSpring(x, { stiffness: 180, damping: 25, mass: 0.3 });
  const smoothY = useSpring(y, { stiffness: 180, damping: 25, mass: 0.3 });
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce || !finePointer.matches) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX - 23);
      y.set(event.clientY - 23);
      setVisible(true);
      setInteractive(Boolean((event.target as Element | null)?.closest("a, button, input, textarea, select, [role='button']")));
    };
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <m.span
      className={`pointer-follower ${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""} ${pressed ? "is-pressed" : ""}`}
      style={{ x: smoothX, y: smoothY }}
      aria-hidden="true"
    />
  );
}
