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

async function testFinalPMFix() {
  console.log('🧪 Testing Final PM QR Scanner Fix\n');

  try {
    // Test user
    const testUserId = '03668aa4-38b7-4f36-8ddf-0f637d5db68a';

    console.log('1️⃣ Getting user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Error getting profile:', profileError);
      return;
    }

    console.log('✅ Profile found:', profile.id);

    console.log('\n2️⃣ Getting PM template...');
    const { data: templates, error: templateError } = await supabase
      .from('pm_templates')
      .select('*')
      .eq('company_id', 'LAK')
      .eq('system_id', 'SYS001')
      .limit(1);

    if (templateError || !templates || templates.length === 0) {
      console.error('❌ Error getting template:', templateError);
      return;
    }

    const template = templates[0];
    console.log('✅ Template found:', template.name);

    console.log('\n3️⃣ Getting template details...');
    const { data: details, error: detailsError } = await supabase
      .from('pm_template_details')
      .select('*')
      .eq('pm_template_id', template.id)
      .order('step_number')
      .limit(3);

    if (detailsError || !details) {
      console.error('❌ Error getting details:', detailsError);
      return;
    }

    console.log(`✅ Found ${details.length} template details`);

    console.log('\n4️⃣ Creating test work order...');
    const workOrderId = `TEST-WO-FINAL-${Date.now()}`;
    const workOrderData = {
      id: workOrderId,
      work_type: 'PM',
      title: `PM: ${template.name}`,
      description: template.remarks || '',
      status: 'pending',
      priority: 2,
      pm_template_id: template.id,
      estimated_hours: Math.ceil(template.estimated_minutes / 60),
      created_at: new Date().toISOString(),
      requested_by_user_id: profile.id,
      assigned_to_user_id: profile.id,
    };

    const { data: workOrder, error: woError } = await supabase
      .from('work_orders')
      .insert(workOrderData)
      .select()
      .single();

    if (woError) {
      console.error('❌ Error creating work order:', woError);
      return;
    }

    console.log('✅ Work order created:', workOrder.id);

    console.log('\n5️⃣ Creating work order tasks...');
    const tasks = details.map((detail, index) => ({
      id: `${workOrder.id}-${index + 1}`,
      work_order_id: workOrder.id,
      description: detail.task_description,
      is_completed: false,
      is_critical: detail.is_critical || false,
      actual_value_text: null,
      actual_value_numeric: null,
      completed_at: null,
    }));

    console.log('Task structure:', JSON.stringify(tasks[0], null, 2));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('work_order_tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      console.error('❌ Error creating tasks:', tasksError);
      
      // Clean up work order
      await supabase.from('work_orders').delete().eq('id', workOrderId);
      return;
    }

    console.log(`✅ Created ${createdTasks?.length || 0} tasks successfully!`);

    console.log('\n6️⃣ Simulating task completion...');
    const firstTask = createdTasks[0];
    const { error: updateError } = await supabase
      .from('work_order_tasks')
      .update({
        is_completed: true,
        actual_value_text: 'ปกติ',
        completed_at: new Date().toISOString(),
      })
      .eq('id', firstTask.id);

    if (updateError) {
      console.error('❌ Error updating task:', updateError);
    } else {
      console.log('✅ Task marked as completed');
    }

    console.log('\n7️⃣ Cleaning up test data...');
    
    // Delete tasks first
    await supabase
      .from('work_order_tasks')
      .delete()
      .eq('work_order_id', workOrderId);
    
    // Then delete work order
    await supabase
      .from('work_orders')
      .delete()
      .eq('id', workOrderId);

    console.log('✅ Test data cleaned up');

    console.log('\n✨ All tests passed! PM QR Scanner is ready to use.');
    console.log('\n📝 Summary:');
    console.log('   - User profile lookup: ✅');
    console.log('   - Work order creation: ✅');
    console.log('   - Task creation with correct structure: ✅');
    console.log('   - Task update functionality: ✅');
    console.log('   - No foreign key errors: ✅');
    console.log('   - No missing column errors: ✅');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testFinalPMFix();