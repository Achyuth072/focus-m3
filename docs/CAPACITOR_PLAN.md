# Capacitor Migration Plan

**Status:** [Deprioritized - Long Term]
**Reason:** User requested to stop native wrapper work. Native-like gestures are handled in PWA; iOS haptics are accepted as a limitation for now.
**Target:** Kanso (Android)
**Effort Estimate:** Medium (1-2 Days)

## 1. Executive Summary & Viability

**Viability: High**
The current codebase (Next.js, Shadcn UI, Supabase) is highly compatible with Capacitor. The existing `useHaptic` hook is already abstracted to support this switch easily.

**Effort: Medium**

- **Frontend:** Low effort. Responsive layouts exists.
- **Configuration:** Medium effort. Setting up Android Studio/Xcode, icons, and permissions.
- **Backend/API:** Medium effort. Next.js API Routes do not work in Capacitor's native bundle, requiring an architectural adjustment (detailed below).

---

## 2. Architecture & Trade-offs

### 2.1. The "Static Export" Requirement

Capacitor acts as a native web server on the phone. To bundle the app, we must switch Next.js to **Static Export** mode.

- **Config:** `output: 'export'` in `next.config.js`.
- **Constraint:** **No Node.js Server**. This means:
  - No `getServerSideProps` (We aren't using this).
  - No `middleware.ts` (Used for Email Whitelisting).
  - **No `/app/api/*` Routes** (Used for Calendar Sync).
  - No `next/image` Optimization (Must use `unoptimized: true`).

### 2.2. Solution Strategy

| Feature       | Challenge                | Solution Strategy                                                                                                                                                                           |
| :------------ | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GCal Sync** | Depends on API Routes    | **Hybrid approach:** Deploy API routes to Vercel. Capacitor App calls `https://your-app.vercel.app/api/...` instead of local `/api/...`. <br> _Long-term:_ Move to Supabase Edge Functions. |
| **Security**  | Middleware doesn't run   | Rely on **Supabase RLS**. The middleware was just a gatekeeper; RLS is the real security.                                                                                                   |
| **Images**    | No Image Optimization    | Enable `unoptimized: true`. For a personal app, this is acceptable.                                                                                                                         |
| **Auth**      | Redirects to `localhost` | Configure **Deep Links** (`kanso://`) for Supabase Auth redirects.                                                                                                                          |

### 2.3. The "Dual Build" Strategy (Web + Mobile)

To support **Mobile** (Static) and **Web** (Dynamic/API Routes) simultaneously, we will use conditional configuration.

1.  **Web Build (Vercel):** Standard build. Keeps API Routes and Middleware active.
2.  **Mobile Build (Capacitor):** Static export.

**Config Logic (`next.config.mjs`):**

```javascript
const isMobile = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

const nextConfig = {
  // Only use static export for mobile build
  output: isMobile ? "export" : undefined,
  images: {
    // Unoptimized images for mobile, optimized for web
    unoptimized: isMobile,
  },
};
```

**Build Commands:**

- Web: `npm run build`
- Mobile: `cross-env NEXT_PUBLIC_IS_CAPACITOR=true npm run build && npx cap sync`

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Preparation

1.  **Dependencies**

    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios cross-env
    npx cap init Kanso com.kanso.app
    ```

2.  **Dependencies (Hardware)**

    ```bash
    npm install @capacitor/status-bar @capacitor/haptics @capacitor/local-notifications
    ```

3.  **Next.js Configuration (Dual Build Strategy)**
    To support **Web** (Dynamic) and **Mobile** (Static) simultaneously:

    - **Logic:** Use an environment variable `NEXT_PUBLIC_IS_CAPACITOR` to switch modes.
    - **Update `next.config.mjs`:**

      ```javascript
      const isMobile = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

      const nextConfig = {
        output: isMobile ? "export" : undefined,
        images: {
          unoptimized: isMobile,
        },
      };
      export default nextConfig;
      ```

    - **Build Scripts:**
      - **Web:** `npm run build` (Standard Vercel Build)
      - **Mobile:** `cross-env NEXT_PUBLIC_IS_CAPACITOR=true npm run build && npx cap sync`

4.  **Environment Variables**
    - Create `.env.production` for the build.
    - **Crucial:** API Endpoint URLs must be absolute (`https://...`) not relative (`/api/...`) so the phone knows where to call.

### Phase 2: Native Configuration

1.  **Android Setup**

    ```bash
    npx cap add android
    npx cap open android
    ```

    - **Manifest:** Set permissions (Internet, Vibration).
    - **Status Bar:** The "Immersive" requirement.
      - Install `@capacitor/status-bar`.
      - Config: `overlay: true`, `style: 'DARK'`.

2.  **Deep Linking (For Auth)**
    - Scheme: `kanso://`
    - Update Supabase Dashboard: Add `kanso://auth/callback` to Redirect URLs.
    - Update `AndroidManifest.xml` to handle the Intent Filter.

### Phase 3: Hardware Integration (The "Super App" Feel)

1.  **Haptics**

    - Install `@capacitor/haptics`.
    - Add `Haptics.impact({ style: ImpactStyle.Light })` to:
      - Task Checkbox tick.
      - Timer start/stop.
      - Date Picker selection.

2.  **Background Mode (Focus Timer)**
    - _Challenge:_ Timers stop when app is backgrounded.
    - _Solution:_ `@capacitor/local-notifications`.
    - Logic: When Timer starts, schedule a Notification for end-time. If app is killed, notification still fires.

---

## 4. Security & Distribution Privacy

### 4.1. Access Control (Why the Allowlist doesn't matter)

You asked if the "Email Allowlist" protects the app.

- **Web:** Yes, `middleware.ts` blocks access.
- **Mobile (Capacitor):** **Middleware DOES NOT run.** The app is static.
- **The Real Protection:** **Supabase Auth & RLS**.
  - Even if a stranger has your APK, they **cannot read data** (RLS policies block it).
  - They **cannot sign up** if you disable "Enable Signups" in Supabase Dashboard -> Authentication -> Providers.
  - **Result:** The app is a useless login screen for anyone else.

### 4.2. "Private Releases" Strategy

To keep the APKs secret (so randoms don't even download it):

1.  **Separate Repo:** Create `kanso-releases` (Private).
2.  **Workflow:** The Main Repo's GitHub Action builds the APK and pushes it to the _Private Repo's_ Releases.
3.  **Obtanium:** You give Obtanium a Personal Access Token (PAT) to read the Private Repo.

---

## 5. Verification Plan

### 4.1. Browser Testing (Preliminary)

- Run `npm run build`.
- Serve the `out` directory locally.
- Verify basic navigation and styles (ensure no 404s on refresh - _Note: Capacitor handles internal routing differently, hash routing or strict history management may be improved_).

### 4.2. Android Simulator

1.  **Build:** `npm run build && npx cap sync`.
2.  **Launch:** Run in Android Studio Emulator.
3.  **Test Points:**
    - **Status Bar:** Is it transparent/matching the dark theme?
    - **Auth:** Does Google Login redirect back to the app correctly?
    - **Data:** Do tasks load from Supabase?
    - **Sync:** Create task on Phone -> Check Desktop.

### 4.3. Physical Device

- Deploy APK to phone.
- **Feel:** Test Haptics and "Swipe to Delete" responsiveness.

## 6. Recommendation

**Go for it.**
The migration is low-risk. The result will be a significantly "more premium" feeling app than the standard browser PWA, specifically due to:

1.  Status Bar control (killing the browser chrome).
2.  Haptics (tactile feedback).
3.  Smooth transitions (no browser URL bar resizing jitters).
