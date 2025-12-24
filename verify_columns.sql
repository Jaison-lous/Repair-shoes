-- Verify that the advance payment columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('advance_amount', 'payment_method')
ORDER BY column_name;
