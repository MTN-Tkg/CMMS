import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Truck,
  Eye,
  Edit,
  Download,
  BarChart3,
  DollarSign,
  Archive,
  Star,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// Mock parts database - ข้อมูลอะไหล่ที่ครอบคลุมหลากหลายกรณี
const partsDatabase = [
  {
    id: "PT-001",
    partNumber: "OF-4553",
    name: "ไส้กรองน้ำมันเครื่อง",
    category: "ไส้กรอง",
    subcategory: "ไส้กรองน้ำมัน",
    description: "ไส้กรองน้ำมันเครื่องสำหรับรถแทรกเตอร์ Kubota",
    brand: "Kubota",
    supplier: "บริษัท กูโบต้า จำกัด",
    stockQuantity: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 450,
    currency: "บาท",
    unit: "ชิ้น",
    location: "A1-B2-C3",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "15/12/2566",
    leadTime: 7,
    usageFrequency: "สูง",
    compatibleAssets: ["TRACT-001", "TRACT-002"],
    monthlyUsage: 8,
    totalUsed: 45,
    totalValue: 11250,
    expiryDate: null,
    warranty: "6 เดือน",
    image: "/placeholder.svg",
    tags: ["critical", "consumable", "filter"],
    specifications: {
      dimensions: "10x8x5 ซม.",
      weight: "250 กรัม",
      material: "กระดาษกรอง",
      efficiency: "99.5%",
    },
    usageHistory: [
      {
        date: "10/01/2567",
        quantity: 2,
        workOrder: "WO-2024-001",
        asset: "TRACT-001",
      },
      {
        date: "05/01/2567",
        quantity: 1,
        workOrder: "WO-2024-005",
        asset: "TRACT-002",
      },
    ],
  },
  {
    id: "PT-002",
    partNumber: "EO-1540",
    name: "น้ำมันเครื่อง 15W-40",
    category: "น้ำมัน",
    subcategory: "น้ำมันเครื่อง",
    description: "น้ำมันเครื่องสำหรับเครื่องยนต์ดีเซล",
    brand: "Shell",
    supplier: "บริษัท เชลล์ ไทยแลนด์ จำกัด",
    stockQuantity: 125,
    minStockLevel: 50,
    maxStockLevel: 200,
    unitPrice: 280,
    currency: "บาท",
    unit: "ลิตร",
    location: "B2-C1-D4",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "20/12/2566",
    leadTime: 3,
    usageFrequency: "สูงมาก",
    compatibleAssets: ["TRACT-001", "TRACT-002", "HARV-003"],
    monthlyUsage: 35,
    totalUsed: 180,
    totalValue: 35000,
    expiryDate: "15/12/2567",
    warranty: null,
    image: "/placeholder.svg",
    tags: ["critical", "consumable", "lubricant"],
    specifications: {
      viscosity: "15W-40",
      type: "Mineral",
      capacity: "20 ลิตร/ถัง",
      standard: "API CF-4",
    },
  },
  {
    id: "PT-003",
    partNumber: "HF-2021",
    name: "ไส้กรองไฮดรอลิก",
    category: "ไส้กรอง",
    subcategory: "ไส้กรองไฮดรอลิก",
    description: "ไส้กรองสำหรับระบบไฮดรอลิก",
    brand: "Parker",
    supplier: "บริษัท ปาร์คเกอร์ จำกัด",
    stockQuantity: 8,
    minStockLevel: 15,
    maxStockLevel: 30,
    unitPrice: 850,
    currency: "บาท",
    unit: "ชิ้น",
    location: "A3-B1-C2",
    status: "สต็อกต่ำ",
    condition: "ใหม่",
    lastOrderDate: "05/12/2566",
    leadTime: 14,
    usageFrequency: "ปานกลาง",
    compatibleAssets: ["TRACT-001", "HARV-003"],
    monthlyUsage: 3,
    totalUsed: 12,
    totalValue: 6800,
    expiryDate: null,
    warranty: "12 เดือน",
    image: "/placeholder.svg",
    tags: ["critical", "hydraulic", "filter"],
    specifications: {
      filtration: "10 micron",
      flow: "200 LPM",
      pressure: "350 bar",
      material: "Synthetic media",
    },
  },
  {
    id: "PT-004",
    partNumber: "BP-7832",
    name: "เข็มขัดลำเลียง",
    category: "อะไหล่เครื่องจักร",
    subcategory: "เข็มขัด",
    description: "เข็มขัดลำเลียงสำหรับเครื่องเก็บเกี่ยว",
    brand: "Gates",
    supplier: "บริษัท เกทส์ ไทยแลนด์ จำกัด",
    stockQuantity: 0,
    minStockLevel: 5,
    maxStockLevel: 15,
    unitPrice: 2500,
    currency: "บาท",
    unit: "เส้น",
    location: "C1-D2-E1",
    status: "หมดสต็อก",
    condition: "ใหม่",
    lastOrderDate: "28/11/2566",
    leadTime: 21,
    usageFrequency: "ต่ำ",
    compatibleAssets: ["HARV-003"],
    monthlyUsage: 1,
    totalUsed: 3,
    totalValue: 0,
    expiryDate: null,
    warranty: "24 เดือน",
    image: "/placeholder.svg",
    tags: ["mechanical", "belt", "harvester"],
    specifications: {
      length: "2.5 เมตร",
      width: "15 ซม.",
      material: "ยางสังเคราะห์",
      strength: "500 N/mm",
    },
  },
  {
    id: "PT-005",
    partNumber: "SP-1001",
    name: "หัวพ่นยา",
    category: "อะไหล่เครื่องพ่น",
    subcategory: "หัวพ่น",
    description: "หัวพ่นยาแบบ Fan Spray",
    brand: "TeeJet",
    supplier: "บริษัท ทีเจ็ท ไทยแลนด์ จำกัด",
    stockQuantity: 45,
    minStockLevel: 20,
    maxStockLevel: 60,
    unitPrice: 120,
    currency: "บาท",
    unit: "ชิ้น",
    location: "D1-E2-F3",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "10/01/2567",
    leadTime: 5,
    usageFrequency: "ปานกลาง",
    compatibleAssets: ["SPRAY-004"],
    monthlyUsage: 5,
    totalUsed: 25,
    totalValue: 5400,
    expiryDate: null,
    warranty: "6 เดือน",
    image: "/placeholder.svg",
    tags: ["sprayer", "nozzle", "consumable"],
    specifications: {
      sprayAngle: "110°",
      orificeSize: "02",
      pressure: "3-6 bar",
      flowRate: "0.95 L/min",
    },
  },
  {
    id: "PT-006",
    partNumber: "WP-5005",
    name: "ใบพัดปั๊มน้ำ",
    category: "อะไหล่ปั๊ม",
    subcategory: "ใบพัด",
    description: "ใบพัดสำหรับปั๊มน้ำไฟฟ้า",
    brand: "Grundfos",
    supplier: "บริษัท กรุนด์ฟอส จำก���ด",
    stockQuantity: 12,
    minStockLevel: 8,
    maxStockLevel: 20,
    unitPrice: 1800,
    currency: "บาท",
    unit: "ชิ้น",
    location: "E1-F2-G1",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "02/01/2567",
    leadTime: 10,
    usageFrequency: "ต่ำ",
    compatibleAssets: ["PUMP-003"],
    monthlyUsage: 1,
    totalUsed: 4,
    totalValue: 21600,
    expiryDate: null,
    warranty: "18 เดือน",
    image: "/placeholder.svg",
    tags: ["pump", "impeller", "mechanical"],
    specifications: {
      diameter: "150 mm",
      material: "สแตนเลส 316",
      stages: "1",
      efficiency: "85%",
    },
  },
  {
    id: "PT-007",
    partNumber: "SL-8080",
    name: "ซีลกันน้ำมัน",
    category: "ซีลและปะเก็น",
    subcategory: "ซีลน้ำมัน",
    description: "ซีลกันน้ำมันสำหรับเพลาขับ",
    brand: "SKF",
    supplier: "บริษัท เอสเคเอฟ ไทยแลนด์ จำกัด",
    stockQuantity: 35,
    minStockLevel: 25,
    maxStockLevel: 50,
    unitPrice: 180,
    currency: "บาท",
    unit: "ชิ้น",
    location: "F1-G2-H1",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "18/12/2566",
    leadTime: 7,
    usageFrequency: "ปานกลาง",
    compatibleAssets: ["TRACT-001", "TRACT-002", "PUMP-002", "PUMP-003"],
    monthlyUsage: 6,
    totalUsed: 28,
    totalValue: 6300,
    expiryDate: null,
    warranty: "12 เดือน",
    image: "/placeholder.svg",
    tags: ["seal", "shaft", "mechanical"],
    specifications: {
      innerDiameter: "25 mm",
      outerDiameter: "40 mm",
      width: "7 mm",
      material: "NBR",
    },
  },
  {
    id: "PT-008",
    partNumber: "BR-4040",
    name: "ผ้าเบรก",
    category: "อะไหล่เบรก",
    subcategory: "ผ้าเบรก",
    description: "ผ้าเบรกสำหรับรถแทรกเตอร์",
    brand: "Ferodo",
    supplier: "บริษัท เฟอโรโด้ ไทยแลนด์ จำกัด",
    stockQuantity: 6,
    minStockLevel: 12,
    maxStockLevel: 24,
    unitPrice: 650,
    currency: "บาท",
    unit: "ชุด",
    location: "G1-H2-I1",
    status: "สต็อกต่ำ",
    condition: "ใหม่",
    lastOrderDate: "25/11/2566",
    leadTime: 14,
    usageFrequency: "ต่ำ",
    compatibleAssets: ["TRACT-001", "TRACT-002"],
    monthlyUsage: 2,
    totalUsed: 8,
    totalValue: 3900,
    expiryDate: null,
    warranty: "24 เดือน",
    image: "/placeholder.svg",
    tags: ["brake", "safety", "mechanical"],
    specifications: {
      friction: "Semi-metallic",
      temperature: "400°C max",
      thickness: "15 mm",
      area: "120 cm²",
    },
  },
];

