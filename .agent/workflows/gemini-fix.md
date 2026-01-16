---
description: Use Gemini Pro to intelligently fix bugs or lint errors in a file
---

**Model**: `gemini-3-flash-preview` (best for general coding - fast + accurate)

1. **Ask the user** for the file path they want to fix, and a brief description of the problem (e.g., "hydration mismatch on mobile").

2. **Open the file** and read its contents to understand the current state.

3. **Invoke Gemini CLI** to analyze and fix the issue:
   // turbo

   - Run `gemini -m gemini-3-flash-preview -p "Analyze the file at [FILE_PATH] and fix: [PROBLEM_DESCRIPTION]. Apply changes directly following SPARC architecture principles."`

4. **Verify the fix** by running lint:
   // turbo

   - Run `npm run lint -- --fix`

5. **Report the outcome** to the user:
   - If successful, summarize what was changed.
   - If there were issues, explain what Gemini attempted.
