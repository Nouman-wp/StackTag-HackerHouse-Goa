/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0b1220',
        ocean: '#0f2a43',
        ember: '#ff6a00',
        sunrise: '#ff8a00',
      },
      backgroundImage: {
        'bbns-gradient': 'linear-gradient(135deg, #0b1220 0%, #0f2a43 50%, #ff6a00 100%)',
      },
    },
  },
  plugins: [],
}


