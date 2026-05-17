# Component Map

This document highlights critical components across the application.

## 1. Global / Layout Components
- **`AppContent`** (Inside `App.tsx`): The main layout wrapper. It houses the `Routes` block, the `AIChatDrawer`, and the global `ScrollToTop` handler. It also mounts the `GlobalBottomNav`.
- **`Header.tsx`**: Dynamic header that displays title based on route, and houses the Cart Icon and Theme Toggle.
- **`GlobalBottomNav.tsx`**: The persistent bottom navigation for mobile clients. It intelligently hides itself on specific screens (like Login or Admin dashboards).

## 2. Protected Route Wrappers
- **`ProtectedRoute.tsx`**: Allows access if `AuthContext` returns a valid user; otherwise redirects to `/login`.
- **`AdminProtectedRoute.tsx`**: Demands that the `AuthContext` user has the email `admin69@gmail.com`.
- **`DeliveryProtectedRoute.tsx`**: Validates the presence of `nnkb_delivery_locked` in `localStorage`. If missing, deflects to `/delivery-login`.

## 3. Specialized Feature Components
- **`AIChatDrawer.tsx`**: A sliding drawer interface controlled by `AIContext`. Reaches out to the Gemini API with user queries, maintaining history in state.
- **`ProductCard.tsx`**: Renders products in the catalog. Handles item variant drops (if sizes/variants apply), and pushes directly to `CartContext`.
- **`CropDoctorModal.tsx`**: A specific sub-component for submitting images/text specifically tuned for the AI to diagnose agricultural issues.
