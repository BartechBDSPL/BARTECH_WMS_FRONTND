"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import TableSearch from '@/utills/tableSearch';
import { DateTime } from "luxon";
import {  X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BACKEND_URL } from '@/lib/constants';
import {format, set} from 'date-fns';
import { getUserID } from '@/utills/getFromSession';
import { toast } from '../ui/use-toast';
import Cookies from 'js-cookie';
import CustomDropdown from '../CustomDropdown';
import CustomDropdownEditable from '../CustomDropdownEditable';
import { useRouter } from 'next/navigation';

interface RecentTransaction {
  PRODUCTION_PLANT: string | null;
  ORDER_NUMBER: string;
  MATERIAL: string;
  MATERIAL_TEXT: string;
  BATCH: string;
  STORAGE_LOCATION: string;
  SCRAP: number;
  TARGET_QUANTITY: number;
  DELIVERED_QUANTITY: number;
  UNIT_ISO: string;
  PRODUCTION_START_DATE: string;
  PRODUCTION_FINISH_DATE: string;
  ENTERED_BY: string;
  ENTER_DATE: string;
  PrintQty: number;
  SerialNo: string;
  PrintStatus: string;
  PrintBy: string;
  PrintDate: string;
}

interface SerialNumber {
  serialNo: string;
  qty: number;
}

interface ItemSerialNumbers {
  [itemCode: string]: SerialNumber[];
}

interface OrderDetails {
  ORDER_NUMBER: string;
  ORDER_ITEM_NUMBER: string;
  SCRAP: string;
  QUANTITY: string;
  MATERIAL: string;
  STORAGE_LOCATION: string;
  PROD_PLANT: string;
  ORDER_TYPE: string;
  PRODUCTION_FINISH_DATE: string;
  BATCH: string;
  MATERIAL_TEXT: string;
  PRODUCTION_START_DATE: string;
  PRODUCTION_SCHEDULER: string;
  MRP_CONTROLLER: string;
  ENTERED_BY: string;
  ENTER_DATE: string;
  TARGET_QUANTITY: string;
  RESERVATION_NUMBER: string;
  SCHED_RELEASE_DATE: string;
  SYSTEM_STATUS: string;
  WORK_CENTER: string;
  STANDARD_VALUE_KEY: string;
  UNIT: string;
  UNIT_ISO: string;
  Status: string;
  Message: string;
  PrintQty?: string;
  PRINTED_LABELS ?: number;
  REMAINING_LABELS ?: number;
}

interface MaterialDetail {
  MATERIAL: string;
  ORDER_NUMBER: string;
  MATL_DESC: string;
  NUMERATOR: number;
  DENOMINATOR: number;  
  LANGU_ISO: number;
  ALT_UNIT: string;
  ALT_UNIT_ISO: string;
  CreatedBy: string;
  CreatedDate: string;
}

interface APIResponse {
  OrderDetails: OrderDetails;
  materialDetails: MaterialDetail[];
}

interface PrinterData {
  PrinterName: string;
  PrinterIp: string;
  dpi:string;
}

interface DropdownOptionRecentOrder {
  value: string;
  label: string;
}
interface DropdownOption {
  value: string;
  label: string;
  dpi:string;

}

// New interface for Shift data
interface ShiftData {
  Shift_Name: string;
  Shift_Description: string;
  FromTime: string;
  ToTime: string;
  Created_By: string;
  Created_Date: string;
  Updated_By: string | null;
  Updated_Date: string | null;
}

// Add a new interface for recently added orders
interface RecentlyAddedOrder {
  ORDER_NUMBER: string;
  WORK_CENTER: string;
  MATERIAL_TEXT: string;
  CreatedDate: string | null;
}

