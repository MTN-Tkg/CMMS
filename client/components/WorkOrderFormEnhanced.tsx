import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { WorkOrderServiceEnhanced } from '../../shared/work-order-service-enhanced';
import { supabase } from '../../shared/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderFormProps {
  assetId?: string;
  pmTemplateId?: string;
  onSuccess?: (workOrderId: string) => void;
}

export function WorkOrderFormEnhanced({ assetId, pmTemplateId, onSuccess }: WorkOrderFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [pmTemplates, setPMTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    assetId: assetId || '',
    title: '',
    description: '',
    workType: 'CM' as 'PM' | 'CM' | 'EM' | 'INSP',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    pmTemplateId: pmTemplateId || '',
    scheduledDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    requestedBy: ''
  });

  // Auto-filled data display
  const [autoFilledData, setAutoFilledData] = useState({
    companyName: '',
    systemName: '',
    locationName: '',
    assetSerial: ''
  });

  // Load assets, PM templates, and users
  useEffect(() => {
    loadFormData();
  }, []);

  // Auto-fill when asset is selected
  useEffect(() => {
    if (formData.assetId) {
      loadAssetDetails(formData.assetId);
    }
  }, [formData.assetId]);

  // Auto-fill from PM template
  useEffect(() => {
    if (formData.pmTemplateId) {
      loadPMTemplateDetails(formData.pmTemplateId);
    }
  }, [formData.pmTemplateId]);

  const loadFormData = async () => {
    try {
      // Load assets
      const { data: assetsData } = await supabase
        .from('assets')
        .select('id, serial_number, status')
        .eq('status', 'active')
        .order('serial_number');
      
      setAssets(assetsData || []);

      // Load PM templates
      const { data: templatesData } = await supabase
        .from('pm_templates')
        .select('id, name, template_code')
        .order('name');
      
      setPMTemplates(templatesData || []);

      // Load users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name');
      
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        variant: 'destructive'
      });
    }
  };

  const loadAssetDetails = async (assetId: string) => {
    try {
      const { data: asset } = await supabase
        .from('assets')
        .select(`
          *,
          system:systems(
            *,
            company:companies(name, code),
            location:locations(name, code)
          )
        `)
        .eq('id', assetId)
        .single();

      if (asset) {
        setAutoFilledData({
          companyName: asset.system?.company?.name || 'N/A',
          systemName: asset.system?.name || 'N/A',
          locationName: asset.system?.location?.name || 'N/A',
          assetSerial: asset.serial_number || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error loading asset details:', error);
    }
  };

  const loadPMTemplateDetails = async (templateId: string) => {
    try {
      const { data: template } = await supabase
        .from('pm_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template) {
        setFormData(prev => ({
          ...prev,
          title: `PM - ${template.name}`,
          description: template.description || '',
          workType: 'PM'
        }));
      }
    } catch (error) {
      console.error('Error loading PM template:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId) {
      toast({
        title: 'Validation Error',
        description: 'Please select an asset',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      let workOrder;
      
      if (formData.pmTemplateId && formData.workType === 'PM') {
        // Create PM work order
        workOrder = await WorkOrderServiceEnhanced.createPMWorkOrder({
          pmTemplateId: formData.pmTemplateId,
          assetId: formData.assetId,
          scheduledDate: formData.scheduledDate,
          assignedTo: formData.assignedTo || undefined
        });
      } else {
        // Create regular work order
        workOrder = await WorkOrderServiceEnhanced.createWorkOrderWithAutoFill({
          assetId: formData.assetId,
          title: formData.title,
          description: formData.description,
          workType: formData.workType,
          priority: formData.priority,
          scheduledDate: formData.scheduledDate,
          assignedTo: formData.assignedTo || undefined,
          requestedBy: formData.requestedBy || undefined
        });
      }

      toast({
        title: 'Success',
        description: `Work order ${workOrder.wo_number} created successfully`
      });

      if (onSuccess) {
        onSuccess(workOrder.id);
      } else {
        navigate(`/work-orders/${workOrder.id}`);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create work order',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Work Order</CardTitle>
        <CardDescription>
          Create a new work order with automatic company, system, and location filling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-filled information display */}
          {autoFilledData.companyName && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div><strong>Company:</strong> {autoFilledData.companyName}</div>
                  <div><strong>System:</strong> {autoFilledData.systemName}</div>
                  <div><strong>Location:</strong> {autoFilledData.locationName}</div>
                  <div><strong>Asset:</strong> {autoFilledData.assetSerial}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">Asset *</Label>
              <Select
                value={formData.assetId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
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

            {/* Work Type */}
            <div className="space-y-2">
              <Label htmlFor="workType">Work Type</Label>
              <Select
                value={formData.workType}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, workType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CM">Corrective Maintenance</SelectItem>
                  <SelectItem value="PM">Preventive Maintenance</SelectItem>
                  <SelectItem value="EM">Emergency Maintenance</SelectItem>
                  <SelectItem value="INSP">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PM Template (shown only for PM work type) */}
            {formData.workType === 'PM' && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="pmTemplate">PM Template</Label>
                <Select
                  value={formData.pmTemplateId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pmTemplateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a PM template" />
                  </SelectTrigger>
                  <SelectContent>
                    {pmTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.template_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter work order title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter work order description"
                rows={4}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Requested By */}
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By</Label>
              <Select
                value={formData.requestedBy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, requestedBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/work-orders')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Work Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default WorkOrderFormEnhanced;