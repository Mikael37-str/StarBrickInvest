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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import axios from "axios"
import { responsive } from "../utils/responsive"

export default function EditArticleScreen({ navigation, route }: any) {
  const { article } = route.params

  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)
  const [imageUrl, setImageUrl] = useState(article.image || "")
  const [category, setCategory] = useState(article.category)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const categories = [
    { id: "news", label: "Noticias", icon: "newspaper" },
    { id: "review", label: "Análisis", icon: "star" },
    { id: "tutorial", label: "Tutorial", icon: "bulb" },
    { id: "market", label: "Mercado", icon: "trending-up" },
  ]

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio")
      return
    }

    if (!content.trim()) {
      setError("El contenido no puede estar vacío")
      return
    }

    if (title.length > 200) {
      setError("El título no puede exceder 200 caracteres")
      return
    }

    if (content.length > 10000) {
      setError("El contenido no puede exceder 10,000 caracteres")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.put(`https://perfect-encouragement-production.up.railway.app/api/articles/${article.id}`, {
        title: title.trim(),
        content: content.trim(),
        category: category,
        image_url: imageUrl.trim() || null,
      })

      if (response.data.success) {
        setSuccess(true)
        setError("")

        Alert.alert("Éxito", "Artículo actualizado correctamente")

        setTimeout(() => {
          navigation.navigate("Articles")
        }, 1500)
      } else {
        setError(response.data.message || "Error al actualizar artículo")
      }
    } catch (err: any) {
      console.error("Error completo:", err)
      setError(err.response?.data?.message || err.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={responsive.iconSize.md} color={colors.accent} />
          </TouchableOpacity>
          <Ionicons name="create" size={responsive.iconSize.xxl} color={colors.accent} />
          <Text style={styles.title}>Editar Artículo</Text>
          <Text style={styles.subtitle}>Modifica el contenido del artículo</Text>
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
              <Text style={styles.successText}>¡Artículo actualizado correctamente!</Text>
            </View>
          ) : null}

          {/* Categorías */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, category === cat.id && styles.categoryCardActive]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
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

          {/* Título */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Título *</Text>
              <Text style={styles.charCount}>{title.length}/200</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="text" size={responsive.iconSize.sm} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Escribe un título atractivo..."
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
              />
            </View>
          </View>

          {/* URL de imagen */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de Imagen</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="link" size={responsive.iconSize.sm} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
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
                  onError={() => setError("No se pudo cargar la imagen")}
                />
              </View>
            ) : null}
          </View>

          {/* Contenido */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Contenido *</Text>
              <Text style={styles.charCount}>{content.length}/10000</Text>
            </View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="document-text" size={responsive.iconSize.sm} color={colors.textSecondary} style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escribe el contenido del artículo..."
                placeholderTextColor={colors.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={12}
                maxLength={10000}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.helpText}>Comparte información valiosa, análisis o noticias relevantes</Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.updateButton, loading && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={responsive.iconSize.md} color="#000" />
                  <Text style={styles.updateButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()} 
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { 
    flexGrow: 1, 
    padding: responsive.spacing.lg, 
    paddingTop: responsive.spacing.xxxl + (responsive.safeArea.top || 20)
  },
  header: { alignItems: "center", marginBottom: responsive.spacing.xxl },
  backButton: { position: "absolute", left: 0, top: 0, padding: responsive.spacing.xs },
  title: { fontSize: responsive.typography.xxl, fontWeight: "bold", color: colors.accent, marginTop: responsive.spacing.md },
  subtitle: { fontSize: responsive.typography.sm, color: colors.textSecondary, marginTop: responsive.spacing.xs, textAlign: "center" },
  form: { width: "100%" },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20",
    padding: responsive.spacing.sm,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.xs,
  },
  errorText: { color: colors.error, fontSize: responsive.typography.sm, flex: 1 },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#50C878" + "20",
    padding: responsive.spacing.sm,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.xs,
    borderWidth: 1,
    borderColor: "#50C878" + "40",
  },
  successText: { color: "#50C878", fontSize: responsive.typography.sm, flex: 1, fontWeight: "600" },
  inputGroup: { marginBottom: responsive.spacing.xl },
  label: { fontSize: responsive.typography.sm, fontWeight: "600", color: colors.text, marginBottom: responsive.spacing.xs },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: responsive.spacing.xs },
  charCount: { fontSize: responsive.typography.xs, color: colors.textSecondary },
  categoriesGrid: { flexDirection: "row", gap: responsive.spacing.sm, flexWrap: "wrap" },
  categoryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    padding: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    gap: responsive.spacing.xs,
  },
  categoryCardActive: { borderColor: colors.accent, backgroundColor: colors.accent + "20" },
  categoryLabel: { fontSize: responsive.typography.xs, color: colors.textSecondary, fontWeight: "600" },
  categoryLabelActive: { color: colors.accent },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    paddingHorizontal: responsive.spacing.md,
  },
  inputIcon: { marginRight: responsive.spacing.sm },
  input: { flex: 1, color: colors.text, fontSize: responsive.typography.base, paddingVertical: responsive.spacing.md },
  textAreaContainer: { alignItems: "flex-start", paddingTop: responsive.spacing.md },
  textAreaIcon: { marginRight: responsive.spacing.sm, marginTop: 2 },
  textArea: { minHeight: 200, paddingTop: 0 },
  helpText: { fontSize: responsive.typography.xs, color: colors.textSecondary, marginTop: responsive.spacing.xxs },
  imagePreview: { marginTop: responsive.spacing.sm, borderRadius: responsive.borderRadius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.accent + "30" },
  previewImage: { width: "100%", height: 200, resizeMode: "cover" },
  buttonContainer: { gap: responsive.spacing.sm, marginTop: responsive.spacing.xs },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsive.spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonDisabled: { opacity: 0.6 },
  updateButtonText: { color: "#000", fontSize: responsive.typography.lg, fontWeight: "bold" },
  cancelButton: {
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.textSecondary, fontSize: responsive.typography.base, fontWeight: "600" },
})