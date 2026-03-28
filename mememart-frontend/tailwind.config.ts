import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f9f506',
        'bg-light': '#f8f8f5',
        'bg-dark': '#23220f',
        'background-light': '#f8f8f5',
        'background-dark': '#23220f',
        'neutral-800': '#3a391a',
        'neutral-700': '#4a4921',
        'neutral-600': '#6a692f',
        'neutral-400': '#cccb8e',
      },
      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
