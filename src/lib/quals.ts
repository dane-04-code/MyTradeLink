export type QualCountry = "UK" | "AU";

export const QUALS_BY_COUNTRY: Record<QualCountry, string[]> = {
  UK: [
    "NVQ Level 2",
    "NVQ Level 3",
    "City & Guilds",
    "CSCS Card",
    "18th Edition",
    "Gas Safe Registered",
    "ECS Card",
    "Part P",
  ],
  AU: [
    "White Card",
    "Cert III (Trade)",
    "State Trade Licence",
    "Working at Heights",
    "Test & Tag",
    "First Aid",
    "EWP Licence",
  ],
};

export const QUAL_COUNTRIES: QualCountry[] = ["UK", "AU"];
