/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1216",
        surface: "#151A21",
        border: "#232a33",
        text: "#E5E7EB",
        mute: "#94A3B8",
        accent: "#3B82F6",
        accent2: "#FF6F00",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
