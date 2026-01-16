#!/bin/bash

# ==============================================================================
# AI Agent Hub - Automation Script for FocusM3
# Wrapper for Gemini CLI (Pro) and OpenCode CLI (Free)
# ==============================================================================
#
# Model Reference:
# ----------------
# OpenCode Free Models:
#   - opencode/glm-4.7-free      (BEST - use for analysis/explanation)
#   - opencode/minimax-m2.1-free (BETTER - use for code generation)
#   - opencode/big-pickle        (basic)
#   - opencode/gpt-5-nano        (basic)
#   - opencode/grok-code         (basic)
#
# Gemini Pro Models:
#   - gemini-3-pro-preview       (BEST - complex reasoning/architecture)
#   - gemini-3-flash-preview     (BEST for coding - fast + accurate)
#   - gemini-2.5-pro             (BETTER alternative)
#   - gemini-2.5-flash           (lighter)
#   - gemini-2.5-flash-lite      (lightest)
#
# ==============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper for showing usage
usage() {
    echo -e "${BLUE}Usage:${NC} $0 [mode] [file] \"[prompt]\""
    echo ""
    echo -e "${YELLOW}Modes:${NC}"
    echo -e "  fix      - Use Gemini (flash) to fix bugs/lint in a file."
    echo -e "  explain  - Use OpenCode (glm-4.7-free) to explain code complexity."
    echo -e "  refactor - Use Gemini (pro) for complex architectural changes."
    echo -e "  test     - Use OpenCode (minimax) to generate unit test boilerplate."
    echo ""
    echo -e "${YELLOW}Example:${NC}"
    echo -e "  $0 fix src/components/Button.tsx \"Fix the hydration mismatch\""
    exit 1
}

# Check arguments
if [ "$#" -lt 2 ]; then
    usage
fi

MODE=$1
FILE=$2
PROMPT=$3

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}Error:${NC} File '$FILE' not found."
    exit 1
fi

case $MODE in
    fix)
        echo -e "${GREEN}🚀 Gemini (flash):${NC} Fixing $FILE..."
        gemini -m gemini-3-flash-preview -p "Analyze $FILE and fix: $PROMPT. Apply changes directly."
        ;;
    
    explain)
        echo -e "${BLUE}🆓 OpenCode (glm-4.7):${NC} Explaining $FILE..."
        opencode -m opencode/glm-4.7-free "Explain the logic and potential edge cases of this file: $PROMPT" --file "$FILE"
        ;;
    
    refactor)
        echo -e "${GREEN}🚀 Gemini (pro):${NC} Refactoring $FILE..."
        gemini -m gemini-3-pro-preview -p "Refactor $FILE. Goal: $PROMPT. Ensure it follows SPARC architecture principles."
        ;;
    
    test)
        echo -e "${BLUE}🆓 OpenCode (minimax):${NC} Generating tests for $FILE..."
        opencode -m opencode/minimax-m2.1-free "Generate Vitest unit tests for the functions in this file. $PROMPT" --file "$FILE"
        ;;
    
    *)
        echo -e "${RED}Unknown mode:${NC} $MODE"
        usage
        ;;
esac

echo -e "\n${GREEN}✔ Task complete!${NC}"
