import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Switch,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import axios from "axios"
import { responsive } from "../utils/responsive"
import { commonStyles } from "../styles/commonStyles"
import HamburgerMenu from "../components/HamburgerMenu"

export default function CreateSetScreen({ navigation }: any) {
  const [setId, setSetId] = useState("")
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [pieces, setPieces] = useState("")
  const [priceUsd, setPriceUsd] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [retired, setRetired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isValidImageUrl = (url: string): boolean => {
    if (!url) return true
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i
    return urlPattern.test(url)
  }

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      setPriceUsd(parts[0] + '.' + parts.slice(1).join(''))
    } else {
      setPriceUsd(cleaned)
    }
  }

  const handleNumberChange = (text: string, setter: (value: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '')
    setter(cleaned)
  }

  const handleSetIdChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '')
    setSetId(cleaned)
  }

  const validateForm = (): string | null => {
    if (!setId.trim()) {
      return "El ID del set es obligatorio"
    }

    if (!name.trim()) {
      return "El nombre del set es obligatorio"
    }

    if (!/^\d+$/.test(setId.trim())) {
      return "El ID del set solo puede contener números"
    }

    if (setId.trim().length < 3) {
      return "El ID del set debe tener al menos 3 dígitos"
    }

    if (setId.trim().length > 10) {
      return "El ID del set no puede exceder 10 dígitos"
    }

    if (name.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres"
    }

    if (name.trim().length > 200) {
      return "El nombre no puede exceder 200 caracteres"
    }

    if (year) {
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      
      if (yearNum < 1975) {
        return "El año no puede ser anterior a 1975"
      }
      
      if (yearNum > currentYear + 2) {
        return `El año no puede ser posterior a ${currentYear + 2}`
      }
    }

    if (pieces) {
      const piecesNum = parseInt(pieces)
      
      if (piecesNum < 1) {
        return "El número de piezas debe ser mayor a 0"
      }
      
      if (piecesNum > 50000) {
        return "El número de piezas parece excesivo (máx: 50,000)"
      }
    }

    if (priceUsd) {
      const price = parseFloat(priceUsd)
      
      if (isNaN(price) || price < 0) {
        return "El precio debe ser un número válido mayor o igual a 0"
      }
      
      if (price > 10000) {
        return "El precio parece excesivo (máx: $10,000)"
      }

      const decimals = priceUsd.split('.')[1]
      if (decimals && decimals.length > 2) {
        return "El precio solo puede tener hasta 2 decimales"
      }
    }

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return "La URL de la imagen debe ser válida y terminar en .jpg, .jpeg, .png, .gif o .webp"
    }

    return null
  }

  const handleCreate = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      const checkResponse = await axios.get("https://perfect-encouragement-production.up.railway.app/api/sets")
      const existingSets = checkResponse.data.sets || []
      
      const isDuplicate = existingSets.some(
        (set: any) => set.set_id === setId.trim()
      )

      if (isDuplicate) {
        setError(`El ID "${setId}" ya existe. Por favor usa otro ID.`)
        setLoading(false)
        return
      }

      const response = await axios.post("https://perfect-encouragement-production.up.railway.app/api/sets", {
        set_id: setId.trim(),
        name: name.trim(),
        year: year ? parseInt(year) : null,
        pieces: pieces ? parseInt(pieces) : null,
        price_usd: priceUsd ? parseFloat(priceUsd) : null,
        image_url: imageUrl.trim() || null,
        retired: retired ? 1 : 0
      })

      if (response.data.success) {
        setSuccess(true)
        setError("")
        
        setTimeout(() => {
          navigation.navigate("Sets")
        }, 2000)
      } else {
        setError(response.data.message || "Error al crear set")
      }
    } catch (err: any) {
      console.error("Error completo:", err)
      if (err.response?.status === 400) {
        setError(err.response.data.message || "Datos inválidos")
      } else {
        setError(err.response?.data?.message || err.message || "Error de conexión")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <HamburgerMenu navigation={navigation} currentScreen="CreateSet" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={responsive.iconSize.md} color={colors.accent} />
            </TouchableOpacity>
            <Ionicons name="cube" size={responsive.iconSize.xxl} color={colors.accent} />
            <Text style={styles.title}>Agregar Set LEGO</Text>
            <Text style={styles.subtitle}>Agrega un nuevo set al catálogo</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={responsive.iconSize.sm} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={responsive.iconSize.sm} color="#50C878" />
                <Text style={styles.successText}>¡Set creado exitosamente! Redirigiendo...</Text>
              </View>
            ) : null}

            {/* Set ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID del Set * (Ej: 75192 - Solo números)</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="barcode" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="75192"
                  placeholderTextColor={colors.textSecondary}
                  value={setId}
                  onChangeText={handleSetIdChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helpText}>Solo números (3-10 dígitos). ID único de BrickLink</Text>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Set *</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="text" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Millennium Falcon UCS"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  maxLength={200}
                />
              </View>
              <Text style={styles.helpText}>{name.length}/200 caracteres</Text>
            </View>

            {/* Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Año de Lanzamiento</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="calendar" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="2017"
                  placeholderTextColor={colors.textSecondary}
                  value={year}
                  onChangeText={(text) => handleNumberChange(text, setYear)}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <Text style={styles.helpText}>Año entre 1975 y {new Date().getFullYear() + 2}</Text>
            </View>

            {/* Pieces */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Piezas</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="apps" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="7541"
                  placeholderTextColor={colors.textSecondary}
                  value={pieces}
                  onChangeText={(text) => handleNumberChange(text, setPieces)}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <Text style={styles.helpText}>Solo números enteros</Text>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio (USD)</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="cash" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="849.99"
                  placeholderTextColor={colors.textSecondary}
                  value={priceUsd}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helpText}>Solo números con hasta 2 decimales (ej: 123.45)</Text>
            </View>

            {/* Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de Imagen</Text>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="link" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  placeholderTextColor={colors.textSecondary}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              <Text style={styles.helpText}>Debe terminar en .jpg, .jpeg, .png, .gif o .webp</Text>
              
              {imageUrl && isValidImageUrl(imageUrl) ? (
                <View style={styles.imagePreview}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.previewImage}
                    onError={() => setError('No se pudo cargar la imagen. Verifica la URL.')}
                  />
                </View>
              ) : imageUrl ? (
                <View style={styles.imageError}>
                  <Ionicons name="alert-circle" size={responsive.iconSize.xs} color={colors.error} />
                  <Text style={styles.imageErrorText}>URL de imagen inválida</Text>
                </View>
              ) : null}
            </View>

            {/* Retired Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleLeft}>
                <Ionicons 
                  name="archive" 
                  size={responsive.iconSize.md} 
                  color={retired ? colors.accent : colors.textSecondary} 
                />
                <View>
                  <Text style={styles.toggleTitle}>Set Retirado</Text>
                  <Text style={styles.toggleSubtitle}>Ya no está en producción</Text>
                </View>
              </View>
              <Switch
                value={retired}
                onValueChange={setRetired}
                trackColor={{ false: colors.border, true: colors.accent + "60" }}
                thumbColor={retired ? colors.accent : colors.textSecondary}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[commonStyles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={responsive.iconSize.md} color="#000" />
                    <Text style={commonStyles.primaryButtonText}>Crear Set</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={commonStyles.secondaryButton} 
                onPress={() => navigation.goBack()} 
                disabled={loading}
              >
                <Text style={commonStyles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: responsive.spacing.lg,
    paddingTop: responsive.isMobile ? 70 : responsive.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: responsive.spacing.xxl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: responsive.spacing.sm,
  },
  title: {
    fontSize: responsive.typography.xxl,
    fontWeight: "bold",
    color: colors.accent,
    marginTop: responsive.spacing.md,
  },
  subtitle: {
    fontSize: responsive.typography.sm,
    color: colors.textSecondary,
    marginTop: responsive.spacing.xs,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20",
    padding: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  errorText: {
    color: colors.error,
    fontSize: responsive.typography.sm,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#50C878" + "20",
    padding: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: "#50C878" + "40",
  },
  successText: {
    color: "#50C878",
    fontSize: responsive.typography.sm,
    flex: 1,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: responsive.spacing.lg,
  },
  label: {
    fontSize: responsive.typography.sm,
    fontWeight: "600",
    color: colors.text,
    marginBottom: responsive.spacing.xs,
  },
  currencyPrefix: {
    fontSize: responsive.typography.base,
    color: colors.text,
    marginRight: 4,
    fontWeight: "600",
  },
  helpText: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    marginTop: responsive.spacing.xxs,
  },
  imagePreview: {
    marginTop: responsive.spacing.sm,
    borderRadius: responsive.borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  previewImage: {
    width: "100%",
    height: responsive.imageHeight.card,
    resizeMode: "contain",
    backgroundColor: colors.background,
  },
  imageError: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.xxs,
    marginTop: responsive.spacing.xxs,
    padding: responsive.spacing.sm,
    backgroundColor: colors.error + "10",
    borderRadius: responsive.borderRadius.sm,
  },
  imageErrorText: {
    fontSize: responsive.typography.xs,
    color: colors.error,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    padding: responsive.spacing.md,
    marginBottom: responsive.spacing.lg,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.sm,
    flex: 1,
  },
  toggleTitle: {
    fontSize: responsive.typography.md,
    fontWeight: "600",
    color: colors.text,
  },
  toggleSubtitle: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    gap: responsive.spacing.sm,
    marginTop: responsive.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})