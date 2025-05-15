/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#fa5252',
          dark: '#e03131',
          light: '#ff8787',
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#fa5252',
          600: '#e03131',
          700: '#c92a2a',
          800: '#b02525',
          900: '#962121'
        },
      },
    },
  },
  plugins: [],
} 