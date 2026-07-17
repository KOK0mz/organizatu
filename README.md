# OrganizaTu

App móvil Android de productividad personal. Minimalista, limpia, sin cuentas ni servidores. Los datos viven en tu teléfono.

## Módulos

- **Tareas** — Lista por fecha, categorías (Trabajo, Personal, Estudio, Finanzas, Ocio), recordatorios, estados vacíos con CTA
- **Notas** — Texto con editor Markdown + preview, notas de voz con grabación, waveform y transcripción (Whisper)
- **Calendario** — Vista mensual, eventos todo el día o con hora, notificaciones 15 min antes

## Tech Stack

- React Native + Expo SDK 57
- TypeScript
- SQLite (datos locales)
- expo-notifications, expo-audio
- Dark mode por defecto

## Requisitos

- Node.js >= 18
- Expo CLI: `npx expo install`
- Dispositivo Android o emulador

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Ejecutar en Android
npx expo start --android
```

## Build APK

```bash
# Build local con EAS
eas build --platform android --profile preview
```

## Estructura del Proyecto

```
src/
├── app/            # Pantallas (expo-router)
├── components/     # Componentes reutilizables
├── constants/      # Tema, colores, tipografía
└── hooks/          # Custom hooks

issues/             # Specs de cada feature
research/           # Investigaciones técnicas
prototypes/         # Prototipos HTML/JS
```

## Licencia

Uso personal.
