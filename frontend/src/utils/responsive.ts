// src/utils/responsive.ts
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BREAKPOINTS = {
  xs: 360,    // Teléfonos pequeños
  sm: 480,    // Teléfonos normales
  md: 768,    // Tablets
  lg: 1024,   // Desktop pequeño
  xl: 1200,   // Desktop mediano
  xxl: 1400,  // Desktop grande
};

// Detección de dispositivo
export const isSmallPhone = width < BREAKPOINTS.xs;
export const isMobile = width < BREAKPOINTS.md;
export const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
export const isDesktop = width >= BREAKPOINTS.lg;

// Funciones de dimensión responsive
export const rw = (percentage: number) => (width * percentage) / 100;
export const rh = (percentage: number) => (height * percentage) / 100;

// Función para normalizar tamaños de fuente
const scale = width / 375; // Base: iPhone 8
export const normalize = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'web') {
    return Math.round(newSize);
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Spacing responsive con mejor progresión
export const spacing = {
  xxs: isSmallPhone ? 4 : isMobile ? 6 : 8,
  xs: isSmallPhone ? 6 : isMobile ? 8 : 12,
  sm: isSmallPhone ? 10 : isMobile ? 12 : 16,
  md: isSmallPhone ? 14 : isMobile ? 16 : 20,
  lg: isSmallPhone ? 18 : isMobile ? 20 : 24,
  xl: isSmallPhone ? 22 : isMobile ? 24 : 32,
  xxl: isSmallPhone ? 28 : isMobile ? 32 : 40,
  xxxl: isSmallPhone ? 36 : isMobile ? 40 : 48,
};

// Typography con normalize para mejor escalado
export const typography = {
  xxs: normalize(10),
  xs: normalize(11),
  sm: normalize(13),
  md: normalize(15),
  base: normalize(16),
  lg: normalize(18),
  xl: normalize(22),
  xxl: normalize(28),
  xxxl: normalize(36),
  hero: normalize(isSmallPhone ? 24 : isMobile ? 28 : 42),
};

// Hero heights responsive mejorado
export const heroHeight = isSmallPhone ? rh(25) : isMobile ? rh(28) : isTablet ? rh(32) : rh(35);

// Grid columns para diferentes breakpoints
export const getGridColumns = () => {
  if (width >= BREAKPOINTS.xxl) return 5;
  if (width >= BREAKPOINTS.xl) return 4;
  if (width >= BREAKPOINTS.lg) return 3;
  if (width >= BREAKPOINTS.md) return 2;
  return 1; // Mobile siempre 1 columna
};

// Card width responsive con mejor cálculo
export const getCardWidth = () => {
  const columns = getGridColumns();
  if (columns === 1) {
    // Mobile: full width menos padding
    return width - (spacing.lg * 2);
  }
  const totalGaps = (columns - 1) * spacing.md;
  const containerPadding = spacing.lg * 2;
  const availableWidth = width - containerPadding - totalGaps;
  return Math.floor(availableWidth / columns);
};

// Safe area insets mejorado
export const safeArea = {
  top: Platform.select({
    ios: isMobile ? 44 : 20,
    android: 0,
    web: 0,
    default: 0,
  }) || 0,
  bottom: Platform.select({
    ios: isMobile ? 34 : 0,
    android: 0,
    web: 0,
    default: 0,
  }) || 0,
};

// Tamaños de imágenes responsive
export const imageHeight = {
  card: isSmallPhone ? 160 : isMobile ? 180 : 200,
  hero: heroHeight,
  avatar: isSmallPhone ? 80 : isMobile ? 100 : 110,
  avatarSmall: isSmallPhone ? 48 : isMobile ? 56 : 64,
};

// Tamaños de botones responsive
export const buttonHeight = {
  small: isSmallPhone ? 36 : isMobile ? 40 : 44,
  medium: isSmallPhone ? 44 : isMobile ? 48 : 52,
  large: isSmallPhone ? 52 : isMobile ? 56 : 60,
};

// Border radius responsive
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

// Icon sizes responsive
export const iconSize = {
  xs: isSmallPhone ? 14 : isMobile ? 16 : 18,
  sm: isSmallPhone ? 18 : isMobile ? 20 : 22,
  md: isSmallPhone ? 22 : isMobile ? 24 : 28,
  lg: isSmallPhone ? 28 : isMobile ? 32 : 36,
  xl: isSmallPhone ? 36 : isMobile ? 40 : 48,
  xxl: isSmallPhone ? 48 : isMobile ? 56 : 64,
};

// Función helper para condicionales de tamaño
export const responsiveSize = (mobile: number, tablet?: number, desktop?: number) => {
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

export const responsive = {
  // Dimensiones
  width,
  height,
  
  // Device types
  isSmallPhone,
  isMobile,
  isTablet,
  isDesktop,
  
  // Spacing
  spacing,
  
  // Typography
  typography,
  normalize,
  
  // Dimensions
  heroHeight,
  imageHeight,
  buttonHeight,
  borderRadius,
  iconSize,
  
  // Grid
  getGridColumns,
  getCardWidth,
  
  // Safe area
  safeArea,
  
  // Helpers
  rw,
  rh,
  responsiveSize,
};