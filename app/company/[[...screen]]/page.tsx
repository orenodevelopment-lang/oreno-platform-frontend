import { CompanyApp } from "@/components/platform/CompanyApp";
import { CompanySessionGate } from "@/components/CompanySessionGate";

export default async function CompanyPage({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  if (screen[0] === "login" || screen[0] === "signup") return <CompanyApp segments={screen} />;
  return <CompanySessionGate><CompanyApp segments={screen} /></CompanySessionGate>;
}

