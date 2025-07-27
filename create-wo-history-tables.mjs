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

async function createWorkOrderTables() {
  console.log('🔧 Creating work order history tables...\n');

  try {
    // First, let's check if tables already exist by trying to select from them
    console.log('📋 Checking existing tables...');

    // Check work_order_history
    const { data: historyCheck, error: historyError } = await supabase
      .from('work_order_history')
      .select('id')
      .limit(1);

    if (historyError && historyError.code === 'PGRST116') {
      console.log('❌ work_order_history table does not exist');
    } else {
      console.log('✅ work_order_history table already exists');
    }

    // Check work_order_comments
    const { data: commentsCheck, error: commentsError } = await supabase
      .from('work_order_comments')
      .select('id')
      .limit(1);

    if (commentsError && commentsError.code === 'PGRST116') {
      console.log('❌ work_order_comments table does not exist');
    } else {
      console.log('✅ work_order_comments table already exists');
    }

    // Check work_order_attachments
    const { data: attachmentsCheck, error: attachmentsError } = await supabase
      .from('work_order_attachments')
      .select('id')
      .limit(1);

    if (attachmentsError && attachmentsError.code === 'PGRST116') {
      console.log('❌ work_order_attachments table does not exist');
    } else {
      console.log('✅ work_order_attachments table already exists');
    }

    console.log('\n📝 Since we cannot create tables via client, let\'s test with existing tables...');

    // Test inserting into work_order_history if it exists
    if (!historyError || historyError.code !== 'PGRST116') {
      console.log('🧪 Testing work_order_history table...');
      const { data: historyInsert, error: historyInsertError } = await supabase
        .from('work_order_history')
        .insert([
          {
            work_order_id: 'WO-TEST-' + Date.now(),
            action_type: 'created',
            new_value: 'Pending',
            field_name: 'status',
            user_name: 'System Test',
            notes: 'Work order created via system test'
          }
        ])
        .select();

      if (historyInsertError) {
        console.error('❌ Error inserting test history:', historyInsertError);
      } else {
        console.log('✅ Test history record inserted successfully');
      }
    }

    // Test inserting into work_order_comments if it exists
    if (!commentsError || commentsError.code !== 'PGRST116') {
      console.log('🧪 Testing work_order_comments table...');
      const { data: commentInsert, error: commentInsertError } = await supabase
        .from('work_order_comments')
        .insert([
          {
            work_order_id: 'WO-TEST-' + Date.now(),
            user_name: 'Test User',
            comment: 'This is a test comment for the work order system'
          }
        ])
        .select();

      if (commentInsertError) {
        console.error('❌ Error inserting test comment:', commentInsertError);
      } else {
        console.log('✅ Test comment inserted successfully');
      }
    }

    // Show recent history records
    console.log('\n📊 Recent work order history:');
    const { data: recentHistory, error: recentHistoryError } = await supabase
      .from('work_order_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentHistoryError) {
      console.error('❌ Error fetching recent history:', recentHistoryError);
    } else if (recentHistory && recentHistory.length > 0) {
      recentHistory.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.action_type} - ${record.work_order_id} by ${record.user_name}`);
      });
    } else {
      console.log('   No history records found');
    }

    // Show recent comments
    console.log('\n💬 Recent work order comments:');
    const { data: recentComments, error: recentCommentsError } = await supabase
      .from('work_order_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentCommentsError) {
      console.error('❌ Error fetching recent comments:', recentCommentsError);
    } else if (recentComments && recentComments.length > 0) {
      recentComments.forEach((comment, index) => {
        console.log(`   ${index + 1}. ${comment.work_order_id}: "${comment.comment}" by ${comment.user_name}`);
      });
    } else {
      console.log('   No comments found');
    }

    console.log('\n🎯 Summary:');
    console.log('Tables need to be created manually in Supabase dashboard using the SQL file:');
    console.log('- work-order-history-schema.sql');
    console.log('\nOnce tables are created, the system will support:');
    console.log('- Full audit trail for work orders');
    console.log('- User comments and discussions');
    console.log('- File attachments');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the creation
createWorkOrderTables();