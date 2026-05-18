export type SectionKey =
  | "profile_photo"
  | "call_button"
  | "whatsapp_button"
  | "availability_status"
  | "about_me"
  | "services"
  | "gallery"
  | "before_after"
  | "certifications"
  | "google_reviews"
  | "quote_form"
  | "areas_covered"
  | "payment_methods"
  | "facebook"
  | "emergency_button"
  | "intro_video";

export type SectionDef = {
  key: SectionKey;
  label: string;
  description: string;
  paidOnly?: boolean;
};

export const SECTION_DEFS: SectionDef[] = [
  { key: "profile_photo", label: "Profile photo", description: "Your headshot at the top of the page" },
  { key: "call_button", label: "Call button", description: "Big green tap-to-call button" },
  { key: "whatsapp_button", label: "WhatsApp button", description: "Open a chat in one tap" },
  { key: "availability_status", label: "Availability status", description: "Taking on work / fully booked badge" },
  { key: "about_me", label: "About me", description: "Two-line intro" },
  { key: "services", label: "Services list", description: "What you do" },
  { key: "gallery", label: "Photo gallery", description: "Show off your work" },
  { key: "before_after", label: "Before & after", description: "Side by side transformations" },
  { key: "certifications", label: "Certifications & badges", description: "Gas Safe, NICEIC, etc." },
  { key: "google_reviews", label: "Google reviews link", description: "Send customers to leave a review" },
  { key: "quote_form", label: "Quote request form", description: "Capture leads with photos" },
  { key: "areas_covered", label: "Areas covered", description: "Towns and postcodes you serve" },
  { key: "payment_methods", label: "Payment methods", description: "Cash, card, bank transfer" },
  { key: "facebook", label: "Facebook page", description: "Link to your Facebook business page" },
  { key: "emergency_button", label: "Emergency callout button", description: "24/7 emergency line", paidOnly: true },
  { key: "intro_video", label: "Intro video", description: "30-second clip introducing yourself", paidOnly: true },
];

export const DEFAULT_ENABLED: SectionKey[] = [
  "profile_photo",
  "call_button",
  "whatsapp_button",
  "availability_status",
  "about_me",
  "services",
  "gallery",
  "certifications",
  "quote_form",
  "areas_covered",
];

export function sectionDef(key: SectionKey): SectionDef | undefined {
  return SECTION_DEFS.find((s) => s.key === key);
}
