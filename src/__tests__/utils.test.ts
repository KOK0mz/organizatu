import type { Task } from "@/types";
import { filterTasksByCategory, groupTasksByDueDate } from "../lib/utils";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Test task",
    description: null,
    completed: false,
    categoryId: null,
    dueDate: null,
    createdAt: "2026-07-17T10:00:00",
    updatedAt: "2026-07-17T10:00:00",
    ...overrides,
  };
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

describe("groupTasksByDueDate", () => {
  it("groups a task due today into Hoy", () => {
    const tasks = [makeTask({ id: 1, dueDate: today() })];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Hoy");
    expect(groups[0].tasks).toHaveLength(1);
    expect(groups[0].tasks[0].id).toBe(1);
  });

  it("groups a task due tomorrow into Mañana", () => {
    const tasks = [makeTask({ id: 1, dueDate: tomorrow() })];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Mañana");
  });

  it("groups a task due in 3-6 days into Esta semana", () => {
    const tasks = [makeTask({ id: 1, dueDate: daysFromNow(4) })];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Esta semana");
  });

  it("groups a task due in 7+ days into Después", () => {
    const tasks = [makeTask({ id: 1, dueDate: daysFromNow(10) })];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Después");
  });

  it("groups a task with no due date into Sin fecha", () => {
    const tasks = [makeTask({ id: 1, dueDate: null })];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Sin fecha");
  });

  it("sorts completed tasks to the bottom within each group", () => {
    const tasks = [
      makeTask({ id: 1, completed: true, dueDate: today() }),
      makeTask({ id: 2, completed: false, dueDate: today() }),
      makeTask({ id: 3, completed: false, dueDate: today() }),
    ];
    const groups = groupTasksByDueDate(tasks);

    expect(groups[0].tasks.map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it("does not include empty groups", () => {
    const tasks = [makeTask({ id: 1, dueDate: today() })];
    const groups = groupTasksByDueDate(tasks);

    const titles = groups.map((g) => g.title);
    expect(titles).not.toContain("Mañana");
    expect(titles).not.toContain("Esta semana");
    expect(titles).not.toContain("Después");
    expect(titles).not.toContain("Sin fecha");
  });

  it("maintains group order: Hoy, Mañana, Esta semana, Después, Sin fecha", () => {
    const tasks = [
      makeTask({ id: 1, dueDate: daysFromNow(10) }),
      makeTask({ id: 2, dueDate: today() }),
      makeTask({ id: 3, dueDate: tomorrow() }),
      makeTask({ id: 4, dueDate: null }),
      makeTask({ id: 5, dueDate: daysFromNow(4) }),
    ];
    const groups = groupTasksByDueDate(tasks);

    expect(groups.map((g) => g.title)).toEqual([
      "Hoy",
      "Mañana",
      "Esta semana",
      "Después",
      "Sin fecha",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(groupTasksByDueDate([])).toEqual([]);
  });

  it("groups tasks across multiple sections correctly", () => {
    const tasks = [
      makeTask({ id: 1, dueDate: today(), title: "Task today" }),
      makeTask({ id: 2, dueDate: tomorrow(), title: "Task tomorrow" }),
      makeTask({ id: 3, dueDate: today(), title: "Task today 2" }),
    ];
    const groups = groupTasksByDueDate(tasks);

    expect(groups).toHaveLength(2);
    expect(groups[0].tasks).toHaveLength(2);
    expect(groups[1].tasks).toHaveLength(1);
  });
});

describe("filterTasksByCategory", () => {
  it("returns all tasks when categoryId is null", () => {
    const tasks = [
      makeTask({ id: 1, categoryId: 1 }),
      makeTask({ id: 2, categoryId: 2 }),
    ];
    expect(filterTasksByCategory(tasks, null)).toHaveLength(2);
  });

  it("filters tasks by category", () => {
    const tasks = [
      makeTask({ id: 1, categoryId: 1 }),
      makeTask({ id: 2, categoryId: 2 }),
      makeTask({ id: 3, categoryId: 1 }),
    ];
    const filtered = filterTasksByCategory(tasks, 1);

    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.categoryId === 1)).toBe(true);
  });

  it("returns empty array when no tasks match category", () => {
    const tasks = [makeTask({ id: 1, categoryId: 1 })];
    expect(filterTasksByCategory(tasks, 99)).toHaveLength(0);
  });
});
