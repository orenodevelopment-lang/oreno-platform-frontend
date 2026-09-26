"use client";

import { useReducedMotion } from "motion/react";

export function useOrenoReducedMotion() {
  return Boolean(useReducedMotion());
}
