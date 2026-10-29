import { apiRequest, asArray, asRecord, dateLabel, numberValue, pageQuery, textValue, titleCase } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive, liveValue } from "@/lib/api/live-store";
import type {
  ApplicationCreateInput,
  ApplicationRecord,
  ApplicationStatus,
  CompanyTeamMemberRecord,
  ContactRequestInput,
  DemoRequestInput,
  InvitationAcceptanceInput,
  InterviewRecord,
  JobRecord,
  JobStatus,
  NotificationRecord,
  OfferDecisionInput,
  OfferRecord,
  PaymentRecord,
  PublicJobDetail,
  PublicJobSummary,
  PublicTalentProfile,
  PublicTalentSummary,
  ReplacementRequestInput,
  ShortlistRecord,
  TalentAccountCreateInput,
  TalentAccountRecord,
  TalentAccountUpdateInput,
  TalentProfileRecord,
  TalentProfileUpdateInput,
  TalentScreeningRecord,
  TaskDetailRecord,
  TimeEntryDecisionInput,
  TimeEntryRecord,
} from "./contracts";

const emptyTalent: PublicTalentProfile = { id: "", name: "Loading…", discipline: "", seniority: "", location: "", rate: "", availability: "", skills: [], vetted: false, avatar: "/assets/figma/oreno-mark.svg", bio: "", experienceYears: 0, highlights: [], portfolio: [] };
const emptyJob: PublicJobDetail = { id: "", company: "", title: "Loading…", location: "", employmentType: "", workplace: "", compensation: "", skills: [], postedAt: "", status: "Published", description: "", responsibilities: [], requirements: [], deadline: "" };
const emptyApplication: ApplicationRecord = { id: "", updatedAt: "", candidateId: "", candidateName: "Loading…", jobId: "", jobTitle: "", appliedAt: "", status: "Submitted", portfolio: "", coverNote: "", statusHistory: [] };
const emptyInterview: InterviewRecord = { id: "", applicationId: "", candidateName: "Loading…", jobTitle: "", startsAt: "", durationMinutes: 0, participants: [], meetingUrl: "", status: "Scheduled" };
const emptyOffer: OfferRecord = { id: "", applicationId: "", candidateName: "Loading…", jobTitle: "", startDate: "", compensation: "", workplace: "", status: "Draft", terms: [] };
const emptyTask: TaskDetailRecord = { id: "", updatedAt: "", title: "Loading…", description: "", status: "", priority: "Low", startDate: "", dueDate: "", assignees: [], comments: [] };
const emptyProfile: TalentProfileRecord = { id: "", updatedAt: "", name: "Loading…", headline: "", bio: "", location: "", rate: "", availability: "", profileCompletion: 0, skills: [], experience: [], education: [], certifications: [], portfolio: [], vetting: { status: "Not started", updatedAt: "", publicLabel: "Not vetted" } };
const emptyAccount: TalentAccountRecord = { id: "", profileId: "", email: "", phone: "", emailVerified: false, status: "Pending verification", createdAt: "", lastSignedInAt: "", security: { twoFactorEnabled: false, activeSessions: 0 }, preferences: { jobAlerts: true, applicationUpdates: true, profileVisibility: "Oreno companies only", marketingEmails: false } };
const emptyMember: CompanyTeamMemberRecord = { id: "", placementId: "", talentProfileId: "", companyId: "", employeeId: "", employmentTitle: "", department: "", manager: "", startDate: "", engagement: "Full time", status: "Onboarding" };

function nameOf(value: Record<string, unknown>) {
  const user = asRecord(value.user);
  return textValue(user.displayName) || `${textValue(user.firstName)} ${textValue(user.lastName)}`.trim() || textValue(value.name, "Unknown");
}

function money(value: Record<string, unknown>) {
  const minimum = value.rateMinAmount ?? value.amount ?? value.grossAmount;
  const maximum = value.rateMaxAmount;
  const currency = textValue(value.rateCurrency ?? value.currency, "USD");
  const unit = textValue(value.rateUnit).toLowerCase();
  return maximum ? `${currency} ${minimum ?? "—"}–${maximum}${unit ? ` / ${unit}` : ""}` : `${currency} ${minimum ?? "—"}${unit ? ` / ${unit}` : ""}`;
}

function mapTalent(value: unknown): PublicTalentProfile {
  const row = asRecord(value);
  const user = asRecord(row.user);
  const skills = asArray(row.skills).map((item) => textValue(asRecord(asRecord(item).skill).name) || textValue(asRecord(item).name)).filter(Boolean);
  return {
    id: textValue(row.id),
    name: textValue(user.displayName) || `${textValue(user.firstName)} ${textValue(user.lastName)}`.trim() || "Oreno talent",
    discipline: textValue(row.headline, "Independent professional"),
    seniority: titleCase(row.seniority, "Professional"),
    location: [textValue(row.city), textValue(row.countryCode)].filter(Boolean).join(", ") || "Remote",
    rate: money(row),
    availability: titleCase(row.availabilityStatus ?? row.availability, "Ask for availability"),
    skills,
    vetted: row.vettingStatus === "VETTED",
    avatar: textValue(row.avatarUrl, "/assets/figma/oreno-mark.svg"),
    bio: textValue(row.bio),
    experienceYears: Number(row.yearsExperience ?? 0),
    highlights: asArray(row.highlights).map(String),
    portfolio: asArray(row.portfolioItems ?? row.portfolio).map((item) => { const entry = asRecord(item); return { title: textValue(entry.title), category: textValue(entry.category, "Portfolio") }; }),
  };
}

