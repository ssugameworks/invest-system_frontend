import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
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

      // 간격 시스템 (8px 기준)
      spacing: {
        // 초소형 간격 (4px 단위)
        '1': '4px', // gap-1
        '2': '8px', // gap-2 (기본 단위)
        '2.5': '10px', // gap-2.5
        '3': '12px', // gap-3
        '5': '20px', // gap-5
        '7.5': '30px', // gap-7.5
        '10': '40px', // gap-10

        // 위치/여백 (실제 디자인 값 유지)
        '22': '22px', // left-22 (헤더 좌측)
        '76': '76px', // top-76 (헤더 상단)
        '195': '195px', // top-195 (메인 컨텐츠)
        '655': '655px', // top-655 (바텀시트)

        // 컴포넌트 크기
        '148': '148px', // 투자 카드 높이
        '168': '168px', // 투자 카드 너비
        '188': '188px', // 발표자료 카드 너비
        '215': '215px', // 남은 자금 카드 높이
        '300': '300px', // 카드 내부 너비
        '353': '353px', // 바텀시트 컨텐츠 너비
        '393': '393px', // 모바일 화면 너비
        '535': '535px', // 바텀시트 높이
      },

      // 너비 (spacing과 연동)
      width: {
        '20': '80px', // w-20
        '168': '168px', // 투자 카드
        '188': '188px', // 발표자료
        '300': '300px', // 카드 내부
        '353': '353px', // 바텀시트 컨텐츠
        '393': '393px', // 모바일 화면
      },

      // 높이 (spacing과 연동)
      height: {
        '0.5': '2px', // h-0.5 (얇은 선)
        '1': '4px', // h-1
        '10': '40px', // h-10 (버튼 높이)
        '115': '115px', // 발표자료 카드
        '148': '148px', // 투자 카드
        '215': '215px', // 남은 자금 카드
        '535': '535px', // 바텀시트
      },

      // 크기 (아이콘 등)
      size: {
        '6': '24px', // size-6 (아이콘)
        '8.5': '34.5px', // size-8.5 (큰 아이콘)
      },

      // line-height
      lineHeight: {
        tight: '99.985%',
      },

      // 그라디언트
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