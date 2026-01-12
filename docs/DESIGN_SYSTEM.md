# Design System (Legacy)

> [!IMPORTANT] > **This document is LEGACY.**
>
> The Kanso design system has evolved from "Canvas Minimal (M3-style)" into **Zen-Modernism**.
> Please refer to the authoritative source: **[DESIGN_SYSTEMV2.md](file:///e:/Code/focusm3/docs/DESIGN_SYSTEMV2.md)**.
>
> ---
>
> _The following content is preserved for historical reference only._

_"The interface disappears. The content adapts."_

This design system replicates the **Notion-meets-Linear aesthetic**—utilitarian, document-first, matte textures—strictly defined for **Desktop (Density & Hover)** and **Mobile (Touch & Focus)**.

## 1. Core Philosophy

- **Content First, Chrome Last**: The UI should be unobtrusive.
- **Digital Paper**: Surfaces are matte. No glassmorphism. Depth is conveyed via borders (#E9E9E7/#2F2F2F), not shadows.
- **Adaptive Density**:
  - **Desktop**: High density. Relies on _Hover_ to reveal complexity (e.g., "Edit" buttons only appear when you mouse over a task).
  - **Mobile**: Low density. Relies on _Touch_ and _Gestures_. No hidden hover states; actions must be explicit or tucked behind a menu.
- **Premium Constraints**:
  - **No Emojis as Icons**: Use SVG icons (Lucide/Heroicons) only.
  - **No Color Blooms**: Use distinct, functional colors.
  - **Cursor Logic**: `cursor-pointer` on _everything_ interactive.

## 2. Typography (System Native)

We use the OS native stack to feel "at home" on any device, tuned for maximum legibility.

### Font Stack

- **Sans**: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roberta", sans-serif`
- **Serif**: `"Lyon-Text", "Georgia", serif` (Optional for headers/reading modes)
- **Mono**: `"SFMono-Regular", "Menlo", "JetBrains Mono", monospace` (For code/IDs)

### Responsive Scale

| Element   | Desktop Size | Mobile Size | Weight   | Tracking        |
| :-------- | :----------- | :---------- | :------- | :-------------- |
| **H1**    | 32px         | 28px        | Semibold | Tight (-0.02em) |
| **H2**    | 24px         | 22px        | Semibold | Tight (-0.01em) |
| **Body**  | 16px         | 16px\*      | Regular  | Normal          |
| **Label** | 12px         | 13px        | Medium   | Wide (0.02em)   |

_> **Note:** Mobile body text must never drop below 16px to prevent iOS auto-zoom._

## 3. Color System (Matte Neutrals)

### Structure

- **Light Mode**:
  - `bg-background`: `#FFFFFF`
  - `bg-sidebar`: `#F7F7F5` (Warm Grey)
  - `border-subtle`: `#E9E9E7`
  - `text-primary`: `#37352F`
  - `text-secondary`: `#787774`
- **Dark Mode**:
  - `bg-background`: `#191919`
  - `bg-sidebar`: `#202020`
  - `border-subtle`: `#2F2F2F`
  - `text-primary`: `#D4D4D4`
  - `text-secondary`: `#9B9B9B`

### Semantic Pastels (Tags/Highlights)

Use these for tags. Never for buttons.

- **Red**: `bg-red-100/50 text-red-700` (Dark: `bg-red-900/30 text-red-300`)
- **Blue**: `bg-blue-100/50 text-blue-700` (Dark: `bg-blue-900/30 text-blue-300`)
- **Green**: `bg-green-100/50 text-green-700` (Dark: `bg-green-900/30 text-green-300`)

## 4. Layout & Navigation Patterns

### Desktop (The Workspace)

- **Navigation**: Collapsible **Left Sidebar**.
  - _Width_: Resizable (240px default).
  - _Interaction_: Hovering near the edge reveals the toggle.
- **Layout**: Multi-column support (Masonry/Grid).
  - _Stats Dashboard_: Top-level summary view.
  - _Task Board_: Main working area.
- **Modals**: Centered Dialogs (`max-w-lg`) with backdrop blur (low opacity).

### Mobile (The App)

- **Navigation**: Fixed **Bottom Navigation Bar**.
  - _Height_: 60px + Safe Area.
  - _Style_: Matte background with top border. No glass blur.
  - _Items_: Tasks, Calendar, Focus.
- **Layout**: Single column stack.
- **Modals**: **Bottom Sheets** (Drawers) only via `vaul`. Never center modals.

## 5. Component Standards

### Buttons & Actions

- **Desktop (Ghost)**: Transparent, turns grey on hover.
  - `hover:bg-[#EFEFEF] rounded-sm h-7 px-2 text-sm transition-colors duration-200`
- **Mobile (Tactile)**: Large hit areas (>44px).
  - `h-10 px-4 rounded-md bg-secondary/50 active:scale-95 transition-transform`
- **FAB (Floating Action Button)**:
  - _Desktop_: Hidden (Shortcuts `C` preferred).
  - _Mobile_: Bottom right, `rounded-xl`, solid primary.

### Task Items (The Core)

- **Desktop**:
  - Compact row (28px-32px).
  - **Hover Reveal**: Edit/Delete icons invisible until hover.
  - **Drag Handle**: Visible on hover (six-dot grip).
- **Mobile**:
  - Taller row (44px min).
  - **Swipe Actions**: Left (Delete), Right (Edit).
  - **Drag & Drop**: Long-press (250ms) to engage reordering.
  - **No Hover**: Essential info always visible.

### Calendar Grid

- **Desktop**: 7-Day / 4-Day / Month views. Events as small colored bars.
- **Mobile**: 3-Day or 1-Day view. Full-width blocks for readability.

## 6. Interaction & Motion

### Desktop

- **Trigger**: Hover & Click.
- **Feel**: Instant (0ms visual delay).
- **Transitions**: `duration-100 ease-out` (Opacity).

### Mobile

- **Trigger**: Tap, Swipe, & Long-press.
- **Feel**: Physical, Spring-based.
- **Transitions**: `duration-300 ease-[0.32,0.72,0,1]` (Spring).
- **Feedback**:
  - **Visual**: `active:scale-[0.98]` or `active:bg-secondary/20` mandatory for touch.
  - **Haptic**: `navigator.vibrate(50)` on swipe threshold crossing and drag engagement.

## 7. Analytics & Stats (New)

- **Layout**: Grid of Cards (`1x1` or `2x1`).
- **Charts**:
  - _Trend_: Line chart, minimal axes, muted stroke colors.
  - _Comparison_: Bar chart, rounded corners.
  - _KPIs_: Big numbers (`text-4xl`), small labels.
- **Palette**: Monochromatic or analogous colors (e.g., shades of grey + one accent).

## 8. Settings Patterns (New)

- **Structure**: Sidebar settings (Desktop) vs Stacked List (Mobile).
- **Elements**:
  - _Toggles_: Apple-style switches.
  - _Inputs_: Underlined or minimal grey background (`bg-secondary/30`).
  - _Sections_: Grouped by "Account", "Preferences", "System".

### Navigation Patterns

- **Command Menu (Palace)**:
  - **Hotkey**: `Cmd+K` or `Ctrl+K`.
  - **Structure**: Grouped by Actions, Navigation, Filters, Theme, and Projects.
  - **Looping**: Enabled for high-speed keyboard cycling.
- **Confirmation Patterns**:
  - **Destructive Actions**: Use `Dialog` (Desktop) or `Drawer` (Mobile).
  - **Sign Out**: Explicit confirmation required to prevent session loss.
- **Filter Indicators**:
  - **Chips**: Inline next to headers (e.g., date).
  - **Style**: Captatilized labels with a "•" separator and a tactile clear button (rotated plus icon).
- **Scheduling Icons**:
  - **Due Date (Deadline)**: Use `Calendar`.
  - **Start Date (Do Date)**: Use `CalendarClock`.
  - **Evening**: Use `Moon`.

## 9. Focus Mode (Zen)

- **Philosophy**: "Subtraction".
- **UI**: Remove Sidebar, Header, and unrelated Tasks.
- **Timer**: Central, large, minimal typeface (`Proportional` or `Mono`).
- **Action**: Single primary action ("Stop" or "Pause").
- **Background**: Dimmed or pure black (Dark Mode)/white (Light Mode).

## 10. Implementation Checklist

- [x] **Icons**: Are all icons SVG (Lucide)? No Emojis?
- [x] **Contrast**: Is text contrast > 4.5:1?
- [x] **Cursors**: Is `cursor-pointer` on all clickables?
- [x] **Mobile Touch**: Are targets 44px+?
- [x] **Hover**: Is `hover:` wrapped in `@media (hover: hover)`?
- [x] **Input Zoom**: Is font-size 16px on mobile inputs?
- [x] **Borders**: Are borders visible in both light/dark modes?
