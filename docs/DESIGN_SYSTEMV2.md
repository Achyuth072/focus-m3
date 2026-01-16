# Design System V2: Zen-Modernism (Kanso)

_"The void is not empty; it is full of possibility."_

This design system evolves "Canvas Minimal" into **Zen-Modernism**—a fusion of **Japanese Kanso** (simplicity) and **Swiss Modernism** (grid/type). It prioritizes **Ma** (negative space) and **Seijaku** (energized calm) over mere minimalism.

## 1. Core Philosophy

- **Kanso (Simplicity)**: If a feature or element doesn't aid focus, it is removed. No decoration.
- **Ma (Active Void)**: Whitespace is a functional component, not just a margin. It groups, separates, and highlights without borders.
- **Seijaku (Energized Calm)**: Interactions should feel damp and substantial (like a stone), not weightless.
- **Shodo (Ink & Bone)**: Iconography and typography should have the decisiveness of a calligraphy stroke—bold, deliberate, and high-contrast.

## 2. Typography: The Editorial Voice

We use system-native fonts but treated with "God-Tier" typesetting to evoke a premium editorial feel.

### Font Stack

- **Primary (Sans)**: `Inter` (Optimized via `next/font/google`). Fallbacks: `ui-sans-serif`, `-apple-system`, `BlinkMacSystemFont`.
- **Secondary (Mono)**: `JetBrains Mono` (Optimized via `next/font/google`). Fallbacks: `"SFMono-Regular"`, `"Menlo"`, `monospace`.

### Typescale (The Ratio)

We use tighter tracking for headings to give them a "stamped" look.

| Element      | Size | Weight   | Tracking | Line Height | Usage            |
| :----------- | :--- | :------- | :------- | :---------- | :--------------- |
| **H1**       | 32px | Semibold | -0.03em  | 1.1         | Page Titles      |
| **H2**       | 24px | Semibold | -0.02em  | 1.2         | Section Headers  |
| **H3**       | 18px | Medium   | -0.01em  | 1.3         | Card Headers     |
| **Body**     | 15px | Regular  | Normal   | 1.5         | Primary Content  |
| **Ui/Label** | 13px | Medium   | +0.01em  | 1.0         | Metadata, Tags   |
| **Micro**    | 11px | Regular  | +0.02em  | 1.0         | Helpers, Footers |

## 3. Color System: Matte & Ink

No gloss, no bloom. Surfaces are matte paper; ink is absolute.

### Structure

- **Paper (Surface)**:
  - light: `#FCFCFA` (Warm Washi) or `#FFFFFF` (Starch)
  - dark: `#1A1A1A` (Sumi Ink) or `#222222` (Charcoal)
