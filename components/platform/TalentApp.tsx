"use client";

import { useApiRevision } from "@/lib/api/live-store";
import { TalentProductScreen, talentProductTitles } from "@/components/product/TalentProductScreens";
import { PlatformShell } from "./PlatformShell";
import { MessagesView } from "./MessagingWorkspace";

export function TalentApp({ segments }: { segments: string[] }) {
  useApiRevision();
  const requestedRoute = segments.join("/");
  const route = requestedRoute === "settings" ? "account" : requestedRoute === "team" ? "team/current" : requestedRoute === "apply" ? "jobs" : requestedRoute;
  const rootRoute = route.split("/")[0] ?? "";
  const title = talentProductTitles[route] ?? talentProductTitles[rootRoute] ?? (route.startsWith("jobs/") ? "Job detail" : route.startsWith("applications/") ? "Application detail" : route.startsWith("interviews/") ? "Interview" : route.startsWith("offers/") ? "Offer review" : route.startsWith("tasks/") ? "Task" : route === "messages" ? "Messages" : "Dashboard");
  return <PlatformShell kind="talent" title={title}>{route === "messages" ? <MessagesView /> : <TalentProductScreen route={route} />}</PlatformShell>;
}
