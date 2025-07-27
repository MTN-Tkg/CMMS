import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Star,
  Edit,
  Download,
  Camera,
  Archive,
  Truck,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Clock,
  Plus,
  Minus,
  Eye,
  History,
  Settings,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

// Mock part database
const partDetailData = {
  "PT-001": {
    id: "PT-001",
    partNumber: "OF-4553",
    name: "ไส้กรองน้ำมันเครื่อง",
    category: "ไส้กรอง",
    subcategory: "ไส้กรองน้ำมัน",
    description:
      "ไส้กรองน้ำมันเครื่องสำหรับรถแทรกเตอร์ Kubota คุณภาพสูง ใช้วัสดุกรองขั้นสูง ป้องกันสิ่งสกปรกเข้าสู่เครื่องยนต์",
    brand: "Kubota",
    supplier: "บริษัท กูโบต้า จำกัด",
    supplierContact: "02-123-4567",
    stockQuantity: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    reorderPoint: 15,
    unitPrice: 450,
    averageCost: 425,
    lastPurchasePrice: 445,
    currency: "บาท",
    unit: "ชิ้น",
    location: "A1-B2-C3",
    binLocation: "ชั้น 2, ช่อง 15",
    status: "มีสต็อก",
    condition: "ใหม่",
    lastOrderDate: "15/12/2566",
    lastReceiveDate: "20/12/2566",
    leadTime: 7,
    usageFrequency: "สูง",
    compatibleAssets: [
      { id: "TRACT-001", name: "รถแทรกเตอร์ Kubota M7060" },
      { id: "TRACT-002", name: "รถแทรกเตอร์ Massey Ferguson 4707" },
    ],
    monthlyUsage: 8,
    totalUsed: 45,
    totalValue: 11250,
    expiryDate: null,
    warranty: "6 เดือน",
    manufactureDate: "01/10/2566",
    image: "/placeholder.svg",
    tags: ["critical", "consumable", "filter"],
    specifications: {
      dimensions: "10x8x5 ซม.",
      weight: "250 กรัม",
      material: "กระดาษกรอง",
      efficiency: "99.5%",
      filterType: "Full Flow",
      micronRating: "20 micron",
      maxPressure: "150 PSI",
      temperature: "-20°C ถึง 120°C",
    },
    usageHistory: [
      {
        id: "UH-001",
        date: "10/01/2567",
        quantity: 2,
        workOrder: "WO-2024-001",
        asset: "TRACT-001",
        technician: "สมชาย รักงาน",
        purpose: "บำรุงรักษาประจำ",
        cost: 900,
      },
      {
        id: "UH-002",
        date: "05/01/2567",
        quantity: 1,
        workOrder: "WO-2024-005",
        asset: "TRACT-002",
        technician: "สมหญิง ใจดี",
        purpose: "เปลี่ยนตามกำหนด",
        cost: 450,
      },
      {
        id: "UH-003",
        date: "28/12/2566",
        quantity: 3,
        workOrder: "WO-2023-089",
        asset: "TRACT-001",
        technician: "สมศักดิ์ ช่างเก่ง",
        purpose: "ซ่อมเครื่องยนต์",
        cost: 1350,
      },
    ],
    purchaseHistory: [
      {
        id: "PO-001",
        date: "15/12/2566",
        quantity: 20,
        unitPrice: 445,
        totalCost: 8900,
        supplier: "บริษัท กูโบต้า จำกัด",
        orderNumber: "PO-2023-156",
        receiveDate: "20/12/2566",
        status: "รับของแล้ว",
      },
      {
        id: "PO-002",
        date: "01/11/2566",
        quantity: 15,
        unitPrice: 440,
        totalCost: 6600,
        supplier: "บริษัท กูโบต้า จำกัด",
        orderNumber: "PO-2023-134",
        receiveDate: "05/11/2566",
        status: "รับของแล้ว",
      },
    ],
    stockMovements: [
      {
        id: "SM-001",
        date: "20/12/2566",
        type: "รับเข้า",
        quantity: 20,
        reference: "PO-2023-156",
        balance: 45,
        reason: "ซื้อเพิ่มสต็อก",
      },
      {
        id: "SM-002",
        date: "10/01/2567",
        type: "เบิกจ่าย",
        quantity: -2,
        reference: "WO-2024-001",
        balance: 25,
        reason: "ใช้งานบำรุงรักษา",
      },
    ],
    predictiveAnalytics: {
      forecastUsage: 9,
      recommendedOrder: 12,
      stockoutRisk: "ต่ำ",
      optimalOrderQuantity: 25,
      nextOrderDate: "25/01/2567",
    },
    documents: [
      {
        name: "คู่มือการติดตั้ง",
        type: "PDF",
        size: "1.2 MB",
        uploadDate: "15/12/2566",
      },
      {
        name: "ใบรับประกั��",
        type: "PDF",
        size: "0.8 MB",
        uploadDate: "20/12/2566",
      },
    ],
  },
};

