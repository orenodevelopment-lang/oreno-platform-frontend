"use client";

import { CtaLink } from "@/components/CtaLink";
import { Parallax } from "@/components/motion/Parallax";
import { ShowcaseMotionScene } from "@/components/motion/ShowcaseMotionScene";
import { m, useReducedMotion } from "motion/react";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

type ShowcaseSectionProps = {
  eyebrow: string;
  accent: "pink" | "green" | "blue";
  title: string;
  body: string;
  mediaSide: "left" | "right";
  index: number;
};

export function ShowcaseSection({ eyebrow, accent, title, body, mediaSide, index }: ShowcaseSectionProps) {
  const reduce = useReducedMotion();
  const mediaOffset = reduce ? 0 : mediaSide === "left" ? -62 : 62;
  const copyOffset = reduce ? 0 : mediaSide === "left" ? 48 : -48;

  return (
    <m.article
      id={`showcase-step-${index + 1}`}
      className={`showcase-card showcase-card--${mediaSide} showcase-card--${index + 1}`}
      initial={{ opacity: 0, y: reduce ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .16 }}
      transition={{ duration: reduce ? .08 : marketingMotion.reveal, ease: motionEasings.standard }}
    >
      <m.div
        className="showcase-card__media"
        role="img"
        aria-label={`Animated product demonstration for step ${index + 1}: ${eyebrow}`}
        initial={{ opacity: 0, x: mediaOffset, scale: reduce ? 1 : .965 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: .28 }}
        transition={{ duration: reduce ? .08 : .86, delay: reduce ? 0 : .08, ease: motionEasings.emphasized }}
      >
        <Parallax className="showcase-card__media-motion" distance={18}><ShowcaseMotionScene index={index} /></Parallax>
      </m.div>
      <m.div
        className="showcase-card__copy"
        initial={{ opacity: 0, x: copyOffset }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: .34 }}
        transition={{ duration: reduce ? .08 : .82, delay: reduce ? 0 : .18, ease: motionEasings.standard }}
      >
        <span className={`showcase-card__eyebrow showcase-card__eyebrow--${accent}`}><b>{String(index + 1).padStart(2, "0")}</b>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <CtaLink dark />
      </m.div>
    </m.article>
  );
}
