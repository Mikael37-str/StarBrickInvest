import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"
import { responsive } from "../utils/responsive"
import HamburgerMenu from "../components/HamburgerMenu"

export default function AdminPanel({ navigation }: any) {
  const adminOptions = [
    {
      icon: "create",
      title: "Crear Artículo",
      description: "Publicar noticias y análisis",
      route: "CreateArticle",
      color: "#F5A623",
    },
    {
      icon: "documents",
      title: "Ver Artículos",
      description: "Gestionar contenido publicado",
      route: "Articles",
      color: "#50C878",
    },
    {
      icon: "cube",
      title: "Agregar Set",
      description: "Añadir nuevo set al catálogo",
      route: "CreateSet",
      color: "#4A90E2",
    },
    {
      icon: "people",
      title: "Agregar Minifigura",
      description: "Añadir nueva minifigura al catálogo",
      route: "CreateMinifigure",
      color: "#E94B3C",
    },
  ]

  return (
    <View style={styles.container}>
      <HamburgerMenu navigation={navigation} currentScreen="AdminPanel" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={responsive.iconSize.xxl} color={colors.accent} />
          <Text style={styles.title}>Panel de Administración</Text>
          <Text style={styles.subtitle}>Gestiona el contenido de la plataforma</Text>
        </View>

        <View style={styles.optionsContainer}>
          {adminOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionCard} 
              onPress={() => navigation.navigate(option.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + "20" }]}>
                <Ionicons name={option.icon as any} size={responsive.iconSize.lg} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={responsive.iconSize.md} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Ionicons name="stats-chart" size={responsive.iconSize.md} color={colors.accent} />
            <Text style={styles.statsTitle}>Estadísticas Rápidas</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="newspaper" size={responsive.iconSize.sm} color={colors.accent} />
              <Text style={styles.statLabel}>Artículos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cube" size={responsive.iconSize.sm} color={colors.accent} />
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={responsive.iconSize.sm} color={colors.accent} />
              <Text style={styles.statLabel}>Minifigs</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={responsive.iconSize.md} color={colors.accent} />
          <Text style={styles.infoText}>
            Como administrador, puedes crear contenido editorial, gestionar el catálogo completo y mantener la comunidad informada.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: responsive.spacing.lg,
    paddingTop: responsive.spacing.xxxl + (responsive.safeArea.top || 20),
    paddingBottom: responsive.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: responsive.spacing.xxl,
    paddingTop: responsive.spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: responsive.typography.xxl,
    fontWeight: "bold",
    marginTop: responsive.spacing.md,
    marginBottom: responsive.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: responsive.typography.sm,
    textAlign: "center",
    paddingHorizontal: responsive.spacing.md,
  },
  optionsContainer: {
    gap: responsive.spacing.md,
    marginBottom: responsive.spacing.xl,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: responsive.isSmallPhone ? 48 : 56,
    height: responsive.isSmallPhone ? 48 : 56,
    borderRadius: responsive.isSmallPhone ? 24 : 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsive.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontSize: responsive.typography.base,
    fontWeight: "bold",
    marginBottom: responsive.spacing.xxs,
  },
  optionDescription: {
    color: colors.textSecondary,
    fontSize: responsive.typography.xs,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.lg,
    marginBottom: responsive.spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.sm,
    marginBottom: responsive.spacing.md,
  },
  statsTitle: {
    color: colors.text,
    fontSize: responsive.typography.lg,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: responsive.spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: responsive.typography.xs,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.accent + "20",
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.md,
    gap: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + "40",
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: responsive.typography.sm,
    lineHeight: responsive.typography.sm * 1.5,
  },
})