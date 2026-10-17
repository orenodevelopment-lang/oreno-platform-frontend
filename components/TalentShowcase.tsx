import { ShowcaseSection } from "@/components/ShowcaseSection";
import { showcaseSteps } from "@/data/site-content";
import { HiringGuideNav } from "@/components/HiringGuideNav";
import { Reveal } from "@/components/motion/Reveal";

export function TalentShowcase() {
  return (
    <section id="showcase" className="showcase-list" aria-label="How Oreno hiring works">
      <Reveal className="showcase-list__intro">
        <span>How it works</span>
        <h2>From shortlist to successful onboarding</h2>
        <p>Follow the three stages of hiring with Oreno.</p>
      </Reveal>
      <HiringGuideNav />
      {showcaseSteps.map((step, index) => (
        <ShowcaseSection key={step.eyebrow} {...step} index={index} />
      ))}
    </section>
  );
}
