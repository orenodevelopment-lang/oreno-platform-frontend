"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { HomepageScrollProgress } from "./HomepageScrollProgress";
import { PageTransition } from "./PageTransition";
import { PointerFollower } from "./PointerFollower";

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <PointerFollower />
        {pathname === "/" ? (
          <>
            <HomepageScrollProgress />
            <Navbar fixed />
          </>
        ) : null}
        <PageTransition>{children}</PageTransition>
      </LazyMotion>
    </MotionConfig>
  );
}
