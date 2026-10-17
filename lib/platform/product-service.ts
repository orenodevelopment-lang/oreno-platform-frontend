import { apiRequest, asArray, asRecord, dateLabel, pageQuery, textValue, titleCase } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive, liveValue } from "@/lib/api/live-store";
import type {
  ApplicationCreateInput,
  ApplicationRecord,
  CompanyTeamMemberRecord,
  ContactRequestInput,
  DemoRequestInput,
  InvitationAcceptanceInput,
  InterviewRecord,
  JobRecord,
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
  TaskDetailRecord,
  TimeEntryDecisionInput,
  TimeEntryRecord,
} from "./contracts";

const emptyTalent: PublicTalentProfile = { id: "", name: "Loading…", discipline: "", seniority: "", location: "", rate: "", availability: "", skills: [], vetted: false, avatar: "/assets/figma/oreno-mark.svg", bio: "", experienceYears: 0, highlights: [], portfolio: [] };
const emptyJob: PublicJobDetail = { id: "", company: "", title: "Loading…", location: "", employmentType: "", workplace: "", compensation: "", skills: [], postedAt: "", status: "Published", description: "", responsibilities: [], requirements: [], deadline: "" };
const emptyApplication: ApplicationRecord = { id: "", candidateId: "", candidateName: "Loading…", jobId: "", jobTitle: "", appliedAt: "", status: "Submitted", portfolio: "", coverNote: "", statusHistory: [] };
const emptyInterview: InterviewRecord = { id: "", applicationId: "", candidateName: "Loading…", jobTitle: "", startsAt: "", durationMinutes: 0, participants: [], meetingUrl: "", status: "Scheduled" };
const emptyOffer: OfferRecord = { id: "", applicationId: "", candidateName: "Loading…", jobTitle: "", startDate: "", compensation: "", workplace: "", status: "Draft", terms: [] };
const emptyTask: TaskDetailRecord = { id: "", title: "Loading…", description: "", status: "", priority: "Low", startDate: "", dueDate: "", assignees: [], comments: [] };
const emptyProfile: TalentProfileRecord = { id: "", name: "Loading…", headline: "", bio: "", location: "", rate: "", availability: "", profileCompletion: 0, skills: [], experience: [], education: [], certifications: [], portfolio: [], vetting: { status: "Not started", updatedAt: "", publicLabel: "Not vetted" } };
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
  return { id: textValue(row.id), title: textValue(row.title), department: textValue(row.category, "General"), openings: Number(row.openings ?? 1), applicants: Number(asRecord(row._count).applications ?? row.applicants ?? 0), hiringManager: nameOf(asRecord(row.hiringManager)), deadline: dateLabel(row.applicationDeadline), compensation: money(row), status: titleCase(row.status, "Draft") as JobRecord["status"] };
}

function mapApplication(value: unknown): ApplicationRecord {
  const row = asRecord(value); const talent = asRecord(row.talentProfile); const job = asRecord(row.job);
  return { id: textValue(row.id), candidateId: textValue(row.talentProfileId), candidateName: nameOf(talent), jobId: textValue(row.jobId), jobTitle: textValue(job.title), appliedAt: dateLabel(row.submittedAt ?? row.createdAt), status: titleCase(row.status, "Submitted") as ApplicationRecord["status"], portfolio: "", coverNote: textValue(row.coverLetter), statusHistory: asArray(row.statusHistory).map((item) => { const entry = asRecord(item); return { status: titleCase(entry.status) as ApplicationRecord["status"], at: dateLabel(entry.createdAt), note: textValue(entry.note) || undefined }; }) };
}

function mapInterview(value: unknown): InterviewRecord { const row = asRecord(value); const application = asRecord(row.application); return { id: textValue(row.id), applicationId: textValue(row.applicationId), candidateName: nameOf(asRecord(application.talentProfile)), jobTitle: textValue(asRecord(application.job).title), startsAt: textValue(row.startsAt), durationMinutes: Number(row.durationMinutes ?? 0), participants: asArray(row.participants).map((item) => nameOf(asRecord(item))), meetingUrl: textValue(row.meetingUrl), status: titleCase(row.status, "Scheduled") as InterviewRecord["status"], outcome: row.outcome ? titleCase(row.outcome) as InterviewRecord["outcome"] : undefined }; }
function mapOffer(value: unknown): OfferRecord { const row = asRecord(value); const application = asRecord(row.application); return { id: textValue(row.id), applicationId: textValue(row.applicationId), candidateName: nameOf(asRecord(application.talentProfile)), jobTitle: textValue(asRecord(application.job).title), startDate: dateLabel(row.startDate), compensation: money(row), workplace: titleCase(row.workArrangement), status: titleCase(row.status, "Draft") as OfferRecord["status"], terms: asArray(row.terms).map(String) }; }

async function organisationId() {
  const current = await authApi.current();
  if (!current.context.organisationId) throw new Error("Select an organisation before using the company workspace.");
  return current.context.organisationId;
}

