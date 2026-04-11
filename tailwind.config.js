// @ts-check

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          bg: "#0A0A0A",
          card: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.1)",
          rose: "#B11226",
          violet: "#8b5cf6",
          amber: "#D97706",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
