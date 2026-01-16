# ==============================================================================
# AI Agent Hub - Automation Script for FocusM3 (PowerShell)
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

param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("fix", "explain", "refactor", "test")]
    [string]$Mode,

    [Parameter(Mandatory = $true)]
    [string]$File,

    [Parameter(Mandatory = $false)]
    [string]$Prompt = ""
)

# Check if file exists
if (-not (Test-Path $File)) {
    Write-Host "Error: File '$File' not found." -ForegroundColor Red
    return
}

switch ($Mode) {
    "fix" {
        Write-Host "🚀 Gemini (flash): Fixing $File..." -ForegroundColor Green
        gemini -m gemini-3-flash-preview -p "Analyze $File and fix: $Prompt. Apply changes directly."
    }
    "explain" {
        Write-Host "🆓 OpenCode (glm-4.7): Explaining $File..." -ForegroundColor Blue
        opencode -m "opencode/glm-4.7-free" "Explain the logic and potential edge cases of this file: $Prompt" --file "$File"
    }
    "refactor" {
        Write-Host "🚀 Gemini (pro): Refactoring $File..." -ForegroundColor Green
        gemini -m gemini-3-pro-preview -p "Refactor $File. Goal: $Prompt. Ensure it follows SPARC architecture principles."
    }
    "test" {
        Write-Host "🆓 OpenCode (minimax): Generating tests for $File..." -ForegroundColor Blue
        opencode -m "opencode/minimax-m2.1-free" "Generate Vitest unit tests for the functions in this file. $Prompt" --file "$File"
    }
}

Write-Host "`n✔ Task complete!" -ForegroundColor Green
