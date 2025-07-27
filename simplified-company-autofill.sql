-- =====================================================
-- Simplified Company Auto-fill for Work Orders
-- =====================================================
-- Just store company_id in work_orders, no complex user-company management

-- 1. Remove unnecessary tables and views if they were created
-- =====================================================
DROP VIEW IF EXISTS user_accessible_companies CASCADE;
DROP TABLE IF EXISTS user_companies CASCADE;

-- 2. Ensure work_orders has company_id column
-- =====================================================
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id);

-- 3. Update existing work orders to get company from asset/system relationship
-- =====================================================
UPDATE work_orders wo
SET company_id = (
    SELECT s.company_id 
    FROM assets a
    JOIN systems s ON a.system_id = s.id
    WHERE a.id = wo.asset_id
)
WHERE wo.company_id IS NULL 
AND wo.asset_id IS NOT NULL;

-- 4. Simple function to create work order with auto-filled company
-- =====================================================
CREATE OR REPLACE FUNCTION create_work_order_with_autofill(
    p_asset_id TEXT,
    p_pm_template_id TEXT DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_work_order_id TEXT;
    v_company_id TEXT;
    v_system_id TEXT;
    v_location_id TEXT;
    v_wo_number TEXT;
BEGIN
    -- Get company, system, and location from asset
    SELECT 
        s.company_id,
        a.system_id,
        s.location_id
    INTO 
        v_company_id,
        v_system_id,
        v_location_id
    FROM assets a
    JOIN systems s ON a.system_id = s.id
    WHERE a.id = p_asset_id;
    
    -- Generate work order number
    v_wo_number := 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
    v_work_order_id := v_wo_number;
    
    -- Create work order with auto-filled data
    INSERT INTO work_orders (
        id,
        company_id,      -- Auto-filled from asset->system
        system_id,       -- Auto-filled from asset
        location_id,     -- Auto-filled from system
        asset_id,
        pm_template_id,
        title,
        description,
        status,
        wo_number,
        created_at
    ) VALUES (
        v_work_order_id,
        v_company_id,    -- Auto-filled
        v_system_id,     -- Auto-filled
        v_location_id,   -- Auto-filled
        p_asset_id,
        p_pm_template_id,
        COALESCE(p_title, 'Work Order for ' || p_asset_id),
        p_description,
        'open',
        v_wo_number,
        NOW()
    );
    
    RETURN v_work_order_id;
END;
$$ LANGUAGE plpgsql;

-- 5. View to see work orders with full company/location info
-- =====================================================
CREATE OR REPLACE VIEW work_orders_with_company_info AS
SELECT 
    wo.*,
    c.name as company_name,
    c.code as company_code,
    s.name as system_name,
    l.name as location_name,
    a.serial_number as asset_serial
FROM work_orders wo
LEFT JOIN companies c ON wo.company_id = c.id
LEFT JOIN systems s ON wo.system_id = s.id
LEFT JOIN locations l ON wo.location_id = l.id
LEFT JOIN assets a ON wo.asset_id = a.id;

-- 6. Example usage
-- =====================================================
/*
-- Create a work order with auto-filled company/system/location
SELECT create_work_order_with_autofill(
    p_asset_id := 'LAK-GEN-01',
    p_title := 'Routine Maintenance',
    p_description := 'Monthly PM check'
);

-- Query work orders with company info
SELECT * FROM work_orders_with_company_info 
WHERE company_id = 'LAK'
ORDER BY created_at DESC;
*/