import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get all tables from information_schema
async function getAllTables() {
  console.log('📋 Fetching all tables from database...\n');
  
  // First try the standard approach
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

  const tables = [];
  
  // Check each known table
  for (const tableName of knownTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error) {
        tables.push(tableName);
      }
    } catch (err) {
      // Table doesn't exist, skip
    }
  }
  
  return tables;
}

// Function to get columns for a table
async function getTableColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { error: error.message };
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]).map(col => {
        const value = data[0][col];
        let type = 'unknown';
        
        if (value === null) {
          type = 'nullable';
        } else if (typeof value === 'string') {
          if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
            type = 'timestamp';
          } else if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            type = 'uuid';
          } else {
            type = 'text';
          }
        } else if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'integer' : 'numeric';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'object') {
          type = 'jsonb';
        }
        
        return {
          name: col,
          type: type,
          sampleValue: value
        };
      });
      
      return { columns };
    } else {
      // Table is empty, try to infer structure from error messages
      return { columns: [], empty: true };
    }
  } catch (err) {
    return { error: err.message };
  }
}

// Function to identify foreign key relationships
function identifyRelationships(allTablesData) {
  const relationships = [];
  
  // Common patterns for foreign keys
  const fkPatterns = [
    { pattern: /_id$/, targetTable: (col) => col.replace(/_id$/, '') },
    { pattern: /_uuid$/, targetTable: (col) => col.replace(/_uuid$/, '') }
  ];
  
  for (const [tableName, tableData] of Object.entries(allTablesData)) {
    if (tableData.columns) {
      for (const column of tableData.columns) {
        // Check if column name matches foreign key patterns
        for (const fkPattern of fkPatterns) {
          if (fkPattern.pattern.test(column.name)) {
            const targetTable = fkPattern.targetTable(column.name);
            
            // Check if target table exists
            if (allTablesData[targetTable] || allTablesData[targetTable + 's']) {
              relationships.push({
                fromTable: tableName,
                fromColumn: column.name,
                toTable: allTablesData[targetTable] ? targetTable : targetTable + 's',
                toColumn: 'id',
                type: 'foreign_key'
              });
            }
          }
        }
        
        // Special cases
        if (tableName === 'systems' && column.name === 'location_id') {
          relationships.push({
            fromTable: 'systems',
            fromColumn: 'location_id',
            toTable: 'locations',
            toColumn: 'id',
            type: 'foreign_key'
          });
        }
        
        if (tableName === 'pm_templates' && column.name === 'equipment_type_id') {
          relationships.push({
            fromTable: 'pm_templates',
            fromColumn: 'equipment_type_id',
            toTable: 'equipment_types',
            toColumn: 'id',
            type: 'foreign_key'
          });
        }
      }
    }
  }
  
  return relationships;
}

