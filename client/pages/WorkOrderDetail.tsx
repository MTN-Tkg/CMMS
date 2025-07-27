import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  Settings,
  Wrench,
  Timer,
  Edit3,
  Play,
  Pause,
  Save,
  MessageSquare,
  Package,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

// Mock data - in real app this would come from API/database
const workOrderData = {
  "WO-2024-001": {
    id: "WO-2024-001",
    title: "บำรุงรักษาเครื่องยนต์รถแทรกเตอร์",
    description:
      "ตรวจสอบบำรุงรักษาตามกำหนดสำหรับรถขุ�� CAT 320D รวมถึงเปลี่���นน้ำมันเครื่อง เปลี่ยนไส้กรอง และตรวจสอบทั่วไป",
    status: "กำลังดำเนินการ",
    priority: "สูง",
    assignee: "สมชาย รักงาน",
    asset: "CAT-320D-001",
    assetName: "รถขุด CAT 320D",
    location: "ไร่ A",
    dueDate: "15/01/2567",
    createdDate: "10/01/2567",
    estimatedHours: 4,
    actualHours: 2.5,
    type: "ป้องกัน",
    requestedBy: "สมศักดิ์ หัวหน้าช่าง",
    tasks: [
      {
        id: 1,
        description: "ตรวจสอบระดับและคุณภาพน้ำมันเครื่อง",
        isCompleted: true,
        actualValue: "ระดับน้ำมันปกติ สีดี ไม่มีตะกอน",
        completedAt: "13/01/2567 09:30",
        isCritical: false,
      },
      {
        id: 2,
        description: "เปลี่ยนไส้กรองน้ำมันเครื่อง",
        isCompleted: true,
        actualValue: "เปลี่ยนไส้กรองแล้วด้วยชิ้นส่วน #OF-4553",
        completedAt: "13/01/2567 10:15",
        isCritical: true,
      },
      {
        id: 3,
        description: "ตรวจสอบระดับน้ำมันไฮดรอลิก",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: false,
      },
      {
        id: 4,
        description: "ตรวจสอบการสึกหรอของใส",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: true,
      },
      {
        id: 5,
        description: "ทดสอบการทำงานของระบบไฮดรอลิกทั้งหมด",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: false,
      },
    ],
    parts: [
      {
        name: "ไส้กรองน้ำมันเครื่อง",
        partNumber: "OF-4553",
        quantity: 1,
        used: true,
        usedAt: "13/01/2567 10:15",
      },
      {
        name: "น้ำมันเครื่อง 15W-40",
        partNumber: "EO-1540",
        quantity: 8,
        unit: "ลิตร",
        used: false,
      },
      {
        name: "ไส้กรอง���ฮดรอลิก",
        partNumber: "HF-2021",
        quantity: 1,
        used: false,
      },
    ],
    attachments: [
      {
        name: "รูปก่อนบำรุงรักษา.jpg",
        type: "image",
        uploadedAt: "13/01/2567 09:00",
        uploadedBy: "สมชาย รักงาน",
      },
      {
        name: "รายงานวิเคราะห์น้ำมัน.pdf",
        type: "document",
        uploadedAt: "10/01/2567 14:30",
        uploadedBy: "สมศักดิ์ หัวหน้าช่าง",
      },
    ],
    comments: [
      {
        id: 1,
        author: "สมชาย รักงาน",
        message: "เริ่มงานแล้ว ตรวจสอบสภาพเครื่องยนต์เบื้องต้น",
        timestamp: "13/01/2567 09:00",
      },
      {
        id: 2,
        author: "สมศักดิ์ หัวหน้าช่าง",
        message: "โปรดระวังการตรวจสอบระบบไฮดรอลิก เคยมีปัญหามาก่อน",
        timestamp: "13/01/2567 09:30",
      },
    ],
  },
};

