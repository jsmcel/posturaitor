export const COLORS = {
  // Colores principales
  PRIMARY: '#FFD93D',      // Amarillo dorado
  SECONDARY: '#FF6B9D',    // Rosa neón
  ACCENT: '#C44569',       // Rosa oscuro
  DARK: '#2C3E50',         // Azul oscuro
  BLACK: '#000000',        // Negro

  // Gradientes
  GRADIENTS: {
    PRIMARY: ['#FFD93D', '#FF6B9D'],
    SECONDARY: ['#FF6B9D', '#C44569'],
    DARK: ['#C44569', '#2C3E50', '#000'],
    GLOW: ['#FFD93D', '#FF6B9D', '#C44569'],
  },

  // Estados
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',

  // Texto
  TEXT: {
    PRIMARY: '#FFD93D',
    SECONDARY: '#FFFFFF',
    MUTED: 'rgba(255,255,255,0.8)',
    DARK: '#000000',
  },
  
  // Fondos
  BACKGROUND: {
    PRIMARY: '#000000',
    SECONDARY: 'rgba(255,255,255,0.1)',
    GLASS: 'rgba(255,255,255,0.05)',
  },

  // Bordes
  BORDER: {
    PRIMARY: '#FFD93D',
    SECONDARY: 'rgba(255,255,255,0.2)',
    GLOW: 'rgba(255,217,61,0.3)',
  },

  // Sombras
  SHADOW: {
    PRIMARY: 'rgba(255,217,61,0.3)',
    SECONDARY: 'rgba(255,107,157,0.3)',
    DARK: 'rgba(0,0,0,0.5)',
  },
};

export const FONTS = {
  SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },

  WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
  },
};

export const SPACING = {
  XS: 5,
  SM: 10,
  MD: 15,
  LG: 20,
  XL: 25,
  XXL: 30,
  XXXL: 40,
};

export const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 25,
  ROUND: 50,
};

export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 800,
  },

  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
};
