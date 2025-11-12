// frontend/src/utils/responsive.ts
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

// Factor de escala para web (reduce todo en un 30%)
const webScale = isWeb ? 0.7 : 1;

// Breakpoints
const breakpoints = {
  phone: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Detectar tipo de dispositivo
const isSmallPhone = width < 375;
const isMobile = width < breakpoints.tablet;
const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
const isDesktop = width >= breakpoints.desktop;

// Helper para escalar valores
const scale = (size: number) => (size * webScale);

// Tipografía escalada
export const responsive = {
  // Información del dispositivo
  width,
  height,
  isWeb,
  isMobile,
  isTablet,
  isDesktop,
  isSmallPhone,

  // Tipografía (escalada para web)
  typography: {
    xxxl: scale(32),  // Antes 32
    xxl: scale(28),   // Antes 28
    xl: scale(24),    // Antes 24
    lg: scale(20),    // Antes 20
    md: scale(18),    // Antes 18
    base: scale(16),  // Antes 16
    sm: scale(14),    // Antes 14
    xs: scale(12),    // Antes 12
    xxs: scale(10),   // Antes 10
  },

  // Espaciado (escalado para web)
  spacing: {
    xxxl: scale(48),
    xxl: scale(32),
    xl: scale(24),
    lg: scale(20),
    md: scale(16),
    sm: scale(12),
    xs: scale(8),
    xxs: scale(4),
  },

  // Tamaños de iconos (escalado para web)
  iconSize: {
    xxl: scale(64),
    xl: scale(48),
    lg: scale(32),
    md: scale(24),
    sm: scale(20),
    xs: scale(16),
    xxs: scale(12),
  },

  // Border radius
  borderRadius: {
    full: 9999,
    xl: scale(16),
    lg: scale(12),
    md: scale(8),
    sm: scale(4),
  },

  // Alturas de imagen (escalado para web)
  imageHeight: {
    hero: scale(300),
    card: scale(200),
    thumbnail: scale(120),
    avatar: scale(100),
    avatarSmall: scale(60),
    icon: scale(40),
  },

  // Safe area (solo móvil)
  safeArea: {
    top: isMobile ? 44 : 0,
    bottom: isMobile ? 34 : 0,
  },
};

// Función helper para dimensiones responsivas
export const wp = (percentage: number) => (width * percentage) / 100;
export const hp = (percentage: number) => (height * percentage) / 100;