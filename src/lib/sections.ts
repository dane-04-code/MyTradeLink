export type SectionKey =
  | "profile_photo"
  | "call_button"
  | "whatsapp_button"
  | "availability_status"
  | "about_me"
  | "services_list"
  | "photo_gallery"
  | "before_after_photos"
  | "certifications"
  | "google_reviews"
  | "quote_form"
  | "areas_covered"
  | "payment_methods"
  | "facebook_link"
  | "emergency_callout"
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
  { key: "services_list", label: "Services list", description: "What you do" },
  { key: "photo_gallery", label: "Photo gallery", description: "Show off your work" },
  { key: "before_after_photos", label: "Before & after photos", description: "Side by side transformations" },
  { key: "certifications", label: "Certifications & badges", description: "Gas Safe, NICEIC, etc." },
  { key: "google_reviews", label: "Google reviews link", description: "Send customers to leave a review" },
  { key: "quote_form", label: "Quote request form", description: "Capture leads with photos", paidOnly: true },
  { key: "areas_covered", label: "Areas covered", description: "Towns and postcodes you serve" },
  { key: "payment_methods", label: "Payment methods", description: "Cash, card, bank transfer" },
  { key: "facebook_link", label: "Facebook page", description: "Link to your Facebook business page" },
  { key: "emergency_callout", label: "Emergency callout button", description: "24/7 emergency line", paidOnly: true },
  { key: "intro_video", label: "Intro video", description: "30-second clip introducing yourself", paidOnly: true },
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

export function sectionDef(key: SectionKey): SectionDef | undefined {
  return SECTION_DEFS.find((s) => s.key === key);
}
