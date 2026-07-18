import { CategoryFilterBar } from "@/components/tasks/CategoryFilterBar";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { EmptyState } from "@/components/tasks/EmptyState";
import { Fab } from "@/components/tasks/Fab";
import { TaskList } from "@/components/tasks/TaskList";
import { spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  createTask,
  deleteTask,
  getCategories,
  getTasks,
  updateTask,
} from "@/lib/database";
import { filterTasksByCategory, groupTasksByDueDate } from "@/lib/utils";
import type { Category, Task } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TareasScreen() {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    async function load() {
      const [loadedTasks, loadedCategories] = await Promise.all([
        getTasks(),
        getCategories(),
      ]);
      if (!cancelledRef.current) {
        setTasks(loadedTasks);
        setCategories(loadedCategories);
      }
    }
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const loadData = useCallback(async () => {
    const [loadedTasks, loadedCategories] = await Promise.all([
      getTasks(),
      getCategories(),
    ]);
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  }, []);

  const filteredTasks = filterTasksByCategory(tasks, selectedCategoryId);
  const groups = groupTasksByDueDate(filteredTasks);

  const handleToggleComplete = useCallback(
    async (taskId: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      await updateTask(taskId, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t,
        ),
      );
    },
    [tasks],
  );

  const handleCreateTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      categoryId?: number;
      dueDate?: string;
    }) => {
      await createTask(
        data.title,
        data.description,
        data.categoryId,
        data.dueDate,
      );
      await loadData();
    },
    [loadData],
  );

  const handleDeleteTask = useCallback(async (taskId: number) => {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tareas</Text>
          <Text style={styles.subtitle}>
            {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"}
          </Text>
        </View>
      </View>

      <CategoryFilterBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {tasks.length === 0 ? (
        <EmptyState onCreateTask={() => setModalVisible(true)} />
      ) : groups.length === 0 ? (
        <View style={styles.emptyFilter}>
          <Text style={styles.emptyFilterText}>
            No hay tareas en esta categoría
          </Text>
        </View>
      ) : (
        <TaskList
          groups={groups}
          categories={categories}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
        />
      )}

      <Fab onPress={() => setModalVisible(true)} />

      <CreateTaskModal
        visible={modalVisible}
        categories={categories}
        onClose={() => setModalVisible(false)}
        onCreateTask={handleCreateTask}
      />
    </View>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxxl + spacing.xxl,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 28,
      color: colors.text,
    },
    subtitle: {
      fontFamily: typography.fontFamily,
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyFilter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyFilterText: {
      fontFamily: typography.fontFamily,
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
