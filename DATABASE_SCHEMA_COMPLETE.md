# CMMS Database Schema Documentation

Generated on: 2025-07-27

## Overview

Your CMMS database contains **17 tables** with **143 total columns** and **18 identified relationships**.

## Database Statistics

- **Total Tables**: 17
- **Total Columns**: 143
- **Total Relationships**: 18

## Tables and Their Columns

### 1. **assets** (5 columns)
- `id` - Primary key
- `equipment_type_id` - Foreign key to equipment_types
- `system_id` - Foreign key to systems
- `serial_number` - Equipment serial number
- `status` - Current asset status

### 2. **equipment_types** (4 columns)
- `id` - Primary key
- `name` - Equipment type name (English)
- `name_th` - Equipment type name (Thai)
- `description` - Type description

### 3. **systems** (9 columns)
- `id` - Primary key
- `company_id` - Foreign key to companies
- `name` - System name (English)
- `name_th` - System name (Thai)
- `description` - System description
- `code` - System code
- `location_id` - Foreign key to locations
- `created_at` - Creation timestamp
- `is_active` - Active status

### 4. **locations** (7 columns)
- `id` - Primary key
- `company_id` - Foreign key to companies
- `name` - Location name
- `code` - Location code
- `created_at` - Creation timestamp
- `address` - Physical address
- `is_active` - Active status

### 5. **work_orders** (24 columns)
- `id` - Primary key
- `work_type` - Type of work (PM, CM, etc.)
- `title` - Work order title
- `description` - Detailed description
- `status` - Current status
- `priority` - Priority level
- `asset_id` - Foreign key to assets
- `location_id` - Foreign key to locations
- `system_id` - Foreign key to systems
- `pm_template_id` - Foreign key to pm_templates
- `assigned_to_user_id` - Assigned user ID
- `requested_by_user_id` - Requester user ID
- `created_at` - Creation timestamp
- `scheduled_date` - Scheduled date
- `completed_at` - Completion timestamp
- `wo_number` - Work order number
- `estimated_hours` - Estimated hours
- `assigned_to` - Assigned to (text)
- `requested_by` - Requested by (text)
- `total_cost` - Total cost
- `labor_cost` - Labor cost
- `parts_cost` - Parts cost
- `actual_hours` - Actual hours worked
- `updated_at` - Last update timestamp

### 6. **work_order_tasks** (8 columns)
- `id` - Primary key
- `work_order_id` - Foreign key to work_orders
- `description` - Task description
- `is_completed` - Completion status
- `actual_value_text` - Actual text value
- `actual_value_numeric` - Actual numeric value
- `completed_at` - Completion timestamp
- `is_critical` - Critical task flag

### 7. **work_order_parts** (4 columns)
- `id` - Primary key
- `work_order_id` - Foreign key to work_orders
- `part_id` - Foreign key to parts
- `quantity_used` - Quantity used

### 8. **work_order_attachments** (4 columns)
- `id` - Primary key
- `work_order_id` - Foreign key to work_orders
- `file_name` - File name
- `file_path` - File storage path

### 9. **pm_templates** (13 columns)
- `id` - Primary key
- `company_id` - Foreign key to companies
- `system_id` - Foreign key to systems
- `equipment_type_id` - Foreign key to equipment_types
- `name` - Template name
- `frequency_type` - Frequency type (daily, weekly, etc.)
- `frequency_value` - Frequency value
- `estimated_minutes` - Estimated duration
- `remarks` - Additional remarks
- `template_code` - Template code
- `template_name` - Template name (duplicate?)
- `description` - Template description
- `estimated_duration` - Estimated duration (duplicate?)

### 10. **pm_template_details** (10 columns)
- `id` - Primary key
- `pm_template_id` - Foreign key to pm_templates
- `step_number` - Step sequence number
- `task_description` - Task description
- `expected_input_type` - Expected input type
- `standard_text_expected` - Expected text value
- `standard_min_value` - Minimum acceptable value
- `standard_max_value` - Maximum acceptable value
- `is_critical` - Critical task flag
- `remarks` - Additional remarks

### 11. **parts** (4 columns)
- `id` - Primary key
- `name` - Part name
- `stock_quantity` - Current stock quantity
- `min_stock_level` - Minimum stock level

### 12. **parts_requisitions** (12 columns)
- `id` - Primary key
- `req_number` - Requisition number
- `description` - Requisition description
- `status` - Current status
- `priority` - Priority level
- `requested_by` - Requester name
- `approved_by` - Approver name
- `approved_at` - Approval timestamp
- `total_estimated_cost` - Total estimated cost
- `work_order_id` - Foreign key to work_orders
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 13. **tools** (3 columns)
- `id` - Primary key
- `name` - Tool name
- `status` - Current status

### 14. **tool_checkouts** (6 columns)
- `id` - Primary key
- `tool_id` - Foreign key to tools
- `work_order_id` - Foreign key to work_orders
- `checked_out_by_user_id` - User who checked out
- `checked_out_at` - Checkout timestamp
- `checked_in_at` - Check-in timestamp

### 15. **user_profiles** (20 columns)
- `id` - Primary key
- `user_id` - User authentication ID
- `company_id` - Foreign key to companies
- `first_name` - First name
- `last_name` - Last name
- `role` - User role
- `email` - Email address
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `department` - Department
- `employee_code` - Employee code
- `phone` - Phone number
- `location_id` - Foreign key to locations
- `manager_id` - Manager's user ID
- `specialization` - Specialization
- `certification` - Certification
- `skills` - Skills list
- `certifications` - Certifications list
- `emergency_contact` - Emergency contact info

