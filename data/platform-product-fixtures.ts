import type {
  ApplicationRecord,
  CompanyTeamMemberRecord,
  InterviewRecord,
  JobRecord,
  NotificationRecord,
  OfferRecord,
  PaymentRecord,
  PublicJobDetail,
  PublicTalentProfile,
  ShortlistRecord,
  TalentProfileRecord,
  TalentAccountRecord,
  TaskDetailRecord,
  TimeEntryRecord,
} from "@/lib/platform/contracts";

const companyAvatar = "/assets/figma/app/company-profile.png";
const managerAvatar = "/assets/figma/app/manager-profile.jpg";

export const publicTalents: PublicTalentProfile[] = [
  { id: "john-doe", name: "John Doe C.", discipline: "Frontend engineering", seniority: "Senior", location: "Lagos, Nigeria", rate: "$35/hr", availability: "Available in 2 weeks", skills: ["React", "TypeScript", "Accessibility", "Next.js"], vetted: true, avatar: companyAvatar, experienceYears: 6, bio: "Product-minded frontend engineer who builds accessible, dependable interfaces for growing teams.", highlights: ["Led a design-system migration", "Mentored four frontend engineers", "Built products used across six African markets"], portfolio: [{ title: "Merchant operations dashboard", category: "Web application" }, { title: "Accessible component library", category: "Design system" }] },
  { id: "chibuokem", name: "Chibuokem Chiorlu", discipline: "Product design", seniority: "Senior", location: "Port Harcourt, Nigeria", rate: "$32/hr", availability: "Available now", skills: ["Product strategy", "Figma", "Research", "Prototyping"], vetted: true, avatar: managerAvatar, experienceYears: 7, bio: "End-to-end product designer focused on operational tools and clear service experiences.", highlights: ["Shipped a multi-market fintech redesign", "Built research operations from zero", "Facilitates cross-functional workshops"], portfolio: [{ title: "Payments reconciliation", category: "Product design" }, { title: "Healthcare service blueprint", category: "Research" }] },
  { id: "benny", name: "Benny Asitonka-Joe", discipline: "Data and analytics", seniority: "Mid-level", location: "Accra, Ghana", rate: "$28/hr", availability: "Available now", skills: ["PostgreSQL", "dbt", "Python", "Metabase"], vetted: true, avatar: managerAvatar, experienceYears: 4, bio: "Analytics engineer who turns messy operational data into trusted models and practical dashboards.", highlights: ["Reduced reporting time by 70%", "Introduced tested analytics models", "Partnered with finance and operations"], portfolio: [{ title: "Revenue model rebuild", category: "Analytics" }] },
];

export const publicJobs: PublicJobDetail[] = [
  { id: "product-designer", company: "Oreno Labs", title: "Senior product designer", location: "Lagos, Nigeria", employmentType: "Full time", workplace: "Remote", compensation: "$2,800 – $3,600/month", skills: ["Product strategy", "Figma", "Research"], postedAt: "2 days ago", status: "Published", deadline: "October 18, 2026", description: "Shape hiring and workforce tools used by ambitious African companies and exceptional talent.", responsibilities: ["Lead discovery and product design from problem framing to release", "Partner with engineering and product on feasible solutions", "Improve and document the shared design system"], requirements: ["5+ years designing shipped digital products", "Strong interaction and visual design craft", "Clear written and spoken communication"] },
  { id: "frontend-engineer", company: "Kora Systems", title: "Frontend engineer", location: "Remote · Africa", employmentType: "Full time", workplace: "Remote", compensation: "$3,000 – $4,200/month", skills: ["React", "TypeScript", "Testing"], postedAt: "4 days ago", status: "Published", deadline: "October 25, 2026", description: "Build reliable customer and operations interfaces for a fast-growing payments platform.", responsibilities: ["Own production React features", "Improve performance and accessibility", "Collaborate on the component library"], requirements: ["Strong React and TypeScript experience", "Experience testing user interfaces", "Comfort working across time zones"] },
  { id: "growth-strategist", company: "Palm Studio", title: "Growth strategist", location: "Abuja, Nigeria", employmentType: "Contract", workplace: "Hybrid", compensation: "$2,000 – $2,700/month", skills: ["Growth", "Analytics", "Content"], postedAt: "1 week ago", status: "Published", deadline: "November 02, 2026", description: "Plan and measure practical growth programmes for a portfolio of technology products.", responsibilities: ["Run channel experiments", "Define useful acquisition reporting", "Work with brand and product teams"], requirements: ["3+ years in product-led growth", "Strong analytical judgment", "Excellent stakeholder communication"] },
];

