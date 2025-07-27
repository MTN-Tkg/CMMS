import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function executeSql(query) {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/pg_execute`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
  };
  
  const body = JSON.stringify({ sql: query });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing SQL:', error);
    return null;
  }
}

async function addMissingColumns() {
  // Add actual_hours to work_orders
  await executeSql("ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;");
  
  // Add is_critical to work_order_tasks
  await executeSql("ALTER TABLE work_order_tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;");
  
  console.log('🎉 Missing columns added successfully!');
}

addMissingColumns();