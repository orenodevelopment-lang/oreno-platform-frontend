"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, Clock3, Mail, MapPin, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { productService } from "@/lib/platform/product-service";
import { DataStateBoundary, FieldError, StatusChip } from "./ProductUI";
import { PublicShell } from "./PublicShell";

export function PublicTalentCatalogue({ profileId }: { profileId?: string }) {
  const talents = productService.listPublicTalents();
  if (profileId) return <PublicTalentDetail id={profileId} />;
  return <PublicShell><CatalogueHero kind="talent" /><TalentCatalogueGrid talents={talents} /></PublicShell>;
}

function TalentCatalogueGrid({ talents }: { talents: ReturnType<typeof productService.listPublicTalents> }) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("All disciplines");
  const filtered = useMemo(() => talents.filter((talent) => `${talent.name} ${talent.discipline} ${talent.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (discipline === "All disciplines" || talent.discipline === discipline)), [talents, query, discipline]);
  return <section className="public-catalogue"><div className="public-filterbar"><label><Search /><input aria-label="Search talent" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by skill or discipline" /></label><select value={discipline} onChange={(event) => setDiscipline(event.target.value)} aria-label="Discipline"><option>All disciplines</option>{[...new Set(talents.map((talent) => talent.discipline))].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Availability"><option>Any availability</option><option>Available now</option><option>Within 2 weeks</option></select></div><DataStateBoundary noResults={filtered.length === 0}><div className="public-talent-grid">{filtered.map((talent) => <article className="public-talent-card" key={talent.id}><Image src={talent.avatar} alt="" width={380} height={260} /><div className="public-talent-card__body"><div>{talent.vetted && <span><BadgeCheck /> Oreno vetted</span>}<small>{talent.seniority}</small></div><h2>{talent.name}</h2><p>{talent.discipline}</p><ul>{talent.skills.slice(0, 3).map((skill) => <li key={skill}>{skill}</li>)}</ul><dl><div><dt>Location</dt><dd>{talent.location}</dd></div><div><dt>Rate</dt><dd>{talent.rate}</dd></div></dl><Link href={`/talent-catalogue/${talent.id}`}>View profile <ArrowRight /></Link></div></article>)}</div></DataStateBoundary></section>;
}

function PublicTalentDetail({ id }: { id: string }) {
  const talent = productService.getPublicTalent(id);
  return <PublicShell><article className="public-detail"><Link className="public-back" href="/talent-catalogue"><ArrowLeft /> Back to talent</Link><header className="public-profile-hero"><Image src={talent.avatar} alt="" width={280} height={280} /><div><span className="public-vetted"><BadgeCheck /> Oreno vetted</span><h1>{talent.name}</h1><p>{talent.discipline} · {talent.seniority}</p><ul>{talent.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><div><span><MapPin />{talent.location}</span><span><Clock3 />{talent.availability}</span><strong>{talent.rate}</strong></div><Link href="/request-demo">Start a conversation <ArrowRight /></Link></div></header><div className="public-detail-grid"><section><h2>About</h2><p>{talent.bio}</p><h2>Selected highlights</h2><ul className="public-check-list">{talent.highlights.map((highlight) => <li key={highlight}><CheckCircle2 />{highlight}</li>)}</ul></section><aside><div><strong>{talent.experienceYears} years</strong><span>Professional experience</span></div><h2>Portfolio</h2>{talent.portfolio.map((item) => <article key={item.title}><BriefcaseBusiness /><div><strong>{item.title}</strong><span>{item.category}</span></div></article>)}</aside></div></article></PublicShell>;
}

export function PublicJobs({ jobId }: { jobId?: string }) {
  const jobs = productService.listPublicJobs();
  if (jobId) return <PublicJobDetail id={jobId} />;
  return <PublicShell><CatalogueHero kind="jobs" /><JobsCatalogue jobs={jobs} /></PublicShell>;
}

function JobsCatalogue({ jobs }: { jobs: ReturnType<typeof productService.listPublicJobs> }) {
  const [query, setQuery] = useState("");
  const filtered = jobs.filter((job) => `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="public-catalogue"><div className="public-filterbar"><label><Search /><input aria-label="Search jobs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, skills or companies" /></label><select aria-label="Employment type"><option>All job types</option><option>Full time</option><option>Contract</option></select><select aria-label="Workplace"><option>Any workplace</option><option>Remote</option><option>Hybrid</option></select></div><DataStateBoundary noResults={filtered.length === 0}><div className="public-job-list">{filtered.map((job) => <article key={job.id}><span className="public-company-mark"><BriefcaseBusiness /></span><div><p>{job.company}</p><h2>{job.title}</h2><div><span><MapPin />{job.location}</span><span>{job.employmentType} · {job.workplace}</span><strong>{job.compensation}</strong></div><ul>{job.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div><div><StatusChip status={job.status} /><small>{job.postedAt}</small><Link href={`/jobs/${job.id}`}>View job <ArrowRight /></Link></div></article>)}</div></DataStateBoundary></section>;
}

function PublicJobDetail({ id }: { id: string }) {
  const job = productService.getPublicJob(id);
  return <PublicShell><article className="public-detail public-job-detail"><Link className="public-back" href="/jobs"><ArrowLeft /> Back to jobs</Link><header><span className="public-company-mark"><BriefcaseBusiness /></span><div><p>{job.company}</p><h1>{job.title}</h1><div><span><MapPin />{job.location}</span><span>{job.employmentType}</span><span>{job.workplace}</span></div></div><aside><strong>{job.compensation}</strong><small>Apply by {job.deadline}</small><Link href={`/talent/jobs/${job.id}/apply`}>Apply for this role <ArrowRight /></Link></aside></header><div className="public-detail-grid"><section><h2>About the role</h2><p>{job.description}</p><h2>What you’ll do</h2><ul className="public-check-list">{job.responsibilities.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul><h2>What you’ll bring</h2><ul className="public-check-list">{job.requirements.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></section><aside><h2>Skills</h2><ul className="public-skill-list">{job.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><div className="public-human-note"><ShieldCheck /><p><strong>Human decisions stay central</strong>Oreno may explain relevant skills, but the employer makes the hiring decision.</p></div></aside></div></article></PublicShell>;
}

function CatalogueHero({ kind }: { kind: "talent" | "jobs" }) {
  return <section className="catalogue-hero"><span><Sparkles /> Curated by Oreno</span><h1>{kind === "talent" ? "Find exceptional African talent" : "Find work that values your craft"}</h1><p>{kind === "talent" ? "Explore carefully reviewed people across engineering, product, data and growth." : "Discover open roles from teams looking for experienced African professionals."}</p></section>;
}

export function PublicLeadForm({ kind }: { kind: "demo" | "contact" }) {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};
    for (const key of ["name", "email"]) if (!String(form.get(key) ?? "").trim()) nextErrors[key] = "This field is required.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    if (kind === "demo") productService.submitDemoRequest({ name: String(form.get("name")), workEmail: String(form.get("email")), company: String(form.get("company")), teamSize: String(form.get("teamSize")), message: String(form.get("message")) });
    else productService.submitContactRequest({ name: String(form.get("name")), email: String(form.get("email")), topic: String(form.get("topic")), message: String(form.get("message")) });
    setSubmitted(true);
  }
  return <PublicShell><section className="public-form-page"><div><span className="product-eyebrow">{kind === "demo" ? "Company teams" : "Contact Oreno"}</span><h1>{kind === "demo" ? "See how Oreno can support your next hire" : "Tell us how we can help"}</h1><p>{kind === "demo" ? "Share a little about your team. This demo form records no production data." : "Choose a topic and leave a message. We’ll confirm that the request was received."}</p><ul className="public-check-list"><li><CheckCircle2 /> Curated talent and explainable matching</li><li><CheckCircle2 /> Hiring workflow and onboarding support</li><li><CheckCircle2 /> Tasks, teams and compensation visibility</li></ul></div>{submitted ? <div className="public-success" role="status"><CheckCircle2 /><h2>Request received</h2><p>Thanks. Your submission is confirmed in this local product demo.</p><Link href="/">Return to the homepage</Link></div> : <form onSubmit={submit} noValidate><label>Full name<input name="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "lead-name-error" : undefined} />{errors.name && <FieldError id="lead-name-error">{errors.name}</FieldError>}</label><label>{kind === "demo" ? "Work email" : "Email address"}<input name="email" type="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "lead-email-error" : undefined} />{errors.email && <FieldError id="lead-email-error">{errors.email}</FieldError>}</label>{kind === "demo" ? <><label>Company<input name="company" required /></label><label>Team size<select name="teamSize"><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label></> : <label>Topic<select name="topic"><option>Hiring</option><option>Talent support</option><option>Partnership</option><option>Other</option></select></label>}<label>Message<textarea name="message" rows={6} /></label><button type="submit">Send request <ArrowRight /></button></form>}</section></PublicShell>;
}

export function NewsletterState({ mode }: { mode: "confirmed" | "unsubscribe" }) {
  const [complete, setComplete] = useState(mode === "confirmed");
  return <PublicShell><section className="focused-state"><span className="focused-state__icon"><Mail /></span><h1>{mode === "confirmed" || complete ? (mode === "confirmed" ? "Your subscription is confirmed" : "You are unsubscribed") : "Unsubscribe from Oreno updates?"}</h1><p>{mode === "confirmed" ? "We’ll send occasional product and hiring updates to your confirmed address." : complete ? "No further newsletter messages will be sent to this address." : "Account and security messages are not affected."}</p>{mode === "unsubscribe" && !complete && <button className="is-danger" type="button" onClick={() => setComplete(true)}>Confirm unsubscribe</button>}<Link href="/">Return to Oreno</Link></section></PublicShell>;
}

export function AuthJourney({ flow }: { flow: string }) {
  const [submitted, setSubmitted] = useState(false);
  const copy: Record<string, { title: string; body: string; button: string }> = {
    "talent-signup": { title: "Create your talent profile", body: "Join Oreno to discover roles and present your experience.", button: "Create account" },
    "talent-login": { title: "Welcome back", body: "Log in to manage applications, interviews and work.", button: "Log in" },
    "verify-email": { title: "Verify your email", body: "Enter the verification code sent to your email address.", button: "Verify email" },
    "forgot-password": { title: "Recover your account", body: "We’ll send a secure password reset link if the address is recognised.", button: "Send reset link" },
    "reset-password": { title: "Choose a new password", body: "Use at least eight characters and avoid a previously used password.", button: "Reset password" },
    "accept-invitation": { title: "Join Oreno Technologies", body: "Richard Benson invited you to join as a Manager.", button: "Accept invitation" },
  };
  const current = copy[flow] ?? copy["talent-login"];
  const successHref = flow === "talent-signup" ? "/auth/verify-email" : flow === "verify-email" ? "/talent/onboarding/basics" : flow === "talent-login" ? "/talent" : flow === "accept-invitation" ? "/company" : "/auth/talent-login";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (flow === "talent-signup") productService.createTalentAccount({ firstName: String(form.get("firstName")), lastName: String(form.get("lastName")), email: String(form.get("email")), password: String(form.get("password")) });
    if (flow === "verify-email") productService.verifyTalentEmail(String(form.get("code")));
    setSubmitted(true);
  }

  return <PublicShell><section className="auth-journey"><span><Image src="/assets/figma/oreno-mark.svg" alt="" width={55} height={55} /></span>{submitted ? <div className="public-success"><CheckCircle2 /><h1>{flow === "accept-invitation" ? "Invitation accepted" : flow === "verify-email" ? "Email verified" : "Check your email"}</h1><p>{flow === "talent-signup" ? "Your account was created. Verify your email before building your professional profile." : "Your request was completed in this local product demo."}</p><Link href={successHref}>Continue <ArrowRight /></Link></div> : <><h1>{current.title}</h1><p>{current.body}</p><form onSubmit={submit}>{flow === "accept-invitation" && <div className="invitation-summary"><UsersRound /><div><strong>Oreno Technologies</strong><span>Manager · Company workspace</span></div></div>}{flow === "talent-signup" || flow === "accept-invitation" ? <div className="form-grid"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div> : null}{flow === "verify-email" ? <label>Verification code<input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" /></label> : <label>Email address<input name="email" type="email" required placeholder="name@example.com" /></label>}{["talent-login", "talent-signup", "reset-password", "accept-invitation"].includes(flow) && <label>{flow === "reset-password" ? "New password" : "Password"}<input name="password" type="password" required minLength={8} /></label>}<button type="submit">{current.button} <ArrowRight /></button></form>{flow === "talent-login" && <p><Link href="/auth/forgot-password">Forgot password?</Link></p>}</>}</section></PublicShell>;
}

export function SystemState({ type }: { type: "not-found" | "unauthorised" | "error" }) {
  const copy = { "not-found": ["404", "That page could not be found", "The link may be old or the page may have moved."], unauthorised: ["403", "You do not have access", "Your current organisation role cannot view this page."], error: ["500", "Something went wrong", "The page failed safely. You can retry or return to a known screen."] }[type];
  return <PublicShell><section className="system-state"><strong>{copy[0]}</strong><h1>{copy[1]}</h1><p>{copy[2]}</p><div><Link href="/">Go home</Link>{type === "error" && <button type="button" onClick={() => window.location.reload()}>Try again</button>}</div></section></PublicShell>;
}

