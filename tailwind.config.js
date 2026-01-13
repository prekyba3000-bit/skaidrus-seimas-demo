/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/src/**/*.css",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f59f0a", // Amber / Precious Amber
        "emerald-deep": "#021C15", // Deepest background / Deep Forest
        "emerald-glass": "rgba(5, 46, 36, 0.7)",
        "mist-white": "#ecfdf5",
        "background-light": "#f8f7f5",
        "background-dark": "#021C15",
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"],
        sans: ["Public Sans", "sans-serif"],
      },
      backgroundImage: {
        "noble-gradient":
          "radial-gradient(circle at 50% 0%, #064e3b 0%, #021C15 60%)",
        "gem-gradient":
          "linear-gradient(145deg, rgba(6, 78, 59, 0.6) 0%, rgba(2, 28, 21, 0.8) 100%)",
        "amber-glow":
          "radial-gradient(circle at center, rgba(245, 159, 10, 0.15) 0%, transparent 70%)",
        "radial-top":
          "radial-gradient(circle at 50% 0%, rgba(245, 159, 10, 0.15) 0%, rgba(2, 28, 21, 0) 60%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        dash: "dash 5s linear forwards",
      },
      keyframes: {
        dash: {
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
