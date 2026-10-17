"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";
import { PageTransition } from "./PageTransition";
import { PointerFollower } from "./PointerFollower";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <PointerFollower />
        <PageTransition>{children}</PageTransition>
      </LazyMotion>
    </MotionConfig>
  );
}
