"use client";

import Image from "next/image";
import Link from "next/link";
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

const companyTitles: Record<string, string> = {
  "": "Dashboard",
  talents: "Talents",
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
  const route = segments.join("/");
  if (route === "login" || route === "signup") return <AuthScreen mode={route} />;
  if (route === "onboarding/complete") return <CompanyOnboardingComplete />;
  if (segments[0] === "onboarding") return <OnboardingScreen step={segments[1] ?? "personal"} />;

  const actionLabel = route === "talents/john-doe/tasks" ? "Add task" : "Hire a talent";
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
    case "talents/john-doe": return <TalentProfile tab="profile" />;
    case "talents/john-doe/tasks": return <TalentProfile tab="tasks" />;
    case "talents/john-doe/performance": return <TalentProfile tab="performance" />;
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
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(isLogin ? "Demo login successful. Opening dashboard…" : "Demo account created. Continue to your profile.");
  }
  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <Link className="auth-brand" href="/"><Image src="/assets/figma/oreno-mark.svg" alt="" width={46} height={46} /><span>reno</span></Link>
        <div className="auth-form-wrap">
          <h1>{isLogin ? "Welcome back!" : "Sign Up"}</h1>
          <p>{isLogin ? "Log in to continue building great teams" : "Get ready to supercharge your hiring process"}</p>
          <div className="auth-socials"><button type="button"><b>G</b> {isLogin ? "Log in" : "Sign up"} with Google</button><button type="button"><b>in</b> {isLogin ? "Log in" : "Sign up"} with LinkedIn</button></div>
          <div className="auth-divider"><span>or continue with email</span></div>
          <form onSubmit={submit}>
            <label>Email address<input type="email" required placeholder="name@company.com" /></label>
            <label>Password<span className="password-input"><input type={showPassword ? "text" : "password"} required minLength={6} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
            {isLogin && <div className="auth-options"><label><input type="checkbox" /> Remember me</label><Link href="/auth/forgot-password">Forgot password?</Link></div>}
            <button className="auth-submit" type="submit">{isLogin ? "Log in" : "Sign up"}<ArrowRight /></button>
          </form>
          {notice && <p className="form-notice" role="status">{notice}</p>}
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
        <Link className="auth-brand auth-brand--light" href="/"><Image src="/assets/figma/oreno-mark.svg" alt="" width={46} height={46} /><span>reno</span></Link>
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
  const next = step === "personal" ? "company" : step === "company" ? "managers" : step === "managers" ? "accounts" : "done";
  return (
    <form className="onboarding-form" onSubmit={(event) => event.preventDefault()}>
      {step === "personal" && <><div className="form-grid"><Field label="First name" defaultValue="Richard" /><Field label="Last name" defaultValue="Benson" /><Field label="Email address" type="email" defaultValue="richard@company.com" /><Field label="Phone number" defaultValue="+234 (0)903-123-4567" /><Field label="Role" defaultValue="Super admin" /><Field label="Location" defaultValue="Lagos, Nigeria" /></div><PhotoUpload /></>}
      {step === "company" && <><div className="form-grid"><Field label="Company name" defaultValue="Oreno Technologies" /><Field label="Company email" type="email" defaultValue="hello@oreno.co" /><Field label="Company size" defaultValue="20–50 employees" /><Field label="Industry" defaultValue="Technology" /><Field label="Website" defaultValue="https://oreno.co" /><Field label="Location" defaultValue="Lagos, Nigeria" /></div><div className="onboarding-note"><strong>Company workspace</strong><p>This information helps tailor your hiring and team-management experience.</p></div></>}
      {step === "managers" && <><div className="form-grid"><Field label="Manager's first name" defaultValue="Sarima" /><Field label="Manager's last name" defaultValue="Chiorlu" /><Field label="Work email" type="email" defaultValue="sarima@company.com" /><Field label="Role" defaultValue="Human resource" /></div><button className="inline-add" type="button"><Plus /> Add another manager</button></>}
      {step === "accounts" && <><div className="form-grid"><Field label="Bank name" defaultValue="First Bank" /><Field label="Account number" defaultValue="0123456789" /><Field label="Account name" defaultValue="Oreno Technologies" /><Field label="Currency" defaultValue="NGN — Nigerian Naira" /></div><div className="onboarding-note"><CircleDollarSign /><div><strong>Secure payment setup</strong><p>Banking details stay behind the mock service boundary in this demo.</p></div></div></>}
      <footer className="onboarding-form__footer">{step === "managers" && <Link href="/company/onboarding/accounts">Skip for now</Link>}<Link className="onboarding-next" href={next === "done" ? "/company/onboarding/complete" : `/company/onboarding/${next}`}>Save and continue <ArrowRight /></Link></footer>
    </form>
  );
}

