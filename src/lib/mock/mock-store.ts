/**
 * Mock Data Store for Guest Mode
 * Provides in-memory CRUD operations with localStorage persistence
 */

import type { Task, Project } from "@/lib/types/task";

const STORAGE_KEY = "kanso_guest_data_v2";

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
      isEvening = false
    ) => {
      const date = new Date(now.getTime() + dayOffset * oneDay);
      // Set specific time for calendar sorting (e.g. 9am for work, 7pm for evening)
      if (isEvening) date.setHours(19, 0, 0, 0);
      else date.setHours(9, 0, 0, 0);

      const dueDate = date.toISOString();
      const isPast = dayOffset < 0;
      // 80% chance of completion if in past
      const isCompleted = isPast && Math.random() > 0.2;

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
        created_at: now.toISOString(), // Created 'now' for simplicity
        updated_at: now.toISOString(),
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
        logs.push({
          id: `log-${generateId()}`,
          user_id: "guest",
          task_id: taskId,
          start_time: dueDate,
          end_time: new Date(date.getTime() + 30 * 60000).toISOString(),
          duration_seconds: 1800 + Math.floor(Math.random() * 1800), // 30-60m
          created_at: dueDate,
        });
      }
    };

    // Generate Past 21 Days (History for Stats) - Expanded for better trend view
    for (let i = -21; i < 0; i++) {
      const date = new Date(now.getTime() + i * oneDay);
      const dayOfWeek = date.getDay();

      // Weekends (Saturday/Sunday) have less activity but not zero
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (Math.random() > 0.4) continue; // 60% chance skip weekends
      } else {
        if (Math.random() > 0.9) continue; // Only 10% chance skip weekdays
      }

      createTask("Morning Standup", i, pWork, 1);
      createTask("Deep Work Block", i, pWork, 1);

      if (Math.random() > 0.4) createTask("Clear Inbox", i, pWork, 3);
      if (Math.random() > 0.6) createTask("Project Sync", i, pWork, 2);
      if (Math.random() > 0.5) createTask("Workout 🏋️", i, pPersonal, 3, true);
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
    project: Omit<Project, "id" | "created_at" | "updated_at">
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
