/**
 * Local Database Client
 * SQLite adapter that mimics Supabase client interface
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('./local-database.sqlite');

class LocalDatabaseClient {
  private db: Database.Database;
  public auth: LocalAuthClient;

  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('foreign_keys = ON');
    this.auth = new LocalAuthClient();
  }

  // Create a table query builder similar to Supabase
  from(table: string) {
    return new TableQueryBuilder(this.db, table);
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

// Mock auth client for local database
class LocalAuthClient {
  async getUser() {
    // Return a mock user for local development
    return {
      data: {
        user: {
          id: 'local-user-id',
          email: 'local@example.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          role: 'authenticated'
        }
      },
      error: null
    };
  }

  async getSession() {
    // Return a mock session for local development
    return {
      data: {
        session: {
          access_token: 'local-access-token',
          refresh_token: 'local-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'local-user-id',
            email: 'local@example.com',
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated'
          }
        }
      },
      error: null
    };
  }

  async signOut() {
    // Mock sign out - always successful for local development
    return { error: null };
  }
}

class TableQueryBuilder {
  private db: Database.Database;
  private table: string;
  private selectColumns: string[] = ['*'];
  private whereConditions: Array<{ column: string; operator: string; value: any }> = [];
  private orderByClause: string = '';
  private limitValue: number | null = null;

  constructor(db: Database.Database, table: string) {
    this.db = db;
    this.table = table;
  }

  // Select specific columns
  select(columns: string = '*') {
    this.selectColumns = columns === '*' ? ['*'] : columns.split(',').map(c => c.trim());
    return this;
  }

  // Add WHERE conditions
  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: '=', value });
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push({ column, operator: '!=', value });
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push({ column, operator: '>', value });
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push({ column, operator: '>=', value });
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push({ column, operator: '<', value });
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push({ column, operator: '<=', value });
    return this;
  }

  like(column: string, value: string) {
    this.whereConditions.push({ column, operator: 'LIKE', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions.push({ column, operator: 'IN', value: values });
    return this;
  }

  // Add ORDER BY
  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  // Add LIMIT
  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  // Execute SELECT query
  async execute(): Promise<{ data: any[] | null; error: any }> {
    try {
      let sql = `SELECT ${this.selectColumns.join(', ')} FROM ${this.table}`;
      const params: any[] = [];

      // Add WHERE conditions
      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map(condition => {
          if (condition.operator === 'IN') {
            const placeholders = condition.value.map(() => '?').join(', ');
            params.push(...condition.value);
            return `${condition.column} IN (${placeholders})`;
          } else {
            params.push(condition.value);
            return `${condition.column} ${condition.operator} ?`;
          }
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
      }

      // Add ORDER BY
      if (this.orderByClause) {
        sql += ` ${this.orderByClause}`;
      }

      // Add LIMIT
      if (this.limitValue) {
        sql += ` LIMIT ${this.limitValue}`;
      }

      const stmt = this.db.prepare(sql);
      const data = stmt.all(params);

      return { data, error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
  }

  // Insert data
  async insert(data: any | any[]): Promise<{ data: any[] | null; error: any }> {
    try {
      const records = Array.isArray(data) ? data : [data];
      const insertedData: any[] = [];

      for (const record of records) {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = columns.map(() => '?').join(', ');

        const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`;
        const stmt = this.db.prepare(sql);
        
        const result = stmt.run(values);
        
        // Get the inserted record
        const selectStmt = this.db.prepare(`SELECT * FROM ${this.table} WHERE rowid = ?`);
        const insertedRecord = selectStmt.get(result.lastInsertRowid);
        insertedData.push(insertedRecord);
      }

      return { data: insertedData, error: null };
    } catch (error) {
      console.error('Database insert error:', error);
      return { data: null, error };
    }
  }

  // Update data
  async update(data: any): Promise<{ data: any[] | null; error: any }> {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      let sql = `UPDATE ${this.table} SET ${columns.map(col => `${col} = ?`).join(', ')}`;
      const params = [...values];

      // Add WHERE conditions
      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map(condition => {
          if (condition.operator === 'IN') {
            const placeholders = condition.value.map(() => '?').join(', ');
            params.push(...condition.value);
            return `${condition.column} IN (${placeholders})`;
          } else {
            params.push(condition.value);
            return `${condition.column} ${condition.operator} ?`;
          }
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
      }

      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);

      // Get updated records
      const selectSql = `SELECT * FROM ${this.table}`;
      const selectParams: any[] = [];
      
      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map(condition => {
          if (condition.operator === 'IN') {
            const placeholders = condition.value.map(() => '?').join(', ');
            selectParams.push(...condition.value);
            return `${condition.column} IN (${placeholders})`;
          } else {
            selectParams.push(condition.value);
            return `${condition.column} ${condition.operator} ?`;
          }
        }).join(' AND ');
        const selectStmt = this.db.prepare(`${selectSql} WHERE ${whereClause}`);
        const updatedData = selectStmt.all(selectParams);
        return { data: updatedData, error: null };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('Database update error:', error);
      return { data: null, error };
    }
  }

  // Delete data
  async delete(): Promise<{ data: any[] | null; error: any }> {
    try {
      let sql = `DELETE FROM ${this.table}`;
      const params: any[] = [];

      // Add WHERE conditions
      if (this.whereConditions.length > 0) {
        const whereClause = this.whereConditions.map(condition => {
          if (condition.operator === 'IN') {
            const placeholders = condition.value.map(() => '?').join(', ');
            params.push(...condition.value);
            return `${condition.column} IN (${placeholders})`;
          } else {
            params.push(condition.value);
            return `${condition.column} ${condition.operator} ?`;
          }
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
      }

      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);

      return { data: [], error: null };
    } catch (error) {
      console.error('Database delete error:', error);
      return { data: null, error };
    }
  }
}

// Create and export the local database client instance
export const localDb = new LocalDatabaseClient();

// Export a function that returns the appropriate client based on environment
export const getDbClient = () => {
  // Check if we should use local database
  const useLocalDb = process.env.USE_LOCAL_DB === 'true' || process.env.NODE_ENV === 'development';
  
  if (useLocalDb) {
    return localDb;
  }
  
  // Fallback to Supabase (you would import the actual supabase client here)
  // return supabase;
  return localDb; // For now, always use local
};

export default localDb;