function Field({ label, defaultValue = "", type = "text", placeholder }: { label: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return <label className="form-field"><span>{label}</span><input type={type} defaultValue={defaultValue} placeholder={placeholder} /></label>;
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
  return <section><SectionToolbar><div className="filter-row"><FilterButton label="Roles" /><FilterButton label="Department" /><FilterButton label="Managers" /><FilterButton label="Performance" /></div><SearchField value={query} onChange={setQuery} placeholder="Search talents" /></SectionToolbar><div className="data-table talent-table"><div className="data-table__head"><span>Name</span><span>Role</span><span>Performance</span><span>Manager</span><span /></div>{filtered.map((person) => <Link className="data-table__row" href="/company/talents/john-doe" key={person.id}><span className="person-cell"><Image src={person.avatar} alt="" width={42} height={42} /><b>{person.name}</b></span><span>{person.role}</span><span className="performance-cell"><i><b style={{ width: `${person.performance}%` }} /></i>{person.performance}%</span><span>{person.manager}</span><Ellipsis /></Link>)}</div></section>;
}

function ProfileTabs({ kind, active }: { kind: "talent" | "manager"; active: string }) {
  const base = kind === "talent" ? "/company/talents/john-doe" : "/company/managers/richard-benson";
  const tabs = kind === "talent" ? [{ key: "profile", label: "Personal information", href: base }, { key: "tasks", label: "Assigned task", href: `${base}/tasks` }, { key: "performance", label: "Performance", href: `${base}/performance` }] : [{ key: "profile", label: "Manager information", href: base }, { key: "team", label: "Assigned team", href: `${base}/team` }];
  return <nav className="profile-tabs">{tabs.map((tab) => <Link className={active === tab.key ? "is-active" : ""} href={tab.href} key={tab.key}>{tab.label}</Link>)}</nav>;
}

function PersonAside({ manager = false }: { manager?: boolean }) {
  return <aside className="person-aside"><Image src={manager ? "/assets/figma/app/manager-profile.jpg" : "/assets/figma/app/company-profile.png"} alt="" width={196} height={196} /><h2>{manager ? "Richard Benson" : "John Doe C."}</h2><p>{manager ? "Product manager" : "React developer"}</p><dl><div><dt>Employee ID</dt><dd>OR-2041</dd></div><div><dt>Department</dt><dd>{manager ? "Product" : "Engineering"}</dd></div><div><dt>Joined</dt><dd>Feb 12, 2024</dd></div></dl><button type="button"><MessageSquare /> Send message</button></aside>;
}

function TalentProfile({ tab }: { tab: "profile" | "tasks" | "performance" }) {
  return <section className="profile-view"><ProfileTabs kind="talent" active={tab} /><div className="profile-layout"><PersonAside />{tab === "profile" ? <PersonalInformation /> : tab === "tasks" ? <TaskBoard compact /> : <EmptyDesignedState label="Talent performance content is blank in the supplied export" />}</div></section>;
}

function PersonalInformation() {
  return <div className="information-grid"><InfoCard title="Personal information" items={[["Full name", "John Doe C."], ["Email address", "john@oreno.team"], ["Phone number", "+234 (0)903-123-4567"], ["Role", "React developer"]]} /><InfoCard title="Home address" items={[["Street", "14 Admiralty Way"], ["City", "Lekki"], ["State", "Lagos"], ["Country", "Nigeria"]]} /></div>;
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
  return <form className="wide-form manager-form" onSubmit={(event) => { event.preventDefault(); setNotice("Manager invitation prepared in this demo."); }}><header><Link href="/company/managers"><ArrowLeft /> Back</Link><div><h2>Add a manager</h2><p>Invite a manager to your Oreno workspace.</p></div></header><div className="form-grid"><Field label="First name" placeholder="First name" /><Field label="Last name" placeholder="Last name" /><Field label="Email address" type="email" placeholder="name@company.com" /><Field label="Phone number" placeholder="+234" /><Field label="Role" placeholder="Select role" /><Field label="Department" placeholder="Select department" /></div><label className="form-field form-field--wide"><span>Personal message</span><textarea rows={6} placeholder="Add a note to the invitation" /></label>{notice && <p className="form-notice">{notice}</p>}<button className="platform-primary" type="submit"><Mail /> Send request</button></form>;
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
