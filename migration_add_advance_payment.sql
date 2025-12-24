-- Add advance payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN advance_amount numeric(10, 2) DEFAULT 0,
ADD COLUMN payment_method text;

-- Add comment for documentation
COMMENT ON COLUMN orders.advance_amount IS 'Amount paid in advance by customer';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used for advance: Google Pay, Cash, Card';
