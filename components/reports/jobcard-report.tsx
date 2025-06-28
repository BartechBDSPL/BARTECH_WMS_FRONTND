"use client";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CalendarIcon,
  ChevronDown,
  Eye,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URL } from "@/lib/constants";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import Cookies from "js-cookie";
import ExportToExcel from "@/utills/reports/ExportToExcel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import TableSearch from "@/utills/tableSearch";
import CustomDropdown from "../CustomDropdown";
import { Label } from "../ui/label";
import axios from "axios";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "../ui/dialog";
import { getWindingImagePath } from "@/utills/new/getWindingImagePath";
import { Skeleton } from "../ui/skeleton";



/**
|--------------------------------------------------
| {
        "SrNo": 2,
        "WorkOrderNo": "WRK000002",
        "Date": "2025-06-04T00:00:00.000Z",
        "Shift": "",
        "SONo": "dsd",
        "SODate": "2025-06-03T18:30:00.000Z",
        "JobCardNumber": "PP027",
        "JobDescription": " RR KABEL BLUE",
        "LabelSize": "100×60MM",
        "WindingDirection": "F2",
        "MatDesc": "Custom material",
        "MaterialWeb": "220",
        "CylinderCode": "80",
        "UpsAcross": "4",
        "UpsAlong": "20",
        "GapAcross": "4",
        "GapAlong": "87.3",
        "POQuantity": "1000",
        "MetersOfRuns": "4.08",
        "DieType": "ROTARY",
        "DieNumber": "R017",
        "LaminationMaterial": "NA",
        "FoilMaterialCode": "NA",
        "ThermalPrintingRequired": "YES",
        "RibbonType": "RM150",
        "Machine": "BRT/8",
        "Operator": "",
        "SettingStartTime": null,
        "SettingEndTime": null,
        "ProductionStartTime": null,
        "ProductionEndTime": null,
        "TotalMetersProduced": "",
        "Remarks": "",
        "Date2": "2025-06-04T00:00:00.000Z",
        "Shift2": "",
        "Operator2": "Pobitra",
        "SettingStartTime2": null,
        "SettingEndTime2": null,
        "ProductionStartTime2": null,
        "ProductionEndTime2": null,
        "TotalImpressions": "",
        "Remarks2": "Urjetct",
        "Date3": "2025-06-04T00:00:00.000Z",
        "Shift3": "",
        "Operator3": "Tset",
        "NumberOfRolls": "1",
        "LabelPerRoll": "1000",
        "Core": "1.5",
        "SettingStartTime3": null,
        "SettingEndTime3": null,
        "ProductionStartTime3": null,
        "ProductionEndTime3": null,
        "NumberOfLabelProduced": "",
        "NumberOfRollsProduced": "",
        "Wastage": "",
        "Remark3": "HEllo",
        "CreatedBy": "admin",
        "CreatedDate": "2025-06-14T16:54:59.960Z",
        "ArtworkNo": "027",
        "PlateFolderNo": ""
    },
|--------------------------------------------------
*/

interface JobCardReportData {
  SrNo: number;
  WorkOrderNo: string;
  Date: Date;
  Shift: string;
  SONo: string;
  SODate: string;
  JobCardNumber: string;
  JobDescription: string;
  LabelSize: string; 
  WindingDirection: string;
  MatDesc: string;
  MaterialWeb: string;
  CylinderCode: string;
  UpsAcross: string;
  UpsAlong: string;
  GapAcross: string;
  GapAlong: string;
  POQuantity: string;
  MetersOfRuns: string;
  DieType: string;
  DieNumber: string;
  LaminationMaterial: string;
  FoilMaterialCode: string;
  ThermalPrintingRequired: string;
  RibbonType: string;
  Machine: string;
  Operator: string;
  SettingStartTime: string;
  SettingEndTime: string;
  ProductionStartTime: string;
  ProductionEndTime: string;
  TotalMetersProduced: string;
  Remarks: string;
  Date2: Date;
  Shift2: string;
  Operator2: string;
  SettingStartTime2: string;
  SettingEndTime2: string;
  ProductionStartTime2: string;
  ProductionEndTime2: string;
  TotalImpressions: string;
  Remarks2: string;
  Date3: string;
  Shift3: string;
  Operator3: string;
  NumberOfRolls: string;
  LabelPerRoll: string;
  Core: string;
  SettingStartTime3: string;
  SettingEndTime3: string;
  ProductionStartTime3: string;
  ProductionEndTime3: string;
  NumberOfLabelProduced: string;
  NumberOfRollsProduced: string;
  Wastage: string;
  Remark3: string;
  CreatedBy: string;
  CreatedDate: string;
  ArtworkNo: string;
  PlateFolderNo: string;
  serial_no: number;
  unique_trans_serialno: number;
  unique_party_name: number;
  unique_product_code: number;
  voucher_no: string;
  invoice_no: string;
  qc_status: string;
  qty: string;
  product_name: string;
  

}
interface PreviewJobCardParams {
  jobCard: JobCardReportData;
}

