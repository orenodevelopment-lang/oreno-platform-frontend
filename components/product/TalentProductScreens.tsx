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
  ExternalLink,
  FileBadge,
  GraduationCap,
  KeyRound,
  Laptop,
  MailCheck,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Star,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { productService } from "@/lib/platform/product-service";
import { CountUp } from "@/components/motion/CountUp";
import { ConfirmDialog, DataStateBoundary, ProductPage, ProductTabs, StatusChip, Timeline } from "./ProductUI";

export const talentProductTitles: Record<string, string> = {
  "": "Dashboard",
  onboarding: "Profile setup",
  profile: "Profile",
  account: "Account",
  jobs: "Find jobs",
  applications: "Applications",
  interviews: "Interviews",
  offers: "Offers",
  "team/current": "My team",
  "tasks/calendar": "Task calendar",
  time: "Time entries",
  performance: "Performance",
  compensation: "Compensation",
  notifications: "Notifications",
};

export function TalentProductScreen({ route }: { route: string }) {
  if (route === "") return <TalentDashboard />;
  if (route === "onboarding" || route.startsWith("onboarding/")) return <TalentOnboarding step={route.split("/")[1] ?? "basics"} />;
  if (route === "profile" || route.startsWith("profile/")) return <TalentProfileEditor section={route.split("/")[1] ?? "overview"} />;
  if (route === "account" || route.startsWith("account/")) return <TalentAccount section={route.split("/")[1] ?? "overview"} />;
  if (route === "jobs") return <TalentJobs />;
  if (route.startsWith("jobs/")) return <TalentJobRoute segments={route.split("/").slice(1)} />;
  if (route === "applications") return <TalentApplications />;
  if (route.startsWith("applications/")) return <TalentApplicationDetail id={route.split("/")[1]} />;
  if (route.startsWith("interviews/")) return <TalentInterview id={route.split("/")[1]} />;
  if (route.startsWith("offers/")) return <TalentOffer id={route.split("/")[1]} />;
  if (route === "team/current") return <TalentTeam />;
  if (route === "tasks/calendar") return <TalentTaskCalendar />;
  if (route.startsWith("tasks/")) return <TalentTaskDetail id={route.split("/")[1]} />;
  if (route === "time") return <TalentTimeEntries />;
  if (route === "performance") return <TalentPerformance />;
  if (route === "compensation" || route.startsWith("compensation/")) return <TalentCompensation route={route} />;
  if (route === "notifications") return <TalentNotifications />;
  return <section className="not-found"><h2>This talent product route is not available.</h2><Link href="/talent">Return to dashboard</Link></section>;
}

function TalentDashboard() {
  return <ProductPage eyebrow="Talent workspace" title="Good morning, John" description="Keep track of applications, interviews and current work from one place."><div className="talent-dashboard-grid"><Link href="/talent/applications"><span><BriefcaseBusiness /></span><div><small>Active applications</small><strong><CountUp value={3} /></strong><p>1 interview scheduled</p></div><ArrowRight /></Link><Link href="/talent/tasks"><span><CheckCircle2 /></span><div><small>Tasks due this week</small><strong><CountUp value={4} /></strong><p>2 in progress</p></div><ArrowRight /></Link><Link href="/talent/profile"><span><UserRound /></span><div><small>Profile completion</small><strong><CountUp value={88} suffix="%" /></strong><p>Portfolio can be improved</p></div><ArrowRight /></Link></div><div className="talent-dashboard-columns"><section><header><h3>Upcoming</h3><Link href="/talent/tasks/calendar">View calendar</Link></header><article><CalendarDays /><div><strong>Technical interview</strong><p>Frontend engineer · Sep 29, 10:30 AM</p></div><Link href="/talent/interviews/interview-john">Details</Link></article><article><Clock3 /><div><strong>Design homepage due</strong><p>Sep 30 · High priority</p></div><Link href="/talent/tasks/task-1">Open task</Link></article></section><section><header><h3>Application progress</h3><Link href="/talent/applications">View all</Link></header><Timeline items={[{ label: "Frontend engineer", date: "Interviewing", complete: true }, { label: "Senior product designer", date: "Shortlisted", complete: true }, { label: "Database analyst", date: "Under review", complete: false }]} /></section></div></ProductPage>;
}

