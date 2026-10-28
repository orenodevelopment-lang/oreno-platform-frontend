"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { hiringMenuLinks } from "@/data/site-content";

type HiringMenuProps = {
  variant: "marketing" | "public";
  onNavigate?: () => void;
};

const IDLE_ROTATION_MS = 2600;
const HOVER_CLOSE_DELAY_MS = 180;

export function HiringMenu({ variant, onNavigate }: HiringMenuProps) {
  const [open, setOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const menuId = useId();
  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerTypeRef = useRef<string | null>(null);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [cancelScheduledClose]);

  useEffect(() => () => cancelScheduledClose(), [cancelScheduledClose]);

  useEffect(() => {
    if (open || reduceMotion) return;

    const rotation = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % hiringMenuLinks.length);
    }, IDLE_ROTATION_MS);

    return () => window.clearInterval(rotation);
  }, [open, reduceMotion]);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      cancelScheduledClose();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cancelScheduledClose, open]);

  const triggerClass = variant === "marketing"
    ? "navbar__link navbar__hiring-trigger"
    : "public-product-cta public-product-hiring-trigger";
  const previewLink = hiringMenuLinks[open || reduceMotion ? 0 : previewIndex] ?? hiringMenuLinks[0];
  const labelMotion = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.24, ease: "easeOut" as const };
  const panelMotion = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: "easeOut" as const };

  return (
    <div
      ref={rootRef}
      className={`hiring-menu hiring-menu--${variant} ${variant === "marketing" ? "navbar__hiring-menu" : "public-product-hiring-menu"} ${open ? "is-open" : "is-idle"}`.trim()}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        cancelScheduledClose();
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") scheduleClose();
      }}
      onFocusCapture={() => {
        if (lastPointerTypeRef.current) return;
        cancelScheduledClose();
        setOpen(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${triggerClass} hiring-menu__trigger`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label="Open hiring and account menu"
        onPointerDown={(event) => {
          lastPointerTypeRef.current = event.pointerType;
        }}
        onClick={() => {
          cancelScheduledClose();
          if (lastPointerTypeRef.current === "mouse") setOpen(true);
          else setOpen((current) => !current);
          lastPointerTypeRef.current = null;
        }}
      >
        <span className="hiring-menu__trigger-glow" aria-hidden="true" />
        <span className="hiring-menu__trigger-label" aria-hidden="true">
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={previewLink.label}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={labelMotion}
            >
              {previewLink.label}
            </m.span>
          </AnimatePresence>
        </span>
        <span className="hiring-menu__chevron" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            id={menuId}
            className="hiring-menu__panel"
            role="menu"
            aria-label="Hiring and account options"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.96, rotateX: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -7, scale: 0.975 }}
            transition={panelMotion}
            style={{ transformOrigin: "top right" }}
          >
            <div className="hiring-menu__eyebrow" aria-hidden="true">
              <span />
              Oreno pathways
            </div>
            {hiringMenuLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="hiring-menu__link"
                role="menuitem"
                onClick={() => {
                  cancelScheduledClose();
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                <span className="hiring-menu__link-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="hiring-menu__link-copy">
                  <strong>{link.label}</strong>
                  <span>{link.description}</span>
                </span>
                <span className="hiring-menu__link-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
