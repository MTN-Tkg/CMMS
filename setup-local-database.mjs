#!/usr/bin/env node

/**
 * Local Database Setup Script
 * Creates SQLite database from Supabase backup data
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = './local-database.sqlite';
const BACKUP_FILE = './complete-database-backup/complete-backup-2025-07-27T07-58-31-386Z.json';

console.log('🚀 Setting up local CMMS database...');

// Remove existing database if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('📝 Removed existing database');
}

// Create new database
const db = new Database(DB_PATH);
console.log('✅ Created new SQLite database');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read backup data
const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
console.log(`📊 Loaded backup data: ${backupData.backup_info.total_records} records from ${backupData.backup_info.tables_with_data} tables`);

// Create tables based on the backup data structure
const createTables = () => {
  console.log('🏗️  Creating database schema...');

  // Companies table
  db.exec(`
    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      code TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      email TEXT,
      phone TEXT,
      address TEXT,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Locations table
  db.exec(`
    CREATE TABLE locations (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      name TEXT NOT NULL,
      code TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      address TEXT,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Systems table
  db.exec(`
    CREATE TABLE systems (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      name TEXT NOT NULL,
      name_th TEXT,
      description TEXT,
      code TEXT,
      location_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    )
  `);

  // Equipment types table
  db.exec(`
    CREATE TABLE equipment_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_th TEXT,
      description TEXT
    )
  `);

  // Assets table
  db.exec(`
    CREATE TABLE assets (
      id TEXT PRIMARY KEY,
      equipment_type_id TEXT,
      system_id TEXT,
      serial_number TEXT,
      status TEXT,
      FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
      FOREIGN KEY (system_id) REFERENCES systems(id)
    )
  `);

  // Parts table
  db.exec(`
    CREATE TABLE parts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      min_stock_level INTEGER DEFAULT 0
    )
  `);

  // PM Templates table
  db.exec(`
    CREATE TABLE pm_templates (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      system_id TEXT,
      equipment_type_id TEXT,
      name TEXT NOT NULL,
      frequency_type TEXT,
      frequency_value INTEGER,
      estimated_minutes INTEGER,
      remarks TEXT,
      template_code TEXT,
      template_name TEXT,
      description TEXT,
      estimated_duration INTEGER,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (system_id) REFERENCES systems(id),
      FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id)
    )
  `);

  // Work Orders table
  db.exec(`
    CREATE TABLE work_orders (
      id TEXT PRIMARY KEY,
      work_type TEXT,
      title TEXT,
      description TEXT,
      status TEXT,
      priority INTEGER,
      asset_id TEXT,
      location_id TEXT,
      system_id TEXT,
      pm_template_id TEXT,
      assigned_to_user_id TEXT,
      requested_by_user_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      scheduled_date TEXT,
      completed_at TEXT,
      wo_number TEXT,
      estimated_hours INTEGER,
      assigned_to TEXT,
      requested_by TEXT,
      total_cost REAL DEFAULT 0,
      labor_cost REAL DEFAULT 0,
      parts_cost REAL DEFAULT 0,
      FOREIGN KEY (asset_id) REFERENCES assets(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (system_id) REFERENCES systems(id),
      FOREIGN KEY (pm_template_id) REFERENCES pm_templates(id)
    )
  `);

  // Work Order Parts table
  db.exec(`
    CREATE TABLE work_order_parts (
      id TEXT PRIMARY KEY,
      work_order_id TEXT NOT NULL,
      part_id TEXT NOT NULL,
      quantity_used INTEGER DEFAULT 1,
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
      FOREIGN KEY (part_id) REFERENCES parts(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      user_id TEXT,
      read_status BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database schema created successfully');
};

// Insert data from backup
const insertData = () => {
  console.log('📥 Importing data from backup...');

  // Temporarily disable foreign key constraints
  db.pragma('foreign_keys = OFF');

  const tables = backupData.tables;
  let totalInserted = 0;

  // Insert data in dependency order
  const insertOrder = [
    'companies',
    'locations', 
    'systems',
    'equipment_types',
    'assets',
    'parts',
    'pm_templates',
    'work_orders',
    'work_order_parts'
  ];

  for (const tableName of insertOrder) {
    const tableData = tables[tableName];
    
    if (!tableData || !tableData.data || tableData.data.length === 0) {
      console.log(`⚠️  Skipping ${tableName} - no data available`);
      continue;
    }

    const data = tableData.data;
    const columns = tableData.table_info.columns;
    
    if (columns.length === 0) {
      console.log(`⚠️  Skipping ${tableName} - no column information`);
      continue;
    }

    // Create insert statement
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = db.prepare(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

    // Insert data in transaction for better performance
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        const values = columns.map(col => {
          let value = row[col] ?? null;
          // Handle boolean values
          if (typeof value === 'boolean') {
            value = value ? 1 : 0;
          }
          // Handle objects/arrays by converting to JSON string
          if (value !== null && typeof value === 'object') {
            value = JSON.stringify(value);
          }
          return value;
        });
        insertStmt.run(values);
      }
    });

    try {
      insertMany(data);
      console.log(`✅ Inserted ${data.length} records into ${tableName}`);
      totalInserted += data.length;
    } catch (error) {
      console.error(`❌ Error inserting data into ${tableName}:`, error.message);
    }
  }

  // Re-enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  console.log(`🎉 Total records imported: ${totalInserted}`);
};

// Create indexes for better performance
const createIndexes = () => {
  console.log('🔍 Creating database indexes...');

  const indexes = [
    'CREATE INDEX idx_assets_equipment_type ON assets(equipment_type_id)',
    'CREATE INDEX idx_assets_system ON assets(system_id)',
    'CREATE INDEX idx_work_orders_asset ON work_orders(asset_id)',
    'CREATE INDEX idx_work_orders_status ON work_orders(status)',
    'CREATE INDEX idx_work_orders_created ON work_orders(created_at)',
    'CREATE INDEX idx_locations_company ON locations(company_id)',
    'CREATE INDEX idx_systems_company ON systems(company_id)',
    'CREATE INDEX idx_pm_templates_company ON pm_templates(company_id)',
    'CREATE INDEX idx_work_order_parts_wo ON work_order_parts(work_order_id)',
    'CREATE INDEX idx_work_order_parts_part ON work_order_parts(part_id)'
  ];

  for (const indexSql of indexes) {
    try {
      db.exec(indexSql);
    } catch (error) {
      console.warn(`⚠️  Index creation warning: ${error.message}`);
    }
  }

  console.log('✅ Database indexes created');
};

// Main setup function
const setupDatabase = () => {
  try {
    createTables();
    insertData();
    createIndexes();

    // Verify data
    const stats = {
      companies: db.prepare('SELECT COUNT(*) as count FROM companies').get().count,
      locations: db.prepare('SELECT COUNT(*) as count FROM locations').get().count,
      systems: db.prepare('SELECT COUNT(*) as count FROM systems').get().count,
      equipment_types: db.prepare('SELECT COUNT(*) as count FROM equipment_types').get().count,
      assets: db.prepare('SELECT COUNT(*) as count FROM assets').get().count,
      parts: db.prepare('SELECT COUNT(*) as count FROM parts').get().count,
      pm_templates: db.prepare('SELECT COUNT(*) as count FROM pm_templates').get().count,
      work_orders: db.prepare('SELECT COUNT(*) as count FROM work_orders').get().count,
      work_order_parts: db.prepare('SELECT COUNT(*) as count FROM work_order_parts').get().count
    };

    console.log('\n📊 Database Statistics:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });

    console.log(`\n🎉 Local database setup completed successfully!`);
    console.log(`📁 Database file: ${path.resolve(DB_PATH)}`);
    console.log(`💾 Database size: ${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
};

// Run setup
setupDatabase();