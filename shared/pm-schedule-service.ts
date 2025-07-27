import { supabase } from './supabase/client';
import type { Database } from './supabase/types';

type PMSchedule = Database['public']['Tables']['pm_schedules']['Row'];
type PMScheduleInsert = Database['public']['Tables']['pm_schedules']['Insert'];
type PMScheduleUpdate = Database['public']['Tables']['pm_schedules']['Update'];
type PMTemplate = Database['public']['Tables']['pm_templates']['Row'];
type Asset = Database['public']['Tables']['assets']['Row'];
type WorkOrder = Database['public']['Tables']['work_orders']['Row'];

export interface PMScheduleWithDetails extends PMSchedule {
  pm_template?: PMTemplate;
  asset?: Asset;
  company?: Database['public']['Tables']['companies']['Row'];
}

export interface CreatePMScheduleParams {
  pmTemplateId: string;
  assetId: string;
  companyId: string;
  frequencyType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequencyValue: number;
  nextDueDate: string;
  autoAssignToUserId?: string;
  autoPriority?: 'low' | 'medium' | 'high' | 'urgent';
  leadTimeDays?: number;
}

export interface PMScheduleInstance {
  id: string;
  pm_schedule_id: string;
  work_order_id: string;
  scheduled_date: string;
  generated_at: string;
}

