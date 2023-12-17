module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        point: {
          1: '#AA90FA',
          2: '#BEADFA',
          3: '#D0BFFF',
          4: '#DFCCFB',
        },
      },
    },
  },
  darkMode: 'media',
  plugins: [require('tailwindcss-safe-area'), require('@tailwindcss/line-clamp'), require('@tailwindcss/typography')],
};
