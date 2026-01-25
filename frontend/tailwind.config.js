/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#D4AF37', // Metallic Gold
          dark: '#242B33', // Lighter Slate / Gunmetal
          green: '#2E8B57', // Sea Green (muted)
          cream: '#F5F5DC', // Beige/Cream text
        },
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            900: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}
