"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomDropdown from '../CustomDropdown';
import { useToast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import axios from 'axios';
import { Checkbox } from '../ui/checkbox';
import { delay } from '@/utills/delay';
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
interface PlantCode {
  PlantCode: string;
}

interface CategoryCode {
  wh_category_code: string;
}

interface WarehouseData {
  id: number;
 PlantCode: string;
  wh_category_code: string;
  wh_code: string;
  wh_desc: string;
  status: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
  //RestrictToCategory: string;

}

interface DropdownOption {
  value: string;
  label: string;
}

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
  return 'Guest';
};

const WarehouseMaster: React.FC = () => {
  const [plantCode, setPlantCode] = useState<string>("");
  const [categoryCode, setCategoryCode] = useState<string>("");
  const [warehouseCode, setWarehouseCode] = useState<string>("");
  const [warehouseDesc, setWarehouseDesc] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [restrictToCategory, setRestrictToCategory] = useState(false);
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);
  const [categoryCodes, setCategoryCodes] = useState<DropdownOption[]>([]);
  const [warehouseData, setWarehouseData] = useState<WarehouseData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [oldData, setOldData] = useState<WarehouseData | null>(null);
  const { toast } = useToast();
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const executeSequentially = async () => {
     // await fetchPlantCodes();
      await delay(50);
  
      await fetchCategoryCodes();
      await delay(50);
  
      await fetchWarehouseData();
      await delay(50);
  
      await insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Master",
        Action: `Warehouse Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: getUserPlant()
      });
    };
  
    executeSequentially();
  }, []);

//   const fetchPlantCodes = async () => {

//     try {
//       const response = await fetch(`${BACKEND_URL}/api/master/get-all-plant-code`);
//       const data: PlantCode[] = await response.json();
//       setPlantCodes(data.map(item => ({ value: item.PlantCode, label: item.PlantCode })));
//     } catch (error) {
//       console.error('Error fetching plant codes:', error);
//       toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
//     }
//   };

  const fetchCategoryCodes = async () => {
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-warehouse-code`);
      const data: CategoryCode[] = await response.json();
      setCategoryCodes(data.map(item => ({ value: item.wh_category_code, label: item.wh_category_code })));
    } catch (error) {
      console.error('Error fetching category codes:', error);
      toast({ title: "Error", description: "Failed to fetch category codes", variant: "destructive" });
    }
  };

  const fetchWarehouseData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-warehouse`);
      
      const data: WarehouseData[] = await response.json();
      setWarehouseData(Array.isArray(data) ? data : []);
    
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      toast({ title: "Error", description: "Failed to fetch warehouse data", variant: "destructive" });
    }
  };
 // Logic for pagination
  
 const filteredData = useMemo(() => {
  return warehouseData.filter(item => {
    const searchableFields: (keyof WarehouseData)[] = [ 'wh_category_code' ,'wh_code' ,'wh_desc' , 'status','updated_by', 'created_by'];
    return searchableFields.some(key => {
      const value = item[key];
      return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
}, [warehouseData, searchTerm]);

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
  if (!categoryCode.trim()) {
    sooner("Please select the category code");
    return;
  }

  if (!warehouseCode.trim()) {
    sooner("Please fill the warehouse code");
    return;
  }

  try {
    const newWarehouseData = {
      WarehouseCategoryCode: categoryCode.trim(),
      WarehouseCode: warehouseCode.trim(),
      WarehouseDesc: warehouseDesc.trim(),
      WHStatus: status.trim(),
      CreatedBy: getUserID()
    };

    const response = await fetch(`${BACKEND_URL}/api/master/insert-warehouse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWarehouseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // ✅ Handle object response properly
    if (result?.Status === 'T') {
      toast({ title: "Success", description: result.Message });
      fetchWarehouseData();
      handleCancel();

      insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Master",
        Action: `New Warehouse Added by ${getUserID()}`,
        NewData: JSON.stringify(newWarehouseData),
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: "" // Add plantCode if required
      });

    } else if (result?.Status === 'F') {
      toast({ title: "Error", description: result.Message, variant: "destructive" });
    } else {
      toast({ title: "Error", description: "Unexpected response from server", variant: "destructive" });
      console.warn("Unexpected response format:", result);
    }

  } catch (error) {
    console.error('Error inserting warehouse:', error);
    toast({ title: "Error", description: "Failed to insert warehouse", variant: "destructive" });
  }
};


