# 007 — Audio Recording, Storage & Playback Research

**Ticket:** 007-grabacion-almacenamiento-audio
**Date:** 2026-07-16
**SDK:** Expo 57 / React Native 0.86
**Target device:** Honor X6b (Helio G85, 4-6 GB RAM, 128-256 GB storage, Android 14)

---

## 1. expo-audio (recommended) — Recording API

> **expo-av is deprecated and removed from Expo Go as of SDK 55.** Use `expo-audio` instead.
> It's hook-first, built on Media3/ExoPlayer (Android) and AVFoundation (iOS), and auto-cleans on unmount.

### Installation

```bash
npx expo install expo-audio
```

### Config plugin (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for recording audio notes."
        }
      ]
    ]
  }
}
```

### Recording — full example

```tsx
import { useState, useEffect } from "react";
import { View, StyleSheet, Button, Text, Alert } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

export default function AudioRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    (async () => {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Permiso denegado", "Necesitamos acceso al micrófono.");
      }
    })();
  }, []);

  const startRecording = async () => {
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    // recorder.uri contains the saved file path
    console.log("Saved to:", recorder.uri);
  };

  return (
    <View style={styles.container}>
      <Text>
        {recorderState.isRecording
          ? `Grabando: ${(recorderState.durationMillis / 1000).toFixed(1)}s`
          : "Listo para grabar"}
      </Text>
      <Button
        title="Grabar"
        onPress={startRecording}
        disabled={recorderState.isRecording}
      />
      <Button
        title="Detener"
        onPress={stopRecording}
        disabled={!recorderState.isRecording}
      />
    </View>
  );
}
```

### RecordingPreset details

| Preset | Sample Rate | Bitrate | Format | Extension |
|---|---|---|---|---|
| `HIGH_QUALITY` | 44.1 kHz | 128 kbps | AAC | `.m4a` |
| `LOW_QUALITY` | 22 kHz | 64 kbps | AAC | `.m4a` |

**Recommendation for voice notes:** Use `HIGH_QUALITY` — the difference in file size is small and audio quality matters for potential transcription later.

### Custom recording options

```tsx
const recorder = useAudioRecorder({
  extension: ".m4a",
  sampleRate: 44100,
  numberOfChannels: 1, // mono for voice
  bitRate: 128000,
  bitRateStrategy: "constant",
  android: {
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    audioQuality: 96,
    outputFormat: "lpcm",
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
});
```

### RecordingState properties

| Property | Type | Description |
|---|---|---|
| `isRecording` | `boolean` | Whether recording is in progress |
| `canRecord` | `boolean` | Whether recorder is ready |
| `durationMillis` | `number` | Current duration in ms |
| `fileSize` | `number` | Bytes written so far |
| `url` | `string \| null` | File path when saved |

### RecordingDirectory option

`useAudioRecorder` accepts a second argument for storage location:
- `'document'` (default) — persistent, not cleaned by OS
- `'cache'` — may be purged on low storage

**For a notes app, always use `'document'`.**

---

## 2. Audio Formats

### Supported formats on Android (Media3/ExoPlayer)

| Format | Extension | Codec | Container |
|---|---|---|---|
| AAC | `.m4a` | AAC-LC / HE-AAC | MPEG-4 |
| MP3 | `.mp3` | MP3 | MP3 |
| WAV | `.wav` | PCM (L16) | WAV |
| OGG | `.ogg` | Vorbis | Ogg |
| FLAC | `.flac` | FLAC | FLAC |

### Best format for voice notes: **AAC in M4A container**

- **AAC** is the native format for both Android and iOS recording APIs
- Excellent quality at low bitrates (128 kbps is more than enough for voice)
- Small file size
- Supported by all transcription APIs (Whisper, Google STT, etc.)
- Default output of `RecordingPresets.HIGH_QUALITY`

---

## 3. File Size Estimation

### Per-minute file sizes (mono voice recording)

| Format | Settings | Size/min | 5 min | 30 min |
|---|---|---|---|---|
| **AAC (M4A)** | 128 kbps | **~0.94 MB** | ~4.7 MB | ~28 MB |
| **AAC (M4A)** | 64 kbps | ~0.47 MB | ~2.3 MB | ~14 MB |
| MP3 | 128 kbps | ~0.94 MB | ~4.7 MB | ~28 MB |
| MP3 | 64 kbps | ~0.47 MB | ~2.3 MB | ~14 MB |
| WAV | 16-bit/44.1kHz stereo | ~10.1 MB | ~50.5 MB | ~303 MB |
| WAV | 16-bit/44.1kHz mono | ~5.1 MB | ~25.3 MB | ~152 MB |
| Opus | 64 kbps | ~0.47 MB | ~2.3 MB | ~14 MB |

**Formula (compressed):** `Size (MB) = bitrate (kbps) × duration (seconds) / 8 / 1000`

### Recommendation for OrganizaTu

- **Format:** AAC/M4A at 128 kbps, mono
- **Per note (5 min avg):** ~4.7 MB
- **200 notes limit:** ~940 MB worst case (manageable on 128 GB device)
- **Practical estimate:** With mostly short notes (1-2 min), average ~1 MB per note, 200 notes = ~200 MB

**Storage budget suggestion:** Cap total audio storage at 500 MB with a settings warning, or allow unlimited with microSD expansion.

---

## 4. File System Storage with expo-file-system

### Installation

```bash
npx expo install expo-file-system
```

### Directory choices

| Directory | Constant | Purpose |
|---|---|---|
| App documents | `FileSystem.documentDirectory` | Persistent. Never deleted by OS. **Use for audio notes.** |
| App cache | `FileSystem.cacheDirectory` | May be purged. Use for temp files. |

### Storing recordings — pattern

```tsx
import * as FileSystem from "expo-file-system";

/**
 * Move a recording from the temporary location to persistent storage
 * with a unique filename.
 */
async function persistRecording(tempUri: string, noteId: string): Promise<string> {
  const filename = `audio_${noteId}_${Date.now()}.m4a`;
  const destUri = FileSystem.documentDirectory + "audio/" + filename;

  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "audio/");
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "audio/", {
      intermediates: true,
    });
  }

  await FileSystem.moveAsync({ from: tempUri, to: destUri });
  return destUri;
}
```

### Unique file naming strategy

For SQLite reference, store only the **relative path** from `documentDirectory`:

```
audio/audio_note-abc123_1721126400000.m4a
```

This way if the absolute path changes (app reinstall, migration), you can reconstruct it.

### SQLite schema for audio notes

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('text', 'audio', 'mixed')),
  title TEXT,
  body TEXT,                          -- for text notes / transcription
  audio_path TEXT,                    -- relative path: audio/audio_<id>.m4a
  audio_duration_ms INTEGER,
  audio_file_size INTEGER,
  transcription TEXT,                 -- populated after STT
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Cleanup / deletion

```tsx
async function deleteNoteAudio(audioPath: string) {
  const fullPath = FileSystem.documentDirectory + audioPath;
  const info = await FileSystem.getInfoAsync(fullPath);
  if (info.exists) {
    await FileSystem.deleteAsync(fullPath);
  }
}
```

---

## 5. Audio Playback with expo-audio

### Basic playback

```tsx
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Button, Text, View } from "react-native";

