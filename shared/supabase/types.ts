/**
 * Flexible Database Types
 * These types will be adapted based on the actual database schema
 */

// Generic database record type
export type DatabaseRecord = Record<string, any>;

// Base interface for all database entities
export interface BaseEntity {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
}

// Flexible types that can adapt to your existing schema
export interface FlexibleUser extends BaseEntity {
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any; // Allow additional properties
}

export interface FlexibleAsset extends BaseEntity {
  name?: string;
  description?: string;
  status?: string;
  location?: string;
  [key: string]: any;
}

export interface FlexibleWorkOrder extends BaseEntity {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  asset_id?: string | number;
  [key: string]: any;
}

export interface FlexiblePart extends BaseEntity {
  name?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  supplier?: string;
  [key: string]: any;
}

export interface FlexibleInventory extends BaseEntity {
  part_id?: string | number;
  quantity?: number;
  location?: string;
  min_stock?: number;
  max_stock?: number;
  [key: string]: any;
}

// Generic database response type
export interface DatabaseResponse<T = DatabaseRecord> {
  data: T[] | null;
  error: any;
  count?: number;
}

// Query options
export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}

// Database operations interface
export interface DatabaseOperations<T = DatabaseRecord> {
  getAll: (options?: QueryOptions) => Promise<DatabaseResponse<T>>;
  getById: (id: string | number) => Promise<{ data: T | null; error: any }>;
  create: (data: Partial<T>) => Promise<{ data: T | null; error: any }>;
  update: (id: string | number, data: Partial<T>) => Promise<{ data: T | null; error: any }>;
  delete: (id: string | number) => Promise<{ error: any }>;
}

// Table mapping - will be populated after schema inspection
export interface TableMapping {
  [tableName: string]: {
    primaryKey: string;
    columns: string[];
    relationships?: Record<string, string>;
  };
}

// Schema information
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface TableSchema {
  columns: ColumnInfo[];
  sampleData: DatabaseRecord[];
  rowCount: number;
}

export interface DatabaseSchema {
  [tableName: string]: TableSchema;
}

// Placeholder Database type for Supabase client
// This will be replaced with actual types after schema inspection
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: DatabaseRecord;
        Insert: DatabaseRecord;
        Update: DatabaseRecord;
      };
    };
  };
}