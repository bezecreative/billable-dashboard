/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'DM Serif Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0A0B0D",
          900: "#111318",
          800: "#1A1D26",
          700: "#252836",
          600: "#323648",
          500: "#454960",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
        },
        sky: {
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
        },
      },
      backgroundImage: {
        "grid-ink": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      animation: {
        "ring-fill": "ring-fill 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "fade-up": "fade-up 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "ring-fill": {
          from: { "stroke-dashoffset": "var(--ring-circumference)" },
          to: { "stroke-dashoffset": "var(--ring-offset)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
