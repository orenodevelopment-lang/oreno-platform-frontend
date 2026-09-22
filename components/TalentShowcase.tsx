import { ShowcaseSection } from "@/components/ShowcaseSection";
import { showcaseSteps } from "@/data/site-content";

export function TalentShowcase() {
  return (
    <section id="showcase" className="showcase-list" aria-label="How Oreno hiring works">
      {showcaseSteps.map((step, index) => (
        <ShowcaseSection key={step.eyebrow} {...step} index={index} />
      ))}
    </section>
  );
}
