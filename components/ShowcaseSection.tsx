import { CtaLink } from "@/components/CtaLink";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { ShowcaseMotionScene } from "@/components/motion/ShowcaseMotionScene";

type ShowcaseSectionProps = {
  eyebrow: string;
  accent: "pink" | "green" | "blue";
  title: string;
  body: string;
  mediaSide: "left" | "right";
  index: number;
};

export function ShowcaseSection({ eyebrow, accent, title, body, mediaSide, index }: ShowcaseSectionProps) {
  return (
    <Reveal className="showcase-motion-item" direction={mediaSide === "left" ? "left" : "right"}>
    <article className={`showcase-card showcase-card--${mediaSide} showcase-card--${index + 1}`}>
      <div
        className="showcase-card__media"
        role="img"
        aria-label={`Animated product demonstration for step ${index + 1}: ${eyebrow}`}
      >
        <Parallax className="showcase-card__media-motion" distance={18}><ShowcaseMotionScene index={index} /></Parallax>
      </div>
      <div className="showcase-card__copy">
        <span className={`showcase-card__eyebrow showcase-card__eyebrow--${accent}`}>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <CtaLink dark />
      </div>
    </article>
    </Reveal>
  );
}
