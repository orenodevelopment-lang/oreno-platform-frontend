"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";

export function CompanySessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    invalidateLive();
    authApi.current()
      .then(({ user, context }) => {
        if (!active) return;
        if (!context.mfaSatisfied) {
          router.replace(`/company/login?step=two-factor&next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (user.status !== "ACTIVE") {
          router.replace(user.status === "PENDING_VERIFICATION" ? "/auth/verify-email" : "/unauthorised");
          return;
        }
        if (!context.organisationId || !context.organisationRole || context.organisationRole === "TALENT") {
          router.replace(user.registrationIntent === "TALENT" ? "/talent" : "/unauthorised");
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        const query = searchParams.toString();
        const next = `${pathname}${query ? `?${query}` : ""}`;
        router.replace(`/company/login?next=${encodeURIComponent(next)}`);
      });
    return () => { active = false; };
  }, [pathname, router, searchParams]);

  if (!ready) return <main className="auth-session-loading" role="status" aria-live="polite">Checking your Oreno company workspace…</main>;
  return children;
}
