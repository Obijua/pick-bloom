
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#143f17',
          50: '#ebf5ed',
          100: '#d1e6d6',
          200: '#a3ccb0',
          300: '#72b086',
          400: '#46915e',
          500: '#267540',
          600: '#143f17', // Primary Color
          700: '#103313',
          800: '#0d2610',
          900: '#081a0b',
        },
        secondary: {
          DEFAULT: '#f49f17', // Secondary Color
          50: '#fef6e8',
          100: '#fcebc7',
          200: '#f9d68f',
          300: '#f6bf56',
          400: '#f49f17',
          500: '#d9820e',
          600: '#ad6106',
          700: '#7c4305',
          800: '#4d2803',
          900: '#211001',
        },
        // Mapping 'farm' to primary for backward compatibility with existing components
        farm: {
          50: '#ebf5ed',
          100: '#d1e6d6',
          200: '#a3ccb0',
          300: '#72b086',
          400: '#46915e',
          500: '#267540',
          600: '#143f17',
          700: '#103313',
          800: '#0d2610',
          900: '#081a0b',
        }
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'fade-out': 'fade-out 0.3s ease-in forwards',
      }
    }
  },
  plugins: [],
}
