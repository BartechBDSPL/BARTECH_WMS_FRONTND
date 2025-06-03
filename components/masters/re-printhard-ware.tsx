"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Oval } from "react-loader-spinner";
import { BACKEND_URL, getBasicToken, getHeaderToken } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import insertAuditTrail from "@/utills/insertAudit";
import Cookies from "js-cookie";
import { getUserID } from "@/utills/getFromSession";
import { logError } from "@/utills/loggingException";
import { delay } from "@/utills/delay";
import TableSearch from "@/utills/tableSearch";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CustomDropdown from "../CustomDropdown";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TableData {
  ID: number;
  CustomerName: string;
  CustomerAddress: string;
  ContactPerson: string;
  ContactNo: string;
  EmailID: string;
  Invoice_PONo: string;
  HardwareType: string;
  Make: string;
  Model: string;
  AdditionalDetails: string;
  DateOfWarrentyStart: string;
  WarrentyDays: number;
  DateOfWarrentyExp: string;
  Qty: number;
  SerialNo: string;
  UniqueSerialNo: string;
  TransBy: string;
  TransDate: string;
  WarrentyStatus: string;
}

interface SearchFilters {
  CustomerName: string;
  HardwareType: string;
  Make: string;
  Model: string;
}
interface dropdownsOptions {
  value: string;
  label: string;
}

const RePrintHardWareTraking: React.FC = () => {
  const token = Cookies.get("token");
  const { toast } = useToast();

  // Customer dropdown data
  const [customerNames, setCustomerNames] = useState<
    { CustomerName: string }[]
  >([]);
  const [customerAddress, setCustomerAddress] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [printerOptions, setPrinterOptions] = useState<dropdownsOptions[]>([]);

  // Table data
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);

  // Selection states
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    CustomerName: "",
    HardwareType: "",
    Make: "",
    Model: "",
  });

  // Print form states
  const [showPrintForm, setShowPrintForm] = useState(false);
  const [printReason, setPrintReason] = useState("");
  const [printQuantity, setPrintQuantity] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState("");

  // Pagination and search
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCustomerAddresses();
        await getPrinterDetails();
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const getPrinterDetails = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-printer-name`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const printers = response.data.Data.map((printer: any) => ({
        label: printer.Printer_Name,
        value: `${printer.Printer_ip}:${printer.Printer_port}`, // <-- value to send
      }));

      setPrinterOptions(printers);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch customer details
  const fetchCustomerAddresses = async () => {
    try {
      var data = {
        CustomerName: searchFilters.CustomerName,
        HardwareType: searchFilters.HardwareType,
        Make: searchFilters.Make,
        Model: searchFilters.Model,
        FromDate: format(fromDate, "yyyy-MM-dd"),
        ToDate: format(toDate, "yyyy-MM-dd"),
      };
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-hardware-tracking-details`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Status === "T" && Array.isArray(response.data.Data)) {
        setData(response.data.Data);

        // Extract unique customer names
        const uniqueCustomers = Array.from(
          new Set(
            response.data.Data.map((item: TableData) => item.CustomerName)
          )
        ).map((name) => ({ CustomerName: name as string }));

        setCustomerNames(uniqueCustomers);

        // Extract unique customer addresses
        const uniqueAddresses = Array.from(
          new Set(
            response.data.Data.map((item: TableData) => item.CustomerAddress)
          )
        );

        setCustomerAddress(uniqueAddresses as string[]);
      } else {
        setData([]);
        setCustomerNames([]);
        setCustomerAddress([]);
      }
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setData([]);
      setCustomerNames([]);
      setCustomerAddress([]);
    }
  };

  // Handle search/filter
  const handleSearch = async () => {
    setLoading(true);
    try {
      await fetchCustomerAddresses();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setData([]);
    setSelectedRows([]);
    setSelectAll(false);
    setShowPrintForm(false);
    setSearchFilters({
      CustomerName: "",
      HardwareType: "",
      Make: "",
      Model: "",
    });
  };

  // Handle row selection
  const handleRowSelect = (index: number, id: number) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === data.length);
    setShowPrintForm(newSelectedRows.length > 0);

    // Reset print form when no rows selected
    if (newSelectedRows.length === 0) {
      setPrintReason("");
      setPrintQuantity("");
      setSelectedPrinter("");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setShowPrintForm(false);
      setPrintReason("");
      setPrintQuantity("");
      setSelectedPrinter("");
    } else {
      const allIds = data.map((item) => item.ID);
      setSelectedRows(allIds);
      setShowPrintForm(true);
    }
    setSelectAll(!selectAll);
  };

  // Handle print
