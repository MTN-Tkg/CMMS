import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, QrCode } from "lucide-react";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { supabase } from "../../shared/supabase/client";

interface AssetFormData {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
  description?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  manufacturer?: string;
  model?: string;
  location_notes?: string;
}

export function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { systems, equipmentTypes, loading: dataLoading } = useSupabaseData();

  const [formData, setFormData] = useState<AssetFormData>({
    id: '',
    equipment_type_id: '',
    system_id: '',
    serial_number: '',
    status: 'Working',
    description: '',
    purchase_date: '',
    purchase_price: 0,
    warranty_expiry: '',
    manufacturer: '',
    model: '',
    location_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing asset data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadAssetData(id);
    }
  }, [isEdit, id]);

  const loadAssetData = async (assetId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          id: data.id || '',
          equipment_type_id: data.equipment_type_id || '',
          system_id: data.system_id || '',
          serial_number: data.serial_number || '',
          status: data.status || 'Working',
          description: data.description || '',
          purchase_date: data.purchase_date || '',
          purchase_price: data.purchase_price || 0,
          warranty_expiry: data.warranty_expiry || '',
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          location_notes: data.location_notes || ''
        });
      }
    } catch (err) {
      setError(`Failed to load asset data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.id.trim()) {
      setError('Asset ID is required');
      return false;
    }
    if (!formData.equipment_type_id) {
      setError('Equipment type is required');
      return false;
    }
    if (!formData.system_id) {
      setError('System is required');
      return false;
    }
    if (!formData.serial_number.trim()) {
      setError('Serial number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const assetData = {
        id: formData.id,
        equipment_type_id: formData.equipment_type_id,
        system_id: formData.system_id,
        serial_number: formData.serial_number,
        status: formData.status,
        description: formData.description || null,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price || null,
        warranty_expiry: formData.warranty_expiry || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        location_notes: formData.location_notes || null,
        updated_at: new Date().toISOString()
      };

      if (isEdit) {
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Check if asset ID already exists
        const { data: existingAsset } = await supabase
          .from('assets')
          .select('id')
          .eq('id', formData.id)
          .single();

        if (existingAsset) {
          setError('Asset ID already exists. Please choose a different ID.');
          return;
        }

        const { error } = await supabase
          .from('assets')
          .insert([{
            ...assetData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/assets');
      }, 1500);

    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    // Navigate to QR code generation page
    navigate(`/assets/${formData.id}/qr-code`);
  };

  if (dataLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assets')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {isEdit ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {isEdit ? 'อัปเดตข้อมูลอุปกรณ์สำเร็จ' : 'เพิ่มอุปกรณ์ใหม่สำเร็จ'} กำลังเปลี่ยนหน้า...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">รหัสอุปกรณ์ *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  placeholder="เช่น PUMP-001"
                  disabled={isEdit}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">หมายเลขเครื่อง *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  placeholder="เช่น SN-12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment_type_id">ประเภทอุปกรณ์ *</Label>
                <Select
                  value={formData.equipment_type_id}
                  onValueChange={(value) => handleInputChange('equipment_type_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name_th || type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_id">ระบบ *</Label>
                <Select
                  value={formData.system_id}
                  onValueChange={(value) => handleInputChange('system_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระบบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.name_th || system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Working">ทำงาน</SelectItem>
                    <SelectItem value="Faulty">เสีย</SelectItem>
                    <SelectItem value="Maintenance">ซ่อมบำรุง</SelectItem>
                    <SelectItem value="Offline">ไม่ใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">ผู้ผลิต</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="เช่น Siemens"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">รุ่น</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="เช่น S7-1200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับอุปกรณ์"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการจัดซื้อ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">วันที่ซื้อ</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">ราคาซื้อ (บาท)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">วันหมดอายุประกัน</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Notes */}
        <Card>
          <CardHeader>
            <CardTitle>หมายเหตุตำแหน่ง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="location_notes">รายละเอียดตำแหน่งติดตั้ง</Label>
              <Textarea
                id="location_notes"
                value={formData.location_notes}
                onChange={(e) => handleInputChange('location_notes', e.target.value)}
                placeholder="เช่น ติดตั้งที่มุมซ้ายของห้อง, ระดับความสูง 2 เมตร"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? 'กำลังอัปเดต...' : 'กำลังบันทึก...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
              </>
            )}
          </Button>

          {isEdit && formData.id && (
            <Button
              type="button"
              variant="outline"
              onClick={generateQRCode}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              สร้าง QR Code
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/assets')}
            className="flex-1"
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
}