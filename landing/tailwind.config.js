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
        surface: {
          0: "#07090d",
          50: "#0b0f14",
          100: "#10161e",
          200: "#161d28",
          300: "#1c2533",
          400: "#243041",
        },
        ink: {
          soft: "#8b95a8",
          muted: "#6b7589",
          faint: "#4a5366",
        },
        accent: {
          DEFAULT: "#6b8cff",
          soft: "#8aa4ff",
          deep: "#4f6fe0",
          glow: "rgba(107, 140, 255, 0.18)",
        },
      },
      boxShadow: {
        elevate: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.45)",
        soft: "0 12px 40px rgba(0,0,0,0.35)",
        ring: "0 0 0 1px rgba(255,255,255,0.06)",
      },
      letterSpacing: {
        tighter2: "-0.04em",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        dots: "24px 24px",
      },
    },
  },
  plugins: [],
};
