import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addUpdatedAtColumn() {
  console.log('🔧 Adding updated_at column to work_orders table...\n');

  try {
    // First, check current columns
    console.log('📊 Current work_orders columns:');
    const { data: sample, error: sampleError } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (!sampleError && sample && sample.length > 0) {
      const columns = Object.keys(sample[0]);
      console.log('Columns:', columns);
      console.log('Has updated_at?', columns.includes('updated_at'));
    }

    // Since we can't run ALTER TABLE directly through Supabase client,
    // we need to provide instructions for the user
    console.log('\n⚠️  IMPORTANT: The work_orders table is missing the updated_at column.');
    console.log('This is causing the error when trying to complete work orders.\n');
    
    console.log('📋 Please run this SQL in your Supabase SQL Editor:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL:\n');
    
    const sqlScript = `-- Add updated_at column to work_orders table
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows
UPDATE work_orders 
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_work_orders_updated_at ON work_orders;
CREATE TRIGGER update_work_orders_updated_at 
BEFORE UPDATE ON work_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name = 'updated_at';`;

    console.log('```sql');
    console.log(sqlScript);
    console.log('```\n');
    
    console.log('4. After running the SQL, test the PM QR Scanner again.\n');
    
    // Test if we can update work_orders now
    console.log('🧪 Testing current update capability...');
    const testId = `TEST-${Date.now()}`;
    
    // Create test record
    const { error: createError } = await supabase
      .from('work_orders')
      .insert({
        id: testId,
        work_type: 'PM',
        title: 'Test',
        status: 'in_progress',
        priority: 2
      });
      
    if (!createError) {
      // Try to update it
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', testId);
        
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
        console.log('Please run the SQL script above to fix this issue.');
      } else {
        console.log('✅ Update successful! The issue might be resolved.');
      }
      
      // Clean up
      await supabase.from('work_orders').delete().eq('id', testId);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
addUpdatedAtColumn();