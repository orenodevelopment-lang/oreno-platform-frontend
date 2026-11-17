import { redirect } from "next/navigation";
import { CompanyApp } from "@/components/platform/CompanyApp";

export default async function Page({ params }: { params: Promise<{ screen?: string[] }> }) {
  const { screen = [] } = await params;
  if (["discover", "talents"].includes(screen[0] ?? "")) redirect("/company/applications");
  return <CompanyApp segments={screen} />;
}
