import { typography } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.tabBar}
      iconColor={{
        default: colors.tabBarInactive,
        selected: colors.primary,
      }}
      labelStyle={{
        default: {
          fontFamily: typography.fontFamilyMedium,
          color: colors.tabBarInactive,
          fontSize: 11,
        },
        selected: {
          fontFamily: typography.fontFamilyMedium,
          color: colors.primary,
          fontSize: 11,
        },
      }}
    >
      <NativeTabs.Trigger name="tareas">
        <NativeTabs.Trigger.Icon sf="checklist" md="task" />
        <NativeTabs.Trigger.Label>Tareas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notas">
        <NativeTabs.Trigger.Icon sf="note.text" md="note" />
        <NativeTabs.Trigger.Label>Notas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendario">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Calendario</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
