/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1e3a8a',
        'primary-light': '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        cyan: '#06b6d4',
      },
      spacing: {
        '96': '24rem',
        '100': '25rem',
      },
      borderRadius: {
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
      },
      fontSize: {
        'xs': ['0.75rem', '1.25rem'],
        'sm': ['0.875rem', '1.25rem'],
        'base': ['1rem', '1.5rem'],
        'lg': ['1.125rem', '1.75rem'],
        'xl': ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['2rem', '2.5rem'],
        '4xl': ['2.5rem', '3rem'],
        '5xl': ['3rem', '3.5rem'],
        '6xl': ['3.5rem', '4rem'],
      },
      fontWeight: {
        'extra-bold': '800',
        'extra-semi-bold': '600',
        'semi-bold': '600',
        'medium': '500',
        'regular': '400',
        'light': '300',
        'thin': '200',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        'xl': '0 14px 28px -12px rgba(0, 0, 0, 0.1), 0 10px 10px -6px rgba(0, 0, 0, 0.1)',
        'xxl': '0 18px 36px -12px rgba(0, 0, 0, 0.1), 0 12px 18px -6px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'dropdown-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}