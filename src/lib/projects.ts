export type Project = {
  slug: string;
  title: string;
  /** Domain tag shown under the title in the work index. */
  category: string;
  /** One line: what it is and what you did — shown on the home page. */
  blurb?: string;
  /** Your role on the project. */
  role?: string;
  /** Cover image in /public. */
  image?: string;
  /** Landscape cover — spans two columns in the work grid (portrait spans one). */
  wide?: boolean;
  /** Marks the tile "coming soon" — shown with an overlay, not clickable. */
  comingSoon?: boolean;
};

// Order = display order (strongest proof first). Coming-soon entries stay at
// the end and are not shown on the home page until they are ready.
export const PROJECTS: Project[] = [
  { slug: "nedi", title: "NEDI", category: "EdTech · Government", blurb: "National education-data platform for Nigeria. Designed the MVP, presented to the Vice President.", role: "Product Designer", image: "/images/decor/cover-nedi.webp", wide: true },
  { slug: "spal", title: "SPAL", category: "Fintech · AI", blurb: "AI sales and expense app for small businesses. Designed, built and tried by 80+ people.", role: "Product Designer", image: "/images/decor/cover-spal.webp" },
  { slug: "nomnom", title: "NomNom", category: "Prediction Markets", blurb: "Prediction-market app where users bet yes or no on real events. Prototype tested, then handed to developers.", role: "Product Designer", image: "/images/decor/cover-nomnom.webp" },
  { slug: "skillspace", title: "Skillspace", category: "HR Tech", blurb: "Hiring platform that lets technical hiring managers run recruitment end to end, with no third-party tools.", role: "Product Designer", image: "/images/decor/cover-skillspace.webp", wide: true },
  { slug: "moodoo", title: "Moodoo", category: "Wellbeing", blurb: "Mood-tracking app that shows managers how their team is doing before burnout hits.", role: "Product Designer", image: "/images/decor/cover-moodoo.webp" },
  { slug: "anybuy", title: "Anybuy", category: "E-commerce · AI experiment", blurb: "Pre-loved marketplace concept built with AI as an experiment: escrow and PIN handoff so what you buy is what you get. Not launched.", role: "Product Designer", image: "/images/decor/cover-anybuy.webp" },
  { slug: "relief-now", title: "Relief Now", category: "Healthtech", blurb: "Booking platform for non-surgical pain relief for athletes and high-profile patients in New York.", role: "Product Designer", image: "/images/decor/cover-relief.webp", wide: true },
  { slug: "robolearn", title: "RoboLearn", category: "EdTech · Robotics", blurb: "Guided robotics learning for kids and teens, with modules, daily challenges and a leaderboard.", role: "Product Designer", image: "/images/decor/cover-robolearn.webp", wide: true },
  { slug: "bookhive", title: "Bookhive", category: "Consumer · Social", image: "/images/decor/cover-bookhive.webp", comingSoon: true },
  { slug: "elon-musk", title: "Elon Musk", category: "Branding · Web", image: "/images/decor/cover-elon.webp", comingSoon: true },
  { slug: "easyreceipt", title: "EasyReceipt", category: "Fintech", image: "/images/decor/cover-easyreceipt.webp", comingSoon: true },
  { slug: "ecohol", title: "Ecohol", category: "Events", image: "/images/decor/cover-ecohol.webp", comingSoon: true },
];

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);

// Two-digit index in display order, e.g. "05". Keeps case-study kickers in sync.
export const caseNumber = (slug: string) =>
  String(PROJECTS.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
