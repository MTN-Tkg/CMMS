import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runSqlQueries() {
  try {
    // Add actual_hours to work_orders
    const { error: error1 } = await supabase
      .from('sql_queries')
      .insert([{ 
        sql: "ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;" 
      }]);

    if (error1) {
      console.error('Error adding actual_hours:', error1);
    } else {
      console.log('✅ Added actual_hours to work_orders');
    }

    // Add is_critical to work_order_tasks
    const { error: error2 } = await supabase
      .from('sql_queries')
      .insert([{ 
        sql: "ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;" 
      }]);

    if (error2) {
      console.error('Error adding is_critical:', error2);
    } else {
      console.log('✅ Added is_critical to work_order_tasks');
    }

    console.log('🎉 Missing columns added successfully!');
  } catch (error) {
    console.error('Error running SQL queries:', error);
  }
}

runSqlQueries();