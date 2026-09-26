export type TaskStatus = "To-do" | "In progress" | "In review" | "Completed";

export interface PlatformTask {
  id: string;
  title: string;
  summary: string;
  date: string;
  status: TaskStatus;
  tag: "Design" | "Development" | "Research";
  comments: number;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  manager?: string;
  department?: string;
  performance?: number;
  avatar: "/assets/figma/app/company-profile.png" | "/assets/figma/app/manager-profile.jpg";
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  portfolio: string;
  status: "Review" | "Interviewing" | "Accepted" | "Rejected";
}

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  body: string;
  time: string;
  direction: "in" | "out";
}

