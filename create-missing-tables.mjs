import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createMissingTables() {
  console.log('🔧 Creating missing tables for Phase 1 completion...');
  console.log('');

  try {
    // Create work_order_history table
    console.log('📋 Creating work_order_history table...');
    const historyTableSQL = `
      CREATE TABLE IF NOT EXISTS work_order_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
        field_changed TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: historyError } = await supabase.rpc('exec_sql', {
      sql: historyTableSQL
    });

    if (historyError) {
      console.log('❌ Error creating work_order_history table:', historyError.message);
      // Try alternative approach using direct SQL execution
      console.log('🔄 Trying alternative approach...');
      
      // Since we can't execute DDL directly, let's create a simple insert to test table creation
      const testHistoryInsert = {
        work_order_id: 'test-wo-001',
        field_changed: 'status',
        old_value: 'open',
        new_value: 'in_progress',
        changed_by: 'system',
        changed_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('work_order_history')
        .insert(testHistoryInsert)
        .select();

      if (insertError) {
        console.log('❌ work_order_history table does not exist and cannot be created via API');
        console.log('📝 SQL needed for work_order_history:');
        console.log(historyTableSQL);
      } else {
        console.log('✅ work_order_history table exists or was created');
        // Clean up test record
        await supabase
          .from('work_order_history')
          .delete()
          .eq('work_order_id', 'test-wo-001');
      }
    } else {
      console.log('✅ work_order_history table created successfully');
    }

    console.log('');

    // Create work_order_comments table
    console.log('📋 Creating work_order_comments table...');
    const commentsTableSQL = `
      CREATE TABLE IF NOT EXISTS work_order_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
        user_id TEXT,
        comment TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: commentsError } = await supabase.rpc('exec_sql', {
      sql: commentsTableSQL
    });

    if (commentsError) {
      console.log('❌ Error creating work_order_comments table:', commentsError.message);
      // Try alternative approach
      console.log('🔄 Trying alternative approach...');
      
      const testCommentInsert = {
        work_order_id: 'test-wo-001',
        user_id: 'test-user',
        comment: 'Test comment',
        is_internal: false,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('work_order_comments')
        .insert(testCommentInsert)
        .select();

      if (insertError) {
        console.log('❌ work_order_comments table does not exist and cannot be created via API');
        console.log('📝 SQL needed for work_order_comments:');
        console.log(commentsTableSQL);
      } else {
        console.log('✅ work_order_comments table exists or was created');
        // Clean up test record
        await supabase
          .from('work_order_comments')
          .delete()
          .eq('work_order_id', 'test-wo-001');
      }
    } else {
      console.log('✅ work_order_comments table created successfully');
    }

    console.log('');
    console.log('🎯 Summary:');
    console.log('If tables could not be created via API, you will need to run the SQL commands manually in Supabase dashboard.');
    console.log('');
    console.log('📋 Complete SQL for manual execution:');
    console.log('');
    console.log('-- Create work_order_history table');
    console.log(historyTableSQL);
    console.log('');
    console.log('-- Create work_order_comments table');
    console.log(commentsTableSQL);
    console.log('');
    console.log('-- Create indexes for better performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_work_order_history_work_order_id ON work_order_history(work_order_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_work_order_history_changed_at ON work_order_history(changed_at);');
    console.log('CREATE INDEX IF NOT EXISTS idx_work_order_comments_work_order_id ON work_order_comments(work_order_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_work_order_comments_created_at ON work_order_comments(created_at);');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

createMissingTables();