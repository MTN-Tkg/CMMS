import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Create a work order from PM template with automatic data population
 * This demonstrates the multi-company auto-fill functionality
 */
async function createWorkOrderFromPMTemplate(pmTemplateId, assetId, userId) {
  console.log('🚀 Creating Work Order from PM Template with Auto-fill...\n');
  
  try {
    // Step 1: Get PM Template with all related data
    console.log('📋 Fetching PM Template details...');
    const { data: pmTemplate, error: pmError } = await supabase
      .from('pm_templates')
      .select(`
        *,
        company:companies(id, name, code),
        system:systems(id, name, code),
        equipment_type:equipment_types(id, name)
      `)
      .eq('id', pmTemplateId)
      .single();

    if (pmError) throw pmError;
    console.log(`✅ PM Template: ${pmTemplate.name} (Company: ${pmTemplate.company.name})`);

    // Step 2: Get Asset with all related data
    console.log('\n📋 Fetching Asset details...');
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        *,
        system:systems(
          id,
          name,
          code,
          location_id,
          company_id,
          location:locations(id, name, code),
          company:companies(id, name, code)
        ),
        equipment_type:equipment_types(id, name)
      `)
      .eq('id', assetId)
      .single();

    if (assetError) throw assetError;
    console.log(`✅ Asset: ${asset.serial_number}`);
    console.log(`   - Company: ${asset.system.company.name}`);
    console.log(`   - System: ${asset.system.name}`);
    console.log(`   - Location: ${asset.system.location.name}`);
    console.log(`   - Equipment Type: ${asset.equipment_type.name}`);

    // Step 3: Validate company consistency
    if (pmTemplate.company_id !== asset.system.company_id) {
      console.warn('⚠️  Warning: PM Template and Asset belong to different companies!');
      console.log(`   PM Template Company: ${pmTemplate.company.name}`);
      console.log(`   Asset Company: ${asset.system.company.name}`);
    }

    // Step 4: Generate work order number
    const woNumber = `PM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Step 5: Create Work Order with auto-populated data
    console.log('\n📝 Creating Work Order with auto-filled data...');
    const workOrderData = {
      // Auto-populated from PM Template
      pm_template_id: pmTemplateId,
      title: `PM - ${pmTemplate.name} - ${asset.serial_number}`,
      description: pmTemplate.description || `Preventive maintenance for ${asset.serial_number}`,
      work_type: 'PM',
      estimated_hours: (pmTemplate.estimated_minutes || 60) / 60,
      
      // Auto-populated from Asset (including company)
      asset_id: assetId,
      company_id: asset.system.company_id, // Auto-filled company
      system_id: asset.system_id,
      location_id: asset.system.location_id,
      
      // Default values
      status: 'scheduled',
      priority: 'medium',
      wo_number: woNumber,
      requested_by_user_id: userId,
      
      // Scheduling
      scheduled_date: calculateNextDueDate(pmTemplate.frequency_type, pmTemplate.frequency_value),
      created_at: new Date().toISOString()
    };

    console.log('📊 Auto-filled Work Order Data:');
    console.log(`   - Company: ${asset.system.company.name} (ID: ${workOrderData.company_id})`);
    console.log(`   - System: ${asset.system.name} (ID: ${workOrderData.system_id})`);
    console.log(`   - Location: ${asset.system.location.name} (ID: ${workOrderData.location_id})`);
    console.log(`   - Asset: ${asset.serial_number} (ID: ${workOrderData.asset_id})`);
    console.log(`   - Title: ${workOrderData.title}`);
    console.log(`   - WO Number: ${workOrderData.wo_number}`);

    const { data: newWorkOrder, error: woError } = await supabase
      .from('work_orders')
      .insert(workOrderData)
      .select()
      .single();

    if (woError) throw woError;
    console.log(`\n✅ Work Order created successfully! ID: ${newWorkOrder.id}`);

    // Step 6: Copy PM template details to work order tasks
    console.log('\n📋 Copying PM template tasks...');
    const { data: templateDetails, error: detailsError } = await supabase
      .from('pm_template_details')
      .select('*')
      .eq('pm_template_id', pmTemplateId)
      .order('step_number');

    if (detailsError) throw detailsError;

    if (templateDetails && templateDetails.length > 0) {
      const workOrderTasks = templateDetails.map((detail, index) => ({
        work_order_id: newWorkOrder.id,
        description: detail.task_description,
        is_critical: detail.is_critical || false,
        is_completed: false
      }));

      const { error: tasksError } = await supabase
        .from('work_order_tasks')
        .insert(workOrderTasks);

      if (tasksError) throw tasksError;
      console.log(`✅ Created ${workOrderTasks.length} tasks for the work order`);
    }

    // Step 7: Create PM schedule if needed
    console.log('\n📅 Creating PM Schedule for future automation...');
    const pmScheduleData = {
      company_id: asset.system.company_id,
      pm_template_id: pmTemplateId,
      asset_id: assetId,
      frequency_type: pmTemplate.frequency_type || 'monthly',
      frequency_value: pmTemplate.frequency_value || 1,
      next_due_date: calculateNextDueDate(
        pmTemplate.frequency_type || 'monthly', 
        pmTemplate.frequency_value || 1
      ),
      auto_priority: 'medium',
      lead_time_days: 7,
      is_active: true,
      created_by: userId
    };

    const { data: pmSchedule, error: scheduleError } = await supabase
      .from('pm_schedules')
      .insert(pmScheduleData)
      .select()
      .single();

    if (scheduleError) {
      if (scheduleError.code === '23505') { // Unique constraint violation
        console.log('ℹ️  PM Schedule already exists for this template and asset');
      } else {
        console.log('⚠️  Could not create PM Schedule:', scheduleError.message);
      }
    } else {
      console.log(`✅ PM Schedule created! Next due date: ${pmSchedule.next_due_date}`);
    }

    return newWorkOrder;

  } catch (error) {
    console.error('❌ Error creating work order:', error);
    throw error;
  }
}

