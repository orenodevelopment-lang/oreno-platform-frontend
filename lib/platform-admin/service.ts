import { apiRequest, asArray, asRecord, dateLabel, numberValue, pageQuery, textValue, titleCase } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive, liveValue } from "@/lib/api/live-store";
import type {
  AdminAccountRecord,
  AdminActionResult,
  AdminCompany,
  AdminHiringRecord,
  AdminPlacementRecord,
  AdminReplacementRecord,
  AdminRole,
  AdminSession,
  AdminUserRecord,
  AnnouncementRecord,
  AuditEventRecord,
  DeliveryRecord,
  ExportRecord,
  FailedJobRecord,
  FeatureFlagRecord,
  ModeratedJobRecord,
  PaymentExceptionRecord,
  PayrollPeriodRecord,
  PlatformMetric,
  PolicyRecord,
  ServiceHealthRecord,
  ScreeningDetailRecord,
  ScreeningQueueRecord,
  ApplicationScreeningStatus,
  SupportCaseRecord,
  VettingQueueRecord,
} from "./contracts";
import { permissionsForRole } from "./policy";

const updatedAt = new Map<string, string>();

function track(row: Record<string, unknown>) {
  const id = textValue(row.id);
  const version = textValue(row.updatedAt);
  if (id && version) updatedAt.set(id, version);
  return row;
}

function roleName(value: unknown): AdminRole {
  const role = titleCase(value, "Read only analyst");
  const known: AdminRole[] = ["Platform Owner", "Operations Admin", "Talent Reviewer", "Support Agent", "Finance Admin", "Read-only Analyst"];
  return known.find((item) => item.toLowerCase().replace(/-/g, " ") === role.toLowerCase().replace(/-/g, " ")) ?? "Read-only Analyst";
}

function personName(value: unknown) {
  const row = asRecord(value);
  return textValue(row.displayName) || `${textValue(row.firstName)} ${textValue(row.lastName)}`.trim() || textValue(row.email, "Unknown");
}

function accepted(message: string, requestId?: string): AdminActionResult {
  return { requestId: requestId ?? "accepted", status: "accepted", message };
}

function resourceList<T>(key: string, property: string, path: string, mapper: (row: unknown) => T) {
  return liveValue<T[]>(key, [], async () => {
    const response = await apiRequest<Record<string, unknown>>(path, { query: pageQuery(1, 100) });
    return asArray(response[property]).map(mapper);
  });
}

function company(rowValue: unknown): AdminCompany {
  const row = track(asRecord(rowValue)); const counts = asRecord(row._count); const onboarding = asRecord(row.onboarding);
  return { id: textValue(row.id), slug: textValue(row.id), name: textValue(row.name), owner: textValue(row.contactEmail) || textValue(row.slug), staff: numberValue(counts.memberships), jobs: numberValue(counts.jobs), placements: numberValue(counts.placements ?? counts.staffAssignments), status: row.status === "PENDING_VERIFICATION" ? "Pending" : titleCase(row.status, "Inactive") as AdminCompany["status"], onboarding: titleCase(onboarding.status, "Not started"), joinedAt: dateLabel(row.createdAt) };
}

function user(rowValue: unknown): AdminUserRecord {
  const row = track(asRecord(rowValue)); const assignments = asArray(row.platformRoleAssignments); const platformRole = asRecord(asRecord(assignments[0]).role); const memberships = asArray(row.memberships); const membership = asRecord(memberships[0]);
  return { id: textValue(row.id), slug: textValue(row.id), name: personName(row), email: textValue(row.email), type: row.isPlatformAdmin || assignments.length ? "Platform admin" : memberships.length ? "Company" : "Talent", organisation: textValue(membership.organisationId) || null, role: textValue(platformRole.name) || textValue(asRecord(membership.role).name, "Member"), status: row.status === "SUSPENDED" ? "Suspended" : row.status === "ACTIVE" ? "Active" : "Locked", lastSeenAt: dateLabel(row.lastLoginAt), twoFactorEnabled: Boolean(row.twoFactorEnabled) };
}

