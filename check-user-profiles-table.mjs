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

async function checkUserProfilesTable() {
  console.log('🔍 Checking user_profiles table structure...\n');

  try {
    // First, check if the table exists and get its structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' });

    if (columnsError) {
      console.error('Error getting table columns:', columnsError);
      
      // Try a simple query to see what happens
      console.log('\n📊 Trying a simple query on user_profiles...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Query error:', error);
      } else {
        console.log('Sample data:', data);
        if (data && data.length > 0) {
          console.log('Available columns:', Object.keys(data[0]));
        }
      }
      return;
    }

    console.log('📋 Table columns:', columns);

    // Try to get some sample data
    console.log('\n📊 Fetching sample data from user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log('\nSample profile structure:');
        console.log(JSON.stringify(profiles[0], null, 2));
      }
    }

    // Test the specific query that's failing
    console.log('\n🧪 Testing the failing query pattern...');
    const testUserId = '03668aa4-38b7-4f36-8ddf-0f637d5db68a';
    
    // Try different query patterns
    console.log(`\n1. Testing select('id') with eq filter...`);
    const { data: test1, error: error1 } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', testUserId)
      .single();
    
    if (error1) {
      console.error('Error with select("id"):', error1);
    } else {
      console.log('Success with select("id"):', test1);
    }

    console.log(`\n2. Testing select('*') with eq filter...`);
    const { data: test2, error: error2 } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (error2) {
      console.error('Error with select("*"):', error2);
    } else {
      console.log('Success with select("*"):', test2);
    }

    console.log(`\n3. Testing select() with no columns specified...`);
    const { data: test3, error: error3 } = await supabase
      .from('user_profiles')
      .select()
      .eq('id', testUserId)
      .single();
    
    if (error3) {
      console.error('Error with select():', error3);
    } else {
      console.log('Success with select():', test3);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkUserProfilesTable();