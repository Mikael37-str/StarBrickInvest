"use client"

import { useState } from "react"
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
} from "react-native"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { responsive } from "../utils/responsive"

export default function ArticleDetailScreen({ route, navigation }: any) {
  const { article } = route.params
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const categories = {
    news: { label: "Noticias", icon: "newspaper", color: "#4A90E2" },
    review: { label: "Análisis", icon: "star", color: "#F5A623" },
    tutorial: { label: "Tutorial", icon: "bulb", color: "#50C878" },
    market: { label: "Mercado", icon: "trending-up", color: "#BD10E0" },
  }

  const categoryInfo = categories[article.category as keyof typeof categories] || {
    label: article.category,
    icon: "document",
    color: colors.accent,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nLee más en Star Brick Invest`,
        title: article.title,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {article.image ? (
            <Image source={{ uri: article.image }} style={styles.headerImage} />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Ionicons name="newspaper" size={responsive.iconSize.xxl} color={colors.textSecondary} />
            </View>
          )}
          <LinearGradient colors={["transparent", "rgba(10, 10, 10, 0.9)"]} style={styles.imageGradient} />

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonBackground}>
              <Ionicons name="arrow-back" size={responsive.iconSize.md} color={colors.text} />
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-social" size={responsive.iconSize.sm} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setBookmarked(!bookmarked)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={bookmarked ? "bookmark" : "bookmark-outline"} 
                size={responsive.iconSize.sm} 
                color={colors.accent} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + "20" }]}>
            <Ionicons name={categoryInfo.icon as any} size={responsive.iconSize.xs} color={categoryInfo.color} />
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={responsive.iconSize.xs} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(article.created_at)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={responsive.iconSize.xs} color={colors.textSecondary} />
              <Text style={styles.metaText}>{Math.ceil(article.content.split(" ").length / 200)} min lectura</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Content */}
          <Text style={styles.articleText}>{article.content}</Text>

          {/* Like Section */}
          <View style={styles.likeSection}>
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={() => setLiked(!liked)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={responsive.iconSize.lg} 
                color={liked ? "#E94B3C" : colors.text} 
              />
              <Text style={[styles.likeText, liked && { color: "#E94B3C" }]}>
                {liked ? "Te gusta este artículo" : "Me gusta"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Related Articles CTA */}
          <TouchableOpacity 
            style={styles.relatedCta} 
            onPress={() => navigation.navigate("Articles")}
            activeOpacity={0.7}
          >
            <View style={styles.relatedCtaContent}>
              <Ionicons name="documents" size={responsive.iconSize.lg} color={colors.accent} />
              <View style={styles.relatedCtaText}>
                <Text style={styles.relatedCtaTitle}>Más Artículos</Text>
                <Text style={styles.relatedCtaSubtitle}>Descubre más contenido interesante</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={responsive.iconSize.md} color={colors.accent} />
          </TouchableOpacity>
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
  imageContainer: {
    height: responsive.imageHeight.hero,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: "absolute",
    top: (responsive.safeArea.top || 20) + responsive.spacing.md,
    left: responsive.spacing.lg,
  },
  backButtonBackground: {
    backgroundColor: colors.surface + "CC",
    borderRadius: responsive.borderRadius.md,
    padding: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  actionButtons: {
    position: "absolute",
    top: (responsive.safeArea.top || 20) + responsive.spacing.md,
    right: responsive.spacing.lg,
    flexDirection: "row",
    gap: responsive.spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.surface + "CC",
    borderRadius: responsive.borderRadius.md,
    padding: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  content: {
    padding: responsive.spacing.lg,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.xxs,
    alignSelf: "flex-start",
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xxs,
    borderRadius: responsive.borderRadius.md,
    marginBottom: responsive.spacing.md,
  },
  categoryText: {
    fontSize: responsive.typography.xxs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: responsive.typography.xxl,
    fontWeight: "bold",
    color: colors.text,
    lineHeight: responsive.typography.xxl * 1.3,
    marginBottom: responsive.spacing.md,
  },
  metaInfo: {
    flexDirection: "row",
    gap: responsive.spacing.lg,
    marginBottom: responsive.spacing.lg,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.xxs,
  },
  metaText: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: responsive.spacing.xl,
  },
  articleText: {
    fontSize: responsive.typography.base,
    color: colors.text,
    lineHeight: responsive.typography.base * 1.75,
    marginBottom: responsive.spacing.xxl,
  },
  likeSection: {
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.lg,
    marginBottom: responsive.spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent + "20",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsive.spacing.sm,
  },
  likeText: {
    fontSize: responsive.typography.base,
    color: colors.text,
    fontWeight: "600",
  },
  relatedCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: responsive.borderRadius.lg,
    padding: responsive.spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    marginBottom: responsive.spacing.lg,
  },
  relatedCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsive.spacing.md,
    flex: 1,
  },
  relatedCtaText: {
    flex: 1,
  },
  relatedCtaTitle: {
    fontSize: responsive.typography.base,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: responsive.spacing.xxs,
  },
  relatedCtaSubtitle: {
    fontSize: responsive.typography.xs,
    color: colors.textSecondary,
  },
})