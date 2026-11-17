"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PlatformShell, workspaceTitle } from "./platform/PlatformShell";
import { WorkspaceSessionGate } from "./WorkspaceSessionGate";
export function WorkspaceLayout({
  kind,
  children,
}: {
  kind: "company" | "talent";
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (
    kind === "company" &&
    ["/company/login", "/company/signup"].includes(pathname)
  )
    return <>{children}</>;
  if (kind === "company" && pathname.startsWith("/company/onboarding"))
    return <WorkspaceSessionGate kind={kind}>{children}</WorkspaceSessionGate>;
  return (
    <PlatformShell
      kind={kind}
      title={workspaceTitle(kind, pathname)}
      actionLabel={kind === "company" ? "Create job" : undefined}
    >
      <WorkspaceSessionGate kind={kind}>{children}</WorkspaceSessionGate>
    </PlatformShell>
  );
}
