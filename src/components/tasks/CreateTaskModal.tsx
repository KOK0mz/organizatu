import { borderRadius, spacing, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { Category } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface CreateTaskModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onCreateTask: (task: {
    title: string;
    description?: string;
    categoryId?: number;
    dueDate?: string;
  }) => void;
}

export function CreateTaskModal({
  visible,
  categories,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedCategoryId(undefined);
    setDueDate(undefined);
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: selectedCategoryId,
      dueDate: dueDate
        ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`
        : undefined,
    });
    resetForm();
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Nueva tarea</Text>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="¿Qué hay que hacer?"
                  placeholderTextColor={colors.border}
                  autoFocus
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalles adicionales..."
                  placeholderTextColor={colors.border}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Fecha límite</Text>
                <Pressable
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.inputText,
                      !dueDate && { color: colors.textSecondary },
                    ]}
                  >
                    {dueDate
                      ? dueDate.toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Seleccionar fecha"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoryPills}>
                  {categories.map((cat) => {
                    const isSelected = cat.id === selectedCategoryId;
                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.pill,
                          isSelected && {
                            borderColor: cat.color,
                            backgroundColor: cat.color + "15",
                          },
                        ]}
                        onPress={() =>
                          setSelectedCategoryId(isSelected ? undefined : cat.id)
                        }
                      >
                        <Text
                          style={[
                            styles.pillText,
                            isSelected && { color: cat.color },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <Pressable
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={handleCreate}
              disabled={!isValid}
            >
              <Text style={styles.saveButtonText}>Crear tarea</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}
    </Modal>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    keyboardView: {
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "85%",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 18,
      color: colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    form: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    fieldGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      fontFamily: typography.fontFamily,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    inputText: {
      fontFamily: typography.fontFamily,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 80,
      paddingTop: spacing.md,
    },
    categoryPills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    pill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    pillText: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 13,
      color: colors.textSecondary,
    },
    saveButton: {
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xxxl,
      marginTop: spacing.sm,
      paddingVertical: spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontFamily: typography.fontFamilyMedium,
      fontSize: 16,
      color: colors.onPrimary,
    },
  });
}
