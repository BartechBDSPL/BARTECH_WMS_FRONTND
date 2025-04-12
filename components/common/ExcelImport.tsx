import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Download, FileSpreadsheet, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ExcelImportProps {
  headers: string[];
  onImport: (file: File) => void;
  onSuccess?: () => void; // For backward compatibility
  isLoading?: boolean;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ 
  headers, 
  onImport, 
  onSuccess, 
  isLoading = false 
}) => {
  const { toast } = useToast();
  const token = Cookies.get('token');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select an Excel file to upload"
      });
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('UpdatedBy', 'admin');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/upload-materials-excel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.Status === 'T') {
        toast({
          title: "Success",
          description: response.data.Message
        });
        setIsDialogOpen(false);
        setSelectedFile(null);
        if (onSuccess) {
          onSuccess();
        }
        if (onImport && selectedFile) {
          onImport(selectedFile);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.Message
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.Message || error.message;
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/Sample_Material_Master.xlsx';
    link.download = 'Sample_Material_Master.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onImport(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      // Don't allow closing the dialog while uploading
      if (uploadLoading && !open) return;
      setIsDialogOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload size={16} />
              Import from Excel
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Raw Material Data</DialogTitle>
          <DialogDescription>
            Upload your Excel file with raw material data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Card className="bg-amber-50 border-amber-200 mb-4">
            <CardContent className="p-3">
              <div className="flex items-start gap-2 text-amber-800">
                <FileSpreadsheet className="h-5 w-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Excel File Requirements:</p>
                  <ul className="list-disc ml-5 mt-1">
                    <li>Excel should contain 2 columns with headers:</li>
                    <ul className="list-['•'] ml-6">
                      <li>&quot;{headers[0]}&quot;</li>
                      <li>&quot;{headers[1]}&quot;</li>
                    </ul>
                    <li>File must be in .xlsx or .xls format</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Upload Excel File</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs" 
              onClick={handleDownloadSample}
            >
              <Download className="h-3 w-3" />
              Download Sample
            </Button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-[150px] transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300"
            } ${selectedFile ? "bg-green-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="text-sm text-green-600">File selected successfully</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 mt-1 text-red-500"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <div className="text-center">
                  <p className="text-sm mb-1">
                    Drag & drop your file here or{' '}
                    <label className="text-primary cursor-pointer font-semibold">
                      browse
                      <Input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">Supported formats: .xlsx, .xls</p>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={uploadLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedFile || uploadLoading}
            className="gap-2"
          >
            {uploadLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImport;
