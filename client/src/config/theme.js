/**
 * SocialX - MUI Theme Configuration
 * Custom theme matching the SocialX brand identity (Pink → Blue gradient)
 */

import { createTheme } from '@mui/material/styles';

// ==========================================
// Design Tokens — Matching SocialX Brand
// ==========================================
const COLORS = {
  primary: {
    main: '#E84393',       // SocialX Pink
    light: '#FD79A8',
    dark: '#C0217E',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#0984E3',       // SocialX Blue
    light: '#74B9FF',
    dark: '#0662AD',
    contrastText: '#FFFFFF',
  },
  accent: {
    pink: '#E84393',
    blue: '#0984E3',
    purple: '#6C5CE7',
    cyan: '#00CEC9',
    gradient: 'linear-gradient(135deg, #E84393 0%, #0984E3 100%)',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    elevated: '#FAFBFC',
    surface: '#F8F9FA',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#707070',
    disabled: '#A0A0A0',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
  gradients: {
    brand: 'linear-gradient(135deg, #E84393 0%, #0984E3 100%)',
    brandReverse: 'linear-gradient(135deg, #0984E3 0%, #E84393 100%)',
    hero: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
    card: 'linear-gradient(145deg, rgba(232,67,147,0.08) 0%, rgba(9,132,227,0.05) 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    surface: 'linear-gradient(145deg, #12122A 0%, #1A1A3E 100%)',
  },
};

const TYPOGRAPHY = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: {
    fontSize: '2.75rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 700,
    letterSpacing: '-0.005em',
    lineHeight: 1.35,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.45,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.03em',
  },
};

const SHAPE = {
  borderRadius: 12,
};

const SHADOWS = {
  glow: {
    brand: '0 0 20px rgba(232, 67, 147, 0.25), 0 0 40px rgba(9, 132, 227, 0.15)',
    pink: '0 0 20px rgba(232, 67, 147, 0.3)',
    blue: '0 0 20px rgba(9, 132, 227, 0.3)',
  },
  card: '0 8px 32px rgba(0, 0, 0, 0.08)',
  elevated: '0 16px 48px rgba(0, 0, 0, 0.06)',
};

// ==========================================
// Create Theme
// ==========================================
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    text: COLORS.text,
    divider: COLORS.divider,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    ...TYPOGRAPHY,
  },
  shape: SHAPE,
  components: {
    // Global CSS Overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.background.default,
          color: COLORS.text.primary,
          scrollbarWidth: 'thin',
          scrollbarColor: `${COLORS.primary.main} ${COLORS.background.paper}`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: COLORS.background.paper,
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${COLORS.primary.main}, ${COLORS.secondary.main})`,
            borderRadius: '3px',
          },
        },
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
      },
    },

    // Button Overrides
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: COLORS.gradients.brand,
          boxShadow: SHADOWS.glow.brand,
          '&:hover': {
            background: COLORS.gradients.brand,
            boxShadow: `${SHADOWS.glow.brand}, 0 8px 24px rgba(232, 67, 147, 0.3)`,
          },
        },
        containedSecondary: {
          background: COLORS.gradients.brandReverse,
          boxShadow: SHADOWS.glow.blue,
          '&:hover': {
            background: COLORS.gradients.brandReverse,
            boxShadow: `${SHADOWS.glow.blue}, 0 8px 24px rgba(9, 132, 227, 0.3)`,
          },
        },
        outlined: {
          borderColor: 'rgba(232, 67, 147, 0.5)',
          '&:hover': {
            borderColor: COLORS.primary.main,
            backgroundColor: 'rgba(232, 67, 147, 0.08)',
          },
        },
      },
    },

    // Card Overrides
    MuiCard: {
      styleOverrides: {
        root: {
          background: COLORS.gradients.card,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          boxShadow: SHADOWS.card,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: '1px solid rgba(232, 67, 147, 0.2)',
            boxShadow: `${SHADOWS.card}, ${SHADOWS.glow.brand}`,
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    // Paper Overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: COLORS.background.paper,
        },
      },
    },

    // TextField Overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(232, 67, 147, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.primary.main,
              boxShadow: `0 0 0 3px rgba(232, 67, 147, 0.15)`,
            },
          },
        },
      },
    },

    // Avatar Overrides
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2px solid transparent`,
          backgroundImage: COLORS.gradients.brand,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        },
      },
    },

    // Chip Overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },

    // IconButton Overrides
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(232, 67, 147, 0.1)',
          },
        },
      },
    },

    // Tooltip Overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.background.elevated,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          boxShadow: SHADOWS.card,
        },
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.06)',
        },
      },
    },
  },
});

// Export design tokens for use outside MUI components
export { COLORS, TYPOGRAPHY, SHAPE, SHADOWS };
export default theme;
