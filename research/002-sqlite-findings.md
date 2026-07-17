# 002 — SQLite Data Model Research

## 1. expo-sqlite API (SDK 57)

### Opening the database

```ts
import * as SQLite from 'expo-sqlite';

// Async (preferred — non-blocking)
const db = await SQLite.openDatabaseAsync('organizatu.db');

// Sync (blocks JS thread — use only at cold start if needed)
const db = SQLite.openDatabaseSync('organizatu.db');
```

### Query methods

| Method | Returns | Use case |
|---|---|---|
| `runAsync(sql, params)` | `{ changes, lastInsertRowId }` | INSERT, UPDATE, DELETE |
| `getFirstAsync<T>(sql, params)` | Single row | Fetch one row |
| `getAllAsync<T>(sql, params)` | Array of rows | Fetch small result sets |
| `getEachAsync<T>(sql, params)` | Async iterator | Large result sets / infinite scroll |
| `execAsync(sql)` | void | Bulk DDL, no params |

### Tagged template literals (Bun-style)

```ts
const user = await db.sql`SELECT * FROM tasks WHERE id = ${id}`.first();
const all = await db.sql`SELECT * FROM tasks WHERE category = ${cat}`.all();
```

Auto-escapes parameters. Returns typed results.

### Prepared statements

```ts
const stmt = await db.prepareAsync('INSERT INTO tasks (title) VALUES ($title)');
try {
  await stmt.executeAsync({ $title: 'My task' });
} finally {
  await stmt.finalizeAsync();
}
```

### Transactions

```ts
// Non-exclusive (other async queries can interleave)
await db.withTransactionAsync(async () => {
  await db.runAsync('UPDATE tasks SET completed = 1 WHERE id = ?', id);
});

// Exclusive (recommended for write-heavy logic)
await db.withExclusiveTransactionAsync(async (txn) => {
  await txn.runAsync('UPDATE tasks SET completed = 1 WHERE id = ?', id);
});
```

**Important:** `withTransactionAsync` is non-exclusive — external async queries can interleave. Use `withExclusiveTransactionAsync` when ordering matters (not supported on Web).

### React integration

```tsx
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

// Provider wraps app, runs onInit before rendering children
<SQLiteProvider databaseName="organizatu.db" onInit={migrateDbIfNeeded}>
  <App />
</SQLiteProvider>

// Hook inside children
const db = useSQLiteContext();
```

---

## 2. Schema Design

### Recommended DDL

```sql
PRAGMA journal_mode = 'wal';
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL UNIQUE,
  icon  TEXT    NOT NULL DEFAULT '',
  color TEXT    NOT NULL DEFAULT '#808080'
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  due_date    TEXT,                        -- ISO 8601 or NULL
  completed   INTEGER NOT NULL DEFAULT 0,  -- 0/1 boolean
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  audio_path  TEXT,                        -- nullable, file URI
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_topics (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id    INTEGER NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  start_time  TEXT    NOT NULL,            -- ISO 8601
  end_time    TEXT    NOT NULL,            -- ISO 8601
  all_day     INTEGER NOT NULL DEFAULT 0,  -- 0/1 boolean
  category    TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Date storage: TEXT as ISO 8601

SQLite has no native DATE type. Three options exist:

| Format | Pros | Cons |
|---|---|---|
| **TEXT (ISO 8601)** | Human-readable, sortable, debuggable | Slightly larger storage |
| INTEGER (Unix epoch) | Compact, fast numeric comparison | Not human-readable |
| REAL (Julian day) | Good for date math | Obscure format |

**Recommendation: TEXT as ISO 8601 (`YYYY-MM-DD HH:MM:SS.SSS`)**

- Always store in UTC, convert to local time only in the UI layer
- ISO 8601 strings sort lexicographically, so `ORDER BY due_date` works naturally
- SQLite's `datetime()`, `date()`, `strftime()` functions parse ISO 8601 directly
- The `DEFAULT (datetime('now'))` clause gives UTC automatically

```sql
-- Current UTC timestamp
DEFAULT (datetime('now'))

-- Query with timezone conversion
SELECT datetime(due_date, 'localtime') FROM tasks;
```

### Booleans: INTEGER 0/1

SQLite has no BOOLEAN type. Use `INTEGER NOT NULL DEFAULT 0`:
- `0` = false
- `1` = true

This is the universal convention. SQLite's boolean literals `TRUE`/`FALSE` are aliases for 1/0 since version 3.23.0.

### Primary keys: INTEGER PRIMARY KEY AUTOINCREMENT

`INTEGER PRIMARY KEY` makes the column an alias for `rowid` (fast lookups). Adding `AUTOINCREMENT` prevents rowid reuse.

### Why `category` is TEXT, not a FK to `categories`

The proposed schema stores `category` as a plain TEXT string on tasks, notes, and events. This is fine for a minimalist app — no JOIN needed for simple filters. If categories become more complex (icons, colors per category), add a foreign key:

```sql
-- Alternative: FK-based categories
ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id);
```

For v1, TEXT is simpler and avoids JOINs for every category filter.

---

## 3. Indexes

### Recommended indexes

```sql
-- Tasks: filter by due date (upcoming tasks screen)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Tasks: filter by completion status
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Tasks: composite for "incomplete tasks by due date" (most common query)
CREATE INDEX IF NOT EXISTS idx_tasks_incomplete_due
  ON tasks(completed, due_date);

