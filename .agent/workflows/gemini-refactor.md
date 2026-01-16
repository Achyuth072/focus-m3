---
description: Use Gemini Pro for complex architectural refactoring tasks
---

**Model**: `gemini-3-pro-preview` (best for complex reasoning & architecture)

1. **Ask the user** for:

   - The file or directory path to refactor.
   - The refactoring goal (e.g., "extract repeated logic into a custom hook", "convert to TypeScript generics").

2. **Read the existing code** to understand the current implementation.

3. **Create a backup reference** by noting the original structure.

4. **Invoke Gemini CLI Pro** to perform the refactor:
   // turbo

   - Run `gemini -m gemini-3-pro-preview -p "Refactor [TARGET_PATH]. Goal: [REFACTORING_GOAL]. Follow SPARC architecture (small, pure, atomic, reactive, composable). Ensure files stay under 500 LOC."`

5. **Run type checking** to ensure no regressions:
   // turbo

   - Run `npx tsc --noEmit`

6. **Run lint and tests** to validate the refactor:
   // turbo

   - Run `npm run lint`
     // turbo
   - Run `npm run test -- --run`

7. **Summarize changes** to the user:
   - List files modified.
   - Highlight any new files or extracted components.
