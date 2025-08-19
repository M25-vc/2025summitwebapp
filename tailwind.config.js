/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        oxygen: ['Oxygen', 'sans-serif'],
        trebuchet: ['Trebuchet MS', 'sans-serif'],
      },
      colors: {
        summitblue: '#7099FF',
        pennyblue: '#001C55',
        // Additional custom colors
        'custom-red': '#CE001C',
        'custom-orange': '#E66432',
        'custom-gray': '#707070',
        'custom-black': '#000000',
        'custom-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
} 

