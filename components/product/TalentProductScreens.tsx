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
import { useRouter } from "next/navigation";
import { productService } from "@/lib/platform/product-service";
import { authApi } from "@/lib/api/auth";
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
  if (route === "tasks") return <TalentTasks />;
  if (route === "tasks/calendar") return <TalentTaskCalendar />;
  if (route.startsWith("tasks/")) return <TalentTaskDetail id={route.split("/")[1]} />;
  if (route === "time") return <TalentTimeEntries />;
  if (route === "performance") return <TalentPerformance />;
  if (route === "compensation" || route.startsWith("compensation/")) return <TalentCompensation route={route} />;
  if (route === "notifications") return <TalentNotifications />;
  return <section className="not-found"><h2>This talent product route is not available.</h2><Link href="/talent">Return to dashboard</Link></section>;
}

function TalentDashboard() {
  const profile = productService.getTalentProfile();
  const applications = productService.listTalentApplications();
  const interviews = productService.listTalentInterviews();
  const firstName = profile.name && profile.name !== "Loading…" ? profile.name.split(" ")[0] : "there";
  const activeApplications = applications.filter((item) => !["Accepted", "Rejected", "Withdrawn"].includes(item.status));
  return <ProductPage eyebrow="Talent workspace" title={`Good morning, ${firstName}`} description="Keep track of applications, interviews and your professional profile from one place."><div className="talent-dashboard-grid"><Link href="/talent/applications"><span><BriefcaseBusiness /></span><div><small>Active applications</small><strong><CountUp value={activeApplications.length} /></strong><p>{interviews.length} interview{interviews.length === 1 ? "" : "s"} scheduled</p></div><ArrowRight /></Link><Link href="/talent/jobs"><span><Search /></span><div><small>Open opportunities</small><strong>Explore</strong><p>Find roles that fit your profile</p></div><ArrowRight /></Link><Link href="/talent/profile"><span><UserRound /></span><div><small>Profile completion</small><strong><CountUp value={profile.profileCompletion} suffix="%" /></strong><p>Keep your information current</p></div><ArrowRight /></Link></div><div className="talent-dashboard-columns"><section><header><h3>Upcoming interviews</h3><Link href="/talent/applications">View applications</Link></header>{interviews.length ? interviews.slice(0, 3).map((interview) => <article key={interview.id}><CalendarDays /><div><strong>{interview.jobTitle}</strong><p>{interview.startsAt} · {interview.status}</p></div><Link href={`/talent/interviews/${interview.id}`}>Details</Link></article>) : <p>No interviews are scheduled yet.</p>}</section><section><header><h3>Application progress</h3><Link href="/talent/applications">View all</Link></header><Timeline items={applications.slice(0, 4).map((item) => ({ label: item.jobTitle, date: item.status, complete: item.status !== "Submitted" }))} /></section></div></ProductPage>;
}

