"use client";

import { FormEvent, useState } from "react";

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
      <span className="newsletter__message" role="status" aria-live="polite">{message}</span>
    </div>
  );
}
