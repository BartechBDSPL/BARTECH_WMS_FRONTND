"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";
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
import axios from 'axios';

interface RMPickingReportData {
  serial_no: string;
  trans_serialno: string;
  work_orderno: string;
  product_code: string;
  product_name: string;
  bin: string;
  pick_qty: number;
  pick_by: string;
}


const RMPickingReport = () => {
  const [transSerialNo, setTransSerialNo] = useState("");
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<RMPickingReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        'trans_serialno', 
        'work_orderno', 
        'product_code', 
        'product_name', 
        'bin',
        'pick_by'
      ];
      return searchableFields.some(key => {
        const value = (item as any)[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [reportData, searchTerm]);
  
  const formattedData = reportData.map((item) => ({
  "Serial No": item.serial_no,
  "Transaction Serial No": item.trans_serialno,
  "Job Card No": item.work_orderno,
  "Product Code": item.product_code,
  "Product Name": item.product_name,
  "Bin": item.bin,
  "Pick Quantity": item.pick_qty,
  "Picked By": item.pick_by,
}));

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
      TransSerialNo: transSerialNo.trim(),
      WorkOrderNo: workOrderNo.trim(),
      ProductCode: productCode.trim(),
      ProductName: productName.trim(),
      FromDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/get-rm-picking-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RMPickingReportData[] = await response.json();
      
      if (data.length === 0) {
        setReportData([]);
        setShowTable(true);
        toast({
          title: "No Data",
          description: "No records found",
          variant: "destructive",
        });
        return;
      }

      setReportData(data);
      setShowTable(true);
      toast({
        title: "Success",
        description: `Successfully Fetch records`,
        variant: "default",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTransSerialNo("");
    setWorkOrderNo("");
    setProductCode("");
    setProductName("");
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const exportToPdf = (data: RMPickingReportData[], fileName: string): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      const columns = [
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'Trans Serial No', dataKey: 'trans_serialno' },
        { header: 'Job Card No', dataKey: 'work_orderno' },
        { header: 'Product Code', dataKey: 'product_code' },
        { header: 'Product Name', dataKey: 'product_name' },
        { header: 'Bin', dataKey: 'bin' },
        { header: 'Pick Qty', dataKey: 'pick_qty' },
        { header: 'Pick By', dataKey: 'pick_by' }
      ];

      const formattedData = data.map(row => ({
        serial_no: row.serial_no || '',
        trans_serialno: row.trans_serialno || '',
        work_orderno: row.work_orderno || '',
        product_code: row.product_code || '',
        product_name: row.product_name || '',
        bin: row.bin || '',
        pick_qty: row.pick_qty?.toString() || '0',
        pick_by: row.pick_by || ''
      }));

      doc.setFontSize(18);
      doc.text(`RM Picking Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

      (doc as any).autoTable({
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { 
          fontSize: 8, 
          cellPadding: 1.5,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 35 }, 
          1: { cellWidth: 25 }, 
          2: { cellWidth: 25 }, 
          3: { cellWidth: 30 }, 
          4: { cellWidth: 80 }, 
          5: { cellWidth: 20 }, 
          6: { cellWidth: 20 }, 
          7: { cellWidth: 25 }
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
    
    const fileName = `RM_Picking_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
    exportToPdf(reportData, fileName);
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

  return (
    <div className="space-y-4">
      <Card className='mt-5'>
        <CardHeader>
          <CardTitle>Report: RM Picking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor='transSerialNo'>Transaction Serial No</Label>
              <Input 
                id="transSerialNo"
                value={transSerialNo} 
                onChange={(e) => setTransSerialNo(e.target.value)} 
                placeholder='Enter Transaction Serial No'
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor='workOrderNo'>Job Card No</Label>
              <Input 
                id="workOrderNo"
                value={workOrderNo} 
                onChange={(e) => setWorkOrderNo(e.target.value)} 
                placeholder='Enter Job Card No'
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor='productCode'>Product Code</Label>
              <Input 
                id="productCode"
                value={productCode} 
                onChange={(e) => setProductCode(e.target.value)} 
                placeholder='Enter Product Code'
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor='productName'>Product Name</Label>
              <Input 
                id="productName"
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                placeholder='Enter Product Name'
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
              <Button onClick={handleSubmitSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>
           <div className="flex flex-col spac-y-2 sm:flex-row sm:space-x-2">
              <ExportToExcel 
                data={formattedData} 
                fileName={`RM_Picking_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} 
              />
              <Button variant="outline" onClick={handleExportToPDF} disabled={reportData.length === 0}>
                Export To PDF <FaFilePdf size={17} className='ml-2 text-red-500' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showTable && (
        reportData.length > 0 ? (
          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">
              <CardTitle>RM Picking Report</CardTitle>
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
                      <SelectItem value="50">50</SelectItem>
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
                        <TableHead>No</TableHead>
                        <TableHead>Serial No</TableHead>
                        <TableHead>Transaction Serial No</TableHead>
                        <TableHead>Job Card No</TableHead>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Bin</TableHead>
                        <TableHead>Pick Qty</TableHead>
                        <TableHead>Pick By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                            <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{row.serial_no}</TableCell>
                            <TableCell>{row.trans_serialno}</TableCell>
                            <TableCell>{row.work_orderno}</TableCell>
                            <TableCell>{row.product_code}</TableCell>
                            <TableCell className="min-w-[300px]">{row.product_name}</TableCell>
                            <TableCell>{row.bin}</TableCell>
                            <TableCell className="text-right">{row.pick_qty}</TableCell>
                            <TableCell>{row.pick_by}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center">No Data Found</TableCell>
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
                {filteredData.length > 0 && totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                className="cursor-pointer"
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
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

export default RMPickingReport;