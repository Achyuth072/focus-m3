# Testing Strategy & Guide

This document outlines the testing infrastructure and best practices for the Kanso project. We use **Vitest** + **React Testing Library** for unit/integration tests and **Playwright** for End-to-End (E2E) testing.

## 1. Quick Start

Run the test suites:

```bash
# Run unit tests (Vitest)
npm test

# Run unit tests in watch mode
npx vitest

# Run unit tests with coverage
npx vitest run --coverage

# Run E2E tests (Playwright)
npm run e2e

# Run E2E tests with UI runner
npx playwright test --ui
```

## 2. Infrastructure

### Unit & Integration

- **Directory**: `tests/unit/`
- **Runner**: [Vitest](https://vitest.dev/)
- **Environment**: `jsdom` (simulates browser)
- **Setup**: `tests/unit/setup.ts` loads global mocks (matchMedia, IntersectionObserver).

### End-to-End (E2E)

- **Directory**: `tests/e2e/`
- **Runner**: [Playwright](https://playwright.dev/)
- **Browser**: Chromium (default)

## 3. What to Test

### ✅ DO Test:

1.  **Utilities (`src/lib/*.ts`)**: Pure functions (formatting, sorting, logic) are high-value targets.
2.  **Complex Hooks**: Custom hooks with significant logic state (e.g., `useFocusTimer`).
3.  **Critical Components**: Components with complex interactions or conditional rendering (e.g., `TaskItem`).
4.  **Core User Flows**: Critical paths like "Create Task" or "Change Settings" via E2E tests.

### ❌ DON'T Test:

1.  **Implementation Details**: Don't test internal state names or ref current values. Test _user-visible_ changes.
2.  **Simple UI**: Static components (like buttons or icons) usually don't need tests.
3.  **Third-Party Libraries**: Trust that `date-fns` or `radix-ui` works. Test _your usage_ of them.

## 4. Writing Tests

### Unit Test Example (`tests/unit/lib/utils.test.ts`)

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges classes correctly", () => {
    const result = cn("p-4", "p-2");
    expect(result).toContain("p-2"); // Tailwind merge logic
  });
});
```

### Component Test Example (`tests/unit/components/TaskItem.test.tsx`)

```typescript
import { render, screen } from "@testing-library/react";
import { TaskItem } from "@/components/tasks/TaskItem";

it("renders task content", () => {
  render(<TaskItem task={mockTask} />);
  expect(screen.getByText("Buy Milk")).toBeInTheDocument();
});
```

## 5. Mocks & Stubs

Global mocks are configured in `tests/unit/setup.ts`. If you need to mock a library (e.g., Supabase) for a specific test file:

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ select: vi.fn() })),
  })),
}));
```

## 6. Coverage Goals

We aim for **high confidence**, not 100% coverage. Focus on logic-heavy paths and critical user flows (Auth, Task Creation).
