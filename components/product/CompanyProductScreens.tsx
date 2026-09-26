"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  MessageSquare,
  Pause,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Star,
  Trash2,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { productService } from "@/lib/platform/product-service";
import type { ApplicationStatus, JobStatus } from "@/lib/platform/contracts";
import { ConfirmDialog, DataStateBoundary, ProductPage, ProductTabs, StatusChip, Timeline } from "./ProductUI";
import { motionDurations, motionEasings } from "@/lib/motion/tokens";

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
  return <main className="completion-screen"><div><span><CheckCircle2 /></span><p className="product-eyebrow">Setup complete</p><h1>Your Oreno workspace is ready</h1><p>Your organisation profile, owner account and initial settings have been saved to this local product demo.</p><div className="completion-summary"><div><ShieldCheck /><span><strong>Organisation</strong>Oreno Technologies</span></div><div><UsersRound /><span><strong>Workspace access</strong>Owner account active</span></div><div><BriefcaseBusiness /><span><strong>Next step</strong>Create or publish a role</span></div></div><Link href="/company">Open dashboard <ArrowRight /></Link></div></main>;
}

export function CompanyProductScreen({ route }: { route: string }) {
  if (route === "organisation") return <OrganisationProfile />;
  if (route === "access" || route.startsWith("access/")) return <AccessManagement active={route.split("/")[1] ?? "members"} />;
  if (route === "jobs") return <CompanyJobs />;
  if (route.startsWith("jobs/")) return <CompanyJobRoute segments={route.split("/").slice(1)} />;
  if (route === "discover") return <CandidateDiscovery />;
  if (route === "applications") return <ApplicationsPipeline />;
  if (route.startsWith("applications/")) return <ApplicationDetail id={route.split("/")[1]} />;
  if (route === "shortlists") return <Shortlists />;
  if (route === "interviews") return <Interviews />;
  if (route.startsWith("interviews/")) return <InterviewRoute id={route.split("/")[1]} />;
  if (route === "offers") return <Offers />;
  if (route.startsWith("offers/")) return <OfferRoute id={route.split("/")[1]} />;
  if (route.startsWith("placements/")) return <PlacementDetail />;
  if (route.startsWith("replacements/")) return <ReplacementRequest />;
  if (route === "teams" || route.startsWith("teams/")) return <Teams />;
  if (route.startsWith("departments/")) return <DepartmentDetail />;
  if (route === "tasks/calendar") return <CompanyTaskCalendar />;
  if (route.startsWith("tasks/")) return <TaskDetail id={route.split("/")[1]} />;
  if (route === "time") return <TimeReview />;
  if (route === "notifications") return <Notifications />;
  if (route === "preferences") return <Preferences />;
  if (route === "compensation" || route.startsWith("compensation/")) return <Compensation route={route} />;
  return <section className="not-found"><h2>This product route is not available.</h2><Link href="/company">Return to dashboard</Link></section>;
}

function OrganisationProfile() {
  const [saved, setSaved] = useState(false);
  return <ProductPage eyebrow="Company workspace" title="Organisation profile" description="Keep the business information used across roles, invitations and account settings consistent."><form className="product-form-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><header><div className="company-avatar">OT</div><div><h3>Oreno Technologies</h3><p>Technology · 20–50 employees</p></div><button type="button">Change logo</button></header><div className="form-grid"><ProductField label="Company name" value="Oreno Technologies" /><ProductField label="Company email" value="hello@oreno.co" type="email" /><ProductField label="Industry" value="Technology" /><ProductField label="Company size" value="20–50 employees" /><ProductField label="Website" value="https://oreno.co" /><ProductField label="Phone number" value="+234 (0)903-123-4567" /><ProductField label="Street address" value="14 Admiralty Way" /><ProductField label="City and country" value="Lagos, Nigeria" /></div><label className="form-field form-field--wide"><span>Company description</span><textarea rows={5} defaultValue="We build thoughtful hiring and workforce tools for ambitious teams." /></label><footer>{saved && <span role="status"><CheckCircle2 /> Organisation profile saved.</span>}<button className="platform-primary" type="submit">Save changes</button></footer></form></ProductPage>;
}

function ProductField({ label, value = "", type = "text" }: { label: string; value?: string; type?: string }) { return <label className="form-field"><span>{label}</span><input type={type} defaultValue={value} /></label>; }

const accessTabs = [{ key: "members", label: "Members", href: "/company/access" }, { key: "invitations", label: "Invitations", href: "/company/access/invitations" }, { key: "roles", label: "Roles & permissions", href: "/company/access/roles" }];
function AccessManagement({ active }: { active: string }) {
  return <ProductPage eyebrow="Organisation access" title="Members and access" description="Access follows organisation roles and the resources each person manages." actions={<Link className="platform-primary" href="/company/managers/new"><UserRoundPlus /> Invite member</Link>}><ProductTabs items={accessTabs} active={active} />{active === "members" ? <MembersTable /> : active === "invitations" ? <InvitationTable /> : <PermissionsMatrix />}</ProductPage>;
}

