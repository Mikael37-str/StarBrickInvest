"use client"

import { useState, useContext } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import { AuthContext } from "../context/AuthContext"
import { updateProfile } from "../api/api"
import { responsive } from "../utils/responsive"

export default function EditProfileScreen({ navigation }: any) {
  const { user, refreshUser } = useContext(AuthContext)

  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre no puede estar vacío")
      return
    }

    if (bio.length > 500) {
      setError("La biografía no puede exceder 500 caracteres")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await updateProfile(user!.id, name.trim(), bio.trim())

      if (result.success) {
        await refreshUser()
        setSuccess(true)
        setTimeout(() => {
          navigation.goBack()
        }, 1500)
      } else {
        setError(result.message || "Error al actualizar perfil")
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión")
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={responsive.iconSize.md} color={colors.accent} />
          </TouchableOpacity>
          <Ionicons name="create-outline" size={responsive.iconSize.xxl} color={colors.accent} />
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Personaliza tu información</Text>
        </View>

        {/* Form */}
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
              <Text style={styles.successText}>¡Perfil actualizado correctamente!</Text>
            </View>
          ) : null}

          {/* Email (no editable) */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <View style={styles.infoBox}>
              <Ionicons name="mail" size={responsive.iconSize.sm} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <Text style={styles.infoHelp}>El email no se puede modificar</Text>
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={responsive.iconSize.sm} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Biografía</Text>
              <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="document-text" size={responsive.iconSize.sm} color={colors.textSecondary} style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Cuéntanos sobre ti y tu colección de LEGO Star Wars..."
                placeholderTextColor={colors.textSecondary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.helpText}>Comparte tu pasión por LEGO Star Wars con la comunidad</Text>
          </View>

          {/* Preview */}
          {bio.trim() && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Vista previa</Text>
              <View style={styles.previewBox}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewAvatar}>
                    <Ionicons name="person" size={responsive.iconSize.lg} color={colors.accent} />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>{name || "Tu nombre"}</Text>
                    <Text style={styles.previewEmail}>{user?.email}</Text>
                  </View>
                </View>
                <Text style={styles.previewBio}>{bio}</Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={responsive.iconSize.md} color="#000" />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: responsive.spacing.lg,
    paddingTop: responsive.spacing.xxxl + (responsive.safeArea.top || 20),
  },
  header: {
    alignItems: "center",
    marginBottom: responsive.spacing.xxl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: responsive.spacing.xs,
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
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20",
    padding: responsive.spacing.sm,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.xs,
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
    padding: responsive.spacing.sm,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.xs,
  },
  successText: {
    color: "#50C878",
    fontSize: responsive.typography.sm,
    flex: 1,
    fontWeight: "600",
  },
  infoContainer: {
    marginBottom: responsive.spacing.xl,
  },
  infoLabel: {
    fontSize: responsive.typography.sm,
    fontWeight: "600",
    color: colors.text,
    marginBottom: responsive.spacing.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: responsive.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: responsive.typography.base,
  },
  infoHelp: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    marginTop: responsive.spacing.xxs,
    fontStyle: "italic",
  },
  inputGroup: {
    marginBottom: responsive.spacing.xl,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    paddingHorizontal: responsive.spacing.md,
  },
  inputIcon: {
    marginRight: responsive.spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: responsive.typography.base,
    paddingVertical: responsive.spacing.md,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingTop: responsive.spacing.md,
  },
  textAreaIcon: {
    marginRight: responsive.spacing.sm,
    marginTop: 2,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 0,
  },
  helpText: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
    marginTop: responsive.spacing.xxs,
  },
  previewContainer: {
    marginBottom: responsive.spacing.xl,
  },
  previewLabel: {
    fontSize: responsive.typography.sm,
    fontWeight: "600",
    color: colors.text,
    marginBottom: responsive.spacing.sm,
  },
  previewBox: {
    backgroundColor: colors.surface,
    padding: responsive.spacing.lg,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsive.spacing.md,
    paddingBottom: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewAvatar: {
    width: responsive.imageHeight.avatarSmall,
    height: responsive.imageHeight.avatarSmall,
    borderRadius: responsive.imageHeight.avatarSmall / 2,
    backgroundColor: colors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsive.spacing.sm,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: responsive.typography.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: responsive.spacing.xxs,
  },
  previewEmail: {
    fontSize: responsive.typography.sm,
    color: colors.textSecondary,
  },
  previewBio: {
    fontSize: responsive.typography.sm,
    color: colors.text,
    lineHeight: responsive.typography.sm * 1.5,
  },
  buttonContainer: {
    gap: responsive.spacing.sm,
    marginTop: responsive.spacing.xs,
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#000",
    fontSize: responsive.typography.lg,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: responsive.typography.base,
    fontWeight: "600",
  },
})