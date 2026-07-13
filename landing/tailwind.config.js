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
        void: {
          950: "#03050a",
          900: "#060a12",
          800: "#0a1220",
          700: "#101a2e",
          600: "#162238",
        },
        teal: {
          glow: "#22d3ee",
          soft: "#67e8f9",
        },
        violet: {
          glow: "#a855f7",
          soft: "#c084fc",
        },
      },
      boxShadow: {
        "glow-teal": "0 0 40px rgba(34, 211, 238, 0.25)",
        "glow-violet": "0 0 40px rgba(168, 85, 247, 0.22)",
        "glow-cta":
          "0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(34, 211, 238, 0.25), 0 8px 24px rgba(168, 85, 247, 0.15)",
        card: "0 24px 60px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "mesh":
          "radial-gradient(at 20% 20%, rgba(34,211,238,0.12) 0, transparent 45%), radial-gradient(at 80% 10%, rgba(168,85,247,0.14) 0, transparent 40%), radial-gradient(at 50% 90%, rgba(34,211,238,0.08) 0, transparent 45%)",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        shimmer: "shimmer 4s ease infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
