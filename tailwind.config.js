module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        point: {
          1: '#BEADFA',
          2: '#D0BFFF',
          3: '#DFCCFB',
        },
      },
    },
  },
  darkMode: 'media',
  plugins: [require('tailwindcss-safe-area'), require('@tailwindcss/line-clamp')],
};
