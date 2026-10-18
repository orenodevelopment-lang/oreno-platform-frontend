export type AsyncState = "loading" | "empty" | "no-results" | "error" | "denied" | "archived" | "success";
export type JobStatus = "Draft" | "Published" | "Paused" | "Closed" | "Filled" | "Archived";
export type ApplicationStatus = "Submitted" | "Under review" | "Shortlisted" | "Interviewing" | "Offer pending" | "Accepted" | "Rejected" | "Withdrawn";
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled" | "No show";
export type OfferStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  fieldErrors?: Record<string, string>;
}

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PublicTalentSummary {
  id: string;
  name: string;
  discipline: string;
  seniority: string;
  location: string;
  rate: string;
  availability: string;
  skills: string[];
  vetted: boolean;
  avatar: string;
}

export interface PublicTalentProfile extends PublicTalentSummary {
  bio: string;
  experienceYears: number;
  highlights: string[];
  portfolio: Array<{ title: string; category: string }>;
}

export interface PublicJobSummary {
  id: string;
  company: string;
  title: string;
  location: string;
  employmentType: string;
  workplace: string;
  compensation: string;
  skills: string[];
  postedAt: string;
  status: "Published";
}

export interface PublicJobDetail extends PublicJobSummary {
  description: string;
  responsibilities: string[];
  requirements: string[];
  deadline: string;
}

export interface JobRecord {
  id: string;
  title: string;
  department: string;
  openings: number;
  applicants: number;
  hiringManager: string;
  deadline: string;
  compensation: string;
  status: JobStatus;
}

export interface ApplicationRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  appliedAt: string;
  status: ApplicationStatus;
  portfolio: string;
  coverNote: string;
  statusHistory: Array<{ status: ApplicationStatus; at: string; note?: string }>;
}

export interface MatchExplanation {
  version: string;
  summary: string;
  inputs: Array<{ label: string; result: "Match" | "Partial" | "Unavailable"; explanation: string }>;
}

export interface ShortlistRecord {
  id: string;
  name: string;
  jobTitle: string;
  owner: string;
  candidateIds: string[];
  updatedAt?: string;
}

export interface InterviewRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  startsAt: string;
  durationMinutes: number;
  participants: string[];
  meetingUrl: string;
  status: InterviewStatus;
  outcome?: "Advance" | "Hold" | "Reject";
}

export interface OfferRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  startDate: string;
  compensation: string;
  workplace: string;
  status: OfferStatus;
  terms: string[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  category: "Hiring" | "Work" | "Message" | "Account" | "Compensation";
  createdAt: string;
  read: boolean;
  href: string;
}

export interface TimeEntryRecord {
  id: string;
  person: string;
  period: string;
  regularHours: number;
  overtimeHours: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  note?: string;
}

export interface PaymentRecord {
  id: string;
  person: string;
  payrollPeriod: string;
  amount: string;
  currency: string;
  methodDescription: string;
  externalReference: string;
  status: "Recorded" | "Pending confirmation" | "Reconciled" | "Failed";
  paidAt?: string;
}

export interface TalentProfileRecord {
  id: string;
  updatedAt: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  rate: string;
  availability: string;
  profileCompletion: number;
  skills: Array<{ name: string; level: "Working" | "Advanced" | "Expert" }>;
  experience: Array<{ id: string; role: string; company: string; period: string; summary: string }>;
  education: Array<{ id: string; school: string; qualification: string; period: string }>;
  certifications: Array<{ id: string; name: string; issuer: string; issuedAt: string }>;
  portfolio: Array<{ id: string; title: string; category: string; url: string }>;
  vetting: { status: "Not started" | "In review" | "More information required" | "Vetted"; updatedAt: string; publicLabel: string };
}

export interface TalentAccountRecord {
  id: string;
  profileId: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  status: "Pending verification" | "Active" | "Suspended";
  createdAt: string;
  lastSignedInAt: string;
  security: {
    twoFactorEnabled: boolean;
    activeSessions: number;
  };
  preferences: {
    jobAlerts: boolean;
    applicationUpdates: boolean;
    profileVisibility: "Public" | "Oreno companies only" | "Private";
    marketingEmails: boolean;
  };
}

export interface CompanyTeamMemberRecord {
  id: string;
  placementId: string;
  talentProfileId: string;
  companyId: string;
  employeeId: string;
  employmentTitle: string;
  department: string;
  manager: string;
  startDate: string;
  engagement: "Full time" | "Part time" | "Contract";
  status: "Onboarding" | "Active" | "Offboarded";
}

export interface TaskDetailRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: "Low" | "Medium" | "High";
  startDate: string;
  dueDate: string;
  assignees: string[];
  comments: Array<{ id: string; author: string; body: string; createdAt: string }>;
}

export interface DemoRequestInput { name: string; workEmail: string; company: string; teamSize: string; message?: string }
export interface ContactRequestInput { name: string; email: string; topic: string; message: string }
export interface InvitationAcceptanceInput { token: string; firstName: string; lastName: string; password: string }
export interface JobStatusTransitionInput { jobId: string; status: JobStatus; reason?: string }
export interface ApplicationCreateInput { jobId: string; mode: "quick" | "standard"; coverNote?: string; answers?: Record<string, string> }
export interface InterviewUpsertInput { applicationId: string; startsAt: string; durationMinutes: number; participants: string[]; meetingUrl: string }
export interface InterviewOutcomeInput { interviewId: string; outcome: "Advance" | "Hold" | "Reject"; notes: string }
export interface OfferDecisionInput { offerId: string; decision: "accept" | "reject"; note?: string }
export interface ReplacementRequestInput { placementId: string; reason: string; details: string }
export interface TimeEntryDecisionInput { timeEntryId: string; decision: "approve" | "reject"; note?: string }
export interface TalentAccountCreateInput { firstName: string; lastName: string; email: string; password: string }
export interface TalentAccountUpdateInput { phone?: string; preferences?: Partial<TalentAccountRecord["preferences"]> }
export interface TalentProfileUpdateInput extends Partial<Omit<TalentProfileRecord, "id" | "updatedAt" | "vetting">> { id: string; expectedUpdatedAt?: string }