function AudioPlayer({ audioUri }: { audioUri: string }) {
  const player = useAudioPlayer({ uri: audioUri });
  const status = useAudioPlayerStatus(player);

  return (
    <View>
      <Text>
        {status.isPlaying
          ? `${status.currentTime.toFixed(1)}s / ${status.duration.toFixed(1)}s`
          : "Pausado"}
      </Text>
      <Button
        title={status.isPlaying ? "Pausar" : "Reproducir"}
        onPress={() => {
          if (status.isPlaying) {
            player.pause();
          } else {
            player.play();
          }
        }}
      />
      {/* Seek to specific position */}
      <Button title="Reiniciar" onPress={() => player.seekTo(0)} />
    </View>
  );
}
```

### PlayerStatus properties

| Property | Type | Description |
|---|---|---|
| `isPlaying` | `boolean` | Currently playing |
| `currentTime` | `number` | Current position in seconds |
| `duration` | `number` | Total duration in seconds |
| `isLoaded` | `boolean` | Audio loaded and ready |
| `didFinish` | `boolean` | Playback completed |
| `playbackRate` | `number` | Current speed (0.5–2.0) |
| `volume` | `number` | 0.0–1.0 |

### Playback controls reference

| Action | Method |
|---|---|
| Play | `player.play()` |
| Pause | `player.pause()` |
| Seek (seconds) | `player.seekTo(seconds)` |
| Set volume | `player.volume = 0.5` |
| Set speed | `player.playbackRate = 1.5` |
| Loop | `player.loop = true` |
| Auto cleanup | Handled by hook on unmount |

### Key difference from expo-av

`expo-audio` uses **seconds** for `seekTo()` and `currentTime`/`duration`, not milliseconds. `expo-av` used milliseconds.

---

## 6. Voice Transcription (Speech-to-Text)

### Option A: OpenAI Whisper API (recommended for simplicity)

| Detail | Value |
|---|---|
| **Cost** | $0.006/min (whisper-1, gpt-4o-transcribe) |
| **Cheaper variant** | $0.003/min (gpt-4o-mini-transcribe) |
| **Languages** | 99+ languages including Spanish |
| **Accuracy** | Near-human for clear audio |
| **Latency** | ~45-60s for 1 hour of audio |
| **File size limit** | 25 MB per upload (split longer recordings) |
| **Accepted formats** | mp3, mp4, m4a, wav, webm, flac, ogg |
| **Privacy** | Audio sent to OpenAI servers |

**Cost estimate for a note-taking app:**
- 100 notes × 3 min avg = 300 min/month
- At $0.006/min = **$1.80/month**
- At $0.003/min (mini) = **$0.90/month**

**OpenAI Whisper API example:**

```tsx
async function transcribeWithWhisper(audioUri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri: audioUri,
    name: "recording.m4a",
    type: "audio/m4a",
  } as any);
  formData.append("model", "whisper-1");
  formData.append("language", "es"); // Spanish
  formData.append("response_format", "text");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  return await response.text();
}
```

### Option B: Google Cloud Speech-to-Text

| Detail | Value |
|---|---|
| **Cost** | $0.016/min (standard) / $0.012/min (enhanced) |
| **Free tier** | 60 min/month free |
| **Languages** | 125+ |
| **Privacy** | Audio sent to Google servers |

More expensive than Whisper, but has a free tier.

### Option C: Offline — whisper.rn (whisper.cpp binding)

| Detail | Value |
|---|---|
| **Cost** | Free (runs on device) |
| **Privacy** | Fully offline, no data leaves device |
| **Model size** | tiny: ~75 MB, base: ~142 MB, small: ~466 MB |
| **Speed on Helio G85** | tiny: ~2-4x realtime, base: ~5-10x realtime |
| **Languages** | 99+ with multilingual model |
| **npm** | `whisper.rn` (796 stars, actively maintained) |
| **Requirement** | Native module — needs `expo prebuild` (no Expo Go) |

**Example with whisper.rn:**

```tsx
import { initWhisper } from "whisper.rn";

