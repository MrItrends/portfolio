export type Build = {
  name: string;
  url: string;
  /** One line: what it is and who it's for. */
  blurb: string;
  /** Real-world signal, shown as a tag. Only what's been verified by the owner. */
  stat?: string;
};

/** Products built with AI — shown on the home page after the case studies.
 *  Ordered by traction. None of these have been promoted: usage is word of mouth. */
export const BUILDS: Build[] = [
  {
    name: "RoboLearn",
    url: "https://robolearn.nigenius.ng/",
    blurb:
      "Beginner robotics for students, schools and tutors — learn and practise in a virtual lab, then take on challenges.",
    stat: "500+ students",
  },
  {
    name: "Navigating Adult Life",
    url: "https://navigating-adult-life.vercel.app/",
    blurb:
      "A game about adult life with an NPC main character — play it as a story or as an endless runner.",
    stat: "100+ players",
  },
  {
    name: "SPAL Biz",
    url: "https://spal-biz.vercel.app/",
    blurb:
      "Helps small businesses track sales, expenses and who owes them money, and chat about the business to get advice when sales are slow.",
    stat: "80+ people tried it",
  },
  {
    name: "JobFetcher",
    url: "https://jobfetcher-tau.vercel.app/",
    blurb:
      "Job search that cuts the noise: tell it what you want and get two or three tailored roles from the last 7 days, not 100 random ones.",
    stat: "20+ users",
  },
  {
    name: "Rallix",
    url: "https://app.rallix.ng/",
    blurb: "The app for my table tennis club, used by its members.",
    stat: "Live with a club",
  },
  {
    name: "Multi-Hat — YouTube Growth Crew",
    url: "https://retrend-lake.vercel.app/",
    blurb:
      "Pick a role — content strategist, for example — and the AI plays that teammate, analysing your YouTube channel and giving feedback in character.",
  },
  {
    name: "SPAL Voice Transcriber",
    url: "https://spal-voice-transcriber.vercel.app/",
    blurb:
      "Turns meeting recordings into text, and can join your meetings and transcribe them automatically.",
  },
  {
    name: "Creative Mastery",
    url: "https://learn-design-and-motion.vercel.app/",
    blurb:
      "A place to learn design and motion, growing into a broader learning platform.",
  },
  {
    name: "The Test Tribe — Illustrated",
    url: "https://testtribedemo.vercel.app/",
    blurb:
      "Client project in progress: part of the site designed, then built with AI to show how a guided AI stays consistent and tailor-made.",
    stat: "Client work",
  },
];