export function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [taskNote, setTaskNote] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [timeLogOpen, setTimeLogOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [loggedHours, setLoggedHours] = useState("");
  const [workDescription, setWorkDescription] = useState("");

  const workOrder = workOrderData[id as keyof typeof workOrderData];

  if (!workOrder) {
    return (
      <div className="min-h-screen">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">ไม่พบใบสั่งงาน</h1>
          <p className="text-muted-foreground mt-2">
            ใบสั่งงาน {id} ไม่มีในระบบ
          </p>
          <Link to="/work-orders">
            <Button className="mt-4">กลับสู่ใบสั่งงาน</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = workOrder.tasks.filter(
    (task) => task.isCompleted,
  ).length;
  const totalTasks = workOrder.tasks.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น":
        return "bg-success text-success-foreground";
      case "กำลังดำเนินการ":
        return "bg-warning text-warning-foreground";
      case "เกินกำหนด":
        return "bg-destructive text-destructive-foreground";
      case "รอดำเนินการ":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "วิกฤติ":
        return "bg-destructive text-destructive-foreground";
      case "สูง":
        return "bg-warning text-warning-foreground";
      case "ปานกลาง":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error("กรุณาเลือกสถานะใหม่");
      return;
    }
    toast.success(`อัป��ดตสถานะเป็น "${newStatus}" เรียบร้อยแล้ว`);
    setStatusUpdateOpen(false);
    setNewStatus("");
  };

  const handleTimeLog = () => {
    if (!loggedHours || !workDescription) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    toast.success(`บันทึกเวลา ${loggedHours} ชั่วโมง เรียบร้อยแล้ว`);
    setTimeLogOpen(false);
    setLoggedHours("");
    setWorkDescription("");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("กรุณาเขียนความเห็น");
      return;
    }
    toast.success("เพิ่มความเห็นเรียบร้อยแล้ว");
    setCommentOpen(false);
    setNewComment("");
  };

  const markTaskComplete = (taskId: number) => {
    if (!taskNote.trim()) {
      toast.error("กรุณาเพิ่มรายละเอียดผลการทำงาน");
      return;
    }
    toast.success("ทำเครื่องหมายงานเสร็จสิ้นแล้ว");
    setTaskNote("");
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/work-orders")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {workOrder.title}
            </h1>
            <p className="text-sm text-muted-foreground">{workOrder.id}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isTimerRunning ? "destructive" : "default"}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isTimerRunning ? "หยุด" : "เริ่ม"}
            </Button>
            <Button size="sm" variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              แ��้ไข
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">สถานะ</div>
            <div
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}
            >
              {workOrder.status}
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">ความสำคัญ</div>
            <div
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}
            >
              {workOrder.priority}
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">
              ความคืบหน้า
            </div>
            <div className="text-lg font-bold text-primary">
              {progressPercent}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">เวลาใช้งาน</div>
            <div className="text-lg font-bold text-warning">
              {workOrder.actualHours} ชม.
            </div>
            <div className="text-xs text-muted-foreground">
              จาก {workOrder.estimatedHours} ชม.
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card-elevated rounded-xl p-1">
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "details", label: "รายละเอียด", icon: FileText },
              { id: "tasks", label: "งาน", icon: CheckCircle },
              { id: "parts", label: "อะไหล่", icon: Package },
              { id: "attachments", label: "ไฟล์", icon: Camera },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ข้อมูลใบสั่งงาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">ผู้รับผิดชอบ</div>
                    <div className="font-medium">{workOrder.assignee}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">กำหนดเสร็จ</div>
                    <div className="font-medium">{workOrder.dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">สถานที่</div>
                    <div className="font-medium">{workOrder.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">อุปกรณ์</div>
                    <div className="font-medium">{workOrder.assetName}</div>
                    <div className="text-xs text-muted-foreground">
                      {workOrder.asset}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-3">ร���ยละเอียดง���น</h3>
              <p className="text-muted-foreground leading-relaxed">
                {workOrder.description}
              </p>
            </div>

            {/* Additional Info */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-3">ข้อมูลเพิ่มเติม</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ประเภทงาน:</span>
                  <span className="ml-2 font-medium">{workOrder.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ผู้ขอ:</span>
                  <span className="ml-2 font-medium">
                    {workOrder.requestedBy}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่สร้าง:</span>
                  <span className="ml-2 font-medium">
                    {workOrder.createdDate}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">ประมาณการเวลา:</span>
                  <span className="ml-2 font-medium">
                    {workOrder.estimatedHours} ชั่วโมง
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="card-elevated rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  ความเห็น
                </h3>
                <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      เพิ่มความเห็น
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>เพิ่มความเห็น</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="comment">ความเห็น</Label>
                        <Textarea
                          id="comment"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="เขียนความเห็นหรือหมายเหตุ..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleAddComment} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          บันทึก
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCommentOpen(false)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {workOrder.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{comment.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                รายการงาน ({completedTasks}/{totalTasks})
              </h3>
              <div className="text-sm text-muted-foreground">
                เสร็จสิ้น {progressPercent}%
              </div>
            </div>
            {workOrder.tasks.map((task) => (
              <div
                key={task.id}
                className={`card-elevated rounded-xl p-4 ${task.isCritical ? "border-l-4 border-l-warning" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    {task.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.description}
                      </h4>
                      {task.isCritical && (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 border-warning text-warning"
                        >
                          สำคัญ
                        </Badge>
                      )}
                    </div>

                    {task.isCompleted ? (
                      <div className="space-y-1">
                        <p className="text-sm text-success">
                          ✓ {task.actualValue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          เสร็จสิ้น: {task.completedAt}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="เพิ่มรายละเอียดผลการทำงาน..."
                          value={taskNote}
                          onChange={(e) => setTaskNote(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            ถ่ายรูป
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markTaskComplete(task.id)}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            เสร็จสิ้น
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "parts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">อะไหล่ที่ใช้</h3>
              <div className="text-sm text-muted-foreground">
                {workOrder.parts.filter((p) => p.used).length}/
                {workOrder.parts.length} รายการ
              </div>
            </div>
            {workOrder.parts.map((part, index) => (
              <div key={index} className="card-elevated rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{part.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      รหัสชิ้นส่วน: {part.partNumber}
                    </p>
                    <p className="text-sm">
                      จำนวน: {part.quantity} {part.unit || "ชิ้น"}
                    </p>
                    {part.used && part.usedAt && (
                      <p className="text-xs text-muted-foreground">
                        ใช้เมื่อ: {part.usedAt}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {part.used ? (
                      <Badge className="bg-success text-success-foreground">
                        ใช้แล้ว
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="outline">พร้อมใช้</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="block text-xs"
                        >
                          ใช้อะไหล่
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">ไฟล์แนบ</h3>
              <div className="text-sm text-muted-foreground">
                {workOrder.attachments.length} ไฟล์
              </div>
            </div>
            {workOrder.attachments.map((file, index) => (
              <div key={index} className="card-elevated rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {file.type === "image" ? (
                      <Camera className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      อัปโหลดโดย: {file.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.uploadedAt}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    ดู
                  </Button>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              เพิ่มรูปภาพ/เอกสาร
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Settings className="h-4 w-4 mr-2" />
                อัปเดตสถานะ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัปเดตสถานะงาน</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>สถานะใหม่</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                      <SelectItem value="กำลังดำเนินการ">
                        กำลังดำเนินการ
                      </SelectItem>
                      <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                      <SelectItem value="เกินกำหนด">เกินกำหนด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleStatusUpdate} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStatusUpdateOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={timeLogOpen} onOpenChange={setTimeLogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Timer className="h-4 w-4 mr-2" />
                บันทึกเวลา
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>บันทึกเวลาทำงาน</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hours">เวลาที่ใช้ (ชั่วโมง)</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={loggedHours}
                    onChange={(e) => setLoggedHours(e.target.value)}
                    placeholder="เช่น 2.5"
                    step="0.5"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="workDesc">รายละเอียดงานที่ทำ</Label>
                  <Textarea
                    id="workDesc"
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="อธิบายงานที่ทำในช่วงเวลานี้..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleTimeLog} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTimeLogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Wrench className="h-4 w-4 mr-2" />
            เครื่องมือ
          </Button>
        </div>
      </div>
    </div>
  );
}