const onboardingSteps = [{ key: "basics", label: "Basics" }, { key: "professional", label: "Professional profile" }, { key: "availability", label: "Availability" }, { key: "complete", label: "Complete" }];
function TalentOnboarding({ step }: { step: string }) {
  const router = useRouter();
  const index = Math.max(0, onboardingSteps.findIndex((item) => item.key === step));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function finish() {
    setSaving(true); setError("");
    try { await productService.completeTalentOnboarding(); router.replace("/talent"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Your profile could not be submitted."); }
    finally { setSaving(false); }
  }
  if (step === "complete") return <section className="talent-onboarding-complete"><span><CheckCircle2 /></span><h2>Submit your profile for review</h2><p>Oreno checks that the essential profile fields are complete before activating your talent profile.</p><div><BadgeCheck /><p><strong>Vetting status</strong>Vetting remains separate and no vetted label is shown until review is complete.</p></div>{error && <span className="field-error" role="alert">{error}</span>}<button className="platform-primary" type="button" disabled={saving} onClick={() => void finish()}>{saving ? "Submitting…" : "Complete profile"} <ArrowRight /></button></section>;
  const next = onboardingSteps[index + 1]?.key ?? "complete";
  async function saveStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (step === "basics") await productService.updateTalentOnboardingProfile({ firstName: String(form.get("firstName")), lastName: String(form.get("lastName")), city: String(form.get("city")), countryCode: String(form.get("countryCode")), headline: String(form.get("headline")), bio: String(form.get("bio")) });
      if (step === "professional") await productService.updateTalentOnboardingProfile({ currentTitle: String(form.get("currentTitle")), yearsExperience: Number(form.get("yearsExperience")), portfolioUrl: String(form.get("portfolioUrl")) });
      if (step === "availability") await productService.updateTalentAvailability({ availabilityStatus: String(form.get("availabilityStatus")) as "AVAILABLE_NOW" | "AVAILABLE_FROM_DATE" | "UNAVAILABLE", availableFrom: form.get("availableFrom") ? String(form.get("availableFrom")) : null, preferredEmploymentTypes: [String(form.get("employmentType")) as "FULL_TIME" | "PART_TIME" | "CONTRACT"], preferredWorkArrangement: String(form.get("workArrangement")) as "REMOTE" | "HYBRID" | "ONSITE", hoursPerWeek: Number(form.get("hoursPerWeek")), expectedRateAmount: String(form.get("rate")), expectedRateCurrency: String(form.get("currency")), expectedRateUnit: "HOURLY" });
      router.push(`/talent/onboarding/${next}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "This step could not be saved."); }
    finally { setSaving(false); }
  }
  return <section className="talent-onboarding"><aside><h2>Build your Oreno profile</h2><p>A complete profile supports job discovery and human review.</p><ol>{onboardingSteps.map((item, itemIndex) => <li className={item.key === step ? "is-active" : itemIndex < index ? "is-complete" : ""} key={item.key}><i>{itemIndex < index ? <Check /> : itemIndex + 1}</i>{item.label}</li>)}</ol></aside><form onSubmit={saveStep}><span className="product-eyebrow">Step {index + 1} of 3</span><h2>{onboardingSteps[index].label}</h2>{step === "basics" && <><div className="form-grid"><TalentField name="firstName" label="First name" required /><TalentField name="lastName" label="Last name" required /><TalentField name="city" label="City" required /><TalentField name="countryCode" label="Country code" value="NG" required /><TalentField name="headline" label="Professional headline" required /></div><label className="form-field form-field--wide"><span>About you</span><textarea name="bio" rows={7} required /></label></>}{step === "professional" && <><div className="form-grid"><TalentField name="currentTitle" label="Current or primary role" required /><TalentField name="yearsExperience" label="Years of experience" type="number" value="1" required /><TalentField name="portfolioUrl" label="Portfolio URL" type="url" required /></div><p className="account-separation-note">You can add skills, experience, education, a CV, and portfolio records from your profile after this setup.</p></>}{step === "availability" && <div className="form-grid"><label className="form-field"><span>Availability</span><select name="availabilityStatus" defaultValue="AVAILABLE_NOW"><option value="AVAILABLE_NOW">Available now</option><option value="AVAILABLE_FROM_DATE">Available from a date</option><option value="UNAVAILABLE">Unavailable</option></select></label><TalentField name="availableFrom" label="Available from (if later)" type="date" /><label className="form-field"><span>Preferred engagement</span><select name="employmentType" defaultValue="FULL_TIME"><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACT">Contract</option></select></label><TalentField name="rate" label="Hourly rate" type="number" value="25" required /><TalentField name="currency" label="Currency" value="USD" required /><label className="form-field"><span>Preferred workplace</span><select name="workArrangement" defaultValue="REMOTE"><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On site</option></select></label><TalentField name="hoursPerWeek" label="Hours per week" type="number" value="40" required /></div>}{error && <span className="field-error" role="alert">{error}</span>}<footer><Link href={index ? `/talent/onboarding/${onboardingSteps[index - 1].key}` : "/"}>Back</Link><button className="platform-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save and continue"} <ArrowRight /></button></footer></form></section>;
}

function TalentField({ label, name, value = "", type = "text", required = false }: { label: string; name?: string; value?: string; type?: string; required?: boolean }) { return <label className="form-field"><span>{label}</span><input name={name} type={type} defaultValue={value} required={required} /></label>; }

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
  return <ProductPage eyebrow="Professional profile" title={profile.name} description={`${profile.profileCompletion}% complete · ${profile.headline}`}><ProductTabs items={profileTabs} active={section} /><DataStateBoundary>{section === "overview" ? <ProfileOverview profile={profile} /> : section === "experience" ? <RepeatableRecords icon={<BriefcaseBusiness />} title="Experience" records={profile.experience.map((item) => ({ title: item.role, subtitle: item.company, meta: item.period, body: item.summary }))} /> : section === "education" ? <RepeatableRecords icon={<GraduationCap />} title="Education" records={profile.education.map((item) => ({ title: item.qualification, subtitle: item.school, meta: item.period }))} /> : section === "certifications" ? <RepeatableRecords icon={<FileBadge />} title="Certifications" records={profile.certifications.map((item) => ({ title: item.name, subtitle: item.issuer, meta: item.issuedAt }))} /> : section === "portfolio" ? <RepeatableRecords icon={<Star />} title="Portfolio" records={profile.portfolio.map((item) => ({ title: item.title, subtitle: item.category, meta: item.url }))} /> : section === "availability" ? <AvailabilityEditor /> : <SkillsVetting />}</DataStateBoundary></ProductPage>;
}

function ProfileOverview({ profile }: { profile: ReturnType<typeof productService.getTalentProfile> }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setSaved(false); setError(""); try { await productService.updateTalentProfile({ id: profile.id, expectedUpdatedAt: profile.updatedAt, headline: String(form.get("headline") ?? ""), bio: String(form.get("bio") ?? "") }); setSaved(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "Your profile could not be saved."); } finally { setSaving(false); } }
  return <form className="product-form-card profile-editor-form" key={profile.updatedAt} onSubmit={save}><div className="profile-image-edit"><Image src="/assets/figma/app/company-profile.png" alt="Profile" width={130} height={130} /><button type="button" disabled title="Use the profile files area to upload a scanned profile image."><Upload /> Change photo</button></div><div className="form-grid"><TalentField label="Name" value={profile.name} /><TalentField name="headline" label="Professional headline" value={profile.headline} required /><TalentField label="Location" value={profile.location} /></div><label className="form-field form-field--wide"><span>Bio</span><textarea name="bio" rows={7} defaultValue={profile.bio} /></label>{saved && <div className="inline-success" role="status"><CheckCircle2 /> Profile changes saved.</div>}{error && <span className="field-error" role="alert">{error}</span>}<footer><button className="platform-primary" type="submit" disabled={saving || !profile.updatedAt}><Save /> {saving ? "Saving…" : "Save changes"}</button></footer></form>;
}
function RepeatableRecords({ icon, title, records }: { icon: ReactNode; title: string; records: Array<{ title: string; subtitle: string; meta: string; body?: string }> }) { return <section className="record-editor"><header><div>{icon}<h3>{title}</h3></div><button type="button" disabled title={`${title} editing is temporarily unavailable.`}><Plus /> Add {title.toLowerCase().replace(/s$/, "")}</button></header>{records.map((record) => <article key={`${record.title}-${record.subtitle}`}><span>{icon}</span><div><h4>{record.title}</h4><p>{record.subtitle}</p><small>{record.meta}</small>{record.body && <p>{record.body}</p>}</div><button type="button" disabled title={`${title} editing is temporarily unavailable.`}>Edit</button></article>)}</section>; }
function AvailabilityEditor() { return <form className="product-form-card"><div className="form-grid"><TalentField label="Availability" value="Available in 2 weeks" /><TalentField label="Preferred engagement" value="Full time" /><TalentField label="Hourly rate" value="35" /><TalentField label="Currency" value="USD" /><TalentField label="Preferred workplace" value="Remote" /><TalentField label="Time zone" value="WAT (UTC+1)" /></div></form>; }
function SkillsVetting() { const profile = productService.getTalentProfile(); return <div className="skills-vetting"><section><header><h3>Skills</h3><button type="button" disabled title="Skill editing is not available in this release."><Plus /> Add skill</button></header>{profile.skills.map((skill) => <article key={skill.name}><span>{skill.name}</span><StatusChip status={skill.level} /><button type="button" disabled title="Editing is not available in this release.">Edit</button></article>)}</section><section><header><span><BadgeCheck /></span><div><h3>{profile.vetting.publicLabel}</h3><p>Updated {profile.vetting.updatedAt}</p></div></header><Timeline items={[{ label: "Profile submitted", date: "Aug 04, 2026", complete: true }, { label: "Information reviewed", date: "Aug 08, 2026", complete: true }, { label: "Vetting completed", date: profile.vetting.updatedAt, complete: true }]} /><p>Internal screening notes remain private to authorised Oreno operations staff.</p></section></div>; }

const accountTabs = [
  { key: "overview", label: "Account details", href: "/talent/account" },
  { key: "security", label: "Security", href: "/talent/account/security" },
  { key: "preferences", label: "Privacy & notifications", href: "/talent/account/preferences" },
];

function TalentAccount({ section }: { section: string }) {
  const account = productService.getTalentAccount();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setSaveError("");
    const form = new FormData(event.currentTarget);
    try {
      if (section === "security") {
        const currentPassword = String(form.get("currentPassword") ?? "");
        const newPassword = String(form.get("newPassword") ?? "");
        if (!currentPassword || !newPassword) throw new Error("Enter your current and new password.");
        await authApi.changePassword(currentPassword, newPassword);
      } else {
        await productService.updateTalentAccount({
          phone: String(form.get("phone") ?? account.phone),
          preferences: {
            jobAlerts: form.get("jobAlerts") === "on",
            applicationUpdates: form.get("applicationUpdates") === "on",
            marketingEmails: form.get("marketingEmails") === "on",
            profileVisibility: String(form.get("profileVisibility") ?? account.preferences.profileVisibility) as typeof account.preferences.profileVisibility,
          },
        });
      }
      setSaved(true);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Your settings could not be saved.");
    }
  }

  return (
    <ProductPage
      eyebrow="Personal account"
      title="Account and access"
      description="Manage your sign-in identity separately from your professional talent profile."
      actions={<Link className="product-button-secondary" href="/talent/profile"><UserRound /> View professional profile</Link>}
    >
      <ProductTabs items={accountTabs} active={section} />
      {saved && <div className="inline-success" role="status"><CheckCircle2 /> Account settings saved.</div>}
      {saveError && <span className="field-error" role="alert">{saveError}</span>}
      <div className="account-separation-note"><ShieldCheck /><div><strong>Your account belongs to you</strong><p>Companies can manage a work placement after you are hired, but they cannot edit these account or profile details.</p></div></div>
      {section === "security" ? (
        <form className="product-form-card talent-account-form" onSubmit={save}>
          <header><KeyRound /><div><h3>Password and sign-in</h3><p>Last signed in {account.lastSignedInAt}</p></div></header>
          <div className="form-grid"><label className="form-field"><span>Current password</span><input name="currentPassword" type="password" autoComplete="current-password" required /></label><label className="form-field"><span>New password</span><input name="newPassword" type="password" minLength={12} autoComplete="new-password" required /></label></div>
          <div className="account-security-row"><Laptop /><div><strong>{account.security.activeSessions} active sessions</strong><p>Review and sign out devices you no longer use.</p></div><button type="button">Review sessions</button></div>
          <div className="account-security-row"><ShieldCheck /><div><strong>Two-step verification is {account.security.twoFactorEnabled ? "enabled" : "not enabled"}</strong><p>Authenticator setup and recovery-code management use Oreno’s protected two-factor flow.</p></div><StatusChip status={account.security.twoFactorEnabled ? "Active" : "Not enabled"} /></div>
          <button className="platform-primary" type="submit"><Save /> Change password</button>
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
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const cv = form.get("cv"); if (!(cv instanceof File) || cv.size === 0) { setError("Attach the CV you want Oreno to review for this job."); return; } if (mode === "standard" && !String(form.get("coverNote") ?? "").trim()) { setError("Add a short cover note before submitting."); return; } setSubmitting(true); setError(""); try { await productService.createApplication({ jobId, mode, cvFile: cv, coverNote: String(form.get("coverNote") ?? ""), answers: { earliest_start_date: String(form.get("startDate") ?? "") } }); setSubmitted(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "Your application could not be submitted."); } finally { setSubmitting(false); } }
  if (submitted) return <div className="application-success"><CheckCircle2 /><span className="product-eyebrow">Application received — awaiting Oreno screening</span><h2>{job.title}</h2><p>Oreno will review your submitted CV and application before anything is forwarded to the hiring company.</p><Link className="platform-primary" href="/talent/applications">Track screening progress <ArrowRight /></Link></div>;
  return <ProductPage eyebrow={`${mode === "quick" ? "Quick" : "Standard"} application`} title={job.title} description={`${job.company} · ${job.location}`}><form className="application-form" onSubmit={submit} noValidate><section><h3>Profile used for this application</h3><div className="application-profile"><Image src="/assets/figma/app/company-profile.png" alt="" width={70} height={70} /><div><strong>Your current Oreno profile</strong><p>Review your profile before submitting.</p></div><Link href="/talent/profile">Review profile</Link></div></section>{mode === "quick" ? <section><h3>Quick apply confirmation</h3><p>Your profile and the exact CV selected below enter Oreno&apos;s job-specific human screening. The company receives them only after approval and explicit release.</p><Link href={`/talent/jobs/${job.id}/apply/standard`}>Use standard application</Link></section> : <section><h3>Your application</h3><label className="form-field"><span>Why are you interested in this role?</span><textarea name="coverNote" rows={7} aria-invalid={Boolean(error)} aria-describedby={error ? "application-error" : undefined} /></label><label className="form-field"><span>Earliest start date</span><input type="date" name="startDate" /></label></section>}<section><h3>CV for this application</h3><label className="form-field"><span>PDF, DOC, or DOCX</span><input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label><p>This private file is security-scanned and reviewed by authorized Oreno staff. It is shared with {job.company} only if Oreno approves and explicitly forwards this application.</p></section>{error && <span className="field-error" id="application-error" role="alert">{error}</span>}<footer><Link href={`/talent/jobs/${job.id}`}>Cancel</Link><button className="platform-primary" type="submit" disabled={submitting}>{submitting ? "Uploading and checking CV…" : "Submit for Oreno screening"}</button></footer></form></ProductPage>;
}

function TalentApplications() {
  const records = productService.listTalentApplications();
  return <ProductPage eyebrow="Opportunity" title="Your applications" description="Track Oreno screening separately from the company hiring process."><DataStateBoundary><div className="talent-application-list">{records.map((record) => <Link href={`/talent/applications/${record.id}`} key={record.id}><span className="record-icon"><BriefcaseBusiness /></span><div><p>{record.releasedAt ? "Forwarded to hiring company" : "Oreno screening"}</p><strong>{record.jobTitle}</strong><small>Applied {record.appliedAt}</small></div><StatusChip status={record.screeningStatus ? record.screeningStatus.replaceAll("_", " ") : record.status} /><ChevronRight /></Link>)}</div></DataStateBoundary></ProductPage>;
}

function TalentApplicationDetail({ id }: { id: string }) {
  const record = productService.getTalentApplication(id);
  const screening = productService.getTalentScreening(id);
  const [confirm, setConfirm] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [informationSent, setInformationSent] = useState(false);
  async function withdraw() { setMutationError(""); try { await productService.withdrawApplication(id, "Withdrawn by talent."); setWithdrawn(true); setConfirm(false); } catch (cause) { setMutationError(cause instanceof Error ? cause.message : "The application could not be withdrawn."); } }
  async function submitInformation(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setMutationError(""); try { await productService.submitScreeningInformation(id, String(form.get("responseText") ?? "")); setInformationSent(true); } catch (cause) { setMutationError(cause instanceof Error ? cause.message : "Your information could not be submitted."); } }
  const screeningLabel = withdrawn ? "Withdrawn" : (screening.status || record.screeningStatus || "PENDING_CV_REVIEW").replaceAll("_", " ");
  const nextStep = screening.status === "ADDITIONAL_INFO_REQUIRED" ? "Oreno needs more information from you. Respond below so human review can continue." : screening.status === "INTERVIEW_SCHEDULED" ? "Review your Oreno screening interview details below." : screening.status === "APPROVED_FOR_SUBMISSION" ? "Oreno approved this application. It remains private until an authorized administrator forwards it to the company." : screening.status === "RELEASED_TO_COMPANY" ? "Your application has been forwarded to the hiring company for its independent review." : ["NOT_SELECTED", "CANCELLED", "WITHDRAWN"].includes(screening.status) ? (screening.candidateMessage || screening.failureReason || "This job-specific screening is closed. Your profile and other applications are unaffected.") : "Oreno is completing job-specific human screening. The hiring company cannot see this application yet.";
  return <ProductPage eyebrow="Application tracking" title={record.jobTitle} description={`Applied ${record.appliedAt}`} actions={!withdrawn && !["Accepted", "Rejected", "Withdrawn"].includes(record.status) ? <button className="product-button-danger" type="button" onClick={() => setConfirm(true)}>Withdraw application</button> : undefined}>{mutationError && <span className="field-error" role="alert">{mutationError}</span>}<div className="product-detail-columns"><section className="detail-card"><StatusChip status={screeningLabel} /><h3>Current next step</h3><p>{nextStep}</p>{screening.releasedAt && <p><strong>Forwarded:</strong> {screening.releasedAt}</p>}</section><section className="detail-card"><h3>Oreno screening timeline</h3><Timeline items={[...screening.timeline.map((item) => ({ label: item.status.replaceAll("_", " "), date: item.at, detail: item.reason, complete: true })), ...(withdrawn ? [{ label: "Withdrawn", date: "Just now", complete: true }] : [])]} /></section></div>{screening.status === "ADDITIONAL_INFO_REQUIRED" && <section className="detail-card"><h3>Information requested</h3>{screening.informationRequests.filter((item) => !item.respondedAt).map((item) => <p key={item.id}>{item.message}</p>)}<form className="product-form-card" onSubmit={submitInformation}><label className="form-field"><span>Your response</span><textarea name="responseText" rows={5} required /></label><button className="platform-primary" type="submit" disabled={informationSent}>{informationSent ? "Information submitted" : "Submit information"}</button></form></section>}{screening.interviews.length > 0 && <section className="detail-card"><h3>Oreno screening interviews</h3>{screening.interviews.map((interview) => <article key={interview.id}><StatusChip status={interview.status.replaceAll("_", " ")} /><p><strong>{new Date(interview.startsAt).toLocaleString()}</strong> · {interview.mode.toLowerCase()} · {interview.timeZone}</p>{interview.meetingUrl && ["SCHEDULED", "RESCHEDULED"].includes(interview.status) && <a href={interview.meetingUrl} target="_blank" rel="noreferrer">Open meeting link <ExternalLink /></a>}{interview.feedback && <p>{interview.feedback}</p>}</article>)}</section>}<ConfirmDialog open={confirm} title="Withdraw this application?" description="Oreno screening will stop and any pending screening interview will be cancelled. The immutable history remains available." confirmLabel="Withdraw application" onCancel={() => setConfirm(false)} onConfirm={withdraw} /></ProductPage>;
}

function TalentInterview({ id }: { id: string }) {
  const record = productService.getTalentInterview(id);
  return <ProductPage eyebrow="Interview" title={record.jobTitle} description={`With Oreno Technologies · ${record.status}`} actions={<a className="platform-primary" href={record.meetingUrl} target="_blank" rel="noreferrer">Join meeting <ExternalLink /></a>}><div className="interview-card"><header><span><CalendarDays /></span><div><h3>{record.startsAt}</h3><p>{record.durationMinutes} minutes</p></div><StatusChip status={record.status} /></header><dl><div><dt>Participants</dt><dd>{record.participants.join(", ")}</dd></div><div><dt>Meeting link</dt><dd><a href={record.meetingUrl}>{record.meetingUrl}</a></dd></div><div><dt>Role</dt><dd>{record.jobTitle}</dd></div></dl><section><h3>Prepare for the conversation</h3><ul className="product-check-list"><li><CheckCircle2 /> Review the role and your submitted profile</li><li><CheckCircle2 /> Test the external meeting link before the interview</li><li><CheckCircle2 /> Prepare examples that show your relevant work</li></ul></section></div></ProductPage>;
}

function TalentOffer({ id }: { id: string }) {
  const offer = productService.getTalentOffer(id);
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [result, setResult] = useState("");
  const [mutationError, setMutationError] = useState("");
  async function submitDecision() { if (!decision) return; setMutationError(""); try { await productService.decideOffer({ offerId: offer.id, decision }); setResult(decision === "accept" ? "Accepted" : "Declined"); setDecision(null); } catch (cause) { setMutationError(cause instanceof Error ? cause.message : "Your offer decision could not be recorded."); } }
  return <ProductPage eyebrow="Offer review" title={offer.jobTitle} description={`Starts ${offer.startDate}`}>{mutationError && <span className="field-error" role="alert">{mutationError}</span>}<div className="offer-review"><main><header><div><h3>Employment offer</h3><p>Prepared for {offer.candidateName}</p></div><StatusChip status={result || offer.status} /></header><dl><div><dt>Compensation</dt><dd>{offer.compensation}</dd></div><div><dt>Start date</dt><dd>{offer.startDate}</dd></div><div><dt>Workplace</dt><dd>{offer.workplace}</dd></div></dl><h3>Terms</h3><ul className="product-check-list">{offer.terms.map((term) => <li key={term}><CheckCircle2 />{term}</li>)}</ul></main><aside><ShieldCheck /><h3>Review before deciding</h3><p>Your decision is recorded against this offer. Ask the hiring team about anything unclear before responding.</p><Link href="/talent/messages"><MessageSquare /> Ask a question</Link>{!result && <><button className="platform-primary" type="button" onClick={() => setDecision("accept")}>Accept offer</button><button className="product-button-danger" type="button" onClick={() => setDecision("reject")}>Decline offer</button></>}</aside></div><ConfirmDialog open={Boolean(decision)} title={`${decision === "accept" ? "Accept" : "Decline"} this offer?`} description={decision === "accept" ? "Acceptance starts the controlled placement process with the company." : "The company will see that you declined. The offer remains in history."} confirmLabel={decision === "accept" ? "Accept offer" : "Decline offer"} tone={decision === "accept" ? "positive" : "danger"} onCancel={() => setDecision(null)} onConfirm={submitDecision} /></ProductPage>;
}

function TalentTeam() {
  const teammates = [{ name: "Richard Benson", role: "Product manager", relation: "Your manager", avatar: "/assets/figma/app/manager-profile.jpg" }, { name: "Chibuokem Chiorlu", role: "Product designer", relation: "Teammate", avatar: "/assets/figma/app/company-profile.png" }, { name: "Benny Asitonka-Joe", role: "Data analyst", relation: "Teammate", avatar: "/assets/figma/app/manager-profile.jpg" }];
  return <ProductPage eyebrow="Placement" title="Product design team" description="Understand your current reporting relationship and active teammates."><div className="talent-team-hero"><div><UsersRound /><span><strong>Product design</strong>Design department · 6 members</span></div><div><small>Your manager</small><strong>Richard Benson</strong><Link href="/talent/messages">Send message</Link></div></div><div className="talent-team-grid">{teammates.map((person) => <article key={person.name}><Image src={person.avatar} alt="" width={85} height={85} /><h3>{person.name}</h3><p>{person.role}</p><StatusChip status={person.relation} /><Link href="/talent/messages"><MessageSquare /> Message</Link></article>)}</div></ProductPage>;
}

function TalentTasks() {
  const tasks = productService.listTalentTasks();
  return <ProductPage eyebrow="Assigned work" title="Tasks" description="Your assigned tasks and their current delivery state."><DataStateBoundary><div className="product-table task-table"><div><b>Task</b><b>Priority</b><b>Due</b><b>Status</b></div>{tasks.map((task) => <Link href={"/talent/tasks/" + task.id} key={task.id}><strong>{task.title}</strong><span>{task.priority}</span><span>{task.dueDate || "No due date"}</span><StatusChip status={task.status} /></Link>)}</div>{tasks.length === 0 && <section className="empty-product-state"><CheckCircle2 /><h3>No assigned tasks</h3><p>Tasks assigned by your company will appear here.</p></section>}</DataStateBoundary></ProductPage>;
}

function TalentTaskDetail({ id }: { id: string }) {
  const task = productService.getTaskDetail(id);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function transition(value: string) { const status = ({ "To do": "TO_DO", "In progress": "IN_PROGRESS", "In review": "IN_REVIEW", Completed: "COMPLETED" } as const)[value as "To do" | "In progress" | "In review" | "Completed"]; if (!status) return; setPending(true); setError(""); try { await productService.transitionTalentTask(id, status); } catch (cause) { setError(cause instanceof Error ? cause.message : "The task status could not be updated."); } finally { setPending(false); } }
  async function addComment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!comment.trim()) return; setPending(true); setError(""); try { await productService.addTalentTaskComment(id, comment.trim()); setComment(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "The comment could not be added."); } finally { setPending(false); } }
  return <ProductPage eyebrow="Assigned work" title={task.title} description={task.priority + " priority · Due " + task.dueDate} actions={<select aria-label="Task status" disabled={pending} value={task.status || "To do"} onChange={(event) => void transition(event.target.value)}><option>To do</option><option>In progress</option><option>In review</option><option>Completed</option></select>}><div className="task-detail-layout"><main><section><StatusChip status={task.status} /><h3>Description</h3><p>{task.description || "No description was provided."}</p><dl className="detail-list"><div><dt>Start</dt><dd>{task.startDate}</dd></div><div><dt>Due</dt><dd>{task.dueDate}</dd></div><div><dt>Assignees</dt><dd>{task.assignees.join(", ") || "Unassigned"}</dd></div></dl></section><section><h3>Time entry</h3><Link className="product-button-secondary" href="/talent/time"><Clock3 /> Record time for this task</Link></section></main><aside><h3>Comments</h3>{task.comments.map((item) => <article className="talent-task-comment" key={item.id}><strong>{item.author}</strong><small>{item.createdAt}</small><p>{item.body}</p></article>)}<form onSubmit={addComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Add a comment" /><button disabled={pending || !comment.trim()} type="submit"><Send /> Comment</button></form>{error && <p className="field-error" role="alert">{error}</p>}</aside></div></ProductPage>;
}

function TalentTaskCalendar() {
  const tasks = productService.listTalentTasks();
  return <ProductPage eyebrow="Assigned work" title="Task calendar" description="Due dates reflect the same persistent task records used by the task list."><div className="agenda-list">{tasks.filter((task) => task.dueDate).map((task) => <section key={task.id}><time>{task.dueDate}</time><Link href={"/talent/tasks/" + task.id}><span><CheckCircle2 /></span><div><strong>{task.title}</strong><p>{task.priority} priority</p></div><StatusChip status={task.status} /></Link></section>)}</div>{!tasks.some((task) => task.dueDate) && <section className="empty-product-state"><CalendarDays /><h3>No scheduled tasks</h3><p>Assigned tasks with due dates will appear here.</p></section>}</ProductPage>;
}

function TalentTimeEntries() {
  const [submitted, setSubmitted] = useState(false);
  return <ProductPage eyebrow="Work records" title="Time entries" description="Submitted hours require company approval before they can feed compensation."><div className="product-detail-columns"><section><h3>This week</h3><div className="time-summary"><div><span>Regular</span><strong>32 hrs</strong></div><div><span>Overtime</span><strong>2 hrs</strong></div><StatusChip status={submitted ? "Submitted" : "Draft"} /></div><div className="record-list compact-records">{["Design homepage", "Dashboard UI", "Team review"].map((name, index) => <div key={name}><span className="record-icon"><Clock3 /></span><div><strong>{name}</strong><p>{[16, 12, 6][index]} hours</p></div><button type="button" disabled title="Editing is not available in this release.">Edit</button></div>)}</div></section><form className="detail-card" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><h3>Add time</h3><label className="form-field"><span>Task</span><select><option>Design homepage</option><option>Dashboard UI</option></select></label><div className="form-grid"><TalentField label="Date" value="2026-09-25" type="date" /><TalentField label="Hours" value="8" type="number" /></div><label className="form-field"><span>Work note</span><textarea rows={5} /></label><button className="platform-primary" type="submit">{submitted ? "Timesheet submitted" : "Submit week for approval"}</button></form></div></ProductPage>;
}

function TalentPerformance() { return <ProductPage eyebrow="Performance" title="Performance information is not available yet" description="Oreno will not show a percentage until the company defines a traceable measurement policy and visibility rules."><div className="policy-unavailable"><ShieldCheck /><h3>Evidence and policy come first</h3><p>When a policy is approved, this page may include review periods, defined metrics, supporting evidence, manager feedback and a correction or dispute path.</p><ul className="product-check-list"><li><CheckCircle2 /> Metric definitions and calculation version</li><li><CheckCircle2 /> Evidence sources you can understand</li><li><CheckCircle2 /> Visibility and correction rules</li></ul></div></ProductPage>; }

function TalentCompensation({ route }: { route: string }) {
  const payments = productService.listPaymentRecords().filter((record) => record.person === "John Doe C.");
  if (route === "compensation/payments") return <ProductPage eyebrow="Compensation" title="Payment records" description="These describe payments recorded outside Oreno."><div className="product-table payment-table"><div><b>Payroll period</b><b>Amount</b><b>Method</b><b>Reference</b><b>Status</b></div>{payments.map((record) => <div key={record.id}><span>{record.payrollPeriod}</span><strong>{record.currency} {record.amount}</strong><span>{record.methodDescription}</span><span>{record.externalReference}</span><StatusChip status={record.status} /></div>)}</div></ProductPage>;
  return <ProductPage eyebrow="Compensation" title="Compensation summary" description="View your effective pay agreement and approved period records."><div className="compensation-summary"><section><span><WalletCards /></span><p>Current agreement</p><strong>$35.00/hour</strong><small>USD · Effective Feb 12, 2026</small></section><section><span><Clock3 /></span><p>September approved hours</p><strong>160 hrs</strong><small>2 overtime hours</small></section><section><span><CircleDollarSign /></span><p>September gross record</p><strong>$5,705.00</strong><small>External payment recorded</small></section></div><Link className="product-button-secondary" href="/talent/compensation/payments">View payment records <ArrowRight /></Link></ProductPage>;
}

function TalentNotifications() { const records = productService.listNotifications().slice(0, 3); return <ProductPage eyebrow="Inbox" title="Notifications" description="Application, interview, task and message updates appear here."><DataStateBoundary><div className="notification-list">{records.map((record) => <Link className={!record.read ? "is-unread" : ""} href={record.href.replace("/company", "/talent")} key={record.id}><span><Bell /></span><div><strong>{record.title}</strong><p>{record.body}</p><small>{record.createdAt}</small></div>{!record.read && <i>New</i>}</Link>)}</div></DataStateBoundary></ProductPage>; }
