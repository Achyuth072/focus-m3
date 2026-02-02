# Calendar Visual Alignment Audit

**Date:** 2026-01-29
**Scope:** `YearView`, `MonthView`, `TimeGrid`, `ScheduleView`
**Standard:** `docs/DESIGN_SYSTEMV2.md`

## Executive Summary

The visual audit reveals a **significant divergence** between the "Structure" guidelines in the Design System and the actual code implementation. While the "Ma" (negative space) philosophy is respected, the "Border (Structure)" visibility is critically compromised in the `MonthView` and `TimeGrid` components due to excessive opacity reduction (6-8%), making separators nearly invisible in contrast to the specified "High Visibility" pencil lines.

## Detailed Findings

### 1. Design System Specs vs. Implementation

- **Spec**: `border-border` should be `#CCCCCC` (Light) / `#424242` (Dark).
- **Spec**: "Internal padding... calibrated to 12px". "The Separator: 8px".
- **Spec**: "Primary task containers use `border-border/80`".

### 2. Component Analysis

#### `TimeGrid.tsx` (Critical Issues)

- **Hour Lines**: Uses `border-border/[0.06]` (6% opacity).
  - _Impact_: Virtual invisibility. Fails "Structure" requirement.
- **Day Separators**: Uses `divide-border/[0.08]` (8% opacity).
- **Time Label Column**: Uses `border-border/5` (5% opacity).
- **Day Header**: Uses `border-border/10` (10% opacity).
- _Verdict_: **Misaligned**. The usage of single-digit opacity values contradicts the "Ink & Bone" and "Structure" principles which call for decisive, high-contrast definitions (e.g., `border-border/80` or solid `#CCCCCC`).

#### `MonthView.tsx` (Major Issues)

- **Grid Lines**: Uses `divide-border/[0.08]` and `border-border/[0.08]`.
- **Headers**: Uses `border-border/40`.
- _Verdict_: **Misaligned**. Similar to TimeGrid, the grid lines are too subtle to function as effective "Structure" for a month view.

#### `ScheduleView.tsx` (Minor Issues)

- **Day Header**: Uses `border-border/10`.
- _Verdict_: **Acceptable but subtle**. The sticky header visual separation relies heavily on backdrop blur (`bg-background/95`) rather than the border itself.

#### `YearView.tsx` (Aligned)

- **Separation**: Relies on `gap-x-8 gap-y-8` (Whitespace).
- _Verdict_: **Aligned**. Correctly implements "Ma (Active Void)" by using whitespace instead of borders for high-level grouping.

## Recommendations

1.  **Normalize Opacity**:
    - Increase `TimeGrid` and `MonthView` structural borders from `~5-8%` to at least `40-50%` (match `MonthView` header) or `80%` (Card Density spec) if a hard grid is desired.
    - Recommended Design Token: `border-border/40` for secondary dividers, `border-border` or `border-border/80` for primary axis lines.

2.  **Define Calendar Token**:
    - Create a specific utility or constant for grid lines (e.g., `const GRID_BORDER = "border-border/40"`) to ensure consistency across Day, Week, and Month views.

## File-Specific Action Items

- **src/components/calendar/TimeGrid.tsx**:
  - Update Hour separator (`border-t`) opacity.
  - Update Day separator (`divide-x`) opacity.
- **src/components/calendar/MonthView.tsx**:
  - Update Grid separator (`divide-x`, `divide-y`) opacity.
