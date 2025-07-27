# Multi-Company Work Order & PM System Design

## Overview
This design supports multiple companies with automatic data population from PM templates to work orders, including company, system, location, and equipment information.

## Current Database Analysis

### Existing Multi-Company Support
Your database already has some multi-company support:
- `companies` table exists with company information
- `systems.company_id` links systems to companies
- `locations.company_id` links locations to companies
- `pm_templates.company_id` links PM templates to companies
- `user_profiles.company_id` links users to companies

### Missing Multi-Company Links
These tables need company_id added:
- `assets` - Currently no direct company link
- `work_orders` - Currently no direct company link
- `equipment_types` - Currently no company link

## Proposed Multi-Company Architecture

### 1. Database Schema Enhancements

```sql
-- Add company_id to assets table
ALTER TABLE assets 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Add company_id to work_orders table
ALTER TABLE work_orders 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Add company_id to equipment_types table (optional - for company-specific equipment types)
ALTER TABLE equipment_types 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Create index for performance
CREATE INDEX idx_assets_company_id ON assets(company_id);
CREATE INDEX idx_work_orders_company_id ON work_orders(company_id);
```

### 2. Auto-Population Flow from PM Template

When creating a work order from a PM template, the system should automatically populate:

```javascript
// Auto-population logic
async function createWorkOrderFromPMTemplate(pmTemplateId, assetId) {
  // 1. Get PM Template with all related data
  const pmTemplate = await supabase
    .from('pm_templates')
    .select(`
      *,
      company:companies(*),
      system:systems(*),
      equipment_type:equipment_types(*)
    `)
    .eq('id', pmTemplateId)
    .single();

  // 2. Get Asset with all related data
  const asset = await supabase
    .from('assets')
    .select(`
      *,
      system:systems(
        *,
        location:locations(*),
        company:companies(*)
      ),
      equipment_type:equipment_types(*)
    `)
    .eq('id', assetId)
    .single();

  // 3. Create Work Order with auto-populated data
  const workOrder = {
    // Auto-populated from PM Template
    pm_template_id: pmTemplateId,
    title: `PM - ${pmTemplate.name} - ${asset.serial_number}`,
    description: pmTemplate.description,
    work_type: 'PM',
    
    // Auto-populated from Asset
    asset_id: assetId,
    system_id: asset.system_id,
    location_id: asset.system.location_id,
    company_id: asset.system.company_id, // Auto-filled company
    
    // Default values
    status: 'scheduled',
    priority: 'medium',
    estimated_hours: pmTemplate.estimated_minutes / 60,
    
    // Scheduling
    scheduled_date: calculateNextDueDate(pmTemplate.frequency_type, pmTemplate.frequency_value)
  };

  // 4. Create work order
  const { data: newWorkOrder } = await supabase
    .from('work_orders')
    .insert(workOrder)
    .select()
    .single();

  // 5. Copy PM template details to work order tasks
  const templateDetails = await supabase
    .from('pm_template_details')
    .select('*')
    .eq('pm_template_id', pmTemplateId)
    .order('step_number');

  const workOrderTasks = templateDetails.data.map(detail => ({
    work_order_id: newWorkOrder.id,
    description: detail.task_description,
    is_critical: detail.is_critical,
    is_completed: false
  }));

  await supabase
    .from('work_order_tasks')
    .insert(workOrderTasks);

  return newWorkOrder;
}
```

### 3. Company-Based Data Isolation

Implement Row Level Security (RLS) policies:

```sql
-- Enable RLS on all tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for company-based access
CREATE POLICY "Users can only see their company's assets" ON assets
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only see their company's work orders" ON work_orders
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- For users who work at multiple companies
CREATE TABLE user_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Multi-Company PM Schedule Management

```sql
-- Enhanced PM schedules table for multi-company support
CREATE TABLE pm_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  pm_template_id UUID REFERENCES pm_templates(id) NOT NULL,
  asset_id UUID REFERENCES assets(id) NOT NULL,
  
  -- Schedule configuration
  frequency_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, yearly
  frequency_value INTEGER NOT NULL,
  
  -- Tracking
  last_generated_date DATE,
  next_due_date DATE NOT NULL,
  
  -- Auto-population settings
  auto_assign_to_user_id UUID REFERENCES user_profiles(id),
  auto_priority VARCHAR(20) DEFAULT 'medium',
  lead_time_days INTEGER DEFAULT 7, -- Generate WO X days before due
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure asset and template belong to same company
  CONSTRAINT check_same_company CHECK (
    company_id = (SELECT company_id FROM assets WHERE id = asset_id)
  )
);
```

### 5. Company Hierarchy Support

For organizations with parent/subsidiary relationships:

```sql
-- Add parent company support
ALTER TABLE companies 
ADD COLUMN parent_company_id UUID REFERENCES companies(id);

