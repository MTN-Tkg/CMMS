import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEquipmentAndAssets() {
  console.log('🔍 Inspecting Equipment Types and Assets structure...\n');

  try {
    // Check equipment_types table
    console.log('📋 Checking equipment_types table...');
    const { data: equipmentTypes, error: etError } = await supabase
      .from('equipment_types')
      .select('*')
      .limit(5);

    if (etError) {
      console.error('❌ Error fetching equipment_types:', etError.message);
    } else {
      console.log('✅ equipment_types table exists');
      if (equipmentTypes && equipmentTypes.length > 0) {
        console.log('📊 equipment_types columns:', Object.keys(equipmentTypes[0]));
        console.log('📊 Sample equipment_types data:');
        equipmentTypes.forEach((et, index) => {
          console.log(`   ${index + 1}. ID: ${et.id}, Name: ${et.name || et.name_th}, Name_TH: ${et.name_th || 'N/A'}`);
        });
      } else {
        console.log('📊 equipment_types table is empty');
      }
    }

    console.log('\n📋 Checking assets table...');
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .limit(5);

    if (assetsError) {
      console.error('❌ Error fetching assets:', assetsError.message);
    } else {
      console.log('✅ assets table exists');
      if (assets && assets.length > 0) {
        console.log('📊 assets columns:', Object.keys(assets[0]));
        console.log('📊 Sample assets data:');
        assets.forEach((asset, index) => {
          console.log(`   ${index + 1}. ID: ${asset.id}, Equipment Type: ${asset.equipment_type_id}, System: ${asset.system_id}, Serial: ${asset.serial_number}, Status: ${asset.status}`);
        });
      } else {
        console.log('📊 assets table is empty');
      }
    }

    console.log('\n📋 Checking systems table...');
    const { data: systems, error: systemsError } = await supabase
      .from('systems')
      .select('*')
      .limit(5);

    if (systemsError) {
      console.error('❌ Error fetching systems:', systemsError.message);
    } else {
      console.log('✅ systems table exists');
      if (systems && systems.length > 0) {
        console.log('📊 systems columns:', Object.keys(systems[0]));
        console.log('📊 Sample systems data:');
        systems.forEach((system, index) => {
          console.log(`   ${index + 1}. ID: ${system.id}, Name: ${system.name || system.name_th}, Location: ${system.location_id}`);
        });
      } else {
        console.log('📊 systems table is empty');
      }
    }

    console.log('\n📋 Checking locations table...');
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .limit(5);

    if (locationsError) {
      console.error('❌ Error fetching locations:', locationsError.message);
    } else {
      console.log('✅ locations table exists');
      if (locations && locations.length > 0) {
        console.log('📊 locations columns:', Object.keys(locations[0]));
        console.log('📊 Sample locations data:');
        locations.forEach((location, index) => {
          console.log(`   ${index + 1}. ID: ${location.id}, Name: ${location.name}`);
        });
      } else {
        console.log('📊 locations table is empty');
      }
    }

    // Check relationships
    console.log('\n🔗 Checking relationships...');
    
    // Get assets with their equipment types and systems
    const { data: assetsWithRelations, error: relError } = await supabase
      .from('assets')
      .select(`
        id,
        serial_number,
        status,
        equipment_type_id,
        system_id,
        equipment_types (
          id,
          name,
          name_th
        ),
        systems (
          id,
          name,
          name_th,
          location_id,
          locations (
            id,
            name
          )
        )
      `)
      .limit(3);

    if (relError) {
      console.error('❌ Error fetching relationships:', relError.message);
    } else if (assetsWithRelations && assetsWithRelations.length > 0) {
      console.log('✅ Relationship data:');
      assetsWithRelations.forEach((asset, index) => {
        console.log(`   ${index + 1}. Asset: ${asset.id}`);
        console.log(`      Equipment Type: ${asset.equipment_types?.name_th || asset.equipment_types?.name || 'N/A'}`);
        console.log(`      System: ${asset.systems?.name_th || asset.systems?.name || 'N/A'}`);
        console.log(`      Location: ${asset.systems?.locations?.name || 'N/A'}`);
        console.log(`      Serial: ${asset.serial_number}, Status: ${asset.status}`);
      });
    }

    console.log('\n🎯 Summary:');
    console.log('Equipment Types = ประเภทเครื่องจักรใหญ่ (เช่น รถแทรกเตอร์, ปั๊มน้ำ, เครื่องเก็บเกี่ยว)');
    console.log('Assets = หน่วยย่อยของเครื่องจักร (เช่น รถแทรกเตอร์คันที่ 1, ปั๊มน้ำตัวที่ 2)');
    console.log('Systems = ระบบงาน (เช่น ระบบชลประทาน, ระบบยานพาหนะ)');
    console.log('Locations = สถานที่ (เช่น ไร่ A, โรงเก็บ)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the inspection
inspectEquipmentAndAssets();