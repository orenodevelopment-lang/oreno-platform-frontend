"use client";

import { OrganisationLogo, CompanyFiles, CompanyFile, ShortlistPicker, PerformancePeriod, PerformanceReview, CompanyReviews } from "./WorkspaceCompletion";
import Image from "next/image";
import Link from "next/link";
import { NewJob, JobLive, InviteMember, RolesLive, MembersLive, HiringApplicationChoice } from "./HiringActions";
import { ResourceScreen, companyResources, NotificationsLive, PreferencesLive } from "./LiveWorkspace";
import { TaskLive, TaskCalendarLive, ShortlistLive, MemberLive, OfferActions } from "./WorkspaceActions";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, ExternalLink, FileText, MessageSquare, Pause, Plus, Search, Send, ShieldCheck, Star, Trash2, UserRoundPlus, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { productService } from "@/lib/platform/product-service";
import type { ApplicationStatus, JobStatus } from "@/lib/platform/contracts";
import { ConfirmDialog, DataStateBoundary, ProductPage, ProductTabs, StatusChip, Timeline } from "./ProductUI";

export const companyProductTitles: Record<string, string> = {
  organisation: "Organisation profile",
  access: "Access management",
  "access/invitations": "Member invitations",
  "access/roles": "Roles and permissions",
  jobs: "Jobs",
  discover: "Discover talent",
  applications: "Applications",
  shortlists: "Shortlists",
  interviews: "Interviews",
  offers: "Offers",
  teams: "Teams",
  time: "Time entries",
  notifications: "Notifications",
  preferences: "Preferences",
  compensation: "Compensation",
};

export function CompanyOnboardingComplete() {
  const onboarding = productService.getCompanyOnboarding();
  return <main className="completion-screen"><div><span><CheckCircle2 /></span><p className="product-eyebrow">Setup complete</p><h1>Your Oreno workspace is ready</h1><p>Your organisation profile and owner account are saved. You can update workspace details and invite members from settings.</p><div className="completion-summary"><div><ShieldCheck /><span><strong>Organisation</strong>{onboarding.name || "Your company"}</span></div><div><UsersRound /><span><strong>Workspace access</strong>Owner account active</span></div><div><BriefcaseBusiness /><span><strong>Next step</strong>Create or publish a role</span></div></div><Link href="/company">Open dashboard <ArrowRight /></Link></div></main>;
}

export function CompanyProductScreen({ route }: { route: string }) {
  if (route === "files") return <CompanyFiles />;
  if (route.startsWith("files/")) return <CompanyFile id={route.split("/")[1]} />;
  if (route === "performance/reviews") return <CompanyReviews />;
  if (route.startsWith("performance/reviews/")) return <PerformanceReview scope="company" id={route.split("/")[2]} />;
  if (route.startsWith("performance/periods/")) return <PerformancePeriod id={route.split("/")[2]} />;
  if (route === "jobs/new") return <NewJob />;
  if (route === "managers/new") return <InviteMember />;
  if (companyResources[route]) return <ResourceScreen key={route} scope="company" config={companyResources[route]} />;
  if (route.startsWith("shortlists/")) return <ShortlistLive id={route.split("/")[1]} />;
  if (route.startsWith("team/")) return <MemberLive id={route.split("/")[1]} />;
  if (route === "compensation") return <ResourceScreen scope="company" config={companyResources["compensation/agreements"]}><nav className="product-tabs"><Link href="/company/compensation/agreements">Agreements</Link><Link href="/company/compensation/payroll">Payroll</Link><Link href="/company/compensation/payments">Payments</Link></nav></ResourceScreen>;
  if (route.startsWith("placements/")) return <ResourceScreen scope="company" config={companyResources.placements} />;
  if (route.startsWith("replacements/")) return <ResourceScreen scope="company" config={companyResources.replacements} />;
  if (route.startsWith("departments/")) return <ResourceScreen scope="company" config={companyResources.departments} />;
  if (route.startsWith("teams/")) return <ResourceScreen scope="company" config={companyResources.teams} />;
  if (route === "organisation") return <OrganisationProfile />;
  if (route === "access" || route.startsWith("access/")) return <AccessManagement active={route.split("/")[1] ?? "members"} />;
  if (route === "jobs") return <CompanyJobs />;
  if (route.startsWith("jobs/")) return <JobLive id={route.split("/")[1]} edit={route.split("/")[2] === "edit"} />;
  if (route === "discover") return <CandidateDiscovery />;
  if (route === "applications") return <ApplicationsPipeline />;
  if (route.startsWith("applications/")) return <ApplicationDetail id={route.split("/")[1]} />;
  if (route === "interviews") return <Interviews />;
  if (route.startsWith("interviews/")) return <InterviewRoute id={route.split("/")[1]} />;
  if (route === "offers") return <Offers />;
  if (route.startsWith("offers/")) return <OfferRoute id={route.split("/")[1]} />;
  if (route === "tasks/calendar") return <TaskCalendarLive scope="company" />;
  if (route.startsWith("tasks/")) return <TaskLive id={route.split("/")[1]} />;
  if (route === "notifications") return <NotificationsLive scope="company" />;
  if (route === "preferences") return <PreferencesLive />;
  return <section className="not-found"><h2>This product route is not available.</h2><Link href="/company">Return to dashboard</Link></section>;
}