const handlePrint = async () => {
    if (!printReason || !printQuantity || !selectedPrinter) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill all required fields (Reason, Quantity, Printer)",
        });
        return;
    }

    if (selectedRows.length === 0) {
        toast({
            variant: "destructive",
            title: "No Selection",
            description: "Please select at least one item to print",
        });
        return;
    }

    const selectedData = data.filter((item) => selectedRows.includes(item.ID));

    const requestData = {
        printReason,
        printQuantity,
        selectedPrinter,
        selectedData,
        reprintBy: getUserID() // You can get this from user context/auth
    };


    try {
        // Show loading toast
        toast({
            title: "Processing...",
            description: "Preparing labels for printing...",
        });

        const response = await fetch(BACKEND_URL+'/api/master/hardware-reprint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.Status === 'T') {
            toast({
                title: "Print Successful",
                description: result.Message,
            });
            
            // Optional: Log details
            if (result.Details) {
                console.log("Print Details:", result.Details);
            }
            
            // Optional: Clear selections after successful print
            setSelectedRows([]);
            setPrintReason('');
            setPrintQuantity('');
            
        } else {
            toast({
                variant: "destructive",
                title: "Print Failed",
                description: result.Message || "Unknown error occurred",
            });
        }

    } catch (error) {
        console.error("Print error:", error);
        toast({
            variant: "destructive",
            title: "Network Error",
            description: "Failed to connect to the server. Please try again.",
        });
    }
};

  // Filter and pagination logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchableFields = [
        item.CustomerName,
        item.CustomerAddress,
        item.HardwareType,
        item.Make,
        item.Model,
        item.SerialNo,
        item.WarrentyStatus,
      ];
      return searchableFields.some((field) => {
        return (
          field &&
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleTableSearch = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  return (
    <>
      {/* Search Form Card */}
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>
            Re-Print HardWare Tracking{" "}
            <span className="font-normal text-sm text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="CustomerName">Customer Name</Label>
                <Input
                  id="CustomerName"
                  value={searchFilters.CustomerName}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      CustomerName: e.target.value,
                    }))
                  }
                  placeholder="Enter Customer Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="HardwareType">Hardware Type</Label>
                <Input
                  id="HardwareType"
                  value={searchFilters.HardwareType}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      HardwareType: e.target.value,
                    }))
                  }
                  placeholder="Enter Hardware Type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Make">Make</Label>
                <Input
                  id="Make"
                  value={searchFilters.Make}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      Make: e.target.value,
                    }))
                  }
                  placeholder="Enter Make"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Model">Model</Label>
                <Input
                  id="Model"
                  value={searchFilters.Model}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      Model: e.target.value,
                    }))
                  }
                  placeholder="Enter Model"
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
                      {fromDate ? (
                        format(fromDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
                      {toDate ? (
                        format(toDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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

            <div className="flex justify-end space-x-2">
              <Button onClick={handleSearch} type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Print Form Card - Only shows when rows are selected */}
      {showPrintForm && (
        <Card className="w-full mt-5 mx-auto">
          <CardHeader>
            <CardTitle>
              Print Configuration
              <span className="font-normal text-sm text-muted-foreground ml-2">
                ({selectedRows.length} items selected)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printReason">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="printReason"
                  value={printReason}
                  onChange={(e) => setPrintReason(e.target.value)}
                  placeholder="Enter reason for reprint"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="printQuantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="printQuantity"
                  type="number"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="printerName">
                  Printer Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPrinter}
                  onValueChange={setSelectedPrinter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Printer" />
                  </SelectTrigger>
                  <SelectContent>
                    {printerOptions.map((printer) => (
                      <SelectItem key={printer.value} value={printer.value}>
                        {printer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handlePrint} className="w-32">
                Print
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table Card */}
      {data.length > 0 ? (
        <>
          <Card className="w-full mt-5 mx-auto">
            <CardContent>
              <div className="mt-8">
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
                    <TableSearch onSearch={handleTableSearch} />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          disabled={data.length === 0}
                        />
                      </TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Customer Address</TableHead>
                      <TableHead>Hardware Type</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Warranty Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          <div className="flex justify-center items-center h-64">
                            <Oval
                              height={40}
                              width={40}
                              color="#4fa94d"
                              visible={true}
                              ariaLabel="oval-loading"
                              secondaryColor="#4fa94d"
                              strokeWidth={2}
                              strokeWidthSecondary={2}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((row, index) => (
                        <TableRow key={row.ID}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(row.ID)}
                              onCheckedChange={() =>
                                handleRowSelect(index, row.ID)
                              }
                            />
                          </TableCell>
                          <TableCell>{row.CustomerName}</TableCell>
                          <TableCell>{row.CustomerAddress}</TableCell>
                          <TableCell>{row.HardwareType}</TableCell>
                          <TableCell>{row.Make}</TableCell>
                          <TableCell>{row.Model}</TableCell>
                          <TableCell>{row.SerialNo}</TableCell>
                          <TableCell>{row.Qty}</TableCell>
                          <TableCell>{row.WarrentyStatus}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Component */}
                <div className="flex justify-between items-center text-sm md:text-md mt-4">
                  <div>
                    {filteredData.length > 0
                      ? `Showing ${
                          (currentPage - 1) * itemsPerPage + 1
                        } to ${Math.min(
                          currentPage * itemsPerPage,
                          filteredData.length
                        )} of ${filteredData.length} entries`
                      : "No entries to show"}
                  </div>
                  {filteredData.length > 0 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 &&
                              pageNumber <= currentPage + 1)
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
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* this to data not found showing */}
          <Card className="w-full mt-5 mx-auto">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-lg font-semibold text-gray-600">
                  No data found
                </h2>
                <p className="text-gray-500">
                  No records found for the selected date range.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default RePrintHardWareTraking;
