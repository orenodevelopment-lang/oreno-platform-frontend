"use client";

import { m } from "motion/react";
import type { AsyncState } from "@/lib/platform/contracts";
import { canAccessAdminRoute } from "@/lib/platform-admin/policy";
import { platformAdminService } from "@/lib/platform-admin/service";
import { liveError, livePending, useApiRevision } from "@/lib/api/live-store";
import { AdminAuth } from "./AdminAuth";
import { AdminScreens } from "./AdminScreens";
import { AdminShell } from "./AdminShell";
import { AdminStateBoundary } from "./AdminUI";

const authScreens = ["login", "two-factor", "session-expired", "access-denied"] as const;
type AuthScreen = (typeof authScreens)[number];

export function PlatformAdminApp({ route, roleSlug, state }: { route: string; roleSlug?: string; state?: AsyncState | null }) {
  useApiRevision();
  if (authScreens.includes(route as AuthScreen)) return <AdminAuth screen={route as AuthScreen} />;

  const session = platformAdminService.getSession();
  const error = liveError("admin:session") as { code?: string; status?: number } | undefined;
  if (!session) {
    if (error?.code === "TWO_FACTOR_REQUIRED") return <AdminAuth screen="two-factor" />;
    if (error?.status === 401) return <AdminAuth screen="session-expired" />;
    if (error) return <AdminStateBoundary state="error"><span /></AdminStateBoundary>;
    return <AdminStateBoundary state={livePending("admin:session") ? "loading" : "loading"}><span /></AdminStateBoundary>;
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
