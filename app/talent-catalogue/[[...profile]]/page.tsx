import { PublicTalentCatalogue } from "@/components/product/PublicProduct";

export default async function TalentCataloguePage({ params }: { params: Promise<{ profile?: string[] }> }) {
  const { profile = [] } = await params;
  return <PublicTalentCatalogue profileId={profile[0]} />;
}

