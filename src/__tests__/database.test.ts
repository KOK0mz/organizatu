const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

const mockOpenDatabase = jest.fn();

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: (...args: unknown[]) => mockOpenDatabase(...args),
  SQLiteProvider: ({ children }: { children: React.ReactNode }) => children,
  useSQLiteContext: jest.fn(() => mockDb),
}));

import {
  createEvent,
  createNote,
  createTask,
  deleteEvent,
  deleteNote,
  deleteTask,
  getCategories,
  getDb,
  getEvents,
  getNotes,
  getTasks,
  initDatabase,
  updateEvent,
  updateNote,
  updateTask,
} from "../lib/database";

beforeEach(() => {
  jest.clearAllMocks();
  mockOpenDatabase.mockResolvedValue(mockDb);
  mockDb.execAsync.mockResolvedValue(undefined);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.getFirstAsync.mockResolvedValue(null);
});

describe("Database", () => {
  it("initializes database with WAL mode and foreign keys", async () => {
    const db = await getDb();

    expect(mockDb.execAsync).toHaveBeenCalledWith("PRAGMA journal_mode = WAL");
    expect(mockDb.execAsync).toHaveBeenCalledWith("PRAGMA foreign_keys = ON");
  });

  it("creates all tables during initialization", async () => {
    mockDb.getFirstAsync.mockResolvedValue({ user_version: 0 });
    await initDatabase();

    const execCalls = (mockDb.execAsync as jest.Mock).mock.calls.map(
      (c: unknown[]) => c[0] as string,
    );
    const allSql = execCalls.join(" ");
    expect(allSql).toContain("CREATE TABLE IF NOT EXISTS categories");
    expect(allSql).toContain("CREATE TABLE IF NOT EXISTS tasks");
    expect(allSql).toContain("CREATE TABLE IF NOT EXISTS notes");
    expect(allSql).toContain("CREATE TABLE IF NOT EXISTS events");
  });

  it("seeds 5 predefined categories", async () => {
    mockDb.getFirstAsync.mockResolvedValue({ user_version: 0 });
    await initDatabase();

    const expectedCategories = [
      { name: "Trabajo", color: "#2563EB" },
      { name: "Personal", color: "#7C3AED" },
      { name: "Estudio", color: "#059669" },
      { name: "Finanzas", color: "#D97706" },
      { name: "Ocio", color: "#E11D48" },
    ];

    for (const cat of expectedCategories) {
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        "INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)",
        cat.name,
        cat.color,
      );
    }
  });

  it("skips migration if version is current", async () => {
    mockDb.getFirstAsync.mockResolvedValue({ user_version: 1 });
    await initDatabase();

    expect(mockDb.execAsync).not.toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE"),
    );
  });

  it("creates a task and returns its id", async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42, changes: 1 });
    const id = await createTask("Test task", "A description", 1, "2026-07-20");

    expect(id).toBe(42);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "INSERT INTO tasks (title, description, category_id, due_date) VALUES (?, ?, ?, ?)",
      "Test task",
      "A description",
      1,
      "2026-07-20",
    );
  });

  it("creates a note and returns its id", async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42, changes: 1 });
    const id = await createNote("Test note", "Content here", 1);
    expect(id).toBe(42);
  });

  it("creates an event and returns its id", async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42, changes: 1 });
    const id = await createEvent(
      "Test event",
      "2026-07-20T10:00",
      "2026-07-20T11:00",
      "Description",
      1,
      "Office",
    );
    expect(id).toBe(42);
  });

  it("deletes a task", async () => {
    await deleteTask(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "DELETE FROM tasks WHERE id = ?",
      1,
    );
  });

  it("deletes a note", async () => {
    await deleteNote(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "DELETE FROM notes WHERE id = ?",
      1,
    );
  });

  it("deletes an event", async () => {
    await deleteEvent(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "DELETE FROM events WHERE id = ?",
      1,
    );
  });

  it("updates a task", async () => {
    await updateTask(1, { title: "Updated", completed: true });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE tasks SET"),
      expect.any(Array),
    );
  });

  it("updates a note", async () => {
    await updateNote(1, { title: "Updated", pinned: true });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE notes SET"),
      expect.any(Array),
    );
  });

  it("updates an event", async () => {
    await updateEvent(1, { title: "Updated", location: "New location" });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE events SET"),
      expect.any(Array),
    );
  });

  it("retrieves categories", async () => {
    const mockCategories = [
      { id: 1, name: "Trabajo", color: "#2563EB", createdAt: "2026-01-01" },
      { id: 2, name: "Personal", color: "#7C3AED", createdAt: "2026-01-01" },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockCategories);
    const categories = await getCategories();
    expect(categories).toHaveLength(2);
    expect(categories[0]).toHaveProperty("name", "Trabajo");
  });

  it("retrieves tasks", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Task 1",
        description: null,
        completed: 0,
        categoryId: 1,
        dueDate: null,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockTasks);
    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toHaveProperty("title", "Task 1");
  });

  it("retrieves notes", async () => {
    const mockNotes = [
      {
        id: 1,
        title: "Note 1",
        content: null,
        categoryId: 1,
        pinned: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockNotes);
    const notes = await getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0]).toHaveProperty("pinned", 1);
  });

  it("retrieves events", async () => {
    const mockEvents = [
      {
        id: 1,
        title: "Event 1",
        description: null,
        startDate: "2026-07-20T10:00",
        endDate: "2026-07-20T11:00",
        categoryId: 1,
        location: null,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockEvents);
    const events = await getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toHaveProperty("title", "Event 1");
  });
});
