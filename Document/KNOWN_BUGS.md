# Known Bugs and Unstable Areas

This list outlines current idiosyncrasies or non-fatal bugs in the environment.

## 1. Multiple Session Refresh Race Condition (Resolved/Mitigated)
- **Symptom**: `Auth check exception: Lock broken by another request with the 'steal' option.`
- **Cause**: Supabase's `gotrue-js` tries to refresh the session token simultaneously across multiple mounting hooks in React 19's Strict Mode.
- **Current Fix**: `AuthContext.tsx` was optimized to utilize a mounted flag (`isMounted`), mitigating double-fetches into the Supabase Session storage. The error may still intermittently appear in console during hot reloads, but functionality is unimpeded.

## 2. Vercel SPA Routing (Resolved)
- **Symptom**: Refreshing a page (like `/delivery` or `/admin`) directly resulted in a Vercel 404 block.
- **Cause**: Static file host expects `.html` mapping for every route.
- **Fix**: The `vercel.json` file now strictly rewrites all `/(.*)` requests to `/index.html`. Furthermore, all legacy `window.location.href = ...` calls were converted to React Router `navigate`/`replace` hooks.

## 3. PWA Background Geolocation
- **Symptom**: Delivery staff GPS might stop updating if the iOS/Android device aggressively puts the browser tab/PWA to sleep to save battery.
- **Mitigation**: The `WakeLock` API is not yet formally integrated. Delivery staff are instructed to keep the screen active while navigating.

## 4. Unused Features / Placeholders
- Currently, "Variants" (sizes/types of items) within the Product model are partially supported by the DB schema but lack a complete comprehensive UI in the Admin panel.
