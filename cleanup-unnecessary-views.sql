-- =====================================================
-- Clean up unnecessary views and tables
-- =====================================================

-- 1. Remove views that are not needed
DROP VIEW IF EXISTS company_hierarchy CASCADE;
DROP VIEW IF EXISTS company_work_order_stats CASCADE;
DROP VIEW IF EXISTS user_accessible_companies CASCADE;

-- 2. Remove unnecessary tables
DROP TABLE IF EXISTS user_companies CASCADE;

-- 3. Check what views remain
SELECT 
    table_name as view_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'VIEW'
ORDER BY table_name;

-- 4. Keep only the useful view for work orders
-- This view is helpful for displaying work orders with company/location names
-- Keep this one if you want easy access to work order details with names instead of IDs
/*
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
*/

-- =====================================================
-- Summary of what remains:
-- =====================================================
-- Tables:
-- - companies (single table, no changes)
-- - work_orders (with company_id column for auto-fill)
-- - pm_schedules (if you want PM automation)
-- - pm_schedule_instances (if you want PM tracking)
-- 
-- Views:
-- - work_orders_with_company_info (optional, for easy querying)
--
-- Functions:
-- - create_work_order_with_autofill() (optional helper function)
-- - generate_pm_work_order() (if you want PM automation)
-- =====================================================