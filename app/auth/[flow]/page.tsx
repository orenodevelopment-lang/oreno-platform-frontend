import { AuthJourney } from "@/components/product/PublicProduct";
export default async function AuthFlowPage({ params, searchParams }: { params: Promise<{ flow: string }>; searchParams: Promise<{ token?: string | string[] }> }) { const [{ flow }, query] = await Promise.all([params, searchParams]); const token = Array.isArray(query.token) ? query.token[0] : query.token; return <AuthJourney flow={flow} initialToken={token} />; }

