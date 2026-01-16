# Kanso Roadmap

This document outlines future enhancements and features planned for Kanso.

---

## Immediate Priorities

### Performance & Resilience

- [x] **Data Offline Support**: Enhance TanStack Query configurations for robust offline-first task management.
- [x] **App Offline (Service Worker)**: Implement `next-pwa` service worker to cache app shell for full offline access.
- [x] **Performance**: Optimise calendar grid rendering for high event density.

---

## Near-Term (UX & Core Polish)

### Task Management Refinements

- [x] **Delete Confirmation**: Add a safety dialog before permanently deleting tasks.
- [x] **Completed Tasks View**: A responsive modal/drawer to browse, manage, and clear archived tasks.
- [x] **Desktop Navigation**: Contextual "Completed" button in page header instead of sidebar.
- [x] **Real-time Stats**: Automatic synchronization between task completion and the stats dashboard.
- [x] **Sorting & Filtering**: Dynamic sorting by due date, priority, or custom order.
- [x] **Drag & Drop Reordering**: Native mouse and touch-based dragging to arrange tasks in custom order (dnd-kit with activation constraints to avoid swipe conflicts).
- [x] **Subtask Hierarchy**: Enhanced UI for expanding/collapsing subtasks within the main task list.
- [x] **Markdown Support**: Rich text rendering for task descriptions.
- [x] **"Do Date" vs "Due Date"**: Separate scheduling (when to work on it) from deadlines (Things 3-style).
- [x] **This Evening Section**: Tasks deferred to later today, auto-cleared at midnight.
- [x] **Logbook**: Searchable archive of all completed tasks for reflection.
- [x] **Project/Context Tags**: Organize tasks by projects or life areas (Work, Study, Personal, Relax, Health, etc.) with color-coded labels and dedicated views.
- [x] **Keyboard-First Navigation**: Global hotkeys for every action, minimizing mouse usage (Linear-style).

### Focus & Time Tracking

- [x] **Task-Specific Focus**: Add a "Play" button to any task to start a focus session specifically for that item, automatically updating the timer's context to the task name.
- [x] **Picture-in-Picture Mode**: Use Document Picture-in-Picture API to keep the timer visible over other windows (Desktop Web).
- [ ] **Windows 11 Widgets**: Dedicated PWA-driven adaptive cards for the Windows Widget board.

### Precision Interaction Design

- [x] **Precision Time Picker (Infinite Drum)**:
  - [x] **Looping Scroll**: Implement a robust 3-buffer infinite scroll for hours and minutes to allow seamless wrap-around selection.
  - [x] **Ratchet Mechanics**: Transition to a physics-based scroll engine to ensure every "tick" feels tactile and stops exactly on the snap point without momentum skipping.
  - **Enhanced Haptic Feedback**: Context-aware vibration patterns that increase in intensity with scroll velocity, mimicking a high-end physical clock ratchet.

### Mobile Experience (PWA Core)

- [x] **Mobile Day View**: Add a dedicated, optimized "Day" view to the mobile interface for focused daily schedule management.
- [x] **Hybrid Mobile Navigation**: Balance quick access (Bottom Nav) with deep organization (Sidebar Projects).
- [x] **Native Gestures**:
  - [x] **Swipe Actions**: Implement `framer-motion` to support swipe-to-delete (left) and swipe-to-edit (right) with haptic feedback.
  - [x] **Universal Haptic Feedback**: Expand tactile response (`navigator.vibrate`) to all primary buttons and interactions on mobile (PWA).
  - [x] **Haptic Feedback Toggle**: Add settings option to disable haptics globally (Mobile-only UI).
  - [x] **Overscroll Control**: Use `overscroll-behavior-y: none` to prevent unwanted pull-to-refresh on specific containers.
  - [x] **Touch Feedback**: Add "Zen-Modernism" active states (scale + highlight) for high-fidelity tactile response.
- [x] **Scheduled Notifications**: Server-side infrastructure for Morning Briefings, Due Date alerts, and Timer completions. See [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) for details.

### Productivity OS (Speed & Flow)

- [x] **Recurring Tasks**: Weekly, daily, monthly, and custom recurrence patterns (e.g., "Every 2nd Tuesday").
- [ ] **Event Overflow**: Add "+X more" button with popover for calendar days with many events (Long Term).
- [x] **In-App Command Menu (Cmd+K)**: Rapid keyboard navigation within the application (Linear-style).
- [x] **Universal Share Target**: Register as a system share target to accept text/links from other apps (Working on Chrome/Edge Android via WebAPK).
- [x] **Quick Capture PWA**: A standalone, lightweight installable PWA solely for rapid task entry.

