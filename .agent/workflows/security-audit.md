---
description: Audit code for security vulnerabilities
---

# Security Audit Workflow

Follow this workflow to identify and fix security vulnerabilities in the codebase.

## 1. Scope Analysis

- [ ] **Identify Sensitive Data**: PII, Auth Tokens, API Keys.
- [ ] **Identify Entry Points**: User Inputs, API Responses, URL Parameters.

## 2. Dependency Audit

- [ ] **Check Updates**: Run `flutter pub outdated` to find packages that are behind the latest version.
- [ ] **Check Vulnerabilities**: Check for known CVEs in your dependencies.
  - Review `pubspec.lock` against known advisory databases (e.g., GitHub Security Advisories).
- [ ] **Upgrade Safe**: Run `flutter pub upgrade` to update to the latest compatible versions (non-breaking).
- [ ] **Major Upgrades**: For major version updates (breaking changes), plan a separate refactor task.

## 3. Vulnerability Checklist

- [ ] **Injection**: SQL (Firestore is mostly safe, but check raw queries), Command Injection.
- [ ] **Auth & Session**: Hardcoded credentials, insecure storage of tokens.
- [ ] **Data Validation**: Is input sanitized? Are types checked?
- [ ] **Logic Flaws**: Can a user bypass a step? (e.g., skip payment, access admin route).

## 4. Remediation

- [ ] **Report**: Rate issues (Critical/High/Medium/Low).
- [ ] **Fix**: Provide specific code blocks to resolve the issue.
- [ ] **Verify**: Explain how to verify the fix (e.g., "Try keeping the input empty and see if it crashes").
