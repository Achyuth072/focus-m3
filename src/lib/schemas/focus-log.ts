import { z } from "zod";

export const FocusLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  task_id: z.string().uuid().nullable().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  duration_seconds: z.number().int().min(0),
  created_at: z.string().datetime().optional(),
});

export const CreateFocusLogSchema = z
  .object({
    task_id: z.string().uuid().nullable().optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration_seconds: z.number().int().min(0).max(86400), // Max 24 hours
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type FocusLog = z.infer<typeof FocusLogSchema>;
export type CreateFocusLogInput = z.infer<typeof CreateFocusLogSchema>;
