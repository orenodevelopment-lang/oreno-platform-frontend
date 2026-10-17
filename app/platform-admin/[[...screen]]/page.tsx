import type { Metadata } from "next";
import type { AsyncState } from "@/lib/platform/contracts";
import { PlatformAdminApp } from "@/components/platform-admin/PlatformAdminApp";

export const metadata: Metadata = {
  title: "Platform administration · Oreno",
  description: "Secure operations workspace for authorised Oreno administrators.",
  robots: { index: false, follow: false },
};

const validStates = new Set<AsyncState>(["loading", "empty", "no-results", "error", "denied", "archived", "success"]);

export default async function PlatformAdminPage({ params, searchParams }: { params: Promise<{ screen?: string[] }>; searchParams: Promise<{ role?: string; state?: string }> }) {
  const [{ screen }, query] = await Promise.all([params, searchParams]);
  const route = screen?.join("/") ?? "";
  const state = query.state && validStates.has(query.state as AsyncState) ? query.state as AsyncState : null;
  return <PlatformAdminApp roleSlug={query.role} route={route} state={state} />;
}
