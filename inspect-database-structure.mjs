import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function inspectDatabaseStructure() {
  console.log('🔍 Inspecting Supabase database structure...');
  console.log('');

  try {
    // Check work_orders table structure
    console.log('📋 Checking work_orders table...');
    const { data: workOrders, error: woError } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (woError) {
      console.log('❌ work_orders table error:', woError.message);
    } else {
      console.log('✅ work_orders table exists');
      if (workOrders && workOrders.length > 0) {
        console.log('📊 Sample work_orders columns:', Object.keys(workOrders[0]));
      }
    }

    // Check work_order_tasks table structure
    console.log('');
    console.log('📋 Checking work_order_tasks table...');
    const { data: workOrderTasks, error: wotError } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (wotError) {
      console.log('❌ work_order_tasks table error:', wotError.message);
    } else {
      console.log('✅ work_order_tasks table exists');
      if (workOrderTasks && workOrderTasks.length > 0) {
        console.log('📊 work_order_tasks columns:', Object.keys(workOrderTasks[0]));
      } else {
        console.log('📊 work_order_tasks table is empty, checking structure...');
        // Try to get table structure by attempting to insert a test record
        const testRecord = {
          work_order_id: 'test',
          step_number: 1,
          task_description: 'test',
          status: 'pending',
          result_status: 'pending'
        };
        
        const { error: insertError } = await supabase
          .from('work_order_tasks')
          .insert(testRecord)
          .select();
        
        if (insertError) {
          console.log('📊 work_order_tasks structure error:', insertError.message);
          if (insertError.message.includes('is_critical')) {
            console.log('❌ is_critical column is missing');
          }
        }
      }
    }

    // Check pm_templates table
    console.log('');
    console.log('📋 Checking pm_templates table...');
    const { data: pmTemplates, error: pmError } = await supabase
      .from('pm_templates')
      .select('*')
      .limit(1);

    if (pmError) {
      console.log('❌ pm_templates table error:', pmError.message);
    } else {
      console.log('✅ pm_templates table exists');
      if (pmTemplates && pmTemplates.length > 0) {
        console.log('📊 pm_templates columns:', Object.keys(pmTemplates[0]));
      }
    }

    // Check pm_template_details table
    console.log('');
    console.log('📋 Checking pm_template_details table...');
    const { data: pmTemplateDetails, error: ptdError } = await supabase
      .from('pm_template_details')
      .select('*')
      .limit(1);

    if (ptdError) {
      console.log('❌ pm_template_details table error:', ptdError.message);
    } else {
      console.log('✅ pm_template_details table exists');
      if (pmTemplateDetails && pmTemplateDetails.length > 0) {
        console.log('📊 pm_template_details columns:', Object.keys(pmTemplateDetails[0]));
      }
    }

    // Check assets table
    console.log('');
    console.log('📋 Checking assets table...');
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .limit(1);

    if (assetsError) {
      console.log('❌ assets table error:', assetsError.message);
    } else {
      console.log('✅ assets table exists');
      if (assets && assets.length > 0) {
        console.log('📊 assets columns:', Object.keys(assets[0]));
      }
    }

    // List all tables in the public schema
    console.log('');
    console.log('📋 Listing all tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('❌ Cannot list tables:', tablesError.message);
    } else {
      console.log('📊 Available tables:');
      tables?.forEach(table => console.log(`- ${table.table_name}`));
    }

    console.log('');
    console.log('🎯 Summary:');
    console.log('Based on the inspection above, I will now adapt the code to work with the actual database structure.');

  } catch (error) {
    console.error('❌ Inspection error:', error);
  }
}

inspectDatabaseStructure();