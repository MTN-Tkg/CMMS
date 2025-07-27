import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  MapPin,
  Calendar,
  Settings,
  Flashlight,
  RotateCcw,
  X,
  Search,
  Keyboard,
  History,
  FileSearch,
  Download,
  Printer,
  Share2,
  Plus,
  Eye,
  Edit,
  Copy,
  Package,
  User,
  FileText,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// Mock equipment database
const equipmentDatabase = {
  "TRACT-001": {
    id: "TRACT-001",
    qrCode: "QR-TRACT-001",
    name: "รถแทรกเตอร์ Kubota M7060",
    type: "รถแทรกเตอร์",
    location: "ไร่ A",
    status: "ใช้งานได้",
    brand: "Kubota",
    model: "M7060",
    serialNumber: "KB-M7060-2023001",
    lastMaintenance: "05/01/2567",
    nextMaintenance: "20/01/2567",
    pendingTasks: 2,
    operatingHours: 1250,
    condition: "ดี",
    assignedOperator: "สมชาย ใจดี",
    searchKeywords: ["รถแทรกเตอร์", "kubota", "m7060", "ไร่", "a"],
    pmTemplate: {
      id: "PM-TRACTOR-WEEKLY",
      name: "การบำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
      estimatedTime: "2 ชั่วโมง",
      tasks: [
        "ตรวจสอบระดับน้ำมันเครื่อง",
        "ตรวจสอบระดับน้ำในหม้อน้ำ",
        "ตรวจสอบแรงดันลมยาง",
        "ทำความสะอาดไส้กรองอากาศ",
        "ตรวจสอบการทำงานของไฟส่องสว่าง",
      ],
    },
  },
  "PUMP-003": {
    id: "PUMP-003",
    qrCode: "QR-PUMP-003",
    name: "ปั๊มน้ำไ���ฟ้า Grundfos CR5-8",
    type: "ปั๊มน้ำ",
    location: "จุดควบคุมน้ำ A",
    status: "ใช้งานได้",
    brand: "Grundfos",
    model: "CR5-8",
    serialNumber: "GF-CR58-2023012",
    lastMaintenance: "15/01/2567",
    nextMaintenance: "15/02/2567",
    pendingTasks: 0,
    operatingHours: 2800,
    condition: "ดีมาก",
    assignedOperator: "สมหญิง ใจดี",
    searchKeywords: ["ปั๊มน้ำ", "grundfos", "cr5", "จุดควบคุม"],
    pmTemplate: {
      id: "PM-PUMP-MONTHLY",
      name: "การบำรุงรักษาปั๊มน้ำประจำเดือน",
      estimatedTime: "1.5 ชั่วโมง",
      tasks: [
        "ตรวจสอบการรั่วซึมของน้ำ",
        "ตรวจสอบเสียงการทำงาน",
        "ทำความสะอาดตัวกรอง",
        "ตรวจสอบการสั่นสะเทือน",
        "ตรวจสอบอุณหภูมิมอเตอร์",
      ],
    },
  },
  "HARV-003": {
    id: "HARV-003",
    qrCode: "QR-HARV-003",
    name: "เครื่องเก็���เกี่ยว John Deere S660",
    type: "เครื่องเก็บเกี่ยว",
    location: "โรงเก็บอุปกรณ์",
    status: "ชำรุด",
    brand: "John Deere",
    model: "S660",
    serialNumber: "JD-S660-2021005",
    lastMaintenance: "28/12/2566",
    nextMaintenance: "เกินกำหนดแล้ว",
    pendingTasks: 5,
    operatingHours: 4500,
    condition: "ต้องซ่อม",
    assignedOperator: "สมศักดิ์ ช่างเก่ง",
    searchKeywords: ["เครื่องเก็บเกี่ยว", "john", "deere", "s660", "โรงเก็บ"],
    pmTemplate: {
      id: "PM-HARVESTER-MAJOR",
      name: "การบำรุงรักษาเครื่องเก็บเกี่ยวขั้นสูง",
      estimatedTime: "4 ชั่วโมง",
      tasks: [
        "ตรวจสอบระบบเก็บเกี่ยว",
        "ตรวจสอบและหล่อลื่นจุดสำคัญ",
        "ตรวจสอบเข็มขัดลำเลียง",
        "ทำความสะอาดตัวแยกเมล็ดพืช",
        "ตรวจสอบระบบ���ฮดรอลิก",
      ],
    },
  },
};

