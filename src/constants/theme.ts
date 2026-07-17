const darkColors: ThemeColors = {
  primary: "#1D4ED8",
  background: "#0F172A",
  surface: "#1E293B",
  surfaceSecondary: "#334155",
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  border: "#CBD5E1",
  error: "#DC2626",
  success: "#059669",
  warning: "#D97706",
  tabBar: "#1E293B",
  tabBarInactive: "#94A3B8",
};

const lightColors: ThemeColors = {
  primary: "#3B82F6",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceSecondary: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#475569",
  border: "#E2E8F0",
  error: "#DC2626",
  success: "#059669",
  warning: "#D97706",
  tabBar: "#F8FAFC",
  tabBarInactive: "#94A3B8",
};

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  tabBar: string;
  tabBarInactive: string;
}

export function getColors(scheme: "light" | "dark"): ThemeColors {
  return scheme === "light" ? lightColors : darkColors;
}

export const colors: ThemeColors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: "DMSans-Regular",
  fontFamilyBold: "DMSans-Bold",
  fontFamilyMedium: "DMSans-Medium",
} as const;

export const categoryDefaults = {
  Trabajo: { color: "#2563EB", id: 1 },
  Personal: { color: "#7C3AED", id: 2 },
  Estudio: { color: "#059669", id: 3 },
  Finanzas: { color: "#D97706", id: 4 },
  Ocio: { color: "#E11D48", id: 5 },
} as const;
