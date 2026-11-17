/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F7F5F0',
          subtle: '#F0ECE4',
          card: '#FFFDF9',
          border: '#E6E0D4',
        },
        forest: {
          50: '#EBF3EE',
          100: '#D5E6DC',
          200: '#ADCEBD',
          500: '#346B4E',
          600: '#27573E',
          700: '#1C422F',
          800: '#143123',
          900: '#0E2218',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FBE6DD',
          200: '#F6CEBD',
          500: '#D06941',
          600: '#B8532C',
          700: '#943F20',
        },
        amberwarm: {
          50: '#FEF8EE',
          100: '#FDF0DA',
          500: '#B87B28',
          600: '#97621B',
        },
        sage: {
          50: '#F2F6F3',
          100: '#E2EBE4',
          500: '#527A63',
          600: '#416350',
        },
        charcoal: {
          800: '#232826',
          600: '#4D5451',
          400: '#7B8380',
          200: '#C2C8C5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(45, 40, 35, 0.04), 0 1px 2px rgba(45, 40, 35, 0.02)',
        'soft-md': '0 4px 12px -2px rgba(45, 40, 35, 0.06), 0 2px 6px -1px rgba(45, 40, 35, 0.04)',
        'soft-lg': '0 12px 28px -6px rgba(45, 40, 35, 0.08), 0 4px 12px -2px rgba(45, 40, 35, 0.04)',
      }
    },
  },
  plugins: [],
}