const whisperContext = await initWhisper({
  filePath: modelPath, // downloaded .bin file
});

const result = await whisperContext.transcribe(audioFilePath, {
  language: "es",
  maxLen: 1, // max tokens per segment
});

console.log(result.result); // transcribed text
```

**Feasibility on Honor X6b (Helio G85):**
- The Helio G85 has 2x Cortex-A75 @ 2.0 GHz and 6x Cortex-A55 @ 1.8 GHz
- Whisper tiny model: **feasible** — 2-4x realtime, so a 3-min note transcribes in ~45-90s
- Whisper base model: **borderline** — may take 3-5x realtime, so 3 min → ~9-15 min
- With 4 GB RAM: tight but workable (tiny model ~75 MB RAM overhead)
- **Recommendation:** Use whisper tiny model only. base/small may cause OOM on 4 GB variant.

### Option D: Offline — Vosk (lighter alternative)

| Detail | Value |
|---|---|
| **Cost** | Free |
| **Model size** | ~40-50 MB |
| **npm** | `react-native-vosk` |
| **Accuracy** | Lower than Whisper |
| **Speed** | Faster, lighter on CPU |
| **Best for** | When accuracy matters less, device is constrained |

### Option E: Native on-device recognizers

| Platform | Library | Notes |
|---|---|---|
| Android | `@react-native-voice/voice` | Uses Google's on-device STT |
| iOS | Speech framework | Built-in Apple STT |

- Pros: lightweight, no extra model download
- Cons: different behavior per platform, limited offline support on Android

### Transcription comparison matrix

| Approach | Cost | Privacy | Accuracy | Offline | Complexity | Honor X6b Feasibility |
|---|---|---|---|---|---|---|
| **OpenAI Whisper API** | $0.003-0.006/min | Low (cloud) | Excellent | No | Low | Perfect |
| **Google STT** | $0.012-0.016/min | Low (cloud) | Excellent | No | Low | Perfect |
| **whisper.rn (tiny)** | Free | High (on-device) | Good | Yes | Medium | Good (slow) |
| **whisper.rn (base)** | Free | High (on-device) | Very Good | Yes | Medium | Risky (OOM on 4GB) |
| **Vosk** | Free | High (on-device) | Fair | Yes | Low | Good |
| **Native recognizer** | Free | Medium | Fair-Good | Partial | Low | Good |

### Recommendation

**Primary:** OpenAI Whisper API (gpt-4o-mini-transcribe at $0.003/min) — simplest integration, excellent accuracy, very cheap for a note-taking app. Transcribe in background after recording stops.

**Future/Fallback:** `whisper.rn` tiny model for offline mode — add as a second phase if users want offline transcription. Requires `expo prebuild`.

---

## 7. expo-audio vs expo-av Comparison

| Feature | expo-av (deprecated) | expo-audio (current) |
|---|---|---|
| **SDK** | Removed in SDK 55 | Current through SDK 57 |
| **API style** | Imperative class-based | Hooks-first |
| **Android engine** | Legacy MediaPlayer | Media3 / ExoPlayer |
| **Auto cleanup** | Manual `unloadAsync()` | Automatic via hooks |
| **Recording presets** | `HIGH_QUALITY`, `LOW_QUALITY` | `HIGH_QUALITY`, `LOW_QUALITY` |
| **Time units** | Milliseconds | Seconds |
| **Background audio** | Buggy, complex setup | Simpler config |
| **New Architecture** | Not supported | First-class support |
| **Expo Go** | Removed | Included |

### Migration cheat sheet

```tsx
// expo-av (old)
const { recording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);
await recording.stopAndUnloadAsync();
const uri = recording.getURI();

