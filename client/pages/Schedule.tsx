import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  Search,
  Download,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  View,
  List,
  Grid3X3,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin,
  Wrench,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  TrendingUp,
  Calendar as CalendarView,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Mock schedule data
const scheduleData = [
  {
    id: "SCH-001",
    title: "บำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
    description: "ตรวจสอบน้ำมันเครื่อง, ไส้กรอง, และระบบทั่วไป",
    asset: { id: "TRACT-001", name: "รถแทรกเตอร์ Kubota M7060" },
    assignee: { id: "TECH-001", name: "สมชาย รักงาน" },
    scheduleType: "ป้องกัน",
    frequency: "รายสัปดาห์",
    priority: "สูง",
    status: "กำลังดำเนินการ",
    estimatedDuration: 2,
    actualDuration: null,
    startDate: "2024-01-15",
    startTime: "08:00",
    endTime: "10:00",
    location: "ไร่ A",
    isRecurring: true,
    recurringPattern: "weekly",
    nextDue: "2024-01-22",
    completionRate: 85,
    notes: "ตรวจสอบพิเศษหลังจากใช้งานหนัก",
    requiredParts: ["OF-4553", "EO-1540"],
    isOverdue: false,
    createdBy: "หัวหน้าช่าง",
    createdAt: "2024-01-01",
  },
  {
    id: "SCH-002",
    title: "ตรวจสอบปั๊มน้ำประจำเดือน",
    description: "ตรวจสอบการรั่วซึม, เสียง, และอุณหภูมิ",
    asset: { id: "PUMP-003", name: "ปั๊มน้ำไฟฟ้า Grundfos CR5-8" },
    assignee: { id: "TECH-002", name: "สมหญิง ใจดี" },
    scheduleType: "ป้องกัน",
    frequency: "รายเดือน",
    priority: "ปานกลาง",
    status: "รอดำเนินการ",
    estimatedDuration: 1.5,
    actualDuration: null,
    startDate: "2024-01-20",
    startTime: "09:00",
    endTime: "10:30",
    location: "จุดควบคุมน้ำ A",
    isRecurring: true,
    recurringPattern: "monthly",
    nextDue: "2024-02-20",
    completionRate: 100,
    notes: "",
    requiredParts: [],
    isOverdue: false,
    createdBy: "หัวหน้าช่าง",
    createdAt: "2024-01-01",
  },
  {
    id: "SCH-003",
    title: "ซ่อมแซมเครื่องเก็บเกี่ยว",
    description: "ซ่อมระบบเข็มขัดลำเลียงและตรวจสอบทั่วไป",
    asset: { id: "HARV-003", name: "เครื่องเก็บเกี่ยว John Deere S660" },
    assignee: { id: "TECH-003", name: "สมศักดิ์ ช่างเก่ง" },
    scheduleType: "แก้ไข",
    frequency: "ครั้งเดียว",
    priority: "วิกฤติ",
    status: "เกินกำหนด",
    estimatedDuration: 6,
    actualDuration: null,
    startDate: "2024-01-10",
    startTime: "08:00",
    endTime: "14:00",
    location: "โรงซ่อม",
    isRecurring: false,
    recurringPattern: null,
    nextDue: null,
    completionRate: 0,
    notes: "ต้องสั่งอะไหล่เพิ่ม",
    requiredParts: ["BP-7832"],
    isOverdue: true,
    createdBy: "หัวหน้าช���าง",
    createdAt: "2024-01-05",
  },
  {
    id: "SCH-004",
    title: "ปรับเทียบเครื่องพ่นยา",
    description: "ปรับแรงดัน ทำความสะอาดหัวพ่น",
    asset: { id: "SPRAY-004", name: "เครื่องพ่นยา Amazone UX 3200" },
    assignee: { id: "TECH-001", name: "สมชาย รักงาน" },
    scheduleType: "ป้องกัน",
    frequency: "รายเดือน",
    priority: "ปานกลาง",
    status: "เสร็จสิ้น",
    estimatedDuration: 1,
    actualDuration: 1.2,
    startDate: "2024-01-18",
    startTime: "10:00",
    endTime: "11:00",
    location: "โรงเก็บอุปกรณ์",
    isRecurring: true,
    recurringPattern: "monthly",
    nextDue: "2024-02-18",
    completionRate: 100,
    notes: "เสร็จเรียบร้อย พบหัวพ่นอุดตัน 2 ตัว",
    requiredParts: ["SP-1001"],
    isOverdue: false,
    createdBy: "หัวหน้าช่าง",
    createdAt: "2024-01-01",
  },
  {
    id: "SCH-005",
    title: "ตรวจสอบระบบไฟฟ้า",
    description: "ตรวจสอบส���ยไฟ, แบตเตอรี่, และระบบชาร์จ",
    asset: { id: "TRACT-002", name: "รถแทรกเตอร์ Massey Ferguson 4707" },
    assignee: { id: "TECH-004", name: "สมคิด ช่วยงาน" },
    scheduleType: "ตรวจสอบ",
    frequency: "รายไตรมาส",
    priority: "ต่ำ",
    status: "รอดำเนินการ",
    estimatedDuration: 2,
    actualDuration: null,
    startDate: "2024-01-25",
    startTime: "13:00",
    endTime: "15:00",
    location: "ไร่ B",
    isRecurring: true,
    recurringPattern: "quarterly",
    nextDue: "2024-04-25",
    completionRate: 0,
    notes: "",
    requiredParts: [],
    isOverdue: false,
    createdBy: "หัวหน้าช่าง",
    createdAt: "2024-01-15",
  },
];

