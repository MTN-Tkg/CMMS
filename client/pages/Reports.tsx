import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  DollarSign,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Filter,
  Search,
  FileText,
  Settings,
  Wrench,
  Package,
  MapPin,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";

// Mock analytics data
const analyticsData = {
  overview: {
    totalWorkOrders: 156,
    completedWorkOrders: 142,
    avgCompletionTime: 2.3,
    costSavings: 125000,
    uptime: 94.2,
    efficiency: 87.5,
    trends: {
      workOrders: { current: 156, previous: 142, change: 9.9 },
      completionTime: { current: 2.3, previous: 2.8, change: -17.9 },
      costs: { current: 125000, previous: 110000, change: 13.6 },
      uptime: { current: 94.2, previous: 91.5, change: 2.9 },
    },
  },
  maintenance: {
    preventive: { count: 89, percentage: 65, cost: 89000, avgTime: 1.8 },
    corrective: { count: 35, percentage: 25, cost: 156000, avgTime: 4.2 },
    inspection: { count: 14, percentage: 10, cost: 12000, avgTime: 0.8 },
  },
  assets: {
    byCategory: [
      {
        name: "รถแทรกเตอร์",
        count: 3,
        uptime: 92.1,
        costs: 45000,
        workOrders: 48,
      },
      { name: "ปั๊มน้ำ", count: 4, uptime: 96.8, costs: 18000, workOrders: 28 },
      {
        name: "เครื่องเก็บเกี่ยว",
        count: 2,
        uptime: 88.5,
        costs: 78000,
        workOrders: 42,
      },
      {
        name: "เครื่องพ่นยา",
        count: 2,
        uptime: 94.2,
        costs: 15000,
        workOrders: 18,
      },
    ],
    topMaintenance: [
      {
        id: "HARV-003",
        name: "เครื่องเก็บเกี่ยว John Deere S660",
        workOrders: 12,
        cost: 25000,
        downtime: 18,
      },
      {
        id: "TRACT-002",
        name: "รถแทรก���ตอร์ Massey Ferguson 4707",
        workOrders: 8,
        cost: 18000,
        downtime: 12,
      },
      {
        id: "PUMP-002",
        name: "ปั๊มน้ำไฟฟ้า Mitsubishi 5HP",
        workOrders: 6,
        cost: 12000,
        downtime: 8,
      },
    ],
  },
  technicians: {
    performance: [
      {
        id: "TECH-001",
        name: "สมชาย รักงาน",
        completed: 45,
        avgTime: 2.1,
        rating: 4.8,
        efficiency: 92,
      },
      {
        id: "TECH-002",
        name: "สมหญิง ใจดี",
        completed: 32,
        avgTime: 1.9,
        rating: 4.6,
        efficiency: 89,
      },
      {
        id: "TECH-003",
        name: "สมศักดิ์ ช่างเก่ง",
        completed: 38,
        avgTime: 2.8,
        rating: 4.4,
        efficiency: 85,
      },
      {
        id: "TECH-004",
        name: "สมคิด ช่วยงาน",
        completed: 27,
        avgTime: 2.2,
        rating: 4.5,
        efficiency: 87,
      },
    ],
    workload: [
      { month: "ต.ค.", workHours: 168, overtime: 12, efficiency: 88 },
      { month: "พ.ย.", workHours: 172, overtime: 18, efficiency: 91 },
      { month: "ธ.ค.", workHours: 165, overtime: 8, efficiency: 89 },
      { month: "ม.ค.", workHours: 175, overtime: 15, efficiency: 92 },
    ],
  },
  costs: {
    byMonth: [
      {
        month: "ส.ค.",
        labor: 45000,
        parts: 32000,
        external: 8000,
        total: 85000,
      },
      {
        month: "ก.ย.",
        labor: 48000,
        parts: 28000,
        external: 12000,
        total: 88000,
      },
      {
        month: "ต.ค.",
        labor: 52000,
        parts: 35000,
        external: 15000,
        total: 102000,
      },
      {
        month: "พ.ย.",
        labor: 47000,
        parts: 42000,
        external: 18000,
        total: 107000,
      },
      {
        month: "ธ.ค.",
        labor: 49000,
        parts: 38000,
        external: 22000,
        total: 109000,
      },
      {
        month: "ม.ค.",
        labor: 51000,
        parts: 29000,
        external: 16000,
        total: 96000,
      },
    ],
    breakdown: {
      labor: { amount: 298000, percentage: 58 },
      parts: { amount: 204000, percentage: 40 },
      external: { amount: 91000, percentage: 18 },
    },
  },
  inventory: {
    value: 485000,
    turnover: 4.2,
    stockouts: 3,
    utilization: 78,
    categories: [
      { name: "ไส้กรอง", value: 125000, turnover: 6.8, items: 45 },
      { name: "น้ำมัน", value: 98000, turnover: 8.2, items: 23 },
      { name: "อะไหล่เครื่องจักร", value: 156000, turnover: 3.4, items: 67 },
      { name: "ซีลและปะเก็น", value: 45000, turnover: 5.1, items: 89 },
      { name: "อ��ไหล่ไฟฟ้า", value: 61000, turnover: 4.7, items: 34 },
    ],
  },
};

