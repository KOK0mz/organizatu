import { borderRadius, typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import Add from "@expo/material-symbols/add.xml";
import { Host, Icon } from "@expo/ui/jetpack-compose";
import { Pressable, StyleSheet } from "react-native";

interface FabProps {
  onPress: () => void;
}

export function Fab({ onPress }: FabProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      onPress={onPress}
    >
      <Host matchContents>
        <Icon source={Add} size={24} tint={colors.onPrimary} />
      </Host>
    </Pressable>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    fabPressed: {
      transform: [{ scale: 0.95 }],
    },
    fabText: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 28,
      color: colors.onPrimary,
    },
    symbol: {
      width: 24,
      height: 24,
    },
  });
}
