import { ShowcaseSection } from "@/components/ShowcaseSection";
import { showcaseSteps } from "@/data/site-content";
import { ProgressConnector } from "@/components/motion/ProgressConnector";

export function TalentShowcase() {
  return (
    <section id="showcase" className="showcase-list" aria-label="How Oreno hiring works">
      <ProgressConnector />
      {showcaseSteps.map((step, index) => (
        <ShowcaseSection key={step.eyebrow} {...step} index={index} />
      ))}
    </section>
  );
}
