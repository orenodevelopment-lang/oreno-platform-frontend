import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspaceAmbient } from "@/components/motion/WorkspaceAmbient";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-product-shell">
      <header className="public-product-nav">
        <Link className="public-product-brand" href="/"><Image src="/assets/figma/oreno-mark.svg" alt="" width={42} height={42} /><span>reno</span></Link>
        <nav aria-label="Public navigation"><Link href="/talent-catalogue">Find talent</Link><Link href="/jobs">Find work</Link><Link href="/contact">Contact</Link></nav>
        <Link className="public-product-cta" href="/request-demo">Request a demo</Link>
      </header>
      <main><WorkspaceAmbient tone="public" />{children}</main>
      <footer className="public-product-footer"><Link className="public-product-brand" href="/"><Image src="/assets/figma/oreno-mark.svg" alt="" width={38} height={38} /><span>reno</span></Link><p>Carefully vetted African talent for teams building meaningful products.</p><nav><Link href="/talent-catalogue">Talent</Link><Link href="/jobs">Jobs</Link><Link href="/contact">Contact</Link><Link href="/newsletter/unsubscribe">Email preferences</Link></nav></footer>
    </div>
  );
}
