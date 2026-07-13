/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"DM Sans\"", "Inter", "system-ui", "sans-serif"],
        display: ["\"Space Grotesk\"", "Inter", "system-ui", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#05070f",
          900: "#0a0e1a",
          800: "#10182b",
          700: "#1a243d",
        },
        neon: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          violet: "#a78bfa",
          pink: "#f472b6",
          lime: "#a3e635",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.25)",
        "glow-lg": "0 0 80px rgba(59, 130, 246, 0.35)",
        card: "0 20px 60px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
