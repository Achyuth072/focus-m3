# Kanso (FocusM3)

_"The void is not empty; it is full of possibility."_

Kanso is a **Zen-Modernist** task management and focus tool. It fuses the Japanese philosophy of **Kanso** (simplicity) with **Swiss Modernism** to create a quiet, high-density environment for deep work.

## Core Philosophy: Zen-Modernism

- **Ma (The Void)**: We use active negative space to organize content, not borders or shadows.
- **Seijaku (Calm)**: All interactions feature physical, dampened weight for an energized sense of calm.
- **Ink & Matte**: High-contrast typography ("Ink") on flat, soft-matte surfaces.

[Live Demo](https://focus-m3.vercel.app/)

## Features

- **Guest Mode**: A full, privacy-first demo experience that persists locally.
- **Project Organization**: Multi-project support with collapsible, color-coded sections.
- **Focus Timer**: PiP-enabled timer (Chrome/Edge) with fallback for all browsers.
- **Global Hotkeys**: Everything is 100% keyboard-navigable.
- **Stats & Insights**: Real-time synchronization of focus and completion data.
- **Smart Planning** Separate when you want to work on a task from its actual deadline. You can also defer things to a dedicated "This Evening" section.
- **Command Menu** Jump anywhere in the app instantly using Cmd+K or Ctrl+K.
- **Works on Mobile** Since it is a PWA, it feels like a native app on your phone with swipe gestures and haptics.
- **Calendar** See your schedule in day, week, month, or year views.

## Shortcuts

Press **Shift + H** to see the full list of keyboard shortcuts.

## Built with

- **Next.js 15** and **Supabase**
- **TanStack Query** and **Zustand** for state
- **Tailwind CSS v4** and **Shadcn UI** for the interface
- **Framer Motion** and **dnd-kit** for gestures and reordering
- **Serwist** for offline PWA support

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
