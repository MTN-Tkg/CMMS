-- Phase 1 Missing Tables SQL
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- Create work_order_history table for audit trail
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

-- Create work_order_comments table for comments system
CREATE TABLE IF NOT EXISTS work_order_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id TEXT,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_order_history_work_order_id ON work_order_history(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_history_changed_at ON work_order_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_work_order_comments_work_order_id ON work_order_comments(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_comments_created_at ON work_order_comments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE work_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust as needed based on your auth setup)
CREATE POLICY "Enable read access for all users" ON work_order_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON work_order_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON work_order_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON work_order_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON work_order_comments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON work_order_comments FOR DELETE USING (true);