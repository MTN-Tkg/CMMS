import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  History,
  User,
  Clock,
  ArrowRight,
  AlertCircle,
  Settings,
  UserCheck,
  Flag,
  CheckCircle,
  Edit3
} from "lucide-react";
import { workOrderHistoryService, type WorkOrderHistory } from "../../shared/work-order-service";

interface WorkOrderHistoryProps {
  workOrderId: string;
  className?: string;
}

export function WorkOrderHistory({ workOrderId, className }: WorkOrderHistoryProps) {
  const [history, setHistory] = useState<WorkOrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history
  useEffect(() => {
    loadHistory();
  }, [workOrderId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workOrderHistoryService.getHistory(workOrderId);
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('ไม่สามารถโหลดประวัติได้');
      // Fallback to mock data if tables don't exist
      setHistory([
        {
          id: 'mock-1',
          work_order_id: workOrderId,
          field_changed: 'status',
          old_value: 'Open',
          new_value: 'In Progress',
          changed_by: 'สมชาย รักงาน',
          changed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-2',
          work_order_id: workOrderId,
          field_changed: 'assigned_to',
          old_value: 'ไม่ระบุ',
          new_value: 'สมชาย รักงาน',
          changed_by: 'สมศักดิ์ หัวหน้าช่าง',
          changed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-3',
          work_order_id: workOrderId,
          field_changed: 'priority',
          old_value: 'Medium',
          new_value: 'High',
          changed_by: 'สมศักดิ์ หัวหน้าช่าง',
          changed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'status':
        return <Settings className="h-4 w-4" />;
      case 'assigned_to':
        return <UserCheck className="h-4 w-4" />;
      case 'priority':
        return <Flag className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Edit3 className="h-4 w-4" />;
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      'status': 'สถานะ',
      'assigned_to': 'ผู้รับผิดชอบ',
      'priority': 'ความสำคัญ',
      'completed': 'การเสร็จสิ้น',
      'title': 'หัวข้อ',
      'description': 'รายละเอียด',
      'due_date': 'กำหนดเสร็จ',
      'estimated_hours': 'ประมาณเวลา'
    };
    return labels[field] || field;
  };

  const getValueDisplay = (field: string, value: string) => {
    if (!value) return 'ไม่ระบุ';
    
    // Translate common values
    const translations: Record<string, string> = {
      'Open': 'เปิด',
      'In Progress': 'กำลังดำเนินการ',
      'Completed': 'เสร็จสิ้น',
      'Pending': 'รอดำเนินการ',
      'Low': 'ต่ำ',
      'Medium': 'ปานกลาง',
      'High': 'สูง',
      'Critical': 'วิกฤติ',
      'true': 'เสร็จสิ้น',
      'false': 'ยังไม่เสร็จ'
    };
    
    return translations[value] || value;
  };

  const getChangeColor = (field: string, newValue: string) => {
    switch (field) {
      case 'status':
        if (newValue === 'Completed' || newValue === 'เสร็จสิ้น') return 'text-success';
        if (newValue === 'In Progress' || newValue === 'กำลังดำเนินการ') return 'text-warning';
        return 'text-primary';
      case 'priority':
        if (newValue === 'High' || newValue === 'Critical') return 'text-destructive';
        if (newValue === 'Medium') return 'text-warning';
        return 'text-muted-foreground';
      case 'completed':
        return newValue === 'true' ? 'text-success' : 'text-muted-foreground';
      default:
        return 'text-primary';
    }
  };

  const getUserInitials = (userName: string) => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card className={`card-elevated ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            ประวัติการเปลี่ยนแปลง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-elevated ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          ประวัติการเปลี่ยนแปลง ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>ยังไม่มีประวัติการเปลี่ยนแปลง</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              {history.map((record, index) => (
                <div key={record.id} className="relative flex gap-4 pb-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary">
                    {getFieldIcon(record.field_changed)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {getFieldLabel(record.field_changed)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          เปลี่ยนแปลง
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(record.changed_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-muted-foreground">
                        {getValueDisplay(record.field_changed, record.old_value || '')}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className={`font-medium ${getChangeColor(record.field_changed, record.new_value || '')}`}>
                        {getValueDisplay(record.field_changed, record.new_value || '')}
                      </span>
                    </div>
                    
                    {record.changed_by && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>โดย {record.changed_by}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}