-- Fix work_orders table by adding updated_at column
-- This fixes the error: record "new" has no field "updated_at"

-- Add updated_at column to work_orders table if it doesn't exist
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at = created_at (or current time)
UPDATE work_orders 
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_work_orders_updated_at ON work_orders;

-- Create the trigger
CREATE TRIGGER update_work_orders_updated_at 
BEFORE UPDATE ON work_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name = 'updated_at';