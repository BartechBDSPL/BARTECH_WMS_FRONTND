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
import { X, MapPin, Info } from 'lucide-react';

interface MaterialOption {
  value: string;
  label: string;
}

interface MaterialResponse {
  RawMatCode: string;
  RawMatDes: string;
}

interface LocationResponse {
  bin: string;
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

const RMLabelManualPrinting: React.FC = () => {
  const [materialOptions, setMaterialOptions] = useState<MaterialResponse[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationResponse[]>([]);
  const [grnNumber, setGrnNumber] = useState<string>('');
  const [narration, setNarration] = useState<string>('');
  const [selectedRawMatCode, setSelectedRawMatCode] = useState<string>('');
  const [selectedRawMatDes, setSelectedRawMatDes] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [printQty, setPrintQty] = useState<string>('');
  const [noOfLabels, setNoOfLabels] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    fetchMaterialDetails();
    fetchLocationOptions();
    fetchRecentLabelPrinting();
  }, [token]);

  useEffect(() => {
    if (grnInputRef.current) {
      grnInputRef.current.focus();
    }
  }, []);

  const fetchMaterialDetails = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to perform this action."
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-all-manual-printing-material-details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch material details');
      }

      const data: MaterialResponse[] = await response.json();
      setMaterialOptions(data);
    } catch (error) {
      console.error('Error fetching material details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch material details."
      });
    }
  };

  const fetchLocationOptions = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-all-location`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location options');
      }

      const data: LocationResponse[] = await response.json();
      setLocationOptions(data);
    } catch (error) {
      console.error('Error fetching location options:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch location options."
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

  const handleRawMatCodeChange = (value: string) => {
    setSelectedRawMatCode(value);
    // Clear description when code changes
    setSelectedRawMatDes('');
    
    // If a code is selected, find and set the corresponding description
    if (value) {
      const selectedMaterial = materialOptions.find(material => material.RawMatCode === value);
      if (selectedMaterial) {
        setSelectedRawMatDes(selectedMaterial.RawMatDes);
      }
    }
  };

  const handleRawMatDesChange = (value: string) => {
    setSelectedRawMatDes(value);
    // Clear code when description changes
    setSelectedRawMatCode('');
    
    // If a description is selected, find and set the corresponding code
    if (value) {
      const selectedMaterial = materialOptions.find(material => material.RawMatDes === value);
      if (selectedMaterial) {
        setSelectedRawMatCode(selectedMaterial.RawMatCode);
      }
    }
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleClearLocation = () => {
    setSelectedLocation('');
  };

  // Filter options based on current selection
  const getFilteredRawMatCodeOptions = () => {
    if (selectedRawMatDes) {
      // If description is selected, only show the corresponding code
      const matchingMaterial = materialOptions.find(material => material.RawMatDes === selectedRawMatDes);
      return matchingMaterial ? [{ value: matchingMaterial.RawMatCode, label: matchingMaterial.RawMatCode }] : [];
    }
    // Otherwise show all codes
    return materialOptions.map(material => ({
      value: material.RawMatCode,
      label: material.RawMatCode
    }));
  };

  const getFilteredRawMatDesOptions = () => {
    if (selectedRawMatCode) {
      // If code is selected, only show the corresponding description
      const matchingMaterial = materialOptions.find(material => material.RawMatCode === selectedRawMatCode);
      return matchingMaterial ? [{ value: matchingMaterial.RawMatDes, label: matchingMaterial.RawMatDes }] : [];
    }
    // Otherwise show all descriptions
    return materialOptions.map(material => ({
      value: material.RawMatDes,
      label: material.RawMatDes
    }));
  };

  const locationOptionsForDropdown = locationOptions.map(location => ({
    value: location.bin,
    label: location.bin
  }));

  const handleGenerateSerialNumbers = async () => {
    if (!grnNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter GRN Number."
      });
      return;
    }

    if (!narration.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter Narration."
      });
      return;
    }

    if (!selectedRawMatCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a Raw Material Code."
      });
      return;
    }

    if (!printQty || parseInt(printQty) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid Print Quantity."
      });
      return;
    }

    if (!noOfLabels || parseInt(noOfLabels) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid Number of Labels."
      });
      return;
    }

    const requestedPrintQty = parseInt(printQty);
    const numberOfLabels = parseInt(noOfLabels);
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction/get-label-serial-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trans_serialno: grnNumber,
          product_name: selectedRawMatDes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get serial number');
      }
      
      const data = await response.json();
      let startSerialNo = data.SrNo + 1;
      
      const baseQtyPerLabel = Math.floor(requestedPrintQty / numberOfLabels);
      const remainder = requestedPrintQty % numberOfLabels;
      
      const serialNumbers: SerialNumber[] = [];
      let totalAssigned = 0;
      
      for (let i = 0; i < numberOfLabels; i++) {
        const serialNo = `${selectedRawMatCode}|${grnNumber}|${startSerialNo + i}`;
        let labelQty = baseQtyPerLabel;
        
        if (i === numberOfLabels - 1 && remainder > 0) {
          labelQty += remainder;
        }
                
        totalAssigned += labelQty;
        serialNumbers.push({ serialNo, qty: labelQty, editable: true });
      }

      setGeneratedSerialNumbers(serialNumbers);
      setSerialNumbersPage(1);
      setShowSerialNumbers(true);
      
      toast({
        title: "Serial Numbers Generated",
        description: `Generated ${numberOfLabels} serial numbers dividing total quantity ${requestedPrintQty} evenly.`
      });
      
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
    
    const currentPrintQty = parseInt(printQty);
    const currentTotal = updatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
    
    if (currentTotal > currentPrintQty) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Total quantity cannot exceed print quantity ${currentPrintQty}.`
      });
      return;
    }
    
    setGeneratedSerialNumbers(updatedSerialNumbers);
  };

  const handlePrint = async () => {
    const totalSerialQty = generatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
    const currentPrintQty = parseInt(printQty);
    
    if (totalSerialQty !== currentPrintQty) {
      toast({
        variant: "destructive",
        title: "Quantity Mismatch",
        description: `Total quantity of all serial numbers (${totalSerialQty}) must exactly match the print quantity (${currentPrintQty}).`
      });
      return;
    }
    
    if (!token) {
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
      const serialNumberString = generatedSerialNumbers.map(sn => sn.serialNo).join('$');
      
      const response = await fetch(`${BACKEND_URL}/api/transaction/insert-rm-label-manual-printing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trans_serialno: grnNumber,
          product_code: selectedRawMatCode,
          product_name: selectedRawMatDes,
          print_qty: printQtyString,
          serial_no: serialNumberString,
          narration: narration,
          location: selectedLocation || '',
          userID: getUserID()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save printing data');
      }

      toast({
        title: "Success",
        description: "Labels printed successfully!"
      });

      // Reset form after successful printing
      handleReset();
      fetchRecentLabelPrinting();
      
    } catch (error) {
      console.error('Error printing labels:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print labels."
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReset = () => {
    setGrnNumber('');
    setNarration('');
    setSelectedRawMatCode('');
    setSelectedRawMatDes('');
    setSelectedLocation('');
    setPrintQty('');
    setNoOfLabels('');
    setShowSerialNumbers(false);
    setGeneratedSerialNumbers([]);
  };

  const totalSerialQty = generatedSerialNumbers.reduce((sum, sn) => sum + sn.qty, 0);
  const currentPrintQty = parseInt(printQty) || 0;
  const isValidQtySum = totalSerialQty <= currentPrintQty;
  
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
      <h1 className="text-2xl font-bold">Raw Material Manual Label Printing</h1>
      
      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Label Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="grn-number">GRN Number *</Label>
              <Input
                ref={grnInputRef}
                id="grn-number"
                value={grnNumber}
                onChange={(e) => setGrnNumber(e.target.value)}
                placeholder="Enter GRN Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="narration">Narration *</Label>
              <Input
                id="narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter Narration"
              />
            </div>
          </div>

          {/* Line Item Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Line Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="raw-mat-code">Raw Material Code *</Label>
                  <CustomDropdown
                    options={getFilteredRawMatCodeOptions()}
                    value={selectedRawMatCode}
                    onValueChange={handleRawMatCodeChange}
                    placeholder="Select Raw Material Code"
                    searchPlaceholder="Search Raw Material Code..."
                    emptyText="No raw material codes found"
                    allowCustomValue={true}
                    onCustomValueChange={(value) => {
                      setSelectedRawMatCode(value);
                      setSelectedRawMatDes('');
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raw-mat-des">Raw Material Description *</Label>
                  <CustomDropdown
                    options={getFilteredRawMatDesOptions()}
                    value={selectedRawMatDes}
                    onValueChange={handleRawMatDesChange}
                    placeholder="Select Raw Material Description"
                    searchPlaceholder="Search Raw Material Description..."
                    emptyText="No raw material descriptions found"
                    allowCustomValue={true}
                    onCustomValueChange={(value) => {
                      setSelectedRawMatDes(value);
                      setSelectedRawMatCode('');
                    }}
                  />
                </div>
              </div>

              {/* Location Selection with Info */}
              <div className="mb-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <CustomDropdown
                        options={locationOptionsForDropdown}
                        value={selectedLocation}
                        onValueChange={handleLocationChange}
                        placeholder="Select Location"
                        searchPlaceholder="Search Location..."
                        emptyText="No locations found"
                        allowCustomValue={true}
                        onCustomValueChange={(value) => setSelectedLocation(value)}
                      />
                    </div>
                    {selectedLocation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearLocation}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Info Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Location Selection Guide:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>No Location Selected:</strong> Labels will go through Quality Check → RM Material Inward → RM Put Away process</li>
                          <li>• <strong>Location Selected:</strong> Put Away will be completed directly at the selected location</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="print-qty">Print Qty *</Label>
                  <Input
                    id="print-qty"
                    type="number"
                    min="1"
                    value={printQty}
                    onChange={(e) => setPrintQty(e.target.value)}
                    placeholder="Enter Print Quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no-of-labels">No. of Labels *</Label>
                  <Input
                    id="no-of-labels"
                    type="number"
                    min="1"
                    value={noOfLabels}
                    onChange={(e) => setNoOfLabels(e.target.value)}
                    placeholder="Enter Number of Labels"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateSerialNumbers}
                    disabled={isLoading || !grnNumber || !narration || !selectedRawMatCode || !printQty || !noOfLabels}
                    className="flex-1"
                  >
                    {isLoading ? "Generating..." : "Generate S/N"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Serial Numbers Modal */}
      {showSerialNumbers && selectedRawMatCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Generated Serial Numbers for {selectedRawMatCode}
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
                        {currentPrintQty > 0 && (
                          <span className="ml-2 text-sm">
                            / {currentPrintQty}
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
                  disabled={!isValidQtySum || isPrinting || totalSerialQty !== currentPrintQty}
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

export default RMLabelManualPrinting;
