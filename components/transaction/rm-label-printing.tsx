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
import CustomDropdown from '@/components/CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import { getUserID } from '@/utills/getFromSession';

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

interface ErrorResponse {
  Status: string;
  Message: string;
}

// Dummy data for recent transactions
const dummyRecentTransactions = [
  {
    grn_number: 'ICG000009',
    product_code: 'AFWP220',
    product_name: 'Avery Faspet White/Permanent 220MM',
    qty: 1500,
    printed_labels: 500,
    remaining_labels: 1000,
    print_date: '2025-05-18'
  },
  {
    grn_number: 'ICG000015',
    product_code: 'AFWP158',
    product_name: 'Avery Faspet White/Permanent 158MM',
    qty: 2000,
    printed_labels: 1500,
    remaining_labels: 500,
    print_date: '2025-05-17'
  },
  {
    grn_number: 'ICG000016',
    product_code: 'RFCP110',
    product_name: 'Red Faspet Coated Paper 110MM',
    qty: 3000,
    printed_labels: 1000,
    remaining_labels: 2000,
    print_date: '2025-05-16'
  },
  {
    grn_number: 'ICG000025',
    product_code: 'BFGP180',
    product_name: 'Blue Faspet Gloss Paper 180MM',
    qty: 2500,
    printed_labels: 2500,
    remaining_labels: 0,
    print_date: '2025-05-15'
  },
  {
    grn_number: 'ICG000026',
    product_code: 'GBWP200',
    product_name: 'Green Bubble White Paper 200MM',
    qty: 1800,
    printed_labels: 800,
    remaining_labels: 1000,
    print_date: '2025-05-14'
  }
];

const RMLabelPrinting: React.FC = () => {
  // State variables
  const [grnNumbers, setGRNNumbers] = useState<GRNOption[]>([]);
  const [selectedGrn, setSelectedGrn] = useState<string>('');
  const [grnDetails, setGrnDetails] = useState<GRNDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [printQty, setPrintQty] = useState<{[key: string]: string}>({});
  const router = useRouter();
  const token = Cookies.get('token');
  const grnInputRef = useRef<HTMLInputElement>(null);

  // Fetch GRN numbers when component mounts
  useEffect(() => {
    fetchGRNNumbers();
  }, [token]);

  // Focus on GRN input field when component mounts
  useEffect(() => {
    if (grnInputRef.current) {
      grnInputRef.current.focus();
    }
  }, []);

  // Fetch all unique GRN numbers
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

  // Handle GRN number selection from dropdown
  const handleGRNChange = (value: string) => {
    setSelectedGrn(value);
  };

  // Get details for the selected GRN number
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
        // Error response
        toast({
          variant: "destructive",
          title: "Error",
          description: data[0]?.Message || "Invalid GRN number"
        });
        setGrnDetails(null);
      } else {
        // Success response
        setGrnDetails(data);
        
        // Initialize print quantity for each item
        const initialPrintQty: {[key: string]: string} = {};
        data.forEach((item: GRNDetails) => {
          initialPrintQty[item.product_code] = '';
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

  // Handle print quantity change for each item
  const handlePrintQtyChange = (productCode: string, value: string) => {
    setPrintQty(prev => ({
      ...prev,
      [productCode]: value
    }));
  };

  // Reset form
  const handleReset = () => {
    setSelectedGrn('');
    setGrnDetails(null);
    setPrintQty({});
  };

  // Handle print action
  const handlePrint = async () => {
    // Logic for printing will be added later
    toast({
      title: "Print Requested",
      description: "Print functionality will be implemented soon."
    });
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
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Print Qty</TableHead>
                        <TableHead>Printed Labels</TableHead>
                        <TableHead>Remaining Labels</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grnDetails.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_code}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0"
                              value={printQty[item.product_code] || ''}
                              onChange={(e) => handlePrintQtyChange(item.product_code, e.target.value)}
                            />
                          </TableCell>
                          <TableCell>{item.printed_label}</TableCell>
                          <TableCell>{item.remaining_label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-end mt-4">
                <Button onClick={handlePrint}>
                  Print Labels
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
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Printed Labels</TableHead>
                  <TableHead>Remaining Labels</TableHead>
                  <TableHead>Print Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyRecentTransactions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.grn_number}</TableCell>
                    <TableCell>{item.product_code}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.printed_labels}</TableCell>
                    <TableCell>{item.remaining_labels}</TableCell>
                    <TableCell>{item.print_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RMLabelPrinting;