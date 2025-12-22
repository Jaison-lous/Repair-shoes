# Database Setup Guide

This guide explains how to apply database migrations to your Supabase project.

## Adding the hub_price Column

The `hub_price` column is required for the admin portal to save hub prices for orders. Follow these steps to add it to your database:

### Step 1: Access Supabase SQL Editor

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Run the Migration Script

1. Open the file `migration_add_hub_price.sql` in this project
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click the **Run** button (or press `Cmd/Ctrl + Enter`)

### Step 3: Verify Success

You should see a success message like:
```
NOTICE: Column hub_price added successfully to orders table
```

And a result table showing:
```
column_name | data_type | column_default
hub_price   | numeric   | 0
```

### Step 4: Test in the Application

1. Open your application at http://localhost:3000
2. Log in as an admin user
3. Navigate to any order
4. Try updating the hub price field
5. The price should save without errors
6. Refresh the page to confirm the price persists

## Troubleshooting

### "Column already exists" error
If you see this error, the column has already been added. You can safely ignore this.

### "Permission denied" error
Make sure you're logged in as the database owner or have sufficient privileges to alter tables.

### Still getting PGRST204 errors
1. Go to **Settings** → **API** in your Supabase dashboard
2. Click **Reload schema cache** button
3. Wait a few seconds and try again

## Alternative: Manual Column Addition

If the migration script doesn't work, you can manually add the column:

```sql
ALTER TABLE orders 
ADD COLUMN hub_price numeric(10, 2) DEFAULT 0;
```

Then reload the schema cache as described above.
