"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload, { FileUploadProps } from "./file-upload";
import getUserID from "@/lib/constants";

interface FormDataUploadProps {
  onSubmit?: (formData: FormData) => void;
  title?: string;
  description?: string;
  fileFieldName?: string;
  fileUploadProps?: Partial<FileUploadProps>;
  shouldReset?: boolean;
  additionalFields?: {
    name: string;
    label: string;
    type: string;
    defaultValue?: string;
    required?: boolean;
    placeholder?: string;
  }[];
}

const FormDataUpload: React.FC<FormDataUploadProps> = ({
  onSubmit,
  title = "Form Data Upload",
  description = "Upload files and additional information",
  fileFieldName = "excelFile",
  fileUploadProps = {
    allowedTypes: ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    maxSize: 10,
    fileLimit: 1
  },
  shouldReset = false,
  additionalFields = [

  ]
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    // Initialize form values with default values from additionalFields
    const initialValues: Record<string, string> = {};
    additionalFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialValues[field.name] = field.defaultValue;
      }
    });
    return initialValues;
  });
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  // Reset the form when shouldReset changes to true
  useEffect(() => {
    if (shouldReset) {
      setFiles([]);
      
      // Reset form values to defaults
      const initialValues: Record<string, string> = {};
      additionalFields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        }
      });
      setFormValues(initialValues);
    }
  }, [shouldReset, additionalFields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0 && fileUploadProps.fileLimit !== 0) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    
    // Add files to FormData
    if (files.length > 0) {
      if (fileUploadProps.fileLimit === 1) {
        // If file limit is 1, add as a single file
        formData.append(fileFieldName, files[0]);
      } else {
        // Otherwise add multiple files
        files.forEach((file, index) => {
          formData.append(`${fileFieldName}[${index}]`, file);
        });
      }
    }
    
    // Add additional form fields
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>File Upload</Label>
            <FileUpload
              title={fileUploadProps.title || "Upload File"}
              description={fileUploadProps.description || "Upload Excel file"}
              fileLimit={fileUploadProps.fileLimit || 1}
              maxSize={fileUploadProps.maxSize || 10}
              allowedTypes={fileUploadProps.allowedTypes || ['.xlsx', '.xls']}
              onFilesChange={handleFilesChange}
              buttonText="Select Excel File"
            />
          </div>

          {additionalFields.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
              <Input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ""}
                onChange={handleInputChange}
                required={field.required}
                placeholder={field.placeholder}
                className="max-w-md"
              />
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormDataUpload;
