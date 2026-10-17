"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { navigationLinks } from "@/data/site-content";
import { m, useReducedMotion } from "motion/react";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

type NavbarProps = {
  fixed?: boolean;
};

export function Navbar({ fixed = false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  useEffect(() => {
    if (!fixed) return;

    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [fixed]);

  return (
    <m.nav
      className={`navbar ${fixed ? "navbar--fixed" : ""} ${scrolled ? "is-scrolled" : ""}`.trim()}
      aria-label="Primary navigation"
      initial={fixed && !reduce ? { opacity: 0, y: -18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: marketingMotion.reveal, ease: motionEasings.emphasized }}
    >
      <div className="navbar__inner">
        <Link href="/" aria-label="Oreno home" className="navbar__brand">
          <Logo />
        </Link>
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
        <div
          id="mobile-navigation"
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
    </m.nav>
  );
}
