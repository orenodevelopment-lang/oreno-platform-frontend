"use client";

import { useRef, useState, type PointerEvent } from "react";
import { HiringStepCard } from "@/components/HiringStepCard";
import { talentSlides } from "@/data/site-content";
import { m } from "motion/react";
import { motionDurations, motionEasings, motionStagger } from "@/lib/motion/tokens";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function TalentCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ active: false, startX: 0, scrollLeft: 0, lastX: 0, lastAt: 0, velocity: 0, moved: false });
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  function maxScroll() {
    const track = trackRef.current;
    return track ? Math.max(0, track.scrollWidth - track.clientWidth) : 0;
  }

  function updateActive() {
    const track = trackRef.current;
    if (!track) return;
    const available = Math.max(1, track.scrollWidth - track.clientWidth);
    setActive(Math.max(0, Math.min(talentSlides.length - 1, Math.round((track.scrollLeft / available) * (talentSlides.length - 1)))));
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(talentSlides.length - 1, index));
    trackRef.current?.scrollTo({ left: (next / (talentSlides.length - 1)) * maxScroll(), behavior: "smooth" });
    setActive(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(active + (event.key === "ArrowRight" ? 1 : -1));
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const track = event.currentTarget;
    pointer.current = { active: true, startX: event.clientX, scrollLeft: track.scrollLeft, lastX: event.clientX, lastAt: performance.now(), velocity: 0, moved: false };
    track.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const state = pointer.current;
    if (!state.active) return;
    const now = performance.now();
    const elapsed = Math.max(1, now - state.lastAt);
    state.velocity = (event.clientX - state.lastX) / elapsed;
    state.lastX = event.clientX;
    state.lastAt = now;
    state.moved ||= Math.abs(event.clientX - state.startX) > 5;
    event.currentTarget.scrollLeft = state.scrollLeft - (event.clientX - state.startX);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = pointer.current;
    if (!state.active) return;
    state.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(state.velocity) > .08) event.currentTarget.scrollBy({ left: -state.velocity * 230, behavior: "smooth" });
    window.setTimeout(updateActive, 260);
  }

  return (
    <div className="talent-carousel-shell">
      <div className="talent-carousel__controls">
        <span><strong>{String(active + 1).padStart(2, "0")}</strong> / {String(talentSlides.length).padStart(2, "0")}</span>
        <div><button type="button" aria-label="Previous talent" disabled={active === 0} onClick={() => goTo(active - 1)}><ArrowLeft /></button><button type="button" aria-label="Next talent" disabled={active === talentSlides.length - 1} onClick={() => goTo(active + 1)}><ArrowRight /></button></div>
      </div>
      <div
        ref={trackRef}
        className={`talent-carousel ${dragging ? "is-dragging" : ""}`}
        role="region"
        aria-label="Available talent roles. Drag or use the arrow keys to browse."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={updateActive}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => { if (pointer.current.moved) { event.preventDefault(); event.stopPropagation(); pointer.current.moved = false; } }}
      >
        <m.div className="talent-carousel__track" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: motionStagger.standard } } }}>
          {talentSlides.map((talent, index) => (
            <m.div className={`talent-carousel__item ${index === active ? "is-active" : ""}`} key={`${talent.role}-${index}`} variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: motionDurations.reveal, ease: motionEasings.standard }}>
              <HiringStepCard {...talent} />
            </m.div>
          ))}
        </m.div>
      </div>
      <div className="talent-carousel__progress" aria-hidden="true"><span style={{ width: `${100 / talentSlides.length}%`, transform: `translateX(${active * 100}%)` }} /></div>
    </div>
  );
}
