# Multi-Company Work Order & PM System - Final Implementation

## ✅ What Has Been Implemented

Since you've already run the SQL script, here's what you now have in your database:

### 1. **New Columns Added**
- `assets.company_id` - Links assets to companies
- `work_orders.company_id` - Links work orders to companies  
- `equipment_types.company_id` - Optional company-specific equipment types
- `user_profiles.company_id` - Links users to their primary company

### 2. **New Tables Created**
- `user_companies` - Allows users to work at multiple companies
- `pm_schedules` - Defines recurring PM schedules
- `pm_schedule_instances` - Tracks generated PM work orders

### 3. **Views Created**
- `company_hierarchy` - Shows parent/subsidiary company relationships
- `company_work_order_stats` - Company-specific statistics
- ~~`user_accessible_companies`~~ - (Remove using the provided SQL script)

### 4. **Functions Created**
- `generate_pm_work_order(pm_schedule_id)` - Auto-generates work orders from PM schedules
- `update_updated_at_column()` - Trigger function for timestamp updates

## 🔧 Clean Up (Remove Unnecessary View)

Run this SQL to remove the unnecessary view:

```sql
DROP VIEW IF EXISTS user_accessible_companies CASCADE;
```

## 📝 How to Use Multi-Company Features

### 1. **Getting User's Companies**

Instead of using a view, query directly when needed:

```javascript
// Get primary company
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('*, company:companies(*)')
  .eq('user_id', userId)
  .single();

// Get additional companies
const { data: additionalCompanies } = await supabase
  .from('user_companies')
  .select('*, company:companies(*)')
  .eq('user_id', userId)
  .eq('is_active', true);
```

### 2. **Creating Work Order with Auto-Fill**

```javascript
async function createWorkOrderFromPM(pmTemplateId, assetId) {
  // Get PM template with company info
  const { data: pmTemplate } = await supabase
    .from('pm_templates')
    .select('*, company:companies(*)')
    .eq('id', pmTemplateId)
    .single();

  // Get asset with full hierarchy
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

  // Create work order with auto-filled data
  const workOrder = {
    // Auto-filled from asset hierarchy
    company_id: asset.system.company_id,
    system_id: asset.system_id,
    location_id: asset.system.location_id,
    asset_id: assetId,
    
    // From PM template
    pm_template_id: pmTemplateId,
    title: `PM - ${pmTemplate.name} - ${asset.serial_number}`,
    work_type: 'PM',
    
    // Other fields...
    status: 'scheduled',
    priority: 'medium'
  };

  const { data: newWO } = await supabase
    .from('work_orders')
    .insert(workOrder)
    .select();

  return newWO;
}
```

### 3. **Setting Up PM Schedules**

```javascript
// Create a PM schedule
const { data: schedule } = await supabase
  .from('pm_schedules')
  .insert({
    company_id: 'LAK',  // Company ID
    pm_template_id: 'PMT-LAK-SYS001-EQ001',
    asset_id: 'LAK-GEN-01',
    frequency_type: 'monthly',
    frequency_value: 1,
    next_due_date: '2025-08-01',
    auto_priority: 'medium',
    lead_time_days: 7,
    is_active: true
  })
  .select();

// Generate work order from schedule
const { data: workOrderId } = await supabase
  .rpc('generate_pm_work_order', { 
    p_pm_schedule_id: schedule.id 
  });
```

### 4. **Company-Specific Queries**

```javascript
// Get work orders for a specific company
const { data: workOrders } = await supabase
  .from('work_orders')
  .select('*')
  .eq('company_id', 'LAK')
  .order('created_at', { ascending: false });

// Get company statistics
const { data: stats } = await supabase
  .from('company_work_order_stats')
  .select('*')
  .eq('company_id', 'LAK')
  .single();
```

## 🎯 Key Benefits Achieved

1. **Automatic Data Population**
   - Company, System, Location, and Asset are auto-filled from relationships
   - Reduces manual entry and errors

2. **Multi-Company Support**
   - Users can work across multiple companies
   - Data is properly segregated by company

3. **PM Automation**
   - PM schedules automatically generate work orders
   - Configurable frequencies and lead times

4. **Simplified Architecture**
   - Direct queries instead of complex views
   - TEXT-based IDs matching your existing schema
   - Clean foreign key relationships

## 📊 Database Relationships

```
companies
    ├── systems (via company_id)
    │   ├── assets (via system_id)
    │   └── locations (via company_id)
    ├── pm_templates (via company_id)
    ├── work_orders (via company_id)
    └── user_profiles (via company_id)

work_orders
    ├── company (via company_id)
    ├── asset (via asset_id)
    ├── system (via system_id)
    ├── location (via location_id)
    └── pm_template (via pm_template_id)
```

## 🚀 Next Steps

1. Update your frontend to use the new company_id fields
2. Implement company switcher for multi-company users
3. Set up PM schedules for your assets
4. Test the auto-generation of work orders

The system is now ready for multi-company operations with full auto-population support!