import React, { useState } from 'react';
import { useReporting } from '../hooks/use-reporting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Users, 
  Settings, 
  Download,
  RefreshCw,
  Calendar,
  Filter,
  FileText,
  PieChart,
  Activity,
  Zap,
  Target,
  Wrench
} from 'lucide-react';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, trend, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-1">
              <p className="text-2xl font-bold">{value}</p>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {trend !== undefined && (
              <div className="flex items-center mt-1">
                <TrendingUp className={`h-4 w-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Chart Component (placeholder for now)
interface ChartComponentProps {
  title: string;
  data: any;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ title, data, type, height = 300 }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="flex items-center justify-center bg-muted rounded-lg"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {type.charAt(0).toUpperCase() + type.slice(1)} Chart
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Chart.js integration coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Predictive Insights Component
const PredictiveInsights: React.FC<{ insights: any[] }> = ({ insights }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Predictive Insights
        </CardTitle>
        <CardDescription>
          AI-powered maintenance predictions and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No insights available</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(insight.severity)}>
                      {insight.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {insight.timeframe}
                  </span>
                </div>
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                {insight.recommendedActions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {insight.recommendedActions.map((action: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {insight.potentialSavings && (
                  <div className="mt-2 text-sm">
                    <span className="text-green-600 font-medium">
                      Potential Savings: ฿{insight.potentialSavings.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Reports Component
export default function Reports() {
  const {
    kpiMetrics,
    chartData,
    predictiveInsights,
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    timeRange,
    setTimeRange,
    refreshDashboard,
    generateReport,
    exportDashboard
  } = useReporting();

  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRefresh = () => {
    refreshDashboard();
  };

  const handleExport = () => {
    exportDashboard({
      format: 'pdf',
      includeCharts: true,
      includeFilters: true,
      title: 'CMMS Analytics Dashboard',
      orientation: 'landscape'
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive maintenance insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          {kpiMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Overall Equipment Effectiveness"
                value={kpiMetrics.overallEquipmentEffectiveness.toFixed(1)}
                unit="%"
                trend={2.3}
                icon={<Target className="h-6 w-6" />}
                color="green"
              />
              <KPICard
                title="Work Order Completion Rate"
                value={kpiMetrics.workOrderCompletionRate.toFixed(1)}
                unit="%"
                trend={-1.2}
                icon={<Activity className="h-6 w-6" />}
                color="blue"
              />
              <KPICard
                title="Mean Time To Repair"
                value={kpiMetrics.meanTimeToRepair.toFixed(1)}
                unit="hrs"
                trend={-5.4}
                icon={<Wrench className="h-6 w-6" />}
                color="yellow"
              />
              <KPICard
                title="Asset Availability"
                value={kpiMetrics.assetAvailability.toFixed(1)}
                unit="%"
                trend={1.8}
                icon={<BarChart3 className="h-6 w-6" />}
                color="purple"
              />
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Work Orders by Status"
              data={chartData.workOrdersByStatus}
              type="doughnut"
            />
            <ChartComponent
              title="Maintenance Cost Trend"
              data={chartData.maintenanceCostTrend}
              type="line"
            />
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Work Orders by Priority"
              data={chartData.workOrdersByPriority}
              type="bar"
            />
            <ChartComponent
              title="Asset Performance"
              data={dashboardData?.assetPerformance}
              type="bar"
            />
          </div>
        </TabsContent>

        {/* Operational Reports Tab */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Work Order Completion
                </CardTitle>
                <CardDescription>
                  Detailed analysis of work order completion rates and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateReport('work_order_completion')}
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Asset Downtime Analysis
                </CardTitle>
                <CardDescription>
                  Track asset availability, MTBF, MTTR, and downtime patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateReport('asset_downtime')}
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Technician Performance
                </CardTitle>
                <CardDescription>
                  Evaluate technician efficiency, workload, and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateReport('technician_performance')}
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  PM Compliance
                </CardTitle>
                <CardDescription>
                  Monitor preventive maintenance compliance and effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateReport('pm_compliance')}
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Reports Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Maintenance Cost Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive breakdown of maintenance costs and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateReport('maintenance_cost')}
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Cost Distribution
                </CardTitle>
                <CardDescription>
                  Labor vs parts cost analysis and budget variance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpiMetrics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Labor Cost Ratio</span>
                        <span className="font-semibold">{kpiMetrics.laborCostRatio.toFixed(1)}%</span>
                      </div>
                      <Progress value={kpiMetrics.laborCostRatio} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Parts Cost Ratio</span>
                        <span className="font-semibold">{kpiMetrics.partsCostRatio.toFixed(1)}%</span>
                      </div>
                      <Progress value={kpiMetrics.partsCostRatio} className="h-2" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Asset Reliability Trends"
              data={{}}
              type="line"
            />
            <ChartComponent
              title="Maintenance Efficiency"
              data={{}}
              type="bar"
            />
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <PredictiveInsights insights={predictiveInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
