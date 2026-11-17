import { redirect } from "next/navigation";

export default async function TalentCataloguePage({ params }: { params: Promise<{ profile?: string[] }> }) {
  const { profile = [] } = await params;
  if (profile.length === 1) redirect(`/company/candidates/${encodeURIComponent(profile[0])}`);
  redirect("/company/signup");
}
