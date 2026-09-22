import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Newsletter } from "@/components/Newsletter";
import { footerColumns } from "@/data/site-content";

const socialLinks = [
  { label: "Instagram", text: "◎" },
  { label: "Facebook", text: "f" },
  { label: "Instagram", text: "◎" },
  { label: "Instagram", text: "◎" },
] as const;

export function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer__inner">
        <div className="footer__brand-column">
          <Link href="#top" aria-label="Back to the top"><Logo dark className="footer__logo" /></Link>
          <Newsletter />
          <div className="footer__socials" aria-label="Social media links">
            {socialLinks.map((social, index) => (
              <a key={`${social.label}-${index}`} href="#footer" aria-label={`${social.label} link placeholder`}>
                <span aria-hidden="true">{social.text}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="footer__columns">
          {footerColumns.map((column) => (
            <section key={column.heading}>
              <h2>{column.heading}</h2>
              <ul>
                {column.links.map((label) => (
                  <li key={label}><a href="#footer">{label}</a></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </footer>
  );
}
