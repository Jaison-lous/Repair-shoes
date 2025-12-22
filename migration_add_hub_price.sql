-- Migration: Add hub_price column to orders table
-- This script safely adds the hub_price column if it doesn't exist

-- Add hub_price column if it doesn't exist
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
        
        RAISE NOTICE 'Column hub_price added successfully to orders table';
    ELSE
        RAISE NOTICE 'Column hub_price already exists in orders table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name = 'hub_price';
