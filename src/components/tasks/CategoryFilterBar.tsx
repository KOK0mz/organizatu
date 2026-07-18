import { borderRadius, spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { Category } from "@/types";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useStyles(colors);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      style={{ flexGrow: 0 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={[
          styles.chip,
          selectedCategoryId === null && styles.chipSelected,
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text
          style={[
            styles.chipText,
            selectedCategoryId === null && styles.chipTextSelected,
          ]}
        >
          Todas
        </Text>
      </Pressable>
      {categories.map((cat) => {
        const isSelected = cat.id === selectedCategoryId;
        return (
          <Pressable
            key={cat.id}
            style={[
              styles.chip,
              isSelected && {
                borderColor: cat.color,
                backgroundColor: cat.color + "15",
              },
            ]}
            onPress={() => onSelectCategory(cat.id)}
          >
            <Text style={[styles.chipText, isSelected && { color: cat.color }]}>
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "15",
    },
    chipText: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 13,
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: colors.primary,
    },
  });
}
