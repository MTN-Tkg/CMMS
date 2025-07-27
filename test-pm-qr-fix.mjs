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

async function testUserProfileFix() {
  console.log('🧪 Testing PM QR Scanner User Profile Fix\n');

  try {
    // Test user ID from the error log
    const testUserId = '03668aa4-38b7-4f36-8ddf-0f637d5db68a';
    const testEmail = 'm.mtn.tkg@gmail.com';

    console.log('1️⃣ Checking if user profile exists for user:', testUserId);
    
    // Check by user_id (correct way)
    const { data: profileByUserId, error: error1 } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (error1 && error1.code !== 'PGRST116') {
      console.error('Error checking by user_id:', error1);
    } else if (profileByUserId) {
      console.log('✅ Profile found by user_id:', {
        id: profileByUserId.id,
        user_id: profileByUserId.user_id,
        email: profileByUserId.email,
        name: `${profileByUserId.first_name} ${profileByUserId.last_name}`
      });
    } else {
      console.log('❌ No profile found by user_id');
    }

    // Check by email
    console.log('\n2️⃣ Checking if user profile exists for email:', testEmail);
    
    const { data: profileByEmail, error: error2 } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (error2 && error2.code !== 'PGRST116') {
      console.error('Error checking by email:', error2);
    } else if (profileByEmail) {
      console.log('✅ Profile found by email:', {
        id: profileByEmail.id,
        user_id: profileByEmail.user_id,
        email: profileByEmail.email,
        name: `${profileByEmail.first_name} ${profileByEmail.last_name}`
      });
    } else {
      console.log('❌ No profile found by email');
    }

    // Test PM template search
    console.log('\n3️⃣ Testing PM Template search with QR code: LAK-SYS001-EQ001');
    
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
      console.error('Error searching templates:', templateError);
    } else {
      console.log(`✅ Found ${templates?.length || 0} PM templates`);
      if (templates && templates.length > 0) {
        templates.forEach((t, i) => {
          console.log(`   Template ${i + 1}: ${t.name} (${t.id})`);
        });
      }
    }

    // Test creating a work order (without actually creating it)
    console.log('\n4️⃣ Simulating work order creation...');
    
    if (profileByUserId || profileByEmail) {
      const profile = profileByUserId || profileByEmail;
      console.log('✅ Would create work order with:');
      console.log(`   - requested_by_user_id: ${profile.user_id}`);
      console.log(`   - assigned_to_user_id: ${profile.user_id}`);
      console.log('   - This should work without duplicate key errors');
    } else {
      console.log('⚠️  No profile found - would need to create one first');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testUserProfileFix();