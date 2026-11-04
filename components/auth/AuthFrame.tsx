"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

/** Shared company/talent authentication composition from Figma 541:794 and 541:1041. */
export function AuthFrame({
  title,
  subtitle,
  children,
  signup = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  signup?: boolean;
}) {
  return (
    <main
      className={`auth-screen auth-screen--figma ${signup ? "auth-screen--signup" : ""}`}
    >
      <section className="auth-panel">
        <Link className="auth-brand" href="/" aria-label="Oreno home">
          <Logo dark />
        </Link>
        <div className="auth-form-wrap">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
        {signup && (
          <p className="auth-legal">
            By signing up, you agree to our{" "}
            <Link href="/terms">Terms and Conditions</Link> and{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        )}
      </section>
      <section className="auth-art" aria-hidden="true">
        <div className="auth-art__petal-slot">
          <Image
            src="/assets/figma/auth/petal.svg"
            width={300}
            height={300}
            alt=""
            className="auth-art__petal"
            priority
          />
        </div>
        <div className="auth-art__mask-slot">
          <Image
            src="/assets/figma/auth/panel-mask.svg"
            width={720}
            height={1024}
            alt=""
            className="auth-art__mask"
            priority
          />
        </div>
      </section>
    </main>
  );
}
export function AuthProviders({
  signup = false,
  onProvider,
  disabled = false,
}: {
  signup?: boolean;
  onProvider: (provider: "google" | "linkedin") => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="auth-socials">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onProvider("google")}
        >
          {signup ? "Sign up" : "Login"} with Google
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onProvider("linkedin")}
        >
          {signup ? "Sign up" : "Login"} with LinkedIn
        </button>
      </div>
      <div className="auth-divider">
        <Image
          src="/assets/figma/auth/divider.svg"
          alt=""
          width={168}
          height={1}
        />
        <span>Or {signup ? "sign up" : "login"} with email</span>
        <Image
          src="/assets/figma/auth/divider.svg"
          alt=""
          width={168}
          height={1}
        />
      </div>
    </>
  );
}
