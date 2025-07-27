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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Building,
  Bell,
  Database,
  Shield,
  Wifi,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Calendar,
  MapPin,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Key,
  Lock,
  Eye,
  EyeOff,
  Server,
  HardDrive,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Image,
  Palette,
  Volume2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock settings data
const defaultSettings = {
  general: {
    companyName: "บริษัท ตัวอย่าง จำกัด",
    companyAddress: "123 ถนนตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10110",
    companyPhone: "02-123-4567",
    companyEmail: "info@company.com",
    timezone: "Asia/Bangkok",
    language: "th",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "THB",
    theme: "system",
    logoUrl: "",
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    soundEnabled: true,
    workOrderNotifications: true,
    maintenanceReminders: true,
    stockAlerts: true,
    systemAlerts: true,
    reportGeneration: false,
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailUsername: "",
    emailPassword: "",
    smsProvider: "twilio",
    smsApiKey: "",
    notificationDelay: [5],
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  },
  system: {
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",
    autoUpdates: false,
    maintenanceMode: false,
    debugMode: false,
    logLevel: "info",
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordExpiry: "90",
    dataEncryption: true,
    apiRateLimit: "1000",
    maxFileSize: "50",
    allowedFileTypes: ["jpg", "png", "pdf", "doc", "xls"],
  },
  database: {
    host: "localhost",
    port: "5432",
    name: "cmms_db",
    username: "cmms_user",
    connectionPool: "20",
    queryTimeout: "30",
    backupPath: "/backups",
    compressionEnabled: true,
    encryptionEnabled: true,
  },
  integration: {
    apiEnabled: true,
    webhooksEnabled: false,
    ssoEnabled: false,
    ldapEnabled: false,
    elasticsearchEnabled: false,
    redisEnabled: false,
    apiKeys: [],
    webhookUrls: [],
    ssoProvider: "oauth2",
    ldapServer: "",
    elasticsearchUrl: "",
    redisUrl: "",
  },
  mobile: {
    offlineMode: true,
    syncInterval: "15",
    autoSync: true,
    compressionEnabled: true,
    imageQuality: [80],
    maxOfflineData: "100",
    locationTracking: false,
    biometricAuth: false,
    autoLock: "5",
  },
};

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const { toast } = useToast();

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateNestedSetting = (
    category: string,
    parentKey: string,
    key: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [parentKey]: {
          ...(prev[category as keyof typeof prev] as any)[parentKey],
          [key]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      setHasChanges(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
    toast.success("รีเซ็ตการตั้งค่าเรียบร้อยแล้ว");
  };

  const testEmailConnection = async () => {
    setIsTestingConnection(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("ทดสอบการเชื่อมต่ออีเมลสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่ออีเมลได้");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("ทดสอบการเชื่อมต่อฐานข้อมูลสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const generateApiKey = () => {
    const newKey = "sk_" + Math.random().toString(36).substr(2, 32);
    const newApiKey = {
      id: Date.now().toString(),
      name: "API Key " + (settings.integration.apiKeys.length + 1),
      key: newKey,
      created: new Date().toISOString(),
      lastUsed: null,
      permissions: ["read", "write"],
    };

    updateSetting("integration", "apiKeys", [
      ...settings.integration.apiKeys,
      newApiKey,
    ]);
    toast.success("สร้าง API Key ใหม่เรียบร้อยแล้ว");
  };

  const deleteApiKey = (keyId: string) => {
    const updatedKeys = settings.integration.apiKeys.filter(
      (key: any) => key.id !== keyId,
    );
    updateSetting("integration", "apiKeys", updatedKeys);
    toast.success("ลบ API Key เรียบร้อยแล้ว");
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">การตั้งค่าระบบ</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการการกำหนดค่าและการตั้งค่าระบบ CMMS
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                รีเซ็ต
              </Button>
            )}
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              บันทึกการตั้งค่า
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
            <TabsTrigger value="general">ทั่วไป</TabsTrigger>
            <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="system">ระบบ</TabsTrigger>
            <TabsTrigger value="database">ฐานข้อมูล</TabsTrigger>
            <TabsTrigger value="integration">การเชื่อมต่อ</TabsTrigger>
            <TabsTrigger value="mobile">มือถือ</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    ข้อมูลบริษัท
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">ชื่อบริษัท</Label>
                    <Input
                      id="companyName"
                      value={settings.general.companyName}
                      onChange={(e) =>
                        updateSetting("general", "companyName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">ที่อยู่บริษัท</Label>
                    <Textarea
                      id="companyAddress"
                      value={settings.general.companyAddress}
                      onChange={(e) =>
                        updateSetting(
                          "general",
                          "companyAddress",
                          e.target.value,
                        )
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="companyPhone">เบอร์โทร</Label>
                      <Input
                        id="companyPhone"
                        value={settings.general.companyPhone}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "companyPhone",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">อีเมล</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.general.companyEmail}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "companyEmail",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    การแสดงผล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="language">ภาษา</Label>
                      <Select
                        value={settings.general.language}
                        onValueChange={(value) =>
                          updateSetting("general", "language", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="th">ไทย</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">เขตเวลา</Label>
                      <Select
                        value={settings.general.timezone}
                        onValueChange={(value) =>
                          updateSetting("general", "timezone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Bangkok">
                            Asia/Bangkok
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dateFormat">รูปแบบวันที่</Label>
                      <Select
                        value={settings.general.dateFormat}
                        onValueChange={(value) =>
                          updateSetting("general", "dateFormat", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeFormat">รูปแบบเวลา</Label>
                      <Select
                        value={settings.general.timeFormat}
                        onValueChange={(value) =>
                          updateSetting("general", "timeFormat", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                          <SelectItem value="12h">12 ชั่วโมง</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="currency">สกุลเงิน</Label>
                      <Select
                        value={settings.general.currency}
                        onValueChange={(value) =>
                          updateSetting("general", "currency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">บาท (THB)</SelectItem>
                          <SelectItem value="USD">ดอลลาร์ (USD)</SelectItem>
                          <SelectItem value="EUR">ยูโร (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="theme">ธีม</Label>
                      <Select
                        value={settings.general.theme}
                        onValueChange={(value) =>
                          updateSetting("general", "theme", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">สว่าง</SelectItem>
                          <SelectItem value="dark">มืด</SelectItem>
                          <SelectItem value="system">ตามระบบ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    ประเภทการแจ้งเตือน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>การแจ้งเตือนใบสั่งงาน</Label>
                      <p className="text-sm text-muted-foreground">
                        แจ้งเตือนเมื่อมีใบสั่งงานใหม่หรือมีการอัปเดต
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.workOrderNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "notifications",
                          "workOrderNotifications",
                          checked,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>การแจ้งเตือนบำรุงรักษา</Label>
                      <p className="text-sm text-muted-foreground">
                        แจ้งเตือนกำหนดการบำรุงรักษา
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.maintenanceReminders}
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "notifications",
                          "maintenanceReminders",
                          checked,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>การแจ้งเตือนสต็อก</Label>
                      <p className="text-sm text-muted-foreground">
                        แจ้งเตือนเมื่อสต็อกใกล้หมด
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.stockAlerts}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", "stockAlerts", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>การแจ้งเตือนระบบ</Label>
                      <p className="text-sm text-muted-foreground">
                        แจ้งเตือนข้อผิดพลาดและการอัปเดตระบบ
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", "systemAlerts", checked)
                      }
                    />
                  </div>

                  <div>
                    <Label>ระยะเวลาการแจ้งเตือนล่วงหน้า (นาที)</Label>
                    <div className="mt-2">
                      <Slider
                        value={settings.notifications.notificationDelay}
                        onValueChange={(value) =>
                          updateSetting(
                            "notifications",
                            "notificationDelay",
                            value,
                          )
                        }
                        max={60}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {settings.notifications.notificationDelay[0]} นาที
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    การตั้งค่าอีเมล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>เปิดใช้งานการแจ้งเตือนทางอีเมล</Label>
                    <Switch
                      checked={settings.notifications.emailEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("notifications", "emailEnabled", checked)
                      }
                    />
                  </div>

                  {settings.notifications.emailEnabled && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="emailHost">SMTP Host</Label>
                          <Input
                            id="emailHost"
                            value={settings.notifications.emailHost}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "emailHost",
                                e.target.value,
                              )
                            }
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailPort">Port</Label>
                          <Input
                            id="emailPort"
                            value={settings.notifications.emailPort}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "emailPort",
                                e.target.value,
                              )
                            }
                            placeholder="587"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="emailUsername">Username</Label>
                        <Input
                          id="emailUsername"
                          value={settings.notifications.emailUsername}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "emailUsername",
                              e.target.value,
                            )
                          }
                          placeholder="your-email@gmail.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="emailPassword">Password</Label>
                        <Input
                          id="emailPassword"
                          type="password"
                          value={settings.notifications.emailPassword}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "emailPassword",
                              e.target.value,
                            )
                          }
                          placeholder="••••••••"
                        />
                      </div>

                      <Button
                        variant="outline"
                        onClick={testEmailConnection}
                        disabled={isTestingConnection}
                        className="w-full"
                      >
                        {isTestingConnection ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        ทดสอบการเชื่อมต่อ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quiet Hours */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  ช่วงเวลาเงียบ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>เปิดใช้งานช่วงเวลาเงียบ</Label>
                    <p className="text-sm text-muted-foreground">
                      ไม่ส่งการแจ้งเตือนในช่วงเวลาที่กำหนด
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updateNestedSetting(
                        "notifications",
                        "quietHours",
                        "enabled",
                        checked,
                      )
                    }
                  />
                </div>

                {settings.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="quietStart">เวลาเริ่มต้น</Label>
                      <Input
                        id="quietStart"
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) =>
                          updateNestedSetting(
                            "notifications",
                            "quietHours",
                            "start",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">เวลาสิ้นสุด</Label>
                      <Input
                        id="quietEnd"
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) =>
                          updateNestedSetting(
                            "notifications",
                            "quietHours",
                            "end",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    การสำรองข้อมูล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</Label>
                    <Switch
                      checked={settings.system.autoBackup}
                      onCheckedChange={(checked) =>
                        updateSetting("system", "autoBackup", checked)
                      }
                    />
                  </div>

                  {settings.system.autoBackup && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="backupFrequency">
                          ความถี่การสำรองข้อมูล
                        </Label>
                        <Select
                          value={settings.system.backupFrequency}
                          onValueChange={(value) =>
                            updateSetting("system", "backupFrequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">ทุกชั่วโมง</SelectItem>
                            <SelectItem value="daily">รายวัน</SelectItem>
                            <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                            <SelectItem value="monthly">รายเดือน</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="backupRetention">
                          เก็บข้อมูลสำรอง (วัน)
                        </Label>
                        <Input
                          id="backupRetention"
                          type="number"
                          value={settings.system.backupRetention}
                          onChange={(e) =>
                            updateSetting(
                              "system",
                              "backupRetention",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    ความปลอดภัย
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">หมดเวลาเซสชัน (นาที)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.system.sessionTimeout}
                      onChange={(e) =>
                        updateSetting(
                          "system",
                          "sessionTimeout",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxLoginAttempts">
                      จำนวนครั้งล็อกอินสูงสุด
                    </Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.system.maxLoginAttempts}
                      onChange={(e) =>
                        updateSetting(
                          "system",
                          "maxLoginAttempts",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordExpiry">
                      วันหมดอายุรหัสผ่าน (วัน)
                    </Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.system.passwordExpiry}
                      onChange={(e) =>
                        updateSetting(
                          "system",
                          "passwordExpiry",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>เข้ารหัสข้อมูล</Label>
                    <Switch
                      checked={settings.system.dataEncryption}
                      onCheckedChange={(checked) =>
                        updateSetting("system", "dataEncryption", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  การตั้งค่าระบบขั้นสูง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>โหมดการบำรุงรักษา</Label>
                      <p className="text-xs text-muted-foreground">
                        ปิดการเข้าถึงสำหรับผู้ใช้ทั่วไป
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateSetting("system", "maintenanceMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อัปเดตอัตโนมัติ</Label>
                      <p className="text-xs text-muted-foreground">
                        อัปเดตระบบโดยอัต���นมัติ
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.autoUpdates}
                      onCheckedChange={(checked) =>
                        updateSetting("system", "autoUpdates", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>โหมด Debug</Label>
                      <p className="text-xs text-muted-foreground">
                        เปิดใช้งาน Debug Mode
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.debugMode}
                      onCheckedChange={(checked) =>
                        updateSetting("system", "debugMode", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  การเชื่อมต่อฐานข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dbHost">Host</Label>
                    <Input
                      id="dbHost"
                      value={settings.database.host}
                      onChange={(e) =>
                        updateSetting("database", "host", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbPort">Port</Label>
                    <Input
                      id="dbPort"
                      value={settings.database.port}
                      onChange={(e) =>
                        updateSetting("database", "port", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input
                      id="dbName"
                      value={settings.database.name}
                      onChange={(e) =>
                        updateSetting("database", "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbUsername">Username</Label>
                    <Input
                      id="dbUsername"
                      value={settings.database.username}
                      onChange={(e) =>
                        updateSetting("database", "username", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="connectionPool">Connection Pool Size</Label>
                    <Input
                      id="connectionPool"
                      type="number"
                      value={settings.database.connectionPool}
                      onChange={(e) =>
                        updateSetting(
                          "database",
                          "connectionPool",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="queryTimeout">Query Timeout (วินาที)</Label>
                    <Input
                      id="queryTimeout"
                      type="number"
                      value={settings.database.queryTimeout}
                      onChange={(e) =>
                        updateSetting(
                          "database",
                          "queryTimeout",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={testDatabaseConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    ทดสอบการเชื่อมต่อ
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>เปิดใช้งานการบีบอัด</Label>
                    <Switch
                      checked={settings.database.compressionEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("database", "compressionEnabled", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>เข้ารหัสฐานข้อมูล</Label>
                    <Switch
                      checked={settings.database.encryptionEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("database", "encryptionEnabled", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    จัดการ API Keys สำหรับการเชื่อมต่อกับระบบภายนอก
                  </p>
                  <Button onClick={generateApiKey}>
                    <Key className="h-4 w-4 mr-2" />
                    สร้าง API Key
                  </Button>
                </div>

                {settings.integration.apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {settings.integration.apiKeys.map((apiKey: any) => (
                      <div key={apiKey.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{apiKey.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {showApiKeys ? apiKey.key : "•".repeat(32)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              สร้างเมื่อ:{" "}
                              {new Date(apiKey.created).toLocaleDateString(
                                "th-TH",
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKeys(!showApiKeys)}
                            >
                              {showApiKeys ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ยืนยันการลบ API Key
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณต้องการลบ API Key "{apiKey.name}"
                                    ใช่หรือไม่?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteApiKey(apiKey.id)}
                                  >
                                    ลบ API Key
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      ยังไม่มี API Key
                    </h3>
                    <p className="text-muted-foreground">
                      สร้าง API Key เพื่อเชื่อมต่อกับระบบภายนอก
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Tab */}
          <TabsContent value="mobile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    การซิงค์ข้อมูล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>โหมดออฟไลน์</Label>
                    <Switch
                      checked={settings.mobile.offlineMode}
                      onCheckedChange={(checked) =>
                        updateSetting("mobile", "offlineMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>ซิงค์อัตโนมัติ</Label>
                    <Switch
                      checked={settings.mobile.autoSync}
                      onCheckedChange={(checked) =>
                        updateSetting("mobile", "autoSync", checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="syncInterval">ความถี่การซิงค์ (นาที)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      value={settings.mobile.syncInterval}
                      onChange={(e) =>
                        updateSetting("mobile", "syncInterval", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxOfflineData">
                      ข้อมูลออฟไลน์สูงสุด (MB)
                    </Label>
                    <Input
                      id="maxOfflineData"
                      type="number"
                      value={settings.mobile.maxOfflineData}
                      onChange={(e) =>
                        updateSetting(
                          "mobile",
                          "maxOfflineData",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    คุณภาพสื่อ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>คุณภาพรูปภาพ (%)</Label>
                    <div className="mt-2">
                      <Slider
                        value={settings.mobile.imageQuality}
                        onValueChange={(value) =>
                          updateSetting("mobile", "imageQuality", value)
                        }
                        max={100}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {settings.mobile.imageQuality[0]}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>บีบอัดข���อมูล</Label>
                    <Switch
                      checked={settings.mobile.compressionEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("mobile", "compressionEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>ติดตามตำแหน่ง</Label>
                    <Switch
                      checked={settings.mobile.locationTracking}
                      onCheckedChange={(checked) =>
                        updateSetting("mobile", "locationTracking", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>การยืนยันตัวตนด้วยไบโอเมตริก</Label>
                    <Switch
                      checked={settings.mobile.biometricAuth}
                      onCheckedChange={(checked) =>
                        updateSetting("mobile", "biometricAuth", checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="autoLock">ล็อกอัตโนมัติ (นาที)</Label>
                    <Input
                      id="autoLock"
                      type="number"
                      value={settings.mobile.autoLock}
                      onChange={(e) =>
                        updateSetting("mobile", "autoLock", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
