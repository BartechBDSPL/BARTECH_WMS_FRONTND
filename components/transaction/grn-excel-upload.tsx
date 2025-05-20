"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { BACKEND_URL } from "@/lib/constants";
import getUserID from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InfoCircledIcon,
  DownloadIcon,
  FileTextIcon,
  CheckCircledIcon,
  CrossCircledIcon
} from "@radix-ui/react-icons";

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  title?: string;
  description?: string;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  fileLimit?: number;
  buttonText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  title = "Upload Files",
  description = "Drag and drop files here or click to browse",
  allowedTypes = ['.xlsx', '.xls'],
  maxSize = 10,
  fileLimit = 1,
  buttonText = "Select Files"
}) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Convert FileList to array for easier processing
    const filesArray = Array.from(fileList);

    if (filesArray.length > fileLimit) {
      errors.push(`You can only upload up to ${fileLimit} file${fileLimit === 1 ? '' : 's'}.`);
      // Take only the first N files based on the limit
      filesArray.splice(fileLimit);
    }

    for (const file of filesArray) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();

      // Check file type/extension
      const isValidType = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          // Compare with file extension
          return type.toLowerCase() === fileExtension;
        } else {
          // Compare with MIME type
          return type.toLowerCase() === fileType;
        }
      });

      if (!isValidType) {
        errors.push(`File type not allowed: ${file.name}`);
        continue;
      }

      // Check file size (convert maxSize from MB to bytes)
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`File too large: ${file.name} (max ${maxSize}MB)`);
        continue;
      }

      validFiles.push(file);
    }

    // Show toast if there were any errors
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "File validation failed",
        description: errors.join('\n'),
      });
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center w-full p-8 
          border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5"}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <svg
            className={`w-12 h-12 mb-2 ${dragActive ? "text-primary" : "text-muted-foreground"}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleChange}
              accept={allowedTypes.join(',')}
              multiple={fileLimit > 1}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {buttonText}
              </Button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const GRNExcelUpload: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const downloadSampleTemplate = () => {
    const link = document.createElement('a');
    link.href = '/BARTECH_ICG_REPORT.xlsx';
    link.download = 'GRN_Sample_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Sample template download has started."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel file to upload.",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('excelFile', files[0]);
    
    try {
      const userId = getUserID();
      formData.append('userId', userId);
      
      const response = await fetch(`${BACKEND_URL}/api/transaction/upload-grn`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "T") {
        toast({
          title: "Upload successful",
          description: data.message || "Your Excel file has been uploaded successfully",
        });
        // Reset the form
        setFiles([]);
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: data.message || "Failed to process the Excel file.",
        });
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">GRN Excel Upload</h2>
            
            <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <InfoCircledIcon className="h-4 w-4" />
                  <span>View File Info</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>File Upload Requirements</DialogTitle>
                  <DialogDescription>
                    Please ensure your file meets the following requirements
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4 text-primary" />
                      Acceptable File Types
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircledIcon className="h-4 w-4 text-green-500" />
                        Excel files (.xlsx, .xls)
                      </li>
                      <li className="flex items-center gap-2">
                        <CrossCircledIcon className="h-4 w-4 text-red-500" />
                        Other file formats not accepted
                      </li>
                    </ul>
                    
                    <h3 className="font-medium flex items-center gap-2 mt-4">
                      <FileTextIcon className="h-4 w-4 text-primary" />
                      File Structure
                    </h3>
                    <p className="text-sm">
                      Your Excel file must follow the structure in our sample template.
                      Please download and use the template below to ensure successful upload.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="default" 
                      onClick={downloadSampleTemplate}
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download Sample Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="file-upload">Excel File</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={downloadSampleTemplate}
                  className="h-auto p-0 text-xs flex items-center gap-1"
                  type="button"
                >
                  <DownloadIcon className="h-3 w-3" />
                  Download Sample
                </Button>
              </div>
              <FileUpload 
                onFilesSelect={handleFilesSelect}
                title="Drop your Excel file here"
                description="Files supported: .xlsx, .xls (Max 10MB)"
                fileLimit={1}
                maxSize={10}
                allowedTypes={[
                  '.xlsx', 
                  '.xls', 
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                  'application/vnd.ms-excel'
                ]}
                buttonText="Choose File"
              />

              {files.length > 0 && (
                <div className="mt-4 p-3 bg-secondary/30 rounded-md">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm">{files[0].name} ({(files[0].size / (1024 * 1024)).toFixed(2)} MB)</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || files.length === 0}>
                {isLoading ? "Uploading..." : "Upload GRN Excel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="rounded-lg bg-primary/5 backdrop-blur-sm p-6 border border-primary/20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
              <div className="absolute inset-0 m-auto h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-primary">Processing your file</p>
              <p className="text-sm text-muted-foreground">Please wait while we upload and validate your data...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNExcelUpload;
