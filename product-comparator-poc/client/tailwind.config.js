/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rethink: ['Rethink Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          dark:    '#033047',  // Donkerblauw – primaire kleur
          blue:    '#31B6C3',  // Blauw accent
          green:   '#3FD1B7',  // Groen accent
          light:   '#D3E4EF',  // Lichtblauw
          // Opacity-varianten via Tailwind bg-opacity of direct klassen
          'dark-60':  'rgba(3, 48, 71, 0.6)',
          'blue-40':  'rgba(49, 182, 195, 0.4)',
          'green-40': 'rgba(63, 209, 183, 0.4)',
        },
      },
    },
  },
  safelist: [
    // Zorg dat kritieke brand-klassen altijd in de CSS staan (ook bij JIT cold-start)
    { pattern: /bg-brand-(dark|blue|green|light)/ },
    { pattern: /text-brand-(dark|blue|green|light)/ },
    { pattern: /border-brand-(dark|blue|green|light)/ },
    { pattern: /ring-brand-(blue|green)/ },
  ],
  plugins: [],
};
