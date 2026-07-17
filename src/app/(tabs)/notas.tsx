import { useTheme } from "@/context/ThemeContext";
import { typography } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function NotasScreen() {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas</Text>
    </View>
  );
}

function useStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontFamily: typography.fontFamilyBold,
      fontSize: 28,
      color: colors.text,
    },
  });
}
