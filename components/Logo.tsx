import Image from "next/image";
import type { CSSProperties } from "react";

type LogoProps = {
  dark?: boolean;
  className?: string;
};

export function Logo({ dark = false, className = "" }: LogoProps) {
  return (
    <span className={`oreno-logo ${dark ? "oreno-logo--dark" : ""} ${className}`.trim()}>
      <Image
        src="/assets/figma/oreno-mark.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="oreno-logo__mark"
      />
      <span className="oreno-logo__word" aria-hidden="true">
        {"reno".split("").map((letter, index) => (
          <span className="oreno-logo__letter" style={{ "--logo-letter-index": index } as CSSProperties} key={`${letter}-${index}`}>
            {letter}
          </span>
        ))}
      </span>
      <span className="sr-only">Oreno</span>
    </span>
  );
}
