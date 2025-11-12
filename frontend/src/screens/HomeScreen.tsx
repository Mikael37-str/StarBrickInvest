"use client"

import { useEffect, useState, useContext } from "react"
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, SafeAreaView } from "react-native"
import { colors } from "../theme/colors"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import HamburgerMenu from "../components/HamburgerMenu"
import { responsive } from "../utils/responsive"


type Article = {
  id: number
  title: string
  created_at?: string
  image?: string
}

const { width, height } = Dimensions.get("window")

export default function HomeScreen({ navigation }: any) {
  const [articles, setArticles] = useState<Article[]>([])
  const { user } = useContext(AuthContext)

  useEffect(() => {
    axios
      .get("https://perfect-encouragement-production.up.railway.app/api/articles")
      .then((res) => setArticles(res.data.articles || []))
      .catch(() => setArticles([]))
  }, [])

  const features = [
    {
      icon: "cube-outline",
      title: "Catálogo",
      description: "Sets y minifiguras actualizados",
      color: "#4A90E2",
    },
    {
      icon: "albums-outline",
      title: "Colección",
      description: "Control detallado personal",
      color: "#E94B3C",
      requiresAuth: true,
    },
    {
      icon: "trending-up-outline",
      title: "Mercado",
      description: "Análisis de valor en tiempo real",
      color: "#50C878",
    },
    {
      icon: "newspaper-outline",
      title: "Insights",
      description: "Tendencias y predicciones",
      color: "#F5A623",
    },
    {
      icon: "star-outline",
      title: "Wishlist",
      description: "Alertas de precios",
      color: "#BD10E0",
      requiresAuth: true,
    },
    {
      icon: "shield-checkmark-outline",
      title: "Comunidad",
      description: "Red de coleccionistas",
      color: "#FFD700",
      requiresAuth: true,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <HamburgerMenu navigation={navigation} currentScreen="NombreDeLaPantalla" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <ImageBackground
          source={{
            uri: "https://www.hdwallpapers.in/download/millennium_falcon_4k_hd_lego_star_wars_the_skywalker_saga-3840x2160.jpg",
          }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          <LinearGradient colors={["rgba(10, 10, 10, 0.6)", "rgba(10, 10, 10, 0.85)"]} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroLabel}>BIENVENIDO A</Text>
                <Text style={styles.heroTitle}>STAR BRICK</Text>
                <Text style={styles.heroTitle}>INVEST</Text>
                <View style={styles.heroLine} />
                <Text style={styles.heroSubtitle}>
                  La plataforma más avanzada para{"\n"}coleccionistas de LEGO Star Wars
                </Text>

                {!user && (
                  <View style={styles.heroActions}>
                    <TouchableOpacity style={styles.heroPrimaryBtn} onPress={() => navigation.navigate("Register")}>
                      <Text style={styles.heroPrimaryBtnText}>Comenzar Gratis</Text>
                      <Ionicons name="rocket" size={18} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heroSecondaryBtn} onPress={() => navigation.navigate("Login")}>
                      <Text style={styles.heroSecondaryBtnText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>950+</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.300</Text>
            <Text style={styles.statLabel}>Minifiguras</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Más de 200</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featuresHeader}>
            <View>
              <Text style={styles.featuresTitle}>Funcionalidades</Text>
              <Text style={styles.featuresSubtitle}>Todo lo que necesitas en un solo lugar</Text>
            </View>
          </View>

          <View style={styles.featuresLayout}>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.featureCardCompact, feature.requiresAuth && !user && styles.featureCardDisabled]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconCompact, { backgroundColor: feature.color + "20" }]}>
                    <Ionicons
                      name={feature.icon as any}
                      size={20}
                      color={feature.requiresAuth && !user ? colors.textSecondary : feature.color}
                    />
                  </View>
                  <View style={styles.featureTextCompact}>
                    <Text style={styles.featureTitleCompact}>{feature.title}</Text>
                    <Text style={styles.featureDescCompact}>{feature.description}</Text>
                  </View>
                  {feature.requiresAuth && !user && (
                    <View style={styles.lockIconContainer}>
                      <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {width > 768 && (
              <View style={styles.admiralContainer}>
                <Image
                  source={{ uri: "https://cdn1.epicgames.com/offer/9c59efaabb6a48f19b3485d5d9416032/EGS_LEGOStarWarsObiWanKenobiPack_TTGames_DLC_G1A_00_1920x1080-55a316fa3c1b55f18baebe318b3ae06e" }}
                  style={styles.admiralImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </View>

        {/* Latest Articles - Modern Cards */}
        <View style={styles.articlesSection}>
          <View style={styles.articleHeader}>
            <View>
              <Text style={styles.articlesTitle}>Últimas Novedades</Text>
              <Text style={styles.articlesSubtitle}>Mantente informado del mercado</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate("Articles")}
            >
              <Text style={styles.viewAllText}>Ver todo</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {articles.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.articlesScroll} nestedScrollEnabled={true}>
              {articles.slice(0, 5).map((article, index) => (
                <TouchableOpacity 
                  key={article.id} 
                  style={[styles.articleCardModern, index === 0 && styles.firstCard]}
                  onPress={() => navigation.navigate("ArticleDetail", { article })}
                >
                  <View style={styles.articleImageContainer}>
                    {article.image ? (
                      <Image
                        source={{ uri: article.image }}
                        style={styles.articleImageModern}
                      />
                    ) : (
                      <View style={styles.articleImagePlaceholder}>
                        <Ionicons name="newspaper" size={40} color={colors.textSecondary} />
                      </View>
                    )}
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.articleGradient} />
                  </View>
                  <View style={styles.articleContentModern}>
                    <Text style={styles.articleTitleModern} numberOfLines={2}>
                      {article.title}
                    </Text>
                    {article.created_at && (
                      <Text style={styles.articleDateModern}>
                        {new Date(article.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No hay artículos disponibles</Text>
            </View>
          )}
        </View>

        {/* CTA Section - Only for guests */}
        {!user && (
          <View style={styles.ctaContainer}>
            <LinearGradient
              colors={[colors.accent + "30", colors.accent + "10"]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.ctaContent}>
                <Ionicons name="rocket-outline" size={48} color={colors.accent} />
                <Text style={styles.ctaTitle}>¿Listo para despegar?</Text>
                <Text style={styles.ctaText}>
                  Únete a miles de coleccionistas y comienza a gestionar tu colección hoy
                </Text>
                <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.ctaButtonText}>Crear Cuenta Gratis</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions for logged users */}
        {user && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("AddToCollection")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#4A90E2" + "20" }]}>
                  <Ionicons name="add-circle" size={28} color="#4A90E2" />
                </View>
                <Text style={styles.quickActionText}>Agregar a Colección</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("Sets")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#50C878" + "20" }]}>
                  <Ionicons name="cube" size={28} color="#50C878" />
                </View>
                <Text style={styles.quickActionText}>Buscar Sets</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate("Minifigures")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "#F5A623" + "20" }]}>
                  <Ionicons name="people" size={28} color="#F5A623" />
                </View>
                <Text style={styles.quickActionText}>Buscar Minifiguras</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  heroBackground: {
    width: "100%",
    height: width > 768 ? height * 0.35 : height * 0.28,
  },
  heroBackgroundImage: {
    opacity: 0.95,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "center",
  },
  heroContent: {
    paddingHorizontal: width > 768 ? 40 : 20,
  },
  heroTextContainer: {
    maxWidth: "100%",
  },
  heroLabel: {
    fontFamily: "SparTakus",
    fontSize: width > 768 ? 11 : 9,
    color: colors.accent,
    letterSpacing: 3,
    fontWeight: "600",
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: "SparTakus",
    fontWeight: "bold",
    color: colors.accent,
    lineHeight: width > 768 ? 52 : width > 400 ? 36 : 32,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroLine: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    marginVertical: 14,
    borderRadius: 2,
  },
  heroSubtitle: {
    fontSize: width > 768 ? 15 : 13,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 28,
  },
  heroActions: {
    flexDirection: width > 480 ? "row" : "column",
    gap: 12,
    flexWrap: "wrap",
  },
  heroPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: width > 480 ? "auto" : "100%",
  },
  heroPrimaryBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  heroSecondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    width: width > 480 ? "auto" : "100%",
  },
  heroSecondaryBtnText: {
    color: colors.accent,
    fontWeight: "bold",
    fontSize: 15,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: width > 768 ? 40 : 20,
    marginTop: -30,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  statNumber: {
    fontSize: width > 768 ? 26 : width > 400 ? 18 : 16,
    fontWeight: "bold",
    color: colors.accent,
    textAlign: "center",
  },
  statLabel: {
    fontSize: width > 768 ? 11 : 9,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  featuresContainer: {
    marginTop: 40,
    paddingHorizontal: width > 768 ? 40 : 20,
  },
  featuresHeader: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: width > 768 ? 26 : 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  featuresSubtitle: {
    fontSize: width > 768 ? 13 : 12,
    color: colors.textSecondary,
  },
  featuresLayout: {
    flexDirection: width > 768 ? "row" : "column",
    gap: 20,
    alignItems: "stretch",
  },
  featuresGrid: {
    flex: width > 768 ? 0.6 : undefined,
    gap: 10,
    justifyContent: "space-between",
  },
  featureCardCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent + "20",
    gap: 10,
  },
  featureCardDisabled: {
    opacity: 0.5,
  },
  featureIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextCompact: {
    flex: 1,
  },
  featureTitleCompact: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  featureDescCompact: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 13,
  },
  lockIconContainer: {
    padding: 4,
  },
  admiralContainer: {
    flex: 0.4,
    aspectRatio: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.accent + "30",
    backgroundColor: colors.surface,
  },
  admiralImage: {
    width: "100%",
    height: "100%",
  },
  articlesSection: {
    marginTop: 50,
    paddingBottom: 20,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width > 768 ? 40 : 20,
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  articlesTitle: {
    fontSize: width > 768 ? 24 : 20,
    fontWeight: "bold",
    color: colors.text,
  },
  articlesSubtitle: {
    fontSize: width > 768 ? 13 : 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  articlesScroll: {
    paddingLeft: width > 768 ? 40 : 20,
  },
  articleCardModern: {
    width: width > 768 ? 260 : width * 0.7,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent + "20",
  },
  firstCard: {
    marginLeft: 0,
  },
  articleImageContainer: {
    height: width > 768 ? 150 : 120,
    position: "relative",
  },
  articleImageModern: {
    width: "100%",
    height: "100%",
  },
  articleImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  articleGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  articleContentModern: {
    padding: 16,
  },
  articleTitleModern: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    lineHeight: 21,
  },
  articleDateModern: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  ctaContainer: {
    marginHorizontal: width > 768 ? 40 : 20,
    marginTop: 40,
    marginBottom: 30,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  ctaGradient: {
    padding: width > 768 ? 28 : 24,
  },
  ctaContent: {
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: width > 768 ? 24 : 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  quickActions: {
    paddingHorizontal: width > 768 ? 40 : 20,
    marginTop: 40,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: width > 768 ? 22 : 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 18,
  },
  quickActionsGrid: {
    flexDirection: width > 768 ? "row" : "column",
    gap: 12,
  },
  quickActionCard: {
    flex: width > 768 ? 1 : undefined,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent + "20",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 11,
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 14,
  },
})