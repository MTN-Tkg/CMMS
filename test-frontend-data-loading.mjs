/**
 * Test Frontend Data Loading
 * Verify that the data loading fixes work correctly
 */

import dotenv from 'dotenv';
dotenv.config();

// Import the Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Frontend Data Loading...\n');

// Test function similar to the frontend hook
async function testDataLoading() {
  console.log('📊 Testing data loading similar to frontend hook...');
  
  const tables = [
    'assets',
    'work_orders', 
    'parts',
    'locations',
    'systems',
    'companies',
    'equipment_types',
    'pm_templates'
  ];

  const results = {};
  let totalErrors = 0;

  for (const tableName of tables) {
    try {
      console.log(`  📋 Testing ${tableName}...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (error) {
        console.log(`    ❌ Error: ${error.message}`);
        results[tableName] = { success: false, error: error.message, count: 0 };
        totalErrors++;
      } else {
        console.log(`    ✅ Success: ${data?.length || 0} records`);
        results[tableName] = { success: true, count: data?.length || 0 };
      }
    } catch (err) {
      console.log(`    ❌ Exception: ${err.message}`);
      results[tableName] = { success: false, error: err.message, count: 0 };
      totalErrors++;
    }
  }

  console.log('\n📈 Summary:');
  console.log('===========');
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.success ? '✅' : '❌';
    const info = result.success ? `${result.count} records` : result.error;
    console.log(`${status} ${table}: ${info}`);
  });

  console.log(`\n🎯 Total: ${tables.length - totalErrors}/${tables.length} tables loaded successfully`);
  
  if (totalErrors === 0) {
    console.log('🎉 All data loading tests passed!');
  } else if (totalErrors < tables.length / 2) {
    console.log('⚠️  Some tables failed but core functionality should work');
  } else {
    console.log('❌ Major data loading issues detected');
  }

  return totalErrors === 0;
}

// Test connection first
async function testConnection() {
  console.log('🔗 Testing basic connection...');
  
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful\n');
    return true;
  } catch (err) {
    console.log('❌ Connection exception:', err.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log('❌ Cannot proceed - connection failed');
    return;
  }

  const dataLoadingOk = await testDataLoading();
  
  console.log('\n🏁 Test Results:');
  console.log('================');
  console.log(`Database Connection: ${connectionOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`Data Loading: ${dataLoadingOk ? '✅ Working' : '⚠️  Partial'}`);
  
  if (connectionOk && dataLoadingOk) {
    console.log('\n🎉 Frontend should now work correctly!');
    console.log('💡 Try refreshing your browser and check the console for data loading logs');
  } else {
    console.log('\n🔧 Some issues remain - check the specific errors above');
  }
}

runTests().catch(console.error);