const FGLabelPrinting: React.FC = () => {
  const [productionOrderNo, setProductionOrderNo] = useState('');
  const [detailsFetched, setDetailsFetched] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedMaterials, setDisplayedMaterials] = useState<RecentTransaction[]>([]);
  const [showPrintSerialNumber, setShowPrintSerialNumber] = useState(false);
  const [sorterNo, setSorterNo] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [labelQty, setLabelQty] = useState<number>(0);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const orderNORef = useRef<HTMLInputElement>(null);
  const [itemSerialNumbers, setItemSerialNumbers] = useState<ItemSerialNumbers>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [materialDetails, setMaterialDetails] = useState<MaterialDetail[]>([]);
  const [printQty, setPrintQty] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [printerLoading, setPrinterLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingMessagePrinter, setLoadingMessagePrinter] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);
  const [serialNumberPage, setSerialNumberPage] = useState(1);
  const [serialNumbersPerPage, setSerialNumbersPerPage] = useState(10);
  const [generatedSerialNumbers, setGeneratedSerialNumbers] = useState<SerialNumber[]>([]);
  const token = Cookies.get('token')
  const [printers, setPrinters] = useState<DropdownOption[]>([]);
  const [selectedPrinterIp, setSelectedPrinterIp] = useState<string>("");
  const [shifts, setShifts] = useState<DropdownOption[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [showExcessDialog, setShowExcessDialog] = useState(false);
  const [excessOrderNo, setExcessOrderNo] = useState('');
  const router = useRouter();
  const printerRef = useRef<HTMLDivElement>(null);
  const printButtonRef = useRef<HTMLDivElement>(null);
  const [recentlyAddedOrders, setRecentlyAddedOrders] = useState<DropdownOptionRecentOrder[]>([]);
  const sorterNoRef = useRef<HTMLInputElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect( () =>{
    orderNORef.current?.focus();
  },[])


  useEffect(() => {
    fetchRecentTransactions();
  }, [token, itemsPerPage]);

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/recent-fg-label-prints`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setRecentTransactions(data);
        const firstPageData = data.slice(0, itemsPerPage);
        setDisplayedMaterials(firstPageData);
        setTotalPages(Math.max(1, Math.ceil(data.length / itemsPerPage)));
      } else {
        console.error('Received non-array data:', data);
        setRecentTransactions([]);
        setDisplayedMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recent transactions"
      });
      setRecentTransactions([]);
      setDisplayedMaterials([]);
    }
  };

  const updatePagination = useCallback(() => {
    if (!Array.isArray(recentTransactions) || recentTransactions.length === 0) {
      setDisplayedMaterials([]);
      setTotalPages(1);
      return;
    }
  
    const filteredData = recentTransactions.filter(item => {
      if (!searchTerm) return true;
      return Object.values(item).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  
    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const validCurrentPage = Math.min(currentPage, totalPages);
    setTotalPages(totalPages);
    setCurrentPage(validCurrentPage);
  
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    setDisplayedMaterials(filteredData.slice(startIndex, endIndex));
  }, [recentTransactions, itemsPerPage, currentPage, searchTerm]);

  useEffect(() => {
    updatePagination();
  }, [updatePagination]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

const handleSearch = useCallback((term: string) => {
  setSearchTerm(term.trim());
  setCurrentPage(1);
}, []);

  const startEntry = displayedMaterials.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, recentTransactions.length);

  const handleCloseAddSerialNumber = () => {
    setShowPrintSerialNumber(false);
  };

  const handleGetDetails = async () => {
    if (!productionOrderNo.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter or select a production order number"
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Fetching...');
    
    const sapTimer = setTimeout(() => {
      setLoadingMessage('Fetching from SAP...');
      setShowSpinner(true);
    }, 1500);
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/check-order-no`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
           ORDER_NUMBER: productionOrderNo.trim(),
           USER:getUserID(),
           EXPORT:false
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error || errorData.message || 'Failed to fetch order details'
        });
        return;
      }

      const data: APIResponse = await response.json();
      
      if (data.OrderDetails.Message.includes('Printing Done for this Order')) {
        console.log("Entering Condition")
        setExcessOrderNo(productionOrderNo.trim().replace(/^0+/, ''));
        setShowExcessDialog(true);
        return;
      }
      
      if (!data.OrderDetails || data.OrderDetails.Status === 'F') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No order details found for this order number"
        });
        return;
      }
      setOrderDetails(data.OrderDetails);
      setMaterialDetails(data.materialDetails);
      setDetailsFetched(true);
      fetchRecentlyAddedOrders();

    } catch (error: any) {
      console.error('Error fetching details:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: error?.error || "An unknown error occurred"
      });
    } finally {
      clearTimeout(sapTimer);
      setIsLoading(false);
      setLoadingMessage('');
      setShowSpinner(false);
    }
  };

  const handleExcessProduction = () => {
    router.push(`/excess-fg-label-printing?orderNo=${excessOrderNo}`);
  };

  const handleValueChange = (newValue: string) => {
    setSelectedPrinterIp(newValue);
  };

