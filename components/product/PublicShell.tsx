import Link from "next/link";
import type { ReactNode } from "react";
import { HiringMenu } from "@/components/HiringMenu";
import { WorkspaceAmbient } from "@/components/motion/WorkspaceAmbient";
import { Logo } from "@/components/Logo";

export function PublicShell({ children, accountAudience="company" }: { children: ReactNode; accountAudience?: "company" | "talent" }) {
  return (
    <div className="public-product-shell">
      <header className="public-product-nav">
        <Link className="public-product-brand" href="/" aria-label="Oreno home"><Logo /></Link>
        <nav aria-label="Public navigation"><Link href="/jobs">Find jobs</Link></nav>
        <HiringMenu variant="public" audience={accountAudience} />
      </header>
      <main><WorkspaceAmbient tone="public" />{children}</main>
      <footer className="public-product-footer"><Link className="public-product-brand" href="/" aria-label="Oreno home"><Logo dark /></Link><p>Carefully vetted African talent for teams building meaningful products.</p><nav><Link href="/auth/talent-signup">Join as talent</Link><Link href="/auth/talent-login">Talent login</Link><Link href="/jobs">Jobs</Link><Link href="/contact">Contact</Link><Link href="/newsletter/unsubscribe">Email preferences</Link></nav></footer>
    </div>
  );
}
