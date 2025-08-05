/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Cores personalizadas que integram com Angular Material
      colors: {
        // Paleta principal baseada no Material Design
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3', // Cor principal do Material
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        accent: {
          50: '#fce4ec',
          100: '#f8bbd9',
          200: '#f48fb1',
          300: '#f06292',
          400: '#ec407a',
          500: '#e91e63', // Cor de destaque
          600: '#d81b60',
          700: '#c2185b',
          800: '#ad1457',
          900: '#880e4f',
        },
        warn: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336', // Cor de aviso
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        // Cores de superfície do Material Design
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Cores de texto baseadas no Material Design
        'on-surface': {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.60)',
          disabled: 'rgba(0, 0, 0, 0.38)',
          hint: 'rgba(0, 0, 0, 0.38)',
        },
        'on-surface-dark': {
          primary: 'rgba(255, 255, 255, 1)',
          secondary: 'rgba(255, 255, 255, 0.70)',
          disabled: 'rgba(255, 255, 255, 0.50)',
          hint: 'rgba(255, 255, 255, 0.50)',
        }
      },
      // Espaçamentos que seguem o sistema de 8dp do Material Design
      spacing: {
        '1': '4px',   // 0.25rem
        '2': '8px',   // 0.5rem - Base do Material Design
        '3': '12px',  // 0.75rem
        '4': '16px',  // 1rem
        '5': '20px',  // 1.25rem
        '6': '24px',  // 1.5rem
        '8': '32px',  // 2rem
        '10': '40px', // 2.5rem
        '12': '48px', // 3rem
        '16': '64px', // 4rem
        '20': '80px', // 5rem
        '24': '96px', // 6rem
      },
      // Tipografia baseada no Material Design
      fontFamily: {
        'sans': ['Roboto', 'system-ui', 'sans-serif'],
        'display': ['Roboto', 'system-ui', 'sans-serif'],
        'body': ['Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Escala tipográfica do Material Design
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
      },
      // Bordas arredondadas do Material Design
      borderRadius: {
        'none': '0px',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
        'full': '9999px',
      },
      // Sombras baseadas no Material Design
      boxShadow: {
        'elevation-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'elevation-4': '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'elevation-5': '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      },
      // Animações e transições
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      // Z-index para camadas
      zIndex: {
        'tooltip': '1000',
        'modal': '1050',
        'popover': '1060',
        'overlay': '1070',
        'drawer': '1200',
        'snackbar': '1400',
      }
    },
  },
  plugins: [
    // Plugin para adicionar utilitários personalizados do Material Design
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Utilitários para elevação (sombras)
        '.elevation-0': { boxShadow: 'none' },
        '.elevation-1': { boxShadow: theme('boxShadow.elevation-1') },
        '.elevation-2': { boxShadow: theme('boxShadow.elevation-2') },
        '.elevation-3': { boxShadow: theme('boxShadow.elevation-3') },
        '.elevation-4': { boxShadow: theme('boxShadow.elevation-4') },
        '.elevation-5': { boxShadow: theme('boxShadow.elevation-5') },
        
        // Utilitários para tipografia Material Design
        '.text-display-large': {
          fontSize: theme('fontSize.display-large[0]'),
          lineHeight: theme('fontSize.display-large[1].lineHeight'),
          letterSpacing: theme('fontSize.display-large[1].letterSpacing'),
          fontWeight: '400',
        },
        '.text-headline-large': {
          fontSize: theme('fontSize.headline-large[0]'),
          lineHeight: theme('fontSize.headline-large[1].lineHeight'),
          letterSpacing: theme('fontSize.headline-large[1].letterSpacing'),
          fontWeight: '400',
        },
        '.text-title-large': {
          fontSize: theme('fontSize.title-large[0]'),
          lineHeight: theme('fontSize.title-large[1].lineHeight'),
          letterSpacing: theme('fontSize.title-large[1].letterSpacing'),
          fontWeight: '500',
        },
        '.text-body-large': {
          fontSize: theme('fontSize.body-large[0]'),
          lineHeight: theme('fontSize.body-large[1].lineHeight'),
          letterSpacing: theme('fontSize.body-large[1].letterSpacing'),
          fontWeight: '400',
        },
        '.text-label-large': {
          fontSize: theme('fontSize.label-large[0]'),
          lineHeight: theme('fontSize.label-large[1].lineHeight'),
          letterSpacing: theme('fontSize.label-large[1].letterSpacing'),
          fontWeight: '500',
        },
        
        // Utilitários para estados de interação
        '.state-hover': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'currentColor',
            opacity: '0',
            transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          },
          '&:hover::before': {
            opacity: '0.04',
          },
        },
        '.state-focus': {
          '&:focus::before': {
            opacity: '0.12',
          },
        },
        '.state-pressed': {
          '&:active::before': {
            opacity: '0.16',
          },
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
  // Configuração para trabalhar bem com Angular Material
  corePlugins: {
    preflight: false, // Desabilita o reset do Tailwind para não conflitar com o Material
  },
}