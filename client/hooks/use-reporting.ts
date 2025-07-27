import { useState, useEffect, useCallback } from 'react';
import { reportingService } from '../../shared/reporting-service';
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
  TimeRange,
  ReportType,
  CustomReport,
  ExportOptions
} from '../../shared/reporting-types';

interface UseReportingState {
  // Data
  kpiMetrics: KPIMetrics | null;
  workOrderReports: WorkOrderCompletionReport[];
  assetDowntimeReports: AssetDowntimeReport[];
  maintenanceCostReports: MaintenanceCostReport[];
  technicianPerformanceReports: TechnicianPerformanceReport[];
  pmComplianceReports: PMComplianceReport[];
  trendData: TrendData[];
  chartData: Record<string, ChartData>;
  predictiveInsights: PredictiveInsight[];
  customReports: CustomReport[];
  dashboardData: ReportingDashboardData | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Filters
  currentFilters: ReportFilter;
  timeRange: TimeRange;
}

interface UseReportingActions {
  // Data fetching
  refreshDashboard: () => Promise<void>;
  generateReport: (type: ReportType, filters?: ReportFilter) => Promise<void>;
  generateKPIMetrics: (filters?: ReportFilter) => Promise<void>;
  generateTrendData: (metric: string, timeRange: TimeRange) => Promise<void>;
  generateChartData: (chartType: string, filters?: ReportFilter) => Promise<void>;
  generatePredictiveInsights: (filters?: ReportFilter) => Promise<void>;
  
  // Filter management
  updateFilters: (filters: Partial<ReportFilter>) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  resetFilters: () => void;
  
  // Report management
  saveCustomReport: (report: Omit<CustomReport, 'id' | 'createdAt'>) => Promise<void>;
  deleteCustomReport: (reportId: string) => Promise<void>;
  runCustomReport: (reportId: string) => Promise<void>;
  
  // Export functionality
  exportReport: (type: ReportType, options: ExportOptions) => Promise<void>;
  exportDashboard: (options: ExportOptions) => Promise<void>;
}

const defaultFilters: ReportFilter = {
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end: new Date().toISOString()
  }
};

