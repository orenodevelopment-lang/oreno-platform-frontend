"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { marketingMotion } from "@/lib/motion/tokens";

const roles = ["Designers", "Developers", "AI specialists"] as const;
const TYPE_DELAY = marketingMotion.roleTypeMs;
const DELETE_DELAY = marketingMotion.roleDeleteMs;
const HOLD_DELAY = marketingMotion.roleHoldMs;

export function HeroRoleRotator() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const word = roles[active];
    let delay: number = deleting ? DELETE_DELAY : TYPE_DELAY;
    if (!deleting && characters === word.length) delay = HOLD_DELAY;

    const timeout = window.setTimeout(() => {
      if (!deleting && characters < word.length) {
        setCharacters((current) => current + 1);
      } else if (!deleting) {
        setDeleting(true);
      } else if (characters > 0) {
        setCharacters((current) => current - 1);
      } else {
        setDeleting(false);
        setActive((current) => (current + 1) % roles.length);
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [active, characters, deleting, reduce]);

  const word = roles[active];

  return (
    <span className={`hero__role-slot ${reduce ? "is-static" : ""}`} aria-hidden="true">
      <em className="hero__role-word">{reduce ? word : word.slice(0, characters)}</em>
    </span>
  );
}
