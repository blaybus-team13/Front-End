/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // ✅ Next.js의 모든 파일에 Tailwind 적용
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"], // ✅ Pretendard 폰트 추가
      },
    },
  },
  plugins: [],
};
