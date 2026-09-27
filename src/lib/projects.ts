export type Project = {
  slug: string;
  title: string;
  /** Domain tag shown under the title in the work index. */
  category: string;
  /** Cover image in /public. */
  image?: string;
  /** Landscape cover — spans two columns in the work grid (portrait spans one). */
  wide?: boolean;
  /** Marks the tile "coming soon" — shown with an overlay, not clickable. */
  comingSoon?: boolean;
};

// Order = display order.
export const PROJECTS: Project[] = [
  { slug: "nomnom", title: "NomNom", category: "Prediction Markets", image: "/images/decor/cover-nomnom.webp" },
  { slug: "moodoo", title: "Moodoo", category: "Wellbeing", image: "/images/decor/cover-moodoo.webp" },
  { slug: "skillspace", title: "Skillspace", category: "HR Tech", image: "/images/decor/cover-skillspace.webp", wide: true },
  { slug: "spal", title: "SPAL", category: "Fintech · AI", image: "/images/decor/cover-spal.webp" },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", image: "/images/decor/cover-robolearn.webp", wide: true },
  { slug: "bookhive", title: "Bookhive", category: "Consumer · Social", image: "/images/decor/cover-bookhive.webp", comingSoon: true },
  // Row: Relief Now, Elon Musk, Anybuy (2+1+1 = one full row).
  { slug: "relief-now", title: "Relief Now", category: "Healthtech", image: "/images/decor/cover-relief.webp", wide: true },
  { slug: "elon-musk", title: "Elon Musk", category: "Branding · Web", image: "/images/decor/cover-elon.webp", comingSoon: true },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce", image: "/images/decor/cover-anybuy.webp" },
  // Row: EasyReceipt, NEDI, Ecohol (1+2+1 = one full row).
  { slug: "easyreceipt", title: "EasyReceipt", category: "Fintech", image: "/images/decor/cover-easyreceipt.webp", comingSoon: true },
  { slug: "nedi", title: "NEDI", category: "EdTech", image: "/images/decor/cover-nedi.webp", wide: true },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/decor/cover-ecohol.webp", comingSoon: true },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);

// Two-digit index in display order, e.g. "05". Keeps case-study kickers in sync.
export const caseNumber = (slug: string) =>
  String(PROJECTS.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
