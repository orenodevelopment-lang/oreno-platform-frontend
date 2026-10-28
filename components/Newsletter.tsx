"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { productService } from "@/lib/platform/product-service";

export function Newsletter() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return;
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      await productService.subscribeNewsletter(String(new FormData(form).get("email") ?? ""));
      setMessage("Check your inbox to confirm your subscription.");
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your subscription request could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="newsletter" className="newsletter">
      <p>Let’s be pen pals</p>
      <form onSubmit={handleSubmit} aria-label="Newsletter subscription">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input id="newsletter-email" type="email" name="email" placeholder="Email address" required />
        <label className="sr-only" htmlFor="newsletter-consent">I consent to receive occasional Oreno product and hiring updates.</label>
        <input id="newsletter-consent" name="consent" type="checkbox" required />
        <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Subscribe"}</button>
      </form>
      <AnimatePresence>
        {message && <m.span className="newsletter__message" role="status" aria-live="polite" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><CheckCircle2 aria-hidden="true" />{message}</m.span>}
      </AnimatePresence>
      {error && <span className="newsletter__message" role="alert">{error}</span>}
    </div>
  );
}
