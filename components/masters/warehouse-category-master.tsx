"use client";
import React, { useState, useEffect,useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import { BACKEND_URL } from '@/lib/constants';
import insertAuditTrail from '@/utills/insertAudit';
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

interface WarehouseCategoryData {
  id: number;
  wh_category_code: string;
  wh_category_desc: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
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

const WarehouseCategoryMaster: React.FC = () => {
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [data, setData] = useState<WarehouseCategoryData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [oldData, setOldData] = useState<WarehouseCategoryData | null>(null);
// for search and pagination
  const warehouseCategoryCodeRef = useRef<HTMLInputElement>(null);
  const warehouseCategoryDesccRef = useRef<HTMLInputElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);


  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-warehouse-category`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const executeSequentially = async () => {
      await delay(20);
      fetchData();
      await delay(50);
      await insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Category Master",
        Action: `Warehouse Category Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: getUserPlant()
      });
    };
    executeSequentially();
  }, [fetchData]);
  
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof WarehouseCategoryData)[] = ['wh_category_code', 'wh_category_desc', 'updated_by', 'created_by'];
      return searchableFields.some(key => {
        const value = item[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm]);

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

  const handleRowSelect = (row: WarehouseCategoryData) => {
    setCategoryCode(row.wh_category_code);
    setCategoryDesc(row.wh_category_desc);
    setSelectedId(row.id);
    setIsEditing(true);
    setOldData(row);
    insertAuditTrail({
      AppType: "Web",
      Activity: "Warehouse Category Master",
      Action: `Category Edit Initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(row),
      Remarks: "",
      UserId: getUserID(),
      PlantCode: row.wh_category_code
    });
  };

  const handleCancel = () => {
    setCategoryCode('');
    setCategoryDesc('');
    setIsEditing(false);
    setSelectedId(null);
    setOldData(null);
  };

 const handleSave = async () => {
  if (!categoryCode.trim()) {
    warehouseCategoryCodeRef.current?.focus();
    sooner('Please fill the warehouse category code');
    return;
  }
  if (!categoryDesc.trim()) {
    warehouseCategoryDesccRef.current?.focus();
    sooner('Please fill the warehouse category description');
    return;
  }

  try {
    const newCategoryData = {
      WarehouseCategoryCode: categoryCode.trim(),
      WarehouseCategoryDesc: categoryDesc.trim(),
      CreatedBy: getUserID(),
    };

    const response = await axios.post(`${BACKEND_URL}/api/master/insert-warehouse-category`, newCategoryData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200 && response.data.Status === 'T') {
      toast({
        title: "Success",
        description: response.data.Message
      });
      fetchData();
      handleCancel();
      insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Category Master",
        Action: `New Category Added by ${getUserID()}`,
        NewData: JSON.stringify(newCategoryData),
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: categoryCode
      });
    } else if (response.data.Status === 'F') {
      toast({
        title: "Error",
        description: response.data.Message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to insert data",
        variant: "destructive"
      });
    }
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.response?.data?.error || error.message;
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
  }
};


 const handleUpdate = async () => {
  if (!selectedId || !oldData) return;

  if (!categoryCode.trim()) {
    warehouseCategoryCodeRef.current?.focus();
    sooner('Please fill the warehouse category code');
    return;
  }

  if (!categoryDesc.trim()) {
    warehouseCategoryDesccRef.current?.focus();
    sooner('Please fill the warehouse category description');
    return;
  }

  try {
    const updatedCategoryData = {
      WarehouseCategoryCode: categoryCode.trim(),    // must match API/SP param name
      WarehouseCategoryDesc: categoryDesc.trim(),    // must match API/SP param name
      UpdatedBy: getUserID(),                         // must match API/SP param name
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/master/update-warehouse-category`,
      updatedCategoryData,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 200 && response.data.Status === 'T') {
      toast({
        title: "Success",
        description: response.data.Message || "Category updated successfully",
      });

      fetchData();
      handleCancel();

      const changedFields: string[] = [];
      if (oldData.wh_category_desc !== categoryDesc)
        changedFields.push(`Category Desc: ${oldData.wh_category_desc} -> ${categoryDesc}`);

      insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Category Master",
        Action: `Category Updated by ${getUserID()}`,
        NewData: changedFields.join(", "),
        OldData: JSON.stringify(oldData),
        Remarks: "",
        UserId: getUserID(),
        PlantCode: categoryCode,
      });
    } else {
      throw new Error(response.data.Message || 'Failed to update category');
    }
  } catch (error: any) {
    console.error('Error updating data:', error);
    const errorMessage = error.response?.data?.error || error.message || "Failed to update category";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};


  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Warehouse Category Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryCode">Warehouse Category Code *</Label>
                <Input 
                  id="categoryCode" 
                  value={categoryCode} 
                  onChange={(e) => setCategoryCode(e.target.value)} 
                  required 
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDesc">Warehouse Category Desc *</Label>
                <Input 
                  id="categoryDesc" 
                  value={categoryDesc} 
                  onChange={(e) => setCategoryDesc(e.target.value)} 
                  required 
                />
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
               

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>WH Category Code</TableHead>
                  <TableHead>WH Category Desc</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(paginatedData) && paginatedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button variant={'ghost'} onClick={() => handleRowSelect(row)}>Select</Button>
                    </TableCell>
                    <TableCell>{row.wh_category_code}</TableCell>
                    <TableCell>{row.wh_category_desc}</TableCell>
                    <TableCell>{row.created_by}</TableCell>
                    <TableCell>{row.created_date? new Date(row.created_date).toLocaleDateString(): ""}</TableCell>
                    <TableCell>{row.updated_by}</TableCell>
                    <TableCell>{row.updated_date? new Date(row.updated_date).toLocaleDateString():""}</TableCell>
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

export default WarehouseCategoryMaster;
