export const motionDurations = {
  control: 0.16,
  feedback: 0.22,
  reveal: 0.42,
  route: 0.44,
  drawer: 0.32,
  ambient: 22,
} as const;

export const marketingMotion = {
  reveal: 0.76,
  hero: 0.92,
  stagger: 0.12,
  distance: 38,
  roleHoldMs: 4200,
} as const;

export const motionEasings = {
  standard: [0.22, 1, 0.36, 1] as const,
  emphasized: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const motionSprings = {
  control: { type: "spring" as const, stiffness: 420, damping: 30, mass: 0.7 },
  layout: { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.8 },
} as const;

export const motionStagger = {
  tight: 0.04,
  standard: 0.075,
} as const;

export const motionDistance = {
  small: 8,
  medium: 24,
  large: 36,
} as const;

export const motionOpacity = {
  hidden: 0,
  softened: 0.72,
  visible: 1,
} as const;

export const reducedMotion = {
  duration: 0.08,
  distance: 0,
  stagger: 0,
} as const;
