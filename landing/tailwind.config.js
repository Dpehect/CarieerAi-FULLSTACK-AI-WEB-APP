/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        night: {
          950: "#02040a",
          900: "#050a14",
          800: "#0a1020",
          700: "#111a2e",
          600: "#1a2540",
        },
        ice: "#7dd3fc",
        aqua: "#22d3ee",
        orchid: "#c084fc",
        plum: "#a855f7",
      },
      maxWidth: {
        content: "72rem",
      },
      letterSpacing: {
        display: "-0.04em",
      },
      boxShadow: {
        float: "0 30px 80px rgba(0,0,0,0.55)",
        "glow-aqua": "0 0 60px rgba(34,211,238,0.2)",
        "glow-plum": "0 0 60px rgba(168,85,247,0.18)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(12px,-18px)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        floaty: "floaty 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
