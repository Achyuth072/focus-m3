import { z } from "zod";

export const PrioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  content: z.string().min(1, "Task content is required").max(500),
  description: z.string().max(5000).nullable().optional(),
  priority: PrioritySchema.default(4),
  due_date: z.string().datetime().nullable().optional(),
  is_completed: z.boolean().default(false),
  completed_at: z.string().datetime().nullable().optional(),
  day_order: z.number().int().default(0),
  recurrence: z.string().max(100).nullable().optional(),
  google_event_id: z.string().max(255).nullable().optional(),
  google_etag: z.string().max(255).nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateTaskSchema = z.object({
  content: z.string().min(1, "Task content is required").max(500),
  description: z.string().max(5000).optional(),
  priority: PrioritySchema.optional(),
  due_date: z.string().datetime().optional(),
  project_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
});

export const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  priority: PrioritySchema.optional(),
  due_date: z.string().datetime().nullable().optional(),
  is_completed: z.boolean().optional(),
  day_order: z.number().int().optional(),
  project_id: z.string().uuid().nullable().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
