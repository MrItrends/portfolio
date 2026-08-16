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

// Order = display order.
export const PROJECTS: Project[] = [
  { slug: "nomnom", title: "NomNom", category: "Prediction Markets", image: "/images/thumbs/nomnom.webp" },
  { slug: "moodoo", title: "Moodoo", category: "Wellbeing", image: "/images/thumbs/moodoo.webp" },
  { slug: "skillspace", title: "Skillspace", category: "HR Tech", image: "/images/thumbs/skillspace.webp" },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", image: "/images/thumbs/robolearn.webp" },
  { slug: "spal", title: "SPAL", category: "Fintech · AI", image: "/images/thumbs/spal.webp" },
  { slug: "nedi", title: "NEDI", category: "EdTech", image: "/images/thumbs/nedi.webp" },
  { slug: "relief-now", title: "Relief Now", category: "Healthtech", image: "/images/thumbs/relief-now.webp" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce", image: "/images/thumbs/anybuy.webp" },
  { slug: "elon-musk", title: "Elon Musk", category: "Branding · Web", image: "/images/thumbs/elon.webp", comingSoon: true },
  { slug: "bookhive", title: "Bookhive", category: "Consumer · Social", image: "/images/thumbs/bookhive.webp", comingSoon: true },
  { slug: "easyreceipt", title: "EasyReceipt", category: "Fintech", image: "/images/thumbs/easyreceipt.webp", comingSoon: true },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/thumbs/ecohol.webp", comingSoon: true },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);

// Two-digit index in display order, e.g. "05". Keeps case-study kickers in sync.
export const caseNumber = (slug: string) =>
  String(PROJECTS.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
