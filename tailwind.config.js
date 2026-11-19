/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Aionion Capital brand (from the logo)
        brand: {
          blue: '#1E2BFF',
          navy: '#2E3192',
          midnight: '#0F1A6B',
          coral: '#FF6B7A',
          coralDark: '#E5566A',
          mist: '#EEF1FF',
          ink: '#0F172A',
          page: '#F4F6FD',
        },
        // fixed status palette (dataviz): always shown with an icon + label
        status: {
          good: '#0ca30c',
          warning: '#fab219',
          critical: '#d03b3b',
          neutral: '#6250d6', // "No Need"
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,26,107,0.04), 0 10px 30px -10px rgba(15,26,107,0.14)',
        brand: '0 10px 24px -8px rgba(30,43,255,0.5)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-in': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'slide-in': 'slide-in 0.28s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
