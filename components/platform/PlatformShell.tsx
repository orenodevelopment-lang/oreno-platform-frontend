"use client";

import Image from "next/image";
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
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { WorkspaceAmbient } from "@/components/motion/WorkspaceAmbient";

type ShellKind = "company" | "talent";

type NavItem = {
  href?: string;
  label: string;
  icon?: typeof House;
  heading?: boolean;
};

const companyNavigation: NavItem[] = [
  { href: "/company", label: "Home", icon: House },
  { label: "Your Business", heading: true },
  { href: "/company/talents", label: "Talents", icon: UsersRound },
  { href: "/company/departments", label: "Department", icon: Network },
  { href: "/company/roles", label: "Roles", icon: BriefcaseBusiness },
  { href: "/company/managers", label: "Managers", icon: UserRound },
  { href: "/company/salaries", label: "Salaries", icon: WalletCards },
  { href: "/company/messages", label: "Message", icon: MessageSquare },
  { label: "Hiring", heading: true },
  { href: "/company/hiring", label: "Talent hire", icon: UserRoundPlus },
  { href: "/company/performance", label: "Performance", icon: CircleHelp },
  { label: "Account", heading: true },
  { href: "/company/settings", label: "Settings", icon: Settings },
];

const talentNavigation: NavItem[] = [
  { href: "/talent/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/talent/team", label: "Team", icon: UsersRound },
  { href: "/talent/messages", label: "Message", icon: MessageSquare },
  { href: "/talent/settings", label: "Settings", icon: Settings },
  { href: "/talent/apply", label: "Apply", icon: BriefcaseBusiness },
];

function isActive(pathname: string, href: string) {
  if (href === "/company" || href === "/talent/tasks") return pathname === href;
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
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const navigation = kind === "company" ? companyNavigation : talentNavigation;

  function announce(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  return (
    <div className={`platform-shell platform-shell--${kind}`}>
      <aside className={`platform-sidebar ${open ? "platform-sidebar--open" : ""}`}>
        <div className="platform-sidebar__top">
          <Link href={kind === "company" ? "/company" : "/talent"} className="platform-brand" onClick={() => setOpen(false)}>
            <Image src="/assets/figma/oreno-mark.svg" alt="" width={48} height={48} priority />
            <span>reno</span>
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
        <Link className="platform-nav__link platform-nav__logout" href="/" onClick={() => setOpen(false)}>
          <LogOut aria-hidden="true" />
          <span>Log out</span>
        </Link>
      </aside>

      <AnimatePresence>{open && <m.button className="platform-backdrop" aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}</AnimatePresence>

      <div className="platform-main">
        <header className="platform-topbar">
          <button className="platform-menu" type="button" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu aria-hidden="true" />
          </button>
          <h1>{title}</h1>
          <div className="platform-topbar__actions">
            {actionLabel && (
              <button className="platform-primary" type="button" onClick={() => announce(`${actionLabel} flow opened for this demo.`)}>
                {actionLabel === "Add task" && <Plus aria-hidden="true" />}
                {actionLabel}
              </button>
            )}
            <button type="button" className="platform-icon-button" aria-label="Work" onClick={() => announce("No new work alerts.")}>
              <BriefcaseBusiness aria-hidden="true" />
            </button>
            <Link className="platform-icon-button platform-notification" aria-label="Notifications" href={kind === "company" ? "/company/notifications" : "/talent/notifications"}>
              <Bell aria-hidden="true" />
            </Link>
            <button type="button" className="platform-icon-button platform-user" aria-label="Account menu" onClick={() => announce("Account menu opened.")}>
              <UserRound aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="platform-content">
          <WorkspaceAmbient tone={kind} />
          {children}
        </main>
      </div>
      <div className={`platform-toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite">
        <ShieldCheck aria-hidden="true" /> {notice}
      </div>
    </div>
  );
}
