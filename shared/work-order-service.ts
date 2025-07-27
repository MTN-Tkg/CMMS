/**
 * Work Order Service - Database operations for work orders, comments, and history
 */

import { supabase } from './supabase/client';

// Types
export interface WorkOrderComment {
  id: string;
  work_order_id: string;
  user_id?: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderHistory {
  id: string;
  work_order_id: string;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
  created_at: string;
}

export interface CreateCommentData {
  work_order_id: string;
  user_id?: string;
  comment: string;
  is_internal?: boolean;
}

export interface CreateHistoryData {
  work_order_id: string;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
}

// Comment Functions
export const workOrderCommentService = {
  // Get all comments for a work order
  async getComments(workOrderId: string): Promise<WorkOrderComment[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_comments')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching work order comments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    }
  },

  // Add a new comment
  async addComment(commentData: CreateCommentData): Promise<WorkOrderComment | null> {
    try {
      const { data, error } = await supabase
        .from('work_order_comments')
        .insert({
          work_order_id: commentData.work_order_id,
          user_id: commentData.user_id || 'system',
          comment: commentData.comment,
          is_internal: commentData.is_internal || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding work order comment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addComment:', error);
      return null;
    }
  },

  // Update a comment
  async updateComment(commentId: string, comment: string): Promise<WorkOrderComment | null> {
    try {
      const { data, error } = await supabase
        .from('work_order_comments')
        .update({
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating work order comment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateComment:', error);
      return null;
    }
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_order_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting work order comment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  }
};

// History Functions
export const workOrderHistoryService = {
  // Get all history for a work order
  async getHistory(workOrderId: string): Promise<WorkOrderHistory[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_history')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching work order history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getHistory:', error);
      return [];
    }
  },

  // Add a history record
  async addHistory(historyData: CreateHistoryData): Promise<WorkOrderHistory | null> {
    try {
      const { data, error } = await supabase
        .from('work_order_history')
        .insert({
          work_order_id: historyData.work_order_id,
          field_changed: historyData.field_changed,
          old_value: historyData.old_value,
          new_value: historyData.new_value,
          changed_by: historyData.changed_by || 'system',
          changed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding work order history:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addHistory:', error);
      return null;
    }
  },

  // Track work order status change
  async trackStatusChange(workOrderId: string, oldStatus: string, newStatus: string, changedBy?: string): Promise<void> {
    await this.addHistory({
      work_order_id: workOrderId,
      field_changed: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      changed_by: changedBy
    });
  },

  // Track work order assignment change
  async trackAssignmentChange(workOrderId: string, oldAssignee: string, newAssignee: string, changedBy?: string): Promise<void> {
    await this.addHistory({
      work_order_id: workOrderId,
      field_changed: 'assigned_to',
      old_value: oldAssignee,
      new_value: newAssignee,
      changed_by: changedBy
    });
  },

  // Track work order priority change
  async trackPriorityChange(workOrderId: string, oldPriority: string, newPriority: string, changedBy?: string): Promise<void> {
    await this.addHistory({
      work_order_id: workOrderId,
      field_changed: 'priority',
      old_value: oldPriority,
      new_value: newPriority,
      changed_by: changedBy
    });
  },

  // Track work order completion
  async trackCompletion(workOrderId: string, changedBy?: string): Promise<void> {
    await this.addHistory({
      work_order_id: workOrderId,
      field_changed: 'completed',
      old_value: 'false',
      new_value: 'true',
      changed_by: changedBy
    });
  }
};

// Asset Maintenance Service
export const assetMaintenanceService = {
  // Get upcoming maintenance for an asset
  async getUpcomingMaintenance(assetId: string) {
    try {
      // Get PM templates for this asset's equipment type and system
      const { data: asset } = await supabase
        .from('assets')
        .select('equipment_type_id, system_id')
        .eq('id', assetId)
        .single();

      if (!asset) return [];

      const { data: pmTemplates, error } = await supabase
        .from('pm_templates')
        .select(`
          *,
          pm_template_details (*)
        `)
        .or(`equipment_type_id.eq.${asset.equipment_type_id},system_id.eq.${asset.system_id}`)
        .order('frequency_value', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming maintenance:', error);
        return [];
      }

      // Calculate next due dates based on frequency
      const upcomingMaintenance = pmTemplates?.map(template => {
        const now = new Date();
        let nextDueDate = new Date();

        // Calculate next due date based on frequency
        switch (template.frequency_type) {
          case 'Daily':
            nextDueDate.setDate(now.getDate() + template.frequency_value);
            break;
          case 'Weekly':
            nextDueDate.setDate(now.getDate() + (template.frequency_value * 7));
            break;
          case 'Monthly':
            nextDueDate.setMonth(now.getMonth() + template.frequency_value);
            break;
          case 'Yearly':
            nextDueDate.setFullYear(now.getFullYear() + template.frequency_value);
            break;
          default:
            nextDueDate.setDate(now.getDate() + 30); // Default to 30 days
        }

        return {
          id: template.id,
          title: template.template_name || template.name,
          type: 'ป้องกัน',
          dueDate: nextDueDate.toLocaleDateString('th-TH'),
          priority: template.pm_template_details?.some((detail: any) => detail.is_critical) ? 'สูง' : 'ปานกลาง',
          estimatedDuration: `${template.estimated_duration || template.estimated_minutes || 60} นาที`,
          estimatedCost: 2000, // Default estimate
          description: template.description
        };
      }) || [];

      return upcomingMaintenance.slice(0, 5); // Return top 5 upcoming
    } catch (error) {
      console.error('Error in getUpcomingMaintenance:', error);
      return [];
    }
  },

  // Get maintenance history for an asset
  async getMaintenanceHistory(assetId: string) {
    try {
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          work_order_parts (
            parts (name)
          )
        `)
        .eq('asset_id', assetId)
        .eq('status', 'Completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance history:', error);
        return [];
      }

      return workOrders?.map(wo => ({
        id: wo.id,
        date: wo.completed_at ? new Date(wo.completed_at).toLocaleDateString('th-TH') : wo.created_at,
        type: wo.work_type === 'PM' ? 'ป้องกัน' : wo.work_type === 'CM' ? 'แก้ไข' : 'ตรวจสอบ',
        title: wo.title,
        description: wo.description,
        technician: wo.assigned_to || 'ไม่ระบุ',
        duration: `${wo.estimated_hours || 0} ชั่วโมง`,
        cost: wo.total_cost || 0,
        status: 'เสร็จสิ้น',
        parts: wo.work_order_parts?.map((wp: any) => wp.parts?.name).filter(Boolean) || []
      })) || [];
    } catch (error) {
      console.error('Error in getMaintenanceHistory:', error);
      return [];
    }
  },

  // Calculate asset downtime
  async calculateDowntime(assetId: string, periodDays: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select('created_at, completed_at, estimated_hours')
        .eq('asset_id', assetId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error calculating downtime:', error);
        return { downtime: 0, availability: 100 };
      }

      let totalDowntimeHours = 0;
      const totalPeriodHours = periodDays * 24;

      workOrders?.forEach(wo => {
        if (wo.completed_at) {
          const start = new Date(wo.created_at);
          const end = new Date(wo.completed_at);
          const downtimeHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          totalDowntimeHours += downtimeHours;
        } else {
          // For ongoing work orders, use estimated hours
          totalDowntimeHours += wo.estimated_hours || 0;
        }
      });

      const downtimePercentage = (totalDowntimeHours / totalPeriodHours) * 100;
      const availability = Math.max(0, 100 - downtimePercentage);

      return {
        downtime: Math.round(downtimePercentage * 10) / 10,
        availability: Math.round(availability * 10) / 10,
        totalDowntimeHours: Math.round(totalDowntimeHours * 10) / 10
      };
    } catch (error) {
      console.error('Error in calculateDowntime:', error);
      return { downtime: 0, availability: 100 };
    }
  }
};

// Test functions to check if tables exist
export const testTablesExist = async () => {
  console.log('🧪 Testing if Phase 1 tables exist...');
  
  try {
    // Test work_order_comments table
    const { error: commentsError } = await supabase
      .from('work_order_comments')
      .select('id')
      .limit(1);
    
    console.log(commentsError ? '❌ work_order_comments table missing' : '✅ work_order_comments table exists');
    
    // Test work_order_history table
    const { error: historyError } = await supabase
      .from('work_order_history')
      .select('id')
      .limit(1);
    
    console.log(historyError ? '❌ work_order_history table missing' : '✅ work_order_history table exists');
    
    return {
      commentsTableExists: !commentsError,
      historyTableExists: !historyError
    };
  } catch (error) {
    console.error('Error testing tables:', error);
    return {
      commentsTableExists: false,
      historyTableExists: false
    };
  }
};