import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  Database,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Archive,
  ArchiveRestore,
  Filter,
  Search,
  Play,
  Pause,
  History,
  Settings,
  FileJson,
  FileImage,
  MoreVertical,
  Trash2,
  Eye,
  Copy,
  Share,
  Save,
  Package,
  Users,
  ClipboardList,
  MapPin,
  BarChart3,
  Shield,
  Key,
  Globe,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for exports/imports
const exportTemplates = [
  {
    id: "wo-template",
    name: "ใบสั่งงานทั้งหมด",
    description: "ส่งออกข้อมูลใบสั่งงานพร้อมรายละเอียด",
    category: "work-orders",
    fields: [
      "id",
      "title",
      "description",
      "status",
      "priority",
      "assignee",
      "createdDate",
      "dueDate",
    ],
    formats: ["csv", "excel", "json"],
    estimatedSize: "2.5 MB",
    recordCount: 1250,
  },
  {
    id: "asset-template",
    name: "รายการอุปกร���์",
    description: "ส่งออกข้อมูลอุปกรณ์และประวัติการบำรุงรักษา",
    category: "assets",
    fields: [
      "id",
      "name",
      "category",
      "location",
      "status",
      "purchaseDate",
      "warranty",
    ],
    formats: ["csv", "excel", "pdf"],
    estimatedSize: "1.8 MB",
    recordCount: 145,
  },
  {
    id: "parts-template",
    name: "คลังอะไหล่",
    description: "ส่งออกข้อมูลอะไหล่และการเคลื่อนไหวสต็อก",
    category: "parts",
    fields: [
      "id",
      "name",
      "category",
      "quantity",
      "unitPrice",
      "supplier",
      "location",
    ],
    formats: ["csv", "excel", "json"],
    estimatedSize: "956 KB",
    recordCount: 890,
  },
  {
    id: "maintenance-template",
    name: "ประวัติการบำรุงรักษา",
    description: "ส่งออกประวัติการบำรุงรักษาและตารางงาน",
    category: "maintenance",
    fields: [
      "id",
      "assetId",
      "type",
      "description",
      "completedDate",
      "technician",
      "cost",
    ],
    formats: ["csv", "excel", "pdf"],
    estimatedSize: "3.2 MB",
    recordCount: 2150,
  },
  {
    id: "users-template",
    name: "ผู้ใช้งานระบบ",
    description: "ส่งออกข้อมูลผู้ใช้งานและสิทธิ์",
    category: "users",
    fields: [
      "id",
      "username",
      "fullName",
      "email",
      "role",
      "department",
      "status",
    ],
    formats: ["csv", "excel"],
    estimatedSize: "124 KB",
    recordCount: 25,
  },
  {
    id: "reports-template",
    name: "รายงานและสถิติ",
    description: "ส่งออกรายงานการวิเคราะห์และ KPI",
    category: "reports",
    fields: ["reportType", "generatedDate", "data", "summary"],
    formats: ["pdf", "excel", "json"],
    estimatedSize: "4.1 MB",
    recordCount: 98,
  },
];

const exportHistory = [
  {
    id: "exp-001",
    templateName: "ใบสั่งงานทั้งหมด",
    format: "excel",
    status: "completed",
    createdDate: "2024-01-15 14:30",
    fileSize: "2.4 MB",
    recordCount: 1245,
    downloadUrl: "/downloads/work-orders-20240115.xlsx",
    expiresAt: "2024-01-22",
  },
  {
    id: "exp-002",
    templateName: "รายการอุปกรณ์",
    format: "pdf",
    status: "completed",
    createdDate: "2024-01-14 09:15",
    fileSize: "1.7 MB",
    recordCount: 145,
    downloadUrl: "/downloads/assets-20240114.pdf",
    expiresAt: "2024-01-21",
  },
  {
    id: "exp-003",
    templateName: "คลังอะไหล่",
    format: "csv",
    status: "processing",
    createdDate: "2024-01-15 16:45",
    fileSize: "-",
    recordCount: 890,
    progress: 75,
  },
  {
    id: "exp-004",
    templateName: "รายงานและสถิติ",
    format: "json",
    status: "failed",
    createdDate: "2024-01-15 11:20",
    fileSize: "-",
    recordCount: 0,
    error: "ไม่สามารถเข้าถึงฐานข้อมูลได้",
  },
];

