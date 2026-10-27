"use client";

import { useApiRevision } from "@/lib/api/live-store";

import { Bookmark, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronRight, Clock3, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { jobs } from "@/lib/platform/mock-service";
import { PlatformShell } from "./PlatformShell";
import { ManagerGrid, MessagesView, TaskBoard } from "./SharedViews";
import { TalentProductScreen, talentProductTitles } from "@/components/product/TalentProductScreens";

const titles: Record<string, string> = {
  tasks: "Dashboard",
  team: "Team",
  messages: "Message",
  settings: "Settings",
  apply: "Dashboard",
};

export function TalentApp({ segments }: { segments: string[] }) {
  useApiRevision();
  const route = segments.join("/");
  const rootRoute = segments[0] ?? "";
  const inferredTitle = talentProductTitles[route] ?? talentProductTitles[rootRoute] ?? (route.startsWith("jobs/") ? "Job detail" : route.startsWith("applications/") ? "Application detail" : route.startsWith("interviews/") ? "Interview" : route.startsWith("offers/") ? "Offer review" : route.startsWith("tasks/") ? "Task" : "Dashboard");
  return (
    <PlatformShell kind="talent" title={titles[route] ?? inferredTitle} actionLabel={route === "team" ? "Hire a talent" : undefined}>
      {route === "tasks" && <TaskBoard />}
      {route === "team" && <ManagerGrid />}
      {route === "messages" && <MessagesView />}
      {route === "settings" && <TalentProductScreen route="account" />}
      {route === "apply" && <JobsView />}
      {!titles[route] && <TalentProductScreen route={route} />}
    </PlatformShell>
  );
}

function JobsView() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(jobs[0].id);
  const [applied, setApplied] = useState<string[]>([jobs[0].id]);
  const filtered = useMemo(() => jobs.filter((job) => `${job.role} ${job.company} ${job.location}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const active = jobs.find((job) => job.id === activeId) ?? jobs[0];
  return (
    <section className="jobs-view">
      <div className="jobs-toolbar">
        <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" /></label>
        <select aria-label="Job type"><option>Job type</option><option>Full time</option><option>Contract</option></select>
        <select aria-label="Location"><option>Location</option><option>Remote</option><option>Lagos</option></select>
        <button type="button">Search</button>
      </div>
      <div className="jobs-layout">
        <aside className="job-list">
          <header><h2>Recommended jobs</h2><span>{filtered.length} open roles</span></header>
          {filtered.map((job) => (
            <button type="button" className={active.id === job.id ? "is-active" : ""} onClick={() => setActiveId(job.id)} key={job.id}>
              <span className="job-logo"><Building2 /></span>
              <span><small>{job.company}</small><strong>{job.role}</strong><em><MapPin /> {job.location}</em><em><Clock3 /> {job.posted}</em></span>
              <Bookmark aria-label="Save job" />
            </button>
          ))}
        </aside>
        <article className="job-detail">
          <header><span className="job-logo job-logo--large"><BriefcaseBusiness /></span><div><p>{active.company}</p><h2>{active.role}</h2><span><MapPin /> {active.location}</span></div><button type="button"><Bookmark /><span className="sr-only">Save job</span></button></header>
          <div className="job-facts"><span><BriefcaseBusiness />{active.type}</span><span><CalendarDays />{active.posted}</span><span>{active.salary}</span></div>
          <section><h3>About the role</h3><p>{active.description}</p><h3>What you’ll do</h3><ul><li>Turn product requirements into polished, accessible work.</li><li>Partner closely with product, design and engineering.</li><li>Share progress clearly and improve the team’s working system.</li></ul></section>
          <div className="application-track"><h3>Application status</h3>{["Application submitted", "Portfolio review", "Interview", "Decision"].map((label, index) => <div className={applied.includes(active.id) && index < 2 ? "is-done" : ""} key={label}><i>{applied.includes(active.id) && index < 2 ? <Check /> : index + 1}</i><span>{label}<small>{index === 0 && applied.includes(active.id) ? "Received" : "Pending"}</small></span>{index < 3 && <ChevronRight />}</div>)}</div>
          <button className="job-apply" type="button" disabled={applied.includes(active.id)} onClick={() => setApplied((current) => [...current, active.id])}>{applied.includes(active.id) ? "Application submitted" : "Apply for this role"}</button>
        </article>
      </div>
    </section>
  );
}
