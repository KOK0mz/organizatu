import type { Task } from "@/types";

export interface TaskGroup {
  title: string;
  tasks: Task[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getGroupIndex(dueDate: string, todayStr: string, tomorrowStr: string, weekEndStr: string): number {
  if (dueDate === todayStr) return 0;
  if (dueDate === tomorrowStr) return 1;
  if (dueDate <= weekEndStr) return 2;
  return 3;
}

const GROUP_ORDER = ["Hoy", "Mañana", "Esta semana", "Después", "Sin fecha"];

export function groupTasksByDueDate(tasks: Task[]): TaskGroup[] {
  const now = startOfDay(new Date());

  const todayDate = new Date(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const weekEnd = new Date(now);
  const dayOfWeek = weekEnd.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  weekEnd.setDate(weekEnd.getDate() + daysUntilSunday);
  weekEnd.setHours(23, 59, 59, 999);

  const todayStr = toDateString(todayDate);
  const tomorrowStr = toDateString(tomorrowDate);
  const weekEndStr = toDateString(weekEnd);

  const buckets: Task[][] = [[], [], [], [], []];

  for (const task of tasks) {
    if (!task.dueDate) {
      buckets[4].push(task);
      continue;
    }
    const idx = getGroupIndex(task.dueDate, todayStr, tomorrowStr, weekEndStr);
    buckets[idx].push(task);
  }

  for (const bucket of buckets) {
    bucket.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.id - b.id;
    });
  }

  const result: TaskGroup[] = [];
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].length > 0) {
      result.push({ title: GROUP_ORDER[i], tasks: buckets[i] });
    }
  }

  return result;
}

export function filterTasksByCategory(tasks: Task[], categoryId: number | null): Task[] {
  if (categoryId === null) return tasks;
  return tasks.filter((t) => t.categoryId === categoryId);
}
