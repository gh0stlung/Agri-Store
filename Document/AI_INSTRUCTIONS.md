# AI Assistant Instructions

*These guidelines are designed for any AI or Agent picking up this codebase for extended iteration.*

1. **Routing is Client-Side Only**: 
   - Never use `window.location.href`, `window.location.replace`, or `<a href="...">` for internal routing.
   - Always import and use `const { push, replace } = useNavigation();` or `<Link to="...">`. This maintains the stability of the React Router SPA and prevents Vercel edge-crash 404s.
   
2. **Auth Handling**:
   - The primary Auth system is Supabase and heavily relies on React 19's context structure.
   - When importing `useAuth()`, gracefully tolerate loading delays before trying to render. 
   - Do NOT utilize Supabase functions to "auto-redirect" to a login wall inside standard page code; always rely on the declarative `ProtectedRoute.tsx` wrapper in `App.tsx`.

3. **Styling Limitations**:
   - Use `@apply` in CSS ONLY when absolutely unavoidable globally.
   - Otherwise, strictly utilize standard inline Tailwind utility classes.
   - Stick to the pre-established typography: `font-['Merriweather']` for headings and `font-['Plus_Jakarta_Sans']` for body.

4. **Background Restrictions (Delivery Dashboard)**:
   - Modifications inside `DeliveryDashboard.tsx` must never halt or block the continuous `watchPosition` GPS watcher. Delaying or throttling this thread breaks real-time customer tracking.

5. **Linter Awareness**:
   - React 19 rules (and standard `tsc --noEmit` checks) apply. Address all `any` usages carefully if doing so risks cascading type breaks inside untyped Supabase callback values.
