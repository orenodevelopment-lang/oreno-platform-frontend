import Link from "next/link";

type HiringMenuProps = {
  variant: "marketing" | "public";
  onNavigate?: () => void;
  audience?: "company" | "talent";
};

export function HiringMenu({ variant, onNavigate, audience = "company" }: HiringMenuProps) {
  const talent = audience === "talent";
  return (
    <Link
      href={talent ? "/auth/talent-signup?next=%2Fjobs" : "/company/signup"}
      className={variant === "marketing" ? "navbar__link navbar__account-link" : "public-product-cta public-product-account-link"}
      onClick={onNavigate}
    >
      {talent ? "Talent signup" : "Start hiring"}
    </Link>
  );
}
