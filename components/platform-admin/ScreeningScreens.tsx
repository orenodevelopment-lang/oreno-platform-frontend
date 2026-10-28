"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { AsyncState } from "@/lib/platform/contracts";
import type { AdminSession } from "@/lib/platform-admin/contracts";
import { hasAdminPermission } from "@/lib/platform-admin/policy";
import { platformAdminService } from "@/lib/platform-admin/service";
import { AdminButton, AdminCard, AdminNotice, AdminSelect, AdminStateBoundary, AdminStatus, AdminTable, AdminToast, AdminToolbar } from "./AdminUI";

const screeningStatuses = [
  "PENDING_CV_REVIEW", "CV_REVIEW_IN_PROGRESS", "ADDITIONAL_INFO_REQUIRED", "CV_APPROVED",
  "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "FINAL_REVIEW_PENDING", "APPROVED_FOR_SUBMISSION",
  "RELEASED_TO_COMPANY", "NOT_SELECTED", "WITHDRAWN", "CANCELLED",
];

function label(value: string) {
  return value.toLowerCase().replace(/(^|_)\w/g, (match) => match.replace("_", " ").toUpperCase());
}

function withRole(path: string, roleSlug?: string) {
  return roleSlug ? `${path}?role=${encodeURIComponent(roleSlug)}` : path;
}

export function ScreeningScreens({ route, roleSlug, session, state }: { route: string; roleSlug?: string; session: AdminSession; state?: AsyncState | null }) {
  const applicationId = route.split("/")[1];
  return applicationId
    ? <ScreeningWorkbench applicationId={applicationId} roleSlug={roleSlug} session={session} state={state} />
    : <ScreeningQueue roleSlug={roleSlug} session={session} state={state} />;
}

function ScreeningQueue({ roleSlug, state }: { roleSlug?: string; session: AdminSession; state?: AsyncState | null }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const rows = platformAdminService.listScreenings({ status: status || undefined, q: search.trim() || undefined });
  return <AdminStateBoundary state={state}><div className="admin-screen">
    <div className="admin-page-lead"><div><span>Hiring operations</span><h1>Recruitment screening</h1><p>Review each submitted CV and Oreno interview before a candidate is explicitly forwarded to a company.</p></div></div>
    <AdminNotice title="Employer privacy gate">Companies cannot see an applicant, answers, or CV until an authorized Oreno administrator completes human screening and uses the separate release action.</AdminNotice>
    <AdminCard>
      <AdminToolbar search={search} onSearch={setSearch}><AdminSelect label="Screening status" value={status} options={screeningStatuses} onChange={setStatus} /></AdminToolbar>
      <AdminTable columns={[
        { key: "talent", label: "Candidate", render: (row) => <span><strong>{row.talent}</strong><small className="admin-cell-detail">{row.email}</small></span> },
        { key: "job", label: "Vacancy", render: (row) => <span><strong>{row.job}</strong><small className="admin-cell-detail">{row.company}</small></span> },
        { key: "submitted", label: "Submitted", render: (row) => row.submittedAt },
        { key: "reviewer", label: "Reviewer", render: (row) => row.assignee ?? "Unassigned" },
        { key: "due", label: "Due", render: (row) => row.dueAt ?? "—" },
        { key: "status", label: "Status", render: (row) => <AdminStatus status={label(row.status)} /> },
      ]} rows={rows} getRowKey={(row) => row.id} onRow={(row) => router.push(withRole(`/platform-admin/screening/${row.applicationId}`, roleSlug))} />
    </AdminCard>
  </div></AdminStateBoundary>;
}

