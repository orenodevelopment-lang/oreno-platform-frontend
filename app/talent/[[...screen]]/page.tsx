import { TalentApp } from "@/components/platform/TalentApp";

export default async function TalentPage({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  return <TalentApp segments={screen} />;
}

