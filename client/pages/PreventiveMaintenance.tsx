import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Search, Calendar, Clock, ChevronRight, Filter, Camera, Keyboard, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '../hooks/use-supabase-data';
import { supabase } from '../../shared/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

interface PMTemplate {
  id: string;
  company_id: string;
  system_id: string;
  equipment_type_id: string;
  name: string;
  frequency_type: string;
  frequency_value: number;
  estimated_minutes: number;
  remarks: string;
}

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
}

interface EquipmentType {
  id: string;
  name: string;
  name_th: string;
  description: string;
}

interface System {
  id: string;
  name: string;
  name_th: string;
  description: string;
}

export default function PreventiveMaintenance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pmTemplates, assets, equipmentTypes, systems } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [scannedQRCode, setScannedQRCode] = useState('');
  const [pmTemplateQRCodes, setPmTemplateQRCodes] = useState([]);

  // Normalize company data
  const companies = pmTemplates.reduce((acc, pm) => {
    if (pm.company_id && !acc.some(c => c.value === pm.company_id)) {
      acc.push({ value: pm.company_id, label: pm.company_id });
    }
    return acc;
  }, [] as { value: string; label: string }[]);

  // Normalize frequency types
  const frequencyTypes = pmTemplates.reduce((acc, pm) => {
    if (pm.frequency_type && !acc.some(f => f.value === pm.frequency_type)) {
      acc.push({ value: pm.frequency_type, label: pm.frequency_type });
    }
    return acc;
  }, [] as { value: string; label: string }[]);

  // Filter PM templates based on search and filters
  const filteredTemplates = pmTemplates.filter((template: PMTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !selectedCompany || template.company_id === selectedCompany;
    const matchesFrequency = !selectedFrequency || template.frequency_type === selectedFrequency;
    
    return matchesSearch && matchesCompany && matchesFrequency;
  });

  // Group templates by equipment type
  const groupedTemplates = filteredTemplates.reduce((acc: Record<string, PMTemplate[]>, template: PMTemplate) => {
    const equipmentType = equipmentTypes.find((et: EquipmentType) => et.id === template.equipment_type_id);
    const key = equipmentType?.name_th || equipmentType?.name || 'อื่นๆ';
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(template);
    return acc;
  }, {} as Record<string, PMTemplate[]>);

  const getFrequencyLabel = (type: string, value: number) => {
    const labels: Record<string, string> = {
      'day': 'วัน',
      'week': 'สัปดาห์',
      'month': 'เดือน',
      'year': 'ปี'
    };
    
    return `ทุก ${value} ${labels[type] || type}`;
  };

  // Load PM template QR codes - simplified approach
  useEffect(() => {
    // Since pm_template_qr_codes table doesn't exist, we'll use pm_templates directly
    // and generate QR codes based on template IDs
    setPmTemplateQRCodes(pmTemplates.map(template => ({
      id: `qr-${template.id}`,
      pm_template_id: template.id,
      qr_code: `QR-PM-${template.id}`,
      pm_templates: template,
      is_active: true
    })));
  }, [pmTemplates]);

  // Handle QR code from URL params
  useEffect(() => {
    const qrCode = searchParams.get('qr');
    if (qrCode) {
      handleQRCodeScanned(qrCode);
    }
  }, [searchParams]);

  const handleTemplateSelect = (template: PMTemplate) => {
    // Navigate to PM execution page with template ID
    navigate(`/pm-execution/${template.id}`);
  };

  const handleQRScan = () => {
    setShowScanner(true);
  };

  const handleQRCodeScanned = async (qrCode: string) => {
    setScannedQRCode(qrCode);
    
    // Find PM template by QR code
    const pmQRCode = pmTemplateQRCodes.find(qr => qr.qr_code === qrCode);
    
    if (pmQRCode && pmQRCode.pm_templates) {
      toast.success(`พบแผน PM: ${pmQRCode.pm_templates.name}`);
      // Navigate directly to PM execution
      navigate(`/pm-execution/${pmQRCode.pm_templates.id}?qr=${qrCode}`);
    } else {
      // Try to find by template ID directly
      const template = pmTemplates.find(t => t.id === qrCode || `QR-PM-${t.id}` === qrCode);
      if (template) {
        toast.success(`พบแผน PM: ${template.name}`);
        navigate(`/pm-execution/${template.id}?qr=${qrCode}`);
      } else {
        toast.error('ไม่พบแผน PM ที่ตรงกับ QR Code นี้');
        setShowManualInput(true);
      }
    }
    
    setShowScanner(false);
  };

  const handleManualQRInput = () => {
    if (manualQRCode.trim()) {
      handleQRCodeScanned(manualQRCode.trim());
      setManualQRCode('');
      setShowManualInput(false);
    }
  };

  const simulateQRScan = (templateId: string) => {
    const qrCode = `QR-PM-${templateId}`;
    handleQRCodeScanned(qrCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance</h1>
        <p className="mt-2 text-gray-600">เลือกแผนการบำรุงรักษาเชิงป้องกัน</p>
      </div>

      {/* QR Scanner Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleQRScan}
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            สแกน QR Code
          </Button>
          
          <Button
            onClick={() => setShowManualInput(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <Keyboard className="w-5 h-5 mr-2" />
            ป้อนรหัสด้วยตนเอง
          </Button>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-3">ทดสอบสแกน QR Code:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {pmTemplates.slice(0, 6).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => simulateQRScan(template.id)}
                className="justify-start text-left h-auto p-3"
              >
                <div className="flex items-start gap-2 w-full">
                  <QrCode className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {getFrequencyLabel(template.frequency_type, template.frequency_value)}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาแผน PM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกบริษัท</option>
              {companies.map((company) => (
                <option key={company.value} value={company.value}>{company.label}</option>
              ))}
            </select>
          </div>

          {/* Frequency Filter */}
          <div>
            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกความถี่</option>
              {frequencyTypes.map((freq) => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PM Templates List */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([equipmentType, templates]) => (
          <div key={equipmentType} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-lg font-medium text-gray-900">{equipmentType}</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {templates.map((template: PMTemplate) => {
                const system = systems.find((s: System) => s.id === template.system_id);
                const relatedAssets = assets.filter((a: Asset) =>
                  a.equipment_type_id === template.equipment_type_id &&
                  a.system_id === template.system_id
                );
                
                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900">
                          {template.name}
                        </h4>
                        
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{getFrequencyLabel(template.frequency_type, template.frequency_value)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{template.estimated_minutes} นาที</span>
                          </div>
                          
                          {system && (
                            <div className="text-blue-600">
                              {system.name_th || system.name}
                            </div>
                          )}
                          
                          {relatedAssets.length > 0 && (
                            <div className="text-green-600">
                              {relatedAssets.length} อุปกรณ์
                            </div>
                          )}
                        </div>
                        
                        {template.remarks && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {template.remarks}
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่พบแผน PM ที่ตรงกับการค้นหา</p>
        </div>
      )}

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              สแกน QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Camera Simulation */}
            <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                  <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm text-center">
                    วาง QR Code<br />ในกรอบ
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              กำลังรอการสแกน QR Code...
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowScanner(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => {
                  setShowScanner(false);
                  setShowManualInput(true);
                }}
                className="flex-1"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                ป้อนด้วยตนเอง
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual QR Input Dialog */}
      <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              ป้อนรหัส QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">รหัส QR Code</label>
              <Input
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
                placeholder="เช่น QR-PM-PMT-LAK-SYS001-EQ001-WKLY"
                className="mt-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualQRInput();
                  }
                }}
              />
            </div>
            
            {scannedQRCode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">QR Code ล่าสุด:</div>
                <div className="text-sm text-muted-foreground font-mono">{scannedQRCode}</div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowManualInput(false);
                  setManualQRCode('');
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleManualQRInput}
                disabled={!manualQRCode.trim()}
                className="flex-1"
              >
                ค้นหา
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}