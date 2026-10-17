/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fea3b4',
          400: '#fb718d',
          500: '#f43f68',
          600: '#e11d53',
          700: '#be1243',
        },
        champagne: {
          50: '#fcfaf6',
          100: '#f7f2e9',
          200: '#eee3cd',
          300: '#e3cea8',
          400: '#d7b77f',
          500: '#cb9e5b',
        },
        blush: {
          light: '#FFF5F6',
          DEFAULT: '#FDECEF',
          dark: '#F8B4C0',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'Dancing Script', 'cursive'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
