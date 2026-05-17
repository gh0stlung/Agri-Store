# Database Schema

The application uses Supabase (PostgreSQL) as its primary database.

## Tables

### `profiles`
Stores additional user information for authenticated customers.
- `id` (UUID, Primary Key, references `auth.users`)
- `name` / `full_name` (Text)
- `email` (Text)
- `mobile` / `phone` (Text)
- `address` (Text)
- `created_at` (Timestamp)

### `products`
The core catalog table.
- `id` (UUID, Primary Key)
- `name` (Text)
- `category` (Text)
- `price` (Numeric)
- `image_url` (Text)
- `stock` (Integer)
- `unit` (Text)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `variants` (JSONB) - Defines pricing variants (e.g., different bag sizes).

### `orders`
Stores customer orders.
- `id` (UUID, Primary Key)
- `user_id` (UUID, references `auth.users`)
- `customer_name` (Text)
- `phone` (Text)
- `address` (Text)
- `total` (Numeric)
- `items` (JSONB)
- `status` (Text) - enum-like: 'Pending', 'Processing', 'Out for Delivery', 'Delivered'
- `assigned_to` (UUID, references `delivery_staff.id`)
- `delivery_lat` (Numeric)
- `delivery_lng` (Numeric)
- `delivery_updated_at` (Timestamp)
- `payment_status` (Text)
- `payment_method` (Text)
- `delivered_at` (Timestamp)
- `created_at` (Timestamp)

### `delivery_staff`
Stores delivery personnel details and login PINs.
- `id` (UUID, Primary Key)
- `name` (Text)
- `phone` (Text)
- `pin` (Text) - Used for PIN-based login
- `vehicle` (Text)
- `is_active` (Boolean)
- `created_at` (Timestamp)

### `delivery_locations`
Real-time tracking coordinate storage.
- `staff_id` (UUID, Primary Key part 1)
- `order_id` (UUID, Primary Key part 2)
- `lat` (Numeric)
- `lng` (Numeric)
- `updated_at` (Timestamp)

### `store_updates`
Admin broadcast messages.
- `id` (UUID, Primary Key)
- `message` (Text)
- `created_at` (Timestamp)
