export const TRADES = [
  "Plumber",
  "Electrician",
  "Builder",
  "Landscaper",
  "Painter",
  "Carpenter",
  "Roofer",
  "Gas Fitter",
  "Tiler",
  "Plasterer",
  "Other",
] as const;

export type Trade = (typeof TRADES)[number];
