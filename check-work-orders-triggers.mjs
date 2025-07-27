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

async function checkAndFixWorkOrdersTable() {
  console.log('🔍 Checking work_orders table and fixing issues...\n');

  try {
    // First, let's verify the exact columns in work_orders
    console.log('📊 Verifying work_orders table columns:');
    const { data: sample, error: sampleError } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error fetching sample:', sampleError);
    } else if (sample && sample.length > 0) {
      const columns = Object.keys(sample[0]);
      console.log('Available columns:', columns);
      console.log('Has updated_at?', columns.includes('updated_at'));
      console.log('Has completed_at?', columns.includes('completed_at'));
    }

    // Test the exact update that's failing
    console.log('\n🧪 Testing the exact update operation that fails:');
    
    // Create a test work order first
    const testId = `TEST-WO-${Date.now()}`;
    const { data: testWO, error: createError } = await supabase
      .from('work_orders')
      .insert({
        id: testId,
        work_type: 'PM',
        title: 'Test Work Order',
        status: 'in_progress',
        priority: 2,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating test work order:', createError);
      return;
    }

    console.log('✅ Created test work order:', testId);

    // Now try to update it exactly like the code does
    console.log('\n🔄 Attempting to update with status and completed_at:');
    const { error: updateError } = await supabase
      .from('work_orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', testId);

    if (updateError) {
      console.error('❌ Update failed with error:', updateError);
      console.log('\nThis confirms the issue. The error suggests a database trigger is trying to set updated_at.');
      
      // Clean up test record
      await supabase.from('work_orders').delete().eq('id', testId);
      
      console.log('\n💡 SOLUTION: The work_orders table needs an updated_at column.');
      console.log('Run this SQL in Supabase SQL Editor:');
      console.log(`
-- Add updated_at column to work_orders table
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_work_orders_updated_at ON work_orders;
CREATE TRIGGER update_work_orders_updated_at 
BEFORE UPDATE ON work_orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
      `);
    } else {
      console.log('✅ Update successful! No issues found.');
      
      // Clean up test record
      await supabase.from('work_orders').delete().eq('id', testId);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkAndFixWorkOrdersTable();