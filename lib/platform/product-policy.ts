import type { ApplicationStatus, JobStatus } from "./contracts.ts";

export const companyProductRoutes = [
  "/company/onboarding/complete",
  "/company/team-members",
  "/company/team-members/john-doe",
  "/company/team-members/john-doe/tasks",
  "/company/team-members/john-doe/performance",
  "/company/organisation",
  "/company/access",
  "/company/access/invitations",
  "/company/access/roles",
  "/company/jobs",
  "/company/jobs/product-designer",
  "/company/jobs/product-designer/edit",
  "/company/discover",
  "/company/applications",
  "/company/applications/app-john",
  "/company/shortlists",
  "/company/interviews",
  "/company/interviews/interview-john",
  "/company/offers",
  "/company/offers/offer-chibuokem",
  "/company/placements/offer-chibuokem",
  "/company/replacements/new",
  "/company/teams",
  "/company/tasks/task-1",
  "/company/tasks/calendar",
  "/company/time",
  "/company/performance",
  "/company/compensation",
  "/company/compensation/payroll/2026-09",
  "/company/compensation/salary/john-doe",
  "/company/compensation/payments",
  "/company/notifications",
  "/company/preferences",
] as const;

export const talentProductRoutes = [
  "/talent",
  "/talent/onboarding/basics",
  "/talent/onboarding/professional",
  "/talent/onboarding/availability",
  "/talent/onboarding/complete",
  "/talent/profile",
  "/talent/profile/experience",
  "/talent/profile/education",
  "/talent/profile/certifications",
  "/talent/profile/portfolio",
  "/talent/profile/availability",
  "/talent/profile/skills",
  "/talent/account",
  "/talent/account/security",
  "/talent/account/preferences",
  "/talent/jobs",
  "/talent/jobs/product-designer",
  "/talent/jobs/product-designer/apply",
  "/talent/jobs/product-designer/apply/standard",
  "/talent/applications",
  "/talent/applications/app-john",
  "/talent/interviews/interview-john",
  "/talent/offers/offer-chibuokem",
  "/talent/team/current",
  "/talent/tasks/task-1",
  "/talent/tasks/calendar",
  "/talent/time",
  "/talent/performance",
  "/talent/compensation",
  "/talent/compensation/payments",
  "/talent/notifications",
] as const;

export const publicProductRoutes = [
  "/talent-catalogue",
  "/talent-catalogue/john-doe",
  "/jobs",
  "/jobs/product-designer",
  "/request-demo",
  "/contact",
  "/newsletter/confirmed",
  "/newsletter/unsubscribe",
  "/auth/talent-signup",
  "/auth/talent-login",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/invitations/accept",
  "/unauthorised",
  "/error-demo",
] as const;

const applicationTransitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  Submitted: ["Under review", "Withdrawn"],
  "Under review": ["Shortlisted", "Rejected", "Withdrawn"],
  Shortlisted: ["Interviewing", "Rejected", "Withdrawn"],
  Interviewing: ["Offer pending", "Rejected", "Withdrawn"],
  "Offer pending": ["Accepted", "Rejected", "Withdrawn"],
  Accepted: [],
  Rejected: [],
  Withdrawn: [],
};

const jobTransitions: Record<JobStatus, readonly JobStatus[]> = {
  Draft: ["Published", "Archived"],
  Published: ["Paused", "Closed", "Filled"],
  Paused: ["Published", "Closed", "Archived"],
  Closed: ["Archived"],
  Filled: ["Archived"],
  Archived: [],
};

export function canTransitionApplication(from: ApplicationStatus, to: ApplicationStatus) {
  return applicationTransitions[from].includes(to);
}

export function canTransitionJob(from: JobStatus, to: JobStatus) {
  return jobTransitions[from].includes(to);
}

export function validateLead(input: { name: string; email: string }) {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "Enter a valid email address.";
  return errors;
}

export function validatePassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

