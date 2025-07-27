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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Key,
  Clock,
  Activity,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Eye,
  Settings,
  Lock,
  Unlock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock users data
const usersData = [
  {
    id: "USR-001",
    username: "admin",
    email: "admin@company.com",
    fullName: "ผู้ดูแลระบบ",
    role: "admin",
    department: "IT",
    position: "ผู้ดูแลระบบ",
    phone: "081-234-5678",
    status: "active",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-01-01",
    permissions: ["all"],
    avatar: "",
  },
  {
    id: "USR-002",
    username: "somchai.tech",
    email: "somchai@company.com",
    fullName: "สมชาย รักงาน",
    role: "technician",
    department: "บำรุงรักษ���",
    position: "ช่างซ่อมบำรุง",
    phone: "081-234-5679",
    status: "active",
    lastLogin: "2024-01-15 10:15",
    createdAt: "2023-02-15",
    permissions: ["work_orders", "assets", "parts"],
    avatar: "",
  },
  {
    id: "USR-003",
    username: "somying.manager",
    email: "somying@company.com",
    fullName: "สมหญิง ใจดี",
    role: "manager",
    department: "บำรุงรักษา",
    position: "หัวหน้าแผนก",
    phone: "081-234-5680",
    status: "active",
    lastLogin: "2024-01-15 08:45",
    createdAt: "2023-01-15",
    permissions: ["work_orders", "assets", "parts", "reports", "users_view"],
    avatar: "",
  },
  {
    id: "USR-004",
    username: "somsak.tech",
    email: "somsak@company.com",
    fullName: "สมศักดิ์ ช่างเก่ง",
    role: "technician",
    department: "บำรุงรักษา",
    position: "ช่างซ่อมบำรุง",
    phone: "081-234-5681",
    status: "inactive",
    lastLogin: "2024-01-10 16:20",
    createdAt: "2023-03-01",
    permissions: ["work_orders", "assets"],
    avatar: "",
  },
  {
    id: "USR-005",
    username: "viewer.user",
    email: "viewer@company.com",
    fullName: "ผู้ดูข้อมูล",
    role: "viewer",
    department: "บัญชี",
    position: "นักบัญชี",
    phone: "081-234-5682",
    status: "active",
    lastLogin: "2024-01-14 15:30",
    createdAt: "2023-06-01",
    permissions: ["reports_view"],
    avatar: "",
  },
];

// Role configurations
const roleConfigs = {
  admin: {
    name: "ผู้ดูแลระบบ",
    color: "bg-destructive text-destructive-foreground",
    permissions: ["all"],
    description: "สิทธิ์เต็มในการจัดการระบบทั้งหมด",
  },
  manager: {
    name: "หัวหน้า",
    color: "bg-primary text-primary-foreground",
    permissions: [
      "work_orders",
      "assets",
      "parts",
      "reports",
      "users_view",
      "schedule",
    ],
    description: "จัดการงานและดูรายงาน",
  },
  technician: {
    name: "ช่างเทคนิค",
    color: "bg-warning text-warning-foreground",
    permissions: ["work_orders", "assets", "parts"],
    description: "ดำเนินงานซ่อมบำรุง",
  },
  viewer: {
    name: "ผู้ดูข้อมูล",
    color: "bg-secondary text-secondary-foreground",
    permissions: ["reports_view"],
    description: "ดูข้อมูลและรายงานเท่านั้น",
  },
};

// All available permissions
const allPermissions = [
  { id: "work_orders", name: "จัดการใบสั่งงาน", category: "งาน" },
  { id: "assets", name: "จัดการอุปกรณ์", category: "งาน" },
  { id: "parts", name: "จัดการอะไหล่", category: "งาน" },
  { id: "schedule", name: "จัดการตารางงาน", category: "งาน" },
  { id: "reports", name: "จัดการรายงาน", category: "รายงาน" },
  { id: "reports_view", name: "ดูรายงาน", category: "รายงาน" },
  { id: "users", name: "จัดการผู้ใช้", category: "ระบบ" },
  { id: "users_view", name: "ดูรายการผู้ใช้", category: "ระบบ" },
  { id: "settings", name: "ตั้งค่าระบบ", category: "ระบบ" },
  { id: "all", name: "สิทธิ์ทั้งหมด", category: "ระบบ" },
];

