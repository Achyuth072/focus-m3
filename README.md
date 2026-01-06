# Kanso

A clean, simple space to organize your tasks and stay focused.

[Live Demo](https://focus-m3.vercel.app/)

## Features

- **Guest Mode** You can use everything without an account. Your data stays in your browser and never touches a server.
- **Focus Timer** A Pomodoro timer that links directly to what you are working on right now.
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
