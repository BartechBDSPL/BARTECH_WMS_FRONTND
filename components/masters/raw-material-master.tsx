"use client"
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Oval } from 'react-loader-spinner';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import Cookies from 'js-cookie';
import TableSearch from '@/utills/tableSearch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ExcelExport from '@/components/common/ExcelExport';
import ExcelImport from '@/components/common/ExcelImport';

interface RawMaterialData {
  RawMatCode: string;
  RawMatDes: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}

const RawMaterialMaster: React.FC = () => {
  const [materialCode, setMaterialCode] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [data, setData] = useState<RawMaterialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [oldData, setOldData] = useState<RawMaterialData | null>(null);
  const { toast } = useToast();
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token  = Cookies.get('token');
  const [importLoading, setImportLoading] = useState(false);

  const materialCodeRef = useRef<HTMLInputElement>(null);
  const materialDescriptionRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/master/get-all-raw-material`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response: any) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: "Failed to fetch details",
          description: `Try again`,
        });
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof RawMaterialData)[] = ['RawMatCode', 'RawMatDes', 'CreatedBy', 'CreatedDate', 'UpdatedBy', 'UpdatedDate'];
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

  const handleSave = () => {
    if (!materialCode.trim()) {
      sooner(`Please fill Material Code`);
      materialCodeRef.current?.focus();
      return;
    }
    if(!materialDescription.trim()){
      sooner(`Please fill Material Description`);
      materialDescriptionRef.current?.focus();
      return;
    }

    const newData = {
      RawMatCode: materialCode.trim(),
      RawMatDes: materialDescription.trim(),
      CreatedBy: "admin"
    };

    axios.post(`${BACKEND_URL}/api/master/insert-raw-material`, newData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      const responseData = response.data;
      if (responseData.Status === "F") {
        toast({
          variant: 'destructive',
          title: "Error",
          description: responseData.Message,
        });
      } else if (responseData.Status === "T") {
        toast({
          title: "Details inserted successfully",
          description: `Details added for ${materialCode}`,
        });
        fetchData();
        handleCancel();
      }
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.error || error.message;
      toast({
        variant: 'destructive',
        title: "Error",
        description: errorMessage,
      });
    });
  };

  const handleUpdate = () => {
    if (!oldData) return;
    if (!materialDescription.trim()) {
      sooner(`Please fill Material Description`);
      materialDescriptionRef.current?.focus();
      return;
    }

    const updatedData = {
      RawMatCode: oldData.RawMatCode,
      RawMatDes: materialDescription.trim(),
      UpdatedBy: "admin"
    };

    axios.post(`${BACKEND_URL}/api/master/edit-raw-material`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      const responseData = response.data;
      if (responseData.Status === "F") {
        toast({
          variant: 'destructive',
          title: "Error",
          description: responseData.Message,
        });
      } else if (responseData.Status === "T") {
        toast({
          title: "Details updated successfully",
          description: `Details updated for ${materialCode}`,
        });
        fetchData();
        handleCancel();
      }
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.error || error.message;
      toast({
        variant: 'destructive',
        title: "Failed to update details",
        description: errorMessage,
      });
    });
  };

  const handleCancel = () => {
    setMaterialCode('');
    setMaterialDescription('');
    setIsUpdateMode(false);
    setOldData(null);
  };

  const handleRowSelect = (code: string) => {
    const selectedData = data.find((item) => item.RawMatCode === code);
    if (selectedData) {
      setOldData(selectedData);
      setMaterialCode(selectedData.RawMatCode);
      setMaterialDescription(selectedData.RawMatDes);
      setIsUpdateMode(true);
    }
  };

  const handleExcelImport = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('UpdatedBy', 'admin'); // Add the user info

    setImportLoading(true);
    
    axios.post(`${BACKEND_URL}/api/master/upload-raw-materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      const result = response.data;
      if (result.Status === 'F') {
        toast({
          variant: 'destructive',
          title: "Import Failed",
          description: result.Message,
        });
      } else if (result.Status === 'P') {
        toast({
          variant: 'default',
          title: "Partial Import Success",
          description: result.Message,
        });
        fetchData(); // Refresh data with updated materials
      } else {
        toast({
          title: "Import Successful",
          description: result.Message,
        });
        fetchData(); // Refresh data with updated materials
      }
    })
    .catch((error) => {
      console.error("Import error:", error);
      toast({
        variant: 'destructive',
        title: "Import Failed",
        description: error.response?.data?.Message || "An error occurred during import",
      });
    })
    .finally(() => {
      setImportLoading(false);
    });
  };

  const handleImportSuccess = () => {
    fetchData(); // Refresh data when import is successful
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Raw Material Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
          
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materialCode">Raw Material Code *</Label>
                <Input ref={materialCodeRef} id="materialCode" value={materialCode} onChange={(e) => setMaterialCode(e.target.value)} disabled={isUpdateMode} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialDescription">Raw Material Description *</Label>
                <Input ref={materialDescriptionRef} id="materialDescription" value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} required />
              </div>
            </div>
            <div className='flex justify-between items-center'>
                 <div className="flex items-center gap-4">
              <ExcelImport 
                headers={["Raw Material ID", "Raw Material Description"]}
                onImport={handleExcelImport}
                onSuccess={handleImportSuccess}
                isLoading={importLoading}
              />
            </div>
           
            <div className="flex justify-end space-x-2">
              <Button onClick={handleSave} disabled={isUpdateMode} type="submit">Save</Button>
              <Button onClick={handleUpdate} disabled={!isUpdateMode}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
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
              <div className="flex items-center gap-4">
                <ExcelExport 
                  data={data}
                  headers={{
                    RawMatCode: "Raw Material ID",
                    RawMatDes: "Raw Material Description"
                  }}
                  filename="raw-materials"
                />
                <TableSearch onSearch={handleSearch} />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Material Code</TableHead>
                  <TableHead>Material Description</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated Date</TableHead>
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
                          ariaLabel='oval-loading'
                          secondaryColor="#4fa94d"
                          strokeWidth={2}
                          strokeWidthSecondary={2}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.RawMatCode}>
                      <TableCell>
                        <Button variant={'ghost'} onClick={() => handleRowSelect((row.RawMatCode))}>Edit</Button>
                      </TableCell>
                      <TableCell>{row.RawMatCode}</TableCell>
                      <TableCell>{row.RawMatDes}</TableCell>
                      <TableCell>{row.CreatedBy}</TableCell>
                      <TableCell>{row.CreatedDate ? new Date(row.CreatedDate).toLocaleDateString('en-GB'): ''}</TableCell>
                      <TableCell>{row.UpdatedBy || ''}</TableCell>
                      <TableCell>{row.UpdatedDate ? new Date(row.UpdatedDate).toLocaleDateString('en-GB'): ''}</TableCell>
                    </TableRow>
                  ))
                )}
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

export default RawMaterialMaster;
