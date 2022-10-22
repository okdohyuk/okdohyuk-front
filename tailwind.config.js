module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  darkMode: 'media',
  plugins: [require('tailwindcss-safe-area'), require('@tailwindcss/line-clamp')],
};
