import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Plus,
  Save,
  Edit3,
  Trash2,
  Lock,
  Eye,
  AlertCircle,
  User
} from "lucide-react";
import { toast } from "sonner";
import { workOrderCommentService, type WorkOrderComment } from "../../shared/work-order-service";

interface WorkOrderCommentsProps {
  workOrderId: string;
  readOnly?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

export function WorkOrderComments({ 
  workOrderId, 
  readOnly = false,
  currentUserId = 'current-user',
  currentUserName = 'ผู้ใช้ปัจจุบัน'
}: WorkOrderCommentsProps) {
  const [comments, setComments] = useState<WorkOrderComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [workOrderId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workOrderCommentService.getComments(workOrderId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('ไม่สามารถโหลดความเห็นได้');
      // Fallback to mock data if tables don't exist
      setComments([
        {
          id: 'mock-1',
          work_order_id: workOrderId,
          user_id: 'user-1',
          comment: 'เริ่มงานแล้ว ตรวจสอบสภาพเครื่องยนต์เบื้องต้น',
          is_internal: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-2',
          work_order_id: workOrderId,
          user_id: 'user-2',
          comment: 'โปรดระวังการตรวจสอบระบบไฮดรอลิก เคยมีปัญหามาก่อน',
          is_internal: true,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('กรุณาเขียนความเห็น');
      return;
    }

    try {
      const result = await workOrderCommentService.addComment({
        work_order_id: workOrderId,
        user_id: currentUserId,
        comment: newComment.trim(),
        is_internal: isInternal
      });

      if (result) {
        setComments(prev => [...prev, result]);
        setNewComment('');
        setIsInternal(false);
        setCommentDialogOpen(false);
        toast.success('เพิ่มความเห็นเรียบร้อยแล้ว');
      } else {
        // Fallback for when tables don't exist
        const mockComment: WorkOrderComment = {
          id: `mock-${Date.now()}`,
          work_order_id: workOrderId,
          user_id: currentUserId,
          comment: newComment.trim(),
          is_internal: isInternal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setComments(prev => [...prev, mockComment]);
        setNewComment('');
        setIsInternal(false);
        setCommentDialogOpen(false);
        toast.success('เพิ่มความเห็นเรียบร้อยแล้ว (โหมดทดสอบ)');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('ไม่สามารถเพิ่มความเห็นได้');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error('กรุณาเขียนความเห็น');
      return;
    }

    try {
      const result = await workOrderCommentService.updateComment(commentId, editText.trim());
      
      if (result) {
        setComments(prev => prev.map(c => c.id === commentId ? result : c));
        setEditingComment(null);
        setEditText('');
        toast.success('แก้ไขความเห็นเรียบร้อยแล้ว');
      } else {
        // Fallback for when tables don't exist
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, comment: editText.trim(), updated_at: new Date().toISOString() }
            : c
        ));
        setEditingComment(null);
        setEditText('');
        toast.success('แก้ไขความเห็นเรียบร้อยแล้ว (โหมดทดสอบ)');
      }
    } catch (err) {
      console.error('Error editing comment:', err);
      toast.error('ไม่สามารถแก้ไขความเห็นได้');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('คุณต้องการลบความเห็นนี้หรือไม่?')) {
      return;
    }

    try {
      const success = await workOrderCommentService.deleteComment(commentId);
      
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('ลบความเห็นเรียบร้อยแล้ว');
      } else {
        // Fallback for when tables don't exist
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('ลบความเห็นเรียบร้อยแล้ว (โหมดทดสอบ)');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('ไม่สามารถลบความเห็นได้');
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

  const getUserName = (userId: string) => {
    // In a real app, this would look up user names
    const userNames: Record<string, string> = {
      'user-1': 'สมชาย รักงาน',
      'user-2': 'สมศักดิ์ หัวหน้าช่าง',
      'current-user': currentUserName
    };
    return userNames[userId] || 'ผู้ใช้ไม่ทราบชื่อ';
  };

  const getUserInitials = (userId: string) => {
    const name = getUserName(userId);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            ความเห็น
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            ความเห็น ({comments.length})
          </CardTitle>
          {!readOnly && (
            <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มความเห็น
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มความเห็น</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="เขียนความเห็นหรือหมายเหตุ..."
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="internal" className="text-sm flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      ความเห็นภายใน (เฉพาะทีมงาน)
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddComment} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      บันทึก
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCommentDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>ยังไม่มีความเห็น</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(comment.user_id || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getUserName(comment.user_id || '')}
                      </span>
                      {comment.is_internal && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          ภายใน
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      {!readOnly && comment.user_id === currentUserId && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditText(comment.comment);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          บันทึก
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditText('');
                          }}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                  )}
                  
                  {comment.updated_at !== comment.created_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      แก้ไขเมื่อ {formatDate(comment.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}