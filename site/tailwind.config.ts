import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";


const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#05090d",
        navy: "#0a1620",
        ocean: "#0d2138",
        "ocean-2": "#14324f",
        tide: "#1b4669",
        paper: "#e8e4d8",
        "paper-dim": "#c9c4b6",
        muted: "#7a8b9a",
        accent: "var(--hm-accent)",
        "accent-dim": "var(--hm-accent-dim)",
      },
      borderColor: {
        rule: "rgba(232, 228, 216, 0.12)",
        "rule-strong": "rgba(232, 228, 216, 0.22)",
      },
      backgroundColor: {
        rule: "rgba(232, 228, 216, 0.12)",
        "rule-strong": "rgba(232, 228, 216, 0.22)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        kicker: "0.24em",
        nav: "0.14em",
        meta: "0.2em",
        wide: "0.18em",
        tighter: "-0.02em",
      },
      transitionTimingFunction: {
        hm: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        "hm-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "hm-pulse": "hm-pulse 1800ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
        "hm-ken-burns": "hm-ken-burns 40s ease-in-out infinite alternate",
        "hm-scan": "hm-scan 14s linear infinite",
        "hm-sweep": "hm-sweep 6s linear infinite",
        "hm-drift": "hm-drift 2400ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
        "hm-viz": "hm-viz 900ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite alternate",
      },
      keyframes: {
        "hm-pulse": {
          "0%": { boxShadow: "0 0 0 0 oklch(0.78 0.18 145 / 0.5)" },
          "70%": { boxShadow: "0 0 0 10px oklch(0.78 0.18 145 / 0)" },
          "100%": { boxShadow: "0 0 0 0 oklch(0.78 0.18 145 / 0)" },
        },
        "hm-ken-burns": {
          from: { transform: "scale(1.04) translate(-10px, 0)" },
          to: { transform: "scale(1.08) translate(10px, -4px)" },
        },
        "hm-scan": {
          "0%": { left: "-25%", opacity: "0" },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.9" },
          "100%": { left: "105%", opacity: "0" },
        },
        "hm-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "hm-drift": {
          "0%": { transform: "translateY(-6px)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(6px)", opacity: "0" },
        },
        "hm-viz": {
          "0%": { height: "12%" },
          "100%": { height: "95%" },
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