export function Parts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [supplierFilter, setSupplierFilter] = useState("ทั้งหมด");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // ระบบกรองและค้นหาที่ครอบคลุม
  const filteredParts = useMemo(() => {
    return partsDatabase
      .filter((part) => {
        const matchesSearch =
          !searchTerm ||
          part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ทั้งหมด" || part.status === statusFilter;
        const matchesCategory =
          categoryFilter === "ทั้งหมด" || part.category === categoryFilter;
        const matchesSupplier =
          supplierFilter === "ทั้งหมด" || part.supplier === supplierFilter;

        return (
          matchesSearch && matchesStatus && matchesCategory && matchesSupplier
        );
      })
      .sort((a, b) => {
        // เรียงตามสถานะ - หมดสต็อกก่อน, สต็อกต่ำ, มีสต็อก
        const statusOrder = { หมดสต็อก: 0, สต็อกต่ำ: 1, มีสต็อก: 2 };
        return (
          statusOrder[a.status as keyof typeof statusOrder] -
          statusOrder[b.status as keyof typeof statusOrder]
        );
      });
  }, [searchTerm, statusFilter, categoryFilter, supplierFilter]);

  // สถิติสรุป
  const partsStats = useMemo(() => {
    const total = partsDatabase.length;
    const inStock = partsDatabase.filter((p) => p.status === "มีสต็อก").length;
    const lowStock = partsDatabase.filter(
      (p) => p.status === "สต็อกต่ำ",
    ).length;
    const outOfStock = partsDatabase.filter(
      (p) => p.status === "หมดสต็อก",
    ).length;
    const totalValue = partsDatabase.reduce((sum, p) => sum + p.totalValue, 0);
    const criticalParts = partsDatabase.filter((p) =>
      p.tags.includes("critical"),
    ).length;

    return { total, inStock, lowStock, outOfStock, totalValue, criticalParts };
  }, []);

  // ตัวเลือกกรอง
  const categories = [...new Set(partsDatabase.map((p) => p.category))];
  const suppliers = [...new Set(partsDatabase.map((p) => p.supplier))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "มีสต็อก":
        return "bg-success text-success-foreground";
      case "สต็อกต่ำ":
        return "bg-warning text-warning-foreground";
      case "หมดสต็อก":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "มีสต็อก":
        return <CheckCircle className="h-4 w-4" />;
      case "สต็อกต่ำ":
        return <AlertTriangle className="h-4 w-4" />;
      case "หมดสต็อก":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStockLevel = (part: any) => {
    const percentage = (part.stockQuantity / part.maxStockLevel) * 100;
    return {
      percentage,
      color:
        percentage <= 30
          ? "bg-destructive"
          : percentage <= 50
            ? "bg-warning"
            : "bg-success",
    };
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">คลังอะไหล่</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการสต็อกอะไหล่และติดตามการใช้งาน
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออกข้อมูล
            </Button>
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              สั��งซื้อ
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มอะ��หล่
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {partsStats.total}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              รายการทั้งหมด
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-success">
              {partsStats.inStock}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              มีสต็อก
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-warning">
              {partsStats.lowStock}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              สต็อกต่ำ
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-destructive">
              {partsStats.outOfStock}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              หมดสต็อก
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg sm:text-xl font-bold text-warning">
              {partsStats.criticalParts}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              อะไหล่สำคัญ
            </div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-sm sm:text-base font-bold text-primary">
              ฿{(partsStats.totalValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              มูลค่าสต็อก
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อ, รหัสชิ้นส่วน, แบรนด์, หมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-0 shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">สถานะทั้งหมด</option>
                <option value="มีสต็อก">มีสต็อก</option>
                <option value="สต็อกต่ำ">สต็อกต่ำ</option>
                <option value="หมดสต็อก">หมดสต็อก</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm min-w-32"
              >
                <option value="ทั้งหมด">ผู้จำหน่ายทั้งหมด</option>
                {suppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier.split(" ")[1]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              แสดง {filteredParts.length} จาก {partsStats.total} รายการ
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

        {/* Critical Parts Alert */}
        {partsStats.lowStock + partsStats.outOfStock > 0 && (
          <div className="card-elevated rounded-xl p-4 bg-gradient-to-r from-warning/10 to-destructive/10 border-l-4 border-l-warning">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">แจ้งเตือนสต็อก</h3>
                <p className="text-sm text-muted-foreground">
                  มีอะไหล่ {partsStats.lowStock} รายการที่สต็อกต่ำ และ{" "}
                  {partsStats.outOfStock} รายการที่หมดสต็อก
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                ดูรายการ
              </Button>
            </div>
          </div>
        )}

        {/* Parts List */}
        <div className="space-y-3">
          {filteredParts.map((part) => {
            const stockLevel = getStockLevel(part);
            return (
              <div
                key={part.id}
                className={`card-elevated rounded-xl overflow-hidden ${
                  part.status === "หมดสต็อก"
                    ? "ring-2 ring-destructive/20"
                    : part.status === "สต็อกต่ำ"
                      ? "ring-2 ring-warning/20"
                      : ""
                } ${
                  part.status === "หมดสต็อก"
                    ? "border-l-4 border-l-destructive"
                    : part.status === "สต็อกต่ำ"
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
                          {getStatusIcon(part.status)}
                          <h3 className="font-semibold text-sm sm:text-base">
                            {part.name}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(part.status)}`}
                          >
                            {part.status}
                          </div>
                          {part.tags.includes("critical") && (
                            <Badge variant="destructive" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              สำคัญ
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="font-mono">{part.partNumber}</span>
                          <span>{part.brand}</span>
                          <span>{part.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link to={`/parts/${part.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            ดู
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          สต็อกปัจจุบัน: {part.stockQuantity} {part.unit}
                        </span>
                        <span className="text-muted-foreground">
                          {stockLevel.percentage.toFixed(0)}% ของสต็อกสูงสุด
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${stockLevel.color}`}
                          style={{ width: `${stockLevel.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>ต่ำสุด: {part.minStockLevel}</span>
                        <span>สูงสุด: {part.maxStockLevel}</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">ราคา/หน่วย</div>
                        <div className="font-medium">
                          ฿{part.unitPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">มูลค่าสต็อก</div>
                        <div className="font-medium">
                          ฿{part.totalValue.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">
                          ใช้งาน/เดือน
                        </div>
                        <div className="font-medium">
                          {part.monthlyUsage} {part.unit}
                        </div>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">Lead Time</div>
                        <div className="font-medium">{part.leadTime} วัน</div>
                      </div>
                    </div>

                    {/* Location and Supplier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">
                          ตำแหน่งในคลัง
                        </div>
                        <div className="font-medium">{part.location}</div>
                      </div>
                      <div className="p-2 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground">ผู้จำหน่าย</div>
                        <div className="font-medium">
                          {part.supplier.split(" ")[1]}
                        </div>
                      </div>
                    </div>

                    {/* Compatible Assets */}
                    {part.compatibleAssets.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          อุปกรณ์ที่ใช้ได้:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {part.compatibleAssets.map((asset, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {asset}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    <div className="flex flex-wrap gap-2">
                      {part.status === "หมดสต็อก" && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded text-xs">
                          <TrendingDown className="h-3 w-3" />
                          หมดสต็อก - ต้องสั่งซื้อด่วน
                        </div>
                      )}
                      {part.status === "สต็อกต่ำ" && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          สต็อกต่ำ - ควรสั่งซื้อเพิ่ม
                        </div>
                      )}
                      {part.expiryDate && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs">
                          <Clock className="h-3 w-3" />
                          หมดอายุ: {part.expiryDate}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        สั่งซื้อ
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        ประวัติการใช้
                      </Button>
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        ติดตามการจัดส่ง
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-1" />
                        เบิกจ่าย
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredParts.length === 0 && (
          <div className="card-elevated rounded-xl">
            <div className="text-center py-12 px-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">ไม่พบอะไหล่</p>
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
