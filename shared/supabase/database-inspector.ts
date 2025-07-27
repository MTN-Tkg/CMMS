/**
 * Database Inspector
 * Utilities to inspect existing Supabase database structure
 */

import { supabase } from './client';

/**
 * Get all table names from the database
 */
export const getTableNames = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.error('Error fetching table names:', error);
      return [];
    }

    return data?.map(table => table.table_name) || [];
  } catch (error) {
    console.error('Error in getTableNames:', error);
    return [];
  }
};

/**
 * Get column information for a specific table
 */
export const getTableColumns = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getTableColumns for ${tableName}:`, error);
    return [];
  }
};

/**
 * Get sample data from a table (first 5 rows)
 */
export const getSampleData = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (error) {
      console.error(`Error fetching sample data from ${tableName}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getSampleData for ${tableName}:`, error);
    return [];
  }
};

/**
 * Get complete database schema information
 */
export const getDatabaseSchema = async () => {
  try {
    const tableNames = await getTableNames();
    const schema: Record<string, any> = {};

    for (const tableName of tableNames) {
      const columns = await getTableColumns(tableName);
      const sampleData = await getSampleData(tableName);
      
      schema[tableName] = {
        columns,
        sampleData,
        rowCount: sampleData.length
      };
    }

    return schema;
  } catch (error) {
    console.error('Error getting database schema:', error);
    return {};
  }
};

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
};

/**
 * Log database structure to console
 */
export const logDatabaseStructure = async () => {
  console.log('🔍 Inspecting database structure...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to database');
    return;
  }

  const schema = await getDatabaseSchema();
  
  console.log('\n📊 Database Schema:');
  console.log('==================');
  
  Object.entries(schema).forEach(([tableName, info]) => {
    console.log(`\n📋 Table: ${tableName}`);
    console.log(`   Columns: ${info.columns.length}`);
    console.log(`   Sample rows: ${info.rowCount}`);
    
    if (info.columns.length > 0) {
      console.log('   Column details:');
      info.columns.forEach((col: any) => {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      });
    }
    
    if (info.sampleData.length > 0) {
      console.log('   Sample data keys:', Object.keys(info.sampleData[0]));
    }
  });
};