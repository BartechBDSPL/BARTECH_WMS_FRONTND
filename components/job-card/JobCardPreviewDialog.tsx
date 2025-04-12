import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JobCardReportData {
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
}

interface ColorSequenceData {
  Status: string;
  Message: string;
  Color: string;
  Anilox: string;
  BCM: string;
  JobCardNumber: string;
  CreatedBy: string;
  CreatedDate: string;
  ColorSequence: string;
}

interface JobCardPreviewDialogProps {
  jobCard: JobCardReportData;
  colorSequence: ColorSequenceData[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobCardPreviewDialog: React.FC<JobCardPreviewDialogProps> = ({ 
  jobCard, 
  colorSequence, 
  isOpen, 
  onOpenChange 
}) => {
  const printJobCard = () => {
    const printContent = document.getElementById('job-card-print-content');
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Job Card Preview - {jobCard.JobCardNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto">
          <div id="job-card-print-content" className="border border-gray-800">
            <div className="text-center bg-gray-100 font-bold text-xl border-b border-gray-800 py-2">
              JC MASTER
            </div>
            
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4">Label Type</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4">{jobCard.LabelType}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4">JC No</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 text-red-600">{jobCard.JobCardNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Customer Name</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.CompanyName}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Job Description</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.JobDescription}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Product Code</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.MatCode}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Material Description</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.MatDesc}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Lamination Material</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.LaminationMaterial || "NA"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Foil Material Code</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.FoilMaterialCode || "NA"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1">Special Characteristics</td>
                  <td className="border border-gray-800 px-2 py-1" colSpan={3}>{jobCard.SpecialCharacteristic || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Customer Part No.</td>
                  <td className="border border-gray-800 px-2 py-1"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1">Size</td>
                  <td className="border border-gray-800 px-2 py-1">{`${jobCard.Width}X${jobCard.Height}`}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Cylinder</td>
                  <td className="border border-gray-800 px-2 py-1 "></td>
                  <td className="border border-gray-800 font-bold px-2 py-1">Ups Across</td>
                  <td className="border border-gray-800 px-2 py-1">{jobCard.Ups || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Supply Form</td>
                  <td className="border border-gray-800 px-2 py-1"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1">Ups Along</td>
                  <td className="border border-gray-800 px-2 py-1">4</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Winding Direction</td>
                  <td className="border border-gray-800 px-2 py-1"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1">Gap Across</td>
                  <td className="border border-gray-800 px-2 py-1">NA</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Foiling</td>
                  <td className="border border-gray-800 px-2 py-1">NA</td>
                  <td className="border border-gray-800 font-bold px-2 py-1">Gap Along</td>
                  <td className="border border-gray-800 px-2 py-1">0</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Die No.</td>
                  <td className="border border-gray-800 px-2 py-1 ">{jobCard.DieNumber}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 ">Die Type</td>
                  <td className="border border-gray-800 px-2 py-1 ">{jobCard.DieType}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1">Core Dia</td>
                  <td className="border border-gray-800 px-2 py-1">{jobCard.Core}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1" colSpan={2}>Number of labels</td>
                </tr>
              </tbody>
            </table>
            
            {/* Only show color sequence for PP label type */}
            {jobCard.LabelType === 'PP' && colorSequence && colorSequence.length > 0 && (
              <div className="mt-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-800 font-bold px-2 py-1 text-center" colSpan={4}>
                        Color Sequence
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Unit No</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Color</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Anilox</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">BCM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorSequence.map((color: ColorSequenceData, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.ColorSequence}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.Color}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.Anilox}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.BCM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={printJobCard} className="flex items-center gap-2">
            <Printer size={16} /> Print Job Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobCardPreviewDialog;
