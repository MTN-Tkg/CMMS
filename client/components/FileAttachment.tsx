import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Download, 
  Eye,
  FileText,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface FileAttachmentProps {
  files: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  showUploadArea?: boolean;
  readOnly?: boolean;
}

export function FileAttachment({
  files,
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  showUploadArea = true,
  readOnly = false
}: FileAttachmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `ไฟล์ใหญ่เกินไป (สูงสุด ${maxFileSize}MB)`;
    }

    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        return 'ประเภทไฟล์ไม่รองรับ';
      }
    }

    if (files.length >= maxFiles) {
      return `สามารถแนบไฟล์ได้สูงสุด ${maxFiles} ไฟล์`;
    }

    return null;
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: AttachedFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const attachedFile: AttachedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User' // In real app, get from auth context
      };

      newFiles.push(attachedFile);

      // Simulate file upload
      simulateUpload(attachedFile);
    });

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  };

  const simulateUpload = (file: AttachedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Update file with final URL
        onFilesChange(files.map(f =>
          f.id === file.id
            ? { ...f, uploadProgress: 100, url: `mock://uploaded/${f.name}` }
            : f
        ));
        toast.success(`อัปโหลด ${file.name} สำเร็จ`);
      } else {
        onFilesChange(files.map(f =>
          f.id === file.id
            ? { ...f, uploadProgress: progress }
            : f
        ));
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
    toast.success('ลบไฟล์แล้ว');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (readOnly) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {showUploadArea && !readOnly && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">แนบไฟล์</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ลากไฟล์มาวางที่นี่ หรือ
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์
              </Button>
              <div className="text-xs text-muted-foreground">
                <p>รองรับ: รูปภาพ, PDF, Word, Text</p>
                <p>ขนาดสูงสุด: {maxFileSize}MB ต่อไฟล์</p>
                <p>จำนวนสูงสุด: {maxFiles} ไฟล์</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            ไฟล์แนบ ({files.length}/{maxFiles})
          </h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm truncate">
                      {file.name}
                    </h5>
                    {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                      <Badge variant="secondary" className="text-xs">
                        อัปโหลด...
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    {file.uploadedAt && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.uploadedAt).toLocaleDateString('th-TH')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                    <Progress value={file.uploadProgress} className="h-1 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {file.url && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {!readOnly && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}