import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// List of known tables to check
const knownTables = [
  'assets',
  'equipment_types', 
  'systems',
  'locations',
  'work_orders',
  'work_order_tasks',
  'work_order_parts',
  'work_order_attachments',
  'work_order_history',
  'work_order_comments',
  'pm_templates',
  'pm_template_details',
  'parts',
  'parts_requisitions',
  'tools',
  'tool_checkouts',
  'user_profiles',
  'companies',
  'notifications'
];

async function discoverAllTables() {
  console.log('🔍 Discovering all tables in Supabase database...\n');

  const tableResults = {};

  for (const tableName of knownTables) {
    console.log(`📋 Checking table: ${tableName}`);
    
    try {
      // Try to select from the table to see if it exists
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.log(`   ❌ Table '${tableName}' does not exist`);
          tableResults[tableName] = { exists: false, error: error.message };
        } else {
          console.log(`   ⚠️  Table '${tableName}' exists but has error: ${error.message}`);
          tableResults[tableName] = { exists: true, error: error.message, data: [] };
        }
      } else {
        console.log(`   ✅ Table '${tableName}' exists with ${data?.length || 0} sample records`);
        
        if (data && data.length > 0) {
          console.log(`   📊 Columns: ${Object.keys(data[0]).join(', ')}`);
          tableResults[tableName] = { 
            exists: true, 
            columns: Object.keys(data[0]),
            sampleCount: data.length,
            sampleData: data
          };
        } else {
          tableResults[tableName] = { 
            exists: true, 
            columns: [],
            sampleCount: 0,
            sampleData: []
          };
        }
      }
    } catch (err) {
      console.log(`   ❌ Error checking table '${tableName}': ${err.message}`);
      tableResults[tableName] = { exists: false, error: err.message };
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('🎯 SUMMARY OF ALL TABLES:');
  console.log('========================\n');

  const existingTables = [];
  const missingTables = [];

  Object.entries(tableResults).forEach(([tableName, result]) => {
    if (result.exists) {
      existingTables.push(tableName);
      console.log(`✅ ${tableName} (${result.columns?.length || 0} columns, ${result.sampleCount || 0} sample records)`);
    } else {
      missingTables.push(tableName);
      console.log(`❌ ${tableName} - ${result.error}`);
    }
  });

  console.log(`\n📊 Statistics:`);
  console.log(`   Existing tables: ${existingTables.length}`);
  console.log(`   Missing tables: ${missingTables.length}`);
  console.log(`   Total checked: ${knownTables.length}`);

  if (existingTables.length > 0) {
    console.log(`\n✅ Existing tables:`);
    existingTables.forEach(table => {
      const result = tableResults[table];
      console.log(`   - ${table}: ${result.columns?.join(', ') || 'No columns detected'}`);
    });
  }

  if (missingTables.length > 0) {
    console.log(`\n❌ Missing tables that need to be created:`);
    missingTables.forEach(table => {
      console.log(`   - ${table}`);
    });
  }

  // Show relationships between existing tables
  console.log(`\n🔗 Table Relationships (based on existing data):`);
  
  if (tableResults.assets?.exists && tableResults.equipment_types?.exists) {
    console.log(`   assets.equipment_type_id → equipment_types.id`);
  }
  
  if (tableResults.assets?.exists && tableResults.systems?.exists) {
    console.log(`   assets.system_id → systems.id`);
  }
  
  if (tableResults.systems?.exists && tableResults.locations?.exists) {
    console.log(`   systems.location_id → locations.id`);
  }
  
  if (tableResults.work_orders?.exists && tableResults.assets?.exists) {
    console.log(`   work_orders.asset_id → assets.id`);
  }
  
  if (tableResults.work_order_tasks?.exists && tableResults.work_orders?.exists) {
    console.log(`   work_order_tasks.work_order_id → work_orders.id`);
  }

  if (tableResults.pm_templates?.exists && tableResults.equipment_types?.exists) {
    console.log(`   pm_templates.equipment_type_id → equipment_types.id`);
  }

  return tableResults;
}

// Run the discovery
discoverAllTables().then(() => {
  console.log('\n🏁 Table discovery completed!');
}).catch(error => {
  console.error('❌ Error during table discovery:', error);
});