### 16. **companies** (10 columns)
- `id` - Primary key
- `name` - Company name
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `code` - Company code
- `created_at` - Creation timestamp
- `email` - Company email
- `phone` - Company phone
- `address` - Company address
- `is_active` - Active status

### 17. **notifications** (0 columns)
- Table exists but appears to be empty or not yet implemented

## Database Relationships

1. **assets.equipment_type_id** → **equipment_types.id**
2. **assets.system_id** → **systems.id**
3. **systems.location_id** → **locations.id**
4. **work_orders.asset_id** → **assets.id**
5. **work_orders.location_id** → **locations.id**
6. **work_orders.system_id** → **systems.id**
7. **work_orders.pm_template_id** → **pm_templates.id**
8. **work_order_tasks.work_order_id** → **work_orders.id**
9. **work_order_parts.work_order_id** → **work_orders.id**
10. **work_order_parts.part_id** → **parts.id**
11. **work_order_attachments.work_order_id** → **work_orders.id**
12. **pm_templates.system_id** → **systems.id**
13. **pm_templates.equipment_type_id** → **equipment_types.id**
14. **pm_template_details.pm_template_id** → **pm_templates.id**
15. **parts_requisitions.work_order_id** → **work_orders.id**
16. **tool_checkouts.tool_id** → **tools.id**
17. **tool_checkouts.work_order_id** → **work_orders.id**
18. **user_profiles.location_id** → **locations.id**

## Recommendations for Enhanced Work Order & PM System

### 1. **Missing Tables to Consider**

#### PM Scheduling System
```sql
-- pm_schedules: Define recurring PM schedules
CREATE TABLE pm_schedules (
    id UUID PRIMARY KEY,
    pm_template_id UUID REFERENCES pm_templates(id),
    asset_id UUID REFERENCES assets(id),
    frequency_type VARCHAR(50), -- daily, weekly, monthly, etc.
    frequency_value INTEGER,
    last_generated_date DATE,
    next_due_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- pm_schedule_instances: Track generated PM work orders
CREATE TABLE pm_schedule_instances (
    id UUID PRIMARY KEY,
    pm_schedule_id UUID REFERENCES pm_schedules(id),
    work_order_id UUID REFERENCES work_orders(id),
    scheduled_date DATE,
    generated_at TIMESTAMP DEFAULT NOW()
);
```

#### Work Order Enhancements
```sql
-- work_order_labor: Track time and labor costs
CREATE TABLE work_order_labor (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    user_id UUID REFERENCES user_profiles(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    hours_worked DECIMAL(5,2),
    hourly_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    work_description TEXT
);

-- work_order_status_history: Audit trail for status changes
CREATE TABLE work_order_status_history (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by_user_id UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- work_order_costs: Detailed cost tracking
CREATE TABLE work_order_costs (
    id UUID PRIMARY KEY,
    work_order_id UUID REFERENCES work_orders(id),
    cost_type VARCHAR(50), -- labor, parts, contractor, other
    description TEXT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Asset Management
```sql
-- asset_maintenance_history: Consolidated maintenance view
CREATE VIEW asset_maintenance_history AS
SELECT 
    a.id as asset_id,
    a.serial_number,
    wo.id as work_order_id,
    wo.wo_number,
    wo.work_type,
    wo.title,
    wo.status,
    wo.scheduled_date,
    wo.completed_at,
    wo.total_cost
FROM assets a
JOIN work_orders wo ON wo.asset_id = a.id
ORDER BY wo.scheduled_date DESC;

-- asset_downtime: Track equipment availability
CREATE TABLE asset_downtime (
    id UUID PRIMARY KEY,
    asset_id UUID REFERENCES assets(id),
    work_order_id UUID REFERENCES work_orders(id),
    downtime_start TIMESTAMP,
    downtime_end TIMESTAMP,
    downtime_hours DECIMAL(10,2),
    reason TEXT
);
```

### 2. **Missing Relationships to Add**

1. **work_orders.parent_work_order_id** → **work_orders.id** (for sub-work orders)
2. **assets.parent_asset_id** → **assets.id** (for asset hierarchy)
3. **systems.parent_system_id** → **systems.id** (for system hierarchy)
4. **user_profiles.manager_id** → **user_profiles.id** (self-referencing for org hierarchy)
5. **companies.parent_company_id** → **companies.id** (for multi-company support)

### 3. **Data Integrity Improvements**

1. Add check constraints for status fields
2. Add triggers for automatic timestamp updates
3. Add indexes on frequently queried columns (asset_id, work_order_id, status)
4. Implement soft deletes with is_deleted flags

### 4. **Performance Optimizations**

1. Create composite indexes for common query patterns
2. Partition large tables (work_orders, work_order_history) by date
3. Create materialized views for reporting
4. Implement database-level caching for frequently accessed data

## Files Generated

1. **database-schema-diagram-2025-07-27.html** - Interactive visual diagram
2. **database-schema-summary-2025-07-27.json** - JSON format schema data
3. **get-complete-database-schema.mjs** - Script to extract detailed schema
4. **generate-database-diagram.mjs** - Script to create visual diagram

## How to Use

1. Open `database-schema-diagram-2025-07-27.html` in a web browser to see the interactive diagram
2. Use the JSON file for programmatic access to schema information
3. Run the scripts periodically to keep documentation updated

This comprehensive schema documentation provides the foundation for designing a complete work order and PM system with all necessary relationships and data structures.