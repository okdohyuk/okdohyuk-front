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
          1: '#6D28D9',
          2: '#7C3AED',
          3: '#8B5CF6',
          4: '#DDD6FE',
        },
      },
    },
  },
  darkMode: 'media',
  plugins: [require('tailwindcss-safe-area'), require('@tailwindcss/typography')],
};
