"use client";

import Link from "next/link";
import { m, useReducedMotion, type Variants } from "motion/react";
import { Logo } from "@/components/Logo";
import { Newsletter } from "@/components/Newsletter";
import { footerColumns } from "@/data/site-content";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

const socialLinks = [
  { label: "Instagram", text: "◎" },
  { label: "Facebook", text: "f" },
  { label: "Instagram", text: "◎" },
  { label: "Instagram", text: "◎" },
] as const;

export function Footer() {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : marketingMotion.stagger, delayChildren: reduce ? 0 : .1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 54, scale: reduce ? 1 : .98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? .08 : marketingMotion.reveal, ease: motionEasings.standard } },
  };

  return (
    <footer id="footer" className="footer">
      <m.div className="footer__inner" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .12 }}>
        <m.div className="footer__brand-column" variants={item}>
          <Link href="/" aria-label="Oreno home"><Logo dark className="footer__logo" /></Link>
          <Newsletter />
          <div className="footer__socials" aria-label="Social media links">
            {socialLinks.map((social, index) => (
              <a key={`${social.label}-${index}`} href="#footer" aria-label={`${social.label} link placeholder`}>
                <span aria-hidden="true">{social.text}</span>
              </a>
            ))}
          </div>
        </m.div>
        <m.div className="footer__columns" variants={container}>
          {footerColumns.map((column) => (
            <m.section variants={item} key={column.heading}>
              <h2>{column.heading}</h2>
              <ul>
                {column.links.map((label) => (
                  <li key={label}>{label === "Contact" ? <Link href="/contact">{label}</Link> : <a href="#footer">{label}</a>}</li>
                ))}
              </ul>
            </m.section>
          ))}
        </m.div>
      </m.div>
    </footer>
  );
}
