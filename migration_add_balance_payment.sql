-- Add balance payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN balance_paid numeric(10, 2) DEFAULT 0,
ADD COLUMN balance_payment_method text;

-- Add comment for documentation
COMMENT ON COLUMN orders.balance_paid IS 'Amount paid for balance by customer';
COMMENT ON COLUMN orders.balance_payment_method IS 'Payment method used for balance: Google Pay, Cash, Card';
