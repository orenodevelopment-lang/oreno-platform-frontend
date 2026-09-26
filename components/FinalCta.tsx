import { CtaLink } from "@/components/CtaLink";
import { AmbientGradient } from "@/components/motion/AmbientGradient";
import { Reveal } from "@/components/motion/Reveal";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <AmbientGradient />
      <Reveal className="final-cta__inner">
        <h2 id="final-cta-title">Your hiring, supercharged</h2>
        <p>Oreno powerfully combines AI features with the uniqueness of<br className="desktop-only" /> human emotions to supercharge your hiring</p>
        <div className="final-cta__action"><span aria-hidden="true" /><CtaLink withArrow className="final-cta__button" /></div>
      </Reveal>
    </section>
  );
}
