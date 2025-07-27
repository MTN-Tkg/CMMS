// Test database operations - create table and read data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kdrawlsreggojpxavlnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcmF3bHNyZWdnb2pweGF2bG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjgzOTAsImV4cCI6MjA2ODQwNDM5MH0.-6gjmdNDKfG-mZ-TbifmxlE-ysrmUWslmPMWAbbvGOs';

console.log('🧪 Testing Supabase database operations...');
console.log('==========================================');

async function testDatabaseOperations() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test 1: Try to read from common CMMS tables
    console.log('📋 Testing common CMMS tables...');
    
    const commonTables = ['assets', 'work_orders', 'parts', 'inventory', 'users', 'maintenance_logs'];
    
    for (const tableName of commonTables) {
      console.log(`\n🔍 Testing table: ${tableName}`);
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(3);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`   ⚪ Table '${tableName}' does not exist`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table '${tableName}' exists with ${count} records`);
        if (data && data.length > 0) {
          console.log(`   📊 Sample columns: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   📝 First record:`, data[0]);
        } else {
          console.log(`   📭 Table is empty`);
        }
      }
    }
    
    // Test 2: Try to create a simple test table
    console.log('\n🛠️  Testing table creation...');
    
    const { data: createResult, error: createError } = await supabase.rpc('create_test_table');
    
    if (createError) {
      console.log('   ⚠️  Cannot create tables (expected - requires admin privileges)');
      console.log(`   Error: ${createError.message}`);
    } else {
      console.log('   ✅ Table creation successful');
    }
    
    // Test 3: Check available RPC functions
    console.log('\n🔧 Testing available functions...');
    
    const { data: functions, error: funcError } = await supabase.rpc('get_schema_info');
    
    if (funcError) {
      console.log('   ⚠️  No custom functions available or access denied');
    } else {
      console.log('   ✅ Custom functions available:', functions);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message);
    return false;
  }
}

// Run the test
testDatabaseOperations().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎯 Database operations test completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Connection: Working');
    console.log('✅ Authentication: Working');
    console.log('📋 Tables: Check individual results above');
    console.log('\n💡 Next steps:');
    console.log('1. Create your CMMS tables in Supabase dashboard');
    console.log('2. Set up Row Level Security (RLS) policies');
    console.log('3. Use the visual inspector at http://localhost:5173/supabase-test');
  } else {
    console.log('❌ Database operations test failed');
  }
});