// Mock parts database for QR
const partsDatabase = {
  "PT-001": {
    id: "PT-001",
    qrCode: "QR-PT-001",
    partNumber: "OF-4553",
    name: "ไส้กรองน้ำมันเครื่อง",
    category: "ไส้กรอง",
    brand: "Kubota",
    stockQuantity: 25,
    location: "A1-B2-C3",
    unitPrice: 450,
    compatibleAssets: ["TRACT-001", "TRACT-002"],
  },
  "PT-002": {
    id: "PT-002",
    qrCode: "QR-PT-002",
    partNumber: "EO-1540",
    name: "น้ำมันเครื่อง 15W-40",
    category: "น้ำมัน",
    brand: "Shell",
    stockQuantity: 125,
    location: "B2-C1-D4",
    unitPrice: 280,
    compatibleAssets: ["TRACT-001", "TRACT-002", "HARV-003"],
  },
};

export function QRScanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAsset = searchParams.get("preselect");

  const [activeTab, setActiveTab] = useState("scanner");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scannedCode, setScannedCode] = useState(preselectedAsset || "");
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [newQRData, setNewQRData] = useState({
    type: "asset",
    id: "",
    title: "",
    description: "",
  });

  // รวมข้อมูลทั้งหมดสำหรับการค้นหา
  const allItems = useMemo(() => {
    const assets = Object.values(equipmentDatabase).map((item) => ({
      ...item,
      itemType: "asset" as const,
      qrUrl: `/qr-scanner?code=${item.qrCode}`,
    }));
    const parts = Object.values(partsDatabase).map((item) => ({
      ...item,
      itemType: "part" as const,
      qrUrl: `/qr-scanner?code=${item.qrCode}`,
    }));
    return [...assets, ...parts];
  }, []);

  // ค้นหาข้อมูลจาก QR Code
  const searchResult = useMemo(() => {
    if (!scannedCode) return null;

    // ค้นหาจาก QR Code
    let found = Object.values(equipmentDatabase).find(
      (equipment) =>
        equipment.qrCode === scannedCode || equipment.id === scannedCode,
    );

    if (found) {
      return { ...found, type: "asset" };
    }

    // ค้นหาจาก Parts
    found = Object.values(partsDatabase).find(
      (part) => part.qrCode === scannedCode || part.id === scannedCode,
    );

    if (found) {
      return { ...found, type: "part" };
    }

    return null;
  }, [scannedCode]);

  // ฟิลเตอร์รายการตามการค้นหา
  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;

    return allItems.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower) ||
        (item.itemType === "asset" &&
          item.type.toLowerCase().includes(searchLower)) ||
        (item.itemType === "part" &&
          item.category.toLowerCase().includes(searchLower))
      );
    });
  }, [allItems, searchTerm]);

  // จำลองการสแกน QR Code
  const simulateQRScan = (code: string) => {
    setScannedCode(code);
    setIsCameraActive(false);

    // เพิ่มลงประวัติ
    setScanHistory((prev) => {
      const newHistory = [code, ...prev.filter((c) => c !== code)].slice(0, 10);
      return newHistory;
    });

    toast.success("สแกน QR Code เรียบร้อยแ���้ว");
  };

  // สร้าง QR Code ใหม่
  const handleGenerateQR = () => {
    if (!newQRData.id || !newQRData.title) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    toast.success(`สร้าง QR Code สำหรับ ${newQRData.title} เรียบร้อยแล้ว`);
    setGenerateDialogOpen(false);
    setNewQRData({ type: "asset", id: "", title: "", description: "" });
  };

  // การแสดงผลสถานะ
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return "text-success";
      case "ต้องการบำรุงรักษา":
        return "text-warning";
      case "ชำรุด":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "ต้องการบำรุงรักษา":
        return <Clock className="h-4 w-4 text-warning" />;
      case "ชำรุด":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  useEffect(() => {
    if (preselectedAsset) {
      setScannedCode(preselectedAsset);
      setActiveTab("result");
    }
  }, [preselectedAsset]);

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">QR Code Scanner</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              สแกนหรือค้นหาอุปกรณ์และอะไหล่
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={generateDialogOpen}
              onOpenChange={setGenerateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  สร้าง QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้าง QR Code ใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">ประเภท</label>
                    <Select
                      value={newQRData.type}
                      onValueChange={(value) =>
                        setNewQRData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">อุปกรณ์</SelectItem>
                        <SelectItem value="part">อะไหล่</SelectItem>
                        <SelectItem value="location">สถานที่</SelectItem>
                        <SelectItem value="workorder">ใบสั่งงาน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">รหัส/ID</label>
                    <Input
                      value={newQRData.id}
                      onChange={(e) =>
                        setNewQRData((prev) => ({
                          ...prev,
                          id: e.target.value,
                        }))
                      }
                      placeholder="เช่น TRACT-004"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ชื่อ/หัวข้อ</label>
                    <Input
                      value={newQRData.title}
                      onChange={(e) =>
                        setNewQRData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="เช่น รถแทรกเตอร์ใหม่"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">รายละเอียด</label>
                    <Textarea
                      value={newQRData.description}
                      onChange={(e) =>
                        setNewQRData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="รายละเอียดเพิ่มเติม..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleGenerateQR} className="flex-1">
                      สร้าง QR Code
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGenerateDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scanner">สแกน</TabsTrigger>
            <TabsTrigger value="search">ค้นหา</TabsTrigger>
            <TabsTrigger value="result">ผลลัพธ์</TabsTrigger>
            <TabsTrigger value="history">ประวัติ</TabsTrigger>
          </TabsList>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  สแกน QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera View Simulation */}
                <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                          วาง QR Code ในกรอบ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          กดเริ่มสแกนเพื่อเปิดกล้อง
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant={isCameraActive ? "destructive" : "default"}
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className="px-6"
                  >
                    {isCameraActive ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        หยุดสแกน
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        เริ่มสแกน
                      </>
                    )}
                  </Button>
                  {isCameraActive && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsFlashlightOn(!isFlashlightOn)}
                        className={isFlashlightOn ? "bg-yellow-100" : ""}
                      >
                        <Flashlight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Manual Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-sm text-muted-foreground">หรือ</span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      ป้อนรหัส QR Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="เช่น QR-TRACT-001"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (manualCode) {
                            simulateQRScan(manualCode);
                            setManualCode("");
                            setActiveTab("result");
                          }
                        }}
                        disabled={!manualCode}
                      >
                        <Keyboard className="h-4 w-4 mr-2" />
                        ค้นหา
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Scan Buttons */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">สแกนทดสอบ</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(equipmentDatabase)
                      .slice(0, 4)
                      .map((equipment) => (
                        <Button
                          key={equipment.id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            simulateQRScan(equipment.qrCode);
                            setActiveTab("result");
                          }}
                          className="justify-start text-left"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {equipment.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  ค้นหาอุปกรณ์และอะไหล่
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาด้วยชื่อ, รหัส, แบรนด์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => {
                        simulateQRScan(item.qrCode);
                        setActiveTab("result");
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {item.itemType === "asset" ? (
                              <Settings className="h-4 w-4 text-primary" />
                            ) : (
                              <Package className="h-4 w-4 text-warning" />
                            )}
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.itemType === "asset" ? "อุปกรณ์" : "อะไหล่"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.id} • {item.brand} •{" "}
                            {item.itemType === "asset"
                              ? item.location
                              : `สต็อก: ${item.stockQuantity}`}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredItems.length === 0 && searchTerm && (
                    <div className="text-center py-8">
                      <FileSearch className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        ไม่พบผลลัพธ์ที่ตรงกับ "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-4">
            {searchResult ? (
              <>
                {searchResult.type === "asset" ? (
                  // Asset Result
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        ข้อมูลอุปกรณ์
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(searchResult.status)}
                            <h3 className="text-lg font-semibold">
                              {searchResult.name}
                            </h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {searchResult.id} • {searchResult.brand}{" "}
                            {searchResult.model}
                          </div>
                          <div
                            className={`text-sm font-medium ${getStatusColor(searchResult.status)}`}
                          >
                            {searchResult.status}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/assets/${searchResult.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">สถานที่</div>
                          <div className="font-medium">
                            {searchResult.location}
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            ชั่วโมงทำงาน
                          </div>
                          <div className="font-medium">
                            {searchResult.operatingHours.toLocaleString()} ชม.
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            บำรุงรักษาล่าสุด
                          </div>
                          <div className="font-medium">
                            {searchResult.lastMaintenance}
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            บำรุงรักษาครั้งต่อไป
                          </div>
                          <div
                            className={`font-medium ${searchResult.nextMaintenance === "เกินกำหนดแล้ว" ? "text-destructive" : ""}`}
                          >
                            {searchResult.nextMaintenance}
                          </div>
                        </div>
                      </div>

                      {searchResult.pendingTasks > 0 && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <div className="flex items-center gap-2 text-warning">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">
                              มีงานค้างอยู่ {searchResult.pendingTasks} งาน
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Link to={`/work-orders/new?asset=${searchResult.id}`}>
                          <Button className="flex-1 sm:flex-none">
                            <Wrench className="h-4 w-4 mr-2" />
                            เริ่มบำรุงรักษา
                          </Button>
                        </Link>
                        <Link to={`/work-orders?asset=${searchResult.id}`}>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-none"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            ประวัติงาน
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Part Result
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        ข้อมูลอะไหล่
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-semibold">
                            {searchResult.name}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {searchResult.partNumber} • {searchResult.brand}
                          </div>
                          <div className="text-sm font-medium">
                            หมวดหมู่: {searchResult.category}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/parts/${searchResult.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            สต็อกปัจจุบัน
                          </div>
                          <div className="font-medium">
                            {searchResult.stockQuantity} ชิ้น
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">ตำแหน่ง</div>
                          <div className="font-medium">
                            {searchResult.location}
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">ราคา</div>
                          <div className="font-medium">
                            ฿{searchResult.unitPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            อุปกรณ์ที่ใช้ได้
                          </div>
                          <div className="font-medium">
                            {searchResult.compatibleAssets.length} รายการ
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button className="flex-1 sm:flex-none">
                          <Package className="h-4 w-4 mr-2" />
                          เบิกจ่าย
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          ประวัติการใช้
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* QR Code Display */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center p-8 bg-white rounded-lg border">
                      <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs">
                        QR Code
                        <br />
                        {scannedCode}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        ดาวน์โหลด
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        พิมพ์
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        แชร์
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(scannedCode);
                          toast.success("คัดลอกรหัสแล้ว");
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        คัดลอก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="card-elevated">
                <CardContent className="text-center py-12">
                  <QrCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {scannedCode
                      ? `ไม่พบข้อมูลสำหรับรหัส: ${scannedCode}`
                      : "ยังไม่มีการสแกน QR Code"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setActiveTab("scanner")}
                  >
                    เริ่มสแกนใหม่
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  ประวัติการสแกน
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {scanHistory.map((code, index) => {
                      const item =
                        Object.values(equipmentDatabase).find(
                          (eq) => eq.qrCode === code,
                        ) ||
                        Object.values(partsDatabase).find(
                          (part) => part.qrCode === code,
                        );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setScannedCode(code);
                            setActiveTab("result");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {item ? item.name : code}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {code}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      ยังไม่มีประวัติการสแกน
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