function mapJob(value: unknown): PublicJobDetail {
  const row = asRecord(value);
  const organisation = asRecord(row.organisation);
  const requirements = asArray(row.requirements);
  return {
    id: textValue(row.id),
    company: textValue(organisation.name) || textValue(row.companyName, "Oreno company"),
    title: textValue(row.title, "Role"),
    location: [textValue(row.city), textValue(row.countryCode)].filter(Boolean).join(", ") || "Remote",
    employmentType: titleCase(row.employmentType),
    workplace: titleCase(row.workArrangement),
    compensation: money(row),
    skills: requirements.map((item) => textValue(asRecord(item).label)).filter(Boolean),
    postedAt: dateLabel(row.publishedAt ?? row.createdAt),
    status: "Published",
    description: textValue(row.description),
    responsibilities: textValue(row.responsibilities).split(/\r?\n/).filter(Boolean),
    requirements: requirements.map((item) => textValue(asRecord(item).description) || textValue(asRecord(item).label)).filter(Boolean),
    deadline: dateLabel(row.applicationDeadline),
  };
}

function mapCompanyJob(value: unknown): JobRecord {
  const row = asRecord(value);
  return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), title: textValue(row.title), department: textValue(row.category, "General"), openings: Number(row.openings ?? 1), applicants: Number(asRecord(row._count).applications ?? row.applicants ?? 0), hiringManager: nameOf(asRecord(row.hiringManager)), deadline: dateLabel(row.applicationDeadline), compensation: money(row), status: titleCase(row.status, "Draft") as JobRecord["status"], description: textValue(row.description) };
}

function mapApplication(value: unknown): ApplicationRecord {
  const row = asRecord(value); const talent = asRecord(row.talentProfile); const job = asRecord(row.job); const screening = asRecord(row.screening);
  return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), candidateId: textValue(row.talentProfileId), candidateName: nameOf(talent), jobId: textValue(row.jobId), jobTitle: textValue(job.title), appliedAt: dateLabel(row.submittedAt ?? row.createdAt), status: titleCase(row.status, "Submitted") as ApplicationRecord["status"], portfolio: "", coverNote: textValue(row.coverLetter), statusHistory: asArray(row.statusHistory).map((item) => { const entry = asRecord(item); return { status: titleCase(entry.status) as ApplicationRecord["status"], at: dateLabel(entry.createdAt), note: textValue(entry.note) || undefined }; }), screeningStatus: textValue(screening.status) || undefined, screeningMessage: textValue(screening.candidateMessage) || textValue(screening.failureReason) || undefined, screeningUpdatedAt: textValue(screening.updatedAt) || undefined, releasedAt: screening.releasedToCompanyAt ? dateLabel(screening.releasedToCompanyAt) : undefined, employerScreeningSummary: textValue(screening.employerSummary) || undefined };
}

function mapTalentScreening(value: unknown): TalentScreeningRecord {
  const row = asRecord(value); const application = asRecord(row.application); const job = asRecord(application.job); const organisation = asRecord(job.organisation);
  return {
    applicationId: textValue(row.applicationId), status: textValue(row.status), updatedAt: textValue(row.updatedAt),
    candidateMessage: textValue(row.candidateMessage), failureReason: textValue(row.failureReason), releasedAt: row.releasedToCompanyAt ? dateLabel(row.releasedToCompanyAt) : "",
    company: textValue(organisation.name), jobTitle: textValue(job.title),
    timeline: asArray(row.history).map((item) => { const entry = asRecord(item); return { status: textValue(entry.toStatus), action: textValue(entry.action), reason: textValue(entry.reason) || undefined, at: dateLabel(entry.createdAt) }; }),
    informationRequests: asArray(row.informationRequests).map((item) => { const request = asRecord(item); return { id: textValue(request.id), message: textValue(request.message), respondedAt: request.respondedAt ? dateLabel(request.respondedAt) : undefined, createdAt: dateLabel(request.createdAt) }; }),
    interviews: asArray(row.interviews).map((item) => { const interview = asRecord(item); return { id: textValue(interview.id), status: textValue(interview.status), mode: textValue(interview.mode), startsAt: textValue(interview.scheduledStartAt), endsAt: textValue(interview.scheduledEndAt), timeZone: textValue(interview.timeZone), meetingUrl: textValue(interview.meetingUrl), location: textValue(interview.location), feedback: textValue(interview.candidateVisibleFeedback), outcome: textValue(interview.outcome), updatedAt: textValue(interview.updatedAt) }; }),
  };
}

async function wait(milliseconds: number) { await new Promise((resolve) => window.setTimeout(resolve, milliseconds)); }

async function uploadReadyCv(file: File) {
  const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowed.includes(file.type)) throw new Error("Upload a PDF, DOC, or DOCX CV.");
  const initiated = await apiRequest<{ file: { id: string }; upload: { uploadUrl: string; method: "PUT" | "POST"; headers?: Record<string, string>; fields?: Record<string, string> } }>("/api/v1/files/uploads", { method: "POST", body: { category: "CV", originalName: file.name, mimeType: file.type, sizeBytes: file.size } });
  let uploadResponse: Response;
  if (initiated.upload.method === "POST") {
    const form = new FormData(); Object.entries(initiated.upload.fields ?? {}).forEach(([key, value]) => form.append(key, value)); form.append("file", file);
    uploadResponse = await fetch(initiated.upload.uploadUrl, { method: "POST", body: form });
  } else {
    uploadResponse = await fetch(initiated.upload.uploadUrl, { method: "PUT", headers: initiated.upload.headers, body: file });
  }
  if (!uploadResponse.ok) throw new Error("The CV upload could not be completed.");
  let completed = asRecord((await apiRequest<{ file: unknown }>(`/api/v1/files/${initiated.file.id}/complete`, { method: "POST", body: {} })).file);
  for (let attempt = 0; attempt < 30 && textValue(completed.status) !== "READY"; attempt += 1) {
    if (["REJECTED", "DELETED"].includes(textValue(completed.status))) throw new Error("The CV did not pass the file security check.");
    await wait(2_000);
    completed = asRecord((await apiRequest<{ file: unknown }>(`/api/v1/files/${initiated.file.id}`)).file);
  }
  if (textValue(completed.status) !== "READY") throw new Error("Your CV is still being checked for safety. Please try again shortly.");
  return { id: initiated.file.id, name: file.name };
}

function mapInterview(value: unknown): InterviewRecord { const row = asRecord(value); const application = asRecord(row.application); const start = textValue(row.scheduledStartAt ?? row.startsAt); const end = textValue(row.scheduledEndAt); const durationMinutes = start && end ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000)) : Number(row.durationMinutes ?? 0); return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), applicationId: textValue(row.applicationId), candidateName: nameOf(asRecord(application.talentProfile)), jobTitle: textValue(asRecord(application.job).title), startsAt: start, durationMinutes, participants: asArray(row.participants).map((item) => nameOf(asRecord(item))), meetingUrl: textValue(row.meetingUrl), status: titleCase(row.status, "Scheduled") as InterviewRecord["status"], outcome: row.outcome ? titleCase(asRecord(row.outcome).result ?? row.outcome) as InterviewRecord["outcome"] : undefined }; }
function mapOffer(value: unknown): OfferRecord { const row = asRecord(value); const application = asRecord(row.application); return { id: textValue(row.id), applicationId: textValue(row.applicationId), candidateName: nameOf(asRecord(application.talentProfile)), jobTitle: textValue(asRecord(application.job).title), startDate: dateLabel(row.startDate), compensation: money(row), workplace: titleCase(row.workArrangement), status: titleCase(row.status, "Draft") as OfferRecord["status"], terms: asArray(row.terms).map(String) }; }
function mapTask(value: unknown): TaskDetailRecord { const row = asRecord(value); return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), title: textValue(row.title), description: textValue(row.description), status: titleCase(row.status), priority: titleCase(row.priority, "Low") as TaskDetailRecord["priority"], startDate: dateLabel(row.startDate), dueDate: dateLabel(row.dueDate), assignees: asArray(row.assignees).map((item) => { const assignment = asRecord(item); return nameOf(asRecord(assignment.staffAssignment ?? assignment)); }), comments: asArray(row.comments).map((item) => { const entry = asRecord(item); return { id: textValue(entry.id), author: nameOf(asRecord(entry.author)), body: textValue(entry.body), createdAt: dateLabel(entry.createdAt) }; }) }; }

async function organisationId() {
  const current = await authApi.current();
  if (!current.context.organisationId) throw new Error("Select an organisation before using the company workspace.");
  return current.context.organisationId;
}

async function orgRequest<T>(suffix: string, options?: Parameters<typeof apiRequest<T>>[1]) {
  const selectedOrganisationId = await organisationId();
  return apiRequest<T>(`/api/v1/organisations/${selectedOrganisationId}${suffix}`, {
    ...options,
    organisationId: selectedOrganisationId,
  });
}

function listResource<T>(key: string, property: string, path: string, mapper: (value: unknown) => T) {
  return liveValue<T[]>(key, [], async () => {
    const result = await apiRequest<Record<string, unknown>>(path, { query: pageQuery() });
    return asArray(result[property]).map(mapper);
  });
}

function orgListResource<T>(key: string, property: string, suffix: string, mapper: (value: unknown) => T) {
  return liveValue<T[]>(key, [], async () => {
    const result = await orgRequest<Record<string, unknown>>(suffix, { query: pageQuery() });
    return asArray(result[property]).map(mapper);
  });
}