function OrganisationProfile() {
  const organisation = productService.getCompanyOnboarding();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setSaved(false); setError(""); try { await productService.updateOrganisationProfile({ expectedUpdatedAt: organisation.organisationUpdatedAt, name: String(form.get("name") ?? ""), primaryContactEmail: String(form.get("primaryContactEmail") ?? ""), industry: String(form.get("industry") ?? ""), companySize: String(form.get("companySize") ?? ""), websiteUrl: String(form.get("websiteUrl") ?? ""), primaryContactPhone: String(form.get("primaryContactPhone") ?? ""), description: String(form.get("description") ?? "") }); setSaved(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "The organisation profile could not be saved."); } finally { setSaving(false); } }
  const initials = organisation.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "OR";
  return <ProductPage eyebrow="Company workspace" title="Organisation profile" description="Keep the business information used across roles, invitations and account settings consistent."><form className="product-form-card" key={organisation.organisationUpdatedAt} onSubmit={save}><header><div className="company-avatar">{initials}</div><div><h3>{organisation.name || "Your organisation"}</h3><p>{[organisation.industry, organisation.companySize].filter(Boolean).join(" · ") || "Organisation details"}</p></div></header><div className="form-grid"><ProductField name="name" label="Company name" value={organisation.name} required /><ProductField name="primaryContactEmail" label="Company email" value={organisation.primaryContactEmail} type="email" required /><ProductField name="industry" label="Industry" value={organisation.industry} /><ProductField name="companySize" label="Company size" value={organisation.companySize} /><ProductField name="websiteUrl" label="Website" value={organisation.websiteUrl} type="url" /><ProductField name="primaryContactPhone" label="Phone number" value={organisation.primaryContactPhone} /></div><label className="form-field form-field--wide"><span>Company description</span><textarea name="description" rows={5} defaultValue={organisation.description} /></label>{error && <span className="field-error" role="alert">{error}</span>}<footer>{saved && <span role="status"><CheckCircle2 /> Organisation profile saved.</span>}<button className="platform-primary" type="submit" disabled={saving || !organisation.organisationUpdatedAt}>{saving ? "Saving…" : "Save changes"}</button></footer></form><OrganisationLogo /></ProductPage>;
}

function ProductField({ label, name, value = "", type = "text", required = false }: { label: string; name?: string; value?: string; type?: string; required?: boolean }) { return <label className="form-field"><span>{label}</span><input name={name} type={type} defaultValue={value} required={required} /></label>; }

const accessTabs = [{ key: "members", label: "Members", href: "/company/access" }, { key: "invitations", label: "Invitations", href: "/company/access/invitations" }, { key: "roles", label: "Roles & permissions", href: "/company/access/roles" }];
function AccessManagement({ active }: { active: string }) {
  return <ProductPage eyebrow="Organisation access" title="Members and access" description="Access follows organisation roles and the resources each person manages." actions={<Link className="platform-primary" href="/company/managers/new"><UserRoundPlus /> Invite member</Link>}><ProductTabs items={accessTabs} active={active} />{active === "members" ? <MembersLive /> : active === "invitations" ? <InvitationTable /> : <RolesLive />}</ProductPage>;
}

