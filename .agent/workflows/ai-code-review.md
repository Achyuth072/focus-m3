---
description: Two-agent code review - OpenCode analyzes (free), Gemini fixes (Pro)
---

// turbo-all

This workflow uses BOTH agents strategically:

- **OpenCode**: `opencode/glm-4.7-free` (best free - analysis)
- **Gemini**: `gemini-3-flash-preview` (fast, good for coding - fixes)

---

1. **Ask the user** for the file or directory to review.

2. **Run lint check first** to catch obvious issues:

   - Run `npm run lint -- [TARGET_PATH]`

3. **Invoke OpenCode (Free)** for initial analysis:

   - Run `opencode -m opencode/glm-4.7-free "Analyze this code for: 1) Potential bugs 2) Performance issues 3) Code smell 4) Missing error handling. Be specific about line numbers." --file "[TARGET_PATH]" > .agent/temp/review-issues.txt`

4. **Read the analysis results** from the temp file.

5. **Ask the user** if they want to auto-fix the issues found using Gemini.

6. **If approved, invoke Gemini** to fix the identified issues:

   - Run `gemini -m gemini-3-flash-preview -p "Fix the following issues in [TARGET_PATH]: $(cat .agent/temp/review-issues.txt). Follow SPARC principles."`

7. **Run tests** to ensure fixes didn't break anything:

   - Run `npm run test -- --run`

8. **Cleanup** the temp file:

   - Run `del .agent\temp\review-issues.txt`

9. **Summarize** what was found and fixed.
