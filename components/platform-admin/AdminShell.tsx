"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, Bell, BriefcaseBusiness, Building2, ClipboardCheck, FileClock,
  FileText, Gauge, LifeBuoy, Menu, Megaphone, Search, Settings2, ShieldCheck,
  UsersRound, WalletCards, X,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState, type ReactNode } from "react";
import type { AdminPermission, AdminSession } from "@/lib/platform-admin/contracts";
import { hasAdminPermission } from "@/lib/platform-admin/policy";
import { Logo } from "@/components/Logo";

type NavItem = { href: string; label: string; icon: ReactNode; permission: AdminPermission; exact?: boolean };
const navSections: Array<{ title: string; items: NavItem[] }> = [
  { title: "Platform", items: [
    { href: "/platform-admin", label: "Overview", icon: <Gauge />, permission: "overview:view", exact: true },
    { href: "/platform-admin/analytics", label: "Analytics", icon: <BarChart3 />, permission: "analytics:view" },
  ] },
  { title: "Organisations", items: [
    { href: "/platform-admin/companies", label: "Companies", icon: <Building2 />, permission: "companies:view" },
    { href: "/platform-admin/users", label: "Users & access", icon: <UsersRound />, permission: "users:view" },
  ] },
  { title: "Talent & hiring", items: [
    { href: "/platform-admin/talent-review", label: "Talent review", icon: <ClipboardCheck />, permission: "vetting:view" },
    { href: "/platform-admin/jobs", label: "Job moderation", icon: <BriefcaseBusiness />, permission: "jobs:view" },
    { href: "/platform-admin/screening", label: "Recruitment screening", icon: <ShieldCheck />, permission: "screening:view" },
    { href: "/platform-admin/applications", label: "Applications", icon: <FileText />, permission: "hiring:view" },
  ] },
  { title: "Operations", items: [
    { href: "/platform-admin/support", label: "Support & disputes", icon: <LifeBuoy />, permission: "support:view" },
    { href: "/platform-admin/payments", label: "Payment records", icon: <WalletCards />, permission: "payments:view" },
    { href: "/platform-admin/communications", label: "Communications", icon: <Megaphone />, permission: "announcements:view" },
  ] },
  { title: "System", items: [
    { href: "/platform-admin/content", label: "Content & config", icon: <Settings2 />, permission: "configuration:view" },
    { href: "/platform-admin/audit", label: "Audit log", icon: <ShieldCheck />, permission: "audit:view" },
    { href: "/platform-admin/system", label: "System operations", icon: <Activity />, permission: "system:view" },
  ] },
];

export const adminPageMeta: Record<string, { title: string; description: string }> = {
  "": { title: "Platform overview", description: "Live operational metrics across every organisation" },
  companies: { title: "Companies", description: "Registered organisations, onboarding, and status controls" },
  users: { title: "Users & access", description: "Global accounts, platform roles, sessions, and security" },
  "access/roles": { title: "Admin roles", description: "Exact platform permissions and administrator assignments" },
  "talent-review": { title: "Talent review", description: "Vetting queues, evidence, and human decisions" },
  jobs: { title: "Job moderation", description: "Review reports and apply platform listing policy" },
  screening: { title: "Recruitment screening", description: "Human CV review, Oreno interviews, approval, and explicit employer release" },
  applications: { title: "Applications & placements", description: "Cross-platform hiring and workforce linkage" },
  placements: { title: "Placements", description: "Confirmed placements and linked staff assignments" },
  replacements: { title: "Replacement requests", description: "Policy-based eligibility and operations decisions" },
  support: { title: "Support & disputes", description: "Case ownership, timelines, SLA risk, and resolution" },
  payments: { title: "Payment records", description: "Read-only payroll summaries and reconciliation exceptions" },
  communications: { title: "Communications", description: "Announcements and transactional delivery operations" },
  content: { title: "Content & configuration", description: "Feature flags, policy values, and help content" },
  analytics: { title: "Analytics", description: "Platform-wide trends, funnels, and operational health" },
  exports: { title: "Exports", description: "Asynchronous reporting files and expiry status" },
  audit: { title: "Audit log", description: "Immutable administrative activity and safe change summaries" },
  system: { title: "System operations", description: "Service health, queue depth, and failed work" },
  account: { title: "Admin account", description: "Personal security, sessions, and platform identity" },
};

function withRole(href: string, roleSlug?: string) {
  return roleSlug ? `${href}?role=${encodeURIComponent(roleSlug)}` : href;
}

function SidebarContent({ session, roleSlug, onNavigate }: { session: AdminSession; roleSlug?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <><div className="admin-brand"><Link href={withRole("/platform-admin", roleSlug)} onClick={onNavigate} aria-label="Oreno platform administration"><Logo /><small>PLATFORM ADMIN</small></Link></div><nav aria-label="Platform administration">{navSections.map((section) => { const items = section.items.filter((item) => hasAdminPermission(session.role, item.permission)); if (!items.length) return null; return <section key={section.title}><h2>{section.title}</h2>{items.map((item) => { const active = item.exact ? pathname === item.href : pathname.startsWith(item.href); return <Link aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} href={withRole(item.href, roleSlug)} key={item.href} onClick={onNavigate}><span>{item.icon}</span>{item.label}{active && <i aria-hidden="true" />}</Link>; })}</section>; })}</nav><footer><Link href={withRole("/platform-admin/account", roleSlug)} onClick={onNavigate}><span>{session.initials}</span><div><strong>{session.name}</strong><small>{session.role}</small></div></Link><Link aria-label="View audit log" href={withRole("/platform-admin/audit", roleSlug)} onClick={onNavigate}><FileClock /></Link></footer></>;
}

export function AdminShell({ children, route, session, roleSlug }: { children: ReactNode; route: string; session: AdminSession; roleSlug?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const metaKey = Object.keys(adminPageMeta).sort((a, b) => b.length - a.length).find((key) => key === "" ? route === "" : route === key || route.startsWith(`${key}/`)) ?? "";
  const meta = adminPageMeta[metaKey];
  return <div className="platform-admin-shell"><aside className="admin-sidebar"><SidebarContent roleSlug={roleSlug} session={session} /></aside><AnimatePresence>{mobileOpen && <><m.button aria-label="Close navigation" className="admin-mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} /><m.aside className="admin-sidebar admin-sidebar--mobile" initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}><button aria-label="Close navigation" className="admin-mobile-close" onClick={() => setMobileOpen(false)} type="button"><X /></button><SidebarContent onNavigate={() => setMobileOpen(false)} roleSlug={roleSlug} session={session} /></m.aside></>}</AnimatePresence><div className="admin-workspace"><header className="admin-header"><button aria-label="Open navigation" className="admin-menu" onClick={() => setMobileOpen(true)} type="button"><Menu /></button><div><h1>{meta.title}</h1><p>{meta.description}</p></div><label className="admin-global-search"><Search /><span className="sr-only">Global admin search</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Global search…" value={search} /></label><button aria-label="Notifications" className="admin-icon-button" type="button"><Bell /><i /></button><span className="admin-audit-pill"><ShieldCheck />Actions audited</span><Link aria-label="Admin account" className="admin-avatar" href={withRole("/platform-admin/account", roleSlug)}>{session.initials}</Link></header><main>{children}</main></div></div>;
}
