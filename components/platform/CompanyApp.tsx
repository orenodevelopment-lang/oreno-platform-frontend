"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Plus,
  Save,
  TrendingUp,
  Upload,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { candidates, managers, people } from "@/lib/platform/mock-service";
import { PlatformShell } from "./PlatformShell";
import { EmptyDesignedState, FilterButton, SearchField, SectionToolbar } from "./Primitives";
import { ManagerGrid, MessagesView, TaskBoard } from "./SharedViews";
import { CompanyOnboardingComplete, CompanyProductScreen, PerformanceFoundation, companyProductTitles } from "@/components/product/CompanyProductScreens";
import { CountUp } from "@/components/motion/CountUp";
import { motionDurations, motionEasings } from "@/lib/motion/tokens";
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
  switch (route) {
    case "": return <DashboardView />;
    case "talents": return <TalentsTable />;
    case "team-members": return <TalentsTable />;
    case "talents/john-doe": return <TalentProfile tab="profile" />;
    case "team-members/john-doe": return <TalentProfile tab="profile" />;
    case "talents/john-doe/tasks": return <TalentProfile tab="tasks" />;
    case "team-members/john-doe/tasks": return <TalentProfile tab="tasks" />;
    case "talents/john-doe/performance": return <TalentProfile tab="performance" />;
    case "team-members/john-doe/performance": return <TalentProfile tab="performance" />;
    case "departments": return <DepartmentBoard />;
    case "roles": return <RolesList />;
    case "roles/new": return <RoleForm />;
    case "managers": return <ManagerGrid company />;
    case "managers/new": return <ManagerForm />;
    case "managers/richard-benson": return <ManagerProfile tab="profile" />;
    case "managers/richard-benson/team": return <ManagerProfile tab="team" />;
    case "salaries": return <SalaryOverview />;
    case "salaries/payroll": return <PayrollTable />;
    case "messages": return <MessagesView />;
    case "hiring": return <CandidateTable />;
    case "performance": return <PerformanceFoundation />;
    case "settings": return <CompanySettings />;
    default: return <CompanyProductScreen route={route} />;
  }
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
  return <div className="photo-upload"><Image src="/assets/figma/app/company-profile.png" alt="Profile preview" width={190} height={190} /><button type="button"><Upload /> Change profile image</button></div>;
}

function DashboardView() {
  return (
    <section className="dashboard-view">
      <div className="stat-grid">
        <Stat icon={<UsersRound />} label="Total staffs" value={20} suffix=" Staffs" detail="3 new this month" />
        <Stat icon={<TrendingUp />} label="Performance" value={73} suffix="%" detail="8% from last month" />
        <Stat icon={<Check />} label="Task completed" value={240} detail="42 this week" />
        <Stat icon={<Clock3 />} label="Hours tracked" value={2400} suffix="hrs" detail="Across all departments" />
      </div>
      <div className="dashboard-charts">
        <article className="chart-card"><header><div><h2>Performance Overview</h2><p>Jan – Dec 2026</p></div><button type="button">This year <ChevronDown /></button></header><div className="area-chart" aria-label="Performance trend chart"><span className="chart-line" /></div></article>
        <article className="chart-card"><header><div><h2>Weekly task completed</h2><p>All departments</p></div><button type="button">This week <ChevronDown /></button></header><div className="bar-chart" aria-label="Weekly task bar chart">{[52, 72, 45, 86, 66, 36, 79].map((height, index) => <span key={index} style={{ height: `${height}%` }}><i>{["M", "T", "W", "T", "F", "S", "S"][index]}</i></span>)}</div></article>
      </div>
      <div className="upcoming"><h2>Upcoming events</h2><div><CalendarDays /><p><strong>Weekly design review</strong><span>Today · 2:00pm – 3:00pm</span></p><button type="button">View</button></div><div><UserRoundPlus /><p><strong>Talent interview</strong><span>Tomorrow · 10:30am</span></p><button type="button">View</button></div></div>
    </section>
  );
}