// Pre-defined reports
const reportTemplates = [
  {
    id: "monthly-summary",
    name: "สรุปรายเดือน",
    description: "รายงานสรุปผลการดำเนินงานประจำเดือน",
    category: "สรุปผล",
    frequency: "รายเดือน",
    lastGenerated: "2024-01-15",
  },
  {
    id: "asset-performance",
    name: "ประสิทธิภาพอุปกรณ์",
    description: "วิเคราะห์ประสิทธิภาพและ uptime ของอุปกรณ์",
    category: "อุปกรณ์",
    frequency: "รายสัปดาห์",
    lastGenerated: "2024-01-14",
  },
  {
    id: "maintenance-costs",
    name: "ค่าใช้จ่ายบำรุงรักษา",
    description: "รายงานค่าใช้จ่ายและงบประมาณ",
    category: "ต้นทุน",
    frequency: "รายเดือน",
    lastGenerated: "2024-01-10",
  },
  {
    id: "technician-performance",
    name: "ประสิทธิภาพช่าง",
    description: "ประเม��นผลงานและประสิทธิภาพของช่าง",
    category: "บุคลากร",
    frequency: "รายเดือน",
    lastGenerated: "2024-01-12",
  },
  {
    id: "inventory-analysis",
    name: "วิเคราะห์สต็อก",
    description: "รายงานการจัดการสต็อกและการใช้อะไหล่",
    category: "คลังสินค้า",
    frequency: "รายสัปดาห์",
    lastGenerated: "2024-01-13",
  },
];

