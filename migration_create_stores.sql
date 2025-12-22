-- Migration: Create stores table
-- This migration creates the stores table for multi-store support

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);

-- Insert default "Main Store" 
-- Password: "store123" (you should hash this properly)
INSERT INTO stores (name, password_hash) 
VALUES ('Main Store', '$2a$10$placeholder_hash_for_store123')
ON CONFLICT (name) DO NOTHING;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'stores'
ORDER BY ordinal_position;
