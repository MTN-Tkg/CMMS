import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Wrench,
  FileText,
  Save,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface WorkOrderForm {
  title: string;
  description: string;
  priority: string;
  type: string;
  assignee: string;
  asset: string;
  location: string;
  dueDate: string;
  estimatedHours: string;
  parts: Array<{ id: string; name: string; quantity: number }>;
  instructions: string;
}

const priorityOptions = [
  { value: "วิกฤติ", label: "วิกฤติ", color: "destructive" },
  { value: "สูง", label: "สูง", color: "default" },
  { value: "ปานกลาง", label: "ปานกลาง", color: "secondary" },
  { value: "ต่ำ", label: "ต��ำ", color: "outline" },
];

const typeOptions = [
  { value: "ป้องกัน", label: "บำรุงรักษาเชิงป้องกัน" },
  { value: "แก้ไข", label: "งานซ่อมแซม" },
  { value: "ตรวจสอบ", label: "การตรวจสอบ" },
  { value: "ปรับปรุง", label: "งานปรับปรุง" },
];

const assets = [
  "CAT-320D-001",
  "PUMP-IR-001",
  "HARV-001",
  "FERT-SPR-001",
  "TRAC-JD-001",
  "IRRIG-SYS-001",
  "GEN-CAT-001",
];

const locations = [
  "ไร่ A",
  "ไร่ B",
  "ไร่ C",
  "จุดควบคุมน้ำ",
  "โรงซ่อม",
  "อู่เครื่องจักร",
  "คลังอะไหล่",
  "สำนักงาน",
];

const technicians = [
  "สมชาย รักงาน",
  "สมหญิง ใจดี",
  "สมศักดิ์ ช่างเก่ง",
  "สมใส ขยันดี",
  "สมคิด ช่วยงาน",
  "สมบูรณ์ เก่งกาจ",
];

const commonParts = [
  { id: "BELT-001", name: "เข็มขัดลำเลียง" },
  { id: "FILTER-001", name: "ไส้กรองน้ำมัน" },
  { id: "SPARK-001", name: "หัวเทียน" },
  { id: "SEAL-001", name: "ซีลกันน้ำมัน" },
  { id: "BEARING-001", name: "ลูกปืน" },
];

export function CreateWorkOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState<WorkOrderForm>({
    title: "",
    description: "",
    priority: "",
    type: "",
    assignee: "",
    asset: "",
    location: "",
    dueDate: "",
    estimatedHours: "",
    parts: [],
    instructions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof WorkOrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addPart = (partId: string, partName: string) => {
    setForm((prev) => ({
      ...prev,
      parts: [...prev.parts, { id: partId, name: partName, quantity: 1 }],
    }));
  };

  const removePart = (partId: string) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== partId),
    }));
  };

  const updatePartQuantity = (partId: string, quantity: number) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map((p) => (p.id === partId ? { ...p, quantity } : p)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.description ||
      !form.priority ||
      !form.type ||
      !form.assignee
    ) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);

    try {
      // สร้าง ID ใหม่
      const newId = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

      // จำลองการบันทึกข้อมูล
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`ใบสั่งงาน ${newId} ถูกสร้างเรียบร้อยแล้ว`);
      navigate("/work-orders");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างใบสั่งงาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find((p) => p.value === priority);
    return option?.color || "outline";
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              สร้างใบสั่งงานใหม่
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              เพิ่มงานบำรุงรักษาหรือซ่อมแซ��ใหม่
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ข้อมูลพื้นฐาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">หัวข้องาน *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="เช่น บำรุงรักษาเครื่องยนต์รถแทรกเตอร์"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="อธิบายรายละเอียดของงานที่ต้องการให้ทำ..."
                  rows={3}
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ความสำคัญ *</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      handleInputChange("priority", value)
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="เลือกความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={option.color as any}
                              className="text-xs"
                            >
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ประเภทงาน *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="เลือกประเภทงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* การมอบหมายงาน */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                การมอบหมายงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ผู้รับผิดชอบ *</Label>
                  <Select
                    value={form.assignee}
                    onValueChange={(value) =>
                      handleInputChange("assignee", value)
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="เลือกช่างผู้รับผิดชอบ" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">กำหนดเสร็จ</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value)
                      }
                      className="pl-10 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">ประมาณการเวลา (ชั่วโมง)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={form.estimatedHours}
                    onChange={(e) =>
                      handleInputChange("estimatedHours", e.target.value)
                    }
                    placeholder="เช่น 4"
                    className="pl-10 bg-background/50"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* อุปกรณ์และสถานที่ */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                อุปกรณ์และสถานที่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>อุปกรณ์/เครื่องจักร</Label>
                  <Select
                    value={form.asset}
                    onValueChange={(value) => handleInputChange("asset", value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="เลือกอุปกรณ์" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset} value={asset}>
                          {asset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>สถานที่</Label>
                  <Select
                    value={form.location}
                    onValueChange={(value) =>
                      handleInputChange("location", value)
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="เลือกสถานที่" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* อะไหล่ที่ต้องใช้ */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                อะไหล่ที่ต้องใช้
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {commonParts.map((part) => (
                  <Button
                    key={part.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPart(part.id, part.name)}
                    disabled={form.parts.some((p) => p.id === part.id)}
                    className="justify-start text-left bg-background/50"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    {part.name}
                  </Button>
                ))}
              </div>

              {form.parts.length > 0 && (
                <div className="space-y-2">
                  <Label>อะไหล่ที่เลือก</Label>
                  <div className="space-y-2">
                    {form.parts.map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <span className="flex-1 text-sm font-medium">
                          {part.name}
                        </span>
                        <Input
                          type="number"
                          value={part.quantity}
                          onChange={(e) =>
                            updatePartQuantity(
                              part.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-20 h-8 text-center"
                          min="1"
                        />
                        <span className="text-sm text-muted-foreground">
                          ชิ้น
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePart(part.id)}
                          className="text-destructive hover:text-destructive p-1 h-auto"
                        >
                          ลบ
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* คำแนะนำเพิ่มเติม */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                คำแนะนำเพิ่มเติม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="instructions">คำแนะนำสำหรับช่าง</Label>
                <Textarea
                  id="instructions"
                  value={form.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  placeholder="คำแนะนำเพิ่มเติม ข้อควรระวัง หรือขั้นตอนพิเศษ..."
                  rows={3}
                  className="bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* ปุ่มบันทึก */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/work-orders")}
              className="flex-1 sm:flex-none"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกใบสั่งงาน
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
