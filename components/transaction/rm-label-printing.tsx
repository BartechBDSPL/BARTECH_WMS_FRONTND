"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import CustomDropdown from '@/components/CustomDropdown';
import getUserID, { BACKEND_URL } from '@/lib/constants';
import { X } from 'lucide-react';

interface GRNOption {
  value: string;
  label: string;
}

interface GRNResponse {
  data: {
    trans_serialno: string;
  }[];
}

interface GRNDetails {
  trans_serialno: string;
  voucher_no: string;
  voucher_date: string;
  party_name: string;
  product_code: string;
  product_name: string;
  qty: number;
  invoice_no: string;
  pur_order_no: string;
  narration: string;
  printed_label: number;
  remaining_label: number;
}

interface SerialNumber {
  serialNo: string;
  qty: number;
  editable?: boolean;
}

interface RecentLabelPrinting {
  trans_serialno: string;
  product_code: string;
  product_name: string;
  print_qty: number;
  serial_no: string;
}

interface ErrorResponse {
  Status: string;
  Message: string;
}

const RMLabelPrinting: React.FC = () => {
  const [grnNumbers, setGRNNumbers] = useState<GRNOption[]>([]);
  const [selectedGrn, setSelectedGrn] = useState<string>('');
  const [grnDetails, setGrnDetails] = useState<GRNDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [printQty, setPrintQty] = useState<{[key: string]: string}>({});
  const [activeProductCode, setActiveProductCode] = useState<string | null>(null);
  const [showSerialNumbers, setShowSerialNumbers] = useState<boolean>(false);
  const [generatedSerialNumbers, setGeneratedSerialNumbers] = useState<SerialNumber[]>([]);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  const [serialNumbersPage, setSerialNumbersPage] = useState<number>(1);
  const [serialNumbersPerPage, setSerialNumbersPerPage] = useState<number>(5);
  
  const [recentLabelPrinting, setRecentLabelPrinting] = useState<RecentLabelPrinting[]>([]);
  const [recentPrintingPage, setRecentPrintingPage] = useState<number>(1);
  const [recentPrintingsPerPage, setRecentPrintingsPerPage] = useState<number>(10);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(false);
  
  const router = useRouter();
  const token = Cookies.get('token');
  const grnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGRNNumbers();
    fetchRecentLabelPrinting();
  }, [token]);

  useEffect(() => {
    if (grnInputRef.current) {
      grnInputRef.current.focus();
    }
  }, []);

  const fetchGRNNumbers = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to perform this action."
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-unique-grn-number`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GRN numbers');
      }

      const data: GRNResponse = await response.json();
      
      const options = data.data.map(item => ({
        value: item.trans_serialno,
        label: item.trans_serialno
      }));
      
      setGRNNumbers(options);
    } catch (error) {
      console.error('Error fetching GRN numbers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch GRN numbers."
      });
    }
  };
  
  const fetchRecentLabelPrinting = async () => {
    if (!token) return;
    
    setIsLoadingRecent(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-recent-rm-label-printing`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent label printing data');
      }
      
      const data: RecentLabelPrinting[] = await response.json();
      setRecentLabelPrinting(data);
    } catch (error) {
      console.error('Error fetching recent label printing data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recent label printing data."
      });
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const handleGRNChange = (value: string) => {
    setSelectedGrn(value);
  };

  const handleGetDetails = async () => {
    if (!selectedGrn) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a GRN number."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-details-for-grn-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trans_serialno: selectedGrn
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GRN details');
      }

      const data = await response.json();
      
      if (data[0]?.Status === 'F') {
        toast({
          variant: "destructive",
          title: "Error",
          description: data[0]?.Message || "Invalid GRN number"
        });
        setGrnDetails(null);
      } else {
        setGrnDetails(data);
        
        const initialPrintQty: {[key: string]: string} = {};
        data.forEach((item: GRNDetails, index: number) => {
          const uniqueKey = `${item.product_code}_${index}_${item.qty}`;
          initialPrintQty[uniqueKey] = '';
        });
        setPrintQty(initialPrintQty);
      }
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch GRN details."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintQtyChange = (uniqueKey: string, value: string) => {
    setPrintQty(prev => ({
      ...prev,
      [uniqueKey]: value
    }));
  };

  const handleReset = () => {
    setSelectedGrn('');
    setGrnDetails(null);
    setPrintQty({});
    setActiveProductCode(null);
    setShowSerialNumbers(false);
    setGeneratedSerialNumbers([]);
  };

  const handlePrint = async () => {
    const productDetails = activeProductCode ? grnDetails?.find(item => item.product_code === activeProductCode) : null;
    const totalSerialQty = generatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
    
    if (productDetails && totalSerialQty !== productDetails.qty) {
      toast({
        variant: "destructive",
        title: "Quantity Mismatch",
        description: `Total quantity of all serial numbers (${totalSerialQty}) must exactly match the product quantity (${productDetails.qty}).`
      });
      return;
    }
    
    if (!productDetails || !token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required data for printing."
      });
      return;
    }

    setIsPrinting(true);
    
    try {
      const printQtyString = generatedSerialNumbers.map(sn => sn.qty.toString()).join('$');
      const serialNoString = generatedSerialNumbers.map(sn => sn.serialNo).join('$');
      
      const requestBody = {
        trans_serialno: productDetails.trans_serialno || "",
        voucher_no: productDetails.voucher_no || "",
        party_name: productDetails.party_name || "",
        product_code: productDetails.product_code || "",
        product_name: productDetails.product_name || "",
        qty: productDetails.qty || 0,
        invoice_no: productDetails.invoice_no || "",
        pur_order_no: productDetails.pur_order_no || "",
        narration: productDetails.narration || "",
        print_qty: printQtyString,
        serial_no: serialNoString,
        print_by: getUserID() 
      };

      const response = await fetch(`${BACKEND_URL}/api/transaction/insert-rm-label-printing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to insert label printing data');
      }

      const result = await response.json();
      
      if (result.Status === 'F') {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.Message || "Failed to print labels."
        });
        return;
      }
      
      if (result.Status === 'T') {
        toast({
          title: "Success",
          description: result.Message || "Labels printed and data saved successfully."
        });
        
        setShowSerialNumbers(false);
        setActiveProductCode(null);
        setGeneratedSerialNumbers([]);
        setSelectedGrn('');
        setGrnDetails(null);
        setPrintQty({});
        setSerialNumbersPage(1);
        setRecentPrintingPage(1);
        
        await fetchRecentLabelPrinting();
        
      } else {
        toast({
          variant: "destructive",
          title: "Unexpected Response",
          description: "Received unexpected response from server."
        });
      }
      
    } catch (error) {
      console.error('Error printing labels:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print labels and save data."
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleGenerateSerialNumbers = async (productCode: string, productName: string, rowIndex: number, qty: number) => {
    const uniqueKey = `${productCode}_${rowIndex}_${qty}`;
    const printQtyValue = printQty[uniqueKey];
    
    if (!printQtyValue || parseInt(printQtyValue) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid print quantity."
      });
      return;
    }
    
    const productDetails = grnDetails?.find((item, index) => index === rowIndex && item.product_code === productCode);
    if (!productDetails) return;
    
    const totalQty = productDetails.qty;
    const requestedLabels = parseInt(printQtyValue);
    const remainingLabels = productDetails.remaining_label;
    
    setIsLoading(true);
    setActiveProductCode(productCode);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-label-serial-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trans_serialno: selectedGrn,
          product_name: productName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get serial number');
      }
      
      const data = await response.json();
      let startSerialNo = data.SrNo + 1;
      
      const qtyPerLabel = Math.floor(totalQty / requestedLabels);
      const remainder = totalQty % requestedLabels;
      
      const serialNumbers: SerialNumber[] = [];
      let totalAssigned = 0;
      
      for (let i = 0; i < requestedLabels; i++) {
        const serialNo = `${productCode}|${selectedGrn}|${startSerialNo + i}`;
        let labelQty = qtyPerLabel;
        
        if (i < remainder) {
          labelQty += 1;
        }
        
        totalAssigned += labelQty;
        serialNumbers.push({ serialNo, qty: labelQty, editable: true });
      }
      
      setGeneratedSerialNumbers(serialNumbers);
      setSerialNumbersPage(1);
      setShowSerialNumbers(true);
      
    } catch (error) {
      console.error('Error generating serial numbers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate serial numbers."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSerialQtyChange = (index: number, newQty: number) => {
    const updatedSerialNumbers = [...generatedSerialNumbers];
    
    updatedSerialNumbers[index] = {
      ...updatedSerialNumbers[index],
      qty: newQty
    };
    
    const productDetails = grnDetails?.find(item => item.product_code === activeProductCode);
    if (!productDetails) return;
    
    const totalQty = productDetails.qty;
    const currentTotal = updatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
    
    if (currentTotal > totalQty) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Total quantity cannot exceed ${totalQty}.`
      });
      return;
    }
    
    setGeneratedSerialNumbers(updatedSerialNumbers);
  };

  const totalSerialQty = generatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
  const productDetails = activeProductCode ? grnDetails?.find(item => item.product_code === activeProductCode) : null;
  const isValidQtySum = productDetails && totalSerialQty <= productDetails.qty;
  
  const totalSerialNumbersPages = Math.ceil(generatedSerialNumbers.length / serialNumbersPerPage);
  const paginatedSerialNumbers = generatedSerialNumbers.slice(
    (serialNumbersPage - 1) * serialNumbersPerPage,
    serialNumbersPage * serialNumbersPerPage
  );
  const totalRecentPrintingPages = Math.ceil(recentLabelPrinting.length / recentPrintingsPerPage);
  const paginatedRecentPrinting = recentLabelPrinting.slice(
    (recentPrintingPage - 1) * recentPrintingsPerPage,
    recentPrintingPage * recentPrintingsPerPage
  );

  const handleSerialNumbersPageChange = (page: number) => {
    setSerialNumbersPage(page);
  };
  
  const handleRecentPrintingsPageChange = (page: number) => {
    setRecentPrintingPage(page);
  };
  
  const handleSerialNumbersPerPageChange = (value: string) => {
    setSerialNumbersPerPage(Number(value));
    setSerialNumbersPage(1);
  };
  
  const handleRecentPrintingsPerPageChange = (value: string) => {
    setRecentPrintingsPerPage(Number(value));
    setRecentPrintingPage(1);
  };

  return (
    <div className="container px-4 py-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Raw Material Label Printing</h1>
      
      {/* GRN Selection and Details Fetching */}
      <Card>
        <CardHeader>
          <CardTitle>GRN Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="grn-number">GRN Number</Label>
              <CustomDropdown
                options={grnNumbers}
                value={selectedGrn}
                onValueChange={handleGRNChange}
                placeholder="Select GRN Number"
                searchPlaceholder="Search GRN Number..."
                emptyText="No GRN numbers found"
              />
            </div>
            <div>
              <Button 
                onClick={handleGetDetails} 
                disabled={isLoading || !selectedGrn}
                className="w-full md:w-auto"
              >
                {isLoading ? "Loading..." : "Get Details"}
              </Button>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full md:w-auto"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GRN Details */}
      {grnDetails && grnDetails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>GRN Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Common Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>GRN Number</Label>
                  <Input value={grnDetails[0].trans_serialno} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Voucher Number</Label>
                  <Input value={grnDetails[0].voucher_no} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Voucher Date</Label>
                  <Input value={grnDetails[0].voucher_date} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Party Name</Label>
                  <Input value={grnDetails[0].party_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input value={grnDetails[0].invoice_no} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Order Number</Label>
                  <Input value={grnDetails[0].pur_order_no} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Narration</Label>
                <Input value={grnDetails[0].narration} disabled className="w-full" />
              </div>

              {/* Line Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Line Items</h3>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Product Code</TableHead>
                        <TableHead className="whitespace-nowrap">Product Name</TableHead>
                        <TableHead className="whitespace-nowrap">Quantity</TableHead>
                        <TableHead className="whitespace-nowrap">Print Qty</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grnDetails.map((item, index) => {
                        const uniqueKey = `${item.product_code}_${index}_${item.qty}`;
                        return (
                          <TableRow key={uniqueKey}>
                            <TableCell className="font-medium">{item.product_code}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.product_name}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>
                              <Input 
                                type="number"
                                min="0"
                                value={printQty[uniqueKey] || ''}
                                onChange={(e) => handlePrintQtyChange(uniqueKey, e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm"
                                onClick={() => handleGenerateSerialNumbers(item.product_code, item.product_name, index, item.qty)}
                                disabled={isLoading || !printQty[uniqueKey] || parseInt(printQty[uniqueKey]) <= 0}
                              >
                                Generate S/N
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Serial Numbers Modal */}
      {showSerialNumbers && activeProductCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Generated Serial Numbers for {activeProductCode}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSerialNumbers(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    value={serialNumbersPerPage.toString()}
                    onValueChange={handleSerialNumbersPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder={serialNumbersPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
              </div>

              <div className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Edit Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSerialNumbers.map((sn, index) => {
                      const actualIndex = (serialNumbersPage - 1) * serialNumbersPerPage + index;
                      return (
                        <TableRow key={actualIndex}>
                          <TableCell className="font-mono text-sm">{sn.serialNo}</TableCell>
                          <TableCell>{sn.qty}</TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="1"
                              value={sn.qty}
                              onChange={(e) => handleSerialQtyChange(actualIndex, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium">
                        Total Quantity:
                      </TableCell>
                      <TableCell className={`font-bold ${!isValidQtySum ? 'text-red-500' : ''}`}>
                        {totalSerialQty}
                        {productDetails && (
                          <span className="ml-2 text-sm">
                            / {productDetails.qty}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Serial Numbers Pagination */}
              {generatedSerialNumbers.length > 0 && (
                <div className="flex justify-between items-center text-sm mt-4">
                  <div>
                    Showing {((serialNumbersPage - 1) * serialNumbersPerPage) + 1} to {Math.min(serialNumbersPage * serialNumbersPerPage, generatedSerialNumbers.length)} of {generatedSerialNumbers.length} entries
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handleSerialNumbersPageChange(serialNumbersPage - 1)}
                          className={serialNumbersPage === 1 ? "pointer-events-none opacity-50" : ""} 
                        />
                      </PaginationItem>
                      {[...Array(totalSerialNumbersPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalSerialNumbersPages ||
                          (pageNumber >= serialNumbersPage - 1 && pageNumber <= serialNumbersPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === serialNumbersPage}
                                onClick={() => handleSerialNumbersPageChange(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === serialNumbersPage - 2 ||
                          pageNumber === serialNumbersPage + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handleSerialNumbersPageChange(serialNumbersPage + 1)}
                          className={serialNumbersPage === totalSerialNumbersPages ? "pointer-events-none opacity-50" : ""} 
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handlePrint}
                  disabled={!isValidQtySum || isPrinting}
                >
                  {isPrinting ? "Printing..." : "Print Labels"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Label Printing */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Label Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <Select
                value={recentPrintingsPerPage.toString()}
                onValueChange={handleRecentPrintingsPerPageChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={recentPrintingsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">GRN Number</TableHead>
                  <TableHead className="whitespace-nowrap">Product Code</TableHead>
                  <TableHead className="whitespace-nowrap">Product Name</TableHead>
                  <TableHead className="whitespace-nowrap">Quantity</TableHead>
                  <TableHead className="whitespace-nowrap">Serial Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecent ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">Loading recent label printing data...</TableCell>
                  </TableRow>
                ) : paginatedRecentPrinting.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">No recent label printing data found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedRecentPrinting.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.trans_serialno}</TableCell>
                      <TableCell>{item.product_code}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.product_name}</TableCell>
                      <TableCell>{item.print_qty}</TableCell>
                      <TableCell className="font-mono text-sm">{item.serial_no}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Recent Label Printing Pagination */}
          {!isLoadingRecent && recentLabelPrinting.length > 0 && (
            <div className="flex justify-between items-center text-sm mt-4">
              <div>
                Showing {((recentPrintingPage - 1) * recentPrintingsPerPage) + 1} to {Math.min(recentPrintingPage * recentPrintingsPerPage, recentLabelPrinting.length)} of {recentLabelPrinting.length} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handleRecentPrintingsPageChange(recentPrintingPage - 1)}
                      className={recentPrintingPage === 1 ? "pointer-events-none opacity-50" : ""} 
                    />
                  </PaginationItem>
                  {[...Array(totalRecentPrintingPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalRecentPrintingPages ||
                      (pageNumber >= recentPrintingPage - 1 && pageNumber <= recentPrintingPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={pageNumber === recentPrintingPage}
                            onClick={() => handleRecentPrintingsPageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      pageNumber === recentPrintingPage - 2 ||
                      pageNumber === recentPrintingPage + 2
                    ) {
                      return <PaginationEllipsis key={pageNumber} />;
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handleRecentPrintingsPageChange(recentPrintingPage + 1)}
                      className={recentPrintingPage === totalRecentPrintingPages ? "pointer-events-none opacity-50" : ""} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RMLabelPrinting;