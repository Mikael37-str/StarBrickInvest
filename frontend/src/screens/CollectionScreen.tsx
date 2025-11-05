"use client"

import { useEffect, useContext, useState } from "react"
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from "react-native"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { responsive } from "../utils/responsive"
import { commonStyles } from "../styles/commonStyles"

import HamburgerMenu from "../components/HamburgerMenu"



const { width, height } = Dimensions.get("window")
const ITEMS_PER_PAGE = 15

type CollectionItem = {
  id: number
  item_type: string
  item_id: number
  name: string
  quantity: number
  paid_price_usd: number
  condition_status: string
  notes?: string
  image?: string
  added_at: string
}

type CollectionStats = {
  totalItems: number
  totalSets: number
  totalMinifigures: number
  totalInvested: string
  totalValue: string
  profitLoss: string
  profitLossPercentage: string
}

export default function CollectionScreen({ navigation }: any) {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<CollectionItem[]>([])
  const [stats, setStats] = useState<CollectionStats>({
    totalItems: 0,
    totalSets: 0,
    totalMinifigures: 0,
    totalInvested: "0.00",
    totalValue: "0.00",
    profitLoss: "0.00",
    profitLossPercentage: "0.00"
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [editModal, setEditModal] = useState({
    visible: false,
    item: null as CollectionItem | null,
    quantity: "",
    paidPrice: "",
    condition: "new",
    notes: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCollection()
    }
  }, [user])

  useEffect(() => {
    loadMoreItems()
  }, [items, currentPage])

  const fetchCollection = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await axios.get(`http://192.168.1.47:3000/api/collection/${user.id}`)
      
      if (response.data.success) {
        setItems(response.data.items || [])
        setStats(response.data.stats || stats)
      }
    } catch (error) {
      console.error("Error fetching collection:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const loadMoreItems = () => {
    const startIndex = 0
    const endIndex = currentPage * ITEMS_PER_PAGE
    setDisplayedItems(items.slice(startIndex, endIndex))
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const openEditModal = (item: CollectionItem) => {
    setEditModal({
      visible: true,
      item,
      quantity: item.quantity.toString(),
      paidPrice: item.paid_price_usd.toString(),
      condition: item.condition_status || "new",
      notes: item.notes || ""
    })
  }

  const closeEditModal = () => {
    setEditModal({
      visible: false,
      item: null,
      quantity: "",
      paidPrice: "",
      condition: "new",
      notes: ""
    })
  }

  const handleUpdateItem = async () => {
    if (!editModal.item) return

    const quantity = parseInt(editModal.quantity)
    const paidPrice = parseFloat(editModal.paidPrice)

    if (isNaN(quantity) || quantity < 1) {
      Alert.alert("Error", "La cantidad debe ser al menos 1")
      return
    }

    if (isNaN(paidPrice) || paidPrice < 0) {
      Alert.alert("Error", "Ingresa un precio válido")
      return
    }

    try {
      setIsUpdating(true)
      const response = await axios.put(
        `http://192.168.1.47:3000/api/collection/${editModal.item.id}`,
        {
          quantity,
          paidPrice,
          condition: editModal.condition,
          notes: editModal.notes
        }
      )

      if (response.data.success) {
        Alert.alert("Éxito", "Artículo actualizado correctamente")
        closeEditModal()
        fetchCollection()
      }
    } catch (error) {
      console.error("Error updating item:", error)
      Alert.alert("Error", "No se pudo actualizar el artículo")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteItem = (item: CollectionItem) => {
    Alert.alert(
      "Eliminar de Colección",
      `¿Estás seguro de eliminar "${item.name}" de tu colección?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `http://192.168.1.47:3000/api/collection/${item.id}`
              )
              
              if (response.data.success) {
                Alert.alert("Éxito", "Artículo eliminado de la colección")
                fetchCollection()
              }
            } catch (error) {
              console.error("Error deleting item:", error)
              Alert.alert("Error", "No se pudo eliminar el artículo")
            }
          }
        }
      ]
    )
  }

  const profitLoss = parseFloat(stats.profitLoss)
  const profitLossPercentage = parseFloat(stats.profitLossPercentage)
  const isProfit = profitLoss >= 0
  const hasMore = displayedItems.length < items.length

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando colección...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <ImageBackground
          source={{
            uri: "https://www.thebrickzone.com.au/wp-content/uploads/2023/04/star-wars-the-brick-zone-maleny.jpg",
          }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          <LinearGradient colors={["rgba(10, 10, 10, 0.7)", "rgba(10, 10, 10, 0.9)"]} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="albums" size={48} color={colors.accent} />
              </View>
              <Text style={styles.heroTitle}>MI COLECCIÓN</Text>
              <View style={styles.heroLine} />
              <Text style={styles.heroSubtitle}>
                Gestiona y visualiza tu colección personal de LEGO Star Wars
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.content}>
          {/* Add Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => navigation.navigate("AddToCollection")}
          >
            <Ionicons name="add-circle" size={24} color="#000" />
            <Text style={styles.addNewButtonText}>Agregar Artículo</Text>
          </TouchableOpacity>

          {displayedItems.length > 0 ? (
            <>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="cube" size={28} color={colors.accent} />
                  </View>
                  <Text style={styles.statNumber}>{stats.totalItems}</Text>
                  <Text style={styles.statLabel}>Total Artículos</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="layers" size={28} color="#4A90E2" />
                  </View>
                  <Text style={styles.statNumber}>{stats.totalSets}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="people" size={28} color="#E94B3C" />
                  </View>
                  <Text style={styles.statNumber}>{stats.totalMinifigures}</Text>
                  <Text style={styles.statLabel}>Minifiguras</Text>
                </View>
              </View>

              {/* Financial Stats */}
              <View style={styles.financialCard}>
                <View style={styles.financialHeader}>
                  <Ionicons name="stats-chart" size={24} color={colors.accent} />
                  <Text style={styles.financialTitle}>Valor de Colección</Text>
                </View>

                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Inversión Total</Text>
                  <Text style={styles.financialValue}>${stats.totalInvested} USD</Text>
                </View>

                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Valor Actual</Text>
                  <Text style={styles.financialValue}>${stats.totalValue} USD</Text>
                </View>

                <View style={styles.financialDivider} />

                <View style={styles.profitLossContainer}>
                  <View style={styles.profitLossRow}>
                    <Ionicons
                      name={isProfit ? "trending-up" : "trending-down"}
                      size={24}
                      color={isProfit ? "#50C878" : "#E94B3C"}
                    />
                    <Text style={styles.profitLossLabel}>
                      {isProfit ? "Ganancia" : "Pérdida"}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.profitLossValue, { color: isProfit ? "#50C878" : "#E94B3C" }]}>
                      {isProfit ? "+" : ""}${Math.abs(profitLoss).toFixed(2)} USD
                    </Text>
                    <Text style={[styles.profitLossPercentage, { color: isProfit ? "#50C878" : "#E94B3C" }]}>
                      {isProfit ? "+" : ""}{profitLossPercentage}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Collection Items */}
              <View style={styles.itemsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tus Artículos</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{displayedItems.length}/{items.length}</Text>
                  </View>
                </View>

                <View style={styles.itemsGrid}>
                  {displayedItems.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                      {/* Item Type Badge */}
                      <View style={[
                        styles.typeBadge,
                        item.item_type === "set" ? styles.setBadge : styles.minifigBadge
                      ]}>
                        <Ionicons
                          name={item.item_type === "set" ? "cube" : "person"}
                          size={12}
                          color="#fff"
                        />
                        <Text style={styles.typeBadgeText}>
                          {item.item_type === "set" ? "SET" : "MINIFIG"}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => openEditModal(item)}
                        >
                          <Ionicons name="create" size={18} color={colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteItem(item)}
                        >
                          <Ionicons name="trash" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>

                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.itemImagePlaceholder}>
                          <Ionicons
                            name={item.item_type === "set" ? "cube" : "person"}
                            size={64}
                            color={colors.textSecondary}
                          />
                        </View>
                      )}

                      <View style={styles.itemContent}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>

                        <View style={styles.itemMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="layers" size={14} color={colors.accent} />
                            <Text style={styles.metaText}>Cantidad: {item.quantity}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="cash" size={14} color={colors.accent} />
                            <Text style={styles.metaText}>${item.paid_price_usd}/u</Text>
                          </View>
                        </View>

                        <View style={styles.conditionBadge}>
                          <Ionicons
                            name={item.condition_status === "new" ? "sparkles" : "time"}
                            size={12}
                            color={colors.accent}
                          />
                          <Text style={styles.conditionText}>
                            {item.condition_status === "new" ? "Nuevo" : "Usado"}
                          </Text>
                        </View>

                        {item.notes && (
                          <View style={styles.notesContainer}>
                            <Ionicons name="document-text" size={12} color={colors.textSecondary} />
                            <Text style={styles.notesText} numberOfLines={2}>
                              {item.notes}
                            </Text>
                          </View>
                        )}

                        <Text style={styles.addedDate}>
                          Agregado: {new Date(item.added_at).toLocaleDateString("es-ES")}
                        </Text>
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
                      Cargar Más ({items.length - displayedItems.length} restantes)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="albums-outline" size={80} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Tu colección está vacía</Text>
              <Text style={styles.emptyText}>
                Comienza agregando sets y minifiguras a tu colección personal
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => navigation.navigate("AddToCollection")}
              >
                <Ionicons name="add-circle" size={24} color="#000" />
                <Text style={styles.emptyAddButtonText}>Agregar Artículo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModal.visible}
          onRequestClose={closeEditModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Artículo</Text>
                <TouchableOpacity onPress={closeEditModal}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {editModal.item && (
                  <>
                    <Text style={styles.modalItemName}>{editModal.item.name}</Text>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Precio Pagado (USD)</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="cash-outline" size={20} color={colors.accent} />
                        <TextInput
                          style={styles.formInput}
                          value={editModal.paidPrice}
                          onChangeText={(text) => setEditModal({ ...editModal, paidPrice: text.replace(/[^0-9.]/g, '') })}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Cantidad</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="layers-outline" size={20} color={colors.accent} />
                        <TextInput
                          style={styles.formInput}
                          value={editModal.quantity}
                          onChangeText={(text) => setEditModal({ ...editModal, quantity: text.replace(/[^0-9]/g, '') })}
                          keyboardType="numeric"
                          placeholder="1"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Condición</Text>
                      <View style={styles.conditionButtons}>
                        <TouchableOpacity
                          style={[
                            styles.conditionButton,
                            editModal.condition === "new" && styles.conditionButtonActive
                          ]}
                          onPress={() => setEditModal({ ...editModal, condition: "new" })}
                        >
                          <Ionicons
                            name="sparkles"
                            size={18}
                            color={editModal.condition === "new" ? "#000" : colors.text}
                          />
                          <Text
                            style={[
                              styles.conditionButtonText,
                              editModal.condition === "new" && styles.conditionButtonTextActive
                            ]}
                          >
                            Nuevo
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.conditionButton,
                            editModal.condition === "used" && styles.conditionButtonActive
                          ]}
                          onPress={() => setEditModal({ ...editModal, condition: "used" })}
                        >
                          <Ionicons
                            name="time"
                            size={18}
                            color={editModal.condition === "used" ? "#000" : colors.text}
                          />
                          <Text
                            style={[
                              styles.conditionButtonText,
                              editModal.condition === "used" && styles.conditionButtonTextActive
                            ]}
                          >
                            Usado
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Notas</Text>
                      <TextInput
                        style={[styles.formInput, styles.notesInput]}
                        value={editModal.notes}
                        onChangeText={(text) => setEditModal({ ...editModal, notes: text })}
                        multiline
                        numberOfLines={3}
                        placeholder="Agrega notas opcionales..."
                        placeholderTextColor={colors.textSecondary}
                        maxLength={500}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
                      onPress={handleUpdateItem}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={24} color="#000" />
                          <Text style={styles.updateButtonText}>Actualizar</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal}>
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  heroBackground: {
    width: "100%",
    height: width > 768 ? 280 : 220,
  },
  heroBackgroundImage: {
    opacity: 0.95,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  heroContent: {
    alignItems: "center",
    maxWidth: 600,
    paddingTop: width < 768 ? 50 : 0, // ✅ Agregar espacio arriba para el botón hamburguesa en mobile
  position: 'relative', // ✅ Agregar esto
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
  heroTitle: {
    fontFamily: "SparTakus",
    fontWeight: "bold",
    color: colors.accent,
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addNewButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: width > 768 ? "row" : "column",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  financialCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  financialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  financialTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  financialDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  profitLossContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profitLossRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profitLossLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  profitLossValue: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
  },
  profitLossPercentage: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 2,
  },
  itemsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.accent,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: width < 500 ? "center" : "flex-start",
  },
  itemCard: {
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
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  setBadge: {
    backgroundColor: "#4A90E2",
  },
  minifigBadge: {
    backgroundColor: "#E94B3C",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  actionButtons: {
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
  itemImage: {
    width: "100%",
    height: 200,
    backgroundColor: colors.background,
  },
  itemImagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  conditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  addedDate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: "italic",
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
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyAddButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.accent,
    marginBottom: 24,
    lineHeight: 24,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  conditionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  conditionButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  conditionButtonTextActive: {
    color: "#000",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
})