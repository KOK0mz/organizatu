import { borderRadius, spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  onCreateTask: () => void;
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>✓</Text>
      </View>
      <Text style={styles.title}>No hay tareas</Text>
      <Text style={styles.description}>
        Crea tu primera tarea tocando el botón +
      </Text>
      <Pressable style={styles.button} onPress={onCreateTask}>
        <Text style={styles.buttonIcon}>+</Text>
        <Text style={styles.buttonText}>Crear tarea</Text>
      </Pressable>
    </View>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xxxl,
      paddingBottom: spacing.xxxl * 3,
    },
    iconContainer: {
      marginBottom: spacing.xl,
      opacity: 0.5,
    },
    iconText: {
      fontSize: 64,
      color: colors.border,
    },
    title: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 18,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    description: {
      fontFamily: typography.fontFamily,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: spacing.xl,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
    },
    buttonText: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 15,
      color: colors.onPrimary,
    },
    buttonIcon: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 18,
      color: colors.onPrimary,
    },
  });
}