export function useReporting(): UseReportingState & UseReportingActions {
  const [state, setState] = useState<UseReportingState>({
    // Data
    kpiMetrics: null,
    workOrderReports: [],
    assetDowntimeReports: [],
    maintenanceCostReports: [],
    technicianPerformanceReports: [],
    pmComplianceReports: [],
    trendData: [],
    chartData: {},
    predictiveInsights: [],
    customReports: [],
    dashboardData: null,
    
    // State
    isLoading: false,
    error: null,
    lastUpdated: null,
    
    // Filters
    currentFilters: defaultFilters,
    timeRange: 'this_month'
  });

  // Update filters when time range changes
  useEffect(() => {
    const dateRange = getDateRangeFromTimeRange(state.timeRange);
    setState(prev => ({
      ...prev,
      currentFilters: {
        ...prev.currentFilters,
        dateRange
      }
    }));
  }, [state.timeRange]);

  // Utility function to convert TimeRange to date range
  const getDateRangeFromTimeRange = (timeRange: TimeRange): { start: string; end: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeRange) {
      case 'today':
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        };
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek.toISOString(),
          end: now.toISOString()
        };
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth.toISOString(),
          end: now.toISOString()
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
      default:
        return {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString()
        };
    }
  };

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Generate all dashboard components
      const [kpiMetrics, workOrderChart, costChart, insights] = await Promise.all([
        reportingService.generateKPIMetrics(state.currentFilters),
        reportingService.generateChartData('workOrdersByStatus', state.currentFilters),
        reportingService.generateChartData('maintenanceCostTrend', state.currentFilters),
        reportingService.generatePredictiveInsights(state.currentFilters)
      ]);

      const dashboardData: ReportingDashboardData = {
        kpis: kpiMetrics,
        workOrderTrends: await reportingService.generateTrendData('work_orders', state.timeRange),
        costTrends: await reportingService.generateTrendData('maintenance_cost', state.timeRange),
        assetPerformance: workOrderChart,
        maintenanceDistribution: costChart,
        technicianWorkload: await reportingService.generateChartData('workOrdersByPriority', state.currentFilters),
        predictiveInsights: insights,
        recentReports: [], // Would load from database
        alertsCount: insights.filter(i => i.severity === 'high' || i.severity === 'critical').length,
        lastUpdated: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        kpiMetrics,
        chartData: {
          workOrdersByStatus: workOrderChart,
          maintenanceCostTrend: costChart,
          workOrdersByPriority: dashboardData.technicianWorkload
        },
        predictiveInsights: insights,
        dashboardData,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh dashboard'
      }));
    }
  }, [state.currentFilters, state.timeRange]);

  // Generate specific report
  const generateReport = useCallback(async (type: ReportType, filters?: ReportFilter) => {
    const reportFilters = filters || state.currentFilters;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      switch (type) {
        case 'work_order_completion':
          const workOrderResponse = await reportingService.generateWorkOrderCompletionReport(reportFilters);
          setState(prev => ({
            ...prev,
            workOrderReports: workOrderResponse.data,
            isLoading: false,
            lastUpdated: new Date().toISOString()
          }));
          break;
          
        case 'asset_downtime':
          const assetResponse = await reportingService.generateAssetDowntimeReport(reportFilters);
          setState(prev => ({
            ...prev,
            assetDowntimeReports: assetResponse.data,
            isLoading: false,
            lastUpdated: new Date().toISOString()
          }));
          break;
          
        default:
          console.warn(`Report type ${type} not implemented yet`);
          setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to generate ${type} report`
      }));
    }
  }, [state.currentFilters]);

  // Generate KPI metrics
  const generateKPIMetrics = useCallback(async (filters?: ReportFilter) => {
    const reportFilters = filters || state.currentFilters;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const kpiMetrics = await reportingService.generateKPIMetrics(reportFilters);
      setState(prev => ({
        ...prev,
        kpiMetrics,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating KPI metrics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate KPI metrics'
      }));
    }
  }, [state.currentFilters]);

  // Generate trend data
  const generateTrendData = useCallback(async (metric: string, timeRange: TimeRange) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const trendData = await reportingService.generateTrendData(metric, timeRange);
      setState(prev => ({
        ...prev,
        trendData,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating trend data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate trend data'
      }));
    }
  }, []);

  // Generate chart data
  const generateChartData = useCallback(async (chartType: string, filters?: ReportFilter) => {
    const reportFilters = filters || state.currentFilters;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const chartData = await reportingService.generateChartData(chartType, reportFilters);
      setState(prev => ({
        ...prev,
        chartData: {
          ...prev.chartData,
          [chartType]: chartData
        },
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating chart data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate chart data'
      }));
    }
  }, [state.currentFilters]);

  // Generate predictive insights
  const generatePredictiveInsights = useCallback(async (filters?: ReportFilter) => {
    const reportFilters = filters || state.currentFilters;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const insights = await reportingService.generatePredictiveInsights(reportFilters);
      setState(prev => ({
        ...prev,
        predictiveInsights: insights,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate predictive insights'
      }));
    }
  }, [state.currentFilters]);

  // Filter management
  const updateFilters = useCallback((filters: Partial<ReportFilter>) => {
    setState(prev => ({
      ...prev,
      currentFilters: {
        ...prev.currentFilters,
        ...filters
      }
    }));
  }, []);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    setState(prev => ({ ...prev, timeRange }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentFilters: defaultFilters,
      timeRange: 'this_month'
    }));
  }, []);

  // Report management (mock implementations)
  const saveCustomReport = useCallback(async (report: Omit<CustomReport, 'id' | 'createdAt'>) => {
    // Mock implementation - would save to database
    const newReport: CustomReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      customReports: [...prev.customReports, newReport]
    }));
  }, []);

  const deleteCustomReport = useCallback(async (reportId: string) => {
    setState(prev => ({
      ...prev,
      customReports: prev.customReports.filter(r => r.id !== reportId)
    }));
  }, []);

  const runCustomReport = useCallback(async (reportId: string) => {
    const report = state.customReports.find(r => r.id === reportId);
    if (report) {
      await generateReport(report.type as ReportType, report.filters);
    }
  }, [state.customReports, generateReport]);

  // Export functionality (mock implementations)
  const exportReport = useCallback(async (type: ReportType, options: ExportOptions) => {
    console.log(`Exporting ${type} report with options:`, options);
    // Mock implementation - would generate and download file
    alert(`Export ${type} report as ${options.format} - Feature coming soon!`);
  }, []);

  const exportDashboard = useCallback(async (options: ExportOptions) => {
    console.log('Exporting dashboard with options:', options);
    // Mock implementation - would generate and download dashboard
    alert(`Export dashboard as ${options.format} - Feature coming soon!`);
  }, []);

  // Auto-refresh dashboard on mount
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    // State
    ...state,
    
    // Actions
    refreshDashboard,
    generateReport,
    generateKPIMetrics,
    generateTrendData,
    generateChartData,
    generatePredictiveInsights,
    updateFilters,
    setTimeRange,
    resetFilters,
    saveCustomReport,
    deleteCustomReport,
    runCustomReport,
    exportReport,
    exportDashboard
  };
}