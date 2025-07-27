-- Phase 1.3: Preventive Maintenance Enhancement
-- Database Schema for Work Order Tasks

-- Based on the existing database structure, I can see:
-- 1. pm_templates table exists with proper structure
-- 2. pm_template_details table exists with the following structure:
--    - id (text)
--    - pm_template_id (text) -> references pm_templates(id)
--    - step_number (integer)
--    - task_description (text)
--    - expected_input_type (text)
--    - standard_text_expected (text)
--    - standard_min_value (numeric)
--    - standard_max_value (numeric)
--    - is_critical (boolean)
--    - remarks (text)

-- Create work_order_tasks table for detailed task tracking
CREATE TABLE IF NOT EXISTS work_order_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    pm_template_detail_id TEXT REFERENCES pm_template_details(id),
    step_number INTEGER NOT NULL DEFAULT 1,
    task_description TEXT NOT NULL,
    expected_input_type TEXT, -- 'text', 'number', 'boolean', 'select', 'photo'
    standard_text_expected TEXT,
    standard_min_value NUMERIC,
    standard_max_value NUMERIC,
    is_critical BOOLEAN DEFAULT false,
    
    -- Task execution data
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped', 'na'
    result_value TEXT, -- Actual input/measurement value
    result_status TEXT DEFAULT 'pending', -- 'pass', 'fail', 'warning', 'na'
    notes TEXT,
    photo_urls TEXT[], -- Array of photo URLs
    
    -- Timing and assignment
    assigned_to TEXT, -- Technician name or ID
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing actual_hours column to work_orders
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_work_order_id ON work_order_tasks(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_pm_template_detail_id ON work_order_tasks(pm_template_detail_id);
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_status ON work_order_tasks(status);

-- Create asset_qr_codes table for QR code management (if not exists)
CREATE TABLE IF NOT EXISTS asset_qr_codes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE NOT NULL,
    qr_type TEXT DEFAULT 'asset', -- 'asset', 'location', 'pm_template'
    qr_data JSONB, -- Additional QR code data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pm_template_qr_codes table for PM template QR codes
CREATE TABLE IF NOT EXISTS pm_template_qr_codes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pm_template_id TEXT NOT NULL REFERENCES pm_templates(id) ON DELETE CASCADE,
    asset_id TEXT REFERENCES assets(id), -- Optional: specific asset for this PM
    qr_code TEXT UNIQUE NOT NULL,
    qr_data JSONB, -- Additional data like frequency, asset info
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asset_qr_codes_asset_id ON asset_qr_codes(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_qr_codes_qr_code ON asset_qr_codes(qr_code);
CREATE INDEX IF NOT EXISTS idx_pm_template_qr_codes_pm_template_id ON pm_template_qr_codes(pm_template_id);
CREATE INDEX IF NOT EXISTS idx_pm_template_qr_codes_qr_code ON pm_template_qr_codes(qr_code);

-- Insert sample PM template details for testing (if not exists)
INSERT INTO pm_template_details (id, pm_template_id, step_number, task_description, expected_input_type, is_critical, remarks)
SELECT 
    'PMD-' || pm.id || '-' || generate_series,
    pm.id,
    generate_series,
    CASE generate_series
        WHEN 1 THEN 'ตรวจสอบระดับน้ำมันเครื่อง'
        WHEN 2 THEN 'ตรวจสอบระดับน้ำในหม้อน้ำ'
        WHEN 3 THEN 'ตรวจสอบแรงดันลมยาง'
        WHEN 4 THEN 'ทำความสะอาดไส้กรองอากาศ'
        WHEN 5 THEN 'ตรวจสอบการทำงานของไฟส่องสว่าง'
    END,
    CASE generate_series
        WHEN 1 THEN 'select'
        WHEN 2 THEN 'select'
        WHEN 3 THEN 'number'
        WHEN 4 THEN 'boolean'
        WHEN 5 THEN 'boolean'
    END,
    CASE generate_series
        WHEN 1 THEN true
        WHEN 2 THEN true
        WHEN 3 THEN false
        WHEN 4 THEN false
        WHEN 5 THEN false
    END,
    CASE generate_series
        WHEN 1 THEN 'ตรวจสอบว่าน้ำมันอยู่ในระดับที่เหมาะสม'
        WHEN 2 THEN 'ตรวจสอบว่าน้ำในหม้อน้ำเพียงพอ'
        WHEN 3 THEN 'วัดแรงดันลมยางให้อยู่ในช่วงที่กำหนด'
        WHEN 4 THEN 'ทำความสะอาดหรือเปลี่ยนไส้กรองอากาศ'
        WHEN 5 THEN 'ทดสอบการทำงานของไฟส่องสว่างทุกดวง'
    END
FROM pm_templates pm
CROSS JOIN generate_series(1, 5)
WHERE NOT EXISTS (
    SELECT 1 FROM pm_template_details ptd 
    WHERE ptd.pm_template_id = pm.id
)
LIMIT 50; -- Limit to prevent too many inserts

-- Insert sample QR codes for PM templates
INSERT INTO pm_template_qr_codes (pm_template_id, qr_code, qr_data)
SELECT 
    id,
    'QR-PM-' || id,
    jsonb_build_object(
        'template_name', name,
        'frequency', frequency_type,
        'estimated_minutes', estimated_minutes
    )
FROM pm_templates
WHERE NOT EXISTS (
    SELECT 1 FROM pm_template_qr_codes ptqr 
    WHERE ptqr.pm_template_id = pm_templates.id
)
LIMIT 20; -- Limit to prevent too many inserts