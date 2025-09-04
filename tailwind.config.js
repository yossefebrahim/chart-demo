/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'correlation-high': '#003AB1',
        'correlation-low': '#CCDAF6',
      }
    },
  },
  plugins: [],
}
