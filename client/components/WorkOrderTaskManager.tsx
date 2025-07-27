import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock, 
  ListTodo, ChevronUp, ChevronDown, Save, X 
} from 'lucide-react';
import { supabase } from '../../shared/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Removed drag-and-drop for now - can be added later with proper library installation

interface WorkOrderTask {
  id: string;
  work_order_id: string;
  description: string;
  is_critical: boolean;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  sequence_number?: number;
  estimated_minutes?: number;
  actual_minutes?: number;
}

interface WorkOrderTaskManagerProps {
  workOrderId: string;
  readOnly?: boolean;
  onTasksUpdate?: (tasks: WorkOrderTask[]) => void;
}

export function WorkOrderTaskManager({ workOrderId, readOnly = false, onTasksUpdate }: WorkOrderTaskManagerProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkOrderTask | null>(null);
  const [completionProgress, setCompletionProgress] = useState(0);
  
  // Form state for new/edit task
  const [taskForm, setTaskForm] = useState({
    description: '',
    is_critical: false,
    estimated_minutes: 30,
    notes: ''
  });

  useEffect(() => {
    if (workOrderId) {
      loadTasks();
    }
  }, [workOrderId]);

  useEffect(() => {
    // Calculate completion progress
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.is_completed).length;
      const progress = (completedTasks / tasks.length) * 100;
      setCompletionProgress(progress);
    } else {
      setCompletionProgress(0);
    }
  }, [tasks]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_tasks')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('sequence_number', { ascending: true });

      if (error) throw error;
      
      setTasks(data || []);
      if (onTasksUpdate) {
        onTasksUpdate(data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const newTask = {
        work_order_id: workOrderId,
        description: taskForm.description,
        is_critical: taskForm.is_critical,
        is_completed: false,
        estimated_minutes: taskForm.estimated_minutes,
        notes: taskForm.notes,
        sequence_number: tasks.length + 1
      };

      const { data, error } = await supabase
        .from('work_order_tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
      setShowAddDialog(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Task added successfully'
      });

      if (onTasksUpdate) {
        onTasksUpdate([...tasks, data]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('work_order_tasks')
        .update({
          description: taskForm.description,
          is_critical: taskForm.is_critical,
          estimated_minutes: taskForm.estimated_minutes,
          notes: taskForm.notes
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskForm }
          : task
      );
      
      setTasks(updatedTasks);
      setEditingTask(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });

      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const updateData: any = {
        is_completed: !isCompleted
      };

      if (!isCompleted) {
        updateData.completed_at = new Date().toISOString();
        // In a real app, you'd get the current user ID
        updateData.completed_by = 'current-user-id';
      } else {
        updateData.completed_at = null;
        updateData.completed_by = null;
      }

      const { error } = await supabase
        .from('work_order_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updateData }
          : task
      );
      
      setTasks(updatedTasks);
      
      toast({
        title: 'Success',
        description: `Task marked as ${!isCompleted ? 'completed' : 'incomplete'}`
      });

      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('work_order_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      });

      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sequence numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      sequence_number: index + 1
    }));

    setTasks(updatedItems);

    // Update sequence numbers in database
    try {
      for (const item of updatedItems) {
        await supabase
          .from('work_order_tasks')
          .update({ sequence_number: item.sequence_number })
          .eq('id', item.id);
      }

      toast({
        title: 'Success',
        description: 'Task order updated'
      });

      if (onTasksUpdate) {
        onTasksUpdate(updatedItems);
      }
    } catch (error) {
      console.error('Error updating task order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task order',
        variant: 'destructive'
      });
      // Revert on error
      loadTasks();
    }
  };

  const resetForm = () => {
    setTaskForm({
      description: '',
      is_critical: false,
      estimated_minutes: 30,
      notes: ''
    });
  };

  const openEditDialog = (task: WorkOrderTask) => {
    setEditingTask(task);
    setTaskForm({
      description: task.description,
      is_critical: task.is_critical,
      estimated_minutes: task.estimated_minutes || 30,
      notes: task.notes || ''
    });
  };

  const criticalTasksCount = tasks.filter(t => t.is_critical).length;
  const completedTasksCount = tasks.filter(t => t.is_completed).length;
  const criticalIncompleteCount = tasks.filter(t => t.is_critical && !t.is_completed).length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Work Order Tasks
              </CardTitle>
              <CardDescription>
                Manage and track tasks for this work order
              </CardDescription>
            </div>
            {!readOnly && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task for this work order
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Task Description *</Label>
                      <Textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the task..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="critical"
                        checked={taskForm.is_critical}
                        onCheckedChange={(checked) => 
                          setTaskForm(prev => ({ ...prev, is_critical: checked as boolean }))
                        }
                      />
                      <Label htmlFor="critical" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Mark as Critical Task
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Time (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={taskForm.estimated_minutes}
                        onChange={(e) => setTaskForm(prev => ({ 
                          ...prev, 
                          estimated_minutes: parseInt(e.target.value) || 30 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={taskForm.notes}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes or instructions..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setShowAddDialog(false);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTask} disabled={!taskForm.description.trim()}>
                        Add Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasksCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Critical Tasks</p>
              <p className="text-2xl font-bold text-red-600">{criticalTasksCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={completionProgress} className="flex-1" />
                <span className="text-sm font-medium">{completionProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {criticalIncompleteCount > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{criticalIncompleteCount} critical task{criticalIncompleteCount > 1 ? 's' : ''}</strong> still need to be completed
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks added yet</p>
              {!readOnly && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Task Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time Est.</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                            isDragDisabled={readOnly}
                          >
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={snapshot.isDragging ? 'opacity-50' : ''}
                              >
                                <TableCell {...provided.dragHandleProps}>
                                  {!readOnly && (
                                    <div className="flex flex-col items-center cursor-move">
                                      <ChevronUp className="h-3 w-3 -mb-1" />
                                      <ChevronDown className="h-3 w-3 -mt-1" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={task.is_completed}
                                        onCheckedChange={() => handleToggleComplete(task.id, task.is_completed)}
                                        disabled={readOnly}
                                      />
                                      <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                                        {task.description}
                                      </span>
                                      {task.is_critical && (
                                        <Badge variant="destructive" className="ml-2">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Critical
                                        </Badge>
                                      )}
                                    </div>
                                    {task.notes && (
                                      <p className="text-sm text-muted-foreground ml-6">{task.notes}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {task.is_completed ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {task.estimated_minutes && (
                                    <span className="text-sm">{task.estimated_minutes} min</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {!readOnly && (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDialog(task)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Task Description *</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="critical-edit"
                checked={taskForm.is_critical}
                onCheckedChange={(checked) => 
                  setTaskForm(prev => ({ ...prev, is_critical: checked as boolean }))
                }
              />
              <Label htmlFor="critical-edit" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Mark as Critical Task
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Estimated Time (minutes)</Label>
              <Input
                type="number"
                min="1"
                value={taskForm.estimated_minutes}
                onChange={(e) => setTaskForm(prev => ({ 
                  ...prev, 
                  estimated_minutes: parseInt(e.target.value) || 30 
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={taskForm.notes}
                onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions..."
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setEditingTask(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} disabled={!taskForm.description.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkOrderTaskManager;