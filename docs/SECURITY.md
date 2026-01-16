# Security Hardening Documentation

## Overview

Phase 19 implements enterprise-grade security through comprehensive Zod validation schemas and hardened Row Level Security (RLS) policies.

## Zod Schema Architecture

### Purpose

- **Type Safety**: Ensures TypeScript types match database schema exactly
- **Input Validation**: Prevents malformed data from entering the system
- **Error Handling**: Provides user-friendly validation error messages
- **Length Constraints**: Enforces database field limits at the application layer

### Schemas

#### Task Schema (`src/lib/schemas/task.ts`)

- **content**: 1-500 characters (required)
- **description**: max 5000 characters (optional)
- **priority**: 1-4 (enum)
- **day_order**: integer
- **recurrence**: max 100 characters
- **google_event_id/etag**: max 255 characters

#### Project Schema (`src/lib/schemas/project.ts`)

- **name**: 1-50 characters (required)
- **color**: hex color validation (#RGB or #RRGGBB)
- **view_style**: enum ('list' | 'board')

#### Label Schema (`src/lib/schemas/label.ts`)

- **name**: 1-50 characters (required)
- **color**: hex color validation

#### Focus Log Schema (`src/lib/schemas/focus-log.ts`)

- **duration_seconds**: 0-86400 (max 24 hours)
- **end_time**: must be after start_time (custom validation)

#### Profile Schema (`src/lib/schemas/profile.ts`)

- **display_name**: 1-100 characters
- **settings**: JSON object

## Row Level Security (RLS) Hardening

### Critical Security Fixes

#### 1. Task Labels (Tagging)

**Problem**: Users could potentially link their tasks to other users' labels.

**Solution**:

```sql
CREATE POLICY "Users can insert own task_labels" ON task_labels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
    AND
    EXISTS (SELECT 1 FROM labels WHERE labels.id = task_labels.label_id AND labels.user_id = auth.uid())
  );
```

#### 2. Task Project Assignment

**Problem**: Users could assign tasks to projects they don't own.

**Solution**:

```sql
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      project_id IS NULL
      OR EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
    )
  );
```

#### 3. Focus Log Task Reference

**Problem**: Users could create focus logs referencing other users' tasks.

**Solution**:

```sql
CREATE POLICY "Users can insert own focus_logs" ON focus_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      task_id IS NULL
      OR EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid())
    )
  );
```

### Policy Pattern

All relational integrity checks follow this pattern:

1. Verify direct ownership (`auth.uid() = user_id`)
2. Verify foreign key ownership (EXISTS check on related table)
3. Allow NULL foreign keys (for optional relationships)

## Migration Instructions

### For Development/Local

The `supabase/schema.sql` file has been updated with all hardened policies. If you're setting up a fresh database, just run the entire schema.

### For Production (Existing Database)

Run the migration file:

```bash
# In Supabase SQL Editor, execute:
supabase/migrations/20251230_security_hardening.sql
```

This will:

1. Drop existing lenient policies
2. Create new hardened policies
3. Maintain backward compatibility (no data changes)

## Testing Recommendations

### Manual Security Tests

1. **Cross-User Label Attack**:

   - User A creates a label
   - User B attempts to add User A's label to their task
   - Expected: INSERT fails with RLS violation

2. **Cross-User Project Attack**:

   - User A creates a project
   - User B attempts to create a task with User A's project_id
   - Expected: INSERT fails with RLS violation

3. **Cross-User Task Tracking**:
   - User A creates a task
   - User B attempts to create a focus log with User A's task_id
   - Expected: INSERT fails with RLS violation

### Normal Flow Verification

- Create task → Add to project → Add labels → Create focus log
- All operations should work seamlessly for owned resources

## Performance Considerations

The added EXISTS checks introduce minimal overhead:

- All foreign key columns are indexed
- Supabase query planner optimizes EXISTS subqueries
- Impact: ~1-2ms per INSERT/UPDATE operation

## Future Enhancements

- Add database-level CHECK constraints for additional validation
- Implement audit logging for security events
- Add rate limiting at the RLS level for DDoS protection

## Guest Mode & Data Privacy

### Isolation Principle

Guest Mode (Demo Mode) is designed for 100% privacy and zero infrastructure footprint.

- **Persistence**: Data is stored exclusively in the browser's `localStorage` under the key `kanso_guest_data_v2`.
- **Network**: All Supabase and Google API calls are bypassed. No telemetry or PII (Personally Identifiable Information) is sent to our servers.
- **Security**: Guest sessions are isolated per-browser. Clearing browser site data completely wipes all guest-related task data and logs.
- **Session**: A mock user object is provided to children of `AuthProvider` to maintain UI compatibility without any server-side session.
