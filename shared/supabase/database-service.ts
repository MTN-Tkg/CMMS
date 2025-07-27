/**
 * Database Service Layer
 * Generic service that adapts to existing Supabase schema
 */

import { supabase } from './client';
import type { 
  DatabaseRecord, 
  DatabaseResponse, 
  QueryOptions, 
  DatabaseOperations 
} from './types';

/**
 * Generic database service class
 */
export class DatabaseService<T extends DatabaseRecord = DatabaseRecord> implements DatabaseOperations<T> {
  constructor(private tableName: string) {}

  /**
   * Get all records from table
   */
  async getAll(options: QueryOptions = {}): Promise<DatabaseResponse<T>> {
    try {
      let query = supabase.from(this.tableName).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      return { data: data as T[], error, count };
    } catch (error) {
      console.error(`Error in getAll for ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: string | number): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      return { data: data as T, error };
    } catch (error) {
      console.error(`Error in getById for ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      return { data: result as T, error };
    } catch (error) {
      console.error(`Error in create for ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string | number, data: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return { data: result as T, error };
    } catch (error) {
      console.error(`Error in update for ${this.tableName}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string | number): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error(`Error in delete for ${this.tableName}:`, error);
      return { error };
    }
  }

  /**
   * Count records in table
   */
  async count(filters?: Record<string, any>): Promise<{ count: number | null; error: any }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;
      return { count, error };
    } catch (error) {
      console.error(`Error in count for ${this.tableName}:`, error);
      return { count: null, error };
    }
  }

  /**
   * Search records with text search
   */
  async search(column: string, searchTerm: string, options: QueryOptions = {}): Promise<DatabaseResponse<T>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(options.select || '*')
        .ilike(column, `%${searchTerm}%`);

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      return { data: data as T[], error };
    } catch (error) {
      console.error(`Error in search for ${this.tableName}:`, error);
      return { data: null, error };
    }
  }
}

/**
 * Create service instances for common tables
 * These will be dynamically created based on discovered tables
 */
export const createTableService = <T extends DatabaseRecord = DatabaseRecord>(tableName: string) => {
  return new DatabaseService<T>(tableName);
};

// Generic services that can be used with any table name
export const genericServices = {
  users: createTableService('users'),
  assets: createTableService('assets'),
  work_orders: createTableService('work_orders'),
  parts: createTableService('parts'),
  inventory: createTableService('inventory'),
  maintenance_schedules: createTableService('maintenance_schedules'),
  notifications: createTableService('notifications'),
};

/**
 * Dynamic service creator based on discovered tables
 */
export const createServicesFromSchema = (tableNames: string[]) => {
  const services: Record<string, DatabaseService> = {};
  
  tableNames.forEach(tableName => {
    services[tableName] = createTableService(tableName);
  });
  
  return services;
};