const onboardingSteps = [{ key: "basics", label: "Basics" }, { key: "professional", label: "Professional profile" }, { key: "availability", label: "Availability" }, { key: "complete", label: "Complete" }];
function TalentOnboarding({ step }: { step: string }) {
  const index = Math.max(0, onboardingSteps.findIndex((item) => item.key === step));
  if (step === "complete") return <section className="talent-onboarding-complete"><span><CheckCircle2 /></span><h2>Your profile is ready for review</h2><p>You can continue improving it while Oreno reviews your information.</p><div><BadgeCheck /><p><strong>Vetting status</strong>Not started · No vetted label is shown until review is complete.</p></div><Link className="platform-primary" href="/talent">Open dashboard <ArrowRight /></Link></section>;
  const next = onboardingSteps[index + 1]?.key ?? "complete";
  return <section className="talent-onboarding"><aside><h2>Build your Oreno profile</h2><p>A complete profile supports job discovery and human review.</p><ol>{onboardingSteps.map((item, itemIndex) => <li className={item.key === step ? "is-active" : itemIndex < index ? "is-complete" : ""} key={item.key}><i>{itemIndex < index ? <Check /> : itemIndex + 1}</i>{item.label}</li>)}</ol></aside><form onSubmit={(event) => event.preventDefault()}><span className="product-eyebrow">Step {index + 1} of 3</span><h2>{onboardingSteps[index].label}</h2>{step === "basics" && <><div className="form-grid"><TalentField label="First name" value="John" /><TalentField label="Last name" value="Doe C." /><TalentField label="Location" value="Lagos, Nigeria" /><TalentField label="Professional headline" value="Senior frontend engineer" /></div><label className="form-field form-field--wide"><span>About you</span><textarea rows={7} defaultValue="I build accessible, maintainable product interfaces for growing teams." /></label></>}{step === "professional" && <><div className="form-grid"><TalentField label="Primary discipline" value="Frontend engineering" /><TalentField label="Years of experience" value="6" /><TalentField label="Top skills" value="React, TypeScript, Accessibility" /><TalentField label="Portfolio URL" value="https://portfolio.example.com/john" /></div><label className="upload-field"><Upload /><span><strong>Upload CV</strong>PDF or DOCX · 10 MB maximum</span><input type="file" accept=".pdf,.doc,.docx" /></label></>}{step === "availability" && <div className="form-grid"><TalentField label="Availability" value="Available in 2 weeks" /><TalentField label="Preferred engagement" value="Full time" /><TalentField label="Hourly rate" value="35" /><TalentField label="Currency" value="USD" /><TalentField label="Preferred workplace" value="Remote" /><TalentField label="Time zone" value="WAT (UTC+1)" /></div>}<footer><Link href={index ? `/talent/onboarding/${onboardingSteps[index - 1].key}` : "/"}>Back</Link><Link className="platform-primary" href={`/talent/onboarding/${next}`}>Save and continue <ArrowRight /></Link></footer></form></section>;
}

function TalentField({ label, value = "", type = "text" }: { label: string; value?: string; type?: string }) { return <label className="form-field"><span>{label}</span><input type={type} defaultValue={value} /></label>; }

const profileTabs = [
  { key: "overview", label: "Overview", href: "/talent/profile" },
  { key: "experience", label: "Experience", href: "/talent/profile/experience" },
  { key: "education", label: "Education", href: "/talent/profile/education" },
  { key: "certifications", label: "Certifications", href: "/talent/profile/certifications" },
  { key: "portfolio", label: "Portfolio", href: "/talent/profile/portfolio" },
  { key: "availability", label: "Availability", href: "/talent/profile/availability" },
  { key: "skills", label: "Skills & vetting", href: "/talent/profile/skills" },
];
function TalentProfileEditor({ section }: { section: string }) {
  const profile = productService.getTalentProfile();
  const [saved, setSaved] = useState(false);
  return <ProductPage eyebrow="Professional profile" title={profile.name} description={`${profile.profileCompletion}% complete · ${profile.headline}`} actions={<button className="platform-primary" type="button" onClick={() => setSaved(true)}><Save /> Save changes</button>}><ProductTabs items={profileTabs} active={section} />{saved && <div className="inline-success" role="status"><CheckCircle2 /> Profile changes saved locally.</div>}<DataStateBoundary>{section === "overview" ? <ProfileOverview /> : section === "experience" ? <RepeatableRecords icon={<BriefcaseBusiness />} title="Experience" records={profile.experience.map((item) => ({ title: item.role, subtitle: item.company, meta: item.period, body: item.summary }))} /> : section === "education" ? <RepeatableRecords icon={<GraduationCap />} title="Education" records={profile.education.map((item) => ({ title: item.qualification, subtitle: item.school, meta: item.period }))} /> : section === "certifications" ? <RepeatableRecords icon={<FileBadge />} title="Certifications" records={profile.certifications.map((item) => ({ title: item.name, subtitle: item.issuer, meta: item.issuedAt }))} /> : section === "portfolio" ? <RepeatableRecords icon={<Star />} title="Portfolio" records={profile.portfolio.map((item) => ({ title: item.title, subtitle: item.category, meta: item.url }))} /> : section === "availability" ? <AvailabilityEditor /> : <SkillsVetting />}</DataStateBoundary></ProductPage>;
}

