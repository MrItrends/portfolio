export type Project = {
  slug: string;
  title: string;
  /** Placeholder discipline tags — confirm/replace with real ones. */
  category: string;
};

// Order = display order. SPAL leads. Add projects over time.
export const PROJECTS: Project[] = [
  { slug: "spal", title: "SPAL", category: "Fintech · AI" },
  { slug: "moodoo", title: "Moodoo", category: "Product Design" },
  { slug: "relief-now", title: "Relief Now", category: "Social Impact" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce" },
  { slug: "nigenius", title: "NiGenius", category: "EdTech" },
  { slug: "robolearn-v1", title: "RoboLearn v1", category: "EdTech · Robotics" },
  { slug: "robolearn-v2", title: "RoboLearn v2", category: "EdTech · Robotics" },
  { slug: "events-planner", title: "Events Planner", category: "Events" },
  { slug: "skillspace", title: "Skillspace", category: "EdTech" },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);
