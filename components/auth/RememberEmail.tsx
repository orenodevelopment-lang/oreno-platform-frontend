"use client";
import { useEffect, useRef } from "react";

/** Opt-in convenience only; session lifetime remains controlled by the server. */
export function RememberEmail() {
  const control = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const checkbox = control.current;
    const form = checkbox?.form;
    const email = form?.elements.namedItem("email");
    if (!checkbox || !form || !(email instanceof HTMLInputElement)) return;
    const key = "oreno:remembered-email";
    try {
      const saved = localStorage.getItem(key);
      if (saved && !email.value) {
        email.value = saved;
        checkbox.checked = true;
      }
    } catch {
      /* Storage can be unavailable in private browsers. */
    }
    const save = () => {
      try {
        if (checkbox.checked) localStorage.setItem(key, email.value.trim());
        else localStorage.removeItem(key);
      } catch {
        /* Remembering an email must never block sign-in. */
      }
    };
    form.addEventListener("submit", save);
    return () => form.removeEventListener("submit", save);
  }, []);
  return (
    <label title="Save only your email on this device">
      <input
        ref={control}
        type="checkbox"
        onChange={(event) => {
          if (!event.currentTarget.checked) {
            try {
              localStorage.removeItem("oreno:remembered-email");
            } catch {
              /* Optional storage. */
            }
          }
        }}
      />
      <span>Remember email</span>
    </label>
  );
}
