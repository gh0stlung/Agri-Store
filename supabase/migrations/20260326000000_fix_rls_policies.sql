-- 1. Enable RLS on all tables to remove "unrestricted" state
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh and remove any "RLS disabled" state
DROP POLICY IF EXISTS "public can view products" ON products;
DROP POLICY IF EXISTS "admin full access" ON products;
DROP POLICY IF EXISTS "users see own orders" ON orders;
DROP POLICY IF EXISTS "users can create own orders" ON orders;
DROP POLICY IF EXISTS "admin full access orders" ON orders;
DROP POLICY IF EXISTS "users manage own profile" ON profiles;
DROP POLICY IF EXISTS "admin full access profiles" ON profiles;
DROP POLICY IF EXISTS "public can view updates" ON updates;
DROP POLICY IF EXISTS "admin full access updates" ON updates;

-- 3. Products: Public read access
CREATE POLICY "public can view products"
ON products
FOR SELECT
USING (true);

-- 4. Products: Admin full access
CREATE POLICY "admin full access"
ON products
FOR ALL
USING (auth.email() = 'admin69@gmail.com');

-- 5. Orders: Only logged-in users can see their own orders
CREATE POLICY "users see own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id);

-- 6. Orders: Users can create their own orders (Required for checkout to work)
CREATE POLICY "users can create own orders"
ON orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. Orders: Admin full access to manage orders
CREATE POLICY "admin full access orders"
ON orders
FOR ALL
USING (auth.email() = 'admin69@gmail.com');

-- 8. Profiles: Users can read/update only their own profile
CREATE POLICY "users manage own profile"
ON profiles
FOR ALL
USING (auth.uid() = id);

-- 9. Profiles: Admin full access to profiles
CREATE POLICY "admin full access profiles"
ON profiles
FOR ALL
USING (auth.email() = 'admin69@gmail.com');

-- 10. Updates: Public read access
CREATE POLICY "public can view updates"
ON updates
FOR SELECT
USING (true);

-- 11. Updates: Admin full access
CREATE POLICY "admin full access updates"
ON updates
FOR ALL
USING (auth.email() = 'admin69@gmail.com');
