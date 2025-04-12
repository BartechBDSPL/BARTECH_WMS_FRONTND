"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Upload, FileText, Image, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface FileUploadProps {
  title?: string;
  description?: string;
  fileLimit?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[]; // e.g. ['image/*', 'application/pdf', '.xlsx']
  onFilesChange?: (files: File[]) => void;
  buttonText?: string;
}

type FileWithPreview = {
  file: File;
  previewUrl?: string;
  type: 'image' | 'pdf' | 'excel' | 'other';
};

const FileUpload: React.FC<FileUploadProps> = ({
  title = "Upload Files",
  description = "Upload images, PDFs or Excel files related to this job",
  fileLimit = 10,
  maxSize = 5, // 5MB default
  allowedTypes = ['image/*', 'application/pdf', '.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
  onFilesChange,
  buttonText = "Upload Files"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const getFileType = (file: File): 'image' | 'pdf' | 'excel' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) return 'excel';
    return 'other';
  };

  const createPreviewUrl = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: FileWithPreview[] = [];
    
    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > fileLimit) {
      toast({
        variant: "destructive",
        title: "File limit exceeded",
        description: `You can upload a maximum of ${fileLimit} files.`,
      });
      return;
    }
    
    // Process each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the maximum size of ${maxSize}MB.`,
        });
        continue;
      }
      
      // Check file type
      const isAllowedType = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else {
          return file.type.match(new RegExp(type.replace('*', '.*')));
        }
      });
      
      if (!isAllowedType) {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type.`,
        });
        continue;
      }
      
      // Get file type and preview URL
      const type = getFileType(file);
      const previewUrl = await createPreviewUrl(file);
      
      newFiles.push({
        file,
        previewUrl,
        type
      });
    }
    
    // Update files state with new valid files
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    // Notify parent component
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
    
    // Show success message
    if (newFiles.length > 0) {
      toast({
        title: "Files added",
        description: `Successfully added ${newFiles.length} file(s)`,
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const getFileIcon = (type: 'image' | 'pdf' | 'excel' | 'other') => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex gap-2"
      >
        <Upload className="h-4 w-4" />
        {buttonText}
        {files.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {files.length}
          </Badge>
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div 
            className={`
              border-2 border-dashed rounded-lg p-6 mt-2 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Drag and drop files here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload up to {fileLimit} files (max {maxSize}MB each)
            </p>
            <Input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <Button 
              type="button" 
              variant="secondary" 
              className="mt-4" 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={files.length >= fileLimit}
            >
              Select Files
            </Button>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Uploaded Files ({files.length}/{fileLimit})</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-md border bg-background"
                    >
                      <div className="flex items-center gap-3">
                        {file.previewUrl ? (
                          <img 
                            src={file.previewUrl} 
                            alt={file.file.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        
                        <div className="flex flex-col">
                          <p className="text-sm font-medium truncate max-w-[180px]">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setFiles([]);
                if (onFilesChange) onFilesChange([]);
              }}
              className="flex-1 sm:flex-none"
              disabled={files.length === 0}
            >
              Clear All
            </Button>
            <Button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="flex-1 sm:flex-none"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;
