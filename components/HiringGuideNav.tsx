"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { showcaseSteps } from "@/data/site-content";
import { marketingMotion, motionEasings } from "@/lib/motion/tokens";

export function HiringGuideNav() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const sections = showcaseSteps
      .map((_, index) => document.getElementById(`showcase-step-${index + 1}`))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = sections.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-24% 0px -54%", threshold: [0.15, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function selectStep(index: number) {
    setActive(index);
    document.getElementById(`showcase-step-${index + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <m.nav
      className="hiring-guide"
      aria-label="Hiring process steps"
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .7 }}
      transition={{ duration: reduce ? .08 : marketingMotion.reveal, delay: reduce ? 0 : .08, ease: motionEasings.standard }}
    >
      <span className="hiring-guide__line" aria-hidden="true"><i style={{ transform: `scaleX(${active / (showcaseSteps.length - 1)})` }} /></span>
      {showcaseSteps.map((step, index) => (
        <button
          type="button"
          className={index === active ? "is-active" : index < active ? "is-complete" : ""}
          aria-current={index === active ? "step" : undefined}
          onClick={() => selectStep(index)}
          key={step.eyebrow}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{step.eyebrow}</strong>
        </button>
      ))}
    </m.nav>
  );
}
