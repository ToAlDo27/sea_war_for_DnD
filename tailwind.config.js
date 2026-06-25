/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#04080f',
        deep: '#081320',
        hull: '#0a1828',
        panel: '#0b1726',
        panel2: '#0e2034',
        ink: '#060d17',
        copper: '#b07a3c',
        copperdim: '#6e4f2a',
        copperlight: '#d9a35b',
        rune: '#34e2a0',
        runedim: '#1c8f63',
        gold: '#e8c66a',
        danger: '#e0524d',
        warn: '#e0a94d',
        seafoam: '#5fb3c4',
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        rune: '0 0 8px rgba(52, 226, 160, 0.45)',
        copper: '0 0 0 1px rgba(176, 122, 60, 0.5)',
      },
    },
  },
  plugins: [],
}
