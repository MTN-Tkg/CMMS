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

async function checkWorkOrdersFK() {
  console.log('🔍 Checking work_orders foreign key constraints...\n');

  try {
    // Get a sample work order to see the structure
    console.log('📊 Sample work_order structure:');
    const { data: sampleWO, error: woError } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (woError) {
      console.error('Error fetching work order:', woError);
    } else if (sampleWO && sampleWO.length > 0) {
      console.log('Columns:', Object.keys(sampleWO[0]));
      console.log('\nSample data:');
      console.log('- requested_by_user_id:', sampleWO[0].requested_by_user_id);
      console.log('- assigned_to_user_id:', sampleWO[0].assigned_to_user_id);
    }

    // Check what the foreign key expects
    console.log('\n📋 Checking user_profiles structure:');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, email')
      .limit(3);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    } else if (profiles) {
      console.log('User profiles sample:');
      profiles.forEach(p => {
        console.log(`- Profile ID: ${p.id}, User ID: ${p.user_id}, Email: ${p.email}`);
      });
    }

    // Test which ID should be used
    console.log('\n🧪 Testing foreign key relationships...');
    
    if (profiles && profiles.length > 0) {
      const testProfile = profiles[0];
      
      // Create a test work order data
      const testData = {
        id: `TEST-WO-${Date.now()}`,
        work_type: 'PM',
        title: 'Test Work Order',
        status: 'pending',
        priority: 2,
      };

      // Test with profile.id
      console.log(`\n1. Testing with profile.id (${testProfile.id}):`);
      const test1 = { ...testData, requested_by_user_id: testProfile.id, assigned_to_user_id: testProfile.id };
      console.log('Would insert:', test1);

      // Test with profile.user_id
      console.log(`\n2. Testing with profile.user_id (${testProfile.user_id}):`);
      const test2 = { ...testData, requested_by_user_id: testProfile.user_id, assigned_to_user_id: testProfile.user_id };
      console.log('Would insert:', test2);

      console.log('\n💡 Based on the error message, work_orders expects the profile.id (not user_id)');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkWorkOrdersFK();