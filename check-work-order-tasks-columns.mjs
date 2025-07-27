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

async function checkWorkOrderTasksColumns() {
  console.log('🔍 Checking work_order_tasks table structure...\n');

  try {
    // Get a sample work order task to see the structure
    console.log('📊 Sample work_order_tasks structure:');
    const { data: sampleTask, error: taskError } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (taskError) {
      console.error('Error fetching work order task:', taskError);
    } else if (sampleTask && sampleTask.length > 0) {
      console.log('Available columns:', Object.keys(sampleTask[0]));
      console.log('\nSample data:');
      console.log(JSON.stringify(sampleTask[0], null, 2));
    } else {
      console.log('No work order tasks found in the table');
    }

    // Try to insert a test task with pm_template_detail_id to see what happens
    console.log('\n🧪 Testing if pm_template_detail_id column exists...');
    
    const testData = {
      work_order_id: 'TEST-WO-CHECK',
      step_number: 1,
      task_description: 'Test task',
      status: 'pending',
      result_status: 'pending',
      pm_template_detail_id: 'TEST-DETAIL-ID' // This is the column that might be missing
    };

    console.log('Attempting to insert with pm_template_detail_id:', testData);

    // Note: We're not actually inserting, just checking the error
    const { error: insertError } = await supabase
      .from('work_order_tasks')
      .insert(testData)
      .select();

    if (insertError) {
      if (insertError.code === 'PGRST204') {
        console.error('❌ Column pm_template_detail_id does not exist in work_order_tasks table');
        console.log('\n💡 Solution: Remove pm_template_detail_id from the insert or add the column to the table');
      } else {
        console.log('Insert error (expected):', insertError.message);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkWorkOrderTasksColumns();