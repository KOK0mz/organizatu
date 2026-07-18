import { spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { TaskGroup } from "@/lib/utils";
import type { Category } from "@/types";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  groups: TaskGroup[];
  categories: Category[];
  onToggleComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export function TaskList({
  groups,
  categories,
  onToggleComplete,
  onDelete,
}: TaskListProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const sections = groups.map((g) => ({
    title: g.title,
    data: g.tasks,
  }));

  return (
    <SectionList
      style={{ flex: 1 }}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          category={
            item.categoryId ? categoryMap.get(item.categoryId) : undefined
          }
          onToggleComplete={() => onToggleComplete(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.content}
    />
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    content: {
      paddingBottom: spacing.xxxl * 3,
    },
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });
}
