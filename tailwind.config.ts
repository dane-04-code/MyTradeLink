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
          DEFAULT: "#FF6B00",
          50: "#FFF3E8",
          100: "#FFE3CC",
          200: "#FFC899",
          300: "#FFA866",
          400: "#FF8833",
          500: "#FF6B00",
          600: "#CC5500",
          700: "#993F00",
          800: "#662A00",
          900: "#331500",
        },
        ink: {
          900: "#0B0B0F",
          800: "#15151C",
          700: "#1F1F2A",
          600: "#2A2A38",
          500: "#3A3A4C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.08)",
        glow: "0 0 60px rgba(255,107,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
