-- Migration: Add store_id to orders table
-- This migration adds store_id column to orders for multi-store support

-- Add store_id column (nullable initially)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- Set all existing orders to Main Store
UPDATE orders 
SET store_id = (SELECT id FROM stores WHERE name = 'Main Store' LIMIT 1)
WHERE store_id IS NULL;

-- Make store_id required
ALTER TABLE orders 
ALTER COLUMN store_id SET NOT NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'store_id';
