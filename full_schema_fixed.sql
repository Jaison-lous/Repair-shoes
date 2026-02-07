-- Full Schema Setup Script (Consolidated & Fixed)
-- Run this ENTIRE script in the Supabase SQL Editor.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Complaints Table (Presets)
CREATE TABLE IF NOT EXISTS complaints (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text NOT NULL,
  default_price numeric(10, 2) NOT NULL DEFAULT 0
);

-- 3. Order Status Enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('submitted', 'received', 'completed', 'departure', 'in_store', 'shipped', 'reshipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Stores Table (Must be created before Orders for FK)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);

-- Insert default "Main Store" if not exists
INSERT INTO stores (name, password_hash) 
VALUES ('Main Store', 'MTIzNDU2') -- '123456' base64 encoded
ON CONFLICT (name) DO NOTHING;

-- 5. Order Groups Table
CREATE TABLE IF NOT EXISTS order_groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name text NOT NULL,
  whatsapp_number text NOT NULL,
  shoe_model text NOT NULL,
  serial_number text UNIQUE,
  shoe_size text,
  shoe_color text,
  custom_complaint text,
  is_price_unknown boolean DEFAULT false,
  total_price numeric(10, 2) DEFAULT 0,
  hub_price numeric(10, 2) DEFAULT 0,
  expense numeric(10, 2) DEFAULT 0,
  status order_status DEFAULT 'submitted',
  expected_return_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Foreign Keys & New Columns
  store_id UUID REFERENCES stores(id),
  group_id UUID REFERENCES order_groups(id) ON DELETE SET NULL,
  
  is_completed boolean DEFAULT false,
  is_in_house boolean DEFAULT false,
  
  balance_paid numeric(10, 2) DEFAULT 0,
  balance_payment_method text,
  
  advance_amount numeric(10, 2) DEFAULT 0,
  payment_method text
);

-- Comments for documentation
COMMENT ON COLUMN orders.is_in_house IS 'If true, order is handled in-house and not sent to central hub';
COMMENT ON COLUMN orders.balance_paid IS 'Amount paid for balance by customer';
COMMENT ON COLUMN orders.balance_payment_method IS 'Payment method used for balance: Google Pay, Cash, Card';
COMMENT ON COLUMN orders.advance_amount IS 'Amount paid in advance by customer';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used for advance: Google Pay, Cash, Card';


-- 7. Link Table (Order <-> Complaints)
CREATE TABLE IF NOT EXISTS order_complaints (
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, complaint_id)
);

-- 8. Group Expenses Table
CREATE TABLE IF NOT EXISTS group_expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES order_groups(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. In-House Presets Table
CREATE TABLE IF NOT EXISTS in_house_presets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text NOT NULL,
  default_price numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Insert Dummy Data (Safe Inserts)

-- Complaints
INSERT INTO complaints (description, default_price)
SELECT 'Stitching', 100
WHERE NOT EXISTS (SELECT 1 FROM complaints WHERE description = 'Stitching');

INSERT INTO complaints (description, default_price)
SELECT 'Patch Work', 300
WHERE NOT EXISTS (SELECT 1 FROM complaints WHERE description = 'Patch Work');

-- In-House Presets
INSERT INTO in_house_presets (description, default_price)
SELECT 'Polishing', 50
WHERE NOT EXISTS (SELECT 1 FROM in_house_presets WHERE description = 'Polishing');

INSERT INTO in_house_presets (description, default_price)
SELECT 'Sole Cleaning', 30
WHERE NOT EXISTS (SELECT 1 FROM in_house_presets WHERE description = 'Sole Cleaning');


-- 11. Fix Existing Data (If running on existing DB)

-- Ensure existing orders have a store_id
UPDATE orders 
SET store_id = (SELECT id FROM stores WHERE name = 'Main Store' LIMIT 1)
WHERE store_id IS NULL;

-- 12. Enable RLS (Security Best Practices)

-- Enable RLS on tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_house_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON orders;
DROP POLICY IF EXISTS "Public Write Access" ON orders;
DROP POLICY IF EXISTS "Public Read Complaints" ON complaints;
DROP POLICY IF EXISTS "Public Read InHouse" ON in_house_presets;

-- Create Open Policies (Adjust for production as needed)
CREATE POLICY "Public Read Access" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Write Access" ON orders FOR ALL USING (true) WITH CHECK (true);


CREATE POLICY "Public Read Complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Public Read InHouse" ON in_house_presets FOR SELECT USING (true);

-- Missing policies added below
CREATE POLICY "Public Read Stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Public Read OrderGroups" ON order_groups FOR SELECT USING (true);
CREATE POLICY "Public Read GroupExpenses" ON group_expenses FOR SELECT USING (true);
CREATE POLICY "Public Insert OrderGroups" ON order_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update OrderGroups" ON order_groups FOR UPDATE USING (true);
CREATE POLICY "Public Delete OrderGroups" ON order_groups FOR DELETE USING (true);
CREATE POLICY "Public Insert GroupExpenses" ON group_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete GroupExpenses" ON group_expenses FOR DELETE USING (true);


-- 13. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
