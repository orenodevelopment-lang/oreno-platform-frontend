"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { hiringMenuLinks } from "@/data/site-content";

type HiringMenuProps = {
  variant: "marketing" | "public";
  onNavigate?: () => void;
};

export function HiringMenu({ variant, onNavigate }: HiringMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const triggerClass = variant === "marketing"
    ? "navbar__link navbar__hiring-trigger"
    : "public-product-cta public-product-hiring-trigger";

  return (
    <div ref={rootRef} className={`hiring-menu hiring-menu--${variant} ${variant === "marketing" ? "navbar__hiring-menu" : "public-product-hiring-menu"} ${open ? "is-open" : ""}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        className={`${triggerClass} hiring-menu__trigger`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        Start hiring
        <span className="hiring-menu__chevron" aria-hidden="true" />
      </button>
      <div id={menuId} className="hiring-menu__panel" hidden={!open}>
        {hiringMenuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hiring-menu__link"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            <strong>{link.label}</strong>
            <span>{link.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
