-- =====================================================
-- Multi-Company Support Implementation for CMMS
-- =====================================================
-- This script adds multi-company support to the work order and PM system
-- allowing automatic population of company, system, location, and equipment data

-- 1. Add company_id to assets table
-- =====================================================
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Update existing assets to inherit company from their system
UPDATE assets a
SET company_id = s.company_id
FROM systems s
WHERE a.system_id = s.id
AND a.company_id IS NULL;

-- Make company_id NOT NULL after populating existing data
ALTER TABLE assets 
ALTER COLUMN company_id SET NOT NULL;

-- 2. Add company_id to work_orders table
-- =====================================================
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Update existing work orders to inherit company from their assets/systems
UPDATE work_orders wo
SET company_id = COALESCE(
    (SELECT company_id FROM assets WHERE id = wo.asset_id),
    (SELECT company_id FROM systems WHERE id = wo.system_id),
    (SELECT company_id FROM locations WHERE id = wo.location_id)
)
WHERE wo.company_id IS NULL;

-- 3. Add company_id to equipment_types (optional - for company-specific types)
-- =====================================================
ALTER TABLE equipment_types 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 4. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_assets_company_id ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_types_company_id ON equipment_types(company_id);
CREATE INDEX IF NOT EXISTS idx_pm_templates_company_id ON pm_templates(company_id);

-- 5. Create user_companies table for multi-company users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'technician',
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Create index for user_companies
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- 6. Add parent company support for hierarchies
-- =====================================================
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES companies(id);

-- 7. Create enhanced PM schedules table with multi-company support
-- =====================================================
CREATE TABLE IF NOT EXISTS pm_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    pm_template_id UUID REFERENCES pm_templates(id) NOT NULL,
    asset_id UUID REFERENCES assets(id) NOT NULL,
    
    -- Schedule configuration
    frequency_type VARCHAR(50) NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    frequency_value INTEGER NOT NULL CHECK (frequency_value > 0),
    
    -- Tracking
    last_generated_date DATE,
    next_due_date DATE NOT NULL,
    
    -- Auto-population settings
    auto_assign_to_user_id UUID REFERENCES user_profiles(id),
    auto_priority VARCHAR(20) DEFAULT 'medium' CHECK (auto_priority IN ('low', 'medium', 'high', 'urgent')),
    lead_time_days INTEGER DEFAULT 7 CHECK (lead_time_days >= 0),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Constraints
    UNIQUE(pm_template_id, asset_id)
);

-- Create indexes for pm_schedules
CREATE INDEX IF NOT EXISTS idx_pm_schedules_company_id ON pm_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_next_due_date ON pm_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_asset_id ON pm_schedules(asset_id);

-- 8. Create PM schedule instances tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS pm_schedule_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pm_schedule_id UUID REFERENCES pm_schedules(id) NOT NULL,
    work_order_id UUID REFERENCES work_orders(id) NOT NULL,
    scheduled_date DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(work_order_id)
);

-- 9. Create company hierarchy view
-- =====================================================
CREATE OR REPLACE VIEW company_hierarchy AS
WITH RECURSIVE company_tree AS (
    -- Base case: top-level companies
    SELECT 
        id,
        name,
        code,
        parent_company_id,
        0 as level,
        ARRAY[id] as path,
        name as full_path
    FROM companies
    WHERE parent_company_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        c.id,
        c.name,
        c.code,
        c.parent_company_id,
        ct.level + 1,
        ct.path || c.id,
        ct.full_path || ' > ' || c.name
    FROM companies c
    JOIN company_tree ct ON c.parent_company_id = ct.id
)
SELECT * FROM company_tree
ORDER BY path;

-- 10. Create company-specific statistics view
-- =====================================================
CREATE OR REPLACE VIEW company_work_order_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    
    -- Work order statistics
    COUNT(DISTINCT wo.id) as total_work_orders,
    COUNT(DISTINCT CASE WHEN wo.status = 'open' THEN wo.id END) as open_work_orders,
    COUNT(DISTINCT CASE WHEN wo.status = 'in_progress' THEN wo.id END) as in_progress_work_orders,
    COUNT(DISTINCT CASE WHEN wo.status = 'completed' THEN wo.id END) as completed_work_orders,
    COUNT(DISTINCT CASE WHEN wo.work_type = 'PM' THEN wo.id END) as pm_work_orders,
    COUNT(DISTINCT CASE WHEN wo.work_type = 'CM' THEN wo.id END) as cm_work_orders,
    
    -- Asset statistics
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_assets,
    
    -- Location and system statistics
    COUNT(DISTINCT l.id) as total_locations,
    COUNT(DISTINCT s.id) as total_systems,
    
    -- PM statistics
    COUNT(DISTINCT pt.id) as total_pm_templates,
    COUNT(DISTINCT ps.id) as total_pm_schedules,
    COUNT(DISTINCT CASE WHEN ps.is_active THEN ps.id END) as active_pm_schedules
    
FROM companies c
LEFT JOIN work_orders wo ON wo.company_id = c.id
LEFT JOIN assets a ON a.company_id = c.id
LEFT JOIN locations l ON l.company_id = c.id
LEFT JOIN systems s ON s.company_id = c.id
LEFT JOIN pm_templates pt ON pt.company_id = c.id
LEFT JOIN pm_schedules ps ON ps.company_id = c.id
GROUP BY c.id, c.name, c.code;

