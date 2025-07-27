import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumnTypes() {
  console.log('🔍 Checking column data types in database...\n');

  const tablesToCheck = [
    'companies',
    'assets', 
    'systems',
    'locations',
    'work_orders',
    'pm_templates',
    'user_profiles'
  ];

  for (const tableName of tablesToCheck) {
    console.log(`\n📋 Table: ${tableName}`);
    console.log('─'.repeat(40));
    
    try {
      // Get one row to check column types
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        const sample = data[0];
        
        // Check specific columns we're interested in
        const columnsToCheck = ['id', 'company_id', 'system_id', 'location_id', 'asset_id'];
        
        columnsToCheck.forEach(col => {
          if (col in sample) {
            const value = sample[col];
            let type = 'unknown';
            
            if (value === null) {
              type = 'null';
            } else if (typeof value === 'string') {
              // Check if it's a UUID pattern
              if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                type = 'uuid (stored as text)';
              } else {
                type = `text (length: ${value.length})`;
              }
            } else {
              type = typeof value;
            }
            
            console.log(`   ${col}: ${type} (sample: ${value ? value.substring(0, 20) + '...' : 'null'})`);
          }
        });
      } else {
        console.log('   Table is empty');
      }
    } catch (err) {
      console.log(`❌ Error checking table: ${err.message}`);
    }
  }

  console.log('\n\n💡 Summary:');
  console.log('If company_id columns need to reference companies.id,');
  console.log('and companies.id is TEXT type, then company_id should also be TEXT type.');
}

checkColumnTypes().catch(console.error);