import { AuthJourney } from "@/components/product/PublicProduct";
export default async function InvitationAcceptancePage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) { const query = await searchParams; const token = Array.isArray(query.token) ? query.token[0] : query.token; return <AuthJourney flow="accept-invitation" initialToken={token} />; }