export function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30days");
  const [selectedReport, setSelectedReport] = useState("");
  const [reportCategory, setReportCategory] = useState("ทั้งหมด");

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-success" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const filteredReports = useMemo(() => {
    return reportTemplates.filter(
      (report) =>
        reportCategory === "ทั้งหมด" || report.category === reportCategory,
    );
  }, [reportCategory]);

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">รายงานและสถิติ</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              วิเคราะห์ประสิทธิภาพและติดตามผลการดำเนินงาน
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วันที่แล้ว</SelectItem>
                <SelectItem value="30days">30 วันที่แล้ว</SelectItem>
                <SelectItem value="90days">90 วันที่แล้ว</SelectItem>
                <SelectItem value="1year">1 ปีที่แล้ว</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="assets">อุปกรณ์</TabsTrigger>
            <TabsTrigger value="maintenance">บำรุงรักษา</TabsTrigger>
            <TabsTrigger value="costs">ต้นทุน</TabsTrigger>
            <TabsTrigger value="inventory">คลังสินค้า</TabsTrigger>
            <TabsTrigger value="reports">รายงาน</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        ใบสั่งงานทั้งหมด
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.totalWorkOrders}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(
                          analyticsData.overview.trends.workOrders.change,
                        )}
                        <span
                          className={getTrendColor(
                            analyticsData.overview.trends.workOrders.change,
                          )}
                        >
                          {Math.abs(
                            analyticsData.overview.trends.workOrders.change,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        เวลาเฉลี่ยต่องาน
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.avgCompletionTime} ชม.
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(
                          analyticsData.overview.trends.completionTime.change,
                        )}
                        <span
                          className={getTrendColor(
                            analyticsData.overview.trends.completionTime.change,
                          )}
                        >
                          {Math.abs(
                            analyticsData.overview.trends.completionTime.change,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Uptime เฉลี่ย
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.uptime}%
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(
                          analyticsData.overview.trends.uptime.change,
                        )}
                        <span
                          className={getTrendColor(
                            analyticsData.overview.trends.uptime.change,
                          )}
                        >
                          {Math.abs(
                            analyticsData.overview.trends.uptime.change,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        ประหยัดค่าใช้จ่าย
                      </p>
                      <p className="text-2xl font-bold">
                        ฿
                        {(analyticsData.overview.costSavings / 1000).toFixed(0)}
                        K
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(
                          analyticsData.overview.trends.costs.change,
                        )}
                        <span
                          className={getTrendColor(
                            analyticsData.overview.trends.costs.change,
                          )}
                        >
                          {Math.abs(analyticsData.overview.trends.costs.change)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ประเภทงานบำรุงรักษา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.maintenance).map(
                      ([key, data]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {key === "preventive"
                                ? "เชิงป้องกัน"
                                : key === "corrective"
                                  ? "แก้ไข"
                                  : "ตรวจสอบ"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {data.count} งาน ({data.percentage}%)
                            </span>
                          </div>
                          <Progress value={data.percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              ค่าใช้จ่าย: ฿{(data.cost / 1000).toFixed(0)}K
                            </span>
                            <span>เวลาเฉลี่ย: {data.avgTime} ชม.</span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    ประสิทธิภาพช่าง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.technicians.performance
                      .slice(0, 4)
                      .map((tech) => (
                        <div
                          key={tech.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {tech.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tech.completed} งาน • เวลาเฉลี่ย {tech.avgTime}{" "}
                              ชม.
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              {tech.efficiency}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ประสิทธิภาพ
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    ประสิทธิภาพตามประเภทอุปกรณ์
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.assets.byCategory.map((category) => (
                      <div
                        key={category.name}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge variant="outline">
                            {category.count} เครื่อง
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-success">
                              {category.uptime}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Uptime
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              ฿{(category.costs / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ค่าใช้จ่าย
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-warning">
                              {category.workOrders}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ใบสั่งงาน
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    อุปกรณ์ที่ต้องดูแลมากที่สุด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.assets.topMaintenance.map((asset, index) => (
                      <div key={asset.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <span className="font-medium text-sm">
                                {asset.name}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {asset.id}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="font-bold">{asset.workOrders}</div>
                            <div className="text-muted-foreground">งาน</div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="font-bold">
                              ฿{(asset.cost / 1000).toFixed(0)}K
                            </div>
                            <div className="text-muted-foreground">
                              ค่าใช้จ่าย
                            </div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="font-bold">
                              {asset.downtime} ชม.
                            </div>
                            <div className="text-muted-foreground">
                              Downtime
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    เป้าหมายและผลงาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>งานเสร็จตรงเวลา</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      เป้าหมาย: 95%
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>งานป้องกันต่อแก้ไข</span>
                      <span>71%</span>
                    </div>
                    <Progress value={71} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      เป้าหมาย: 80%
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>อัตราการใช้แผน PM</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      เป้าหมาย: 90%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    เวลาการทำงาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">2.3</div>
                    <div className="text-sm text-muted-foreground">
                      ชั่วโมงเฉลี่ยต่องาน
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold">1.8</div>
                      <div className="text-xs text-muted-foreground">
                        งานป้องกัน
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold">4.2</div>
                      <div className="text-xs text-muted-foreground">
                        งานแก้ไข
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    สถิติรายเดือน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.technicians.workload.map((month) => (
                      <div
                        key={month.month}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                      >
                        <span className="text-sm font-medium">
                          {month.month}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {month.workHours} ชม.
                          </div>
                          <div className="text-xs text-muted-foreground">
                            OT: {month.overtime} ชม.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ค่าใช้จ่ายรายเดือน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.costs.byMonth.slice(-4).map((month) => (
                      <div key={month.month} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{month.month}</span>
                          <span className="text-lg font-bold">
                            ฿{(month.total / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-primary">
                              ฿{(month.labor / 1000).toFixed(0)}K
                            </div>
                            <div className="text-muted-foreground">แรงงาน</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-warning">
                              ฿{(month.parts / 1000).toFixed(0)}K
                            </div>
                            <div className="text-muted-foreground">อะไหล่</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-secondary">
                              ฿{(month.external / 1000).toFixed(0)}K
                            </div>
                            <div className="text-muted-foreground">ภายนอก</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    การแบ่งค่าใช้จ่าย
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analyticsData.costs.breakdown).map(
                    ([key, data]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {key === "labor"
                              ? "ค่าแรงงาน"
                              : key === "parts"
                                ? "ค่าอะไหล่"
                                : "ค่าจ้างภายนอก"}
                          </span>
                          <span className="text-sm">
                            ฿{(data.amount / 1000).toFixed(0)}K (
                            {data.percentage}%)
                          </span>
                        </div>
                        <Progress value={data.percentage} className="h-2" />
                      </div>
                    ),
                  )}
                  <div className="pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ฿
                        {(
                          (analyticsData.costs.breakdown.labor.amount +
                            analyticsData.costs.breakdown.parts.amount +
                            analyticsData.costs.breakdown.external.amount) /
                          1000
                        ).toFixed(0)}
                        K
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ค่าใช้จ่ายรวม
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    ภาพรวมคลังสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ฿{(analyticsData.inventory.value / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">
                        มูลค���าสต็อก
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {analyticsData.inventory.turnover}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        การหมุนเวียน
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <div className="text-lg font-bold text-destructive">
                        {analyticsData.inventory.stockouts}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        รายการขาดสต็อก
                      </div>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <div className="text-lg font-bold text-success">
                        {analyticsData.inventory.utilization}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        อัตราการใช้
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ประเภทอะไหล่
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.inventory.categories.map((category) => (
                      <div
                        key={category.name}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">
                            {category.name}
                          </span>
                          <span className="text-sm font-bold">
                            ฿{(category.value / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="font-bold">{category.turnover}</div>
                            <div className="text-muted-foreground">
                              การห��ุนเวียน
                            </div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="font-bold">{category.items}</div>
                            <div className="text-muted-foreground">รายการ</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    รายงานสำเร็จรูป
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={reportCategory}
                      onValueChange={setReportCategory}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ทั้งหมด">หมวดหมู่ทั้งหมด</SelectItem>
                        <SelectItem value="สรุปผล">สรุปผ��</SelectItem>
                        <SelectItem value="อุปกรณ์">อุปกรณ์</SelectItem>
                        <SelectItem value="ต้นทุน">ต้นทุน</SelectItem>
                        <SelectItem value="บุคลากร">บุคลากร</SelectItem>
                        <SelectItem value="คลังสินค้า">คลังสินค้า</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReports.map((report) => (
                    <Card
                      key={report.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{report.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {report.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {report.category}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>ความถี่: {report.frequency}</span>
                              <span>ล่าสุด: {report.lastGenerated}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                สร้างรายงาน
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
