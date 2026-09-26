import type { Variants } from "motion/react";
import { motionDistance, motionDurations, motionEasings, motionStagger } from "./tokens";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: motionDistance.medium, scale: 0.992 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: motionDurations.route, ease: motionEasings.standard } },
  exit: { opacity: 0, y: -motionDistance.small, transition: { duration: motionDurations.control, ease: motionEasings.exit } },
};

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: motionDistance.medium },
  visible: { opacity: 1, y: 0, transition: { duration: motionDurations.reveal, ease: motionEasings.standard } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: motionStagger.standard } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: motionDistance.small },
  visible: { opacity: 1, y: 0, transition: { duration: motionDurations.reveal, ease: motionEasings.standard } },
};
