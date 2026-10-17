"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { m } from "motion/react";
import { useState, type FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";
import { AdminButton, AdminNotice } from "./AdminUI";

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <main className="admin-auth"><section className="admin-auth__story" aria-label="Oreno platform administration"><Link className="admin-auth__brand" href="/"><Image alt="" height={46} src="/assets/figma/oreno-mark.svg" width={46} priority /><span><b>oreno</b><small>PLATFORM ADMIN</small></span></Link><div><span className="admin-auth__eyebrow"><ShieldCheck /> Restricted operations</span><h1>One secure view of the whole Oreno platform.</h1><p>Review organisations, users, hiring activity, support cases, and platform health with role-based controls and an immutable audit trail.</p></div><ul><li><CheckCircle2 /> Mandatory two-factor verification</li><li><CheckCircle2 /> Least-privilege access by admin role</li><li><CheckCircle2 /> Reasons recorded for high-risk actions</li></ul></section><m.section className="admin-auth__panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><div className="admin-auth__form-wrap"><span className="admin-auth__step">{eyebrow}</span><h2>{title}</h2><p>{description}</p>{children}<Link className="admin-auth__back" href="/"><ArrowLeft /> Return to Oreno</Link></div></m.section></main>;
}

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      await authApi.login({ email, password, ...(needsCode ? { twoFactorCode: code.replace(/\s/g, "") } : {}), deviceLabel: "Oreno platform administration" });
      invalidateLive("admin:"); router.replace("/platform-admin"); router.refresh();
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === "TWO_FACTOR_REQUIRED") setNeedsCode(true);
      else setError(cause instanceof Error ? cause.message : "Sign-in failed.");
    } finally { setPending(false); }
  }
  return <AuthFrame eyebrow={needsCode ? "Step 2 of 2" : "Step 1 of 2"} title={needsCode ? "Verify it is you" : "Sign in to administration"} description={needsCode ? "Enter your authenticator or recovery code. Your password remains only in this form until sign-in completes." : "Use your assigned Oreno administrator account."}><form className="admin-auth__form" onSubmit={submit}><label>Email address<input autoComplete="username" disabled={needsCode || pending} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><label>Password<input autoComplete="current-password" disabled={needsCode || pending} minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>{needsCode && <label>Authentication or recovery code<input autoComplete="one-time-code" className="admin-auth__code" onChange={(event) => setCode(event.target.value)} required value={code} /></label>}{error && <AdminNotice tone="danger" title="Sign-in failed">{error}</AdminNotice>}<AdminButton disabled={pending} type="submit">{pending ? "Checking…" : needsCode ? "Verify and open admin" : "Continue securely"}</AdminButton>{needsCode && <button className="admin-auth__switch" onClick={() => { setNeedsCode(false); setCode(""); }} type="button"><KeyRound /> Use another account</button>}</form></AuthFrame>;
}

function TwoFactor() {
  const router = useRouter(); const [code, setCode] = useState(""); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setPending(true); setError(""); try { await authApi.completeTwoFactor(code.replace(/\s/g, "")); invalidateLive("admin:"); router.replace("/platform-admin"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Verification failed."); } finally { setPending(false); } }
  return <AuthFrame eyebrow="Second factor" title="Verify it is you" description="Complete the pending OAuth session with an authenticator or recovery code."><div className="admin-auth__security-icon"><LockKeyhole /></div><form className="admin-auth__form" onSubmit={submit}><label>Authentication or recovery code<input autoComplete="one-time-code" className="admin-auth__code" onChange={(event) => setCode(event.target.value)} required value={code} /></label>{error && <AdminNotice tone="danger">{error}</AdminNotice>}<AdminButton disabled={pending} type="submit">{pending ? "Verifying…" : "Verify and open admin"}</AdminButton></form><Link className="admin-auth__switch" href="/platform-admin/login"><KeyRound /> Use email and password</Link></AuthFrame>;
}

function MessageState({ expired }: { expired?: boolean }) { return <AuthFrame eyebrow={expired ? "Session ended" : "Restricted view"} title={expired ? "Your admin session expired" : "You do not have access"} description={expired ? "For security, administrator sessions end after inactivity or revocation." : "Your current platform role does not include the permission required for this screen."}><div className="admin-auth__security-icon"><ShieldCheck /></div><AdminNotice tone={expired ? "warning" : "danger"} title={expired ? "Sign in again" : "Least-privilege access"}>{expired ? "Complete authentication to resume administration." : "Ask a Platform Owner to review your assigned role if you believe this is incorrect."}</AdminNotice><div className="admin-auth__actions"><Link className="admin-button admin-button--primary admin-button--normal" href="/platform-admin/login">Sign in securely</Link><Link className="admin-button admin-button--secondary admin-button--normal" href="/platform-admin">Admin overview</Link></div></AuthFrame>; }

export function AdminAuth({ screen }: { screen: "login" | "two-factor" | "session-expired" | "access-denied" }) { if (screen === "login") return <Login />; if (screen === "two-factor") return <TwoFactor />; return <MessageState expired={screen === "session-expired"} />; }
