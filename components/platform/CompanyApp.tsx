"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Eye,
  EyeOff,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { PlatformShell } from "./PlatformShell";
import { MessagesView } from "./MessagingWorkspace";
import { CompanyOnboardingComplete, CompanyProductScreen, companyProductTitles } from "@/components/product/CompanyProductScreens";
import { useApiRevision } from "@/lib/api/live-store";
import { productService } from "@/lib/platform/product-service";
import { Logo } from "@/components/Logo";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";

const companyTitles: Record<string, string> = {
  "": "Dashboard",
  talents: "Talents",
  "team-members": "Team members",
  "team-members/john-doe": "Team member",
  "team-members/john-doe/tasks": "Team member",
  "team-members/john-doe/performance": "Team member",
  "talents/john-doe": "Talent profile",
  "talents/john-doe/tasks": "Talent profile",
  "talents/john-doe/performance": "Talent profile",
  departments: "Department",
  roles: "Roles",
  "roles/new": "Create Job",
  managers: "Managers",
  "managers/new": "Manager profile",
  "managers/richard-benson": "Manager profile",
  "managers/richard-benson/team": "Manager profile",
  salaries: "Salaries",
  "salaries/payroll": "Payroll",
  messages: "Message",
  hiring: "Talent hire",
  performance: "Performance",
  settings: "Settings",
};

export function CompanyApp({ segments }: { segments: string[] }) {
  useApiRevision();
  const route = segments.join("/");
  if (route === "login" || route === "signup") return <AuthScreen mode={route} />;
  if (route === "onboarding/complete") return <CompanyOnboardingComplete />;
  if (segments[0] === "onboarding") return <OnboardingScreen step={segments[1] ?? "personal"} />;

  const actionLabel = route === "talents/john-doe/tasks" || route === "team-members/john-doe/tasks" ? "Add task" : "Hire a talent";
  const inferredTitle = companyProductTitles[route] ?? (route.startsWith("jobs/") ? "Job detail" : route.startsWith("applications/") ? "Application detail" : route.startsWith("interviews/") ? "Interview detail" : route.startsWith("offers/") ? "Offer detail" : route.startsWith("placements/") ? "Placement" : route.startsWith("replacements/") ? "Replacement request" : route.startsWith("tasks/") ? "Task" : route.startsWith("compensation/") ? "Compensation" : undefined);
  return (
    <PlatformShell kind="company" title={companyTitles[route] ?? inferredTitle ?? "Dashboard"} actionLabel={actionLabel}>
      <CompanyRoute route={route} />
    </PlatformShell>
  );
}

function CompanyRoute({ route }: { route: string }) {
  if (!route) return <DashboardView />;
  if (route === "messages") return <MessagesView />;
  const aliases: Record<string, string> = {
    talents: "discover",
    "team-members": "team",
    departments: "departments",
    roles: "jobs",
    "roles/new": "jobs/new",
    managers: "access",
    salaries: "compensation",
    "salaries/payroll": "compensation/payments",
    hiring: "applications",
    settings: "organisation",
  };
  return <CompanyProductScreen route={aliases[route] ?? route} />;
}