function MembersTable() {
  const rows = [["Richard Benson", "richard@company.com", "Owner", "All workspace areas", "Active"], ["Sarima Chiorlu", "sarima@company.com", "Human resources", "Hiring and people", "Active"], ["Henry Cavill", "cavill@company.com", "Manager", "Engineering team", "Active"], ["Rejoice Okon", "rejoice@company.com", "Manager", "Design team", "Suspended"]];
  return <DataStateBoundary><div className="product-table access-table"><div><b>Member</b><b>Email</b><b>Role</b><b>Scope</b><b>Status</b></div>{rows.map((row) => <div key={row[1]}>{row.map((cell, index) => index === 4 ? <StatusChip key={cell} status={cell} /> : <span key={cell}>{cell}</span>)}</div>)}</div></DataStateBoundary>;
}

function InvitationTable() {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const rows = [{ id: "invite-1", email: "ada@company.com", role: "Manager", invitedBy: "Richard Benson", expires: "Oct 02, 2026", status: "Pending" }, { id: "invite-2", email: "people@company.com", role: "Human resources", invitedBy: "Richard Benson", expires: "Sep 20, 2026", status: "Expired" }];
  return <><DataStateBoundary><div className="product-table invitation-table"><div><b>Email</b><b>Role</b><b>Invited by</b><b>Expires</b><b>Status</b><b>Action</b></div>{rows.map((row) => <div key={row.id}><span>{row.email}</span><span>{row.role}</span><span>{row.invitedBy}</span><span>{row.expires}</span><StatusChip status={cancelled.includes(row.id) ? "Cancelled" : row.status} /><span className="table-actions"><button type="button"><Send /> Resend</button><button type="button" onClick={() => setCancelId(row.id)}><Trash2 /> Cancel</button></span></div>)}</div></DataStateBoundary><ConfirmDialog open={Boolean(cancelId)} title="Cancel this invitation?" description="The current invitation link will stop working. You can send a new invitation later." confirmLabel="Cancel invitation" onCancel={() => setCancelId(null)} onConfirm={() => { if (cancelId) setCancelled((current) => [...current, cancelId]); setCancelId(null); }} /></>;
}

function PermissionsMatrix() {
  const rows = [{ area: "Organisation settings", owner: true, hr: false, manager: false }, { area: "Members and invitations", owner: true, hr: true, manager: false }, { area: "Jobs and applications", owner: true, hr: true, manager: true }, { area: "Staff personal data", owner: true, hr: true, manager: false }, { area: "Compensation", owner: true, hr: true, manager: false }, { area: "Assigned tasks and team", owner: true, hr: true, manager: true }];
  return <div className="permission-layout"><aside><h3>Built-in roles</h3><button className="is-active" type="button">Company owner</button><button type="button">Human resources</button><button type="button">Manager</button><p>Exact access is enforced by backend policy and resource relationships.</p></aside><div className="product-table permission-table"><div><b>Workspace area</b><b>Owner</b><b>HR</b><b>Manager</b></div>{rows.map((row) => <div key={row.area}><span>{row.area}</span>{([row.owner, row.hr, row.manager] as boolean[]).map((allowed, index) => <span key={index} aria-label={allowed ? "Allowed" : "Not allowed"}>{allowed ? <Check /> : "—"}</span>)}</div>)}</div></div>;
}

function CompanyJobs() {
  const jobs = productService.listCompanyJobs();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [transition, setTransition] = useState<{ id: string; status: JobStatus } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, JobStatus>>({});
  const filtered = jobs.filter((job) => `${job.title} ${job.department}`.toLowerCase().includes(query.toLowerCase()) && (status === "All statuses" || (overrides[job.id] ?? job.status) === status));
  return <ProductPage eyebrow="Hiring" title="Jobs" description="Draft, publish and close roles while keeping public discovery aligned." actions={<Link className="platform-primary" href="/company/roles/new"><Plus /> Create job</Link>}><div className="product-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{["Draft", "Published", "Paused", "Closed", "Archived"].map((item) => <option key={item}>{item}</option>)}</select></div><DataStateBoundary noResults={filtered.length === 0}><div className="company-job-grid">{filtered.map((job) => { const currentStatus = overrides[job.id] ?? job.status; return <article key={job.id}><header><span><BriefcaseBusiness /></span><StatusChip status={currentStatus} /></header><h3>{job.title}</h3><p>{job.department} · {job.openings} opening{job.openings === 1 ? "" : "s"}</p><dl><div><dt>Applicants</dt><dd>{job.applicants}</dd></div><div><dt>Deadline</dt><dd>{job.deadline}</dd></div><div><dt>Hiring manager</dt><dd>{job.hiringManager}</dd></div><div><dt>Compensation</dt><dd>{job.compensation}</dd></div></dl><footer><Link href={`/company/jobs/${job.id}`}>View details</Link>{currentStatus === "Published" ? <button type="button" onClick={() => setTransition({ id: job.id, status: "Paused" })}><Pause /> Pause</button> : currentStatus === "Draft" || currentStatus === "Paused" ? <button type="button" onClick={() => setTransition({ id: job.id, status: "Published" })}><CheckCircle2 /> Publish</button> : <button type="button" onClick={() => setTransition({ id: job.id, status: "Archived" })}>Archive</button>}</footer></article>; })}</div></DataStateBoundary><ConfirmDialog open={Boolean(transition)} title={`${transition?.status ?? "Change"} this job?`} description="This updates whether candidates can discover or apply to the role. The status change remains visible in history." confirmLabel={`Confirm ${transition?.status.toLowerCase() ?? "change"}`} tone={transition?.status === "Published" ? "positive" : "danger"} onCancel={() => setTransition(null)} onConfirm={() => { if (transition) setOverrides((current) => ({ ...current, [transition.id]: transition.status })); setTransition(null); }} /></ProductPage>;
}

