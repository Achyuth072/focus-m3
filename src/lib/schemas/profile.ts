import { z } from "zod";

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
