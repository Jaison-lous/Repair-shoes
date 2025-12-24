-- Check if RLS is enabled on orders table and view policies
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';

-- Also check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';
