module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        basic: {
          0: 'var(--basic-0)',
          1: 'var(--basic-1)',
          2: 'var(--basic-2)',
          3: 'var(--basic-3)',
          4: 'var(--basic-4)',
          5: 'var(--basic-5)',
        },
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
  plugins: [require('tailwindcss-safe-area'), require('@tailwindcss/typography')],
};
