import { CtaLink } from "@/components/CtaLink";

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
    <article className={`showcase-card showcase-card--${mediaSide} showcase-card--${index + 1}`}>
      <div
        className="showcase-card__media"
        role="img"
        aria-label={`Placeholder for the transparent GIF illustrating step ${index + 1}: ${eyebrow}`}
      >
        <span>Gif Image here<br />the white should be transparent</span>
      </div>
      <div className="showcase-card__copy">
        <span className={`showcase-card__eyebrow showcase-card__eyebrow--${accent}`}>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <CtaLink dark />
      </div>
    </article>
  );
}
