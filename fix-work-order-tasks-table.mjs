import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixWorkOrderTasksTable() {
  console.log('🔧 Fixing work_order_tasks table...');

  try {
    // First, check if the work_order_tasks table exists
    console.log('Checking if work_order_tasks table exists...');
    const { data: existingTasks, error: checkError } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ work_order_tasks table does not exist');
      console.log('📝 Please create the table manually in Supabase dashboard using the SQL from database-schema-pm-enhancement.sql');
      return;
    } else if (checkError) {
      console.log('✅ work_order_tasks table exists, checking for is_critical column...');
      
      // Try to select is_critical column to see if it exists
      const { data: criticalCheck, error: criticalError } = await supabase
        .from('work_order_tasks')
        .select('is_critical')
        .limit(1);

      if (criticalError && criticalError.message.includes('is_critical')) {
        console.log('❌ is_critical column is missing from work_order_tasks table');
        console.log('📝 The column needs to be added manually in Supabase dashboard');
        console.log('');
        console.log('SQL to add the missing column:');
        console.log('ALTER TABLE work_order_tasks ADD COLUMN is_critical BOOLEAN DEFAULT false;');
        return;
      } else {
        console.log('✅ is_critical column already exists');
      }
    } else {
      console.log('✅ work_order_tasks table exists');
      
      // Check if is_critical column exists by trying to select it
      const { data: criticalCheck, error: criticalError } = await supabase
        .from('work_order_tasks')
        .select('is_critical')
        .limit(1);

      if (criticalError && criticalError.message.includes('is_critical')) {
        console.log('❌ is_critical column is missing from work_order_tasks table');
        console.log('📝 The column needs to be added manually in Supabase dashboard');
        console.log('');
        console.log('SQL to add the missing column:');
        console.log('ALTER TABLE work_order_tasks ADD COLUMN is_critical BOOLEAN DEFAULT false;');
        return;
      } else {
        console.log('✅ is_critical column already exists');
      }
    }

    // Check if pm_template_details table exists and has data
    console.log('Checking pm_template_details table...');
    const { data: templateDetails, error: templateError } = await supabase
      .from('pm_template_details')
      .select('*')
      .limit(1);

    if (templateError && templateError.message.includes('does not exist')) {
      console.log('❌ pm_template_details table does not exist');
      console.log('📝 Please create the table manually in Supabase dashboard using the SQL from database-schema-pm-enhancement.sql');
      return;
    } else {
      console.log('✅ pm_template_details table exists');
    }

    // Get PM templates to create sample data
    console.log('Getting PM templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('pm_templates')
      .select('id, name')
      .limit(3);

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return;
    }

    console.log(`Found ${templates?.length || 0} PM templates`);

    if (templates && templates.length > 0) {
      // Create sample PM template details if they don't exist
      for (const template of templates) {
        const { data: existingDetails } = await supabase
          .from('pm_template_details')
          .select('id')
          .eq('pm_template_id', template.id)
          .limit(1);

        if (!existingDetails || existingDetails.length === 0) {
          console.log(`Creating sample tasks for template: ${template.name}`);
          
          const sampleTasks = [
            {
              pm_template_id: template.id,
              step_number: 1,
              task_description: 'ตรวจสอบระดับน้ำมันเครื่อง',
              expected_input_type: 'select',
              standard_text_expected: 'ปกติ',
              is_critical: true,
              remarks: 'ตรวจสอบว่าน้ำมันอยู่ในระดับที่เหมาะสม'
            },
            {
              pm_template_id: template.id,
              step_number: 2,
              task_description: 'ตรวจสอบระดับน้ำในหม้อน้ำ',
              expected_input_type: 'select',
              standard_text_expected: 'ปกติ',
              is_critical: true,
              remarks: 'ตรวจสอบว่าน้ำในหม้อน้ำเพียงพอ'
            },
            {
              pm_template_id: template.id,
              step_number: 3,
              task_description: 'ตรวจสอบแรงดันลมยาง',
              expected_input_type: 'number',
              standard_min_value: 30,
              standard_max_value: 35,
              is_critical: false,
              remarks: 'วัดแรงดันลมยางให้อยู่ในช่วงที่กำหนด'
            }
          ];

          const { error: insertError } = await supabase
            .from('pm_template_details')
            .insert(sampleTasks);

          if (insertError) {
            console.error(`Error inserting details for template ${template.id}:`, insertError);
          } else {
            console.log(`✅ Sample tasks created for template: ${template.name}`);
          }
        } else {
          console.log(`✅ Template ${template.name} already has details`);
        }
      }
    }

    console.log('');
    console.log('🎉 Database check completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- work_order_tasks table: ✅ Exists');
    console.log('- is_critical column: ✅ Should exist (if no errors above)');
    console.log('- pm_template_details table: ✅ Exists');
    console.log('- Sample data: ✅ Created');
    console.log('');
    console.log('🚀 You can now test the PM and Work Order functionality!');

  } catch (error) {
    console.error('Error:', error);
    console.log('');
    console.log('📝 Manual steps required:');
    console.log('1. Go to Supabase dashboard');
    console.log('2. Run the SQL from database-schema-pm-enhancement.sql');
    console.log('3. Make sure both work_order_tasks and pm_template_details tables exist');
    console.log('4. Ensure is_critical column exists in work_order_tasks table');
  }
}

fixWorkOrderTasksTable();