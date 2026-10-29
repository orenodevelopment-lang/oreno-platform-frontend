import { TalentApp } from "@/components/platform/TalentApp";
import { TalentSessionGate } from "@/components/TalentSessionGate";

export default async function TalentPage({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  return <TalentSessionGate><TalentApp segments={screen} /></TalentSessionGate>;
}