export function PartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    reason: "",
  });
  const [orderQuantity, setOrderQuantity] = useState(0);

  const part = partDetailData[id as keyof typeof partDetailData];

  if (!part) {
    return (
      <div className="min-h-screen">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">ไม่พบข้อมูลอะไหล่</h1>
          <p className="text-muted-foreground mt-2">อะไหล่ {id} ไม่มีในระบบ</p>
          <Link to="/parts">
            <Button className="mt-4">กลับสู่คลังอะไหล่</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const getStockLevel = () => {
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

  const handleStockAdjustment = () => {
    if (!stockAdjustment.quantity || !stockAdjustment.reason) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    toast.success(
      `ปรับสต็อก ${stockAdjustment.quantity > 0 ? "เพิ่ม" : "ลด"} ${Math.abs(stockAdjustment.quantity)} ชิ้น เรียบร้อยแล้ว`,
    );
    setAdjustStockOpen(false);
    setStockAdjustment({ quantity: 0, reason: "" });
  };

  const handleCreateOrder = () => {
    if (!orderQuantity || orderQuantity <= 0) {
      toast.error("กรุณากรอกจำนวนที่ต้องการสั���งซื้อ");
      return;
    }
    toast.success(`สร้างใบสั่งซื้อ ${orderQuantity} ชิ้น เรียบร้อยแล้ว`);
    setOrderDialogOpen(false);
    setOrderQuantity(0);
  };

  const stockLevel = getStockLevel();

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/parts")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">{part.name}</h1>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(part.status)}`}
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{part.partNumber}</span>
              <span>{part.brand}</span>
              <span>{part.category}</span>
              <span>
                สต็อก: {part.stockQuantity} {part.unit}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  ปรับสต็อก
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ปรับปรุงสต็อก</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">จำนวน (+ เพิ่ม, - ลด)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={stockAdjustment.quantity}
                      onChange={(e) =>
                        setStockAdjustment((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="เช่น +10 หรือ -5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">เหตุผล</Label>
                    <Input
                      id="reason"
                      value={stockAdjustment.reason}
                      onChange={(e) =>
                        setStockAdjustment((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="ระบุเหตุผลในการปรับสต็อก"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleStockAdjustment} className="flex-1">
                      บันทึก
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAdjustStockOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  สั่งซื้อ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สั่งซื้ออะไหล่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orderQty">จำนวนที่สั่งซื้อ</Label>
                    <Input
                      id="orderQty"
                      type="number"
                      value={orderQuantity}
                      onChange={(e) =>
                        setOrderQuantity(parseInt(e.target.value) || 0)
                      }
                      placeholder="จำนวนที่ต้องการสั่งซื้อ"
                    />
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        ราคาต่อหน่วย: ฿{part.unitPrice.toLocaleString()}
                      </div>
                      <div>ผู้จำหน่าย: {part.supplier.split(" ")[1]}</div>
                      <div>Lead Time: {part.leadTime} วัน</div>
                      <div>
                        ราคารวม: ฿
                        {(orderQuantity * part.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCreateOrder} className="flex-1">
                      สร้างใบสั่งซื้อ
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOrderDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </div>
        </div>

        {/* Stock Level Card */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ระดับสต็อกปัจจุบัน</span>
                <span className="text-lg font-bold">
                  {part.stockQuantity} / {part.maxStockLevel} {part.unit}
                </span>
              </div>
              <Progress value={stockLevel.percentage} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-muted-foreground">ต่ำสุด</div>
                  <div className="font-medium">{part.minStockLevel}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">จุดสั่งซื้อ</div>
                  <div className="font-medium">{part.reorderPoint}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">สูงสุด</div>
                  <div className="font-medium">{part.maxStockLevel}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="usage">การใช้งาน</TabsTrigger>
            <TabsTrigger value="purchase">การซื้อ</TabsTrigger>
            <TabsTrigger value="analytics">วิเคราะห์</TabsTrigger>
            <TabsTrigger value="specifications">ข้อมูลเทคนิค</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    ข้อมูลพื้นฐาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div>{part.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">หมวดหมู่:</span>
                      <div className="font-medium">{part.category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        หมวดหมู่ย่อย:
                      </span>
                      <div className="font-medium">{part.subcategory}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานะ:</span>
                      <div className="font-medium">{part.condition}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        ความถี่การใช้:
                      </span>
                      <div className="font-medium">{part.usageFrequency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Supplier */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    ตำแหน่งและผู้จำหน่าย
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        ตำแหน่งในคลัง:
                      </span>
                      <div className="font-medium">{part.location}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Bin Location:
                      </span>
                      <div className="font-medium">{part.binLocation}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ผู้จำหน่าย:</span>
                      <div className="font-medium">
                        {part.supplier.split(" ")[1]}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        เบอร์ติดต่อ:
                      </span>
                      <div className="font-medium">{part.supplierContact}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lead Time:</span>
                      <div className="font-medium">{part.leadTime} วัน</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ประกัน:</span>
                      <div className="font-medium">{part.warranty}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ข้อมูลราคา
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        ราคาปัจจุบัน:
                      </span>
                      <div className="font-medium">
                        ฿{part.unitPrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ราคาเฉลี่ย:</span>
                      <div className="font-medium">
                        ฿{part.averageCost.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        ราคาซื้อล่าสุด:
                      </span>
                      <div className="font-medium">
                        ฿{part.lastPurchasePrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        มูลค่าสต็อก:
                      </span>
                      <div className="font-medium">
                        ฿{part.totalValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compatible Assets */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    อุปกรณ์ที่ใช้ได้
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {part.compatibleAssets.map((asset) => (
                      <Link key={asset.id} to={`/assets/${asset.id}`}>
                        <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.id}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  ประวัติการใช้งาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {part.usageHistory.map((usage) => (
                    <div key={usage.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{usage.purpose}</h4>
                          <p className="text-sm text-muted-foreground">
                            งาน: {usage.workOrder} • อุปกรณ์: {usage.asset}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {usage.quantity} {part.unit}
                          </div>
                          <div className="text-muted-foreground">
                            {usage.date}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">ช่าง:</span>
                          <span className="ml-2 font-medium">
                            {usage.technician}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            ค่าใช้จ่าย:
                          </span>
                          <span className="ml-2 font-medium">
                            ฿{usage.cost.toLocaleString()}
                          </span>
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
                  <Archive className="h-5 w-5" />
                  การเคลื่อนไหวสต็อก
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {part.stockMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${movement.type === "รับเข้า" ? "bg-success/10" : "bg-destructive/10"}`}
                        >
                          {movement.type === "รับเข���า" ? (
                            <Plus className="h-4 w-4 text-success" />
                          ) : (
                            <Minus className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{movement.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {movement.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity} {part.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          คงเหลือ: {movement.balance} {part.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  ประวัติการซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {part.purchaseHistory.map((purchase) => (
                    <div key={purchase.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">
                            ใบสั่งซื้อ {purchase.orderNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {purchase.supplier.split(" ")[1]}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-success">
                          {purchase.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            วันที่สั่ง:
                          </span>
                          <div className="font-medium">{purchase.date}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            วันที่รับ:
                          </span>
                          <div className="font-medium">
                            {purchase.receiveDate}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">จำนวน:</span>
                          <div className="font-medium">
                            {purchase.quantity} {part.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            ราคารวม:
                          </span>
                          <div className="font-medium">
                            ฿{purchase.totalCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    สถิติการใช้งาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {part.monthlyUsage}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ใช้ต่อเดือน
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {part.totalUsed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ใช้ทั้งหมด
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    การวิเคราะห์แนวโน้ม
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        คาดการณ์การใช้:
                      </span>
                      <div className="font-medium">
                        {part.predictiveAnalytics.forecastUsage} {part.unit}
                        /เด���อน
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        แนะนำสั่งซื้อ:
                      </span>
                      <div className="font-medium">
                        {part.predictiveAnalytics.recommendedOrder} {part.unit}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        ความเสี่ยงขาดสต็อก:
                      </span>
                      <div className="font-medium">
                        {part.predictiveAnalytics.stockoutRisk}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        วันที่ควรสั่งซื้อ:
                      </span>
                      <div className="font-medium">
                        {part.predictiveAnalytics.nextOrderDate}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ข้อมูลเทคนิค
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(part.specifications).map(([key, value]) => (
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
                  {part.documents.map((doc, index) => (
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
        </Tabs>
      </div>
    </div>
  );
}
