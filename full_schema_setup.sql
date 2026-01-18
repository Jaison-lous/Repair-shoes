-- Full Schema Setup Script
-- Run this script in the Supabase SQL Editor to set up the database.

-- 1. Base Schema (schema.sql)
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Complaints Table (Presets)
create table if not exists complaints (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  default_price numeric(10, 2) not null default 0
);

-- Orders Table
do $$ begin
    create type order_status as enum ('submitted', 'received', 'completed', 'departure', 'in_store', 'shipped', 'reshipped');
exception
    when duplicate_object then null;
end $$;

create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  whatsapp_number text not null,
  shoe_model text not null,
  serial_number text unique,
  custom_complaint text,
  is_price_unknown boolean default false,
  total_price numeric(10, 2) default 0,
  hub_price numeric(10, 2) default 0,
  expense numeric(10, 2) default 0,
  status order_status default 'submitted',
  expected_return_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Link Table (Many-to-Many for presets)
create table if not exists order_complaints (
  order_id uuid references orders(id) on delete cascade,
  complaint_id uuid references complaints(id) on delete cascade,
  primary key (order_id, complaint_id)
);

-- Insert some dummy data for complaints (avoid duplicates)
INSERT INTO complaints (description, default_price)
SELECT 'Stitching', 100
WHERE NOT EXISTS (SELECT 1 FROM complaints WHERE description = 'Stitching');

INSERT INTO complaints (description, default_price)
SELECT 'Patch Work', 300
WHERE NOT EXISTS (SELECT 1 FROM complaints WHERE description = 'Patch Work');

-- Order Groups
create table if not exists order_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Group Expenses
create table if not exists group_expenses (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references order_groups(id) on delete cascade,
  description text not null,
  amount numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Link Orders to Groups
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'group_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN group_id uuid references order_groups(id) on delete set null;
    END IF;
END $$;


-- 2. Create Stores Table (migration_create_stores.sql)
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
VALUES ('Main Store', '$2a$10$placeholder_hash_for_store123')
ON CONFLICT (name) DO NOTHING;


-- 3. Add Store ID to Orders (migration_add_store_id_to_orders.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'store_id'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN store_id UUID REFERENCES stores(id);
    END IF;
END $$;

-- Set all existing orders to Main Store
UPDATE orders 
SET store_id = (SELECT id FROM stores WHERE name = 'Main Store' LIMIT 1)
WHERE store_id IS NULL;

-- Make store_id required (safely)
DO $$ 
BEGIN
    -- Only alter if there are no null values left (which we just fixed)
    IF NOT EXISTS (SELECT 1 FROM orders WHERE store_id IS NULL) THEN
        ALTER TABLE orders ALTER COLUMN store_id SET NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);


-- 4. Add Hub Price (migration_add_hub_price.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'hub_price'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN hub_price numeric(10, 2) DEFAULT 0;
    END IF;
END $$;


-- 5. Add Is Completed (migration_add_is_completed.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN is_completed boolean DEFAULT false;
    END IF;
END $$;


-- 6. Add In House (migration_add_in_house.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'is_in_house'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN is_in_house boolean DEFAULT false;
        COMMENT ON COLUMN orders.is_in_house IS 'If true, order is handled in-house and not sent to central hub';
    END IF;
END $$;


-- 7. Add Balance Payment (migration_add_balance_payment.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'balance_paid'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN balance_paid numeric(10, 2) DEFAULT 0,
        ADD COLUMN balance_payment_method text;

        COMMENT ON COLUMN orders.balance_paid IS 'Amount paid for balance by customer';
        COMMENT ON COLUMN orders.balance_payment_method IS 'Payment method used for balance: Google Pay, Cash, Card';
    END IF;
END $$;


-- 8. Add Advance Payment (migration_add_advance_payment.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'advance_amount'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN advance_amount numeric(10, 2) DEFAULT 0,
        ADD COLUMN payment_method text;

        COMMENT ON COLUMN orders.advance_amount IS 'Amount paid in advance by customer';
        COMMENT ON COLUMN orders.payment_method IS 'Payment method used for advance: Google Pay, Cash, Card';
    END IF;
END $$;