// expo-audio (new)
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
await recorder.prepareToRecordAsync();
recorder.record();
await recorder.stop();
const uri = recorder.uri;
```

---

## 8. Target Device Considerations — Honor X6b

| Spec | Value | Impact |
|---|---|---|
| SoC | MediaTek Helio G85 (12nm) | Handles AAC recording fine. Whisper tiny feasible but slow. |
| CPU | 2x A75 @2.0GHz + 6x A55 @1.8GHz | Sufficient for audio encode. Transcription limited. |
| GPU | Mali-G52 MC2 | Not relevant for audio |
| RAM | 4 GB / 6 GB | 4 GB is tight for whisper.rn + app. 6 GB is comfortable. |
| Storage | 128-256 GB + microSD | Generous. Audio notes won't be a storage concern. |
| OS | Android 14, MagicOS 8 | Fully compatible with expo-audio |
| Battery | 5200 mAh | Recording is low-power. Transcription is CPU-heavy. |
| Audio jack | 3.5mm | Headphones supported, audio routing works |
| Bluetooth | 5.1 | BT audio auto-disconnect behavior handled by expo-audio |

---

## 9. Recommended Architecture for Audio Notes

```
┌─────────────────────────────────────────────────┐
│                  User Records                    │
│         expo-audio → HIGH_QUALITY (AAC)          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│        Persist to documentDirectory/audio/       │
│      expo-file-system moveAsync + unique name    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           Save metadata in SQLite                │
│  path, duration, fileSize, noteId, createdAt     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    Background transcription (optional trigger)    │
│  gpt-4o-mini-transcribe API ($0.003/min)         │
│  Result saved to `transcription` column          │
└─────────────────────────────────────────────────┘
```

### Key packages to install

```bash
npx expo install expo-audio expo-file-system
```

Optional (for transcription):
```bash
# No extra package needed — OpenAI Whisper API is a REST call via fetch
# For offline transcription (requires prebuild):
# npm install whisper.rn
```

---

## 10. Open Questions / Future Considerations

1. **Should transcription be automatic or user-triggered?** Automatic is friendlier but costs money and needs network.
2. **Offline transcription priority?** If yes, plan for `expo prebuild` and whisper.rn integration as a Phase 2.
3. **Audio trim/edit?** Not in scope for this ticket but may be needed later.
4. **Background recording?** expo-audio supports it with `shouldPlayInBackground: true` in `setAudioModeAsync` + Android foreground service config. Not needed for a simple notes app.
5. **Audio sharing/export?** Use `FileSystem.getContentUriAsync()` on Android + Share API.

---

## Sources

- expo-audio docs: https://docs.expo.dev/versions/latest/sdk/audio/
- expo-audio migration guide: https://github.com/expo/skills/blob/main/plugins/expo/skills/upgrading-expo/references/expo-av-to-audio.md
- Audio format sizes: https://audioutils.com/blog/audio-file-size-comparison
- whisper.rn: https://github.com/mybigday/whisper.rn (796 stars)
- OpenAI Whisper API pricing: $0.006/min (whisper-1), $0.003/min (gpt-4o-mini-transcribe)
- React Native STT comparison: https://www.jocheojeda.com/2026/07/04/cross-platform-speech-to-text-in-react-native
- Honor X6b specs: GSMArena, DeviceSpecifications
