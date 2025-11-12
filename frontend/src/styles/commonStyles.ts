// frontend/src/styles/commonStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { responsive } from '../utils/responsive';

const isWeb = Platform.OS === 'web';

export const commonStyles = StyleSheet.create({
  // Safe Area
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // En web, limitar ancho máximo para mejor lectura
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
    paddingHorizontal: responsive.spacing.md,
    // Altura fija más pequeña
    minHeight: isWeb ? 40 : 50,
  },

  inputIcon: {
    marginRight: responsive.spacing.sm,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: responsive.typography.base,
    paddingVertical: responsive.spacing.sm,
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive.spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: isWeb ? responsive.spacing.sm : responsive.spacing.md,
    paddingHorizontal: responsive.spacing.lg,
    borderRadius: responsive.borderRadius.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: isWeb ? 40 : 50,
  },

  primaryButtonText: {
    color: '#000',
    fontSize: responsive.typography.base,
    fontWeight: 'bold',
  },

  secondaryButton: {
    paddingVertical: isWeb ? responsive.spacing.sm : responsive.spacing.md,
    paddingHorizontal: responsive.spacing.lg,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: isWeb ? 40 : 50,
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: responsive.typography.base,
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '20',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Text styles
  heading: {
    fontSize: responsive.typography.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },

  subheading: {
    fontSize: responsive.typography.lg,
    fontWeight: '600',
    color: colors.text,
  },

  bodyText: {
    fontSize: responsive.typography.base,
    color: colors.text,
    lineHeight: responsive.typography.base * 1.5,
  },

  caption: {
    fontSize: responsive.typography.sm,
    color: colors.textSecondary,
  },
});