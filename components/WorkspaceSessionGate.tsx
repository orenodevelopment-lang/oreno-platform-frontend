"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceSession } from "./WorkspaceSessionProvider";
import { PlatformShell } from "./platform/PlatformShell";
import { ApiClientError } from "@/lib/api/client";
export function WorkspaceSkeleton() {
  return (
    <section
      className="workspace-skeleton"
      role="status"
      aria-label="Loading workspace"
    >
      <span />
      <span />
      <span />
    </section>
  );
}
export function WorkspaceSessionGate({
  kind,
  children,
}: {
  kind: "company" | "talent";
  children: ReactNode;
}) {
  const { session, error, refresh } = useWorkspaceSession();
  const router = useRouter();
  const pathname = usePathname();
  const valid =
    session?.user.status === "ACTIVE" &&
    session.context.mfaSatisfied &&
    (kind === "talent"
      ? session.user.registrationIntent === "TALENT"
      : Boolean(
          session.context.organisationId &&
          session.context.organisationRole &&
          session.context.organisationRole !== "TALENT",
        ));
  useEffect(() => {
    void refresh();
    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(onFocus, 60_000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);
  useEffect(() => {
    const login = kind === "company" ? "/company/login" : "/auth/talent-login";
    if (error instanceof ApiClientError && error.status === 401)
      router.replace(login + "?next=" + encodeURIComponent(pathname));
    else if (session && !valid)
      router.replace(
        !session.context.mfaSatisfied
          ? login + "?step=two-factor"
          : session.user.status === "PENDING_VERIFICATION"
            ? "/auth/verify-email"
            : "/unauthorised",
      );
  }, [session, valid, error, kind, pathname, router]);
  if (valid)
    return (
      <>
        {error && (
          <p role="status">
            Connection interrupted. Your workspace will refresh when you
            reconnect.
          </p>
        )}
        {children}
      </>
    );
  return (
    <PlatformShell kind={kind} title="Workspace">
      {error && !(error instanceof ApiClientError && error.status === 401) ? (
        <div role="alert">
          <p>{error.message}</p>
          <button type="button" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      ) : (
        <WorkspaceSkeleton />
      )}
    </PlatformShell>
  );
}
