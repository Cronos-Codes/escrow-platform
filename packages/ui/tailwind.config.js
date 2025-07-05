/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Gold Escrow brand colors
        gold: {
          50: '#FEF9E7',
          100: '#FCF3CF',
          200: '#F9E79F',
          300: '#F7DC6F',
          400: '#F4D03F',
          500: '#D4AF37', // Primary gold
          600: '#B8941F',
          700: '#9B7A0A',
          800: '#7D6000',
          900: '#5F4C00',
          DEFAULT: '#D4AF37',
          light: '#E6C866',
          dark: '#B8941F',
          accent: '#FFD700',
        },
        // Neutral colors
        black: '#000814',
        white: '#F8F9FA',
        gray: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#80868B',
          700: '#5F6368',
          800: '#3C4043',
          900: '#202124',
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          dark: '#0F0F0F',
        },
        // Status colors
        success: '#28A745',
        error: '#DC3545',
        info: '#17A2B8',
        warning: '#FFC107',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.5)',
        'gold-soft': '0 2px 8px rgba(212, 175, 55, 0.15)',
        'depth': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'depth-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)',
      },
    },
  },
  plugins: [
    // Custom plugin for gold-themed utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gold': {
          color: theme('colors.gold.DEFAULT'),
        },
        '.bg-gold': {
          backgroundColor: theme('colors.gold.DEFAULT'),
        },
        '.border-gold': {
          borderColor: theme('colors.gold.DEFAULT'),
        },
        '.ring-gold': {
          '--tw-ring-color': theme('colors.gold.DEFAULT'),
        },
        '.shadow-gold': {
          boxShadow: theme('boxShadow.gold'),
        },
        '.shadow-gold-glow': {
          boxShadow: theme('boxShadow.gold-glow'),
        },
        '.shadow-gold-soft': {
          boxShadow: theme('boxShadow.gold-soft'),
        },
        '.glass-gold': {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
        '.glass-dark': {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
        '.glass-light': {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 