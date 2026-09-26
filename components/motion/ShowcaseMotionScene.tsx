"use client";

import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Search,
  Sparkles,
  UsersRound,
  Video,
  WalletCards,
} from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { motionDurations, motionEasings, motionStagger } from "@/lib/motion/tokens";

const candidates = [
  { initials: "AA", name: "Ada A.", role: "Data", score: "94%" },
  { initials: "KM", name: "Kwame M.", role: "Product", score: "91%" },
  { initials: "ZN", name: "Zuri N.", role: "Design", score: "89%" },
];

function CurateScene({ reduce }: { reduce: boolean }) {
  return (
    <div className="showcase-scene showcase-scene--curate">
      <div className="showcase-scene__topline"><span><Search /> Screening talent</span><strong>1,248</strong></div>
      <m.div
        className="scene-candidate-list"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: motionStagger.standard + 0.04 } } }}
      >
        {candidates.map((candidate) => (
          <m.div
            className="scene-candidate"
            key={candidate.name}
            variants={{ hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: motionDurations.reveal, ease: motionEasings.standard }}
          >
            <i>{candidate.initials}</i>
            <span><strong>{candidate.name}</strong><small>{candidate.role}</small></span>
            <b>{candidate.score}</b>
            <Check aria-hidden="true" />
          </m.div>
        ))}
      </m.div>
      <m.div
        className="scene-shortlist"
        initial={reduce ? false : { opacity: 0, scale: .82, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ delay: reduce ? 0 : .46, duration: motionDurations.reveal, ease: motionEasings.emphasized }}
      >
        <Sparkles aria-hidden="true" /> Shortlist ready <span>24 vetted</span>
      </m.div>
    </div>
  );
}

function SelectScene({ reduce }: { reduce: boolean }) {
  return (
    <div className="showcase-scene showcase-scene--select">
      <div className="scene-profile-stack" aria-hidden="true">
        <m.div className="scene-profile-card scene-profile-card--back" animate={reduce ? undefined : { rotate: [-7, -4, -7], x: [-4, 2, -4] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <m.div className="scene-profile-card scene-profile-card--middle" animate={reduce ? undefined : { rotate: [6, 3, 6], x: [4, -2, 4] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }} />
        <m.div
          className="scene-profile-card scene-profile-card--front"
          initial={reduce ? false : { opacity: 0, y: 28, scale: .94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: .4 }}
          transition={{ duration: motionDurations.reveal, ease: motionEasings.emphasized }}
        >
          <span className="scene-profile-card__avatar">JD</span>
          <strong>John Doe</strong>
          <small>Senior Product Designer</small>
          <div><span>Research</span><span>Systems</span></div>
          <b><Check /> Best fit</b>
        </m.div>
      </div>
      <m.div className="scene-interview-chip" initial={reduce ? false : { opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: reduce ? 0 : .38, duration: motionDurations.reveal, ease: motionEasings.standard }}>
        <CalendarDays /><span><strong>Interview booked</strong><small>Tuesday · 10:30 AM</small></span><Video />
      </m.div>
      <m.span className="scene-selection-ring" animate={reduce ? undefined : { scale: [1, 1.13, 1], opacity: [.5, 0, .5] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} aria-hidden="true" />
    </div>
  );
}

const onboardingItems = [
  { label: "Profile and documents", icon: ClipboardCheck },
  { label: "Meet the team", icon: UsersRound },
  { label: "Compensation ready", icon: WalletCards },
];

function OnboardScene({ reduce }: { reduce: boolean }) {
  return (
    <div className="showcase-scene showcase-scene--onboard">
      <div className="scene-onboard-heading"><span>JD</span><div><strong>John is joining</strong><small>Product · Full-time</small></div><b>75%</b></div>
      <m.div
        className="scene-onboard-list"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: .35 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: .16 } } }}
      >
        {onboardingItems.map(({ label, icon: Icon }, index) => (
          <m.div key={label} variants={{ hidden: { opacity: 0, x: 26 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: motionDurations.reveal, ease: motionEasings.standard }}>
            <i><Icon /></i><span>{label}<small>{index < 2 ? "Completed" : "In progress"}</small></span>
            {index < 2 ? <b><Check /></b> : <em><span /></em>}
          </m.div>
        ))}
      </m.div>
      <div className="scene-team-orbit" aria-hidden="true">
        <m.span animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}><i>PM</i><i>EN</i><i>HR</i></m.span>
        <strong><UsersRound /></strong>
      </div>
    </div>
  );
}

export function ShowcaseMotionScene({ index }: { index: number }) {
  const reduce = Boolean(useReducedMotion());
  if (index === 0) return <CurateScene reduce={reduce} />;
  if (index === 1) return <SelectScene reduce={reduce} />;
  return <OnboardScene reduce={reduce} />;
}