-- 11. Create function to auto-generate work order from PM schedule
-- =====================================================
CREATE OR REPLACE FUNCTION generate_pm_work_order(
    p_pm_schedule_id UUID
) RETURNS UUID AS $$
DECLARE
    v_work_order_id UUID;
    v_pm_schedule RECORD;
    v_pm_template RECORD;
    v_asset RECORD;
BEGIN
    -- Get PM schedule details
    SELECT * INTO v_pm_schedule
    FROM pm_schedules
    WHERE id = p_pm_schedule_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'PM Schedule not found or inactive';
    END IF;
    
    -- Get PM template details
    SELECT * INTO v_pm_template
    FROM pm_templates
    WHERE id = v_pm_schedule.pm_template_id;
    
    -- Get asset details with related data
    SELECT 
        a.*,
        s.name as system_name,
        s.location_id,
        l.name as location_name
    INTO v_asset
    FROM assets a
    JOIN systems s ON a.system_id = s.id
    JOIN locations l ON s.location_id = l.id
    WHERE a.id = v_pm_schedule.asset_id;
    
    -- Create work order with auto-populated data
    INSERT INTO work_orders (
        company_id,
        pm_template_id,
        asset_id,
        system_id,
        location_id,
        work_type,
        title,
        description,
        status,
        priority,
        scheduled_date,
        estimated_hours,
        assigned_to_user_id,
        wo_number
    ) VALUES (
        v_pm_schedule.company_id,
        v_pm_schedule.pm_template_id,
        v_pm_schedule.asset_id,
        v_asset.system_id,
        v_asset.location_id,
        'PM',
        'PM - ' || v_pm_template.name || ' - ' || v_asset.serial_number,
        COALESCE(v_pm_template.description, 'Preventive maintenance for ' || v_asset.serial_number),
        'scheduled',
        COALESCE(v_pm_schedule.auto_priority, 'medium'),
        v_pm_schedule.next_due_date,
        COALESCE(v_pm_template.estimated_minutes::DECIMAL / 60, 1),
        v_pm_schedule.auto_assign_to_user_id,
        'PM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(uuid_generate_v4()::TEXT, 1, 8)
    ) RETURNING id INTO v_work_order_id;
    
    -- Copy PM template details to work order tasks
    INSERT INTO work_order_tasks (
        work_order_id,
        description,
        is_critical,
        is_completed
    )
    SELECT 
        v_work_order_id,
        task_description,
        is_critical,
        false
    FROM pm_template_details
    WHERE pm_template_id = v_pm_schedule.pm_template_id
    ORDER BY step_number;
    
    -- Record the PM schedule instance
    INSERT INTO pm_schedule_instances (
        pm_schedule_id,
        work_order_id,
        scheduled_date
    ) VALUES (
        p_pm_schedule_id,
        v_work_order_id,
        v_pm_schedule.next_due_date
    );
    
    -- Update PM schedule
    UPDATE pm_schedules
    SET 
        last_generated_date = CURRENT_DATE,
        next_due_date = CASE 
            WHEN frequency_type = 'daily' THEN next_due_date + INTERVAL '1 day' * frequency_value
            WHEN frequency_type = 'weekly' THEN next_due_date + INTERVAL '1 week' * frequency_value
            WHEN frequency_type = 'monthly' THEN next_due_date + INTERVAL '1 month' * frequency_value
            WHEN frequency_type = 'quarterly' THEN next_due_date + INTERVAL '3 months' * frequency_value
            WHEN frequency_type = 'yearly' THEN next_due_date + INTERVAL '1 year' * frequency_value
        END,
        updated_at = NOW()
    WHERE id = p_pm_schedule_id;
    
    RETURN v_work_order_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_pm_schedules_updated_at 
    BEFORE UPDATE ON pm_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_companies_updated_at 
    BEFORE UPDATE ON user_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_schedules ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for company-based access
-- =====================================================
-- Policy for assets
CREATE POLICY "Users can view assets from their companies" ON assets
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage assets from their companies" ON assets
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy for work_orders
CREATE POLICY "Users can view work orders from their companies" ON work_orders
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage work orders from their companies" ON work_orders
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy for PM templates
CREATE POLICY "Users can view PM templates from their companies" ON pm_templates
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy for PM schedules
CREATE POLICY "Users can view PM schedules from their companies" ON pm_schedules
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM user_companies WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 15. Create helper view for user's accessible companies
-- =====================================================
CREATE OR REPLACE VIEW user_accessible_companies AS
SELECT DISTINCT
    u.id as user_id,
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    CASE 
        WHEN up.company_id = c.id THEN 'primary'
        ELSE 'secondary'
    END as access_type
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN companies c ON c.id = up.company_id
UNION
SELECT 
    uc.user_id,
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    'secondary' as access_type
FROM user_companies uc
JOIN companies c ON c.id = uc.company_id
WHERE uc.is_active = true;

-- =====================================================
-- End of Multi-Company Support Implementation
-- =====================================================