function CompanyJobRoute({ segments }: { segments: string[] }) {
  const job = productService.getCompanyJob(segments[0]);
  if (segments[1] === "edit") return <JobEdit job={job} />;
  return <ProductPage eyebrow="Job detail" title={job.title} description={`${job.department} · ${job.openings} openings`} actions={<><Link className="product-button-secondary" href={`/company/jobs/${job.id}/edit`}><Edit3 /> Edit</Link><Link className="platform-primary" href={`/company/applications?job=${job.id}`}>View applications</Link></>}><div className="job-record-hero"><div><StatusChip status={job.status} /><h3>{job.compensation}</h3><p>Deadline {job.deadline}</p></div><dl><div><dt>Hiring manager</dt><dd>{job.hiringManager}</dd></div><div><dt>Applicants</dt><dd>{job.applicants}</dd></div><div><dt>Employment</dt><dd>Full time · Remote</dd></div><div><dt>Created</dt><dd>Sep 04, 2026</dd></div></dl></div><div className="product-detail-columns"><section><h3>Role description</h3><p>Build thoughtful, accessible experiences with a cross-functional product team. This product detail is a stable review surface before publication.</p><h3>Requirements</h3><ul className="product-check-list"><li><CheckCircle2 /> Relevant professional experience</li><li><CheckCircle2 /> Strong communication and collaboration</li><li><CheckCircle2 /> Evidence of shipped, high-quality work</li></ul></section><aside><h3>Status history</h3><Timeline items={[{ label: "Draft created", date: "Sep 04, 2026", complete: true }, { label: "Published", date: "Sep 08, 2026", complete: job.status !== "Draft" }, { label: job.status, date: "Current state", complete: true }]} /></aside></div></ProductPage>;
}

function JobEdit({ job }: { job: ReturnType<typeof productService.getCompanyJob> }) {
  const [saved, setSaved] = useState(false);
  return <ProductPage eyebrow="Hiring" title={`Edit ${job.title}`} description="Changes remain a draft until you publish them."><form className="product-form-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><div className="form-grid"><ProductField label="Job title" value={job.title} /><ProductField label="Department" value={job.department} /><ProductField label="Openings" value={String(job.openings)} /><ProductField label="Deadline" value="2026-10-18" type="date" /><ProductField label="Compensation" value={job.compensation} /><ProductField label="Hiring manager" value={job.hiringManager} /></div><label className="form-field form-field--wide"><span>Description</span><textarea rows={8} defaultValue="Build thoughtful, accessible experiences with a cross-functional product team." /></label><footer>{saved && <span role="status"><CheckCircle2 /> Draft saved.</span>}<Link href={`/company/jobs/${job.id}`}>Cancel</Link><button className="platform-primary" type="submit">Save draft</button></footer></form></ProductPage>;
}

