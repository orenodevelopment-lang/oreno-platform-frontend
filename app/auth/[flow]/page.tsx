import { AuthJourney } from "@/components/product/PublicProduct";
export default async function AuthFlowPage({ params }: { params: Promise<{ flow: string }> }) { const { flow } = await params; return <AuthJourney flow={flow} />; }

