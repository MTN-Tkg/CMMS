# 🗄️ Local Database Setup Guide

## Overview

This guide documents the setup of a local SQLite database server for the CMMS application as a temporary solution before migrating to a dedicated server. The local database contains all the data from the original Supabase setup and provides the same functionality.

## 📊 Database Information

- **Database Type**: SQLite 3
- **Database File**: `local-database.sqlite` (0.20 MB)
- **Total Records**: 304 records across 9 tables
- **Data Source**: Complete backup from Supabase (2025-07-27)

## 🏗️ Database Schema

### Tables and Record Counts

| Table | Records | Description |
|-------|---------|-------------|
| `companies` | 9 | Company information (LAK, TKB, SM, etc.) |
| `locations` | 55 | Physical locations within companies |
| `systems` | 39 | Equipment systems (electrical, climate, etc.) |
| `equipment_types` | 44 | Types of equipment (generators, pumps, etc.) |
| `assets` | 10 | Physical assets and equipment |
| `parts` | 9 | Spare parts inventory |
| `pm_templates` | 123 | Preventive maintenance templates |
| `work_orders` | 10 | Work orders (PM, CM, Install, etc.) |
| `work_order_parts` | 5 | Parts used in work orders |

### Key Features

- ✅ Foreign key constraints enabled
- ✅ Proper indexing for performance
- ✅ Data integrity maintained
- ✅ Compatible with existing application code

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js (v18+)
- npm packages: `better-sqlite3`, `sqlite3`

### 2. Database Creation

Run the setup script to create and populate the database:

```bash
node setup-local-database.mjs
```

This script will:
- Create SQLite database file
- Set up all table schemas
- Import data from backup
- Create performance indexes
- Verify data integrity

### 3. Configuration

The application automatically uses the local database when:

```env
# .env file
VITE_USE_LOCAL_DB=true
USE_LOCAL_DB=true
```

## 🔧 Usage

### Database Client

The local database uses a custom client that mimics the Supabase interface:

```typescript
import { localDb } from './shared/local-database/client';

// Query data
const { data, error } = await localDb
  .from('assets')
  .select()
  .eq('status', 'Working')
  .execute();

// Insert data
const { data, error } = await localDb
  .from('work_orders')
  .insert({
    title: 'New Work Order',
    status: 'Open',
    priority: 2
  });
```

### Supported Operations

- ✅ `select()` - Query data
- ✅ `insert()` - Add new records
- ✅ `update()` - Modify existing records
- ✅ `delete()` - Remove records
- ✅ `eq()`, `neq()`, `gt()`, `lt()` - Filtering
- ✅ `like()`, `in()` - Advanced filtering
- ✅ `order()` - Sorting
- ✅ `limit()` - Result limiting

### Authentication

Mock authentication is provided for development:

```typescript
// Get current user (returns mock user)
const { data: { user }, error } = await localDb.auth.getUser();

// Get session (returns mock session)
const { data: { session }, error } = await localDb.auth.getSession();

// Sign out (always successful)
const { error } = await localDb.auth.signOut();
```

## 🧪 Testing

Run the test script to verify functionality:

```bash
node --import tsx test-local-database.mjs
```

Expected output:
```
🧪 Testing local database functionality...

📋 Test 1: Querying companies...
✅ Found 9 companies

📋 Test 2: Querying assets...
✅ Found 10 assets

📋 Test 3: Querying work orders...
✅ Found 10 work orders

📊 Database Statistics:
   companies: 9 records
   locations: 55 records
   systems: 39 records
   equipment_types: 44 records
   assets: 10 records
   parts: 9 records
   pm_templates: 123 records
   work_orders: 10 records
   work_order_parts: 5 records

🎉 Local database tests completed successfully!
```

## 📁 File Structure

```
CMMS V2/
├── local-database.sqlite           # SQLite database file
├── setup-local-database.mjs        # Database setup script
├── test-local-database.mjs         # Test script
├── shared/
│   ├── local-database/
│   │   └── client.ts               # Local database client
│   └── supabase/
│       ├── client.ts               # Updated to support local DB
│       └── config.ts               # Database configuration
├── complete-database-backup/       # Original backup data
└── .env                            # Environment configuration
```

## 🔄 Switching Between Local and Remote

### Use Local Database (Current Setup)
```env
VITE_USE_LOCAL_DB=true
USE_LOCAL_DB=true
```

### Use Supabase (Remote)
```env
VITE_USE_LOCAL_DB=false
USE_LOCAL_DB=false
```

## 🚨 Important Notes

### Limitations
- **No real-time subscriptions**: SQLite doesn't support real-time features
- **Single-user access**: SQLite is not designed for concurrent users
- **No built-in authentication**: Uses mock authentication for development
- **File-based**: Database is stored as a single file

### Data Persistence
- All data is stored in `local-database.sqlite`
- Data persists between application restarts
- Backup the `.sqlite` file to preserve data

### Performance
- Excellent for development and testing
- Suitable for single-user scenarios
- Fast queries due to local storage
- Indexed for optimal performance

## 🔧 Maintenance

### Backup Database
```bash
# Copy the database file
cp local-database.sqlite backup-$(date +%Y%m%d).sqlite
```

### Reset Database
```bash
# Delete and recreate
rm local-database.sqlite
node setup-local-database.mjs
```

### View Database Contents
Use any SQLite browser or command line:
```bash
sqlite3 local-database.sqlite
.tables
SELECT * FROM companies LIMIT 5;
```

## 🎯 Migration Path

When ready to move to a dedicated server:

1. **Export data** from SQLite
2. **Set up PostgreSQL** server
3. **Import data** to PostgreSQL
4. **Update configuration** to point to new server
5. **Test thoroughly** before switching

## ✅ Verification Checklist

- [ ] Database file created successfully
- [ ] All 304 records imported
- [ ] Application connects to local database
- [ ] CRUD operations work correctly
- [ ] Mock authentication functions
- [ ] Performance is acceptable
- [ ] Data integrity maintained

## 🆘 Troubleshooting

### Database File Not Found
```bash
# Ensure you're in the correct directory
pwd
# Should show: .../CMMS V2

# Recreate database
node setup-local-database.mjs
```

### Permission Errors
```bash
# Check file permissions
ls -la local-database.sqlite

# Fix permissions if needed (Linux/Mac)
chmod 644 local-database.sqlite
```

### Connection Errors
- Verify `USE_LOCAL_DB=true` in `.env`
- Restart the development server
- Check console for error messages

---

## 📞 Support

For issues with the local database setup:
1. Check the console for error messages
2. Verify all files are in place
3. Run the test script to diagnose issues
4. Recreate the database if necessary

**Database Status**: ✅ Ready for use as temporary server
**Migration Ready**: ✅ Can be moved to dedicated server when needed