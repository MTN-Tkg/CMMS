import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Wrench,
  FileText,
  User,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Timer,
  Target
} from 'lucide-react';
import { useSupabaseData } from '../hooks/use-supabase-data';
import { supabase } from '../../shared/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

interface PMTemplateDetail {
  id: string;
  pm_template_id: string;
  step_number: number;
  task_description: string;
  expected_input_type: string;
  standard_text_expected?: string;
  standard_min_value?: number;
  standard_max_value?: number;
  is_critical: boolean;
  remarks?: string;
}

interface WorkOrderTask {
  id: string;
  work_order_id: string;
  description: string;
  is_completed: boolean;
  actual_value_text?: string;
  actual_value_numeric?: number;
  completed_at?: string;
  // Additional fields from PM template details
  pm_template_detail?: PMTemplateDetail;
}

export default function PMExecution() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pmTemplates, assets, equipmentTypes, systems, locations } = useSupabaseData();
  
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [workOrderTasks, setWorkOrderTasks] = useState<WorkOrderTask[]>([]);
  const [pmTemplateDetails, setPmTemplateDetails] = useState<PMTemplateDetail[]>([]);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');

  // Find the PM template
  const template = pmTemplates.find(t => t.id === templateId);
  const equipmentType = template ? equipmentTypes.find(et => et.id === template.equipment_type_id) : null;
  const system = template ? systems.find(s => s.id === template.system_id) : null;
  
  // Get assets that match this template
  const matchingAssets = assets.filter(a => 
    template && a.equipment_type_id === template.equipment_type_id && a.system_id === template.system_id
  );

  // Load PM template details and initialize work order tasks
  useEffect(() => {
    const loadPMTemplateDetails = async () => {
      if (!template) return;

      try {
        // Load PM template details
        const { data: templateDetails, error: detailsError } = await supabase
          .from('pm_template_details')
          .select('*')
          .eq('pm_template_id', template.id)
          .order('step_number');

        if (detailsError) throw detailsError;
        setPmTemplateDetails(templateDetails || []);

        // Create work order and tasks if asset is selected
        if (selectedAsset && !currentWorkOrderId) {
          await createWorkOrderAndTasks(templateDetails || []);
        }
      } catch (error) {
        console.error('Error loading PM template details:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดรายละเอียด PM');
      }
    };

    loadPMTemplateDetails();
  }, [template, selectedAsset]);

  // Handle QR code from URL params
  useEffect(() => {
    const qr = searchParams.get('qr');
    if (qr) {
      setQrCode(qr);
    }
  }, [searchParams]);

  const createWorkOrderAndTasks = async (templateDetails: PMTemplateDetail[]) => {
    if (!template || !selectedAsset) return;

    try {
      // Create work order
      const woNumber = `PM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const workOrderData = {
        id: `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        work_type: 'preventive',
        title: `${template.name} - ${selectedAsset}`,
        description: `PM ตามแผน: ${template.name}${qrCode ? ` (QR: ${qrCode})` : ''}`,
        status: 'In Progress',
        priority: 3,
        asset_id: selectedAsset,
        system_id: template.system_id,
        pm_template_id: template.id,
        created_at: startTime.toISOString(),
        scheduled_date: startTime.toISOString(),
        wo_number: woNumber,
        estimated_hours: Math.round(template.estimated_minutes / 60),
        total_cost: 0,
        labor_cost: 0,
        parts_cost: 0
      };

      const { data: workOrder, error: woError } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (woError) throw woError;
      setCurrentWorkOrderId(workOrder.id);

      // Create work order tasks from template details using the actual database structure
      const tasksToInsert = templateDetails.map((detail, index) => ({
        id: `task-${workOrder.id}-${index}-${Date.now()}`,
        work_order_id: workOrder.id,
        description: detail.task_description,
        is_completed: false
      }));

      const { data: tasks, error: tasksError } = await supabase
        .from('work_order_tasks')
        .insert(tasksToInsert)
        .select();

      if (tasksError) throw tasksError;
      
      // Combine tasks with template details for UI
      const tasksWithDetails = (tasks || []).map((task, index) => ({
        ...task,
        pm_template_detail: templateDetails[index]
      }));
      
      setWorkOrderTasks(tasksWithDetails);

      toast.success('สร้าง Work Order และรายการงานเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error creating work order and tasks:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง Work Order');
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const now = new Date().toISOString();
      const updateData: any = {
        is_completed: completed,
        completed_at: completed ? now : null
      };

      const { error } = await supabase
        .from('work_order_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkOrderTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, ...updateData }
            : task
        )
      );

      toast.success(completed ? 'ทำเครื่องหมายงานเสร็จสิ้นแล้ว' : 'ยกเลิกการทำเครื่องหมายเสร็จสิ้น');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตงาน');
    }
  };

  const handleTaskValueChange = async (taskId: string, valueText?: string, valueNumeric?: number) => {
    try {
      const updateData: any = {};
      
      if (valueText !== undefined) {
        updateData.actual_value_text = valueText;
      }
      
      if (valueNumeric !== undefined) {
        updateData.actual_value_numeric = valueNumeric;
      }

      const { error } = await supabase
        .from('work_order_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setWorkOrderTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, ...updateData }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task value:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกค่า');
    }
  };

  const handleComplete = () => {
    setEndTime(new Date());
  };

  const handleSave = async () => {
    if (!selectedAsset || !template || !currentWorkOrderId) {
      toast.error('กรุณาเลือกอุปกรณ์และสร้าง Work Order');
      return;
    }

    setSaving(true);
    try {
      // Update work order status
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          status: endTime ? 'Completed' : 'In Progress',
          completed_at: endTime?.toISOString() || null,
          description: `PM ตามแผน: ${template.name}${qrCode ? ` (QR: ${qrCode})` : ''}\n\nหมายเหตุ: ${notes}`
        })
        .eq('id', currentWorkOrderId);

      if (updateError) throw updateError;

      toast.success('บันทึกข้อมูลสำเร็จ');
      navigate('/work-orders');
    } catch (error) {
      console.error('Error saving PM execution:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">ไม่พบแผน PM</p>
          <Button
            onClick={() => navigate('/preventive-maintenance')}
            variant="outline"
            className="mt-4"
          >
            กลับไปหน้าเลือก PM
          </Button>
        </div>
      </div>
    );
  }

  const allTasksCompleted = workOrderTasks.every(task => task.is_completed);
  const completedTasks = workOrderTasks.filter(task => task.is_completed).length;
  const totalTasks = workOrderTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/preventive-maintenance')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับ
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            {qrCode && (
              <Badge variant="outline" className="mt-2">
                QR: {qrCode}
              </Badge>
            )}
          </div>
          
          {totalTasks > 0 && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">ความคืบหน้า</div>
              <div className="text-lg font-semibold">{completedTasks}/{totalTasks}</div>
              <Progress value={progressPercentage} className="w-24 mt-1" />
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Wrench className="w-4 h-4" />
            <span>{equipmentType?.name_th || equipmentType?.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{system?.name_th || system?.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>ประมาณ {template.estimated_minutes} นาที</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>เริ่ม: {startTime.toLocaleTimeString('th-TH')}</span>
          </div>
        </div>
      </div>

      {/* Asset Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>เลือกอุปกรณ์</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- เลือกอุปกรณ์ --</option>
            {matchingAssets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.serial_number} - {asset.status}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {workOrderTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>รายการตรวจสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workOrderTasks.map((task, index) => {
                const templateDetail = task.pm_template_detail;
                return (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{templateDetail?.step_number || index + 1}</Badge>
                          <span className="font-medium">{task.description}</span>
                          {templateDetail?.is_critical === true && (
                            <Badge variant="destructive" className="text-xs">
                              สำคัญ
                            </Badge>
                          )}
                        </div>
                        
                        {templateDetail?.expected_input_type === 'number' && (
                          <div className="text-sm text-muted-foreground mb-2">
                            ค่าที่คาดหวัง: {templateDetail.standard_min_value} - {templateDetail.standard_max_value}
                          </div>
                        )}
                        
                        {templateDetail?.expected_input_type === 'text' && templateDetail.standard_text_expected && (
                          <div className="text-sm text-muted-foreground mb-2">
                            ค่าที่คาดหวัง: {templateDetail.standard_text_expected}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.is_completed && (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            เสร็จแล้ว
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Input */}
                    {templateDetail?.expected_input_type === 'number' && (
                      <div className="mb-3">
                        <Input
                          type="number"
                          placeholder="ป้อนค่าที่วัดได้"
                          value={task.actual_value_numeric || ''}
                          onChange={(e) => handleTaskValueChange(task.id, undefined, parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {(templateDetail?.expected_input_type === 'text' || !templateDetail?.expected_input_type) && (
                      <div className="mb-3">
                        <Input
                          type="text"
                          placeholder="ป้อนผลการตรวจสอบ"
                          value={task.actual_value_text || ''}
                          onChange={(e) => handleTaskValueChange(task.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {templateDetail?.expected_input_type === 'boolean' && (
                      <div className="mb-3">
                        <div className="flex gap-2">
                          <Button
                            variant={task.actual_value_text === 'true' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTaskValueChange(task.id, 'true')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            ปกติ
                          </Button>
                          <Button
                            variant={task.actual_value_text === 'false' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleTaskValueChange(task.id, 'false')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            ผิดปกติ
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={task.is_completed ? "outline" : "default"}
                        onClick={() => handleTaskComplete(task.id, !task.is_completed)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {task.is_completed ? 'ยกเลิกเสร็จสิ้น' : 'เสร็จแล้ว'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>หมายเหตุเพิ่มเติม</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="บันทึกข้อสังเกตหรือปัญหาที่พบ..."
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!endTime && allTasksCompleted && (
          <Button
            onClick={handleComplete}
            className="flex-1"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            เสร็จสิ้นการตรวจสอบ
          </Button>
        )}
        
        <Button
          onClick={handleSave}
          disabled={!selectedAsset || saving}
          variant={endTime ? 'default' : 'outline'}
          className="flex-1"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </Button>
      </div>

      {/* Status Summary */}
      {endTime && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">ตรวจสอบเสร็จสมบูรณ์</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              ใช้เวลา: {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} นาที
            </p>
            <p className="text-sm text-gray-600">
              งานที่เสร็จแล้ว: {completedTasks}/{totalTasks} งาน
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}