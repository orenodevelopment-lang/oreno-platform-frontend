"use client";

import { CtaLink } from "@/components/CtaLink";
import { AmbientGradient } from "@/components/motion/AmbientGradient";
import { m, useReducedMotion, type Variants } from "motion/react";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

export function FinalCta() {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : marketingMotion.stagger, delayChildren: reduce ? 0 : .12 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 56, scale: reduce ? 1 : .975 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? .08 : marketingMotion.reveal, ease: motionEasings.standard } },
  };

  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <AmbientGradient />
      <m.div className="final-cta__inner" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .22 }}>
        <m.h2 variants={item} id="final-cta-title">Your hiring, supercharged</m.h2>
        <m.p variants={item}>Oreno powerfully combines AI features with the uniqueness of<br className="desktop-only" /> human emotions to supercharge your hiring</m.p>
        <m.div variants={item} className="final-cta__action"><span aria-hidden="true" /><CtaLink withArrow className="final-cta__button" /></m.div>
      </m.div>
    </section>
  );
}
