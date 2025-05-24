"use client";
import React, { useState, useEffect ,useMemo, useCallback,useRef} from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomDropdown from '../CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import generateUniqueCode from '@/lib/uniqueCode';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import { delay } from '@/utills/delay';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MultiSelect } from '../multi-select';
import { getUserPlant } from '@/utills/getFromSession';
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
interface WarehouseCode {
  wh_code: string;
}


interface DropdownOption {
  value: string;
  label: string;
}

interface WarehouseLocation {
  ID: number;
//   CompanyCode: string;
//   PlantCode: string;
  wh_code: string;
  location: string;
  rack: string;
  bin: string;
  unique_code: string;
  //DisplayCode: string | null;
  status: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
//   WH_Category_Code: string;
//   Height: string;
//   Width: string;
//   UOM: string;
//   Length: string;
//   Capacity: string;
//   RestrictToMaterial: string;
}

interface UnitCode {
  Unit: string;
}

interface MatCode {
  MatCode: string;
}
const WarehouseLocationMaster: React.FC = () => {
  const [warehouseValue, setWarehouseValue] = useState("");
  const [warehouseCodes, setWarehouseCodes] = useState<WarehouseCode[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [location, setLocation] = useState("");
  const [rack, setRack] = useState("");
  const [bin, setBin] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("active");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [oldData, setOldData] = useState<WarehouseLocation | null>(null);
  const [units, setUnits] = useState<DropdownOption[]>([]);
  const [matCode, SetMatCode] = useState<DropdownOption[]>([]);
  const [restrictMatCode, setRestrictMatCode] = useState<string[]>([]);
  const { toast } = useToast();

 const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
 const [height, setHeight] = useState("");
 const [width, setWidth] = useState("");
 const [uom, setUom] = useState("");
 const [length, setLength] = useState("");
 const [capacity, setCapacity] = useState("");
 const [restrictToMaterial, setRestrictToMaterial] = useState("");
// for search and pagination
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const locationRef = useRef<HTMLInputElement>(null);
const rackRef = useRef<HTMLInputElement>(null);
const uniqueCodeRef = useRef<HTMLInputElement>(null);
 
//  const fetchUnitCode = async () => {
//   try {
//     const response = await fetch(`${BACKEND_URL}/api/master/all-uom-unit`);
//     const data: UnitCode[] = await response.json();
//     setUnits(data.map(item => ({ value: item.Unit, label: item.Unit })));
//   } catch (error) {
//     console.error('Error fetching plant codes:', error);
//     toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
//   }
// };

// const fetchMatCode = async () => {
//   try {
//     const response = await fetch(`${BACKEND_URL}/api/master/get-all-mat-code`);
//     const data: MatCode[] = await response.json();
//     SetMatCode(data.map(item => ({ value: item.MatCode, label: item.MatCode })));
//   } catch (error) {
//     console.error('Error fetching plant codes:', error);
//     toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
//   }
// };

  // Function to get User_ID from the JWT token
  const getUserID = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.User_ID;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return '';
  };

  useEffect(() => {
    const fetchDataSequentially = async () => {

    //   await fetchUnitCode();
    //   await delay(50);
    //   await fetchMatCode();
    //   await delay(50);
      
      await fetchWarehouseCodes();
      await delay(50);
      
      await fetchLocations();
      await delay(50);
      
      // Insert audit trail for page load
      await insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Location Master",
        Action: `Warehouse Location Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: getUserPlant()
      });
    };
    fetchDataSequentially();
  }, []);

 const fetchWarehouseCodes = async () => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/master/get-all-active-wh`, {
      // You can send a payload here if required by your backend.
      // For example: PlantCode, CompanyCode, filters, etc.
    });

    if (response.status === 200) {
      setWarehouseCodes(response.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to fetch warehouse codes",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch warehouse codes",
      variant: "destructive",
    });
  }
};


  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-wh-location`);
      if (response.status === 200) {
        setLocations(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch warehouse locations",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch warehouse locations",
        variant: "destructive",
      });
    }
  };

    // Logic for pagination
  
    const filteredData = useMemo(() => {
      return locations.filter(item => {
       const searchableFields: (keyof WarehouseLocation)[] = ['wh_code','location','rack','bin','unique_code','status','created_by','updated_by'];

        return searchableFields.some(key => {
          const value = item[key];
          return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }, [locations, searchTerm]);
    
    const paginatedData = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);
    
    const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);
    
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
    

 const handleSave = async () => {
  if (!warehouseValue.trim()) {
    sooner(`Please select a warehouse`);
    return;
  } else if (!location.trim()) {
    locationRef.current?.focus();
    sooner(`Please enter a location`);
    return;
  } else if (!rack.trim()) {
    rackRef.current?.focus();
    sooner(`Please enter a rack`);
    return;
  } else if (!uniqueCode.trim()) {
    uniqueCodeRef.current?.focus();
    sooner(`Please generate a unique code`);
    return;
  } else if (!status.trim()) {
    sooner(`Please select a status`);
    return;
  }

  const userID = getUserID();
  if (!userID) {
    toast({
      title: "Error",
      description: "Failed to retrieve user ID",
      variant: "destructive",
    });
    return;
  }

  // Align keys with backend's expected input
  const newLocationData = {
    Warehouse_Code: warehouseValue.trim(),
    Location: location.trim(),
    Rack: rack.trim(),
    Bin: bin.trim(),
    Unique_Code: uniqueCode.trim(),
    LStatus: status.trim(),
    CreatedBy: userID.trim(),
  };

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/master/insert-warehouse-location`,
      newLocationData
    );

    if (response.status === 200 && response.data?.Status) {
      const responseData = response.data;

      if (responseData.Status === "T") {
        toast({
          title: "Success",
          description: responseData.Message || "Warehouse location added successfully",
        });

        fetchLocations();
        resetForm();

        insertAuditTrail({
          AppType: "Web",
          Activity: "Warehouse Location Master",
          Action: `Warehouse Location Added by ${userID}`,
          NewData: JSON.stringify(newLocationData),
          OldData: "",
          Remarks: "",
          UserId: userID,
          PlantCode: ""
        });

      } else if (responseData.Status === "F") {
        toast({
          title: "Error",
          description: responseData.Message || "Failed to save warehouse location",
          variant: "destructive",
        });
      }

    } else {
      toast({
        title: "Error",
        description: "Unexpected response from server",
        variant: "destructive",
      });
    }

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save warehouse location",
      variant: "destructive",
    });
    console.error("Save error:", error);
  }
};


 const handleUpdate = async () => {
  if (!selectedLocation) return;

  if (!warehouseValue.trim()) {
    sooner(`Please select a warehouse`);
    return;
  } else if (!location.trim()) {
    locationRef.current?.focus();
    sooner(`Please enter a location`);
    return;
  } else if (!rack.trim()) {
    rackRef.current?.focus();
    sooner(`Please enter a rack`);
    return;
  } else if (!uniqueCode.trim()) {
    uniqueCodeRef.current?.focus();
    sooner(`Please generate a unique code`);
    return;
  } else if (!status.trim()) {
    sooner(`Please select a status`);
    return;
  }

  const userID = getUserID();
  if (!userID) {
    toast({
      title: "Error",
      description: "Failed to retrieve user ID",
      variant: "destructive",
    });
    return;
  }

  const updatedLocationData = {
    Warehouse_Code: warehouseValue.trim(),
    Location: location.trim(),
    Rack: rack.trim(),
    Bin: bin.trim(),
    Unique_Code: uniqueCode.trim(),
    LStatus: status.trim(),
    UpdatedBy: userID.trim(),
  };

  try {
    const response = await axios.post(`${BACKEND_URL}/api/master/update-warehouse-location`, updatedLocationData);

    const responseData = response.data;

    if (response.status === 200 && responseData.Status === "T") {
      toast({
        title: "Success",
        description: responseData.Message || "Warehouse location updated successfully",
      });

      fetchLocations();
      resetForm();
      setIsUpdating(false);

      insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Location Master",
        Action: `Warehouse Location Updated by ${userID}`,
        NewData: JSON.stringify(updatedLocationData),
        OldData: oldData ? JSON.stringify(oldData) : "",
        Remarks: "",
        UserId: userID,
        PlantCode: "",
      });
    } else {
      toast({
        title: "Error",
        description: responseData.Message || "Failed to update warehouse location",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update warehouse location",
      variant: "destructive",
    });
  }
};


  

  const handleUniqueCodeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const generatedCode = generateUniqueCode();
    e.currentTarget.value = generatedCode;
    setUniqueCode(generatedCode);
  };

  const resetForm = () => {
    isUpdating && setIsUpdating(false);
    setWarehouseValue("");
    setLocation("");
    setRack("");
    setBin("");
    setUniqueCode("");
    setStatus("active");
    setSelectedLocation(null);
    setOldData(null);
    
    setHeight("");
    setWidth("");
    setUom("");
    setLength("");
    setCapacity("");
    setRestrictMatCode([]);
    setShowAdditionalDetails(false);
  };

  const handleRowClick = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setOldData(location);
    setWarehouseValue(location.wh_code);
    setLocation(location.location);
    setRack(location.rack);
    setBin(location.bin || "");
    setUniqueCode(location.unique_code);
    setStatus(location.status);
    // setHeight(location.Height || "");
    // setWidth(location.Width || "");
    // setUom(location.UOM || "");
    // setLength(location.Length || "");
    // setCapacity(location.Capacity || "");
    // setRestrictMatCode(location.RestrictToMaterial?.split(',') || null);
    setIsUpdating(true);
   // const hasAdditionalData = location.Height==='' && location.Width==='' && location.UOM==='' && location.Length==='' && location.Capacity===''&& location.RestrictToMaterial==='';
    // setShowAdditionalDetails(!hasAdditionalData);
 
    insertAuditTrail({
      AppType: "Web",
      Activity: "Warehouse Location Master",
      Action: `Warehouse Location Edit Initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(location),
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
  };

const warehouseOptions = Array.isArray(warehouseCodes)
  ? warehouseCodes.map(code => ({
      value: code.wh_code,
      label: code.wh_code,
    }))
  : [];

  return (
    <>
       <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Warehouse Location Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span> </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse Code *</Label>
                <CustomDropdown
                  options={warehouseOptions}
                  value={warehouseValue}
                  onValueChange={setWarehouseValue}
                  placeholder="Select warehouse..."
                  searchPlaceholder="Search warehouse..."
                  emptyText="No warehouse found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" required ref={locationRef} value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack">Rack *</Label>
                <Input id="rack" required value={rack} ref={rackRef} onChange={(e) => setRack(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin">Bin </Label>
                <Input id="bin" value={bin} onChange={(e) => setBin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueCode">Unique Code *</Label>
                <Input 
                  id="uniqueCode" 
                  value={uniqueCode} 
                  ref={uniqueCodeRef}
                  onFocus={handleUniqueCodeFocus} 
                  onChange={(e) => setUniqueCode(e.target.value)} 
                  disabled={isUpdating} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
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
              {/* <div className="space-y-2 flex items-end">
                <Button
                    className="border border-x-red-500 border-y-blue-600 button-transition"
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                >
                    {showAdditionalDetails ? (
                        <>
                            Hide <ChevronDown className={`ml-1 icon-transition ${showAdditionalDetails ? 'rotate-180' : ''}`} />
                        </>
                    ) : (
                        <>
                            Add more details <ChevronDown className={`ml-1 icon-transition ${showAdditionalDetails ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </Button>
              </div> */}
            </div>

            {showAdditionalDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uom">UOM</Label>
                  <CustomDropdown
                      options={units}
                      value={uom}
                      onValueChange={setUom}
                      placeholder="Select UOM..."
                      searchPlaceholder="Search UOM..."
                      emptyText="No UOM found."
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input id="length" type="number" value={length} onChange={(e) => setLength(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restrictToMaterial">Restrict to material</Label>
                  <MultiSelect
                  className='w-full'
                  options={matCode}
                  onValueChange={(value: string[]) => setRestrictMatCode(value)}
                  defaultValue={restrictMatCode}
                  placeholder="Select Material Code"
                  variant="inverted"
                />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleSave} disabled={isUpdating}>Save</Button>
              <Button type="button" onClick={handleUpdate} disabled={!isUpdating}>Update</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full mx-auto mt-10">
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
                    <TableHead>Select</TableHead>
                    {/* <TableHead>Company Code</TableHead>
                    <TableHead>Plant Code</TableHead> */}
                    <TableHead>Warehouse Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rack</TableHead>
                    <TableHead>Unique Code</TableHead>
                    <TableHead>Bin</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead>WH Category Code</TableHead> */}
                    <TableHead>Created by</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead>Updated by</TableHead>
                    <TableHead>Updated On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(paginatedData) && paginatedData.map((location) => (
                    <TableRow key={location.ID}>
                        <TableCell>
                        <Button variant="ghost" onClick={() => handleRowClick(location)}>Select</Button>
                        </TableCell>
                        {/* <TableCell>{location.CompanyCode }</TableCell>
                        <TableCell>{location.PlantCode}</TableCell> */}
                        <TableCell>{location.wh_code}</TableCell>
                        <TableCell>{location.location}</TableCell>
                        <TableCell>{location.rack}</TableCell>
                        <TableCell>{location.unique_code}</TableCell>
                        <TableCell>{location.bin}</TableCell>
                        <TableCell>{location.status}</TableCell>
                        {/* <TableCell>{location.WH_Category_Code }</TableCell> */}
                        <TableCell>{location.created_by}</TableCell>
                        <TableCell>{new Date(location.created_date).toLocaleDateString()}</TableCell>
                        <TableCell>{location.updated_by || ''}</TableCell>
                        <TableCell>{location.updated_date ? new Date(location.updated_date).toLocaleDateString() : ''}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>

             {/* Pagination Component */}
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WarehouseLocationMaster;
