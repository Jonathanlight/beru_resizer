/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          DEFAULT: '#0f0f13',
          50: '#16161c',
          100: '#1a1a22',
          200: '#22222d',
          300: '#2a2a38',
        },
        neon: {
          violet: '#7c3aed',
          'violet-light': '#a78bfa',
          'violet-dark': '#5b21b6',
          cyan: '#22d3ee',
          'cyan-light': '#67e8f9',
          'cyan-dark': '#0891b2',
        },
      },
      fontFamily: {
        display: ['"Exo 2"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-violet': '0 0 20px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.1)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
        'neon-violet-intense': '0 0 30px rgba(124, 58, 237, 0.5), 0 0 80px rgba(124, 58, 237, 0.2)',
        'neon-cyan-intense': '0 0 30px rgba(34, 211, 238, 0.5), 0 0 80px rgba(34, 211, 238, 0.2)',
        'inner-glow': 'inset 0 0 30px rgba(124, 58, 237, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(34, 211, 238, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