const importHistory = [
  {
    id: "imp-001",
    fileName: "new-assets.xlsx",
    type: "assets",
    status: "completed",
    uploadedDate: "2024-01-15 13:20",
    fileSize: "345 KB",
    recordsProcessed: 25,
    recordsSuccess: 23,
    recordsFailed: 2,
    validationErrors: [
      { row: 3, field: "purchaseDate", message: "รูปแบบวันที่ไม่ถูกต้อง" },
      { row: 7, field: "category", message: "ประเภทอุปกรณ์ไม่มีในระบบ" },
    ],
  },
  {
    id: "imp-002",
    fileName: "parts-inventory.csv",
    type: "parts",
    status: "processing",
    uploadedDate: "2024-01-15 16:30",
    fileSize: "1.2 MB",
    recordsProcessed: 450,
    recordsSuccess: 425,
    recordsFailed: 25,
    progress: 85,
  },
  {
    id: "imp-003",
    fileName: "users-data.xlsx",
    type: "users",
    status: "failed",
    uploadedDate: "2024-01-15 10:15",
    fileSize: "89 KB",
    recordsProcessed: 0,
    recordsSuccess: 0,
    recordsFailed: 0,
    error: "ไฟล์เสียหายหรือรูปแบบไม่ถูกต้อง",
  },
];

const backupHistory = [
  {
    id: "backup-001",
    name: "ข้อมูลระบบทั้งหมด",
    type: "full",
    createdDate: "2024-01-15 02:00",
    fileSize: "125 MB",
    status: "completed",
    retention: "30 วัน",
    downloadUrl: "/backups/full-backup-20240115.zip",
  },
  {
    id: "backup-002",
    name: "ข้อมูลใบสั่งงาน",
    type: "partial",
    createdDate: "2024-01-14 14:30",
    fileSize: "15 MB",
    status: "completed",
    retention: "7 วัน",
    downloadUrl: "/backups/workorders-20240114.zip",
  },
  {
    id: "backup-003",
    name: "การส��รองข้อมูลอัตโนมัติ",
    type: "auto",
    createdDate: "2024-01-15 02:00",
    fileSize: "89 MB",
    status: "processing",
    retention: "30 วัน",
    progress: 45,
  },
];

const scheduledExports = [
  {
    id: "sched-001",
    name: "รายงานรายสัปดาห์",
    template: "รายงานและส��ิติ",
    schedule: "ทุกวันจันทร์ 09:00",
    format: "pdf",
    recipients: ["manager@company.com", "admin@company.com"],
    status: "active",
    lastRun: "2024-01-15 09:00",
    nextRun: "2024-01-22 09:00",
  },
  {
    id: "sched-002",
    name: "สต็อกคลังสินค้ารายเดือน",
    template: "คลังอะไหล่",
    schedule: "วันที่ 1 ของทุกเดือน 08:00",
    format: "excel",
    recipients: ["inventory@company.com"],
    status: "active",
    lastRun: "2024-01-01 08:00",
    nextRun: "2024-02-01 08:00",
  },
];

