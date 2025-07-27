import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Package,
  Wrench,
  DollarSign,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  Mail,
  Smartphone,
  MessageSquare,
  Volume2,
  VolumeX,
  User,
  Target,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// Mock notifications data
const notificationsData = [
  {
    id: "NOTIF-001",
    title: "อุปกรณ์เกินกำหนดบำรุงรักษา",
    message: "เครื่องเก็บเกี่ยว John Deere S660 เกินกำหนดบำรุงรักษาแล้ว 5 วัน",
    type: "warning",
    category: "maintenance",
    priority: "สูง",
    timestamp: "2024-01-15 14:30",
    isRead: false,
    isStarred: true,
    relatedId: "HARV-003",
    relatedType: "asset",
    actions: [
      { label: "สร้างใบสั่งงาน", action: "create_wo" },
      { label: "ดูรายละเอียด", action: "view_asset" },
    ],
  },
  {
    id: "NOTIF-002",
    title: "สต็อกอะไหล่ต่ำ",
    message: "ไส้กรองไฮดรอลิก (HF-2021) เหลือ 8 ชิ้น ต่ำกว่าจุดสั่งซื้อ",
    type: "alert",
    category: "inventory",
    priority: "ปานกลาง",
    timestamp: "2024-01-15 12:15",
    isRead: false,
    isStarred: false,
    relatedId: "PT-003",
    relatedType: "part",
    actions: [
      { label: "สั่งซื้อ", action: "order_part" },
      { label: "ดูสต็อก", action: "view_inventory" },
    ],
  },
  {
    id: "NOTIF-003",
    title: "งานเสร็จสิ้น",
    message: "สมชาย รักงาน เสร็จสิ้นงาน: บำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
    type: "success",
    category: "workorder",
    priority: "ต่ำ",
    timestamp: "2024-01-15 10:45",
    isRead: true,
    isStarred: false,
    relatedId: "WO-2024-001",
    relatedType: "workorder",
    actions: [{ label: "ดูรายงาน", action: "view_report" }],
  },
  {
    id: "NOTIF-004",
    title: "งบประมาณเกินกำหนด",
    message: "ค่าใช้จ่ายบำรุงรักษาเดือนนี้เกิน 15% จากงบประมาณที่กำหนด",
    type: "error",
    category: "budget",
    priority: "สูง",
    timestamp: "2024-01-15 09:20",
    isRead: false,
    isStarred: true,
    relatedId: "BUDGET-2024-01",
    relatedType: "budget",
    actions: [{ label: "ดูรายงาน", action: "view_budget" }],
  },
  {
    id: "NOTIF-005",
    title: "ตารางงานใหม่",
    message: "มีตารางบำรุงรักษาใหม่ถูกสร้างสำหรับปั๊มน้ำไฟฟ้า Grundfos CR5-8",
    type: "info",
    category: "schedule",
    priority: "ต่ำ",
    timestamp: "2024-01-15 08:00",
    isRead: true,
    isStarred: false,
    relatedId: "SCH-002",
    relatedType: "schedule",
    actions: [{ label: "ดูตาราง", action: "view_schedule" }],
  },
  {
    id: "NOTIF-006",
    title: "ช่างเข้าเวรเพิ่ม",
    message:
      "สมศักดิ์ ช่างเก่ง ต้องทำโอเวอร์ไทม์ 3 ชั่วโมง เนื่องจากงานเร่งด่วน",
    type: "warning",
    category: "technician",
    priority: "ปานกลาง",
    timestamp: "2024-01-14 16:30",
    isRead: true,
    isStarred: false,
    relatedId: "TECH-003",
    relatedType: "technician",
    actions: [{ label: "ดูรายละเอียด", action: "view_technician" }],
  },
];

