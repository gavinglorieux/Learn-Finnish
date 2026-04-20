/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finnish: {
          50: '#eef4fb',
          100: '#d6e5f5',
          200: '#a8c5e8',
          300: '#6f9ed6',
          400: '#3e77c1',
          500: '#003580',
          600: '#002e72',
          700: '#002761',
          800: '#001e4b',
          900: '#001330'
        },
        sun: {
          50: '#fff8e6',
          100: '#ffecb3',
          200: '#ffd866',
          300: '#ffc233',
          400: '#f9a826',
          500: '#e08a00'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(0, 53, 128, 0.15)',
        soft: '0 2px 10px -2px rgba(0, 0, 0, 0.08)'
      },
      animation: {
        'pop': 'pop 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'fade-in': 'fadeIn 300ms ease-out',
        'shake': 'shake 350ms ease-in-out'
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.95)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } }
      }
    }
  },
  plugins: []
}
