import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupPMTables() {
  console.log('Setting up PM tables...');

  try {
    // Create pm_template_details table
    const createPmTemplateDetails = `
      CREATE TABLE IF NOT EXISTS pm_template_details (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        pm_template_id TEXT NOT NULL REFERENCES pm_templates(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL DEFAULT 1,
        task_description TEXT NOT NULL,
        expected_input_type TEXT, -- 'text', 'number', 'boolean', 'select', 'photo'
        standard_text_expected TEXT,
        standard_min_value NUMERIC,
        standard_max_value NUMERIC,
        is_critical BOOLEAN DEFAULT false,
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create work_order_tasks table
    const createWorkOrderTasks = `
      CREATE TABLE IF NOT EXISTS work_order_tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
        pm_template_detail_id TEXT REFERENCES pm_template_details(id),
        step_number INTEGER NOT NULL DEFAULT 1,
        task_description TEXT NOT NULL,
        expected_input_type TEXT,
        standard_text_expected TEXT,
        standard_min_value NUMERIC,
        standard_max_value NUMERIC,
        is_critical BOOLEAN DEFAULT false,
        
        -- Task execution data
        status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped', 'na'
        result_value TEXT,
        result_status TEXT DEFAULT 'pending', -- 'pass', 'fail', 'warning', 'na'
        notes TEXT,
        photo_urls TEXT[],
        
        -- Timing and assignment
        assigned_to TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_pm_template_details_template_id ON pm_template_details(pm_template_id);
      CREATE INDEX IF NOT EXISTS idx_pm_template_details_step_number ON pm_template_details(step_number);
      CREATE INDEX IF NOT EXISTS idx_work_order_tasks_work_order_id ON work_order_tasks(work_order_id);
      CREATE INDEX IF NOT EXISTS idx_work_order_tasks_pm_template_detail_id ON work_order_tasks(pm_template_detail_id);
      CREATE INDEX IF NOT EXISTS idx_work_order_tasks_status ON work_order_tasks(status);
    `;

    // Execute table creation
    console.log('Creating pm_template_details table...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: createPmTemplateDetails });
    if (error1) {
      console.error('Error creating pm_template_details:', error1);
    } else {
      console.log('✅ pm_template_details table created successfully');
    }

    console.log('Creating work_order_tasks table...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: createWorkOrderTasks });
    if (error2) {
      console.error('Error creating work_order_tasks:', error2);
    } else {
      console.log('✅ work_order_tasks table created successfully');
    }

    console.log('Creating indexes...');
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (error3) {
      console.error('Error creating indexes:', error3);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Insert sample PM template details for existing templates
    console.log('Inserting sample PM template details...');
    
    // Get existing PM templates
    const { data: templates, error: templatesError } = await supabase
      .from('pm_templates')
      .select('id, name')
      .limit(5);

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return;
    }

    if (templates && templates.length > 0) {
      for (const template of templates) {
        // Check if details already exist
        const { data: existingDetails } = await supabase
          .from('pm_template_details')
          .select('id')
          .eq('pm_template_id', template.id)
          .limit(1);

        if (!existingDetails || existingDetails.length === 0) {
          // Insert sample tasks for this template
          const sampleTasks = [
            {
              pm_template_id: template.id,
              step_number: 1,
              task_description: 'ตรวจสอบระดับน้ำมันเครื่อง',
              expected_input_type: 'select',
              standard_text_expected: 'ปกติ',
              is_critical: true,
              remarks: 'ตรวจสอบว่าน้ำมันอยู่ในระดับที่เหมาะสม'
            },
            {
              pm_template_id: template.id,
              step_number: 2,
              task_description: 'ตรวจสอบระดับน้ำในหม้อน้ำ',
              expected_input_type: 'select',
              standard_text_expected: 'ปกติ',
              is_critical: true,
              remarks: 'ตรวจสอบว่าน้ำในหม้อน้ำเพียงพอ'
            },
            {
              pm_template_id: template.id,
              step_number: 3,
              task_description: 'ตรวจสอบแรงดันลมยาง',
              expected_input_type: 'number',
              standard_min_value: 30,
              standard_max_value: 35,
              is_critical: false,
              remarks: 'วัดแรงดันลมยางให้อยู่ในช่วงที่กำหนด'
            },
            {
              pm_template_id: template.id,
              step_number: 4,
              task_description: 'ทำความสะอาดไส้กรองอากาศ',
              expected_input_type: 'boolean',
              is_critical: false,
              remarks: 'ทำความสะอาดหรือเปลี่ยนไส้กรองอากาศ'
            },
            {
              pm_template_id: template.id,
              step_number: 5,
              task_description: 'ตรวจสอบการทำงานของไฟส่องสว่าง',
              expected_input_type: 'boolean',
              is_critical: false,
              remarks: 'ทดสอบการทำงานของไฟส่องสว่างทุกดวง'
            }
          ];

          const { error: insertError } = await supabase
            .from('pm_template_details')
            .insert(sampleTasks);

          if (insertError) {
            console.error(`Error inserting details for template ${template.id}:`, insertError);
          } else {
            console.log(`✅ Sample tasks created for template: ${template.name}`);
          }
        }
      }
    }

    console.log('🎉 PM tables setup completed successfully!');

  } catch (error) {
    console.error('Error setting up PM tables:', error);
  }
}

setupPMTables();