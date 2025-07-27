import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, Copy, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../../shared/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PMTemplate {
  id: string;
  company_id: string;
  system_id: string;
  equipment_type_id: string;
  name: string;
  template_code: string;
  description?: string;
  frequency_type: string;
  frequency_value: number;
  estimated_minutes?: number;
  company?: { name: string; code: string };
  system?: { name: string };
  equipment_type?: { name: string };
}

interface PMTemplateDetail {
  id: string;
  pm_template_id: string;
  step_number: number;
  task_description: string;
  expected_input_type?: string;
  standard_text_expected?: string;
  standard_min_value?: number;
  standard_max_value?: number;
  is_critical: boolean;
  remarks?: string;
}

export function PMTemplateManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<PMTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PMTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<PMTemplateDetail[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    template_code: '',
    description: '',
    company_id: '',
    system_id: '',
    equipment_type_id: '',
    frequency_type: 'monthly',
    frequency_value: 1,
    estimated_minutes: 60
  });

  // Reference data
  const [companies, setCompanies] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
    loadReferenceData();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pm_templates')
        .select(`
          *,
          company:companies(name, code),
          system:systems(name),
          equipment_type:equipment_types(name)
        `)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PM templates',
        variant: 'destructive'
      });
    }
  };

  const loadReferenceData = async () => {
    try {
      // Load companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name, code')
        .order('name');
      setCompanies(companiesData || []);

      // Load systems
      const { data: systemsData } = await supabase
        .from('systems')
        .select('id, name, code')
        .order('name');
      setSystems(systemsData || []);

      // Load equipment types
      const { data: equipmentTypesData } = await supabase
        .from('equipment_types')
        .select('id, name')
        .order('name');
      setEquipmentTypes(equipmentTypesData || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadTemplateDetails = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('pm_template_details')
        .select('*')
        .eq('pm_template_id', templateId)
        .order('step_number');

      if (error) throw error;
      setTemplateDetails(data || []);
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pm_templates')
        .insert({
          ...formData,
          estimated_minutes: parseInt(formData.estimated_minutes.toString())
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PM template created successfully'
      });

      setShowDialog(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create PM template',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pm_templates')
        .update({
          ...formData,
          estimated_minutes: parseInt(formData.estimated_minutes.toString())
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PM template updated successfully'
      });

      setShowDialog(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update PM template',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this PM template?')) return;

    try {
      const { error } = await supabase
        .from('pm_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PM template deleted successfully'
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PM template',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateTemplate = async (template: PMTemplate) => {
    try {
      // Create new template
      const { data: newTemplate, error: templateError } = await supabase
        .from('pm_templates')
        .insert({
          ...template,
          id: undefined,
          name: `${template.name} (Copy)`,
          template_code: `${template.template_code}-COPY`
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Copy template details
      const { data: details } = await supabase
        .from('pm_template_details')
        .select('*')
        .eq('pm_template_id', template.id);

      if (details && details.length > 0) {
        const newDetails = details.map(detail => ({
          ...detail,
          id: undefined,
          pm_template_id: newTemplate.id
        }));

        await supabase
          .from('pm_template_details')
          .insert(newDetails);
      }

      toast({
        title: 'Success',
        description: 'PM template duplicated successfully'
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate PM template',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      template_code: '',
      description: '',
      company_id: '',
      system_id: '',
      equipment_type_id: '',
      frequency_type: 'monthly',
      frequency_value: 1,
      estimated_minutes: 60
    });
    setEditMode(false);
    setSelectedTemplate(null);
  };

  const openEditDialog = (template: PMTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      template_code: template.template_code,
      description: template.description || '',
      company_id: template.company_id,
      system_id: template.system_id,
      equipment_type_id: template.equipment_type_id,
      frequency_type: template.frequency_type,
      frequency_value: template.frequency_value,
      estimated_minutes: template.estimated_minutes || 60
    });
    setEditMode(true);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>PM Templates</CardTitle>
              <CardDescription>
                Manage preventive maintenance templates for different equipment types
              </CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? 'Edit PM Template' : 'Create PM Template'}
                  </DialogTitle>
                  <DialogDescription>
                    Define the template details and maintenance frequency
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Monthly Generator Inspection"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Template Code *</Label>
                      <Input
                        value={formData.template_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, template_code: e.target.value }))}
                        placeholder="e.g., PM-GEN-MON"
                      />
                    </div>
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
                              {company.name} ({company.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>System *</Label>
                      <Select
                        value={formData.system_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, system_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select system" />
                        </SelectTrigger>
                        <SelectContent>
                          {systems.map(system => (
                            <SelectItem key={system.id} value={system.id}>
                              {system.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Equipment Type *</Label>
                      <Select
                        value={formData.equipment_type_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label>Estimated Duration (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.estimated_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Template description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={editMode ? handleUpdateTemplate : handleCreateTemplate} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editMode ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Equipment Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.template_code}</Badge>
                  </TableCell>
                  <TableCell>{template.company?.name}</TableCell>
                  <TableCell>{template.system?.name}</TableCell>
                  <TableCell>{template.equipment_type?.name}</TableCell>
                  <TableCell>
                    {template.frequency_value} {template.frequency_type}
                  </TableCell>
                  <TableCell>{template.estimated_minutes} min</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PMTemplateManager;