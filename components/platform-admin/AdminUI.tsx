"use client";

import { AlertTriangle, CheckCircle2, CircleSlash2, LoaderCircle, Search, SearchX, ShieldAlert, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { AsyncState } from "@/lib/platform/contracts";
import { motionDurations, motionEasings, motionStagger } from "@/lib/motion/tokens";
import { validateAdminActionReason } from "@/lib/platform-admin/policy";

export function AdminStatus({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <span className={`admin-status admin-status--${slug}`}><i aria-hidden="true" />{status}</span>;
}

export function AdminCard({ title, description, actions, children, className = "" }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`admin-card ${className}`}>
      {(title || description || actions) && <header className="admin-card__header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{actions && <div className="admin-card__actions">{actions}</div>}</header>}
      {children}
    </section>
  );
}

export function AdminKpi({ label, value, detail, change, direction, tone = "teal" }: { label: string; value: string; detail: string; change?: string; direction?: "up" | "down"; tone?: string }) {
  return <m.article className={`admin-kpi admin-kpi--${tone}`} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}><span>{label}</span><strong>{value}</strong><p>{detail}</p>{change && <small className={direction === "down" ? "is-down" : "is-up"}>{direction === "down" ? "↓" : "↑"} {change} <i>vs last 30 days</i></small>}</m.article>;
}

export type AdminColumn<T> = { key: string; label: string; render: (row: T) => ReactNode; className?: string };

export function AdminTable<T>({ columns, rows, getRowKey, onRow }: { columns: AdminColumn<T>[]; rows: T[]; getRowKey: (row: T) => string; onRow?: (row: T) => void }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{columns.map((column) => <th className={column.className} key={column.key}>{column.label}</th>)}</tr></thead>
        <m.tbody initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: motionStagger.tight } } }}>
          {rows.map((row) => <m.tr tabIndex={onRow ? 0 : undefined} role={onRow ? "link" : undefined} onClick={() => onRow?.(row)} onKeyDown={(event) => { if (onRow && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRow(row); } }} variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} key={getRowKey(row)}>{columns.map((column) => <td className={column.className} key={column.key}>{column.render(row)}</td>)}</m.tr>)}
        </m.tbody>
      </table>
      {rows.length === 0 && <div className="admin-table-empty"><SearchX /><strong>No matching records</strong><span>Try changing or clearing the active filters.</span></div>}
    </div>
  );
}

export function AdminToolbar({ search, onSearch, children, actions }: { search: string; onSearch: (value: string) => void; children?: ReactNode; actions?: ReactNode }) {
  return <div className="admin-toolbar"><label className="admin-search"><Search aria-hidden="true" /><span className="sr-only">Search</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search records…" /></label>{children}<div className="admin-toolbar__actions">{actions}</div></div>;
}

export function AdminSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="admin-select"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}: All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export function AdminButton({ children, tone = "primary", size = "normal", disabled, onClick, type = "button" }: { children: ReactNode; tone?: "primary" | "secondary" | "danger" | "ghost"; size?: "small" | "normal"; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return <button className={`admin-button admin-button--${tone} admin-button--${size}`} disabled={disabled} onClick={onClick} type={type}>{children}</button>;
}

export function AdminTabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return <div className="admin-tabs" role="tablist">{items.map((item) => <button aria-selected={active === item} className={active === item ? "is-active" : ""} key={item} onClick={() => onChange(item)} role="tab" type="button">{item}</button>)}</div>;
}

const stateCopy: Record<AsyncState, { title: string; body: string; icon: typeof AlertTriangle }> = {
  loading: { title: "Loading administration data", body: "The latest platform records are being retrieved.", icon: LoaderCircle },
  empty: { title: "No records yet", body: "New platform records will appear here when they are created.", icon: CircleSlash2 },
  "no-results": { title: "No matching results", body: "Try removing a filter or broadening your search.", icon: SearchX },
  error: { title: "Administration data unavailable", body: "The request failed safely. Retry or use the request ID when contacting support.", icon: AlertTriangle },
  denied: { title: "Permission denied", body: "Your platform role does not permit this view or action.", icon: ShieldAlert },
  archived: { title: "Archived record", body: "This record is retained for history and cannot be changed.", icon: CircleSlash2 },
  success: { title: "Action recorded", body: "The audited action completed successfully.", icon: CheckCircle2 },
};

export function AdminStateBoundary({ state, children }: { state?: AsyncState | null; children: ReactNode }) {
  if (!state) return children;
  const copy = stateCopy[state];
  const Icon = copy.icon;
  return <m.div className={`admin-state admin-state--${state}`} role={state === "error" ? "alert" : "status"} initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }}><Icon className={state === "loading" ? "is-spinning" : ""} /><h2>{copy.title}</h2><p>{copy.body}</p>{state === "loading" && <span className="admin-skeleton"><i /><i /><i /></span>}</m.div>;
}

export function AdminNotice({ tone = "info", title, children }: { tone?: "info" | "warning" | "danger"; title?: string; children: ReactNode }) {
  return <div className={`admin-notice admin-notice--${tone}`}><ShieldAlert aria-hidden="true" /><div>{title && <strong>{title}</strong>}<p>{children}</p></div></div>;
}

export function AdminConfirmDialog({ open, title, target, description, confirmLabel, danger = false, pending = false, onCancel, onConfirm }: { open: boolean; title: string; target?: string; description: string; confirmLabel: string; danger?: boolean; pending?: boolean; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const titleId = useId();
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        setReason("");
        setError("");
        reasonRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  function submit() {
    const nextError = validateAdminActionReason(reason);
    if (nextError) { setError(nextError); return; }
    onConfirm(reason.trim());
  }

  return <AnimatePresence>{open && <m.div className="admin-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onCancel(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><m.section aria-labelledby={titleId} aria-modal="true" className="admin-dialog" role="dialog" initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: motionDurations.drawer, ease: motionEasings.standard }}><button aria-label="Close dialog" className="admin-dialog__close" disabled={pending} onClick={onCancel} type="button"><X /></button><AlertTriangle className={danger ? "is-danger" : ""} /><h2 id={titleId}>{title}</h2>{target && <strong className="admin-dialog__target">{target}</strong>}<p>{description}</p><label htmlFor={reasonId}>Reason for this audited action</label><textarea aria-describedby={error ? `${reasonId}-error` : undefined} aria-invalid={Boolean(error)} id={reasonId} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this action is required…" ref={reasonRef} rows={4} value={reason} />{error && <span className="admin-dialog__error" id={`${reasonId}-error`} role="alert">{error}</span>}<div className="admin-dialog__audit"><ShieldAlert />This action and its reason will be written to the immutable audit log.</div><footer><AdminButton disabled={pending} onClick={onCancel} tone="secondary">Cancel</AdminButton><AdminButton disabled={pending} onClick={submit} tone={danger ? "danger" : "primary"}>{pending ? "Recording…" : confirmLabel}</AdminButton></footer></m.section></m.div>}</AnimatePresence>;
}

export function AdminToast({ message, tone = "success", onDismiss }: { message: string; tone?: "success" | "error"; onDismiss?: () => void }) {
  useEffect(() => { if (!onDismiss) return; const timer = window.setTimeout(onDismiss, 4200); return () => window.clearTimeout(timer); }, [onDismiss]);
  return <m.div aria-live="polite" className={`admin-toast admin-toast--${tone}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 />{message}</m.div>;
}