### Future Optimization: Layout & Density

- [x] **Responsive Card Grid (Masonry)**: Switch from single-column vertical list to a dynamic multi-column grid (1 col on Mobile, 2 on Tablet, 3 on Desktop) to utilize screen real estate effectively.
- [x] **Kanban View**: Optional "Board View" to organize tasks by Status, Priority, or Project columns.
- [ ] **Split View (Master-Detail)**: A 3-pane layout for power users (Sidebar | Task List | Selected Task Details) to reduce context switching.

---

## Medium-Term (Integrations & Ecosystem)

- [ ] **Google Calendar 2-Way Sync**: Bi-directional synchronization to reflect tasks as time-blocks in Google and view external events within the Kanso grid. (See [CALENDAR_SYNC_VIABILITY.md](./CALENDAR_SYNC_VIABILITY.md)).

---

## Technical Debt & Performance (Backlog)

- [x] **Dynamic Imports**: Lazy-load heavy overlays (Command Menu, Task Sheet, Shortcuts) and Settings components to reduce initial JS payload.
- [x] **Font Optimization**: Implemented `next/font/google` for Inter and JetBrains Mono with optimized loading (`swap`).
- [x] **Image Audit**: Verified static assets; maintained compatible PNGs for PWA icons.

---

## Long-Term (Growth & Retention)

### Wellness & Intelligence

- **Energy-Based Scheduling**: Tag tasks as "High/Low Energy" and have AI suggest them during peak/trough hours.
- **Spotify Focus Mix**: Control playback and track current "Deep Work" songs using Spotify Web API.
- **Focus Health Integration**: Sync focus minutes to Apple Health/Google Fit (via mobile wrappers).
- **Focus Music Library**: Built-in ambient sounds/lo-fi for deep work sessions (Web Audio API).
- **Guided Daily Planning Ritual**: Step-by-step morning routine to pick today's tasks (Sunsama-style).
- **Daily Shutdown Ritual**: End-of-day review prompting task rollover or completion.

- **Listen-While-Work**: Track Spotify/Apple Music listening patterns during deep work sessions.
- **Joyful UI/UX**: Playful animations, micro-interactions, and soundscapes for task completion (Amie-style).

- **Productivity AI Buddy**: Integrated assistant that reviews weekly patterns and suggests refined deep work slots.
- **Reflection Mode**: End-of-week prompt to log "What was learned?" during high-density focus sessions.

### Mastery System (The Journey)

- **Focus Tiers**: Visual subtle indicators of current focus depth (e.g., UI gets cleaner/darker as you focus longer).
- **Flow Score**: A calculated metric of _quality_ focus time (depth + duration), not just tasks check-off quantity.
- **Consistency Circles**: Minimalist geometric art that completes with daily practice (Zen Rings).
- **Milestone Gallery**: Beautiful, collectible "Art Cards" unlocked by milestones (e.g., "The Early Bird", "Deep Diver").
- **Visual Activity Heatmap**: GitHub-style consistency chart showing daily focus density. (See [HABIT_TRACKER_INTEGRATION.md](./HABIT_TRACKER_INTEGRATION.md) for import viability).
- **Mastery Progress**: Visualize the "10,000 Hour" journey per project/skill with a subtle, long-term progress bar.

### Resilience & Portability

- **Import/Export Backups**: Local JSON/CSV backups.
- **Cloud Backup Sync**: Automatic backup syncing with Dropbox, Google Drive, or personal S3 buckets.
- **Offline-First Enhancements**: Queue mutations when offline and sync on reconnect for total reliability.
- **Predictive Caching**: PWA engine that learns patterns to pre-cache content for instant offline access (2025 Trend).
- **Local File System Export**: Directly save and manage task backups via File System Access API.
- **Biometric Protection**: Use WebAuthn for secure, passwordless access to sensitive focus data.

---

## Deprioritized / Long-Term

### Mobile Native Shell (Capacitor)

_See `docs/CAPACITOR_PLAN.md` for full technical details._

