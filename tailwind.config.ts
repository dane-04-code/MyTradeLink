import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F97316",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        ink: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
        },
        line: "#E2E8F0",
        muted: "#F8FAFC",
        // Functional accents per BRAND.md §3 — never themed, fixed by spec.
        call: "#16A34A",
        whatsapp: "#25D366",
        emergency: "#DC2626",
        star: "#FACC15",
        fb: "#1877F2",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        // Landing-page headline face — variable set on the landing <main>
        // only, falls back to the global display font everywhere else.
        "display-2": [
          "var(--font-display-landing)",
          "var(--font-display)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Brand signature — hard 4px ink shadow, no blur. Pairs with translateY-on-press.
        hard: "0 4px 0 0 #0F172A",
        "hard-brand": "0 4px 0 0 #F97316",
        "hard-sm": "0 2px 0 0 #0F172A",
        press: "0 0 0 0 #0F172A",
        // Legacy — kept for the 404 page only. Avoid in new code.
        card: "0 8px 30px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        // 45° hazard hatch — used for Pro/premium callouts per BRAND.md §5.3.
        hatch:
          "repeating-linear-gradient(45deg, #F97316 0 6px, transparent 6px 18px)",
        // Faint blueprint grid for dark surfaces per BRAND.md §5.2.
        "grid-light":
          "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
    },
  },
  plugins: [],
};

export default config;
