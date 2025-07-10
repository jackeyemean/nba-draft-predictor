// tailwind.config.js
module.exports = {
  darkMode: 'class',              // toggled via adding `dark` to <html>
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-light': '#F3F4F6', // container bg, light mode
        'surface-dark':  '#1F2937', // container bg, dark mode
        'bg-light':      '#E5E7EB', // page bg, light mode
        'bg-dark':       '#111827', // page bg, dark mode
        'accent':        '#F97316', // primary buttons, light
        'accent-dark':   '#EA580C', // primary buttons, dark
      },
    },
  },
  plugins: [],
}