function Stat({ icon, label, value, detail, prefix = "", suffix = "" }: { icon: ReactNode; label: string; value: number; detail: string; prefix?: string; suffix?: string }) {
  return <article className="stat-card"><span>{icon}</span><div><p>{label}</p><strong><CountUp value={value} prefix={prefix} suffix={suffix} group={value >= 1000} /></strong><small>{detail}</small></div></article>;
}

function TalentsTable() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => people.filter((person) => `${person.name} ${person.role} ${person.department}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <section><SectionToolbar><div className="filter-row"><FilterButton label="Roles" /><FilterButton label="Department" /><FilterButton label="Managers" /><FilterButton label="Performance" /></div><SearchField value={query} onChange={setQuery} placeholder="Search team members" /></SectionToolbar><div className="data-table talent-table"><div className="data-table__head"><span>Name</span><span>Role</span><span>Performance</span><span>Manager</span><span /></div>{filtered.map((person) => <Link className="data-table__row" href="/company/team-members/john-doe" key={person.id}><span className="person-cell"><Image src={person.avatar} alt="" width={42} height={42} /><b>{person.name}</b></span><span>{person.role}</span><span className="performance-cell"><i><b style={{ width: `${person.performance}%` }} /></i>{person.performance}%</span><span>{person.manager}</span><Ellipsis /></Link>)}</div></section>;
}

function ProfileTabs({ kind, active }: { kind: "talent" | "manager"; active: string }) {
  const base = kind === "talent" ? "/company/team-members/john-doe" : "/company/managers/richard-benson";
  const tabs = kind === "talent" ? [{ key: "profile", label: "Personal information", href: base }, { key: "tasks", label: "Assigned task", href: `${base}/tasks` }, { key: "performance", label: "Performance", href: `${base}/performance` }] : [{ key: "profile", label: "Manager information", href: base }, { key: "team", label: "Assigned team", href: `${base}/team` }];
  return <nav className="profile-tabs">{tabs.map((tab) => <Link className={active === tab.key ? "is-active" : ""} href={tab.href} key={tab.key}>{tab.label}</Link>)}</nav>;
}

function PersonAside({ manager = false }: { manager?: boolean }) {
  return <aside className="person-aside"><Image src={manager ? "/assets/figma/app/manager-profile.jpg" : "/assets/figma/app/company-profile.png"} alt="" width={196} height={196} /><h2>{manager ? "Richard Benson" : "John Doe C."}</h2><p>{manager ? "Product manager" : "React developer"}</p><dl><div><dt>Employee ID</dt><dd>OR-2041</dd></div><div><dt>Department</dt><dd>{manager ? "Product" : "Engineering"}</dd></div><div><dt>Joined</dt><dd>Feb 12, 2024</dd></div></dl><button type="button"><MessageSquare /> Send message</button></aside>;
}

function TalentProfile({ tab }: { tab: "profile" | "tasks" | "performance" }) {
  return <section className="profile-view"><div className="company-record-note"><strong>Company employment record</strong><span>This workspace manages placement, work and performance data. The talent owns their Oreno account and professional profile.</span></div><ProfileTabs kind="talent" active={tab} /><div className="profile-layout"><PersonAside />{tab === "profile" ? <EmploymentInformation /> : tab === "tasks" ? <TaskBoard compact /> : <EmptyDesignedState label="Talent performance content is blank in the supplied export" />}</div></section>;
}

function EmploymentInformation() {
  const member = productService.getCompanyTeamMember("john-doe");
  return <div className="information-grid"><InfoCard title="Employment details" items={[["Employee ID", member.employeeId], ["Role", member.employmentTitle], ["Engagement", member.engagement], ["Status", member.status]]} /><InfoCard title="Placement details" items={[["Department", member.department], ["Manager", member.manager], ["Start date", member.startDate], ["Placement ID", member.placementId]]} /></div>;
}

function InfoCard({ title, items }: { title: string; items: string[][] }) {
  return <article className="info-card"><h2>{title}</h2><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>;
}

function DepartmentBoard() {
  const columns = [
    ["Engineering", "12 members", ["Frontend", "Backend", "QA"]],
    ["Marketing", "8 members", ["Growth", "Content", "Social"]],
    ["Graphics Design", "5 members", ["Brand", "Product", "Illustration"]],
    ["Videography", "4 members", ["Production", "Editing", "Motion"]],
  ] as const;
  const [query, setQuery] = useState("");
  return <section><div className="view-heading view-heading--line"><div><h2>Organization Department</h2><div className="segmented-tabs"><button className="is-active">All department</button><button>Sub-department</button></div></div><div className="toolbar-inline"><SearchField value={query} onChange={setQuery} placeholder="Search department" /><button className="platform-secondary" type="button"><Plus /> Add department</button></div></div><div className="department-board">{columns.filter(([name]) => name.toLowerCase().includes(query.toLowerCase())).map(([name, count, teams]) => <article key={name}><header><div><h3>{name}</h3><p>{count}</p></div><button type="button"><Ellipsis /></button></header>{teams.map((team) => <div className="department-team" key={team}><span>{team}</span><small>Team</small><div className="avatar-stack"><Image src="/assets/figma/app/company-profile.png" alt="" width={30} height={30} /><Image src="/assets/figma/app/manager-profile.jpg" alt="" width={30} height={30} /></div></div>)}<button className="department-add" type="button"><Plus /> Add sub-department</button></article>)}</div></section>;
}

const roles = ["React developer", "Senior product designer", "Database analyst", "Growth strategist", "Software engineer", "Motion graphics designer"];
function RolesList() {
  const [query, setQuery] = useState("");
  return <section><SectionToolbar><FilterButton label="All departments" /><SearchField value={query} onChange={setQuery} placeholder="Search roles" /><Link className="platform-secondary" href="/company/roles/new"><Plus /> Add role</Link></SectionToolbar><div className="roles-list">{roles.filter((role) => role.toLowerCase().includes(query.toLowerCase())).map((role, index) => <article key={role}><span className="role-icon"><BriefcaseRole index={index} /></span><div><h2>{role}</h2><p>{[12, 4, 3, 5, 9, 2][index]} talents · {index % 2 ? "Design" : "Engineering"}</p></div><span className="role-status">Active</span><button type="button"><Ellipsis /></button></article>)}</div></section>;
}

function BriefcaseRole({ index }: { index: number }) { return <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>; }

function RoleForm() {
  const [notice, setNotice] = useState("");
  return <form className="wide-form" onSubmit={(event) => { event.preventDefault(); setNotice("Role saved to the local demo."); }}><section><header><h2>Job details</h2><p>Describe the role and the person you are looking for.</p></header><div className="form-grid"><Field label="Job title" placeholder="e.g. Product designer" /><Field label="Department" placeholder="Select department" /><Field label="Employment type" placeholder="Full time" /><Field label="Workplace" placeholder="Remote" /><Field label="Location" placeholder="Lagos, Nigeria" /><Field label="Salary range" placeholder="$2,500 – $3,500" /></div><label className="form-field form-field--wide"><span>Job description</span><textarea rows={7} placeholder="Tell candidates about the role, expectations and impact." /></label></section><section><header><h2>Employer details</h2><p>These details appear alongside the role.</p></header><div className="form-grid"><Field label="Company name" defaultValue="Oreno Technologies" /><Field label="Contact email" type="email" defaultValue="hiring@oreno.co" /></div></section><footer>{notice && <p className="form-notice">{notice}</p>}<button className="platform-primary" type="submit"><Save /> Save role</button></footer></form>;
}

function ManagerForm() {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setSubmitting(true); setNotice(""); setError(""); try { await productService.inviteCompanyMember({ firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? ""), email: String(form.get("email") ?? ""), role: String(form.get("role")) === "HR_USER" ? "HR_USER" : "MANAGER", message: String(form.get("message") ?? "") || undefined }); setNotice("Invitation sent."); event.currentTarget.reset(); } catch (cause) { setError(cause instanceof Error ? cause.message : "The invitation could not be sent."); } finally { setSubmitting(false); } }
  return <form className="wide-form manager-form" onSubmit={submit}><header><Link href="/company/access/invitations"><ArrowLeft /> Back</Link><div><h2>Invite a workspace member</h2><p>The invitation grants only the selected organisation role.</p></div></header><div className="form-grid"><Field name="firstName" label="First name" placeholder="First name" required /><Field name="lastName" label="Last name" placeholder="Last name" required /><Field name="email" label="Email address" type="email" placeholder="name@company.com" required /><label className="form-field"><span>Role</span><select name="role" defaultValue="MANAGER"><option value="MANAGER">Manager</option><option value="HR_USER">HR user</option></select></label></div><label className="form-field form-field--wide"><span>Personal message</span><textarea name="message" rows={6} placeholder="Add a note to the invitation" /></label>{notice && <p className="form-notice" role="status">{notice}</p>}{error && <p className="field-error" role="alert">{error}</p>}<button className="platform-primary" type="submit" disabled={submitting}><Mail /> {submitting ? "Sending…" : "Send invitation"}</button></form>;
}

function ManagerProfile({ tab }: { tab: "profile" | "team" }) {
  return <section className="profile-view"><ProfileTabs kind="manager" active={tab} /><div className="profile-layout"><PersonAside manager />{tab === "profile" ? <div className="information-grid"><InfoCard title="Home address" items={[["Street", "16 Cooper Road"], ["City", "Ikoyi"], ["State", "Lagos"], ["Country", "Nigeria"]]} /><article className="info-card info-card--empty"><h2>Team overview</h2></article></div> : <AssignedTeam />}</div></section>;
}

function AssignedTeam() {
  return <div className="team-table-wrap"><SectionToolbar><FilterButton label="All teams" /><SearchField value="" onChange={() => undefined} placeholder="Search team" /></SectionToolbar><div className="data-table"><div className="data-table__head"><span>Team</span><span>Members</span><span>Department</span><span>Sub-department</span></div>{[["Design system", "6 members", "Design", "Product design"], ["Mobile experience", "4 members", "Engineering", "Frontend"], ["Research ops", "3 members", "Product", "Research"], ["Growth site", "5 members", "Marketing", "Content"]].map((row) => <div className="data-table__row" key={row[0]}>{row.map((item) => <span key={item}>{item}</span>)}</div>)}</div></div>;
}

function SalaryOverview() {
  const periods = [
    { label: "Dec 01 – Dec 31, 2025", payroll: 39800, overtime: 1980, bonuses: 4200, heights: [48, 58, 44, 70, 67, 82] },
    { label: "Jan 01 – Jan 31, 2026", payroll: 42500, overtime: 2410, bonuses: 5200, heights: [55, 66, 48, 78, 72, 91] },
  ];
  const [periodIndex, setPeriodIndex] = useState(1);
  const period = periods[periodIndex];
  return <section><div className="salary-toolbar"><button type="button" onClick={() => setPeriodIndex((current) => current === 0 ? 1 : 0)} aria-label="Show another salary period"><CalendarDays /> {period.label}</button><button type="button"><Download /> Export</button></div><AnimatePresence initial={false} mode="popLayout"><m.div className="salary-period-content" key={period.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: motionDurations.feedback, ease: motionEasings.standard }}><div className="salary-stats"><Stat icon={<CircleDollarSign />} label="Monthly payroll" value={period.payroll} prefix="$" detail="20 employees" /><Stat icon={<Clock3 />} label="Overtime" value={period.overtime} prefix="$" detail="164 extra hours" /><Stat icon={<TrendingUp />} label="Bonuses" value={period.bonuses} prefix="$" detail="12 recipients" /></div><div className="salary-layout"><article className="chart-card salary-chart"><header><div><h2>Payroll overview</h2><p>Last six months</p></div><Link href="/company/salaries/payroll">View payroll</Link></header><div className="bar-chart bar-chart--salary">{period.heights.map((height, index) => <span style={{ height: `${height}%` }} key={index}><i>{["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][index]}</i></span>)}</div></article><article className="payment-panel"><h2>Payment option</h2></article></div></m.div></AnimatePresence></section>;
}

function PayrollTable() {
  return <section><div className="salary-toolbar"><button type="button"><CalendarDays /> Jan 01 – Jan 31, 2026</button><button type="button"><Download /> Export</button></div><div className="data-table payroll-table"><div className="data-table__head"><span>Name</span><span>Role</span><span>Pay/hr</span><span>Hours</span><span>Overtime</span><span>Salary</span></div>{people.map((person, index) => <div className="data-table__row" key={person.id}><span className="person-cell"><Image src={person.avatar} alt="" width={40} height={40} /><b>{person.name}</b></span><span>{person.role}</span><span>${[35, 38, 30, 42, 36, 28][index]}</span><span>{160 + index * 3}hrs</span><span>{index * 2}hrs</span><b>${(5600 + index * 370).toLocaleString()}</b></div>)}</div></section>;
}

function CandidateTable() {
  const [query, setQuery] = useState("");
  const filtered = candidates.filter((candidate) => `${candidate.name} ${candidate.role} ${candidate.status}`.toLowerCase().includes(query.toLowerCase()));
  return <section><SectionToolbar><div className="filter-row"><FilterButton label="Roles" /><FilterButton label="Department" /><FilterButton label="Managers" /><FilterButton label="Performance" /></div><SearchField value={query} onChange={setQuery} placeholder="Search talents" /></SectionToolbar><div className="data-table candidate-table"><div className="data-table__head"><span>Name of candidate</span><span>Role</span><span>CV/Portfolio link</span><span>Status</span><span /></div>{filtered.map((candidate) => <div className="data-table__row" key={candidate.id}><b>{candidate.name}</b><span>{candidate.role}</span><a href={`https://${candidate.portfolio}`} target="_blank" rel="noreferrer">{candidate.portfolio}</a><span className={`candidate-status candidate-status--${candidate.status.toLowerCase()}`}>{candidate.status}</span><button type="button"><Ellipsis /></button></div>)}</div></section>;
}

