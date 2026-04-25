/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0F1117',
        card: '#1A1D27',
        accent: '#6C63FF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#F1F5F9',
        textMuted: '#94A3B8',
        sidebar: '#13151F',
      }
    },
  },
  plugins: [],
}
