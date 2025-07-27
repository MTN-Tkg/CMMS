# Supabase Integration Setup

This document explains how to set up and use the Supabase integration for your CMMS application.

## 🚀 Quick Start

### 1. Environment Variables

Add your Supabase credentials to the `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://kdrawlsreggojpxavlnh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**Important:** Replace `your_supabase_anon_key_here` and `your_supabase_service_role_key_here` with your actual Supabase keys.

### 2. Test the Connection

1. Start your development server: `npm run dev`
2. Navigate to `/supabase-test` in your browser
3. Click "Inspect Database" to connect and view your existing tables
4. Check the browser console for detailed logs

## 📁 Project Structure

```
shared/supabase/
├── index.ts              # Main exports
├── config.ts             # Configuration and constants
├── client.ts             # Supabase client initialization
├── types.ts              # Flexible TypeScript types
├── database-service.ts   # Generic database operations
├── database-inspector.ts # Database schema inspection
└── test-connection.ts    # Testing utilities
```

## 🔧 Usage Examples

### Basic Database Operations

```typescript
import { createTableService } from '../shared/supabase';

// Create a service for any table
const usersService = createTableService('users');

// Get all records
const { data, error } = await usersService.getAll();

// Get with filters and options
const { data } = await usersService.getAll({
  filters: { status: 'active' },
  limit: 10,
  orderBy: 'created_at',
  ascending: false
});

// Get by ID
const { data: user } = await usersService.getById('123');

// Create new record
const { data: newUser } = await usersService.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Update record
const { data: updatedUser } = await usersService.update('123', {
  name: 'Jane Doe'
});

// Delete record
await usersService.delete('123');
```

### Database Inspection

```typescript
import { runDatabaseInspection, testTableAccess } from '../shared/supabase';

// Inspect entire database
const result = await runDatabaseInspection();
console.log('Tables:', result.tableNames);
console.log('Schema:', result.schema);

// Test specific table
const data = await testTableAccess('users', 5);
console.log('Sample data:', data);
```

### Using with React Components

```typescript
import React, { useEffect, useState } from 'react';
import { createTableService } from '../shared/supabase';

const MyComponent = () => {
  const [users, setUsers] = useState([]);
  const usersService = createTableService('users');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await usersService.getAll();
      if (!error && data) {
        setUsers(data);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

## 🎯 Key Features

### 1. **Flexible Schema Adaptation**
- Automatically adapts to your existing database structure
- No need to modify your Supabase tables
- Flexible TypeScript types that work with any column structure

### 2. **Generic Database Service**
- Works with any table name
- Consistent API across all tables
- Built-in error handling and logging

### 3. **Database Inspection Tools**
- View all tables and their structures
- Sample data preview
- Column information and types
- Connection testing utilities

### 4. **Type Safety**
- TypeScript support with flexible interfaces
- Generic types that adapt to your data
- Proper error handling types

## 🔍 Database Inspector

The `/supabase-test` page provides a visual interface to:

- Test your Supabase connection
- View all tables in your database
- Inspect table structures and columns
- Preview sample data from each table
- Debug connection issues

## 🛠️ Troubleshooting

### Connection Issues

1. **Check Environment Variables**
   - Ensure `VITE_SUPABASE_URL` is correct
   - Verify `VITE_SUPABASE_ANON_KEY` is set
   - Make sure there are no extra spaces or quotes

2. **Check Supabase Project**
   - Verify your project is active
   - Check if RLS (Row Level Security) is properly configured
   - Ensure your anon key has the necessary permissions

3. **Browser Console**
   - Check for detailed error messages
   - Look for network errors or CORS issues

### Common Errors

- **"Cannot find module './types'"**: Make sure all files are created and TypeScript is properly configured
- **"Connection test failed"**: Check your Supabase URL and API key
- **"Access denied"**: Check your RLS policies and permissions

## 📚 Next Steps

1. **Add your Supabase keys** to the `.env` file
2. **Test the connection** using `/supabase-test`
3. **Explore your database structure** using the inspector
4. **Start using the services** in your components
5. **Adapt the code** to match your specific table structures

## 🔐 Security Notes

- Never commit your actual Supabase keys to version control
- Use environment variables for all sensitive data
- The service role key should only be used server-side
- Consider implementing proper RLS policies in Supabase

---

**Ready to connect!** 🎉

Visit `/supabase-test` to start exploring your database structure and testing the connection.