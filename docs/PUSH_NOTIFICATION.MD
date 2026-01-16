# Push Notification Strategy Analysis

## Executive Summary

To elevate Kanso from a simple PWA to a "Pro Max" application, we must leverage Push Notifications to drive user retention (Lifecycle loops) and utility (Timers/Reminders). This report outlines the technical strategy for integrating Push into the core "Task" and "Focus" experiences.

## 0. Development & Testing

### Local PWA Testing

Because Next.js 16 defaults to **Turbopack**, and Serwist does not yet support Turbopack for service worker bundling, special care is needed for local PWA testing:

- **Standard Dev**: `npm run dev` (Fastest, uses Turbopack, **no Service Worker**).
- **PWA Dev**: `npm run dev:pwa` (Uses Webpack via `next dev --webpack` to enable Serwist locally).

### Production Build

In production (Vercel), we also force Webpack via `next build --webpack` to ensure `sw.js` is correctly generated and deployed.

## 1. High-Value Integration Opportunities

### A. The "Morning Briefing" (Lifecycle)

**Concept**: A silent, summary notification sent at 8:00 AM local time.
**Content**: "You have 5 tasks due today. The first one is 'Design Review' at 10:00 AM."
**Technical Feasibility**: High.
**Implementation**:

- **Trigger**: Vercel Cron (`vercel.json`) running hourly.
- **Logic**: API Endpoint `/api/cron/daily-briefing` checks `users` table for timezone and `active` tasks.
- **Why**: High utility, low annoyance. establishes Kanso as a daily assistant.

### B. Precision Timer Alerts (Utility)

**Concept**: Reliable "Focus Completed" alerts, even if the app is killed or backgrounded by aggressive mobile OS battery savers.
**Content**: "Zen Focus Session Complete (25m). Take a break!"
**Technical Challenge**: Browsers throttle `setTimeout` in the background. Service Workers cannot self-wake without a "Push" event.
**Implementation**:

- **Trigger**: When User clicks "Start Focus" -> Client sends POST `/api/timer/start { duration: 25 }`.
- **Scheduler**: Server calculates `end_at` time.
- **Delivery**:
  - _Option A (Supabase pg_cron)_: Schedule a job to call an Edge Function at `end_at`.
  - _Option B (Vercel Cron)_: Poll every 1 minute check for "completed" timers in DB coverage.
- **Why**: Critical for trust. If a user relies on the timer and it fails because the screen turned off, they quit the app.

### C. Task Specific Alerts (Utility)

**Concept**: Precise notifications for task scheduling.
**Types**:

- **Due Date**: "Task 'Submit Report' is due now." (High Urgency)
- **Do Date**: "Time to start 'Workout'." (Medium Urgency)
- **Evening Plan**: "You have 3 tasks planned for this evening." (Triggered at 6 PM for tasks with `is_evening: true`)
  **Implementation**:
- **Trigger**: Vercel Cron (Minutely) or Database Queue.
- **Logic**:
  - `Due/Do Date`: Query tasks where `due_date` or `do_date` matches current time (within minute window).
  - `Evening`: Query tasks with `is_evening = true` and `status != completed`, send summary at 6 PM user time.

### D. "Snapback" Reminders (Retention)

**Concept**: If a user leaves the app with a running timer or an unfinished "Today" list, nudge them.
**Content**: "Don't break your streak! 2 hours left to complete your daily goals."

## 2. Implemented Technical Architecture (Phase 34)

We have moved away from Vercel Cron to **Supabase pg_cron** for deeper database integration and sub-minute precision.

### Infrastructure

1.  **Supabase pg_cron**: Native database scheduler that triggers Edge Functions.
2.  **notification_queue**: Central table for all pending and processed notifications.
3.  **Supabase Edge Functions**:
    - `process-queue`: Dispatches pending notifications using `web-push`.
    - `daily-briefing`: Gathers daily task summaries and schedules briefings.
4.  **Database Triggers**: `handle_task_notification_sync` trigger automatically creates and cancels Due/Do Date alerts as tasks change.

### Schema

```sql
create table notification_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  type text not null check (type in ('timer_end', 'due_date', 'do_date', 'evening', 'briefing')),
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  reference_id uuid, -- links to task or timer
  ...
);
```

### Key Logic

- **Timezones**: User timezone is stored in `profiles.timezone` and handled via `AT TIME ZONE` in SQL queries.
- **User Preferences**: All notifications check `profiles.settings->'notifications'` before scheduling.
- **Timer Start**: `/api/timer/start` schedules a `timer_end` notification.
- **Task Alerts**: Triggers schedule `due_date` and `do_date` alerts.

## 3. Deployment Notes

- **Cron Schedule**: `process-notification-queue` runs every minute.
- **Security**: Edge functions are protected via `anon` or `service_role` keys and use RLS-safe queries where possible.
- **Testing**: Comprehensive unit tests exist for `useProfile` hook, Timer API, and `NotificationSettings` component.
