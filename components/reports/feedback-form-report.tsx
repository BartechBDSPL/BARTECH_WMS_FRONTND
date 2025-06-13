"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Calendar as CalendarIcon, ChevronDown, Eye, Printer } from "lucide-react";
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
  FeedbackID: number;
  CompanyName: string;
  CompanyAddress: string;
  CustomerName: string;
  CustomerEmailAddress: string;
  CustomerPhoneNumber: string;
  UnderstandingRating: number;
  QualityRating: number;
  CommunicationRating: number;
  ServiceSupportRating: number;
  DeliveryOnTimeRating: number;
  OverallRating: number;
  AdditionalComments: string;
  SubmissionDate: string;
  IPAddress: string;
  UserAgent: string;
}

const CustomerFeedbackReport = () => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<CustomerFeedbackReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        "CompanyName",
        "CompanyAddress",
        "CustomerName",
        "CustomerEmailAddress",
        "CustomerPhoneNumber",
        "AdditionalComments",
        "IPAddress",
        "UserAgent"
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
      CustomerName: customerName,
      CompanyName: companyName,
      FromDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/get-Customer-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      
      const changedata = await response.json();
      const data: CustomerFeedbackReportData[] = changedata.Data;
      
      // Always set showTable to true after a search attempt
      setShowTable(true);
      
      if (data.length === 0) {
        setReportData([]);
        return;
      }
      
      setReportData(data);
    } catch (error) {
      // Set showTable to true even when there's an error
      setShowTable(true);
      setReportData([]); // Set empty data to show "No Data Found"
      
      toast({
        title: "Error",
        description: "Data Not Found",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
    setCustomerName('');
    setCompanyName('');
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
        { header: 'Feedback ID', dataKey: 'FeedbackID' },
        { header: 'Company Name', dataKey: 'CompanyName' },
        { header: 'Company Address', dataKey: 'CompanyAddress' },
        { header: 'Customer Name', dataKey: 'CustomerName' },
        { header: 'Email Address', dataKey: 'CustomerEmailAddress' },
        { header: 'Phone Number', dataKey: 'CustomerPhoneNumber' },
        { header: 'Understanding Rating', dataKey: 'UnderstandingRating' },
        { header: 'Quality Rating', dataKey: 'QualityRating' },
        { header: 'Communication Rating', dataKey: 'CommunicationRating' },
        { header: 'Service Support Rating', dataKey: 'ServiceSupportRating' },
        { header: 'Delivery On Time Rating', dataKey: 'DeliveryOnTimeRating' },
        { header: 'Overall Rating', dataKey: 'OverallRating' },
        { header: 'Additional Comments', dataKey: 'AdditionalComments' },
        { header: 'Submission Date', dataKey: 'SubmissionDate' },
        { header: 'IP Address', dataKey: 'IPAddress' },
        { header: 'User Agent', dataKey: 'UserAgent' },
      ];

      const formattedData = data.map(row => ({
        ...row,
        SubmissionDate: row.SubmissionDate ? format(new Date(row.SubmissionDate), "yyyy-MM-dd HH:mm") : "-",
        AdditionalComments: row.AdditionalComments || "-",
        UserAgent: row.UserAgent ? row.UserAgent.substring(0, 50) + "..." : "-", // Truncate long user agent strings
      }));

      doc.setFontSize(18);
      doc.text(`Customer Feedback Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

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
          4: { cellWidth: 30 }, 
          5: { cellWidth: 20 }, 
          6: { cellWidth: 15 }, 
          7: { cellWidth: 15 }, 
          8: { cellWidth: 15 }, 
          9: { cellWidth: 15 }, 
          10: { cellWidth: 15 },
          11: { cellWidth: 15 }, 
          12: { cellWidth: 30 }, 
          13: { cellWidth: 25 }, 
          14: { cellWidth: 20 }, 
          15: { cellWidth: 40 }, 
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
    
    const fileName = `Customer_Feedback_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
    exportToPdf(reportData, fileName);
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
    <div className="space-y-4">
      <Card className='mt-5'>
        <CardHeader>
          <CardTitle>Report: Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor='customerName'>Customer Name</Label>
              <Input 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder='Enter Customer Name...'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor='companyName'>Company Name</Label>
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                placeholder='Enter Company Name...'
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
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2">
              <ExportToExcel 
                data={reportData} 
                fileName={`Customer_Feedback_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} 
              />
              <Button variant="outline" onClick={handleExportToPDF} disabled={reportData.length === 0}>
                Export To PDF  <FaFilePdf size={17} className='ml-2 text-red-500' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showTable && (
        reportData.length > 0 ? (
          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">Customer Feedback Report</CardHeader>
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
                    <TableHead>Company Name</TableHead>
                    <TableHead>Company Address</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Understanding Rating</TableHead>
                    <TableHead>Quality Rating</TableHead>
                    <TableHead>Communication Rating</TableHead>
                    <TableHead>Service Support Rating</TableHead>
                    <TableHead>Delivery On Time Rating</TableHead>
                    <TableHead>Overall Rating</TableHead>
                    <TableHead>Additional Comments</TableHead>
                    <TableHead>Submission Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>

                        <TableCell className='min-w-[200px]'>{row.CompanyName}</TableCell>
                        <TableCell className='min-w-[200px]'>{row.CompanyAddress}</TableCell>
                        <TableCell className='min-w-[150px]'>{row.CustomerName}</TableCell>
                        <TableCell className='min-w-[200px]'>{row.CustomerEmailAddress}</TableCell>
                        <TableCell>{row.CustomerPhoneNumber}</TableCell>
                        <TableCell className={getRatingColor(row.UnderstandingRating)}>
                          {row.UnderstandingRating}
                        </TableCell>
                        <TableCell className={getRatingColor(row.QualityRating)}>
                          {row.QualityRating}
                        </TableCell>
                        <TableCell className={getRatingColor(row.CommunicationRating)}>
                          {row.CommunicationRating}
                        </TableCell>
                        <TableCell className={getRatingColor(row.ServiceSupportRating)}>
                          {row.ServiceSupportRating}
                        </TableCell>
                        <TableCell className={getRatingColor(row.DeliveryOnTimeRating)}>
                          {row.DeliveryOnTimeRating}
                        </TableCell>
                        <TableCell className={getRatingColor(row.OverallRating)}>
                          {row.OverallRating}
                        </TableCell>
                        <TableCell className='min-w-[600px]'>
                          {row.AdditionalComments || "-"}
                        </TableCell>
                        <TableCell>
                          {row.SubmissionDate ? format(new Date(row.SubmissionDate), "dd-MM-yyyy HH:mm") : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={17} className="text-center">No Data Found</TableCell>
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
  );
};

export default CustomerFeedbackReport;