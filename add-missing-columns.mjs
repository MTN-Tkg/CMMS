import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addMissingColumns() {
  try {
    // Add actual_hours to work_orders
    const { error: woError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;"
    });

    if (woError) {
      console.error('Error adding actual_hours to work_orders:', woError);
    } else {
      console.log('✅ Added actual_hours to work_orders');
    }

    // Add is_critical to work_order_tasks
    const { error: taskError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;"
    });

    if (taskError) {
      console.error('Error adding is_critical to work_order_tasks:', taskError);
    } else {
      console.log('✅ Added is_critical to work_order_tasks');
    }

    console.log('🎉 Missing columns added successfully!');
  } catch (error) {
    console.error('Error adding missing columns:', error);
  }
}

addMissingColumns();