const generatePrintableContent = (
  serialNoString: string,
  printQtyString: string,
  orderDetails: OrderDetails | null
): string => {
  let printContent = '';
  if (!orderDetails) return printContent;

  const serialNos = serialNoString.split('$').filter(Boolean);
  const printQtys = printQtyString.split('$').filter(Boolean);

  serialNos.forEach((serialNo: string, index: number) => {
    const [material, orderNo, batch, boxNo, labelSerialNo] = serialNo.split('|');
    const line = orderDetails?.WORK_CENTER?.slice(-2) || '';
    const qty = printQtys[index] || '0';

    printContent += `
      <div style="
        width: 4in;
        height: 2in;
        padding: 0.1in;
        page-break-after: always;
        page-break-inside: avoid;
        border: 1px solid #000;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
        position: relative;
        display: grid;
        grid-template-columns: 1fr 90px;
        gap: 0.1in;
      ">
        <!-- Left Content -->
        <div style="display: flex; flex-direction: column;">
          <!-- Header with Logo -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.1in; border-bottom: 1px solid #000;">
            <img 
              src="/gerr.png" 
              alt="Company Logo" 
              style="width: 50px; height: 35.7px; object-fit: contain; filter: grayscale(100%);"
            />
            <div style="font-size: 16pt; font-weight: bold;">Box.No: ${boxNo}</div>
          </div>

          <!-- Details Section -->
          <div style="font-size: 10pt; margin: 0.05in 0;">
            <div style="margin-bottom: 0.05in;"><strong>Mat Code:</strong> ${(orderDetails?.MATERIAL).replace(/^0+/, '') || ''}</div>
            <div style="margin-bottom: 0.05in;"><strong>Article :</strong> ${orderDetails?.MATERIAL_TEXT || ''}</div>
            <div style="margin-bottom: 0.05in;"><strong>BatchNo :</strong> ${(orderDetails?.BATCH).replace(/^0+/, '') || ''}</div>
          </div>

          <!-- Info Grid -->
          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.1in;
            margin: 0.1in 0;
            font-size: 10pt;
          ">
            <div><strong>Line:</strong> ${line}</div>
            <div><strong>Qty:</strong> ${qty}</div>
            <div><strong>Shift:</strong> ${selectedShift}</div>
          </div>

          <!-- Footer -->
          <div style="
            margin-top: auto;
            font-size: 9pt;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.1in;
          ">
            <div><strong>Mfg Date:</strong> ${new Date().toLocaleDateString()}</div>
            <div><strong>Print By:</strong> ${getUserID()}</div>
          </div>
        </div>

        <!-- Right Side QR Code -->
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.05in;
        ">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(serialNo)}"
            alt="QR Code"
            style="width: 90px; height: 90px;"
          />
          <div style="
            font-size: 7pt;
            margin-top: 0.05in;
            word-break: break-all;
            text-align: center;
          ">${serialNo}</div>
        </div>
      </div>
    `;
  });

  return printContent;
};


let printWindow: Window | null = null;

