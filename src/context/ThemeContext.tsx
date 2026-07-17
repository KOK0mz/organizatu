import { type ThemeColors, getColors } from "@/constants/theme";
import { createContext, use, type ReactNode } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextValue {
  scheme: "light" | "dark";
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  scheme: "dark",
  colors: getColors("dark"),
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme = systemScheme === "light" ? "light" : "dark";

  return (
    <ThemeContext value={{ scheme, colors: getColors(scheme) }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  return use(ThemeContext);
}
