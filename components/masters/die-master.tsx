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

interface DieData {
  SrNo: number;
  DieNo: string;
  DieType: string;
  DieDesc: string;
  DieSize: string;
  CreatedBy?: string;
  CreatedDate?: string;
  UpdatedBy?: string | null;
  UpdatedDate?: string | null;
}

const DieMaster: React.FC = () => {
  const [dieNo, setDieNo] = useState('');
  const [dieType, setDieType] = useState('');
  const [dieDesc, setDieDesc] = useState('');
  const [dieSize, setDieSize] = useState('');
  const [data, setData] = useState<DieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSrNo, setSelectedSrNo] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [oldData, setOldData] = useState<DieData | null>(null);
  const { toast } = useToast();
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');
 
  const dieNoRef = useRef<HTMLInputElement>(null);
  const dieTypeRef = useRef<HTMLInputElement>(null);
  const dieDescRef = useRef<HTMLInputElement>(null);
  const dieSizeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/master/get-all-die`, {
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
          title: "Failed to fetch die details",
          description: `Try again`,
        });
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof DieData)[] = ['SrNo', 'DieNo', 'DieType'];
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
    setItemsPerPage(Number(value));``
    setCurrentPage(1);
  }, []);

  const handleSave = () => {
    if (!dieNo.trim()) {
      sooner(`Please fill Die Number`);
      dieNoRef.current?.focus();
      return;
    }
    if(!dieDesc.trim()){
      sooner(`Please fill Die Type`);
      dieDescRef.current?.focus();
      return;
    }
    if(!dieType.trim()){
      sooner(`Please fill Die Type`);
      dieTypeRef.current?.focus();
      return;
    }
    if(!dieSize.trim()){
      sooner(`Please fill Die Size`);
      dieSizeRef.current?.focus();
      return;
    }

    const newData = {
      DieNo: dieNo.trim(),
      DieType: dieType.trim(),
      DieDesc:dieDesc.trim(),
      DieSize: dieSize.trim(),
      CreatedBy: "admin"
    };

    axios.post(`${BACKEND_URL}/api/master/insert-die`, newData, {
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
          title: "Die inserted successfully",
          description: responseData.Message,
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
    if (!selectedSrNo || !oldData) return;
    if (!dieNo.trim()) {
      sooner(`Please fill Die Number`);
      dieNoRef.current?.focus();
      return;
    }
    if(!dieDesc.trim()){
      sooner(`Please fill Die Type`);
      dieDescRef.current?.focus();
      return;
    }
    if(!dieType.trim()){
      sooner(`Please fill Die Type`);
      dieTypeRef.current?.focus();
      return;
    }
    if(!dieSize.trim()){
      sooner(`Please fill Die Size`);
      dieSizeRef.current?.focus();
      return;
    }
    const updatedData = {
      DieNo: dieNo.trim(),
      DieType: dieType.trim(),
      DieDesc:dieDesc.trim(),
      DieSize: dieSize.trim(),
      UpdatedBy: "admin"
    };

    axios.post(`${BACKEND_URL}/api/master/update-die`, updatedData, {
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
          title: "Die updated successfully",
          description: responseData.Message,
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
    setDieNo('');
    setDieDesc('');
    setDieSize('');
    setDieType('');
    setSelectedSrNo(null);
    setIsUpdateMode(false);
    setOldData(null);
  };

  const handleRowSelect = (die: DieData) => {
    setOldData(die);
    setDieNo(die.DieNo);
    setDieType(die.DieType);
    setDieSize(die.DieSize);
    setDieDesc(die.DieDesc); 
    setSelectedSrNo(die.SrNo);
    setIsUpdateMode(true);
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">    
        <CardHeader>
          <CardTitle>Die Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dieNo">Die Number *</Label>
                <Input 
                  ref={dieNoRef} 
                  id="dieNo" 
                  value={dieNo} 
                  onChange={(e) => setDieNo(e.target.value)} 
                  disabled={isUpdateMode} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dieDesc">Die Description *</Label>
                <Input 
                  ref={dieDescRef} 
                  id="dieDesc" 
                  value={dieDesc} 
                  onChange={(e) => setDieDesc(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dieType">Die Type *</Label>
                <Input 
                  ref={dieTypeRef} 
                  id="dieType" 
                  value={dieType} 
                  onChange={(e) => setDieType(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dieType">Die Size * </Label>
                <Input 
                  ref={dieSizeRef} 
                  id="dieType" 
                  value={dieSize} 
                  onChange={(e) => setDieSize(e.target.value)} 
                  required 
                />
              </div>

            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleSave} disabled={isUpdateMode} type="submit">Save</Button>
              <Button onClick={handleUpdate} disabled={!isUpdateMode}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
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
                  <TableHead>Action</TableHead>
                  <TableHead>Die Number</TableHead>
                  <TableHead>Die Description</TableHead>
                  <TableHead>Die Size</TableHead> 
                  <TableHead>Die Type</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
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
                    <TableRow key={row.SrNo}>
                      <TableCell>
                        <Button variant={'ghost'} onClick={() => handleRowSelect(row)}>Edit</Button>
                      </TableCell>
                      <TableCell>{row.DieNo}</TableCell>
                      <TableCell>{row.DieDesc}</TableCell>
                      <TableCell>{row.DieSize || ''}</TableCell>
                      <TableCell>{row.DieType}</TableCell>
                      <TableCell>{row.CreatedBy || ''}</TableCell>
                      <TableCell>{row.CreatedDate ? new Date(row.CreatedDate).toLocaleDateString('en-GB') : ''}</TableCell>
                      <TableCell>{row.UpdatedBy || ''}</TableCell>
                      <TableCell>{row.UpdatedDate ? new Date(row.UpdatedDate).toLocaleDateString('en-GB') : ''}</TableCell>
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

export default DieMaster;
