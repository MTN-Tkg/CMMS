-- =====================================================
-- Fix View Security with security_invoker = on
-- =====================================================
-- This ensures the view runs with the permissions of the querying user,
-- reducing the risk of unintended data exposure

-- Drop the existing view first
DROP VIEW IF EXISTS work_orders_with_company_info CASCADE;

-- Recreate the view with security_invoker = on
CREATE VIEW public.work_orders_with_company_info WITH (security_invoker = on) AS
SELECT 
    wo.id,
    wo.work_type,
    wo.title,
    wo.description,
    wo.status,
    wo.priority,
    wo.asset_id,
    wo.location_id,
    wo.system_id,
    wo.pm_template_id,
    wo.assigned_to_user_id,
    wo.requested_by_user_id,
    wo.created_at,
    wo.scheduled_date,
    wo.completed_at,
    wo.wo_number,
    wo.estimated_hours,
    wo.assigned_to,
    wo.requested_by,
    wo.total_cost,
    wo.labor_cost,
    wo.parts_cost,
    wo.actual_hours,
    wo.updated_at,
    wo.company_id,
    c.name AS company_name,
    c.code AS company_code,
    s.name AS system_name,
    l.name AS location_name,
    a.serial_number AS asset_serial
FROM work_orders wo
    LEFT JOIN companies c ON wo.company_id = c.id
    LEFT JOIN systems s ON wo.system_id = s.id
    LEFT JOIN locations l ON wo.location_id = l.id
    LEFT JOIN assets a ON wo.asset_id = a.id;

-- Grant appropriate permissions (adjust as needed for your use case)
GRANT SELECT ON work_orders_with_company_info TO authenticated;

-- Verify the view was created with security_invoker
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE schemaname = 'public' 
AND viewname = 'work_orders_with_company_info';

-- =====================================================
-- Summary of Security Benefits:
-- =====================================================
-- 1. security_invoker = on ensures the view executes with the 
--    permissions of the user querying it, not the view owner
-- 2. This prevents privilege escalation through views
-- 3. Row Level Security (RLS) policies on underlying tables 
--    will be properly enforced
-- 4. Users can only see data they have permission to access
-- =====================================================