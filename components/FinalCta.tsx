import { CtaLink } from "@/components/CtaLink";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__burst final-cta__burst--left" aria-hidden="true" />
      <div className="final-cta__burst final-cta__burst--right" aria-hidden="true" />
      <div className="final-cta__inner">
        <h2 id="final-cta-title">Your hiring, supercharged</h2>
        <p>Oreno powerfully combines AI features with the uniqueness of<br className="desktop-only" /> human emotions to supercharge your hiring</p>
        <CtaLink className="final-cta__button" />
      </div>
    </section>
  );
}
