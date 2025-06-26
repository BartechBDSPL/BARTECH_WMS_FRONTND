"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { BACKEND_URL } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { getUserCompanyCode, getUserID, getUserPlant } from '@/utills/getFromSession';
import { logError } from '@/utills/loggingException';
import Cookies from 'js-cookie';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { cn } from '@/lib/utils';

interface FormData {
  productCode: string;
  transSerialNo: string;
  invoiceNo: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  reason: string;
  noOfLabels: string;
  assignPrinter: string;
  customPrinter: string;
}

interface TableData {
  CountRow: string;
  id: number;
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
}

interface PrinterData {
  Printer_Name: string;
  Printer_ip: string;
  Printer_port: string;
  Printer_dpi: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const ReprintRMLabelPrinting: React.FC = () => {
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    productCode: '',
    transSerialNo: '',
    invoiceNo: '',
    fromDate: new Date(),
    toDate: new Date(),
    reason: '',
    noOfLabels: '1',
    assignPrinter: '',
    customPrinter: ''
  });
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [printers, setPrinters] = useState<DropdownOption[]>([]);
  const [selectedPrinterIp, setSelectedPrinterIp] = useState<string>("");
  const { toast } = useToast();
  const token = Cookies.get('token');
  const [showCustomPrinter, setShowCustomPrinter] = useState(false);

  const reasonRef = useRef<HTMLInputElement>(null);
  const noOfLabelsRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);

  const filteredData = useMemo(() => {
    return tableData.filter(item => {
      const searchableFields = [
        'trans_serialno',
        'voucher_no',
        'party_name',
        'product_code',
        'product_name',
        'invoice_no',
        'pur_order_no'
      ];
      return searchableFields.some(field => 
        item[field as keyof TableData]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [tableData, searchTerm]);

  const handleSearchTerm = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'noOfLabels') {
      if (Number(value) <= 0) {
        toast({
          title: "Error",
          description: "Number of labels must be greater than 0",
          variant: "destructive",
        });
        return;
      }
    }

    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (name: 'fromDate' | 'toDate', date: Date | undefined) => {
    setFormData(prevData => ({ ...prevData, [name]: date }));
  };

  const handleGetDetails = async () => {
    if(!formData.fromDate){
      toast({
        title: "Error",
        description: "Please select the from Date",
        variant: "destructive",
      });
      fromDateRef.current?.focus();
      return;
    }else if(!formData.toDate){
      toast({
        title: "Error",
        description: "Please select the to Date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setSearchClicked(false);
      setShowTable(false);
      setShowAdditionalFields(false);

      const response = await fetch(`${BACKEND_URL}/api/reprint/get-reprint-rm-label-print-data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_code: formData.productCode.trim(),
          trans_serialno: formData.transSerialNo.trim(),
          invoice_no: formData.invoiceNo.trim(),
          FrmDate: formData.fromDate ? format(formData.fromDate, "yyyy-MM-dd") : "",
          ToDate: formData.toDate ? format(formData.toDate, "yyyy-MM-dd") : ""
        })
      });

      const data = await response.json();

      if (data.length === 0) {
        setSearchClicked(true);
        setShowTable(false);
        setTableData([]);
        setSelectedRows([]);
        toast({
          title: "No Data Found",
          description: "No records found for the given criteria.",
          variant: "destructive",
        });
      } else {
        setTableData(data);
        setShowTable(true);
        setSelectedRows([]);
        setSearchClicked(false);
        toast({
          title: "Success",
          description: `${data.length} records found`,
        });
      }
    } catch (error) {
      setSearchClicked(true);
      toast({
        title: "Error",
        description: "An error occurred while fetching data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (newValue: string) => {
    setSelectedPrinterIp(newValue);
  };

  // code for row selection 
  const handleRowSelection = (countRow: string) => {
    const rowId = parseInt(countRow);
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  // code for selecting all row 
  const handleSelectAll = () => {
    setSelectedRows(prev => 
      prev.length === filteredData.length 
        ? [] 
        : filteredData.map(item => parseInt(item.CountRow))
    );
  };

  const handlePrintLabels = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one row to print",
        variant: "destructive",
      });
      return;
    }

    if(selectedPrinterIp === ''){
      toast({
        title: "Error",
        description: "Please select a printer",
        variant: "destructive",
      });
      return;
    }

    if(formData.noOfLabels === ''){
      toast({
        title: "Error",
        description: "Please enter number of labels",
        variant: "destructive",
      });
      noOfLabelsRef.current?.focus();
      return;
    }

    if(formData.noOfLabels === '0'|| formData.noOfLabels < '0'){
      toast({
        title: "Error",
        description: "Number of labels should be greater than 0",
        variant: "destructive",
      });
      noOfLabelsRef.current?.focus();
      return;
    }

    if (!formData.reason) {
      toast({
        title: "Error",
        description: "Please enter the reason for reprinting",
        variant: "destructive",
      });
      reasonRef.current?.focus();
      return;
    } else if (!formData.noOfLabels) {
      toast({
        title: "Error",
        description: "Please enter the number of labels",
        variant: "destructive",
      });
      noOfLabelsRef.current?.focus();
      return;
    }

    setIsPrinting(true);

    const selectedData = tableData.filter(item => selectedRows.includes(parseInt(item.CountRow)));
    
    try {
      for (const item of selectedData) {
        const insertData = {
          trans_serialno: item.trans_serialno,
          voucher_no: item.voucher_no,
          party_name: item.party_name,
          product_code: item.product_code,
          product_name: item.product_name,
          qty: item.qty,
          invoice_no: item.invoice_no,
          pur_order_no: item.pur_order_no,
          narration: formData.reason,
          print_qty: item.print_qty,
          serial_no: item.serial_no,
          print_by: getUserID(),
          print_date: new Date().toISOString(),
          RePrintReason: formData.reason,
          RePrintQty: formData.noOfLabels,
          RePrintBy: getUserID(),
          PrinterIpPort: selectedPrinterIp
        };

        const response = await fetch(`${BACKEND_URL}/api/reprint/insert-reprint-rm-label-print-data`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(insertData)
        });

        const result = await response.json();
        
        if (result.Status !== "T") {
            toast({
            title: "Error",
            description: result.Message || "Failed to insert reprint data",
            variant: "destructive",
            });
            return;
        }
      }

      toast({
        title: "Success",
        description: "Labels printed successfully!",
      });

      // Reset form after successful print
      setShowAdditionalFields(false);
      setShowTable(false);
      setSelectedRows([]);
      setFormData(prev => ({ ...prev, reason: '', noOfLabels: '1' }));

    } catch (error) {
      console.error("Error printing labels:", error);
      toast({
        title: "Error", 
        description: "Failed to print labels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      productCode: '',
      transSerialNo: '',
      invoiceNo: '',
      fromDate: new Date(),
      toDate: new Date(),
      reason: '',
      noOfLabels: '',
      assignPrinter: '',
      customPrinter: ''
    });
    setShowCustomPrinter(false);
    setTableData([]);
    setShowTable(false);
    setShowAdditionalFields(false);
    setSelectedRows([]);
    setSearchTerm('');
    setSearchClicked(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/master/get-printer-name`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.Status === "T" && result.Data) {
          const printerOptions = result.Data.map((printer: PrinterData) => ({
            value: `${printer.Printer_ip}:${printer.Printer_port}-${printer.Printer_dpi}`,
            label: printer.Printer_Name
          }));
          setPrinters([...printerOptions]);
        }
      } catch (error) {
        console.error('Error fetching printers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch printers",
          variant: "destructive",
        });
      }
    };
    
    fetchPrinters();
  }, [token, toast]);

  const handlePrinterChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomPrinter(true);
      setFormData(prev => ({ ...prev, assignPrinter: '', customPrinter: '' }));
      setSelectedPrinterIp('');
    } else {
      setShowCustomPrinter(false);
      setFormData(prev => ({ ...prev, assignPrinter: value, customPrinter: '' }));
      setSelectedPrinterIp(value);
    }
  };

  const handleCustomPrinterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customPrinterValue = e.target.value;
    setFormData(prev => ({ ...prev, customPrinter: customPrinterValue, assignPrinter: customPrinterValue }));
    setSelectedPrinterIp(customPrinterValue);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reprint RM Label Printing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="productCode">Product Code</Label>
              <Input
                id="productCode"
                name="productCode"
                value={formData.productCode}
                onChange={handleInputChange}
                placeholder="Enter product code"
              />
            </div>
            <div>
              <Label htmlFor="transSerialNo">Transaction Serial No</Label>
              <Input
                id="transSerialNo"
                name="transSerialNo"
                value={formData.transSerialNo}
                onChange={handleInputChange}
                placeholder="Enter transaction serial no"
              />
            </div>
            <div>
              <Label htmlFor="invoiceNo">Invoice No</Label>
              <Input
                id="invoiceNo"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
                placeholder="Enter invoice no"
              />
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fromDate ? format(formData.fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.fromDate}
                    onSelect={(date) => handleDateChange('fromDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.toDate ? format(formData.toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.toDate}
                    onSelect={(date) => handleDateChange('toDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleGetDetails} disabled={isLoading}>
              {isLoading ? "Loading..." : "Get Details"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Printer Configuration section, always shown when showTable is true */}
      {showTable && (
        <Card>
          <CardHeader>
            <CardTitle>Printer Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="assignPrinter">Assign Printer *</Label>
                <Select value={selectedPrinterIp} onValueChange={handlePrinterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a printer" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.map((printer) => (
                      <SelectItem key={printer.value} value={printer.value}>
                        {printer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showCustomPrinter && (
                <div>
                  <Label htmlFor="customPrinter">Custom Printer IP</Label>
                  <Input
                    id="customPrinter"
                    name="customPrinter"
                    value={formData.customPrinter}
                    onChange={handleCustomPrinterChange}
                    placeholder="Enter custom printer IP"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="reason">Reason for Reprint *</Label>
                <Input
                  id="reason"
                  name="reason"
                  ref={reasonRef}
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Enter reason for reprinting"
                />
              </div>
              <div>
                <Label htmlFor="noOfLabels">No of Labels *</Label>
                <Input
                  id="noOfLabels"
                  name="noOfLabels"
                  type="number"
                  min="1"
                  ref={noOfLabelsRef}
                  value={formData.noOfLabels}
                  onChange={handleInputChange}
                  placeholder="Enter number of labels"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={handlePrintLabels} 
                disabled={isPrinting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPrinting ? "Printing..." : "Print Labels"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table and Pagination */}
      {showTable && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Reprint Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TableSearch
                onSearch={handleSearchTerm}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalItems}
                startIndex={startIndex + 1}
                endIndex={endIndex}
              />
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr No</TableHead>
                      <TableHead>Trans Serial No</TableHead>
                      <TableHead>Voucher No</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>PO No</TableHead>
                      <TableHead>Print By</TableHead>
                      <TableHead>Print Date</TableHead>
                      <TableHead>Print Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(parseInt(item.CountRow))}
                            onCheckedChange={() => handleRowSelection(item.CountRow)}
                          />
                        </TableCell>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{item.trans_serialno}</TableCell>
                        <TableCell>{item.voucher_no}</TableCell>
                        <TableCell>{item.party_name}</TableCell>
                        <TableCell>{item.product_code}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={item.product_name}>
                          {item.product_name}
                        </TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.invoice_no}</TableCell>
                        <TableCell>{item.pur_order_no}</TableCell>
                        <TableCell>{item.print_by}</TableCell>
                        <TableCell>{format(new Date(item.print_date), "dd/MM/yyyy HH:mm")}</TableCell>
                        <TableCell>{item.print_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {searchClicked && !showTable && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">No Data Found</p>
            <p className="text-sm text-gray-500">
              No records found for the given search criteria. Please try different search parameters.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading data...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReprintRMLabelPrinting;