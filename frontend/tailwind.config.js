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
          gold: {
            light: '#C5A028', // Oro Marca
            DEFAULT: '#D4AF37', // Oro Suave (Dark)
            dark: '#D4AF37',
          },
          charcoal: '#242B33', // Soft Charcoal (Dark BG)
          gris: '#374151', // Gris Profundo (Light Text) - Now Lighter
          crema: '#D3D0C2', // Crema Base (Light BG)
          'crema-light': '#E8E6DE', // Light Gradient Start
          'crema-dark': '#B8C1B7', // Light Gradient End
          dark: '#1a1c1a', // Keep existing as fallback or specific use
          green: '#2E8B57', // Sea Green (muted)
          cream: '#F5F5DC', // Beige/Cream text
        },
        primary: {
            50: '#ecfdf5', // emerald-50
            100: '#d1fae5', // emerald-100
            500: '#10b981', // emerald-500
            600: '#059669', // emerald-600
            900: '#064e3b', // emerald-900
        }
      }
    },
  },
  plugins: [],
}