function CandidateDiscovery() {
  const talents = productService.listPublicTalents();
  const [query, setQuery] = useState("");
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const filtered = talents.filter((talent) => `${talent.name} ${talent.discipline} ${talent.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <ProductPage eyebrow="Hiring" title="Discover talent" description="Search vetted profiles and review transparent compatibility inputs. No automated hiring verdict is produced."><div className="product-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills or discipline" /></label><select><option>Any availability</option><option>Available now</option></select><select><option>Any location</option><option>Nigeria</option><option>Ghana</option></select></div><DataStateBoundary noResults={filtered.length === 0}><div className="discovery-grid">{filtered.map((talent) => <article key={talent.id}><Image src={talent.avatar} alt="" width={90} height={90} /><div className="discovery-card__title"><span><BadgeCheck /> Vetted</span><h3>{talent.name}</h3><p>{talent.discipline}</p></div><ul>{talent.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><dl><div><dt>Availability</dt><dd>{talent.availability}</dd></div><div><dt>Rate</dt><dd>{talent.rate}</dd></div></dl><div className="match-explanation"><h4>Compatibility inputs</h4><p><CheckCircle2 /> Required skills: strong overlap</p><p><CheckCircle2 /> Availability: compatible</p><p><Clock3 /> Rate: review with candidate</p><small>Deterministic rules · explanation v1.0</small></div><footer><Link href={`/talent-catalogue/${talent.id}`}>Open profile</Link><button type="button" onClick={() => setShortlisted((current) => current.includes(talent.id) ? current.filter((id) => id !== talent.id) : [...current, talent.id])}><Star fill={shortlisted.includes(talent.id) ? "currentColor" : "none"} />{shortlisted.includes(talent.id) ? "Shortlisted" : "Add to shortlist"}</button></footer></article>)}</div></DataStateBoundary></ProductPage>;
}

const pipelineStatuses: ApplicationStatus[] = ["Submitted", "Under review", "Shortlisted", "Interviewing", "Offer pending"];
function ApplicationsPipeline() {
  const records = productService.listApplications();
  return <ProductPage eyebrow="Hiring" title="Applications pipeline" description="One controlled application lifecycle powers the company and candidate views." actions={<Link className="product-button-secondary" href="/company/shortlists"><Star /> Shortlists</Link>}><div className="pipeline-board">{pipelineStatuses.map((status) => <section key={status}><header><span>{status}</span><b>{records.filter((record) => record.status === status).length}</b></header>{records.filter((record) => record.status === status).map((record) => <Link href={`/company/applications/${record.id}`} key={record.id}><strong>{record.candidateName}</strong><span>{record.jobTitle}</span><small>Applied {record.appliedAt}</small><ChevronRight /></Link>)}</section>)}</div></ProductPage>;
}

function ApplicationDetail({ id }: { id: string }) {
  const record = productService.getApplication(id);
  const [status, setStatus] = useState<ApplicationStatus>(record.status);
  return <ProductPage eyebrow="Application detail" title={record.candidateName} description={record.jobTitle} actions={<><button className="product-button-secondary" type="button" onClick={() => setStatus("Rejected")}>Reject</button><button className="platform-primary" type="button" onClick={() => setStatus(status === "Interviewing" ? "Offer pending" : "Interviewing")}>{status === "Interviewing" ? "Prepare offer" : "Schedule interview"}</button></>}><div className="application-detail"><aside><Image src="/assets/figma/app/company-profile.png" alt="" width={150} height={150} /><h3>{record.candidateName}</h3><p>Senior frontend engineer</p><StatusChip status={status} /><a href={`https://${record.portfolio}`} target="_blank" rel="noreferrer">Portfolio <ExternalLink /></a><Link href="/company/messages"><MessageSquare /> Send message</Link></aside><main><section><h3>Application</h3><p>{record.coverNote}</p><dl className="detail-list"><div><dt>Applied</dt><dd>{record.appliedAt}</dd></div><div><dt>Role</dt><dd>{record.jobTitle}</dd></div><div><dt>Availability</dt><dd>Available in 2 weeks</dd></div><div><dt>Expected rate</dt><dd>$35/hr</dd></div></dl></section><section><h3>Status history</h3><Timeline items={[...record.statusHistory.map((item) => ({ label: item.status, date: item.at, detail: item.note, complete: true })), ...(status !== record.status ? [{ label: status, date: "Just now", complete: true }] : [])]} /></section></main></div></ProductPage>;
}

function Shortlists() {
  const lists = productService.listShortlists();
  return <ProductPage eyebrow="Hiring" title="Shortlists" description="Keep employer-created and Oreno-curated candidate groups separate and ordered." actions={<button className="platform-primary" type="button"><Plus /> New shortlist</button>}><DataStateBoundary><div className="shortlist-grid">{lists.map((list) => <article key={list.id}><header><span><Star /></span><StatusChip status={list.id.includes("final") ? "Employer shortlist" : "Oreno curated"} /></header><h3>{list.name}</h3><p>{list.jobTitle}</p><div className="shortlist-avatars">{list.candidateIds.map((id, index) => <Image key={id} src={index % 2 ? "/assets/figma/app/manager-profile.jpg" : "/assets/figma/app/company-profile.png"} alt="" width={48} height={48} />)}</div><dl><div><dt>Candidates</dt><dd>{list.candidateIds.length}</dd></div><div><dt>Owner</dt><dd>{list.owner}</dd></div><div><dt>Updated</dt><dd>{list.updatedAt}</dd></div></dl><Link href={`/company/shortlists/${list.id}`}>Open shortlist <ArrowRight /></Link></article>)}</div></DataStateBoundary></ProductPage>;
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
  return <ProductPage eyebrow="Interview detail" title={record.candidateName} description={record.jobTitle} actions={<a className="platform-primary" href={record.meetingUrl} target="_blank" rel="noreferrer">Open meeting link <ExternalLink /></a>}><div className="product-detail-columns"><section className="detail-card"><StatusChip status={record.status} /><dl className="detail-list"><div><dt>Date and time</dt><dd>{record.startsAt}</dd></div><div><dt>Duration</dt><dd>{record.durationMinutes} minutes</dd></div><div><dt>Participants</dt><dd>{record.participants.join(", ")}</dd></div><div><dt>Meeting link</dt><dd><a href={record.meetingUrl}>{record.meetingUrl}</a></dd></div></dl></section><form className="detail-card" onSubmit={(event) => event.preventDefault()}><h3>Interview outcome</h3><label className="form-field"><span>Decision</span><select value={outcome} onChange={(event) => setOutcome(event.target.value as typeof outcome)}><option value="">Choose outcome</option><option>Advance</option><option>Hold</option><option>Reject</option></select></label><label className="form-field"><span>Authorised notes</span><textarea rows={6} placeholder="Record evidence relevant to this hiring stage." /></label><button className="platform-primary" type="submit">Save outcome</button></form></div></ProductPage>;
}

function InterviewForm() { const [done, setDone] = useState(false); return <ProductPage eyebrow="Hiring" title="Schedule interview" description="The MVP records an external meeting link; it does not create third-party calendar events."><form className="product-form-card" onSubmit={(event) => { event.preventDefault(); setDone(true); }}><div className="form-grid"><ProductField label="Candidate" value="John Doe C." /><ProductField label="Role" value="Frontend engineer" /><ProductField label="Date" value="2026-09-29" type="date" /><ProductField label="Time" value="10:30" type="time" /><ProductField label="Duration in minutes" value="60" /><ProductField label="Meeting URL" value="https://meet.example.com/oreno-john" /></div><label className="form-field form-field--wide"><span>Participants</span><input defaultValue="Richard Benson, Henry Cavill" /></label><footer>{done && <span role="status"><CheckCircle2 /> Interview scheduled.</span>}<button className="platform-primary" type="submit">Schedule interview</button></footer></form></ProductPage>; }

function Offers() {
  const records = productService.listOffers();
  return <ProductPage eyebrow="Hiring" title="Offers" description="Prepare employment terms, record a decision and convert accepted candidates through a controlled placement step." actions={<Link className="platform-primary" href="/company/offers/new"><Plus /> Create offer</Link>}><DataStateBoundary><div className="record-list">{records.map((record) => <Link href={`/company/offers/${record.id}`} key={record.id}><span className="record-icon"><FileText /></span><div><strong>{record.candidateName}</strong><p>{record.jobTitle}</p></div><span>{record.compensation}<small>Starts {record.startDate}</small></span><StatusChip status={record.status} /><ChevronRight /></Link>)}</div></DataStateBoundary></ProductPage>;
}

function OfferRoute({ id }: { id: string }) {
  if (id === "new") return <OfferForm />;
  const offer = productService.getOffer(id);
  return <ProductPage eyebrow="Offer detail" title={`${offer.candidateName} · ${offer.jobTitle}`} description="Terms presented to the candidate remain linked to the application and placement history." actions={<Link className="platform-primary" href={`/company/placements/${offer.id}`}>Review placement <ArrowRight /></Link>}><div className="offer-document"><header><div><p>Oreno Technologies</p><h3>Employment offer</h3></div><StatusChip status={offer.status} /></header><dl><div><dt>Candidate</dt><dd>{offer.candidateName}</dd></div><div><dt>Role</dt><dd>{offer.jobTitle}</dd></div><div><dt>Start date</dt><dd>{offer.startDate}</dd></div><div><dt>Compensation</dt><dd>{offer.compensation}</dd></div><div><dt>Workplace</dt><dd>{offer.workplace}</dd></div></dl><h4>Terms</h4><ul className="product-check-list">{offer.terms.map((term) => <li key={term}><CheckCircle2 />{term}</li>)}</ul><footer><button type="button"><Download /> Download summary</button><button type="button"><Copy /> Copy candidate link</button></footer></div></ProductPage>;
}

function OfferForm() { const [sent, setSent] = useState(false); return <ProductPage eyebrow="Hiring" title="Create offer" description="Confirm terms before sending them to the candidate."><form className="product-form-card" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><div className="form-grid"><ProductField label="Candidate" value="Chibuokem Chiorlu" /><ProductField label="Role" value="Senior product designer" /><ProductField label="Start date" value="2026-10-19" type="date" /><ProductField label="Compensation" value="$3,400/month" /><ProductField label="Workplace" value="Remote" /><ProductField label="Review period" value="3 months" /></div><label className="form-field form-field--wide"><span>Additional terms</span><textarea rows={6} defaultValue="Equipment allowance&#10;20 paid leave days" /></label><footer>{sent && <span role="status"><CheckCircle2 /> Offer saved and ready to send.</span>}<button className="platform-primary" type="submit">Save offer</button></footer></form></ProductPage>; }

function PlacementDetail() {
  const [completed, setCompleted] = useState(false);
  return <ProductPage eyebrow="Hire to staff handoff" title="Create placement" description="Convert the accepted application into one staff relationship without duplicating the person’s profile."><div className="placement-layout"><section><div className="placement-person"><Image src="/assets/figma/app/manager-profile.jpg" alt="" width={90} height={90} /><div><h3>Chibuokem Chiorlu</h3><p>Senior product designer</p><StatusChip status={completed ? "Placed" : "Offer accepted"} /></div></div><Timeline items={[{ label: "Application accepted", date: "Sep 24, 2026", complete: true }, { label: "Offer accepted", date: "Sep 26, 2026", complete: true }, { label: "Staff assignment", date: completed ? "Just now" : "Pending", complete: completed }]} /></section><form onSubmit={(event) => { event.preventDefault(); setCompleted(true); }}><div className="form-grid"><ProductField label="Effective start date" value="2026-10-19" type="date" /><ProductField label="Manager" value="Richard Benson" /><ProductField label="Department" value="Design" /><ProductField label="Team" value="Product design" /><ProductField label="Title" value="Senior product designer" /><ProductField label="Pay agreement" value="$3,400/month · USD" /></div><button className="platform-primary" type="submit" disabled={completed}>{completed ? "Placement created" : "Create staff placement"}</button></form></div></ProductPage>;
}

function ReplacementRequest() {
  const [done, setDone] = useState(false);
  return <ProductPage eyebrow="Placement support" title="Request a replacement review" description="Eligibility and the replacement window are determined by Oreno policy; this form does not promise approval."><div className="product-detail-columns"><section className="detail-card"><h3>Placement</h3><dl className="detail-list"><div><dt>Talent</dt><dd>Chibuokem Chiorlu</dd></div><div><dt>Role</dt><dd>Senior product designer</dd></div><div><dt>Start date</dt><dd>Oct 19, 2026</dd></div><div><dt>Eligibility</dt><dd>Requires operations review</dd></div></dl></section>{done ? <div className="product-success-card"><CheckCircle2 /><h3>Replacement review requested</h3><p>Oreno operations will review the policy window and submitted reason.</p></div> : <form className="detail-card" onSubmit={(event) => { event.preventDefault(); productService.requestReplacement({ placementId: "placement-chibuokem", reason: "Role fit", details: "The assignment requires a different product-domain background." }); setDone(true); }}><label className="form-field"><span>Reason</span><select required><option value="">Choose a reason</option><option>Role fit</option><option>Availability changed</option><option>Placement ended early</option></select></label><label className="form-field"><span>Details</span><textarea required rows={7} /></label><button className="platform-primary" type="submit">Submit for review</button></form>}</div></ProductPage>;
}

function Teams() {
  const teams = [{ name: "Product design", department: "Design", manager: "Richard Benson", members: 6 }, { name: "Frontend platform", department: "Engineering", manager: "Henry Cavill", members: 8 }, { name: "Growth studio", department: "Marketing", manager: "Sarima Chiorlu", members: 5 }];
  return <ProductPage eyebrow="Organisation" title="Teams and assignments" description="Teams remain distinct from departments, projects and vacancy roles." actions={<button className="platform-primary" type="button"><Plus /> Create team</button>}><DataStateBoundary><div className="team-grid">{teams.map((team, index) => <article key={team.name}><header><span><UsersRound /></span><button type="button"><Edit3 /></button></header><h3>{team.name}</h3><p>{team.department}</p><div className="team-manager"><Image src={index % 2 ? "/assets/figma/app/company-profile.png" : "/assets/figma/app/manager-profile.jpg"} alt="" width={45} height={45} /><span><small>Manager</small>{team.manager}</span></div><footer><span>{team.members} members</span><Link href={`/company/teams/${team.name.toLowerCase().replaceAll(" ", "-")}`}>Manage assignments</Link></footer></article>)}</div></DataStateBoundary></ProductPage>;
}

function DepartmentDetail() { return <ProductPage eyebrow="Organisation" title="Engineering" description="Department hierarchy, managers and teams are managed without treating job roles as organisation units."><div className="department-detail"><aside><h3>Department details</h3><dl className="detail-list"><div><dt>Department manager</dt><dd>Henry Cavill</dd></div><div><dt>Members</dt><dd>12 active staff</dd></div><div><dt>Subdepartments</dt><dd>3</dd></div><div><dt>Status</dt><dd><StatusChip status="Active" /></dd></div></dl><button className="product-button-secondary" type="button"><Edit3 /> Edit department</button></aside><main><header><h3>Subdepartments</h3><button type="button"><Plus /> Add subdepartment</button></header>{["Frontend", "Backend", "Quality assurance"].map((name, index) => <article key={name}><span><BriefcaseBusiness /></span><div><strong>{name}</strong><p>{[6, 4, 2][index]} staff · {index ? "Henry Cavill" : "Richard Benson"}</p></div><button type="button">Manage</button></article>)}</main></div></ProductPage>; }

function TaskDetail({ id }: { id: string }) {
  const task = productService.getTaskDetail(id);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(task.comments);
  return <ProductPage eyebrow="Work management" title={task.title} description={`${task.status} · ${task.priority} priority`} actions={<Link className="product-button-secondary" href="/company/tasks/calendar"><CalendarDays /> Calendar</Link>}><div className="task-detail-layout"><main><section><h3>Task description</h3><p>{task.description}</p><dl className="detail-list"><div><dt>Status</dt><dd><StatusChip status={task.status} /></dd></div><div><dt>Priority</dt><dd>{task.priority}</dd></div><div><dt>Start date</dt><dd>{task.startDate}</dd></div><div><dt>Due date</dt><dd>{task.dueDate}</dd></div><div><dt>Assignees</dt><dd>{task.assignees.join(", ")}</dd></div></dl></section></main><aside><h3>Comments</h3><div className="task-comments">{comments.map((item) => <article key={item.id}><span>{item.author.slice(0,1)}</span><div><strong>{item.author}</strong><small>{item.createdAt}</small><p>{item.body}</p></div></article>)}</div><form onSubmit={(event) => { event.preventDefault(); if (!comment.trim()) return; setComments((current) => [...current, { id: `comment-${Date.now()}`, author: "Richard Benson", body: comment, createdAt: "Just now" }]); setComment(""); }}><label><span className="sr-only">Add comment</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Add a comment" /></label><button type="submit"><Send /> Comment</button></form></aside></div></ProductPage>;
}

function CompanyTaskCalendar() {
  const events = [{ day: 1, title: "Design homepage", tone: "teal" }, { day: 3, title: "Dashboard UI", tone: "pink" }, { day: 3, title: "User research", tone: "green" }, { day: 5, title: "Onboarding flow", tone: "teal" }];
  const months = ["August", "September", "October"];
  const [monthIndex, setMonthIndex] = useState(1);
  const [direction, setDirection] = useState(1);
  function changeMonth(nextDirection: -1 | 1) { setDirection(nextDirection); setMonthIndex((current) => Math.max(0, Math.min(months.length - 1, current + nextDirection))); }
  return <ProductPage eyebrow="Work management" title="Task calendar" description="This is a date representation of the same task records used by the board." actions={<Link className="product-button-secondary" href="/company/talents/john-doe/tasks">Board view</Link>}><div className="full-calendar"><header><button type="button" disabled={monthIndex === 0} onClick={() => changeMonth(-1)}>Previous</button><h3>{months[monthIndex]} 2026</h3><button type="button" disabled={monthIndex === months.length - 1} onClick={() => changeMonth(1)}>Next</button></header><div className="full-calendar__week">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <span key={day}>{day}</span>)}</div><AnimatePresence initial={false} mode="popLayout" custom={direction}><m.div className="full-calendar__days" key={months[monthIndex]} custom={direction} initial={{ opacity: 0, x: direction * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -18 }} transition={{ duration: motionDurations.drawer, ease: motionEasings.standard }}>{Array.from({ length: 35 }, (_, index) => <div key={index}><time>{index + 1 <= 30 ? index + 1 : ""}</time>{events.filter((event) => event.day === index + 1).map((event) => <Link className={`is-${event.tone}`} href="/company/tasks/task-1" key={event.title}>{event.title}</Link>)}</div>)}</m.div></AnimatePresence></div></ProductPage>;
}