export function DataTransfer() {
  const [activeTab, setActiveTab] = useState("export");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [exportFormat, setExportFormat] = useState("excel");
  const [dateRange, setDateRange] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState("assets");
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    validateOnly: false,
    updateExisting: false,
    createBackup: true,
  });

  const filteredHistory = useMemo(() => {
    let history: any[] = [];

    if (activeTab === "export") {
      history = exportHistory;
    } else if (activeTab === "import") {
      history = importHistory;
    } else if (activeTab === "backup") {
      history = backupHistory;
    }

    return history.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, searchTerm, statusFilter]);

  const handleExport = async () => {
    if (!selectedTemplate) {
      toast.error("กรุณาเลือกเทมเพลตการส่งออก");
      return;
    }

    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success("ส่งออกข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("กรุณาเลือกไฟล์ที่ต้องการนำเข้า");
      return;
    }

    setIsImporting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      toast.success("นำเข้าข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setIsImporting(false);
      setUploadProgress(0);
    }
  };

  const handleBackup = async (type: "full" | "partial") => {
    toast.info("เริ่มการสำรองข้อมูล...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("สำรองข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสำรองข้อมูล");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success text-success-foreground">สำเร็จ</Badge>
        );
      case "processing":
        return (
          <Badge className="bg-warning text-warning-foreground">
            กำลังดำเนินการ
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      case "active":
        return (
          <Badge className="bg-primary text-primary-foreground">ใช้งาน</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case "csv":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "json":
        return <FileJson className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work-orders":
        return <ClipboardList className="h-4 w-4" />;
      case "assets":
        return <Package className="h-4 w-4" />;
      case "parts":
        return <Settings className="h-4 w-4" />;
      case "maintenance":
        return <Settings className="h-4 w-4" />;
      case "users":
        return <Users className="h-4 w-4" />;
      case "reports":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">การจัดการข้อมูล</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              ส่งออก นำเข้า และสำรองข้อมูลระบบ CMMS
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleBackup("partial")}>
              <Archive className="h-4 w-4 mr-2" />
              สำรองข้อมูล
            </Button>
            <Button onClick={() => handleBackup("full")}>
              <Database className="h-4 w-4 mr-2" />
              สำรองทั้งหมด
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="export">ส่งออกข้อมูล</TabsTrigger>
            <TabsTrigger value="import">นำเข้าข้อมูล</TabsTrigger>
            <TabsTrigger value="backup">สำรอง���้อมูล</TabsTrigger>
            <TabsTrigger value="scheduled">กำหนดการ</TabsTrigger>
            <TabsTrigger value="templates">เทมเพลต</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      ส่งออกข้อมูล
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template">เลือกเทมเพลต</Label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกเทมเพลตการส่งออก" />
                        </SelectTrigger>
                        <SelectContent>
                          {exportTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(template.category)}
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="format">รูปแบบไฟล์</Label>
                        <Select
                          value={exportFormat}
                          onValueChange={setExportFormat}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                            <SelectItem value="csv">CSV (.csv)</SelectItem>
                            <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            <SelectItem value="json">JSON (.json)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dateRange">ช่วงข้อมูล</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ข้อมูลทั้งหมด</SelectItem>
                            <SelectItem value="30days">
                              30 วั��ล่าสุด
                            </SelectItem>
                            <SelectItem value="90days">90 วันล่าสุด</SelectItem>
                            <SelectItem value="1year">1 ปีล่าสุด</SelectItem>
                            <SelectItem value="custom">กำหนดเอง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedTemplate && (
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">ข้อมูลที่จะส่งออก:</h4>
                            <div className="text-sm text-muted-foreground">
                              {
                                exportTemplates.find(
                                  (t) => t.id === selectedTemplate,
                                )?.description
                              }
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span>
                                ประมาณ{" "}
                                {
                                  exportTemplates.find(
                                    (t) => t.id === selectedTemplate,
                                  )?.recordCount
                                }{" "}
                                รายการ
                              </span>
                              <span>
                                ขนาดไฟล์{" "}
                                {
                                  exportTemplates.find(
                                    (t) => t.id === selectedTemplate,
                                  )?.estimatedSize
                                }
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={handleExport}
                      disabled={!selectedTemplate || isExporting}
                      className="w-full"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          กำลังส่งออก...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          ส่งออกข้อมูล
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      ประวัติการส่งออก
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exportHistory.slice(0, 5).map((export_) => (
                        <div key={export_.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(export_.format)}
                              <span className="text-sm font-medium">
                                {export_.templateName}
                              </span>
                            </div>
                            {getStatusBadge(export_.status)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {export_.createdDate}
                          </div>
                          {export_.status === "processing" &&
                            export_.progress && (
                              <div className="mt-2">
                                <Progress
                                  value={export_.progress}
                                  className="h-1"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {export_.progress}%
                                </div>
                              </div>
                            )}
                          {export_.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              ดาวน์โหลด
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      นำเข้าข้อมูล
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="importType">ประเภทข้อมูล</Label>
                      <Select value={importType} onValueChange={setImportType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assets">อุปกรณ์</SelectItem>
                          <SelectItem value="parts">อะไหล่</SelectItem>
                          <SelectItem value="work-orders">ใบสั่งงาน</SelectItem>
                          <SelectItem value="users">ผู้ใช้งาน</SelectItem>
                          <SelectItem value="maintenance">
                            การบำรุงรักษา
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="file">เลื��กไฟล์</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) =>
                          setImportFile(e.target.files?.[0] || null)
                        }
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        รองรับไฟล์ .xlsx, .xls, .csv (ขนาดสูงสุด 10MB)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">ตัวเลือกการนำเข้า</h4>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="skipDuplicates"
                          checked={importOptions.skipDuplicates}
                          onCheckedChange={(checked) =>
                            setImportOptions({
                              ...importOptions,
                              skipDuplicates: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="skipDuplicates">ข้ามข้อมูลที่ซ้ำ</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="updateExisting"
                          checked={importOptions.updateExisting}
                          onCheckedChange={(checked) =>
                            setImportOptions({
                              ...importOptions,
                              updateExisting: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="updateExisting">
                          อัปเด��ข้อมูลที่มีอยู่
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="validateOnly"
                          checked={importOptions.validateOnly}
                          onCheckedChange={(checked) =>
                            setImportOptions({
                              ...importOptions,
                              validateOnly: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="validateOnly">
                          ตรวจสอบข้อมูลเท่านั้น (ไม่นำเข้า)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="createBackup"
                          checked={importOptions.createBackup}
                          onCheckedChange={(checked) =>
                            setImportOptions({
                              ...importOptions,
                              createBackup: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="createBackup">
                          สำรองข้อมูลก่อนนำเข้า
                        </Label>
                      </div>
                    </div>

                    {importFile && (
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">ไฟล์ที่เลือก:</h4>
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4" />
                              <span className="text-sm">{importFile.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ขนาด: {(importFile.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {isImporting && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          กำลังนำเข้าข้อมูล... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleImport}
                      disabled={!importFile || isImporting}
                      className="w-full"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          กำลังนำเข้า...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          นำเข้าข้อมูล
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      ประวัติการนำเข้า
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {importHistory.slice(0, 5).map((import_) => (
                        <div key={import_.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {import_.fileName}
                            </span>
                            {getStatusBadge(import_.status)}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {import_.uploadedDate}
                          </div>
                          {import_.status === "processing" &&
                            import_.progress && (
                              <div className="mb-2">
                                <Progress
                                  value={import_.progress}
                                  className="h-1"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {import_.progress}%
                                </div>
                              </div>
                            )}
                          {import_.status === "completed" && (
                            <div className="text-xs space-y-1">
                              <div className="text-success">
                                สำเร็จ: {import_.recordsSuccess} รายการ
                              </div>
                              {import_.recordsFailed > 0 && (
                                <div className="text-destructive">
                                  ล้มเหลว: {import_.recordsFailed} รายการ
                                </div>
                              )}
                            </div>
                          )}
                          {import_.error && (
                            <div className="text-xs text-destructive">
                              {import_.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    การสำรองข้อมูล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleBackup("full")}
                      className="h-20 flex-col"
                    >
                      <Database className="h-6 w-6 mb-2" />
                      สำรองทั้งหมด
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBackup("partial")}
                      className="h-20 flex-col"
                    >
                      <Package className="h-6 w-6 mb-2" />
                      สำรองบางส่วน
                    </Button>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium">ข้อมูลที่จะสำรอง:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup-wo" defaultChecked />
                        <Label htmlFor="backup-wo">ใบสั่งงาน</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup-assets" defaultChecked />
                        <Label htmlFor="backup-assets">อุปกรณ์</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup-parts" defaultChecked />
                        <Label htmlFor="backup-parts">อะไหล่</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="backup-users" />
                        <Label htmlFor="backup-users">ผู้ใช้งาน</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    ประวัติการสำรอง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backupHistory.map((backup) => (
                      <div key={backup.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {backup.name}
                          </span>
                          {getStatusBadge(backup.status)}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{backup.createdDate}</div>
                          <div>ขนาด: {backup.fileSize}</div>
                          <div>เก็บไว้: {backup.retention}</div>
                        </div>
                        {backup.status === "processing" && backup.progress && (
                          <div className="mt-2">
                            <Progress value={backup.progress} className="h-1" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {backup.progress}%
                            </div>
                          </div>
                        )}
                        {backup.status === "completed" && (
                          <div className="flex gap-1 mt-2">
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              ดาวน์โหลด
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ArchiveRestore className="h-3 w-3 mr-1" />
                              คืนค่า
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    การส่งออกตามกำหนดการ
                  </CardTitle>
                  <Button>
                    <Clock className="h-4 w-4 mr-2" />
                    สร้างกำหนดการใหม่
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledExports.map((scheduled) => (
                    <div key={scheduled.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{scheduled.name}</h4>
                            {getStatusBadge(scheduled.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            เทมเพลต: {scheduled.template}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            กำหนดการ: {scheduled.schedule}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              ส่งถึง:{" "}
                            </span>
                            {scheduled.recipients.join(", ")}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>ล่าสุด: {scheduled.lastRun}</span>
                            <span>ครั้งต่อไป: {scheduled.nextRun}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    เทมเพลตการส่งออก
                  </CardTitle>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    สร้างเทมเพลตใหม่
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exportTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(template.category)}
                              <span className="font-medium">
                                {template.name}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{template.recordCount} รายการ</span>
                              <span>{template.estimatedSize}</span>
                            </div>

                            <div className="flex gap-1">
                              {template.formats.map((format) => (
                                <Badge
                                  key={format}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {format.toUpperCase()}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-1 pt-2">
                              <Button size="sm" className="flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                ใช้งาน
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="h-3 w-3" />
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
