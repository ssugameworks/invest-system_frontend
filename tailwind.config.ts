import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        /* Background Colors */
        background: 'hsl(var(--background))',
        'background-outer': 'hsl(var(--background-outer))',
        'background-card': 'hsl(var(--background-card))',
        'background-bottom-sheet': 'hsl(var(--background-bottom-sheet))',

        /* Border Colors */
        'border-card': 'hsl(var(--border-card))',
        'border-light': 'hsl(var(--border-light))',
        'border-button': 'hsl(var(--border-button))',

        /* Accent Colors */
        'accent-yellow': 'hsl(var(--accent-yellow))',
        'accent-green-start': 'hsl(var(--accent-green-start))',
        'accent-green-end': 'hsl(var(--accent-green-end))',

        /* Text Colors */
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-tertiary': 'hsl(var(--text-tertiary))',

        /* Primary Colors */
        'primary-100': 'hsl(var(--primary-100))',
        'primary-500': 'hsl(var(--primary-500))',

        /* Foreground */
        foreground: 'hsl(var(--foreground))',
      },

      /* Font Family */
      fontFamily: {
        pretendard: ['var(--font-pretendard)', 'Pretendard', 'sans-serif'],
        jost: ['Jost', 'sans-serif'],
      },

      /* Font Size */
      fontSize: {
        '10': ['10px', { lineHeight: 'normal' }],
        '12': ['12px', { lineHeight: 'normal' }],
        '14': ['14px', { lineHeight: 'normal' }],
        '16': ['16px', { lineHeight: 'normal' }],
        '18': ['18px', { lineHeight: 'normal' }],
        '20': ['20px', { lineHeight: 'normal' }],
        '32': ['32px', { lineHeight: 'normal' }],
      },

      /* Font Weight */
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      /* Border Radius */
      borderRadius: {
        '15': '15px',
        '20': '20px',
        '40': '40px',
        '100': '100px',
      },

      /* Line Height */
      lineHeight: {
        tight: '99.985%',
      },

      /* Background Image */
      backgroundImage: {
        'gradient-card': 'linear-gradient(to right, #E7FA4F, #83F055)',
        'gradient-button':
          'linear-gradient(to right, rgba(252, 255, 245, 0.2), rgba(234, 255, 132, 0.2))',
      },
    },
  },
  plugins: [
    // text-shadow 플러그인 (임의 값 지원)
    plugin(function ({ matchUtilities }) {
      matchUtilities(
        {
          'text-shadow': value => ({
            textShadow: value,
          }),
        },
        { values: {}, type: 'any' },
      );
    }),
  ],
};

export default config