function InvitationTable() {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const rows = productService.listCompanyInvitations();
  async function resend(id: string) { setError(""); try { await productService.resendCompanyInvitation(id); } catch (cause) { setError(cause instanceof Error ? cause.message : "The invitation could not be resent."); } }
  async function revoke() { if (!cancelId) return; setError(""); try { await productService.revokeCompanyInvitation(cancelId); setCancelId(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "The invitation could not be cancelled."); } }
  return <>{error && <span className="field-error" role="alert">{error}</span>}<DataStateBoundary><div className="product-table invitation-table"><div><b>Email</b><b>Role</b><b>Invited by</b><b>Expires</b><b>Status</b><b>Action</b></div>{rows.map((row) => <div key={row.id}><span>{row.email}</span><span>{row.role}</span><span>{row.invitedBy}</span><span>{row.expires}</span><StatusChip status={row.status} /><span className="table-actions"><button type="button" onClick={() => resend(row.id)} disabled={row.status !== "Pending"}><Send /> Resend</button><button type="button" onClick={() => setCancelId(row.id)} disabled={row.status !== "Pending"}><Trash2 /> Cancel</button></span></div>)}</div></DataStateBoundary><ConfirmDialog open={Boolean(cancelId)} title="Cancel this invitation?" description="The current invitation link will stop working. You can send a new invitation later." confirmLabel="Cancel invitation" onCancel={() => setCancelId(null)} onConfirm={revoke} /></>;
}

