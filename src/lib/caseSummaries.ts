export type CaseSummaryData = {
  /** The problem, in one or two sentences. */
  problem: string;
  /** What I did — the scope of the design work. */
  did: string;
  /** What came of it. Only facts stated in the case study or by the owner. */
  result: string;
};

/** Results-first summary shown at the top of every case study (the 30-second read). */
export const CASE_SUMMARIES: Record<string, CaseSummaryData> = {
  nedi: {
    problem:
      "Nigeria needed one national education-data platform — a single source of truth from early years to tertiary — usable by officials, schools, edtech companies, donors and analysts.",
    did: "Designed the full MVP: onboarding that routes six user types to their own dashboard, a government dashboard across eight data areas, an AI sandbox for questions about the education system, and an edtech portal for schools.",
    result:
      "The MVP was presented to the Vice President of Nigeria. It is now with the Federal Government.",
  },
  spal: {
    problem:
      "Small business owners track sales and expenses in their heads or on scraps of paper, and found accounting software too complex.",
    did: "Researched with real sellers, designed the product and brand, then built it with Claude: voice, text or image data entry, simple insights, and Spark, an AI partner you can ask about your numbers.",
    result:
      "80+ people have tried it and 10+ are on the beta. A supermarket in Abuja said it would adopt a desktop version with inventory.",
  },
  nomnom: {
    problem:
      "People who enjoy financial risk wanted prediction markets that feel like the social apps they already use, not a heavy trading screen.",
    did: "Designed the app end to end as a sub-contractor: interest-based onboarding, user-created markets with time-based odds, comments and a leaderboard, wallet funding by card, Coinbase and MoonPay, and smart nudges.",
    result:
      "In-house testing with the client's community gave good feedback, which let the team proceed to developer handoff. Built for a US client; not yet live.",
  },
  skillspace: {
    problem:
      "Technical hiring managers juggle overly complex tools or test-only platforms, leaving the rest of the hiring process unaddressed.",
    did: "Researched the hiring process and competitors, built personas and journey maps, and designed the design system and high-fidelity screens so recruiters can run the whole hiring cycle in one place.",
    result:
      "Delivered the design system and high-fidelity designs for the platform.",
  },
  moodoo: {
    problem:
      "Teams asked about moods in standups, but the data was lost afterwards, so patterns over weeks and months were invisible.",
    did: "Researched burnout-prone teams and designed a mandala-based daily check-in (from the valence–arousal emotion model), individual and team dashboards, and anonymous mood-lifting.",
    result:
      "Running as an internal tool for the organisation, with a public release for other organisations planned.",
  },
  anybuy: {
    problem:
      "Pre-loved marketplaces feel disorganised: buyers get lost in choice and often don't receive what was advertised.",
    did: "Designed an escrow flow with a PIN handoff between buyer and rider, clear category browsing with smart search, and an auction feature, then built it with Claude.",
    result: "A working version built with Claude.",
  },
  "relief-now": {
    problem:
      "Top athletes and high-profile patients in New York needed to trust a clinic quickly and book without friction.",
    did: "Designed the marketing site: a homepage built for fast trust, pain-specific treatment pages, a guided three-step booking form and landing pages for social ads.",
    result:
      "The booking form gave clinicians useful patient information before the first visit, and has since been simplified.",
  },
  robolearn: {
    problem:
      "Kids and teenagers wanted to learn robotics on their own, with a guided path from the basics.",
    did: "Designed progressive modules with lessons, quizzes and badges, daily challenges, a drag-and-drop virtual builder, the Davinci AI assistant, game-style interactions and a community leaderboard.",
    result: "500+ students are using it.",
  },
};
