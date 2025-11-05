import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

type CardProps = {
  title: string;
  subtitle?: string;
  image?: string;
  onPress?: () => void;
};

export default function Card({ title, subtitle, image, onPress }: CardProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.imageOverlay} />
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, styles.imageContainer]}>
          <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle ? (
          <View style={styles.subtitleContainer}>
            <Ionicons name="pricetag" size={14} color={colors.accent} />
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.accent + '20',
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  imagePlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 16,
    paddingRight: 40,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});