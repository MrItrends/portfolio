export type Build = {
  name: string;
  url: string;
  /** Optional one-liner: what it is / who it's for. */
  blurb?: string;
};

/** Live products built with AI — shown on the home page after the case studies. */
export const BUILDS: Build[] = [
  { name: "SPAL Biz", url: "https://spal-biz.vercel.app/" },
  { name: "SPAL Voice Transcriber", url: "https://spal-voice-transcriber.vercel.app/" },
  { name: "RoboLearn", url: "https://robolearn.nigenius.ng/" },
  { name: "JobFetcher", url: "https://jobfetcher-tau.vercel.app/" },
  { name: "Creative Mastery", url: "https://learn-design-and-motion.vercel.app/" },
  { name: "Multi-Hat — YouTube Growth Crew", url: "https://retrend-lake.vercel.app/" },
  { name: "The Test Tribe — Illustrated", url: "https://testtribedemo.vercel.app/" },
  { name: "Navigating Adult Life", url: "https://navigating-adult-life.vercel.app/" },
  { name: "Rallix", url: "https://app.rallix.ng/" },
];
