import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black:   '#1A1A1A',
        dark:    '#2C2C2C',
        mid:     '#6B6B6B',
        light:   '#D4D4D4',
        paper:   '#F2F0EC',
        orange:  '#E8620A',
        'orange-d': '#C0510A',
      },
      fontFamily: {
        display:  ['var(--font-barlow-condensed)', 'sans-serif'],
        body:     ['var(--font-barlow)', 'sans-serif'],
        wordmark: ['var(--font-audiowide)', 'sans-serif'],
      },
    },
  },
}
export default config
