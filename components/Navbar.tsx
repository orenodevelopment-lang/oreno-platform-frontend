"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { navigationLinks } from "@/data/site-content";

type NavbarProps = {
  compact?: boolean;
};

export function Navbar({ compact = false }: NavbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <nav className={`navbar ${compact ? "navbar--compact" : ""}`} aria-label="Primary navigation">
      <div className="navbar__inner">
        <Link href="#top" aria-label="Oreno home" className="navbar__brand">
          <Logo />
        </Link>
        {!compact ? (
          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            <span className="sr-only">{open ? "Close navigation" : "Open navigation"}</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        ) : null}
        <div
          id={!compact ? "mobile-navigation" : undefined}
          className={`navbar__links ${open ? "navbar__links--open" : ""}`}
        >
          {navigationLinks.map((link) => {
            const featured = "featured" in link && link.featured;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`navbar__link ${featured ? "navbar__link--featured" : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
                {featured ? <span className="navbar__link-arrow" aria-hidden="true">→</span> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
