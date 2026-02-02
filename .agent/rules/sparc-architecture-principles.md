---
trigger: always_on
---

# SPARC Architecture Principles

This project enforces **SPARC** (Small, Pure, Atomic, Reactive, Composable) architecture.

## 1. File Size Limits (The 500-Line Rule)

- **Soft Limit**: 300-500 LOC. Ideally, most components should fit here.
- **Hard Limit**: 800 LOC.
- **Action**: If a file approaches 800 lines, you **MUST** refactor it by extracting sub-components or logic hooks _before_ adding new features.
- **Exception**: UI Library definitions (e.g., `sidebar.tsx`, `shadcn` primitives) are exempt if they are monolithic by design.

## 2. Component Composition

- **Atomic**: Components should do one thing well.
- **Colocation**: Keep related styles, sub-components, and utils near their parent if they aren't reused globally.
- **Extraction**:
  - Extract complex `useEffect` or data transformation logic into custom hooks.
  - Extract render-heavy subsections into memoized chunks.

## 3. State Management

- **Server State**: Use TanStack Query (cached, async).
- **Client State**: Use Zustand (global, synchronous) or React State (local, ephemeral).
- **No Prop Drilling**: Use composition or Context/Zustand for deep state needs.

## 4. Performance First

- **Memoization**: Default to `React.memo` for list items and data-heavy grids.
- **Stability**: Always use `useCallback` for handlers passed to memoized children.
