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
import { getUserID } from '@/utills/getFromSession';
import { logError } from '@/utills/loggingException';
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

interface LabelTypeData {
  SrNo: number;
  LtypeCode: string;
  LtypeDes: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}

const LabelTypeMasterForm: React.FC = () => {
  const [labelTypeCode, setLabelTypeCode] = useState('');
  const [labelTypeDesc, setLabelTypeDesc] = useState('');
  const [data, setData] = useState<LabelTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSrNo, setSelectedSrNo] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [oldData, setOldData] = useState<LabelTypeData | null>(null);
  const { toast } = useToast();
// for search and pagination
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const token  = Cookies.get('token');
 
  const labelTypeCodeRef = useRef<HTMLInputElement>(null);
  const labelTypeDescRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/master/get-all-labeltype`, {
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
      const searchableFields: (keyof LabelTypeData)[] = ['SrNo', 'LtypeCode', 'LtypeDes', 'CreatedBy', 'CreatedDate', 'UpdatedBy', 'UpdatedDate'];
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
    if (!labelTypeCode.trim()) {
      sooner(`Please fill Label Type Code`);
      labelTypeCodeRef.current?.focus();
      return;
    }
    if(!labelTypeDesc.trim()){
      sooner(`Please fill Label Type Description`);
      labelTypeDescRef.current?.focus();
      return;
    }
    const newData = {
      LtypeCode: labelTypeCode.trim(),
      LtypeDes: labelTypeDesc.trim(),
      CreatedBy: "admin", 
    };

    axios.post(`${BACKEND_URL}/api/master/insert-label-type`, newData, {
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
        // logError((responseData.Message).toLocaleString(),"", 'Label Type Master', getUserID());
      } else if (responseData.Status === "T") {
        toast({
          title: "Details inserted successfully",
          description: `Details added for ${labelTypeCode}`,
        });
        fetchData();
        handleCancel();
        // Insert audit trail for save action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Label Type Master",
        //   Action: `New Label Type Added by ${getUserID()}`,
        //   NewData: JSON.stringify(newData),
        //   OldData: "",
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: ""
        // });
      }
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.error || error.message;
    //   logError(errorMessage,error, 'Label Type Master', getUserID());
      toast({
        variant: 'destructive',
        title: "Error",
        description: errorMessage,
      });
    });
  };
  

  const handleRowSelect = (index: number) => {
    const selectedData = data[index];
    setOldData(selectedData);
    setLabelTypeCode(selectedData.LtypeCode);
    setLabelTypeDesc(selectedData.LtypeDes);
    setSelectedSrNo(selectedData.SrNo);
    setIsUpdateMode(true);
    // Insert audit trail for edit action
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Label Type Master",
    //   Action: `Label Type Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(selectedData),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: ""
    // });
  };

  const handleCancel = () => {
    setLabelTypeCode('');
    setLabelTypeDesc('');
    setSelectedSrNo(null);
    setIsUpdateMode(false);
    setOldData(null);
  };

  const handleUpdate = () => {
    if (!selectedSrNo || !oldData) return;
    if (!labelTypeCode.trim()) {
      sooner(`Please fill Label Type Code`);
      labelTypeCodeRef.current?.focus();
      return;
    }
    if(!labelTypeDesc.trim()){
      sooner(`Please fill Label Type Description`);
      labelTypeDescRef.current?.focus();
      return;
    }
    const updatedData = {
      LtypeCode: labelTypeCode.trim(),
      LtypeDes: labelTypeDesc.trim(),
      UpdatedBy: "admin"
    };

      axios.post(`${BACKEND_URL}/api/master/update-label-type`, updatedData, {
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
        //   logError((responseData.Message).toLocaleString(), "", 'Label Type Master', getUserID());
        } else if (responseData.Status === "T") {
          toast({
            title: "Details updated successfully",
            description: `Details updated for ${labelTypeCode}`,
          });
          fetchData();
          handleCancel();
          
          // Prepare audit data
          const changedFields: string[] = [];
          if (oldData.LtypeDes !== labelTypeDesc) {
            changedFields.push(`Label Type Description: ${oldData.LtypeDes} -> ${labelTypeDesc}`);
          }
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || error.message;
        // logError(errorMessage, error, 'Label Type Master', getUserID());
        toast({
          variant: 'destructive',
          title: "Failed to update details",
          description: errorMessage,
        });
      });
  };


  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Label Type Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labelTypeCode">Label Type Code *</Label>
                <Input ref={labelTypeCodeRef} id="labelTypeCode" value={labelTypeCode} onChange={(e) => setLabelTypeCode(e.target.value)} required disabled={isUpdateMode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labelTypeDesc">Label Type Description *</Label>
                <Input ref={labelTypeDescRef} id="labelTypeDesc" value={labelTypeDesc} onChange={(e) => setLabelTypeDesc(e.target.value)} required />
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
                  <TableHead>Action</TableHead> {/* Empty header for the Select column */}
                  <TableHead>Label Type Code</TableHead>
                  <TableHead>Description</TableHead>
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
                  paginatedData.map((row, index) => (
                    <TableRow key={row.SrNo}>
                      <TableCell>
                        <Button variant={'ghost'} onClick={() => handleRowSelect(index)}>Edit</Button>
                      </TableCell>
                      <TableCell>{row.LtypeCode}</TableCell>
                      <TableCell>{row.LtypeDes}</TableCell>
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

export default LabelTypeMasterForm;
