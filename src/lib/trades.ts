export const TRADES = [
  "Plumber",
  "Electrician",
  "Builder",
  "Landscaper",
  "Painter",
  "Carpenter",
  "Roofer",
  "Other",
] as const;

export type Trade = (typeof TRADES)[number];
