---
description: Use OpenCode (free tier) to explain complex code logic and edge cases
---

**Model**: `opencode/glm-4.7-free` (best free model for analysis)

1. **Ask the user** for:

   - The file path they want explained.
   - Any specific focus area (e.g., "the state machine logic", "the effect cleanup").

2. **Read the target file** to understand its structure.

3. **Invoke OpenCode with the best free model** to generate the explanation:
   // turbo

   - Run `opencode -m opencode/glm-4.7-free "Explain the logic, data flow, and potential edge cases of this file. Focus on: [FOCUS_AREA]" --file "[FILE_PATH]"`

4. **Present the explanation** to the user in a formatted way:
   - Summary of what the code does.
   - Key functions/exports and their purposes.
   - Potential edge cases or gotchas.
   - Suggestions for improvement (if any).

**Note**: This uses OpenCode's best free model (`glm-4.7-free`) to save your Gemini Pro quota.
