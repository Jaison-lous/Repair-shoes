-- Migration: Add is_completed column to orders table
-- This script safely adds the is_completed column if it doesn't exist

-- Add is_completed column if it doesn't exist
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
        
        RAISE NOTICE 'Column is_completed added successfully to orders table';
    ELSE
        RAISE NOTICE 'Column is_completed already exists in orders table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name = 'is_completed';
