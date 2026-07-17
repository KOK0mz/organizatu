# Ticket: Arquitectura y estructura de proyecto

**Labels:** `wayfinder:grilling`
**Parent:** MAP.md
**Status:** CLOSED

## Question

¿Cómo se estructura el proyecto Expo? ¿Qué librerías exactas se usan? ¿Cómo organizar las carpetas? Decidir la arquitectura base antes de escribir código.

## Resolution

### Estructura de carpetas: Por feature

```
src/
  app/              # expo-router pages
  features/
    tasks/          # componentes, hooks, tipos de tareas
    notes/          # notas (texto, voz, o ambas — el usuario decide al crear)
    study/          # cuaderno de estudio
    calendar/       # calendario y eventos
    settings/       # configuración de la app
  shared/
    components/     # componentes reutilizables (botones, cards, inputs)
    hooks/          # hooks compartidos
    types/          # tipos globales
    utils/          # utilidades generales
    constants/      # temas, colores, constantes
  db/               # capa de SQLite (schemas, queries, migraciones)
```

### Decisiones

| Decisión | Respuesta |
|---|---|
| Navegación | **expo-router** (ya configurado) |
| State management | **Sin state manager global** — estado local + SQLite como fuente de verdad |
| UI Components | **@expo/ui** (ya instalado) + componentes custom |
| TypeScript + ESLint | **Configuración actual** — strict TS + Expo Lint |
| Compilación APK | **EAS Build local** (`eas build --platform android --local`) |
| Convenciones de código | PascalCase para componentes/pantallas/clases/tipos, camelCase para hooks/funciones/variables, kebab-case para carpetas |

### Librerías confirmadas

- **expo-router** — navegación file-based
- **@expo/ui** — componentes UI nativos Expo
- **expo-notifications** — notificaciones locales (pendiente: ticket 005)
- **expo-sqlite** — persistencia local (pendiente: ticket 002)
- **expo-av** — grabación/reproducción de audio (pendiente: ticket 007)

### Próximos pasos

1. Crear estructura de carpetas por feature
2. Configurar capa de base de datos (ticket 002)
3. Implementar UI según prototipos (tickets 003, 004)
