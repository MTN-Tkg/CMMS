import { createTableService } from './supabase';
import type {
  ReportFilter,
  WorkOrderCompletionReport,
  AssetDowntimeReport,
  MaintenanceCostReport,
  TechnicianPerformanceReport,
  PMComplianceReport,
  KPIMetrics,
  TrendData,
  ChartData,
  PredictiveInsight,
  ReportingDashboardData,
  ReportResponse,
  TimeRange,
  AggregationPeriod
} from './reporting-types';

export class ReportingService {
  private workOrdersService = createTableService('work_orders');
  private assetsService = createTableService('assets');
  private partsService = createTableService('parts');
  private pmTemplatesService = createTableService('pm_templates');
  private workOrderTasksService = createTableService('work_order_tasks');
  private workOrderPartsService = createTableService('work_order_parts');

  // Utility method to convert TimeRange to date range
  private getDateRange(timeRange: TimeRange, customStart?: string, customEnd?: string): { start: string; end: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeRange) {
      case 'today':
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.toISOString(),
          end: today.toISOString()
        };
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek.toISOString(),
          end: now.toISOString()
        };
      case 'last_week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
        return {
          start: lastWeekStart.toISOString(),
          end: lastWeekEnd.toISOString()
        };
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth.toISOString(),
          end: now.toISOString()
        };
      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: lastMonthStart.toISOString(),
          end: lastMonthEnd.toISOString()
        };
      case 'this_quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        return {
          start: quarterStart.toISOString(),
          end: now.toISOString()
        };
      case 'this_year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          start: yearStart.toISOString(),
          end: now.toISOString()
        };
      case 'custom':
        return {
          start: customStart || today.toISOString(),
          end: customEnd || now.toISOString()
        };
      default:
        return {
          start: today.toISOString(),
          end: now.toISOString()
        };
    }
  }

  // Generate Work Order Completion Report
  async generateWorkOrderCompletionReport(filters: ReportFilter): Promise<ReportResponse<WorkOrderCompletionReport[]>> {
    const startTime = Date.now();
    
    try {
      const { data: workOrders, error } = await this.workOrdersService.getAll({
        filters: {
          'created_at': `gte.${filters.dateRange.start},lte.${filters.dateRange.end}`
        }
      });

      if (error) throw error;

      const reports: WorkOrderCompletionReport[] = workOrders?.map(wo => {
        const estimatedHours = wo.estimated_hours || 0;
        const actualHours = this.calculateActualHours(wo.created_at, wo.completed_at);
        const completionRate = wo.status === 'completed' ? 100 : 
                              wo.status === 'in_progress' ? 50 : 0;
        
        const scheduledDate = new Date(wo.scheduled_date || wo.created_at);
        const completedDate = wo.completed_at ? new Date(wo.completed_at) : new Date();
        const overdue = completedDate > scheduledDate;
        const overdueHours = overdue ? (completedDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60) : 0;

        return {
          id: wo.id,
          title: wo.title || 'Untitled Work Order',
          workOrderNumber: wo.wo_number || wo.id,
          assetName: 'Asset Name', // Would need to join with assets table
          systemName: 'System Name', // Would need to join with systems table
          locationName: 'Location Name', // Would need to join with locations table
          assignedTo: wo.assigned_to || 'Unassigned',
          requestedBy: wo.requested_by || 'Unknown',
          priority: wo.priority || 'medium',
          status: wo.status || 'pending',
          createdAt: wo.created_at,
          scheduledDate: wo.scheduled_date || wo.created_at,
          completedAt: wo.completed_at,
          estimatedHours,
          actualHours,
          totalCost: wo.total_cost || 0,
          laborCost: wo.labor_cost || 0,
          partsCost: wo.parts_cost || 0,
          completionRate,
          overdue,
          overdueHours: overdue ? overdueHours : undefined
        };
      }) || [];

      return {
        data: reports,
        metadata: {
          totalRecords: reports.length,
          filteredRecords: reports.length,
          generatedAt: new Date().toISOString(),
          executionTime: Date.now() - startTime,
          filters
        }
      };
    } catch (error) {
      console.error('Error generating work order completion report:', error);
      throw error;
    }
  }

  // Generate Asset Downtime Report
  async generateAssetDowntimeReport(filters: ReportFilter): Promise<ReportResponse<AssetDowntimeReport[]>> {
    const startTime = Date.now();
    
    try {
      const { data: assets, error } = await this.assetsService.getAll();
      if (error) throw error;

      const { data: workOrders } = await this.workOrdersService.getAll({
        filters: {
          'created_at': `gte.${filters.dateRange.start},lte.${filters.dateRange.end}`
        }
      });

      const reports: AssetDowntimeReport[] = assets?.map(asset => {
        const assetWorkOrders = workOrders?.filter(wo => wo.asset_id === asset.id) || [];
        
        // Calculate downtime metrics (mock calculations for now)
        const totalDowntimeHours = assetWorkOrders.reduce((total, wo) => {
          return total + this.calculateActualHours(wo.created_at, wo.completed_at);
        }, 0);

        const plannedDowntimeHours = assetWorkOrders
          .filter(wo => wo.work_type === 'preventive')
          .reduce((total, wo) => total + this.calculateActualHours(wo.created_at, wo.completed_at), 0);

        const unplannedDowntimeHours = totalDowntimeHours - plannedDowntimeHours;
        const downtimeEvents = assetWorkOrders.length;
        
        // Mock calculations for MTBF and MTTR
        const mtbf = downtimeEvents > 0 ? (30 * 24) / downtimeEvents : 720; // Hours
        const mttr = downtimeEvents > 0 ? totalDowntimeHours / downtimeEvents : 0;
        
        const availability = Math.max(0, 100 - (totalDowntimeHours / (30 * 24)) * 100);
        const reliability = Math.max(0, 100 - (unplannedDowntimeHours / totalDowntimeHours) * 100);

        return {
          assetId: asset.id,
          assetName: asset.serial_number || 'Unknown Asset',
          serialNumber: asset.serial_number || 'N/A',
          systemName: 'System Name', // Would need to join
          locationName: 'Location Name', // Would need to join
          totalDowntimeHours,
          plannedDowntimeHours,
          unplannedDowntimeHours,
          downtimeEvents,
          mtbf,
          mttr,
          availability,
          reliability,
          lastFailureDate: assetWorkOrders.find(wo => wo.work_type === 'corrective')?.created_at,
          criticalFailures: assetWorkOrders.filter(wo => wo.priority === 'high' || wo.priority === 'critical').length
        };
      }) || [];

      return {
        data: reports,
        metadata: {
          totalRecords: reports.length,
          filteredRecords: reports.length,
          generatedAt: new Date().toISOString(),
          executionTime: Date.now() - startTime,
          filters
        }
      };
    } catch (error) {
      console.error('Error generating asset downtime report:', error);
      throw error;
    }
  }

  // Generate KPI Metrics
  async generateKPIMetrics(filters: ReportFilter): Promise<KPIMetrics> {
    try {
      const { data: workOrders } = await this.workOrdersService.getAll({
        filters: {
          'created_at': `gte.${filters.dateRange.start},lte.${filters.dateRange.end}`
        }
      });

      const { data: assets } = await this.assetsService.getAll();
      const { data: parts } = await this.partsService.getAll();

      const totalWorkOrders = workOrders?.length || 0;
      const completedWorkOrders = workOrders?.filter(wo => wo.status === 'completed').length || 0;
      const overdueWorkOrders = workOrders?.filter(wo => {
        const scheduled = new Date(wo.scheduled_date || wo.created_at);
        const now = new Date();
        return wo.status !== 'completed' && now > scheduled;
      }).length || 0;

      const preventiveWorkOrders = workOrders?.filter(wo => wo.work_type === 'preventive').length || 0;
      const emergencyWorkOrders = workOrders?.filter(wo => wo.priority === 'critical').length || 0;

      const totalCost = workOrders?.reduce((sum, wo) => sum + (wo.total_cost || 0), 0) || 0;
      const laborCost = workOrders?.reduce((sum, wo) => sum + (wo.labor_cost || 0), 0) || 0;
      const partsCost = workOrders?.reduce((sum, wo) => sum + (wo.parts_cost || 0), 0) || 0;

      // Calculate average work order time
      const completedWOs = workOrders?.filter(wo => wo.completed_at) || [];
      const avgTime = completedWOs.length > 0 
        ? completedWOs.reduce((sum, wo) => sum + this.calculateActualHours(wo.created_at, wo.completed_at), 0) / completedWOs.length
        : 0;

      return {
        // Overall Performance
        overallEquipmentEffectiveness: 85.5, // Mock calculation
        meanTimeBetweenFailures: 720, // Mock: 30 days in hours
        meanTimeToRepair: avgTime,
        
        // Work Order Metrics
        workOrderCompletionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
        averageWorkOrderTime: avgTime,
        overdueWorkOrders,
        emergencyWorkOrders,
        
        // Maintenance Metrics
        preventiveMaintenanceRatio: totalWorkOrders > 0 ? (preventiveWorkOrders / totalWorkOrders) * 100 : 0,
        maintenanceCostRatio: totalCost > 0 ? (totalCost / (assets?.length || 1)) : 0,
        scheduledMaintenanceCompliance: 92.3, // Mock calculation
        
        // Asset Metrics
        assetAvailability: 94.2, // Mock calculation
        assetReliability: 89.7, // Mock calculation
        criticalAssetDowntime: 12.5, // Mock: hours
        
        // Inventory Metrics
        stockoutFrequency: 2.1, // Mock: per month
        inventoryTurnover: 4.2, // Mock: times per year
        partsAvailability: 96.8, // Mock percentage
        
        // Cost Metrics
        maintenanceCostPerAsset: totalCost / (assets?.length || 1),
        laborCostRatio: totalCost > 0 ? (laborCost / totalCost) * 100 : 0,
        partsCostRatio: totalCost > 0 ? (partsCost / totalCost) * 100 : 0
      };
    } catch (error) {
      console.error('Error generating KPI metrics:', error);
      throw error;
    }
  }

  // Generate trend data for charts
  async generateTrendData(
    metric: string, 
    timeRange: TimeRange, 
    period: AggregationPeriod = 'day'
  ): Promise<TrendData[]> {
    const dateRange = this.getDateRange(timeRange);
    
    // Mock trend data generation
    const periods = this.generatePeriods(dateRange.start, dateRange.end, period);
    
    return periods.map(periodStart => {
      const value = Math.floor(Math.random() * 100) + 50; // Mock data
      return {
        period: periodStart,
        value,
        target: 80, // Mock target
        variance: value - 80
      };
    });
  }

  // Generate chart data
  async generateChartData(
    chartType: string,
    filters: ReportFilter
  ): Promise<ChartData> {
    try {
      const { data: workOrders } = await this.workOrdersService.getAll({
        filters: {
          'created_at': `gte.${filters.dateRange.start},lte.${filters.dateRange.end}`
        }
      });

      switch (chartType) {
        case 'workOrdersByStatus':
          const statusCounts = this.groupBy(workOrders || [], 'status');
          return {
            labels: Object.keys(statusCounts),
            datasets: [{
              label: 'Work Orders by Status',
              data: Object.values(statusCounts),
              backgroundColor: [
                '#10B981', // completed - green
                '#F59E0B', // in_progress - yellow
                '#EF4444', // pending - red
                '#6B7280'  // other - gray
              ]
            }]
          };

        case 'workOrdersByPriority':
          const priorityCounts = this.groupBy(workOrders || [], 'priority');
          return {
            labels: Object.keys(priorityCounts),
            datasets: [{
              label: 'Work Orders by Priority',
              data: Object.values(priorityCounts),
              backgroundColor: [
                '#DC2626', // critical - red
                '#F59E0B', // high - orange
                '#10B981', // medium - green
                '#6B7280'  // low - gray
              ]
            }]
          };

        case 'maintenanceCostTrend':
          const trendData = await this.generateTrendData('maintenance_cost', 'this_month');
          return {
            labels: trendData.map(d => new Date(d.period).toLocaleDateString()),
            datasets: [{
              label: 'Maintenance Cost',
              data: trendData.map(d => d.value),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            }]
          };

        default:
          return {
            labels: [],
            datasets: []
          };
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
      return { labels: [], datasets: [] };
    }
  }

  // Generate predictive insights (mock implementation)
  async generatePredictiveInsights(filters: ReportFilter): Promise<PredictiveInsight[]> {
    // Mock predictive insights
    return [
      {
        id: '1',
        type: 'failure_prediction',
        title: 'Generator LAK-GEN-01 Failure Risk',
        description: 'Based on vibration patterns and operating hours, this generator has a 78% probability of failure within the next 30 days.',
        severity: 'high',
        confidence: 78,
        timeframe: '30 days',
        affectedAssets: ['LAK-GEN-01'],
        recommendedActions: [
          'Schedule immediate vibration analysis',
          'Replace worn bearings',
          'Increase monitoring frequency'
        ],
        potentialSavings: 15000,
        riskLevel: 8,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'maintenance_optimization',
        title: 'PM Schedule Optimization',
        description: 'Adjusting PM intervals for pumps could reduce maintenance costs by 12% while maintaining reliability.',
        severity: 'medium',
        confidence: 85,
        timeframe: '3 months',
        affectedAssets: ['TKB-PUMP-01', 'LAK-PUMP-02'],
        recommendedActions: [
          'Extend PM intervals from 30 to 45 days',
          'Implement condition-based monitoring',
          'Review historical failure data'
        ],
        potentialSavings: 8500,
        riskLevel: 3,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Utility methods
  private calculateActualHours(startDate: string, endDate?: string): number {
    if (!endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key] || 'unknown');
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private generatePeriods(start: string, end: string, period: AggregationPeriod): string[] {
    const periods: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let current = new Date(startDate);
    
    while (current <= endDate) {
      periods.push(current.toISOString());
      
      switch (period) {
        case 'hour':
          current.setHours(current.getHours() + 1);
          break;
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    return periods;
  }
}

// Export singleton instance
export const reportingService = new ReportingService();