// Technicians data
const technicians = [
  {
    id: "TECH-001",
    name: "สมชาย รักงาน",
    department: "ช่างเครื่องยนต์",
    workload: 85,
  },
  {
    id: "TECH-002",
    name: "สมหญิง ใจดี",
    department: "ช่างไฟฟ้า",
    workload: 70,
  },
  {
    id: "TECH-003",
    name: "สมศักดิ์ ช่างเก่ง",
    department: "ช่างเครื่องจักร",
    workload: 95,
  },
  {
    id: "TECH-004",
    name: "สมคิด ช่วยงาน",
    department: "ช่างทั่วไป",
    workload: 60,
  },
];

export function Schedule() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterPriority, setFilterPriority] = useState("ทั้งหมด");
  const [filterAssignee, setFilterAssignee] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    asset: "",
    assignee: "",
    type: "ป้องกัน",
    priority: "ปานกลาง",
    startDate: "",
    startTime: "",
    duration: "2",
    location: "",
    notes: "",
    isRecurring: false,
    frequency: "รายสัปดาห์",
  });

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return scheduleData.filter((schedule) => {
      const matchesSearch =
        !searchTerm ||
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "ทั้งหมด" || schedule.status === filterStatus;
      const matchesPriority =
        filterPriority === "ทั้งหมด" || schedule.priority === filterPriority;
      const matchesAssignee =
        filterAssignee === "ทั้งหมด" ||
        schedule.assignee.name === filterAssignee;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    });
  }, [searchTerm, filterStatus, filterPriority, filterAssignee]);

  // Calendar data processing
  const calendarData = useMemo(() => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get schedules for current month view
    const monthSchedules = scheduleData.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate);
      return (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      );
    });

    return monthSchedules;
  }, [currentDate]);

  // Statistics
  const stats = useMemo(() => {
    const total = scheduleData.length;
    const completed = scheduleData.filter(
      (s) => s.status === "เสร็จสิ้น",
    ).length;
    const inProgress = scheduleData.filter(
      (s) => s.status === "กำลังดำเนินการ",
    ).length;
    const pending = scheduleData.filter(
      (s) => s.status === "รอดำเนินการ",
    ).length;
    const overdue = scheduleData.filter((s) => s.isOverdue).length;
    const today = scheduleData.filter(
      (s) => s.startDate === new Date().toISOString().split("T")[0],
    ).length;

    return { total, completed, inProgress, pending, overdue, today };
  }, []);

  // Calendar generation functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.filter((schedule) => schedule.startDate === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น":
        return "bg-success text-success-foreground";
      case "กำลังดำเนินการ":
        return "bg-warning text-warning-foreground";
      case "เกินกำหนด":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "วิกฤติ":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "สูง":
        return "bg-warning/10 text-warning border-warning/20";
      case "ปานกลาง":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleAddSchedule = () => {
    if (
      !newSchedule.title ||
      !newSchedule.asset ||
      !newSchedule.assignee ||
      !newSchedule.startDate
    ) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    toast.success("เพิ่มตารางงานเรียบร้อยแล้ว");
    setAddScheduleOpen(false);
    setNewSchedule({
      title: "",
      description: "",
      asset: "",
      assignee: "",
      type: "ป้องกัน",
      priority: "ปานกลาง",
      startDate: "",
      startTime: "",
      duration: "2",
      location: "",
      notes: "",
      isRecurring: false,
      frequency: "รายสัปดาห์",
    });
  };

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">ตารางบำรุงรักษา</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              จัดการและวางแผนงานบำรุงรักษาล่วงหน้า
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มตารางงาน
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มตารางงานใหม่</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label>หัวข้องาน *</Label>
                    <Input
                      value={newSchedule.title}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="เช่น ตรวจสอบเครื่องยนต์"
                    />
                  </div>
                  <div>
                    <Label>อุปกรณ์ *</Label>
                    <Select
                      value={newSchedule.asset}
                      onValueChange={(value) =>
                        setNewSchedule((prev) => ({ ...prev, asset: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกอุปกรณ์" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRACT-001">
                          รถแทรกเตอร์ Kubota M7060
                        </SelectItem>
                        <SelectItem value="PUMP-003">
                          ปั๊มน้ำไฟฟ้า Grundfos CR5-8
                        </SelectItem>
                        <SelectItem value="HARV-003">
                          เครื่องเก็บเกี่ยว John Deere S660
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ผู้รับผิดชอบ *</Label>
                    <Select
                      value={newSchedule.assignee}
                      onValueChange={(value) =>
                        setNewSchedule((prev) => ({ ...prev, assignee: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกช่าง" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ประเภทงาน</Label>
                    <Select
                      value={newSchedule.type}
                      onValueChange={(value) =>
                        setNewSchedule((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ป้องกัน">
                          บำรุงรักษาเชิงป้องกัน
                        </SelectItem>
                        <SelectItem value="แก้ไข">งานซ่อมแซม</SelectItem>
                        <SelectItem value="ตรวจสอบ">การตรวจสอบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ความสำคัญ</Label>
                    <Select
                      value={newSchedule.priority}
                      onValueChange={(value) =>
                        setNewSchedule((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="วิกฤติ">วิกฤติ</SelectItem>
                        <SelectItem value="สูง">สูง</SelectItem>
                        <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                        <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>วันที่เริ่ม *</Label>
                    <Input
                      type="date"
                      value={newSchedule.startDate}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>เวลาเริ่ม</Label>
                    <Input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>ระยะเวลา (ชั่วโมง)</Label>
                    <Input
                      type="number"
                      value={newSchedule.duration}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="2"
                      step="0.5"
                      min="0.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>รายละเอียด</Label>
                    <Textarea
                      value={newSchedule.description}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="อธิบายรายละเอียดงาน..."
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>สถานที่</Label>
                    <Input
                      value={newSchedule.location}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="เช่น ไร่ A, โรงซ่อม"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleAddSchedule} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มตารางงาน
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAddScheduleOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">งานทั้งหมด</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-primary">{stats.today}</div>
            <div className="text-xs text-muted-foreground">งานวันนี้</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-warning">
              {stats.inProgress}
            </div>
            <div className="text-xs text-muted-foreground">กำลังดำเนินการ</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-secondary">
              {stats.pending}
            </div>
            <div className="text-xs text-muted-foreground">รอดำเนินการ</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-success">
              {stats.completed}
            </div>
            <div className="text-xs text-muted-foreground">เสร็จสิ้น</div>
          </div>
          <div className="metric-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-destructive">
              {stats.overdue}
            </div>
            <div className="text-xs text-muted-foreground">เกินกำหนด</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">ปฏิทิน</TabsTrigger>
            <TabsTrigger value="list">รายการ</TabsTrigger>
            <TabsTrigger value="workload">ภาระงาน</TabsTrigger>
            <TabsTrigger value="analytics">วิเคราะห์</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    ปฏิทินงานบำรุงรักษา
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-40 text-center">
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear() + 543}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const isCurrentMonth =
                      date.getMonth() === currentDate.getMonth();
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    const daySchedules = getSchedulesForDate(date);

                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-1 border rounded-lg ${
                          isCurrentMonth ? "bg-background" : "bg-muted/30"
                        } ${isToday ? "ring-2 ring-primary" : ""}`}
                      >
                        <div
                          className={`text-sm font-medium text-center mb-1 ${
                            isCurrentMonth ? "" : "text-muted-foreground"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {daySchedules.slice(0, 2).map((schedule) => (
                            <div
                              key={schedule.id}
                              className={`text-xs p-1 rounded text-center cursor-pointer hover:opacity-80 ${getStatusColor(
                                schedule.status,
                              )}`}
                              title={`${schedule.title} - ${schedule.assignee.name}`}
                            >
                              {schedule.title.length > 15
                                ? schedule.title.substring(0, 15) + "..."
                                : schedule.title}
                            </div>
                          ))}
                          {daySchedules.length > 2 && (
                            <div className="text-xs text-center text-muted-foreground">
                              +{daySchedules.length - 2} อื่นๆ
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="ค้นหางาน, อุปกรณ์, ช่าง..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ทั้งหมด">สถานะทั้งหมด</SelectItem>
                        <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                        <SelectItem value="กำลังดำเนินการ">
                          กำลังดำเนินการ
                        </SelectItem>
                        <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                        <SelectItem value="เกินกำหนด">เกินกำหนด</SelectItem>
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
                        <SelectItem value="ทั้งหมด">
                          ความสำคัญทั้งหมด
                        </SelectItem>
                        <SelectItem value="วิกฤติ">วิกฤติ</SelectItem>
                        <SelectItem value="สูง">สูง</SelectItem>
                        <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                        <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule List */}
            <div className="space-y-3">
              {filteredSchedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  className={`card-elevated ${
                    schedule.isOverdue
                      ? "ring-2 ring-destructive/20 border-l-4 border-l-destructive"
                      : schedule.priority === "วิกฤติ"
                        ? "border-l-4 border-l-destructive"
                        : schedule.priority === "สูง"
                          ? "border-l-4 border-l-warning"
                          : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {schedule.title}
                            </h3>
                            <Badge
                              className={getPriorityColor(schedule.priority)}
                            >
                              {schedule.priority}
                            </Badge>
                            <Badge
                              className={getStatusColor(schedule.status)}
                              variant="secondary"
                            >
                              {schedule.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {schedule.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">อุปกรณ์</div>
                          <div className="font-medium">
                            {schedule.asset.name}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            ผู้รับผิดชอบ
                          </div>
                          <div className="font-medium">
                            {schedule.assignee.name}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">
                            วันที่ กำหนด
                          </div>
                          <div className="font-medium">
                            {schedule.startDate} {schedule.startTime}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-lg">
                          <div className="text-muted-foreground">ระยะเวลา</div>
                          <div className="font-medium">
                            {schedule.estimatedDuration} ชม.
                          </div>
                        </div>
                      </div>

                      {/* Progress and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            ความคืบหน้า:
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${schedule.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {schedule.completionRate}%
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {schedule.status === "รอดำเนินการ" && (
                            <Button size="sm">
                              <Wrench className="h-4 w-4 mr-2" />
                              เริ่มงาน
                            </Button>
                          )}
                          {schedule.status === "กำลังดำเนินการ" && (
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              เสร็จสิ้น
                            </Button>
                          )}
                          <Link to={`/work-orders/${schedule.id}`}>
                            <Button variant="outline" size="sm">
                              รายละเอียด
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workload Tab */}
          <TabsContent value="workload" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ภาระงานช่าง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{tech.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {tech.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              tech.workload >= 90
                                ? "text-destructive"
                                : tech.workload >= 80
                                  ? "text-warning"
                                  : "text-success"
                            }`}
                          >
                            {tech.workload}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ภาระงาน
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              tech.workload >= 90
                                ? "bg-destructive"
                                : tech.workload >= 80
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${tech.workload}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            งานที่มอบหมาย:{" "}
                            {
                              scheduleData.filter(
                                (s) => s.assignee.name === tech.name,
                              ).length
                            }
                          </span>
                          <span>
                            งานสำเร็จ:{" "}
                            {
                              scheduleData.filter(
                                (s) =>
                                  s.assignee.name === tech.name &&
                                  s.status === "เสร็จสิ้น",
                              ).length
                            }
                          </span>
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
                    <TrendingUp className="h-5 w-5" />
                    ประสิทธิภาพงาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-success">92%</div>
                      <div className="text-sm text-muted-foreground">
                        งานเสร็จตรงเวลา
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">2.1</div>
                      <div className="text-sm text-muted-foreground">
                        เวลาเฉลี่ย (ชม.)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    เป้าหมายประจำเดือน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>งานเสร็จสิ้น</span>
                        <span>15/20</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "75%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>งานตรงเวลา</span>
                        <span>18/20</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full"
                          style={{ width: "90%" }}
                        />
                      </div>
                    </div>
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
