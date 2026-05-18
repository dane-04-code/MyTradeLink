export type Theme = {
  id: string;
  label: string;
  accent: string;
  hint: string;
};

/**
 * Five preset accents shown as swatches in the dashboard theme picker.
 * The first entry ("builder" / #F97316) is the PRD default and the schema
 * default on users.accentColor.
 */
export const THEME_PRESETS: Theme[] = [
  { id: "builder", label: "Builder", accent: "#F97316", hint: "Trades orange (default)" },
  { id: "grass", label: "Grass", accent: "#16A34A", hint: "Landscapers, gardeners" },
  { id: "hi-vis", label: "Hi-vis", accent: "#EAB308", hint: "Road, construction" },
  { id: "sparky", label: "Sparky", accent: "#2563EB", hint: "Electricians, gas" },
  { id: "brick", label: "Brick", accent: "#DC2626", hint: "Bold, alarm-firms" },
];

export const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function findPreset(accent: string | null | undefined): Theme | undefined {
  if (!accent) return THEME_PRESETS[0];
  const normalised = accent.toLowerCase();
  return THEME_PRESETS.find((t) => t.accent.toLowerCase() === normalised);
}
