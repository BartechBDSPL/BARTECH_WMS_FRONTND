"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import FormDataUpload from "@/components/ui/form-data-upload";
import { Card, CardContent } from "@/components/ui/card";
import { BACKEND_URL } from "@/lib/constants";
import getUserID from "@/lib/constants";

const ExcelUploadWithUsername: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

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
        // Set the reset flag to true to clear the form
        setShouldResetForm(true);
        // Reset the flag after a short delay to allow for the next form submission
        setTimeout(() => {
          setShouldResetForm(false);
        }, 100);
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
    <div className="container max-w-3xl mx-auto py-10">
        <div className="bg-gradient-to-br from-background to-muted p-1 rounded-xl shadow-lg">
            <div className="bg-background rounded-lg p-6">                <FormDataUpload 
                    onSubmit={handleSubmit}
                    title="GRN Excel Uploader"
                    description="Upload your Excel file with GRN details for processing"
                    fileFieldName="excelFile"
                    shouldReset={shouldResetForm}
                    fileUploadProps={{
                        title: "Drop your Excel file here",
                        description: "Files supported: .xlsx, .xls (Max 10MB)",
                        fileLimit: 1,
                        maxSize: 10,
                        allowedTypes: [
                            '.xlsx', 
                            '.xls', 
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                            'application/vnd.ms-excel'
                        ],
                        buttonText: "Choose File"
                    }}
                    additionalFields={[
 
                    ]}
                />
                  {isLoading && (
                    <div className="mt-6 rounded-lg bg-primary/5 backdrop-blur-sm p-6 border border-primary/20">
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
        </div>
    </div>
  );
};

export default ExcelUploadWithUsername;