function TimeReview() {
  const entries = productService.listTimeEntries();
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  return <ProductPage eyebrow="Work management" title="Time-entry review" description="Only approved hours feed compensation calculations." actions={<button className="product-button-secondary" type="button"><Download /> Export period</button>}><DataStateBoundary><div className="product-table time-table"><div><b>Talent</b><b>Period</b><b>Regular</b><b>Overtime</b><b>Status</b><b>Decision</b></div>{entries.map((entry) => <div key={entry.id}><span>{entry.person}</span><span>{entry.period}</span><span>{entry.regularHours} hrs</span><span>{entry.overtimeHours} hrs</span><StatusChip status={decisions[entry.id] ?? entry.status} /><span className="table-actions"><button type="button" disabled={entry.status === "Approved"} onClick={() => { productService.decideTimeEntry({ timeEntryId: entry.id, decision: "approve" }); setDecisions((current) => ({ ...current, [entry.id]: "Approved" })); }}><Check /> Approve</button><button type="button" disabled={entry.status === "Approved"} onClick={() => setDecisions((current) => ({ ...current, [entry.id]: "Rejected" }))}>Reject</button></span></div>)}</div></DataStateBoundary></ProductPage>;
}

export function PerformanceFoundation() {
  return <ProductPage eyebrow="Performance" title="Review foundations" description="No score is displayed until the organisation approves a formula, evidence sources and visibility policy."><div className="performance-foundation"><section><header><span><ShieldCheck /></span><div><h3>Performance policy required</h3><p>Define the measurement policy before creating a review period.</p></div></header><ol><li><CheckCircle2 /> Define metric name, evidence source and owner</li><li><CheckCircle2 /> Define calculation and version</li><li><CheckCircle2 /> Define what talent can view and dispute</li><li><CheckCircle2 /> Record corrections without erasing history</li></ol><button className="platform-primary" type="button">Create draft policy</button></section><section><h3>Draft review periods</h3><article><div><strong>Q4 2026 review</strong><span>Oct 01 – Dec 31</span></div><StatusChip status="Policy incomplete" /></article><article><div><strong>New hire check-in</strong><span>First 90 days</span></div><StatusChip status="Draft" /></article></section></div></ProductPage>;
}

