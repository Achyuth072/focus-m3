# Technical Specification: Kanso

## 1. Stack Overview

- **Framework**: Next.js (App Router).
- **UI Components**: Shadcn UI (Radical Minimalism).
- **Styling**: Tailwind CSS v4.
- **Typography**: `next/font/google` (Inter & JetBrains Mono) for zero-CLS loading.
- **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime).
- **State Management**: TanStack Query v5 + Zustand.
- **Performance**: Heavy code splitting via `next/dynamic`.
- **Runtime**: Node.js (Vercel deployment).

## 2. Shared Libraries

- **Date/Time**: `date-fns` (engine), `chrono-node` (NLP).
- **Charts**: `recharts` (Bento Grid stats).
- **Animations**: `framer-motion` (Micro-interactions).
- **Auth**: `supabase-auth-helpers` (Middleware/Client).

## 3. Key Architectures

### 3.1. Headless Calendar Engine

The calendar logic is decoupled from the UI:

- **Engine (`src/lib/calendar/engine.ts`)**: Pure TypeScript functions for calculating grid overlaps, event positioning, and view range logic.
- **Store (`src/lib/calendar/store.ts`)**: Zustand-managed state for navigation and event manipulation.
- **Views**: Swappable UI components (Day, Week, Month, Year, Schedule) that consume engine output.

### 3.2. Realtime Task Sync

- Persistent WebSocket connection established in `AppShell`.
- Automatically invalidates TanStack Query caches on `postgres_changes`.
- Local optimistic updates for zero-latency task management.

### 3.3. PWA & Mobile UI

- **Fixed Viewport Architecture**: Root `html/body` containment to eliminate scrollbar flashing and gaps.
- **Custom Components**:
  - `MobileHeader`: Responsive top bar with real-time focus timer.
  - `MobileNav`: Bottom navigation optimized for core productivity views.
  - `LoaderOverlay`: Full-screen authentication state transitions.
  - `TimePicker`: Custom non-native scrolling engine for precision time selection.
- **Aesthetics**: Notion-inspired minimal UI with high-contrast text and interactive micro-animations.

## 4. Database Schema

Defined in `supabase/schema.sql`. Includes:

- `tasks`: Core unit of work.
- `focus_logs`: Time-tracking sessions.
- `profiles`: User settings and synchronization points.
- `projects/labels`: Organizational metadata.
