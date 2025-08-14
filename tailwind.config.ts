import type { Config } from 'tailwindcss';
import tailwindcssSafeArea from 'tailwindcss-safe-area';
import typography from '@tailwindcss/typography';

export default {
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
  plugins: [tailwindcssSafeArea, typography],
} satisfies Config;
