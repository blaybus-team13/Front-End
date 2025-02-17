/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF8B14",
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },
      },
    },
  },
  plugins: [],
};
