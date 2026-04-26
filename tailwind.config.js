/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F4EDE0',
        'cream-deep': '#EDE3D2',
        wine: '#3A1622',
        'wine-soft': '#5A2A38',
        pinky: '#E8A0A8',
        'pinky-bright': '#F47A86',
        'pinky-soft': '#F8DCDF',
        butter: '#E8C97A',
        forest: '#3F5A3A',
        'forest-soft': '#D4DDC9',
        ash: '#9A9085',
        'ash-soft': '#E4DDD1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
