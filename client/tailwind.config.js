/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        potasq: {
          DEFAULT: '#FF6A3D',   // Main orange
          dark: '#FF3C00',      // Darker orange for hover
          light: '#FFB199',     // Lighter orange for backgrounds
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

