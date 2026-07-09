/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Matches app/globals.css in the web app for visual parity.
        bg: "#0a0a0a",
        surface: "#121212",
        "surface-2": "#171717",
        border: "rgba(255, 255, 255, 0.1)",
        text: "#f5f5f5",
        muted: "rgba(245, 245, 245, 0.78)",
        accent: "#b11226",
        "accent-2": "#8b0000",
      },
    },
  },
  plugins: [],
};