function Compensation({ route }: { route: string }) {
  if (route === "compensation/payments") return <PaymentRecords />;
  if (route.startsWith("compensation/salary/")) return <SalaryDetail />;
  if (route.startsWith("compensation/payroll/")) return <PayrollPeriod />;
  return <ProductPage eyebrow="Compensation" title="Compensation records" description="Review pay agreements, payroll periods and external payment records without moving money."><div className="compensation-links"><Link href="/company/salaries"><CircleDollarSign /><div><strong>Payroll overview</strong><span>Period totals, overtime and adjustments</span></div><ArrowRight /></Link><Link href="/company/compensation/payroll/2026-09"><CalendarDays /><div><strong>September 2026 payroll</strong><span>Approved · 20 line items</span></div><ArrowRight /></Link><Link href="/company/compensation/payments"><FileText /><div><strong>Payment records</strong><span>External references and reconciliation state</span></div><ArrowRight /></Link></div></ProductPage>;
}

function SalaryDetail() { return <ProductPage eyebrow="Compensation" title="John Doe C. · salary detail" description="Effective pay terms and one period-specific line item."><div className="product-detail-columns"><section className="detail-card"><h3>Pay agreement</h3><dl className="detail-list"><div><dt>Rate</dt><dd>$35.00/hour</dd></div><div><dt>Currency</dt><dd>USD</dd></div><div><dt>Effective from</dt><dd>Feb 12, 2026</dd></div><div><dt>Overtime rule</dt><dd>1.5× approved hourly rate</dd></div></dl></section><section className="detail-card"><h3>September line item</h3><dl className="detail-list"><div><dt>Approved hours</dt><dd>160</dd></div><div><dt>Overtime</dt><dd>2</dd></div><div><dt>Bonus</dt><dd>$0.00</dd></div><div><dt>Gross record</dt><dd>$5,705.00 USD</dd></div></dl></section></div></ProductPage>; }
function PayrollPeriod() { return <ProductPage eyebrow="Compensation" title="September 2026 payroll" description="Approved inputs are locked against silent recalculation after approval." actions={<button className="product-button-secondary" type="button"><Download /> Export CSV</button>}><div className="payroll-period"><header><div><span>Total gross record</span><strong>$42,500.00 USD</strong></div><StatusChip status="Approved" /></header><Timeline items={[{ label: "Period opened", date: "Sep 01, 2026", complete: true }, { label: "Time entries approved", date: "Sep 22, 2026", complete: true }, { label: "Payroll approved", date: "Sep 24, 2026", complete: true }, { label: "External payments recorded", date: "In progress", complete: false }]} /></div></ProductPage>; }
function PaymentRecords() { const rows = productService.listPaymentRecords(); return <ProductPage eyebrow="Compensation" title="Payment records" description="These records describe external payments; Oreno does not transfer money in the MVP."><DataStateBoundary><div className="product-table payment-table"><div><b>Person</b><b>Payroll period</b><b>Amount</b><b>Method</b><b>Reference</b><b>Status</b></div>{rows.map((record) => <div key={record.id}><span>{record.person}</span><span>{record.payrollPeriod}</span><strong>{record.currency} {record.amount}</strong><span>{record.methodDescription}</span><span>{record.externalReference}</span><StatusChip status={record.status} /></div>)}</div></DataStateBoundary></ProductPage>; }

