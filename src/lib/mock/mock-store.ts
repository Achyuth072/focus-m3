/**
 * Mock Data Store for Guest Mode
 * Provides in-memory CRUD operations with localStorage persistence
 */

import type { Task, Project } from "@/lib/types/task";

const STORAGE_KEY = "kanso_guest_data_v5";

interface FocusLog {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
  created_at: string;
}

interface GuestData {
  tasks: Task[];
  projects: Project[];
  focus_logs: FocusLog[];
  lastUpdated: string;
}

class MockStore {
  private data: GuestData;

  constructor() {
    const stored = this.loadFromStorage();
    if (stored) {
      this.data = stored;
    } else {
      this.data = this.getInitialData();
      this.saveToStorage();
    }
  }

  private getInitialData(): GuestData {
    const now = new Date();
    const nowIso = now.toISOString();
    const oneDay = 86400000;

    // Base Projects
    const pWork = "demo-project-work";
    const pPersonal = "demo-project-personal";
    const pSide = "demo-project-side";

    const projects: Project[] = [
      {
        id: pWork,
        user_id: "guest",
        name: "Work 💼",
        color: "#3b82f6",
        view_style: "list",
        is_inbox: false,
        is_archived: false,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: pPersonal,
        user_id: "guest",
        name: "Personal 🏠",
        color: "#10b981",
        view_style: "list",
        is_inbox: false,
        is_archived: false,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: pSide,
        user_id: "guest",
        name: "Side Hustle 🚀",
        color: "#8b5cf6",
        view_style: "board",
        is_inbox: false,
        is_archived: false,
        created_at: nowIso,
        updated_at: nowIso,
      },
    ];

    const tasks: Task[] = [];
    const logs: FocusLog[] = [];

    // Generators
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const createTask = (
      content: string,
      dayOffset: number,
      projectId: string,
      priority: 1 | 2 | 3 | 4 = 4,
      isEvening = false,
    ) => {
      const date = new Date(now.getTime() + dayOffset * oneDay);

      // Randomize start time
      const randomHour = isEvening
        ? 18 + Math.random() * 4 // 18:00 - 22:00
        : 8 + Math.random() * 6; // 08:00 - 14:00
      const randomMinute = Math.floor(Math.random() * 60);
      date.setHours(Math.floor(randomHour), randomMinute, 0, 0);

      const dueDate = date.toISOString();
      const isPast = dayOffset < 0;
      // 85% chance of completion if in past for "Deep Work", 60% for others
      const isCompleted =
        isPast && Math.random() > (content.includes("Deep Work") ? 0.15 : 0.4);

      const taskId = `task-${generateId()}`;

      tasks.push({
        id: taskId,
        user_id: "guest",
        content,
        description: null,
        is_completed: isCompleted,
        completed_at: isCompleted ? dueDate : null,
        priority,
        project_id: projectId,
        day_order: tasks.length,
        created_at: new Date(date.getTime() - 86400000).toISOString(),
        updated_at: dueDate,
        due_date: dueDate,
        do_date: null,
        is_evening: isEvening,
        parent_id: null,
        recurrence: null,
        google_event_id: null,
        google_etag: null,
        // Ensure fields match interface
      });

      // Add focus log if completed (simulate work done)
      if (isCompleted) {
        const durationSeconds = 900 + Math.floor(Math.random() * 7200); // 15m to 2h
        logs.push({
          id: `log-${generateId()}`,
          user_id: "guest",
          task_id: taskId,
          start_time: dueDate,
          end_time: new Date(
            date.getTime() + durationSeconds * 1000,
          ).toISOString(),
          duration_seconds: durationSeconds,
          created_at: dueDate,
        });
      }
    };

    // Generate Past 365 Days (History for Stats)
    for (let i = -365; i < 0; i++) {
      const date = new Date(now.getTime() + i * oneDay);
      const dayOfWeek = date.getDay();
      const monthOffset = Math.abs(i) / 30;

      // Higher probability of activity overall to fill heatmap
      let probability = 0.7;
      if (monthOffset > 4) probability = 0.5;
      if (monthOffset > 8) probability = 0.35;

      // Weekends still have less activity but not empty
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        probability *= 0.4;
      }

      if (Math.random() > probability) continue;

      // On active days, generate 1-3 tasks
      const taskCount = Math.floor(Math.random() * 3) + 1;
      for (let t = 0; t < taskCount; t++) {
        const isEvening = Math.random() > 0.7;
        createTask(
          t === 0
            ? "Deep Work Session"
            : Math.random() > 0.5
              ? "Review & Refactor"
              : "Learning & Research",
          i,
          isEvening ? pPersonal : pWork,
          (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 | 4,
          isEvening,
        );
      }
    }

    // Generate Today & Future 14 Days
    for (let i = 0; i <= 14; i++) {
      // Today specific
      if (i === 0) {
        createTask("Review PRs", 0, pWork, 1);
        createTask("Team Sync", 0, pWork, 2);
        createTask("Call Mom", 0, pPersonal, 3, true);
        continue;
      }

      if (Math.random() > 0.3) {
        createTask("Project Sync", i, pWork, 2);
        createTask("Focus Time", i, pWork, 1);
      }
      if (i % 3 === 0) createTask("Write Blog Post", i, pSide, 2);
      if (i % 7 === 0) createTask("Weekly Planning", i, pPersonal, 1);
    }

    // Inject "Busy Days" for Calendar Overflow Testing
    // Pick 5 random days in the next 14 days (closer to now)
    for (let j = 0; j < 5; j++) {
      const busyDayOffset = Math.floor(Math.random() * 14); // 0 to 14 days from now
      // Add 4-6 extra tasks to this day
      const extraTasks = Math.floor(Math.random() * 3) + 4;
      for (let k = 0; k < extraTasks; k++) {
        createTask(
          `Busy Day Task ${k + 1}`,
          busyDayOffset,
          Math.random() > 0.5 ? pWork : pSide,
          2,
          Math.random() > 0.8, // Mostly day tasks
        );
      }
    }

    return {
      tasks,
      projects,
      focus_logs: logs,
      lastUpdated: nowIso,
    };
  }

