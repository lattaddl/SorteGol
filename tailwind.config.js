/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      opacity: { 12: '.12', 15: '.15', 35: '.35', 45: '.45', 55: '.55', 65: '.65' },
      colors: {
        noche: { DEFAULT: '#081a3f', 700: '#0e2d6b', 800: '#0a2150', 900: '#061330', 950: '#050f26' },
        mar: { DEFAULT: '#1d56c4', 400: '#3f7ae0', 600: '#1a4aa8' },
        cielo: { DEFAULT: '#8cc2ff', 300: '#b8dcff', 600: '#5ea6f5' },
        tinta: '#020611',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        lock: {
          '0%': { transform: 'scale(1.06)', boxShadow: '0 0 0 0 rgba(140,194,255,.65)' },
          '60%': { boxShadow: '0 0 0 18px rgba(140,194,255,0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(140,194,255,0)' },
        },
        flick: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) rotate(-3deg)' },
          '75%': { transform: 'translateY(4px) rotate(3deg)' },
        },
        drift: {
          '0%': { transform: 'translate3d(-4%,-2%,0) scale(1)' },
          '100%': { transform: 'translate3d(4%,3%,0) scale(1.15)' },
        },
        fall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '.9' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        trophy: {
          '0%,100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-6px) rotate(4deg)' },
        },
      },
      animation: {
        lock: 'lock .7s cubic-bezier(.2,.9,.3,1)',
        flick: 'flick .16s linear infinite',
        drift: 'drift 26s ease-in-out infinite alternate',
        fall: 'fall 3.4s linear forwards',
        rise: 'rise .5s ease-out both',
        pop: 'pop .35s ease-out both',
        trophy: 'trophy 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