function ProfileOverview() { return <form className="product-form-card profile-editor-form"><div className="profile-image-edit"><Image src="/assets/figma/app/company-profile.png" alt="John Doe C." width={130} height={130} /><button type="button"><Upload /> Change photo</button></div><div className="form-grid"><TalentField label="First name" value="John" /><TalentField label="Last name" value="Doe C." /><TalentField label="Professional headline" value="Senior frontend engineer" /><TalentField label="Location" value="Lagos, Nigeria" /></div><label className="form-field form-field--wide"><span>Bio</span><textarea rows={7} defaultValue="I build accessible, maintainable product interfaces for growing teams." /></label></form>; }
function RepeatableRecords({ icon, title, records }: { icon: ReactNode; title: string; records: Array<{ title: string; subtitle: string; meta: string; body?: string }> }) { return <section className="record-editor"><header><div>{icon}<h3>{title}</h3></div><button type="button"><Plus /> Add {title.toLowerCase().replace(/s$/, "")}</button></header>{records.map((record) => <article key={`${record.title}-${record.subtitle}`}><span>{icon}</span><div><h4>{record.title}</h4><p>{record.subtitle}</p><small>{record.meta}</small>{record.body && <p>{record.body}</p>}</div><button type="button">Edit</button></article>)}</section>; }
function AvailabilityEditor() { return <form className="product-form-card"><div className="form-grid"><TalentField label="Availability" value="Available in 2 weeks" /><TalentField label="Preferred engagement" value="Full time" /><TalentField label="Hourly rate" value="35" /><TalentField label="Currency" value="USD" /><TalentField label="Preferred workplace" value="Remote" /><TalentField label="Time zone" value="WAT (UTC+1)" /></div></form>; }
function SkillsVetting() { const profile = productService.getTalentProfile(); return <div className="skills-vetting"><section><header><h3>Skills</h3><button type="button"><Plus /> Add skill</button></header>{profile.skills.map((skill) => <article key={skill.name}><span>{skill.name}</span><StatusChip status={skill.level} /><button type="button">Edit</button></article>)}</section><section><header><span><BadgeCheck /></span><div><h3>{profile.vetting.publicLabel}</h3><p>Updated {profile.vetting.updatedAt}</p></div></header><Timeline items={[{ label: "Profile submitted", date: "Aug 04, 2026", complete: true }, { label: "Information reviewed", date: "Aug 08, 2026", complete: true }, { label: "Vetting completed", date: profile.vetting.updatedAt, complete: true }]} /><p>Internal screening notes remain private to authorised Oreno operations staff.</p></section></div>; }

const accountTabs = [
  { key: "overview", label: "Account details", href: "/talent/account" },
  { key: "security", label: "Security", href: "/talent/account/security" },
  { key: "preferences", label: "Privacy & notifications", href: "/talent/account/preferences" },
];