function CompanyJobs() {
  const jobs = productService.listCompanyJobs();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [transition, setTransition] = useState<{ id: string; status: JobStatus } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, JobStatus>>({});
  const [transitionError, setTransitionError] = useState("");
  async function confirmTransition() { if (!transition) return; setTransitionError(""); try { await productService.transitionCompanyJob(transition.id, transition.status); setOverrides((current) => ({ ...current, [transition.id]: transition.status })); setTransition(null); } catch (cause) { setTransitionError(cause instanceof Error ? cause.message : "The job status could not be changed."); } }
  const filtered = jobs.filter((job) => `${job.title} ${job.department}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || (overrides[job.id] ?? job.status) === status));
  return <ProductPage eyebrow="Hiring" title="Jobs" description="Draft, publish and close roles while keeping public discovery aligned." actions={<Link className="platform-primary" href="/company/roles/new"><Plus /> Create job</Link>}>{transitionError && <span className="field-error" role="alert">{transitionError}</span>}<div className="product-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{["Draft", "Published", "Paused", "Closed", "Archived"].map((item) => <option key={item}>{item}</option>)}</select></div><DataStateBoundary noResults={filtered.length === 0}><div className="company-job-grid">{filtered.map((job) => { const currentStatus = overrides[job.id] ?? job.status; return <article key={job.id}><header><span><BriefcaseBusiness /></span><StatusChip status={currentStatus} /></header><h3>{job.title}</h3><p>{job.department} · {job.openings} opening{job.openings === 1 ? "" : "s"}</p><dl><div><dt>Applicants</dt><dd>{job.applicants}</dd></div><div><dt>Deadline</dt><dd>{job.deadline}</dd></div><div><dt>Hiring manager</dt><dd>{job.hiringManager}</dd></div><div><dt>Compensation</dt><dd>{job.compensation}</dd></div></dl><footer><Link href={`/company/jobs/${job.id}`}>View details</Link>{currentStatus === "Published" ? <button type="button" onClick={() => setTransition({ id: job.id, status: "Paused" })}><Pause /> Pause</button> : currentStatus === "Draft" || currentStatus === "Paused" ? <button type="button" onClick={() => setTransition({ id: job.id, status: "Published" })}><CheckCircle2 /> Publish</button> : currentStatus !== "Archived" ? <button type="button" onClick={() => setTransition({ id: job.id, status: "Archived" })}>Archive</button> : null}</footer></article>; })}</div></DataStateBoundary><ConfirmDialog open={Boolean(transition)} title={`${transition?.status ?? "Change"} this job?`} description="This updates whether candidates can discover or apply to the role. The status change remains visible in history." confirmLabel={`Confirm ${transition?.status.toLowerCase() ?? "change"}`} tone={transition?.status === "Published" ? "positive" : "danger"} onCancel={() => setTransition(null)} onConfirm={confirmTransition} /></ProductPage>;
}

function CandidateDiscovery() {
  const talents = productService.listPublicTalents();
  const [query, setQuery] = useState("");
  const [availability,setAvailability]=useState(""); const [location,setLocation]=useState("");
  const filtered = talents.filter(talent=>(!availability||talent.availability.toLowerCase().includes(availability))&&(!location||talent.location.toLowerCase().includes(location.toLowerCase()))).filter((talent) => `${talent.name} ${talent.discipline} ${talent.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <ProductPage eyebrow="Hiring" title="Discover talent" description="Search vetted profiles and review transparent compatibility inputs. No automated hiring verdict is produced."><div className="product-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills or discipline" /></label><select aria-label="Availability" value={availability} onChange={event=>setAvailability(event.target.value)}><option value="">Any availability</option><option value="available now">Available now</option></select><input aria-label="Location" placeholder="Filter by location" value={location} onChange={event=>setLocation(event.target.value)}/></div><DataStateBoundary noResults={filtered.length === 0}><div className="discovery-grid">{filtered.map((talent) => <article key={talent.id}><Image src={talent.avatar} alt="" width={90} height={90} /><div className="discovery-card__title">{talent.vetted && <span><BadgeCheck /> Vetted</span>}<h3>{talent.name}</h3><p>{talent.discipline}</p></div><ul>{talent.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><dl><div><dt>Availability</dt><dd>{talent.availability}</dd></div><div><dt>Rate</dt><dd>{talent.rate}</dd></div></dl><div className="match-explanation"><p>Review this candidate’s skills, availability and rate against your role requirements.</p></div><footer><Link href={`/talent-catalogue/${talent.id}`}>Open profile</Link><ShortlistPicker talentProfileId={talent.id} /></footer></article>)}</div></DataStateBoundary></ProductPage>;
}

const pipelineStatuses: ApplicationStatus[] = ["Submitted", "Under review", "Shortlisted", "Interviewing", "Offer pending"];
function ApplicationsPipeline() {
  const records = productService.listApplications();
  return <ProductPage eyebrow="Hiring" title="Applications pipeline" description="Only candidates explicitly released after Oreno human screening appear here." actions={<Link className="product-button-secondary" href="/company/shortlists"><Star /> Shortlists</Link>}><div className="pipeline-board">{pipelineStatuses.map((status) => <section key={status}><header><span>{status}</span><b>{records.filter((record) => record.status === status).length}</b></header>{records.filter((record) => record.status === status).map((record) => <Link href={`/company/applications/${record.id}`} key={record.id}><strong>{record.candidateName}</strong><span>{record.jobTitle}</span><small>Oreno screening completed{record.releasedAt ? ` · ${record.releasedAt}` : ""}</small><ChevronRight /></Link>)}</section>)}</div></ProductPage>;
}

function ApplicationDetail({ id }: { id: string }) {
  const record = productService.getApplication(id);
  const [overrideStatus, setStatus] = useState<ApplicationStatus>();
  const status = overrideStatus ?? record.status;
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  async function changeStatus(next: ApplicationStatus) { setUpdating(true); setError(""); try { await productService.updateApplicationStatus(id, next, `Changed to ${next} by an authorised company user.`); setStatus(next); } catch (cause) { setError(cause instanceof Error ? cause.message : "The application status could not be changed."); } finally { setUpdating(false); } }
  return <ProductPage eyebrow="Application detail" title={record.candidateName} description={record.jobTitle} actions={<><button className="product-button-secondary" type="button" disabled={updating} onClick={() => changeStatus("Rejected")}>Reject</button><button className="platform-primary" type="button" disabled={updating} onClick={() => { window.location.assign(status === "Interviewing" ? "/company/offers/new" : "/company/interviews/new"); }}>{updating ? "Saving…" : status === "Interviewing" ? "Prepare offer" : "Schedule interview"}</button></>}>{error && <span className="field-error" role="alert">{error}</span>}<div className="application-detail"><aside><Image src="/assets/figma/app/company-profile.png" alt="" width={150} height={150} /><h3>{record.candidateName}</h3><StatusChip status={status} /><StatusChip status="Oreno screening completed" />{record.portfolio && <a href={record.portfolio.startsWith("http") ? record.portfolio : `https://${record.portfolio}`} target="_blank" rel="noreferrer">Portfolio <ExternalLink /></a>}<Link href="/company/messages"><MessageSquare /> Send message</Link></aside><main><section><h3>Application</h3><p>{record.coverNote}</p>{record.employerScreeningSummary && <div className="detail-card"><h4>Oreno screening summary</h4><p>{record.employerScreeningSummary}</p></div>}<dl className="detail-list"><div><dt>Applied</dt><dd>{record.appliedAt}</dd></div><div><dt>Forwarded by Oreno</dt><dd>{record.releasedAt ?? "Completed"}</dd></div><div><dt>Role</dt><dd>{record.jobTitle}</dd></div></dl></section><section><h3>Status history</h3><Timeline items={[...record.statusHistory.map((item) => ({ label: item.status, date: item.at, detail: item.note, complete: true })), ...(status !== record.status ? [{ label: status, date: "Just now", complete: true }] : [])]} /></section></main></div></ProductPage>;
}

function Interviews() {
  const records = productService.listInterviews();
  return <ProductPage eyebrow="Hiring" title="Interviews" description="Record interview timing, participants, meeting links and outcomes." actions={<Link className="platform-primary" href="/company/interviews/new"><Plus /> Schedule interview</Link>}><DataStateBoundary><div className="record-list">{records.map((record) => <Link href={`/company/interviews/${record.id}`} key={record.id}><span className="record-icon"><CalendarDays /></span><div><strong>{record.candidateName}</strong><p>{record.jobTitle}</p></div><span>{record.startsAt}<small>{record.durationMinutes} minutes · {record.participants.length} participants</small></span><StatusChip status={record.status} /><ChevronRight /></Link>)}</div></DataStateBoundary></ProductPage>;
}

function InterviewRoute({ id }: { id: string }) {
  if (id === "new") return <InterviewForm />;
  return <InterviewDetail id={id} />;
}

function InterviewDetail({ id }: { id: string }) {
  const record = productService.getInterview(id);
  const [outcome, setOutcome] = useState(record.outcome ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function saveOutcome(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!outcome) return; const form = new FormData(event.currentTarget); setSaving(true); setError(""); setSaved(false); try { await productService.recordInterviewOutcome(id, outcome as "Advance" | "Hold" | "Reject", String(form.get("notes") ?? "")); setSaved(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "The interview outcome could not be saved."); } finally { setSaving(false); } }
  return <ProductPage eyebrow="Interview detail" title={record.candidateName} description={record.jobTitle} actions={record.meetingUrl ? <a className="platform-primary" href={record.meetingUrl} target="_blank" rel="noreferrer">Open meeting link <ExternalLink /></a> : undefined}><div className="product-detail-columns"><section className="detail-card"><StatusChip status={record.status} /><dl className="detail-list"><div><dt>Date and time</dt><dd>{record.startsAt}</dd></div><div><dt>Duration</dt><dd>{record.durationMinutes} minutes</dd></div><div><dt>Participants</dt><dd>{record.participants.join(", ") || "No additional participants"}</dd></div>{record.meetingUrl && <div><dt>Meeting link</dt><dd><a href={record.meetingUrl}>{record.meetingUrl}</a></dd></div>}</dl></section><form className="detail-card" onSubmit={saveOutcome}><h3>Interview outcome</h3><label className="form-field"><span>Decision</span><select value={outcome} onChange={(event) => setOutcome(event.target.value as typeof outcome)} required><option value="">Choose outcome</option><option>Advance</option><option>Hold</option><option>Reject</option></select></label><label className="form-field"><span>Authorised notes</span><textarea name="notes" rows={6} placeholder="Record evidence relevant to this hiring stage." /></label>{saved && <span role="status"><CheckCircle2 /> Outcome saved.</span>}{error && <span className="field-error" role="alert">{error}</span>}<button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save outcome"}</button></form></div></ProductPage>;
}

function InterviewForm() { const [done, setDone] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const start = new Date(`${form.get("date")}T${form.get("time")}:00`); const end = new Date(start.getTime() + Number(form.get("duration") ?? 60) * 60_000); setSaving(true); setError(""); try { await productService.createInterview({ applicationId: String(form.get("applicationId") ?? ""), scheduledStartAt: start.toISOString(), scheduledEndAt: end.toISOString(), timeZone: String(form.get("timeZone") ?? "Africa/Lagos"), meetingUrl: String(form.get("meetingUrl") ?? "") || undefined }); setDone(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "The interview could not be scheduled."); } finally { setSaving(false); } } return <ProductPage eyebrow="Hiring" title="Schedule interview" description="Record an external meeting link; Oreno does not create third-party calendar events."><form className="product-form-card" onSubmit={submit}><div className="form-grid"><HiringApplicationChoice /><ProductField name="date" label="Date" type="date" required /><ProductField name="time" label="Time" type="time" required /><ProductField name="duration" label="Duration in minutes" value="60" type="number" required /><ProductField name="timeZone" label="Time zone" value="Africa/Lagos" required /><ProductField name="meetingUrl" label="Meeting URL" type="url" /></div><footer>{done && <span role="status"><CheckCircle2 /> Interview scheduled.</span>}{error && <span className="field-error" role="alert">{error}</span>}<button className="platform-primary" type="submit" disabled={saving}>{saving ? "Scheduling…" : "Schedule interview"}</button></footer></form></ProductPage>; }

function Offers() {
  const records = productService.listOffers();
  return <ProductPage eyebrow="Hiring" title="Offers" description="Prepare employment terms, record a decision and convert accepted candidates through a controlled placement step." actions={<Link className="platform-primary" href="/company/offers/new"><Plus /> Create offer</Link>}><DataStateBoundary><div className="record-list">{records.map((record) => <Link href={`/company/offers/${record.id}`} key={record.id}><span className="record-icon"><FileText /></span><div><strong>{record.candidateName}</strong><p>{record.jobTitle}</p></div><span>{record.compensation}<small>Starts {record.startDate}</small></span><StatusChip status={record.status} /><ChevronRight /></Link>)}</div></DataStateBoundary></ProductPage>;
}

function OfferRoute({ id }: { id: string }) {
  if (id === "new") return <OfferForm />;
  const offer = productService.getOffer(id);
  return <ProductPage eyebrow="Offer detail" title={`${offer.candidateName} · ${offer.jobTitle}`} description="Terms presented to the candidate remain linked to the application and placement history." actions={<Link className="platform-primary" href="/company/placements">Review placement <ArrowRight /></Link>}><div className="offer-document"><header><div><p>Employment terms</p><h3>Employment offer</h3></div><StatusChip status={offer.status} /></header><dl><div><dt>Candidate</dt><dd>{offer.candidateName}</dd></div><div><dt>Role</dt><dd>{offer.jobTitle}</dd></div><div><dt>Start date</dt><dd>{offer.startDate}</dd></div><div><dt>Compensation</dt><dd>{offer.compensation}</dd></div><div><dt>Workplace</dt><dd>{offer.workplace}</dd></div></dl><h4>Terms</h4><ul className="product-check-list">{offer.terms.map((term) => <li key={term}><CheckCircle2 />{term}</li>)}</ul><footer><OfferActions id={id} /></footer></div></ProductPage>;
}

function OfferForm() { const [sent, setSent] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setSent(false); setError(""); try { await productService.createOffer({ applicationId: String(form.get("applicationId") ?? ""), title: String(form.get("title") ?? ""), employmentType: String(form.get("employmentType") ?? "FULL_TIME"), workArrangement: String(form.get("workArrangement") ?? "REMOTE"), startDate: String(form.get("startDate") ?? "") || undefined, expiresAt: String(form.get("expiresAt") ?? "") || undefined, amount: String(form.get("amount") ?? ""), currency: String(form.get("currency") ?? "USD").toUpperCase(), rateUnit: String(form.get("rateUnit") ?? "MONTHLY"), additionalTerms: String(form.get("additionalTerms") ?? "") || undefined }); setSent(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "The offer could not be created."); } finally { setSaving(false); } } return <ProductPage eyebrow="Hiring" title="Create offer" description="Save terms as a draft before using the controlled send action."><form className="product-form-card" onSubmit={submit}><div className="form-grid"><HiringApplicationChoice /><ProductField name="title" label="Offer title" required /><ProductField name="startDate" label="Start date" type="date" /><ProductField name="expiresAt" label="Expires at" type="datetime-local" /><ProductField name="amount" label="Compensation amount" type="number" required /><ProductField name="currency" label="Currency" value="USD" required /><label className="form-field"><span>Employment type</span><select name="employmentType" defaultValue="FULL_TIME"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option><option value="TEMPORARY">Temporary</option></select></label><label className="form-field"><span>Work arrangement</span><select name="workArrangement" defaultValue="REMOTE"><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On site</option></select></label><label className="form-field"><span>Rate unit</span><select name="rateUnit" defaultValue="MONTHLY"><option value="HOURLY">Hourly</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select></label></div><label className="form-field form-field--wide"><span>Additional terms</span><textarea name="additionalTerms" rows={6} /></label><footer>{sent && <span role="status"><CheckCircle2 /> Offer draft created.</span>}{error && <span className="field-error" role="alert">{error}</span>}<button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save offer draft"}</button></footer></form></ProductPage>; }