-- Notes: sort by last updated (notes list screen)
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- Events: filter by time range (calendar view)
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

-- Study notes: all notes for a topic
CREATE INDEX IF NOT EXISTS idx_study_notes_topic_id ON study_notes(topic_id);
```

### Index design principles

- **Composite over multiple single-column indexes.** SQLite rarely merges two indexes. One composite index on `(completed, due_date)` beats two separate indexes.
- **Equality columns before range columns.** Put `=` filters first, then `<`/`>` / `BETWEEN` on the rightmost column.
- **DESC for reverse-chronological sorts.** `updated_at DESC` index avoids a sort step for "most recent first" queries.
- **Don't over-index.** Every index slows INSERT/UPDATE/DELETE. Only index columns that appear in WHERE, ORDER BY, or JOIN ON.
- **Run `ANALYZE` after populating data** so SQLite's planner picks the best index.

### Full-text search (FTS5)

expo-sqlite enables FTS3/4/5 by default (`enableFTS: true` in config). For searching task titles and note content:

```sql
-- FTS5 virtual table for tasks
CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
  title,
  content,
  content='tasks',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS tasks_ai AFTER INSERT ON tasks BEGIN
  INSERT INTO tasks_fts(rowid, title, content)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER IF NOT EXISTS tasks_ad AFTER DELETE ON tasks BEGIN
  INSERT INTO tasks_fts(tasks_fts, rowid, title, content)
  VALUES('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER IF NOT EXISTS tasks_au AFTER UPDATE ON tasks BEGIN
  INSERT INTO tasks_fts(tasks_fts, rowid, title, content)
  VALUES('delete', old.id, old.title, old.description);
  INSERT INTO tasks_fts(rowid, title, content)
  VALUES (new.id, new.title, new.description);
END;

-- Query
SELECT tasks.* FROM tasks
JOIN tasks_fts ON tasks.rowid = tasks_fts.rowid
WHERE tasks_fts MATCH ?
ORDER BY rank;
```

---

## 4. Audio File Storage

### `audio_path` as TEXT column

A simple `TEXT` column storing the file URI is correct. No separate table needed — audio is a 1:1 attribute of a note.

### File system paths

expo-audio saves recordings to the **cache directory** by default, which the OS can delete under storage pressure. For persistence, use the **document directory**:

```ts
import { File, Directory, Paths } from 'expo-file-system';
import { Audio } from 'expo-audio';

// Record to document directory (persistent)
const { recording } = await Audio.Recording.createAsync({
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document',  // survives low-storage purges
});

await recording.stopAndUnloadAsync();
const uri = recording.getURI();
// uri = "file:///data/user/0/.../documents/organizatu/recordings/rec-xxx.m4a"
```

### Storage structure

```
DocumentDirectory/
  organizatu/
    recordings/
      rec-{uuid}.m4a
      rec-{uuid}.m4a
```

### Store in DB

```ts
// Store the full URI in the notes table
await db.runAsync(
  'UPDATE notes SET audio_path = ? WHERE id = ?',
  uri,
  noteId
);
```

### When deleting a note, clean up the file

```ts
import { File } from 'expo-file-system';

const note = await db.getFirstAsync('SELECT audio_path FROM notes WHERE id = ?', id);
if (note?.audio_path) {
  const file = new File(note.audio_path);
  if (file.exists) {
    await file.delete();
  }
}
```

**Key points:**
- `audio_path` stores a `file://` URI (not a relative path)
- Use `document` directory for persistence, not `cache`
- Clean up files when deleting notes
- No separate table needed — audio is just a file reference

---

## 5. Schema Migrations

expo-sqlite has **no built-in migration system**. You manage migrations manually using `PRAGMA user_version`.

### Recommended pattern: `PRAGMA user_version` + switch statement

```ts
import { type SQLiteDatabase } from 'expo-sqlite';

const SCHEMA_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  let { user_version: currentVersion } = await db.getFirstAsync<{
    user_version: number;
  }>('PRAGMA user_version');

  if (currentVersion >= SCHEMA_VERSION) return;

  await db.withExclusiveTransactionAsync(async (txn) => {
    if (currentVersion === 0) {
      await txn.execAsync(`
        PRAGMA journal_mode = 'wal';
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS categories (...);
        CREATE TABLE IF NOT EXISTS tasks (...);
        CREATE TABLE IF NOT EXISTS notes (...);
        CREATE TABLE IF NOT EXISTS study_topics (...);
        CREATE TABLE IF NOT EXISTS study_notes (...);
        CREATE TABLE IF NOT EXISTS events (...);

        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
        -- ... other indexes
      `);
    }

    if (currentVersion < 2) {
      // Example: add a column in a future version
      // await txn.execAsync('ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0;');
    }

    await txn.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
```

### Integration with SQLiteProvider

```tsx
<SQLiteProvider databaseName="organizatu.db" onInit={migrateDbIfNeeded}>
  <App />
</SQLiteProvider>
```

The `onInit` callback runs before any children render, guaranteeing the schema is ready.

### Key migration practices

1. **Always wrap in a transaction** — all-or-nothing
2. **Use `IF NOT EXISTS`** for idempotent CREATE statements
3. **Add columns nullable first** — `ALTER TABLE ... ADD COLUMN` with `NOT NULL` and no default fails on existing rows. Add nullable, backfill, then add constraint later if needed.
4. **Table rebuild pattern** — for changing column types or adding NOT NULL defaults:
   ```sql
   CREATE TABLE notes_new (...);
   INSERT INTO notes_new SELECT ... FROM notes;
   DROP TABLE notes;
   ALTER TABLE notes_new RENAME TO notes;
   -- recreate indexes
   ```
5. **Never decrease `PRAGMA user_version`** — version only goes up
6. **Verify schema after migration** (optional but recommended):
   ```ts
   const cols = await db.getAllAsync('PRAGMA table_info(tasks)');
   // verify expected columns exist
   ```

### Alternative: Drizzle ORM

If you prefer type-safe schema + auto-generated migrations:

```ts
// db/schema.ts
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: int('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull().default(''),
  dueDate: text('due_date'),
  completed: int('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
```

```bash
npx drizzle-kit generate   # generates SQL migrations
```

```tsx
// Root layout
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';

const { success, error } = useMigrations(db, migrations);
```

**Drizzle pros:** Type inference from schema, auto-generated migrations, relational queries, `useLiveQuery` hook.
**Drizzle cons:** Extra dependency, requires `babel-plugin-inline-import` for `.sql` files, less control over raw SQL.

**Recommendation for OrganizaTu:** Start with raw SQL + `PRAGMA user_version`. It's simpler, zero dependencies, and sufficient for 6 tables. Add Drizzle later if the schema grows complex.

---

## 6. TypeScript Types

### Option A: Manual types (simple, matches raw SQL approach)

```ts
export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  audio_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyTopic {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface StudyNote {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  category: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// Helper: convert SQLite integer booleans
export function toBoolean(value: number): boolean {
  return value === 1;
}
```

Use with typed queries:

```ts
const tasks = await db.getAllAsync<Task>(
  'SELECT * FROM tasks WHERE completed = ? ORDER BY due_date',
  0
);
```

### Option B: Drizzle schema inference (auto-generated)

```ts
import { tasks, notes, studyTopics, studyNotes, events, categories } from './db/schema';

// These types are inferred directly from the schema definition
export type Task = typeof tasks.$inferSelect;        // SELECT row type
export type NewTask = typeof tasks.$inferInsert;     // INSERT row type
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
// ... etc
```

No manual type definitions needed — they stay in sync with the schema automatically.

### Option C: Runtime type generation from DB

```ts
// Generate types from actual table schema (dev tool only)
const columns = await db.getAllAsync<{ name: string; type: string }>(
  "PRAGMA table_info(tasks)"
);
// Use in dev tools / code generation scripts
```

### Recommendation

**Option A** (manual types) for the raw SQL approach. Keep types in `src/types/database.ts`. They're simple, explicit, and easy to maintain for 6 tables. Add `SQLiteRow` generic usage for flexibility:

```ts
// expo-sqlite provides a generic for query results
const row = await db.getFirstAsync<SQLiteRow>(
  'SELECT * FROM tasks WHERE id = ?', id
);
```

---

## Summary of Decisions

| Topic | Decision |
|---|---|
| API | `openDatabaseAsync` + `withExclusiveTransactionAsync` |
| Date storage | TEXT as ISO 8601 (`datetime('now')` for UTC) |
| Booleans | INTEGER 0/1 |
| Primary keys | INTEGER PRIMARY KEY AUTOINCREMENT |
| Category storage | TEXT string (no FK for v1) |
| Indexes | Composite where possible; DESC for reverse-chronological |
| Full-text search | FTS5 virtual table with triggers (enabled by default) |
| Audio storage | `audio_path` TEXT column with `file://` URI, document directory |
| Migrations | `PRAGMA user_version` + switch statement in `onInit` |
| TypeScript | Manual types matching schema (Option A) |
| ORM | None for v1; Drizzle as future option |
