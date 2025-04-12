// components/masters/ApprovalDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/use-toast';
import { BACKEND_URL } from '@/lib/constants';
import Cookies from 'js-cookie';

// Using the same interface from your JobCard component
interface JobCardApprovalData {
  CompanyName: string;
  CompanyAddress: string;
  JobDescription: string;
  LabelType: string;
  Height: string;
  Width: string;
  Unit: string;
  Ups: string;
  Core: string;
  CutPerforation: string;
  MatCode: string;
  MatDesc: string;
  DieType: string;
  DieNumber: string;
  LaminationMaterial: string;
  FoilMaterialCode: string;
  SpecialCharacteristic: string;
  JobCardNumber: string;
  JcSerialNumber: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
  Machine: string;
  ColorNo: string;
  PaperType: string;
  UpsAcross: string;
  UpsAlong: string;
  GapAcross: string;
  GapAlong: string;
  NumberOfLabel: string;
  CustomerPartNumber: string;
  BlockNo: string;
  SupplyForm: string;
  WindingDirection: string;
  LabelDescription: string;
  Image: string;
  ApprovedBy: string | null;
  ApprovedDate: string | null;
  ApproveStatus: string | null;
  OldProductCode: string;
  CylinderCode: string;
  ThermalPrintingRequired: string;
  RibbonType: string;
  MaterialWeb: string;
  PlateFolderNo: string;
}

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJobCards: string[];
  selectedJobCardData: JobCardApprovalData[];
  onApproveSuccess: () => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({ 
  open, 
  onOpenChange, 
  selectedJobCards,
  selectedJobCardData,
  onApproveSuccess 
}) => {
  const [remarks, setRemarks] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = Cookies.get('token');
  const username = Cookies.get('username') || '';

  const handleSubmit = async () => {
    if (!approvalCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Approval code is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Include relevant information from selectedJobCardData
      const payload = {
        JobCardNumber: selectedJobCards.join('$'),
        ApprovedBy: username,
        ApprovalCode: approvalCode,
        Remarks: remarks,
        // You can add more data from the selectedJobCardData if needed
        JobCardDetails: selectedJobCardData.map(card => ({
          JobCardNumber: card.JobCardNumber,
          LabelType: card.LabelType,
          CompanyName: card.CompanyName
        }))
      };

      const response = await fetch(`${BACKEND_URL}/api/transaction/approve-j`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully approved ${selectedJobCards.length} job card(s).`,
          variant: "default",
        });
        onApproveSuccess();
        handleClear();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve job cards",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving job cards",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setRemarks('');
    setApprovalCode('');
  };




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Job Card</DialogTitle>
        </DialogHeader>
        
        {/* Display summary of selected job cards */}
        {selectedJobCardData.length > 0 && (
          <div className="border rounded p-2 mb-2 max-h-[150px] overflow-y-auto text-sm">
            <p className="font-semibold mb-1">Selected Job Cards:</p>
            {selectedJobCardData.map((card, index) => (
              <div key={index} className="text-xs mb-1 border-b pb-1 last:border-b-0">
                <p className="font-medium text-primary">{card.JobCardNumber}</p>
                <p className="text-gray-600">{card.CompanyName} - {card.JobDescription}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="approvalCode">Approval Code</Label>
            <Input
              id="approvalCode"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value)}
              placeholder="Enter approval code"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks (optional)"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Processing..." : "Submit Approval"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;