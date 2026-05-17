# Authentication System

The application relies on Supabase Auth for Customers and Admins, and a custom PIN system for Delivery Staff.

## 1. Customer Authentication (`/user-login`)
- **Technology**: Supabase Auth (Email/Password + Google OAuth).
- **Session Management**: Managed globally by `AuthContext.tsx`. `supabase.auth.getSession()` and `onAuthStateChange` are used to persist the user session across reloads.
- **Handling Redirects**: URL hash fragments containing `access_token` are parsed on load in `AuthContext` to support OAuth flow callbacks seamlessly on standard Vercel deployments.

## 2. Admin Authentication (`/admin-login`)
- **Technology**: Supabase Auth (Email/Password).
- **Mechanism**: The same Supabase Auth instance is used. However, the `AdminProtectedRoute` component explicitly checks if the logged-in user's email matches the configured admin email (e.g., `admin69@gmail.com`). If it doesn't match, they are redirected to the home page.

## 3. Delivery Staff Authentication (`/delivery-login`)
- **Technology**: Custom PIN validation against the `delivery_staff` database table. Local Storage locking (`nnkb_delivery_locked`).
- **Mechanism**: 
  - The delivery staff interface operates entirely separate from Supabase Auth mapping.
  - A 4 to 6 digit PIN is entered on `/delivery-login`.
  - The client queries `delivery_staff` for a match.
  - If matched, the record is stored securely in `localStorage`.
  - `DeliveryProtectedRoute` wrapper and a global `useEffect` in `App.tsx` strictly enforce that if this key exists, the user cannot browse away from `/delivery`.
  - **Sign Out**: Can only occur if the correct PIN is repeatedly entered in the exit modal, which drops the local storage keys and relieves the navigation block.
