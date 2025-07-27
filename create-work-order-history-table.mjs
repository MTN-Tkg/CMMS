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

async function createWorkOrderHistoryTable() {
  console.log('🔧 Creating work_order_history table for audit trail...\n');

  try {
    // Create work_order_history table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create work_order_history table for audit trail
        CREATE TABLE IF NOT EXISTS work_order_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          work_order_id VARCHAR(50) NOT NULL,
          action_type VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'assigned', 'updated', 'commented'
          old_value TEXT,
          new_value TEXT,
          field_name VARCHAR(100), -- field that was changed
          user_id VARCHAR(50),
          user_name VARCHAR(100),
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_work_order_history_work_order_id 
        ON work_order_history(work_order_id);
        
        CREATE INDEX IF NOT EXISTS idx_work_order_history_timestamp 
        ON work_order_history(timestamp);

        -- Create work_order_comments table
        CREATE TABLE IF NOT EXISTS work_order_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          work_order_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(50),
          user_name VARCHAR(100) NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index for comments
        CREATE INDEX IF NOT EXISTS idx_work_order_comments_work_order_id 
        ON work_order_comments(work_order_id);

        -- Create work_order_attachments table
        CREATE TABLE IF NOT EXISTS work_order_attachments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          work_order_id VARCHAR(50) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER,
          file_type VARCHAR(100),
          uploaded_by_user_id VARCHAR(50),
          uploaded_by_name VARCHAR(100),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          description TEXT
        );

        -- Create index for attachments
        CREATE INDEX IF NOT EXISTS idx_work_order_attachments_work_order_id 
        ON work_order_attachments(work_order_id);
      `
    });

    if (error) {
      console.error('❌ Error creating tables:', error);
      return;
    }

    console.log('✅ Successfully created work_order_history table');
    console.log('✅ Successfully created work_order_comments table');
    console.log('✅ Successfully created work_order_attachments table');

    // Test the tables by inserting sample data
    console.log('\n📝 Testing tables with sample data...');

    // Insert sample history record
    const { error: historyError } = await supabase
      .from('work_order_history')
      .insert([
        {
          work_order_id: 'WO-TEST-001',
          action_type: 'created',
          new_value: 'Pending',
          field_name: 'status',
          user_name: 'System Test',
          notes: 'Work order created via system test'
        }
      ]);

    if (historyError) {
      console.error('❌ Error inserting test history:', historyError);
    } else {
      console.log('✅ Test history record inserted successfully');
    }

    // Insert sample comment
    const { error: commentError } = await supabase
      .from('work_order_comments')
      .insert([
        {
          work_order_id: 'WO-TEST-001',
          user_name: 'Test User',
          comment: 'This is a test comment for the work order system'
        }
      ]);

    if (commentError) {
      console.error('❌ Error inserting test comment:', commentError);
    } else {
      console.log('✅ Test comment inserted successfully');
    }

    // Verify tables exist and have data
    console.log('\n🔍 Verifying table structure...');

    const { data: historyData, error: historySelectError } = await supabase
      .from('work_order_history')
      .select('*')
      .limit(1);

    if (historySelectError) {
      console.error('❌ Error selecting from work_order_history:', historySelectError);
    } else {
      console.log('✅ work_order_history table verified');
      if (historyData && historyData.length > 0) {
        console.log('📊 Sample history columns:', Object.keys(historyData[0]));
      }
    }

    const { data: commentsData, error: commentsSelectError } = await supabase
      .from('work_order_comments')
      .select('*')
      .limit(1);

    if (commentsSelectError) {
      console.error('❌ Error selecting from work_order_comments:', commentsSelectError);
    } else {
      console.log('✅ work_order_comments table verified');
      if (commentsData && commentsData.length > 0) {
        console.log('📊 Sample comments columns:', Object.keys(commentsData[0]));
      }
    }

    console.log('\n🎯 Summary:');
    console.log('- work_order_history: For tracking all changes and actions');
    console.log('- work_order_comments: For user comments and discussions');
    console.log('- work_order_attachments: For file attachments');
    console.log('\nThese tables will enable full audit trail and collaboration features.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the creation
createWorkOrderHistoryTable();