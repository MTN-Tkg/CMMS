import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addIsCriticalColumn() {
  console.log('🔧 Adding is_critical column to work_order_tasks table...');

  try {
    // Try to use the SQL editor approach by creating a temporary record with the column
    // This is a workaround since we can't execute DDL directly
    
    // First, let's check if we can access the table structure
    const { data: tableInfo, error: infoError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'work_order_tasks')
      .eq('table_schema', 'public');

    if (infoError) {
      console.log('Cannot access table schema information');
    } else {
      console.log('Current columns in work_order_tasks:');
      tableInfo?.forEach(col => console.log(`- ${col.column_name}`));
    }

    // Since we can't execute DDL directly, let's create a comprehensive SQL script
    // that the user can run manually in Supabase dashboard
    
    const sqlScript = `
-- Add is_critical column to work_order_tasks table
ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;

-- Update existing records to set default values
UPDATE work_order_tasks SET is_critical = false WHERE is_critical IS NULL;

-- Add comment to the column
COMMENT ON COLUMN work_order_tasks.is_critical IS 'Indicates if this task is critical for the work order';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_order_tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;
`;

    console.log('');
    console.log('📝 SQL Script to run in Supabase Dashboard:');
    console.log('=' .repeat(60));
    console.log(sqlScript);
    console.log('=' .repeat(60));
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL script above');
    console.log('4. Click "Run" to execute the script');
    console.log('5. Verify that the is_critical column was added');
    console.log('');
    console.log('🔍 After running the SQL, you can verify by running:');
    console.log('node fix-work-order-tasks-table.mjs');

  } catch (error) {
    console.error('Error:', error);
  }
}

addIsCriticalColumn();