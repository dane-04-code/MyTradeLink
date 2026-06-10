import type { AccountGoal } from "@/lib/db/schema";

export type SectionKey =
  | "profile_photo"
  | "banner_image"
  | "call_button"
  | "whatsapp_button"
  | "availability_status"
  | "about_me"
  | "services_list"
  | "photo_gallery"
  | "before_after_photos"
  | "certifications"
  | "testimonials"
  | "google_reviews"
  | "quote_form"
  | "areas_covered"
  | "payment_methods"
  | "facebook_link"
  | "instagram_link"
  | "tiktok_link"
  | "emergency_callout"
  | "intro_video"
  | "education"
  | "skills"
  | "email_button";

export type SectionDef = {
  key: SectionKey;
  label: string;
  description: string;
  paidOnly?: boolean;
  goals: AccountGoal[]; // which account goals show this section
};

export type SectionGroup = {
  id: string;
  title: string;
  blurb: string;
  keys: SectionKey[];
};

export const SECTION_DEFS: SectionDef[] = [
  { key: "banner_image", label: "Banner image", description: "Wide hero photo behind your profile picture", goals: ["business", "looking_for_work"] },
  { key: "profile_photo", label: "Profile photo", description: "Your headshot at the top of the page", goals: ["business", "looking_for_work"] },
  { key: "call_button", label: "Call button", description: "Big green tap-to-call button", goals: ["business", "looking_for_work"] },
  { key: "whatsapp_button", label: "WhatsApp button", description: "Open a chat in one tap", goals: ["business", "looking_for_work"] },
  { key: "availability_status", label: "Availability status", description: "Taking on work / fully booked badge", goals: ["business", "looking_for_work"] },
  { key: "about_me", label: "About me", description: "Two-line intro", goals: ["business", "looking_for_work"] },
  { key: "services_list", label: "Services list", description: "What you do", goals: ["business"] },
  { key: "photo_gallery", label: "Photo gallery", description: "Show off your work", goals: ["business", "looking_for_work"] },
  { key: "before_after_photos", label: "Before & after photos", description: "Side by side transformations", goals: ["business"] },
  { key: "certifications", label: "Certifications & badges", description: "Gas Safe, NICEIC, etc.", goals: ["business", "looking_for_work"] },
  { key: "testimonials", label: "Customer reviews", description: "Quotes from happy customers", goals: ["business"] },
  { key: "google_reviews", label: "Google reviews link", description: "Send customers to leave a review", goals: ["business"] },
  { key: "quote_form", label: "Quote request form", description: "Capture leads with photos", paidOnly: true, goals: ["business"] },
  { key: "areas_covered", label: "Areas covered", description: "Towns and postcodes you serve", goals: ["business"] },
  { key: "payment_methods", label: "Payment methods", description: "Cash, card, bank transfer", goals: ["business"] },
  { key: "facebook_link", label: "Facebook", description: "Link to your Facebook business page", goals: ["business"] },
  { key: "instagram_link", label: "Instagram", description: "Link to your Instagram profile", goals: ["business"] },
  { key: "tiktok_link", label: "TikTok", description: "Link to your TikTok profile", goals: ["business"] },
  { key: "emergency_callout", label: "Emergency callout button", description: "24/7 emergency line", paidOnly: true, goals: ["business"] },
  { key: "intro_video", label: "Intro video", description: "30-second clip introducing yourself", paidOnly: true, goals: ["business", "looking_for_work"] },
  { key: "education", label: "Training & education", description: "College, course, years", goals: ["looking_for_work"] },
  { key: "skills", label: "Skills", description: "What you can do on the tools", goals: ["looking_for_work"] },
  { key: "email_button", label: "Email button", description: "Let employers email you", goals: ["looking_for_work"] },
];

/**
 * Logical groupings shown in the dashboard accordion. Order of groups is
 * fixed; order within a group is the user's drag order.
 */
export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: "identity",
    title: "Identity",
    blurb: "Banner, photo, availability.",
    keys: ["banner_image", "profile_photo", "availability_status"],
  },
  {
    id: "contact",
    title: "Contact",
    blurb: "How customers reach you in one tap.",
    keys: ["call_button", "whatsapp_button", "emergency_callout"],
  },
  {
    id: "trust",
    title: "Trust",
    blurb: "What makes you legit at a glance.",
    keys: ["about_me", "certifications", "testimonials", "google_reviews"],
  },
  {
    id: "work",
    title: "Show your work",
    blurb: "Services, photos, intro video.",
    keys: ["services_list", "photo_gallery", "before_after_photos", "intro_video"],
  },
  {
    id: "leads",
    title: "Capture leads",
    blurb: "Let customers send a quote request.",
    keys: ["quote_form"],
  },
  {
    id: "social",
    title: "Social & links",
    blurb: "Socials, areas covered, payment options.",
    keys: ["facebook_link", "instagram_link", "tiktok_link", "areas_covered", "payment_methods"],
  },
];

export const DEFAULT_ENABLED: SectionKey[] = [
  "profile_photo",
  "call_button",
  "whatsapp_button",
  "availability_status",
  "about_me",
  "services_list",
  "photo_gallery",
  "certifications",
  "areas_covered",
];

export const LFW_SECTION_GROUPS: SectionGroup[] = [
  { id: "identity", title: "You", blurb: "Photo, trade, availability.",
    keys: ["banner_image", "profile_photo", "availability_status"] },
  { id: "credibility", title: "Proof", blurb: "Quals, training, skills.",
    keys: ["about_me", "certifications", "education", "skills"] },
  { id: "work", title: "Your work", blurb: "Photos and intro video.",
    keys: ["photo_gallery", "intro_video"] },
  { id: "contact", title: "Get hired", blurb: "How employers reach you.",
    keys: ["call_button", "whatsapp_button", "email_button"] },
];

export const LFW_DEFAULT_ENABLED: SectionKey[] = [
  "profile_photo", "availability_status", "about_me", "certifications",
  "education", "skills", "photo_gallery", "call_button", "whatsapp_button",
  "email_button",
];

export function sectionDefsForGoal(goal: AccountGoal): SectionDef[] {
  return SECTION_DEFS.filter((d) => d.goals.includes(goal));
}
export function sectionGroupsForGoal(goal: AccountGoal): SectionGroup[] {
  return goal === "looking_for_work" ? LFW_SECTION_GROUPS : SECTION_GROUPS;
}
export function defaultEnabledForGoal(goal: AccountGoal): SectionKey[] {
  return goal === "looking_for_work" ? LFW_DEFAULT_ENABLED : DEFAULT_ENABLED;
}

export function sectionDef(key: SectionKey): SectionDef | undefined {
  return SECTION_DEFS.find((s) => s.key === key);
}

export function groupForKey(key: SectionKey): SectionGroup | undefined {
  return SECTION_GROUPS.find((g) => g.keys.includes(key));
}
