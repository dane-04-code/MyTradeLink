/**
 * UK tradesman trades, shown in the onboarding picker.
 *
 * Top six are the highest-volume residential trades and are listed first
 * for fast picks; the rest are alphabetical. "Other" lives at the end as
 * the escape hatch for niche trades we haven't named.
 */
export const TRADES = [
  // Most common — top of the picker
  "Plumber",
  "Electrician",
  "Builder",
  "Painter & Decorator",
  "Carpenter / Joiner",
  "Roofer",

  // Specialists — alphabetical
  "AC / Refrigeration Engineer",
  "Aerial / Satellite Installer",
  "Bathroom Fitter",
  "Bricklayer",
  "Cleaner",
  "Damp Proofing Specialist",
  "Drainage Specialist",
  "Driveway / Paving Specialist",
  "Fencer",
  "Gardener",
  "Gas Engineer",
  "Glazier / Window Fitter",
  "Handyman",
  "Heating Engineer",
  "Kitchen Fitter",
  "Landscaper",
  "Locksmith",
  "Pest Control",
  "Plasterer",
  "Removals / Man with a Van",
  "Scaffolder",
  "Solar / EV Charger Installer",
  "Stonemason",
  "Tiler",
  "Tree Surgeon",
  "Window Cleaner",

  "Other",
] as const;

export type Trade = (typeof TRADES)[number];
