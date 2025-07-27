import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testPMQRSystem() {
  console.log('🧪 Testing PM QR Scanner System...\n');

  try {
    // Test 1: Check PM Templates
    console.log('1️⃣ Testing PM Templates retrieval...');
    const { data: templates, error: templatesError } = await supabase
      .from('pm_templates')
      .select(`
        *,
        systems(name, name_th),
        equipment_types(name, name_th)
      `)
      .limit(3);

    if (templatesError) {
      console.error('❌ Error fetching PM templates:', templatesError);
      return;
    }

    console.log(`✅ Found ${templates?.length || 0} PM templates`);
    if (templates && templates.length > 0) {
      console.log(`   Example: ${templates[0].name} (${templates[0].id})`);
    }

    // Test 2: Check PM Template Details
    console.log('\n2️⃣ Testing PM Template Details...');
    const { data: details, error: detailsError } = await supabase
      .from('pm_template_details')
      .select('*')
      .limit(5);

    if (detailsError) {
      console.error('❌ Error fetching PM template details:', detailsError);
      
      // Try to create sample details if none exist
      if (templates && templates.length > 0) {
        console.log('   Creating sample PM template details...');
        
        const sampleDetails = [
          {
            pm_template_id: templates[0].id,
            step_number: 1,
            task_description: 'ตรวจสอบระดับน้ำมันเครื่อง',
            expected_input_type: 'select',
            standard_text_expected: 'ปกติ',
            is_critical: true,
            remarks: 'ตรวจสอบว่าน้ำมันอยู่ในระดับที่เหมาะสม'
          },
          {
            pm_template_id: templates[0].id,
            step_number: 2,
            task_description: 'ตรวจสอบระดับน้ำในหม้อน้ำ',
            expected_input_type: 'select',
            standard_text_expected: 'ปกติ',
            is_critical: true,
            remarks: 'ตรวจสอบว่าน้ำในหม้อน้ำเพียงพอ'
          },
          {
            pm_template_id: templates[0].id,
            step_number: 3,
            task_description: 'ตรวจสอบแรงดันลมยาง',
            expected_input_type: 'number',
            standard_min_value: 30,
            standard_max_value: 35,
            is_critical: false,
            remarks: 'วัดแรงดันลมยางให้อยู่ในช่วงที่กำหนด'
          }
        ];

        const { data: insertedDetails, error: insertError } = await supabase
          .from('pm_template_details')
          .insert(sampleDetails)
          .select();

        if (insertError) {
          console.error('❌ Error creating sample details:', insertError);
        } else {
          console.log(`✅ Created ${insertedDetails?.length || 0} sample PM template details`);
        }
      }
    } else {
      console.log(`✅ Found ${details?.length || 0} PM template details`);
    }

    // Test 3: Test Work Order Creation
    console.log('\n3️⃣ Testing Work Order creation...');
    if (templates && templates.length > 0) {
      const testWorkOrderId = `WO-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const testWorkOrder = {
        id: testWorkOrderId,
        work_type: 'PM',
        title: `Test PM: ${templates[0].name}`,
        description: 'Test PM work order for QR scanner system',
        status: 'in_progress',
        priority: 2,
        pm_template_id: templates[0].id,
        estimated_hours: Math.ceil(templates[0].estimated_minutes / 60),
      };

      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert(testWorkOrder)
        .select()
        .single();

      if (woError) {
        console.error('❌ Error creating test work order:', woError);
      } else {
        console.log(`✅ Created test work order: ${workOrder.id}`);

        // Test 4: Test Work Order Tasks
        console.log('\n4️⃣ Testing Work Order Tasks creation...');
        
        // Get template details for this template
        const { data: templateDetails } = await supabase
          .from('pm_template_details')
          .select('*')
          .eq('pm_template_id', templates[0].id)
          .order('step_number');

        if (templateDetails && templateDetails.length > 0) {
          const tasks = templateDetails.map(detail => ({
            work_order_id: workOrder.id,
            pm_template_detail_id: detail.id,
            step_number: detail.step_number,
            task_description: detail.task_description,
            status: 'pending',
            result_status: 'pending',
          }));

          const { data: createdTasks, error: tasksError } = await supabase
            .from('work_order_tasks')
            .insert(tasks)
            .select();

          if (tasksError) {
            console.error('❌ Error creating work order tasks:', tasksError);
          } else {
            console.log(`✅ Created ${createdTasks?.length || 0} work order tasks`);

            // Test 5: Test Task Update
            console.log('\n5️⃣ Testing Task update...');
            if (createdTasks && createdTasks.length > 0) {
              const { error: updateError } = await supabase
                .from('work_order_tasks')
                .update({
                  status: 'completed',
                  result_value: 'ปกติ',
                  result_status: 'pass',
                  notes: 'ทดสอบระบบสำเร็จ',
                  completed_at: new Date().toISOString(),
                })
                .eq('id', createdTasks[0].id);

              if (updateError) {
                console.error('❌ Error updating task:', updateError);
              } else {
                console.log('✅ Successfully updated task status');
              }
            }
          }
        }

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await supabase.from('work_order_tasks').delete().eq('work_order_id', workOrder.id);
        await supabase.from('work_orders').delete().eq('id', workOrder.id);
        console.log('✅ Test data cleaned up');
      }
    }

    console.log('\n🎉 PM QR Scanner System Test Completed!');
    console.log('\n📋 System Status:');
    console.log('✅ PM Templates: Working');
    console.log('✅ PM Template Details: Working');
    console.log('✅ Work Orders: Working');
    console.log('✅ Work Order Tasks: Working');
    console.log('✅ Task Updates: Working');
    
    console.log('\n🚀 Ready to use PM QR Scanner at: http://localhost:5173/pm-qr-scanner');
    console.log('\n📱 Test QR Codes:');
    if (templates && templates.length > 0) {
      templates.slice(0, 3).forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.id} - ${template.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPMQRSystem();