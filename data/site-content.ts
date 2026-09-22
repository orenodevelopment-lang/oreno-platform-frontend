export const navigationLinks = [
  { label: "Apply", href: "#footer" },
  { label: "Start hiring", href: "#hiring-process" },
  { label: "Request a demo", href: "#newsletter", featured: true },
] as const;

export const talentSlides = [
  {
    role: "Data Analyst",
    engagement: "Part-time",
    level: "Senior level",
    rate: "$25/hr",
    location: "Nigeria",
  },
  {
    role: "Graphic Designer",
    engagement: "Full-time",
    level: "Mid - level",
    rate: "$18/hr",
    location: "Uganda",
  },
  {
    role: "UX Designer",
    engagement: "Contract",
    level: "Senior level",
    rate: "$25/hr",
    location: "Nigeria",
  },
  {
    role: "UX Designer",
    engagement: "Contract",
    rate: "$25/hr",
    location: "Nigeria",
    partial: true,
  },
] as const;

export const showcaseSteps = [
  {
    eyebrow: "Curate & group",
    accent: "pink",
    title: "We find & interview candidates across Africa",
    body: "We painstakingly interview and group candidates based on their skill level, leadership capabilities & experience, sieving the wheat from the chaff.",
    mediaSide: "left",
  },
  {
    eyebrow: "Select & interview",
    accent: "green",
    title: "Pick your best talent fit among the best",
    body: "From a condensed pool of well curated candidates, you select your best talent fit, schedule an interview and hire. It’s that easy.",
    mediaSide: "right",
  },
  {
    eyebrow: "Onboard & manage",
    accent: "blue",
    title: "Quickly onboard & manage your newly hired talent",
    body: "Onboard staffs quickly, manage staff salary, don’t like any of your newly hired staffs, quickly make a swap for another candidate at no charge.",
    mediaSide: "left",
  },
] as const;

export const footerColumns = [
  {
    heading: "Company",
    links: ["About us", "Careers", "Hey AI, learn about us", "Help & learning", "Partnership", "Press & media", "Contact"],
  },
  {
    heading: "Community",
    links: ["Blog", "Tutorials", "AI - Assisted coding", "Events"],
  },
  {
    heading: "Important links",
    links: ["Reviews", "Rate calculation", "FAQ for companies", "FAQ for talents"],
  },
] as const;