export const companyJobs: JobRecord[] = [
  { id: "product-designer", title: "Senior product designer", department: "Design", openings: 2, applicants: 18, hiringManager: "Richard Benson", deadline: "Oct 18, 2026", compensation: "$2,800 – $3,600", status: "Published" },
  { id: "frontend-engineer", title: "Frontend engineer", department: "Engineering", openings: 3, applicants: 31, hiringManager: "Henry Cavill", deadline: "Oct 25, 2026", compensation: "$3,000 – $4,200", status: "Paused" },
  { id: "database-analyst", title: "Database analyst", department: "Data", openings: 1, applicants: 7, hiringManager: "Richard Benson", deadline: "Nov 05, 2026", compensation: "$2,400 – $3,000", status: "Draft" },
  { id: "motion-designer", title: "Motion graphics designer", department: "Design", openings: 1, applicants: 22, hiringManager: "Rejoice Okon", deadline: "Sep 20, 2026", compensation: "$2,000 – $2,700", status: "Closed" },
  { id: "growth-lead", title: "Growth lead", department: "Marketing", openings: 1, applicants: 16, hiringManager: "Sarima Chiorlu", deadline: "Aug 30, 2026", compensation: "$3,100 – $3,900", status: "Archived" },
];

export const applications: ApplicationRecord[] = [
  { id: "app-john", candidateId: "john-doe", candidateName: "John Doe C.", jobId: "frontend-engineer", jobTitle: "Frontend engineer", appliedAt: "Sep 18, 2026", status: "Interviewing", portfolio: "linktr.ee/johndoe", coverNote: "I enjoy building accessible products and reliable frontend systems.", statusHistory: [{ status: "Submitted", at: "Sep 18, 2026" }, { status: "Under review", at: "Sep 19, 2026" }, { status: "Shortlisted", at: "Sep 21, 2026" }, { status: "Interviewing", at: "Sep 23, 2026", note: "Technical interview scheduled" }] },
  { id: "app-chibuokem", candidateId: "chibuokem", candidateName: "Chibuokem Chiorlu", jobId: "product-designer", jobTitle: "Senior product designer", appliedAt: "Sep 16, 2026", status: "Shortlisted", portfolio: "linktr.ee/chibuokem", coverNote: "Operational products and design systems are the focus of my recent work.", statusHistory: [{ status: "Submitted", at: "Sep 16, 2026" }, { status: "Under review", at: "Sep 17, 2026" }, { status: "Shortlisted", at: "Sep 20, 2026" }] },
  { id: "app-benny", candidateId: "benny", candidateName: "Benny Asitonka-Joe", jobId: "database-analyst", jobTitle: "Database analyst", appliedAt: "Sep 12, 2026", status: "Under review", portfolio: "linktr.ee/benny", coverNote: "I build analytics foundations that teams can trust.", statusHistory: [{ status: "Submitted", at: "Sep 12, 2026" }, { status: "Under review", at: "Sep 14, 2026" }] },
];

export const shortlists: ShortlistRecord[] = [
  { id: "frontend-finalists", name: "Frontend finalists", jobTitle: "Frontend engineer", owner: "Richard Benson", candidateIds: ["john-doe", "chibuokem"], updatedAt: "Sep 23, 2026" },
  { id: "design-review", name: "Design portfolio review", jobTitle: "Senior product designer", owner: "Rejoice Okon", candidateIds: ["chibuokem", "benny"], updatedAt: "Sep 21, 2026" },
];

export const interviews: InterviewRecord[] = [
  { id: "interview-john", applicationId: "app-john", candidateName: "John Doe C.", jobTitle: "Frontend engineer", startsAt: "Sep 29, 2026 · 10:30 AM WAT", durationMinutes: 60, participants: ["Richard Benson", "Henry Cavill"], meetingUrl: "https://meet.example.com/oreno-john", status: "Scheduled" },
  { id: "interview-chibuokem", applicationId: "app-chibuokem", candidateName: "Chibuokem Chiorlu", jobTitle: "Senior product designer", startsAt: "Sep 24, 2026 · 2:00 PM WAT", durationMinutes: 45, participants: ["Rejoice Okon", "Richard Benson"], meetingUrl: "https://meet.example.com/oreno-design", status: "Completed", outcome: "Advance" },
];

export const offers: OfferRecord[] = [
  { id: "offer-chibuokem", applicationId: "app-chibuokem", candidateName: "Chibuokem Chiorlu", jobTitle: "Senior product designer", startDate: "Oct 19, 2026", compensation: "$3,400/month", workplace: "Remote", status: "Sent", terms: ["Full-time employment", "Three-month review period", "Equipment allowance", "20 paid leave days"] },
];

export const notifications: NotificationRecord[] = [
  { id: "note-1", title: "Interview scheduled", body: "John Doe C. is scheduled for Sep 29 at 10:30 AM WAT.", category: "Hiring", createdAt: "12 minutes ago", read: false, href: "/company/interviews/interview-john" },
  { id: "note-2", title: "Timesheet submitted", body: "Chibuokem Chiorlu submitted 40 regular hours.", category: "Work", createdAt: "1 hour ago", read: false, href: "/company/time" },
  { id: "note-3", title: "Offer viewed", body: "The Senior product designer offer was viewed by the candidate.", category: "Hiring", createdAt: "Yesterday", read: true, href: "/company/offers/offer-chibuokem" },
  { id: "note-4", title: "Payment record reconciled", body: "September payroll payment PR-2026-0904 is reconciled.", category: "Compensation", createdAt: "2 days ago", read: true, href: "/company/compensation/payments" },
];