function Notifications() {
  const [read, setRead] = useState<string[]>([]);
  const records = productService.listNotifications();
  return <ProductPage eyebrow="Inbox" title="Notifications" description="Hiring, work, message and compensation events are prioritised without treating every update as urgent." actions={<Link className="product-button-secondary" href="/company/preferences"><Settings2 /> Preferences</Link>}><DataStateBoundary><div className="notification-list">{records.map((record) => <Link className={!record.read && !read.includes(record.id) ? "is-unread" : ""} href={record.href} onClick={() => setRead((current) => [...current, record.id])} key={record.id}><span><Bell /></span><div><strong>{record.title}</strong><p>{record.body}</p><small>{record.category} · {record.createdAt}</small></div>{!record.read && !read.includes(record.id) && <i>New</i>}</Link>)}</div></DataStateBoundary></ProductPage>;
}

function Preferences() {
  const [saved, setSaved] = useState(false);
  const preferences = [{ label: "Hiring decisions and interviews", email: true, inApp: true }, { label: "Tasks and time entries", email: false, inApp: true }, { label: "New messages", email: true, inApp: true }, { label: "Payroll and payment records", email: true, inApp: true }, { label: "Product updates", email: false, inApp: false }];
  return <ProductPage eyebrow="Account" title="Notification preferences" description="Security-critical messages cannot be disabled."><form className="preference-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><div className="preference-head"><span>Notification</span><span>Email</span><span>In app</span></div>{preferences.map((item) => <div key={item.label}><strong>{item.label}</strong><input type="checkbox" defaultChecked={item.email} aria-label={`${item.label} email`} /><input type="checkbox" defaultChecked={item.inApp} aria-label={`${item.label} in app`} /></div>)}<footer>{saved && <span role="status"><CheckCircle2 /> Preferences saved.</span>}<button className="platform-primary" type="submit">Save preferences</button></footer></form></ProductPage>;
}
