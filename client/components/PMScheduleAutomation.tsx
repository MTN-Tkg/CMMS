import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Plus, Calendar, Play, Pause, AlertCircle, 
  CheckCircle, Clock, TrendingUp, Activity 
} from 'lucide-react';
import { PMScheduleService, type PMScheduleWithDetails } from '../../shared/pm-schedule-service';
import { supabase } from '../../shared/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


export function PMScheduleAutomation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<PMScheduleWithDetails[]>([]);
  const [dueSchedules, setDueSchedules] = useState<PMScheduleWithDetails[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [generationResults, setGenerationResults] = useState<any>(null);
  
  // Form data for new schedule
  const [formData, setFormData] = useState({
    company_id: '',
    pm_template_id: '',
    asset_id: '',
    frequency_type: 'monthly',
    frequency_value: 1,
    next_due_date: '',
    auto_assign_to_user_id: '',
    auto_priority: 'medium',
    lead_time_days: 7
  });

  // Reference data
  const [companies, setCompanies] = useState<any[]>([]);
  const [pmTemplates, setPMTemplates] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    totalSchedules: 0,
    activeSchedules: 0,
    dueToday: 0,
    overdue: 0,
    complianceRate: 0
  });

  useEffect(() => {
    loadReferenceData();
    loadSchedules();
    loadStatistics();
  }, [selectedCompany]);

  const loadReferenceData = async () => {
    try {
      // Load companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name, code')
        .order('name');
      setCompanies(companiesData || []);

      // Load PM templates
      const { data: templatesData } = await supabase
        .from('pm_templates')
        .select('id, name, template_code')
        .order('name');
      setPMTemplates(templatesData || []);

      // Load assets
      const { data: assetsData } = await supabase
        .from('assets')
        .select('id, serial_number')
        .eq('status', 'active')
        .order('serial_number');
      setAssets(assetsData || []);

      // Load users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('first_name');
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedules = await PMScheduleService.getPMSchedulesByCompany(
        selectedCompany || companies[0]?.id
      );
      setSchedules(schedules);

      // Load due schedules
      const due = await PMScheduleService.getDuePMSchedules(selectedCompany);
      setDueSchedules(due);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PM schedules',
        variant: 'destructive'
      });
    }
  };

  const loadStatistics = async () => {
    if (!selectedCompany && companies.length === 0) return;

    try {
      const companyId = selectedCompany || companies[0]?.id;
      const complianceStats = await PMScheduleService.getPMComplianceStats(companyId);
      
      setStats({
        totalSchedules: schedules.length,
        activeSchedules: schedules.filter(s => s.is_active).length,
        dueToday: dueSchedules.filter(s => {
          const dueDate = new Date(s.next_due_date);
          const today = new Date();
          return dueDate.toDateString() === today.toDateString();
        }).length,
        overdue: dueSchedules.filter(s => {
          const dueDate = new Date(s.next_due_date);
          const today = new Date();
          return dueDate < today;
        }).length,
        complianceRate: complianceStats.complianceRate
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateSchedule = async () => {
    setLoading(true);
    try {
      await PMScheduleService.createPMSchedule({
        pmTemplateId: formData.pm_template_id,
        assetId: formData.asset_id,
        companyId: formData.company_id,
        frequencyType: formData.frequency_type as any,
        frequencyValue: formData.frequency_value,
        nextDueDate: formData.next_due_date,
        autoAssignToUserId: formData.auto_assign_to_user_id || undefined,
        autoPriority: formData.auto_priority as any,
        leadTimeDays: formData.lead_time_days
      });

      toast({
        title: 'Success',
        description: 'PM schedule created successfully'
      });

      setShowDialog(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create PM schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkOrders = async () => {
    setLoading(true);
    try {
      const results = await PMScheduleService.batchGenerateWorkOrders(selectedCompany);
      
      setGenerationResults(results);
      
      toast({
        title: 'Work Orders Generated',
        description: `Successfully generated ${results.success} work orders. ${results.failed} failed.`
      });

      loadSchedules();
      loadStatistics();
    } catch (error) {
      console.error('Error generating work orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate work orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      await PMScheduleService.updatePMSchedule(scheduleId, { is_active: !isActive });
      
      toast({
        title: 'Success',
        description: `PM schedule ${!isActive ? 'activated' : 'deactivated'}`
      });

      loadSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update PM schedule',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      company_id: '',
      pm_template_id: '',
      asset_id: '',
      frequency_type: 'monthly',
      frequency_value: 1,
      next_due_date: '',
      auto_assign_to_user_id: '',
      auto_priority: 'medium',
      lead_time_days: 7
    });
  };

  const getStatusBadge = (schedule: PMScheduleWithDetails) => {
    const today = new Date();
    const dueDate = new Date(schedule.next_due_date);
    const leadDate = new Date(dueDate);
    leadDate.setDate(leadDate.getDate() - schedule.lead_time_days);

    if (!schedule.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (dueDate < today) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (leadDate <= today) {
      return <Badge variant="warning">Due Soon</Badge>;
    } else {
      return <Badge variant="success">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSchedules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.dueToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>PM Schedule Automation</CardTitle>
              <CardDescription>
                Manage and automate preventive maintenance schedules
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleGenerateWorkOrders}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Generate Due Work Orders
              </Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create PM Schedule</DialogTitle>
                    <DialogDescription>
                      Set up automated preventive maintenance schedule
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company *</Label>
                        <Select
                          value={formData.company_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map(company => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>PM Template *</Label>
                        <Select
                          value={formData.pm_template_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, pm_template_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {pmTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Asset *</Label>
                        <Select
                          value={formData.asset_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {assets.map(asset => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.serial_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Next Due Date *</Label>
                        <Input
                          type="date"
                          value={formData.next_due_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_due_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency Type</Label>
                        <Select
                          value={formData.frequency_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, frequency_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency Value</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.frequency_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, frequency_value: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Auto Assign To</Label>
                        <Select
                          value={formData.auto_assign_to_user_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, auto_assign_to_user_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No auto-assignment</SelectItem>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Lead Time (days)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.lead_time_days}
                          onChange={(e) => setFormData(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSchedule} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedules">
            <TabsList>
              <TabsTrigger value="schedules">All Schedules</TabsTrigger>
              <TabsTrigger value="due">Due for Generation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedules">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PM Template</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.pm_template?.name}</TableCell>
                      <TableCell>{schedule.asset?.serial_number}</TableCell>
                      <TableCell>
                        {schedule.frequency_value} {schedule.frequency_type}
                      </TableCell>
                      <TableCell>
                        {format(new Date(schedule.next_due_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {schedule.last_generated_date 
                          ? format(new Date(schedule.last_generated_date), 'MMM dd, yyyy')
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.is_active}
                          onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="due">
              {dueSchedules.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No PM schedules are currently due for work order generation.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PM Template</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueSchedules.map(schedule => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(schedule.next_due_date).getTime()) 
                        / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>{schedule.pm_template?.name}</TableCell>
                          <TableCell>{schedule.asset?.serial_number}</TableCell>
                          <TableCell>
                            {format(new Date(schedule.next_due_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={daysOverdue > 0 ? 'destructive' : 'warning'}>
                              {daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Due soon'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{schedule.auto_priority}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>

          {/* Generation Results */}
          {generationResults && (
            <Alert className="mt-4">
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Work Order Generation Results:</div>
                <div className="space-y-1">
                  <div>✅ Successfully generated: {generationResults.success}</div>
                  <div>❌ Failed: {generationResults.failed}</div>
                  {generationResults.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold">Errors:</div>
                      {generationResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm text-red-600">
                          Schedule {error.scheduleId}: {error.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PMScheduleAutomation;