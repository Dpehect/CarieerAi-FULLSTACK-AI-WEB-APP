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
          950: "#0b1220",
          900: "#101a2e",
          800: "#162238",
          700: "#1e2d48",
          600: "#2a3d5c",
        },
        aqua: "#22d3ee",
        ice: "#a5f3fc",
        plum: "#a855f7",
        orchid: "#d8b4fe",
      },
      maxWidth: {
        content: "72rem",
      },
      letterSpacing: {
        display: "-0.04em",
      },
      boxShadow: {
        float: "0 28px 70px rgba(8, 15, 35, 0.45)",
        glow: "0 0 80px rgba(34, 211, 238, 0.25)",
      },
    },
  },
  plugins: [],
};
