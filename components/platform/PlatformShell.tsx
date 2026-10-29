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
  UserRoundPlus,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { WorkspaceAmbient } from "@/components/motion/WorkspaceAmbient";
import { Logo } from "@/components/Logo";
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
  { href: "/company/discover", label: "Discover talent", icon: UserRoundPlus },
  { href: "/company/applications", label: "Applications", icon: ClipboardList },
  { href: "/company/interviews", label: "Interviews", icon: UserRound },
  { href: "/company/offers", label: "Offers", icon: WalletCards },
  { label: "Work", heading: true },
  { href: "/company/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/company/time", label: "Time entries", icon: CircleHelp },
  { href: "/company/performance", label: "Performance", icon: CircleHelp },
  { href: "/company/compensation", label: "Compensation", icon: WalletCards },
  { href: "/company/messages", label: "Messages", icon: MessageSquare },
  { label: "Account", heading: true },
  { href: "/company/preferences", label: "Preferences", icon: Settings },
];

const talentNavigation: NavItem[] = [
  { href: "/talent", label: "Home", icon: House },
  { label: "Career", heading: true },
  { href: "/talent/profile", label: "Professional profile", icon: UserRound },
  { href: "/talent/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/talent/applications", label: "Applications", icon: ClipboardList },
  { label: "Work", heading: true },
  { href: "/talent/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/talent/team/current", label: "My team", icon: UsersRound },
  { href: "/talent/messages", label: "Messages", icon: MessageSquare },
  { label: "Personal", heading: true },
  { href: "/talent/account", label: "Account & security", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/company" || href === "/talent") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformShell({
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
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function signOut() {
    await authApi.logout();
    router.replace(kind === "company" ? "/company/login" : "/auth/talent-login");
  }

  return (
    <div className={`platform-shell platform-shell--${kind}`}>
      <aside ref={sidebarRef} className={`platform-sidebar ${open ? "platform-sidebar--open" : ""}`}>
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
              <Link className="platform-primary" href={kind === "company" ? "/company/discover" : "/talent/jobs"}>
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
          {children}
        </main>
      </div>
    </div>
  );
}