interface JobCardPreviewDialogProps {
  selectedJobCard: JobCardReportData | null;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  isSubmitting?: boolean;
}

const JobCardNewReport = () => {
  
  const [soNo, setSoNo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [shift, setShift] = useState("");
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<JobCardReportData[]>([]);
   const [selectedJobCard, setSelectedJobCard] = useState<JobCardReportData | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    serial_no: 0,
    unique_trans_serialno: 0,
    unique_party_name: 0,
    unique_product_code: 0,
  });

  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const searchableFields = [
       "WorkOrderNo",
       'Shift',
       'JobCardNumber',
       'JobDescription',
       'LabelSize',
       'WindingDirection'
      ];
      return searchableFields.some((key) => {
        const value = (item as any)[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [reportData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  }, []);

  const handleSubmitSearch = async () => {
    
    if (fromDate > toDate) {
      toast({
        title: "Validation Error",
        description: "From Date cannot be greater than To Date",
        variant: "destructive",
      });
      return;
    }
    const requestBody = {
      SONo: soNo,
      JobDescription: jobDescription,
      Shift: shift,
      JobCardNumber: jobCardNumber,
      FrmDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/reports/get-job-card-new-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );


      const data: JobCardReportData[] = await response.json();
      if (data.length === 0) {
        setReportData([]);
      
        setShowTable(true);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        return;
      }

      setReportData(data);
      
      setShowTable(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
   
    setCardData({
      serial_no: 0,
      unique_trans_serialno: 0,
      unique_party_name: 0,
      unique_product_code: 0,
    });
  };

  const exportToPdf = (data: JobCardReportData[], fileName: string): void => {
    try {
      const doc = new jsPDF("l", "mm", "a4");
      const columns = [
        { header: "Serial No", dataKey: "serial_no" },
        { header: "Trans Serial No", dataKey: "TransSerialNo" },
        { header: "Voucher No", dataKey: "voucher_no" },
        { header: "Party Name", dataKey: "party_name" },
        { header: "Product Code", dataKey: "product_code" },
        { header: "Product Name", dataKey: "product_name" },
        { header: "QC Status", dataKey: "qc_status" },
        { header: "QC By", dataKey: "qc_by" },
      ];

      const formattedData = data.map((row) => ({
        ...row,
        // TransSerialNo: row.trans_serialno,
      }));

      doc.setFontSize(18);
      doc.text(
        `Job Card Report - ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        14,
        22
      );

      (doc as any).autoTable({
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          overflow: "linebreak",
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
          5: { cellWidth: 90 },
          6: { cellWidth: 15 },
          7: { cellWidth: 15 },
          8: { cellWidth: 15 },
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: (data: any) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });

      doc.save(`${fileName}.pdf`);

      toast({
        title: "Success",
        description: "PDF exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportToPDF = () => {
    if (reportData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const fileName = `JOB_Card_Report_${format(new Date(), "yyyy-MM-dd_HH-mm")}`;
    exportToPdf(reportData, fileName);
  };

  

  const NoDataCard = () => (
    <Card className="mt-5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Data Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          No records found for the given search criteria. Try adjusting your
          filters or selecting a different date range.
        </p>
      </CardContent>
    </Card>
  );



const handlePreviewClick = (jobCard: JobCardReportData) => {
  setSelectedJobCard(jobCard);
  setIsPreviewOpen(true);
};

const JobCardPreviewDialog = ({ selectedJobCard, isPreviewOpen, setIsPreviewOpen, isSubmitting }: JobCardPreviewDialogProps) => {
  if (!selectedJobCard) return null;

  const shift = selectedJobCard.Shift3 || selectedJobCard.Shift || '';
  
  const printJobCard = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print the job card",
        variant: "destructive",
      });
      return;
    }

    const printContent = document.getElementById("job-card-print-content");
    if (!printContent) {
      toast({
        title: "Error",
        description: "Print content not found.",
        variant: "destructive",
      });
      return;
    }

    const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 0.8cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
              border: 1px solid #000;
            }
            thead {
            background-color: #c6c0c0;
            }
            th, td {
              border: 2px solid #000;
              padding: 4px 6px;
              font-size: 10px;
            }
            td {
              font-weight: 400;
            }
            td:nth-child(odd) {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 20px;
              background-color: #f0f0f0;
              padding: 8px;
              margin-bottom: 4px;
            }
            .jc-number {
              color: #E53E3E;
              font-weight: bold;
            }
            .table-header {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .value-cell {
              font-weight: 600;
            }
              img {
              max-height: 40px; /* Adjust for print */
              width: auto;
              display: block;
              margin-left: auto;
              margin-bottom: 2px;
            }
            @media print {
              body { zoom: 100%; }
              table { border: 2px solid #000 !important; }
              th, td { border: 2px solid #000 !important; }
            }
          </style>
        `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Control Master - ${selectedJobCard.JobCardNumber || "Print"}</title>
        ${printStyles}
      </head>
      <body>
        <div class="print-container">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Eye size={16} />;
      case "pdf":
        return <FaFilePdf size={16} className="text-red-500" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel size={16} className="text-green-500" />;
      default:
        return <Eye size={16} />;
    }
  };

  // const uploadedFiles = selectedJobCard.uploadedFiles || []; // Ensure uploadedFiles is defined
  const jobCardDate = selectedJobCard.Date ? new Date(selectedJobCard.Date) : null;

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Job Card Preview - {selectedJobCard.WorkOrderNo}
          </DialogTitle>
        </DialogHeader>

        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div id="job-card-print-content" className="border border-gray-800">
            <div className="flex justify-end mb-4">
              BARTECH DATA SYSTEM PVT. LTD.
              <img
                src="/images/bartech.png"
                alt="Bartech Logo"
                className="h-16 w-auto"
              />
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-start"
                    colSpan={2}
                  >
                    Job Card NO: {selectedJobCard.WorkOrderNo || ''}
                  </th>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-start"
                    colSpan={4}
                  >
                    Job Card Date:{" "}
                    {jobCardDate ? jobCardDate.toLocaleDateString() : ""}
                  </th>
                </tr>
              </thead>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Printing
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row with 4 columns, extended to 6 */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jobCardDate ? jobCardDate.toLocaleDateString() : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.Shift || ""}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                   SO NO
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.SONo || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    SO DT
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    
                  >
                   {selectedJobCard.SODate ? new Date(selectedJobCard.SODate).toLocaleDateString() : ""} 
                  </td>
                </tr>

                {/* Row with mix of widths, normalized to 6 columns */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.JobCardNumber || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control Desc.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                   {selectedJobCard.JobDescription || "No Job Description"}
                  </td>
                </tr>

               


                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Label Size
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.LabelSize || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Art Work No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.ArtworkNo}
                  </td>
                     <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                        Winding Direction
                      </td>
                      <td
                        className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                        colSpan={3}
                      >
                        <img
                          className="winding-image"
                          src={getWindingImagePath(selectedJobCard.WindingDirection)}
                          alt="Winding Image"
                      />
                      </td>
    
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Material Description
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.MatDesc}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Material Web
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.MaterialWeb || ""}
                  </td>
                </tr>

                {/* This is already a 6-column row, keep as is */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Cylinder
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.CylinderCode}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Ups Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.UpsAcross || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Up Along
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.UpsAlong ? selectedJobCard.UpsAlong : ""}
                  </td>
                </tr>

                {/* Convert 4-column row to 6-column */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Gap Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.GapAcross ? selectedJobCard.GapAcross : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Gap Along
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.GapAlong ? selectedJobCard.GapAlong : "No GapAlong"}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Quantity
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.POQuantity || ''}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Meters Of Runs
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.MetersOfRuns || ''}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Die Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.DieType || ''}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Die No.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.DieNumber || ''}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Lamination Material Varnish
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.LaminationMaterial || ''}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Foil
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.FoilMaterialCode || ''}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Thermal Printing
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.ThermalPrintingRequired || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Ribbon
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.RibbonType || ""}
                  </td>
                </tr>

                {/* Row with 4 columns, extended to 6 */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.Machine || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.Operator || ""}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Total Meters Producd
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {selectedJobCard.Remarks || ""}
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Punching
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.Date2 ? new Date(selectedJobCard.Date2).toLocaleDateString() : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.Shift || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.JobCardNumber ||  ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control Desc.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.JobDescription || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Label Size
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.LabelSize || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Winding Direction
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    <img
                     className="winding-image"
                     src={getWindingImagePath(selectedJobCard.WindingDirection)}
                     alt="Winding Image"
                 />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.Machine || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.Operator ||  ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Total Impressoins
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {selectedJobCard.TotalImpressions || ""}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {selectedJobCard.Remarks || "" }
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Slitting/Finishing
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {new Date(selectedJobCard.Date).toLocaleDateString()|| ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {shift ? shift : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.Machine || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.Operator3 || ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Rolls
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.NumberOfRolls ||  ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Lables Per roll
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.LabelPerRoll ||  ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Core Die
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {selectedJobCard.Core ||  ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Winding Direction
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                  <img
                     className="winding-image"
                     src={getWindingImagePath(selectedJobCard.WindingDirection)}
                     alt="Winding Image"
                 />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Lables Produced
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Rolls Produced
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Wastage %
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Art Work No.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {selectedJobCard.ArtworkNo ||  ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {selectedJobCard.Remark3 ||  ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

         
        </div>

        <DialogFooter className="flex justify-between mt-4 gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={printJobCard}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Printer size={16} /> Print Preview
            </Button>
          </div>
          
        </DialogFooter>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Report: Job Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">SONo</Label>
              <Input
                value={soNo}
                onChange={(e) => setSoNo(e.target.value)}
                placeholder=" Enter SONo"
              />
            </div>
            {/* all are inputs jobDescription, shift, jobCardNumber */}
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Input
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder=" Enter Job Description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Input
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder=" Enter Shift"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobCardNumber">Job Control Number</Label>
              <Input
                value={jobCardNumber}
                onChange={(e) => setJobCardNumber(e.target.value)}
                placeholder=" Enter Job Control Number"
              />
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? (
                      format(fromDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => setFromDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => setToDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4 mt-5 md:mt-10">
            <div className="flex space-x-2">
              <Button onClick={handleSubmitSearch}>Search</Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <div className="flex flex-col spac-y-2 sm:flex-row sm:space-x-2">
              <ExportToExcel
                data={reportData}
                fileName={`Job_Card_Report_${format(
                  new Date(),
                  "yyyy-MM-dd_HH-mm"
                )}`}
              />
              <Button
                variant="outline"
                onClick={handleExportToPDF}
                disabled={reportData.length === 0}
              >
                Export To PDF{" "}
                <FaFilePdf size={17} className="ml-2 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* --------------------- THis is to card-------------- */}
      
       {showTable &&
        (loading ? (
          <Card className="mt-5 p-6 space-y-4">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </Card>
        ) : reportData.length > 0 ? (
          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">
              Job Card Report
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder={itemsPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TableSearch onSearch={handleSearch} />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    
                    <TableHead>No.</TableHead>
                    <TableHead>Job Card No</TableHead>
                    <TableHead>Job Control No</TableHead>
                    <TableHead>JobDescription</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>SONo</TableHead>
                    <TableHead>SODate</TableHead>
                    <TableHead>LabelSize</TableHead>
                    <TableHead>WindingDirection</TableHead>
                    <TableHead>MatDesc</TableHead>
                    <TableHead>POQuantity</TableHead>
                    <TableHead>MetersOfRuns</TableHead>
                    <TableHead>ArtworkNo</TableHead>
                    <TableHead>CreatedBy</TableHead>
                    <TableHead>CreatedDate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>
                            {(currentPage - 1) * itemsPerPage + index + 1}.
                          </TableCell>
                          <TableCell>{row.WorkOrderNo}</TableCell>
                          <TableCell>{row.JobCardNumber}</TableCell>
                          <TableCell>{row.JobDescription}</TableCell>
                          <TableCell>{row.Shift}</TableCell>
                          <TableCell>{row.SONo}</TableCell>
                          <TableCell className="min-w-[100px]">{row.SODate ? format(row.SODate, "dd-MM-yyyy") : ""}</TableCell>
                          <TableCell>{row.LabelSize}</TableCell>
                          <TableCell>{row.WindingDirection}</TableCell>
                          <TableCell>{row.MatDesc}</TableCell>
                          <TableCell>{row.POQuantity}</TableCell>
                          <TableCell>{row.MetersOfRuns}</TableCell>
                          <TableCell>{row.ArtworkNo}</TableCell>
                          <TableCell>{row.CreatedBy}</TableCell>
                          <TableCell>{row.CreatedDate ? format(row.CreatedDate, "dd-MM-yyyy") : ""}</TableCell>
                          <TableCell>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                               onClick={() => handlePreviewClick(row)}
                              >
                                <Eye size={16} /> Preview
                              </Button>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center text-sm md:text-md mt-4">
                <div>
                  {filteredData.length > 0
                    ? `Showing ${
                        (currentPage - 1) * itemsPerPage + 1
                      } to ${Math.min(
                        currentPage * itemsPerPage,
                        filteredData.length
                      )} of ${filteredData.length} entries`
                    : "No entries to show"}
                </div>
                {filteredData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === currentPage}
                                onClick={() => setCurrentPage(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <NoDataCard />
        ))}

         <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
  <JobCardPreviewDialog 
    selectedJobCard={selectedJobCard}
    isPreviewOpen={isPreviewOpen}
    setIsPreviewOpen={setIsPreviewOpen}
    isSubmitting={false} // or your actual isSubmitting state
  />
</Dialog>

    </div>
  );
};

export default JobCardNewReport;
