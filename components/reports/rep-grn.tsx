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

interface GRNReportData {
  file_name: string;
  trans_serialno: string;
  trans_date: string;
  voucher_no: string;
  voucher_date: string;
  party_name: string;
  product_code: string;
  product_name: string;
  qty: number;
  pending: number;
  rate: number;
  taxable: number;
  narration: string;
  invoice_no: string;
  invoice_date: string;
  pur_order_no: string;
  pur_order_date: string;
  remark: string;
  inserted_by: string;
  inserted_date: string;
}

const GrnReport = () => {
  const [fileName, setFileName] = useState("");
  const [transSerialNo, setTransSerialNo] = useState("");
  const [partyName, setPartyName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<GRNReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        'file_name',
        'trans_serialno',
        'party_name',
        'product_code', 
        'product_name', 
        'invoice_no',
        'voucher_no',
        'inserted_by'
      ];
      return searchableFields.some(key => {
        const value = (item as any)[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [reportData, searchTerm]);
  
  const formattedData = reportData.map((item, index) => ({
    "Sr. No": index + 1,
    "File Name": item.file_name,
    "GRN No": item.trans_serialno,
    "Trans Date": item.trans_date ? format(new Date(item.trans_date), 'yyyy-MM-dd') : '',
    "Voucher No": item.voucher_no,
    "Voucher Date": item.voucher_date ? format(new Date(item.voucher_date), 'yyyy-MM-dd') : '',
    "Party Name": item.party_name,
    "Product Code": item.product_code,
    "Product Name": item.product_name,
    "Quantity": item.qty,
    "Pending": item.pending,
    "Rate": item.rate,
    "Taxable": item.taxable,
    "Narration": item.narration,
    "Invoice No": item.invoice_no,
    "Invoice Date": item.invoice_date ? format(new Date(item.invoice_date), 'yyyy-MM-dd') : '',
    "Purchase Order No": item.pur_order_no,
    "Purchase Order Date": item.pur_order_date ? format(new Date(item.pur_order_date), 'yyyy-MM-dd') : '',
    "Remark": item.remark,
    "Inserted By": item.inserted_by,
    "Inserted Date": item.inserted_date ? format(new Date(item.inserted_date), 'yyyy-MM-dd') : '',
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
      File_Name: fileName.trim(),
      Trans_SerialNo: transSerialNo.trim(),
      Party_Name: partyName.trim(),
      Product_Code: productCode.trim(),
      Product_Name: productName.trim(),
      Invoice_No: invoiceNo.trim(),
      FromDate: format(fromDate, "yyyy-MM-dd"),
      ToDate: format(toDate, "yyyy-MM-dd"),
    };

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/get-grn-report`, {
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

      const data: GRNReportData[] = await response.json();
      
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
    setFileName("");
    setTransSerialNo("");
    setPartyName("");
    setProductCode("");
    setProductName("");
    setInvoiceNo("");
    setReportData([]);
    setFromDate(new Date());
    setToDate(new Date());
    setShowTable(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const exportToPdf = (data: GRNReportData[], fileName: string): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a3');
      
      const columns = [
        { header: 'File Name', dataKey: 'file_name' },
        { header: 'GRN No', dataKey: 'trans_serialno' },
        { header: 'Trans Date', dataKey: 'trans_date' },
        { header: 'Party Name', dataKey: 'party_name' },
        { header: 'Product Code', dataKey: 'product_code' },
        { header: 'Product Name', dataKey: 'product_name' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Rate', dataKey: 'rate' },
        { header: 'Invoice No', dataKey: 'invoice_no' },
        { header: 'Inserted By', dataKey: 'inserted_by' },
         { header: 'Inserted Date', dataKey: 'inserted_date' },
      ];

      const formattedData = data.map(row => ({
        file_name: row.file_name || '',
        trans_serialno: row.trans_serialno || '',
        trans_date: row.trans_date ? format(new Date(row.trans_date), 'yyyy-MM-dd') : '',
        party_name: row.party_name || '',
        product_code: row.product_code || '',
        product_name: row.product_name || '',
        qty: row.qty?.toString() || '0',
        rate: row.rate?.toString() || '0',
        invoice_no: row.invoice_no || '',
        inserted_by: row.inserted_by || '',
        inserted_date:row.inserted_date ? format(new Date(row.inserted_date), 'yyyy-MM-dd') : '',
      }));

      doc.setFontSize(18);
      doc.text(`GRN Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

      (doc as any).autoTable({
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 25 }, 
          1: { cellWidth: 30 }, 
          2: { cellWidth: 25 }, 
          3: { cellWidth: 40 }, 
          4: { cellWidth: 30 }, 
          5: { cellWidth: 60 }, 
          6: { cellWidth: 20 }, 
          7: { cellWidth: 20 }, 
          8: { cellWidth: 25 }, 
          9: { cellWidth: 25 }
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
    
    const fileName = `GRN_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
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
          <CardTitle>Report: GRN (Goods Receipt Note)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor='fileName'>File Name</Label>
              <Input 
                id="fileName"
                value={fileName} 
                onChange={(e) => setFileName(e.target.value)} 
                placeholder='Enter File Name'
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
              <Label htmlFor='partyName'>Party Name</Label>
              <Input 
                id="partyName"
                value={partyName} 
                onChange={(e) => setPartyName(e.target.value)} 
                placeholder='Enter Party Name'
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
                fileName={`GRN_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} 
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
              <CardTitle>GRN Report</CardTitle>
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
                    <TableHead>File Name</TableHead>
                    <TableHead>GRN No</TableHead>
                    <TableHead>Trans Date</TableHead>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Inserted By</TableHead>
                     <TableHead>Inserted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}</TableCell>
                        <TableCell>{row.file_name}</TableCell>
                        <TableCell className="font-medium">{row.trans_serialno}</TableCell>
                        <TableCell>{row.trans_date ? format(new Date(row.trans_date), 'yyyy-MM-dd') : ''}</TableCell>
                        <TableCell>{row.voucher_no}</TableCell>
                        <TableCell className="min-w-[150px]">{row.party_name}</TableCell>
                        <TableCell>{row.product_code}</TableCell>
                        <TableCell className="min-w-[200px]">{row.product_name}</TableCell>
                        <TableCell className="text-center">{row.qty}</TableCell>
                        <TableCell className="text-center">{row.rate}</TableCell>
                        <TableCell>{row.invoice_no}</TableCell>
                        <TableCell  className="text-center">{row.remark}</TableCell>
                        <TableCell>{row.inserted_by}</TableCell>
                        <TableCell>{row.inserted_date ? format(new Date(row.inserted_date), 'yyyy-MM-dd') : ''}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">No Data Found</TableCell>
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

export default GrnReport;