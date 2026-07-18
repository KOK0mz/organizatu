import { borderRadius, spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { Category, Task } from "@/types";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function TaskCard({
  task,
  category,
  onToggleComplete,
  onDelete,
}: TaskCardProps) {
  const { colors } = useTheme();
  const [strikeAnim] = useState(
    () => new Animated.Value(task.completed ? 1 : 0),
  );

  useEffect(() => {
    Animated.timing(strikeAnim, {
      toValue: task.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [task.completed, strikeAnim]);

  const styles = useStyles(colors);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDate();
    const months = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    return `${day} ${months[date.getMonth()]}`;
  };

  const isOverdue =
    task.dueDate &&
    !task.completed &&
    task.dueDate < new Date().toISOString().split("T")[0];

  const strikeColor = strikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.textSecondary],
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onToggleComplete}
      onLongPress={() =>
        Alert.alert("Eliminar tarea", "¿Estás seguro?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: onDelete },
        ])
      }
    >
      <View
        style={[styles.checkbox, !!task.completed && styles.checkboxChecked]}
      >
        {!!task.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.title,
            {
              textDecorationLine: task.completed ? "line-through" : "none",
              color: strikeColor,
            },
          ]}
        >
          {task.title}
        </Animated.Text>
        <View style={styles.meta}>
          {category && (
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: category.color + "20" },
              ]}
            >
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
          {task.dueDate && (
            <Text style={[styles.dueDate, isOverdue && styles.overdue]}>
              {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pressed: {
      backgroundColor: colors.surfaceSecondary,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    checkboxChecked: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    checkmark: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 13,
      color: "#FFFFFF",
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 15,
      lineHeight: 20,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    categoryChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    categoryText: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 11,
    },
    dueDate: {
      fontFamily: typography.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
    },
    overdue: {
      color: colors.error,
      fontWeight: "500",
    },
  });
}
