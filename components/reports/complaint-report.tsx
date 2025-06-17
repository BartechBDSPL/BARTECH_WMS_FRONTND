"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Calendar as CalendarIcon, ChevronDown, Eye, Printer, TrendingUp, Users, Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Cookies from 'js-cookie';
import ExportToExcel from '@/utills/reports/ExportToExcel';
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
import { Label } from '../ui/label';

interface CustomerFeedbackReportData {
  ComplaintID: number;
  CustomerName: string;
  CustomerAddress: string;
  ContactPerson: string;
  ContactNo: string;
  EmailID: string;
  Invoice_PONo: string;
  HardwareType: string;
  Make: string;
  Model: string;
  SerialNo: string;
  UniqueSerialNo: string;
  Qty: number;
  DateOfWarrentyStart: string;
  WarrentyDays: number;
  DateOfWarrentyExp: string;
  WarrentyStatus: string;
  ComplaintBy: string;
  ComplaintEmailId: string;
  ComplaintName: string;
  ComplaintDescription: string;
  Priority: string;
  ComplaintDate: string;
  Status: string;
  TakenBy: string;
  AcknowledgedBy: string;
  AcknowledgedDate: string;
  ResolvedAt: string;
  ResolvedDate: string;
  TransBy: string;
  TransDate: string;
  imagePath: string;
  ComplaintContactNo: string;
  Type: string;
  ResolvedRemark: string;
  EstimatedDays: number;
  Problem: string;
  RootCause: string;
  Action: string;
  SoftwareType: string;
  ProjectTitle: string;
  ProjectVersion: string;
}

interface DashboardSummary {
  Total_Complaint: number;
  Open_Complaint: number;
  Resolved_Complaint: number;
  Acknowledge_But_Not_Resolved: number;
  UnAcknowledge_Complaint: number;
  Avg_Days_To_Acknowledge: number;
  Avg_Days_To_Resolve: number;
  Avg_Days_Ack_To_Res: number;
}

