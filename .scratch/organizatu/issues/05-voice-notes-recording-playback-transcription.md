# 05 — Voice Notes: Recording + Playback + Transcription

**What to build:** User records voice notes with a big red button, sees waveform and duration. Playback with progress bar, play/pause, seek. Voice notes appear in notes list with voice badge. Optional transcription via Whisper API. Delete removes audio file.

**Blocked by:** 01 — Foundation: SQLite + Design System + Navigation, 04 — Text Notes: CRUD + Markdown Editor

**Status:** ready-for-agent

- [ ] Recording screen has a big red button to start/stop recording
- [ ] During recording: waveform visualization and elapsed time display
- [ ] Recording uses expo-audio with HIGH_QUALITY preset (AAC 128kbps, mono)
- [ ] Audio file saved to documentDirectory/audio/ with naming pattern audio_{noteId}_{timestamp}.m4a
- [ ] Saved voice notes appear in notes list with a voice badge, auto-generated title "Nota de voz - {date} {time}"
- [ ] Tapping a voice note opens playback view with progress bar, play/pause, seek controls
- [ ] Optional "Transcribir" button triggers Whisper API transcription (gpt-4o-mini-transcribe)
- [ ] Transcribed text displayed below the audio player
- [ ] Deleting a voice note removes both the database record and the audio file
- [ ] Empty state shown when no voice notes exist, with "Grabar nota" CTA
