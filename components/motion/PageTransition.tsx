"use client";

import { m } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageVariants } from "@/lib/motion/variants";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <m.div
      className="motion-page"
      key={/^\/company(?:\/|$)/.test(pathname) && !/^\/company\/(login|signup|onboarding)(?:\/|$)/.test(pathname) ? "company-workspace" : /^\/talent(?:\/|$)/.test(pathname) ? "talent-workspace" : pathname}
      variants={pageVariants}
      initial="initial"
      animate="enter"
    >
      {children}
    </m.div>
  );
}
