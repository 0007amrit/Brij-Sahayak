/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        braj: {
          saffron: '#ea580c',
          amber: '#d97706',
          gold: '#f59e0b',
          clay: '#9a3412',
          sand: '#fffbeb',
          dark: '#0f172a',
          navy: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
