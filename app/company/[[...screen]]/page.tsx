import { CompanyApp } from "@/components/platform/CompanyApp";
import { CompanySessionGate } from "@/components/CompanySessionGate";
import { Suspense } from "react";

export default async function CompanyPage({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  if (screen[0] === "login" || screen[0] === "signup") return <CompanyApp segments={screen} />;
  return <Suspense fallback={<main className="auth-session-loading">Loading your Oreno workspace…</main>}><CompanySessionGate><CompanyApp segments={screen} /></CompanySessionGate></Suspense>;
}

