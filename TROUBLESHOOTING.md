# Troubleshooting & Quick Customizations

Last updated: 2026-02-10

This document collects the most-common runtime troubleshooting steps and small customizations for the WebPortal. Use it as a single reference for where to change behavior (recent announcements count, upload limits, theme accents) and how to diagnose problems (login, CSRF, missing files).

---

## Quick examples (where to change things)

- Show fewer/more announcements on the Home page

  File: `public/script.js`

  Look for the `loadAnnouncements()` function and this line:

  list.slice(0, 4).forEach((a) => { ... });

  - To show 3 announcements change `4` → `3`.
  - Recommended: make this configurable by adding a constant at top of `public/script.js`:

    const RECENT_ANNOUNCEMENTS = 3;
    // then replace slice(0, 4) with slice(0, RECENT_ANNOUNCEMENTS)

  After editing, restart the server (if necessary) and refresh the browser.

- Change the neon accent color used for nav highlights and glows

  File: `public/style.css` — edit the `:root` variables:

    --accent-neon: #00fff3;
    --accent-neon-2: #9b59ff;

  These values affect `header nav` underline gradient and glow. Save and refresh.

- Adjust upload limits and allowed file types

  File: `backend/server.js`

  - `limits.fileSize` (in multer config) controls maximum upload size (default 30MB).
  - `allowedExts` array controls permitted extensions.

  Change values, then restart the Node server.

- Control welcome hero behavior (Lottie animation)

  Files: `public/index.html` (container `#welcomeLottie`), `public/script.js` (function `showWelcomeHero`).

  - To disable Lottie animation, remove the CDN script include in `index.html` or change `showWelcomeHero` to use fallback only.
  - To change the animation, replace the `lottiePath` URL inside `showWelcomeHero`.

---

## Common problems & fixes

- Login fails or page reloads without error

  Steps to debug:
  1. Open developer tools → Network tab → submit login. Inspect `POST /api/login` response JSON and HTTP status.
  2. If 401: `Invalid Employee ID or Password` — verify `backend/users.json` contains the user and the password matches (plain text or bcrypt hash).
  3. If 403 and message mentions lock: user may be temporarily locked due to repeated failures (server locks after 5 attempts). Wait or clear `backend/loginAttempts.json` for that empId.
  4. If 400 input error: ensure `empId` and `password` are sent and not blocked by a missing CSRF token.
  5. If the login request is not sent at all, check console for JS errors (CSP or missing script). Ensure `public/script.js` is loaded and the DOMContentLoaded handler runs.

- CSRF errors

  The server uses `csurf` (cookie mode). The frontend fetches a token from `/api/csrf-token` and sends it in `x-csrf-token`. If you see a 403 with CSRF error:

  - Ensure `fetchCsrfToken()` runs before state-changing requests (login/POSTs). The code awaits it on page load.
  - Confirm cookies are enabled and not blocked by browser settings.

- Missing file / 404 when downloading

  - Check `docs/uploads` to make sure the file exists.
  - The tracked download endpoint is `/api/download/<path>`; the UI uses `trackedUrl` which maps to that API.

- Server errors (500)

  - Inspect the server terminal where you started `node backend/server.js` for stack traces.
  - Check JSON data files used by the server (e.g., `backend/users.json`, `backend/fileMetadata.json`, `backend/knowledgeUpdates.json`) for valid JSON.

---

## Admin / Developer notes

- Start server locally

  ```bash
  npm start
  # or
  node backend/server.js
  ```

- Where logs are stored

  - Activity logs: `backend/activityLogs.json`
  - Login attempts: `backend/loginAttempts.json`

- Add a new user

  1. Open `backend/users.json` and add an object with fields: `empId`, `name`, `password` (plain text or bcrypt hash), `role` (e.g., `user`, `uploader`, `admin`), `team`, and optional `mustChangePassword`.
  2. Restart the server if you modified server-side code that reads users on startup.

  Example user entry:

  ```json
  {
    "empId": "1001",
    "name": "Alice Kumar",
    "password": "$2a$10$...", // bcrypt hash OR plain string for dev
    "role": "admin",
    "team": "MFPM"
  }
  ```

  To generate a bcrypt hash quickly (Node REPL):

  ```js
  const bcrypt = require('bcryptjs');
  console.log(bcrypt.hashSync('MyPlainPass', 10));
  ```

---

If you want, I can also:
- Add `RECENT_ANNOUNCEMENTS` constant to `public/script.js` and replace the hardcoded `4`.
- Add a small admin UI toggle to change how many announcements appear without editing code.

If you want me to update the code to apply any of the above changes, tell me which one and I'll implement it.
