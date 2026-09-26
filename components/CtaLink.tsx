import Image from "next/image";
import Link from "next/link";

type CtaLinkProps = {
  href?: string;
  children?: React.ReactNode;
  dark?: boolean;
  withArrow?: boolean;
  className?: string;
};

export function CtaLink({
  href = "/company/signup",
  children = "Start hiring",
  dark = false,
  withArrow = false,
  className = "",
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`cta-link ${dark ? "cta-link--dark" : ""} ${className}`.trim()}
    >
      <span>{children}</span>
      {withArrow ? (
        <Image
          src="/assets/figma/arrow-circle-right.svg"
          alt=""
          width={24}
          height={24}
          className="cta-link__arrow"
        />
      ) : null}
    </Link>
  );
}
