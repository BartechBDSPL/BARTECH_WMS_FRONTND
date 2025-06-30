"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Calendar as CalendarIcon} from "lucide-react";
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

interface RMReprintLabelPrintingData {
  CountRow: number;
  id: string;
  trans_serialno: string;
  voucher_no: string;
  party_name: string;
  product_code: string;
  product_name: string;
  qty: number;
  invoice_no: string;
  pur_order_no: string;
  print_by: string;
  print_date: string;
  print_qty: number;
  serial_no: string;
  RePrintReason: string;
  RePrintQty: number;
  RePrintBy: string;
  RePrintDate: string;
}

const RMReprintLabelPrintingReport = () => {
  const [productCode, setProductCode] = useState("");
  const [transSerialNo, setTransSerialNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<RMReprintLabelPrintingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        'trans_serialno', 
        'voucher_no', 
        'party_name',
        'product_code', 
        'product_name', 
        'invoice_no',
        'pur_order_no',
        'print_by',
        'serial_no',
        'RePrintReason',
        'RePrintBy'
      ];
      return searchableFields.some(key => {
        const value = (item as any)[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [reportData, searchTerm]);
  
  const formattedData = reportData.map((item) => ({
    "Row No": item.CountRow,
    "ID": item.id,
    "GRN No": item.trans_serialno,
    "Serial No": item.serial_no,
    "Voucher No": item.voucher_no,
    "Party Name": item.party_name,
    "Product Code": item.product_code,
    "Product Name": item.product_name,
    "Quantity": item.qty,
    "Invoice No": item.invoice_no,
    "Purchase Order No": item.pur_order_no,
    "Print Quantity": item.print_qty,
    "Print By": item.print_by,
    "Print Date": item.print_date ? format(new Date(item.print_date), 'yyyy-MM-dd') : '',
    "Reprint Reason": item.RePrintReason,
    "Reprint Quantity": item.RePrintQty,
    "Reprint By": item.RePrintBy,
    "Reprint Date": item.RePrintDate ? format(new Date(item.RePrintDate), 'yyyy-MM-dd') : '',
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
      product_code: productCode.trim(),
      trans_serialno: transSerialNo.trim(),
      invoice_no: invoiceNo.trim(),
      FrmDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/get-rm-label-reprint-report`, {
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

      const data: RMReprintLabelPrintingData[] = await response.json();
      
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
        description: `Successfully fetched ${data.length} records`,
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
    setProductCode("");
    setTransSerialNo("");
    setInvoiceNo("");
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const exportToPdf = (data: RMReprintLabelPrintingData[], fileName: string): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      const columns = [
        { header: 'Row No', dataKey: 'CountRow' },
        { header: 'GRN No', dataKey: 'trans_serialno' },
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'Voucher No', dataKey: 'voucher_no' },
        { header: 'Party Name', dataKey: 'party_name' },
        { header: 'Product Code', dataKey: 'product_code' },
        { header: 'Product Name', dataKey: 'product_name' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Invoice No', dataKey: 'invoice_no' },
        { header: 'PO No', dataKey: 'pur_order_no' },
        { header: 'Print Qty', dataKey: 'print_qty' },
        { header: 'Print By', dataKey: 'print_by' },
        { header: 'Print Date', dataKey: 'print_date' },
        { header: 'Reprint Reason', dataKey: 'RePrintReason' },
        { header: 'Reprint Qty', dataKey: 'RePrintQty' },
        { header: 'Reprint By', dataKey: 'RePrintBy' },
        { header: 'Reprint Date', dataKey: 'RePrintDate' },
      ];

      const formattedData = data.map(row => ({
        CountRow: row.CountRow?.toString() || '',
        trans_serialno: row.trans_serialno || '',
        serial_no: row.serial_no || '',
        voucher_no: row.voucher_no || '',
        party_name: row.party_name || '',
        product_code: row.product_code || '',
        product_name: row.product_name || '',
        qty: row.qty?.toString() || '0',
        invoice_no: row.invoice_no || '',
        pur_order_no: row.pur_order_no || '',
        print_qty: row.print_qty?.toString() || '0',
        print_by: row.print_by || '',
        print_date: row.print_date ? format(new Date(row.print_date), 'yyyy-MM-dd') : '',
        RePrintReason: row.RePrintReason || '',
        RePrintQty: row.RePrintQty?.toString() || '0',
        RePrintBy: row.RePrintBy || '',
        RePrintDate: row.RePrintDate ? format(new Date(row.RePrintDate), 'yyyy-MM-dd') : '',
      }));

      doc.setFontSize(18);
      doc.text(`RM Reprint Label Printing Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

      (doc as any).autoTable({
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { 
          fontSize: 5, 
          cellPadding: 1,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 12 }, // Row No
          1: { cellWidth: 18 }, // GRN No
          2: { cellWidth: 15 }, // Serial No
          3: { cellWidth: 18 }, // Voucher No
          4: { cellWidth: 20 }, // Party Name
          5: { cellWidth: 15 }, // Product Code
          6: { cellWidth: 25 }, // Product Name
          7: { cellWidth: 12 }, // Qty
          8: { cellWidth: 18 }, // Invoice No
          9: { cellWidth: 15 }, // PO No
          10: { cellWidth: 12 }, // Print Qty
          11: { cellWidth: 15 }, // Print By
          12: { cellWidth: 18 }, // Print Date
          13: { cellWidth: 20 }, // Reprint Reason
          14: { cellWidth: 12 }, // Reprint Qty
          15: { cellWidth: 15 }, // Reprint By
          16: { cellWidth: 18 }, // Reprint Date
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
    
    const fileName = `RM_Reprint_Label_Printing_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
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
          <CardTitle>Report: RM Reprint Label Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <Label htmlFor='transSerialNo'>GRN No</Label>
              <Input 
                id="transSerialNo"
                value={transSerialNo} 
                onChange={(e) => setTransSerialNo(e.target.value)} 
                placeholder='Enter GRN No'
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor='invoiceNo'>Invoice No</Label>
              <Input 
                id="invoiceNo"
                value={invoiceNo} 
                onChange={(e) => setInvoiceNo(e.target.value)} 
                placeholder='Enter Invoice No'
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
                fileName={`RM_Label_Reprint_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} 
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
              <CardTitle>RM Reprint Label Printing Report</CardTitle>
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
                    <TableHead>GRN No</TableHead>
                    <TableHead>Serial No</TableHead>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Purchase Order No</TableHead>
                    <TableHead>Print Qty</TableHead>
                    <TableHead>Print By</TableHead>
                    <TableHead>Print Date</TableHead>
                    <TableHead>Reprint Reason</TableHead>
                    <TableHead>Reprint Qty</TableHead>
                    <TableHead>Reprint By</TableHead>
                    <TableHead>Reprint Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}</TableCell>
                        <TableCell className="text-center">{row.trans_serialno}</TableCell>
                        <TableCell className="text-center">{row.serial_no}</TableCell>
                        <TableCell className="text-center">{row.voucher_no}</TableCell>
                        <TableCell className="text-center">{row.party_name}</TableCell>
                        <TableCell className="text-center">{row.product_code}</TableCell>
                        <TableCell className="text-center">{row.product_name}</TableCell>
                        <TableCell className="text-center">{row.qty}</TableCell>
                        <TableCell className="text-center">{row.invoice_no}</TableCell>
                        <TableCell className="text-center">{row.pur_order_no}</TableCell>
                        <TableCell className="text-center">{row.print_qty}</TableCell>
                        <TableCell className="text-center">{row.print_by}</TableCell>
                        <TableCell className="text-center">
                          {row.print_date ? format(new Date(row.print_date), 'yyyy-MM-dd') : ''}
                        </TableCell>
                        <TableCell className="text-center min-w-[150px]">{row.RePrintReason}</TableCell>
                        <TableCell className="text-center">{row.RePrintQty}</TableCell>
                        <TableCell className="text-center">{row.RePrintBy}</TableCell>
                        <TableCell className="text-center">
                          {row.RePrintDate ? format(new Date(row.RePrintDate), 'yyyy-MM-dd') : ''}
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

export default RMReprintLabelPrintingReport;