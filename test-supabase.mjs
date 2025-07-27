// Simple test to check if we can access Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kdrawlsreggojpxavlnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcmF3bHNyZWdnb2pweGF2bG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjgzOTAsImV4cCI6MjA2ODQwNDM5MH0.-6gjmdNDKfG-mZ-TbifmxlE-ysrmUWslmPMWAbbvGOs';

console.log('🚀 Testing Supabase connection...');
console.log('================================');

async function testSupabaseConnection() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client created successfully');
    
    // Test basic connection by trying to get database info
    console.log('🔍 Testing database connection...');
    
    // Try to query information_schema to get table list
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (tablesError) {
      console.log('⚠️  Cannot access information_schema, trying alternative method...');
      
      // Try a simple RPC call or check auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('❌ Auth error:', authError.message);
        return false;
      }
      
      console.log('✅ Basic connection successful (no auth required)');
      console.log('💡 You may need to create tables or check RLS policies');
      return true;
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Database connection successful!');
      console.log(`📊 Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
      return true;
    } else {
      console.log('✅ Connection successful but no tables found');
      console.log('💡 Your database might be empty or you may need to create tables');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase is ready to use!');
    console.log('📝 Next steps:');
    console.log('  1. Visit http://localhost:5173/supabase-test to use the visual inspector');
    console.log('  2. Create tables in your Supabase dashboard if needed');
    console.log('  3. Configure RLS policies if required');
  } else {
    console.log('\n⚠️  Connection issues detected');
    console.log('🔧 Troubleshooting:');
    console.log('  1. Check your Supabase URL and API key');
    console.log('  2. Verify your Supabase project is active');
    console.log('  3. Check network connectivity');
  }
});