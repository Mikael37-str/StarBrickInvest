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
  Alert,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import axios from "axios"
import { responsive } from "../utils/responsive"
import { commonStyles } from "../styles/commonStyles"
import HamburgerMenu from "../components/HamburgerMenu"

export default function CreateArticleScreen({ navigation }: any) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("news")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const categories = [
    { id: "news", label: "Noticias", icon: "newspaper" },
    { id: "review", label: "Análisis", icon: "star" },
    { id: "tutorial", label: "Tutorial", icon: "bulb" },
    { id: "market", label: "Mercado", icon: "trending-up" },
  ]

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio")
      return
    }

    if (!content.trim()) {
      setError("El contenido no puede estar vacío")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("https://perfect-encouragement-production.up.railway.app/api/articles", {
        title: title.trim(),
        content: content.trim(),
        category: category,
        image_url: imageUrl.trim() || null
      })

      if (response.data.success) {
        setSuccess(true)
        setError("")
        
        setTimeout(() => {
          navigation.navigate("Articles")
        }, 2000)
      } else {
        setError(response.data.message || "Error al publicar artículo")
      }
    } catch (err: any) {
      console.error("Error completo:", err)
      setError(err.response?.data?.message || err.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <HamburgerMenu navigation={navigation} currentScreen="CreateArticle" />
      
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
            <Ionicons name="create" size={responsive.iconSize.xxl} color={colors.accent} />
            <Text style={styles.title}>Crear Artículo</Text>
            <Text style={styles.subtitle}>Comparte noticias y análisis con la comunidad</Text>
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
                <Text style={styles.successText}>¡Artículo publicado correctamente! Redirigiendo...</Text>
              </View>
            ) : null}

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, category === cat.id && styles.categoryCardActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={responsive.iconSize.md}
                      color={category === cat.id ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[styles.categoryLabel, category === cat.id && styles.categoryLabelActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Título *</Text>
                <Text style={styles.charCount}>{title.length}/100</Text>
              </View>
              <View style={commonStyles.inputContainer}>
                <Ionicons 
                  name="text" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={commonStyles.inputIcon} 
                />
                <TextInput
                  style={commonStyles.input}
                  placeholder="Escribe un título atractivo..."
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
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
              <Text style={styles.helpText}>Pega la URL de una imagen desde Imgur, BrickLink, etc.</Text>
              
              {imageUrl ? (
                <View style={styles.imagePreview}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.previewImage}
                    onError={() => Alert.alert('Error', 'No se pudo cargar la imagen')}
                  />
                </View>
              ) : null}
            </View>

            {/* Content */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contenido *</Text>
                <Text style={styles.charCount}>{content.length}/5000</Text>
              </View>
              <View style={[styles.textAreaContainer]}>
                <Ionicons 
                  name="document-text" 
                  size={responsive.iconSize.sm} 
                  color={colors.textSecondary} 
                  style={styles.textAreaIcon} 
                />
                <TextInput
                  style={[commonStyles.input, styles.textArea]}
                  placeholder="Escribe el contenido del artículo..."
                  placeholderTextColor={colors.textSecondary}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={responsive.isSmallPhone ? 8 : 12}
                  maxLength={5000}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.helpText}>Comparte información valiosa, análisis o noticias relevantes</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[commonStyles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handlePublish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={responsive.iconSize.md} color="#000" />
                    <Text style={commonStyles.primaryButtonText}>Publicar Artículo</Text>
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsive.spacing.xs,
  },
  charCount: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
  },
  categoriesGrid: {
    flexDirection: "row",
    gap: responsive.spacing.sm,
    flexWrap: "wrap",
  },
  categoryCard: {
    flex: 1,
    minWidth: responsive.isSmallPhone ? "45%" : "22%",
    backgroundColor: colors.surface,
    padding: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    gap: responsive.spacing.xs,
  },
  categoryCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + "20",
  },
  categoryLabel: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryLabelActive: {
    color: colors.accent,
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
    resizeMode: "cover",
  },
  textAreaContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    paddingHorizontal: responsive.spacing.md,
    paddingTop: responsive.spacing.md,
  },
  textAreaIcon: {
    marginRight: responsive.spacing.sm,
    marginTop: 2,
  },
  textArea: {
    minHeight: responsive.isSmallPhone ? 160 : 200,
    paddingTop: 0,
  },
  buttonContainer: {
    gap: responsive.spacing.sm,
    marginTop: responsive.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})