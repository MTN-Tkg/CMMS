import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMissingTables() {
  console.log('🔍 Checking for missing tables...');
  console.log('');

  // Check work_order_history table
  console.log('📋 Checking work_order_history table...');
  try {
    const { data: history, error: historyError } = await supabase
      .from('work_order_history')
      .select('*')
      .limit(1);

    if (historyError) {
      console.log('❌ work_order_history table missing:', historyError.message);
    } else {
      console.log('✅ work_order_history table exists');
      if (history && history.length > 0) {
        console.log('📊 work_order_history columns:', Object.keys(history[0]));
      }
    }
  } catch (error) {
    console.log('❌ work_order_history table error:', error.message);
  }

  // Check work_order_comments table
  console.log('');
  console.log('📋 Checking work_order_comments table...');
  try {
    const { data: comments, error: commentsError } = await supabase
      .from('work_order_comments')
      .select('*')
      .limit(1);

    if (commentsError) {
      console.log('❌ work_order_comments table missing:', commentsError.message);
    } else {
      console.log('✅ work_order_comments table exists');
      if (comments && comments.length > 0) {
        console.log('📊 work_order_comments columns:', Object.keys(comments[0]));
      }
    }
  } catch (error) {
    console.log('❌ work_order_comments table error:', error.message);
  }

  // Check work_order_attachments table (should exist according to analysis)
  console.log('');
  console.log('📋 Checking work_order_attachments table...');
  try {
    const { data: attachments, error: attachmentsError } = await supabase
      .from('work_order_attachments')
      .select('*')
      .limit(1);

    if (attachmentsError) {
      console.log('❌ work_order_attachments table missing:', attachmentsError.message);
    } else {
      console.log('✅ work_order_attachments table exists');
      if (attachments && attachments.length > 0) {
        console.log('📊 work_order_attachments columns:', Object.keys(attachments[0]));
      }
    }
  } catch (error) {
    console.log('❌ work_order_attachments table error:', error.message);
  }

  console.log('');
  console.log('🎯 Summary: Identified missing tables that need to be created.');
}

checkMissingTables();