export class PMScheduleService {
  /**
   * Create a new PM schedule
   */
  static async createPMSchedule(params: CreatePMScheduleParams): Promise<PMScheduleWithDetails> {
    try {
      const scheduleData: PMScheduleInsert = {
        company_id: params.companyId,
        pm_template_id: params.pmTemplateId,
        asset_id: params.assetId,
        frequency_type: params.frequencyType,
        frequency_value: params.frequencyValue,
        next_due_date: params.nextDueDate,
        auto_assign_to_user_id: params.autoAssignToUserId || null,
        auto_priority: params.autoPriority || 'medium',
        lead_time_days: params.leadTimeDays || 7,
        is_active: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pm_schedules')
        .insert(scheduleData)
        .select(`
          *,
          pm_template:pm_templates(*),
          asset:assets(*),
          company:companies(*)
        `)
        .single();

      if (error) throw new Error(`Failed to create PM schedule: ${error.message}`);
      if (!data) throw new Error('Failed to create PM schedule');

      return data;
    } catch (error) {
      console.error('Error creating PM schedule:', error);
      throw error;
    }
  }

  /**
   * Get all PM schedules for a company
   */
  static async getPMSchedulesByCompany(companyId: string): Promise<PMScheduleWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('pm_schedules')
        .select(`
          *,
          pm_template:pm_templates(*),
          asset:assets(*),
          company:companies(*)
        `)
        .eq('company_id', companyId)
        .order('next_due_date', { ascending: true });

      if (error) throw new Error(`Failed to fetch PM schedules: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching PM schedules:', error);
      throw error;
    }
  }

  /**
   * Get PM schedules due for generation
   */
  static async getDuePMSchedules(companyId?: string): Promise<PMScheduleWithDetails[]> {
    try {
      const today = new Date();
      let query = supabase
        .from('pm_schedules')
        .select(`
          *,
          pm_template:pm_templates(*),
          asset:assets(*),
          company:companies(*)
        `)
        .eq('is_active', true)
        .lte('next_due_date', today.toISOString().split('T')[0]);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Failed to fetch due PM schedules: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching due PM schedules:', error);
      throw error;
    }
  }

  /**
   * Generate work order from PM schedule
   */
  static async generateWorkOrderFromSchedule(scheduleId: string): Promise<WorkOrder> {
    try {
      // Call the database function
      const { data, error } = await supabase
        .rpc('generate_pm_work_order', { p_pm_schedule_id: scheduleId });

      if (error) throw new Error(`Failed to generate work order: ${error.message}`);
      if (!data) throw new Error('Failed to generate work order');

      // Fetch the created work order
      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', data)
        .single();

      if (woError) throw new Error(`Failed to fetch work order: ${woError.message}`);
      if (!workOrder) throw new Error('Work order not found');

      return workOrder;
    } catch (error) {
      console.error('Error generating work order:', error);
      throw error;
    }
  }

  /**
   * Update PM schedule
   */
  static async updatePMSchedule(id: string, updates: Partial<PMScheduleUpdate>): Promise<PMSchedule> {
    try {
      const { data, error } = await supabase
        .from('pm_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update PM schedule: ${error.message}`);
      if (!data) throw new Error('Failed to update PM schedule');

      return data;
    } catch (error) {
      console.error('Error updating PM schedule:', error);
      throw error;
    }
  }

  /**
   * Deactivate PM schedule
   */
  static async deactivatePMSchedule(id: string): Promise<PMSchedule> {
    return this.updatePMSchedule(id, { is_active: false });
  }

  /**
   * Calculate next due date based on frequency
   */
  static calculateNextDueDate(
    currentDate: Date,
    frequencyType: string,
    frequencyValue: number
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequencyType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + frequencyValue);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (frequencyValue * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + frequencyValue);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (frequencyValue * 3));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + frequencyValue);
        break;
      default:
        // Default to monthly if unknown
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  }

  /**
   * Get PM schedule instances (history of generated work orders)
   */
  static async getPMScheduleInstances(scheduleId: string): Promise<PMScheduleInstance[]> {
    try {
      const { data, error } = await supabase
        .from('pm_schedule_instances')
        .select('*')
        .eq('pm_schedule_id', scheduleId)
        .order('scheduled_date', { ascending: false });

      if (error) throw new Error(`Failed to fetch PM instances: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching PM instances:', error);
      throw error;
    }
  }

  /**
   * Batch generate work orders for all due PM schedules
   */
  static async batchGenerateWorkOrders(companyId?: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ scheduleId: string; error: string }>;
  }> {
    try {
      const dueSchedules = await this.getDuePMSchedules(companyId);
      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ scheduleId: string; error: string }>
      };

      for (const schedule of dueSchedules) {
        try {
          // Check lead time
          const today = new Date();
          const dueDate = new Date(schedule.next_due_date);
          const leadTime = schedule.lead_time_days || 7;
          const generateDate = new Date(dueDate);
          generateDate.setDate(generateDate.getDate() - leadTime);

          if (today >= generateDate) {
            await this.generateWorkOrderFromSchedule(schedule.id);
            results.success++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            scheduleId: schedule.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch generation:', error);
      throw error;
    }
  }

  /**
   * Get PM compliance statistics
   */
  static async getPMComplianceStats(companyId: string, startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from('pm_schedule_instances')
        .select(`
          *,
          pm_schedule:pm_schedules!inner(company_id),
          work_order:work_orders!inner(status, completed_at)
        `)
        .eq('pm_schedule.company_id', companyId);

      if (startDate) {
        query = query.gte('scheduled_date', startDate);
      }
      if (endDate) {
        query = query.lte('scheduled_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Failed to fetch compliance data: ${error.message}`);

      const stats = {
        total: data?.length || 0,
        completed: 0,
        overdue: 0,
        onTime: 0,
        complianceRate: 0
      };

      if (data) {
        const today = new Date();
        
        data.forEach(instance => {
          const scheduledDate = new Date(instance.scheduled_date);
          const workOrder = instance.work_order;

          if (workOrder.status === 'completed') {
            stats.completed++;
            
            if (workOrder.completed_at) {
              const completedDate = new Date(workOrder.completed_at);
              if (completedDate <= scheduledDate) {
                stats.onTime++;
              }
            }
          } else if (scheduledDate < today) {
            stats.overdue++;
          }
        });

        stats.complianceRate = stats.total > 0 
          ? Math.round((stats.onTime / stats.total) * 100) 
          : 0;
      }

      return stats;
    } catch (error) {
      console.error('Error getting compliance stats:', error);
      throw error;
    }
  }
}

export default PMScheduleService;