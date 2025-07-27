-- Fix work_orders table by adding updated_at column
-- Run these commands in order

-- Step 1: Add the updated_at column first
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Update existing rows (only after column is added)
-- This will only run if there are rows where updated_at is NULL
UPDATE work_orders 
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

-- Step 3: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_work_orders_updated_at ON work_orders;

-- Step 5: Create the trigger
CREATE TRIGGER update_work_orders_updated_at 
BEFORE UPDATE ON work_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify the column was added
SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name = 'updated_at';

-- Step 7: Test that it works
-- This should show the updated_at column
SELECT id, created_at, updated_at 
FROM work_orders 
LIMIT 5;