function application(rowValue: unknown): AdminHiringRecord {
  const row = asRecord(rowValue); const talent = asRecord(row.talentProfile); const job = asRecord(row.job); const organisation = asRecord(row.organisation);
  return { id: textValue(row.id), talent: personName(asRecord(talent.user)), job: textValue(job.title), company: textValue(organisation.name), appliedAt: dateLabel(row.submittedAt), stage: titleCase(row.status), status: ({ Submitted: "Pending", "Under Review": "Pending", Shortlisted: "Pending", Interviewing: "Interview", "Offer Pending": "Offer", Accepted: "Placed", Rejected: "Rejected", Withdrawn: "Rejected" }[titleCase(row.status)] ?? "Pending") as AdminHiringRecord["status"] };
}

function screeningQueue(rowValue: unknown): ScreeningQueueRecord {
  const row = asRecord(rowValue);
  const applicationRow = asRecord(row.application);
  const job = asRecord(applicationRow.job);
  const organisation = asRecord(job.organisation);
  const talent = asRecord(applicationRow.talentProfile);
  const candidate = asRecord(talent.user);
  const reviewer = asRecord(row.assignedReviewer);
  const applicationId = textValue(row.applicationId);
  const version = textValue(row.updatedAt);
  if (applicationId && version) updatedAt.set(`screening:${applicationId}`, version);
  return {
    id: textValue(row.id),
    applicationId,
    updatedAt: version,
    status: textValue(row.status, "PENDING_CV_REVIEW") as ApplicationScreeningStatus,
    talent: personName(candidate),
    email: textValue(candidate.email),
    job: textValue(job.title),
    company: textValue(organisation.name),
    organisationId: textValue(applicationRow.organisationId) || textValue(organisation.id),
    submittedAt: dateLabel(applicationRow.submittedAt),
    dueAt: row.dueAt ? dateLabel(row.dueAt) : null,
    assignee: row.assignedReviewer ? personName(reviewer) : null,
    currentCvFileId: textValue(row.currentCvFileId),
  };
}

function screeningDetail(rowValue: unknown): ScreeningDetailRecord {
  const row = asRecord(rowValue);
  const base = screeningQueue(row);
  const applicationRow = asRecord(row.application);
  const job = asRecord(applicationRow.job);
  const talent = asRecord(applicationRow.talentProfile);
  const cvReviews = asArray(row.cvReviews).map(asRecord);
  const reviewedFile = asRecord(cvReviews.find((item) => textValue(item.fileId) === base.currentCvFileId)?.file ?? cvReviews[0]?.file);
  return {
    ...base,
    coverLetter: textValue(applicationRow.coverLetter),
    requirements: asArray(job.requirements).map((item) => textValue(asRecord(item).description) || textValue(asRecord(item).label)).filter(Boolean),
    answers: asArray(applicationRow.answers).map((item) => { const answer = asRecord(item); return { question: textValue(answer.question) || textValue(answer.questionKey), answer: textValue(answer.answer) }; }),
    skills: asArray(talent.skills).map((item) => textValue(asRecord(asRecord(item).skill).name)).filter(Boolean),
    cv: Object.keys(reviewedFile).length ? { id: textValue(reviewedFile.id), name: textValue(reviewedFile.originalName), mimeType: textValue(reviewedFile.mimeType), sizeBytes: numberValue(reviewedFile.sizeBytes), status: textValue(reviewedFile.status) } : null,
    cvReviews: cvReviews.map((item) => ({ id: textValue(item.id), decision: textValue(item.decision), reviewer: personName(asRecord(item.reviewer)), createdAt: dateLabel(item.createdAt), candidateFeedback: textValue(item.candidateVisibleFeedback) || null, employerSummary: textValue(item.employerSafeSummary) || null })),
    interviews: asArray(row.interviews).map((item) => { const interview = asRecord(item); return { id: textValue(interview.id), status: textValue(interview.status), mode: textValue(interview.mode), startsAt: textValue(interview.scheduledStartAt), endsAt: textValue(interview.scheduledEndAt), timeZone: textValue(interview.timeZone), meetingUrl: textValue(interview.meetingUrl) || null, outcome: textValue(interview.outcome) || null, updatedAt: textValue(interview.updatedAt) }; }),
    informationRequests: asArray(row.informationRequests).map((item) => { const request = asRecord(item); return { id: textValue(request.id), message: textValue(request.message), responseText: textValue(request.responseText) || null, respondedAt: request.respondedAt ? dateLabel(request.respondedAt) : null, createdAt: dateLabel(request.createdAt) }; }),
    history: asArray(row.history).map((item) => { const entry = asRecord(item); return { id: textValue(entry.id), action: textValue(entry.action), fromStatus: textValue(entry.fromStatus) || null, toStatus: textValue(entry.toStatus), reason: textValue(entry.reason) || null, actor: entry.actor ? personName(asRecord(entry.actor)) : "System", createdAt: dateLabel(entry.createdAt) }; }),
    employerSummary: textValue(row.employerSummary) || null,
    candidateMessage: textValue(row.candidateMessage) || null,
    approvedAt: row.approvedAt ? dateLabel(row.approvedAt) : null,
    releasedAt: row.releasedToCompanyAt ? dateLabel(row.releasedToCompanyAt) : null,
  };
}

