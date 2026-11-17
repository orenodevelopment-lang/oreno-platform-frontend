"use client";
import { TermsConsent } from "@/components/auth/TermsConsent";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "./AuthFrame";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";

export function CompanyOAuthCallback({
  pending = false,
  status,
  reason,
  provider,
  step,
}: {
  pending?: boolean;
  status?: string;
  reason?: string;
  provider?: string;
  step?: string;
}) {
  const router = useRouter();
  const [details, setDetails] =
    useState<Awaited<ReturnType<typeof authApi.companyRegistration>>>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [needsCode, setNeedsCode] = useState(step === "two-factor");
  const [missing, setMissing] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (status === "failed" || needsCode) return;
    if (pending)
      void authApi
        .companyRegistration()
        .then((v) => {
          if (active) setDetails(v);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    else
      void authApi
        .current()
        .then(({ context }) => {
          if (!active) return;
          if (!context.mfaSatisfied) {
            setNeedsCode(true);
            return;
          }
          if (
            !context.organisationId ||
            !context.organisationRole ||
            context.organisationRole === "TALENT"
          ) {
            setMissing(true);
            return;
          }
          sessionStorage.removeItem("oreno:oauth-next");
          window.dispatchEvent(new Event("oreno:auth-changed"));
          router.replace("/company");
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [pending, status, needsCode, revision, router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(event.currentTarget);
    try {
      if (pending && details) {
        const result = await authApi.completeCompanyRegistration(
          {
            firstName: String(f.get("firstName") ?? ""),
            lastName: String(f.get("lastName") ?? ""),
            organisationName: String(f.get("organisationName") ?? ""),
            acceptTerms: true,
            twoFactorCode: String(f.get("twoFactorCode") ?? "") || undefined,
          },
          details.csrfToken,
        );
        sessionStorage.removeItem("oreno:oauth-next");
        router.replace(result.next);
      } else if (needsCode) {
        await authApi.completeTwoFactor(String(f.get("twoFactorCode") ?? ""));
        setNeedsCode(false);
      }
    } catch (e) {
      if (e instanceof ApiClientError && e.code === "TWO_FACTOR_REQUIRED")
        setDetails((v) => (v ? { ...v, requiresTwoFactor: true } : v));
      setError(e instanceof Error ? e.message : "We could not finish signup.");
    } finally {
      setBusy(false);
    }
  }
  const maySignup =
    missing ||
    reason === "account_not_found" ||
    reason === "company_account_required";
  const failed = status === "failed" || missing;
  const title = pending
    ? "Your company details"
    : needsCode
      ? "Verify your sign-in"
      : maySignup
        ? "Create your company account"
        : reason === "company_account_exists"
          ? "Your company account already exists"
          : failed
            ? "Company sign-in unavailable"
            : "Opening your company workspace";
  const name = provider === "linkedin" ? "LinkedIn" : "Google";
  async function signup() {
    if (!consent || !["google", "linkedin"].includes(provider ?? "")) return;
    setBusy(true);
    setError("");
    try {
      await authApi.oauthStart(provider as "google" | "linkedin", {
        mode: "company_signup",
        audience: "company",
        acceptTerms: true,
        next: "/company/onboarding/personal",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <AuthFrame
      signup={pending}
      title={title}
      subtitle={
        pending
          ? "Finish setting up your workspace"
          : maySignup
            ? "No company workspace is linked to this sign-in."
            : failed
              ? "Choose the next step below."
              : "Your secure Oreno session"
      }
    >
      {pending && details ? (
        <form onSubmit={submit}>
          <p>Verified email: {details.email}</p>
          <label>
            First name
            <input
              name="firstName"
              required
              maxLength={120}
              autoComplete="given-name"
            />
          </label>
          <label>
            Last name
            <input
              name="lastName"
              required
              maxLength={120}
              autoComplete="family-name"
            />
          </label>
          <label>
            Company name
            <input
              name="organisationName"
              required
              minLength={2}
              maxLength={200}
              autoComplete="organization"
            />
          </label>
          {details.requiresTwoFactor && (
            <label>
              Two-factor code
              <input
                name="twoFactorCode"
                required
                autoComplete="one-time-code"
              />
            </label>
          )}
          <TermsConsent required />
          <button className="auth-submit" disabled={busy}>
            {busy ? "Creating workspace…" : "Create company account"}
          </button>
        </form>
      ) : needsCode ? (
        <form onSubmit={submit}>
          <label>
            Two-factor code
            <input name="twoFactorCode" required autoComplete="one-time-code" />
          </label>
          <button className="auth-submit" disabled={busy}>
            Verify and continue
          </button>
        </form>
      ) : failed ? (
        <div className="company-oauth-result">
          {maySignup ? (
            <>
              <p>
                You can create a company workspace explicitly. If you already
                have a talent account, its profile and applications will be
                preserved.
              </p>
              {["google", "linkedin"].includes(provider ?? "") ? (
                <>
                  <TermsConsent checked={consent} onChange={setConsent} />
                  <button
                    className="auth-submit"
                    disabled={busy || !consent}
                    onClick={() => void signup()}
                  >
                    Create company account with {name}
                  </button>
                </>
              ) : (
                <Link href="/company/signup">Create a company account</Link>
              )}
            </>
          ) : (
            <p>
              {reason === "company_access_unavailable"
                ? "Your workspace access is unavailable. Contact your company administrator or Oreno support."
                : reason === "company_account_exists"
                  ? "Use company sign-in to open your existing workspace."
                  : "This sign-in could not be completed. Start again from Oreno."}
            </p>
          )}
          <p>
            <Link href="/company/login">Return to company sign in</Link>
          </p>
          <Link href="/auth/talent-login">Go to talent login</Link>
        </div>
      ) : !error ? (
        <p role="status">
          {pending ? "Loading verified signup…" : "Opening workspace…"}
        </p>
      ) : null}
      {error && (
        <div role="alert">
          <p>{error}</p>
          {!details && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setRevision((v) => v + 1);
              }}
            >
              Retry
            </button>
          )}
          <p>
            <Link href="/company/signup">Restart company signup</Link>
          </p>
        </div>
      )}
    </AuthFrame>
  );
}
