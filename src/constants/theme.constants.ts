export const THEME_TOKENS = {
  colors: {
    background: {
      DEFAULT: '#F8F7F3', // Warm off-white
      surface: '#FFFFFF',    // Main surface
      subtle: '#F1EFEA',
    },
    text: {
      primary: '#171918',    // Charcoal
      secondary: '#626763',  // Muted grey
      light: '#8E948F',
    },
    brand: {
      primary: '#1F6B4F',      // Deep forest green
      primaryHover: '#17543E',
      secondary: '#D8E8DE',    // Soft green
      highlight: '#E7A84B',    // Warm amber
      lavender: '#E8E3F4',     // Muted lavender
    },
    border: {
      DEFAULT: '#E5E5DF',      // Subtle clean border
      dark: '#D0D0C8',
    },
    status: {
      success: '#1F6B4F',
      warning: '#E7A84B',
      info: '#3B82F6',
      danger: '#D9534F',
    },
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
} as const
