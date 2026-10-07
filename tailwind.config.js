/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Map blue to emerald/slate so any legacy blue-* classes render as clean emerald/slate
        blue: {
          50:  '#f0fdf4', // emerald-50
          100: '#dcfce7', // emerald-100
          200: '#bbf7d0', // emerald-200
          300: '#86efac', // emerald-300
          400: '#4ade80', // emerald-400
          500: '#16a34a', // emerald-600
          600: '#15803d', // emerald-700
          700: '#166534', // emerald-800
          800: '#14532d', // emerald-900
          900: '#0f172a', // slate-900
        },
        // Map sky to subtle slate/emerald
        sky: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Primary Emerald Green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        slate: {
          25:  '#fcfcfd',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 20px -4px rgba(22, 163, 74, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'emerald-soft': '0 4px 14px 0 rgba(22, 163, 74, 0.2)',
      }
    }
  },
  plugins: [],
}
