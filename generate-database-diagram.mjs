import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Known tables
const knownTables = [
  'assets',
  'equipment_types', 
  'systems',
  'locations',
  'work_orders',
  'work_order_tasks',
  'work_order_parts',
  'work_order_attachments',
  'work_order_history',
  'work_order_comments',
  'pm_templates',
  'pm_template_details',
  'parts',
  'parts_requisitions',
  'tools',
  'tool_checkouts',
  'user_profiles',
  'companies',
  'notifications'
];

// Get table columns
async function getTableInfo(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return null;
    }
    
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    return [];
  } catch (err) {
    return null;
  }
}

// Generate HTML diagram
async function generateDatabaseDiagram() {
  console.log('🎨 Generating interactive database diagram...\n');
  
  const tableData = {};
  const relationships = [];
  
  // Collect table information
  for (const tableName of knownTables) {
    const columns = await getTableInfo(tableName);
    if (columns !== null) {
      tableData[tableName] = columns;
      console.log(`✅ Found table: ${tableName} with ${columns.length} columns`);
      
      // Identify relationships
      columns.forEach(col => {
        if (col.endsWith('_id') && col !== 'id') {
          const targetTable = col.replace(/_id$/, '');
          const possibleTargets = [targetTable, targetTable + 's'];
          
          for (const target of possibleTargets) {
            if (tableData[target] || knownTables.includes(target)) {
              relationships.push({
                from: tableName,
                fromCol: col,
                to: target,
                toCol: 'id'
              });
              break;
            }
          }
        }
      });
    }
  }
  
  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMMS Database Schema Diagram</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-card h3 {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-top: 5px;
        }
        #diagram {
            background: white;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .table-list {
            margin-top: 30px;
        }
        .table-item {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
        }
        .table-item h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .columns {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .column {
            background: #e9ecef;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
        }
        .column.pk {
            background: #28a745;
            color: white;
        }
        .column.fk {
            background: #007bff;
            color: white;
        }
        .legend {
            margin-top: 20px;
            display: flex;
            gap: 20px;
            font-size: 14px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .legend-box {
            width: 20px;
            height: 20px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CMMS Database Schema Diagram</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Tables</h3>
                <div class="value">${Object.keys(tableData).length}</div>
            </div>
            <div class="stat-card">
                <h3>Total Columns</h3>
                <div class="value">${Object.values(tableData).reduce((sum, cols) => sum + cols.length, 0)}</div>
            </div>
            <div class="stat-card">
                <h3>Relationships</h3>
                <div class="value">${relationships.length}</div>
            </div>
        </div>

        <h2>Entity Relationship Diagram</h2>
        <div id="diagram">
            <div class="mermaid">
erDiagram
${Object.entries(tableData).map(([tableName, columns]) => {
    return `    ${tableName} {
${columns.map(col => {
    let type = 'string';
    if (col === 'id') type = 'uuid PK';
    else if (col.endsWith('_id')) type = 'uuid FK';
    else if (col.includes('created') || col.includes('updated')) type = 'timestamp';
    else if (col.includes('is_') || col.includes('has_')) type = 'boolean';
    else if (col.includes('count') || col.includes('number')) type = 'integer';
    return `        ${type} ${col}`;
}).join('\n')}
    }`;
}).join('\n\n')}

${relationships.map(rel => {
    return `    ${rel.from} ||--o{ ${rel.to} : "${rel.fromCol}"`;
}).join('\n')}
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-box" style="background: #28a745;"></div>
                <span>Primary Key (PK)</span>
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background: #007bff;"></div>
                <span>Foreign Key (FK)</span>
            </div>
        </div>

        <h2>Table Details</h2>
        <div class="table-list">
${Object.entries(tableData).map(([tableName, columns]) => {
    return `
            <div class="table-item">
                <h3>${tableName}</h3>
                <div class="columns">
${columns.map(col => {
    let className = 'column';
    if (col === 'id') className += ' pk';
    else if (col.endsWith('_id')) className += ' fk';
    return `                    <div class="${className}">${col}</div>`;
}).join('\n')}
                </div>
            </div>`;
}).join('\n')}
        </div>

        <h2>Relationships Summary</h2>
        <ul>
${relationships.map(rel => {
    return `            <li><strong>${rel.from}</strong>.${rel.fromCol} → <strong>${rel.to}</strong>.${rel.toCol}</li>`;
}).join('\n')}
        </ul>

        <h2>Work Order & PM System Design Recommendations</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <h3>Current Structure Analysis:</h3>
            <ul>
                <li><strong>Core Work Order Tables:</strong> work_orders, work_order_tasks, work_order_parts, work_order_attachments</li>
                <li><strong>PM System Tables:</strong> pm_templates, pm_template_details</li>
                <li><strong>Asset Management:</strong> assets, equipment_types, systems, locations</li>
                <li><strong>Support Tables:</strong> parts, tools, user_profiles, companies</li>
            </ul>

            <h3>Suggested Enhancements:</h3>
            <ol>
                <li><strong>PM Scheduling:</strong>
                    <ul>
                        <li>Add <code>pm_schedules</code> table to define recurring PM schedules</li>
                        <li>Add <code>pm_schedule_instances</code> for tracking generated PM work orders</li>
                    </ul>
                </li>
                <li><strong>Work Order Enhancements:</strong>
                    <ul>
                        <li>Add <code>work_order_labor</code> for time tracking</li>
                        <li>Add <code>work_order_costs</code> for cost tracking</li>
                        <li>Add <code>work_order_status_history</code> for audit trail</li>
                    </ul>
                </li>
                <li><strong>Asset History:</strong>
                    <ul>
                        <li>Add <code>asset_maintenance_history</code> view combining work orders by asset</li>
                        <li>Add <code>asset_downtime</code> for tracking equipment availability</li>
                    </ul>
                </li>
                <li><strong>Additional Relationships:</strong>
                    <ul>
                        <li>Link work_orders to pm_templates (for PM-generated work orders)</li>
                        <li>Add parent_work_order_id to work_orders (for sub-work orders)</li>
                        <li>Add parent_asset_id to assets (for asset hierarchy)</li>
                    </ul>
                </li>
            </ol>
        </div>
    </div>

    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            er: {
                layoutDirection: 'TB',
                minEntityWidth: 100,
                minEntityHeight: 75,
                entityPadding: 15,
                useMaxWidth: true
            }
        });
    </script>
</body>
</html>`;

  // Save HTML file
  const filename = `database-schema-diagram-${new Date().toISOString().slice(0, 10)}.html`;
  await fs.writeFile(filename, html);
  
  console.log(`\n✅ Interactive diagram saved to: ${filename}`);
  console.log('📌 Open this file in a web browser to view the interactive database diagram');
  
  // Also save a JSON summary
  const summary = {
    generated: new Date().toISOString(),
    statistics: {
      tables: Object.keys(tableData).length,
      totalColumns: Object.values(tableData).reduce((sum, cols) => sum + cols.length, 0),
      relationships: relationships.length
    },
    tables: tableData,
    relationships: relationships
  };
  
  const jsonFilename = `database-schema-summary-${new Date().toISOString().slice(0, 10)}.json`;
  await fs.writeFile(jsonFilename, JSON.stringify(summary, null, 2));
  console.log(`📄 Schema summary saved to: ${jsonFilename}`);
}

// Run the generator
generateDatabaseDiagram().catch(console.error);