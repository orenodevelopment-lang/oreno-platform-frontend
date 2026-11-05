import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";
export default function Layout({ children }: { children: ReactNode }) {
  return <WorkspaceLayout kind="company">{children}</WorkspaceLayout>;
}
