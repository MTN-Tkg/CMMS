import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  FileText,
  QrCode,
  Edit,
  Download,
  Camera,
  Activity,
  DollarSign,
  Timer,
  Package,
  User,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock asset database - รวมกับข้อมูลประวัติการบำรุงรักษา
const assetDetailData = {
  "TRACT-001": {
    id: "TRACT-001",
    tagId: "TAG-TR-001",
    name: "รถแทรกเตอร์ Kubota M7060",
    brand: "Kubota",
    model: "M7060",
    serialNumber: "KB-M7060-2023001",
    equipmentType: "รถแทรกเตอร์",
    system: "ระบบยานพาหนะ",
    location: "ไร่ A",
    status: "ใช้งานได้",
    condition: "ดี",
    purchaseDate: "15/03/2566",
    purchasePrice: 2850000,
    warrantyExpiry: "15/03/2569",
    lastMaintenance: "05/01/2567",
    nextMaintenance: "20/01/2567",
    maintenanceInterval: "15 วัน",
    operatingHours: 1250,
    pendingTasks: 2,
    totalWorkOrders: 15,
    uptime: 95.2,
    depreciation: 15,
    currentValue: 2422500,
    qrCode: "QR-TRACT-001",
    image: "/placeholder.svg",
    assignedOperator: "สมชาย ใจดี",
    department: "แผนกเกษตร",
    criticality: "สูง",
    specifications: {
      power: "70 แรงม้า",
      fuelType: "ดีเซล",
      weight: "3500 กก.",
      transmission: "เกียร์ออโต้",
      maxSpeed: "40 กม./ชม.",
      fuelCapacity: "120 ลิตร",
      hydraulicCapacity: "45 ลิตร",
    },
    maintenanceHistory: [
      {
        id: "WO-2024-001",
        date: "05/01/2567",
        type: "ป้องกัน",
        title: "เปลี่ยนน้ำมันเครื่อง",
        description: "เปลี่ยนน้ำมันเครื่องและไส้กรองตามกำหนด",
        technician: "สมชาย รักงาน",
        duration: "3 ชั่วโมง",
        cost: 3500,
        status: "เสร็จสิ้น",
        parts: ["น้ำมันเครื่อง 15W-40", "ไส้กรองน้ำมัน"],
      },
      {
        id: "WO-2023-045",
        date: "20/12/2566",
        type: "แก้ไข",
        title: "ซ่อมระบบไฮดรอลิก",
        description: "แก้ไขปัญหาน้ำมันไฮดรอลิกรั่ว",
        technician: "สมหญิง ใจดี",
        duration: "6 ชั่วโมง",
        cost: 8500,
        status: "เสร็จสิ้น",
        parts: ["ซีลไฮดรอลิก", "น้ำมันไฮดรอลิก"],
      },
      {
        id: "WO-2023-038",
        date: "05/12/2566",
        type: "ตรวจสอบ",
        title: "ตรวจสอบประจำเดือน",
        description: "ตรวจสอบสภาพทั่วไปประจำเดือน",
        technician: "สมศักดิ์ ช่างเก่ง",
        duration: "2 ชั่วโมง",
        cost: 1200,
        status: "เสร็จสิ้น",
        parts: [],
      },
    ],
    upcomingMaintenance: [
      {
        type: "ป้องกัน",
        title: "เปลี่ยนไส้กรองอากาศ",
        dueDate: "20/01/2567",
        priority: "ปานกลาง",
        estimatedDuration: "1 ชั่วโมง",
        estimatedCost: 1500,
      },
      {
        type: "ตรวจสอบ",
        title: "ตรวจสอบระบบเบรก",
        dueDate: "25/01/2567",
        priority: "สูง",
        estimatedDuration: "2 ชั่วโมง",
        estimatedCost: 2000,
      },
    ],
    performanceMetrics: {
      efficiency: 94,
      fuelConsumption: 8.5, // ลิตร/ชั่วโมง
      maintenanceCost: 25000, // ต่อปี
      downtime: 4.8, // เปอร์เซ็นต์
      utilizationRate: 85, // เปอร์เซ็นต์
    },
    monthlyStats: [
      { month: "ก.ค.", hours: 185, cost: 2500, downtime: 2 },
      { month: "ส.ค.", hours: 190, cost: 1800, downtime: 1 },
      { month: "ก.ย.", hours: 175, cost: 3200, downtime: 3 },
      { month: "ต.ค.", hours: 200, cost: 1500, downtime: 2 },
      { month: "พ.ย.", hours: 180, cost: 4500, downtime: 5 },
      { month: "ธ.ค.", hours: 195, cost: 8500, downtime: 8 },
    ],
    documents: [
      {
        name: "คู่มือการใช้งาน",
        type: "PDF",
        size: "2.5 MB",
        uploadDate: "15/03/2566",
      },
      {
        name: "ใบรับประกัน",
        type: "PDF",
        size: "1.2 MB",
        uploadDate: "15/03/2566",
      },
      {
        name: "รูปถ่ายป���ะจำเดือน",
        type: "Image",
        size: "3.8 MB",
        uploadDate: "05/01/2567",
      },
    ],
  },
};

