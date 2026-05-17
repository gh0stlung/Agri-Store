# Security & RLS Rules

All security regarding data retrieval from Supabase is managed implicitly through **Row Level Security (RLS)** in PostgreSQL.

## Abstracted Policies (SQL Level)

While the explicit `.sql` initialization files are outside the raw UI components, the logic operates natively based on these principles:

1. **`products`**:
   - **SELECT**: Open to all users (Public). Needed to display catalog.
   - **INSERT/UPDATE/DELETE**: Restricted strictly to Admin (defined via a trigger or specific admin email match within Supabase, or reliant on UI obfuscation in the current lightweight model).

2. **`orders`**:
   - **SELECT**: Restricted to the user who owns them (`auth.uid() = user_id`), or to an authorized Admin pool.
   - **UPDATE**: Handled primarily by Admins (changing statuses) and Delivery Staff (modifying `delivery_lat/lng` or marking `Delivered`).

3. **`delivery_staff`**:
   - **SELECT**: Must be public in this configuration because the `DeliveryLogin` pin check is executed anonymously before an auth session is constructed. 

4. **Authentication Level**:
   - Email verification is toggled in the Supabase Dashboard. `AuthContext.tsx` holds a listener for parsed URL hashes in the event the environment requires a password change or verification step via deep-link.