- **Ink (Content)**:
  - primary: `#2E2E2E` / `#E5E5E5` (High contrast, but not #000)
  - secondary: `#757575` / `#A1A1A1` (Muted)
- **Border (Structure)**:
  - light: `#CCCCCC` (Pencil Line - High Visibility)
  - dark: `#424242` (Sumi Line - +30% Contrast)
  - _Card Density_: Primary task containers use `border-border/80` for tactile definition.

### The "Accent" (Zen Focus)

We use a single key color for **active focus states only**.

- **Kanso Blue/Indigo**: `#4B6CB7` (or similar deep, calm indigo).
- _Usage_: Checkboxes, active toggles, and "Active Focus" highlights. This includes the Calendar 'Today' indicator, Sidebar active items, Command Menu selection, and Active Tabs.
- _Metadata Unification_: All active metadata selectors (Due Date, Start Date, Evening, Subtasks, Recurrence) are unified to Kanso Blue. Semantic colors (Green/Purple) are removed to reduce visual noise and emphasize "Focus" over "Status."
- _Solid Actions_: High-value primary actions (Send/Save) use solid Kanso Blue backgrounds to signal a deliberate "finishing" stroke.

## 4. Visual Language: Shodo & Ma

### Iconography (Shodo Style)

Icons should feel like distinct stamps or brush marks.

- **Stroke Width**: 2px - 2.25px (Bolder than standard 1.5px). Expand/collapse toggles use **3px** for high structural visibility.
- **Style**: Geometric but distinct (Mihon/Tachiyomi vibe).
- **Size**: 20px optical size.

### Spacing (Ma)

Use a strict 4px grid, but lean on larger gaps (32px, 64px) to separate distinct philosophical sections.

- **The Breath**: 64px (Section breaks).
- **The Pause**: 32px (Component groups).
- **The Step**: 16px (List items).
- **The Separator**: 8px (Vertical gap between tasks in List view).
- **The Touch**: 8px (Internal padding). Internal vertical padding in List items is calibrated to **12px (py-3)** for optimal breathing room.

## 5. Interaction Physics: Seijaku

Motion conveys the "soul" of the software.

### The Spring (Dampened)

Everything moves with physical weight. No linear tweens.

- **Config**: `{ mass: 1, tension: 280, friction: 60 }` (Quick response, no bounce).
- **Feeling**: "Settles" immediately. Like placing a cup on a wooden table.

### The Ratchet (Haptic Palette)

We emulate mechanical precision. Use the `useHaptic` hook. Every interaction must draw from this three-tier palette:

- **Tick (10ms)**: Minimal tactile increment. Used for sliders, precision scrolls, and "step-out" actions (close/cancel).
- **Toggle (15ms)**: Distinct mechanical click. Used for navigation switches, sidebar tabs, and binary toggles (Switch/Checkbox).
- **Thud (50ms)**: Resonant, heavy impact. Used for major commitments (Save), destructive actions (Delete), and starting Focus sessions.
- **Success Signature ([10, 50])**: A high-velocity double-hit. A sharp tick followed immediately by a resonant thud. Reserved for primary task completion and successful creation.

## 6. Component Specs

### Buttons

- **Primary**: Solid Ink background, White text. Rounded squares (`rounded-lg`, 10px).
- **Secondary**: 1px Border (Washi), Ink text.
- **Ghost**: No background, Ink text. Hover reveals `bg-sidebar`.

### The K-Card (Tasks)

- **Desktop List**: Vertical stack layout (Title above Metadata). No fixed height (removed `h-10`) to allow content to breathe. Data aligns to a rigid vertical flow. Negative space > borders.
- **Mobile List**: Taller row (`py-3.5`). Slide interactions reveal actions. Indented separator lines emphasize "Ma."
- **Feedback**: Clicking a task feels like marking paper (instant, permanent).

## 7. View Hierarchy (The Zen Funnel)

The application follows a tripartite architectural hierarchy, starting with the simplest synthesis and narrowing down to deep focus.

### 7.1 Macro Layer (Grid) - The Synthesis (Simplest)

- **Purpose**: Rapid Scanning and Pattern Recognition.
- **Mental State**: The "Observer." A quick pulse-check of all tasks in a chronological flow.
- **Design**: High density, "Physical Card" masonry layout. No focus timers or subtask toggles.
- **Primary View**: Grid (Shift+1).

### 7.2 Macro Layer (Board) - The Strategy

- **Purpose**: Organization and Project Management.
- **Mental State**: The "Architect." High-level planning and cross-project coordination.
- **Design**: Columnar grouping, rigid grid-based card alignment.
- **Primary View**: Board (Shift+2).

### 7.3 Micro Layer (List) - The Execution

- **Purpose**: Sequence and Flow.
- **Mental State**: The "Manager." Deciding what to do _next_ in a specific sequence.
- **Design**: Low friction, expanded actionability. Includes subtask expansion and the Focus (Play) button.
- **Primary View**: List (Shift+3).

### 7.4 Atomic Layer (Task Sheet) - The Detail

- **Purpose**: Deep Definition.
- **Mental State**: The "Craftsman." Engaged in the internal components of a single piece of work.
- **Design**: Immersive detail. Drawer/Modal overlay that isolates the task for deep work on descriptions and subtasks.

## 8. Mobile & Haptics (Compliance)

### 8.1 Touch Targets

- **Minimum size**: 44x44px for all primary actions.
- **Inputs**: 16px base font size to prevent iOS zoom-on-focus regressions.

### 8.2 Haptic Strategy

Interactions must follow the **Seijaku Palette** (Section 5.3) to ensure a consistent physical identity across the PWA. Arbitrary values (e.g., 20ms, 40ms) are strictly prohibited.

- **Major Commitment**: 50ms (Thud).
- **Navigation/Toggle**: 15ms (Toggle).
- **Incremental/Tick**: 10ms (Tick).
- **Success Event**: [10, 50] (Signature).

## 9. Implementation Rules (The Guardrail)

1.  **No Shadows**: Depth is defined by borders (`border-border/80`) or slight contrast changes. Shadows are strictly prohibited for flat elements and reserved only for "floating" components (Modals/Popovers/FAB).
2.  **Ma (Negative Space)**: If the screen feels cramped, remove elements; do not shrink them.
3.  **Seijaku (Calm)**: Animations must be damp and intentional. Use `transition-seijaku` or `transition-seijaku-fast` only.
4.  **No Placeholders**: Never use text like "Click here." Use directional cues or clear labels.
5.  **Tactile Borders**: Use `border-border/80` for primary interactive containers (Cards) to provide definition without relying on shadows.
6.  **Haptic Verification**: All new haptic interactions must be verified via automated Vitest unit tests (asserting on `trigger` value) to prevent "haptic drift" and maintain the Zen-Modernism standard.

_"Simplicity is the ultimate sophistication."_
