-- Add in-house repair tracking field to orders table
ALTER TABLE orders 
ADD COLUMN is_in_house boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN orders.is_in_house IS 'If true, order is handled in-house and not sent to central hub';
