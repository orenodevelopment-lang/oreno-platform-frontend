import { PublicJobs } from "@/components/product/PublicProduct";

export default async function PublicJobsPage({ params }: { params: Promise<{ job?: string[] }> }) {
  const { job = [] } = await params;
  return <PublicJobs jobId={job[0]} />;
}

