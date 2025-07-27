-- Work Order History and Audit Trail Schema
-- This file contains SQL to create tables for work order history, comments, and attachments

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

-- Create indexes for better performance
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

-- Insert sample data for testing
INSERT INTO work_order_history (work_order_id, action_type, new_value, field_name, user_name, notes)
VALUES 
  ('WO-TEST-001', 'created', 'Pending', 'status', 'System Test', 'Work order created via system test'),
  ('WO-TEST-001', 'status_changed', 'In Progress', 'status', 'Test User', 'Status updated to In Progress');

INSERT INTO work_order_comments (work_order_id, user_name, comment)
VALUES 
  ('WO-TEST-001', 'Test User', 'This is a test comment for the work order system'),
  ('WO-TEST-001', 'Another User', 'Adding additional notes about the maintenance work');

-- Comments for documentation
COMMENT ON TABLE work_order_history IS 'Audit trail for all work order changes and actions';
COMMENT ON TABLE work_order_comments IS 'User comments and discussions for work orders';
COMMENT ON TABLE work_order_attachments IS 'File attachments for work orders';