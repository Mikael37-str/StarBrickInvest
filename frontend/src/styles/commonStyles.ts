// src/styles/commonStyles.ts
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { responsive } from '../utils/responsive';

const { width } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
  // ========== CONTAINERS ==========
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: responsive.spacing.xl,
  },
  
  content: {
    padding: responsive.spacing.lg,
    marginTop: -20,
  },
  
  // ========== HERO SECTION ==========
  heroBackground: {
    width: '100%',
    height: responsive.heroHeight,
  },
  
  heroBackgroundImage: {
    opacity: 0.95,
  },
  
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
  },
  
  heroContent: {
    width: '100%',
    paddingHorizontal: responsive.spacing.lg,
    paddingTop: responsive.isMobile ? 60 : responsive.spacing.xl,
    position: 'relative',
  },
  
  heroTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  
  heroLabel: {
    fontFamily: Platform.OS === 'web' ? 'SparTakus, sans-serif' : 'SparTakus',
    fontSize: responsive.typography.xxs,
    color: colors.accent,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: responsive.spacing.xs,
    textAlign: 'center',
  },
  
  heroTitle: {
    fontFamily: Platform.OS === 'web' ? 'SparTakus, sans-serif' : 'SparTakus',
    fontSize: responsive.typography.hero,
    fontWeight: 'bold',
    color: colors.accent,
    lineHeight: responsive.typography.hero + 4,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
      },
      default: {
        textShadowColor: 'rgba(255, 215, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
      },
    }),
  },
  
  heroLine: {
    width: responsive.isSmallPhone ? 50 : 60,
    height: responsive.isSmallPhone ? 3 : 4,
    backgroundColor: colors.accent,
    marginVertical: responsive.spacing.sm,
    borderRadius: 2,
  },
  
  heroSubtitle: {
    fontSize: responsive.typography.sm,
    color: colors.text,
    lineHeight: responsive.typography.sm * 1.5,
    marginBottom: responsive.spacing.xl,
    textAlign: 'center',
    paddingHorizontal: responsive.spacing.md,
  },
  
  // ========== BUTTONS ==========
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive.spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: responsive.spacing.lg,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    ...Platform.select({
      web: {
        boxShadow: `0 4px 8px ${colors.accent}4D`,
      },
      default: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: responsive.typography.md,
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive.spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: responsive.spacing.lg,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  
  secondaryButtonText: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: responsive.typography.md,
  },
  
  // ========== SEARCH BAR ==========
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    paddingHorizontal: responsive.spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  
  searchIcon: {
    marginRight: responsive.spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: responsive.spacing.md,
    fontSize: responsive.typography.md,
    outlineStyle: 'none' as any,
  },
  
  // ========== STATS BAR ==========
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    padding: responsive.spacing.md,
    marginBottom: responsive.spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: responsive.typography.xl,
    fontWeight: 'bold',
    color: colors.accent,
  },
  
  statLabel: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  
  // ========== CARDS ==========
  card: {
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.accent + '20',
    width: responsive.isMobile ? '100%' : responsive.getCardWidth(),
    maxWidth: responsive.isMobile ? width - (responsive.spacing.lg * 2) : 380,
    marginBottom: responsive.spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      },
    }),
  },
  
  cardImage: {
    width: '100%',
    height: responsive.imageHeight.card,
    backgroundColor: colors.background,
  },
  
  cardImagePlaceholder: {
    width: '100%',
    height: responsive.imageHeight.card,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardContent: {
    padding: responsive.spacing.md,
  },
  
  cardTitle: {
    fontSize: responsive.typography.base,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive.spacing.sm,
    lineHeight: responsive.typography.base * 1.4,
  },
  
  // ========== GRID ==========
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive.spacing.md,
    justifyContent: responsive.isMobile ? 'center' : 'flex-start',
  },
  
  // ========== BADGES ==========
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent + '20',
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xxs,
    borderRadius: responsive.borderRadius.md,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    fontSize: responsive.typography.xxs,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // ========== MODALS ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.spacing.lg,
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.xl,
    padding: responsive.spacing.xl,
    width: '100%',
    maxWidth: responsive.isMobile ? width - (responsive.spacing.lg * 2) : 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.lg,
    paddingBottom: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  modalTitle: {
    fontSize: responsive.typography.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  // ========== EMPTY STATE ==========
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.spacing.xxxl,
    paddingHorizontal: responsive.spacing.lg,
  },
  
  emptyTitle: {
    fontSize: responsive.typography.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: responsive.spacing.md,
    textAlign: 'center',
  },
  
  emptyText: {
    fontSize: responsive.typography.sm,
    color: colors.textSecondary,
    marginTop: responsive.spacing.xs,
    textAlign: 'center',
    lineHeight: responsive.typography.sm * 1.5,
  },
  
  // ========== LOADING ==========
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: responsive.spacing.xl,
  },
  
  loadingText: {
    color: colors.text,
    fontSize: responsive.typography.md,
    marginTop: responsive.spacing.md,
  },
  
  // ========== FORM ELEMENTS ==========
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
    paddingHorizontal: responsive.spacing.md,
    marginBottom: responsive.spacing.md,
  },
  
  input: {
    flex: 1,
    color: colors.text,
    fontSize: responsive.typography.md,
    paddingVertical: responsive.spacing.md,
    outlineStyle: 'none' as any,
  },
  
  inputIcon: {
    marginRight: responsive.spacing.sm,
  },
  
  // ========== SECTION HEADERS ==========
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.lg,
    flexWrap: 'wrap',
    gap: responsive.spacing.sm,
  },
  
  sectionTitle: {
    fontSize: responsive.typography.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  sectionSubtitle: {
    fontSize: responsive.typography.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  // ========== LOAD MORE BUTTON ==========
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive.spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    marginTop: responsive.spacing.lg,
    marginBottom: responsive.spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  
  loadMoreText: {
    color: colors.accent,
    fontSize: responsive.typography.md,
    fontWeight: 'bold',
  },
});