const CustomerComplaintReport = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [type, setType] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showDashboard, setShowDashboard] = useState(false); // Separate state for dashboard
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<CustomerFeedbackReportData[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [topComplaintUsers, setTopComplaintUsers] = useState<DashboardSummary[]>([]);
  const [acknowledgerSummary, setAcknowledgerSummary] = useState<DashboardSummary[]>([]);
  const [prioritySummary, setPrioritySummary] = useState<DashboardSummary[]>([]);

  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        "CustomerName", "CustomerAddress", "ContactPerson", "ContactNo", 
        "EmailID", "Invoice_PONo", "HardwareType", "Make", "Model", 
        "SerialNo", "UniqueSerialNo", "ComplaintBy", "ComplaintEmailId",
        "ComplaintName", "ComplaintDescription", "Priority", "Status",
        "TakenBy", "AcknowledgedBy", "ResolvedAt", "Type", "Problem",
        "RootCause", "Action", "SoftwareType", "ProjectTitle", "ProjectVersion"
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

  // Helper function to reset dashboard data
  const resetComplaintDashboardData = useCallback(() => {
    setDashboardData(null);
    setTopComplaintUsers([]);
    setAcknowledgerSummary([]);
    setPrioritySummary([]);
    setDebugInfo(null);
  }, []);

  const fetchDashboardSummary = async () => {
    setIsLoadingDashboard(true);

    try {
      const requestBody = {
        FromDate: format(fromDate, "yyyy-MM-dd"),
        ToDate: format(toDate, "yyyy-MM-dd"),
      };

      console.log("Complaint Dashboard Request Body:", requestBody);

      const response = await fetch(`${BACKEND_URL}/api/reports/get-Complaint-Dashboard-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("Complaint Dashboard API Response:", result);
      setDebugInfo(result);

      if (result.Status === "T" && Array.isArray(result.Data) && result.Data.length > 0) {
        // Fixed: Access the first item in the Data array directly
        const kpiData = result.Data[0] || {};
        
        // Process the main KPI data
        const processedSummary = {
          Total_Complaint: Number(kpiData.Total_Complaint) || 0,
          Open_Complaint: Number(kpiData.Open_Complaint) || 0,
          Resolved_Complaint: Number(kpiData.Resolved_Complaint) || 0,
          Acknowledge_But_Not_Resolved: Number(kpiData.Acknowledge_But_Not_Resolved) || 0,
          UnAcknowledge_Complaint: Number(kpiData.UnAcknowledge_Complaint) || 0,
          // Set default values for SLA metrics if not present in the response
          Avg_Days_To_Acknowledge: Number(kpiData.Avg_Days_To_Acknowledge) || 0,
          Avg_Days_To_Resolve: Number(kpiData.Avg_Days_To_Resolve) || 0,
          Avg_Days_Ack_To_Res: Number(kpiData.Avg_Days_Ack_To_Res) || 0,
        };

        setDashboardData(processedSummary);
        
        // Handle additional data arrays if they exist
        if (result.Data.length > 1) {
          setTopComplaintUsers(result.Data[1] || []);
        }
        if (result.Data.length > 2) {
          setAcknowledgerSummary(result.Data[2] || []);
        }
        if (result.Data.length > 3) {
          setPrioritySummary(result.Data[3] || []);
        }
        
      } else {
        resetComplaintDashboardData();
        // Set default dashboard data to show zeros when no data is available
        setDashboardData({
          Total_Complaint: 0,
          Open_Complaint: 0,
          Resolved_Complaint: 0,
          Acknowledge_But_Not_Resolved: 0,
          UnAcknowledge_Complaint: 0,
          Avg_Days_To_Acknowledge: 0,
          Avg_Days_To_Resolve: 0,
          Avg_Days_Ack_To_Res: 0,
        });
      }

    } catch (error) {
      console.error("Complaint Dashboard API Error:", error);
      resetComplaintDashboardData();
      
      // Set default dashboard data even on error
      setDashboardData({
        Total_Complaint: 0,
        Open_Complaint: 0,
        Resolved_Complaint: 0,
        Acknowledge_But_Not_Resolved: 0,
        UnAcknowledge_Complaint: 0,
        Avg_Days_To_Acknowledge: 0,
        Avg_Days_To_Resolve: 0,
        Avg_Days_Ack_To_Res: 0,
      });

      toast({
        title: "Error",
        description: "Failed to fetch complaint dashboard data",
        variant: "destructive",
      });

    } finally {
      setIsLoadingDashboard(false);
    }
  };

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
      CustomerName: customerName,
      CustomerAddress: customerAddress,
      Type: type,
      FromDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    try {
      // Always show dashboard when search is clicked
      setShowDashboard(true);
      
      // Fetch dashboard first
      await fetchDashboardSummary();

      const response = await fetch(`${BACKEND_URL}/api/reports/get-Complaint-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const changedata = await response.json();
      console.log("Complaint Report API Response:", changedata);

      if (changedata.Status === "T" && Array.isArray(changedata.Data)) {
        if (changedata.Data.length > 0) {
          setReportData(changedata.Data);
          setShowTable(true); // Show table only if there's data
        } else {
          setReportData([]);
          setShowTable(false); // Don't show table if no data
          toast({
            title: "No Data Found",
            description: "No complaint data found for the selected filters.",
            variant: "default",
          });
        }
      } else {
        setReportData([]);
        setShowTable(false); // Don't show table on error
        toast({
          title: "Error",
          description: changedata.Message || "Unexpected response from server.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Complaint Report API Error:", error);
      setReportData([]);
      setShowTable(false); // Don't show table on error
      // Keep showDashboard true to show dashboard even if report fails

      toast({
        title: "Error",
        description: "Failed to fetch complaint report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setReportData([]);
    setDashboardData(null);
    setFromDate(new Date());
    setToDate(new Date());
    setShowDashboard(false); // Hide dashboard
    setShowTable(false);
    setCustomerName('');
    setCustomerAddress('');
    setType('');
    setSearchTerm('');
    setCurrentPage(1);
    setDebugInfo(null);
    setTopComplaintUsers([]);
    setAcknowledgerSummary([]);
    setPrioritySummary([]);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 font-semibold';
    if (rating >= 3) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const exportToPdf = (data: CustomerFeedbackReportData[], fileName: string): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a3');

      const columns = [
        { header: 'Complaint ID', dataKey: 'ComplaintID' },
        { header: 'Customer Name', dataKey: 'CustomerName' },
        { header: 'Customer Address', dataKey: 'CustomerAddress' },
        { header: 'Contact Person', dataKey: 'ContactPerson' },
        { header: 'Contact No', dataKey: 'ContactNo' },
        { header: 'Email ID', dataKey: 'EmailID' },
        { header: 'Hardware Type', dataKey: 'HardwareType' },
        { header: 'Make', dataKey: 'Make' },
        { header: 'Model', dataKey: 'Model' },
        { header: 'Serial No', dataKey: 'SerialNo' },
        { header: 'Unique Serial No', dataKey: 'UniqueSerialNo' },
        { header: 'Qty', dataKey: 'Qty' },
        { header: 'Warranty Start', dataKey: 'DateOfWarrentyStart' },
        { header: 'Warranty Days', dataKey: 'WarrentyDays' },
        { header: 'Warranty Expiry', dataKey: 'DateOfWarrentyExp' },
        { header: 'Warranty Status', dataKey: 'WarrentyStatus' },
        { header: 'Complaint By', dataKey: 'ComplaintBy' },
        { header: 'Complaint Description', dataKey: 'ComplaintDescription' },
        { header: 'Complaint Date', dataKey: 'ComplaintDate' },
        { header: 'Status', dataKey: 'Status' },
        { header: 'Type', dataKey: 'Type' },
        { header: 'Resolved Remark', dataKey: 'ResolvedRemark' },
        { header: 'Problem', dataKey: 'Problem' },
        { header: 'Root Cause', dataKey: 'RootCause' },
        { header: 'Action', dataKey: 'Action' },
        { header: 'Software Type', dataKey: 'SoftwareType' },
        { header: 'Project Title', dataKey: 'ProjectTitle' },
      ];

      const formattedData = data.map(row => ({
        ...row,
        DateOfWarrentyStart: row.DateOfWarrentyStart ? format(new Date(row.DateOfWarrentyStart), 'yyyy-MM-dd') : '-',
        DateOfWarrentyExp: row.DateOfWarrentyExp ? format(new Date(row.DateOfWarrentyExp), 'yyyy-MM-dd') : '-',
        ComplaintDate: row.ComplaintDate ? format(new Date(row.ComplaintDate), 'yyyy-MM-dd') : '-',
        ComplaintDescription: row.ComplaintDescription?.substring(0, 50) || '-',
        ResolvedRemark: row.ResolvedRemark?.substring(0, 50) || '-',
        Problem: row.Problem?.substring(0, 50) || '-',
        RootCause: row.RootCause?.substring(0, 50) || '-',
        Action: row.Action?.substring(0, 50) || '-',
      }));

      doc.setFontSize(18);
      doc.text(`Complaint Warranty Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

      (doc as any).autoTable({
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: 20 },
          9: { cellWidth: 20 },
          10: { cellWidth: 25 },
          11: { cellWidth: 10 },
          12: { cellWidth: 20 },
          13: { cellWidth: 10 },
          14: { cellWidth: 20 },
          15: { cellWidth: 15 },
          16: { cellWidth: 20 },
          17: { cellWidth: 40 },
          18: { cellWidth: 20 },
          19: { cellWidth: 15 },
          20: { cellWidth: 15 },
          21: { cellWidth: 30 },
          22: { cellWidth: 30 },
          23: { cellWidth: 30 },
          24: { cellWidth: 20 },
          25: { cellWidth: 25 },
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didDrawPage: (data: any) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });

      doc.save(`${fileName}.pdf`);

      toast({
        title: "Success",
        description: "PDF exported successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
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
    
    const fileName = `Customer_Complaint_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
    exportToPdf(reportData, fileName);
  };

  const DashboardCards = () => {
    if (!dashboardData || !showDashboard) return null;

   return (
  <div className="space-y-4">
    {isLoadingDashboard && (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.Total_Complaint}</div>
          <p className="text-xs text-muted-foreground">All complaints in date range</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{dashboardData.Open_Complaint}</div>
          <p className="text-xs text-muted-foreground">Currently unresolved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved Complaints</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{dashboardData.Resolved_Complaint}</div>
          <p className="text-xs text-muted-foreground">Complaints closed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Acknowledged But Not Resolved</CardTitle>
          <Eye className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{dashboardData.Acknowledge_But_Not_Resolved}</div>
          <p className="text-xs text-muted-foreground">Waiting for resolution</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unacknowledged Complaints</CardTitle>
          <MessageSquare className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{dashboardData.UnAcknowledge_Complaint}</div>
          <p className="text-xs text-muted-foreground">Not yet acknowledged</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

  };

  const NoDataCard = () => (
    <Card className="mt-5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Found</h3>
        <p className="text-gray-500 text-center max-w-md">
          No customer feedback records found for the given search criteria. 
          Try adjusting your filters or selecting a different date range.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="p-2 max-w-md">
        <Card className="bg-white shadow-sm rounded-md">
          <CardContent className="p-2 text-center">
            <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
              Doc Ref : QR/SW/SP-06/01/R0
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        
        <Card className='mt-5'>
          <CardHeader>
            <CardTitle>Report: Customer Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor='customerName'>Customer Name</Label>
                <Input 
                  id='customerName'
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder='Enter Customer Name...'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor='customerAddress'>Company Name</Label>
                <Input 
                  id='customerAddress'
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  placeholder='Enter Company Name...'
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor='type'>Type</Label>
                  <Select
                      value={type}
                      onValueChange={(value) => setType(value)}
                  >
                      <SelectTrigger id="type">
                      <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="SW">Software</SelectItem>
                      <SelectItem value="HW">Hardware</SelectItem>
                      </SelectContent>
                  </Select>
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
            <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4 mt-5 md:mt-10">
              <div className="flex space-x-2">
                <Button onClick={handleSubmitSearch}>Search</Button>
                <Button variant="outline" onClick={handleClear}>Clear</Button>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <ExportToExcel data={reportData} fileName={`Customer_Feedback_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} />
                <Button variant="outline" onClick={handleExportToPDF} disabled={reportData.length === 0}>
                  Export To PDF  <FaFilePdf size={17} className='ml-2 text-red-500' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards - Show when showTable is true */}
        {showTable && <DashboardCards />}

        {showTable && (
          reportData.length > 0 ? (
            <Card className="mt-5">
              <CardHeader className="underline underline-offset-4 text-center">Customer Complaint Report</CardHeader>
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
      <TableHead>Complaint ID</TableHead>
      <TableHead>Customer Name</TableHead>
      <TableHead>Customer Address</TableHead>
      <TableHead>Contact Person</TableHead>
      <TableHead>Contact No</TableHead>
      <TableHead>Email ID</TableHead>
      <TableHead>Hardware Type</TableHead>
      <TableHead>Make</TableHead>
      <TableHead>Model</TableHead>
      <TableHead>Serial No</TableHead>
      <TableHead>Unique Serial No</TableHead>
      <TableHead>Qty</TableHead>
      <TableHead>Warranty Start</TableHead>
      <TableHead>Warranty Days</TableHead>
      <TableHead>Warranty Expiry</TableHead>
      <TableHead>Warranty Status</TableHead>
      <TableHead>Complaint By</TableHead>
      <TableHead>Complaint Email ID</TableHead>
      <TableHead>Complaint Name</TableHead>
      <TableHead>Complaint Description</TableHead>
      <TableHead>Priority</TableHead>
      <TableHead>Complaint Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Taken By</TableHead>
      <TableHead>Acknowledged By</TableHead>
      <TableHead>Acknowledged Date</TableHead>
      <TableHead>Resolved At</TableHead>
      <TableHead>Resolved Date</TableHead>
      <TableHead>Trans By</TableHead>
      <TableHead>Trans Date</TableHead>
      <TableHead>Complaint Contact No</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Resolved Remark</TableHead>
      <TableHead>Estimated Days</TableHead>
      <TableHead>Problem</TableHead>
      <TableHead>Root Cause</TableHead>
      <TableHead>Action</TableHead>
      <TableHead>Software Type</TableHead>
      <TableHead>Project Title</TableHead>
      <TableHead>Project Version</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedData.length > 0 ? (
      paginatedData.map((row, index) => (
        <TableRow key={index}>
          <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
          <TableCell>{row.ComplaintID}</TableCell>
          <TableCell>{row.CustomerName || "-"}</TableCell>
          <TableCell>{row.CustomerAddress || "-"}</TableCell>
          <TableCell>{row.ContactPerson || "-"}</TableCell>
          <TableCell>{row.ContactNo || "-"}</TableCell>
          <TableCell>{row.EmailID || "-"}</TableCell>
          <TableCell>{row.HardwareType || "-"}</TableCell>
          <TableCell>{row.Make || "-"}</TableCell>
          <TableCell>{row.Model || "-"}</TableCell>
          <TableCell>{row.SerialNo || "-"}</TableCell>
          <TableCell>{row.UniqueSerialNo || "-"}</TableCell>
          <TableCell>{row.Qty}</TableCell>
          <TableCell>{row.DateOfWarrentyStart ? format(new Date(row.DateOfWarrentyStart), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.WarrentyDays}</TableCell>
          <TableCell>{row.DateOfWarrentyExp ? format(new Date(row.DateOfWarrentyExp), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.WarrentyStatus || "-"}</TableCell>
          <TableCell>{row.ComplaintBy || "-"}</TableCell>
          <TableCell>{row.ComplaintEmailId || "-"}</TableCell>
          <TableCell>{row.ComplaintName || "-"}</TableCell>
          <TableCell className='min-w-[300px]'>{row.ComplaintDescription || "-"}</TableCell>
          <TableCell>{row.Priority || "-"}</TableCell>
          <TableCell>{row.ComplaintDate ? format(new Date(row.ComplaintDate), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.Status || "-"}</TableCell>
          <TableCell>{row.TakenBy || "-"}</TableCell>
          <TableCell>{row.AcknowledgedBy || "-"}</TableCell>
          <TableCell>{row.AcknowledgedDate ? format(new Date(row.AcknowledgedDate), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.ResolvedAt || "-"}</TableCell>
          <TableCell>{row.ResolvedDate ? format(new Date(row.ResolvedDate), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.TransBy || "-"}</TableCell>
          <TableCell>{row.TransDate ? format(new Date(row.TransDate), "dd-MM-yyyy") : "-"}</TableCell>
          <TableCell>{row.ComplaintContactNo || "-"}</TableCell>
          <TableCell>{row.Type || "-"}</TableCell>
          <TableCell className='min-w-[300px]'>{row.ResolvedRemark || "-"}</TableCell>
          <TableCell>{row.EstimatedDays}</TableCell>
          <TableCell className='min-w-[300px]'>{row.Problem || "-"}</TableCell>
          <TableCell className='min-w-[300px]'>{row.RootCause || "-"}</TableCell>
          <TableCell className='min-w-[300px]'>{row.Action || "-"}</TableCell>
          <TableCell>{row.SoftwareType || "-"}</TableCell>
          <TableCell>{row.ProjectTitle || "-"}</TableCell>
          <TableCell>{row.ProjectVersion || "-"}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={42} className="text-center">No Data Found</TableCell>
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
    </div>

    </>
  );
};

export default CustomerComplaintReport;