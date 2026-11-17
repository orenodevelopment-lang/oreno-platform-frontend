"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  ClipboardList,
  House,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  Plus,
  Settings,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { WorkspaceAmbient } from "@/components/motion/WorkspaceAmbient";
import { Logo } from "@/components/Logo";
import { invalidateLive } from "@/lib/api/live-store";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

type ShellKind = "company" | "talent";

type NavItem = {
  href?: string;
  label: string;
  icon?: typeof House;
  heading?: boolean;
};

const companyNavigation: NavItem[] = [
  { href: "/company", label: "Home", icon: House },
  { label: "Your business", heading: true },
  { href: "/company/organisation", label: "Organisation", icon: Network },
  { href: "/company/access", label: "Members & access", icon: UsersRound },
  { href: "/company/team-members", label: "Team members", icon: UsersRound },
  { href: "/company/departments", label: "Department", icon: Network },
  { href: "/company/teams", label: "Teams", icon: UsersRound },
  { label: "Hiring", heading: true },
  { href: "/company/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/company/applications", label: "Applications", icon: ClipboardList },
  { href: "/company/interviews", label: "Interviews", icon: UserRound },
  { href: "/company/offers", label: "Offers", icon: WalletCards },
  { href: "/company/placements", label: "Placements", icon: UsersRound },
  { href: "/company/replacements", label: "Replacements", icon: UsersRound },
  { label: "Work", heading: true },
  { href: "/company/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/company/time", label: "Time entries", icon: CircleHelp },
  { href: "/company/performance", label: "Performance", icon: CircleHelp },
  { href: "/company/compensation", label: "Compensation", icon: WalletCards },
  { href: "/company/files", label: "Files", icon: ClipboardList },
  { href: "/company/messages", label: "Messages", icon: MessageSquare },
  { label: "Account", heading: true },
  { href: "/company/preferences", label: "Preferences", icon: Settings },
];

const talentNavigation: NavItem[] = [
  { href: "/talent", label: "Home", icon: House },
  { label: "Career", heading: true },
  { href: "/talent/profile", label: "Professional profile", icon: UserRound },
  { href: "/talent/saved-jobs", label: "Saved jobs", icon: BriefcaseBusiness },
  { href: "/talent/performance", label: "Performance", icon: ClipboardList },
  { href: "/talent/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/talent/applications", label: "Applications", icon: ClipboardList },
  { href: "/talent/interviews", label: "Interviews", icon: UserRound },
  { href: "/talent/offers", label: "Offers", icon: WalletCards },
  { label: "Work", heading: true },
  { href: "/talent/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/talent/time", label: "Time entries", icon: CircleHelp },
  { href: "/talent/compensation", label: "Compensation", icon: WalletCards },
  { href: "/talent/team/current", label: "My team", icon: UsersRound },
  { href: "/talent/messages", label: "Messages", icon: MessageSquare },
  { label: "Personal", heading: true },
  { href: "/talent/account", label: "Account & security", icon: Settings },
];

function RequestNotice(){const [error,setError]=useState("");useEffect(()=>{const failed=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.status!==401)setError(detail?.message||"A request failed. Please try again.");};window.addEventListener("oreno:api-error",failed);return()=>window.removeEventListener("oreno:api-error",failed);},[]);return error?<div className="workspace-request-error" role="alert"><p>{error}</p><button type="button" onClick={()=>{setError("");invalidateLive();}}>Refresh data</button><button type="button" onClick={()=>setError("")}>Dismiss</button></div>:null;}
function isActive(pathname: string, href: string) {
  if (href === "/company" || href === "/talent") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ShellMounted = createContext(false);
type ShellProps = {kind: ShellKind; title: string; children: ReactNode; actionLabel?: string};
export function PlatformShell(props: ShellProps) {
  const mounted = useContext(ShellMounted);
  return mounted ? <>{props.children}</> : <ShellMounted.Provider value={true}><PlatformShellRoot {...props}/></ShellMounted.Provider>;
}
export function workspaceTitle(kind: ShellKind, pathname: string) {
  if (kind === "company" && pathname.startsWith("/company/candidates/")) return "Candidate profile";
  const navigation = kind === "company" ? companyNavigation : talentNavigation;
  const exact = navigation.find(item => item.href === pathname);
  if(exact) return exact.label === "Home" ? "Dashboard" : exact.label;
  return navigation.find(item => item.href && item.href !== '/' + kind && pathname.startsWith(item.href + '/'))?.label ?? "Workspace";
}
function PlatformShellRoot({
  kind,
  title,
  children,
  actionLabel,
}: {
  kind: ShellKind;
  title: string;
  children: ReactNode;
  actionLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const navigation = kind === "company" ? companyNavigation : talentNavigation;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = sidebarRef.current?.querySelector<HTMLElement>("a, button");
    focusable?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const elements = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter((item) => item.getClientRects().length);
        const first = elements[0]; const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    const trigger=menuButtonRef.current;
    return () => {
      trigger?.focus();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function signOut() {
    try { await authApi.logout(); router.replace(kind === "company" ? "/company/login" : "/auth/talent-login"); } catch { /* The request notice reports a failed logout; keep the session intact. */ }
  }

  return (
    <div className={`platform-shell platform-shell--${kind}`}>
      <aside ref={sidebarRef} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label="Workspace navigation" className={`platform-sidebar ${open ? "platform-sidebar--open" : ""}`}>
        <div className="platform-sidebar__top">
          <Link href={kind === "company" ? "/company" : "/talent"} className="platform-brand" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button className="platform-sidebar__close" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="platform-nav" aria-label={`${kind} navigation`}>
          {navigation.map((item, index) => {
            if (item.heading) return <p className="platform-nav__heading" key={`${item.label}-${index}`}>{item.label}</p>;
            const Icon = item.icon ?? House;
            return (
              <Link
                key={item.href}
                className={`platform-nav__link ${item.href && isActive(pathname, item.href) ? "is-active" : ""}`}
                href={item.href ?? "#"}
                onClick={() => setOpen(false)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="platform-nav__link platform-nav__logout" type="button" onClick={() => { setOpen(false); void signOut(); }}>
          <LogOut aria-hidden="true" />
          <span>Log out</span>
        </button>
      </aside>

      <AnimatePresence>{open && <m.button className="platform-backdrop" aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}</AnimatePresence>

      <div className="platform-main">
        <header className="platform-topbar">
          <button ref={menuButtonRef} className="platform-menu" type="button" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu aria-hidden="true" />
          </button>
          <h1>{title}</h1>
          <div className="platform-topbar__actions">
            {actionLabel && (
              <Link className="platform-primary" href={kind === "company" ? "/company/jobs/new" : "/talent/jobs"}>
                {actionLabel === "Add task" && <Plus aria-hidden="true" />}
                {actionLabel}
              </Link>
            )}
            <Link className="platform-icon-button" aria-label="Work" href={kind === "company" ? "/company/tasks" : "/talent/tasks"}>
              <BriefcaseBusiness aria-hidden="true" />
            </Link>
            <Link className="platform-icon-button platform-notification" aria-label="Notifications" href={kind === "company" ? "/company/notifications" : "/talent/notifications"}>
              <Bell aria-hidden="true" />
            </Link>
            <Link className="platform-icon-button platform-user" aria-label="Account settings" href={kind === "company" ? "/company/settings" : "/talent/account"}>
              <UserRound aria-hidden="true" />
            </Link>
          </div>
        </header>
        <main className="platform-content">
          <WorkspaceAmbient tone={kind} />
          <RequestNotice key={pathname}/>{children}
        </main>
      </div>
    </div>
  );
}
