import { NewsletterState } from "@/components/product/PublicProduct";
export default async function NewsletterPage({ params, searchParams }: { params: Promise<{ state: string }>; searchParams: Promise<{ token?: string | string[] }> }) { const [{ state }, query] = await Promise.all([params, searchParams]); const token = Array.isArray(query.token) ? query.token[0] : query.token; return <NewsletterState mode={state === "unsubscribe" ? "unsubscribe" : "confirm"} token={token ?? ""} />; }

