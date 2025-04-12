"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CalendarIcon, ChevronDown, Check, Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import jsPDF from 'jspdf';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Cookies from 'js-cookie';
import ExportToExcel from '@/utills/reports/ExportToExcel';
import { Checkbox } from "@/components/ui/checkbox";
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
import TableSearch from '@/utills/tableSearch';
import CustomDropdown from '../CustomDropdown';
import { Label } from '../ui/label';
import axios from 'axios';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../ui/dialog';

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

interface LabelTypeData {
  SrNo: number;
  LtypeCode: string;
  LtypeDes: string;
}

const JobCardApproval = () => {
  const [jobCardNo, setJobCardNo] = useState("");
   const [customerName, setCustomerName] = useState("");
    const [hight, setHight] = useState("");
    const [width, setWidth] = useState("");
  const [selectedLabelType, setSelectedLabelType] = useState("");
  const [labelTypes, setLabelTypes] = useState<LabelTypeData[]>([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<JobCardApprovalData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [colorSequenceData, setColorSequenceData] = useState<{ [key: string]: ColorSequenceData[] }>({});
  const token = Cookies.get('token');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const username = Cookies.get('username') || '';
  const [selectedJobCard, setSelectedJobCard] = useState<JobCardApprovalData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
 
  const fetchLabelTypes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-labeltype`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabelTypes(response.data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch label types" });
    }
  };

  const handleCustomValueChange = (fieldName: string) => (value: string) => {
    if (fieldName === "labelType") {
      setSelectedLabelType(value);
    }
  };

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        'JobCardNumber', 
        'LabelType', 
        'CompanyName', 
        'JobDescription', 
        'MatCode', 
        'MatDesc',
        'CreatedBy'
      ];
      return searchableFields.some(key => {
        const value = (item as any)[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [reportData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);

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
      CompanyName: customerName.trim(),
      Height: hight.trim(),
      Width: width.trim(),
      JobCardNumber: jobCardNo.trim(),
      LabelType: selectedLabelType.trim(),
      FrmDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd")
    };
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/job-card-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
  
      const data: JobCardApprovalData[] = await response.json();
      if (data.length === 0) {
        setReportData([]);
        setShowTable(true);
        return;
      }
  
      setReportData(data);
      setShowTable(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLabelTypes();
  }, []);

  const toggleRow = async (jobCardNumber: string, labelType: string) => {
    // Only allow expanding for PP label type
    if (labelType !== 'PP') {
      return;
    }
    
    setExpandedRows(prev => {
      const isExpanded = !prev[jobCardNumber];
      return { ...prev, [jobCardNumber]: isExpanded };
    });

    if (!colorSequenceData[jobCardNumber] && !expandedRows[jobCardNumber]) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/reports/get-color-sequence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ JobCardNumber: jobCardNumber }),
        });

        const data: ColorSequenceData[] = await response.json();
        setColorSequenceData(prev => ({ ...prev, [jobCardNumber]: data }));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch color sequence data",
          variant: "destructive",
        });
      }
    }
  };

  const handleClear = () => {
    setJobCardNo("");
    setSelectedLabelType("");
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
    setCustomerName(""),
    setHight(""),
    setWidth("")
  };

  const exportToPdf = (data: JobCardApprovalData[], fileName: string): void => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const columns = [
      { header: 'Job Card No', dataKey: 'JobCardNumber' },
      { header: 'Label Type', dataKey: 'LabelType' },
      { header: 'Company Name', dataKey: 'CompanyName' },
      { header: 'Job Description', dataKey: 'JobDescription' },
      { header: 'Material Code', dataKey: 'MatCode' },
      { header: 'Material Desc', dataKey: 'MatDesc' },
      { header: 'Height', dataKey: 'Height' },
      { header: 'Width', dataKey: 'Width' },
      { header: 'Unit', dataKey: 'Unit' },
      { header: 'Creation Date', dataKey: 'CreatedDate' },
      { header: 'Created By', dataKey: 'CreatedBy' },
    ];
  
    const formattedData = data.map(row => ({
      ...row,
      CreatedDate: row.CreatedDate ? format(new Date(row.CreatedDate), 'yyyy-MM-dd') : '',
    }));
  
    doc.setFontSize(18);
    doc.text(`Job_Card_Master_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`, 14, 22);
  
    (doc as any).autoTable({
      columns: columns,
      body: formattedData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 15 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
        8: { cellWidth: 15 },
        9: { cellWidth: 20 },
        10: { cellWidth: 20 },
      },
      headStyles: { fillColor: [66, 66, 66] },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });
  
    doc.save(`${fileName}.pdf`);
  };

  const handleExportToPDF = () => {
    exportToPdf(reportData, `Job_Card_Master_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`);
  };

  const NoDataCard = () => (
    <Card className="mt-5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Found</h3>
        <p className="text-gray-500 text-center max-w-md">
          No records found for the given search criteria. 
          Try adjusting your filters or selecting a different date range.
        </p>
      </CardContent>
    </Card>
  );

  // Check if all visible rows are selected
  const allSelected = useMemo(() => {
    return paginatedData.length > 0 && 
           paginatedData.every(row => selectedRows.includes(row.JobCardNumber));
  }, [paginatedData, selectedRows]);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(prevSelected => 
        prevSelected.filter(id => !paginatedData.some(row => row.JobCardNumber === id))
      );
    } else {
      const newSelectedRows = [...selectedRows];
      paginatedData.forEach(row => {
        if (!newSelectedRows.includes(row.JobCardNumber)) {
          newSelectedRows.push(row.JobCardNumber);
        }
      });
      setSelectedRows(newSelectedRows);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (jobCardNumber: string) => {
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(jobCardNumber)) {
        return prevSelected.filter(id => id !== jobCardNumber);
      } else {
        return [...prevSelected, jobCardNumber];
      }
    });
  };

  // Handle job card approval
  const handleApproveJobCards = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No Job Cards Selected",
        description: "Please select at least one job card to approve.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/approve-job-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          JobCardNumber: selectedRows.join('$'),
          ApprovedBy: "admin"
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully approved ${selectedRows.length} job card(s).`,
          variant: "default",
        });
        // Refresh data after approval
        handleSubmitSearch();
        setSelectedRows([]);
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
      setIsLoading(false);
    }
  };

  const fetchColorSequence = async ({ jobCardNumber }: { jobCardNumber: string }): Promise<ColorSequenceData[]> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/get-color-sequence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ JobCardNumber: jobCardNumber }),
      });

      const data: ColorSequenceData[] = await response.json();
      setColorSequenceData(prev => ({ ...prev, [jobCardNumber]: data }));
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch color sequence data",
        variant: "destructive",
      });
      return [];
    }
  };

  const handlePreviewClick = async ({ jobCard }: { jobCard: JobCardApprovalData }): Promise<void> => {
    setSelectedJobCard(jobCard);
    
    // If job card is PP type and we don't have color data yet, fetch it
    if (jobCard.LabelType === 'PP' && !colorSequenceData[jobCard.JobCardNumber]) {
      await fetchColorSequence({ jobCardNumber: jobCard.JobCardNumber });
    }
    
    setIsPreviewOpen(true);
  };

  // console.log(reportData)

  const JobCardPreviewDialog = ({ jobCard, colorSequence }: { jobCard: JobCardApprovalData, colorSequence: ColorSequenceData[] }) => {
    const printJobCard = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to print the job card",
          variant: "destructive",
        });
        return;
      }
      
      const printContent = document.getElementById('job-card-print-content');
      
      if (printContent) {
        const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 1cm;
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
              border: 2px solid #000;
            }
            th, td {
              border: 2px solid #000;
              padding: 6px 8px;
              font-size: 13px;
            }
            td {
              font-weight: 500;
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
              padding: 10px;
              border-bottom: 2px solid #000;
              margin-bottom: 10px;
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
            <title>Job Card - ${selectedJobCard?.JobCardNumber || 'Print'}</title>
            ${printStyles}
          </head>
          <body>
            <div class="print-container">
              <div class="header">JOB CONTROL MASTER</div>
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                // window.close();
              }
            </script>
          </body>
          </html>
        `);
        
        printWindow.document.close();
      }
    };

    // Function to get appropriate icon based on file extension
    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return <Eye size={16} />;
        case 'pdf':
          return <FaFilePdf size={16} className="text-red-500" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel size={16} className="text-green-500" />;
        default:
          return <Eye size={16} />;
      }
    };

    // Function to handle file download
    const handleFileDownload = (filePath: string) => {
      const fullUrl = `${BACKEND_URL}/${filePath}`;
      window.open(fullUrl, '_blank');
    };

    // Split the image paths
    const documentPaths = jobCard.Image ? jobCard.Image.split(',') : [];

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
          JOB CONTROL MASTER PERVIEW - {jobCard.JobCardNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div id="job-card-print-content" className="border border-gray-800">
            {/* <div className="text-center bg-gray-100 font-bold text-xl border-b border-gray-800 py-2">
              JOB CONTROL MASTER
            </div> */}
            
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">Label Type</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 font-semibold">{jobCard.LabelType}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">JC No</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 text-red-600 font-semibold">{jobCard.JobCardNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Customer Name</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.CompanyName}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Job Description</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.JobDescription}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Code</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.MatCode}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Web</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.MaterialWeb}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Description</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.MatDesc}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Lamination Material Varnish</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.LaminationMaterial || "NA"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Foil Material Code</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.FoilMaterialCode || "NA"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Special Characteristics</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.SpecialCharacteristic || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Machine</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{jobCard.Machine || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Thermal Printing Required</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.ThermalPrintingRequired || "-"}</td>
                  <td className='border border-gray-800 font-bold px-2 py-1 bg-gray-100'>Ribbon Type</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.RibbonType || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Customer Part No.</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.CustomerPartNumber}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Size</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{`${jobCard.Width}X${jobCard.Height}`}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Cylinder Teeth</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{jobCard.CylinderCode || ''}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Ups Across</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.UpsAcross || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Supply Form</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.SupplyForm}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Ups Along</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.UpsAlong}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Winding Direction</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.WindingDirection}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Gap Across</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.GapAcross || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Foiling</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.FoilMaterialCode}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Gap Along</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.GapAlong}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Die No.</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{jobCard.DieNumber}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100 ">Die Type</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{jobCard.DieType}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Plate Folder Number</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{jobCard.PlateFolderNo || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Slitting Ups</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{jobCard.Ups || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Core Dia</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.Core}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Number of labels per roll</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.NumberOfLabel}</td>
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

          {/* Document attachments section */}
          {documentPaths.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Attachments</h3>
              <div className="overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {documentPaths.map((path, index) => {
                    const fileName = path.trim().split('/').pop() || '';
                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 whitespace-nowrap"
                        onClick={() => handleFileDownload(path.trim())}
                      >
                        {getFileIcon(fileName)}
                        <span className="max-w-[150px] truncate">{fileName}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={printJobCard} className="flex items-center gap-2">
            <Printer size={16} /> Print Job Card
          </Button>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-4">
      <Card className='mt-5'>
        <CardHeader>
          <CardTitle>Job Control Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Label Type</Label>
              <CustomDropdown
                options={[
                  { value: "", label: "All" },
                  ...labelTypes.map(lt => ({ 
                    value: lt.LtypeCode, 
                    label: `${lt.LtypeCode} - ${lt.LtypeDes}`
                  }))
                ]}
                value={selectedLabelType || ""}
                onValueChange={(value) => setSelectedLabelType(value)}
                placeholder="Select Label Type"
                searchPlaceholder="Search label type..."
                emptyText="No label types found"
                allowCustomValue
                onCustomValueChange={handleCustomValueChange("labelType")}                     
              />      
            </div>
            <div className="space-y-2">
               <Label htmlFor='customerName'>Customer Name</Label>
               <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)}  placeholder=' Enter Customer Name'/>
             </div>
             <div className="space-y-2">
               <Label>Height (mm/inch)</Label>
               <Input type='number' step="0.01" value={hight} onChange={(e) => setHight(e.target.value)} placeholder='Enter Height'/>
             </div>
             <div className="space-y-2">
               <Label>Width (mm/inch)</Label>
               <Input type='number' step="0.01" value={width} onChange={(e) => setWidth(e.target.value)} placeholder='Enter Width'/>
             </div>
                         
            <div className="space-y-2">
              <Label>Job Card Number</Label>
              <Input value={jobCardNo} onChange={(e) => setJobCardNo(e.target.value)} />
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
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
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
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <div className="flex gap-2">
              <Button onClick={handleSubmitSearch}>Search</Button>
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button 
                onClick={handleApproveJobCards} 
                disabled={selectedRows.length === 0 || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                {isLoading ? "Processing..." : `Approve Selected (${selectedRows.length})`}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto"></div>
                {/* <ExportToExcel 
                  data={reportData} 
                  fileName={`Job_Card_Master_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`}
                /> */}
              
              </div>
            </div>
        </CardContent>
      </Card>

      {showTable && (
        reportData.length > 0 ? (
          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">Job Card Approval</CardHeader>
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
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={allSelected} 
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                    <TableHead></TableHead>
                    <TableHead>Job Card No</TableHead>
                    <TableHead>Label Type</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Job Description</TableHead>
                    <TableHead>Material Code</TableHead>
                    <TableHead>Material Description</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Width</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Creation Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => {
                      const isSelected = selectedRows.includes(row.JobCardNumber);
                      return (
                        <React.Fragment key={index}>
                          <TableRow 
                            className={cn(
                              isSelected && "bg-primary/10"
                            )}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleSelectRow(row.JobCardNumber)}
                                aria-label={`Select row ${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              {row.LabelType === 'PP' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleRow(row.JobCardNumber, row.LabelType)}
                                >
                                  {expandedRows[row.JobCardNumber] ? (
                                    <ChevronDown size={20} className="transform rotate-180 transition-transform duration-200" />
                                  ) : (
                                    <ChevronDown size={20} className="transition-transform duration-200" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>{row.JobCardNumber}</TableCell>
                            <TableCell>{row.LabelType}</TableCell>
                            <TableCell>{row.CompanyName}</TableCell>
                            <TableCell >{row.JobDescription}</TableCell>
                            <TableCell>{row.MatCode}</TableCell>
                            <TableCell className='min-w-[250px]'>{row.MatDesc}</TableCell>
                            <TableCell>{row.Height}</TableCell>
                            <TableCell>{row.Width}</TableCell>
                            <TableCell>{row.Unit}</TableCell>
                            <TableCell>{row.CreatedDate ? new Date(row.CreatedDate).toLocaleDateString() : ""}</TableCell>
                            <TableCell>{row.CreatedBy}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={() => handlePreviewClick({ jobCard: row })}
                              >
                                <Eye size={16} /> Preview
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {/* Show color sequence data for PP label type */}
                          {row.LabelType === 'PP' && expandedRows[row.JobCardNumber] && (
                            <TableRow>
                              <TableCell colSpan={13}>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Color Sequence</TableHead>
                                      <TableHead>Color</TableHead>
                                      <TableHead>Anilox</TableHead>
                                      <TableHead>BCM</TableHead>
                                      <TableHead>Created By</TableHead>
                                      <TableHead>Created Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {colorSequenceData[row.JobCardNumber]?.map((color, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{color.ColorSequence}</TableCell>
                                        <TableCell>{color.Color}</TableCell>
                                        <TableCell>{color.Anilox}</TableCell>
                                        <TableCell>{color.BCM}</TableCell>
                                        <TableCell>{color.CreatedBy}</TableCell>
                                        <TableCell>{color.CreatedDate ? new Date(color.CreatedDate).toLocaleDateString() : ""}</TableCell>
                                      </TableRow>
                                    ))}
                                    {(!colorSequenceData[row.JobCardNumber] || colorSequenceData[row.JobCardNumber].length === 0) && (
                                      <TableRow>
                                        <TableCell colSpan={6} className="text-center">No color sequence data available</TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center">No Data Found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center text-sm md:text-md mt-4">
                <div>
                  {filteredData.length > 0 
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries`
                    : 'No entries to show'}
                </div>
                {filteredData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
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
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
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
        )
      )}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {selectedJobCard && (
          <JobCardPreviewDialog 
            jobCard={selectedJobCard} 
            colorSequence={colorSequenceData[selectedJobCard.JobCardNumber] || []}
          />
        )}
      </Dialog>
    </div>
  );
};

export default JobCardApproval;