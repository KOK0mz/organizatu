# Ticket: Grabación y almacenamiento de audio

**Labels:** `wayfinder:research`
**Parent:** MAP.md
**Status:** CLOSED

## Question

¿Qué librería usar para grabar audio en Expo? ¿Cómo almacenar archivos de audio localmente? ¿Se puede transcribir audio a texto? Investigar expo-av, expo-file-system, y opciones de transcripción.

## Resolution

Ver `research/007-audio-findings.md` para investigación completa.

### Decisiones clave

| Decisión | Respuesta |
|---|---|
| Grabación | **expo-audio** (no expo-av, deprecado desde SDK 55) |
| Preset | `RecordingPresets.HIGH_QUALITY` — AAC 128kbps, mono |
| Almacenamiento | `documentDirectory/audio/` via expo-file-system (persistente) |
| Naming | `audio_${noteId}_${Date.now()}.m4a` — path relativo en SQLite |
| Tamaño | ~0.94 MB/min, ~4.7 MB por nota de 5 min |
| Playback | `useAudioPlayer` + `useAudioPlayerStatus` (expo-audio) |
| Transcripción | OpenAI `gpt-4o-mini-transcribe` — $0.003/min, soporta español |
| Offline futuro | `whisper.rn` tiny model (~75MB, viable en Honor X6b pero lento) |

### Paquetes a instalar

```bash
npx expo install expo-audio expo-file-system
```

### Flujo de nota de voz

1. `useAudioRecorder` con `RecordingPresets.HIGH_QUALITY`
2. `recorder.record()` → `recorder.stop()`
3. `FileSystem.moveAsync()` a `documentDirectory/audio/`
4. Guardar metadata en SQLite (path, duración, tamaño)
5. Opcionalmente: transcripción via Whisper API en background

### Limitaciones Honor X6b

- Helio G85: grabación AAC funciona bien
- Transcripción offline: viable con whisper tiny pero lento (~2-4x realtime)
- 4GB RAM: ajustado para whisper.rn, cómodo con 6GB
- 128-256GB storage: archivos de audio no son preocupación
