# Roles and Permissions

This application handles three distinct user archetypes. 

## 1. Customer
- **Authentication**: Uses standard Supabase Auth (Sign Up, Log In via Email/Google). 
- **Permissions**: 
  - Can browse `products`.
  - Can construct and finalize an `order` bound to `user_id`.
  - Can view their specific historical tracking via `/track` and `/my-orders`.
  - Can use the Crop Doctor via `/components/AIChatDrawer.tsx`.

## 2. Admin
- **Authentication**: Uses Supabase Auth (`/admin-login`).
- **Validation**: Relegated strictly to frontend component wrappers (e.g., `AdminProtectedRoute.tsx`) verifying if the current established user email equals `admin69@gmail.com` (as referenced dynamically or physically in code). If untrue, it denies component rendering and shifts route.
- **Permissions**: 
  - Can view all orders globally (`Admin.tsx`).
  - Can insert, delete, and alter the `products` catalog.
  - Can manipulate `store_updates`.
  - Can assign `delivery_staff` dynamically to processed orders.

## 3. Delivery Staff
- **Authentication**: Fully detached from Supabase User Auth. They rely entirely upon physical PIN input checked against the `delivery_staff` data row.
- **Validation**: Handled via `DeliveryProtectedRoute.tsx`. It relies on a local storage key boolean (`nnkb_delivery_locked`) holding the staff details to permit access. 
- **Permissions**:
  - Bound specifically to the `DeliveryDashboard.tsx`.
  - Cannot access catalog, user cart, or higher administration.
  - Allowed execution rights solely to broadcast internal GPS coordinates to `delivery_locations` and mark specific chained orders as "Delivered."
