"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";

export function TalentSessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    authApi.current()
      .then(({ user, context }) => {
        if (!active) return;
        if (!context.mfaSatisfied) {
          router.replace("/auth/talent-login?step=two-factor");
          return;
        }
        if (user.registrationIntent !== "TALENT") {
          router.replace(context.organisationId ? "/company" : "/");
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        const query = searchParams.toString();
        const next = `${pathname}${query ? `?${query}` : ""}`;
        router.replace(`/auth/talent-login?next=${encodeURIComponent(next)}`);
      });
    return () => { active = false; };
  }, [pathname, router, searchParams]);

  if (!ready) {
    return <main className="auth-session-loading" role="status" aria-live="polite">Checking your Oreno account…</main>;
  }
  return children;
}
