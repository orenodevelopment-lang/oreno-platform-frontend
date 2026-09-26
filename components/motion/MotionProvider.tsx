"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";
import { PageTransition } from "./PageTransition";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <PageTransition>{children}</PageTransition>
      </LazyMotion>
    </MotionConfig>
  );
}
