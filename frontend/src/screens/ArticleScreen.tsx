"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import { ScrollView, Text, View, StyleSheet, TextInput, TouchableOpacity, Image, ImageBackground, Dimensions, Modal } from "react-native"
import { colors } from "../theme/colors"
import axios from "axios"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AuthContext } from "../context/AuthContext"
import { useFocusEffect } from '@react-navigation/native'
import HamburgerMenu from "../components/HamburgerMenu"
import { responsive } from "../utils/responsive"


const { width } = Dimensions.get("window")

type Article = {
  id: number
  title: string
  content: string
  category: string
  image?: string
  created_at: string
}

export default function ArticlesScreen({ navigation }: any) {
  const { user } = useContext(AuthContext)
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<{ id: number; title: string } | null>(null)

  const categories = [
    { id: "all", label: "Todos", icon: "apps" },
    { id: "news", label: "Noticias", icon: "newspaper" },
    { id: "review", label: "Análisis", icon: "star" },
    { id: "tutorial", label: "Tutoriales", icon: "bulb" },
    { id: "market", label: "Mercado", icon: "trending-up" },
  ]

  useFocusEffect(
    useCallback(() => {
      fetchArticles()
    }, [])
  )

  useEffect(() => {
    filterArticles()
  }, [articles, search, selectedCategory])

  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://192.168.1.47:3000/api/articles")
      setArticles(response.data.articles || [])
    } catch (error) {
      console.error("Error fetching articles:", error)
      setArticles([])
    }
  }

  const filterArticles = () => {
    let filtered = articles

    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredArticles(filtered)
  }

  const getCategoryIcon = (category: string) => {
    return categories.find((c) => c.id === category)?.icon || "document"
  }

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.id === category)?.label || category
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
  }

  const openDeleteModal = (articleId: number, articleTitle: string) => {
    setArticleToDelete({ id: articleId, title: articleTitle })
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!articleToDelete) return

    try {
      const response = await axios.delete(`http://192.168.1.47:3000/api/articles/${articleToDelete.id}`)
      
      if (response.data.success) {
        setArticles(articles.filter(a => a.id !== articleToDelete.id))
        setDeleteModalVisible(false)
        setArticleToDelete(null)
      }
    } catch (error) {
      console.error("Error eliminando artículo:", error)
    }
  }

  const handleEditArticle = (article: Article) => {
    navigation.navigate("EditArticle", { article })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <ImageBackground
        source={{
          uri: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/store/software/switch/70050000037362/52fd7da3db0c7f12ee3fd1840d6b0bbd2f434053c93222cb02d7c4cd400292dc",
        }}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
      >
        <LinearGradient colors={["rgba(10, 10, 10, 0.7)", "rgba(10, 10, 10, 0.9)"]} style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <HamburgerMenu navigation={navigation} currentScreen="Articles" />
  
            <View style={styles.iconContainer}>
              <Ionicons name="newspaper" size={48} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>ARTÍCULOS</Text>
            <View style={styles.heroLine} />
            <Text style={styles.heroSubtitle}>
              Noticias, análisis y contenido exclusivo del universo LEGO
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        {/* Action Button for Admin */}
        {user?.role === "admin" && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate("CreateArticle")}
          >
            <Ionicons name="add-circle" size={24} color="#000" />
            <Text style={styles.createButtonText}>Crear Artículo</Text>
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar artículos..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? "#000" : colors.textSecondary}
                />
                <Text
                  style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredArticles.length}</Text>
            <Text style={styles.statLabel}>Artículos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{articles.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <View style={styles.articlesGrid}>
            {filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => navigation.navigate("ArticleDetail", { article })}
                activeOpacity={0.8}
              >
                {user?.role === "admin" && (
                  <View style={styles.adminButtons}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={(e) => {
                        e.stopPropagation()
                        handleEditArticle(article)
                      }}
                    >
                      <Ionicons name="create" size={18} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation()
                        openDeleteModal(article.id, article.title)
                      }}
                    >
                      <Ionicons name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}

                {article.image ? (
                  <Image
                    source={{ uri: article.image }} 
                    style={styles.articleImage}
                  />
                ) : (
                  <View style={styles.articleImagePlaceholder}>
                    <Ionicons name="newspaper" size={48} color={colors.textSecondary} />
                  </View>
                )}

                <View style={styles.articleContent}>
                  <View style={styles.articleMeta}>
                    <View style={styles.categoryBadge}>
                      <Ionicons name={getCategoryIcon(article.category) as any} size={12} color={colors.accent} />
                      <Text style={styles.categoryBadgeText}>{getCategoryLabel(article.category)}</Text>
                    </View>
                    <Text style={styles.articleDate}>{formatDate(article.created_at)}</Text>
                  </View>

                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>

                  <Text style={styles.articleExcerpt} numberOfLines={3}>
                    {article.content}
                  </Text>

                  <View style={styles.readMoreContainer}>
                    <Text style={styles.readMoreText}>Leer más</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No se encontraron artículos</Text>
            <Text style={styles.emptyText}>
              {search
                ? "Intenta con otros términos de búsqueda"
                : "No hay artículos disponibles en esta categoría"}
            </Text>
          </View>
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color={colors.error} />
              <Text style={styles.modalTitle}>Eliminar Artículo</Text>
            </View>
            
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas eliminar "{articleToDelete?.title}"?
            </Text>
            <Text style={styles.modalSubtext}>Esta acción no se puede deshacer.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.modalDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({

  heroBackground: {
    width: "100%",
    height: width > 1200 ? 300 : width > 768 ? 280 : 220,
  },
  
  heroTitle: {
    fontFamily: "SparTakus",
    fontSize: width > 1200 ? 42 : width > 768 ? 36 : 28, // ✅ Mejor escala
    fontWeight: "bold",
    color: colors.accent,
    textAlign: "center",
    letterSpacing: 2,
  },
  
  articlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: width > 768 ? 16 : 12, // ✅ Gap ajustable
    paddingBottom: 20,
    justifyContent: width > 768 ? "flex-start" : "center", // ✅ Centrado en mobile
  },
  
  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.accent + "20",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    // ✅ Mejor cálculo responsive
    width: width > 1400 ? (width - 88) / 4 : 
           width > 1000 ? (width - 72) / 3 : 
           width > 700 ? (width - 56) / 2 : 
           width - 40,
    minWidth: 250,
    maxWidth: width > 768 ? 380 : width - 40, // ✅ Max width responsive
    marginBottom: 16,
  },

  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  
  heroBackgroundImage: {
    opacity: 0.95,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: "center",
    maxWidth: 600,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  
  heroLine: {
    width: 80,
    height: 3,
    backgroundColor: colors.accent,
    marginVertical: 12,
    borderRadius: 2,
  },
  heroSubtitle: {
    fontSize: width > 768 ? 15 : 13,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  createButton: {
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
     flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: width > 768 ? 16 : 14, 
  },
  createButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 14,
    fontSize: 16,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#000",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
 
  adminButtons: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  editButton: {
    backgroundColor: colors.surface + "DD",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent + "40",
  },
  deleteButton: {
    backgroundColor: colors.surface + "DD",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  articleImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  articleImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  articleContent: {
    padding: 16,
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  articleDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})