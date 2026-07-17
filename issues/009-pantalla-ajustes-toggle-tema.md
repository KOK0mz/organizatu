# Ticket: Pantalla de ajustes con toggle de tema

**Labels:** `wayfinder:grilling`
**Parent:** MAP.md
**Status:** **CLOSED**

## Question

¿Cómo implementamos la pantalla de ajustes con toggle de tema (Sistema / Claro / Oscuro) y la persistencia de la preferencia?

Puntos a decidir:
- Ubicación en la navegación (¿nuevo tab? ¿desde un icono en el header? ¿drawer?)
- Persistencia: AsyncStorage, SQLite, o Expo SecureStore
- UX del toggle: 3 opciones (Sistema / Claro / Oscuro) o solo 2 (Claro / Oscuro) con "Sistema" como default implícito
- Cómo se integra con el `ThemeContext` actual (proveer `scheme` override, no solo `useColorScheme()`)
- Si "Sistema" significa que la app se re-actualiza al cambiar el tema del OS en tiempo real

## Resolución

1. **Ubicación:** Icono de engranaje en el header de cada pantalla principal, al presionarlo cicla entre las 3 opciones (sin navegar a otra vista)
2. **Persistencia:** AsyncStorage
3. **UX del toggle:** 3 opciones rotativas: Sistema → Claro → Oscuro → Sistema. El icono en el header cambia según el modo activo
4. **ThemeContext:** Estado `themeMode: 'system' | 'light' | 'dark'`. Si es 'system' delega en `useColorScheme()`; si es 'light' o 'dark' fuerza ese valor como override
5. **Sistema en tiempo real:** Sí, reacciona automáticamente al cambio del SO porque `useColorScheme()` ya emite cambios en vivo
