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

async function checkWorkOrderTasksTable() {
  console.log('🔍 Checking if work_order_tasks table exists...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table work_order_tasks does not exist!');
        console.log('\n💡 The table needs to be created. Here\'s a suggested structure:\n');
        
        console.log(`CREATE TABLE work_order_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id),
  step_number INTEGER NOT NULL,
  task_description TEXT NOT NULL,
  expected_input_type TEXT,
  standard_text_expected TEXT,
  standard_min_value NUMERIC,
  standard_max_value NUMERIC,
  is_critical BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  result_value TEXT,
  result_status TEXT DEFAULT 'pending',
  notes TEXT,
  photo_urls TEXT[],
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      } else {
        console.error('Error querying table:', error);
      }
    } else {
      console.log('✅ Table work_order_tasks exists');
      
      if (data && data.length > 0) {
        console.log('\nAvailable columns:');
        console.log(Object.keys(data[0]));
        
        console.log('\nSample data structure:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('\nTable exists but is empty. Checking structure...');
        
        // Try to insert a dummy record to see what columns are accepted
        const testData = {
          work_order_id: 'TEST-WO',
          step_number: 1,
          task_description: 'Test',
          status: 'pending',
          result_status: 'pending'
        };
        
        const { error: insertError } = await supabase
          .from('work_order_tasks')
          .insert(testData);
          
        if (insertError) {
          console.log('\nInsert test error:', insertError.message);
        } else {
          console.log('\n✅ Basic insert structure works');
          
          // Clean up
          await supabase
            .from('work_order_tasks')
            .delete()
            .eq('work_order_id', 'TEST-WO');
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkWorkOrderTasksTable();