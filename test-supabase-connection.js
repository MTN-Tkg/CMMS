// Simple test script to check Supabase connection
import { runDatabaseInspection } from './shared/supabase/test-connection.js';

console.log('🚀 Testing Supabase connection...');
console.log('================================');

async function testConnection() {
  try {
    const result = await runDatabaseInspection();
    
    if (result) {
      console.log('✅ Connection successful!');
      console.log(`📊 Found ${result.tableNames.length} tables:`);
      result.tableNames.forEach(table => {
        console.log(`  - ${table}`);
      });
      
      console.log('\n📋 Database Schema Summary:');
      Object.entries(result.schema).forEach(([tableName, tableInfo]) => {
        console.log(`  ${tableName}: ${tableInfo.columns.length} columns, ${tableInfo.rowCount} sample rows`);
      });
      
      return true;
    } else {
      console.log('❌ Connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase database is ready to use!');
  } else {
    console.log('\n⚠️  Please check your Supabase configuration in .env file');
  }
});