function CompanySettings() {
  const [notice, setNotice] = useState("");
  return <form className="settings-layout" onSubmit={(event) => { event.preventDefault(); setNotice("Settings saved locally for this demo."); }}><aside className="settings-profile"><span className="settings-pill">Profile</span><p>PROFILE IMAGE</p><Image src="/assets/figma/app/company-profile.png" alt="Profile" width={190} height={200} /><button type="button"><Upload /> Edit profile image</button><Field label="First Name" defaultValue="Richard" /><Field label="Last Name" defaultValue="Benson" /><Field label="Email Address" type="email" defaultValue="richard@company.com" /><Field label="Phone Number" defaultValue="+234 (0)903-123-4567" /><Field label="Role" defaultValue="Super admin" /></aside><div className="settings-main"><section><header><span className="settings-pill">Managers</span><button type="button"><Plus /> Invite someone</button></header><div className="mini-table"><div><b>Name</b><b>Email Address</b><b>Role</b><b>Last login</b><span /></div>{managers.slice(0, 4).map((manager, index) => <div key={manager.id}><span>{manager.name}{index === 0 && <small>You</small>}</span><span>{manager.email}</span><span>{index === 0 ? "Business owner" : manager.role}</span><span>Feb 25, 2026; 1:50 PM</span><Ellipsis /></div>)}</div></section><section><header><span className="settings-pill">Account</span><button type="button"><Plus /> Add account</button></header><div className="settings-empty" /></section><footer>{notice && <p className="form-notice">{notice}</p>}<button type="submit"><Save /> Save changes</button></footer></div></form>;
}
