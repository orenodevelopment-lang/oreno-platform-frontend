"use client";

import { useEffect } from "react";
import { useWorkspaceSession } from "@/components/WorkspaceSessionProvider";
import { WorkspaceSkeleton } from "@/components/WorkspaceSessionGate";
import { roleName } from "@/lib/platform-admin/service";
import { permissionsForRole } from "@/lib/platform-admin/policy";
import { m } from "motion/react";
import type { AsyncState } from "@/lib/platform/contracts";
import { canAccessAdminRoute } from "@/lib/platform-admin/policy";
import { useApiRevision } from "@/lib/api/live-store";
import { AdminAuth } from "./AdminAuth";
import { AdminScreens } from "./AdminScreens";
import { AdminShell } from "./AdminShell";
import { AdminStateBoundary } from "./AdminUI";

const authScreens = ["login", "two-factor", "session-expired", "access-denied"] as const;
type AuthScreen = (typeof authScreens)[number];

export function PlatformAdminApp({ route, roleSlug, state }: { route: string; roleSlug?: string; state?: AsyncState | null }) {
  useApiRevision();
  const workspace=useWorkspaceSession();
  const {refresh}=workspace;
  const authRoute=authScreens.includes(route as AuthScreen);
  useEffect(()=>{if(authRoute)return;void refresh();const timer=setInterval(()=>void refresh(),60000);return()=>clearInterval(timer);},[authRoute,refresh]);
  if (authScreens.includes(route as AuthScreen)) return <AdminAuth screen={route as AuthScreen} />;

  const current=workspace.session;
  const role=roleName(current?.context.platformRoles[0]);
  const name=current?.user.displayName || [current?.user.firstName,current?.user.lastName].filter(Boolean).join(" ");
  const session=current?.context.isPlatformAdmin ? {id:current.user.id,name,initials:name.slice(0,2).toUpperCase(),email:current.user.email,role,permissions:permissionsForRole(role),twoFactorSatisfied:current.context.mfaSatisfied,expiresAt:current.context.sessionExpiresAt??""} : null;
  const error=workspace.error as {code?:string;status?:number}|undefined;
  if(current && !current.context.isPlatformAdmin)return <AdminAuth screen="access-denied" />;
  if (!session) {
    if (error?.code === "TWO_FACTOR_REQUIRED") return <AdminAuth screen="two-factor" />;
    if (error?.status === 401) return <AdminAuth screen="session-expired" />;
    if (error) return <AdminStateBoundary state="error"><span /></AdminStateBoundary>;
    return <WorkspaceSkeleton />;
  }
  if (!session.twoFactorSatisfied) return <AdminAuth screen="two-factor" />;
  if (!canAccessAdminRoute(session.role, route)) return <AdminAuth screen="access-denied" />;

  return (
    <AdminShell route={route} session={session}>
      <m.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <AdminScreens roleSlug={roleSlug} route={route} session={session} state={state} />
      </m.div>
    </AdminShell>
  );
}
