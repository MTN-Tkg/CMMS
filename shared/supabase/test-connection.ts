/**
 * Test Connection and Database Inspection
 * Utility to test connection and inspect your existing Supabase database
 */

import { testConnection, logDatabaseStructure, getDatabaseSchema } from './database-inspector';
import { createServicesFromSchema } from './database-service';

/**
 * Main function to test connection and inspect database
 */
export const inspectDatabase = async () => {
  console.log('🚀 Starting Supabase connection test and database inspection...');
  console.log('='.repeat(60));

  // Test basic connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to Supabase. Please check your credentials.');
    return null;
  }

  // Log complete database structure
  await logDatabaseStructure();

  // Get schema for programmatic use
  const schema = await getDatabaseSchema();
  
  // Create dynamic services
  const tableNames = Object.keys(schema);
  const services = createServicesFromSchema(tableNames);

  console.log('\n🔧 Available Services:');
  console.log('=====================');
  tableNames.forEach(tableName => {
    console.log(`- ${tableName}Service: services.${tableName}`);
  });

  console.log('\n✅ Database inspection complete!');
  console.log('You can now use the services to interact with your data.');

  return {
    schema,
    services,
    tableNames
  };
};

/**
 * Quick test to fetch sample data from a table
 */
export const testTableAccess = async (tableName: string, limit: number = 3) => {
  try {
    console.log(`\n🔍 Testing access to table: ${tableName}`);
    
    const service = createServicesFromSchema([tableName])[tableName];
    const result = await service.getAll({ limit });

    if (result.error) {
      console.error(`❌ Error accessing ${tableName}:`, result.error);
      return null;
    }

    console.log(`✅ Successfully fetched ${result.data?.length || 0} records from ${tableName}`);
    if (result.data && result.data.length > 0) {
      console.log('Sample data structure:', Object.keys(result.data[0]));
      console.log('First record:', result.data[0]);
    }

    return result.data;
  } catch (error) {
    console.error(`❌ Exception testing ${tableName}:`, error);
    return null;
  }
};

/**
 * Test multiple tables
 */
export const testMultipleTables = async (tableNames: string[]) => {
  console.log('\n🧪 Testing multiple table access...');
  
  const results: Record<string, any> = {};
  
  for (const tableName of tableNames) {
    results[tableName] = await testTableAccess(tableName, 2);
  }
  
  return results;
};

/**
 * Export for easy use in development
 */
export const runDatabaseInspection = async () => {
  const result = await inspectDatabase();
  
  if (result) {
    // Test some common table names that might exist
    const commonTables = ['users', 'assets', 'work_orders', 'parts', 'inventory'];
    const existingTables = commonTables.filter(table => 
      result.tableNames.includes(table)
    );
    
    if (existingTables.length > 0) {
      console.log('\n🧪 Testing common tables...');
      await testMultipleTables(existingTables);
    }
  }
  
  return result;
};

// For direct execution in browser console or development
if (typeof window !== 'undefined') {
  (window as any).inspectSupabaseDatabase = runDatabaseInspection;
  console.log('💡 Run inspectSupabaseDatabase() in console to test your database connection');
}