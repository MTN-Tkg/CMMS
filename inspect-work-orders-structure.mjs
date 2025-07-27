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

async function inspectWorkOrdersStructure() {
  console.log('🔍 Inspecting work_orders and work_order_tasks table structures...\n');

  try {
    // 1. Check work_orders table structure
    console.log('📊 WORK_ORDERS TABLE STRUCTURE:');
    console.log('================================');
    
    const { data: workOrderSample, error: woError } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (woError) {
      console.error('Error fetching work order:', woError);
    } else if (workOrderSample && workOrderSample.length > 0) {
      console.log('Available columns in work_orders:');
      const woColumns = Object.keys(workOrderSample[0]);
      woColumns.forEach(col => console.log(`  - ${col}`));
      
      console.log('\nSample work_order data:');
      console.log(JSON.stringify(workOrderSample[0], null, 2));
    } else {
      console.log('No work orders found in the table');
      
      // Try to get column info from an insert error
      console.log('\nTrying to discover columns through insert test...');
      const { error: insertError } = await supabase
        .from('work_orders')
        .insert({
          id: 'TEST-STRUCTURE-CHECK',
          title: 'Test',
          status: 'pending'
        })
        .select();
      
      if (insertError) {
        console.log('Insert error message:', insertError.message);
      }
    }

    // 2. Check work_order_tasks table structure
    console.log('\n\n📊 WORK_ORDER_TASKS TABLE STRUCTURE:');
    console.log('=====================================');
    
    const { data: taskSample, error: taskError } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (taskError) {
      console.error('Error fetching work order task:', taskError);
    } else if (taskSample && taskSample.length > 0) {
      console.log('Available columns in work_order_tasks:');
      const taskColumns = Object.keys(taskSample[0]);
      taskColumns.forEach(col => console.log(`  - ${col}`));
      
      console.log('\nSample work_order_task data:');
      console.log(JSON.stringify(taskSample[0], null, 2));
    } else {
      console.log('No work order tasks found in the table');
      
      // Try to get column info from an insert error
      console.log('\nTrying to discover columns through insert test...');
      const { error: insertError } = await supabase
        .from('work_order_tasks')
        .insert({
          id: 'TEST-TASK-STRUCTURE',
          work_order_id: 'TEST-WO',
          description: 'Test task'
        })
        .select();
      
      if (insertError) {
        console.log('Insert error message:', insertError.message);
      }
    }

    // 3. Test specific fields that might be causing issues
    console.log('\n\n🧪 TESTING SPECIFIC FIELD UPDATES:');
    console.log('===================================');
    
    // Test updating work_orders with various fields
    console.log('\nTesting work_orders update with completed_at:');
    const { error: updateError1 } = await supabase
      .from('work_orders')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', 'non-existent-id');
    
    if (updateError1) {
      console.log('Update error:', updateError1.message);
    } else {
      console.log('✅ completed_at field exists in work_orders');
    }

    console.log('\nTesting work_orders update with updated_at:');
    const { error: updateError2 } = await supabase
      .from('work_orders')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 'non-existent-id');
    
    if (updateError2) {
      console.log('Update error:', updateError2.message);
    } else {
      console.log('✅ updated_at field exists in work_orders');
    }

    // 4. Check if there are any triggers or RLS policies
    console.log('\n\n🔒 CHECKING FOR TRIGGERS/POLICIES:');
    console.log('==================================');
    console.log('Note: The "record \\"new\\" has no field \\"updated_at\\"" error typically indicates');
    console.log('a database trigger trying to set updated_at on a table that doesn\'t have this column.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the inspection
inspectWorkOrdersStructure();