export const productService = {
  getCompanyOnboarding: () => liveValue("org:onboarding", {
    organisationId: "",
    firstName: "",
    lastName: "",
    name: "",
    primaryContactEmail: "",
    companySize: "",
    industry: "",
    websiteUrl: "",
    description: "",
    primaryContactPhone: "",
    timeZone: "Africa/Lagos",
    countryCode: "NG",
    organisationUpdatedAt: "",
    updatedAt: "",
    completedAt: null as string | null,
  }, async () => {
    const [current, result] = await Promise.all([
      authApi.current(),
      orgRequest<{ onboarding: unknown }>("/onboarding"),
    ]);
    const organisation = asRecord(result.onboarding);
    const progress = asRecord(organisation.onboarding);
    return {
      organisationId: current.context.organisationId ?? "",
      firstName: current.user.firstName,
      lastName: current.user.lastName,
      name: textValue(organisation.name),
      primaryContactEmail: textValue(organisation.primaryContactEmail, current.user.email),
      companySize: textValue(organisation.companySize),
      industry: textValue(organisation.industry),
      websiteUrl: textValue(organisation.websiteUrl),
      description: textValue(organisation.description),
      primaryContactPhone: textValue(organisation.primaryContactPhone),
      timeZone: textValue(organisation.timeZone, "Africa/Lagos"),
      countryCode: textValue(organisation.countryCode, "NG"),
      organisationUpdatedAt: textValue(organisation.updatedAt),
      updatedAt: textValue(progress.updatedAt),
      completedAt: textValue(progress.completedAt) || null,
    };
  }),
  updateCompanyOnboarding: async (input: Record<string, unknown>) => {
    const result = await orgRequest("/onboarding", { method: "PATCH", body: input });
    invalidateLive("org:onboarding");
    return result;
  },
  completeCompanyOnboarding: async () => {
    const result = await orgRequest("/onboarding/complete", { method: "POST", body: {} });
    invalidateLive("org:onboarding");
    return result;
  },
  updateOrganisationProfile: async (input: { expectedUpdatedAt: string; name: string; primaryContactEmail: string; industry?: string; companySize?: string; websiteUrl?: string; primaryContactPhone?: string; description?: string }) => {
    const result = await orgRequest("", { method: "PATCH", body: { expectedUpdatedAt: input.expectedUpdatedAt, name: input.name, primaryContactEmail: input.primaryContactEmail, industry: input.industry || null, companySize: input.companySize || null, websiteUrl: input.websiteUrl || null, primaryContactPhone: input.primaryContactPhone || null, description: input.description || null } });
    invalidateLive("org:onboarding");
    return result;
  },
  inviteCompanyMember: async (input: { email: string; firstName: string; lastName: string; role: "HR_USER" | "MANAGER"; message?: string }) => {
    const result = await orgRequest("/invitations", { method: "POST", body: input });
    invalidateLive("org:invitations");
    return result;
  },
  listCompanyMembers: () => orgListResource("org:members", "members", "/members", (value) => {
    const row = asRecord(value);
    const user = asRecord(row.user);
    return { id: textValue(row.id), name: nameOf(user), email: textValue(user.email), role: titleCase(asRecord(row.role).key ?? row.roleKey ?? row.role), status: titleCase(row.status), scope: textValue(row.scope, "Organisation workspace") };
  }),
  listCompanyInvitations: () => orgListResource("org:invitations", "invitations", "/invitations", (value) => {
    const row = asRecord(value);
    return { id: textValue(row.id), email: textValue(row.email), role: titleCase(row.role), invitedBy: nameOf(asRecord(row.invitedBy)), expires: dateLabel(row.expiresAt), status: titleCase(row.state ?? row.status) };
  }),
  resendCompanyInvitation: async (id: string) => { const result = await orgRequest(`/invitations/${id}/resend`, { method: "POST", body: { reason: "Resent by an authorised workspace member." } }); invalidateLive("org:invitations"); return result; },
  revokeCompanyInvitation: async (id: string) => { const result = await orgRequest(`/invitations/${id}/revoke`, { method: "POST", body: { reason: "Cancelled by an authorised workspace member." } }); invalidateLive("org:invitations"); return result; },
  listPublicTalents: (): PublicTalentSummary[] => listResource("public:talents", "talents", "/api/v1/public/talents", mapTalent),
  getPublicTalent: (id: string) => liveValue(`public:talent:${id}`, { ...emptyTalent, id }, async () => mapTalent((await apiRequest<{ profile: unknown }>(`/api/v1/public/talents/${id}`)).profile)),
  listPublicJobs: (): PublicJobSummary[] => listResource("public:jobs", "jobs", "/api/v1/public/jobs", mapJob),
  getPublicJob: (id: string) => liveValue(`public:job:${id}`, { ...emptyJob, id }, async () => mapJob((await apiRequest<{ job: unknown }>(`/api/v1/public/jobs/${id}`)).job)),
  listCompanyJobs: () => orgListResource("org:jobs", "jobs", "/jobs", mapCompanyJob),
  getCompanyJob: (id: string) => liveValue(`org:job:${id}`, { ...mapCompanyJob(emptyJob), id }, async () => mapCompanyJob((await orgRequest<{ job: unknown }>(`/jobs/${id}`)).job)),
  transitionCompanyJob: async (id: string, status: JobStatus) => {
    const current = asRecord((await orgRequest<{ job: unknown }>(`/jobs/${id}`)).job);
    if (!current.updatedAt) throw new Error("Refresh this job before changing its status.");
    const command = ({ Published: "publish", Paused: "pause", Closed: "close", Archived: "archive", Filled: "fill" } as Partial<Record<JobStatus, string>>)[status];
    if (!command) throw new Error(`The ${status} transition is not available from this screen.`);
    const result = await orgRequest(`/jobs/${id}/${command}`, { method: "POST", idempotent: true, body: { expectedUpdatedAt: current.updatedAt, reason: `Changed to ${status} from the company workspace.` } });
    invalidateLive("org:jobs");
    invalidateLive(`org:job:${id}`);
    return result;
  },
  updateCompanyJob: async (id: string, input: { title: string; category?: string; openings: number; description: string }) => {
    const current = asRecord((await orgRequest<{ job: unknown }>(`/jobs/${id}`)).job);
    if (!current.updatedAt) throw new Error("Refresh this job before editing it.");
    const result = await orgRequest(`/jobs/${id}`, { method: "PATCH", body: { expectedUpdatedAt: current.updatedAt, title: input.title, category: input.category || null, openings: input.openings, description: input.description } });
    invalidateLive("org:jobs");
    invalidateLive(`org:job:${id}`);
    return result;
  },
  listApplications: () => orgListResource("org:applications", "applications", "/applications", mapApplication),
  getApplication: (id: string) => liveValue(`org:application:${id}`, { ...emptyApplication, id }, async () => mapApplication((await orgRequest<{ application: unknown }>(`/applications/${id}`)).application)),
  updateApplicationStatus: async (id: string, status: ApplicationStatus, reason?: string) => {
    const current = asRecord((await orgRequest<{ application: unknown }>(`/applications/${id}`)).application);
    if (!current.updatedAt) throw new Error("Refresh this application before changing its status.");
    const apiStatus = status.toUpperCase().replaceAll(" ", "_");
    const result = await orgRequest(`/applications/${id}/status`, { method: "POST", body: { status: apiStatus, expectedUpdatedAt: current.updatedAt, reason } });
    invalidateLive("org:applications");
    invalidateLive(`org:application:${id}`);
    return result;
  },
  listShortlists: (): ShortlistRecord[] => orgListResource("org:shortlists", "shortlists", "/shortlists", (value) => { const row = asRecord(value); return { id: textValue(row.id), name: textValue(row.name), jobTitle: textValue(asRecord(row.job).title), owner: nameOf(asRecord(row.owner)), candidateIds: asArray(row.candidates).map((item) => textValue(asRecord(item).talentProfileId)), updatedAt: dateLabel(row.updatedAt) }; }),
  listInterviews: () => orgListResource("org:interviews", "interviews", "/interviews", mapInterview),
  getInterview: (id: string) => productService.listInterviews().find((item) => item.id === id) ?? { ...emptyInterview, id },
  createInterview: async (input: { applicationId: string; scheduledStartAt: string; scheduledEndAt: string; timeZone: string; meetingUrl?: string }) => { const result = await orgRequest("/interviews", { method: "POST", body: { applicationId: input.applicationId, stage: "Hiring interview", stageOrder: 1, mode: "VIDEO", scheduledStartAt: input.scheduledStartAt, scheduledEndAt: input.scheduledEndAt, timeZone: input.timeZone, meetingUrl: input.meetingUrl || null, participants: [] } }); invalidateLive("org:interviews"); return result; },
  recordInterviewOutcome: async (id: string, outcome: "Advance" | "Hold" | "Reject", notes: string) => { const result = await orgRequest<Record<string, unknown>>("/interviews", { query: pageQuery(1, 100) }); const current = asArray(result.interviews).map(asRecord).find((item) => item.id === id); if (!current?.updatedAt) throw new Error("Refresh this interview before recording its outcome."); const decision = await orgRequest(`/interviews/${id}/outcome`, { method: "POST", body: { expectedUpdatedAt: current.updatedAt, result: outcome === "Advance" ? "PASSED" : outcome === "Hold" ? "ON_HOLD" : "FAILED", summary: notes || null } }); invalidateLive("org:interviews"); return decision; },
  listOffers: () => orgListResource("org:offers", "offers", "/offers", mapOffer),
  getOffer: (id: string) => productService.listOffers().find((item) => item.id === id) ?? { ...emptyOffer, id },
  createOffer: async (input: { applicationId: string; title: string; employmentType: string; workArrangement: string; startDate?: string; expiresAt?: string; amount: string; currency: string; rateUnit: string; additionalTerms?: string }) => { const terms = [{ key: "compensation", label: "Compensation", valueAmount: input.amount, currency: input.currency, rateUnit: input.rateUnit, position: 0 }, ...(input.additionalTerms ? [{ key: "additional_terms", label: "Additional terms", valueText: input.additionalTerms, position: 1 }] : [])]; const result = await orgRequest("/offers", { method: "POST", idempotent: true, body: { applicationId: input.applicationId, title: input.title, employmentType: input.employmentType, workArrangement: input.workArrangement, startDate: input.startDate || null, expiresAt: input.expiresAt || null, terms } }); invalidateLive("org:offers"); return result; },
  listNotifications: (): NotificationRecord[] => listResource("account:notifications", "notifications", "/api/v1/notifications", (value) => { const row = asRecord(value); return { id: textValue(row.id), title: textValue(row.title), body: textValue(row.body), category: titleCase(row.category, "Account") as NotificationRecord["category"], createdAt: dateLabel(row.createdAt), read: Boolean(row.readAt), href: textValue(row.actionUrl, "/") }; }),
  markNotificationRead: async (id: string) => { const result = await apiRequest(`/api/v1/notifications/${id}/read`, { method: "POST", body: {} }); invalidateLive("account:notifications"); return result; },
  markAllNotificationsRead: async () => { const result = await apiRequest("/api/v1/notifications/read-all", { method: "POST", body: {} }); invalidateLive("account:notifications"); return result; },
  listNotificationPreferences: () => listResource("account:notification-preferences", "preferences", "/api/v1/notifications/preferences", (value) => { const row = asRecord(value); return { eventKey: textValue(row.eventKey), enabled: row.enabled !== false }; }),
  setNotificationPreference: async (eventKey: string, enabled: boolean) => { const result = await apiRequest("/api/v1/notifications/preferences", { method: "PUT", body: { eventKey, enabled } }); invalidateLive("account:notification-preferences"); return result; },
  listTimeEntries: (): TimeEntryRecord[] => orgListResource("org:time", "timeEntries", "/time-entries", (value) => { const row = asRecord(value); return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), person: nameOf(asRecord(row.talentProfile)), period: dateLabel(row.workDate), regularHours: Number(row.ordinaryMinutes ?? 0) / 60, overtimeHours: Number(row.overtimeMinutes ?? 0) / 60, status: titleCase(row.status, "Draft") as TimeEntryRecord["status"], note: textValue(row.note) || undefined }; }),
  listPaymentRecords: (): PaymentRecord[] => orgListResource("org:payments", "payments", "/payments", (value) => { const row = asRecord(value); return { id: textValue(row.id), person: nameOf(asRecord(row.talentProfile)), payrollPeriod: textValue(asRecord(row.payrollPeriod).reference) || dateLabel(row.createdAt), amount: String(row.amount ?? "0"), currency: textValue(row.currency), methodDescription: titleCase(row.method, "External payment"), externalReference: textValue(row.externalReference), status: titleCase(row.status, "Pending confirmation") as PaymentRecord["status"], paidAt: row.paidAt ? dateLabel(row.paidAt) : undefined }; }),
  getTalentProfile: () => liveValue("talent:profile", emptyProfile, async () => {
    const row = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile);
    const publicProfile = mapTalent(row);
    return {
      ...emptyProfile,
      id: publicProfile.id,
      updatedAt: textValue(row.updatedAt),
      name: publicProfile.name,
      headline: publicProfile.discipline,
      bio: publicProfile.bio,
      location: publicProfile.location,
      rate: publicProfile.rate,
      availability: publicProfile.availability,
      profileCompletion: Number(row.completionPercent ?? 0),
      skills: asArray(row.skills).map((item) => ({
        name: textValue(asRecord(asRecord(item).skill).name) || textValue(asRecord(item).name),
        level: titleCase(asRecord(item).proficiency, "Working") as "Working" | "Advanced" | "Expert",
      })),
      experience: asArray(row.experience ?? row.experiences).map((item, index) => {
        const entry = asRecord(item);
        return {
          id: textValue(entry.id, `experience-${index}`),
          role: textValue(entry.role) || textValue(entry.title),
          company: textValue(entry.company) || textValue(entry.companyName),
          period: textValue(entry.period) || [dateLabel(entry.startDate), entry.current ? "Present" : dateLabel(entry.endDate)].join(" - "),
          summary: textValue(entry.summary) || textValue(entry.description),
        };
      }),
      education: asArray(row.education).map((item, index) => {
        const entry = asRecord(item);
        return {
          id: textValue(entry.id, `education-${index}`),
          school: textValue(entry.school) || textValue(entry.institution),
          qualification: textValue(entry.qualification) || textValue(entry.degree),
          period: textValue(entry.period) || [dateLabel(entry.startDate), dateLabel(entry.endDate)].join(" - "),
        };
      }),
      certifications: asArray(row.certifications).map((item, index) => {
        const entry = asRecord(item);
        return {
          id: textValue(entry.id, `certification-${index}`),
          name: textValue(entry.name),
          issuer: textValue(entry.issuer),
          issuedAt: dateLabel(entry.issuedAt ?? entry.issueDate),
        };
      }),
      portfolio: asArray(row.portfolioItems ?? row.portfolio).map((item, index) => {
        const entry = asRecord(item);
        return {
          id: textValue(entry.id, `portfolio-${index}`),
          title: textValue(entry.title),
          category: textValue(entry.category, "Portfolio"),
          url: textValue(entry.url) || textValue(entry.projectUrl),
        };
      }),
      vetting: {
        status: titleCase(row.vettingStatus, "Not started") as TalentProfileRecord["vetting"]["status"],
        updatedAt: dateLabel(row.updatedAt),
        publicLabel: publicProfile.vetted ? "Vetted" : "Not vetted",
      },
    };
  }),
  updateTalentProfile: async (input: TalentProfileUpdateInput) => {
    const current = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile);
    const result = await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile", {
      method: "PATCH",
      body: {
        expectedUpdatedAt: input.expectedUpdatedAt || textValue(current.updatedAt),
        ...(input.headline !== undefined ? { headline: input.headline || null } : {}),
        ...(input.bio !== undefined ? { bio: input.bio || null } : {}),
      },
    });
    invalidateLive("talent:profile");
    return result;
  },
  updateTalentOnboardingProfile: async (input: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    city?: string;
    countryCode?: string;
    yearsExperience?: number;
    currentTitle?: string;
    portfolioUrl?: string;
  }) => {
    const current = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile);
    const profileBody = {
      expectedUpdatedAt: textValue(current.updatedAt),
      ...(input.headline !== undefined ? { headline: input.headline || null } : {}),
      ...(input.bio !== undefined ? { bio: input.bio || null } : {}),
      ...(input.city !== undefined ? { city: input.city || null } : {}),
      ...(input.countryCode !== undefined ? { countryCode: input.countryCode ? input.countryCode.toUpperCase() : null } : {}),
      ...(input.yearsExperience !== undefined ? { yearsExperience: input.yearsExperience } : {}),
      ...(input.currentTitle !== undefined ? { currentTitle: input.currentTitle || null } : {}),
      ...(input.portfolioUrl !== undefined ? { portfolioUrl: input.portfolioUrl || null } : {}),
    };
    const requests: Promise<unknown>[] = [apiRequest("/api/v1/talents/me/profile", { method: "PATCH", body: profileBody })];
    if (input.firstName !== undefined || input.lastName !== undefined) {
      requests.push(apiRequest("/api/v1/auth/me", { method: "PATCH", body: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      } }));
    }
    const result = await Promise.all(requests);
    invalidateLive("talent:profile");
    return result;
  },
  updateTalentAvailability: async (input: {
    availabilityStatus: "AVAILABLE_NOW" | "AVAILABLE_FROM_DATE" | "UNAVAILABLE";
    availableFrom: string | null;
    preferredEmploymentTypes: Array<"FULL_TIME" | "PART_TIME" | "CONTRACT">;
    preferredWorkArrangement: "REMOTE" | "HYBRID" | "ONSITE" | null;
    hoursPerWeek: number | null;
    expectedRateAmount: string | null;
    expectedRateCurrency: string | null;
    expectedRateUnit: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  }) => {
    const current = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile);
    const result = await apiRequest("/api/v1/talents/me/availability", {
      method: "PATCH",
      body: { expectedUpdatedAt: textValue(current.updatedAt), ...input },
    });
    invalidateLive("talent:profile");
    return result;
  },
  completeTalentOnboarding: async () => {
    const result = await apiRequest("/api/v1/talents/me/onboarding/complete", { method: "POST" });
    invalidateLive("talent:profile");
    return result;
  },
  getTalentAccount: () => liveValue("talent:account", emptyAccount, async () => {
    const row = asRecord((await apiRequest<{ account: unknown }>("/api/v1/talents/me/account")).account);
    const preferences = asRecord(row.preferences);
    const visibility = textValue(preferences.profileVisibility);
    return {
      ...emptyAccount,
      id: textValue(row.id),
      profileId: textValue(row.profileId),
      email: textValue(row.email),
      phone: textValue(row.phone),
      emailVerified: Boolean(row.emailVerified),
      status: row.status === "ACTIVE" ? "Active" : row.status === "SUSPENDED" ? "Suspended" : "Pending verification",
      createdAt: dateLabel(row.createdAt),
      lastSignedInAt: dateLabel(row.lastSignedInAt),
      security: {
        twoFactorEnabled: Boolean(asRecord(row.security).twoFactorEnabled),
        activeSessions: numberValue(asRecord(row.security).activeSessions),
      },
      preferences: {
        jobAlerts: preferences.jobAlerts !== false,
        applicationUpdates: preferences.applicationUpdates !== false,
        marketingEmails: Boolean(preferences.marketingEmails),
        profileVisibility: visibility === "PUBLIC" ? "Public" : visibility === "PRIVATE" ? "Private" : "Oreno companies only",
      },
    } as TalentAccountRecord;
  }),
  listTalentApplications: () => listResource("talent:applications", "applications", "/api/v1/talents/me/applications", mapApplication),
  getTalentApplication: (id: string) => productService.listTalentApplications().find((item) => item.id === id) ?? { ...emptyApplication, id },
  getTalentScreening: (applicationId: string): TalentScreeningRecord => liveValue(
    `talent:screening:${applicationId}`,
    { applicationId, status: "", updatedAt: "", candidateMessage: "", failureReason: "", releasedAt: "", company: "", jobTitle: "", timeline: [], informationRequests: [], interviews: [] },
    async () => mapTalentScreening((await apiRequest<{ screening: unknown }>(`/api/v1/talents/me/applications/${applicationId}/screening`)).screening),
  ),
  submitScreeningInformation: async (applicationId: string, responseText: string) => {
    const current = productService.getTalentScreening(applicationId);
    if (!current.updatedAt) throw new Error("Refresh the application before submitting information.");
    const result = await apiRequest(`/api/v1/talents/me/applications/${applicationId}/screening/information`, { method: "POST", body: { expectedUpdatedAt: current.updatedAt, responseText } });
    invalidateLive(`talent:screening:${applicationId}`); invalidateLive("talent:applications");
    return result;
  },
  listTalentInterviews: () => listResource("talent:interviews", "interviews", "/api/v1/talents/me/interviews", mapInterview),
  getTalentInterview: (id: string) => productService.listTalentInterviews().find((item) => item.id === id) ?? { ...emptyInterview, id },
  listTalentOffers: () => listResource("talent:offers", "offers", "/api/v1/talents/me/offers", mapOffer),
  getTalentOffer: (id: string) => productService.listTalentOffers().find((item) => item.id === id) ?? { ...emptyOffer, id },
  createTalentAccount: (input: TalentAccountCreateInput) => apiRequest("/api/v1/auth/register", { method: "POST", idempotent: true, body: { accountType: "TALENT", email: input.email, password: input.password, firstName: input.firstName, lastName: input.lastName, acceptTerms: true } }),
  updateTalentAccount: async (input: TalentAccountUpdateInput) => {
    const preferences = input.preferences ?? {};
    const accountPreferences = {
      ...(preferences.jobAlerts !== undefined ? { jobAlerts: preferences.jobAlerts } : {}),
      ...(preferences.applicationUpdates !== undefined ? { applicationUpdates: preferences.applicationUpdates } : {}),
      ...(preferences.marketingEmails !== undefined ? { marketingEmails: preferences.marketingEmails } : {}),
    };
    const requests: Promise<unknown>[] = [];
    if (input.phone !== undefined) requests.push(apiRequest("/api/v1/auth/me", { method: "PATCH", body: { phone: input.phone || null } }));
    if (Object.keys(accountPreferences).length) requests.push(apiRequest("/api/v1/talents/me/account/preferences", { method: "PATCH", body: accountPreferences }));
    if (preferences.profileVisibility !== undefined) {
      const profile = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile);
      const visibility = preferences.profileVisibility === "Public" ? "PUBLIC" : preferences.profileVisibility === "Private" ? "PRIVATE" : "ORENO_COMPANIES_ONLY";
      requests.push(apiRequest("/api/v1/talents/me/visibility", { method: "PATCH", body: { expectedUpdatedAt: textValue(profile.updatedAt), visibility } }));
    }
    const result = await Promise.all(requests);
    invalidateLive("talent:account");
    invalidateLive("talent:profile");
    return result;
  },
  verifyTalentEmail: (token: string) => apiRequest("/api/v1/auth/email/verify", { method: "POST", body: { token } }),
  getCompanyTeamMember: (talentProfileId: string) => productService.listCompanyTeamMembers().find((item) => item.talentProfileId === talentProfileId) ?? { ...emptyMember, talentProfileId },
  listCompanyTeamMembers: (): CompanyTeamMemberRecord[] => orgListResource("org:team", "teamMembers", "/team-members", (value) => { const row = asRecord(value); return { id: textValue(row.id), placementId: textValue(row.placementId), talentProfileId: textValue(row.talentProfileId), companyId: textValue(row.organisationId), employeeId: textValue(row.employeeCode), employmentTitle: textValue(row.title), department: textValue(asRecord(row.department).name), manager: nameOf(asRecord(row.manager)), startDate: dateLabel(row.startDate), engagement: titleCase(row.engagementType, "Full time") as CompanyTeamMemberRecord["engagement"], status: titleCase(row.status, "Onboarding") as CompanyTeamMemberRecord["status"] }; }),
  listTalentTasks: () => listResource("talent:tasks", "tasks", "/api/v1/talents/me/tasks", mapTask),
  getTaskDetail: (id: string) => liveValue(`talent:task:${id}`, { ...emptyTask, id }, async () => mapTask((await apiRequest<{ task: unknown }>(`/api/v1/talents/me/tasks/${id}`)).task)),
  transitionTalentTask: async (id: string, status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELLED") => { const current = asRecord((await apiRequest<{ task: unknown }>(`/api/v1/talents/me/tasks/${id}`)).task); const result = await apiRequest(`/api/v1/talents/me/tasks/${id}/status`, { method: "POST", body: { expectedUpdatedAt: current.updatedAt, status } }); invalidateLive("talent:tasks"); invalidateLive(`talent:task:${id}`); return result; },
  addTalentTaskComment: async (id: string, body: string) => { const result = await apiRequest(`/api/v1/talents/me/tasks/${id}/comments`, { method: "POST", body: { body } }); invalidateLive(`talent:task:${id}`); return result; },
  listCompanyTasks: () => orgListResource("org:tasks", "tasks", "/tasks", mapTask),
  getCompanyTaskDetail: (id: string) => liveValue(`org:task:${id}`, { ...emptyTask, id }, async () => mapTask((await orgRequest<{ task: unknown }>(`/tasks/${id}`)).task)),
  transitionCompanyTask: async (id: string, status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELLED") => { const current = asRecord((await orgRequest<{ task: unknown }>(`/tasks/${id}`)).task); const result = await orgRequest(`/tasks/${id}/status`, { method: "POST", body: { expectedUpdatedAt: current.updatedAt, status } }); invalidateLive("org:tasks"); invalidateLive(`org:task:${id}`); return result; },
  addCompanyTaskComment: async (id: string, body: string) => { const result = await orgRequest(`/tasks/${id}/comments`, { method: "POST", body: { body } }); invalidateLive(`org:task:${id}`); return result; },
  listCompanyDepartments: () => orgListResource("org:departments", "departments", "/departments", (value) => { const row = asRecord(value); return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), name: textValue(row.name), description: textValue(row.description), parentId: textValue(row.parentId), position: Number(row.position ?? 0) }; }),
  createCompanyDepartment: async (input: { name: string; description?: string; parentId?: string }) => { const result = await orgRequest("/departments", { method: "POST", body: { name: input.name, description: input.description || null, parentId: input.parentId || null, position: 0 } }); invalidateLive("org:departments"); return result; },
  listCompanyTeams: () => orgListResource("org:teams", "teams", "/teams", (value) => { const row = asRecord(value); return { id: textValue(row.id), updatedAt: textValue(row.updatedAt), name: textValue(row.name), description: textValue(row.description), departmentId: textValue(row.departmentId), departmentName: textValue(asRecord(row.department).name) }; }),
  createCompanyTeam: async (input: { name: string; description?: string; departmentId?: string }) => { const result = await orgRequest("/teams", { method: "POST", body: { name: input.name, description: input.description || null, departmentId: input.departmentId || null } }); invalidateLive("org:teams"); return result; },
  listPerformancePeriods: () => orgListResource("org:performance-periods", "periods", "/performance/periods", (value) => { const row = asRecord(value); return { id: textValue(row.id), name: textValue(row.name), startDate: dateLabel(row.startDate), endDate: dateLabel(row.endDate), status: titleCase(row.status), updatedAt: textValue(row.updatedAt) }; }),
  createPerformancePeriod: async (input: { name: string; startDate: string; endDate: string }) => { const result = await orgRequest("/performance/periods", { method: "POST", body: input }); invalidateLive("org:performance-periods"); return result; },
  submitDemoRequest: (input: DemoRequestInput) => apiRequest("/api/v1/public/demo-requests", { method: "POST", body: { fullName: input.name, email: input.workEmail, companyName: input.company, companySize: input.teamSize, message: input.message, source: "website" } }),
  submitContactRequest: (input: ContactRequestInput) => apiRequest("/api/v1/public/contact-requests", { method: "POST", body: { fullName: input.name, email: input.email, subject: input.topic, message: input.message, source: "website" } }),
  subscribeNewsletter: (email: string) => apiRequest<{ accepted: true }>("/api/v1/public/newsletter/subscribe", { method: "POST", body: { email, consent: true, policyVersion: "privacy-2026-10", source: "homepage" } }),
  confirmNewsletter: (token: string) => apiRequest<{ confirmed: true }>("/api/v1/public/newsletter/confirm", { method: "POST", body: { token } }),
  unsubscribeNewsletter: (token: string) => apiRequest<{ unsubscribed: true }>("/api/v1/public/newsletter/unsubscribe", { method: "POST", body: { token } }),
  acceptInvitation: (input: InvitationAcceptanceInput) => apiRequest(`/api/v1/organisations/invitations/${encodeURIComponent(input.token)}/accept`, { method: "POST", body: {} }),
  createApplication: async (input: ApplicationCreateInput) => {
    const cv = await uploadReadyCv(input.cvFile);
    const result = await apiRequest(`/api/v1/public/jobs/${input.jobId}/applications`, { method: "POST", idempotent: true, body: { coverLetter: input.coverNote, answers: Object.entries(input.answers ?? {}).map(([questionKey, answer]) => ({ questionKey, question: questionKey, answer })), attachments: [{ fileId: cv.id, kind: "CV", label: cv.name }] } });
    invalidateLive("talent:applications"); invalidateLive("admin:screening");
    return result;
  },
  withdrawApplication: async (applicationId: string, reason?: string) => {
    const current = await apiRequest<Record<string, unknown>>("/api/v1/talents/me/applications", { query: pageQuery(1, 100) });
    const application = asArray(current.applications).map(asRecord).find((item) => item.id === applicationId);
    if (!application?.updatedAt) throw new Error("Refresh this application before withdrawing it.");
    const result = await apiRequest(`/api/v1/talents/me/applications/${applicationId}/withdraw`, { method: "POST", idempotent: true, body: { expectedUpdatedAt: application.updatedAt, reason } });
    invalidateLive("talent:applications");
    return result;
  },
  decideOffer: async (input: OfferDecisionInput) => { const result = await apiRequest(`/api/v1/talents/me/offers/${input.offerId}/respond`, { method: "POST", idempotent: true, body: { response: input.decision === "accept" ? "ACCEPT" : "DECLINE", ...(input.decision === "reject" ? { declineReason: input.note || "Declined by talent." } : {}) } }); invalidateLive("talent:offers"); invalidateLive("org:offers"); return result; },
  requestReplacement: async (input: ReplacementRequestInput) => { const reason = [input.reason, input.details].filter(Boolean).join(": "); const result = await orgRequest("/replacements", { method: "POST", idempotent: true, body: { placementId: input.placementId, reason, reasonCategory: "OTHER" } }); invalidateLive("org:replacements"); return result; },
  decideTimeEntry: async (input: TimeEntryDecisionInput) => {
    const result = await orgRequest<Record<string, unknown>>("/time-entries", { query: pageQuery(1, 100) });
    const current = asArray(result.timeEntries).map(asRecord).find((entry) => entry.id === input.timeEntryId);
    if (!current?.updatedAt) throw new Error("Refresh the time entries before recording a decision.");
    const decision = await orgRequest(`/time-entries/${input.timeEntryId}/decision`, { method: "POST", body: { expectedUpdatedAt: current.updatedAt, decision: input.decision === "approve" ? "APPROVE" : "REJECT", reason: input.note } });
    invalidateLive("org:time");
    return decision;
  },
};
