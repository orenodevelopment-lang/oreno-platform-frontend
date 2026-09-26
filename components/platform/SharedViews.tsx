"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, MessageCircle, Paperclip, Phone, Plus, Send, Video } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, LayoutGroup, m, useReducedMotion } from "motion/react";
import { initialMessages, managers, tasks } from "@/lib/platform/mock-service";
import type { ChatMessage, TaskStatus } from "@/lib/platform/types";
import { SearchField } from "./Primitives";

const taskStatuses: TaskStatus[] = ["To-do", "In progress", "In review", "Completed"];

export function TaskBoard({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"cards" | "calendar">("cards");
  const [boardTasks, setBoardTasks] = useState(tasks);
  const reduce = useReducedMotion();

  function moveTask(id: string, direction: -1 | 1) {
    setBoardTasks((current) => current.map((task) => {
      if (task.id !== id) return task;
      const currentIndex = taskStatuses.indexOf(task.status);
      const nextIndex = Math.max(0, Math.min(taskStatuses.length - 1, currentIndex + direction));
      return { ...task, status: taskStatuses[nextIndex] };
    }));
  }
  return (
    <section className={`task-view ${compact ? "task-view--compact" : ""}`}>
      <div className="view-heading">
        <div>
          <h2>Assigned task</h2>
          <p>View, and complete tasks</p>
        </div>
        <div className="segmented-tabs" role="tablist" aria-label="Task view">
          <button className={mode === "cards" ? "is-active" : ""} role="tab" aria-selected={mode === "cards"} onClick={() => setMode("cards")}>Cards</button>
          <button className={mode === "calendar" ? "is-active" : ""} role="tab" aria-selected={mode === "calendar"} onClick={() => setMode("calendar")}><CalendarDays size={18} /> Calendar</button>
        </div>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
      {mode === "calendar" ? (
        <m.div className="task-calendar" key="calendar" initial={{ opacity: 0, x: reduce ? 0 : 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -10 }}>
          <div className="task-calendar__week">{["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => <span key={day}>{day}<strong>{20 + index}</strong></span>)}</div>
          <div className="task-calendar__items">{boardTasks.map((task, index) => <article style={{ gridColumn: `${(index % 4) + 1} / span 2` }} key={task.id}>{task.title}<small>{task.status}</small></article>)}</div>
        </m.div>
      ) : (
        <m.div className="task-board" key="cards" initial={{ opacity: 0, x: reduce ? 0 : -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : 10 }}>
          <LayoutGroup>
          {taskStatuses.map((status) => (
            <section className="task-column" key={status}>
              <header><span>{status}</span><b>{boardTasks.filter((task) => task.status === status).length}</b><button type="button" aria-label={`Add ${status} task`}><Plus /></button></header>
              <div className="task-column__cards">
                {boardTasks.filter((task) => task.status === status).map((task) => (
                  <m.article className="task-card" key={task.id} layout drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={reduce ? 0 : .13} whileDrag={reduce ? undefined : { scale: 1.025, boxShadow: "0 18px 36px rgba(11, 62, 55, .18)" }} onDragEnd={(_, info) => { if (info.offset.x > 70) moveTask(task.id, 1); if (info.offset.x < -70) moveTask(task.id, -1); }}>
                    <div className="task-card__meta"><span className={`task-tag task-tag--${task.tag.toLowerCase()}`}>{task.tag}</span><button type="button" aria-label={`Move ${task.title} to the next stage`} disabled={task.status === "Completed"} onClick={() => moveTask(task.id, 1)}><ArrowRight /></button></div>
                    <h3>{task.title}</h3>
                    <p>{task.summary}</p>
                    <footer><span><CalendarDays /> {task.date}</span><span><MessageCircle /> {task.comments}</span></footer>
                  </m.article>
                ))}
              </div>
            </section>
          ))}
          </LayoutGroup>
        </m.div>
      )}
      </AnimatePresence>
    </section>
  );
}

export function ManagerGrid({ company = false }: { company?: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => managers.filter((manager) => `${manager.name} ${manager.role}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section>
      <div className="view-heading view-heading--line">
        <div><h2>Managers</h2><p>People helping your team do its best work.</p></div>
        <SearchField value={query} onChange={setQuery} placeholder="Search managers" />
      </div>
      <m.div className="manager-grid" layout>
        <AnimatePresence initial={false} mode="popLayout">{filtered.map((manager) => (
          <m.article className="manager-card" key={manager.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }}>
            <Image src={manager.avatar} alt="" width={104} height={104} />
            <h3>{manager.name}</h3>
            <p>{manager.role}</p>
            <div><a href={`mailto:${manager.email}`} aria-label={`Email ${manager.name}`}><Mail /></a><a href={`tel:${manager.phone ?? ""}`} aria-label={`Call ${manager.name}`}><Phone /></a></div>
            {company && <Link href="/company/managers/richard-benson">View profile</Link>}
          </m.article>
        ))}</AnimatePresence>
      </m.div>
    </section>
  );
}

export function MessagesView() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const names = ["John Doe C", "Chibuokem Chiorlu", "Benny Asitonka-Joe", "Chimzibudu Chiorlu", "Sarima Chiorlu", "Precious Akehome"];
  const filtered = names.filter((name) => name.toLowerCase().includes(query.toLowerCase()));

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [...current, { id: `m-${Date.now()}`, body: draft.trim(), time: "now", direction: "out" }]);
    setDraft("");
  }

  return (
    <section className="messages-view">
      <div className="messages-view__search"><SearchField value={query} onChange={setQuery} /></div>
      <aside className="conversation-lists">
        <section><header><h2>People</h2><button type="button" aria-label="Start conversation"><Plus /></button></header>{filtered.map((name) => <button className={name === "John Doe C" ? "is-active" : ""} type="button" key={name}>{name}</button>)}</section>
        <section><header><h2>Groups</h2><button type="button" aria-label="Create group"><Plus /></button></header>{["Managers", "Team leads", "All staffs"].map((name) => <button type="button" key={name}>{name}</button>)}</section>
      </aside>
      <article className="chat-panel">
        <header><Image src="/assets/figma/app/company-profile.png" alt="" width={60} height={60} /><h2>John Doe C.</h2><span /><button type="button" aria-label="Audio call"><Phone /></button><button type="button" aria-label="Video call"><Video /></button></header>
        <div className="chat-panel__messages"><AnimatePresence initial={false}>{messages.map((message) => <m.div className={`chat-bubble chat-bubble--${message.direction}`} key={message.id} initial={{ opacity: 0, x: message.direction === "out" ? 12 : -12, y: 5 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0 }} layout>{message.body}<time>{message.time}</time></m.div>)}</AnimatePresence></div>
        <form onSubmit={sendMessage}><button type="button" aria-label="Attach file"><Paperclip /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type your message here..." aria-label="Message" /><button type="submit" aria-label="Send message"><Send /></button></form>
      </article>
    </section>
  );
}