function TalentAccount({ section }: { section: string }) {
  const account = productService.getTalentAccount();
  const [saved, setSaved] = useState(false);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    productService.updateTalentAccount({
      phone: String(form.get("phone") ?? account.phone),
      preferences: {
        jobAlerts: form.get("jobAlerts") === "on",
        applicationUpdates: form.get("applicationUpdates") === "on",
        marketingEmails: form.get("marketingEmails") === "on",
        profileVisibility: String(form.get("profileVisibility") ?? account.preferences.profileVisibility) as typeof account.preferences.profileVisibility,
      },
    });
    setSaved(true);
  }

  return (
    <ProductPage
      eyebrow="Personal account"
      title="Account and access"
      description="Manage your sign-in identity separately from your professional talent profile."
      actions={<Link className="product-button-secondary" href="/talent/profile"><UserRound /> View professional profile</Link>}
    >
      <ProductTabs items={accountTabs} active={section} />
      {saved && <div className="inline-success" role="status"><CheckCircle2 /> Account settings saved locally.</div>}
      <div className="account-separation-note"><ShieldCheck /><div><strong>Your account belongs to you</strong><p>Companies can manage a work placement after you are hired, but they cannot edit these account or profile details.</p></div></div>
      {section === "security" ? (
        <form className="product-form-card talent-account-form" onSubmit={save}>
          <header><KeyRound /><div><h3>Password and sign-in</h3><p>Last signed in {account.lastSignedInAt}</p></div></header>
          <div className="form-grid"><label className="form-field"><span>Current password</span><input type="password" autoComplete="current-password" /></label><label className="form-field"><span>New password</span><input type="password" minLength={8} autoComplete="new-password" /></label></div>
          <div className="account-security-row"><Laptop /><div><strong>{account.security.activeSessions} active sessions</strong><p>Review and sign out devices you no longer use.</p></div><button type="button">Review sessions</button></div>
          <label className="account-toggle"><input type="checkbox" defaultChecked={account.security.twoFactorEnabled} /><span><strong>Two-step verification</strong><small>Require a second factor when signing in on a new device.</small></span></label>
          <button className="platform-primary" type="submit"><Save /> Save security settings</button>
        </form>
      ) : section === "preferences" ? (
        <form className="product-form-card talent-account-form" onSubmit={save}>
          <header><Bell /><div><h3>Privacy and notifications</h3><p>Choose how companies can discover you and which updates you receive.</p></div></header>
          <label className="form-field"><span>Profile visibility</span><select name="profileVisibility" defaultValue={account.preferences.profileVisibility}><option>Public</option><option>Oreno companies only</option><option>Private</option></select></label>
          <label className="account-toggle"><input name="jobAlerts" type="checkbox" defaultChecked={account.preferences.jobAlerts} /><span><strong>Job alerts</strong><small>Receive opportunities that match your professional profile.</small></span></label>
          <label className="account-toggle"><input name="applicationUpdates" type="checkbox" defaultChecked={account.preferences.applicationUpdates} /><span><strong>Application updates</strong><small>Receive interview, offer and status notifications.</small></span></label>
          <label className="account-toggle"><input name="marketingEmails" type="checkbox" defaultChecked={account.preferences.marketingEmails} /><span><strong>Product news</strong><small>Receive occasional Oreno product and community updates.</small></span></label>
          <button className="platform-primary" type="submit"><Save /> Save preferences</button>
        </form>
      ) : (
        <form className="product-form-card talent-account-form" onSubmit={save}>
          <header><MailCheck /><div><h3>Sign-in identity</h3><p>Created {account.createdAt}</p></div><StatusChip status={account.emailVerified ? "Email verified" : "Verification pending"} /></header>
          <div className="form-grid"><label className="form-field"><span>Email address</span><input type="email" value={account.email} readOnly /></label><label className="form-field"><span>Phone number</span><input name="phone" type="tel" defaultValue={account.phone} /></label></div>
          <div className="account-linked-profile"><UserRound /><div><strong>Professional profile</strong><p>{productService.getTalentProfile().headline} · {productService.getTalentProfile().profileCompletion}% complete</p></div><Link href="/talent/profile">Manage profile <ArrowRight /></Link></div>
          <button className="platform-primary" type="submit"><Save /> Save account details</button>
        </form>
      )}
    </ProductPage>
  );
}

