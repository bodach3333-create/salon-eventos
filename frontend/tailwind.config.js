/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff5f7',
          100: '#ffe0e8',
          200: '#ffc2d1',
          300: '#ff94b0',
          400: '#ff5c87',
          500: '#ff2d6b',
          600: '#f0005a',
          700: '#cc004d',
          800: '#a80040',
          900: '#8a0038',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 20px 0 rgba(0,0,0,0.07)',
        'card-hover': '0 8px 40px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
