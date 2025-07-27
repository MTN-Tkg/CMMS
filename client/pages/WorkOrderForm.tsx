import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Save, ArrowLeft, AlertCircle, FileText, Upload, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "../../shared/supabase/client";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { createTableService } from "../../shared/supabase";
import { FileAttachment } from "@/components/FileAttachment";
import { WorkOrderTemplates } from "@/components/WorkOrderTemplates";
import { TimeTracking } from "@/components/TimeTracking";

interface User {
  id: string;
  name: string;
  role: string;
}

interface WorkOrderFormData {
  wo_number: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  scheduled_date: Date | undefined;
  due_date: Date | undefined;
  asset_id: string;
  location_id: string;
  assigned_to: string;
  estimated_hours: number;
  actual_hours: number;
  cost: number;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description: string;
  userId: string;
  userName: string;
  taskId?: string;
  taskName?: string;
  isActive: boolean;
}

export function WorkOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { assets, locations, equipmentTypes, refresh } = useSupabaseData();
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for enhanced features
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState<WorkOrderFormData>({
    wo_number: "",
    title: "",
    description: "",
    priority: 2,
    status: "Pending",
    scheduled_date: undefined,
    due_date: undefined,
    asset_id: "",
    location_id: "",
    assigned_to: "",
    estimated_hours: 0,
    actual_hours: 0,
    cost: 0,
  });

  // Generate Work Order Number
  const generateWONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WO-${year}${month}${day}-${random}`;
  };

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      const usersService = createTableService('users');
      const { data, error } = await usersService.getAll();
      if (!error && data) {
        setUsers(data as User[]);
      }
    };
    loadUsers();
  }, []);

  // Load existing work order if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadWorkOrder(id);
    } else {
      // Generate new WO number for new work orders
      setFormData(prev => ({
        ...prev,
        wo_number: generateWONumber()
      }));
    }
  }, [id, isEditMode]);

  const loadWorkOrder = async (workOrderId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', workOrderId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          ...data,
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
          due_date: data.due_date ? new Date(data.due_date) : undefined,
        });
      }
    } catch (err) {
      console.error('Error loading work order:', err);
      setError('ไม่สามารถโหลดข้อมูลใบสั่งงานได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title) {
      setError('กรุณากรอกหัวข้องาน');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        scheduled_date: formData.scheduled_date?.toISOString(),
        due_date: formData.due_date?.toISOString(),
        updated_at: new Date().toISOString(),
      };

      let result;
      if (isEditMode) {
        // Update existing work order
        result = await supabase
          .from('work_orders')
          .update(dataToSave)
          .eq('id', id);
      } else {
        // Create new work order
        result = await supabase
          .from('work_orders')
          .insert([{
            ...dataToSave,
            created_at: new Date().toISOString(),
          }]);
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw new Error(`Database error: ${result.error.message}`);
      }

      // Refresh data and navigate back
      await refresh();
      navigate('/work-orders');
    } catch (err: any) {
      console.error('Error saving work order:', err);
      setError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      priority: template.priority,
      estimated_hours: template.estimatedHours
    }));
    setShowTemplateDialog(false);
  };

  const handleTimeUpdate = (newActualHours: number) => {
    setFormData(prev => ({
      ...prev,
      actual_hours: newActualHours
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/work-orders')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">
              {isEditMode ? 'แก้ไขใบสั่งงาน' : 'สร้างใบสั่งงานใหม่'}
            </h1>
          </div>
          
          {!isEditMode && (
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  ใช้เทมเพลต
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>เลือกเทมเพลตใบสั่งงาน</DialogTitle>
                </DialogHeader>
                <WorkOrderTemplates
                  onSelectTemplate={handleTemplateSelect}
                  showSelectMode={true}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
              <TabsTrigger value="attachments">ไฟล์แนบ</TabsTrigger>
              <TabsTrigger value="time">จับเวลา</TabsTrigger>
              <TabsTrigger value="advanced">ขั้นสูง</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลใบสั่งงาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
              {/* Work Order Number and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wo_number">เลขที่ใบสั่งงาน</Label>
                  <Input
                    id="wo_number"
                    value={formData.wo_number}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">หัวข้องาน *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="ระบุหัวข้องาน"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดงาน</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="อธิบายรายละเอียดของงาน"
                  rows={4}
                />
              </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">ความสำคัญ *</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) => handleInputChange('priority', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ต่ำ</SelectItem>
                      <SelectItem value="2">ปานกลาง</SelectItem>
                      <SelectItem value="3">สูง</SelectItem>
                      <SelectItem value="4">วิกฤติ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">รอดำเนินการ</SelectItem>
                      <SelectItem value="In Progress">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="On Hold">พักงาน</SelectItem>
                      <SelectItem value="Completed">เสร็จสิ้น</SelectItem>
                      <SelectItem value="Cancelled">ยกเลิก</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>วันที่กำหนดการ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduled_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduled_date ? (
                          format(formData.scheduled_date, "PPP", { locale: th })
                        ) : (
                          <span>เลือกวันที่</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduled_date}
                        onSelect={(date) => handleInputChange('scheduled_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>วันที่ครบกำหนด</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? (
                          format(formData.due_date, "PPP", { locale: th })
                        ) : (
                          <span>เลือกวันที่</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => handleInputChange('due_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Asset and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset_id">อุปกรณ์</Label>
                  <Select
                    value={formData.asset_id || "__none__"}
                    onValueChange={(value) => handleInputChange('asset_id', value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกอุปกรณ์" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.serial_number} - {
                            equipmentTypes.find(et => et.id === asset.equipment_type_id)?.name_th ||
                            equipmentTypes.find(et => et.id === asset.equipment_type_id)?.name ||
                            'ไม่ระบุประเภท'
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_id">สถานที่</Label>
                  <Select
                    value={formData.location_id || "__none__"}
                    onValueChange={(value) => handleInputChange('location_id', value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานที่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label htmlFor="assigned_to">มอบหมายให้</Label>
                <Select
                  value={formData.assigned_to || "__none__"}
                  onValueChange={(value) => handleInputChange('assigned_to', value === "__none__" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hours and Cost */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">ชั่วโมงโดยประมาณ</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual_hours">ชั่วโมงที่ใช้จริง</Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actual_hours}
                    onChange={(e) => handleInputChange('actual_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">ค่าใช้จ่าย (บาท)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/work-orders')}
                      disabled={saving}
                    >
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'สร้างใบสั่งงาน')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    ไฟล์แนบ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileAttachment
                    files={attachedFiles}
                    onFilesChange={setAttachedFiles}
                    maxFiles={10}
                    maxFileSize={10}
                    readOnly={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    การจับเวลา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeTracking
                    workOrderId={formData.wo_number}
                    estimatedHours={formData.estimated_hours}
                    actualHours={formData.actual_hours}
                    onTimeUpdate={handleTimeUpdate}
                    timeEntries={timeEntries}
                    onTimeEntriesUpdate={setTimeEntries}
                    readOnly={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าขั้นสูง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">การแจ้งเตือน</h4>
                    <p className="text-sm text-muted-foreground">
                      ตั้งค่าการแจ้งเตือนสำหรับใบสั่งงานนี้
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">การอนุมัติ</h4>
                    <p className="text-sm text-muted-foreground">
                      กำหนดขั้นตอนการอนุมัติสำหรับใบสั่งงานนี้
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}