export function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const asset = assetDetailData[id as keyof typeof assetDetailData];

  if (!asset) {
    return (
      <div className="min-h-screen">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">ไม่พบข้อมูลอุปกรณ์</h1>
          <p className="text-muted-foreground mt-2">อุปกรณ์ {id} ไม่มีในระบบ</p>
          <Link to="/assets">
            <Button className="mt-4">กลับสู่รายการอุปกรณ์</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return "bg-success text-success-foreground";
      case "ต้องการบำรุงรักษา":
        return "bg-warning text-warning-foreground";
      case "ชำรุด":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "ดีมาก":
      case "ดี":
        return "text-success";
      case "พอใช้":
        return "text-warning";
      case "ต้องซ่อม":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case "ป้องกัน":
        return "bg-primary/10 text-primary border-primary/20";
      case "แก้ไข":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "ตรวจสอบ":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/assets")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">{asset.name}</h1>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}
              >
                {asset.status}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{asset.id}</span>
              <span>{asset.tagId}</span>
              <span>
                {asset.brand} {asset.model}
              </span>
              <span className={getConditionColor(asset.condition)}>
                สภาพ: {asset.condition}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
            <Button size="sm" className="bg-primary">
              <Wrench className="h-4 w-4 mr-2" />
              เริ่มบำรุงรักษา
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-primary">
              {asset.operatingHours.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">ชั่วโมงทำงาน</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-success">
              {asset.uptime}%
            </div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-warning">
              {asset.pendingTasks}
            </div>
            <div className="text-xs text-muted-foreground">งานค้าง</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-primary">
              {asset.totalWorkOrders}
            </div>
            <div className="text-xs text-muted-foreground">ใบสั่งงาน</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-sm font-bold text-success">
              ฿{(asset.currentValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-muted-foreground">มูลค่าปัจจุบัน</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-primary">
              {asset.performanceMetrics.efficiency}%
            </div>
            <div className="text-xs text-muted-foreground">ประสิทธิภาพ</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="maintenance">บำรุงรักษา</TabsTrigger>
            <TabsTrigger value="performance">ประสิทธิภาพ</TabsTrigger>
            <TabsTrigger value="documents">เอกสาร</TabsTrigger>
            <TabsTrigger value="specifications">ข้อมูลเทคนิค</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    ข้อมูลพื้นฐาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        ประเภทอุปกรณ์:
                      </span>
                      <div className="font-medium">{asset.equipmentType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ระบบ:</span>
                      <div className="font-medium">{asset.system}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานที่:</span>
                      <div className="font-medium">{asset.location}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ผู้ใช้งาน:</span>
                      <div className="font-medium">
                        {asset.assignedOperator}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">แผนก:</span>
                      <div className="font-medium">{asset.department}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ความสำคัญ:</span>
                      <div className="font-medium">{asset.criticality}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ข้อมูลทางการเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">ราคาซื้อ:</span>
                      <div className="font-medium">
                        ฿{asset.purchasePrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        มูลค่าปัจจุบัน:
                      </span>
                      <div className="font-medium">
                        ฿{asset.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        การคิดค่าเสื่อม:
                      </span>
                      <div className="font-medium">{asset.depreciation}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">วันที่ซื้อ:</span>
                      <div className="font-medium">{asset.purchaseDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        ประกันหมดอายุ:
                      </span>
                      <div className="font-medium">{asset.warrantyExpiry}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        ค่าบำรุง/ปี:
                      </span>
                      <div className="font-medium">
                        ฿
                        {asset.performanceMetrics.maintenanceCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Maintenance */}
              <Card className="card-elevated lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    งานบำรุงรักษาที่กำลังจะมาถึง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {asset.upcomingMaintenance.map((maintenance, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{maintenance.title}</h4>
                          <Badge
                            variant={
                              maintenance.priority === "สูง"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {maintenance.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                          <div>กำหนดเสร็จ: {maintenance.dueDate}</div>
                          <div>ประเภท: {maintenance.type}</div>
                          <div>ประมาณเวลา: {maintenance.estimatedDuration}</div>
                          <div>
                            ประมาณค่าใช้จ่าย: ฿
                            {maintenance.estimatedCost.toLocaleString()}
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
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  ประวัติการบำรุงรักษา
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {asset.maintenanceHistory.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{record.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {record.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex px-2 py-1 rounded text-xs border ${getMaintenanceTypeColor(record.type)}`}
                          >
                            {record.type}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {record.date}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">ช่าง:</span>
                          <div className="font-medium">{record.technician}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            ระยะเวลา:
                          </span>
                          <div className="font-medium">{record.duration}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            ค่าใช้จ่าย:
                          </span>
                          <div className="font-medium">
                            ฿{record.cost.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">สถานะ:</span>
                          <div className="font-medium text-success">
                            {record.status}
                          </div>
                        </div>
                      </div>
                      {record.parts.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">
                            อะไหล่ที่ใช้:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.parts.map((part, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ตัวชี้วัดประสิทธิภาพ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">ประสิทธิภาพ</span>
                        <span className="text-sm font-medium">
                          {asset.performanceMetrics.efficiency}%
                        </span>
                      </div>
                      <Progress
                        value={asset.performanceMetrics.efficiency}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">อัตราการใช้งาน</span>
                        <span className="text-sm font-medium">
                          {asset.performanceMetrics.utilizationRate}%
                        </span>
                      </div>
                      <Progress
                        value={asset.performanceMetrics.utilizationRate}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium">
                          {asset.uptime}%
                        </span>
                      </div>
                      <Progress value={asset.uptime} className="h-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        การใช้เชื้อเพลิง
                      </div>
                      <div className="text-lg font-bold">
                        {asset.performanceMetrics.fuelConsumption}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ลิตร/ชม.
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Downtime
                      </div>
                      <div className="text-lg font-bold text-warning">
                        {asset.performanceMetrics.downtime}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        เฉลี่ย
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
                    {asset.monthlyStats.slice(-3).map((stat, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{stat.month}</span>
                          <span className="text-sm text-muted-foreground">
                            {stat.hours} ชม.
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              ค่าใช้จ่าย:
                            </span>
                            <div className="font-medium">
                              ฿{stat.cost.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Downtime:
                            </span>
                            <div className="font-medium">{stat.downtime}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    เอกสารและไฟล์แนบ
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มเอกสาร
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {asset.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • อัปโหลดเมื่อ{" "}
                            {doc.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  ข้อมูลเทคนิค
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(asset.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
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
