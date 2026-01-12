# Synchronization Strategy: Kanso

## 1. Conflict Resolution (LWW)

Kanso uses **Last-Write-Wins (LWW)** strategy based on `updated_at` timestamps.

## 2. Synchronization Layers

### 2.1. Client-Side (React Query)

- **Optimism**: Local state updates instantly on user action.
- **Persistence**: Queries are cached in `localStorage` to handle network blips.
- **Invalidation**: Global notifications via Supabase Realtime trigger background refetches.

### 2.2. Global State (Zustand)

- Shared stores for ephemeral state (Calendar navigation, active Timer).
- Syncs across tabs via storage events.

### 2.3. Server-Push (Supabase Realtime)

- Centralized subscription in `AppShell` ensures only one WebSocket connection exists per device.
- Listens for ALL schema changes to keep multi-device environments (Desktop + Phone) in perfect sync.

### 2.4. Cross-Query Dependencies

To maintain a seamless "super-app" experience, mutations in one module automatically refresh dependent views:

- **Task Mutations** (Create/Toggle/Delete/Reorder) → Invalidate `tasks`, `calendar-tasks`, and `stats-dashboard`.
- **Focus Timer Completion** → Triggers a background refresh of the `stats-dashboard` query to update productivity metrics instantly.

## 3. Deployment Transitions

- **Auth Redirects**: Auth state changes trigger immediate UI transitions.
- **Loading Guards**: `LoaderOverlay` prevents content flashing during sign-out or session updates.
