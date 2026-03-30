# Kanso (FocusM3)

_"The void is not empty; it is full of possibility."_

Kanso is a **Zen-Modernist** task management and focus tool. It fuses the Japanese philosophy of **Kanso** (simplicity) with **Swiss Modernism** to create a quiet, high-density environment for deep work.

## Core Philosophy: Zen-Modernism

- **Ma (The Void)**: We use active negative space to organize content, not borders or shadows.
- **Seijaku (Calm)**: All interactions feature physical, dampened weight for an energized sense of calm.
- **Ink & Matte**: High-contrast typography ("Ink") on flat, soft-matte surfaces.

[Live Demo](https://focus-m3.vercel.app/)

## Features

- **Macro & Micro Views**: Switch between Masonry Grid, Kanban Board (Desktop), and List views instantly with `Shift+1/2/3`. Low-latency DnD ensures fluid transitions.
- **Visual Activity Heatmap**: High-fidelity consistency chart tracking both focus minutes and habit repetitions via `react-activity-calendar`.
- **Habit Mastery**: Dedicated habit tracking system with CRUD management, longevity insights, and standardized haptic signatures.
- **Calendar & Event Engine**: 
  - **Native Event Creation**: FAB (mobile) and inline grid placeholders (desktop) for creating events directly in-app.
  - **Sync Engine**: Bi-directional CalDAV synchronization (Experimental) for iCloud/Nextcloud compatibility. Scaffolded support for Google and Outlook providers.
  - **Portability**: Support for universal `.ics` (RFC 5545) import/export.
- **Guest Mode**: A 100% private, zero-footprint demo experience anchored in `localStorage`.
- **Absolute Resilience**: Offline-first via a **Tri-Layer Defense** (Service Worker timeouts, network-resilient middleware, and IndexedDB persistence).
- **Project Hardening**: Multi-project support with deep organizational layers, selective archiving vs. deletion, and native-style Drawers for mobile project management.
- **Migration Engine**: Idempotent and resilient data transition from Guest Mode to cloud accounts.
- **PWA Excellence**: Native-grade mobile experience with swipe gestures, offline-first reliability, and "Seijaku" haptics.
- **Command Menu**: Global `Ctrl+K` palette for instant navigation and action execution.
- **Focus Timer**: PiP-enabled Pomodoro engine with real-time stats synchronization.

## Shortcuts

Press **Shift + H** to see the full list of keyboard shortcuts.

## Built with

- **Next.js 16.1.0 (App Router)** and **Supabase (Postgres/Realtime/SSR)**
- **TanStack Query v5.90+** (Persistence via IndexedDB) and **Zustand**
- **React 19.2.3** (Pre-optimized for Concurrent Mode)
- **Tailwind CSS v4** and **Shadcn UI** (Radical Minimalism)
- **Framer Motion** and **@dnd-kit** (Optimized Flat-DOM implementation)
- **Serwist** for Typed Service Worker & PWA support
- **react-activity-calendar** and **Recharts** for data visualization
- **tsdav** and **ical.js** for calendar synchronization and portability

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project with the schema from `supabase/schema.sql`

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   ```bash
   cp .env.example .env.local
   ```
   _Add your Supabase keys to .env.local_
4. Start the dev server:
   ```bash
   npm run dev
   ```