async function orgRequest<T>(suffix: string, options?: Parameters<typeof apiRequest<T>>[1]) {
  return apiRequest<T>(`/api/v1/organisations/${await organisationId()}${suffix}`, options);
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
  listPublicTalents: (): PublicTalentSummary[] => listResource("public:talents", "talents", "/api/v1/public/talents", mapTalent),
  getPublicTalent: (id: string) => liveValue(`public:talent:${id}`, { ...emptyTalent, id }, async () => mapTalent((await apiRequest<{ profile: unknown }>(`/api/v1/public/talents/${id}`)).profile)),
  listPublicJobs: (): PublicJobSummary[] => listResource("public:jobs", "jobs", "/api/v1/public/jobs", mapJob),
  getPublicJob: (id: string) => liveValue(`public:job:${id}`, { ...emptyJob, id }, async () => mapJob((await apiRequest<{ job: unknown }>(`/api/v1/public/jobs/${id}`)).job)),
  listCompanyJobs: () => orgListResource("org:jobs", "jobs", "/jobs", mapCompanyJob),
  getCompanyJob: (id: string) => liveValue(`org:job:${id}`, { ...mapCompanyJob(emptyJob), id }, async () => mapCompanyJob((await orgRequest<{ job: unknown }>(`/jobs/${id}`)).job)),
  listApplications: () => orgListResource("org:applications", "applications", "/applications", mapApplication),
  getApplication: (id: string) => liveValue(`org:application:${id}`, { ...emptyApplication, id }, async () => mapApplication((await orgRequest<{ application: unknown }>(`/applications/${id}`)).application)),
  listShortlists: (): ShortlistRecord[] => orgListResource("org:shortlists", "shortlists", "/shortlists", (value) => { const row = asRecord(value); return { id: textValue(row.id), name: textValue(row.name), jobTitle: textValue(asRecord(row.job).title), owner: nameOf(asRecord(row.owner)), candidateIds: asArray(row.candidates).map((item) => textValue(asRecord(item).talentProfileId)), updatedAt: dateLabel(row.updatedAt) }; }),
  listInterviews: () => orgListResource("org:interviews", "interviews", "/interviews", mapInterview),
  getInterview: (id: string) => productService.listInterviews().find((item) => item.id === id) ?? { ...emptyInterview, id },
  listOffers: () => orgListResource("org:offers", "offers", "/offers", mapOffer),
  getOffer: (id: string) => productService.listOffers().find((item) => item.id === id) ?? { ...emptyOffer, id },
  listNotifications: (): NotificationRecord[] => listResource("account:notifications", "notifications", "/api/v1/notifications", (value) => { const row = asRecord(value); return { id: textValue(row.id), title: textValue(row.title), body: textValue(row.body), category: titleCase(row.category, "Account") as NotificationRecord["category"], createdAt: dateLabel(row.createdAt), read: Boolean(row.readAt), href: textValue(row.actionUrl, "/") }; }),
  listTimeEntries: (): TimeEntryRecord[] => orgListResource("org:time", "timeEntries", "/time-entries", (value) => { const row = asRecord(value); return { id: textValue(row.id), person: nameOf(asRecord(row.talentProfile)), period: dateLabel(row.workDate), regularHours: Number(row.ordinaryMinutes ?? 0) / 60, overtimeHours: Number(row.overtimeMinutes ?? 0) / 60, status: titleCase(row.status, "Draft") as TimeEntryRecord["status"], note: textValue(row.note) || undefined }; }),
  listPaymentRecords: (): PaymentRecord[] => orgListResource("org:payments", "payments", "/payments", (value) => { const row = asRecord(value); return { id: textValue(row.id), person: nameOf(asRecord(row.talentProfile)), payrollPeriod: textValue(asRecord(row.payrollPeriod).reference) || dateLabel(row.createdAt), amount: String(row.amount ?? "0"), currency: textValue(row.currency), methodDescription: titleCase(row.method, "External payment"), externalReference: textValue(row.externalReference), status: titleCase(row.status, "Pending confirmation") as PaymentRecord["status"], paidAt: row.paidAt ? dateLabel(row.paidAt) : undefined }; }),
  getTalentProfile: () => liveValue("talent:profile", emptyProfile, async () => { const row = asRecord((await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile")).profile); const publicProfile = mapTalent(row); return { ...emptyProfile, ...publicProfile, name: publicProfile.name, profileCompletion: Number(row.profileCompletion ?? 0), skills: asArray(row.skills).map((item) => ({ name: textValue(asRecord(asRecord(item).skill).name) || textValue(asRecord(item).name), level: titleCase(asRecord(item).level, "Working") as "Working" | "Advanced" | "Expert" })), vetting: { status: titleCase(row.vettingStatus, "Not started") as TalentProfileRecord["vetting"]["status"], updatedAt: dateLabel(row.updatedAt), publicLabel: publicProfile.vetted ? "Vetted" : "Not vetted" } }; }),
  updateTalentProfile: async (input: TalentProfileUpdateInput) => { const result = await apiRequest<{ profile: unknown }>("/api/v1/talents/me/profile", { method: "PATCH", body: input }); invalidateLive("talent:profile"); return result; },
  getTalentAccount: () => liveValue("talent:account", emptyAccount, async () => { const row = asRecord((await apiRequest<{ account: unknown }>("/api/v1/talents/me/account")).account); return { ...emptyAccount, id: textValue(row.id), profileId: textValue(row.profileId), email: textValue(row.email), phone: textValue(row.phone), emailVerified: Boolean(row.emailVerifiedAt), status: row.status === "ACTIVE" ? "Active" : row.status === "SUSPENDED" ? "Suspended" : "Pending verification", createdAt: dateLabel(row.createdAt), lastSignedInAt: dateLabel(row.lastLoginAt), security: { twoFactorEnabled: Boolean(asRecord(row.security).twoFactorEnabled), activeSessions: asArray(asRecord(row.security).activeSessions).length }, preferences: { ...emptyAccount.preferences, ...asRecord(row.preferences) } } as TalentAccountRecord; }),
  createTalentAccount: (input: TalentAccountCreateInput) => apiRequest("/api/v1/auth/register", { method: "POST", idempotent: true, body: { accountType: "TALENT", email: input.email, password: input.password, firstName: input.firstName, lastName: input.lastName, acceptTerms: true } }),
  updateTalentAccount: async (input: TalentAccountUpdateInput) => { const result = await apiRequest("/api/v1/talents/me/account/preferences", { method: "PATCH", body: input.preferences ?? {} }); invalidateLive("talent:account"); return result; },
  verifyTalentEmail: (token: string) => apiRequest("/api/v1/auth/email/verify", { method: "POST", body: { token } }),
  getCompanyTeamMember: (talentProfileId: string) => productService.listCompanyTeamMembers().find((item) => item.talentProfileId === talentProfileId) ?? { ...emptyMember, talentProfileId },
  listCompanyTeamMembers: (): CompanyTeamMemberRecord[] => orgListResource("org:team", "teamMembers", "/team-members", (value) => { const row = asRecord(value); return { id: textValue(row.id), placementId: textValue(row.placementId), talentProfileId: textValue(row.talentProfileId), companyId: textValue(row.organisationId), employeeId: textValue(row.employeeCode), employmentTitle: textValue(row.title), department: textValue(asRecord(row.department).name), manager: nameOf(asRecord(row.manager)), startDate: dateLabel(row.startDate), engagement: titleCase(row.engagementType, "Full time") as CompanyTeamMemberRecord["engagement"], status: titleCase(row.status, "Onboarding") as CompanyTeamMemberRecord["status"] }; }),
  getTaskDetail: (id: string) => liveValue(`task:${id}`, { ...emptyTask, id }, async () => { const row = asRecord((await apiRequest<{ task: unknown }>(`/api/v1/talents/me/tasks/${id}`)).task); return { id: textValue(row.id), title: textValue(row.title), description: textValue(row.description), status: titleCase(row.status), priority: titleCase(row.priority, "Low") as TaskDetailRecord["priority"], startDate: dateLabel(row.startDate), dueDate: dateLabel(row.dueDate), assignees: asArray(row.assignees).map((item) => nameOf(asRecord(item))), comments: asArray(row.comments).map((item) => { const entry = asRecord(item); return { id: textValue(entry.id), author: nameOf(asRecord(entry.author)), body: textValue(entry.body), createdAt: dateLabel(entry.createdAt) }; }) }; }),
  submitDemoRequest: (input: DemoRequestInput) => apiRequest("/api/v1/public/demo-requests", { method: "POST", body: { fullName: input.name, email: input.workEmail, companyName: input.company, companySize: input.teamSize, message: input.message, source: "website" } }),
  submitContactRequest: (input: ContactRequestInput) => apiRequest("/api/v1/public/contact-requests", { method: "POST", body: { fullName: input.name, email: input.email, subject: input.topic, message: input.message, source: "website" } }),
  acceptInvitation: (input: InvitationAcceptanceInput) => apiRequest(`/api/v1/organisations/invitations/${encodeURIComponent(input.token)}/accept`, { method: "POST", body: {} }),
  createApplication: (input: ApplicationCreateInput) => apiRequest(`/api/v1/public/jobs/${input.jobId}/applications`, { method: "POST", idempotent: true, body: { coverLetter: input.coverNote, answers: Object.entries(input.answers ?? {}).map(([questionKey, answer]) => ({ questionKey, question: questionKey, answer })), attachments: [] } }),
  decideOffer: async (input: OfferDecisionInput) => { const result = await apiRequest(`/api/v1/talents/me/offers/${input.offerId}/respond`, { method: "POST", idempotent: true, body: { decision: input.decision === "accept" ? "ACCEPT" : "REJECT", note: input.note } }); invalidateLive("org:offers"); return result; },
  requestReplacement: async (input: ReplacementRequestInput) => { const result = await orgRequest("/replacements", { method: "POST", idempotent: true, body: input }); invalidateLive("org:replacements"); return result; },
  decideTimeEntry: async (input: TimeEntryDecisionInput) => { const result = await orgRequest(`/time-entries/${input.timeEntryId}/decision`, { method: "POST", body: { decision: input.decision === "approve" ? "APPROVE" : "REJECT", note: input.note } }); invalidateLive("org:time"); return result; },
};
