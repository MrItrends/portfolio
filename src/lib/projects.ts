export type Project = {
  slug: string;
  title: string;
  /** Domain tag shown under the title in the work index. */
  category: string;
  /** Optional thumbnail in /public. Falls back to a placeholder panel. */
  image?: string;
  /** Marks the tile "coming soon" — shown with an overlay, not clickable. */
  comingSoon?: boolean;
};

// Order = display order. SPAL leads. Add projects over time.
export const PROJECTS: Project[] = [
  { slug: "spal", title: "SPAL", category: "Fintech · AI", image: "/images/thumbs/spal.webp" },
  { slug: "moodoo", title: "Moodoo", category: "Wellbeing", image: "/images/thumbs/moodoo.webp" },
  { slug: "relief-now", title: "Relief Now", category: "Healthtech", image: "/images/thumbs/relief-now.webp" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce", image: "/images/thumbs/anybuy.webp" },
  { slug: "nedi", title: "NEDI", category: "EdTech", image: "/images/thumbs/nedi.webp" },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", image: "/images/thumbs/robolearn.webp" },
  { slug: "easyreceipt", title: "EasyReceipt", category: "Fintech", image: "/images/thumbs/easyreceipt.webp", comingSoon: true },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/thumbs/ecohol.webp", comingSoon: true },
  { slug: "skillspace", title: "Skillspace", category: "HR Tech", image: "/images/thumbs/skillspace.webp" },
  { slug: "nomnom", title: "NomNom", category: "Prediction Markets", image: "/images/thumbs/nomnom.webp" },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);
