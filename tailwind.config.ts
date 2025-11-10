import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        foreground: "var(--foreground)",
        brand: {
          blue: "#3B82F6",
          electric: "#1E40FF",
          cyan: "#06B6D4",
        },
        background: {
          light: "#F9FAFB",
          dark: "#050505",
          darker: "#000000",
          cardDark: "#0D0D0D",
          cardLight: "#FFFFFF",
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB",
          mutedLight: "#4B5563",
          mutedDark: "#9CA3AF",
        },
        border: {
          light: "#E5E7EB",
          dark: "#1C1C1C",
        },
        glow: {
          blue: "rgba(59,130,246,0.25)",
          cyan: "rgba(6,182,212,0.25)",
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