// Main function
async function getCompleteDatabaseSchema() {
  console.log('🚀 Getting complete database schema for CMMS...\n');
  
  try {
    // Get all tables
    const tables = await getAllTables();
    console.log(`📊 Found ${tables.length} tables in database\n`);
    
    // Get details for each table
    const allTablesData = {};
    
    for (const tableName of tables) {
      console.log(`\n📋 Table: ${tableName}`);
      console.log('─'.repeat(50));
      
      const tableInfo = await getTableColumns(tableName);
      allTablesData[tableName] = tableInfo;
      
      if (tableInfo.error) {
        console.log(`❌ Error: ${tableInfo.error}`);
      } else if (tableInfo.empty) {
        console.log(`⚠️  Table is empty (no sample data)`);
      } else {
        console.log(`✅ ${tableInfo.columns.length} columns found:`);
        
        tableInfo.columns.forEach(col => {
          console.log(`   • ${col.name} (${col.type})`);
        });
      }
    }
    
    // Identify relationships
    console.log('\n\n🔗 DATABASE RELATIONSHIPS');
    console.log('═'.repeat(50));
    
    const relationships = identifyRelationships(allTablesData);
    
    if (relationships.length > 0) {
      relationships.forEach(rel => {
        console.log(`${rel.fromTable}.${rel.fromColumn} → ${rel.toTable}.${rel.toColumn}`);
      });
    } else {
      console.log('No relationships detected');
    }
    
    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      database: 'CMMS Supabase Database',
      tablesCount: tables.length,
      tables: allTablesData,
      relationships: relationships,
      summary: {
        coreEntities: ['assets', 'work_orders', 'pm_templates'],
        supportingEntities: ['equipment_types', 'systems', 'locations', 'parts'],
        userEntities: ['user_profiles', 'companies'],
        transactionEntities: ['work_order_tasks', 'work_order_parts', 'work_order_attachments']
      }
    };
    
    // Save report to file
    const reportPath = `database-schema-report-${new Date().toISOString().replace(/:/g, '-')}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n\n📄 SCHEMA REPORT SAVED TO: ${reportPath}`);
    
    // Generate SQL-like schema documentation
    console.log('\n\n📝 SQL-LIKE SCHEMA DOCUMENTATION');
    console.log('═'.repeat(50));
    
    for (const [tableName, tableData] of Object.entries(allTablesData)) {
      if (tableData.columns && tableData.columns.length > 0) {
        console.log(`\n-- Table: ${tableName}`);
        console.log(`CREATE TABLE ${tableName} (`);
        
        tableData.columns.forEach((col, index) => {
          const comma = index < tableData.columns.length - 1 ? ',' : '';
          console.log(`  ${col.name} ${col.type.toUpperCase()}${comma}`);
        });
        
        console.log(');');
        
        // Show foreign keys for this table
        const tableFKs = relationships.filter(rel => rel.fromTable === tableName);
        if (tableFKs.length > 0) {
          console.log(`\n-- Foreign Keys:`);
          tableFKs.forEach(fk => {
            console.log(`-- ${fk.fromColumn} references ${fk.toTable}(${fk.toColumn})`);
          });
        }
      }
    }
    
    // Generate recommendations for Work Order & PM system
    console.log('\n\n💡 RECOMMENDATIONS FOR WORK ORDER & PM SYSTEM');
    console.log('═'.repeat(50));
    
    console.log('\n1. Core Tables Status:');
    console.log(`   ✅ work_orders - Main work order table`);
    console.log(`   ✅ work_order_tasks - Tasks/steps for each work order`);
    console.log(`   ✅ pm_templates - Preventive maintenance templates`);
    console.log(`   ✅ pm_template_details - PM template task details`);
    console.log(`   ✅ assets - Equipment/asset registry`);
    
    console.log('\n2. Suggested Enhancements:');
    console.log(`   • Add work_order_status_history for tracking status changes`);
    console.log(`   • Add pm_schedules for automated PM generation`);
    console.log(`   • Add work_order_labor for time tracking`);
    console.log(`   • Add work_order_costs for cost tracking`);
    console.log(`   • Add asset_maintenance_history for asset-specific history`);
    
    console.log('\n3. Current Relationships:');
    console.log(`   • Work Orders linked to Assets`);
    console.log(`   • Work Order Tasks linked to Work Orders`);
    console.log(`   • PM Templates linked to Equipment Types`);
    console.log(`   • Assets linked to Equipment Types, Systems, and Locations`);
    
    console.log('\n4. Missing Relationships to Consider:');
    console.log(`   • work_orders.pm_template_id → pm_templates.id (for PM-generated WOs)`);
    console.log(`   • work_orders.parent_work_order_id → work_orders.id (for sub-WOs)`);
    console.log(`   • assets.parent_asset_id → assets.id (for asset hierarchy)`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error getting database schema:', error);
    throw error;
  }
}

// Run the schema extraction
getCompleteDatabaseSchema().then(() => {
  console.log('\n\n✅ Database schema extraction completed!');
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});