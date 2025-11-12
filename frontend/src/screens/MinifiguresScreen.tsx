"use client"

import { useEffect, useState, useContext } from "react"
import { ScrollView, Text, View, StyleSheet, TextInput, TouchableOpacity, Image, ImageBackground, Dimensions, Alert, Modal, SafeAreaView, ActivityIndicator } from "react-native"
import { colors } from "../theme/colors"
import axios from "axios"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AuthContext } from "../context/AuthContext"

const { width, height } = Dimensions.get("window")
const ITEMS_PER_PAGE = 15

type Minifigure = {
  id: number
  minifig_id?: string
  name: string
  year?: number
  appearances?: number
  avg_price_usd?: number
  image?: string
}

export default function MinifiguresScreen({ navigation }: any) {
  const { user } = useContext(AuthContext)
  const [minifigures, setMinifigures] = useState<Minifigure[]>([])
  const [filteredMinifigures, setFilteredMinifigures] = useState<Minifigure[]>([])
  const [displayedMinifigures, setDisplayedMinifigures] = useState<Minifigure[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [minifigToDelete, setMinifigToDelete] = useState<{ id: number; name: string } | null>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const isMobile = width < 768

  useEffect(() => {
    fetchMinifigures()
  }, [])

  useEffect(() => {
    filterMinifigures()
  }, [minifigures, search])

  useEffect(() => {
    loadMoreItems()
  }, [filteredMinifigures, currentPage])

  const fetchMinifigures = async () => {
    try {
      setLoading(true)
      const response = await axios.get("https://perfect-encouragement-production.up.railway.app/api/minifigures")
      setMinifigures(response.data.minifigures || [])
    } catch (error) {
      console.error("Error fetching minifigures:", error)
      setMinifigures([])
    } finally {
      setLoading(false)
    }
  }

  const filterMinifigures = () => {
    setCurrentPage(1)
    if (search.trim()) {
      const filtered = minifigures.filter(
        (minifig) =>
          minifig.name.toLowerCase().includes(search.toLowerCase()) ||
          (minifig.minifig_id && minifig.minifig_id.toLowerCase().includes(search.toLowerCase()))
      )
      setFilteredMinifigures(filtered)
    } else {
      setFilteredMinifigures(minifigures)
    }
  }

  const loadMoreItems = () => {
    const startIndex = 0
    const endIndex = currentPage * ITEMS_PER_PAGE
    setDisplayedMinifigures(filteredMinifigures.slice(startIndex, endIndex))
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const openDeleteModal = (minifigId: number, minifigName: string) => {
    setMinifigToDelete({ id: minifigId, name: minifigName })
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!minifigToDelete) return
    
    try {
      const response = await axios.delete(`https://perfect-encouragement-production.up.railway.app/api/minifigures/${minifigToDelete.id}`)
      if (response.data.success) {
        setMinifigures(minifigures.filter(m => m.id !== minifigToDelete.id))
        setDeleteModalVisible(false)
        setMinifigToDelete(null)
        Alert.alert("Ã‰xito", "Minifigura eliminada correctamente")
      } else {
        Alert.alert("Error", response.data.message || "No se pudo eliminar la minifigura")
      }
    } catch (error) {
      console.error("Error eliminando minifigura:", error)
      Alert.alert("Error", "OcurriÃ³ un error al eliminar la minifigura")
    }
  }

  const handleEditMinifigure = (minifig: Minifigure) => {
    // TODO: Navegar a pantalla de ediciÃ³n
    console.log("Editar minifigura:", minifig)
    // navigation.navigate("EditMinifigure", { minifigure: minifig })
  }

  const hasMore = displayedMinifigures.length < filteredMinifigures.length

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Hamburger Menu Overlay */}
      {isMobile && menuVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContent} onStartShouldSetResponder={() => true}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>MenÃº</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false)
                  navigation.navigate("Home")
                }}
              >
                <Ionicons name="home" size={24} color={colors.text} />
                <Text style={styles.menuItemText}>Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false)
                  navigation.navigate("Sets")
                }}
              >
                <Ionicons name="cube" size={24} color={colors.text} />
                <Text style={styles.menuItemText}>Sets</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemActive]}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="people" size={24} color={colors.accent} />
                <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Minifiguras</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false)
                  navigation.navigate("Articles")
                }}
              >
                <Ionicons name="newspaper" size={24} color={colors.text} />
                <Text style={styles.menuItemText}>Arti­culos</Text>
              </TouchableOpacity>

              {user && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false)
                    navigation.navigate("Collection")
                  }}
                >
                  <Ionicons name="albums" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Coleccion</Text>
                </TouchableOpacity>
              )}

              {user && (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false)
                    navigation.navigate("Profile")
                  }}
                >
                  <Ionicons name="person" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Perfil</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Header */}
        <ImageBackground
          source={{
            uri: "https://lumiere-a.akamaihd.net/v1/images/lego-star-wars-life-day-emperor-vader_3ddefbed.jpeg?region=0,0,1536,864&width=768",
          }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          <LinearGradient colors={["rgba(10, 10, 10, 0.7)", "rgba(10, 10, 10, 0.9)"]} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              {/* Hamburger Button */}
              {isMobile && (
                <TouchableOpacity 
                  style={styles.hamburgerButton}
                  onPress={() => setMenuVisible(true)}
                >
                  <Ionicons name="menu" size={28} color={colors.accent} />
                </TouchableOpacity>
              )}

              <View style={styles.heroTextContainer}>
                <Text style={styles.heroLabel}>PERSONAJES UNICOS</Text>
                <Text style={styles.heroTitle}>MINIFIGURAS</Text>
                <Text style={styles.heroTitle}>STAR WARS</Text>
                <View style={styles.heroLine} />
                <Text style={styles.heroSubtitle}>
                  Descubre personajes exclusivos{"\n"}de toda la saga
                </Text>

                {user?.role === "admin" && (
                  <TouchableOpacity 
                    style={styles.heroPrimaryBtn}
                    onPress={() => navigation.navigate("CreateMinifigure")}
                  >
                    <Ionicons name="add-circle" size={18} color="#000" />
                    <Text style={styles.heroPrimaryBtnText}>Agregar Minifigura</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar minifiguras..."
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

          {/* Stats */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{displayedMinifigures.length}</Text>
              <Text style={styles.statLabel}>Mostrando</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredMinifigures.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Minifigures Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Cargando minifiguras...</Text>
            </View>
          ) : displayedMinifigures.length > 0 ? (
            <>
              <View style={styles.minifigsGrid}>
                {displayedMinifigures.map((minifig) => (
                  <View
                    key={minifig.id}
                    style={styles.minifigCard}
                  >
                      {user?.role === "admin" && (
                                  <View style={styles.adminButtons}>
                                    <TouchableOpacity 
                                       style={styles.deleteButton}
                                       onPress={() => openDeleteModal(minifig.id, minifig.name)}
                                    >
                                 <Ionicons name="trash" size={18} color={colors.error} />
                                    </TouchableOpacity>
                                  </View>
                                  )}

                    {minifig.image ? (
                      <Image
                        source={{ uri: minifig.image }}
                        style={styles.minifigImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.minifigImagePlaceholder}>
                        <Ionicons name="person" size={64} color={colors.textSecondary} />
                      </View>
                    )}

                    <View style={styles.minifigContent}>
                      {minifig.minifig_id && (
                        <View style={styles.minifigIdBadge}>
                          <Ionicons name="barcode" size={12} color={colors.accent} />
                          <Text style={styles.minifigIdText}>{minifig.minifig_id}</Text>
                        </View>
                      )}

                      <Text style={styles.minifigName} numberOfLines={2}>
                        {minifig.name}
                      </Text>

                      <View style={styles.minifigDetails}>
                        {minifig.year && (
                          <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.detailText}>{minifig.year}</Text>
                          </View>
                        )}
                        {minifig.appearances && (
                          <View style={styles.detailItem}>
                            <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.detailText}>{minifig.appearances} sets</Text>
                          </View>
                        )}
                      </View>

                      {minifig.avg_price_usd !== undefined && minifig.avg_price_usd !== null && (
                        <View style={styles.priceContainer}>
                          <Ionicons name="cash" size={16} color={colors.accent} />
                          <Text style={styles.priceText}>
                            ${Number(minifig.avg_price_usd).toFixed(2)} USD
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Load More Button */}
              {hasMore && (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                >
                  <Ionicons name="arrow-down-circle" size={24} color={colors.accent} />
                  <Text style={styles.loadMoreText}>
                    Cargar Más ({filteredMinifigures.length - displayedMinifigures.length} restantes)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No se encontraron minifiguras</Text>
              <Text style={styles.emptyText}>
                {search ? "Intenta con otros tÃ©rminos de bÃºsqueda" : "No hay minifiguras disponibles"}
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
                <Text style={styles.modalTitle}>Eliminar Minifigura</Text>
              </View>
              
              <Text style={styles.modalText}>
                ¿Estás seguro de que deseas eliminar "{minifigToDelete?.name}"?
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
    position: "relative",
  },
  hamburgerButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
    backgroundColor: colors.surface + "DD",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent + "40",
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
    fontSize: width > 768 ? 48 : width > 400 ? 32 : 28,
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
    alignSelf: "flex-start",
  },
  heroPrimaryBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 20,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  minifigsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: width < 500 ? "center" : "flex-start",
  },
  minifigCard: {
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
    width: width > 1400 ? (width - 88) / 5 : 
           width > 1100 ? (width - 72) / 4 : 
           width > 800 ? (width - 56) / 3 : 
           width > 500 ? (width - 56) / 2 : 
           width - 40,
    minWidth: 250,
    maxWidth: 350,
    marginBottom: 16,
    position: "relative",
  },
  adminButtons: {
  position: "absolute",
  top: 12,
  right: 12,
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
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  minifigImage: {
    width: "100%",
    height: 200,
    backgroundColor: colors.background,
  },
  minifigImagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  minifigContent: {
    padding: 16,
    minHeight: 180,
  },
  minifigIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  minifigIdText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  minifigName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
    minHeight: 44,
  },
  minifigDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.accent,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  loadMoreText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "bold",
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
  // Hamburger Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuContent: {
    backgroundColor: colors.surface,
    width: '80%',
    maxWidth: 320,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: colors.accent + "30",
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: colors.accent + "20",
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
})