export const timeEntries: TimeEntryRecord[] = [
  { id: "time-1", person: "John Doe C.", period: "Sep 14 – Sep 20", regularHours: 40, overtimeHours: 3, status: "Submitted", note: "Launch support on Friday" },
  { id: "time-2", person: "Chibuokem Chiorlu", period: "Sep 14 – Sep 20", regularHours: 40, overtimeHours: 0, status: "Approved" },
  { id: "time-3", person: "Benny Asitonka-Joe", period: "Sep 14 – Sep 20", regularHours: 36, overtimeHours: 0, status: "Submitted" },
];

export const paymentRecords: PaymentRecord[] = [
  { id: "payment-1", person: "John Doe C.", payrollPeriod: "September 2026", amount: "5,705.00", currency: "USD", methodDescription: "External bank transfer", externalReference: "PR-2026-0901", status: "Reconciled", paidAt: "Sep 25, 2026" },
  { id: "payment-2", person: "Chibuokem Chiorlu", payrollPeriod: "September 2026", amount: "6,080.00", currency: "USD", methodDescription: "External bank transfer", externalReference: "PR-2026-0902", status: "Recorded", paidAt: "Sep 25, 2026" },
  { id: "payment-3", person: "Benny Asitonka-Joe", payrollPeriod: "September 2026", amount: "4,320.00", currency: "USD", methodDescription: "External bank transfer", externalReference: "PR-2026-0903", status: "Pending confirmation" },
];

export const talentProfile: TalentProfileRecord = {
  id: "john-doe", name: "John Doe C.", headline: "Senior frontend engineer", bio: "I build accessible, maintainable product interfaces for growing teams.", location: "Lagos, Nigeria", rate: "$35/hr", availability: "Available in 2 weeks", profileCompletion: 88,
  skills: [{ name: "React", level: "Expert" }, { name: "TypeScript", level: "Advanced" }, { name: "Next.js", level: "Advanced" }, { name: "Accessibility", level: "Expert" }],
  experience: [{ id: "exp-1", role: "Senior frontend engineer", company: "Kora Systems", period: "2023 – present", summary: "Owns customer-facing web architecture and accessibility." }, { id: "exp-2", role: "Frontend engineer", company: "Mango Labs", period: "2020 – 2023", summary: "Built operations tools and a shared component library." }],
  education: [{ id: "edu-1", school: "University of Lagos", qualification: "BSc Computer Science", period: "2015 – 2019" }],
  certifications: [{ id: "cert-1", name: "Professional Scrum Master I", issuer: "Scrum.org", issuedAt: "2024" }],
  portfolio: [{ id: "portfolio-1", title: "Merchant operations dashboard", category: "Web application", url: "https://portfolio.example.com/merchant" }, { id: "portfolio-2", title: "Accessible component library", category: "Design system", url: "https://portfolio.example.com/system" }],
  vetting: { status: "Vetted", updatedAt: "Aug 12, 2026", publicLabel: "Oreno vetted" },
};

export const talentAccount: TalentAccountRecord = {
  id: "talent-account-john",
  profileId: "john-doe",
  email: "john@oreno.team",
  phone: "+234 (0)903-123-4567",
  emailVerified: true,
  status: "Active",
  createdAt: "August 04, 2026",
  lastSignedInAt: "Today at 09:42 WAT",
  security: { twoFactorEnabled: false, activeSessions: 2 },
  preferences: {
    jobAlerts: true,
    applicationUpdates: true,
    profileVisibility: "Oreno companies only",
    marketingEmails: false,
  },
};

export const companyTeamMembers: CompanyTeamMemberRecord[] = [
  {
    id: "team-member-john",
    placementId: "placement-john-2026",
    talentProfileId: "john-doe",
    companyId: "oreno-technologies",
    employeeId: "OR-2041",
    employmentTitle: "React developer",
    department: "Engineering",
    manager: "Richard Benson",
    startDate: "February 12, 2024",
    engagement: "Full time",
    status: "Active",
  },
];

export const taskDetails: TaskDetailRecord[] = [
  { id: "task-1", title: "Design homepage", description: "Create the final responsive homepage layout and document component states for handoff.", status: "To-do", priority: "High", startDate: "Sep 25, 2026", dueDate: "Sep 30, 2026", assignees: ["John Doe C.", "Chibuokem Chiorlu"], comments: [{ id: "comment-1", author: "Richard Benson", body: "Please include the empty and error states in the handoff.", createdAt: "Sep 25 · 9:14 AM" }, { id: "comment-2", author: "John Doe C.", body: "The responsive shell is ready for review.", createdAt: "Sep 25 · 11:02 AM" }] },
];

