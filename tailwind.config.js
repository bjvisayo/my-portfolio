/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#07111F",
        panel: "#0E1A2B",
        line: "rgba(148, 163, 184, 0.18)",
        accent: "#3B82F6",
      },
      boxShadow: {
        glow: "0 0 55px rgba(59,130,246,.28)",
        cyan: "0 0 45px rgba(34,211,238,.18)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(148,163,184,.075) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.075) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
