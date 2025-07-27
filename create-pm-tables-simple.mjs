import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createPMTables() {
  console.log('Creating PM tables using direct approach...');

  try {
    // First, let's check if tables exist by trying to query them
    console.log('Checking if pm_template_details table exists...');
    const { data: templateDetailsCheck, error: templateDetailsError } = await supabase
      .from('pm_template_details')
      .select('*')
      .limit(1);

    if (templateDetailsError && templateDetailsError.message.includes('does not exist')) {
      console.log('❌ pm_template_details table does not exist');
    } else {
      console.log('✅ pm_template_details table already exists');
    }

    console.log('Checking if work_order_tasks table exists...');
    const { data: workOrderTasksCheck, error: workOrderTasksError } = await supabase
      .from('work_order_tasks')
      .select('*')
      .limit(1);

    if (workOrderTasksError && workOrderTasksError.message.includes('does not exist')) {
      console.log('❌ work_order_tasks table does not exist');
    } else {
      console.log('✅ work_order_tasks table already exists');
    }

    // Since we can't create tables directly via Supabase client, let's create sample data
    // for existing PM templates using the pm_template_details structure we expect

    console.log('Creating sample PM template details...');
    
    // Get existing PM templates
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
      // Try to insert sample data to test if tables exist
      const sampleDetail = {
        id: 'test-detail-' + Date.now(),
        pm_template_id: templates[0].id,
        step_number: 1,
        task_description: 'ตรวจสอบระดับน้ำมันเครื่อง',
        expected_input_type: 'select',
        standard_text_expected: 'ปกติ',
        is_critical: true,
        remarks: 'ตรวจสอบว่าน้ำมันอยู่ในระดับที่เหมาะสม'
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('pm_template_details')
        .insert(sampleDetail)
        .select();

      if (insertError) {
        console.error('Error inserting sample detail:', insertError);
        console.log('📝 Tables may need to be created manually in Supabase dashboard');
      } else {
        console.log('✅ Successfully inserted sample PM template detail');
        
        // Clean up the test record
        await supabase
          .from('pm_template_details')
          .delete()
          .eq('id', sampleDetail.id);
        
        console.log('🧹 Cleaned up test record');
      }
    }

    console.log('🎉 PM tables check completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. If tables don\'t exist, create them manually in Supabase dashboard');
    console.log('2. Use the SQL from database-schema-pm-enhancement.sql');
    console.log('3. Test the PM QR Scanner at /pm-qr-scanner');

  } catch (error) {
    console.error('Error:', error);
  }
}

createPMTables();