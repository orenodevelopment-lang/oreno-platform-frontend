"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { m } from "motion/react";
import { useState, type FormEvent } from "react";
import { AdminButton, AdminNotice } from "./AdminUI";

function roleQuery(roleSlug?: string) {
  return roleSlug ? `?role=${encodeURIComponent(roleSlug)}` : "";
}

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="admin-auth">
      <section className="admin-auth__story" aria-label="Oreno platform administration">
        <Link className="admin-auth__brand" href="/">
          <Image alt="" height={46} src="/assets/figma/oreno-mark.svg" width={46} priority />
          <span><b>oreno</b><small>PLATFORM ADMIN</small></span>
        </Link>
        <div>
          <span className="admin-auth__eyebrow"><ShieldCheck /> Restricted operations</span>
          <h1>One secure view of the whole Oreno platform.</h1>
          <p>Review organisations, users, hiring activity, support cases, and platform health with role-based controls and an immutable audit trail.</p>
        </div>
        <ul>
          <li><CheckCircle2 /> Mandatory two-factor verification</li>
          <li><CheckCircle2 /> Least-privilege access by admin role</li>
          <li><CheckCircle2 /> Reasons recorded for high-risk actions</li>
        </ul>
      </section>
      <m.section className="admin-auth__panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-auth__form-wrap">
          <span className="admin-auth__step">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
          <Link className="admin-auth__back" href="/"><ArrowLeft /> Return to Oreno</Link>
        </div>
      </m.section>
    </main>
  );
}

function Login({ roleSlug }: { roleSlug?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("alex@oreno.example");
  const [password, setPassword] = useState("admin-demo");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    router.push(`/platform-admin/two-factor${roleQuery(roleSlug)}`);
  }

  return (
    <AuthFrame eyebrow="Step 1 of 2" title="Sign in to administration" description="Use your assigned Oreno administrator account. Two-factor verification is always required.">
      <form className="admin-auth__form" onSubmit={submit}>
        <label>Email address<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label>Password<input autoComplete="current-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
        <div className="admin-auth__row"><label className="admin-checkbox"><input type="checkbox" /> Trust this browser for 12 hours</label><a href="mailto:security@oreno.example">Access help</a></div>
        <AdminButton type="submit">Continue securely</AdminButton>
      </form>
      <AdminNotice title="Frontend integration demo">Credentials are not sent or stored. Production sign-in must use the authenticated admin API and an httpOnly session cookie.</AdminNotice>
    </AuthFrame>
  );
}

function TwoFactor({ roleSlug }: { roleSlug?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (code.replace(/\s/g, "").length < 6) return;
    router.push(`/platform-admin${roleQuery(roleSlug)}`);
  }

  return (
    <AuthFrame eyebrow="Step 2 of 2" title="Verify it is you" description={recovery ? "Enter one of your single-use recovery codes." : "Enter the six-digit code from your authenticator app."}>
      <div className="admin-auth__security-icon"><LockKeyhole /></div>
      <form className="admin-auth__form" onSubmit={submit}>
        <label>{recovery ? "Recovery code" : "Authentication code"}<input autoComplete="one-time-code" className={recovery ? "" : "admin-auth__code"} inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 20 : 6} onChange={(event) => setCode(event.target.value)} placeholder={recovery ? "XXXX-XXXX-XXXX" : "000000"} required value={code} /></label>
        <AdminButton type="submit">Verify and open admin</AdminButton>
        <button className="admin-auth__switch" onClick={() => { setRecovery((value) => !value); setCode(""); }} type="button"><KeyRound /> {recovery ? "Use authenticator code" : "Use a recovery code"}</button>
      </form>
      <p className="admin-auth__fineprint">For this frontend demo, any six or more characters will continue. The production endpoint must validate TOTP or consume a recovery code server-side.</p>
    </AuthFrame>
  );
}

function MessageState({ expired, roleSlug }: { expired?: boolean; roleSlug?: string }) {
  return (
    <AuthFrame eyebrow={expired ? "Session ended" : "Restricted view"} title={expired ? "Your admin session expired" : "You do not have access"} description={expired ? "For security, administrator sessions end after a period of inactivity." : "Your current platform role does not include the permission required for this screen."}>
      <div className="admin-auth__security-icon"><ShieldCheck /></div>
      <AdminNotice tone={expired ? "warning" : "danger"} title={expired ? "Sign in again" : "Least-privilege access"}>{expired ? "Complete both authentication steps to resume administration." : "Ask a Platform Owner to review your assigned role if you believe this is incorrect."}</AdminNotice>
      <div className="admin-auth__actions"><Link className="admin-button admin-button--primary admin-button--normal" href={`/platform-admin/login${roleQuery(roleSlug)}`}>Sign in securely</Link><Link className="admin-button admin-button--secondary admin-button--normal" href={`/platform-admin${roleQuery(roleSlug)}`}>Admin overview</Link></div>
    </AuthFrame>
  );
}

export function AdminAuth({ screen, roleSlug }: { screen: "login" | "two-factor" | "session-expired" | "access-denied"; roleSlug?: string }) {
  if (screen === "login") return <Login roleSlug={roleSlug} />;
  if (screen === "two-factor") return <TwoFactor roleSlug={roleSlug} />;
  return <MessageState expired={screen === "session-expired"} roleSlug={roleSlug} />;
}
