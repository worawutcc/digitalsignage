import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Digital Signage Brand Colors - Softer, eye-friendly palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Softer accent colors for better UX
        soft: {
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
          },
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Android TV Device Status Colors
        device: {
          pending: {
            bg: '#fef3c7',
            border: '#f59e0b',
            text: '#92400e',
          },
          registered: {
            bg: '#dbeafe',
            border: '#3b82f6',
            text: '#1e40af',
          },
          online: {
            bg: '#dcfce7',
            border: '#22c55e',
            text: '#166534',
          },
          offline: {
            bg: '#fee2e2',
            border: '#ef4444',
            text: '#991b1b',
          },
          error: {
            bg: '#fef2f2',
            border: '#dc2626',
            text: '#7f1d1d',
          },
          maintenance: {
            bg: '#f3e8ff',
            border: '#8b5cf6',
            text: '#5b21b6',
          },
          inactive: {
            bg: '#f1f5f9',
            border: '#64748b',
            text: '#475569',
          },
        },
        // Android TV Brand Colors
        android: {
          green: '#3ddc84',
          blue: '#4285f4',
          red: '#ea4335',
          yellow: '#fbbc04',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Android TV specific spacing
        'device-card': '20rem',
        'config-panel': '24rem',
        'status-indicator': '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Android TV specific animations
        'device-heartbeat': 'deviceHeartbeat 2s ease-in-out infinite',
        'status-change': 'statusChange 0.3s ease-out',
        'registration-bounce': 'registrationBounce 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Android TV specific keyframes
        deviceHeartbeat: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        statusChange: {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        registrationBounce: {
          '0%': { transform: 'scale(0.8) translateY(-10px)', opacity: '0' },
          '60%': { transform: 'scale(1.05) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        // Android TV specific shadows
        'device-card': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'status-indicator': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
      },
      // Android TV responsive breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Android TV specific breakpoints
        'device-grid-sm': '720px',
        'device-grid-md': '1080px',
        'device-grid-lg': '1440px',
      },
      // Android TV grid templates
      gridTemplateColumns: {
        'device-cards': 'repeat(auto-fill, minmax(280px, 1fr))',
        'device-list': '1fr 120px 100px 80px 120px',
        'config-form': '1fr 2fr',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Android TV Device Management Plugin
    function({ addUtilities, theme }: { addUtilities: any, theme: any }) {
      const deviceStatusUtilities = {
        // Device status indicators
        '.device-status-pending': {
          '@apply bg-device-pending-bg border-device-pending-border text-device-pending-text': {},
        },
        '.device-status-registered': {
          '@apply bg-device-registered-bg border-device-registered-border text-device-registered-text': {},
        },
        '.device-status-online': {
          '@apply bg-device-online-bg border-device-online-border text-device-online-text': {},
        },
        '.device-status-offline': {
          '@apply bg-device-offline-bg border-device-offline-border text-device-offline-text': {},
        },
        '.device-status-error': {
          '@apply bg-device-error-bg border-device-error-border text-device-error-text': {},
        },
        '.device-status-maintenance': {
          '@apply bg-device-maintenance-bg border-device-maintenance-border text-device-maintenance-text': {},
        },
        '.device-status-inactive': {
          '@apply bg-device-inactive-bg border-device-inactive-border text-device-inactive-text': {},
        },
        // Device card layouts
        '.device-card': {
          '@apply bg-white rounded-lg shadow-device-card border border-gray-200 p-6 hover:shadow-medium transition-shadow duration-200': {},
        },
        '.device-card-compact': {
          '@apply bg-white rounded-md shadow-soft border border-gray-200 p-4 hover:shadow-device-card transition-shadow duration-200': {},
        },
        // Status indicators
        '.status-indicator': {
          '@apply inline-flex items-center justify-center w-status-indicator h-status-indicator rounded-full border-2': {},
        },
        '.status-indicator-large': {
          '@apply inline-flex items-center justify-center w-6 h-6 rounded-full border-2': {},
        },
        // Android TV specific layouts
        '.device-grid': {
          '@apply grid grid-cols-device-cards gap-6': {},
        },
        '.device-list-row': {
          '@apply grid grid-cols-device-list gap-4 items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50': {},
        },
        '.config-form-row': {
          '@apply grid grid-cols-config-form gap-4 items-center py-2': {},
        },
        // Registration workflow styles
        '.registration-badge': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border': {},
        },
        '.registration-pin': {
          '@apply font-mono text-lg font-bold tracking-wider bg-gray-100 px-3 py-2 rounded border': {},
        },
      }

      addUtilities(deviceStatusUtilities)
    },
  ],
}
export default config