// Notification settings
const notificationSettings = {
  email: {
    enabled: true,
    maintenanceOverdue: true,
    lowStock: true,
    workOrderComplete: false,
    budgetAlert: true,
    scheduleChange: false,
  },
  push: {
    enabled: true,
    maintenanceOverdue: true,
    lowStock: true,
    workOrderComplete: true,
    budgetAlert: true,
    scheduleChange: true,
  },
  sms: {
    enabled: false,
    maintenanceOverdue: true,
    lowStock: false,
    workOrderComplete: false,
    budgetAlert: true,
    scheduleChange: false,
  },
  inApp: {
    enabled: true,
    sound: true,
    desktop: true,
    frequency: "immediate",
    quietHours: { start: "22:00", end: "07:00" },
  },
};

export function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("ทั้งหมด");
  const [filterPriority, setFilterPriority] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [settings, setSettings] = useState(notificationSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notificationsData;

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (activeTab === "starred") {
      filtered = filtered.filter((n) => n.isStarred);
    }

    // Filter by type
    if (filterType !== "ทั้งหมด") {
      const typeMap: Record<string, string> = {
        แจ้งเตือน: "warning",
        ข้อผิดพลาด: "error",
        สำเร็จ: "success",
        ข้อมูล: "info",
        เตือนภัย: "alert",
      };
      filtered = filtered.filter((n) => n.type === typeMap[filterType]);
    }

    // Filter by priority
    if (filterPriority !== "ทั้งหมด") {
      filtered = filtered.filter((n) => n.priority === filterPriority);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [activeTab, filterType, filterPriority, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = notificationsData.length;
    const unread = notificationsData.filter((n) => !n.isRead).length;
    const starred = notificationsData.filter((n) => n.isStarred).length;
    const critical = notificationsData.filter(
      (n) => n.priority === "สูง" && !n.isRead,
    ).length;

    return { total, unread, starred, critical };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "error":
        return <X className="h-4 w-4 text-destructive" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "alert":
        return <Bell className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "workorder":
        return <CheckCircle className="h-4 w-4" />;
      case "budget":
        return <DollarSign className="h-4 w-4" />;
      case "schedule":
        return <Calendar className="h-4 w-4" />;
      case "technician":
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-l-warning bg-warning/5";
      case "error":
        return "border-l-destructive bg-destructive/5";
      case "success":
        return "border-l-success bg-success/5";
      case "alert":
        return "border-l-destructive bg-destructive/5";
      default:
        return "border-l-primary bg-primary/5";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "สูง":
        return "bg-destructive/10 text-destructive";
      case "ปานกลาง":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const markAsRead = (notificationId: string) => {
    toast.success("ทำเครื่องหมายเป็นอ่านแล้ว");
  };

  const markAsStarred = (notificationId: string) => {
    toast.success("เพิ่มดาวแล้ว");
  };

  const markAllAsRead = () => {
    toast.success("ทำเครื่องหมายทั้งหมดเป็นอ่านแล้ว");
  };

  const deleteNotification = (notificationId: string) => {
    toast.success("ลบการแจ้งเตือนแล้ว");
  };

  const handleAction = (notificationId: string, action: string) => {
    switch (action) {
      case "create_wo":
        toast.success("กำลังสร้างใบสั่งงาน...");
        break;
      case "order_part":
        toast.success("กำลังสั่งซื้ออะไหล่...");
        break;
      case "view_report":
        toast.success("เปิดรายงาน...");
        break;
      default:
        toast.info("ดำเนินการ...");
    }
  };

  const updateSettings = (
    category: string,
    setting: string,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
    toast.success("บันทึกการตั้งค่าแล้ว");
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">การแจ้งเตือน</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการและติดตามการแจ้งเตือนทั้งหมด
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  ตั้งค่า
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ตั้งค่าการแจ้งเตือน</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="channels" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="channels">ช่องทาง</TabsTrigger>
                    <TabsTrigger value="preferences">ความต้องการ</TabsTrigger>
                  </TabsList>
                  <TabsContent value="channels" className="space-y-4">
                    <div className="space-y-4">
                      {/* Email Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Mail className="h-4 w-4" />
                            อีเมล
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>เปิดใช้งานอีเมล</Label>
                            <Switch checked={settings.email.enabled} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(settings.email)
                              .filter(([key]) => key !== "enabled")
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between"
                                >
                                  <Label className="text-sm">{key}</Label>
                                  <Switch checked={value} />
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Push Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4" />
                            Push Notification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>เปิดใช้งาน Push</Label>
                            <Switch checked={settings.push.enabled} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(settings.push)
                              .filter(([key]) => key !== "enabled")
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between"
                                >
                                  <Label className="text-sm">{key}</Label>
                                  <Switch checked={value} />
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="preferences" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Bell className="h-4 w-4" />
                          ความต้องการทั่วไป
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>เสียงแจ้งเตือน</Label>
                          <Switch checked={settings.inApp.sound} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>แจ้งเตือนบนเดสก์ท็อป</Label>
                          <Switch checked={settings.inApp.desktop} />
                        </div>
                        <div className="space-y-2">
                          <Label>ความถี่การแจ้งเตือน</Label>
                          <Select value={settings.inApp.frequency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">ทันที</SelectItem>
                              <SelectItem value="hourly">ทุกชั่วโมง</SelectItem>
                              <SelectItem value="daily">ทุกวัน</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>เริ่มเวลาเงียบ</Label>
                            <Input
                              type="time"
                              value={settings.inApp.quietHours.start}
                            />
                          </div>
                          <div>
                            <Label>สิ้นสุดเวลาเงียบ</Label>
                            <Input
                              type="time"
                              value={settings.inApp.quietHours.end}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              อ่านทั้งหมด
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="metric-card">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">ทั้งหมด</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-warning">
                {stats.unread}
              </div>
              <div className="text-xs text-muted-foreground">ยังไม่อ่าน</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-success">
                {stats.starred}
              </div>
              <div className="text-xs text-muted-foreground">ติดดาว</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-destructive">
                {stats.critical}
              </div>
              <div className="text-xs text-muted-foreground">เร่งด่วน</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="unread">ยังไม่อ่าน</TabsTrigger>
            <TabsTrigger value="starred">ติดดาว</TabsTrigger>
            <TabsTrigger value="archive">เก็บถาวร</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="ค้นหาการแจ้งเตือน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ทั้งหมด">ประเภททั้งหมด</SelectItem>
                      <SelectItem value="แจ้งเตือน">แจ้งเตือน</SelectItem>
                      <SelectItem value="ข้อผิดพลาด">ข้อผิดพลาด</SelectItem>
                      <SelectItem value="สำเร็จ">สำเร็จ</SelectItem>
                      <SelectItem value="ข้อมูล">ข้อมูล</SelectItem>
                      <SelectItem value="เตือนภัย">เตือนภัย</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ทั้งหมด">ความสำคัญทั้งหมด</SelectItem>
                      <SelectItem value="สูง">สูง</SelectItem>
                      <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                      <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <TabsContent value={activeTab} className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`card-elevated border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.isRead ? "bg-muted/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2 shrink-0">
                          {getTypeIcon(notification.type)}
                          {getCategoryIcon(notification.category)}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-medium text-sm ${!notification.isRead ? "font-semibold" : ""}`}
                            >
                              {notification.title}
                            </h3>
                            <Badge
                              className={getPriorityColor(
                                notification.priority,
                              )}
                              variant="outline"
                            >
                              {notification.priority}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                ใหม่
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{notification.timestamp}</span>
                            <span>หมวด: {notification.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsStarred(notification.id)}
                          className="p-1 h-auto"
                        >
                          <Star
                            className={`h-4 w-4 ${notification.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`}
                          />
                        </Button>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 h-auto"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 h-auto text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    {notification.actions.length > 0 && (
                      <div className="flex gap-2 pt-2 border-t">
                        {notification.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAction(notification.id, action.action)
                            }
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <Card className="card-elevated">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    ไม่มีการแจ้งเตือน
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === "unread"
                      ? "ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน"
                      : activeTab === "starred"
                        ? "ไม่มีการแจ้งเตือนที่ติดดาว"
                        : "ไม่มีการแจ้งเตือนในหมวดนี้"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
