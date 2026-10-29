"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";

let authorised = false;
let sessionRequest: ReturnType<typeof authApi.current> | undefined;

function resolveSession() {
  sessionRequest ??= authApi.current().catch((error) => {
    sessionRequest = undefined;
    throw error;
  });
  return sessionRequest;
}

export function CompanySessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextRef = useRef(`${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`);
  const [ready, setReady] = useState(authorised);

  useEffect(() => {
    let active = true;
    if (!authorised) invalidateLive();
    resolveSession()
      .then(({ user, context }) => {
        if (!active) return;
        if (!context.mfaSatisfied) {
          router.replace(`/company/login?step=two-factor&next=${encodeURIComponent(nextRef.current)}`);
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
        authorised = true;
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        authorised = false;
        router.replace(`/company/login?next=${encodeURIComponent(nextRef.current)}`);
      });
    return () => { active = false; };
  }, [router]);

  return <div className="workspace-session" data-session-ready={ready ? "true" : "false"}>{children}{!ready && <div className="workspace-session__progress" role="status" aria-live="polite"><span aria-hidden="true" />Verifying your workspace…</div>}</div>;
}
