/**
 * Supabase Integration Index
 * Main entry point for all Supabase functionality
 */

// Core client and configuration
export { default as supabase, supabaseAdmin, getCurrentUser, getCurrentSession, signOut, isAuthenticated } from './client';
export { supabaseConfig, TABLES, CHANNELS } from './config';

// Types
export type * from './types';

// Database services
export { DatabaseService, createTableService, genericServices, createServicesFromSchema } from './database-service';

// Database inspection utilities
export { 
  getTableNames, 
  getTableColumns, 
  getSampleData, 
  getDatabaseSchema, 
  testConnection, 
  logDatabaseStructure 
} from './database-inspector';

// Testing utilities
export { 
  inspectDatabase, 
  testTableAccess, 
  testMultipleTables, 
  runDatabaseInspection 
} from './test-connection';

// Re-export commonly used types
export type { 
  DatabaseRecord, 
  DatabaseResponse, 
  QueryOptions, 
  DatabaseOperations,
  FlexibleUser,
  FlexibleAsset,
  FlexibleWorkOrder,
  FlexiblePart,
  FlexibleInventory
} from './types';