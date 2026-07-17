import type { Category, Event, Note, Task } from "@/types";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

const SCHEMA_VERSION = 1;

const DDL = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const SEED_CATEGORIES = [
  { name: "Trabajo", color: "#2563EB" },
  { name: "Personal", color: "#7C3AED" },
  { name: "Estudio", color: "#059669" },
  { name: "Finanzas", color: "#D97706" },
  { name: "Ocio", color: "#E11D48" },
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    const database = await SQLite.openDatabaseAsync("organizatu.db");
    await database.execAsync("PRAGMA journal_mode = WAL");
    await database.execAsync("PRAGMA foreign_keys = ON");
    db = database;
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  const versionRow = await database.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  if (currentVersion === 0) {
    await database.execAsync(DDL);

    for (const cat of SEED_CATEGORIES) {
      await database.runAsync(
        "INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)",
        cat.name,
        cat.color,
      );
    }

    currentVersion = SCHEMA_VERSION;
  }

  await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export async function getCategories(): Promise<Category[]> {
  const database = await getDb();
  return database.getAllAsync<Category>(
    "SELECT id, name, color, created_at as createdAt FROM categories ORDER BY id",
  );
}

export async function getTasks(): Promise<Task[]> {
  const database = await getDb();
  return database.getAllAsync<Task>(
    `SELECT id, title, description, completed, category_id as categoryId,
            due_date as dueDate, created_at as createdAt, updated_at as updatedAt
     FROM tasks ORDER BY created_at DESC`,
  );
}

export async function createTask(
  title: string,
  description?: string,
  categoryId?: number,
  dueDate?: string,
): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    "INSERT INTO tasks (title, description, category_id, due_date) VALUES (?, ?, ?, ?)",
    title,
    description ?? null,
    categoryId ?? null,
    dueDate ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateTask(
  id: number,
  updates: Partial<Pick<Task, "title" | "description" | "completed" | "categoryId" | "dueDate">>,
): Promise<void> {
  const database = await getDb();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    sets.push("title = ?");
    params.push(updates.title);
  }
  if (updates.description !== undefined) {
    sets.push("description = ?");
    params.push(updates.description);
  }
  if (updates.completed !== undefined) {
    sets.push("completed = ?");
    params.push(updates.completed ? 1 : 0);
  }
  if (updates.categoryId !== undefined) {
    sets.push("category_id = ?");
    params.push(updates.categoryId);
  }
  if (updates.dueDate !== undefined) {
    sets.push("due_date = ?");
    params.push(updates.dueDate);
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await database.runAsync(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`,
    params,
  );
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM tasks WHERE id = ?", id);
}

export async function getNotes(): Promise<Note[]> {
  const database = await getDb();
  return database.getAllAsync<Note>(
    `SELECT id, title, content, category_id as categoryId,
            pinned, created_at as createdAt, updated_at as updatedAt
     FROM notes ORDER BY pinned DESC, created_at DESC`,
  );
}

export async function createNote(
  title: string,
  content?: string,
  categoryId?: number,
): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    "INSERT INTO notes (title, content, category_id) VALUES (?, ?, ?)",
    title,
    content ?? null,
    categoryId ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateNote(
  id: number,
  updates: Partial<Pick<Note, "title" | "content" | "pinned" | "categoryId">>,
): Promise<void> {
  const database = await getDb();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    sets.push("title = ?");
    params.push(updates.title);
  }
  if (updates.content !== undefined) {
    sets.push("content = ?");
    params.push(updates.content);
  }
  if (updates.pinned !== undefined) {
    sets.push("pinned = ?");
    params.push(updates.pinned ? 1 : 0);
  }
  if (updates.categoryId !== undefined) {
    sets.push("category_id = ?");
    params.push(updates.categoryId);
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await database.runAsync(
    `UPDATE notes SET ${sets.join(", ")} WHERE id = ?`,
    params,
  );
}

export async function deleteNote(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM notes WHERE id = ?", id);
}

export async function getEvents(): Promise<Event[]> {
  const database = await getDb();
  return database.getAllAsync<Event>(
    `SELECT id, title, description, start_date as startDate,
            end_date as endDate, category_id as categoryId,
            location, created_at as createdAt, updated_at as updatedAt
     FROM events ORDER BY start_date ASC`,
  );
}

export async function createEvent(
  title: string,
  startDate: string,
  endDate: string,
  description?: string,
  categoryId?: number,
  location?: string,
): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    "INSERT INTO events (title, description, start_date, end_date, category_id, location) VALUES (?, ?, ?, ?, ?, ?)",
    title,
    description ?? null,
    startDate,
    endDate,
    categoryId ?? null,
    location ?? null,
  );
  return result.lastInsertRowId;
}

export async function updateEvent(
  id: number,
  updates: Partial<
    Pick<Event, "title" | "description" | "startDate" | "endDate" | "categoryId" | "location">
  >,
): Promise<void> {
  const database = await getDb();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    sets.push("title = ?");
    params.push(updates.title);
  }
  if (updates.description !== undefined) {
    sets.push("description = ?");
    params.push(updates.description);
  }
  if (updates.startDate !== undefined) {
    sets.push("start_date = ?");
    params.push(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    sets.push("end_date = ?");
    params.push(updates.endDate);
  }
  if (updates.categoryId !== undefined) {
    sets.push("category_id = ?");
    params.push(updates.categoryId);
  }
  if (updates.location !== undefined) {
    sets.push("location = ?");
    params.push(updates.location);
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  await database.runAsync(
    `UPDATE events SET ${sets.join(", ")} WHERE id = ?`,
    params,
  );
}

export async function deleteEvent(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM events WHERE id = ?", id);
}
