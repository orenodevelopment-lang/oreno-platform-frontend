"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainer, staggerItem } from "@/lib/motion/variants";

export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <m.div className={className} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>{children}</m.div>;
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <m.div className={className} variants={staggerItem}>{children}</m.div>;
}
