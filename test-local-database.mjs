#!/usr/bin/env node

/**
 * Local Database Test Script
 * Tests the local SQLite database functionality
 */

import { localDb } from './shared/local-database/client.ts';

console.log('🧪 Testing local database functionality...\n');

const runTests = async () => {
  try {
    // Test 1: Query companies
    console.log('📋 Test 1: Querying companies...');
    const companiesResult = await localDb.from('companies').select().execute();
    if (companiesResult.error) {
      console.error('❌ Error querying companies:', companiesResult.error);
    } else {
      console.log(`✅ Found ${companiesResult.data?.length || 0} companies`);
      if (companiesResult.data && companiesResult.data.length > 0) {
        console.log('   Sample company:', companiesResult.data[0].name);
      }
    }

    // Test 2: Query assets
    console.log('\n📋 Test 2: Querying assets...');
    const assetsResult = await localDb.from('assets').select().execute();
    if (assetsResult.error) {
      console.error('❌ Error querying assets:', assetsResult.error);
    } else {
      console.log(`✅ Found ${assetsResult.data?.length || 0} assets`);
      if (assetsResult.data && assetsResult.data.length > 0) {
        console.log('   Sample asset:', assetsResult.data[0].id, '-', assetsResult.data[0].status);
      }
    }

    // Test 3: Query work orders
    console.log('\n📋 Test 3: Querying work orders...');
    const workOrdersResult = await localDb.from('work_orders').select().execute();
    if (workOrdersResult.error) {
      console.error('❌ Error querying work orders:', workOrdersResult.error);
    } else {
      console.log(`✅ Found ${workOrdersResult.data?.length || 0} work orders`);
      if (workOrdersResult.data && workOrdersResult.data.length > 0) {
        console.log('   Sample work order:', workOrdersResult.data[0].title);
      }
    }

    // Test 4: Query with conditions
    console.log('\n📋 Test 4: Querying assets with status filter...');
    const workingAssetsResult = await localDb.from('assets').select().eq('status', 'Working').execute();
    if (workingAssetsResult.error) {
      console.error('❌ Error querying working assets:', workingAssetsResult.error);
    } else {
      console.log(`✅ Found ${workingAssetsResult.data?.length || 0} working assets`);
    }

    // Test 5: Query PM templates
    console.log('\n📋 Test 5: Querying PM templates...');
    const pmTemplatesResult = await localDb.from('pm_templates').select().limit(5).execute();
    if (pmTemplatesResult.error) {
      console.error('❌ Error querying PM templates:', pmTemplatesResult.error);
    } else {
      console.log(`✅ Found ${pmTemplatesResult.data?.length || 0} PM templates (limited to 5)`);
      if (pmTemplatesResult.data && pmTemplatesResult.data.length > 0) {
        console.log('   Sample PM template:', pmTemplatesResult.data[0].name);
      }
    }

    // Test 6: Test auth functionality
    console.log('\n📋 Test 6: Testing auth functionality...');
    const userResult = await localDb.auth.getUser();
    if (userResult.error) {
      console.error('❌ Error getting user:', userResult.error);
    } else {
      console.log(`✅ Auth working - User ID: ${userResult.data.user?.id}`);
    }

    // Test 7: Database statistics
    console.log('\n📊 Database Statistics:');
    const tables = ['companies', 'locations', 'systems', 'equipment_types', 'assets', 'parts', 'pm_templates', 'work_orders', 'work_order_parts'];
    
    for (const table of tables) {
      try {
        const result = await localDb.from(table).select('*').execute();
        console.log(`   ${table}: ${result.data?.length || 0} records`);
      } catch (error) {
        console.log(`   ${table}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Local database tests completed successfully!');
    console.log('💡 The local SQLite database is ready to use as a temporary server.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    localDb.close();
  }
};

// Run tests
runTests();