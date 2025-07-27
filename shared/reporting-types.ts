// Reporting & Analytics Types for CMMS Phase 3
export interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  assetIds?: string[];
  systemIds?: string[];
  locationIds?: string[];
  technicianIds?: string[];
  workOrderTypes?: string[];
  priorities?: string[];
}

export interface WorkOrderCompletionReport {
  id: string;
  title: string;
  workOrderNumber: string;
  assetName: string;
  systemName: string;
  locationName: string;
  assignedTo: string;
  requestedBy: string;
  priority: string;
  status: string;
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours: number;
  totalCost: number;
  laborCost: number;
  partsCost: number;
  completionRate: number;
  overdue: boolean;
  overdueHours?: number;
}

export interface AssetDowntimeReport {
  assetId: string;
  assetName: string;
  serialNumber: string;
  systemName: string;
  locationName: string;
  totalDowntimeHours: number;
  plannedDowntimeHours: number;
  unplannedDowntimeHours: number;
  downtimeEvents: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
  availability: number; // Percentage
  reliability: number; // Percentage
  lastFailureDate?: string;
  criticalFailures: number;
}

export interface MaintenanceCostReport {
  period: string;
  totalCost: number;
  laborCost: number;
  partsCost: number;
  contractorCost: number;
  preventiveCost: number;
  correctiveCost: number;
  emergencyCost: number;
  costPerAsset: number;
  costPerWorkOrder: number;
  budgetVariance: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  topCostAssets: Array<{
    assetId: string;
    assetName: string;
    cost: number;
    percentage: number;
  }>;
}

export interface TechnicianPerformanceReport {
  technicianId: string;
  technicianName: string;
  completedWorkOrders: number;
  averageCompletionTime: number;
  onTimeCompletion: number;
  overdueWorkOrders: number;
  efficiency: number; // Percentage
  qualityScore: number; // Based on rework/callbacks
  utilizationRate: number; // Percentage
  skillRating: number;
  totalHoursWorked: number;
  costPerHour: number;
  specializations: string[];
  certifications: string[];
  performanceTrend: 'improving' | 'declining' | 'stable';
}

export interface PMComplianceReport {
  templateId: string;
  templateName: string;
  frequency: string;
  assetCount: number;
  scheduledPMs: number;
  completedPMs: number;
  overduePMs: number;
  skippedPMs: number;
  complianceRate: number; // Percentage
  averageCompletionTime: number;
  onTimeCompletion: number;
  qualityScore: number;
  costPerPM: number;
  nextDueDates: string[];
  criticalOverdue: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface KPIMetrics {
  // Overall Performance
  overallEquipmentEffectiveness: number; // OEE
  meanTimeBetweenFailures: number; // MTBF
  meanTimeToRepair: number; // MTTR
  
  // Work Order Metrics
  workOrderCompletionRate: number;
  averageWorkOrderTime: number;
  overdueWorkOrders: number;
  emergencyWorkOrders: number;
  
  // Maintenance Metrics
  preventiveMaintenanceRatio: number;
  maintenanceCostRatio: number;
  scheduledMaintenanceCompliance: number;
  
  // Asset Metrics
  assetAvailability: number;
  assetReliability: number;
  criticalAssetDowntime: number;
  
  // Inventory Metrics
  stockoutFrequency: number;
  inventoryTurnover: number;
  partsAvailability: number;
  
  // Cost Metrics
  maintenanceCostPerAsset: number;
  laborCostRatio: number;
  partsCostRatio: number;
}

export interface TrendData {
  period: string;
  value: number;
  target?: number;
  variance?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

export interface PredictiveInsight {
  id: string;
  type: 'failure_prediction' | 'maintenance_optimization' | 'cost_forecast' | 'performance_trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // Percentage
  timeframe: string;
  affectedAssets: string[];
  recommendedActions: string[];
  potentialSavings?: number;
  riskLevel: number;
  createdAt: string;
  dueDate?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'operational' | 'financial' | 'performance' | 'compliance';
  filters: ReportFilter;
  columns: string[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  isActive: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeFilters: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter';
  title?: string;
  subtitle?: string;
  logo?: string;
}

export interface ReportingDashboardData {
  kpis: KPIMetrics;
  workOrderTrends: TrendData[];
  costTrends: TrendData[];
  assetPerformance: ChartData;
  maintenanceDistribution: ChartData;
  technicianWorkload: ChartData;
  predictiveInsights: PredictiveInsight[];
  recentReports: CustomReport[];
  alertsCount: number;
  lastUpdated: string;
}

// Utility types for report generation
export type ReportType = 
  | 'work_order_completion'
  | 'asset_downtime'
  | 'maintenance_cost'
  | 'technician_performance'
  | 'pm_compliance'
  | 'kpi_dashboard'
  | 'custom';

export type TimeRange = 
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

export type AggregationPeriod = 
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

// API Response types
export interface ReportResponse<T> {
  data: T;
  metadata: {
    totalRecords: number;
    filteredRecords: number;
    generatedAt: string;
    executionTime: number;
    filters: ReportFilter;
  };
}

export interface ReportError {
  code: string;
  message: string;
  details?: any;
}