# State Management

The application completely bypasses external state libraries (like Redux, Zustand) in favor of **React Context API** coupled with targeted local states (`useState` / `useReducer`).

## Global Contexts

1. **`AuthContext`**
   - **Data**: Current Supabase user object (`User | null`), Loading flag.
   - **Operations**: Binds the Supabase `onAuthStateChange` listener to React state. Exports `signOut`.

2. **`CartContext`**
   - **Data**: Array of `CartItem` (a `Product` with a variant modifier and dynamic cart ID). Total item count and gross price calculations.
   - **Operations**: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`. Changes persist purely to state during the session (flushed upon `/order` completion).

3. **`ThemeContext`**
   - **Data**: 'light' or 'dark', synchronized with `<html class="dark">`.

4. **`NavigationContext`**
   - **Data**: Exposes standard router commands (`push`, `replace`, `back`).
   - **Reasoning**: Creates a clean, abstracted boundary over React Router so that the `index.html` PWA scripts and legacy component files use uniform navigation, eliminating "stale route / strict 404" errors typical of SPAs.

5. **`ToastContext`**
   - **Data**: Renders a floating notification overlay. Provides `showToast(msg, type)` globally.

6. **`AIContext`**
   - **Data**: Is the AI chat drawer open? What is the running chat log?

## Local State
- Complex pages (like `Admin.tsx` and `DeliveryDashboard.tsx`) consolidate immense amounts of state internally via `useState`. External extraction was avoided to retain single-file portability for these specific isolated routes.
