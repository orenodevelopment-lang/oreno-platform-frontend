import { CtaLink } from "@/components/CtaLink";
import { Navbar } from "@/components/Navbar";
import { AnimatedGrid } from "@/components/motion/AnimatedGrid";
import { HeroRoleRotator } from "@/components/motion/HeroRoleRotator";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Navbar />
      <AnimatedGrid />
      <div className="hero__content">
        <h1 id="hero-title" className="hero__title">
          <span>Hiring skilled</span>
          <span>
            <HeroRoleRotator /><span className="sr-only">Developers, designers and AI specialists</span> just became
          </span>
          <strong>very easy</strong>
        </h1>
        <CtaLink withArrow className="hero__cta" />
        <div className="hero__quote">
          <p>
            Select your next staff from a pool of carefully vetted and curated developers, AI people and designers across Africa, fast and on a budget.
          </p>
        </div>
        <span className="hero__quote-mark" aria-hidden="true">”</span>
        <a className="hero__scroll-cue" href="#hiring-simplified"><span aria-hidden="true" />Explore Oreno</a>
      </div>
    </section>
  );
}
