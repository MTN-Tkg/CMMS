// Export database backup to CSV files
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { existsSync } from 'fs';

const SUPABASE_URL = 'https://kdrawlsreggojpxavlnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcmF3bHNyZWdnb2pweGF2bG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjgzOTAsImV4cCI6MjA2ODQwNDM5MH0.-6gjmdNDKfG-mZ-TbifmxlE-ysrmUWslmPMWAbbvGOs';

console.log('📊 Exporting database to CSV files...');
console.log('====================================');

// Function to convert JSON to CSV
function jsonToCSV(data, tableName) {
  if (!data || data.length === 0) {
    return `No data available for table: ${tableName}`;
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle objects/arrays
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Handle strings with commas or quotes
      value = String(value);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    });
    
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

async function exportToCSV() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Create backup directory
    const backupDir = 'database-backup-csv';
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir);
    }
    
    // Tables that exist
    const tables = [
      'assets', 'work_orders', 'parts', 'locations', 
      'systems', 'equipment_types', 'pm_templates', 
      'work_order_parts', 'notifications'
    ];
    
    let exportSummary = 'CSV Export Summary\n';
    exportSummary += '==================\n';
    exportSummary += `Export Date: ${new Date().toLocaleString('th-TH')}\n`;
    exportSummary += `Export Directory: ${backupDir}/\n\n`;
    
    for (const tableName of tables) {
      console.log(`\n📋 Exporting table: ${tableName}`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('id', { ascending: true });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          continue;
        }
        
        // Convert to CSV
        const csvContent = jsonToCSV(data, tableName);
        
        // Save CSV file
        const csvFileName = `${backupDir}/${tableName}.csv`;
        writeFileSync(csvFileName, csvContent, 'utf8');
        
        console.log(`   ✅ Exported ${data?.length || 0} records to ${csvFileName}`);
        
        exportSummary += `${tableName}.csv: ${data?.length || 0} records\n`;
        
      } catch (tableError) {
        console.log(`   ❌ Exception: ${tableError.message}`);
      }
    }
    
    // Save export summary
    writeFileSync(`${backupDir}/export-summary.txt`, exportSummary, 'utf8');
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 CSV export completed!');
    console.log(`📁 Files saved in: ${backupDir}/`);
    console.log('📋 Summary saved in: export-summary.txt');
    
    return true;
    
  } catch (error) {
    console.error('❌ CSV export failed:', error.message);
    return false;
  }
}

// Run the export
exportToCSV().then(success => {
  if (success) {
    console.log('\n🎉 CSV export process completed successfully!');
    console.log('\n📁 You now have:');
    console.log('   - JSON backup (complete data with metadata)');
    console.log('   - CSV files (easy to open in Excel/Google Sheets)');
    console.log('   - Summary files (quick overview)');
  } else {
    console.log('\n❌ CSV export process failed');
  }
});