const printLabels = (content: string) => {
if (printWindow && !printWindow.closed) {
  printWindow.close();
}

printWindow = window.open('', 'PrintWindow', 'width=600,height=600');

if (!printWindow) {
  alert("Please allow popups for this site to print labels.");
  return;
}

try {
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${productionOrderNo.replace(/^0+/, '')}-${new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            })}</title>
        <style>
          @page {
            size: 4in 2in;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: white;
          }

          .label-page {
            width: 4in;
            height: 2in;
            page-break-after: always;
            page-break-inside: avoid;
            position: relative;
            box-sizing: border-box;
          }

          .label-content {
            width: 4in;
            height: 2in;
            padding: 0.05in;
            display: flex;
            justify-content: space-between;
            border: 1px solid #000;
            box-sizing: border-box;
          }

          .info-section {
            width: 2.8in;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .qr-section {
            width: 1in;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .label-row {
            font-size: 11px;
            margin-bottom: 2px;
          }

          .desc-row {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .count-row {
            font-size: 11px;
            font-weight: bold;
            margin-top: auto;
          }

          .qr-code {
            width: 0.9in;
            height: 0.9in;
          }

          @media print {
            @page {
              size: 4in 2in landscape;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
            }

            .label-page {
              page-break-after: always;
              page-break-inside: avoid;
            }

            header, footer {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  
  printWindow.document.close();

  const checkWindowClosed = setInterval(() => {
    if (printWindow && printWindow.closed) {
      clearInterval(checkWindowClosed);
      printWindow = null;
    }
  }, 1000);

  const images = printWindow.document.getElementsByTagName('img');
  let loadedImages = 0;
  const totalImages = images.length;

  const tryPrint = () => {
    if (loadedImages === totalImages && printWindow) {
      printWindow.focus();
      setTimeout(() => {
        if (printWindow) {
          printWindow.print();
          
          const pollPrinting = setInterval(() => {
            if (printWindow && printWindow.document.readyState === 'complete') {
              clearInterval(pollPrinting);
              setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                  printWindow.close();
                  printWindow = null;
                }
              }, 1000);
            }
          }, 200);
        }
      }, 500);
    }
  };

  Array.from(images).forEach((img) => {
    if (img.complete) {
      loadedImages++;
    } else {
      img.onload = () => {
        loadedImages++;
        tryPrint();
      };
      img.onerror = () => {
        loadedImages++;
        tryPrint();
      };
    }
  });

  if (totalImages === 0) {
    tryPrint();
  }

} catch (error: any) {
  console.error("Error in print process:", error);
  alert("An error occurred while trying to print. Please check your browser settings and try again.");
  if (printWindow && !printWindow.closed) {
    printWindow.close();
    printWindow = null;
  }
}
};

const handlePrint = async () => {
  if(!selectedPrinterIp || selectedPrinterIp === "") {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select a printer"
    });
    printerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if(!selectedShift) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select a shift"
    });
    shiftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if(!sorterNo) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please enter sorter no"
    });
    sorterNoRef.current?.focus();
    return;
  }

  try {
    setPrinterLoading(true);
    setShowSpinner(true);

    let formattedOrderNo = orderDetails?.ORDER_NUMBER.trim() || '';  
    if (!formattedOrderNo.startsWith('000')) {
      formattedOrderNo = '000' + formattedOrderNo;
    }

    const serialNoString = generatedSerialNumbers
      .map(sn => sn.serialNo)
      .join('$');

    const printQtyString = generatedSerialNumbers
    .map(sn => sn.qty)
    .join('$');

    if (!orderDetails) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Order details are missing"
      });
      setPrinterLoading(false);
      
      setShowSpinner(false);
      return;
    }
    
    const requestBody = {
      ORDER_NUMBER: formattedOrderNo,
      PRODUCTION_PLANT: orderDetails.PROD_PLANT || '',
      MATERIAL: orderDetails.MATERIAL || '',
      MATERIAL_TEXT: orderDetails.MATERIAL_TEXT || '',
      BATCH: orderDetails.BATCH || '',
      STORAGE_LOCATION: orderDetails.STORAGE_LOCATION || '',
      SCRAP: orderDetails.SCRAP || '',
      TARGET_QUANTITY: orderDetails.TARGET_QUANTITY || '',
      WORK_CENTER: orderDetails.WORK_CENTER || '',
      DELIVERED_QUANTITY: '0.000',
      PRINTER_IP: selectedPrinterIp,
      UNIT_ISO: orderDetails.UNIT_ISO || '',
      UNIT: orderDetails.UNIT || '',
      PRODUCTION_START_DATE: orderDetails.PRODUCTION_START_DATE || '',
      PRODUCTION_FINISH_DATE: orderDetails.PRODUCTION_FINISH_DATE || '',
      ENTERED_BY: orderDetails.ENTERED_BY || '',
      ENTER_DATE: orderDetails.ENTER_DATE || '',
      PrintQty: printQtyString,
      SHIFT: selectedShift,
      SorterNo: sorterNo,
      SerialNo: serialNoString,
      PrintBy: getUserID(),
      Printed_Labels: generatedSerialNumbers.length.toString(),
      PrinterDpi: printers.find(printer => printer.value === selectedPrinterIp)?.dpi || '',
      Remaining_Labels: (orderDetails?.REMAINING_LABELS ?? 0) === 0 ? 
      calculateMaxPrintQty() - generatedSerialNumbers.length : 
      (orderDetails?.REMAINING_LABELS ?? 0) - generatedSerialNumbers.length
            
    };
   

    const response = await fetch(`${BACKEND_URL}/api/transactions/update-serial-no`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      toast({
        variant: "destructive",
        title: "Error",
        description: errorData.error || errorData.message || errorData[0].Message || 'Failed to update serial no'
      });
      setPrinterLoading(false);
      setShowSpinner(false);
      return;
    }
    
    const data = await response.json();

    if (data.Status === 'T') {
      toast({
        title: "Success",
        description: data.Message || "Serial numbers updated successfully",
      });
      
      setDetailsFetched(false);
      fetchRecentlyAddedOrders();
      setPrintQty('');
      setProductionOrderNo('');
      fetchRecentTransactions();
      setShowPrintSerialNumber(false);
      handleReset();
    }

  } catch (error: any) {
    console.error('Print error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to print labels"
    });
  } finally {
    setPrinterLoading(false);
    setShowSpinner(false);
  }
};