function screeningExpectedAt(applicationId: string) {
  const value = updatedAt.get(`screening:${applicationId}`);
  if (!value) throw new Error("Refresh this screening before recording a decision.");
  return value;
}

function operationRows() {
  return liveValue<{ services: ServiceHealthRecord[]; jobs: FailedJobRecord[] }>("admin:operations", { services: [], jobs: [] }, async () => {
    const [health, operations] = await Promise.all([
      apiRequest<Record<string, unknown>>("/health/ready", { direct: true, allowErrorStatuses: [503] }),
      apiRequest<Record<string, unknown>>("/api/v1/admin/operations", { query: pageQuery(1, 100) }),
    ]);
    const queues = asRecord(operations.queues);
    const services: ServiceHealthRecord[] = [
      { id: "api", name: "API", type: "HTTP service", status: health.status === "ready" ? "Healthy" : "Degraded", uptime: "Live", latency: null, throughput: "See metrics" },
      ...Object.entries(queues).map(([name, value]) => { const queue = asRecord(value); return { id: `queue-${name}`, name, type: "Background queue", status: numberValue(queue.failed) > 0 ? "Degraded" as const : "Healthy" as const, uptime: "Live", latency: null, throughput: `${numberValue(queue.waiting)} waiting` }; }),
    ];
    const jobs = asArray(operations.outcomes).filter((item) => ["FAILED", "DEAD_LETTERED"].includes(textValue(asRecord(item).status))).map((item): FailedJobRecord => { const row = asRecord(item); return { id: textValue(row.id), queue: textValue(row.queue), payloadSummary: textValue(row.jobName), failedAt: dateLabel(row.failedAt ?? row.updatedAt), attempts: numberValue(row.attempts), error: textValue(row.errorMessage) || textValue(row.errorCode) }; });
    return { services, jobs };
  });
}

