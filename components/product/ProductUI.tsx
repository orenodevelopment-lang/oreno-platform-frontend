"use client";

import Link from "next/link";
import { AlertTriangle, Archive, CheckCircle2, CircleSlash2, LoaderCircle, RefreshCw, SearchX, ShieldAlert, X } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import type { AsyncState } from "@/lib/platform/contracts";
import { motionDistance, motionDurations, motionEasings, motionStagger } from "@/lib/motion/tokens";

export function ProductPage({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="product-page">
      <m.header className="product-page__header" initial={{ opacity: 0, y: motionDistance.medium }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionDurations.reveal, ease: motionEasings.standard }}>
        <div>{eyebrow && <span className="product-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
        {actions && <div className="product-page__actions">{actions}</div>}
      </m.header>
      {children}
    </section>
  );
}

const stateCopy: Record<AsyncState, { title: string; body: string; icon: typeof AlertTriangle }> = {
  loading: { title: "Loading this view", body: "The latest information is being retrieved.", icon: LoaderCircle },
  empty: { title: "Nothing here yet", body: "New records will appear here when they are created.", icon: CircleSlash2 },
  "no-results": { title: "No matching results", body: "Try removing a filter or using a broader search.", icon: SearchX },
  error: { title: "We could not load this view", body: "The request failed safely. Try again or return later.", icon: AlertTriangle },
  denied: { title: "You do not have access", body: "Ask an organisation owner if you believe you need this information.", icon: ShieldAlert },
  archived: { title: "This record is archived", body: "It is available for history but cannot be changed.", icon: Archive },
  success: { title: "Action completed", body: "Your change has been saved in this local product demo.", icon: CheckCircle2 },
};

export function DataStateBoundary({ children, empty = false, noResults = false, state: stateOverride }: { children: ReactNode; empty?: boolean; noResults?: boolean; state?: AsyncState | null }) {
  const queryState = useSyncExternalStore(
    () => () => undefined,
    () => {
      const raw = new URLSearchParams(window.location.search).get("state") as AsyncState | null;
      return raw && Object.hasOwn(stateCopy, raw) ? raw : null;
    },
    () => null,
  );
  const state = stateOverride ?? queryState ?? (noResults ? "no-results" : empty ? "empty" : null);
  if (!state) return children;
  const copy = stateCopy[state];
  const Icon = copy.icon;
  return (
    <m.div className={`product-state product-state--${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite" initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: motionDurations.feedback }}>
      <Icon aria-hidden="true" className={state === "loading" ? "is-spinning" : ""} />
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
      {state === "loading" && <span className="motion-skeleton" aria-hidden="true"><i /><i /><i /></span>}
      {state === "error" && <button type="button" onClick={() => window.location.reload()}><RefreshCw /> Retry</button>}
    </m.div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  return <AnimatePresence initial={false} mode="popLayout"><m.span key={normalized} className={`product-status product-status--${normalized}`} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: motionDurations.feedback }}><i aria-hidden="true" />{status}</m.span></AnimatePresence>;
}

export function Timeline({ items }: { items: Array<{ label: string; date: string; detail?: string; complete?: boolean }> }) {
  return <m.ol className="product-timeline" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: motionStagger.standard } } }}>{items.map((item) => <m.li className={item.complete ? "is-complete" : ""} variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} key={`${item.label}-${item.date}`}><i aria-hidden="true"><CheckCircle2 /></i><div><strong>{item.label}</strong><time>{item.date}</time>{item.detail && <p>{item.detail}</p>}</div></m.li>)}</m.ol>;
}

export function ConfirmDialog({ open, title, description, confirmLabel, tone = "danger", onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; tone?: "danger" | "positive"; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && <m.div className="product-dialog-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <m.section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: motionDurations.drawer, ease: motionEasings.standard }}>
        <button className="product-dialog__close" type="button" aria-label="Close" onClick={onCancel}><X /></button>
        <AlertTriangle aria-hidden="true" />
        <h2 id="product-dialog-title">{title}</h2>
        <p>{description}</p>
        <footer><button type="button" onClick={onCancel}>Cancel</button><button className={`is-${tone}`} type="button" onClick={onConfirm}>{confirmLabel}</button></footer>
      </m.section>
    </m.div>}
    </AnimatePresence>
  );
}

export function ProductTabs({ items, active }: { items: Array<{ href: string; label: string; key: string }>; active: string }) {
  return <nav className="product-tabs" aria-label="Section navigation">{items.map((item) => <Link className={item.key === active ? "is-active" : ""} href={item.href} key={item.key}>{item.label}{item.key === active && <m.span className="product-tabs__indicator" layoutId="product-tab-indicator" />}</Link>)}</nav>;
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return <span className="field-error" id={id} role="alert">{children}</span>;
}
