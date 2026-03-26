/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moma: {
          black: '#000000',
          white: '#FFFFFF',
          red: '#E4002B',
          gray: {
            100: '#F5F5F5',
            200: '#E5E5E5',
            600: '#666666',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Franklin Gothic Medium', 'Arial Narrow', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