export function Users() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "technician",
    department: "",
    position: "",
    phone: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
  });

  const filteredUsers = useMemo(() => {
    return usersData.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchTerm, statusFilter, roleFilter]);

  const handleCreateUser = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.fullName ||
      !formData.password
    ) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    toast.success("สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว");
    setIsCreateDialogOpen(false);
    setFormData({
      username: "",
      email: "",
      fullName: "",
      role: "technician",
      department: "",
      position: "",
      phone: "",
      password: "",
      confirmPassword: "",
      permissions: [],
    });
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      password: "",
      confirmPassword: "",
      permissions: user.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!formData.username || !formData.email || !formData.fullName) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    toast.success("อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว");
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    toast.success("ลบผู้ใช้งานเรียบร้อยแล้ว");
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toast.success(
      `${newStatus === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}ผู้ใช้เรียบร้อยแล้ว`,
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-success text-success-foreground">ใช้งาน</Badge>
    ) : (
      <Badge variant="secondary">ไม่ใช้งาน</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const config = roleConfigs[role as keyof typeof roleConfigs];
    return <Badge className={config.color}>{config.name}</Badge>;
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">จัดการผู้ใช้งาน</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการสิทธิ์และข้อมูลผู้ใช้งานในระบบ
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                เพิ่มผู้ใช้ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="ชื่อ นามสกุล"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="role">บทบาท</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfigs).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">แผนก</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="ชื่อแผนก"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="position">ตำแหน่ง</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="ตำแหน่งงาน"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทร</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="081-234-5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="password">รหัสผ่าน *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="รหัสผ่าน"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="ยืนยันรหัสผ่าน"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateUser} className="flex-1">
                    สร้างผู้ใช้งาน
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">ผู้ใช้งาน</TabsTrigger>
            <TabsTrigger value="roles">บทบาทและสิทธิ์</TabsTrigger>
            <TabsTrigger value="logs">ประวัติการใช้งาน</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาผู้ใช้งาน..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">บทบาททั้งหมด</SelectItem>
                      {Object.entries(roleConfigs).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{user.fullName}</h4>
                            {getStatusBadge(user.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username} • {user.email}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(user.role)}
                            <span className="text-xs text-muted-foreground">
                              เข้าใช้ล่าสุด: {user.lastLogin}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleUserStatus(user.id, user.status)
                          }
                        >
                          {user.status === "active" ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
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
                                ยืนยันการลบผู้ใช้งาน
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการลบผู้ใช้งาน "{user.fullName}"
                                ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                ลบผู้ใช้งาน
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">ไม่พบผู้ใช้งาน</h3>
                  <p className="text-muted-foreground">
                    ลองปรับเปลี่ยนเงื่อนไขการค้นหา
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(roleConfigs).map(([roleKey, config]) => (
                <Card key={roleKey} className="card-elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {config.name}
                      </CardTitle>
                      <Badge className={config.color}>{roleKey}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          สิทธิ์การใช้งาน:
                        </h4>
                        <div className="space-y-1">
                          {config.permissions.includes("all") ? (
                            <Badge variant="destructive" className="mr-1 mb-1">
                              สิทธิ์ทั้งหมด
                            </Badge>
                          ) : (
                            config.permissions.map((permission) => {
                              const permissionInfo = allPermissions.find(
                                (p) => p.id === permission,
                              );
                              return permissionInfo ? (
                                <Badge
                                  key={permission}
                                  variant="outline"
                                  className="mr-1 mb-1"
                                >
                                  {permissionInfo.name}
                                </Badge>
                              ) : null;
                            })
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          ผู้ใช้ในบทบาทนี้:{" "}
                          {usersData.filter((u) => u.role === roleKey).length}{" "}
                          คน
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  ประวัติการใช้งานล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usersData
                    .filter((u) => u.status === "active")
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {user.lastLogin}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            เข้าใช้งานล่าสุด
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-username">ชื่���ผู้ใช้ *</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">อีเมล *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-fullName">ชื่อ-นามสกุล *</Label>
                <Input
                  id="edit-fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="ชื่อ นามสกุล"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-role">บทบาท</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleConfigs).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-department">แผนก</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="ชื่อแผนก"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-position">ตำแหน่ง</Label>
                  <Input
                    id="edit-position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="ตำแหน่งงาน"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">เบอร์โทร</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="081-234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-password">รหัสผ่านใหม่</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="ใส่หากต้องการเปลี่ยน"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-confirmPassword">ยืนยันรหัสผ่าน</Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="ยืนยันรหัสผ่าน"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateUser} className="flex-1">
                  บันทึกการเปลี่ยนแปลง
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
