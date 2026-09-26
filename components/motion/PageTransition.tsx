"use client";

import { AnimatePresence, m } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageVariants } from "@/lib/motion/variants";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <m.div className="motion-page" key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        {children}
      </m.div>
    </AnimatePresence>
  );
}
