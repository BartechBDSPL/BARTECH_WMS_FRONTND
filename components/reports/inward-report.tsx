"use client"
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CalendarIcon, ChevronDown, Eye, Printer } from "lucide-react";
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
import { Skeleton } from '../ui/skeleton';


interface JobCardReportData {
  serial_no : string;
  trans_serialno: string;
  product_code: string;
  party_name: string;
  voucher_no: string;
  invoice_no: string;
  pur_order_no: string | null;
  inward_status: string;
  inward_by: string;
  product_name: string;
  inward_date:string;

}





const InwordReport = () => {
  const [transSerialNo, setTransSerialNo] = useState('');
  const [partyName, setPartyName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [purOrderNo, setPurOrderNo] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<JobCardReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
      serial_no: 0,
      trans_serialno: 0,
      party_name: 0,
      print_qty: 0,
    });

  const token = Cookies.get('token');
 

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields = [
        'trans_serialno', 
        'product_code', 
        'party_name', 
        'voucher_no', 
        'invoice_no', 
        'inward_status',
        'inward_by',
        'inward_date'
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
    // const {CompanyName, Height, Width, JobCardNumber, LabelType, FrmDate, ToDate } = req.body;
    const requestBody = {
        Trans_SerialNo : transSerialNo.trim(),
        Party_Name : partyName.trim(),
        Product_Code: productCode.trim(),
        Pur_Order_No : purOrderNo.trim(),
        
        FromDate: format(fromDate, "yyyy-MM-dd"),
        ToDate: format(toDate, "yyyy-MM-dd"),


    };
  
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/reports/inward-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      

      const mainData = await response.json();
      const data: JobCardReportData[] = mainData.data;
      if (data.length === 0) {
        setReportData([]);
        setCardData({
          serial_no: 0,
          trans_serialno: 0,
          party_name: 0,
          print_qty: 0,
        })
        setShowTable(true);
        setTimeout(() => {
        setLoading(false);
        }, 2000);
        return;
      }
  
      setReportData(data);
      setCardData(mainData.counts);
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
    setTransSerialNo('');

    setPartyName('');
    setProductCode('');
    setProductName('');
    setPurOrderNo('');

    setCardData({
          serial_no: 0,
          trans_serialno: 0,
          party_name: 0,
          print_qty: 0,
        })

  };

  const exportToPdf = (data: JobCardReportData[], fileName: string): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      const columns = [
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'GRN No', dataKey: 'trans_serialno' },
        { header: 'Voucher No', dataKey: 'voucher_no' },
        { header: 'Party Name', dataKey: 'party_name' },
        { header: 'Product Code', dataKey: 'product_code' },
        { header: 'Product Name', dataKey: 'product_name' },
        { header: 'Inward Status', dataKey: 'inward_status' },
        { header: 'Inward By', dataKey: 'inward_by' },
         { header: 'Inward Date', dataKey: 'inward_date' }
        
        
      ];

      const formattedData = data.map(row => ({
        ...row,
        TransSerialNo: row.trans_serialno,
       
        
       
      }));

      doc.setFontSize(18);
      doc.text(`Inward Report - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

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
          0: { cellWidth: 25 }, 
          1: { cellWidth: 25 }, 
          2: { cellWidth: 35 }, 
          3: { cellWidth: 20 }, 
          4: { cellWidth: 30 }, 
          5: { cellWidth: 70 }, 
          6: { cellWidth: 15 }, 
          7: { cellWidth: 25 }, 
          8: { cellWidth: 15 },
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
    
    const fileName = `Inward_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`;
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
          <CardTitle>Report: Inward</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor='customerName'>GRN No</Label>
              <Input value={transSerialNo} onChange={(e) => setTransSerialNo(e.target.value)}  placeholder=' Enter GRN No'/>
            </div>
            <div className="space-y-2">
              <Label htmlFor='PartyName'>Party Name</Label>
              <Input value={partyName} onChange={(e) => setPartyName(e.target.value)}  placeholder=' Enter Party Name'/>
            </div>
            <div className="space-y-2">
              <Label htmlFor='ProductCode'>Product Code</Label>
              <Input value={productCode} onChange={(e) => setProductCode(e.target.value)}  placeholder=' Enter Product Code'/>
            </div>
            <div className="space-y-2">
              <Label htmlFor='purOrderNo'>Pur Order No</Label>
              <Input value={purOrderNo} onChange={(e) => setPurOrderNo(e.target.value)}  placeholder=' Enter Pur Order No'/>
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
            <div className="flex flex-col spac-y-2 sm:flex-row sm:space-x-2">
              <ExportToExcel data={reportData} fileName={`RM_Inward_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`} />
              <Button variant="outline" onClick={handleExportToPDF} disabled={reportData.length === 0}>
                Export To PDF  <FaFilePdf size={17} className='ml-2 text-red-500' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --------------------- THis is to card-------------- */}
            {showTable ? (
              <div className="flex flex-wrap gap-7">
                <Card className="w-full sm:w-[48%] lg:w-[23%] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground underline">
                      Serial No
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {cardData.serial_no ?? 0}
                    </p>
                  </CardContent>
                </Card>
      
                <Card className="w-full sm:w-[48%] lg:w-[23%] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground underline">
                      Unique Transaction Serial No
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {cardData.trans_serialno ?? 0}
                    </p>
                  </CardContent>
                </Card>
      
                <Card className="w-full sm:w-[48%] lg:w-[23%] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground underline">
                      Unique Party name{" "}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {cardData.party_name ?? 0}
                    </p>
                  </CardContent>
                </Card>
      
                <Card className="w-full sm:w-[48%] lg:w-[23%] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground underline">
                      Total Print Qty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {cardData.print_qty ?? 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

      {showTable && (
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
                ) :
        reportData.length > 0 ? (
          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">Inward Report</CardHeader>
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
                    <TableHead>No</TableHead>
                    <TableHead>Serial No</TableHead>
                    <TableHead>GRN No</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Voucher No</TableHead>
                    
                    <TableCell>Product Name</TableCell>
                    <TableHead>Inward Status</TableHead>
                    <TableHead>Inward By</TableHead>
                     <TableHead>Inward Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
                          <TableCell>{row.serial_no}</TableCell>
                          <TableCell>{row.trans_serialno}</TableCell>
                          <TableCell>{row.product_code}</TableCell>
                          <TableCell>{row.party_name}</TableCell>
                          <TableCell>{row.voucher_no}</TableCell>
                          
                          <TableCell>{row.product_name}</TableCell>
                          <TableCell>{row.inward_status}</TableCell>
                          <TableCell>{row.inward_by}</TableCell>
                           <TableCell>{row.inward_date ? format(new Date(row.inward_date), 'yyyy-MM-dd') : ''}</TableCell>
                         
                        </TableRow>
                        
                        
                      </React.Fragment>
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
      ))}
      
    </div>
  );
};

export default InwordReport;