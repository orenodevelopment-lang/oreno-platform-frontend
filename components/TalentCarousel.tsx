"use client";

import { useRef } from "react";
import { HiringStepCard } from "@/components/HiringStepCard";
import { talentSlides } from "@/data/site-content";

export function TalentCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    trackRef.current?.scrollBy({ left: direction * 430, behavior: "smooth" });
  }

  return (
    <div
      ref={trackRef}
      className="talent-carousel"
      role="region"
      aria-label="Available talent roles. Use the left and right arrow keys to browse."
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="talent-carousel__track">
        {talentSlides.map((talent, index) => (
          <HiringStepCard key={`${talent.role}-${index}`} {...talent} />
        ))}
      </div>
    </div>
  );
}
