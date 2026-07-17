# 04 — Text Notes: CRUD + Markdown Editor

**What to build:** User creates/edits/deletes text notes with title and Markdown content. Full-screen editor with write/preview toggle and formatting toolbar. Auto-save every 3 seconds, drafts preserved and shown separately. Empty state when no notes.

**Blocked by:** 01 — Foundation: SQLite + Design System + Navigation

**Status:** ready-for-agent

- [ ] Notes list shows text notes sorted by most recently updated
- [ ] Notes are split into two sections: "Publicadas" (complete notes) and "Borradores" (drafts)
- [ ] FAB opens full-screen note editor with title field and Markdown content area
- [ ] Editor has a toggle between write mode and preview mode
- [ ] Formatting toolbar provides: Bold, Italic, H1, H2, Lists, Code, Link buttons
- [ ] Auto-save triggers every 3 seconds while editing
- [ ] Drafts are preserved if user closes the editor mid-edit
- [ ] Note can be deleted with confirmation
- [ ] Empty state shown when no text notes exist, with "Crear nota" CTA
- [ ] Notes are persisted in SQLite with created_at and updated_at timestamps
