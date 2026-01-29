# Kanso (FocusM3)

_"The void is not empty; it is full of possibility."_

Kanso is a **Zen-Modernist** task management and focus tool. It fuses the Japanese philosophy of **Kanso** (simplicity) with **Swiss Modernism** to create a quiet, high-density environment for deep work.

## Core Philosophy: Zen-Modernism

- **Ma (The Void)**: We use active negative space to organize content, not borders or shadows.
- **Seijaku (Calm)**: All interactions feature physical, dampened weight for an energized sense of calm.
- **Ink & Matte**: High-contrast typography ("Ink") on flat, soft-matte surfaces.

[Live Demo](https://focus-m3.vercel.app/)

## Features

- **Macro & Micro Views**: Switch between Masonry Grid, Kanban Board, and List views instantly with `Shift+1/2/3`.
- **Visual Activity Heatmap**: GitHub-style consistency chart tracking both focus minutes and habit repetitions.
- **Habit Mastery**: Dedicated habit tracking system with CRUD management and longevity insights.
- **Calendar Precision**: Vertical schedule with real-time indicators and programmatic auto-scroll to "Now."
- **Guest Mode**: A 100% private, zero-footprint demo experience anchored in `localStorage`.
- **Offline-First**: Powered by TanStack Query persistence and IndexedDB, ensuring total reliability without network.
- **PWA Excellence**: Native-grade mobile experience with swipe-to-edit/delete gestures and "Seijaku" haptics.
- **Command Menu**: Global `Ctrl+K` palette for instant navigation and action execution.
- **Focus Timer**: PiP-enabled Pomodoro engine with real-time stats synchronization.
- **Project Organization**: Multi-project support with collapsible, tactile organizational layers.

## Shortcuts

Press **Shift + H** to see the full list of keyboard shortcuts.

## Built with

- **Next.js 15 (App Router)** and **Supabase (PostgreSQL/Realtime)**
- **TanStack Query v5** (Persistence via IndexedDB) and **Zustand**
- **Tailwind CSS v4** and **Shadcn UI** (Radical Minimalism)
- **Framer Motion** and **dnd-kit** for physical interactions
- **Serwist** for Typed Service Worker & PWA support
- **Recharts** and **Cal-Heatmap** for data visualization

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
