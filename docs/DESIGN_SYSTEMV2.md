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

- **Primary (Sans/Bone)**: `Inter`. Used for UI controls, navigation, and structural labels.
- **Secondary (Serif/Ink)**: `Libre Baskerville`. Used for editorial emphasis, greetings, timers, and "authored" content.
- **Tertiary (Mono/Code)**: `JetBrains Mono`. Used for technical metadata, counters, time display, and tabular data.

### The Trio Logic

- **Editorial (Serif)**: Low-case, bold, italic. Feels like an "inked" thought.
- **Structural (Sans)**: Clear, accessible, neutral. The "bone" of the app.
- **Instrumental (Mono)**: Precise, fixed-width. The "scale" of the data.

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
  - primary: `#2E2E2E` (Ink) / `#EDEDED` (White Ink)
  - secondary: `#2E2E2E` with 70% opacity (diluted).
  - tertiary: `#2E2E2E` with 40% opacity (heavy wash).
- **Border (Structure)**:
  - subtle: `#EBEBEB` (Light) / `#333333` (Dark)
  - heavy: `#2E2E2E` (Ink Border, used for inputs/cards).

### The "Accent" (Zen Focus)

We use a single key color for **active focus states only**.

- **Kanso Blue/Indigo**: `#4B6CB7` (or similar deep, calm indigo).
- _Usage_: Checkboxes, active toggles, primary buttons. Never for backgrounds.

## 4. Visual Language: Shodo & Ma

### Iconography (Shodo Style)

Icons should feel like distinct stamps or brush marks, not wireframes.

- **Stroke Width**: `2.25px` (Mandatory).
- **Style**: Geometric, open, crisp. No fills unless active.
- **Size**: `20px` optical size.
- **Color**: Always `text-foreground` (Ink).

### Spacing (Ma)

Use a strict 4px grid, but lean on larger gaps (32px, 64px) to separate distinct philosophical sections.

- **The Breath**: 64px (Section breaks).
- **The Pause**: 32px (Component groups).
- **The Step**: 16px (List items).
- **The Touch**: 8px (Internal padding).

## 5. Interaction Physics: Seijaku

Motion conveys the "soul" of the software.

### The Spring (Seijaku)

Everything moves with physical weight. "Energized Calm."

- **Config**: `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Duration**: `300ms` (standard).
- **Active State**: Buttons scale to `0.98` on press ("Dampened Spring").

### The Ratchet (Haptics)

We emulate mechanical precision.

- **Scroll/Pickers**: Sharp, short ticks (5-10ms).
- **Success**: A resonant "thud" (heavy impact).
- **Error**: A double-tap "stutter".

## 6. Component Specs

### Buttons

- **Primary**: Solid Ink background, White text. Rounded squares (`rounded-lg`).
- **Secondary**: 1px Border (Washi), Ink text.
- **Ghost**: No background, Ink text. Hover reveals `bg-sidebar`.

### The K-Card (Tasks)

- **Desktop**: Compact row. Data aligns to a rigid grid.
- **Mobile**: Taller row. Slide interactions reveal actions (Shodo icons).
- **Feedback**: Clicking a task feels like marking paper (instant, permanent).

### Spatial Layouts (Density)

To accommodate different cognitive loads, we use three distinct spatial modes:

1. **List (Focus)**: Single-column vertical stack. Maximizes Ma (negative space) for deep focus on one item at a time.
2. **Masonry Grid (Synthesis)**: Multi-column chronological flow. Allows for visual scanning and pattern recognition across many tasks.
3. **Kanban Board (Strategy)**: Rigid column-based grouping. Best for project management and architectural planning.

## 8. Implementation Patterns

### The Floating Thought (Modals & Command Menu)

The overlay should feel like a light veil over the interface.

- **Backdrop**: Heavy blur (`backdrop-blur-md`) with high transparency.
- **Contrast**: Selected items must use `!text-foreground` (bold) against a `bg-foreground/15` pill to ensure absolute focus.
- **Typography**: Header titles in bold Serif lowercase (e.g., "search...").

### The Ink Sketch (Charts & Statistics)

Data visualization should feel hand-drawn on paper.

- **Lines**: Stroke width of 2.5px. No "dots" on the line unless focused.
- **Ma**: Remove background grids (`CartesianGrid`). Depth comes from the line shape itself.
- **Values**: Metric headers in Serif; large values in bold Serif "stamped" look; percentages in Mono.

### The Stamp (Calendar)

The calendar is a grid of stamps, not buttons.

- **Selection**: Hard square corners (`rounded-none`). A selected date is a solid block of ink.
- **Today**: Represented by a soft secondary background and a primary underline.
- **Grid**: Dividers are whisper-thin (`border-border/10`) to prioritize visual whitespace.

---

_"Simplicity is the ultimate sophistication."_
