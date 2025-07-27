import { supabase } from './supabase/client';
import type { Database } from './supabase/types';

type WorkOrder = Database['public']['Tables']['work_orders']['Row'];
type WorkOrderInsert = Database['public']['Tables']['work_orders']['Insert'];
type WorkOrderUpdate = Database['public']['Tables']['work_orders']['Update'];
type WorkOrderTask = Database['public']['Tables']['work_order_tasks']['Row'];
type Asset = Database['public']['Tables']['assets']['Row'];
type System = Database['public']['Tables']['systems']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];
type PMTemplate = Database['public']['Tables']['pm_templates']['Row'];

export interface WorkOrderWithDetails extends WorkOrder {
  company?: Company;
  system?: System;
  location?: Location;
  asset?: Asset;
  tasks?: WorkOrderTask[];
}

export interface CreateWorkOrderParams {
  assetId: string;
  title?: string;
  description?: string;
  workType?: 'PM' | 'CM' | 'EM' | 'INSP';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pmTemplateId?: string;
  scheduledDate?: string;
  assignedTo?: string;
  requestedBy?: string;
}

export interface CreatePMWorkOrderParams {
  pmTemplateId: string;
  assetId: string;
  scheduledDate?: string;
  assignedTo?: string;
}

export class WorkOrderServiceEnhanced {
  /**
   * Create a work order with automatic company, system, and location filling
   */
  static async createWorkOrderWithAutoFill(params: CreateWorkOrderParams): Promise<WorkOrderWithDetails> {
    try {
      // Step 1: Get asset with full hierarchy
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select(`
          *,
          system:systems(
            *,
            company:companies(*),
            location:locations(*)
          )
        `)
        .eq('id', params.assetId)
        .single();

      if (assetError) throw new Error(`Asset not found: ${assetError.message}`);
      if (!asset) throw new Error('Asset not found');

      // Step 2: Generate work order number
      const woNumber = `WO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Step 3: Create work order with auto-filled data
      const workOrderData: WorkOrderInsert = {
        // Auto-filled from asset hierarchy
        company_id: asset.system?.company_id || null,
        system_id: asset.system_id,
        location_id: asset.system?.location_id || null,
        asset_id: params.assetId,
        
        // Work order specific data
        wo_number: woNumber,
        title: params.title || `Maintenance for ${asset.serial_number}`,
        description: params.description || '',
        work_type: params.workType || 'CM',
        status: 'open',
        priority: params.priority || 'medium',
        pm_template_id: params.pmTemplateId || null,
        
        // Scheduling and assignment
        scheduled_date: params.scheduledDate || new Date().toISOString(),
        assigned_to: params.assignedTo || null,
        requested_by: params.requestedBy || null,
        
        // Timestamps
        created_at: new Date().toISOString()
      };

      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select(`
          *,
          company:companies(*),
          system:systems(*),
          location:locations(*),
          asset:assets(*)
        `)
        .single();

      if (woError) throw new Error(`Failed to create work order: ${woError.message}`);
      if (!workOrder) throw new Error('Failed to create work order');

      return workOrder;
    } catch (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
  }

  /**
   * Create a PM work order from template with auto-fill
   */
  static async createPMWorkOrder(params: CreatePMWorkOrderParams): Promise<WorkOrderWithDetails> {
    try {
      // Get PM template
      const { data: pmTemplate, error: pmError } = await supabase
        .from('pm_templates')
        .select('*')
        .eq('id', params.pmTemplateId)
        .single();

      if (pmError) throw new Error(`PM template not found: ${pmError.message}`);
      if (!pmTemplate) throw new Error('PM template not found');

      // Create work order
      const workOrder = await this.createWorkOrderWithAutoFill({
        assetId: params.assetId,
        title: `PM - ${pmTemplate.name}`,
        description: pmTemplate.description || `Preventive maintenance based on ${pmTemplate.name}`,
        workType: 'PM',
        priority: 'medium',
        pmTemplateId: params.pmTemplateId,
        scheduledDate: params.scheduledDate,
        assignedTo: params.assignedTo
      });

      // Copy PM template tasks
      const { data: templateTasks, error: tasksError } = await supabase
        .from('pm_template_details')
        .select('*')
        .eq('pm_template_id', params.pmTemplateId)
        .order('step_number');

      if (!tasksError && templateTasks && templateTasks.length > 0) {
        const workOrderTasks = templateTasks.map(task => ({
          work_order_id: workOrder.id,
          description: task.task_description,
          is_critical: task.is_critical || false,
          is_completed: false
        }));

        await supabase
          .from('work_order_tasks')
          .insert(workOrderTasks);

        // Fetch tasks to include in response
        const { data: tasks } = await supabase
          .from('work_order_tasks')
          .select('*')
          .eq('work_order_id', workOrder.id);

        workOrder.tasks = tasks || [];
      }

      return workOrder;
    } catch (error) {
      console.error('Error creating PM work order:', error);
      throw error;
    }
  }

  /**
   * Get work orders by company with full details
   */
  static async getWorkOrdersByCompany(companyId: string, limit = 50): Promise<WorkOrderWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          company:companies(*),
          system:systems(*),
          location:locations(*),
          asset:assets(*),
          tasks:work_order_tasks(*)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Failed to fetch work orders: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
  }

  /**
   * Get work order by ID with full details
   */
  static async getWorkOrderById(id: string): Promise<WorkOrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          company:companies(*),
          system:systems(*),
          location:locations(*),
          asset:assets(*),
          tasks:work_order_tasks(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error(`Failed to fetch work order: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }
  }

  /**
   * Update work order status
   */
  static async updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
    try {
      const updateData: WorkOrderUpdate = {
        status,
        updated_at: new Date().toISOString()
      };

      // If completing, set completed_at
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update work order: ${error.message}`);
      if (!data) throw new Error('Failed to update work order');
      
      return data;
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  }

  /**
   * Update work order task status
   */
  static async updateTaskStatus(taskId: string, isCompleted: boolean): Promise<WorkOrderTask> {
    try {
      const updateData = {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('work_order_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update task: ${error.message}`);
      if (!data) throw new Error('Failed to update task');
      
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Get work order statistics by company
   */
  static async getCompanyStatistics(companyId: string) {
    try {
      // Get work order counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('work_orders')
        .select('status')
        .eq('company_id', companyId);

      if (statusError) throw statusError;

      const stats = {
        total: statusCounts?.length || 0,
        open: statusCounts?.filter(wo => wo.status === 'open').length || 0,
        inProgress: statusCounts?.filter(wo => wo.status === 'in_progress').length || 0,
        completed: statusCounts?.filter(wo => wo.status === 'completed').length || 0,
        cancelled: statusCounts?.filter(wo => wo.status === 'cancelled').length || 0
      };

      // Get work order counts by type
      const { data: typeCounts, error: typeError } = await supabase
        .from('work_orders')
        .select('work_type')
        .eq('company_id', companyId);

      if (!typeError && typeCounts) {
        stats['pm'] = typeCounts.filter(wo => wo.work_type === 'PM').length;
        stats['cm'] = typeCounts.filter(wo => wo.work_type === 'CM').length;
        stats['em'] = typeCounts.filter(wo => wo.work_type === 'EM').length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

export default WorkOrderServiceEnhanced;