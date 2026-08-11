export type Project = {
  slug: string;
  title: string;
  /** Domain tag shown under the title in the work index. */
  category: string;
  /** Optional thumbnail in /public. Falls back to a placeholder panel. */
  image?: string;
};

// Order = display order. SPAL leads. Add projects over time.
export const PROJECTS: Project[] = [
  { slug: "spal", title: "SPAL", category: "Fintech · AI", image: "/images/thumbs/spal.webp" },
  { slug: "moodoo", title: "Moodoo", category: "Wellbeing", image: "/images/thumbs/moodoo.webp" },
  { slug: "relief-now", title: "Relief Now", category: "Healthtech", image: "/images/thumbs/relief-now.webp" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce", image: "/images/thumbs/anybuy.webp" },
  { slug: "nedi", title: "NEDI", category: "EdTech", image: "/images/thumbs/nedi.webp" },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", image: "/images/thumbs/robolearn.webp" },
  { slug: "create-receipt", title: "Create Receipt", category: "Fintech", image: "/images/thumbs/create-receipt.webp" },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/thumbs/ecohol.webp" },
  { slug: "skillspace", title: "Skillspace", category: "HR Tech", image: "/images/thumbs/skillspace.webp" },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);
