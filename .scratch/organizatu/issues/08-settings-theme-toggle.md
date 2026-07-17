# 08 — Settings: Theme Toggle (System/Light/Dark)

**What to build:** Gear icon in the header of each main screen that cycles between System/Light/Dark themes. Preference persists via AsyncStorage. System mode follows the OS setting in real time. The icon reflects the current mode visually.

**Blocked by:** 01 — Foundation: SQLite + Design System + Navigation

**Status:** ready-for-agent

- [ ] ThemeContext extended to accept `themeMode: 'system' | 'light' | 'dark'` override
- [ ] When themeMode is 'system', delegates to `useColorScheme()` which reacts to OS changes in real time
- [ ] When themeMode is 'light' or 'dark', forces that value as override
- [ ] Theme preference persisted in AsyncStorage, loaded on app init
- [ ] Default themeMode is 'system' (follows OS setting)
- [ ] Gear icon rendered in the header of Tareas, Notas, and Calendario screens
- [ ] Tapping the gear icon cycles: Sistema → Claro → Oscuro → Sistema
- [ ] Gear icon changes visually based on active mode (e.g., filled vs outline)
- [ ] Theme switches instantly across all screens without restart
- [ ] No separate settings screen — toggle is inline in the header