function ScreeningWorkbench({ applicationId, roleSlug, session, state }: { applicationId: string; roleSlug?: string; session: AdminSession; state?: AsyncState | null }) {
  const record = platformAdminService.getScreening(applicationId);
  const canReview = hasAdminPermission(session.role, "screening:review");
  const canRelease = hasAdminPermission(session.role, "screening:release");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(action: () => Promise<{ message: string }>) {
    setPending(true); setError("");
    try { const result = await action(); setMessage(result.message); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The screening action could not be recorded."); }
    finally { setPending(false); }
  }

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await run(() => platformAdminService.assignScreening(applicationId, String(form.get("reviewerId")), String(form.get("reason"))));
  }

  async function reviewCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await run(() => platformAdminService.reviewScreeningCv(applicationId, String(form.get("decision")) as "APPROVED" | "NOT_SELECTED", String(form.get("reason")), String(form.get("candidateFeedback") ?? ""), String(form.get("employerSummary") ?? "")));
  }

  async function requestInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await run(() => platformAdminService.requestScreeningInformation(applicationId, String(form.get("message")), String(form.get("reason"))));
  }

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const start = new Date(String(form.get("startsAt"))); const duration = Number(form.get("duration") ?? 60);
    await run(() => platformAdminService.scheduleScreeningInterview(applicationId, { interviewerId: String(form.get("interviewerId")), mode: String(form.get("mode")), startsAt: start.toISOString(), endsAt: new Date(start.getTime() + duration * 60_000).toISOString(), timeZone: String(form.get("timeZone")), meetingUrl: String(form.get("meetingUrl") ?? ""), reason: String(form.get("reason")) }));
  }

  async function decideInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const interview = record.interviews.find((item) => ["SCHEDULED", "RESCHEDULED"].includes(item.status));
    if (!interview) { setError("No active Oreno interview is available for a decision."); return; }
    await run(() => platformAdminService.decideScreeningInterview(applicationId, interview.id, interview.updatedAt, String(form.get("outcome")) as "PASSED" | "FAILED" | "ON_HOLD" | "NEEDS_FOLLOWUP", String(form.get("reason")), String(form.get("candidateFeedback") ?? "")));
  }

  async function finalDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await run(() => platformAdminService.decideScreeningFinal(applicationId, String(form.get("decision")) as "APPROVED" | "NOT_SELECTED" | "ON_HOLD", String(form.get("reason")), String(form.get("candidateMessage") ?? ""), String(form.get("employerSummary") ?? "")));
  }

  async function release(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await run(() => platformAdminService.releaseScreening(applicationId, record.organisationId, String(form.get("reason"))));
  }

  return <AdminStateBoundary state={state}><div className="admin-screen">
    <div className="admin-breadcrumb"><Link href={withRole("/platform-admin/screening", roleSlug)}>Recruitment screening</Link><span>/</span>{record.talent}</div>
    <div className="admin-page-lead"><div><span>{record.company}</span><h1>{record.talent}</h1><p>{record.job} · submitted {record.submittedAt}</p></div><AdminStatus status={label(record.status)} /></div>
    {error && <AdminNotice tone="danger" title="Action not recorded">{error}</AdminNotice>}
    <div className="admin-detail-grid">
      <AdminCard title="Candidate and role evidence">
        <dl className="admin-fact-grid"><div><dt>Email</dt><dd>{record.email}</dd></div><div><dt>Skills</dt><dd>{record.skills.join(", ") || "No skills supplied"}</dd></div><div><dt>Job requirements</dt><dd>{record.requirements.join(" · ") || "No structured requirements"}</dd></div><div><dt>Cover note</dt><dd>{record.coverLetter || "No cover note"}</dd></div></dl>
        {record.answers.map((answer) => <p key={answer.question}><strong>{answer.question}</strong><br />{answer.answer}</p>)}
      </AdminCard>
      <AdminCard title="Submitted CV" description="The link is short-lived and access is audited.">
        <p><strong>{record.cv?.name ?? "Submitted CV"}</strong><br />{record.cv?.mimeType ?? "Private document"} · {record.cv?.status ?? "Ready for authorized review"}</p>
        <AdminButton disabled={pending || !record.currentCvFileId} onClick={() => run(async () => { await platformAdminService.openScreeningCv(applicationId); return { message: "Secure CV link opened." }; })} tone="secondary"><Download /> Open secure CV</AdminButton>
      </AdminCard>
      <AdminCard className="admin-card--wide" title="Screening history">
        <ul className="admin-timeline">{record.history.map((item) => <li key={item.id}><i /><div><strong>{label(item.action)}</strong><p>{item.reason ?? `${label(item.fromStatus ?? "New")} → ${label(item.toStatus)}`}</p><small>{item.createdAt} · {item.actor}</small></div></li>)}</ul>
      </AdminCard>
    </div>

    {!canReview && !canRelease && <AdminNotice tone="warning">Your role may not access screening decisions or private CV evidence.</AdminNotice>}
    {canReview && <div className="admin-detail-grid">
      <AdminCard title="Reviewer assignment"><form className="product-form-card" onSubmit={assign}><label className="form-field"><span>Reviewer user ID</span><input name="reviewerId" defaultValue={session.id} required /></label><label className="form-field"><span>Reason</span><textarea name="reason" minLength={10} required rows={3} defaultValue="Assigning an authorized human reviewer." /></label><AdminButton disabled={pending} type="submit">Assign reviewer</AdminButton></form></AdminCard>
      <AdminCard title="Human CV decision"><form className="product-form-card" onSubmit={reviewCv}><label className="form-field"><span>Decision</span><select name="decision"><option value="APPROVED">Approve CV for Oreno interview</option><option value="NOT_SELECTED">Do not advance</option></select></label><label className="form-field"><span>Audited reason / private notes</span><textarea name="reason" minLength={10} required rows={3} /></label><label className="form-field"><span>Candidate-visible feedback</span><textarea name="candidateFeedback" rows={3} /></label><label className="form-field"><span>Employer-safe summary</span><textarea name="employerSummary" rows={3} /></label><AdminButton disabled={pending} type="submit">Record CV decision</AdminButton></form></AdminCard>
      <AdminCard title="Request additional information"><form className="product-form-card" onSubmit={requestInfo}><label className="form-field"><span>Message to applicant</span><textarea name="message" minLength={3} required rows={3} /></label><label className="form-field"><span>Audited reason</span><textarea name="reason" minLength={10} required rows={3} /></label><AdminButton disabled={pending} type="submit" tone="secondary">Request information</AdminButton></form></AdminCard>
      <AdminCard title="Schedule Oreno interview"><form className="product-form-card" onSubmit={schedule}><label className="form-field"><span>Interviewer user ID</span><input name="interviewerId" defaultValue={session.id} required /></label><label className="form-field"><span>Mode</span><select name="mode"><option value="VIDEO">Video</option><option value="PHONE">Phone</option><option value="ONSITE">On site</option></select></label><label className="form-field"><span>Starts at</span><input name="startsAt" type="datetime-local" required /></label><label className="form-field"><span>Duration (minutes)</span><input name="duration" type="number" min="15" defaultValue="60" required /></label><label className="form-field"><span>Time zone</span><input name="timeZone" defaultValue="Africa/Lagos" required /></label><label className="form-field"><span>External meeting URL</span><input name="meetingUrl" type="url" /></label><label className="form-field"><span>Audited reason</span><textarea name="reason" minLength={10} required rows={3} /></label><AdminButton disabled={pending} type="submit">Schedule interview</AdminButton></form></AdminCard>
      <AdminCard title="Record Oreno interview outcome"><form className="product-form-card" onSubmit={decideInterview}><label className="form-field"><span>Outcome</span><select name="outcome"><option value="PASSED">Passed</option><option value="FAILED">Failed</option><option value="ON_HOLD">On hold</option><option value="NEEDS_FOLLOWUP">Needs follow-up</option></select></label><label className="form-field"><span>Audited reason / private notes</span><textarea name="reason" minLength={10} required rows={3} /></label><label className="form-field"><span>Candidate-visible feedback</span><textarea name="candidateFeedback" rows={3} /></label><AdminButton disabled={pending} type="submit">Record interview outcome</AdminButton></form></AdminCard>
      <AdminCard title="Final human screening decision"><form className="product-form-card" onSubmit={finalDecision}><label className="form-field"><span>Decision</span><select name="decision"><option value="APPROVED">Approve for company submission</option><option value="ON_HOLD">Hold for review</option><option value="NOT_SELECTED">Do not advance</option></select></label><label className="form-field"><span>Audited reason</span><textarea name="reason" minLength={10} required rows={3} /></label><label className="form-field"><span>Candidate message</span><textarea name="candidateMessage" rows={3} /></label><label className="form-field"><span>Employer-safe summary</span><textarea name="employerSummary" rows={3} /></label><AdminButton disabled={pending} type="submit"><ShieldCheck /> Record final decision</AdminButton></form></AdminCard>
    </div>}
    {canRelease && <AdminCard title="Explicit company release" description={`Forward only to ${record.company}. This action is separately authorized, audited, and idempotent.`}><form className="product-form-card" onSubmit={release}><label className="form-field"><span>Release reason and confirmation</span><textarea name="reason" minLength={10} required rows={3} placeholder={`Confirm that the approved application may be shared with ${record.company}.`} /></label><AdminButton disabled={pending || record.status !== "APPROVED_FOR_SUBMISSION"} type="submit"><ShieldCheck /> Forward candidate to company</AdminButton></form></AdminCard>}
    {message && <AdminToast message={message} onDismiss={() => setMessage("")} />}
  </div></AdminStateBoundary>;
}