function TalentJobs() {
  const jobs = productService.listPublicJobs();
  const [query, setQuery] = useState("");
  const filtered = jobs.filter((job) => `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <ProductPage eyebrow="Opportunity" title="Find jobs" description="Discover roles using search and filters. Compatibility is explained through visible inputs, not a hidden verdict."><div className="product-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" /></label><select><option>All job types</option><option>Full time</option><option>Contract</option></select><select><option>Any workplace</option><option>Remote</option><option>Hybrid</option></select></div><DataStateBoundary noResults={filtered.length === 0}><div className="talent-job-grid">{filtered.map((job) => <article key={job.id}><header><span><BriefcaseBusiness /></span><button type="button" aria-label="Save job"><Star /></button></header><p>{job.company}</p><h3>{job.title}</h3><div><span><MapPin />{job.location}</span><span><Clock3 />{job.employmentType} · {job.workplace}</span></div><strong>{job.compensation}</strong><ul>{job.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><Link href={`/talent/jobs/${job.id}`}>View details <ArrowRight /></Link></article>)}</div></DataStateBoundary></ProductPage>;
}

function TalentJobRoute({ segments }: { segments: string[] }) {
  const job = productService.getPublicJob(segments[0]);
  if (segments[1] === "apply") return <ApplicationForm jobId={job.id} mode={segments[2] === "standard" ? "standard" : "quick"} />;
  return <ProductPage eyebrow="Job detail" title={job.title} description={`${job.company} · ${job.location}`} actions={<Link className="platform-primary" href={`/talent/jobs/${job.id}/apply`}>Quick apply <ArrowRight /></Link>}><div className="talent-job-detail"><main><div className="job-fact-row"><span><BriefcaseBusiness />{job.employmentType}</span><span><MapPin />{job.workplace}</span><span><CircleDollarSign />{job.compensation}</span><span><CalendarDays />Apply by {job.deadline}</span></div><h3>About the role</h3><p>{job.description}</p><h3>What you’ll do</h3><ul>{job.responsibilities.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul><h3>Requirements</h3><ul>{job.requirements.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></main><aside><h3>Compatibility explanation</h3><p>This comparison helps you understand relevance. It does not decide whether you are hired.</p>{[{ label: "Required skills", result: "Match", body: "3 of 3 requirements appear in your profile" }, { label: "Experience", result: "Match", body: "Your profile meets the stated level" }, { label: "Availability", result: "Match", body: "Your availability is before the target start" }, { label: "Rate", result: "Partial", body: "Your rate is near the top of the listed range" }].map((item) => <div key={item.label}><CheckCircle2 /><span><strong>{item.label} · {item.result}</strong><small>{item.body}</small></span></div>)}<small>Rules version 1.0 · Profile data last updated Sep 20</small></aside></div></ProductPage>;
}

function ApplicationForm({ jobId, mode }: { jobId: string; mode: "quick" | "standard" }) {
  const job = productService.getPublicJob(jobId);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); if (mode === "standard" && !String(form.get("coverNote") ?? "").trim()) { setError("Add a short cover note before submitting."); return; } productService.createApplication({ jobId, mode, coverNote: String(form.get("coverNote") ?? "") }); setSubmitted(true); }
  if (submitted) return <div className="application-success"><CheckCircle2 /><span className="product-eyebrow">Application submitted</span><h2>{job.title}</h2><p>Your application is now visible in tracking. The company will see the same controlled status.</p><Link className="platform-primary" href="/talent/applications">Track application <ArrowRight /></Link></div>;
  return <ProductPage eyebrow={`${mode === "quick" ? "Quick" : "Standard"} application`} title={job.title} description={`${job.company} · ${job.location}`}><form className="application-form" onSubmit={submit} noValidate><section><h3>Profile used for this application</h3><div className="application-profile"><Image src="/assets/figma/app/company-profile.png" alt="" width={70} height={70} /><div><strong>John Doe C.</strong><p>Senior frontend engineer · Profile 88% complete</p></div><Link href="/talent/profile">Review profile</Link></div></section>{mode === "quick" ? <section><h3>Quick apply confirmation</h3><p>Oreno will submit your current profile and CV. You can use the standard application if you want to add more context.</p><Link href={`/talent/jobs/${job.id}/apply/standard`}>Use standard application</Link></section> : <><section><h3>Your application</h3><label className="form-field"><span>Why are you interested in this role?</span><textarea name="coverNote" rows={7} aria-invalid={Boolean(error)} aria-describedby={error ? "application-error" : undefined} /></label>{error && <span className="field-error" id="application-error" role="alert">{error}</span>}<label className="form-field"><span>Earliest start date</span><input type="date" name="startDate" /></label></section><section><h3>Supporting file</h3><label className="upload-field"><Upload /><span><strong>Attach an optional cover letter</strong>PDF or DOCX · 10 MB maximum</span><input type="file" accept=".pdf,.doc,.docx" /></label></section></>}<footer><Link href={`/talent/jobs/${job.id}`}>Cancel</Link><button className="platform-primary" type="submit">Submit application</button></footer></form></ProductPage>;
}

function TalentApplications() {
  const records = productService.listApplications();
  return <ProductPage eyebrow="Opportunity" title="Your applications" description="Company and candidate views read from the same lifecycle and status history."><DataStateBoundary><div className="talent-application-list">{records.map((record) => <Link href={`/talent/applications/${record.id}`} key={record.id}><span className="record-icon"><BriefcaseBusiness /></span><div><p>Oreno Technologies</p><strong>{record.jobTitle}</strong><small>Applied {record.appliedAt}</small></div><StatusChip status={record.status} /><ChevronRight /></Link>)}</div></DataStateBoundary></ProductPage>;
}

function TalentApplicationDetail({ id }: { id: string }) {
  const record = productService.getApplication(id);
  const [confirm, setConfirm] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  return <ProductPage eyebrow="Application tracking" title={record.jobTitle} description={`Oreno Technologies · Applied ${record.appliedAt}`} actions={!withdrawn && !["Accepted", "Rejected", "Withdrawn"].includes(record.status) ? <button className="product-button-danger" type="button" onClick={() => setConfirm(true)}>Withdraw application</button> : undefined}><div className="product-detail-columns"><section className="detail-card"><StatusChip status={withdrawn ? "Withdrawn" : record.status} /><h3>Current next step</h3><p>{withdrawn ? "This application is closed. Its history remains available." : record.status === "Interviewing" ? "Review your scheduled interview details and meeting link." : "The company is reviewing your application. No action is required now."}</p>{record.status === "Interviewing" && !withdrawn && <Link className="platform-primary" href="/talent/interviews/interview-john">View interview</Link>}</section><section className="detail-card"><h3>Status history</h3><Timeline items={[...record.statusHistory.map((item) => ({ label: item.status, date: item.at, detail: item.note, complete: true })), ...(withdrawn ? [{ label: "Withdrawn", date: "Just now", complete: true }] : [])]} /></section></div><ConfirmDialog open={confirm} title="Withdraw this application?" description="The company will no longer consider it. The application remains in your history." confirmLabel="Withdraw application" onCancel={() => setConfirm(false)} onConfirm={() => { setWithdrawn(true); setConfirm(false); }} /></ProductPage>;
}

function TalentInterview({ id }: { id: string }) {
  const record = productService.getInterview(id);
  return <ProductPage eyebrow="Interview" title={record.jobTitle} description={`With Oreno Technologies · ${record.status}`} actions={<a className="platform-primary" href={record.meetingUrl} target="_blank" rel="noreferrer">Join meeting <ExternalLink /></a>}><div className="interview-card"><header><span><CalendarDays /></span><div><h3>{record.startsAt}</h3><p>{record.durationMinutes} minutes</p></div><StatusChip status={record.status} /></header><dl><div><dt>Participants</dt><dd>{record.participants.join(", ")}</dd></div><div><dt>Meeting link</dt><dd><a href={record.meetingUrl}>{record.meetingUrl}</a></dd></div><div><dt>Role</dt><dd>{record.jobTitle}</dd></div></dl><section><h3>Prepare for the conversation</h3><ul className="product-check-list"><li><CheckCircle2 /> Review the role and your submitted profile</li><li><CheckCircle2 /> Test the external meeting link before the interview</li><li><CheckCircle2 /> Prepare examples that show your relevant work</li></ul></section></div></ProductPage>;
}

function TalentOffer({ id }: { id: string }) {
  const offer = productService.getOffer(id);
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [result, setResult] = useState("");
  return <ProductPage eyebrow="Offer review" title={offer.jobTitle} description={`From Oreno Technologies · Starts ${offer.startDate}`}><div className="offer-review"><main><header><div><h3>Employment offer</h3><p>Prepared for {offer.candidateName}</p></div><StatusChip status={result || offer.status} /></header><dl><div><dt>Compensation</dt><dd>{offer.compensation}</dd></div><div><dt>Start date</dt><dd>{offer.startDate}</dd></div><div><dt>Workplace</dt><dd>{offer.workplace}</dd></div></dl><h3>Terms</h3><ul className="product-check-list">{offer.terms.map((term) => <li key={term}><CheckCircle2 />{term}</li>)}</ul></main><aside><ShieldCheck /><h3>Review before deciding</h3><p>Your decision is recorded against this offer. Ask the hiring team about anything unclear before responding.</p><Link href="/talent/messages"><MessageSquare /> Ask a question</Link><button className="platform-primary" type="button" onClick={() => setDecision("accept")}>Accept offer</button><button className="product-button-danger" type="button" onClick={() => setDecision("reject")}>Decline offer</button></aside></div><ConfirmDialog open={Boolean(decision)} title={`${decision === "accept" ? "Accept" : "Decline"} this offer?`} description={decision === "accept" ? "Acceptance starts the controlled placement process with the company." : "The company will see that you declined. The offer remains in history."} confirmLabel={decision === "accept" ? "Accept offer" : "Decline offer"} tone={decision === "accept" ? "positive" : "danger"} onCancel={() => setDecision(null)} onConfirm={() => { if (decision) { productService.decideOffer({ offerId: offer.id, decision }); setResult(decision === "accept" ? "Accepted" : "Rejected"); } setDecision(null); }} /></ProductPage>;
}

function TalentTeam() {
  const teammates = [{ name: "Richard Benson", role: "Product manager", relation: "Your manager", avatar: "/assets/figma/app/manager-profile.jpg" }, { name: "Chibuokem Chiorlu", role: "Product designer", relation: "Teammate", avatar: "/assets/figma/app/company-profile.png" }, { name: "Benny Asitonka-Joe", role: "Data analyst", relation: "Teammate", avatar: "/assets/figma/app/manager-profile.jpg" }];
  return <ProductPage eyebrow="Placement" title="Product design team" description="Understand your current reporting relationship and active teammates."><div className="talent-team-hero"><div><UsersRound /><span><strong>Product design</strong>Design department · 6 members</span></div><div><small>Your manager</small><strong>Richard Benson</strong><Link href="/talent/messages">Send message</Link></div></div><div className="talent-team-grid">{teammates.map((person) => <article key={person.name}><Image src={person.avatar} alt="" width={85} height={85} /><h3>{person.name}</h3><p>{person.role}</p><StatusChip status={person.relation} /><Link href="/talent/messages"><MessageSquare /> Message</Link></article>)}</div></ProductPage>;
}

function TalentTaskDetail({ id }: { id: string }) {
  const task = productService.getTaskDetail(id);
  const [status, setStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  return <ProductPage eyebrow="Assigned work" title={task.title} description={`${task.priority} priority · Due ${task.dueDate}`} actions={<select aria-label="Task status" value={status} onChange={(event) => setStatus(event.target.value)}><option>To-do</option><option>In progress</option><option>In review</option><option>Completed</option></select>}><div className="task-detail-layout"><main><section><StatusChip status={status} /><h3>Description</h3><p>{task.description}</p><dl className="detail-list"><div><dt>Start</dt><dd>{task.startDate}</dd></div><div><dt>Due</dt><dd>{task.dueDate}</dd></div><div><dt>Assignees</dt><dd>{task.assignees.join(", ")}</dd></div></dl></section><section><h3>Time entry</h3><Link className="product-button-secondary" href="/talent/time"><Clock3 /> Record time for this task</Link></section></main><aside><h3>Comments</h3>{task.comments.map((item) => <article className="talent-task-comment" key={item.id}><strong>{item.author}</strong><small>{item.createdAt}</small><p>{item.body}</p></article>)}<form onSubmit={(event) => { event.preventDefault(); setComment(""); }}><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Add a comment" /><button type="submit"><Send /> Comment</button></form></aside></div></ProductPage>;
}

function TalentTaskCalendar() { return <ProductPage eyebrow="Assigned work" title="Task calendar" description="Due dates and work periods reflect the same tasks used by the board."><div className="agenda-list">{["Today", "Tomorrow", "Sep 30"].map((date, index) => <section key={date}><time>{date}</time><Link href="/talent/tasks/task-1"><span className={index === 1 ? "is-pink" : ""}><CheckCircle2 /></span><div><strong>{["Dashboard UI review", "Mobile prototype handoff", "Design homepage"][index]}</strong><p>{index === 2 ? "High priority" : "Assigned task"}</p></div><StatusChip status={["In progress", "In review", "To-do"][index]} /></Link></section>)}</div></ProductPage>; }

function TalentTimeEntries() {
  const [submitted, setSubmitted] = useState(false);
  return <ProductPage eyebrow="Work records" title="Time entries" description="Submitted hours require company approval before they can feed compensation."><div className="product-detail-columns"><section><h3>This week</h3><div className="time-summary"><div><span>Regular</span><strong>32 hrs</strong></div><div><span>Overtime</span><strong>2 hrs</strong></div><StatusChip status={submitted ? "Submitted" : "Draft"} /></div><div className="record-list compact-records">{["Design homepage", "Dashboard UI", "Team review"].map((name, index) => <div key={name}><span className="record-icon"><Clock3 /></span><div><strong>{name}</strong><p>{[16, 12, 6][index]} hours</p></div><button type="button">Edit</button></div>)}</div></section><form className="detail-card" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><h3>Add time</h3><label className="form-field"><span>Task</span><select><option>Design homepage</option><option>Dashboard UI</option></select></label><div className="form-grid"><TalentField label="Date" value="2026-09-25" type="date" /><TalentField label="Hours" value="8" type="number" /></div><label className="form-field"><span>Work note</span><textarea rows={5} /></label><button className="platform-primary" type="submit">{submitted ? "Timesheet submitted" : "Submit week for approval"}</button></form></div></ProductPage>;
}

function TalentPerformance() { return <ProductPage eyebrow="Performance" title="Performance information is not available yet" description="Oreno will not show a percentage until the company defines a traceable measurement policy and visibility rules."><div className="policy-unavailable"><ShieldCheck /><h3>Evidence and policy come first</h3><p>When a policy is approved, this page may include review periods, defined metrics, supporting evidence, manager feedback and a correction or dispute path.</p><ul className="product-check-list"><li><CheckCircle2 /> Metric definitions and calculation version</li><li><CheckCircle2 /> Evidence sources you can understand</li><li><CheckCircle2 /> Visibility and correction rules</li></ul></div></ProductPage>; }

function TalentCompensation({ route }: { route: string }) {
  const payments = productService.listPaymentRecords().filter((record) => record.person === "John Doe C.");
  if (route === "compensation/payments") return <ProductPage eyebrow="Compensation" title="Payment records" description="These describe payments recorded outside Oreno."><div className="product-table payment-table"><div><b>Payroll period</b><b>Amount</b><b>Method</b><b>Reference</b><b>Status</b></div>{payments.map((record) => <div key={record.id}><span>{record.payrollPeriod}</span><strong>{record.currency} {record.amount}</strong><span>{record.methodDescription}</span><span>{record.externalReference}</span><StatusChip status={record.status} /></div>)}</div></ProductPage>;
  return <ProductPage eyebrow="Compensation" title="Compensation summary" description="View your effective pay agreement and approved period records."><div className="compensation-summary"><section><span><WalletCards /></span><p>Current agreement</p><strong>$35.00/hour</strong><small>USD · Effective Feb 12, 2026</small></section><section><span><Clock3 /></span><p>September approved hours</p><strong>160 hrs</strong><small>2 overtime hours</small></section><section><span><CircleDollarSign /></span><p>September gross record</p><strong>$5,705.00</strong><small>External payment recorded</small></section></div><Link className="product-button-secondary" href="/talent/compensation/payments">View payment records <ArrowRight /></Link></ProductPage>;
}

function TalentNotifications() { const records = productService.listNotifications().slice(0, 3); return <ProductPage eyebrow="Inbox" title="Notifications" description="Application, interview, task and message updates appear here."><DataStateBoundary><div className="notification-list">{records.map((record) => <Link className={!record.read ? "is-unread" : ""} href={record.href.replace("/company", "/talent")} key={record.id}><span><Bell /></span><div><strong>{record.title}</strong><p>{record.body}</p><small>{record.createdAt}</small></div>{!record.read && <i>New</i>}</Link>)}</div></DataStateBoundary></ProductPage>; }
