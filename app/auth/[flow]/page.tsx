import { AuthJourney } from "@/components/product/PublicProduct";
type AuthQuery = { token?: string | string[]; next?: string | string[]; step?: string | string[]; created?: string | string[]; oauth?: string | string[]; oauthProvider?: string | string[]; oauthReason?: string | string[] };
const first = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
export default async function AuthFlowPage({ params, searchParams }: { params: Promise<{ flow: string }>; searchParams: Promise<AuthQuery> }) { const [{ flow }, query] = await Promise.all([params, searchParams]); const token = first(query.token); const next = first(query.next); const step = first(query.step); const created = first(query.created) === "true"; return <AuthJourney flow={flow} initialToken={token} initialNext={next} initialStep={step} oauthCreated={created} oauthStatus={first(query.oauth)} oauthProvider={first(query.oauthProvider)} oauthReason={first(query.oauthReason)} />; }

