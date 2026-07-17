export interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  categoryId: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  categoryId: number | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  categoryId: number | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}