export const platformAdminService = {
  getSession: () => liveValue<AdminSession | null>("admin:session", null, async () => {
    const current = await authApi.current();
    if (!current.context.isPlatformAdmin) throw new Error("This account is not a platform administrator.");
    const role = roleName(current.context.platformRoles[0]);
    const name = current.user.displayName || `${current.user.firstName} ${current.user.lastName}`.trim() || current.user.email;
    return { id: current.user.id, name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), email: current.user.email, role, permissions: permissionsForRole(role), twoFactorSatisfied: current.context.mfaSatisfied, expiresAt: current.context.sessionExpiresAt ?? "" };
  }),
  getMetrics: (): PlatformMetric[] => liveValue("admin:metrics", [], async () => {
    const dashboard = asRecord((await apiRequest<{ dashboard: unknown }>("/api/v1/admin/dashboard")).dashboard);
    const sum = (rows: unknown) => asArray(rows).reduce<number>((total, item) => total + numberValue(asRecord(item).count), 0);
    return [
      { id: "organisations", label: "Organisations", value: String(sum(dashboard.organisations)), detail: "Across all account states", tone: "teal" },
      { id: "users", label: "Users", value: String(sum(dashboard.users)), detail: "Registered platform identities", tone: "green" },
      { id: "applications", label: "Applications", value: String(numberValue(asRecord(dashboard.hiring).applications)), detail: "Hiring records", tone: "pink" },
      { id: "failures", label: "Operational failures", value: String(numberValue(asRecord(dashboard.operations).failedJobs) + numberValue(asRecord(dashboard.operations).failedOutbox)), detail: "Needs review", tone: "amber" },
    ];
  }),
  listCompanies: () => resourceList("admin:companies", "organisations", "/api/v1/admin/organisations", company),
  getCompany: (id: string) => liveValue(`admin:company:${id}`, platformAdminService.listCompanies().find((item) => item.id === id) ?? { id, slug: id, name: "Loading…", owner: "", staff: 0, jobs: 0, placements: 0, status: "Inactive", onboarding: "", joinedAt: "" }, async () => company((await apiRequest<{ organisation: unknown }>(`/api/v1/admin/organisations/${id}`)).organisation)),
  listUsers: () => resourceList("admin:users", "users", "/api/v1/admin/users", user),
  getUser: (id: string) => liveValue(`admin:user:${id}`, platformAdminService.listUsers().find((item) => item.id === id) ?? { id, slug: id, name: "Loading…", email: "", type: "Talent", organisation: null, role: "", status: "Locked", lastSeenAt: "", twoFactorEnabled: false }, async () => user((await apiRequest<{ user: unknown }>(`/api/v1/admin/users/${id}`)).user)),
  listAdminAccounts: (): AdminAccountRecord[] => platformAdminService.listUsers().filter((item) => item.type === "Platform admin").map((item) => ({ id: item.id, name: item.name, email: item.email, role: roleName(item.role), twoFactorEnabled: item.twoFactorEnabled, lastSignedInAt: item.lastSeenAt })),
  listVettingQueue: (): VettingQueueRecord[] => resourceList("admin:vetting", "cases", "/api/v1/admin/vetting", (value) => { const row = track(asRecord(value)); const talent = asRecord(row.talentProfile); const submitted = new Date(textValue(row.submittedAt ?? row.createdAt)); return { id: textValue(row.id), slug: textValue(row.id), talentName: personName(asRecord(talent.user)), skills: asArray(talent.skills).map((item) => textValue(asRecord(asRecord(item).skill).name)).filter(Boolean), submittedAt: dateLabel(submitted), ageHours: Math.max(0, Math.round((Date.now() - submitted.getTime()) / 3_600_000)), assignee: row.assignedTo ? personName(row.assignedTo) : null, priority: titleCase(row.priority, "Medium") as VettingQueueRecord["priority"], status: ({ IN_REVIEW: "In review", ASSIGNED: "In review", ADDITIONAL_INFO_REQUIRED: "More information required" }[textValue(row.status)] ?? "In review") as VettingQueueRecord["status"] }; }),
  getVettingCase: (id: string) => platformAdminService.listVettingQueue().find((item) => item.id === id) ?? { id, slug: id, talentName: "Loading…", skills: [], submittedAt: "", ageHours: 0, assignee: null, priority: "Medium", status: "In review" },
  listJobs: (): ModeratedJobRecord[] => resourceList("admin:jobs", "jobs", "/api/v1/admin/jobs", (value) => { const row = track(asRecord(value)); return { id: textValue(row.id), slug: textValue(row.id), title: textValue(row.title), company: textValue(asRecord(row.organisation).name), hiringManager: textValue(row.hiringManagerId, "Unassigned"), postedAt: dateLabel(row.publishedAt ?? row.createdAt), applications: numberValue(asRecord(row._count).applications), reportCount: 0, status: row.moderationStatus === "FLAGGED" ? "Flagged" : row.moderationStatus === "REMOVED" ? "Removed" : row.status === "PAUSED" ? "Paused" : row.status === "CLOSED" ? "Closed" : row.moderationStatus === "NOT_REVIEWED" ? "Moderation" : "Published" }; }),
  listApplications: () => resourceList("admin:applications", "applications", "/api/v1/admin/applications", application),
  listScreenings: (filters: { status?: string; q?: string } = {}): ScreeningQueueRecord[] => {
    const key = `admin:screening:${filters.status ?? "all"}:${filters.q ?? ""}`;
    return liveValue(key, [], async () => {
      const response = await apiRequest<Record<string, unknown>>("/api/v1/admin/screening/applications", { query: pageQuery(1, 100, filters) });
      return asArray(response.items).map(screeningQueue);
    });
  },
  getScreening: (applicationId: string): ScreeningDetailRecord => liveValue(
    `admin:screening-detail:${applicationId}`,
    { id: "", applicationId, updatedAt: "", status: "PENDING_CV_REVIEW", talent: "Loading…", email: "", job: "", company: "", organisationId: "", submittedAt: "", dueAt: null, assignee: null, currentCvFileId: "", coverLetter: "", requirements: [], answers: [], skills: [], cv: null, cvReviews: [], interviews: [], informationRequests: [], history: [], employerSummary: null, candidateMessage: null, approvedAt: null, releasedAt: null },
    async () => screeningDetail((await apiRequest<{ screening: unknown }>(`/api/v1/admin/screening/applications/${applicationId}`)).screening),
  ),
  assignScreening: async (applicationId: string, reviewerId: string, reason: string) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/assign`, { method: "POST", body: { reviewerId, expectedUpdatedAt: screeningExpectedAt(applicationId), reason } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted("Screening reviewer assigned and recorded in history.");
  },
  reviewScreeningCv: async (applicationId: string, decision: "APPROVED" | "NOT_SELECTED" | "REQUEST_INFORMATION", reason: string, candidateFeedback?: string, employerSummary?: string) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/cv-review`, { method: "POST", body: { decision, expectedUpdatedAt: screeningExpectedAt(applicationId), reason, rubric: { jobCriteriaReviewed: true, submittedCvReviewed: true }, privateNotes: reason, candidateVisibleFeedback: candidateFeedback || null, employerSafeSummary: employerSummary || null } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted("Human CV decision recorded and audited.");
  },
  requestScreeningInformation: async (applicationId: string, message: string, reason: string) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/request-info`, { method: "POST", body: { expectedUpdatedAt: screeningExpectedAt(applicationId), reason, message } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted("Information request sent to the applicant.");
  },
  scheduleScreeningInterview: async (applicationId: string, input: { interviewerId: string; mode: string; startsAt: string; endsAt: string; timeZone: string; meetingUrl?: string; reason: string }) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/interviews`, { method: "POST", body: { expectedUpdatedAt: screeningExpectedAt(applicationId), reason: input.reason, interviewerId: input.interviewerId, mode: input.mode, scheduledStartAt: input.startsAt, scheduledEndAt: input.endsAt, timeZone: input.timeZone, meetingUrl: input.meetingUrl || null } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted("Oreno screening interview scheduled.");
  },
  decideScreeningInterview: async (applicationId: string, interviewId: string, expectedUpdatedAt: string, outcome: "PASSED" | "FAILED" | "ON_HOLD" | "NEEDS_FOLLOWUP", reason: string, candidateFeedback?: string) => {
    await apiRequest(`/api/v1/admin/screening/interviews/${interviewId}/outcome`, { method: "POST", body: { expectedUpdatedAt, reason, outcome, rubric: { roleEvidenceDiscussed: true, humanInterviewCompleted: true }, privateNotes: reason, candidateVisibleFeedback: candidateFeedback || null } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted("Oreno interview outcome recorded.");
  },
  decideScreeningFinal: async (applicationId: string, decision: "APPROVED" | "NOT_SELECTED" | "ON_HOLD", reason: string, candidateMessage?: string, employerSummary?: string) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/final-decision`, { method: "POST", body: { expectedUpdatedAt: screeningExpectedAt(applicationId), reason, decision, candidateMessage: candidateMessage || null, employerSummary: employerSummary || null } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`);
    return accepted(decision === "APPROVED" ? "Candidate approved for company submission; release is still required." : "Final screening decision recorded.");
  },
  releaseScreening: async (applicationId: string, organisationId: string, reason: string) => {
    await apiRequest(`/api/v1/admin/screening/applications/${applicationId}/release`, { method: "POST", idempotent: true, body: { expectedUpdatedAt: screeningExpectedAt(applicationId), reason, organisationId, confirmation: true } });
    invalidateLive("admin:screening"); invalidateLive(`admin:screening-detail:${applicationId}`); invalidateLive("admin:applications");
    return accepted("Candidate explicitly forwarded to the correct company.");
  },
  openScreeningCv: async (applicationId: string) => {
    const result = await apiRequest<{ downloadUrl: string }>(`/api/v1/admin/screening/applications/${applicationId}/cv/download`, { method: "POST" });
    if (!result.downloadUrl) throw new Error("The secure CV link was not returned.");
    window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
  },
  listPlacements: (): AdminPlacementRecord[] => resourceList("admin:placements", "placements", "/api/v1/admin/placements", (value) => { const row = asRecord(value); return { id: textValue(row.id), talent: personName(asRecord(asRecord(row.talentProfile).user)), job: textValue(row.title), company: textValue(asRecord(row.organisation).name), startDate: dateLabel(row.startDate), replacementEligible: row.replacementEligibleUntil ? new Date(textValue(row.replacementEligibleUntil)) > new Date() : false, staffLead: textValue(asRecord(row.staffAssignment).employeeCode, "Unassigned") }; }),
  listReplacementRequests: (): AdminReplacementRecord[] => resourceList("admin:replacements", "replacements", "/api/v1/admin/replacements", (value) => { const row = track(asRecord(value)); const placement = asRecord(row.placement); return { id: textValue(row.id), company: textValue(asRecord(row.organisation).name), talent: personName(asRecord(asRecord(placement.talentProfile).user)), role: textValue(placement.title), requestedAt: dateLabel(row.requestedAt ?? row.createdAt), eligibility: row.eligible === true ? "Eligible" : row.eligible === false ? "Not eligible" : "Review required", status: row.status === "RESOLVED" ? "Resolved" : row.status === "UNDER_REVIEW" ? "Under review" : "Requested" }; }),
  listSupportCases: (): SupportCaseRecord[] => resourceList("admin:support", "cases", "/api/v1/admin/support", (value) => { const row = track(asRecord(value)); return { id: textValue(row.id), slug: textValue(row.id), type: titleCase(row.category), subject: textValue(row.subject), company: textValue(asRecord(row.organisation).name) || null, talent: personName(asRecord(row.createdBy)) || null, assignee: row.assignedTo ? personName(row.assignedTo) : null, priority: row.priority === "URGENT" ? "High" : titleCase(row.priority, "Medium") as SupportCaseRecord["priority"], status: row.status === "RESOLVED" || row.status === "CLOSED" ? "Resolved" : row.status === "ESCALATED" ? "Escalated" : "Open", slaAgeHours: numberValue(row.slaAgeHours, 0), createdAt: dateLabel(row.createdAt) }; }),
  getSupportCase: (id: string) => platformAdminService.listSupportCases().find((item) => item.id === id) ?? { id, slug: id, type: "", subject: "Loading…", company: null, talent: null, assignee: null, priority: "Medium", status: "Open", slaAgeHours: null, createdAt: "" },
  listPayrollPeriods: (): PayrollPeriodRecord[] => resourceList("admin:payroll", "payrollPeriods", "/api/v1/admin/compensation/payroll", (value) => { const row = asRecord(value); const count = asRecord(row._count); return { id: textValue(row.id), period: `${dateLabel(row.startDate)} – ${dateLabel(row.endDate)}`, companies: 1, records: numberValue(count.lineItems), processed: numberValue(count.paymentRecords), exceptions: 0, status: ["PAID", "VOID"].includes(textValue(row.status)) ? "Closed" : "Active" }; }),
  listPaymentExceptions: (): PaymentExceptionRecord[] => resourceList("admin:payments", "payments", "/api/v1/admin/compensation/payments", (value) => { const row = asRecord(value); return { id: textValue(row.id), reference: textValue(row.externalReference, textValue(row.id)), company: textValue(asRecord(row.organisation).name), talent: personName(asRecord(asRecord(row.talentProfile).user)), maskedAmount: `${textValue(row.currency)} ${textValue(row.amount)}`, reason: textValue(row.failureReason) || titleCase(row.status), status: row.status === "FAILED" ? "Failed" : row.status === "RECONCILED" ? "Reconciled" : "Pending confirmation" }; }),
  listAnnouncements: (): AnnouncementRecord[] => resourceList("admin:announcements", "announcements", "/api/v1/admin/announcements", (value) => { const row = asRecord(value); return { id: textValue(row.id), title: textValue(row.title), audience: titleCase(row.audience), status: row.publishedAt ? "Sent" : "Draft", scheduledAt: null, sentAt: row.publishedAt ? dateLabel(row.publishedAt) : null }; }),
  listDeliveries: (): DeliveryRecord[] => resourceList("admin:deliveries", "deliveries", "/api/v1/admin/deliveries", (value) => { const row = asRecord(value); const recipient = textValue(row.recipientEmail); return { id: textValue(row.id), template: textValue(row.templateKey), maskedRecipient: recipient.replace(/(^.).*(@.*$)/, "$1***$2"), status: row.status === "SENT" ? "Delivered" : row.status === "FAILED" || row.status === "BOUNCED" ? "Failed" : "Pending", attemptedAt: dateLabel(row.updatedAt), attempts: numberValue(row.attempts) }; }),
  listFeatureFlags: (): FeatureFlagRecord[] => liveValue("admin:flags", [], async () => { const result = await apiRequest<Record<string, unknown>>("/api/v1/admin/configuration"); return asArray(result.featureFlags).map((value) => { const row = asRecord(value); return { key: textValue(row.key), environment: "production", enabled: Boolean(row.enabled), updatedBy: textValue(row.updatedById, "System"), updatedAt: dateLabel(row.updatedAt), description: textValue(row.description) }; }); }),
  listPolicies: (): PolicyRecord[] => liveValue("admin:policies", [], async () => { const result = await apiRequest<Record<string, unknown>>("/api/v1/admin/configuration"); return asArray(result.policies).map((value) => { const row = asRecord(value); return { key: textValue(row.key), label: titleCase(row.key), value: typeof row.value === "string" ? row.value : JSON.stringify(row.value), editable: true }; }); }),
  listExports: (): ExportRecord[] => resourceList("admin:exports", "exports", "/api/v1/admin/exports", (value) => { const row = asRecord(value); return { id: textValue(row.id), type: titleCase(row.type ?? row.dataset), requestedBy: textValue(row.requestedById, "Current administrator"), createdAt: dateLabel(row.createdAt), expiresAt: row.expiresAt ? dateLabel(row.expiresAt) : null, status: titleCase(row.status, "Pending") as ExportRecord["status"] }; }),
  listAuditEvents: (): AuditEventRecord[] => resourceList("admin:audit", "events", "/api/v1/admin/audit", (value) => { const row = asRecord(value); return { id: textValue(row.id), actor: textValue(row.actorId, textValue(row.actorType, "System")), role: "Platform Owner", action: textValue(row.action), target: `${textValue(row.resourceType)} ${textValue(row.resourceId)}`.trim(), risk: ["SUSPEND", "DELETE", "PERMISSION_CHANGE", "IMPERSONATE"].includes(textValue(row.action)) ? "High" : "Medium", createdAt: dateLabel(row.createdAt), before: row.changes ? JSON.stringify(asRecord(row.changes).before ?? null) : null, after: row.changes ? JSON.stringify(asRecord(row.changes).after ?? row.changes) : null, reason: textValue(row.reason) || null }; }),
  listServiceHealth: () => operationRows().services,
  listFailedJobs: () => operationRows().jobs,
  changeCompanyStatus: async (companyId: string, status: string, reason: string) => { const result = await apiRequest(`/api/v1/admin/organisations/${companyId}/status`, { method: "POST", body: { status: status === "Active" ? "ACTIVE" : status === "Suspended" ? "SUSPENDED" : "DEACTIVATED", reason, expectedUpdatedAt: updatedAt.get(companyId) } }); invalidateLive("admin:compan"); return accepted("Organisation status updated and audited.", textValue(asRecord(result).requestId)); },
  changeUserStatus: async (userId: string, status: string, reason: string) => { await apiRequest(`/api/v1/admin/users/${userId}/status`, { method: "POST", body: { status: status === "Active" ? "ACTIVE" : status === "Suspended" ? "SUSPENDED" : "DEACTIVATED", reason, expectedUpdatedAt: updatedAt.get(userId) } }); invalidateLive("admin:user"); return accepted("User status updated and audited."); },
  revokeUserSessions: async (userId: string, reason: string) => { const result = await apiRequest<{ revokedSessions: number }>(`/api/v1/admin/users/${userId}/sessions/revoke`, { method: "POST", body: { reason } }); return accepted(`${result.revokedSessions} active session${result.revokedSessions === 1 ? "" : "s"} revoked.`); },
  decideVetting: async (caseId: string, decision: string, reason: string) => { await apiRequest(`/api/v1/admin/vetting/${caseId}/review`, { method: "POST", body: { expectedUpdatedAt: updatedAt.get(caseId), decision: decision.toUpperCase().includes("APPROV") ? "APPROVE" : decision.toUpperCase().includes("INFO") ? "REQUEST_INFO" : "REJECT", internalNotes: reason } }); invalidateLive("admin:vetting"); return accepted("Vetting decision recorded and audited."); },
  moderateJob: async (jobId: string, decision: string, reason: string) => { await apiRequest(`/api/v1/admin/jobs/${jobId}/moderation`, { method: "POST", body: { expectedUpdatedAt: updatedAt.get(jobId), status: decision.toUpperCase().includes("REMOVE") ? "REMOVED" : decision.toUpperCase().includes("FLAG") ? "FLAGGED" : "APPROVED", reason } }); invalidateLive("admin:jobs"); return accepted("Job moderation decision recorded and audited."); },
  decideReplacement: async (requestId: string, decision: string, reason: string) => { await apiRequest(`/api/v1/admin/replacements/${requestId}/decision`, { method: "POST", idempotent: true, body: { expectedUpdatedAt: updatedAt.get(requestId), decision: decision.toUpperCase().includes("APPROV") ? "APPROVE" : decision.toUpperCase().includes("INFO") ? "REQUEST_INFO" : "REJECT", reason } }); invalidateLive("admin:replacements"); return accepted("Replacement decision recorded and audited."); },
  updateSupportCase: async (caseId: string, action: string, reason: string) => { await apiRequest(`/api/v1/admin/support/${caseId}`, { method: "PATCH", body: { expectedUpdatedAt: updatedAt.get(caseId), status: action.toUpperCase().includes("RESOLV") ? "RESOLVED" : action.toUpperCase().includes("ESCALAT") ? "ESCALATED" : "IN_PROGRESS", reason } }); invalidateLive("admin:support"); return accepted("Support case updated and audited."); },
  retryDelivery: async (deliveryId: string, reason: string) => { await apiRequest(`/api/v1/admin/deliveries/${deliveryId}/retry`, { method: "POST", body: { reason } }); invalidateLive("admin:deliveries"); return accepted("Email delivery retry queued."); },
  updateFeatureFlag: async (key: string, enabled: boolean, reason: string) => { const current = platformAdminService.listFeatureFlags().find((item) => item.key === key); await apiRequest("/api/v1/admin/configuration/feature-flags", { method: "PUT", body: { key, scope: "GLOBAL", enabled, description: current?.description, rolloutPercentage: 100, reason } }); invalidateLive("admin:flags"); return accepted("Feature flag updated and audited."); },
  updatePolicy: async (key: string, value: string, reason: string) => { let parsed: unknown = value; try { parsed = JSON.parse(value); } catch {} await apiRequest("/api/v1/admin/configuration/policies", { method: "PUT", body: { key, value: parsed, reason } }); invalidateLive("admin:policies"); return accepted("Policy updated and audited."); },
  retryFailedJob: async (jobId: string, reason: string) => { await apiRequest(`/api/v1/admin/operations/jobs/${jobId}/retry`, { method: "POST", body: { reason } }); invalidateLive("admin:operations"); return accepted("Failed job retry queued."); },
};
