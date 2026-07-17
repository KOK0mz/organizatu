import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import { initDatabase } from "@/lib/database";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [fontsLoaded, fontsError] = useFonts({
    "DMSans-Regular": require("@/assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Medium": require("@/assets/fonts/DMSans-Medium.ttf"),
    "DMSans-Bold": require("@/assets/fonts/DMSans-Bold.ttf"),
  });

  useEffect(() => {
    if ((fontsLoaded || fontsError) && !fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <SQLiteProvider
          databaseName="organizatu.db"
          onInit={initDatabase}
          useSuspense
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style={isDark ? "light" : "dark"} />
        </SQLiteProvider>
      </ThemeProvider>
    </AppThemeProvider>
  );
}
