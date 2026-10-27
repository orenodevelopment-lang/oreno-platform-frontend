import { TalentApp } from "@/components/platform/TalentApp";
import { TalentSessionGate } from "@/components/TalentSessionGate";
import { Suspense } from "react";

export default async function TalentPage({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  return <Suspense fallback={<main className="auth-session-loading">Loading your Oreno workspace…</main>}><TalentSessionGate><TalentApp segments={screen} /></TalentSessionGate></Suspense>;
}

