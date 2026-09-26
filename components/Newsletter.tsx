"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return;
    setMessage("Thanks — this demo form is ready for a newsletter integration.");
    form.reset();
  }

  return (
    <div id="newsletter" className="newsletter">
      <p>Let’s be pen pals</p>
      <form onSubmit={handleSubmit} aria-label="Newsletter subscription">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input id="newsletter-email" type="email" name="email" placeholder="Email address" required />
        <button type="submit">Subscribe</button>
      </form>
      <AnimatePresence>
        {message && <m.span className="newsletter__message" role="status" aria-live="polite" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><CheckCircle2 aria-hidden="true" />{message}</m.span>}
      </AnimatePresence>
    </div>
  );
}
