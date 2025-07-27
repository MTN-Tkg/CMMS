import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Printer, Copy, Check } from "lucide-react";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { supabase } from "../../shared/supabase/client";
import QRCode from 'qrcode';

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
  manufacturer?: string;
  model?: string;
}

export function AssetQRCode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { systems, equipmentTypes } = useSupabaseData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadAssetData(id);
    }
  }, [id]);

  useEffect(() => {
    if (asset) {
      generateQRCode();
    }
  }, [asset]);

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
        setAsset(data);
      } else {
        setError('ไม่พบข้อมูลอุปกรณ์');
      }
    } catch (err) {
      setError(`Failed to load asset data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!asset) return;

    try {
      // Create QR code data with asset information
      const qrData = {
        type: 'asset',
        id: asset.id,
        serial_number: asset.serial_number,
        url: `${window.location.origin}/assets/${asset.id}`
      };

      const qrString = JSON.stringify(qrData);
      
      // Generate QR code
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, qrString, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Convert canvas to data URL for download
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
      }
    } catch (err) {
      setError(`Failed to generate QR code: ${err.message}`);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl || !asset) return;

    const link = document.createElement('a');
    link.download = `QR_${asset.id}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const printQRCode = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${asset?.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              text-align: center;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .asset-info {
              margin-top: 15px;
              font-size: 14px;
            }
            .asset-id {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            canvas {
              display: block;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const copyQRUrl = async () => {
    if (!asset) return;

    const url = `${window.location.origin}/assets/${asset.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getEquipmentTypeName = () => {
    if (!asset) return '';
    const equipmentType = equipmentTypes.find(et => et.id === asset.equipment_type_id);
    return equipmentType?.name_th || equipmentType?.name || '';
  };

  const getSystemName = () => {
    if (!asset) return '';
    const system = systems.find(s => s.id === asset.system_id);
    return system?.name_th || system?.name || '';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error || 'ไม่พบข้อมูลอุปกรณ์'}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/assets')} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับสู่รายการอุปกรณ์
        </Button>
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
          <h1 className="text-xl sm:text-2xl font-bold">QR Code - {asset.id}</h1>
          <p className="text-sm text-muted-foreground">
            สร้างและจัดการ QR Code สำหรับอุปกรณ์
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div ref={printRef} className="qr-container inline-block border-2 border-gray-300 p-6 rounded-lg">
              <canvas ref={canvasRef} className="mx-auto" />
              <div className="asset-info mt-4">
                <div className="asset-id text-lg font-bold">{asset.id}</div>
                <div className="text-sm text-muted-foreground">
                  S/N: {asset.serial_number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getEquipmentTypeName()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={downloadQRCode} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลด
              </Button>
              <Button onClick={printQRCode} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </Button>
              <Button onClick={copyQRUrl} variant="outline" size="sm">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    คัดลอก URL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Asset Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลอุปกรณ์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">รหัสอุปกรณ์:</span>
                <span className="text-sm font-medium">{asset.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">หมายเลขเครื่อง:</span>
                <span className="text-sm font-medium">{asset.serial_number}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ประเภทอุปกรณ์:</span>
                <span className="text-sm font-medium">{getEquipmentTypeName()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ระบบ:</span>
                <span className="text-sm font-medium">{getSystemName()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">สถานะ:</span>
                <span className={`text-sm font-medium ${
                  asset.status === 'Working' ? 'text-green-600' :
                  asset.status === 'Faulty' ? 'text-red-600' :
                  asset.status === 'Maintenance' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {asset.status === 'Working' ? 'ทำงาน' :
                   asset.status === 'Faulty' ? 'เสีย' :
                   asset.status === 'Maintenance' ? 'ซ่อมบำรุง' :
                   asset.status}
                </span>
              </div>

              {asset.manufacturer && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ผู้ผลิต:</span>
                  <span className="text-sm font-medium">{asset.manufacturer}</span>
                </div>
              )}

              {asset.model && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">รุ่น:</span>
                  <span className="text-sm font-medium">{asset.model}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">การใช้งาน QR Code</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• สแกน QR Code เพื่อเข้าถึงข้อมูลอุปกรณ์</li>
                <li>• สร้างใบสั่งงานจาก QR Code</li>
                <li>• ติดตาม PM Schedule</li>
                <li>• บันทึกประวัติการบำรุงรักษา</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">การติดตั้ง QR Code</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>1. ดาวน์โหลดหรือพิมพ์ QR Code</li>
                <li>2. ติดบนอุปกรณ์ในตำแหน่งที่มองเห็นได้ชัดเจน</li>
                <li>3. ป้องกันจากความชื้นและความร้อน</li>
                <li>4. ตรวจสอบการสแกนได้ก่อนติดตั้ง</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">การสแกน QR Code</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>1. เปิดแอป CMMS บนมือถือ</li>
                <li>2. เลือกเมนู "สแกน QR Code"</li>
                <li>3. จ่อกล้องไปที่ QR Code</li>
                <li>4. ระบบจะแสดงข้อมูลอุปกรณ์โดยอัตโนมัติ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}