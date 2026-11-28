export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.joshuajumbo.com"
).replace(/\/$/, "");

export const RESUME_URL =
  "https://drive.google.com/file/d/1HiwxVZHbhg37MiNFBmEBiKmhSVLSZSCw/view?usp=sharing";

export const BOOKING_URL =
  "https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true";

export const LINKEDIN_URL = "https://www.linkedin.com/in/joshuajumbo91/";

/** Set this to show a plain "Email me" link in the hero, About and footer. */
export const CONTACT_EMAIL = "jumbojoshua91@gmail.com";

export const SITE = {
  name: "Joshua Jumbo",
  title: "Product Designer",
  resumeUrl: RESUME_URL,
  bookUrl: BOOKING_URL,
  linkedinUrl: LINKEDIN_URL,
  email: CONTACT_EMAIL,
} as const;

export const mailto = () => (CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : null);
