"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useId, type ReactNode } from "react";

export function SearchField({ value, onChange, placeholder = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <label className="platform-search" htmlFor={id}>
      <span className="sr-only">{placeholder}</span>
      <input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <Search aria-hidden="true" />
    </label>
  );
}

export function FilterButton({ label }: { label: string }) {
  return (
    <button type="button" className="platform-filter">
      {label} <SlidersHorizontal size={16} aria-hidden="true" />
    </button>
  );
}

export function SectionToolbar({ children }: { children: ReactNode }) {
  return <div className="platform-toolbar">{children}</div>;
}

export function EmptyDesignedState({ label }: { label: string }) {
  return <section className="platform-designed-empty" aria-label={label} />;
}

