import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ZEN大学カラー（落ち着いた青系）
        zen: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d3ff',
          300: '#93b4ff',
          400: '#608eff',
          500: '#3a66ff',
          600: '#1a44f5',
          700: '#1432e1',
          800: '#1729b6',
          900: '#192890',
          950: '#111756',
        },
      },
      fontFamily: {
        sans: [
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans',
          'Noto Sans JP',
          'Yu Gothic',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
