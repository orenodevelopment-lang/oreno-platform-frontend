"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function PointerFollower() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const leadX = useSpring(x, { stiffness: 440, damping: 32, mass: 0.22 });
  const leadY = useSpring(y, { stiffness: 440, damping: 32, mass: 0.22 });
  const trailOneX = useSpring(leadX, { stiffness: 260, damping: 30, mass: 0.28 });
  const trailOneY = useSpring(leadY, { stiffness: 260, damping: 30, mass: 0.28 });
  const trailTwoX = useSpring(trailOneX, { stiffness: 215, damping: 29, mass: 0.32 });
  const trailTwoY = useSpring(trailOneY, { stiffness: 215, damping: 29, mass: 0.32 });
  const trailThreeX = useSpring(trailTwoX, { stiffness: 175, damping: 28, mass: 0.36 });
  const trailThreeY = useSpring(trailTwoY, { stiffness: 175, damping: 28, mass: 0.36 });
  const trailFourX = useSpring(trailThreeX, { stiffness: 145, damping: 27, mass: 0.4 });
  const trailFourY = useSpring(trailThreeY, { stiffness: 145, damping: 27, mass: 0.4 });
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);

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

  const stateClass = `${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""} ${pressed ? "is-pressed" : ""}`;

  return (
    <>
      <m.span className={`pointer-follower pointer-follower--trail pointer-follower--trail-four ${stateClass}`} style={{ x: trailFourX, y: trailFourY }} aria-hidden="true" />
      <m.span className={`pointer-follower pointer-follower--trail pointer-follower--trail-three ${stateClass}`} style={{ x: trailThreeX, y: trailThreeY }} aria-hidden="true" />
      <m.span className={`pointer-follower pointer-follower--trail pointer-follower--trail-two ${stateClass}`} style={{ x: trailTwoX, y: trailTwoY }} aria-hidden="true" />
      <m.span className={`pointer-follower pointer-follower--trail pointer-follower--trail-one ${stateClass}`} style={{ x: trailOneX, y: trailOneY }} aria-hidden="true" />
      <m.span className={`pointer-follower pointer-follower--lead ${stateClass}`} style={{ x: leadX, y: leadY }} aria-hidden="true" />
    </>
  );
}
