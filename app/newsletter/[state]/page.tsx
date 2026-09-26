import { NewsletterState } from "@/components/product/PublicProduct";
export default async function NewsletterPage({ params }: { params: Promise<{ state: string }> }) { const { state } = await params; return <NewsletterState mode={state === "unsubscribe" ? "unsubscribe" : "confirmed"} />; }

