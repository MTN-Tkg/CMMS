import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Plus,
  Settings,
  MapPin,
  Calendar,
  Wrench,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Download,
  BarChart3,
  Package,
  Cog,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// Mock assets database - ข้อมูลอุปกรณ์ที่ครอบคลุมหลากหลายกรณี
const assetsDatabase = [
  {
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
    warrantyExpiry: "15/03/2569",
    lastMaintenance: "05/01/2567",
    nextMaintenance: "20/01/2567",
    maintenanceInterval: "15 วัน",
    operatingHours: 1250,
    pendingTasks: 2,
    totalWorkOrders: 15,
    uptime: 95.2,
    cost: 2850000,
    depreciation: 15,
    qrCode: "QR-TRACT-001",
    image: "/placeholder.svg",
    specifications: {
      power: "70 แรงม้า",
      fuelType: "ดีเซล",
      weight: "3500 กก.",
      transmission: "เกียร์ออโต้",
    },
    maintenanceHistory: [
      {
        date: "05/01/2567",
        type: "ป้องกัน",
        description: "เปลี่ยนน้ำมันเครื่อง",
        technician: "สมชาย",
      },
      {
        date: "20/12/2566",
        type: "แก้ไข",
        description: "ซ่อมระบบไฮดรอลิก",
        technician: "สมหญิง",
      },
    ],
  },
  {
    id: "TRACT-002",
    tagId: "TAG-TR-002",
    name: "รถแทรกเตอ���์ Massey Ferguson 4707",
    brand: "Massey Ferguson",
    model: "4707",
    serialNumber: "MF-4707-2022015",
    equipmentType: "รถแทรกเตอร์",
    system: "ระบบยานพาหนะ",
    location: "ไร่ B",
    status: "ต้องการบำรุงรักษา",
    condition: "พอใช้",
    purchaseDate: "10/08/2565",
    warrantyExpiry: "10/08/2568",
    lastMaintenance: "01/01/2567",
    nextMaintenance: "เกินกำหนดแล้ว",
    maintenanceInterval: "20 วัน",
    operatingHours: 2100,
    pendingTasks: 3,
    totalWorkOrders: 22,
    uptime: 88.5,
    cost: 3200000,
    depreciation: 22,
    qrCode: "QR-TRACT-002",
    image: "/placeholder.svg",
    specifications: {
      power: "85 แรงม้า",
      fuelType: "ดีเซล",
      weight: "4200 กก.",
      transmission: "เกียร์ธรรมดา",
    },
  },
  {
    id: "PUMP-002",
    tagId: "TAG-PM-002",
    name: "ปั๊มน้ำไฟฟ้า Mitsubishi 5HP",
    brand: "Mitsubishi",
    model: "5HP Electric",
    serialNumber: "MT-5HP-2023008",
    equipmentType: "ปั๊มน้ำ",
    system: "ระบบน้ำ",
    location: "จุด���วบคุมน้ำ B",
    status: "ต้องการบำรุงรักษา",
    condition: "พอใช้",
    purchaseDate: "05/01/2566",
    warrantyExpiry: "05/01/2568",
    lastMaintenance: "20/12/2566",
    nextMaintenance: "15/01/2567",
    maintenanceInterval: "30 วัน",
    operatingHours: 3500,
    pendingTasks: 1,
    totalWorkOrders: 8,
    uptime: 92.1,
    cost: 125000,
    depreciation: 8,
    qrCode: "QR-PUMP-002",
    image: "/placeholder.svg",
    specifications: {
      power: "5 แรงม้า",
      voltage: "220V",
      flow: "150 ลิตร/นาที",
      head: "35 เมตร",
    },
  },
  {
    id: "PUMP-003",
    tagId: "TAG-PM-003",
    name: "ปั๊มน้ำไฟฟ้า Grundfos CR5-8",
    brand: "Grundfos",
    model: "CR5-8",
    serialNumber: "GF-CR58-2023012",
    equipmentType: "ปั๊มน้ำ",
    system: "ระบบน้ำ",
    location: "จุดควบคุมน้ำ A",
    status: "ใช้งานได้",
    condition: "ดีมาก",
    purchaseDate: "20/02/2566",
    warrantyExpiry: "20/02/2568",
    lastMaintenance: "15/01/2567",
    nextMaintenance: "15/02/2567",
    maintenanceInterval: "30 วัน",
    operatingHours: 2800,
    pendingTasks: 0,
    totalWorkOrders: 5,
    uptime: 98.7,
    cost: 185000,
    depreciation: 5,
    qrCode: "QR-PUMP-003",
    image: "/placeholder.svg",
    specifications: {
      power: "3.5 แรงม้า",
      voltage: "380V",
      flow: "200 ลิตร/นาที",
      head: "45 เมตร",
    },
  },
  {
    id: "HARV-003",
    tagId: "TAG-HV-003",
    name: "เครื่องเก็บเกี่ยว John Deere S660",
    brand: "John Deere",
    model: "S660",
    serialNumber: "JD-S660-2021005",
    equipmentType: "เครื่องเก็บเกี่ยว",
    system: "ระบบเก็บเกี่ยว",
    location: "โรงเก็บอุปกรณ์",
    status: "ชำรุด",
    condition: "ต้องซ่อม",
    purchaseDate: "10/05/2564",
    warrantyExpiry: "หมดอายุแล้ว",
    lastMaintenance: "28/12/2566",
    nextMaintenance: "เกินกำหนดแล้ว",
    maintenanceInterval: "10 วัน",
    operatingHours: 4500,
    pendingTasks: 5,
    totalWorkOrders: 35,
    uptime: 65.3,
    cost: 8500000,
    depreciation: 35,
    qrCode: "QR-HARV-003",
    image: "/placeholder.svg",
    specifications: {
      power: "250 แรงม้า",
      fuelType: "ดีเซล",
      cuttingWidth: "6.1 เมตร",
      grainTank: "10,000 ลิตร",
    },
  },
  {
    id: "SPRAY-004",
    tagId: "TAG-SP-004",
    name: "เครื่องพ่นยา Amazone UX 3200",
    brand: "Amazone",
    model: "UX 3200",
    serialNumber: "AZ-UX32-2022020",
    equipmentType: "เครื่องพ่นยา",
    system: "ระบบการเกษตร",
    location: "โรงเก็บอุปกรณ์",
    status: "ใช้งานได้",
    condition: "ดี",
    purchaseDate: "15/11/2565",
    warrantyExpiry: "15/11/2567",
    lastMaintenance: "10/01/2567",
    nextMaintenance: "25/01/2567",
    maintenanceInterval: "21 วัน",
    operatingHours: 850,
    pendingTasks: 1,
    totalWorkOrders: 6,
    uptime: 96.8,
    cost: 1200000,
    depreciation: 12,
    qrCode: "QR-SPRAY-004",
    image: "/placeholder.svg",
    specifications: {
      tankCapacity: "3200 ลิตร",
      sprayWidth: "24 เมตร",
      pumpType: "เซนตริฟิวกัล",
      pressure: "20 บาร์",
    },
  },
];

