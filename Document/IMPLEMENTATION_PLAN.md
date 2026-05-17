# Implementation Plan

When upgrading this application, stick to the following iterative strategy.

## 1. Safety and Stability Checks
Before embarking on feature addition:
1. Validate Supabase Database schema matches local `types.ts`.
2. Confirm the exact route exists inside `App.tsx`.
3. Check `KNOWN_BUGS.md` to ensure you are not reopening old edge cases (such as the Vercel 404 block or Auth session steal bugs).

## 2. Standard Feature Implementation Steps
1. **Model First**: Add any required properties to the target interface inside `types.ts`.
2. **Database Translation**: Sync (or note) the required schema changes in Supabase (if building on top of DB). Update `DATABASE_SCHEMA.md`.
3. **Component Creation**:
   - Create the UI segment inside `/components`.
   - Use strictly Tailwind for styling. Do not inject hard CSS files.
   - Inject Framer Motion (`motion.div`) if interaction feedback is warranted.
4. **State Injection**:
   - Determine if it requires Global state (Context) or Local State.
   - Bias towards Local State unless the data needs lateral transport across the DOM.
5. **Route Binding**: Attach to `App.tsx` if it relies on a full-page scope. Wrap with corresponding `*ProtectedRoute` tag.

## 3. Deployment Review
- Do not run `npm run build` locally, simply verify via `npm run lint`. 
- Remember that PWA structures require all dependencies to be accurately mapped in `manifest.json`.