const handleUpdate = async () => {
  if (!categoryCode.trim()) {
    sooner("Please select the category code");
    return;
  }

  if (!warehouseCode.trim()) {
    sooner("Please fill the warehouse code");
    return;
  }

  try {
    const updatedWarehouseData = {
      WarehouseCategoryCode: categoryCode.trim(),
      WarehouseCode: warehouseCode.trim(),
      WarehouseDesc: warehouseDesc.trim(),
      WHStatus: status.trim(),
      UpdatedBy: getUserID()
    };

    const response = await fetch(`${BACKEND_URL}/api/master/update-warehouse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWarehouseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Normalize response (handle object or array)
    const data = Array.isArray(result) ? result[0] : result;

    if (data?.Status === 'T') {
      toast({
        title: "Success",
        description: data.Message
      });
      fetchWarehouseData();
      handleCancel();
      insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Master",
        Action: `Warehouse Updated by ${getUserID()}`,
        NewData: JSON.stringify(updatedWarehouseData),
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: ""
      });
    } else if (data?.Status === 'F') {
      toast({
        title: "Error",
        description: data.Message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: "Unexpected response from server",
        variant: "destructive"
      });
      console.warn("Unexpected response format:", result);
    }

  } catch (error) {
    console.error("Error updating warehouse:", error);
    toast({
      title: "Error",
      description: "Failed to update warehouse",
      variant: "destructive"
    });
  }
};


  
  const handleRowSelect = (row: WarehouseData) => {
    setOldData(row);
    //setPlantCode(row.PlantCode);
    setCategoryCode(row.wh_category_code);
    setWarehouseCode(row.wh_code);
    setWarehouseDesc(row.wh_desc);
   // setRestrictToCategory(row.RestrictToCategory === "Y")
    setStatus(row.status);
    setSelectedId(row.id);
    setIsEditing(true);

    insertAuditTrail({
      AppType: "Web",
      Activity: "Warehouse Master",
      Action: `Warehouse Edit Initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(row),
      Remarks: "",
      UserId: getUserID(),
      PlantCode: row.PlantCode
    });
  };

  const handleCancel = () => {
    setPlantCode('');
    setCategoryCode('');
    setWarehouseCode('');
    setWarehouseDesc('');
    setStatus('active');
    setRestrictToCategory(false);
    setIsEditing(false);
    setSelectedId(null);
    setOldData(null);
  };


  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Warehouse Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <CustomDropdown
                  options={plantCodes}
                  value={plantCode}
                  onValueChange={setPlantCode}
                  placeholder="Select plant code..."
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                  disabled={isEditing}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="warehouseCategoryCode">Warehouse Category Code *</Label>
                <CustomDropdown
                  options={categoryCodes}
                  value={categoryCode}
                  onValueChange={setCategoryCode}
                  placeholder="Select category code..."
                  searchPlaceholder="Search category code..."
                  emptyText="No category code found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseCode">Warehouse Code *</Label>
                <Input 
                  id="warehouseCode" 
                  value={warehouseCode} 
                  onChange={(e) => setWarehouseCode(e.target.value)} 
                  required 
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseDescription">Warehouse Description</Label>
                <Input 
                  id="warehouseDescription" 
                  value={warehouseDesc} 
                  onChange={(e) => setWarehouseDesc(e.target.value)}
                />
              </div>
              {/* <div className="flex items-center space-x-2">
              <Checkbox
                  id="restrictToCategory"
                  checked={restrictToCategory}
                  onCheckedChange={(checked) => setRestrictToCategory(checked === true)}
                />
                <Label htmlFor="restrictToCategory">Restrict to Category</Label>
                </div> */}
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
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleSave} disabled={isEditing}>Save</Button>
              <Button onClick={handleUpdate} disabled={!isEditing}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                   <TableHead>Select</TableHead>
                    {/* <TableHead className="text-center">Plant Code</TableHead> */}
                    <TableHead className="text-center">Warehouse Category</TableHead>
                    <TableHead className="text-center">Warehouse Code</TableHead>
                    <TableHead className="text-center">Warehouse Description</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    {/* <TableHead className="text-center">Restrict</TableHead> */}
                    <TableHead className="text-center">Created By</TableHead>
                    <TableHead className="text-center">Created On</TableHead>
                    <TableHead className="text-center">Updated By</TableHead>
                    <TableHead className="text-center">Updated On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(paginatedData) && paginatedData.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell>
                      <Button variant={'ghost'} onClick={() => handleRowSelect(item)}>Select</Button>
                    </TableCell>
                      {/* <TableCell className="text-center">{item.PlantCode}</TableCell> */}
                      <TableCell className="text-center">{item.wh_category_code}</TableCell>
                      <TableCell className="text-center">{item.wh_code}</TableCell>
                      <TableCell className="text-center">{item.wh_desc}</TableCell>
                      <TableCell className="text-center">{item.status}</TableCell>
                      {/* <TableCell className="text-center">{item.RestrictToCategory==="Y"?"Yes":"No"}</TableCell> */}
                      <TableCell className="text-center">{item.created_by}</TableCell>
                      <TableCell className="text-center">{new Date(item.created_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{item.updated_by}</TableCell>
                      <TableCell className="text-center">{item.updated_date? new Date(item.updated_date).toLocaleDateString(): ""}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WarehouseMaster;
