"use client";

import { m } from "motion/react";
import type { AsyncState } from "@/lib/platform/contracts";
import { canAccessAdminRoute } from "@/lib/platform-admin/policy";
import { platformAdminService } from "@/lib/platform-admin/service";
import { AdminAuth } from "./AdminAuth";
import { AdminScreens } from "./AdminScreens";
import { AdminShell } from "./AdminShell";

const authScreens = ["login", "two-factor", "session-expired", "access-denied"] as const;
type AuthScreen = (typeof authScreens)[number];

export function PlatformAdminApp({ route, roleSlug, state }: { route: string; roleSlug?: string; state?: AsyncState | null }) {
  if (authScreens.includes(route as AuthScreen)) {
    return <AdminAuth roleSlug={roleSlug} screen={route as AuthScreen} />;
  }

  const session = platformAdminService.getSession(roleSlug);
  if (!session.twoFactorSatisfied) return <AdminAuth roleSlug={roleSlug} screen="two-factor" />;
  if (!canAccessAdminRoute(session.role, route)) return <AdminAuth roleSlug={roleSlug} screen="access-denied" />;

  return (
    <AdminShell roleSlug={roleSlug} route={route} session={session}>
      <m.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <AdminScreens roleSlug={roleSlug} route={route} session={session} state={state} />
      </m.div>
    </AdminShell>
  );
}
