// Backup all data from Supabase database
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = 'https://kdrawlsreggojpxavlnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcmF3bHNyZWdnb2pweGF2bG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjgzOTAsImV4cCI6MjA2ODQwNDM5MH0.-6gjmdNDKfG-mZ-TbifmxlE-ysrmUWslmPMWAbbvGOs';

console.log('💾 Starting database backup...');
console.log('==============================');

async function backupAllTables() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Tables that we know exist
    const existingTables = ['assets', 'work_orders', 'parts'];
    
    // Additional tables to check
    const additionalTables = [
      'users', 'inventory', 'maintenance_logs', 'locations', 'systems', 
      'equipment_types', 'pm_templates', 'work_order_parts', 'attachments',
      'notifications', 'settings', 'audit_logs'
    ];
    
    const allTables = [...existingTables, ...additionalTables];
    const backupData = {
      backup_info: {
        timestamp: new Date().toISOString(),
        database_url: SUPABASE_URL,
        backup_version: '1.0',
        total_tables: 0,
        total_records: 0
      },
      tables: {}
    };
    
    let totalRecords = 0;
    let successfulTables = 0;
    
    for (const tableName of allTables) {
      console.log(`\n📋 Backing up table: ${tableName}`);
      
      try {
        // Get all data from the table
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .order('id', { ascending: true });
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`   ⚪ Table '${tableName}' does not exist - skipping`);
          } else {
            console.log(`   ❌ Error accessing '${tableName}': ${error.message}`);
          }
          continue;
        }
        
        // Store table data
        backupData.tables[tableName] = {
          table_info: {
            name: tableName,
            record_count: count || 0,
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            backup_timestamp: new Date().toISOString()
          },
          data: data || []
        };
        
        console.log(`   ✅ Successfully backed up ${count || 0} records`);
        if (data && data.length > 0) {
          console.log(`   📊 Columns: ${Object.keys(data[0]).join(', ')}`);
        }
        
        totalRecords += count || 0;
        successfulTables++;
        
      } catch (tableError) {
        console.log(`   ❌ Exception backing up '${tableName}': ${tableError.message}`);
      }
    }
    
    // Update backup info
    backupData.backup_info.total_tables = successfulTables;
    backupData.backup_info.total_records = totalRecords;
    
    // Save backup to JSON file
    const backupFileName = `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(backupFileName, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log('\n' + '='.repeat(50));
    console.log('💾 Database backup completed!');
    console.log(`📁 Backup saved to: ${backupFileName}`);
    console.log(`📊 Total tables backed up: ${successfulTables}`);
    console.log(`📈 Total records backed up: ${totalRecords}`);
    
    // Create a summary file
    const summaryFileName = `backup-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    let summaryContent = `CMMS Database Backup Summary\n`;
    summaryContent += `============================\n`;
    summaryContent += `Backup Date: ${new Date().toLocaleString('th-TH')}\n`;
    summaryContent += `Database URL: ${SUPABASE_URL}\n`;
    summaryContent += `Total Tables: ${successfulTables}\n`;
    summaryContent += `Total Records: ${totalRecords}\n\n`;
    
    summaryContent += `Table Details:\n`;
    summaryContent += `--------------\n`;
    
    Object.entries(backupData.tables).forEach(([tableName, tableData]) => {
      summaryContent += `${tableName}: ${tableData.table_info.record_count} records\n`;
      if (tableData.table_info.columns.length > 0) {
        summaryContent += `  Columns: ${tableData.table_info.columns.join(', ')}\n`;
      }
      summaryContent += `\n`;
    });
    
    writeFileSync(summaryFileName, summaryContent, 'utf8');
    console.log(`📋 Summary saved to: ${summaryFileName}`);
    
    return {
      success: true,
      backupFileName,
      summaryFileName,
      tablesBackedUp: successfulTables,
      totalRecords
    };
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the backup
backupAllTables().then(result => {
  if (result.success) {
    console.log('\n🎉 Backup process completed successfully!');
    console.log('\n📁 Files created:');
    console.log(`   - ${result.backupFileName} (Full backup data)`);
    console.log(`   - ${result.summaryFileName} (Backup summary)`);
    console.log('\n💡 You can now restore this data anytime or use it for analysis.');
  } else {
    console.log('\n❌ Backup process failed:', result.error);
  }
});