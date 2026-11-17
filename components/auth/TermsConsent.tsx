"use client";
import Link from "next/link";
import { useId, useState } from "react";

export function focusTermsConsent() {
  document.querySelector<HTMLInputElement>('input[data-terms-consent]:not(:checked)')?.focus();
}

export function TermsConsent({ checked, onChange, required = false, name = "acceptTerms" }: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
  name?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState(false);
  const accepted = checked ?? selected;
  return (
    <div className="auth-consent-field">
      <label className="auth-consent">
        <input data-terms-consent type="checkbox" name={name} required={required}
          checked={accepted} aria-describedby={accepted ? undefined : id}
          onChange={event => { setSelected(event.target.checked); onChange?.(event.target.checked); }} />
        <span>I agree to the <Link href="/terms">Terms and Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</span>
      </label>
      {!accepted && <p className="auth-consent-prompt" id={id}>Please tick the box to agree before signing up.</p>}
    </div>
  );
}
