// Discover all tables in Supabase database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kdrawlsreggojpxavlnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcmF3bHNyZWdnb2pweGF2bG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjgzOTAsImV4cCI6MjA2ODQwNDM5MH0.-6gjmdNDKfG-mZ-TbifmxlE-ysrmUWslmPMWAbbvGOs';

console.log('🔍 Discovering all tables in database...');
console.log('======================================');

async function discoverAllTables() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Method 1: Try to get table list from information_schema
    console.log('📋 Method 1: Querying information_schema...');
    
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_list');
    
    if (schemaError) {
      console.log('⚠️  Custom function not available, trying direct query...');
      
      // Method 2: Try direct query to information_schema
      const { data: directData, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (directError) {
        console.log('⚠️  Direct query failed, using comprehensive table list...');
      } else if (directData) {
        console.log(`✅ Found ${directData.length} tables via direct query`);
        return directData.map(t => t.table_name);
      }
    } else if (schemaData) {
      console.log(`✅ Found ${schemaData.length} tables via RPC`);
      return schemaData;
    }
    
    // Method 3: Comprehensive list of possible CMMS tables
    console.log('📋 Method 3: Using comprehensive CMMS table list...');
    
    const possibleTables = [
      // Core CMMS tables
      'assets', 'work_orders', 'parts', 'locations', 'systems', 'equipment_types',
      'pm_templates', 'work_order_parts', 'notifications', 'users', 'companies',
      
      // Extended CMMS tables
      'maintenance_logs', 'inventory', 'suppliers', 'purchase_orders', 'contracts',
      'warranties', 'attachments', 'settings', 'audit_logs', 'reports',
      
      // Additional possible tables
      'departments', 'employees', 'shifts', 'schedules', 'costs', 'budgets',
      'categories', 'priorities', 'statuses', 'roles', 'permissions',
      
      // System tables
      'configurations', 'templates', 'workflows', 'approvals', 'history',
      'backups', 'logs', 'sessions', 'tokens', 'preferences'
    ];
    
    console.log(`🔍 Testing ${possibleTables.length} possible table names...`);
    
    const existingTables = [];
    
    for (const tableName of possibleTables) {
      try {
        // Try to query the table with limit 0 to check if it exists
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(0);
        
        if (!error) {
          existingTables.push(tableName);
          console.log(`   ✅ ${tableName} - exists`);
        } else if (error.code !== 'PGRST116') {
          // Table exists but might have access issues
          existingTables.push(tableName);
          console.log(`   ⚠️  ${tableName} - exists but access limited`);
        }
      } catch (e) {
        // Silent fail for non-existent tables
      }
    }
    
    console.log(`\n📊 Total tables found: ${existingTables.length}`);
    return existingTables;
    
  } catch (error) {
    console.error('❌ Error discovering tables:', error.message);
    return [];
  }
}

// Run discovery
discoverAllTables().then(tables => {
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Table Discovery Complete!');
  console.log(`📋 Found ${tables.length} tables:`);
  
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table}`);
  });
  
  if (tables.length >= 19) {
    console.log('\n✅ Found expected number of tables (19+)');
  } else {
    console.log(`\n⚠️  Expected 19 tables, found ${tables.length}`);
    console.log('Some tables might be hidden or have different names');
  }
  
  console.log('\n💡 Next: Run complete backup with all discovered tables');
});