function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      if (isLogin) {
        await authApi.login({
          email,
          password,
          twoFactorCode: String(form.get("twoFactorCode") ?? "").trim() || undefined,
          deviceLabel: "Oreno web",
        });
        const { context } = await authApi.current();
        if (!context.organisationId || context.organisationRole === "TALENT") {
          throw new Error("This account does not have access to a company workspace.");
        }
        const requested = new URLSearchParams(window.location.search).get("next");
        const next = requested?.startsWith("/company") && !requested.startsWith("//") ? requested : "/company";
        setNotice("Signed in. Opening your workspace…");
        router.replace(next);
      } else {
        await authApi.registerCompany({
          email,
          password,
          firstName: String(form.get("firstName") ?? "").trim(),
          lastName: String(form.get("lastName") ?? "").trim(),
          organisationName: String(form.get("organisationName") ?? "").trim(),
          acceptTerms: true,
        });
        router.push("/auth/verify-email?created=true");
      }
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === "TWO_FACTOR_REQUIRED") {
        setRequiresTwoFactor(true);
        setError("Enter the code from your authenticator app to continue.");
      } else {
        setError(cause instanceof Error ? cause.message : "The account request could not be completed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function startProvider(provider: "google" | "linkedin") {
    setError("");
    try {
      await authApi.oauthStart(provider, { mode: "login", next: "/company" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Provider sign-in could not be started.");
    }
  }
  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <Link className="auth-brand" href="/" aria-label="Oreno home"><Logo dark /></Link>
        <div className="auth-form-wrap">
          <h1>{isLogin ? "Welcome back!" : "Sign Up"}</h1>
          <p>{isLogin ? "Log in to continue building great teams" : "Get ready to supercharge your hiring process"}</p>
          {isLogin && <><div className="auth-socials"><button type="button" onClick={() => startProvider("google")}><b>G</b> Log in with Google</button><button type="button" onClick={() => startProvider("linkedin")}><b>in</b> Log in with LinkedIn</button></div><div className="auth-divider"><span>or continue with email</span></div></>}
          <form onSubmit={submit}>
            {!isLogin && <><label>First name<input name="firstName" required autoComplete="given-name" /></label><label>Last name<input name="lastName" required autoComplete="family-name" /></label><label>Company name<input name="organisationName" required minLength={2} autoComplete="organization" /></label></>}
            <label>Email address<input name="email" type="email" required autoComplete="email" placeholder="name@company.com" /></label>
            <label>Password<span className="password-input"><input name="password" type={showPassword ? "text" : "password"} required minLength={12} autoComplete={isLogin ? "current-password" : "new-password"} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
            {requiresTwoFactor && <label>Authenticator code<input name="twoFactorCode" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={32} required /></label>}
            {isLogin && <div className="auth-options"><label><input type="checkbox" /> Remember me</label><Link href="/auth/forgot-password">Forgot password?</Link></div>}
            {!isLogin && <label className="auth-options"><input name="acceptTerms" type="checkbox" required /> I agree to Oreno’s Terms and Privacy policy.</label>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Please wait…" : isLogin ? "Log in" : "Sign up"}<ArrowRight /></button>
          </form>
          {notice && <p className="form-notice" role="status">{notice}</p>}
          {error && <p className="field-error" role="alert">{error}</p>}
          <p className="auth-switch">{isLogin ? "Don't have an account?" : "Already have an account?"} <Link href={isLogin ? "/company/signup" : "/company/login"}>{isLogin ? "Sign up" : "Log in"}</Link></p>
          {!isLogin && <small>By signing up, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy policy</a>.</small>}
        </div>
      </section>
      <section className="auth-art" aria-hidden="true"><span className="auth-art__orb" /><span className="auth-art__flower">✣</span><div><strong>{isLogin ? "Welcome back" : "People make the difference"}</strong><p>Build high-performing teams with exceptional African talent.</p></div></section>
    </main>
  );
}

const onboardingSteps = [
  { key: "personal", label: "Personal details", number: 1 },
  { key: "company", label: "Company details", number: 2 },
  { key: "managers", label: "Managers", number: 3 },
  { key: "accounts", label: "Accounts", number: 4 },
];

function OnboardingScreen({ step }: { step: string }) {
  const current = onboardingSteps.find((item) => item.key === step) ?? onboardingSteps[0];
  return (
    <main className="onboarding-screen">
      <aside className="onboarding-sidebar">
        <Link className="auth-brand auth-brand--light" href="/" aria-label="Oreno home"><Logo /></Link>
        <div className="onboarding-steps">{onboardingSteps.map((item) => <Link key={item.key} className={`${item.key === current.key ? "is-active" : ""} ${item.number < current.number ? "is-done" : ""}`} href={`/company/onboarding/${item.key}`}><i>{item.number < current.number ? <Check /> : item.number}</i><span>{item.label}<small>Step {item.number} of 4</small></span></Link>)}</div>
      </aside>
      <section className="onboarding-main">
        <Link className="onboarding-close" href="/"><X /><span className="sr-only">Close setup</span></Link>
        <div className="onboarding-heading"><span>Step {current.number} of 4</span><h1>Setup your account</h1><p>{current.label}</p></div>
        <OnboardingForm step={current.key} />
      </section>
    </main>
  );
}

function OnboardingForm({ step }: { step: string }) {
  const router = useRouter();
  const onboarding = productService.getCompanyOnboarding();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const next = step === "personal" ? "company" : step === "company" ? "managers" : step === "managers" ? "accounts" : "done";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onboarding.updatedAt) {
      setError("Your saved onboarding progress is still loading. Please try again in a moment.");
      return;
    }
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (step === "personal") {
        await productService.updateCompanyOnboarding({
          step: "PERSONAL",
          expectedUpdatedAt: onboarding.updatedAt,
          firstName: String(form.get("firstName") ?? "").trim(),
          lastName: String(form.get("lastName") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim() || null,
          timeZone: String(form.get("timeZone") ?? "Africa/Lagos"),
          countryCode: String(form.get("countryCode") ?? "").trim().toUpperCase() || null,
          jobTitle: String(form.get("jobTitle") ?? "").trim() || null,
        });
      } else if (step === "company") {
        await productService.updateCompanyOnboarding({
          step: "COMPANY",
          expectedUpdatedAt: onboarding.updatedAt,
          name: String(form.get("name") ?? "").trim(),
          primaryContactEmail: String(form.get("primaryContactEmail") ?? "").trim(),
          companySize: String(form.get("companySize") ?? "").trim() || null,
          industry: String(form.get("industry") ?? "").trim() || null,
          websiteUrl: String(form.get("websiteUrl") ?? "").trim() || null,
          timeZone: String(form.get("timeZone") ?? "Africa/Lagos"),
          countryCode: String(form.get("countryCode") ?? "").trim().toUpperCase() || null,
        });
      } else if (step === "managers") {
        const email = String(form.get("email") ?? "").trim();
        if (email) {
          await productService.inviteCompanyMember({
            email,
            firstName: String(form.get("firstName") ?? "").trim(),
            lastName: String(form.get("lastName") ?? "").trim(),
            role: String(form.get("role")) === "HR_USER" ? "HR_USER" : "MANAGER",
            message: String(form.get("message") ?? "").trim() || undefined,
          });
        }
        await productService.updateCompanyOnboarding({ step: "MANAGERS", expectedUpdatedAt: onboarding.updatedAt, skipped: !email });
      } else {
        await productService.updateCompanyOnboarding({ step: "ACCOUNTS", expectedUpdatedAt: onboarding.updatedAt, acknowledged: true });
        await productService.completeCompanyOnboarding();
      }
      router.push(next === "done" ? "/company/onboarding/complete" : `/company/onboarding/${next}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This onboarding step could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="onboarding-form" key={`${step}:${onboarding.updatedAt}`} onSubmit={save}>
      {step === "personal" && <><div className="form-grid"><Field name="firstName" label="First name" defaultValue={onboarding.firstName} required /><Field name="lastName" label="Last name" defaultValue={onboarding.lastName} required /><Field name="phone" label="Phone number" /><Field name="jobTitle" label="Role or job title" /><Field name="timeZone" label="Time zone" defaultValue={onboarding.timeZone} required /><Field name="countryCode" label="Country code" defaultValue={onboarding.countryCode} required /></div><PhotoUpload /></>}
      {step === "company" && <><div className="form-grid"><Field name="name" label="Company name" defaultValue={onboarding.name} required /><Field name="primaryContactEmail" label="Company email" type="email" defaultValue={onboarding.primaryContactEmail} required /><Field name="companySize" label="Company size" defaultValue={onboarding.companySize} /><Field name="industry" label="Industry" defaultValue={onboarding.industry} /><Field name="websiteUrl" label="Website" type="url" defaultValue={onboarding.websiteUrl} /><Field name="timeZone" label="Time zone" defaultValue={onboarding.timeZone} required /><Field name="countryCode" label="Country code" defaultValue={onboarding.countryCode} required /></div><div className="onboarding-note"><strong>Company workspace</strong><p>This information is saved to your organisation and can be updated later by authorised members.</p></div></>}
      {step === "managers" && <><p>Invite an initial manager now, or continue without one and invite members later.</p><div className="form-grid"><Field name="firstName" label="Manager's first name" /><Field name="lastName" label="Manager's last name" /><Field name="email" label="Work email" type="email" /><label className="form-field"><span>Workspace role</span><select name="role" defaultValue="MANAGER"><option value="MANAGER">Manager</option><option value="HR_USER">HR user</option></select></label></div><label className="form-field form-field--wide"><span>Invitation message</span><textarea name="message" rows={4} /></label></>}
      {step === "accounts" && <div className="onboarding-note"><CircleDollarSign /><div><strong>Compensation records only</strong><p>Oreno records pay agreements and external payment outcomes. It does not collect banking credentials or move money during workspace setup.</p></div></div>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <footer className="onboarding-form__footer"><button className="onboarding-next" type="submit" disabled={saving || !onboarding.updatedAt}>{saving ? "Saving…" : next === "done" ? "Complete setup" : "Save and continue"} <ArrowRight /></button></footer>
    </form>
  );
}

function Field({ label, name, defaultValue = "", type = "text", placeholder, required = false }: { label: string; name?: string; defaultValue?: string; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="form-field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} /></label>;
}

function PhotoUpload() {
  return <div className="photo-upload"><Image src="/assets/figma/app/company-profile.png" alt="Profile preview" width={190} height={190} /><button type="button" disabled title="Profile image upload is not available during initial setup."><Upload /> Change profile image</button></div>;
}

function DashboardView() {
  const team = productService.listCompanyTeamMembers();
  const jobs = productService.listCompanyJobs();
  const applications = productService.listApplications();
  const notifications = productService.listNotifications();
  const openJobs = jobs.filter((job) => job.status === "Published").length;
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <section className="dashboard-view">
      <div className="stat-grid">
        <DashboardMetric icon={<UsersRound />} label="Team members" value={team.length} href="/company/team" />
        <DashboardMetric icon={<BriefcaseBusiness />} label="Open jobs" value={openJobs} href="/company/jobs" />
        <DashboardMetric icon={<UsersRound />} label="Applications" value={applications.length} href="/company/applications" />
        <DashboardMetric icon={<Bell />} label="Unread notifications" value={unread} href="/company/notifications" />
      </div>
      <div className="product-grid product-grid--two">
        <article className="product-card">
          <p className="product-eyebrow">Hiring</p>
          <h2>Current jobs</h2>
          {jobs.slice(0, 5).map((job) => <Link className="dashboard-live-row" href={`/company/jobs/${job.id}`} key={job.id}><span><strong>{job.title}</strong><small>{job.department || "No department"} · {job.status}</small></span><ArrowRight /></Link>)}
          {jobs.length === 0 && <p>No jobs have been created yet.</p>}
          <Link className="platform-secondary" href="/company/jobs">Manage jobs</Link>
        </article>
        <article className="product-card">
          <p className="product-eyebrow">Workspace</p>
          <h2>Recent applications</h2>
          {applications.slice(0, 5).map((application) => <Link className="dashboard-live-row" href={`/company/applications/${application.id}`} key={application.id}><span><strong>{application.candidateName}</strong><small>{application.jobTitle} · {application.status}</small></span><ArrowRight /></Link>)}
          {applications.length === 0 && <p>No released applications are waiting for review.</p>}
          <Link className="platform-secondary" href="/company/applications">Review applications</Link>
        </article>
      </div>
    </section>
  );
}

function DashboardMetric({ icon, label, value, href }: { icon: ReactNode; label: string; value: number; href: string }) {
  return <Link className="stat-card" href={href}><span>{icon}</span><div><p>{label}</p><strong>{value}</strong><small>View live records</small></div></Link>;
}
