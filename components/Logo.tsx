import Image from "next/image";

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
      <span className="oreno-logo__word">reno</span>
      <span className="sr-only">Oreno</span>
    </span>
  );
}
