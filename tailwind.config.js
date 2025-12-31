/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ✅ ফিক্স: ইংরেজি ফন্ট আগে, বাংলা ফন্ট পরে
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', 'Kalpurush'],
      },
    },
  },
  plugins: [],
}
