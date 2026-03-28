/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        whisp: {
          primary: '#5D3EBC',
          accent: '#e91e8c',
          coral: '#f472b6',
          surface: '#f8f7ff',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(93, 62, 188, 0.08)',
        'card-lg': '0 8px 40px rgba(93, 62, 188, 0.12)',
      },
    },
  },
  plugins: [],
};
