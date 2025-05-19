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
import { Oval } from "react-loader-spinner";
import{ BACKEND_URL,getBasicToken,getHeaderToken } from "@/lib/constants";
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
import { Loader, PrinterCheck } from "lucide-react";
import CustomDropdown from "../CustomDropdown";
/**
|--------------------------------------------------
| "id": 2,
        "printer_name": "HP LaserJet 1020",
        "printer_ip": "192.168.1.100",
        "printer_port": "9100",
        "status": "Active",
        "create_by": "Admin",
        "create_at": "2025-03-01T23:14:10.000Z",
        "update_by": null,
        "update_at": null
|--------------------------------------------------
*/
interface TableData {
  Id: string;
  Printer_Name: string;
 // label_size:string;
  Printer_ip: string;
  Printer_port: string;
  Status: string;
  Create_by: string;
  Create_at: string;
  Update_by: string;
  Update_at: string;
  //plant_code: string;
}
interface PlantOption {
  value: string;
  label: string;
}

const PrinterMaster = () => {
  const { toast } = useToast();
  const [id, setId] = useState<string>("");
  const [printerName, setPrinterName] = useState<string>("");
  const [printerIP, setPrinterIP] = useState<string>("");
  const [printerPort, setPrinterPort] = useState<string>("");
  const [data, setData] = useState<TableData[]>([]);
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [PlantCode, setPlantCode] = useState<string>("");

  const [status, setStatus] = useState("active");
  const [size, setSize] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [printerLoaderCheck, setPrinterLoaderCheck] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const printerNameRef = useRef<HTMLInputElement>(null);
  const printerIPRef = useRef<HTMLInputElement>(null);
  const printerPortRef = useRef<HTMLInputElement>(null);

  
  // const plant = getUserPlantCode() 
  // IPv4 & IPv6 validation regex
  const ipRegex =
    /^(?:(?:\d{1,3}\.){3}\d{1,3}|([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4})$/;

  useEffect(() => {
    const fetchData = async () => {
      fatchTableData();
      fatchPlantCode();
     
    };
    fetchData();
  }, []);
  const fatchTableData = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-printer`,{}
      );
      setData(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error in fetching data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  
  const fatchPlantCode = async () => {
    try {
      const NewData = {};
      const response = await fetch(
        `${BACKEND_URL}/api/administrator/getPlantCode`,getBasicToken()
      );
      const data: { PlantCode: string }[] = await response.json();
      setPlantOptions(
        data.map((item) => ({ value: item.PlantCode, label: item.PlantCode }))
      );
    } catch (error: any) {
      console.error("Error fetching plant names:", error);
      logError(
        "Error fetching plant names",
        error,
        "UserMaster-fetchPlantNames",
        getUserID()
      );
    }
  };

  const handlePlantChange = (value: string) => {
    setPlantCode(value);
  };

 const handlePrinterCheck = async (index: number) => {
  const selectedData = data[index];
  setLoadingIndex(index); // Start loader for the button

  try {
    const dataBody = {
      ip: selectedData.Printer_ip,
      port: selectedData.Printer_port,
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/master/ping-printer`,
      dataBody,
      getHeaderToken()
    );

    if (response.data.status === true) {
      toast({
        title: "Printer Available",
        description: response.data.message,
        variant: "default",
      });
    } else {
      toast({
        title: "Printer Not Available",
        description: response.data.message,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error in fetching printer status",
      variant: "destructive",
    });
  } finally {
    setLoadingIndex(null); // Stop loader
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrinterIP(value);

    if (!ipRegex.test(value)) {
      setError("Invalid IP address format");
    } else {
      setError("");
    }
  };

  const handleRowSelect = (index: number) => {
    const selectedData = data[index];
    setId(selectedData.Id);
    setPrinterName(selectedData.Printer_Name);
   // setSize(selectedData.label_size)
    setPrinterIP(selectedData.Printer_ip);
    setPrinterPort(selectedData.Printer_port);
    setStatus(selectedData.Status);
   // setPlantCode(selectedData.Plant_code);
    setIsUpdateMode(true);
   
  };

  const handleCancel = () => {
    setIsUpdateMode(false);
    setId("");
    setPrinterName("");
    setSize("Select size");
    setPrinterIP("");
    setPrinterPort("");
    setStatus("active");
    setError("");
    setPlantCode("");
    
  };
const handleSave = async () => {
  if (error) {
    toast({
      title: "Error",
      description: "Invalid IP address format",
      variant: "destructive",
    });
    return;
  }
  if (!printerName || !printerIP || !printerPort) {
    toast({
      title: "Error",
      description: "Please fill all the fields",
      variant: "destructive",
    });
    return;
  }
  try {
    const data = {
      Printer_Name: printerName,
      Printer_ip: printerIP,
      Printer_port: printerPort,
      Status: status,
      Create_by: getUserID(),
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/master/insert-printer`,
      data,
      getHeaderToken()  // Make sure this returns { headers: {...} }
    );

    // Corrected response handling here:
    if (response.data.Status === "T") {
      toast({
        title: "Success",
        description: response.data.Message,
      });
      fatchTableData();
      handleCancel();
    } else if (response.data.Status === "F") {
      toast({
        title: "Error",
        description: response.data.Message,
        variant: "destructive",
      });
    }
  } catch (error) {
    console.log(error);
    toast({
      title: "Error",
      description: "Error in saving data Server!!",
      variant: "destructive",
    });
  }
};


 const handleUpdate = async () => {
  if (error) {
    toast({
      title: "Error",
      description: "Invalid IP address format",
      variant: "destructive",
    });
    return;
  }

  if (!printerName || !printerIP || !printerPort) {
    toast({
      title: "Error",
      description: "Please fill all the fields",
      variant: "destructive",
    });
    return;
  }

  try {
    const data = {
      Id: id,
      Printer_Name: printerName,
      Printer_ip: printerIP,
      Printer_port: printerPort,
      Status: status,
      Update_by: getUserID(),
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/master/update-printer`,
      data,
      getHeaderToken()
    );

    if (response.data.Status === "T") {
      toast({
        title: "Success",
        description: response.data.Message,
      });
      handleCancel();
      fatchTableData();
    } else {
      toast({
        title: "Error",
        description: response.data.Message || "Failed to update printer details.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Update error:", error);
    toast({
      title: "Error",
      description: "Error in saving data to server!",
      variant: "destructive",
    });
  }
};


  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchableFields: (keyof TableData)[] = [
        "Printer_Name",
        "Printer_ip",
       // "label_size",
        "Printer_port",
        "Status",
        "Create_by",
        "Create_at",
        "Update_by",
        "Update_at",
      ];
      return searchableFields.some((key) => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1); // Reset to first page when searching
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
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>
            Printer Master{" "}
            <span className="font-normal text-sm text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* <div className="space-y-2">
                <Label htmlFor="PlantCode">Plant code <span className="text-red-500">*</span></Label>
                <CustomDropdown
                  options={plantOptions}
                  value={PlantCode}
                  onValueChange={handlePlantChange}
                  placeholder="Select plant code"
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="PrinterName">
                  Printer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={printerNameRef}
                  id="PrinterName"
                  value={printerName}
                  onChange={(e) => setPrinterName(e.target.value)}
                  required
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="Size">
                  Label Size  <span className="text-red-500">*</span>
                </Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4 X 6">4 X 6</SelectItem>
                    <SelectItem value="4 X 8">4 X 8</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="PrinterIP">
                  Printer IP <span className="text-red-500">*</span>
                </Label>
                <Input
                  ref={printerIPRef}
                  id="PrinterIP"
                  //  placeholder="192.168.1.1"
                  value={printerIP}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                  required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="PrinterPort">
                  Printer Port <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  ref={printerPortRef}
                  id="PrinterPort"
                  value={printerPort}
                  onChange={(e) => setPrinterPort(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleSave}
                disabled={isUpdateMode}
                type="submit"
              >
                Save
              </Button>
              <Button onClick={handleUpdate} disabled={!isUpdateMode}>
                Update
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
                <TableSearch onSearch={handleSearch} />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {/* "id": 2,
        "printer_name": "HP LaserJet 1020",
        "printer_ip": "192.168.1.100",
        "printer_port": "9100",
        "status": "Active",
        "create_by": "Admin",
        "create_at": "2025-03-01T23:14:10.000Z",
        "update_by": null,
        "update_at": null */}
                  <TableHead>Action</TableHead>{" "}
                  {/* Empty header for the Select column */}
                  <TableHead>Check</TableHead>
                  {/* <TableHead>Plant Code</TableHead> */}
                  <TableHead>Printer Name</TableHead>
                  {/* <TableHead>Label Size</TableHead> */}
                  <TableHead>Printer IP</TableHead>
                  <TableHead>Printer PORT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
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
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow key={row.Id}>
                      <TableCell>
                        <Button
                          variant={"secondary"}
                          onClick={() => handleRowSelect(index)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePrinterCheck(index)}
                          disabled={loadingIndex === index} // Disable button while loading
                        >
                          {loadingIndex === index ? (
                            <Loader className="animate-spin " />
                          ) : (
                            <PrinterCheck />
                          )}
                        </Button>
                      </TableCell>
                      {/* <TableCell>{row.plant_code ? row.plant_code : "-"}</TableCell> */}
                      <TableCell>{row.Printer_Name}</TableCell>
                      {/* <TableCell>{row.label_size}</TableCell> */}
                      <TableCell>{row.Printer_ip}</TableCell>
                      <TableCell>{row.Printer_port}</TableCell>

                      <TableCell>{row.Status ? row.Status : ""}</TableCell>
                      <TableCell>
                        {row.Create_by ? row.Create_by : "-"}
                      </TableCell>
                      <TableCell>
                        {row.Create_at
                          ? new Date(row.Create_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {row.Update_by ? row.Update_by : "-"}
                      </TableCell>
                      <TableCell>
                        {row.Update_at
                          ? new Date(row.Update_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
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
  );
};

export default PrinterMaster;
