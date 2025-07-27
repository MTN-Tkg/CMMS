import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Simple function to create work order with auto-filled company data
 */
async function createWorkOrderWithAutoFill(assetId, workOrderData = {}) {
  console.log('🚀 Creating Work Order with Auto-fill...\n');
  
  try {
    // Step 1: Get asset with system and company info
    console.log('📋 Fetching asset information...');
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        *,
        system:systems(
          id,
          name,
          location_id,
          company_id,
          company:companies(id, name, code),
          location:locations(id, name)
        )
      `)
      .eq('id', assetId)
      .single();

    if (assetError) throw assetError;

    console.log(`✅ Asset: ${asset.serial_number}`);
    console.log(`   Company: ${asset.system.company.name} (${asset.system.company_id})`);
    console.log(`   System: ${asset.system.name}`);
    console.log(`   Location: ${asset.system.location?.name || 'N/A'}`);

    // Step 2: Create work order with auto-filled data
    const woNumber = `WO-${Date.now()}`;
    
    const newWorkOrder = {
      // Auto-filled from asset relationships
      company_id: asset.system.company_id,  // Auto-filled
      system_id: asset.system_id,           // Auto-filled
      location_id: asset.system.location_id, // Auto-filled
      asset_id: assetId,
      
      // Work order specific data
      wo_number: woNumber,
      title: workOrderData.title || `Maintenance for ${asset.serial_number}`,
      description: workOrderData.description || '',
      work_type: workOrderData.work_type || 'CM',
      status: 'open',
      priority: workOrderData.priority || 'medium',
      
      // Optional PM template
      pm_template_id: workOrderData.pm_template_id || null,
      
      // Timestamps
      created_at: new Date().toISOString(),
      scheduled_date: workOrderData.scheduled_date || new Date().toISOString()
    };

    console.log('\n📝 Creating work order...');
    const { data: createdWO, error: woError } = await supabase
      .from('work_orders')
      .insert(newWorkOrder)
      .select()
      .single();

    if (woError) throw woError;

    console.log(`\n✅ Work Order created successfully!`);
    console.log(`   WO Number: ${createdWO.wo_number}`);
    console.log(`   Company: ${asset.system.company.name}`);
    console.log(`   System: ${asset.system.name}`);
    console.log(`   Asset: ${asset.serial_number}`);

    return createdWO;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Create work order from PM template with auto-fill
 */
async function createPMWorkOrder(pmTemplateId, assetId) {
  console.log('🔧 Creating PM Work Order...\n');
  
  try {
    // Get PM template
    const { data: pmTemplate, error: pmError } = await supabase
      .from('pm_templates')
      .select('*')
      .eq('id', pmTemplateId)
      .single();

    if (pmError) throw pmError;

    // Create work order with PM template data
    const workOrder = await createWorkOrderWithAutoFill(assetId, {
      pm_template_id: pmTemplateId,
      title: `PM - ${pmTemplate.name}`,
      description: pmTemplate.description,
      work_type: 'PM',
      priority: 'medium'
    });

    // Copy PM template tasks
    console.log('\n📋 Copying PM template tasks...');
    const { data: templateTasks, error: tasksError } = await supabase
      .from('pm_template_details')
      .select('*')
      .eq('pm_template_id', pmTemplateId)
      .order('step_number');

    if (!tasksError && templateTasks.length > 0) {
      const workOrderTasks = templateTasks.map(task => ({
        work_order_id: workOrder.id,
        description: task.task_description,
        is_critical: task.is_critical || false,
        is_completed: false
      }));

      await supabase
        .from('work_order_tasks')
        .insert(workOrderTasks);

      console.log(`✅ Created ${workOrderTasks.length} tasks`);
    }

    return workOrder;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Get work orders by company
 */
async function getWorkOrdersByCompany(companyId) {
  console.log(`📊 Getting work orders for company: ${companyId}\n`);
  
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        company:companies(name, code),
        system:systems(name),
        location:locations(name),
        asset:assets(serial_number)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    console.log(`Found ${workOrders.length} work orders:`);
    workOrders.forEach(wo => {
      console.log(`\n📋 ${wo.wo_number}`);
      console.log(`   Title: ${wo.title}`);
      console.log(`   Company: ${wo.company.name}`);
      console.log(`   System: ${wo.system?.name || 'N/A'}`);
      console.log(`   Asset: ${wo.asset?.serial_number || 'N/A'}`);
      console.log(`   Status: ${wo.status}`);
    });

    return workOrders;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Example usage
 */
async function runExamples() {
  console.log('='.repeat(60));
  console.log('Simple Company Auto-fill Examples');
  console.log('='.repeat(60));
  console.log('\n');

  try {
    // Example 1: Create a simple work order
    console.log('Example 1: Create Work Order with Auto-fill');
    console.log('-'.repeat(40));
    
    // Replace with actual asset ID from your database
    const assetId = 'LAK-GEN-01';
    
    const workOrder = await createWorkOrderWithAutoFill(assetId, {
      title: 'Routine Inspection',
      description: 'Monthly equipment check',
      work_type: 'CM',
      priority: 'medium'
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Example 2: Get work orders by company
    console.log('Example 2: Get Work Orders by Company');
    console.log('-'.repeat(40));
    
    await getWorkOrdersByCompany('LAK');

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Examples completed!');
    
    console.log('\n📌 Key Points:');
    console.log('1. Company ID is automatically filled from asset → system → company');
    console.log('2. System ID and Location ID are also auto-filled');
    console.log('3. No complex user-company management needed');
    console.log('4. Simple and straightforward implementation');

  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

// Export functions for use in other modules
export {
  createWorkOrderWithAutoFill,
  createPMWorkOrder,
  getWorkOrdersByCompany
};