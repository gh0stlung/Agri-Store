# App Flow

## Core User Journeys

### 1. Customer Flow
- **Entry**: Navigates to `/` (Home page) or `/catalog` (Catalog page).
- **Browsing**: Views list of available products and variants.
- **Cart**: Adds products to cart. The `CartContext` manages the local state.
- **Checkout**: Navigates to `/cart` -> `/order` (requires authentication). If not authenticated, redirected to `/user-login`.
- **Order Tracking**: Post-order, navigates to `/my-orders` or `/track` to view the real-time status of their order and delivery location.

### 2. Administrator Flow
- **Entry**: Navigates to `/admin-login`. Log in with specific admin credentials (e.g., `admin69@gmail.com`).
- **Dashboard (`/admin`)**:
  - **Orders**: View, update status (Pending, Processing, Out for Delivery, Delivered), and assign to Delivery Staff.
  - **Products**: Add, edit, toggle visibility, and update stock/variants for products.
  - **Staff**: Manage delivery personnel.
  - **Updates**: Send global store updates to customers.

### 3. Delivery Personnel Flow
- **Entry**: Open PWA. If `nnkb_delivery_locked` is set in `localStorage`, automatically navigates to `/delivery` and blocks navigation to other routes via client-side routing. If not logged in, they can go to `/delivery-login` and enter a 6-digit PIN.
- **Dashboard (`/delivery`)**:
  - Only sees orders assigned to them with status `Out for Delivery`.
  - Continuous GPS tracking runs in background (`navigator.geolocation.watchPosition`) when active orders exist. Location is pushed to Supabase `delivery_locations`.
  - Staff can mark orders as 'Delivered' and log payment details.
  - **Exit**: Requires entering their 6-digit PIN to break the dashboard lock and sign out.

### 4. Authentication Flows
- **Regular Users**: `/user-login` (Email/Password or Google OAuth). Redirected back to previous page or home upon success.
- **Admins**: `/admin-login` (Email/Password strictly validated). Redirects to `/admin`.
- **Delivery Staff**: `/delivery-login` (PIN-based against `delivery_staff` table). Does not use Supabase Auth to avoid interfering with customer/admin sessions, purely relies on PIN validation and local storage lock.
