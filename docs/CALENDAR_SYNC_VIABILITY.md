# Google Calendar 2-Way Sync: Viability Analysis

This document assesses the technical feasibility, complexity, and strategy for integrating Google Calendar (and other providers) into Kanso.

## 1. Viability Assessment

### ✅ What's Technically Feasible

| Aspect                  | Status     | Notes                                                                                              |
| ----------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| **Read Events**         | ✅ Easy    | Google Calendar API v3 provides straightforward `events.list()` endpoint.                          |
| **Write Events**        | ✅ Easy    | `events.insert()` / `events.update()` allows pushing tasks as time-blocks.                         |
| **OAuth 2.0**           | ✅ Ready   | Supabase Auth supports the Google provider and can request `calendar` scopes.                      |
| **Webhooks (Push)**     | ⚠️ Medium  | Google supports push notifications but requires a public HTTPS endpoint (Vercel serverless works). |
| **Conflict Resolution** | ⚠️ Complex | Requires a robust strategy (e.g., Last-Write-Wins) when an event is modified on both sides.        |

---

## 2. Implementation Complexity Levels

### Level 1: One-Way Sync (Kanso → Google)

_Low Effort (~2-3 Days)_

- **Mechanism**: Push Kanso tasks (with `do_date`) to a specific Google Calendar.
- **Pros**: Easy to implement; keeps the user's external calendar blocked out for focus work.
- **Cons**: Changes made in Google Calendar won't reflect back in Kanso.

### Level 2: One-Way Overlay (Google → Kanso)

_Medium Effort (~3-5 Days)_

- **Mechanism**: Fetch external events and render them visibly in the Kanso grid.
- **Behavior**: events are "Read-Only" within Kanso.
- **Pros**: **Zero conflict risk**; high user value (prevents scheduling clashes).
- **Cons**: Cannot edit Google events from Kanso.

### Level 3: Full 2-Way Sync

_High Effort (2-4 Weeks)_

- **Mechanism**: Bi-directional update stream.
- **Requirements**:
  1. **Sync State Tracking**: Managing `sync_token`, `updated_at`, and ETags.
  2. **Conflict Resolution UI**: "This event was edited in both places—which version do you keep?"
  3. **Background Jobs**: Vercel Cron or Supabase Edge Functions to poll/push updates.
  4. **Recurring Events Logic**: Mapping RRule complexities between systems is non-trivial.

---

## 3. Other Calendar Providers

| Provider                    | API Quality             | OAuth Support | Viability                                                                                |
| --------------------------- | ----------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| **Outlook / Microsoft 365** | ✅ Excellent (MS Graph) | ✅ Yes        | **High**. Good documentation and standard OAuth flow.                                    |
| **Apple iCloud Calendar**   | ❌ No public REST API   | ❌ Complex    | **Low**. Requires CalDAV implementation (complex XML parsing, specialized libraries).    |
| **CalDAV (Generic)**        | ⚠️ Standard but fragile | Varies        | **Medium**. Works for Fastmail, Zoho, Nextcloud, but implementation details vary wildly. |

---

## 4. Recommendation

**Start with Level 2: "Google Calendar Overlay" (Read-Only)**

### Why?

1. **Immediate Value**: Users can see their meetings while planning their focus tasks.
2. **Low Risk**: Avoids the "data loss" or "infinite loop" risks inherent in 2-way sync.
3. **Foundation**: Establishes the OAuth flow and UI rendering logic needed for Level 3 later.

### Implementation Steps

1. **OAuth Scope**: Add `https://www.googleapis.com/auth/calendar.readonly` to Supabase login.
2. **Event Fetching**: Create a utility to fetch `events.list` for the visible time range.
3. **UI Layer**: Render these events with a distinct style (e.g., "Ghost" or "Glass" style) to differentiate them from Kanso tasks.
4. **Collision**: Ensure Kanso's internal `engine.ts` respects these blocks when calculating availability.

---

_Created: 2026-01-14_
