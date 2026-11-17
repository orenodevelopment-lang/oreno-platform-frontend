import type { ApplicationStatus, JobStatus } from "./contracts.ts";

export const companyProductRoutes = [
  "/company/onboarding/complete",
  "/company/team-members",
  "/company/team/:staffAssignmentId",
  "/company/organisation",
  "/company/access",
  "/company/access/invitations",
  "/company/access/roles",
  "/company/jobs",
  "/company/jobs/new",
  "/company/shortlists/:shortlistId",
  "/company/placements",
  "/company/replacements",
  "/company/files",
  "/company/files/:fileId",
  "/company/messages",
  "/company/tasks",
  "/company/departments",
  "/company/performance/periods/:periodId",
  "/company/performance/reviews",
  "/company/performance/reviews/:reviewId",
  "/company/jobs/:jobId",
  "/company/jobs/:jobId/edit",
  "/company/candidates/:personId",
  "/company/applications",
  "/company/applications/:applicationId",
  "/company/shortlists",
  "/company/interviews",
  "/company/interviews/:interviewId",
  "/company/offers",
  "/company/offers/:offerId",
  "/company/placements",
  "/company/replacements/new",
  "/company/teams",
  "/company/tasks/:taskId",
  "/company/tasks/calendar",
  "/company/time",
  "/company/performance",
  "/company/compensation",
  "/company/compensation/payroll",
  "/company/compensation/agreements",
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
  "/talent/saved-jobs",
  "/talent/messages",
  "/talent/tasks",
  "/talent/interviews",
  "/talent/offers",
  "/talent/profile/files",
  "/talent/performance/:reviewId",
  "/talent/jobs/:jobId",
  "/talent/jobs/:jobId/apply",
  "/talent/jobs/:jobId/apply/standard",
  "/talent/applications",
  "/talent/applications/:applicationId",
  "/talent/interviews/:interviewId",
  "/talent/offers/:offerId",
  "/talent/team/current",
  "/talent/tasks/:taskId",
  "/talent/tasks/calendar",
  "/talent/time",
  "/talent/performance",
  "/talent/compensation",
  "/talent/compensation/payments",
  "/talent/notifications",
] as const;

export const publicProductRoutes = [
  "/jobs",
  "/jobs/:jobId",
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

