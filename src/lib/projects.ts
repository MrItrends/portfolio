export type Project = {
  slug: string;
  title: string;
  /** Placeholder discipline tags — confirm/replace with real ones. */
  category: string;
  /** Optional thumbnail in /public. Falls back to a placeholder panel. */
  image?: string;
};

// Order = display order. SPAL leads. Add projects over time.
export const PROJECTS: Project[] = [
  { slug: "spal", title: "SPAL", category: "Fintech · AI", image: "/images/thumbs/spal.webp" },
  { slug: "moodoo", title: "Moodoo", category: "Product Design", image: "/images/thumbs/moodoo.webp" },
  { slug: "relief-now", title: "Relief Now", category: "Social Impact", image: "/images/thumbs/relief-now.webp" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce", image: "/images/thumbs/anybuy.webp" },
  { slug: "nedi", title: "NEDI", category: "EdTech", image: "/images/thumbs/nedi.webp" },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", image: "/images/thumbs/robolearn.webp" },
  { slug: "create-receipt", title: "Create Receipt", category: "Fintech", image: "/images/thumbs/create-receipt.webp" },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/thumbs/ecohol.webp" },
  { slug: "skillspace", title: "Skillspace", category: "EdTech", image: "/images/thumbs/skillspace.webp" },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);
