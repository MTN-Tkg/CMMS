import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Settings,
  Wrench,
  Save,
  Send,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock user data - in real app this would come from auth context
const currentUser = {
  id: "USER-001",
  name: "สมชาย รักงาน",
  role: "ช่างบำรุงรักษา",
};

export function CreateWorkOrderFromQR() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const equipmentId = searchParams.get("equipment");
  const pmTemplateId = searchParams.get("template");

  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("ปานกลาง");
  const [estimatedHours, setEstimatedHours] = useState("");

  // Mock equipment data (in real app, this would be fetched based on equipmentId)
  const equipment = {
    id: "TRACT-001",
    name: "รถแทรกเตอร์ Kubota M7060",
    type: "รถแทรกเตอร์",
    location: "ไร่ A",
    status: "ใช้งานได้",
  };

  const pmTemplate = {
    id: "PM-TRACTOR-WEEKLY",
    name: "การบำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
    description: "การตรวจสอบและบำรุงรักษาตามกำหนดสำหรับรถแทรกเตอร์",
    estimatedTime: "2 ชั่วโมง",
    tasks: [
      { id: 1, description: "ตรวจสอบระดับน้ำมันเครื่อง", isCritical: true },
      { id: 2, description: "ตรวจสอบระดับน้ำในหม้อน้ำ", isCritical: true },
      { id: 3, description: "ตรวจสอบแรงดันลมยาง", isCritical: false },
      { id: 4, description: "ทำความสะอาดไส้กรองอากาศ", isCritical: false },
      {
        id: 5,
        description: "ตรวจสอบการทำงานของไฟส่องสว่าง",
        isCritical: false,
      },
    ],
    parts: [
      { name: "น้ำมันเครื่อง 15W-40", quantity: 1, unit: "ลิตร" },
      { name: "ไส้กรองอากาศ", quantity: 1, unit: "ชิ้น" },
      { name: "น้ำกลั่น", quantity: 2, unit: "ลิตร" },
    ],
  };

  const handleCreateWorkOrder = () => {
    // In real app, this would create the work order via API
    const newWorkOrder = {
      id: `WO-${Date.now()}`,
      title: pmTemplate.name,
      description: `${pmTemplate.description}\n\nหมายเหตุเพิ่มเติม: ${notes}`,
      status: "รอดำเนินการ",
      priority: priority,
      assignee: currentUser.name,
      asset: equipment.id,
      assetName: equipment.name,
      location: equipment.location,
      pmTemplateId: pmTemplate.id,
      estimatedHours: estimatedHours || "2",
      createdAt: new Date().toLocaleDateString("th-TH"),
      dueDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("th-TH"), // 7 days from now
      tasks: pmTemplate.tasks.map((task) => ({
        ...task,
        isCompleted: false,
        actualValue: "",
        completedAt: null,
      })),
    };

    // Simulate navigation to the created work order
    navigate(`/work-orders/WO-${Date.now()}`);
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

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Link to="/qr-scanner">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">
              สร้างใบสั่งงานจาก QR Scan
            </h1>
            <p className="text-sm text-muted-foreground">
              สร้างงานบำรุงรักษาจากการสแกน QR code
            </p>
          </div>
        </div>

        {/* Equipment Info */}
        <div className="card-elevated rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ข้อมูลอุปกรณ์
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">ชื่ออุปกรณ์</div>
              <div className="font-medium">{equipment.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">รหัสอุปกรณ์</div>
              <div className="font-medium font-mono">{equipment.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">ประเภท</div>
              <div className="font-medium">{equipment.type}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">สถานที่</div>
              <div className="font-medium">{equipment.location}</div>
            </div>
          </div>
        </div>

        {/* PM Template Info */}
        <div className="card-elevated rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            แม่แบบการบำรุงรักษา
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{pmTemplate.name}</h4>
              <Badge variant="outline">{pmTemplate.estimatedTime}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {pmTemplate.description}
            </p>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">รายการตรวจสอบ:</h5>
              <div className="space-y-2">
                {pmTemplate.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{task.description}</span>
                    {task.isCritical && (
                      <Badge variant="destructive" className="text-xs">
                        สำคัญ
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">อะไหล่ที่ต้องใช้:</h5>
              <div className="space-y-2">
                {pmTemplate.parts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <span>{part.name}</span>
                    <span className="text-muted-foreground">
                      {part.quantity} {part.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Work Order Details Form */}
        <div className="card-elevated rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            รายละเอียดใบสั่งงาน
          </h3>

          <div className="space-y-4">
            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ระดับความสำคัญ</label>
              <div className="flex gap-2">
                {["ต่ำ", "ปานกลาง", "สูง", "วิกฤติ"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPriority(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priority === level
                        ? getPriorityColor(level)
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                เวลาที่ประมาณการ (ชั่วโมง)
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="2"
                className="w-full p-3 border rounded-lg text-sm"
                min="0.5"
                step="0.5"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หมายเหตุเพิ่มเติม</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุหรือข้อกำหนดพิเศษ..."
                className="min-h-20"
              />
            </div>

            {/* Assigned to */}
            <div className="space-y-2">
              <label className="text-sm font-medium">มอบหมายให้</label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{currentUser.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleCreateWorkOrder}
            className="bg-gradient-to-r from-primary to-primary/90"
          >
            <Send className="h-4 w-4 mr-2" />
            สร้างใบสั่งงาน
          </Button>
          <Link to="/qr-scanner">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปสแกน
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