/**
 * Get all companies accessible to a user
 */
async function getUserCompanies(userId) {
  console.log('🏢 Fetching user\'s accessible companies...\n');
  
  try {
    // Get primary company from user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company:companies(*)')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    // Get additional companies from user_companies
    const { data: additionalCompanies, error: companiesError } = await supabase
      .from('user_companies')
      .select('company:companies(*), role')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (companiesError) throw companiesError;

    const companies = [];
    
    // Add primary company
    if (userProfile?.company) {
      companies.push({
        ...userProfile.company,
        access_type: 'primary',
        role: userProfile.role
      });
    }

    // Add additional companies
    if (additionalCompanies) {
      additionalCompanies.forEach(uc => {
        companies.push({
          ...uc.company,
          access_type: 'secondary',
          role: uc.role
        });
      });
    }

    console.log(`✅ User has access to ${companies.length} companies:`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.code}) - ${company.access_type} access, role: ${company.role}`);
    });

    return companies;

  } catch (error) {
    console.error('❌ Error fetching user companies:', error);
    throw error;
  }
}

/**
 * Get company-specific statistics
 */
async function getCompanyStatistics(companyId) {
  console.log('📊 Fetching company statistics...\n');
  
  try {
    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;
    console.log(`Company: ${company.name} (${company.code})`);

    // Get statistics using the view
    const { data: stats, error: statsError } = await supabase
      .from('company_work_order_stats')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (statsError) throw statsError;

    console.log('\n📈 Statistics:');
    console.log(`   Work Orders:`);
    console.log(`   - Total: ${stats.total_work_orders}`);
    console.log(`   - Open: ${stats.open_work_orders}`);
    console.log(`   - In Progress: ${stats.in_progress_work_orders}`);
    console.log(`   - Completed: ${stats.completed_work_orders}`);
    console.log(`   - PM Work Orders: ${stats.pm_work_orders}`);
    console.log(`   - CM Work Orders: ${stats.cm_work_orders}`);
    console.log(`\n   Assets:`);
    console.log(`   - Total: ${stats.total_assets}`);
    console.log(`   - Active: ${stats.active_assets}`);
    console.log(`\n   Infrastructure:`);
    console.log(`   - Locations: ${stats.total_locations}`);
    console.log(`   - Systems: ${stats.total_systems}`);
    console.log(`\n   PM Management:`);
    console.log(`   - PM Templates: ${stats.total_pm_templates}`);
    console.log(`   - PM Schedules: ${stats.total_pm_schedules}`);
    console.log(`   - Active Schedules: ${stats.active_pm_schedules}`);

    return stats;

  } catch (error) {
    console.error('❌ Error fetching company statistics:', error);
    throw error;
  }
}

/**
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(frequencyType, frequencyValue) {
  const today = new Date();
  const nextDate = new Date(today);
  
  switch (frequencyType) {
    case 'daily':
      nextDate.setDate(today.getDate() + frequencyValue);
      break;
    case 'weekly':
      nextDate.setDate(today.getDate() + (frequencyValue * 7));
      break;
    case 'monthly':
      nextDate.setMonth(today.getMonth() + frequencyValue);
      break;
    case 'quarterly':
      nextDate.setMonth(today.getMonth() + (frequencyValue * 3));
      break;
    case 'yearly':
      nextDate.setFullYear(today.getFullYear() + frequencyValue);
      break;
    default:
      nextDate.setMonth(today.getMonth() + 1); // Default to monthly
  }
  
  return nextDate.toISOString().split('T')[0];
}

/**
 * Example usage
 */
async function runExample() {
  console.log('='.repeat(60));
  console.log('Multi-Company Work Order & PM System Demo');
  console.log('='.repeat(60));
  console.log('\n');

  try {
    // Example user ID (replace with actual user ID)
    const userId = 'example-user-id';
    
    // 1. Get user's companies
    const companies = await getUserCompanies(userId);
    console.log('\n' + '='.repeat(60) + '\n');

    // 2. Get statistics for first company
    if (companies.length > 0) {
      await getCompanyStatistics(companies[0].id);
      console.log('\n' + '='.repeat(60) + '\n');
    }

    // 3. Create work order from PM template (example IDs)
    // Replace these with actual IDs from your database
    const examplePMTemplateId = 'pm-template-id';
    const exampleAssetId = 'asset-id';
    
    // Uncomment to test work order creation
    // await createWorkOrderFromPMTemplate(examplePMTemplateId, exampleAssetId, userId);

    console.log('\n✅ Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('1. Multi-company user access');
    console.log('2. Company-specific statistics');
    console.log('3. Auto-fill functionality from PM templates');
    console.log('4. Automatic population of company, system, location, and asset data');
    console.log('5. PM schedule creation for automation');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample();
}

// Export functions for use in other modules
export {
  createWorkOrderFromPMTemplate,
  getUserCompanies,
  getCompanyStatistics,
  calculateNextDueDate
};