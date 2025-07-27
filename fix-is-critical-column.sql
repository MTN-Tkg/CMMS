-- Fix for PGRST204 Error: Missing 'is_critical' column in work_order_tasks table
-- This script adds the missing is_critical column to work_order_tasks table

-- Step 1: Add the missing is_critical column to work_order_tasks table
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;

-- Step 2: Update existing records to set default values
UPDATE work_order_tasks SET is_critical = false WHERE is_critical IS NULL;

-- Step 3: Add other missing columns that should exist based on the schema
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS pm_template_detail_id TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS step_number INTEGER DEFAULT 1;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS task_description TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS expected_input_type TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS standard_text_expected TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS standard_min_value NUMERIC;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS standard_max_value NUMERIC;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS result_value TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS result_status TEXT DEFAULT 'pending';
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Add foreign key constraint for pm_template_detail_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'work_order_tasks_pm_template_detail_id_fkey'
        AND table_name = 'work_order_tasks'
    ) THEN
        ALTER TABLE work_order_tasks 
        ADD CONSTRAINT work_order_tasks_pm_template_detail_id_fkey 
        FOREIGN KEY (pm_template_detail_id) REFERENCES pm_template_details(id);
    END IF;
END $$;

-- Step 5: Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_pm_template_detail_id ON work_order_tasks(pm_template_detail_id);
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_status ON work_order_tasks(status);

-- Step 6: Add comments to the columns
COMMENT ON COLUMN work_order_tasks.is_critical IS 'Indicates if this task is critical for the work order';
COMMENT ON COLUMN work_order_tasks.pm_template_detail_id IS 'Reference to PM template detail that this task is based on';
COMMENT ON COLUMN work_order_tasks.status IS 'Task status: pending, in_progress, completed, failed, skipped, na';
COMMENT ON COLUMN work_order_tasks.result_status IS 'Result status: pass, fail, warning, na';

-- Step 7: Verify the columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'work_order_tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 8: Show a summary of the changes
SELECT 
    'work_order_tasks table updated successfully' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'work_order_tasks' 
AND table_schema = 'public';