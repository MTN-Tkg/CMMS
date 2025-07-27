-- =====================================================
-- Remove user_accessible_companies view
-- =====================================================

-- Drop the view if it exists
DROP VIEW IF EXISTS user_accessible_companies CASCADE;

-- =====================================================
-- Optional: If you want to simplify user-company access,
-- you can just use the existing relationships:
-- 1. user_profiles.company_id for primary company
-- 2. user_companies table for additional companies
-- =====================================================

-- Here's a simpler query to get user's companies when needed:
-- This is just an example query, not a view
/*
-- Get all companies for a specific user
SELECT DISTINCT
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    'primary' as access_type
FROM user_profiles up
JOIN companies c ON c.id = up.company_id
WHERE up.user_id = 'your-user-id-here'

UNION

SELECT 
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    'secondary' as access_type
FROM user_companies uc
JOIN companies c ON c.id = uc.company_id
WHERE uc.user_id = 'your-user-id-here'
AND uc.is_active = true;
*/

-- =====================================================
-- Verify the view has been removed
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_accessible_companies';

-- Should return no rows if successfully removed