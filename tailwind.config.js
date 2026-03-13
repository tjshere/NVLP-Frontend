/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector', // Enable class-based dark mode (use 'class' for Tailwind < 3.4)
    theme: {
      extend: {
        keyframes: {
          'slide-in-right': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
        },
        animation: {
          'slide-in-right': 'slide-in-right 0.25s ease-out',
          'fade-in': 'fade-in 0.2s ease-out',
        },
      },
    },
    plugins: [],
  }