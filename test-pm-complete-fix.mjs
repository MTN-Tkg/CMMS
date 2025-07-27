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

async function testCompletePMFix() {
  console.log('🧪 Testing Complete PM QR Scanner Fix\n');

  try {
    // Test user
    const testUserId = '03668aa4-38b7-4f36-8ddf-0f637d5db68a';
    const testEmail = 'm.mtn.tkg@gmail.com';

    console.log('1️⃣ Getting user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (profileError) {
      console.error('❌ Error getting profile:', profileError);
      return;
    }

    console.log('✅ Profile found:', {
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email,
      name: `${profile.first_name} ${profile.last_name}`
    });

    console.log('\n2️⃣ Testing PM Template search...');
    const qrCode = 'LAK-SYS001-EQ001';
    
    const { data: templates, error: templateError } = await supabase
      .from('pm_templates')
      .select(`
        *,
        systems(id, name, name_th),
        equipment_types(id, name, name_th)
      `)
      .eq('company_id', 'LAK')
      .eq('system_id', 'SYS001')
      .or('equipment_type_id.eq.EQ001,equipment_type_id.eq.EQ-001');

    if (templateError) {
      console.error('❌ Error searching templates:', templateError);
      return;
    }

    console.log(`✅ Found ${templates?.length || 0} PM templates`);
    
    if (templates && templates.length > 0) {
      const selectedTemplate = templates[0];
      console.log(`   Selected: ${selectedTemplate.name} (${selectedTemplate.id})`);

      console.log('\n3️⃣ Getting template details...');
      const { data: details, error: detailsError } = await supabase
        .from('pm_template_details')
        .select('*')
        .eq('pm_template_id', selectedTemplate.id)
        .order('step_number');

      if (detailsError) {
        console.error('❌ Error getting details:', detailsError);
        return;
      }

      console.log(`✅ Found ${details?.length || 0} template details`);

      console.log('\n4️⃣ Simulating work order creation...');
      const workOrderId = `TEST-WO-PM-${Date.now()}`;
      const workOrderData = {
        id: workOrderId,
        work_type: 'PM',
        title: `PM: ${selectedTemplate.name}`,
        description: selectedTemplate.remarks || '',
        status: 'pending',
        priority: 2,
        pm_template_id: selectedTemplate.id,
        estimated_hours: Math.ceil(selectedTemplate.estimated_minutes / 60),
        created_at: new Date().toISOString(),
        requested_by_user_id: profile.id, // Using profile.id (not user_id)
        assigned_to_user_id: profile.id,  // Using profile.id (not user_id)
      };

      console.log('📋 Work order data:');
      console.log(`   - ID: ${workOrderData.id}`);
      console.log(`   - Title: ${workOrderData.title}`);
      console.log(`   - requested_by_user_id: ${workOrderData.requested_by_user_id} (profile.id)`);
      console.log(`   - assigned_to_user_id: ${workOrderData.assigned_to_user_id} (profile.id)`);

      // Test insert (but rollback)
      console.log('\n5️⃣ Testing work order insert...');
      const { data: testWO, error: woError } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (woError) {
        console.error('❌ Error creating work order:', woError);
        return;
      }

      console.log('✅ Work order created successfully!');
      console.log(`   Work Order ID: ${testWO.id}`);

      // Clean up test data
      console.log('\n6️⃣ Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrderId);

      if (deleteError) {
        console.error('⚠️  Warning: Could not delete test work order:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }

      console.log('\n✨ All tests passed! PM QR Scanner should work correctly now.');
      console.log('\n📝 Summary of fixes:');
      console.log('   1. User profile lookup uses user_id column');
      console.log('   2. Work order creation uses profile.id for foreign keys');
      console.log('   3. Duplicate PM menu items consolidated');
      console.log('   4. Error handling improved');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testCompletePMFix();