export function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [locationFilter, setLocationFilter] = useState("ทั้งหมด");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // ระบบกรองและค้นหาที่ครอบคลุม
  const filteredAssets = useMemo(() => {
    return assetsDatabase
      .filter((asset) => {
        const matchesSearch =
          !searchTerm ||
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ทั้งหมด" || asset.status === statusFilter;
        const matchesType =
          typeFilter === "ทั้งหมด" || asset.equipmentType === typeFilter;
        const matchesLocation =
          locationFilter === "ทั้งหมด" || asset.location === locationFilter;

        return matchesSearch && matchesStatus && matchesType && matchesLocation;
      })
      .sort((a, b) => {
        // เรียงตามสถานะ - ชำรุดก่อน, ต้องบำรุง, ใช้งานได้
        const statusOrder = { ชำรุด: 0, ต้องการบำรุงรักษา: 1, ใช้งานได้: 2 };
        return (
          statusOrder[a.status as keyof typeof statusOrder] -
          statusOrder[b.status as keyof typeof statusOrder]
        );
      });
  }, [searchTerm, statusFilter, typeFilter, locationFilter]);

  // สถิติสรุป
  const assetStats = useMemo(() => {
    const total = assetsDatabase.length;
    const working = assetsDatabase.filter(
      (a) => a.status === "ใช้งานได้",
    ).length;
    const needMaintenance = assetsDatabase.filter(
      (a) => a.status === "ต้องการบำรุงรักษา",
    ).length;
    const broken = assetsDatabase.filter((a) => a.status === "ชำรุด").length;
    const totalValue = assetsDatabase.reduce((sum, a) => sum + a.cost, 0);
    const pendingTasks = assetsDatabase.reduce(
      (sum, a) => sum + a.pendingTasks,
      0,
    );

    return {
      total,
      working,
      needMaintenance,
      broken,
      totalValue,
      pendingTasks,
    };
  }, []);

  // ตัวเลือกกรอง
  const equipmentTypes = [
    ...new Set(assetsDatabase.map((a) => a.equipmentType)),
  ];
  const locations = [...new Set(assetsDatabase.map((a) => a.location))];

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
        return "text-success";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return <CheckCircle className="h-4 w-4" />;
      case "ต้องการบำรุงรักษา":
        return <Clock className="h-4 w-4" />;
      case "ชำรุด":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">จัดการอุปกรณ์</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              ติดตามและจัดการอุปกรณ์ทั้งหมดในระบบ
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออกข้อมูล
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มอุปกรณ์
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {assetStats.total}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              อุปกรณ์ทั้งหมด
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-success">
              {assetStats.working}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              ใช้งานได้
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-warning">
              {assetStats.needMaintenance}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              ต้องบำรุง
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-destructive">
              {assetStats.broken}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              ชำรุด
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-warning">
              {assetStats.pendingTasks}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              งานค้าง
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-sm sm:text-base font-bold text-primary">
              ฿{(assetStats.totalValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              มูลค่ารวม
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อ, รหัส, แบรนด์, หมายเลขเครื่อง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-0 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">สถานะทั้งหมด</option>
                <option value="ใช้งานได้">ใช้งานได้</option>
                <option value="ต้องการบำรุงรักษา">ต้องบำรุงรักษา</option>
                <option value="ชำรุด">ชำรุด</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">ประเภททั้งหมด</option>
                {equipmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">สถานที่ทั้งหมด</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              แสดง {filteredAssets.length} จาก {assetStats.total} รายการ
            </p>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                รายการ
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                ตาราง
              </Button>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`card-elevated rounded-xl overflow-hidden ${
                asset.status === "ชำรุด"
                  ? "ring-2 ring-destructive/20"
                  : asset.status === "ต้องการบำรุงรักษา"
                    ? "ring-2 ring-warning/20"
                    : ""
              } ${
                asset.status === "ชำรุด"
                  ? "border-l-4 border-l-destructive"
                  : asset.status === "ต้องการบำรุงรักษา"
                    ? "border-l-4 border-l-warning"
                    : "border-l-4 border-l-success"
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(asset.status)}
                        <h3 className="font-semibold text-sm sm:text-base">
                          {asset.name}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}
                        >
                          {asset.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-mono">{asset.id}</span>
                        <span>
                          {asset.brand} {asset.model}
                        </span>
                        <span className={getConditionColor(asset.condition)}>
                          สภาพ: {asset.condition}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="sm" title="QR Code">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Link to={`/assets/${asset.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          ดู
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground">สถานที่</div>
                      <div className="font-medium">{asset.location}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground">ชั่วโมงทำงาน</div>
                      <div className="font-medium">
                        {asset.operatingHours.toLocaleString()} ชม.
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground">
                        บำรุงรักษาล่าสุด
                      </div>
                      <div className="font-medium">{asset.lastMaintenance}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <div className="text-muted-foreground">
                        บำรุงรักษาครั้งต่อไป
                      </div>
                      <div
                        className={`font-medium ${
                          asset.nextMaintenance === "เกินกำหนดแล้ว"
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {asset.nextMaintenance}
                      </div>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-muted-foreground">Uptime</div>
                      <div
                        className={`font-bold ${
                          asset.uptime >= 95
                            ? "text-success"
                            : asset.uptime >= 85
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {asset.uptime}%
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-muted-foreground">งานค้าง</div>
                      <div
                        className={`font-bold ${asset.pendingTasks > 0 ? "text-warning" : "text-success"}`}
                      >
                        {asset.pendingTasks}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-muted-foreground">
                        ใบสั่งงานทั้งหมด
                      </div>
                      <div className="font-medium">{asset.totalWorkOrders}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-muted-foreground">มูลค่า</div>
                      <div className="font-medium">
                        ฿{(asset.cost / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {(asset.pendingTasks > 0 ||
                    asset.nextMaintenance === "เกินกำหนดแล้ว") && (
                    <div className="flex flex-wrap gap-2">
                      {asset.pendingTasks > 0 && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          มีงานค้างอยู่ {asset.pendingTasks} งาน
                        </div>
                      )}
                      {asset.nextMaintenance === "เกินกำหนดแล้ว" && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded text-xs">
                          <Clock className="h-3 w-3" />
                          เกินกำหนดบำรุงรักษา
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Link to={`/qr-scanner?preselect=${asset.id}`}>
                      <Button variant="outline" size="sm">
                        <Wrench className="h-4 w-4 mr-1" />
                        เริ่มบำรุงรักษา
                      </Button>
                    </Link>
                    <Link to={`/work-orders?asset=${asset.id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        ประวัติงาน
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredAssets.length === 0 && (
          <div className="card-elevated rounded-xl">
            <div className="text-center py-12 px-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">ไม่พบอุปกรณ์</p>
              <p className="text-sm text-muted-foreground">
                ลองปรับเงื่อนไขการค้นหาหรือกรอง
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
