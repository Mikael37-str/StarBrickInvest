// AddToCollectionScreen.tsx
"use client"

import React, { useEffect, useState, useContext } from "react"
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { colors } from "../theme/colors"
import axios from "axios"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AuthContext } from "../context/AuthContext"
import { responsive } from "../utils/responsive"

const { width } = Dimensions.get("window")

// === PAGINACIÓN: ajustar aquí el tamaño del bloque ===
const ITEMS_PER_PAGE = 20

type Item = {
  id: number
  item_id?: string
  name: string
  year?: number
  pieces?: number
  appearances?: number
  price_usd?: number
  avg_price_usd?: number
  image?: string
  type: "set" | "minifigure"
  retired?: number
}

type AddModalData = {
  visible: boolean
  item: Item | null
  quantity: string
  paidPrice: string
  condition: "new" | "used"
  notes: string
}

export default function AddToCollectionScreen({ navigation }: any) {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [displayedItems, setDisplayedItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Filtros
  const [typeFilter, setTypeFilter] = useState<"all" | "set" | "minifigure">("all")
  const [yearFilter, setYearFilter] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [showFilters, setShowFilters] = useState(false)

  // Modal de añadir
  const [addModal, setAddModal] = useState<AddModalData>({
    visible: false,
    item: null,
    quantity: "1",
    paidPrice: "",
    condition: "new",
    notes: ""
  })

  const [isAdding, setIsAdding] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // PAGINACIÓN estados
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAllItems()
  }, [])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, typeFilter, yearFilter, priceRange])

  // cuando cambia filteredItems o currentPage, actualizar displayedItems
  useEffect(() => {
    const end = currentPage * ITEMS_PER_PAGE
    setDisplayedItems(filteredItems.slice(0, end))
  }, [filteredItems, currentPage])

  const fetchAllItems = async () => {
    try {
      setLoading(true)
      const [setsRes, minifsRes] = await Promise.all([
        axios.get("https://perfect-encouragement-production.up.railway.app/api/sets"),
        axios.get("https://perfect-encouragement-production.up.railway.app/api/minifigures")
      ])

      const sets = (setsRes.data.sets || []).map((s: any) => ({
        ...s,
        item_id: s.set_id,
        type: "set" as const,
        price_usd: s.price_usd ?? s.avg_price_usd ?? null,
      }))

      const minifigs = (minifsRes.data.minifigures || []).map((m: any) => ({
        ...m,
        item_id: m.minifig_id,
        price_usd: m.price_usd ?? m.avg_price_usd ?? null,
        type: "minifigure" as const
      }))

      // combinar sets y minifigs
      const all = [...sets, ...minifigs]
      setItems(all)
    } catch (error) {
      console.error("Error fetching items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...items]

    // Búsqueda por nombre o ID
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.item_id && item.item_id.toString().toLowerCase().includes(q))
      )
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    // Filtro de año
    if (yearFilter) {
      const year = parseInt(yearFilter)
      if (!isNaN(year)) {
        filtered = filtered.filter((item) => item.year === year)
      }
    }

    // Filtro de precio
    if (priceRange.min) {
      const min = parseFloat(priceRange.min)
      if (!isNaN(min)) {
        filtered = filtered.filter((item) => (item.price_usd || 0) >= min)
      }
    }
    if (priceRange.max) {
      const max = parseFloat(priceRange.max)
      if (!isNaN(max)) {
        filtered = filtered.filter((item) => (item.price_usd || 0) <= max)
      }
    }

    // actualizar filteredItems y resetear paginación
    setFilteredItems(filtered)
    setCurrentPage(1)
  }

  // función para cargar más ítems (incrementa página)
  const loadMoreItems = () => {
    // si ya mostramos todo, no hacemos nada
    if (displayedItems.length >= filteredItems.length) return
    setCurrentPage((prev) => prev + 1)
  }

  const openAddModal = (item: Item) => {
    setAddModal({
      visible: true,
      item,
      quantity: "1",
      paidPrice: item.price_usd ? String(item.price_usd) : "",
      condition: "new",
      notes: ""
    })
    setShowSuccessMessage(false)
  }

  const closeAddModal = () => {
    setAddModal({
      visible: false,
      item: null,
      quantity: "1",
      paidPrice: "",
      condition: "new",
      notes: ""
    })
    setShowSuccessMessage(false)
  }

  const handleAddToCollection = async () => {
    if (!addModal.item || !user) return

    const quantity = parseInt(addModal.quantity)
    const paidPrice = parseFloat(addModal.paidPrice)

    if (isNaN(quantity) || quantity < 1) {
      Alert.alert("Error", "La cantidad debe ser al menos 1")
      return
    }

    if (isNaN(paidPrice) || paidPrice < 0) {
      Alert.alert("Error", "Ingresa un precio válido")
      return
    }

    try {
      setIsAdding(true)
      const response = await axios.post("https://perfect-encouragement-production.up.railway.app/api/collection/add", {
        userId: user.id,
        itemType: addModal.item.type,
        itemId: addModal.item.id,
        quantity,
        paidPrice,
        condition: addModal.condition,
        notes: addModal.notes
      })

      if (response.data.success) {
        setShowSuccessMessage(true)
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setShowSuccessMessage(false)
          closeAddModal()
        }, 3000)
      } else {
        Alert.alert("Error", response.data.message || "No se pudo agregar el artículo")
      }
    } catch (error) {
      console.error("Error adding to collection:", error)
      Alert.alert("Error", "Ocurrió un error al agregar el artículo")
    } finally {
      setIsAdding(false)
    }
  }

  const clearFilters = () => {
    setTypeFilter("all")
    setYearFilter("")
    setPriceRange({ min: "", max: "" })
    setSearch("")
  }

  // Render
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <ImageBackground
          source={{
            uri: "https://images8.alphacoders.com/128/1282423.jpg"
          }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          <LinearGradient colors={["rgba(10, 10, 10, 0.7)", "rgba(10, 10, 10, 0.9)"]} style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="add-circle" size={48} color={colors.accent} />
              </View>
              <Text style={styles.heroTitle}>AGREGAR A COLECCIÓN</Text>
              <View style={styles.heroLine} />
              <Text style={styles.heroSubtitle}>
                Busca y añade sets o minifiguras a tu colección personal
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o ID..."
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

          {/* Filter Toggle */}
          <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options" size={20} color={colors.accent} />
            <Text style={styles.filterToggleText}>
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Text>
            {(typeFilter !== "all" || yearFilter || priceRange.min || priceRange.max) && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>●</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Filters Panel */}
          {showFilters && (
            <View style={styles.filtersPanel}>
              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Tipo de Artículo</Text>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "all" && styles.filterButtonActive]}
                    onPress={() => setTypeFilter("all")}
                  >
                    <Text style={[styles.filterButtonText, typeFilter === "all" && styles.filterButtonTextActive]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "set" && styles.filterButtonActive]}
                    onPress={() => setTypeFilter("set")}
                  >
                    <Ionicons
                      name="cube"
                      size={16}
                      color={typeFilter === "set" ? "#000" : colors.text}
                    />
                    <Text style={[styles.filterButtonText, typeFilter === "set" && styles.filterButtonTextActive]}>
                      Sets
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "minifigure" && styles.filterButtonActive]}
                    onPress={() => setTypeFilter("minifigure")}
                  >
                    <Ionicons
                      name="people"
                      size={16}
                      color={typeFilter === "minifigure" ? "#000" : colors.text}
                    />
                    <Text style={[styles.filterButtonText, typeFilter === "minifigure" && styles.filterButtonTextActive]}>
                      Minifigs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Year Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Año</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Ej: 2023"
                  placeholderTextColor={colors.textSecondary}
                  value={yearFilter}
                  onChangeText={setYearFilter}
                  keyboardType="numeric"
                />
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Rango de Precio (USD)</Text>
                <View style={styles.priceRangeContainer}>
                  <TextInput
                    style={[styles.filterInput, styles.priceInput]}
                    placeholder="Mín"
                    placeholderTextColor={colors.textSecondary}
                    value={priceRange.min}
                    onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={[styles.filterInput, styles.priceInput]}
                    placeholder="Máx"
                    placeholderTextColor={colors.textSecondary}
                    value={priceRange.max}
                    onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Ionicons name="refresh" size={18} color={colors.accent} />
                <Text style={styles.clearFiltersText}>Limpiar Filtros</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="grid" size={24} color={colors.accent} />
              <Text style={styles.statNumber}>{filteredItems.length}</Text>
              <Text style={styles.statLabel}>Artículos disponibles</Text>
            </View>
          </View>

          {/* Items Grid */}
          {displayedItems.length > 0 ? (
            <View style={styles.itemsGrid}>
              {displayedItems.map((item) => (
                <View key={`${item.type}-${item.id}`} style={styles.itemCard}>
                  {/* Type Badge */}
                  <View style={[styles.typeBadge, item.type === "set" ? styles.setBadge : styles.minifigBadge]}>
                    <Ionicons
                      name={item.type === "set" ? "cube" : "person"}
                      size={12}
                      color="#fff"
                    />
                    <Text style={styles.typeBadgeText}>{item.type === "set" ? "SET" : "MINIFIG"}</Text>
                  </View>

                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons
                        name={item.type === "set" ? "cube" : "person"}
                        size={64}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}

                  <View style={styles.itemContent}>
                    {item.item_id && (
                      <View style={styles.itemIdBadge}>
                        <Ionicons name="barcode" size={12} color={colors.accent} />
                        <Text style={styles.itemIdText}>{item.item_id}</Text>
                      </View>
                    )}

                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.itemDetails}>
                      {item.year && (
                        <View style={styles.detailItem}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{item.year}</Text>
                        </View>
                      )}
                      {item.type === "set" && item.pieces && (
                        <View style={styles.detailItem}>
                          <Ionicons name="apps-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{item.pieces} pzs</Text>
                        </View>
                      )}
                      {item.type === "minifigure" && item.appearances && (
                        <View style={styles.detailItem}>
                          <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{item.appearances} sets</Text>
                        </View>
                      )}
                    </View>

                    {item.price_usd !== undefined && item.price_usd !== null && (
                      <View style={styles.priceContainer}>
                        <Ionicons name="pricetag" size={14} color={colors.accent} />
                        <Text style={styles.priceText}>${Number(item.price_usd).toFixed(2)} USD</Text>
                      </View>
                    )}

                    {item.type === "set" && item.retired === 1 && (
                      <View style={styles.retiredBadge}>
                        <Ionicons name="archive" size={12} color="#E94B3C" />
                        <Text style={styles.retiredText}>RETIRADO</Text>
                      </View>
                    )}
                  </View>

                  {/* Add Button */}
                  <TouchableOpacity style={styles.addButton} onPress={() => openAddModal(item)}>
                    <Ionicons name="add-circle" size={20} color={colors.accent} />
                    <Text style={styles.addButtonText}>Añadir</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No se encontraron artículos</Text>
              <Text style={styles.emptyText}>Intenta ajustar los filtros de búsqueda</Text>
            </View>
          )}

          {/* Load More Button */}
          {displayedItems.length < filteredItems.length && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreItems}>
              <Ionicons name="arrow-down-circle" size={24} color={colors.accent} />
              <Text style={styles.loadMoreText}>
                Cargar más ({filteredItems.length - displayedItems.length} restantes)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Add to Collection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModal.visible}
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir a Colección</Text>
              <TouchableOpacity onPress={closeAddModal}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {addModal.item && (
                <>
                  {/* Mensaje de éxito */}
                  {showSuccessMessage && (
                    <View style={styles.successMessage}>
                      <Ionicons name="checkmark-circle" size={48} color={colors.accent} />
                      <Text style={styles.successTitle}>¡Añadido correctamente!</Text>
                      <Text style={styles.successText}>
                        {addModal.item.name} se ha agregado a tu colección
                      </Text>
                    </View>
                  )}

                  {!showSuccessMessage && (
                    <>
                      {/* Vista previa del ítem */}
                      <View style={styles.modalItemPreview}>
                        {addModal.item.image ? (
                          <Image
                            source={{ uri: addModal.item.image }}
                            style={styles.modalItemImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.modalItemImagePlaceholder}>
                            <Ionicons
                              name={addModal.item.type === "set" ? "cube" : "person"}
                              size={48}
                              color={colors.textSecondary}
                            />
                          </View>
                        )}

                        <Text style={styles.modalItemName} numberOfLines={2}>
                          {addModal.item.name}
                        </Text>

                        {addModal.item.price_usd && (
                          <Text style={styles.modalItemPrice}>
                            {`Precio de mercado: $${Number(addModal.item.price_usd).toFixed(2)} USD`}
                          </Text>
                        )}
                      </View>

                      {/* Precio pagado */}
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Precio Pagado (USD) *</Text>
                        <View style={styles.inputContainer}>
                          <Ionicons name="cash-outline" size={20} color={colors.accent} />
                          <TextInput
                            style={styles.formInput}
                            placeholder="0.00"
                            placeholderTextColor={colors.textSecondary}
                            value={addModal.paidPrice}
                            onChangeText={(text) => setAddModal({ ...addModal, paidPrice: text })}
                            keyboardType="decimal-pad"
                          />
                        </View>
                      </View>

                      {/* Cantidad */}
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Cantidad *</Text>
                        <View style={styles.inputContainer}>
                          <Ionicons name="layers-outline" size={20} color={colors.accent} />
                          <TextInput
                            style={styles.formInput}
                            placeholder="1"
                            placeholderTextColor={colors.textSecondary}
                            value={addModal.quantity}
                            onChangeText={(text) => setAddModal({ ...addModal, quantity: text })}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      {/* Condición */}
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Condición</Text>
                        <View style={styles.conditionButtons}>
                          <TouchableOpacity
                            style={[
                              styles.conditionButton,
                              addModal.condition === "new" && styles.conditionButtonActive,
                            ]}
                            onPress={() => setAddModal({ ...addModal, condition: "new" })}
                          >
                            <Ionicons
                              name="sparkles"
                              size={18}
                              color={addModal.condition === "new" ? "#000" : colors.text}
                            />
                            <Text
                              style={[
                                styles.conditionButtonText,
                                addModal.condition === "new" && styles.conditionButtonTextActive,
                              ]}
                            >
                              Nuevo
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.conditionButton,
                              addModal.condition === "used" && styles.conditionButtonActive,
                            ]}
                            onPress={() => setAddModal({ ...addModal, condition: "used" })}
                          >
                            <Ionicons
                              name="time"
                              size={18}
                              color={addModal.condition === "used" ? "#000" : colors.text}
                            />
                            <Text
                              style={[
                                styles.conditionButtonText,
                                addModal.condition === "used" && styles.conditionButtonTextActive,
                              ]}
                            >
                              Usado
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Notas */}
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Notas (Opcional)</Text>
                        <TextInput
                          style={[styles.formInput, styles.notesInput]}
                          placeholder="Ej: Comprado en oferta, caja dañada, etc."
                          placeholderTextColor={colors.textSecondary}
                          value={addModal.notes}
                          onChangeText={(text) => setAddModal({ ...addModal, notes: text })}
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      {/* Botones de acción */}
                      <TouchableOpacity
                        style={[styles.addToCollectionButton, isAdding && styles.addToCollectionButtonDisabled]}
                        onPress={handleAddToCollection}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <ActivityIndicator color="#000" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={24} color="#000" />
                            <Text style={styles.addToCollectionButtonText}>Añadir a Colección</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.background,
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
  },
  heroContent: {
    alignItems: "center",
    maxWidth: 600,
    paddingTop: width < 768 ? 50 : 0,
    position: "relative",
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
    fontSize: 22,
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
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  filterToggleText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  filterBadge: {
    marginLeft: 4,
  },
  filterBadgeText: {
    color: colors.accent,
    fontSize: 16,
  },
  filtersPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  filterInput: {
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  clearFiltersText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    alignItems: "center",
  },
  statNumber: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 20,
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
    width: width > 1400 ? "23%" : width > 1000 ? "31%" : width > 700 ? "48%" : "100%",
    minWidth: 250,
    position: "relative",
    marginBottom: 16,
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  setBadge: {
    backgroundColor: "#4A90E2",
  },
  minifigBadge: {
    backgroundColor: "#E94B3C",
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
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
  itemIdBadge: {
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
  itemIdText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  itemDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.accent,
  },
  retiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E94B3C" + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  retiredText: {
    fontSize: 10,
    color: "#E94B3C",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.accent + "20",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.accent + "30",
  },
  addButtonText: {
    color: colors.accent,
    fontSize: 14,
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
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 8,
  },
  loadMoreText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  successMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accent,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  modalItemPreview: {
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  modalItemImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  modalItemImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 12,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalItemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
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
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  formInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: "top",
    minHeight: 80,
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
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  conditionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  conditionButtonTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  addToCollectionButton: {
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
  addToCollectionButtonDisabled: {
    opacity: 0.6,
  },
  addToCollectionButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
})