-- View to see company hierarchy
CREATE VIEW company_hierarchy AS
WITH RECURSIVE company_tree AS (
  -- Base case: top-level companies
  SELECT 
    id,
    name,
    parent_company_id,
    0 as level,
    ARRAY[id] as path
  FROM companies
  WHERE parent_company_id IS NULL
  
  UNION ALL
  
  -- Recursive case
  SELECT 
    c.id,
    c.name,
    c.parent_company_id,
    ct.level + 1,
    ct.path || c.id
  FROM companies c
  JOIN company_tree ct ON c.parent_company_id = ct.id
)
SELECT * FROM company_tree;
```

### 6. Auto-Fill Implementation in UI

```typescript
// React component for creating work order with auto-fill
interface CreateWorkOrderProps {
  pmTemplateId?: string;
  assetId?: string;
}

const CreateWorkOrder: React.FC<CreateWorkOrderProps> = ({ pmTemplateId, assetId }) => {
  const [formData, setFormData] = useState<WorkOrderFormData>({});
  
  useEffect(() => {
    if (pmTemplateId && assetId) {
      autoFillFromPMTemplate();
    }
  }, [pmTemplateId, assetId]);
  
  const autoFillFromPMTemplate = async () => {
    // Fetch PM template with related data
    const { data: pmTemplate } = await supabase
      .from('pm_templates')
      .select(`
        *,
        company:companies(*),
        system:systems(*),
        equipment_type:equipment_types(*)
      `)
      .eq('id', pmTemplateId)
      .single();
    
    // Fetch asset with related data
    const { data: asset } = await supabase
      .from('assets')
      .select(`
        *,
        system:systems(
          *,
          location:locations(*),
          company:companies(*)
        )
      `)
      .eq('id', assetId)
      .single();
    
    // Auto-fill form
    setFormData({
      // From PM Template
      pm_template_id: pmTemplateId,
      title: `PM - ${pmTemplate.name} - ${asset.serial_number}`,
      description: pmTemplate.description,
      work_type: 'PM',
      estimated_hours: pmTemplate.estimated_minutes / 60,
      
      // From Asset (auto-filled)
      asset_id: assetId,
      company_id: asset.system.company_id,
      system_id: asset.system_id,
      location_id: asset.system.location_id,
      
      // Display fields (read-only)
      company_name: asset.system.company.name,
      system_name: asset.system.name,
      location_name: asset.system.location.name,
      asset_serial: asset.serial_number,
      
      // Defaults
      status: 'scheduled',
      priority: 'medium'
    });
  };
  
  return (
    <form>
      {/* Company - Auto-filled and read-only */}
      <input 
        type="text" 
        value={formData.company_name} 
        readOnly 
        label="Company"
      />
      
      {/* System - Auto-filled and read-only */}
      <input 
        type="text" 
        value={formData.system_name} 
        readOnly 
        label="System"
      />
      
      {/* Location - Auto-filled and read-only */}
      <input 
        type="text" 
        value={formData.location_name} 
        readOnly 
        label="Location"
      />
      
      {/* Asset - Auto-filled and read-only */}
      <input 
        type="text" 
        value={formData.asset_serial} 
        readOnly 
        label="Asset"
      />
      
      {/* Other fields... */}
    </form>
  );
};
```

### 7. Company-Specific Dashboards

```sql
-- View for company-specific work order statistics
CREATE VIEW company_work_order_stats AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(DISTINCT wo.id) as total_work_orders,
  COUNT(DISTINCT CASE WHEN wo.status = 'open' THEN wo.id END) as open_work_orders,
  COUNT(DISTINCT CASE WHEN wo.status = 'completed' THEN wo.id END) as completed_work_orders,
  COUNT(DISTINCT CASE WHEN wo.work_type = 'PM' THEN wo.id END) as pm_work_orders,
  COUNT(DISTINCT CASE WHEN wo.work_type = 'CM' THEN wo.id END) as cm_work_orders,
  COUNT(DISTINCT a.id) as total_assets,
  COUNT(DISTINCT l.id) as total_locations
FROM companies c
LEFT JOIN work_orders wo ON wo.company_id = c.id
LEFT JOIN assets a ON a.company_id = c.id
LEFT JOIN locations l ON l.company_id = c.id
GROUP BY c.id, c.name;
```

## Implementation Steps

1. **Database Migration**
   - Add company_id to assets and work_orders tables
   - Create indexes for performance
   - Set up RLS policies

2. **Update PM Template Creation**
   - Ensure PM templates are linked to companies
   - Add validation to ensure consistency

3. **Enhance Work Order Creation**
   - Implement auto-fill logic from PM templates
   - Add company validation
   - Create UI components with read-only auto-filled fields

4. **Multi-Company User Management**
   - Create user_companies table for users working at multiple companies
   - Add company switcher in UI
   - Update authentication to handle company context

5. **Testing**
   - Test auto-fill functionality
   - Verify data isolation between companies
   - Test PM schedule generation for multiple companies

## Benefits

1. **Data Isolation**: Each company's data is completely separated
2. **Auto-Population**: Reduces manual data entry and errors
3. **Consistency**: Ensures work orders always have correct company/location/system data
4. **Scalability**: Supports unlimited companies and complex hierarchies
5. **Flexibility**: Users can work across multiple companies with proper permissions

This design ensures that when creating work orders from PM templates, all company, system, location, and equipment information is automatically populated, making the system efficient for multi-company operations.