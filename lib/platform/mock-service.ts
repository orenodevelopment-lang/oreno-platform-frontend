import type { Candidate, ChatMessage, Job, Person, PlatformTask } from "./types";

const companyAvatar = "/assets/figma/app/company-profile.png" as const;
const managerAvatar = "/assets/figma/app/manager-profile.jpg" as const;

export const people: Person[] = [
  { id: "john-doe", name: "John Doe C.", role: "React developer", email: "john@oreno.team", phone: "+234 (0)903-123-4567", manager: "Richard Benson", department: "Engineering", performance: 72, avatar: companyAvatar },
  { id: "chibuokem", name: "Chibuokem Chiorlu", role: "Senior product designer", email: "chibuokem@oreno.team", manager: "Sarima Chiorlu", department: "Design", performance: 88, avatar: managerAvatar },
  { id: "benny", name: "Benny Asitonka-Joe", role: "Database analyst", email: "benny@oreno.team", manager: "Richard Benson", department: "Engineering", performance: 64, avatar: managerAvatar },
  { id: "sarima", name: "Sarima Chiorlu", role: "Growth strategist", email: "sarima@oreno.team", manager: "Henry Cavill", department: "Marketing", performance: 91, avatar: managerAvatar },
  { id: "chimzibudu", name: "Chiorlu Chimzibudu", role: "Software engineer", email: "chimzibudu@oreno.team", manager: "Richard Benson", department: "Engineering", performance: 77, avatar: companyAvatar },
  { id: "random-joe", name: "Random Joe", role: "Data security", email: "random@oreno.team", manager: "Henry Cavill", department: "Security", performance: 55, avatar: managerAvatar },
];

export const managers: Person[] = [
  { id: "richard-benson", name: "Richard Benson", role: "Product manager", email: "richard@company.com", phone: "+234 (0)903-123-4567", department: "Product", avatar: managerAvatar },
  { id: "sarima-manager", name: "Sarima Chiorlu", role: "Human resource", email: "sarima@company.com", department: "People", avatar: managerAvatar },
  { id: "henry-cavill", name: "Henry Cavill", role: "Engineering manager", email: "cavill@company.com", department: "Engineering", avatar: managerAvatar },
  { id: "rejoice-okon", name: "Rejoice Okon", role: "Design manager", email: "rejoice@company.com", department: "Design", avatar: managerAvatar },
  { id: "precious", name: "Precious Akehome", role: "Growth manager", email: "precious@company.com", department: "Marketing", avatar: managerAvatar },
  { id: "mario", name: "Mario Francis-Bee", role: "Media manager", email: "mario@company.com", department: "Media", avatar: managerAvatar },
];

export const tasks: PlatformTask[] = [
  { id: "task-1", title: "Design homepage", summary: "Create the final responsive homepage layout and component states.", date: "24 May", status: "To-do", tag: "Design", comments: 4 },
  { id: "task-2", title: "User research", summary: "Review the interview notes and share the strongest patterns.", date: "26 May", status: "To-do", tag: "Research", comments: 2 },
  { id: "task-3", title: "Dashboard UI", summary: "Build the reusable cards and table components for the dashboard.", date: "21 May", status: "In progress", tag: "Development", comments: 8 },
  { id: "task-4", title: "Mobile prototype", summary: "Connect the core mobile flows for the next review session.", date: "22 May", status: "In progress", tag: "Design", comments: 3 },
  { id: "task-5", title: "Onboarding flow", summary: "Check validation and empty states across account setup.", date: "18 May", status: "In review", tag: "Development", comments: 6 },
  { id: "task-6", title: "Design system", summary: "Document spacing, colour, buttons, inputs and type styles.", date: "16 May", status: "Completed", tag: "Design", comments: 11 },
];

export const candidates: Candidate[] = [
  { id: "candidate-1", name: "John Doe C.", role: "React developer", portfolio: "linktr.ee/cc", status: "Interviewing" },
  { id: "candidate-2", name: "Chiorlu Chibuokem V.", role: "Senior product designer", portfolio: "linktr.ee/cc", status: "Review" },
  { id: "candidate-3", name: "Benny Asitonka-Joe", role: "Database analyst", portfolio: "linktr.ee/cc", status: "Review" },
  { id: "candidate-4", name: "Sarima Chiorlu", role: "Growth strategist", portfolio: "linktr.ee/cc", status: "Interviewing" },
  { id: "candidate-5", name: "Chiorlu Chimzibudu", role: "Software engineer", portfolio: "linktr.ee/cc", status: "Accepted" },
  { id: "candidate-6", name: "Random Joe", role: "Data security", portfolio: "linktr.ee/cc", status: "Rejected" },
  { id: "candidate-7", name: "Mario Francis-Bee", role: "Motion graphics designer", portfolio: "linktr.ee/cc", status: "Review" },
];

export const jobs: Job[] = [
  { id: "product-designer", company: "Oreno Labs", role: "Product designer", location: "Lagos, Nigeria", type: "Full time · Remote", salary: "$2,800 – $3,600", posted: "2 days ago", description: "Design thoughtful hiring experiences with a small cross-functional product team." },
  { id: "frontend-engineer", company: "Kora Systems", role: "Frontend engineer", location: "Remote", type: "Full time", salary: "$3,000 – $4,200", posted: "4 days ago", description: "Build accessible React interfaces and own key parts of a growing design system." },
  { id: "brand-designer", company: "Palm Studio", role: "Brand designer", location: "Abuja, Nigeria", type: "Contract · Hybrid", salary: "$1,900 – $2,500", posted: "1 week ago", description: "Create campaigns and brand systems for ambitious African technology companies." },
];

export const initialMessages: ChatMessage[] = [
  { id: "m1", body: "Hello John", time: "8:00am", direction: "out" },
  { id: "m2", body: "Hello Victor", time: "8:05am", direction: "in" },
  { id: "m3", body: "I noticed your performance this week has been sub par", time: "8:06am", direction: "out" },
  { id: "m4", body: "Is there any reason for it?", time: "8:06am", direction: "out" },
  { id: "m5", body: "I am sorry I might have not performed as optimally as I usually do.", time: "8:07am", direction: "in" },
  { id: "m6", body: "I hope you really do", time: "8:08am", direction: "out" },
];

export const platformService = {
  listPeople: async () => people,
  listManagers: async () => managers,
  listTasks: async () => tasks,
  listCandidates: async () => candidates,
  listJobs: async () => jobs,
};