  private loadFromStorage(): GuestData | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      this.data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn("Failed to save guest data to localStorage:", error);
    }
  }

  // Task Operations
  getTasks(): Task[] {
    return [...this.data.tasks];
  }

  getTask(id: string): Task | null {
    return this.data.tasks.find((t) => t.id === id) || null;
  }

  addTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: `guest-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: "guest",
      created_at: now,
      updated_at: now,
    };

    this.data.tasks.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.data.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.data.tasks.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Project Operations
  getProjects(): Project[] {
    return [...this.data.projects];
  }

  getProject(id: string): Project | null {
    return this.data.projects.find((p) => p.id === id) || null;
  }

  addProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Project {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: `guest-project-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      user_id: "guest",
      created_at: now,
      updated_at: now,
    };

    this.data.projects.push(newProject);
    this.saveToStorage();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.data.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.data.projects.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Focus Logs
  getFocusLogs(): FocusLog[] {
    return [...(this.data.focus_logs || [])];
  }

  addFocusLog(log: Omit<FocusLog, "id" | "created_at">): FocusLog {
    const now = new Date().toISOString();
    const newLog: FocusLog = {
      ...log,
      id: `guest-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
    };

    if (!this.data.focus_logs) this.data.focus_logs = [];
    this.data.focus_logs.push(newLog);
    this.saveToStorage();
    return newLog;
  }

  // Utility
  reset(): void {
    this.data = this.getInitialData();
    this.saveToStorage();
  }

  clearData(): void {
    this.data = {
      tasks: [],
      projects: [],
      focus_logs: [],
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  clearStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Singleton instance
export const mockStore = new MockStore();