const handleReset = () => {
  setProductionOrderNo('');
  setDetailsFetched(false);
  setPrintQty('');
  setOrderDetails(null);
  setShowPrintSerialNumber(false);
  setSorterNo('')
  setMaterialDetails([]);
  setSelectedPrinterIp("");
  setGeneratedSerialNumbers([]);
  setSerialNumbers([]);
  setLabelQty(0);
  setLoadingItem(null);
  setItemSerialNumbers({});
  setSearchTerm('');
  setIsLoading(false);
  setPrinterLoading(false);
  setLoadingMessage('');
  setLoadingMessagePrinter('');
  setShowSpinner(false);
  setSerialNumberPage(1);
};

  const calculateMaxPrintQty = () => {
    const zpeUnit = materialDetails.find(d => d.ALT_UNIT === 'ZPE');
    const zpeValue = zpeUnit ? (zpeUnit.NUMERATOR / zpeUnit.DENOMINATOR) : 0;
    const targetQty = Number(orderDetails?.TARGET_QUANTITY || 0);
    return Math.floor(targetQty / zpeValue); // Changed from Math.ceil to Math.floor to only create full boxes
  };

  const handlePrintQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Print quantity cannot be negative"
      });
      setPrintQty("");
      return;
    }
    
    const maxQty = calculateMaxPrintQty();
    const remainingLabels = orderDetails?.REMAINING_LABELS ?? 0;
    const maxAllowedQty = remainingLabels === 0 ? maxQty : remainingLabels;

    if (value > maxAllowedQty) {
      toast({
      variant: "destructive",
      title: "Invalid Quantity",
      description: `Box to be print cannot exceed ${maxAllowedQty}`
      });
      setPrintQty(maxAllowedQty.toString());
      return;
    }
    setPrintQty(value.toString());
  };

  const generateSerialNumbers = async () => {
    setGeneratedSerialNumbers([]);
    if (!printQty || Number(printQty) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid reuqired number of boxes"
      });
      return;
    }

    try {
      let formattedOrderNo = orderDetails?.ORDER_NUMBER || '';  // Ensure to trim here
      if (!formattedOrderNo.startsWith('000')) {
        formattedOrderNo = '000' + formattedOrderNo;
      }

      // Remove any whitespace or special characters
      formattedOrderNo = formattedOrderNo.replace(/[\s\t]/g, '');

      const response = await fetch(`${BACKEND_URL}/api/transactions/get-serial-and-box-no`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ORDER_NUMBER: formattedOrderNo,
          MATERIAL: orderDetails?.MATERIAL?.trim() || '',  // Also trim MATERIAL
          BATCH: orderDetails?.BATCH?.trim()  // And BATCH
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error || errorData.message || 'Failed to get serial no and box no'
        });
      return
      };

      const data = await response.json();
      const { labelSerialNo , labelBoxNo } = data;
      const updatedLabelSerialNo = Number(labelSerialNo) + 1;
      const updatedLabelBoxNo = Number(labelBoxNo) + 1;

      const zpeUnit = materialDetails.find(d => d.ALT_UNIT === 'ZPE');
      const zpeValue = zpeUnit ? (zpeUnit.NUMERATOR / zpeUnit.DENOMINATOR) : 0;
      
      const serialNumbers: SerialNumber[] = [];
      const material = orderDetails?.MATERIAL?.replace(/^0{8}/, '') || '';
      const orderNo = orderDetails?.ORDER_NUMBER?.replace(/^000/, '');
      const batch = orderDetails?.BATCH || '';

      for (let i = 0; i < Number(printQty); i++) {
        const serialNo = `${orderNo}|${material}|${batch}|${updatedLabelBoxNo + i}|${updatedLabelSerialNo + i}`;
        serialNumbers.push({ serialNo, qty: zpeValue });
      }

      setGeneratedSerialNumbers(serialNumbers);
      setShowPrintSerialNumber(true);
      
      setTimeout(() => {
        printButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate serial numbers"
      });
    }
  };

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/hht/printer-data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch printers');
        
        const data: PrinterData[] = await response.json();
        const formattedPrinters: DropdownOption[] = data.map(printer => ({
          value: printer.PrinterIp,
          label: printer.PrinterName,
          dpi: printer.dpi
        }));
        
        setPrinters(formattedPrinters);
      } catch (error) {
        console.error('Error fetching printers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch printers"
        });
      }
    };

    fetchPrinters();
  }, [token]);

  useEffect(() => {
    fetchRecentlyAddedOrders();
  }, [token]);

  const fetchRecentlyAddedOrders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/get-recently-added-production-order`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recently added production orders');
      }

      const data: RecentlyAddedOrder[] = await response.json();
      if (Array.isArray(data)) {
        const formattedOrders: DropdownOptionRecentOrder[] = data.map(order => ({
          value: order.ORDER_NUMBER.replace(/^0+/, ''),
          label: `${order.ORDER_NUMBER.replace(/^0+/, '')} - ${order.WORK_CENTER.slice(-2)} - ${order.MATERIAL_TEXT}`
        }));
        setRecentlyAddedOrders(formattedOrders);
      } else {
        console.error('Received non-array data for recent orders:', data);
        setRecentlyAddedOrders([]);
      }
    } catch (error) {
      console.error('Error fetching recently added production orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recently added production orders"
      });
      setRecentlyAddedOrders([]);
    }
  };

  const handleOrderNoChange = (value: string) => {
    setProductionOrderNo(value.trim());
  };

  const handleOrderNoCustomChange = (value: string) => {
    setProductionOrderNo(value.trim());
  };

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/master/get-all-shift`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch shifts');
        
        const data: ShiftData[] = await response.json();
        const formattedShifts: DropdownOption[] = data.map(shift => ({
          value: shift.Shift_Name,
          label: `${shift.Shift_Name} (${shift.Shift_Description})`,
          dpi: "" 
        }));
        
        setShifts(formattedShifts);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch shifts"
        });
      }
    };

    fetchShifts();
  }, [token]);

  const handleShiftChange = (value: string) => {
    setSelectedShift(value);
  };

  return (
    <>
      <Card className="w-full mt-5">
        <CardHeader>
          <CardTitle>Primary Pack Label Printing (* Fields Are Mandatory)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <Label htmlFor="prodOrderNo">Production Order No(*)</Label>
                <div className="mt-3">
                  <CustomDropdownEditable
                    options={recentlyAddedOrders}
                    value={productionOrderNo}
                    onValueChange={handleOrderNoChange}
                    onCustomValueChange={handleOrderNoCustomChange}
                    placeholder="Enter or select production order..."
                    searchPlaceholder="Search or enter order number..."
                    emptyText="No recent orders available"
                    disabled={detailsFetched}
                    allowCustomValue={true}
                  />
                </div>
              </div>
              <Button 
                onClick={handleGetDetails} 
                disabled={detailsFetched || isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGetDetails();
                  }
                }}
              >
                {isLoading ? (
                  <>
                    {loadingMessage}
                    {showSpinner && <span className="ml-2 animate-spin">⭮</span>}
                  </>
                ) : (
                  'Get Details'
                )}
              </Button>
              <Button onClick={handleReset} variant="outline">Reset</Button>
              <div className="flex-1">
                <Label>Assign Printer (*)</Label>
                <div className="mt-2" ref={printerRef}>
                  <CustomDropdown
                    placeholder="Select Printer..."
                    options={printers}
                    value={selectedPrinterIp}
                    onValueChange={handleValueChange}
                    disabled={!detailsFetched}
                    searchPlaceholder='Search Printer...'
                    emptyText='No printers found'
                  />
                </div>
              </div>
            </div>

            {detailsFetched  && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input id="material" value={(orderDetails?.MATERIAL || '').replace(/^0+/, '')} disabled />
                  </div>
                
                  <div>
                    <Label htmlFor="storageLocation">Storage Location</Label>
                    <Input id="storageLocation" value={orderDetails?.STORAGE_LOCATION || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Input 
                    id="orderType" 
                    value={`${
                      orderDetails?.ORDER_TYPE === 'PP01' ? 'Production Order' : 
                      orderDetails?.ORDER_TYPE === 'PP02' ? 'Resorting Production Order' : ''
                    }`} 
                    disabled 
                    />
                  </div>
                  <div>
                    <Label htmlFor="enteredBy">Order Created By</Label>
                    <Input id="enteredBy" value={orderDetails?.ENTERED_BY || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="workCenter">Line No</Label>
                    <Input id="workCenter" value={(orderDetails?.WORK_CENTER?.slice(-2)) || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="unit">Production Start Date</Label>
                    <Input id="unit" value={orderDetails?.PRODUCTION_START_DATE ? format(new Date(orderDetails.PRODUCTION_START_DATE).toLocaleDateString(),"dd-MM-yyyy") : ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="batch">Batch</Label>
                    <Input id="batch" value={orderDetails?.BATCH || ''} disabled />
                  </div>
                    <div>
                    <Label htmlFor="sorterNumber">Sorter Number</Label>
                    <Input 
                      id="sorterNumber" 
                      ref={sorterNoRef}
                      value={sorterNo} 
                      onChange={(e) => setSorterNo(e.target.value)}
                      placeholder="Enter sorter number"
                    />
                    </div>
                  <div>
                    <Label htmlFor="shift">Shift (*)</Label>
                    <div className="mt-2" ref={shiftRef}>
                      <CustomDropdown
                        placeholder="Select Shift..."
                        options={shifts}
                        value={selectedShift}
                        onValueChange={handleShiftChange}
                        disabled={false}
                        searchPlaceholder='Search Shift...'
                        emptyText='No shifts found'
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <Label htmlFor="materialDesc">Material Desc</Label>
                    <Input id="materialDesc" value={orderDetails?.MATERIAL_TEXT || ''} disabled />
                  </div>
                </div>

                <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>PALLET QTY</TableHead>
                  <TableHead>PCS / BOX</TableHead>
                  <TableHead>Production Order Qty</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Printed Box</TableHead>
                  <TableHead>Remaining Box</TableHead>
                  <TableHead>Required Number of Box Labels</TableHead>
                  <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {(() => {
                        const palUnit = materialDetails.find(d => d.ALT_UNIT === 'PAL');
                        return palUnit ? (palUnit.NUMERATOR / palUnit.DENOMINATOR).toString() : '0';
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const zpeUnit = materialDetails.find(d => d.ALT_UNIT === 'ZPE');
                        return zpeUnit ? (zpeUnit.NUMERATOR / zpeUnit.DENOMINATOR).toString() : '0';
                      })()}
                    </TableCell>
                    <TableCell>{orderDetails?.TARGET_QUANTITY ?  parseInt(orderDetails?.TARGET_QUANTITY): 0}</TableCell>
                    <TableCell>{orderDetails?.BATCH}</TableCell>
                    <TableCell>{orderDetails?.PRINTED_LABELS}</TableCell>
                    <TableCell>{orderDetails?.REMAINING_LABELS === 0 ? calculateMaxPrintQty() :orderDetails?.REMAINING_LABELS }</TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={printQty}
                        onChange={handlePrintQtyChange}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                    <Button onClick={generateSerialNumbers}>
                         Generate S/N
                        </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
                  
              </>
            )}
          </div>
        </CardContent>  
      </Card>
      {showPrintSerialNumber && (
  <Card className="mt-4">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-center underline ">Generated Serial Numbers for BOX</CardTitle>
      <Button variant="ghost" size="sm" onClick={() => setShowPrintSerialNumber(false)}>
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select
            value={serialNumbersPerPage.toString()}
            onValueChange={(value) => setSerialNumbersPerPage(Number(value))}
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial Number for BOX</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generatedSerialNumbers
            .slice(
              (serialNumberPage - 1) * serialNumbersPerPage,
              serialNumberPage * serialNumbersPerPage
            )
            .map((sn, index) => (
              <TableRow key={index}>
                <TableCell>{sn.serialNo}</TableCell>
                <TableCell>{sn.qty}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center text-sm md:text-md mt-4">
        <div>
          Showing {((serialNumberPage - 1) * serialNumbersPerPage) + 1} to {Math.min(serialNumberPage * serialNumbersPerPage, generatedSerialNumbers.length)} of {generatedSerialNumbers.length} entries
        </div>
        {generatedSerialNumbers.length > 0 && (
          <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
          onClick={() => setSerialNumberPage(p => Math.max(1, p - 1))}
          className={serialNumberPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {[...Array(Math.ceil(generatedSerialNumbers.length / serialNumbersPerPage))].map((_, index) => {
            const pageNum = index + 1;
            if (
          pageNum === 1 ||
          pageNum === Math.ceil(generatedSerialNumbers.length / serialNumbersPerPage) ||
          (pageNum >= serialNumberPage - 1 && pageNum <= serialNumberPage + 1)
            ) {
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
            isActive={pageNum === serialNumberPage}
            onClick={() => setSerialNumberPage(pageNum)}
              >
            {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
            } else if (pageNum === serialNumberPage - 2 || pageNum === serialNumberPage + 2) {
          return <PaginationEllipsis key={pageNum} />;
            }
            return null;
          })}
          <PaginationItem>
            <PaginationNext 
          onClick={() => setSerialNumberPage(p => Math.min(Math.ceil(generatedSerialNumbers.length / serialNumbersPerPage), p + 1))}
          className={serialNumberPage === Math.ceil(generatedSerialNumbers.length / serialNumbersPerPage) ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
          </Pagination>
        )}
      </div>
      <div className='flex justify-end mt-5' ref={printButtonRef}>
        <Button disabled={printerLoading} onClick={handlePrint}> {printerLoading ? (
                  <>
                    Printing
                    {showSpinner && <span className="ml-2 animate-spin">⭮</span>}
                  </>
                ) : (
                  'Print'
                )}</Button>
      </div>
    </CardContent>
  </Card>
)}
      <p className='underline underline-offset-4 text-center mt-10'></p>
      <Card className="w-full mt-5">
        <CardHeader className='underline-offset-4 underline text-center'>Recent Primary Pack Label Printing</CardHeader>
        <CardContent>
        <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    defaultValue="10"
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
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
              <TableHead>Order Number</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Material Text</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Target Quantity</TableHead>
              <TableHead>Box Quantity</TableHead>
              <TableHead>Serial Number for BOX</TableHead>
              <TableHead>Print By</TableHead>
              <TableHead>Print Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMaterials.length > 0 ? (
              displayedMaterials.map((item,index) => (
                <TableRow key={index}>
                  <TableCell>{(item.ORDER_NUMBER).replace(/^0+/, '')}</TableCell>
                  <TableCell>{(item.MATERIAL).replace(/^0+/, '')}</TableCell>
                  <TableCell>{item.MATERIAL_TEXT}</TableCell>
                  <TableCell>{item.BATCH}</TableCell>
                  <TableCell>{item.TARGET_QUANTITY}</TableCell>
                  <TableCell>{item.PrintQty}</TableCell>
                  <TableCell>{item.SerialNo}</TableCell>
                  <TableCell>{item.PrintBy}</TableCell>
                        <TableCell>
                        {DateTime.fromISO(item.PrintDate)  
                        .setZone('UTC')             
                        .toFormat("dd MMM yyyy, hh:mm a")}
                </TableCell>                                     
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
             <div className="flex justify-between items-center text-sm md:text-md mt-4">
              <div>
                {recentTransactions.length > 0 
                  ? `Showing ${startEntry} to ${endEntry} of ${recentTransactions.length} entries`
                  : 'No entries to show'}
              </div>
              {recentTransactions.length > 0 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
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
                              onClick={() => handlePageChange(pageNumber)}
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
        </CardContent>
      </Card>
      <Dialog open={showExcessDialog} onOpenChange={setShowExcessDialog}>
        <DialogContent className="sm:max-w-md p-6 bg-gradient-to-b from-card/50 to-card dark:from-slate-900 dark:to-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center text-primary">
              Printing Complete for this Order
            </DialogTitle>
            <DialogDescription className="text-center mt-2 text-muted-foreground">
              All labels for this order have been printed successfully.
              <p className="mt-2 font-medium">Would you like to proceed with excess production?</p>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <div className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 dark:text-amber-400 mr-2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="text-foreground">Order Number: <strong>{excessOrderNo}</strong></span>
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExcessDialog(false)}
              className="w-1/3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExcessProduction}
              className="w-1/3"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FGLabelPrinting;