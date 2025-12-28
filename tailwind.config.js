/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector', // Enable class-based dark mode (use 'class' for Tailwind < 3.4)
    theme: {
      extend: {},
    },
    plugins: [],
  }