# Product Requirements Document: Kanso

## 1. Product Vision

A high-fidelity, personal productivity suite that unifies deep focus (Pomodoro), structured work (Tasks), and visual planning (Calendar).

## 2. Core Pillars

1. **Radical Minimalism**: Info-dense but calm interface (Notion-style).
2. **Speed**: Zero-latency interactions via optimistic updates.
3. **Universality**: Seamless experience across Desktop (Browser) and Mobile (PWA).
4. **Data Ownership**: Self-hosted on Supabase free tier.

## 3. High-Level Features

### 3.1. Task Organization

- NLP-powered smart capture.
- **Multi-project support with color coding.**
- Infinite hierarchical nesting.
- Markdown support for deep notes.

### 3.2. Custom Calendar

- Visual time-blocking and planning.
- Multiple views: Year overview to minute-by-minute Day grid.
- Integrated task visualization (due-date based).

### 3.3. Focus Mode

- Distraction-free immersive environment.
- Cloud-synced Pomodoro timer.
- Automated session logging to Stats dashboard.

### 3.4. Analytics

- Bento Grid dashboard for focus trends.
- Task velocity and completion tracking.

## 4. UI/UX Standards

- No visual clutter (flat design, subtle borders).
- App-native feel on mobile (Safe area support, touch targets).
- Full system theme support (Light/Dark/System).
- Instant feedback via `LoaderOverlay` and micro-animations.