- [ ] **Capacitor Integration**: Transition from PWA to native mobile app (iOS/Android) for haptics and better system integration.
- [ ] **Native Status Bar**: Immersive dark theme status bar matching the app background.
- [ ] **Deep Linking**: `kanso://` scheme for Supabase Auth redirects.
- [ ] **Haptics (Native)**: Extend PWA haptic logic to native iOS/Android haptic engines for deeper system integration. (Timer & UI haptics implemented in PWA).
- [ ] **Background Timer**: Use Local Notifications to keep focus timer "running" when app is backgrounded.
- **Home Screen Widgets**: Implement iOS/Android widgets via Capacitor once wrapped as a native app.

---

## Zen-Modernist Overhaul (Kanso) ✅

- [x] **Desktop Sidebar**: Implemented collapsible inline sidebar with matte aesthetics and resizable width (12rem default).
- [x] **Mobile Navigation**: Overhauled bottom navbar and top header with `bg-sidebar` (matte) and tactile feedback.
- [x] **Interaction Design**: Integrated "Hover Reveal" for desktop task actions and native "Swipe" for mobile.
- [x] **Focus Mode**: Refined "Subtraction" logic to remove all chrome for absolute deep work.

---

## Completed ✅

- [x] Phase 1: Foundation & Auth
- [x] Phase 2: Core Task System
- [x] Phase 3: Focus & Transitions
- [x] Phase 4: Custom Calendar & Stats
- [x] Phase 5: Polish & UX
- [x] Phase 5.3: Mobile Polish
- [x] Phase 6: Cleanup & Hardening
- [x] Phase 7: Offline & PWA (Serwist)
- [x] Phase 8: UX Refinements (Completed Modal, Desktop Polish, Stats Sync)
- [x] Phase 9: Task Management Enhancements (Sorting, Grouping, Subtasks, Markdown)
- [x] Phase 10: Polish & Optimization (Flicker Fixes, Tree View, Visibility Audit)
- [x] Phase 11: Mobile Experience (Mobile Day View)
- [x] Phase 12: Project Organization (Multi-project support, coloring, sidebar integration)
- [x] Phase 13: Layout & Polish (Hybrid Mobile Nav, Collapsible Projects, Visual Bug Fixes)
- [x] Phase 14: Mobile UX (Date/Time Wizard, Scroll-to-Select, UX Polish)
- [x] Phase 15: Codebase Hygiene (AI slop removal, Comment scrubbing, Performance Audit)
- [x] Phase 16: Responsive Date Picker UX (Stacked Drawers, ResponsiveDialog hybrid)
- [x] Phase 17: UX Polish & Data Sync Hardening (FAB stability, Calendar/Stats instant sync)
- [x] Phase 18: Code Architecture (TaskSheet Decomposition, Scroll Hardening)
- [x] Phase 19: Security Hardening (Zod schema architecture, Advanced RLS audit)
- [x] Phase 20: Zen-Modernist Overhaul (Kanso)
- [x] Phase 21: Native PWA Interactions (Swipe, Drag-and-Drop, Haptics)
- [x] Phase 22: Recurring Tasks & UI Polish (Clone-on-complete, Pill-style Calendar, Mobile layout)
- [x] Phase 23: Speed & Command Architecture (Cmd+K, Share Target, Performance)
- [x] Phase 24: Advanced Scheduling & Focus (Do Date, This Evening, Task Play)
- [x] Phase 25: Mobile Haptics & Polish (Keyboard Nav, Haptics, Logbook)
- [x] Phase 26: Development Hiatus (Refinement, Performance & Hygiene)
- [x] Phase 27: Guest Mode (Demo Experience, Persistence, UI Polish)
- [x] Phase 28: Zen-Modernist Evolution (UI Polish, High-Contrast Command Menu, Shortcuts Layout)
- [x] Phase 29: Technical Debt & Performance (Fonts, Dynamic Imports, Lint Hardening)
- [x] Phase 30: Zen-Modernist Layouts & Density (Grid, Kanban, Performance Optimization)
- [x] Phase 31: Zen-Modernist Refinement & Spacing (List layout, spacing calibration, iconography)
- [x] Phase 32: Mobile Haptics Standardization (Zen-Modernism \"Seijaku\" specs, Unit Testing)
- [x] Phase 33: Push Notification Resilience (Turbopack Handlers, DB Constraint Hardening, Loading UI)
- [x] Phase 34: Scheduled Notifications Implementation (pg_cron, User Preferences, Timezone Logic)
- [ ] Phase Later: Multi-Platform (Capacitor Native Shell)
