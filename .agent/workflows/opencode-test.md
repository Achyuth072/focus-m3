---
description: Use OpenCode (free tier) to generate Vitest unit tests for a file
---

**Model**: `opencode/minimax-m2.1-free` (better at structured code generation)

1. **Ask the user** what they want to do:

   - **Option A**: Generate new tests for a specific file
   - **Option B**: Run all tests and analyze results
   - **Option C**: Run tests for a specific file and analyze results

2. **If Option A (Generate Tests)**:

   - Ask for the file path to generate tests for.
   - Ask for any specific test scenarios (optional).
   - Read the target file to understand its exports and logic.
   - Determine the test file path:
     - For `src/lib/hooks/useExample.ts` → `tests/unit/lib/hooks/useExample.test.ts`
     - For `src/components/Button.tsx` → `tests/unit/components/Button.test.tsx`
   - Invoke OpenCode to generate tests:
     // turbo
     - Run `opencode -m opencode/minimax-m2.1-free "Generate comprehensive Vitest unit tests for this file. Use describe/it blocks. Mock external dependencies. Test edge cases. [SPECIFIC_SCENARIOS]" --file "[FILE_PATH]"`
   - Create the test file with the generated content.
   - Run the tests to validate:
     // turbo
     - Run `npx vitest run [TEST_FILE_PATH]`

3. **If Option B (Run All Tests + Analyze)**:

   - Run the full test suite and capture output:
     // turbo
     - Run `npm test -- --run 2>&1 | tee .agent/temp/test-output.txt`
   - Invoke OpenCode to analyze results:
     // turbo
     - Run `opencode -m opencode/glm-4.7-free "Analyze these test results. Summarize: 1) Total passed/failed 2) Root cause of any failures 3) Suggested fixes for failing tests" --file ".agent/temp/test-output.txt"`
   - Cleanup temp file.

4. **If Option C (Run Specific Test + Analyze)**:

   - Ask for the test file path.
   - Run the specific test and capture output:
     // turbo
     - Run `npx vitest run [TEST_FILE_PATH] 2>&1 | tee .agent/temp/test-output.txt`
   - Invoke OpenCode to analyze results:
     // turbo
     - Run `opencode -m opencode/glm-4.7-free "Analyze these test results. Summarize: 1) Total passed/failed 2) Root cause of any failures 3) Suggested fixes for failing tests" --file ".agent/temp/test-output.txt"`
   - Cleanup temp file.

5. **Report results** to the user:
   - Tests passed: ✅ Show OpenCode's summary.
   - Tests failed: ❌ Show OpenCode's root cause analysis and fix suggestions.

**Note**: Uses free OpenCode models for both generation (`minimax`) and analysis (`glm-4.7`).
